#!/usr/bin/env python3
"""Gera a narração de cada aula com a voz pt-BR-ThalitaMultilingualNeural (edge-tts).

Uso:
  uv run --with edge-tts --with html5lib python tools/narrar.py [aula-03.html ...]   (sem argumentos: todas)
  uv run --with edge-tts --with html5lib python tools/narrar.py --conferir           (narrações desatualizadas)

Saída:
  audio/aula-XX.mp3     áudio (fora do git; vai como anexo da release "narracao")
  audio/aula-XX.txt     texto narrado, para conferir
  narracao/aula-XX.js   instante em que a narração chega a cada parágrafo (usado por narracao/player.js)

Fica de fora da narração: traduções (.pt), blocos de código (viram um aviso), botões e navegação.
O parágrafo é identificado pelo caminho de índices a partir do <body> na árvore do html5lib, que
monta a página como o navegador (inclusive o <tbody> implícito), então o caminho vale nos dois lados.
"""
import asyncio
import bisect
import hashlib
import json
import re
import sys
from pathlib import Path

import edge_tts
import html5lib

VOZ = "pt-BR-ThalitaMultilingualNeural"
RAIZ = Path(__file__).resolve().parent.parent
AUDIO = RAIZ / "audio"
SYNC = RAIZ / "narracao"
EM_PARALELO = 4
TENTATIVAS = 3
LIMITE_PEDACO = 3000  # bytes; abaixo dos 4096 em que o edge-tts corta sozinho
TEMPO_MAXIMO = 360  # segundos por pedaço; o serviço às vezes pendura a conexão sem dar erro
BYTES_POR_SEGUNDO = 6000  # o MP3 do serviço tem 48 kbit/s constantes, então bytes dão a duração exata
AVISO_CODIGO = "Trecho de código: veja na página."

PULAR_TAGS = {"head", "script", "style", "button", "nav"}
PULAR_CLASSES = {"pt", "crumbs", "ts", "done", "concluir", "prevnext", "toggle-pt"}
PULAR_IDS = {"scorebar", "exam"}  # placar das questões e o simulado, montados pelo JavaScript da página
BLOCOS = {"h1", "h2", "h3", "h4", "p", "div", "li", "tr", "td", "th", "label", "table", "tbody", "ul", "ol"}
BLOCO_CLASSES = {"tag", "cenario", "multi-hint"}


def _classes(el):
    return set(el.get("class", "").split())


def _pular(el):
    return el.tag in PULAR_TAGS or bool(_classes(el) & PULAR_CLASSES) or el.get("id") in PULAR_IDS


def _bloco(el):
    return el.tag in BLOCOS or bool(_classes(el) & BLOCO_CLASSES)


def segmentos(body):
    """[(caminho, texto)]: o texto de cada bloco narrado e o caminho do elemento dono dele."""
    segs = []

    def abrir(caminho):
        if segs and not segs[-1][1]:
            segs.pop()
        segs.append((caminho, []))

    def falar(texto):
        if texto:
            segs[-1][1].append(texto.replace("\n", " "))  # quebra de linha do HTML não é fim de frase

    def visitar(el, caminho, dono):
        if _bloco(el):
            dono = caminho
            abrir(dono)
        if "cenario" in _classes(el):
            falar("Cenário: ")
        falar(el.text)
        indice = 0
        for filho in el:
            if isinstance(filho.tag, str):  # comentários não contam no caminho, como em element.children
                caminho_filho = caminho + [indice]
                indice += 1
                if filho.tag == "pre":
                    abrir(caminho_filho)
                    falar(AVISO_CODIGO)
                    abrir(dono)
                elif not _pular(filho):
                    visitar(filho, caminho_filho, dono)
                    if _bloco(filho):
                        abrir(dono)
            falar(filho.tail)

    abrir([])
    visitar(body, [], [])
    return [(caminho, "".join(partes)) for caminho, partes in segs]


def normalizar(texto):
    texto = re.sub(r"[\U0001F000-\U0001FFFF☀-➿️]", "", texto)  # emojis
    texto = texto.replace("·", "\n").replace("→", ";").replace("×", " versus ")
    texto = re.sub(r"\s*—\s*", ", ", texto)
    texto = re.sub(r"(\d)\s*–\s*(\d)", r"\1 a \2", texto)
    texto = re.sub(r"~\s*(\d)", r"cerca de \1", texto)
    linhas = []
    for linha in texto.split("\n"):
        linha = re.sub(r"\s+", " ", linha).strip(" ,;")
        if not linha:
            continue
        if not re.search(r"[.!?:;…]$", linha):
            linha += "."
        linhas.append(linha)
    return linhas


def extrair(html_path):
    """[(caminho, linha)] na ordem da narração."""
    doc = html5lib.parse(html_path.read_text(encoding="utf-8"), namespaceHTMLElements=False)
    return [(caminho, linha) for caminho, texto in segmentos(doc.find("body")) for linha in normalizar(texto)]


def assinatura(linhas):
    return hashlib.sha256(json.dumps(linhas, ensure_ascii=False).encode()).hexdigest()[:16]


def ler_sync(aula):
    arquivo = SYNC / f"{aula}.js"
    if not arquivo.exists():
        return None
    return json.loads(re.search(r"window\.NARRACAO = (\{.*\});", arquivo.read_text(encoding="utf-8")).group(1))


async def requisitar(linhas):
    """Narra um pedaço numa requisição: (bytes do MP3, segundos da primeira palavra de cada linha ou None)."""
    texto = "\n".join(linhas)
    inicios = [0]  # posição de cada linha no texto
    for linha in linhas[:-1]:
        inicios.append(inicios[-1] + len(linha) + 1)
    audio, tempos, cursor = bytearray(), [None] * len(linhas), 0
    async for pedaco in edge_tts.Communicate(texto, VOZ, boundary="WordBoundary").stream():
        if pedaco["type"] == "audio":
            audio += pedaco["data"]
        elif pedaco["type"] == "WordBoundary":
            # janela curta: uma palavra que o serviço devolva diferente não arrasta o cursor para longe
            pos = texto.find(pedaco["text"], cursor, cursor + 200)
            if pos >= 0:
                cursor = pos + len(pedaco["text"])
                i = bisect.bisect_right(inicios, pos) - 1
                if tempos[i] is None:
                    tempos[i] = pedaco["offset"] / 1e7
    return bytes(audio), tempos


async def requisitar_com_tentativas(linhas, aula):
    """Tenta de novo; se o serviço insistir em recusar (NoAudioReceived), divide o pedaço ao meio."""
    for tentativa in range(1, TENTATIVAS + 1):
        try:
            return await asyncio.wait_for(requisitar(linhas), TEMPO_MAXIMO)
        except Exception as erro:
            print(f"{aula}: tentativa {tentativa} falhou ({type(erro).__name__})", flush=True)
            if tentativa < TENTATIVAS:
                await asyncio.sleep(3 * tentativa)
    if len(linhas) == 1:
        raise RuntimeError(f"{aula}: o serviço não narra a linha {linhas[0][:80]!r}")
    meio = len(linhas) // 2
    return await sintetizar([linhas[:meio], linhas[meio:]], aula)


def pedacos(linhas):
    """Agrupa linhas consecutivas em pedaços de até LIMITE_PEDACO bytes (linha maior vai sozinha)."""
    grupo, tamanho = [], 0
    for linha in linhas:
        n = len(linha.encode()) + 1
        if grupo and tamanho + n > LIMITE_PEDACO:
            yield grupo
            grupo, tamanho = [], 0
        grupo.append(linha)
        tamanho += n
    if grupo:
        yield grupo


async def sintetizar(grupos, aula):
    """Narra os grupos de linhas em sequência num MP3 só e devolve o instante (s) em que cada linha começa."""
    audio, tempos = bytearray(), []
    for grupo in grupos:
        dados, t = await requisitar_com_tentativas(grupo, aula)
        base = len(audio) / BYTES_POR_SEGUNDO
        audio += dados
        tempos += [None if x is None else base + x for x in t]
    return bytes(audio), tempos


def marcacoes(caminhos, tempos):
    """[[segundos, caminho]]: onde cada parágrafo começa, sem repetir o mesmo parágrafo em seguida."""
    cues = []
    for caminho, t in zip(caminhos, tempos):
        if t is not None and (not cues or cues[-1][1] != caminho):
            cues.append([round(t, 2), caminho])
    return cues


async def narrar(html_path, limite):
    async with limite:
        aula = html_path.stem
        linhas = extrair(html_path)
        texto = [linha for _, linha in linhas]
        (AUDIO / f"{aula}.txt").write_text("\n".join(texto) + "\n", encoding="utf-8")
        audio, tempos = await sintetizar(pedacos(texto), aula)
        (AUDIO / f"{aula}.mp3").write_bytes(audio)

        cues = marcacoes([caminho for caminho, _ in linhas], tempos)
        sync = {"aula": aula, "assinatura": assinatura(linhas), "cues": cues}
        (SYNC / f"{aula}.js").write_text(
            "// Gerado por tools/narrar.py junto com o MP3 da release \"narracao\". Não editar à mão.\n"
            f"window.NARRACAO = {json.dumps(sync, ensure_ascii=False, separators=(',', ':'))};\n",
            encoding="utf-8",
        )
        minutos = len(audio) / BYTES_POR_SEGUNDO / 60
        print(f"ok {aula}: {minutos:.0f} min, {len(cues)} marcações", flush=True)


def conferir(aulas):
    desatualizadas = []
    for html_path in aulas:
        sync = ler_sync(html_path.stem)
        if not sync or sync["assinatura"] != assinatura(extrair(html_path)):
            desatualizadas.append(html_path.name)
    print("\n".join(desatualizadas) or "Todas as narrações estão em dia.")
    return 1 if desatualizadas else 0


async def main(aulas):
    AUDIO.mkdir(exist_ok=True)
    SYNC.mkdir(exist_ok=True)
    limite = asyncio.Semaphore(EM_PARALELO)
    resultados = await asyncio.gather(*(narrar(a, limite) for a in aulas), return_exceptions=True)
    falhas = [(a.name, r) for a, r in zip(aulas, resultados) if isinstance(r, BaseException)]
    for nome, erro in falhas:
        print(f"FALHOU {nome}: {type(erro).__name__}: {erro}")
    return 1 if falhas else 0


if __name__ == "__main__":
    argumentos = sys.argv[1:]
    modo_conferir = "--conferir" in argumentos
    aulas = [Path(a).resolve() for a in argumentos if a != "--conferir"] or sorted(RAIZ.glob("aula-*.html"))
    sys.exit(conferir(aulas) if modo_conferir else asyncio.run(main(aulas)))
