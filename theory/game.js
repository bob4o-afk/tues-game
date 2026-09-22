/* Подземието на DOM-а — двигател.
   Нула зависимости. Класически скрипт, за да работи и през file:// без сървър.

   Нищо тук не е текст и нищо не е икона:
     текстът на интерфейса  →  i18n.js        (t('ключ', {n: 3}))
     иконите                →  icons.js       (ICONS.door)
     съдържанието на урока  →  content.<език>.js

   Кои полета от съдържанието се рендерират като HTML и кои се екранират:
     q, options            → HTML (може <b> и &lt;tag&gt;)
     всичко останало       → чист текст (пиши <div> направо, екранира се само) */

(function () {
  'use strict';

  var I18N = window.I18N;
  var LANGS = window.LANGS;
  var ICONS = window.ICONS;
  var STORE = 'dom-dungeon-v1';
  var DEFAULT_LANG = 'bg';

  var stage = document.getElementById('stage');
  var live = document.getElementById('live');
  var topbar = document.getElementById('topbar');
  var brand = document.getElementById('brand');
  var langbar = document.getElementById('langs');
  var keyring = document.getElementById('keyring');
  var modebtn = document.getElementById('modebtn');
  var footbar = document.getElementById('footbar');
  var progress = document.getElementById('progress');
  var skiplink = document.getElementById('skiplink');

  /* ───────────────────────── език ───────────────────────── */

  function knownLang(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return code;
    return null;
  }

  /** Ред на предпочитание: ?lang= → запазеното → езикът на браузъра → български. */
  function pickLang(saved) {
    var q = null;
    try {
      q = knownLang(new URLSearchParams(location.search).get('lang'));
    } catch (e) { /* стар браузър — просто пропускаме */ }
    if (q) return q;
    if (saved && knownLang(saved)) return saved;
    var nav = (navigator.languages || [navigator.language || '']).map(function (l) {
      return String(l).slice(0, 2).toLowerCase();
    });
    for (var i = 0; i < nav.length; i++) if (knownLang(nav[i])) return nav[i];
    return DEFAULT_LANG;
  }

  function t(key, p) {
    var dict = I18N[S.lang] || I18N[DEFAULT_LANG];
    var s = dict[key];
    if (s === undefined) s = I18N[DEFAULT_LANG][key];
    if (s === undefined) return key;
    if (p) for (var k in p) s = s.split('{' + k + '}').join(p[k]);
    return s;
  }

  /** Съдържанието на текущия език; ако липсва — българското. */
  function G() {
    return (window.CONTENT && window.CONTENT[S.lang]) || window.CONTENT[DEFAULT_LANG];
  }

  function langName(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i].name;
    return code;
  }

  /* ───────────────────────── състояние ───────────────────────── */

  var S = null;
  function fresh() {
    return {
      lang: DEFAULT_LANG,
      mode: 'solo',
      route: 'full',
      screen: 'title',
      wing: null,
      step: 0,
      keys: {},
      answered: {},   // id на врата → 'first' | 'hint' | 'wrong'
      secrets: {},    // id на крило → намерена скрита стая
      pendingSecret: null,
      boss: { stage: 0, phase: 'intro', tries: 0, log: [] },
      ui: {}
    };
  }

  function save() {
    if (S.mode !== 'solo') return;
    try {
      var copy = JSON.parse(JSON.stringify(S));
      copy.ui = {};
      localStorage.setItem(STORE, JSON.stringify(copy));
    } catch (e) { /* частен прозорец, блокирани бисквитки — играта върви и без запис */ }
  }
  function loadSave() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.boss) return null;
      d.ui = {};
      return d;
    } catch (e) { return null; }
  }
  function wipe() {
    try { localStorage.removeItem(STORE); } catch (e) {}
  }

  /* ───────────────────────── помощни ───────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function ico(name) { return '<span aria-hidden="true">' + name + '</span>'; }
  function announce(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 60); }

  function wingById(id) {
    var w = G().wings;
    for (var i = 0; i < w.length; i++) if (w[i].id === id) return w[i];
    return null;
  }
  function shuffle(a) {
    var r = a.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t2 = r[i]; r[i] = r[j]; r[j] = t2;
    }
    return r;
  }
  function steps(w) {
    return w.steps.filter(function (s) {
      return s.t === 'room' || S.route === 'full' || s.core;
    });
  }
  function doorsOf(w) { return steps(w).filter(function (s) { return s.t === 'door'; }); }
  function allDoors() {
    var n = 0;
    G().wings.forEach(function (w) { n += doorsOf(w).length; });
    return n;
  }
  function answeredCount() { return Object.keys(S.answered).length; }
  function keyCount() {
    return G().wings.filter(function (w) { return S.keys[w.id]; }).length;
  }
  function doorsLeft(w) {
    return steps(w).filter(function (st) { return st.t === 'door' && !S.answered[st.id]; });
  }
  function wingDone(w) { return doorsLeft(w).length === 0; }
  function firstOpenIndex(w) {
    var list = steps(w);
    for (var i = 0; i < list.length; i++) {
      if (list[i].t === 'door' && !S.answered[list[i].id]) return i;
    }
    return 0;
  }

  /* ───────────────────────── рамка ───────────────────────── */

  function paintChrome() {
    document.documentElement.dataset.mode = S.mode;
    document.documentElement.lang = S.lang;
    document.title = t('html.title');

    if (skiplink) skiplink.textContent = t('skip.link');

    brand.innerHTML = esc(t('brand.title')) + '<small>' + esc(t('brand.sub')) + '</small>';

    var lh = '';
    LANGS.forEach(function (l) {
      var on = l.code === S.lang;
      lh += '<button class="langbtn" type="button" data-lang="' + l.code + '" lang="' + l.code + '" ' +
        'aria-pressed="' + on + '" aria-label="' + esc(t('lang.switchTo', { name: l.name })) + '">' +
        esc(l.label) + '</button>';
    });
    langbar.innerHTML = lh;
    langbar.setAttribute('aria-label', t('lang.label'));

    var kh = '';
    G().wings.forEach(function (w) {
      var has = S.keys[w.id];
      kh += '<span class="keyslot' + (has ? ' has' : '') + '" title="' + esc(w.artifact) + '" aria-hidden="true">' +
        (has ? ICONS.key : '·') + '</span>';
    });
    keyring.innerHTML = kh + '<span class="sr-only">' + esc(t('keys.count', { n: keyCount() })) + '</span>';
    keyring.setAttribute('aria-label', t('keys.ring'));

    var modeName = t(S.mode === 'projector' ? 'mode.projector' : 'mode.solo');
    modebtn.innerHTML = ico(S.mode === 'projector' ? ICONS.projector : ICONS.solo) + ' ' + esc(modeName);
    modebtn.setAttribute('aria-label', t('mode.switch', { mode: modeName }));

    progress.style.width = (allDoors() ? Math.round(answeredCount() / allDoors() * 100) : 0) + '%';

    footbar.innerHTML =
      '<span><kbd>Tab</kbd> ' + esc(t('foot.nav')) + '</span>' +
      '<span><kbd>1</kbd>–<kbd>4</kbd> ' + esc(t('foot.answer')) + '</span>' +
      '<span><kbd>' + ICONS.next + '</kbd> ' + esc(t('foot.forward')) + '</span>' +
      '<span><kbd>' + ICONS.back + '</kbd> ' + esc(t('foot.back')) + '</span>' +
      '<span><kbd>H</kbd> ' + esc(t('foot.hint')) + '</span>' +
      '<span><kbd>Esc</kbd> ' + esc(t('foot.hall')) + '</span>' +
      '<span><kbd>P</kbd> ' + esc(t('foot.mode')) + '</span>' +
      '<span><kbd>R</kbd> ' + esc(t('foot.restart')) + '</span>';
  }

  /* Кой екран гледаме. Всяко кликване вътре в един и същи екран (избор на отговор,
     подреждане, подсказка) не е навигация и не бива да изиграва входящата анимация
     наново — иначе всяко действие изглежда като презареждане. */
  function viewKey() {
    return [S.screen, S.wing, S.step, S.lang, S.mode, S.route,
            S.boss.phase, S.boss.stage].join('|');
  }
  var lastView = null;

  function paint(html, focusSel) {
    var key = viewKey();
    var moved = key !== lastView;
    lastView = key;

    // ако оставаме на същия екран, фокусът трябва да се върне там, където беше
    var prevId = document.activeElement && document.activeElement.id;

    stage.innerHTML = html;
    if (moved) {
      var panel = stage.querySelector('.panel');
      if (panel) panel.classList.add('reveal');
    }
    paintChrome();

    var f = null;
    if (S.ui.focusId) f = document.getElementById(S.ui.focusId);
    if (!f && focusSel) f = stage.querySelector(focusSel);
    if (!f && moved) f = stage.querySelector('h2');
    if (!f && !moved && prevId) f = document.getElementById(prevId);
    if (f) f.focus();
    S.ui.focusId = null;
  }

  function btn(act, label, cls, primary) {
    return '<button class="btn ' + (cls || '') + '" data-act="' + act + '"' +
      (primary ? ' data-primary="1"' : '') + '>' + label + '</button>';
  }

  /* ───────────────────────── екрани ───────────────────────── */

  function render() {
    if (S.screen === 'title') return renderTitle();
    if (S.screen === 'hub') return renderHub();
    if (S.screen === 'wing') return renderWing();
    if (S.screen === 'secret') return renderSecret();
    if (S.screen === 'boss') return renderBoss();
    if (S.screen === 'end') return renderEnd();
  }

  /* двата маршрута са еднакви на вид: заглавие + пояснение под него,
     за да не зависи ширината на бутона от дължината на текста */
  function route(id, cls, n, primary) {
    var cap = id === 'short' ? 'title.routeShort' : 'title.routeFull';
    var note = id === 'short' ? 'title.routeShortNote' : 'title.routeFullNote';
    var aria = id === 'short' ? 'title.routeShortAria' : 'title.routeFullAria';
    return '<button class="btn route ' + cls + '" data-act="start" data-route="' + id + '"' +
      (primary ? ' data-primary="1"' : '') +
      ' aria-label="' + esc(t(aria, { n: n })) + '">' +
      '<span class="rt">' + esc(t(cap, { n: n })) + '</span>' +
      '<span class="rn">' + esc(t(note)) + '</span></button>';
  }

  function renderTitle() {
    var core = 0, total = 0;
    G().wings.forEach(function (w) {
      w.steps.forEach(function (s) {
        if (s.t === 'door') { total++; if (s.core) core++; }
      });
    });

    paint(
      '<div class="panel">' +
        '<div class="head">' +
          '<p class="eyebrow">' + esc(t('title.eyebrow')) + '</p>' +
          '<h2 tabindex="-1">' + esc(t('title.h2')) + '</h2>' +
        '</div>' +
        '<p class="lead">' + esc(t('title.lead')) + '</p>' +
        '<p class="muted">' + esc(t('title.note')) + '</p>' +
        '<hr class="divider">' +
        '<p class="eyebrow">' + esc(t('title.routePick')) + '</p>' +
        '<div class="routes">' +
          route('short', 'btn-primary', core, true) +
          route('full', '', total, false) +
        '</div>' +
        (loadSave() ? '<div class="row">' + btn('resume', esc(t('title.resume')), 'btn-ghost') + '</div>' : '') +
      '</div>'
    );
  }

  function renderHub() {
    var keys = keyCount();
    var html = '<div class="panel">' +
      '<div class="head">' +
        '<p class="eyebrow">' + esc(t('hub.eyebrow')) + '</p>' +
        '<h2 tabindex="-1">' + esc(t('hub.h2')) + '</h2>' +
      '</div>' +
      '<p class="lead">' + esc(
        keys === 0 ? t('hub.lead0') : keys < 4 ? t('hub.leadSome', { n: keys }) : t('hub.leadAll')
      ) + '</p>' +
      '<button class="boss-door" data-act="boss" ' + (keys < 4 ? 'disabled' : 'data-primary="1"') + '>' +
        '<span class="dn">' + ico(keys < 4 ? ICONS.locked : ICONS.unlocked) + ' ' + esc(t('hub.bossName')) + '</span>' +
        '<span class="dd">' + esc(keys < 4 ? t('hub.bossLocked', { n: keys }) : t('hub.bossOpen')) + '</span>' +
      '</button>' +
      '<div class="hub-grid">';

    G().wings.forEach(function (w) {
      var d = doorsOf(w);
      var done = d.filter(function (x) { return S.answered[x.id]; }).length;
      var got = S.keys[w.id];
      html += '<button class="door' + (got ? ' done' : '') + '" data-act="wing" data-id="' + w.id + '">' +
        '<span class="dn">' + ico(ICONS.wings[w.id] || '') + ' ' + esc(w.name) + '</span>' +
        '<span class="dd">' + esc(w.blurb) + '</span>' +
        '<span class="dp">' +
          (got ? ico(ICONS.key) + ' ' + esc(w.artifact) : esc(t('hub.doors', { done: done, all: d.length }))) +
          (S.secrets[w.id] ? ' · ' + ico(ICONS.hint) + ' ' + esc(t('hub.secret')) : '') +
        '</span>' +
      '</button>';
    });

    paint(html + '</div></div>');
    announce(t('hub.announce', { n: keys }));
  }

  /* ── карта на крилото: скок до всяка стая и всяка врата ── */

  function renderMap(w, list) {
    var h = '<nav class="map" aria-label="' + esc(t('map.nav', { wing: w.name })) + '">';
    list.forEach(function (st, i) {
      var cls = 'mapdot', label;
      if (st.t === 'room') {
        cls += ' room';
        label = t('map.room', { i: i + 1, title: st.title });
      } else {
        var g = S.answered[st.id];
        cls += g === 'first' ? ' ok' : g === 'hint' ? ' hint' : g === 'wrong' ? ' wr' : ' todo';
        label = t(g === 'first' ? 'map.doorFirst' : g === 'hint' ? 'map.doorHint'
          : g === 'wrong' ? 'map.doorWrong' : 'map.doorTodo', { i: i + 1 });
      }
      h += '<button class="' + cls + '" data-act="goto" data-i="' + i + '"' +
        (i === S.step ? ' aria-current="step"' : '') +
        ' aria-label="' + esc(label) + '">' + (i + 1) + '</button>';
    });

    if (wingDone(w)) {
      h += '<button class="mapdot end ok" data-act="goto" data-i="' + list.length + '"' +
        (S.step >= list.length ? ' aria-current="step"' : '') +
        ' aria-label="' + esc(t(S.keys[w.id] ? 'map.treasureTaken' : 'map.treasureReady')) + '">' +
        ICONS.key + '</button>';
    } else {
      h += '<span class="mapdot end locked" aria-hidden="true">·</span>' +
        '<span class="sr-only">' + esc(t('map.treasureLocked', { n: doorsLeft(w).length })) + '</span>';
    }
    h += '<span class="mapbreak" aria-hidden="true"></span>';
    return h + '</nav>';
  }

  function navRow(extra) {
    return '<div class="row">' + (extra || '') +
      (S.step > 0 ? btn('back', ICONS.back + ' ' + esc(t('btn.back')), 'btn-ghost') : '') +
      btn('hub', esc(t('btn.hall')), 'btn-ghost') + '</div>';
  }

  /* ── крило: стая, врата, съкровищница ── */

  function renderWing() {
    var w = wingById(S.wing);
    var list = steps(w);
    if (S.step >= list.length) return renderTreasure(w);
    var s = list[S.step];
    return s.t === 'room' ? renderRoom(w, s, list) : renderDoor(w, s, list);
  }

  function renderRoom(w, s, list) {
    var html = '<div class="panel">' +
      '<div class="head">' +
        '<p class="eyebrow">' + esc(t('wing.room', { wing: w.name, i: S.step + 1, n: list.length })) + '</p>' +
        '<h2 tabindex="-1">' + esc(s.title) + '</h2>' +
      '</div>' +
      renderMap(w, list) +
      '<p class="lead">' + esc(s.lead) + '</p>';
    if (s.code) html += '<pre class="code">' + esc(s.code) + '</pre>';
    if (s.points) {
      html += '<ul class="points">';
      s.points.forEach(function (p) { html += '<li>' + esc(p) + '</li>'; });
      html += '</ul>';
    }
    html += navRow(btn('next', esc(t('btn.next')) + ' ' + ICONS.next, 'btn-primary', true)) + '</div>';
    paint(html);
    announce(t('wing.roomAnnounce', { wing: w.name, i: S.step + 1, n: list.length, title: s.title }));
  }

  /* вече отговорена врата се отваря с показан верен отговор, не празна */
  function hydrateReview(s, u) {
    u.checked = true;
    u.review = true;
    u.ok = S.answered[s.id] !== 'wrong';
    switch (s.kind) {
      case 'choice': case 'sr': case 'fix': u.pick = s.correct; break;
      case 'fill': u.typed = s.accept[0]; break;
      case 'match':
        u.assign = s.pairs.map(function (_, i) {
          for (var k = 0; k < u.tokens.length; k++) if (u.tokens[k].idx === i) return k;
          return null;
        });
        break;
      case 'order': u.order = s.items.map(function (_, i) { return i; }); break;
      case 'tab': u.seq = s.correct.slice(); break;
      case 'tree': u.tree = { role: s.role.correct, name: s.name.correct, state: s.state.correct }; break;
    }
  }

  function renderDoor(w, s, list) {
    var u = S.ui;
    if (u.doorId !== s.id) {
      var replay = !!u.replay;
      u = S.ui = { doorId: s.id, tries: 0, hint: false, checked: false, ok: false, replay: replay };
      if (s.kind === 'match') {
        u.tokens = shuffle(s.pairs.map(function (p, i) { return { txt: p[1], idx: i }; }));
        u.assign = s.pairs.map(function () { return null; });
        u.sel = null;
      }
      if (s.kind === 'order') {
        var idx = s.items.map(function (_, i) { return i; });
        do { u.order = shuffle(idx); } while (u.order.every(function (v, i) { return v === i; }));
      }
      if (s.kind === 'tab') u.seq = [];
      if (S.answered[s.id] && !replay) hydrateReview(s, u);
    }

    var html = '<div class="panel">' +
      '<div class="head">' +
        '<p class="eyebrow">' + esc(t('wing.door', { wing: w.name, i: S.step + 1, n: list.length })) + '</p>' +
        '<h2 tabindex="-1">' + ico(u.review ? ICONS.doorOpened : ICONS.door) + ' ' +
          esc(t(u.review ? 'wing.doorReview' : 'wing.doorLocked')) + '</h2>' +
      '</div>' +
      renderMap(w, list) +
      '<div class="doorframe">' +
        '<span class="qtype">' + esc(t('type.' + s.kind)) + '</span>' +
        '<p class="q">' + s.q + '</p>' +
        (s.code ? '<pre class="code">' + esc(s.code) + '</pre>' : '') +
        widget(s, u) +
      '</div>';

    if (u.hint && !u.checked && s.hint) {
      html += '<div class="hintbox">' + ico(ICONS.hint) + ' ' + esc(s.hint) + '</div>';
    }

    if (u.checked) {
      html += verdict(s, u);
    } else {
      html += navRow(
        btn('check', esc(t('btn.check')), 'btn-primary', true) +
        (s.hint && !u.hint ? btn('hint', ico(ICONS.hint) + ' ' + esc(t('btn.hint')), 'btn-ghost') : ''));
    }

    paint(html + '</div>', u.checked ? '.verdict h3' : null);
    if (!u.announced) {
      u.announced = true;
      announce(t('wing.doorAnnounce', { i: S.step + 1, n: list.length, type: t('type.' + s.kind) }));
    }
  }

  function renderTreasure(w) {
    var left = doorsLeft(w);
    if (left.length) {
      paint(
        '<div class="panel">' +
          '<div class="head">' +
            '<p class="eyebrow">' + esc(t('lock.eyebrow', { wing: w.name })) + '</p>' +
            '<h2 tabindex="-1">' + esc(t('lock.h2')) + '</h2>' +
          '</div>' +
          renderMap(w, steps(w)) +
          '<p class="lead">' + esc(t('lock.lead', {
            rest: left.length === 1 ? t('lock.rest1') : t('lock.restN', { n: left.length })
          })) + '</p>' +
          '<div class="row">' +
            '<button class="btn btn-primary" data-act="goto" data-i="' + firstOpenIndex(w) + '" data-primary="1">' +
              esc(t('lock.toDoor')) + '</button>' +
            btn('back', ICONS.back + ' ' + esc(t('btn.back')), 'btn-ghost') +
            btn('hub', esc(t('btn.hall')), 'btn-ghost') +
          '</div>' +
        '</div>'
      );
      announce(t('lock.announce', { n: left.length }));
      return;
    }

    if (!S.keys[w.id]) { S.keys[w.id] = true; save(); }
    paint(
      '<div class="panel secret">' +
        '<div class="head">' +
          '<p class="eyebrow">' + esc(t('tr.eyebrow', { wing: w.name })) + '</p>' +
          '<h2 tabindex="-1">' + esc(t('tr.h2')) + '</h2>' +
        '</div>' +
        renderMap(w, steps(w)) +
        '<p class="artifact" aria-hidden="true">' + ICONS.key + '</p>' +
        '<p class="lead">' + t('tr.take', { artifact: esc(w.artifact) }) + ' ' +
          esc(keyCount() === 4 ? t('tr.last') : t('tr.left', { n: 4 - keyCount() })) + '</p>' +
        '<div class="row">' +
          btn('hub', esc(t('btn.hall')), 'btn-primary', true) +
          btn('back', ICONS.back + ' ' + esc(t('btn.backToWing')), 'btn-ghost') +
        '</div>' +
      '</div>'
    );
    announce(t('tr.announce', { artifact: w.artifact, n: keyCount() }));
  }

  function renderSecret() {
    var w = wingById(S.pendingSecret);
    var sec = w.secret;
    paint(
      '<div class="panel secret">' +
        '<div class="head">' +
          '<p class="eyebrow">' + esc(t('sec.eyebrow', { wing: w.name })) + '</p>' +
          '<h2 tabindex="-1">' + ico(ICONS.hint) + ' ' + esc(sec.title) + '</h2>' +
        '</div>' +
        '<p class="lead">' + esc(sec.text) + '</p>' +
        (sec.code ? '<pre class="code">' + esc(sec.code) + '</pre>' : '') +
        '<div class="row">' + btn('secret-close', esc(t('sec.back')), 'btn-primary', true) + '</div>' +
      '</div>'
    );
    announce(t('sec.announce', { title: sec.title }));
  }

  /* ───────────────────────── джаджи по тип ───────────────────────── */

  function widget(s, u) {
    switch (s.kind) {
      case 'choice': case 'sr': return wChoice(s, u);
      case 'fix': return wFix(s, u);
      case 'fill': return wFill(s, u);
      case 'match': return wMatch(s, u);
      case 'order': return wOrder(s, u);
      case 'tab': return wTab(s, u);
      case 'tree': return wTree(s, u);
    }
    return '';
  }

  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  function wChoice(s, u) {
    var h = '<div class="opts" role="group" aria-label="' + esc(t('w.options')) + '">';
    s.options.forEach(function (o, i) {
      var cls = 'opt';
      if (u.checked) {
        if (i === s.correct) cls += ' good';
        else if (i === u.pick) cls += ' bad';
      }
      h += '<button id="opt-' + i + '" class="' + cls + '" data-act="opt" data-i="' + i + '" ' +
        'aria-pressed="' + (u.pick === i ? 'true' : 'false') + '"' + (u.checked ? ' disabled' : '') + '>' +
        '<span class="chip" aria-hidden="true">' + LETTERS[i] + '</span><span>' + o + '</span></button>';
    });
    return h + '</div>';
  }

  function wFix(s, u) {
    var h = '<div class="lines" role="group" aria-label="' + esc(t('w.lines')) + '">';
    s.lines.forEach(function (l, i) {
      var cls = 'lineb';
      if (u.checked) {
        if (i === s.correct) cls += ' good';
        else if (i === u.pick) cls += ' bad';
      }
      h += '<button id="opt-' + i + '" class="' + cls + '" data-act="opt" data-i="' + i + '" ' +
        'aria-pressed="' + (u.pick === i ? 'true' : 'false') + '"' + (u.checked ? ' disabled' : '') + '>' +
        '<span class="ln" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span>' + esc(l) + '</span></button>';
    });
    return h + '</div>';
  }

  function wFill(s, u) {
    var cls = u.checked ? (u.ok ? 'good' : 'bad') : '';
    return '<div class="fill-wrap">' +
      '<label class="sr-only" for="fill">' + esc(t('w.fill')) + '</label>' +
      '<span>' + esc(s.before) + '</span>' +
      '<input class="fill-in ' + cls + '" id="fill" type="text" autocomplete="off" autocapitalize="off" ' +
      'spellcheck="false" value="' + esc(u.typed || '') + '"' + (u.checked ? ' disabled' : '') + '>' +
      '<span>' + esc(s.after) + '</span></div>';
  }

  function wMatch(s, u) {
    var h = '<div class="slots">';
    s.pairs.forEach(function (p, i) {
      var a = u.assign[i];
      var cls = 'slot' + (a !== null ? ' filled' : '');
      if (u.checked) cls += (a !== null && u.tokens[a].idx === i) ? ' good' : ' bad';
      h += '<div class="slotrow">' +
        '<div class="slotlabel">' + esc(p[0]) + '</div>' +
        '<button id="slot-' + i + '" class="' + cls + '" data-act="slot" data-i="' + i + '"' +
        (u.checked ? ' disabled' : '') + '>' +
        (a !== null ? esc(u.tokens[a].txt) : esc(t('w.slotEmpty'))) + '</button>' +
      '</div>';
    });
    h += '</div><div class="tray"><span class="tray-label">' + esc(t('w.tray')) + '</span>';
    u.tokens.forEach(function (tok, i) {
      var used = u.assign.indexOf(i) !== -1;
      h += '<button id="token-' + i + '" class="token" data-act="token" data-i="' + i + '" ' +
        'draggable="' + (!used && !u.checked) + '" aria-pressed="' + (u.sel === i ? 'true' : 'false') + '"' +
        (used || u.checked ? ' disabled' : '') + '>' + esc(tok.txt) + '</button>';
    });
    return h + '</div>';
  }

  function wOrder(s, u) {
    var h = '<div class="orderlist" role="group" aria-label="' + esc(t('w.order')) + '">';
    u.order.forEach(function (it, pos) {
      var cls = 'orderitem';
      if (u.checked) cls += (it === pos ? ' good' : ' bad');
      h += '<div class="' + cls + '">' +
        '<span class="num" aria-hidden="true">' + (pos + 1) + '</span>' +
        '<span class="txt">' + esc(s.items[it]) + '</span>' +
        '<button id="up-' + pos + '" class="mini" data-act="up" data-i="' + pos + '" ' +
        'aria-label="' + esc(t('w.moveUp', { item: s.items[it] })) + '"' +
        (pos === 0 || u.checked ? ' disabled' : '') + '>↑</button>' +
        '<button id="down-' + pos + '" class="mini" data-act="down" data-i="' + pos + '" ' +
        'aria-label="' + esc(t('w.moveDown', { item: s.items[it] })) + '"' +
        (pos === u.order.length - 1 || u.checked ? ' disabled' : '') + '>↓</button>' +
      '</div>';
    });
    return h + '</div>';
  }

  function wTab(s, u) {
    var h = '<div class="formsim" role="group" aria-label="' + esc(t('w.tab')) + '">';
    s.fields.forEach(function (f, i) {
      var pos = u.seq.indexOf(i);
      var cls = 'fieldbtn' + (pos !== -1 ? ' picked' : '');
      if (u.checked) cls += (s.correct[pos] === i && pos !== -1) ? ' good' : ' bad';
      h += '<button id="field-' + i + '" class="' + cls + '" data-act="field" data-i="' + i + '"' +
        (u.checked ? ' disabled' : '') + '>' +
        '<span class="ord">' + (pos !== -1 ? pos + 1 : '·') + '</span>' +
        '<span>' + esc(f.label) + '</span>' +
        (f.attr ? '<span class="hintattr">' + esc(f.attr) + '</span>' : '') +
      '</button>';
    });
    h += '</div>';
    if (!u.checked && u.seq.length) {
      h += '<div class="row">' + btn('tab-reset', esc(t('w.tabClear')), 'btn-ghost') + '</div>';
    }
    return h;
  }

  function wTree(s, u) {
    var parts = [['role', t('w.treeRole'), s.role], ['name', t('w.treeName'), s.name], ['state', t('w.treeState'), s.state]];
    var h = '<div class="treegrid">';
    parts.forEach(function (p) {
      var key = p[0], got = u.checked ? (u.tree && u.tree[key]) : null;
      var cls = u.checked ? (got === p[2].correct ? 'good' : 'bad') : '';
      h += '<div><label for="tree-' + key + '">' + esc(p[1]) + '</label>' +
        '<select class="tree-sel ' + cls + '" id="tree-' + key + '"' + (u.checked ? ' disabled' : '') + '>' +
        '<option value="">' + esc(t('w.select')) + '</option>';
      p[2].options.forEach(function (o) {
        h += '<option value="' + esc(o) + '"' + (got === o ? ' selected' : '') + '>' + esc(o) + '</option>';
      });
      h += '</select></div>';
    });
    return h + '</div>';
  }

  /* ───────────────────────── проверка ───────────────────────── */

  function norm(s) {
    return String(s || '').toLowerCase().trim().replace(/["'`=]/g, '').replace(/\s+/g, '');
  }

  function evaluate(s, u) {
    switch (s.kind) {
      case 'choice': case 'sr': case 'fix':
        if (u.pick == null) return null;
        return u.pick === s.correct;
      case 'fill':
        var v = document.getElementById('fill');
        u.typed = v ? v.value : '';
        if (!norm(u.typed)) return null;
        return s.accept.some(function (a) { return norm(a) === norm(u.typed); });
      case 'match':
        if (u.assign.indexOf(null) !== -1) return null;
        return u.assign.every(function (tok, i) { return u.tokens[tok].idx === i; });
      case 'order':
        return u.order.every(function (v2, i) { return v2 === i; });
      case 'tab':
        if (u.seq.length !== s.fields.length) return null;
        return u.seq.every(function (v2, i) { return v2 === s.correct[i]; });
      case 'tree':
        u.tree = {
          role: document.getElementById('tree-role').value,
          name: document.getElementById('tree-name').value,
          state: document.getElementById('tree-state').value
        };
        if (!u.tree.role || !u.tree.name || !u.tree.state) return null;
        return u.tree.role === s.role.correct &&
               u.tree.name === s.name.correct &&
               u.tree.state === s.state.correct;
    }
    return null;
  }

  function verdict(s, u) {
    var gradeKey = { first: 'v.gradeFirst', hint: 'v.gradeHint', wrong: 'v.gradeWrong' }[S.answered[s.id]];
    var h = '<div class="verdict ' + (u.review ? 'rev' : u.ok ? 'ok' : 'no') + '">' +
      '<h3 tabindex="-1">' + ico(u.review ? ICONS.doorOpened : u.ok ? ICONS.ok : ICONS.no) + ' ' +
        esc(t(u.review ? 'v.review' : u.ok ? 'v.ok' : 'v.no')) + '</h3>' +
      (u.review ? '<p class="muted">' + esc(t(gradeKey) + ' ' + t('v.reviewShown')) + '</p>' : '') +
      '<p>' + esc(s.explain) + '</p>';
    if (S.mode === 'projector' && s.teach) {
      h += '<p class="teach"><b>' + esc(t('v.teacher')) + '</b>' + esc(s.teach) + '</p>';
    }
    h += '</div>';

    if (S.pendingSecret && !S.secrets[S.pendingSecret]) {
      h += '<button class="crack" data-act="secret">' + ico(ICONS.crack) + ' ' + esc(t('btn.crack')) + '</button>';
    }
    h += navRow(
      btn('next', esc(t('btn.next')) + ' ' + ICONS.next, 'btn-primary', true) +
      (u.review ? btn('retry', ICONS.retry + ' ' + esc(t('btn.retry')), '') : ''));
    if (u.review) h += '<p class="muted note">' + esc(t('v.reviewNote')) + '</p>';
    return h;
  }

  function check() {
    var w = wingById(S.wing);
    var s = steps(w)[S.step];
    var u = S.ui;
    var res = evaluate(s, u);

    if (res === null) { announce(t('v.needAnswer')); return; }

    if (res) {
      u.checked = true; u.ok = true;
      var grade = u.tries === 0 ? (u.hint ? 'hint' : 'first') : 'wrong';
      if (!S.answered[s.id]) {
        S.answered[s.id] = grade;
        if (grade === 'first' && !S.secrets[w.id]) S.pendingSecret = w.id;
      }
      announce(t('v.announceOk', { explain: s.explain }));
    } else {
      u.tries++;
      if (u.tries >= 2) {
        u.checked = true; u.ok = false;
        if (!S.answered[s.id]) S.answered[s.id] = 'wrong';
        announce(t('v.announceNo', { explain: s.explain }));
      } else {
        u.hint = true;
        announce(t('v.announceHint', { hint: s.hint || '' }));
        var p = stage.querySelector('.doorframe');
        if (p) { p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); }
      }
    }
    save();
    render();
  }

  /* ───────────────────────── босът ───────────────────────── */

  function bossLog(txt, cls) {
    S.boss.log.push({ t: txt, c: cls || '' });
    if (S.boss.log.length > 40) S.boss.log.shift();
  }

  function renderBoss() {
    var b = S.boss;
    var boss = G().boss;

    if (b.phase === 'intro') {
      paint(
        '<div class="panel boss-stage">' +
          '<div class="head"><p class="eyebrow">' + esc(t('boss.eyebrow')) + '</p>' +
          '<h2 tabindex="-1">' + ico(ICONS.reader) + ' ' + esc(t('boss.h2')) + '</h2></div>' +
          '<p class="lead">' + nl2br(boss.intro) + '</p>' +
          '<div class="row">' +
            btn('boss-begin', esc(t('boss.begin')), 'btn-primary', true) +
            btn('hub', esc(t('boss.notYet')), 'btn-ghost') +
          '</div>' +
        '</div>'
      );
      return;
    }

    var st = boss.stages[b.stage];

    if (b.phase === 'done') {
      paint(
        '<div class="panel boss-stage">' +
          '<div class="head"><p class="eyebrow">' + esc(st.title) + '</p>' +
          '<h2 tabindex="-1">' + esc(t('boss.fast')) + '</h2></div>' +
          '<p class="lead">' + esc(t('boss.fastLead')) + '</p>' +
          '<pre class="code">' + esc(st.fix) + '</pre>' +
          '<div class="row">' + btn('boss-next',
            esc(b.stage + 1 < boss.stages.length ? t('boss.nextStage') + ' ' + ICONS.next : t('boss.exitLight')),
            'btn-primary', true) + '</div>' +
        '</div>'
      );
      return;
    }

    if (b.phase === 'lesson') {
      paint(
        '<div class="panel boss-stage">' +
          '<div class="head"><p class="eyebrow">' + esc(st.title) + '</p>' +
          '<h2 tabindex="-1">' + esc(t('boss.why')) + '</h2></div>' +
          '<div class="boss-lesson"><h3>' + esc(t('boss.whatHappened')) + '</h3><p>' + esc(st.lesson) + '</p></div>' +
          '<div class="row">' + btn('boss-fix', esc(t('boss.fix')), 'btn-primary', true) + '</div>' +
        '</div>'
      );
      return;
    }

    var broken = b.phase === 'broken';
    var items = broken ? st.items : st.fixedItems;

    var h = '<div class="panel boss-stage">' +
      '<div class="head"><p class="eyebrow">' +
        esc(t('boss.stage', { title: st.title, i: b.stage + 1, n: boss.stages.length })) + '</p>' +
      '<h2 tabindex="-1" class="boss-task">' + esc(broken ? st.task : st.fixedTask) + '</h2></div>' +
      '<div class="log" aria-hidden="true">';
    if (!b.log.length) bossLog(t('boss.logStart'), 'sys');
    b.log.forEach(function (l) { h += '<p class="' + l.c + '">' + esc(l.t) + '</p>'; });
    h += '</div><div class="blocks">';
    items.forEach(function (it, i) {
      h += '<button id="blk-' + i + '" class="blk" data-act="blk" data-i="' + i + '">' +
        '<span class="shape" aria-hidden="true">' + ICONS.block + '</span>' +
        '<span class="sr-only">' + esc(it.say) + '</span></button>';
    });
    h += '</div><div class="row">' + btn('hub', esc(t('boss.exit')), 'btn-ghost') + '</div></div>';

    paint(h);
  }

  function bossActivate(i) {
    var b = S.boss;
    var st = G().boss.stages[b.stage];
    var broken = b.phase === 'broken';
    var it = (broken ? st.items : st.fixedItems)[i];

    if (it.goal) {
      if (broken) {
        bossLog(ICONS.yes + ' ' + t('boss.found'), 'good');
        b.phase = 'lesson';
      } else {
        if (it.onGoal) bossLog(ICONS.reader + ' ' + it.onGoal, 'good');
        bossLog(ICONS.yes + ' ' + t('boss.done'), 'good');
        b.phase = 'done';
      }
      save(); render();
      announce(broken ? t('boss.announceFound') : t('boss.announceFast'));
      return;
    }

    b.tries++;
    S.ui.focusId = 'blk-' + i;
    bossLog(ICONS.nope + ' ' + (st.wrongMsg || t('boss.nothing')), 'bad');
    if (b.tries >= (st.unknowable ? 2 : 6)) { b.phase = 'lesson'; b.tries = 0; }
    save(); render();
  }

  /* ───────────────────────── финал ───────────────────────── */

  function renderEnd() {
    var first = 0, hinted = 0, wrong = 0;
    Object.keys(S.answered).forEach(function (k) {
      var v = S.answered[k];
      if (v === 'first') first++; else if (v === 'hint') hinted++; else wrong++;
    });
    var total = first + hinted + wrong;
    var ratio = total ? first / total : 0;
    var rankKey = ratio === 1 ? 'rank100' : ratio >= 0.8 ? 'rank80' : ratio >= 0.55 ? 'rank55' : 'rank0';
    var rank = ICONS.ranks[rankKey] + ' ' + t('end.' + rankKey);

    paint(
      '<div class="panel">' +
        '<div class="head"><p class="eyebrow">' + esc(t('end.eyebrow')) + '</p>' +
        '<h2 tabindex="-1">' + esc(t('end.h2')) + '</h2></div>' +
        '<p class="lead">' + nl2br(G().boss.outro) + '</p>' +
        '<hr class="divider">' +
        '<p class="rank">' + esc(rank) + '</p>' +
        '<div class="score">' +
          tile(total, t('end.tileDoors')) +
          tile(first, t('end.tileFirst')) +
          tile(hinted, t('end.tileHint')) +
          tile(Object.keys(S.secrets).length + ' / 4', t('end.tileSecrets')) +
        '</div>' +
        '<p class="muted">' + t('end.three') + '</p>' +
        '<div class="row">' +
          btn('hub', esc(t('btn.hall')), 'btn-primary', true) +
          btn('restart', esc(t('btn.restart')), 'btn-ghost') +
        '</div>' +
      '</div>'
    );
    announce(t('end.announce', { rank: t('end.' + rankKey), first: first, total: total }));
  }
  function tile(n, l) {
    return '<div class="scoretile"><div class="n">' + esc(n) + '</div><div class="l">' + esc(l) + '</div></div>';
  }

  /* ───────────────────────── действия ───────────────────────── */

  function handle(act, ds) {
    var u = S.ui;
    var i = ds.i !== undefined ? parseInt(ds.i, 10) : null;

    switch (act) {
      case 'start': S.route = ds.route; S.screen = 'hub'; save(); return render();
      case 'resume':
        var d = loadSave();
        if (d) { var lang = S.lang; S = d; S.lang = lang; S.screen = 'hub'; }
        return render();
      case 'restart':
        wipe();
        var keep = { mode: S.mode, lang: S.lang };
        S = fresh(); S.mode = keep.mode; S.lang = keep.lang;
        return render();
      case 'hub': S.screen = 'hub'; S.ui = {}; save(); return render();
      case 'wing': S.wing = ds.id; S.step = 0; S.screen = 'wing'; S.ui = {}; save(); return render();
      case 'next': S.step++; S.ui = {}; save(); return render();
      case 'back': if (S.step > 0) S.step--; S.ui = {}; save(); return render();
      case 'goto': {
        var gw = wingById(S.wing), glist = steps(gw);
        S.step = (i >= glist.length && !wingDone(gw)) ? glist.length - 1 : i;
        S.ui = {}; save(); return render();
      }
      case 'retry': S.ui = { doorId: null, replay: true }; return render();
      case 'check': return check();
      case 'hint': u.hint = true; return render();

      /* Изборът на отговор не променя нищо друго на екрана, затова само
         пребоядисваме бутоните вместо да строим целия панел наново. */
      case 'opt': {
        u.pick = i;
        var opts = stage.querySelectorAll('[data-act="opt"]');
        for (var k = 0; k < opts.length; k++) {
          opts[k].setAttribute('aria-pressed', String(parseInt(opts[k].dataset.i, 10) === i));
        }
        return;
      }
      case 'token': u.sel = (u.sel === i ? null : i); u.focusId = 'token-' + i; return render();
      case 'slot':
        if (u.sel !== null && u.sel !== undefined) { u.assign[i] = u.sel; u.sel = null; }
        else if (u.assign[i] !== null) { u.assign[i] = null; }
        u.focusId = 'slot-' + i; return render();
      case 'up': swap(u.order, i, i - 1); u.focusId = 'up-' + (i - 1); return render();
      case 'down': swap(u.order, i, i + 1); u.focusId = 'down-' + (i + 1); return render();
      case 'field':
        var at = u.seq.indexOf(i);
        if (at !== -1) u.seq.splice(at, 1); else u.seq.push(i);
        u.focusId = 'field-' + i; return render();
      case 'tab-reset': u.seq = []; return render();

      case 'secret': S.screen = 'secret'; return render();
      case 'secret-close':
        S.secrets[S.pendingSecret] = true; S.pendingSecret = null;
        S.screen = 'wing'; save(); return render();

      case 'boss': S.screen = 'boss'; S.boss = { stage: 0, phase: 'intro', tries: 0, log: [] }; return render();
      case 'boss-begin': S.boss.phase = 'broken'; S.boss.log = []; return render();
      case 'boss-fix': S.boss.phase = 'fixed'; S.boss.tries = 0; S.boss.log = []; return render();
      case 'boss-next':
        if (S.boss.stage + 1 < G().boss.stages.length) {
          S.boss.stage++; S.boss.phase = 'broken'; S.boss.tries = 0; S.boss.log = [];
        } else { S.screen = 'end'; }
        save(); return render();
      case 'blk': return bossActivate(i);
    }
  }
  function swap(a, i, j) { var x = a[i]; a[i] = a[j]; a[j] = x; }

  function setLang(code) {
    if (!knownLang(code) || code === S.lang) return;
    S.lang = code;
    S.ui = {};
    S.boss.log = [];
    save();
    render();
    announce(t('lang.changed'));
  }

  function toggleMode() {
    S.mode = S.mode === 'solo' ? 'projector' : 'solo';
    render();
    announce(t('mode.announce', { mode: t(S.mode === 'projector' ? 'mode.projector' : 'mode.solo') }));
  }

  /* ───────────────────────── вход ───────────────────────── */

  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    handle(b.dataset.act, b.dataset);
  });

  topbar.addEventListener('click', function (e) {
    var l = e.target.closest('[data-lang]');
    if (l) return setLang(l.dataset.lang);
    if (e.target.closest('#modebtn')) return toggleMode();
  });

  /* фокусът върху блок в стаята на боса „изговаря“ какво има там */
  stage.addEventListener('focusin', function (e) {
    var b = e.target.closest('.blk');
    if (!b || S.screen !== 'boss') return;
    var st = G().boss.stages[S.boss.stage];
    var it = (S.boss.phase === 'broken' ? st.items : st.fixedItems)[parseInt(b.dataset.i, 10)];
    if (!it) return;
    b.classList.add('lit');
    var logEl = stage.querySelector('.log');
    if (!logEl) return;
    var p = document.createElement('p');
    p.textContent = ICONS.reader + ' ' + it.say;
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
    bossLog(ICONS.reader + ' ' + it.say);
  });

  /* drag & drop за свързването — клавиатурният път (клик → клик) остава водещ */
  stage.addEventListener('dragstart', function (e) {
    var tk = e.target.closest('.token');
    if (!tk || tk.disabled) return;
    e.dataTransfer.setData('text/plain', tk.dataset.i);
    e.dataTransfer.effectAllowed = 'move';
  });
  stage.addEventListener('dragover', function (e) {
    var s = e.target.closest('.slot');
    if (!s || s.disabled) return;
    e.preventDefault(); s.classList.add('over');
  });
  stage.addEventListener('dragleave', function (e) {
    var s = e.target.closest('.slot');
    if (s) s.classList.remove('over');
  });
  stage.addEventListener('drop', function (e) {
    var s = e.target.closest('.slot');
    if (!s || s.disabled) return;
    e.preventDefault();
    var tok = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(tok)) return;
    var slot = parseInt(s.dataset.i, 10);
    var prev = S.ui.assign.indexOf(tok);
    if (prev !== -1) S.ui.assign[prev] = null;
    S.ui.assign[slot] = tok;
    S.ui.sel = null;
    S.ui.focusId = 'slot-' + slot;
    render();
  });

  document.addEventListener('keydown', function (e) {
    var target = e.target;
    var typing = target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA');
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'Escape' && S.screen !== 'title') { e.preventDefault(); return handle('hub', {}); }
    if (typing) {
      if (e.key === 'Enter' && S.screen === 'wing') { e.preventDefault(); check(); }
      return;
    }

    if (e.code === 'KeyP') { e.preventDefault(); return toggleMode(); }
    if (e.code === 'KeyR') {
      e.preventDefault();
      if (confirm(t('confirm.restart'))) handle('restart', {});
      return;
    }
    if (e.code === 'KeyH') {
      var hb = stage.querySelector('[data-act="hint"]');
      if (hb) { e.preventDefault(); hb.click(); }
      return;
    }

    var onChrome = (target === document.body || target === stage || target.tagName === 'H2');
    if (e.key === 'ArrowLeft' && onChrome) {
      var bb = stage.querySelector('[data-act="back"]');
      if (bb) { e.preventDefault(); bb.click(); }
      return;
    }
    if ((e.key === 'ArrowRight' && onChrome) || (e.key === 'Enter' && target === document.body)) {
      var pb = stage.querySelector('[data-primary]');
      if (pb && !pb.disabled) { e.preventDefault(); pb.click(); }
      return;
    }

    var n = null;
    if (/^[1-5]$/.test(e.key)) n = parseInt(e.key, 10) - 1;
    else if (/^Key[A-E]$/.test(e.code)) n = e.code.charCodeAt(3) - 65;
    if (n !== null) {
      var o = stage.querySelector('[data-act="opt"][data-i="' + n + '"]');
      if (o && !o.disabled) { e.preventDefault(); o.click(); }
    }
  });

  /* ───────────────────────── старт ───────────────────────── */

  S = fresh();
  var saved = loadSave();
  S.lang = pickLang(saved && saved.lang);
  render();
})();
