#!/usr/bin/env python3
"""Gera a página de extensão (produto atual, 24/11/2026) de uma aula a partir de um JSON de conteúdo.

Entrada:  tools/extensao-XX-content.json
Saída:    extensao-XX.html  (página separada, linkada do index; a aula original não é editada)

A extensão é em pt-BR e traz o que o produto ganhou depois do guia da prova, ligado a uma aula
que já existe. Cada seção tem: o que a aula já disse (caixa "Na aula"), as afirmações novas,
a fonte (classe .ts, que tools/narrar.py não lê) e, se houver, o link para a aula extra.

Schema do JSON:
  lesson, title, aula_title, checked (data da conferência),
  sections[]: {id, heading, na_aula, assertions[], fonte, extras[]: {href, label}}
  glossary[]: {term_en, meaning_pt}

Uso:
  python3 tools/extensao.py 07            # gera extensao-07.html a partir do JSON
"""
import json
import sys
from pathlib import Path

from fichamento import ESTILO, esc

RAIZ = Path(__file__).resolve().parent.parent

ESTILO_EXT = ESTILO + """\
  section.ficha { border-left-color: var(--accent2); }
  .aviso { background: var(--card2); border: 1px solid var(--border); border-left: 3px solid var(--accent2);
    border-radius: 8px; padding: 12px 16px; font-size: 14px; margin: 16px 0 0; }
  .na-aula { background: var(--card2); border-radius: 8px; padding: 10px 14px; margin: 10px 0 0;
    font-size: 14px; color: var(--muted); }
  .na-aula strong { color: var(--text); }
  .ts { display: block; font-size: 12px; color: var(--muted); margin-top: 10px; }
  .extras { font-size: 14px; margin: 10px 0 0; }
  table.gloss td.ptm { color: var(--text); font-size: 14px; }
"""


def secao_html(sec):
    itens = "\n".join(f"    <li>{x}</li>" for x in sec["assertions"])
    extras = ""
    # Só linka a aula extra que já existe: as extras chegam aos poucos, e link quebrado não entra.
    existentes = [e for e in sec.get("extras", []) if (RAIZ / e["href"]).exists()]
    if existentes:
        links = " · ".join(f'<a href="{esc(e["href"])}">{esc(e["label"])}</a>' for e in existentes)
        extras = f'\n  <p class="extras">Aprofunde: {links}</p>'
    fonte = f'\n  <span class="ts">Fonte: {sec["fonte"]}</span>' if sec.get("fonte") else ""
    return f"""<section class="ficha" id="{esc(sec['id'])}">
  <h2>{sec['heading']}</h2>
  <div class="na-aula"><strong>Na aula:</strong> {sec['na_aula']}</div>
  <ul class="assert">
{itens}
  </ul>{extras}{fonte}
</section>"""


def glossario_html(glossario):
    linhas = "\n".join(
        f'    <tr><td class="en">{esc(g["term_en"])}</td><td class="ptm">{esc(g["meaning_pt"])}</td></tr>'
        for g in glossario
    )
    return f"""<section class="ficha" id="glossario">
  <h2>Glossário da extensão</h2>
  <table class="gloss">
    <tr><th>Termo (EN)</th><th>Significado</th></tr>
{linhas}
  </table>
</section>"""


def vizinhas(nn):
    todas = sorted(p.stem.split("-")[1] for p in RAIZ.glob("extensao-*.html"))
    if nn not in todas:
        todas = sorted(todas + [nn])
    i = todas.index(nn)
    ant = todas[i - 1] if i > 0 else None
    prox = todas[i + 1] if i + 1 < len(todas) else None
    return ant, prox


def construir(lesson):
    nn = f"{int(lesson):02d}"
    dados = json.loads((RAIZ / "tools" / f"extensao-{nn}-content.json").read_text(encoding="utf-8"))
    aula_href = f"aula-{nn}.html"

    secoes = "\n\n".join(secao_html(s) for s in dados["sections"])
    glossario = glossario_html(dados["glossary"]) if dados.get("glossary") else ""

    ant, prox = vizinhas(nn)
    prev_link = f'<a href="extensao-{ant}.html">← Extensão {ant}</a>' if ant else '<a href="index.html">← Índice</a>'
    next_link = f'<a href="extensao-{prox}.html">Extensão {prox} →</a>' if prox else '<a href="index.html">Índice →</a>'

    pagina = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Extensão {nn} — {esc(dados['title'])} · CCAR-F</title>
<style>
{ESTILO_EXT}</style>
</head>
<body>
<div class="wrap">

<header class="top">
  <div class="crumbs"><a href="index.html">CCAR-F · Curso 14 dias</a> / <a href="{aula_href}">Aula {nn}</a> / Extensão 24/11</div>
  <h1>Extensão {nn} — {esc(dados['title'])}</h1>
  <div class="meta">
    <span class="tag">Aula {nn} · {esc(dados['aula_title'])}</span>
    <span class="tag">Produto atual · fora da prova</span>
  </div>
  <p class="lead">O que o Claude Code ganhou depois do guia da prova, ligado ao que a aula {nn} já ensinou.
  Base: a live <em>Claude Code: Advanced</em> e o anúncio de novidades do MCP, ambos de 24/11/2026,
  conferidos na documentação em {esc(dados['checked'])}.</p>
  <div class="aviso"><strong>Na prova, vale o guia.</strong> Nada desta página cai na CCAR-F como está aqui.
  Se o guia e o produto divergirem numa questão, responda como o guia.</div>
</header>

{secoes}

{glossario}

<nav class="prevnext">
  <span>{prev_link}</span>
  <span><a href="{aula_href}">Aula {nn} — versão completa</a></span>
  <span>{next_link}</span>
</nav>

</div>

<script src="narracao/extensao-{nn}.js"></script>
<script src="narracao/player.js"></script>
</body>
</html>
"""
    destino = RAIZ / f"extensao-{nn}.html"
    destino.write_text(pagina, encoding="utf-8")
    print(f"ok: {destino.name} ({len(dados['sections'])} seções, "
          f"{sum(len(s['assertions']) for s in dados['sections'])} afirmações, "
          f"{len(dados.get('glossary', []))} termos de glossário)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("uso: python3 tools/extensao.py <numero-da-aula>   (ex.: 07)")
    construir(sys.argv[1])
