#!/usr/bin/env python3
"""Narração resiliente e retomável: um request por linha, com pausa entre eles.

Pensado para quando o endpoint do edge-tts está instável (corta corridas contínuas,
mas aceita requests espaçados). Reaproveita a extração e o formato de cues do narrar.py.
Salva cada linha em audio/.<stem>-parts/NNN.mp3 e pula o que já existe — se cair, retoma.

Uso:
  uv run --with edge-tts --with html5lib python tools/narrar_lento.py fichamento-12.html --en
  (--voz VOZ para forçar outra voz; PAUSA=segundos entre requests, padrão 4)
"""
import asyncio
import importlib.util
import json
import os
import sys
from pathlib import Path

import edge_tts

RAIZ = Path(__file__).resolve().parent.parent

# reusa o módulo narrar.py (extração, normalização, assinatura, cues, constantes)
_spec = importlib.util.spec_from_file_location("narrar", RAIZ / "tools" / "narrar.py")
narrar = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(narrar)

AUDIO = RAIZ / "audio"
SYNC = RAIZ / "narracao"
BPS = narrar.BYTES_POR_SEGUNDO
PAUSA = float(os.environ.get("PAUSA", 4))
TIMEOUT = int(os.environ.get("NARRAR_TIMEOUT", 60))
TENTATIVAS = int(os.environ.get("NARRAR_TENTATIVAS", 8))


async def uma_linha(texto, voz):
    """(bytes, offset_da_primeira_palavra_em_s | None) para uma única linha."""
    audio, primeiro = bytearray(), None
    async for p in edge_tts.Communicate(texto, voz, boundary="WordBoundary").stream():
        if p["type"] == "audio":
            audio += p["data"]
        elif p["type"] == "WordBoundary" and primeiro is None:
            primeiro = p["offset"] / 1e7
    if not audio:
        raise edge_tts.exceptions.NoAudioReceived("vazio")
    return bytes(audio), (0.0 if primeiro is None else primeiro)


async def com_tentativas(texto, voz, rotulo):
    for i in range(1, TENTATIVAS + 1):
        try:
            return await asyncio.wait_for(uma_linha(texto, voz), TIMEOUT)
        except Exception as e:
            print(f"  {rotulo} tentativa {i} falhou ({type(e).__name__})", flush=True)
            if i < TENTATIVAS:
                await asyncio.sleep(min(5 * i, 30))
    raise RuntimeError(f"{rotulo}: falhou após {TENTATIVAS} tentativas")


async def main(html_path, voz):
    stem = html_path.stem
    linhas = narrar.extrair(html_path)            # [(caminho, linha)]
    caminhos = [c for c, _ in linhas]
    textos = [t for _, t in linhas]
    (AUDIO / f"{stem}.txt").write_text("\n".join(textos) + "\n", encoding="utf-8")

    partes = AUDIO / f".{stem}-parts"
    partes.mkdir(parents=True, exist_ok=True)
    print(f"{stem}: {len(textos)} linhas, voz {voz}, pausa {PAUSA}s", flush=True)

    for i, texto in enumerate(textos):
        alvo = partes / f"{i:03d}.mp3"
        if alvo.exists() and alvo.stat().st_size > 0:
            continue
        dados, off = await com_tentativas(texto, voz, f"[{i+1}/{len(textos)}]")
        # grava bytes + offset da primeira palavra (s) juntos, para retomada
        alvo.write_bytes(dados)
        (partes / f"{i:03d}.off").write_text(str(off), encoding="utf-8")
        print(f"  ok [{i+1}/{len(textos)}] {len(dados)} bytes", flush=True)
        await asyncio.sleep(PAUSA)

    # concatena na ordem e recalcula os tempos absolutos (base = duração acumulada)
    audio, tempos = bytearray(), []
    for i in range(len(textos)):
        dados = (partes / f"{i:03d}.mp3").read_bytes()
        off = float((partes / f"{i:03d}.off").read_text())
        base = len(audio) / BPS
        tempos.append(base + off)
        audio += dados

    (AUDIO / f"{stem}.mp3").write_bytes(bytes(audio))
    cues = narrar.marcacoes(caminhos, tempos)
    sync = {"aula": stem, "assinatura": narrar.assinatura(linhas), "cues": cues}
    (SYNC / f"{stem}.js").write_text(
        "// Gerado por tools/narrar.py junto com o MP3 da release \"narracao\". Não editar à mão.\n"
        f"window.NARRACAO = {json.dumps(sync, ensure_ascii=False, separators=(',', ':'))};\n",
        encoding="utf-8",
    )
    minutos = len(audio) / BPS / 60
    print(f"ok {stem}: {minutos:.0f} min, {len(cues)} marcações", flush=True)


if __name__ == "__main__":
    args = sys.argv[1:]
    idioma_en = "--en" in args
    voz = None
    if "--voz" in args:
        j = args.index("--voz")
        voz = args[j + 1]
        args = args[:j] + args[j + 2:]
    arquivos = [a for a in args if not a.startswith("--")]
    if not arquivos:
        sys.exit("uso: python tools/narrar_lento.py <aula.html> [--en] [--voz VOZ]")
    if idioma_en:
        narrar.IDIOMA = "en"
        voz = voz or "en-US-AndrewNeural"
    voz = voz or narrar.VOZ
    asyncio.run(main(Path(arquivos[0]).resolve(), voz))
