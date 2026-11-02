#!/usr/bin/env python3
"""Gera a página de fichamento (estudo em inglês) de uma aula a partir de um JSON de conteúdo.

Entrada:  tools/fichamento-XX-content.json  (afirmações em inglês + tradução pt-BR por seção)
Saída:    fichamento-XX.html  (página separada no GitHub Pages, linkada do index)

O fichamento é 100% em inglês; cada seção tem um botão "ver tradução" que revela a tradução
pt-BR daquela seção (toggle por seção, não global). A tradução usa a classe .pt-block, que
tools/narrar.py ignora — então a narração em inglês não lê a tradução.

Uso:
  python3 tools/fichamento.py 12            # gera fichamento-12.html a partir do JSON
"""
import html
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

ESTILO = """\
  :root {
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
  .lead { color: var(--muted); font-size: 14px; margin: 8px 0 0; }
  a { color: var(--accent); }
  code { background: var(--card2); border: 1px solid var(--border); border-radius: 4px;
    padding: 1px 6px; font-size: 13px; font-family: "SF Mono", Menlo, monospace; color: #f0b49e; }
  section.ficha { background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    padding: 18px 20px 20px; margin: 18px 0; border-left: 3px solid var(--accent); }
  section.ficha > h2 { font-size: 18px; margin: 0 0 4px; border: none; padding: 0; }
  .ficha-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  ul.assert { margin: 10px 0 0; padding-left: 20px; }
  ul.assert li { margin: 8px 0; }
  .ver-traducao { flex: none; background: var(--card2); border: 1px solid var(--border);
    color: var(--muted); border-radius: 999px; padding: 5px 12px; font-size: 12px; cursor: pointer;
    white-space: nowrap; transition: border-color .15s, color .15s; }
  .ver-traducao:hover { color: var(--text); border-color: var(--accent); }
  .pt-block { border-left: 2px solid var(--border); padding-left: 12px; margin: 12px 0 0;
    display: none; }
  .pt-block.pt { color: var(--pt); font-size: 13.5px; }
  section.ficha.show-pt .pt-block { display: block; }
  ul.assert.pt-block li { margin: 7px 0; }
  table.gloss { width: 100%; border-collapse: collapse; font-size: 14px; margin: 12px 0 0; }
  table.gloss th, table.gloss td { border: 1px solid var(--border); padding: 8px 10px;
    text-align: left; vertical-align: top; }
  table.gloss th { background: var(--card2); font-size: 13px; color: var(--muted); }
  table.gloss td.en { font-weight: 600; white-space: nowrap; }
  table.gloss td.ptm { color: var(--pt); font-size: 13px; }
  section.ficha.gloss-sec table.gloss td.ptm { display: none; }
  section.ficha.gloss-sec.show-pt table.gloss td.ptm { display: table-cell; }
  nav.prevnext { display: flex; justify-content: space-between; margin-top: 48px; padding-top: 20px;
    border-top: 1px solid var(--border); font-size: 14px; gap: 12px; }
"""


def esc(s):
    return html.escape(str(s), quote=False)


def li_list(items, cls=""):
    lis = "\n".join(f"    <li>{esc(x)}</li>" for x in items)
    c = f' class="{cls}"' if cls else ""
    return f"  <ul{c}>\n{lis}\n  </ul>"


def secao_html(sec):
    en = li_list(sec["assertions_en"], "assert")
    pt = li_list(sec["assertions_pt"], "assert pt-block pt")
    return f"""<section class="ficha" id="{esc(sec['id'])}">
  <div class="ficha-head">
    <h2>{esc(sec['heading_en'])}</h2>
    <button type="button" class="ver-traducao" aria-expanded="false">🇧🇷 ver tradução</button>
  </div>
  <div class="pt-block pt" style="margin-top:2px"><strong>{esc(sec['heading_pt'])}</strong></div>
{en}
{pt}
</section>"""


def glossario_html(glossario):
    linhas = "\n".join(
        f'    <tr><td class="en">{esc(g["term_en"])}</td>'
        f'<td>{esc(g["meaning_en"])}</td>'
        f'<td class="ptm pt">{esc(g["meaning_pt"])}</td></tr>'
        for g in glossario
    )
    return f"""<section class="ficha gloss-sec" id="glossary">
  <div class="ficha-head">
    <h2>Glossary</h2>
    <button type="button" class="ver-traducao" aria-expanded="false">🇧🇷 ver tradução</button>
  </div>
  <table class="gloss">
    <tr><th>Term (EN)</th><th>Meaning (EN)</th><th class="ptm pt">Significado (PT-BR)</th></tr>
{linhas}
  </table>
</section>"""


SCRIPT_TOGGLE = """\
<script>
(function () {
  document.querySelectorAll('section.ficha .ver-traducao').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sec = btn.closest('section.ficha');
      var on = sec.classList.toggle('show-pt');
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      btn.textContent = on ? '🇧🇷 ocultar tradução' : '🇧🇷 ver tradução';
    });
  });
})();
</script>"""


def construir(lesson):
    nn = f"{int(lesson):02d}"
    dados = json.loads((RAIZ / "tools" / f"fichamento-{nn}-content.json").read_text(encoding="utf-8"))
    aula_href = f"aula-{nn}.html"

    secoes = "\n\n".join(secao_html(s) for s in dados["sections"])
    glossario = glossario_html(dados["glossary"]) if dados.get("glossary") else ""

    prev_nn = f"{int(lesson) - 1:02d}"
    next_nn = f"{int(lesson) + 1:02d}"
    prev_link = f'<a href="fichamento-{prev_nn}.html">← Fichamento {prev_nn}</a>' if (RAIZ / f"fichamento-{prev_nn}.html").exists() else '<a href="index.html">← Índice</a>'
    next_link = f'<a href="fichamento-{next_nn}.html">Fichamento {next_nn} →</a>' if (RAIZ / f"fichamento-{next_nn}.html").exists() else f'<a href="{aula_href}">Aula {nn} (completa) →</a>'

    pagina = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Study Notes {nn} — {esc(dados['title_en'])} · CCAR-F</title>
<style>
{ESTILO}</style>
</head>
<body>
<div class="wrap">

<header class="top">
  <div class="crumbs"><a href="index.html">CCAR-F · Curso 14 dias</a> / <a href="{aula_href}">Aula {nn}</a> / Study Notes (EN)</div>
  <h1>Study Notes {nn} — {esc(dados['title_en'])}</h1>
  <div class="meta">
    <span class="tag">{esc(dados['domain_en'])}</span>
    <span class="tag">English · narrated</span>
  </div>
  <p class="lead">Factual assertions in English for review. Each section has a translation button that
  reveals the pt-BR version. The audio narration is English only.</p>
</header>

{secoes}

{glossario}

<nav class="prevnext">
  <span>{prev_link}</span>
  <span><a href="{aula_href}">Aula {nn} — versão completa (PT)</a></span>
  <span>{next_link}</span>
</nav>

</div>

{SCRIPT_TOGGLE}
<script src="narracao/fichamento-{nn}.js"></script>
<script src="narracao/player.js"></script>
</body>
</html>
"""
    destino = RAIZ / f"fichamento-{nn}.html"
    destino.write_text(pagina, encoding="utf-8")
    print(f"ok: {destino.name} ({len(dados['sections'])} seções, "
          f"{sum(len(s['assertions_en']) for s in dados['sections'])} afirmações, "
          f"{len(dados.get('glossary', []))} termos de glossário)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("uso: python3 tools/fichamento.py <numero-da-aula>   (ex.: 12)")
    construir(sys.argv[1])
