#!/usr/bin/env python3
"""Build revisao.html from the ordered English Q&A cards in revisao-content.json."""
import html
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

ESTILO = """\
  :root {
    --bg: #0f1115; --card: #171a21; --card2: #1d212b; --border: #2a2f3a;
    --text: #e6e8ee; --muted: #9aa3b2; --accent: #d97757; --accent2: #a78bfa;
    --ok: #34d399;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 28px 20px 72px; }
  header.top { border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 20px; }
  .crumbs { font-size: 13px; color: var(--muted); margin-bottom: 10px; }
  .crumbs a { color: var(--muted); }
  h1 { font-size: 28px; line-height: 1.2; margin: 0 0 8px; }
  .lead { color: var(--muted); font-size: 14px; margin: 0; }
  .meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
  .tag { display: inline-block; background: var(--card2); border: 1px solid var(--border);
    border-radius: 999px; padding: 3px 10px; font-size: 12px; color: var(--muted); }
  a { color: var(--accent); }
  a:focus-visible { outline: 2px solid var(--accent2); outline-offset: 3px; border-radius: 3px; }
  .review-index { display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
    gap: 8px; margin: 20px 0 28px; }
  .review-index a { display: block; min-height: 44px; padding: 11px 10px; background: var(--card);
    border: 1px solid var(--border); border-radius: 8px; color: var(--text);
    text-decoration: none; font-size: 12.5px; }
  .review-index a:hover { border-color: var(--accent); }
  .review-index .rank { color: var(--accent); font-weight: 700; margin-right: 5px; }
  section.lesson { margin: 32px 0 0; scroll-margin-top: 16px; }
  .lesson-head { border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 12px; }
  .priority { color: var(--accent); font-size: 11px; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; margin: 0 0 4px; }
  .lesson-head h2 { font-size: 20px; line-height: 1.3; margin: 0 0 5px; }
  .lesson-meta { color: var(--muted); font-size: 12.5px; margin: 0; }
  .lesson-nav { font-size: 12.5px; margin-top: 4px; }
  ol.cards { list-style: none; padding: 0; margin: 0; }
  .card { background: var(--card); border: 1px solid var(--border); border-left: 3px solid var(--accent);
    border-radius: 8px; padding: 12px 15px; margin: 8px 0; overflow-wrap: break-word; }
  .q, .a { display: grid; grid-template-columns: 20px minmax(0, 1fr); gap: 7px; }
  .q { font-size: 15px; font-weight: 650; }
  .a { margin-top: 6px; font-size: 14px; color: var(--text); }
  .label { font-size: 11px; font-weight: 800; line-height: 1.8; color: var(--accent); }
  .a .label { color: var(--ok); }
  footer { border-top: 1px solid var(--border); margin-top: 36px; padding-top: 18px;
    color: var(--muted); font-size: 13px; }
  @media (max-width: 560px) {
    .wrap { padding: 20px 14px 56px; }
    h1 { font-size: 24px; }
    .review-index { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .lesson-head h2 { font-size: 18px; }
    .card { padding: 11px 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; }
  }
"""


def esc(value):
    return html.escape(str(value), quote=False)


def attr(value):
    return html.escape(str(value), quote=True)


def card_html(card):
    return f"""    <li class="card">
      <div class="q"><span class="label" aria-hidden="true">Q</span><span>{esc(card['q'])}</span></div>
      <div class="a"><span class="label" aria-hidden="true">A</span><span>{esc(card['a'])}</span></div>
    </li>"""


def lesson_html(lesson, rank):
    number = lesson["number"]
    title = lesson["title"]
    cards = "\n".join(card_html(card) for card in lesson["cards"])
    return f"""  <section class="lesson" id="lesson-{attr(number)}" aria-labelledby="heading-{attr(number)}">
    <div class="lesson-head">
      <p class="priority">Priority {rank:02d}</p>
      <h2 id="heading-{attr(number)}">Lesson {esc(number)} · {esc(title)}</h2>
      <p class="lesson-meta">{esc(lesson['domain'])} · {len(lesson['cards'])} cards</p>
      <nav class="lesson-nav" aria-label="Lesson {attr(number)} navigation">
        <a href="aula-{attr(number)}.html" aria-label="Open full Lesson {attr(number)}">Full lesson</a>
      </nav>
    </div>
    <ol class="cards">
{cards}
    </ol>
  </section>"""


def construir():
    dados = json.loads((RAIZ / "tools" / "revisao-content.json").read_text(encoding="utf-8"))
    lessons = dados["lessons"]
    total = sum(len(lesson["cards"]) for lesson in lessons)
    index_links = "\n".join(
        f'    <a href="#lesson-{attr(lesson["number"])}" '
        f'aria-label="Priority {rank}: Lesson {attr(lesson["number"])}, {attr(lesson["title"])}">'
        f'<span class="rank">{rank:02d}</span>Lesson {esc(lesson["number"])}</a>'
        for rank, lesson in enumerate(lessons, 1)
    )
    sections = "\n\n".join(lesson_html(lesson, rank) for rank, lesson in enumerate(lessons, 1))
    pagina = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="CCAR-F final review: {total} concise English questions with visible answers, ordered by review priority.">
<title>{esc(dados['title'])} · {total} English Q&A Cards</title>
<style>
{ESTILO}</style>
</head>
<body>
<div class="wrap" id="top">

<header class="top">
  <div class="crumbs"><a href="index.html">CCAR-F · 14-Day Course</a> / Final Review</div>
  <h1>{esc(dados['title'])}</h1>
  <p class="lead">{esc(dados['subtitle'])}</p>
  <div class="meta">
    <span class="tag">{total} cards</span>
    <span class="tag">{len(lessons)} lessons</span>
    <span class="tag">English</span>
    <span class="tag">English narration</span>
  </div>
</header>

<nav class="review-index" aria-label="Review lessons">
{index_links}
</nav>

<main>
{sections}
</main>

<footer>
  <p>Read the question, confirm the answer, move on.</p>
  <nav aria-label="Review navigation"><a href="#top">Back to review index</a> · <a href="index.html">Course index</a></nav>
</footer>

</div>
<script src="narracao/revisao.js"></script>
<script src="narracao/player.js"></script>
</body>
</html>
"""
    destino = RAIZ / "revisao.html"
    destino.write_text(pagina, encoding="utf-8")
    print(f"ok: {destino.name} ({len(lessons)} lessons, {total} cards, English narration)")


if __name__ == "__main__":
    construir()
