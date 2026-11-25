/* copy com Bebel · microinterações leves (JS puro). Sem bibliotecas. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = !reduce && 'IntersectionObserver' in window;
  if (motion) root.classList.add('js-motion');

  function all(sel) { return Array.prototype.slice.call(doc.querySelectorAll(sel)); }

  /* 1 e 2 · marca-texto e faíscas: entram quando a seção aparece */
  function revelar() {
    if (!motion) return;
    var alvos = all('.mark, .deco--hero, .deco--cases, .deco--chamada');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var t = e.target, atraso = t.classList.contains('mark') ? 150 : 0;
        setTimeout(function () { t.classList.add('is-in'); }, atraso);
      });
    }, { threshold: 0.35 });
    alvos.forEach(function (a) { io.observe(a); });
  }

  /* 5 · cascata curta, ~80 ms entre itens */
  function cascata() {
    if (!motion) return;
    var itens = all('.fatos li, .linha, .case, .ponto');
    itens.forEach(function (i) { i.classList.add('rv'); });
    var io = new IntersectionObserver(function (es) {
      var vis = es.filter(function (e) { return e.isIntersecting; }).sort(function (a, b) {
        var ra = a.boundingClientRect, rb = b.boundingClientRect;
        return ra.top - rb.top || ra.left - rb.left;
      });
      vis.forEach(function (e, k) {
        var el = e.target, d = Math.min(k, 6) * 80;
        io.unobserve(el);
        el.style.setProperty('--d', d + 'ms');
        el.classList.add('is-in');
        setTimeout(function () {
          el.classList.remove('rv', 'is-in');
          el.style.removeProperty('--d');
        }, d + 450);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    itens.forEach(function (i) { io.observe(i); });
  }

  /* 3 · selo: ~300 sobe de 0 a 300 */
  function contador() {
    var b = doc.querySelector('.hero__foto .selo b');
    if (!b || !motion) return;
    var txt = b.textContent, m = txt.match(/\d+/);
    if (!m) return;
    var alvo = parseInt(m[0], 10), pre = txt.slice(0, m.index), pos = txt.slice(m.index + m[0].length);
    var sr = doc.createElement('span'); sr.className = 'sr'; sr.textContent = txt;
    b.setAttribute('aria-hidden', 'true'); b.parentNode.insertBefore(sr, b);
    b.style.fontVariantNumeric = 'tabular-nums';
    var ini = null, dur = 900;
    b.textContent = pre + '0' + pos;
    function passo(t) {
      if (ini === null) ini = t;
      var p = Math.min((t - ini) / dur, 1), v = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
      b.textContent = pre + v + pos;
      if (p < 1) requestAnimationFrame(passo); else b.removeAttribute('aria-hidden'), sr.parentNode && sr.parentNode.removeChild(sr);
    }
    requestAnimationFrame(passo);
  }

  /* 6 · copiar e-mail */
  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
    return new Promise(function (ok, erro) {
      var ta = doc.createElement('textarea');
      ta.value = texto; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy') ? ok() : erro(); } catch (e) { erro(); }
      doc.body.removeChild(ta);
    });
  }
  function botaoCopiar() {
    all('.mail, .mail-grande').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('mailto:') !== 0) return;
      var email = href.slice(7).split('?')[0];
      var wrap = doc.createElement('span'); wrap.className = 'copiar-wrap';
      var btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'copiar';
      btn.textContent = 'Copiar'; btn.setAttribute('aria-label', 'Copiar e-mail ' + email);
      var tag = doc.createElement('span'); tag.className = 'copiar-tag';
      tag.setAttribute('role', 'status'); tag.setAttribute('aria-live', 'polite');
      wrap.appendChild(btn); wrap.appendChild(tag);
      a.parentNode.insertBefore(wrap, a.nextSibling);
      var timer;
      btn.addEventListener('click', function () {
        copiar(email).then(function () { tag.textContent = 'Copiado!'; }, function () { tag.textContent = 'Não consegui copiar'; });
        clearTimeout(timer); timer = setTimeout(function () { tag.textContent = ''; }, 1800);
      });
    });
  }

  function iniciar() { revelar(); cascata(); contador(); botaoCopiar(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
