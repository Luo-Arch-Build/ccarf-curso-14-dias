#!/usr/bin/env python3
"""Gera uma aula extra (produto atual, fora da prova) a partir de um JSON de conteúdo.

Entrada:  tools/extra-XX-content.json
Saída:    extra-XX.html  (linkada do index; progresso próprio em localStorage 'ccarf-extra-XX')

As extras cobrem o que a live "Claude Code: Advanced" e o anúncio de MCP de 24/11/2026 trouxeram
e o curso não tinha. Seguem a estrutura das aulas (conceito, pegadinha, glossário, questões), mas
em pt-BR, com questões de fixação que não entram no simulado nem no progresso das 14 aulas.

Schema do JSON:
  number, title, subtitle, checked, objetivo (HTML),
  sections[]: {id, heading, html}            (HTML livre: <p>, <ul>, <table class="gloss">, <pre>)
  pegadinha: {html}
  glossary[]: {term_en, meaning_pt}
  questions[]: {stem, options[] (HTML, na ordem A, B, ...), correct ("b" ou "a,c"), feedback (HTML), fonte}
  fontes[]: texto (HTML)

Uso:
  python3 tools/extra.py 01            # gera extra-01.html a partir do JSON
"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
LETRAS = "abcdefgh"
NUM_PT = {2: "DUAS", 3: "TRÊS"}

ESTILO = """  :root {
    --bg: #0f1115; --card: #171a21; --card2: #1d212b; --border: #2a2f3a;
    --text: #e6e8ee; --muted: #9aa3b2; --accent: #d97757; --accent2: #8b5cf6;
    --ok: #34d399; --err: #f87171; --pt: #8fa0b8;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.65; }
  .wrap { max-width: 860px; margin: 0 auto; padding: 32px 20px 80px; }
  header.top { border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 28px; }
  .crumbs { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
  .crumbs a { color: var(--muted); }
  h1 { font-size: 26px; margin: 0 0 6px; }
  .meta { font-size: 13px; color: var(--muted); }
  .tag { display: inline-block; background: var(--card2); border: 1px solid var(--border);
    border-radius: 999px; padding: 2px 10px; font-size: 12px; color: var(--muted); margin-right: 6px; }
  h2 { font-size: 20px; margin-top: 36px; border-left: 3px solid var(--accent); padding-left: 12px; }
  h3 { font-size: 16px; margin-top: 24px; }
  a { color: var(--accent); }
  code { background: var(--card2); border: 1px solid var(--border); border-radius: 4px;
    padding: 1px 6px; font-size: 13px; font-family: "SF Mono", Menlo, monospace; color: #f0b49e; }
  pre { background: var(--card2); border: 1px solid var(--border); border-radius: 8px;
    padding: 14px 16px; overflow-x: auto; font-size: 13px; }
  pre code { background: none; border: none; padding: 0; color: var(--text); }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; margin: 16px 0; }
  .objetivo { border-left: 3px solid var(--accent2); }
  .pegadinha { border-left: 3px solid var(--err); }
  .pegadinha h3 { margin-top: 0; color: var(--err); }
  table.gloss { width: 100%; border-collapse: collapse; font-size: 14px; margin: 12px 0; }
  table.gloss th, table.gloss td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }
  table.gloss th { background: var(--card2); font-size: 13px; color: var(--muted); }
  table.gloss td.en { font-weight: 600; white-space: nowrap; }
  .q { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
  .q .qnum { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
  .q .stem { font-weight: 600; margin: 6px 0 2px; }
  .q .opts { margin: 10px 0 4px; }
  .q label.opt { display: block; padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px;
    margin: 6px 0; cursor: pointer; transition: border-color .15s; }
  .q label.opt:hover { border-color: var(--accent); }
  .q label.opt input { margin-right: 8px; }
  .q label.opt.correct { border-color: var(--ok); background: rgba(52,211,153,.08); }
  .q label.opt.wrong { border-color: var(--err); background: rgba(248,113,113,.08); }
  .q .multi-hint { font-size: 12px; color: var(--accent2); font-weight: 600; }
  .q .feedback .ts { display: block; margin-top: 8px; font-size: 12px; color: var(--muted); }
  .q button.answer { background: var(--accent); color: #fff; border: none; border-radius: 8px;
    padding: 8px 18px; font-size: 14px; cursor: pointer; margin-top: 8px; }
  .q button.answer:disabled { opacity: .45; cursor: default; }
  .q .feedback { display: none; margin-top: 12px; padding: 12px 14px; border-radius: 8px; font-size: 14px; }
  .q .feedback.ok { display: block; background: rgba(52,211,153,.1); border: 1px solid var(--ok); }
  .q .feedback.ko { display: block; background: rgba(248,113,113,.1); border: 1px solid var(--err); }
  #scorebar { position: sticky; top: 12px; background: var(--card2); border: 1px solid var(--border);
    border-radius: 999px; padding: 6px 16px; font-size: 13px; color: var(--muted);
    display: inline-block; z-index: 5; }
  nav.prevnext { display: flex; justify-content: space-between; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 14px; }
  .concluir { margin-top: 32px; text-align: center; }
  .concluir button { background: var(--card2); color: var(--text); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 24px; font-size: 14px; cursor: pointer; }
  .concluir button:hover { border-color: var(--ok); }
  .concluir .done { color: var(--ok); font-size: 13px; margin-top: 8px; }
  .aviso { border-left: 3px solid var(--accent2); }
  .fontes { font-size: 13px; color: var(--muted); }
"""

SCRIPT = """<script>
(function () {
  var total = 0, score = 0;
  document.querySelectorAll('.q').forEach(function (q) {
    total++;
    document.getElementById('total').textContent = total;
    var btn = q.querySelector('button.answer');
    var correct = q.dataset.correct.split(',').map(function (s) { return s.trim(); });
    btn.addEventListener('click', function () {
      var checked = Array.prototype.slice.call(q.querySelectorAll('input:checked')).map(function (i) { return i.value; });
      if (checked.length === 0) return;
      var ok = checked.length === correct.length && checked.every(function (v) { return correct.indexOf(v) !== -1; });
      q.querySelectorAll('label.opt').forEach(function (l) {
        var v = l.querySelector('input').value;
        if (correct.indexOf(v) !== -1) l.classList.add('correct');
        else if (l.querySelector('input').checked) l.classList.add('wrong');
        l.querySelector('input').disabled = true;
      });
      var fb = q.querySelector('.feedback');
      fb.classList.add(ok ? 'ok' : 'ko');
      fb.innerHTML = (ok ? '✅ Correto. ' : '❌ Incorreto. ') + fb.innerHTML;
      btn.disabled = true;
      if (ok) score++;
      document.getElementById('score').textContent = score;
    });
  });
  var KEY = 'ccarf-extra-__NN__';
  var btn = document.getElementById('finish');
  if (localStorage.getItem(KEY)) {
    document.getElementById('donemsg').textContent = 'Extra já concluída — ' + localStorage.getItem(KEY);
  }
  btn.addEventListener('click', function () {
    var rec = new Date().toLocaleDateString('pt-BR') + ' · ' + score + '/' + total + ' acertos';
    localStorage.setItem(KEY, rec);
    document.getElementById('donemsg').textContent = 'Concluída: ' + rec;
  });
})();
</script>"""


def questao_html(i, q):
    corretas = [c.strip() for c in q["correct"].split(",")]
    multi = len(corretas) > 1
    tipo = "checkbox" if multi else "radio"
    rotulo = (f'múltipla resposta <span class="multi-hint">(marque {NUM_PT[len(corretas)]})</span>'
              if multi else "múltipla escolha")
    opcoes = "\n".join(
        f'    <label class="opt"><input type="{tipo}" name="q{i}" value="{LETRAS[j]}">{LETRAS[j].upper()}. {o}</label>'
        for j, o in enumerate(q["options"])
    )
    gabarito = " e ".join(c.upper() for c in corretas)
    fonte = f'<span class="ts">Fonte: {q["fonte"]}</span>' if q.get("fonte") else ""
    return f"""<div class="q" data-correct="{q['correct']}">
  <div class="qnum">Questão {i} · {rotulo}</div>
  <div class="stem">{q['stem']}</div>
  <div class="opts">
{opcoes}
  </div>
  <button class="answer">Responder</button>
  <div class="feedback"><strong>Gabarito: {gabarito}.</strong> {q['feedback']}{fonte}</div>
</div>"""


def glossario_html(glossario):
    linhas = "\n".join(
        f'  <tr><td class="en">{g["term_en"]}</td><td>{g["meaning_pt"]}</td></tr>' for g in glossario
    )
    return f"""<table class="gloss">
  <tr><th>Termo (EN)</th><th>Significado</th></tr>
{linhas}
</table>"""


def construir(numero):
    nn = f"{int(numero):02d}"
    d = json.loads((RAIZ / "tools" / f"extra-{nn}-content.json").read_text(encoding="utf-8"))
    n_sec = len(d["sections"])
    secoes = "\n\n".join(
        f'<h2 id="{s["id"]}">{k}. {s["heading"]}</h2>\n{s["html"]}' for k, s in enumerate(d["sections"], 1)
    )
    questoes = "\n\n".join(questao_html(i, q) for i, q in enumerate(d["questions"], 1))
    fontes = "\n".join(f"  <li>{f}</li>" for f in d["fontes"])

    ant, prox = f"{int(numero) - 1:02d}", f"{int(numero) + 1:02d}"
    prev_link = (f'<a href="extra-{ant}.html">← Extra {ant}</a>' if (RAIZ / f"extra-{ant}.html").exists()
                 else '<a href="index.html">← Índice</a>')
    next_link = (f'<a href="extra-{prox}.html">Extra {prox} →</a>' if (RAIZ / f"extra-{prox}.html").exists()
                 else '<a href="index.html">Índice →</a>')

    pagina = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Extra {nn} — {d['title']} · CCAR-F</title>
<style>
{ESTILO}</style>
</head>
<body>
<div class="wrap">

<header class="top">
  <div class="crumbs"><a href="index.html">CCAR-F · Curso 14 dias</a> / Extra {nn}</div>
  <h1>Extra {nn} — {d['title']}</h1>
  <div class="meta">
    <span class="tag">{d['subtitle']}</span>
    <span class="tag">Produto atual · fora da prova</span>
  </div>
</header>

<div class="card aviso">
  <strong>Na prova, vale o guia.</strong> Esta aula extra cobre o que a Anthropic mostrou na live
  <em>Claude Code: Advanced</em> e no anúncio de novidades do MCP, ambos de 24/11/2026, conferido na
  documentação em {d['checked']}. Nada daqui cai na CCAR-F como está; as questões são de fixação e não
  entram no simulado nem no progresso das 14 aulas.
</div>

<div class="card objetivo">
  <strong>🎯 Objetivo.</strong> {d['objetivo']}
</div>

{secoes}

<div class="card pegadinha">
  <h3>⚠️ Pegadinha</h3>
  {d['pegadinha']['html']}
</div>

<h2 id="glossario">{n_sec + 1}. Glossário</h2>
{glossario_html(d['glossary'])}

<h2 id="questoes">{n_sec + 2}. Questões de fixação</h2>
<div id="scorebar">Pontuação: <span id="score">0</span>/<span id="total">0</span></div>

{questoes}

<h2 id="fontes">{n_sec + 3}. Fontes</h2>
<ul class="fontes">
{fontes}
</ul>

<div class="concluir">
  <button id="finish">✅ Concluir extra {nn}</button>
  <div class="done" id="donemsg"></div>
</div>

<nav class="prevnext">
  <span>{prev_link}</span>
  <span>{next_link}</span>
</nav>

</div>

{SCRIPT.replace('__NN__', nn)}
<script src="narracao/extra-{nn}.js"></script>
<script src="narracao/player.js"></script>
</body>
</html>
"""
    destino = RAIZ / f"extra-{nn}.html"
    destino.write_text(pagina, encoding="utf-8")
    print(f"ok: {destino.name} ({n_sec} seções, {len(d['questions'])} questões, "
          f"{len(d['glossary'])} termos de glossário)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("uso: python3 tools/extra.py <numero-da-extra>   (ex.: 01)")
    construir(sys.argv[1])
