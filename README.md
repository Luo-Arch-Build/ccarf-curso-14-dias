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
