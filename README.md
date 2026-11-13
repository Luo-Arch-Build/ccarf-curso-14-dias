# CCAR-F · Curso 14 dias

Curso de estudo para a prova **Claude Certified Architect – Foundations (CCAR-F)**, da Anthropic.

**Abrir no navegador:** https://luo-arch-build.github.io/ccarf-curso-14-dias/

## O que tem

- **14 aulas**, uma por dia (~60 min): conceito em português, glossário inglês → português, a
  "pegadinha do dia" e questões no formato da prova, em inglês, com tradução que dá para ocultar.
- **135 questões** nas aulas 1 a 13, com correção na hora e gabarito comentado. Cada questão mostra o
  cenário oficial da prova e, depois de respondida, o objetivo do guia (Task Statement) que ela cobra.
- **Simulado em modo prova** (aula 14): banco de 60 questões inéditas, 10 por cenário. Cada tentativa
  sorteia 4 dos 6 cenários e 5 questões de cada um (20 questões, 40 min), dando preferência às que você
  ainda não viu, com cronômetro, riscar alternativa, marcar para revisar e % de acerto por domínio no
  fim. Também há o modo banco completo (60 questões, 120 min).
- Cards **"Prova × produto atual"** onde o produto mudou desde o guia. Na prova, vale o guia e os
  objetivos oficiais.
- **Aula narrada**: cada aula tem um player no rodapé que lê o conteúdo (voz neural pt-BR, que pronuncia
  o inglês das questões como inglês) e rola a página junto, destacando o parágrafo que está sendo lido.
  Rolar com a mão solta o acompanhamento; com o áudio tocando, clicar num parágrafo leva a narração até ele.
- O progresso fica salvo no navegador, inclusive onde você parou na narração de cada aula.
- **Fichamento (study notes)**: página separada, em inglês, com as afirmações factuais da aula (sem
  explicação), tradução por seção que dá para mostrar, e narração só em inglês. Veja a seção
  [Fichamento](#fichamento-study-notes-em-inglês). Por enquanto, aulas 06, 07 e 12.

## Como usar

- **Online:** o link acima.
- **Offline:** baixe o repositório e abra `index.html` no navegador. Não precisa de servidor.

Uma aula por dia; das aulas 11 em diante, as traduções já abrem ocultas.

## Narração

Os MP3s ficam na release [`narracao`](https://github.com/Luo-Arch-Build/ccarf-curso-14-dias/releases/tag/narracao),
fora do git. Para tocar offline, baixe-os para uma pasta `audio/` ao lado do `index.html`. As marcações de tempo
(`narracao/aula-XX.js`) ficam no repositório.

Ao editar o texto de uma aula, a narração dela fica desatualizada. Para conferir e gerar de novo:

```bash
uv run --with edge-tts --with html5lib python tools/narrar.py --conferir      # lista as desatualizadas
uv run --with edge-tts --with html5lib python tools/narrar.py aula-03.html    # gera audio/ e narracao/
gh release upload narracao audio/aula-03.mp3 --clobber                        # publica o MP3 novo
```

A voz vem do serviço do Microsoft Edge via [`edge-tts`](https://github.com/rany2/edge-tts), que é gratuito,
mas não oficial: pode mudar ou parar sem aviso.

## Fichamento (study notes em inglês)

Além da aula, algumas aulas têm uma página de **fichamento** separada (`fichamento-NN.html`): afirmações
factuais 100% em inglês (não explicação — para quem já estudou a aula), com botão **"ver tradução"** por
seção que mostra o pt-BR (escondido por padrão), e narração 100% em inglês. O link aparece no `index.html`
na aula correspondente. Até agora existem os fichamentos das **aulas 06, 07 e 12**.

A página é gerada por um builder a partir de um JSON de conteúdo, para ser reproduzível:

```bash
# 1. Conteúdo: um JSON fiel à aula (seções, afirmações paralelas EN/pt, glossário).
#    tools/fichamento-NN-content.json  (autoria assistida; fiel a aula-NN.html)
# 2. Gerar a página:
python3 tools/fichamento.py NN                                                # -> fichamento-NN.html
# 3. Narração 100% EN (resumível, uma requisição por linha — evita o throttle do edge-tts):
PAUSA=4 NARRAR_TIMEOUT=60 NARRAR_TENTATIVAS=8 \
  uv run --with edge-tts --with html5lib python tools/narrar_lento.py fichamento-NN.html --en
# 4. Publicar o MP3 na release:
gh release upload narracao audio/fichamento-NN.mp3 --clobber
# 5. Registrar o link: adicionar 'NN': 1 ao mapa `fichamentos` no index.html
```

Notas de operação:

- Voz EN padrão: `en-US-AndrewNeural`. O `en-US-AndrewMultilingualNeural` pedido originalmente retornava
  `NoAudioReceived` no edge-tts na época; se voltar a funcionar, use `--voz en-US-AndrewMultilingualNeural`.
- A narração pula o que tem classe `pt`/`pt-block` (as traduções), então o áudio sai só em inglês.
  As células pt do glossário precisam da classe `pt` (só `ptm` não é pulado).
- `narrar_lento.py` é resumível: salva partes em `audio/.fichamento-NN-parts/` e retoma de onde parou.
  Limpe essa pasta e o `audio/fichamento-NN.txt` antes do commit. O MP3 fica fora do git (só na release);
  versiona-se a página, o `narracao/fichamento-NN.js` (marcações) e o JSON de conteúdo.
- O edge-tts às vezes esgota as tentativas numa linha comum (puro throttling, não defeito de conteúdo) e
  o gerador aborta. Nesse caso, dê uma pausa de alguns segundos e **rode o mesmo comando de novo**: ele pula
  as partes já salvas e retoma daquela linha. Pode ajudar subir `NARRAR_TENTATIVAS` e `PAUSA` na retomada.
- `&` cru trava o edge-tts (SSML); o `normalizar` já troca por "and"/"e".

## Fonte e limites

- Baseado no **Exam Guide v1.0** (julho de 2026): os 30 objetivos, os 6 cenários e as 12 questões
  comentadas, estas adaptadas ao longo das aulas.
- Conferido também contra os **37 objetivos oficiais do score report**, cuja redação vai além do guia
  (permission modes e limites de turnos e de custo no CI, dividir a tarefa em vez de aumentar
  `max_tokens`, prefill, janela deslizante, passes de review por tipo de problema, entre outros).
- **Material independente**: não é oficial nem endossado pela Anthropic, e não contém questões da prova.
- Os fatos de produto foram conferidos na documentação em 29/10/2026. O produto muda: confira perto da
  data da prova.
- A prova é aplicada em inglês ou japonês; as questões daqui estão em inglês.

## Qualidade

- Gabaritos e conteúdo revisados item a item contra o guia (outubro de 2026).
- Alternativas com tamanho equilibrado: a resposta certa não é, de forma sistemática, a mais longa.

Achou um erro? Abra uma issue.
