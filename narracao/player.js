// Player da narração: toca o MP3 da aula e acompanha o texto, destacando e rolando até o parágrafo narrado.
// As marcações (segundos → caminho do elemento a partir do <body>) vêm de narracao/aula-XX.js,
// gerado por tools/narrar.py junto com o MP3. Os MP3s ficam na release "narracao" do repositório.
(function () {
  var N = window.NARRACAO;
  if (!N) return;

  var RELEASE = 'https://github.com/Luo-Arch-Build/ccarf-curso-14-dias/releases/download/narracao/';
  var local = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var SRC = (local ? 'audio/' : RELEASE) + N.aula + '.mp3';
  var KEY_POS = 'ccarf-narracao-' + N.aula, KEY_VEL = 'ccarf-narracao-velocidade';

  var css = document.createElement('style');
  css.textContent =
    'body { padding-bottom: 72px; }' +
    '.narracao { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; display: flex; flex-wrap: wrap;' +
    '  gap: 8px 10px; align-items: center; justify-content: center; padding: 8px 12px;' +
    '  background: var(--card); border-top: 1px solid var(--border); color-scheme: dark; }' +
    '.narracao audio { flex: 1 1 280px; max-width: 560px; height: 40px; }' +
    '.narracao select, .narracao button { background: var(--card2); color: var(--text); border: 1px solid var(--border);' +
    '  border-radius: 999px; padding: 6px 12px; font-size: 13px; cursor: pointer; }' +
    '.narracao button { border-color: var(--accent2); }' +
    '.narrando { outline: 2px solid var(--accent2); outline-offset: 4px; border-radius: 4px; }';
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'narracao';
  bar.innerHTML =
    '<audio controls preload="none"></audio>' +
    '<select title="Velocidade da narração">' +
    ['1', '1.25', '1.5', '1.75', '2'].map(function (v) { return '<option value="' + v + '">' + v + '×</option>'; }).join('') +
    '</select>' +
    '<button type="button" hidden>↧ voltar ao áudio</button>';
  document.body.appendChild(bar); // por último: não desloca os caminhos das marcações
  var audio = bar.querySelector('audio'), vel = bar.querySelector('select'), voltar = bar.querySelector('button');
  audio.src = SRC;

  // Velocidade: defaultPlaybackRate sobrevive a audio.load(); playbackRate vale para o que já está tocando.
  vel.value = localStorage.getItem(KEY_VEL) || '1';
  function aplicarVelocidade() { audio.defaultPlaybackRate = audio.playbackRate = parseFloat(vel.value); }
  aplicarVelocidade();
  vel.addEventListener('change', function () { localStorage.setItem(KEY_VEL, vel.value); aplicarVelocidade(); });

  // Retoma de onde parou e, se o link da release expirar no meio da aula, recarrega e volta ao mesmo ponto.
  var pular = parseFloat(localStorage.getItem(KEY_POS)) || 0, ultimo = 0, salvo = 0, falhas = 0;
  audio.addEventListener('loadedmetadata', function () {
    if (pular) { audio.currentTime = pular; pular = 0; }
    aplicarVelocidade();
  });
  audio.addEventListener('playing', function () { falhas = 0; });
  audio.addEventListener('error', function () {
    if (!ultimo || falhas++ >= 3) return;
    pular = ultimo;
    audio.load();
    audio.play().catch(function () {});
  });
  audio.addEventListener('ended', function () { localStorage.removeItem(KEY_POS); });

  // Acompanhamento do texto.
  var cues = N.cues, atual = -1, marcado = null, seguir = true;

  function resolver(caminho) {
    var el = document.body;
    for (var i = 0; i < caminho.length && el; i++) el = el.children[caminho[i]];
    // Oculto (ex.: gabarito antes de responder): destaca o ancestral visível mais próximo.
    while (el && el !== document.body && !el.getClientRects().length) el = el.parentElement;
    return el === document.body ? null : el;
  }

  function indice(t) { // última marcação com tempo <= t
    var lo = 0, hi = cues.length - 1, r = -1;
    while (lo <= hi) {
      var m = (lo + hi) >> 1;
      if (cues[m][0] <= t) { r = m; lo = m + 1; } else hi = m - 1;
    }
    return r;
  }

  function rolar() { if (marcado) marcado.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

  function acompanhar() {
    var t = audio.currentTime;
    if (t) {
      ultimo = t;
      if (Math.abs(t - salvo) >= 5) { salvo = t; localStorage.setItem(KEY_POS, String(Math.floor(t))); }
    }
    var i = indice(t);
    if (i === atual) return;
    atual = i;
    var el = i < 0 ? null : resolver(cues[i][1]); // resolvido na hora: o gabarito recria os próprios filhos
    if (el === marcado) return;
    if (marcado) marcado.classList.remove('narrando');
    marcado = el;
    if (!el) return;
    el.classList.add('narrando');
    if (seguir) rolar();
  }
  audio.addEventListener('timeupdate', acompanhar);
  audio.addEventListener('seeked', acompanhar);

  // Rolar com a mão solta o acompanhamento até tocar em "voltar ao áudio".
  function soltar() {
    if (audio.paused || !seguir) return;
    seguir = false;
    voltar.hidden = false;
  }
  window.addEventListener('wheel', soltar, { passive: true });
  window.addEventListener('touchmove', soltar, { passive: true });
  window.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('.narracao, input, select, textarea')) return;
    if (/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| )$/.test(e.key)) soltar();
  });
  voltar.addEventListener('click', function () {
    seguir = true;
    voltar.hidden = true;
    rolar();
  });

  // Com a narração tocando, clicar num parágrafo leva o áudio até ele.
  var primeiraPorCaminho = {};
  cues.forEach(function (c, i) {
    var k = c[1].join('.');
    if (!(k in primeiraPorCaminho)) primeiraPorCaminho[k] = i;
  });
  function caminhoDe(el) {
    var p = [];
    for (; el && el !== document.body; el = el.parentElement) p.unshift(Array.prototype.indexOf.call(el.parentElement.children, el));
    return p.join('.');
  }
  document.addEventListener('click', function (e) {
    if (audio.paused || String(window.getSelection())) return;
    if (e.target.closest('a, button, label, input, select, .narracao')) return;
    for (var el = e.target; el && el !== document.body; el = el.parentElement) {
      var i = primeiraPorCaminho[caminhoDe(el)];
      if (i !== undefined) {
        audio.currentTime = cues[i][0];
        seguir = true;
        voltar.hidden = true;
        return;
      }
    }
  });
})();
