/* Подземието на DOM-а — двигател.
   Нула зависимости. Класически скрипт, за да работи и през file:// без сървър.

   Кои полета в data.js се рендерират като HTML и кои се екранират:
     q, options            → HTML (може да ползваш <b> и &lt;tag&gt;)
     всичко останало       → чист текст (пиши <div> направо, екранира се само) */

(function () {
  'use strict';

  var G = window.GAME;
  var STORE = 'dom-dungeon-v1';

  var stage = document.getElementById('stage');
  var live = document.getElementById('live');
  var keyring = document.getElementById('keyring');
  var modebtn = document.getElementById('modebtn');
  var footbar = document.getElementById('footbar');
  var progress = document.getElementById('progress');

  /* ───────────────────────── състояние ───────────────────────── */

  var S = null;
  function fresh() {
    return {
      mode: 'solo',
      route: 'full',
      screen: 'title',
      wing: null,
      step: 0,
      keys: {},
      answered: {},   // id на врата → 'first' | 'hint' | 'wrong'
      secrets: {},    // id на крило → намерена скрита стая
      pendingSecret: null,
      returnTo: null,
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
  function announce(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 60); }
  function wingById(id) {
    for (var i = 0; i < G.wings.length; i++) if (G.wings[i].id === id) return G.wings[i];
    return null;
  }
  function shuffle(a) {
    var r = a.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = r[i]; r[i] = r[j]; r[j] = t;
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
    G.wings.forEach(function (w) { n += doorsOf(w).length; });
    return n;
  }
  function answeredCount() { return Object.keys(S.answered).length; }
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
  function keyCount() {
    return G.wings.filter(function (w) { return S.keys[w.id]; }).length;
  }

  var TYPE_LABEL = {
    choice: 'Избери отговор', sr: 'Какво чете екранният четец', fix: 'Поправи разметката',
    fill: 'Попълни атрибута', match: 'Свържи', order: 'Подреди',
    tab: 'Пътят на Tab', tree: 'Дървото на достъпността'
  };

  /* ───────────────────────── рамка ───────────────────────── */

  function paintChrome() {
    document.documentElement.dataset.mode = S.mode;

    var html = '';
    G.wings.forEach(function (w) {
      var has = S.keys[w.id];
      html += '<span class="keyslot' + (has ? ' has' : '') + '" title="' + esc(w.artifact) + '">' +
        (has ? '🔑' : '·') + '</span>';
    });
    keyring.innerHTML = html +
      '<span class="sr-only">' + keyCount() + ' от 4 ключа</span>';

    modebtn.textContent = S.mode === 'projector' ? '🎥 Проектор' : '💻 Соло';
    modebtn.setAttribute('aria-label', 'Смени режима. Сега: ' +
      (S.mode === 'projector' ? 'проектор' : 'соло'));

    var pct = allDoors() ? Math.round(answeredCount() / allDoors() * 100) : 0;
    progress.style.width = pct + '%';

    footbar.innerHTML =
      '<span><kbd>Tab</kbd> навигация</span>' +
      '<span><kbd>1</kbd>–<kbd>4</kbd> отговор</span>' +
      '<span><kbd>→</kbd> напред</span>' +
      '<span><kbd>H</kbd> подсказка</span>' +
      '<span><kbd>Esc</kbd> залата</span>' +
      '<span><kbd>P</kbd> режим</span>' +
      '<span><kbd>R</kbd> отначало</span>';
  }

  function paint(html, focusSel) {
    stage.innerHTML = html;
    paintChrome();
    var f = null;
    if (S.ui.focusId) f = document.getElementById(S.ui.focusId);
    if (!f && focusSel) f = stage.querySelector(focusSel);
    if (!f) f = stage.querySelector('h2');
    if (f) f.focus();
    S.ui.focusId = null;
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

  function renderTitle() {
    var core = 0, total = 0;
    G.wings.forEach(function (w) {
      w.steps.forEach(function (s) {
        if (s.t === 'door') { total++; if (s.core) core++; }
      });
    });
    var hasSave = !!loadSave();

    paint(
      '<div class="panel reveal">' +
        '<div class="head">' +
          '<p class="eyebrow">Урок 2 · интерактивна презентация</p>' +
          '<h2 tabindex="-1">Слизаш в подземие, построено от лош HTML</h2>' +
        '</div>' +
        '<p class="lead">Четири крила, всяко заключено. Всяка врата иска отговор, всяко крило дава ключ. ' +
        'Четирите ключа отварят последната стая — и там екранът изгасва.</p>' +
        '<p class="muted">Нищо не се губи при грешка. Единственото, което се брои, е от кой опит си отворил вратата.</p>' +
        '<hr class="divider">' +
        '<p class="eyebrow">Избери маршрут</p>' +
        '<div class="row">' +
          '<button class="btn btn-primary" data-act="start" data-route="short" data-primary="1">' +
            'Кратък · ' + core + ' врати <span class="muted">(за час от 45 мин)</span></button>' +
          '<button class="btn" data-act="start" data-route="full">Пълен · ' + total + ' врати</button>' +
          (hasSave ? '<button class="btn btn-ghost" data-act="resume">Продължи запазеното</button>' : '') +
        '</div>' +
      '</div>'
    );
  }

  function renderHub() {
    var keys = keyCount();
    var html = '<div class="panel reveal">' +
      '<div class="head">' +
        '<p class="eyebrow">Централна зала</p>' +
        '<h2 tabindex="-1">Валидаторът те чака</h2>' +
      '</div>' +
      '<p class="lead">' +
        (keys === 0 ? 'Четири крила. Ти избираш откъде да започнеш — редът е твой.' :
         keys < 4 ? 'Имаш ' + keys + ' от 4 ключа. Последната врата още мълчи.' :
         'Четирите ключа са у теб. Последната врата се отваря.') +
      '</p>' +
      '<button class="boss-door" data-act="boss" ' + (keys < 4 ? 'disabled' : 'data-primary="1"') + '>' +
        '<span class="dn">' + (keys < 4 ? '🔒' : '🔓') + ' Последната стая — Четецът</span>' +
        '<span class="dd">' + (keys < 4 ? 'Иска четири ключа. Имаш ' + keys + '.' : 'Екранът ще изгасне. Влизаш ли?') + '</span>' +
      '</button>' +
      '<div class="hub-grid">';

    G.wings.forEach(function (w) {
      var d = doorsOf(w);
      var done = d.filter(function (x) { return S.answered[x.id]; }).length;
      var got = S.keys[w.id];
      html += '<button class="door' + (got ? ' done' : '') + '" data-act="wing" data-id="' + w.id + '">' +
        '<span class="dn"><span aria-hidden="true">' + w.icon + '</span> ' + esc(w.name) + '</span>' +
        '<span class="dd">' + esc(w.blurb) + '</span>' +
        '<span class="dp">' + (got ? '🔑 ' + esc(w.artifact) : done + ' / ' + d.length + ' врати') +
        (S.secrets[w.id] ? ' · 💡 тайна стая' : '') + '</span>' +
      '</button>';
    });

    html += '</div></div>';
    paint(html);
    announce('Централна зала. ' + keys + ' от 4 ключа.');
  }

  /* ── карта на крилото: скок до всяка стая и всяка врата ── */

  function renderMap(w, list) {
    var h = '<nav class="map" aria-label="Карта на крилото ' + esc(w.name) + '">';
    list.forEach(function (st, i) {
      var cls = 'mapdot', label, mark = String(i + 1);
      if (st.t === 'room') {
        cls += ' room';
        label = 'Стая ' + (i + 1) + ': ' + st.title;
      } else {
        var g = S.answered[st.id];
        cls += g === 'first' ? ' ok' : g === 'hint' ? ' hint' : g === 'wrong' ? ' wr' : ' todo';
        label = 'Врата ' + (i + 1) + ': ' + (
          g === 'first' ? 'отворена от първи опит' :
          g === 'hint' ? 'отворена с подсказка' :
          g === 'wrong' ? 'отворена след грешка' : 'още заключена');
      }
      h += '<button class="' + cls + '" data-act="goto" data-i="' + i + '"' +
        (i === S.step ? ' aria-current="step"' : '') +
        ' aria-label="' + esc(label) + '">' + mark + '</button>';
    });
    if (wingDone(w)) {
      h += '<button class="mapdot end ok" data-act="goto" data-i="' + list.length + '"' +
        (S.step >= list.length ? ' aria-current="step"' : '') +
        ' aria-label="Съкровищница в края на коридора' +
        (S.keys[w.id] ? ': ключът е взет' : ': ключът те чака') + '">🔑</button>';
    } else {
      h += '<span class="mapdot end locked" aria-hidden="true">·</span>' +
        '<span class="sr-only">Съкровищницата в края на коридора се отваря, ' +
        'след като са отворени всички врати. Остават ' + doorsLeft(w).length + '.</span>';
    }
    h += '<span class="mapbreak" aria-hidden="true"></span>';
    return h + '</nav>';
  }

  function navRow(extra) {
    return '<div class="row">' + (extra || '') +
      (S.step > 0 ? '<button class="btn btn-ghost" data-act="back">← Назад</button>' : '') +
      '<button class="btn btn-ghost" data-act="hub">Обратно в залата</button></div>';
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
    var html = '<div class="panel reveal">' +
      '<div class="head">' +
        '<p class="eyebrow">' + esc(w.name) + ' · стая ' + (S.step + 1) + ' от ' + list.length + '</p>' +
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
    html += navRow('<button class="btn btn-primary" data-act="next" data-primary="1">Напред →</button>') + '</div>';
    paint(html);
    announce(w.name + ', стая ' + (S.step + 1) + ' от ' + list.length + '. ' + s.title);
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

    var html = '<div class="panel reveal">' +
      '<div class="head">' +
        '<p class="eyebrow">' + esc(w.name) + ' · врата ' + (S.step + 1) + ' от ' + list.length + '</p>' +
        '<h2 tabindex="-1">' + (u.review ? '🗝️ Вече отворена врата' : '🚪 Вратата е заключена') + '</h2>' +
      '</div>' +
      renderMap(w, list) +
      '<div class="doorframe">' +
        '<span class="qtype">' + esc(TYPE_LABEL[s.kind] || '') + '</span>' +
        '<p class="q">' + s.q + '</p>' +
        (s.code ? '<pre class="code">' + esc(s.code) + '</pre>' : '') +
        widget(s, u) +
      '</div>';

    if (u.hint && !u.checked && s.hint) {
      html += '<div class="hintbox">💡 ' + esc(s.hint) + '</div>';
    }

    if (u.checked) {
      html += verdict(s, u, w);
    } else {
      html += navRow(
        '<button class="btn btn-primary" data-act="check" data-primary="1">Опитай вратата</button>' +
        (s.hint && !u.hint ? '<button class="btn btn-ghost" data-act="hint">💡 Подсказка</button>' : ''));
    }

    html += '</div>';
    paint(html, u.checked ? '.verdict h3' : null);
    if (!u.announced) {
      u.announced = true;
      announce('Врата ' + (S.step + 1) + ' от ' + list.length + '. ' + TYPE_LABEL[s.kind] + '.');
    }
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
          for (var t = 0; t < u.tokens.length; t++) if (u.tokens[t].idx === i) return t;
          return null;
        });
        break;
      case 'order': u.order = s.items.map(function (_, i) { return i; }); break;
      case 'tab': u.seq = s.correct.slice(); break;
      case 'tree': u.tree = { role: s.role.correct, name: s.name.correct, state: s.state.correct }; break;
    }
  }

  function renderTreasure(w) {
    var left = doorsLeft(w);
    if (left.length) {
      paint(
        '<div class="panel reveal">' +
          '<div class="head">' +
            '<p class="eyebrow">Край на коридора · ' + esc(w.name) + '</p>' +
            '<h2 tabindex="-1">Тук би трябвало да има ключ</h2>' +
          '</div>' +
          renderMap(w, steps(w)) +
          '<p class="lead">Нишата в стената е празна. Ключът се появява чак когато коридорът ' +
          'е извървян докрай — а зад теб ' + (left.length === 1 ? 'е останала една незатворена врата.'
            : 'са останали ' + left.length + ' незатворени врати.') + '</p>' +
          '<div class="row">' +
            '<button class="btn btn-primary" data-act="goto" data-i="' + firstOpenIndex(w) + '" data-primary="1">' +
              'Към първата незатворена врата</button>' +
            '<button class="btn btn-ghost" data-act="back">← Назад</button>' +
            '<button class="btn btn-ghost" data-act="hub">Обратно в залата</button>' +
          '</div>' +
        '</div>'
      );
      announce('Съкровищницата е празна. Остават ' + left.length + ' незатворени врати.');
      return;
    }
    if (!S.keys[w.id]) { S.keys[w.id] = true; save(); }
    paint(
      '<div class="panel secret reveal">' +
        '<div class="head">' +
          '<p class="eyebrow">Съкровищница · ' + esc(w.name) + '</p>' +
          '<h2 tabindex="-1">Ключът е твой</h2>' +
        '</div>' +
        renderMap(w, steps(w)) +
        '<p class="artifact" aria-hidden="true">🔑</p>' +
        '<p class="lead">Взимаш <b>' + esc(w.artifact) + '</b>. ' +
        (keyCount() === 4 ? 'Това беше четвъртият. Последната врата вече не е заключена.'
                          : 'Остават още ' + (4 - keyCount()) + '.') + '</p>' +
        '<div class="row"><button class="btn btn-primary" data-act="hub" data-primary="1">Обратно в залата</button>' +
        '<button class="btn btn-ghost" data-act="back">← Назад в крилото</button></div>' +
      '</div>'
    );
    announce('Получаваш ключ: ' + w.artifact + '. ' + keyCount() + ' от 4.');
  }

  function renderSecret() {
    var w = wingById(S.pendingSecret);
    var sec = w.secret;
    paint(
      '<div class="panel secret reveal">' +
        '<div class="head">' +
          '<p class="eyebrow">Скрита стая · ' + esc(w.name) + '</p>' +
          '<h2 tabindex="-1">💡 ' + esc(sec.title) + '</h2>' +
        '</div>' +
        '<p class="lead">' + esc(sec.text) + '</p>' +
        (sec.code ? '<pre class="code">' + esc(sec.code) + '</pre>' : '') +
        '<div class="row"><button class="btn btn-primary" data-act="secret-close" data-primary="1">Обратно в коридора</button></div>' +
      '</div>'
    );
    announce('Скрита стая. ' + sec.title);
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
    var h = '<div class="opts" role="group" aria-label="Възможни отговори">';
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
    var h = '<div class="lines" role="group" aria-label="Редове от кода — избери сгрешения">';
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
      '<label class="sr-only" for="fill">Попълни липсващото</label>' +
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
        (a !== null ? esc(u.tokens[a].txt) : '— пусни тук —') + '</button>' +
      '</div>';
    });
    h += '</div><div class="tray"><span class="tray-label">Парчета — кликни едно, после кликни мястото му</span>';
    u.tokens.forEach(function (t, i) {
      var used = u.assign.indexOf(i) !== -1;
      h += '<button id="token-' + i + '" class="token" data-act="token" data-i="' + i + '" ' +
        'draggable="' + (!used && !u.checked) + '" aria-pressed="' + (u.sel === i ? 'true' : 'false') + '"' +
        (used || u.checked ? ' disabled' : '') + '>' + esc(t.txt) + '</button>';
    });
    return h + '</div>';
  }

  function wOrder(s, u) {
    var h = '<div class="orderlist" role="group" aria-label="Подреди с бутоните нагоре и надолу">';
    u.order.forEach(function (it, pos) {
      var cls = 'orderitem';
      if (u.checked) cls += (it === pos ? ' good' : ' bad');
      h += '<div class="' + cls + '">' +
        '<span class="num" aria-hidden="true">' + (pos + 1) + '</span>' +
        '<span class="txt">' + esc(s.items[it]) + '</span>' +
        '<button id="up-' + pos + '" class="mini" data-act="up" data-i="' + pos + '" ' +
        'aria-label="Премести „' + esc(s.items[it]) + '“ нагоре"' +
        (pos === 0 || u.checked ? ' disabled' : '') + '>↑</button>' +
        '<button id="down-' + pos + '" class="mini" data-act="down" data-i="' + pos + '" ' +
        'aria-label="Премести „' + esc(s.items[it]) + '“ надолу"' +
        (pos === u.order.length - 1 || u.checked ? ' disabled' : '') + '>↓</button>' +
      '</div>';
    });
    return h + '</div>';
  }

  function wTab(s, u) {
    var h = '<div class="formsim" role="group" aria-label="Кликай полетата в реда на клавиша Tab">';
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
      h += '<div class="row"><button class="btn btn-ghost" data-act="tab-reset">Изчисти реда</button></div>';
    }
    return h;
  }

  function wTree(s, u) {
    var parts = [['role', 'Роля', s.role], ['name', 'Име', s.name], ['state', 'Състояние', s.state]];
    var h = '<div class="treegrid">';
    parts.forEach(function (p) {
      var key = p[0], got = u.checked ? (u.tree && u.tree[key]) : null;
      var cls = u.checked ? (got === p[2].correct ? 'good' : 'bad') : '';
      h += '<div><label for="tree-' + key + '">' + p[1] + '</label>' +
        '<select class="tree-sel ' + cls + '" id="tree-' + key + '"' + (u.checked ? ' disabled' : '') + '>' +
        '<option value="">— избери —</option>';
      p[2].options.forEach(function (o) {
        var sel = got === o ? ' selected' : '';
        h += '<option value="' + esc(o) + '"' + sel + '>' + esc(o) + '</option>';
      });
      h += '</select></div>';
    });
    return h + '</div>';
  }

  /* ───────────────────────── проверка ───────────────────────── */

  function norm(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/["'`=]/g, '').replace(/\s+/g, '');
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
        return u.assign.every(function (t, i) { return u.tokens[t].idx === i; });
      case 'order':
        return u.order.every(function (v, i) { return v === i; });
      case 'tab':
        if (u.seq.length !== s.fields.length) return null;
        return u.seq.every(function (v, i) { return v === s.correct[i]; });
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

  var GRADE_TXT = {
    first: 'Отвори я от първи опит.',
    hint: 'Отвори я с подсказка.',
    wrong: 'Отвори я след грешка.'
  };

  function verdict(s, u, w) {
    var h = '<div class="verdict ' + (u.review ? 'rev' : u.ok ? 'ok' : 'no') + '">' +
      '<h3 tabindex="-1">' + (u.review ? '🗝️ Тази врата вече е зад гърба ти'
        : u.ok ? '✅ Вратата се отваря' : '❌ Вратата не помръдва') + '</h3>' +
      (u.review ? '<p class="muted">' + GRADE_TXT[S.answered[s.id]] + ' Верният отговор е показан по-горе.</p>' : '') +
      '<p>' + esc(s.explain) + '</p>';
    if (S.mode === 'projector' && s.teach) {
      h += '<p class="teach"><b>Бележка за водещия</b>' + esc(s.teach) + '</p>';
    }
    h += '</div>';

    if (S.pendingSecret && !S.secrets[S.pendingSecret]) {
      h += '<button class="crack" data-act="secret">🕳️ Забелязваш пукнатина в стената…</button>';
    }
    h += navRow('<button class="btn btn-primary" data-act="next" data-primary="1">Напред →</button>' +
      (u.review ? '<button class="btn" data-act="retry">↻ Опитай наново</button>' : ''));
    if (u.review) h += '<p class="muted note">Записаният резултат остава първият — повтарянето е за упражнение.</p>';
    return h;
  }

  function check() {
    var w = wingById(S.wing);
    var s = steps(w)[S.step];
    var u = S.ui;
    var res = evaluate(s, u);

    if (res === null) { announce('Дай отговор, преди да опиташ вратата.'); return; }

    if (res) {
      u.checked = true; u.ok = true;
      var grade = u.tries === 0 ? (u.hint ? 'hint' : 'first') : 'wrong';
      if (!S.answered[s.id]) {
        S.answered[s.id] = grade;
        if (grade === 'first' && !S.secrets[w.id]) S.pendingSecret = w.id;
      }
      announce('Вярно. ' + s.explain);
    } else {
      u.tries++;
      if (u.tries >= 2) {
        u.checked = true; u.ok = false;
        if (!S.answered[s.id]) S.answered[s.id] = 'wrong';
        announce('Грешно. Вратата се отваря така или иначе. ' + s.explain);
      } else {
        u.hint = true;
        announce('Не още. Ето подсказка: ' + (s.hint || ''));
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

    if (b.phase === 'intro') {
      paint(
        '<div class="panel boss-stage reveal">' +
          '<div class="head"><p class="eyebrow">Последната стая</p>' +
          '<h2 tabindex="-1">🔊 Четецът</h2></div>' +
          '<p class="lead">' + nl2br(G.boss.intro) + '</p>' +
          '<div class="row"><button class="btn btn-primary" data-act="boss-begin" data-primary="1">Влез в тъмното</button>' +
          '<button class="btn btn-ghost" data-act="hub">Не още</button></div>' +
        '</div>'
      );
      return;
    }

    if (b.phase === 'done') {
      var st0 = G.boss.stages[b.stage];
      paint(
        '<div class="panel boss-stage reveal">' +
          '<div class="head"><p class="eyebrow">' + esc(st0.title) + '</p>' +
          '<h2 tabindex="-1">Пет секунди</h2></div>' +
          '<p class="lead">Същата задача. Същият човек. Разликата е в разметката.</p>' +
          '<pre class="code">' + esc(st0.fix) + '</pre>' +
          '<div class="row"><button class="btn btn-primary" data-act="boss-next" data-primary="1">' +
          (b.stage + 1 < G.boss.stages.length ? 'Следващ етап →' : 'Излез на светло') + '</button></div>' +
        '</div>'
      );
      return;
    }

    var st = G.boss.stages[b.stage];

    if (b.phase === 'lesson') {
      paint(
        '<div class="panel boss-stage reveal">' +
          '<div class="head"><p class="eyebrow">' + esc(st.title) + '</p>' +
          '<h2 tabindex="-1">Ето защо</h2></div>' +
          '<div class="boss-lesson"><h3>Какво се случи</h3><p>' + esc(st.lesson) + '</p></div>' +
          '<div class="row"><button class="btn btn-primary" data-act="boss-fix" data-primary="1">Поправи страницата</button></div>' +
        '</div>'
      );
      return;
    }

    var broken = b.phase === 'broken';
    var items = broken ? st.items : st.fixedItems;
    var task = broken ? st.task : st.fixedTask;

    var h = '<div class="panel boss-stage">' +
      '<div class="head"><p class="eyebrow">' + esc(st.title) + ' · етап ' + (b.stage + 1) + ' от ' + G.boss.stages.length + '</p>' +
      '<h2 tabindex="-1" class="boss-task">' + esc(task) + '</h2></div>' +
      '<div class="log" aria-hidden="true">';
    if (!S.boss.log.length) bossLog('Екранът е тъмен. Движи се с Tab, задействай с Enter.', 'sys');
    S.boss.log.forEach(function (l) {
      h += '<p class="' + l.c + '">' + esc(l.t) + '</p>';
    });
    h += '</div><div class="blocks">';
    items.forEach(function (it, i) {
      h += '<button id="blk-' + i + '" class="blk" data-act="blk" data-i="' + i + '">' +
        '<span class="shape" aria-hidden="true">▮▮▮▮▮▮▮▮▮▮▮▮</span>' +
        '<span class="sr-only">' + esc(it.say) + '</span></button>';
    });
    h += '</div><div class="row"><button class="btn btn-ghost" data-act="hub">Излез от подземието</button></div></div>';

    paint(h);
  }

  function bossActivate(i) {
    var b = S.boss;
    var st = G.boss.stages[b.stage];
    var broken = b.phase === 'broken';
    var it = (broken ? st.items : st.fixedItems)[i];

    if (it.goal) {
      if (broken) {
        bossLog('✓ Намери го. Но мина през всичко останало, за да стигнеш дотук.', 'good');
        b.phase = 'lesson';
      } else {
        if (it.onGoal) bossLog('🔊 ' + it.onGoal, 'good');
        bossLog('✓ Готово. Отне пет секунди.', 'good');
        b.phase = 'done';
      }
      save(); render();
      announce(broken ? 'Намери целта.' : 'Готово за пет секунди.');
      return;
    }

    b.tries++;
    S.ui.focusId = 'blk-' + i;
    bossLog('✗ ' + (st.wrongMsg || 'Нищо не се случва.'), 'bad');
    var max = st.unknowable ? 2 : 6;
    if (b.tries >= max) { b.phase = 'lesson'; b.tries = 0; }
    save(); render();
  }

  function renderEnd() {
    var first = 0, hinted = 0, wrong = 0;
    Object.keys(S.answered).forEach(function (k) {
      var v = S.answered[k];
      if (v === 'first') first++; else if (v === 'hint') hinted++; else wrong++;
    });
    var total = first + hinted + wrong;
    var ratio = total ? first / total : 0;
    var rank = ratio === 1 ? '🏅 Майстор архитект'
      : ratio >= 0.8 ? '🥈 Старши строител'
      : ratio >= 0.55 ? '🥉 Чирак'
      : '🧱 Зидар';
    var secrets = Object.keys(S.secrets).length;

    paint(
      '<div class="panel reveal">' +
        '<div class="head"><p class="eyebrow">Излезе на светло</p>' +
        '<h2 tabindex="-1">Осем атрибута</h2></div>' +
        '<p class="lead">' + nl2br(G.boss.outro) + '</p>' +
        '<hr class="divider">' +
        '<p class="rank">' + rank + '</p>' +
        '<div class="score">' +
          tile(total, 'отворени врати') +
          tile(first, 'от първи опит') +
          tile(hinted, 'с подсказка') +
          tile(secrets + ' / 4', 'тайни стаи') +
        '</div>' +
        '<p class="muted">Трите въпроса, с които излизаш: <b>Какво е това?</b> (роля) · ' +
        '<b>Как се казва?</b> (име) · <b>В какво състояние е?</b> (състояние)</p>' +
        '<div class="row">' +
          '<button class="btn btn-primary" data-act="hub" data-primary="1">Обратно в залата</button>' +
          '<button class="btn btn-ghost" data-act="restart">Започни отначало</button>' +
        '</div>' +
      '</div>'
    );
    announce('Край. ' + rank + '. ' + first + ' от ' + total + ' врати от първи опит.');
  }
  function tile(n, l) {
    return '<div class="scoretile"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>';
  }

  /* ───────────────────────── действия ───────────────────────── */

  function handle(act, ds, node) {
    var u = S.ui;
    var i = ds.i !== undefined ? parseInt(ds.i, 10) : null;

    switch (act) {
      case 'start':
        S.route = ds.route; S.screen = 'hub'; save(); return render();
      case 'resume':
        var d = loadSave(); if (d) { S = d; S.screen = 'hub'; } return render();
      case 'restart':
        wipe(); var m = S.mode; S = fresh(); S.mode = m; return render();
      case 'hub':
        S.screen = 'hub'; S.ui = {}; save(); return render();
      case 'wing':
        S.wing = ds.id; S.step = 0; S.screen = 'wing'; S.ui = {}; save(); return render();
      case 'next':
        S.step++; S.ui = {}; save(); return render();
      case 'back':
        if (S.step > 0) S.step--; S.ui = {}; save(); return render();
      case 'goto': {
        var gw = wingById(S.wing), glist = steps(gw);
        S.step = (i >= glist.length && !wingDone(gw)) ? glist.length - 1 : i;
        S.ui = {}; save(); return render();
      }
      case 'retry':
        S.ui = { doorId: null, replay: true }; return render();
      case 'check': return check();
      case 'hint': u.hint = true; return render();

      case 'opt': u.pick = i; S.ui.focusId = 'opt-' + i; return render();
      case 'token':
        u.sel = (u.sel === i ? null : i); S.ui.focusId = 'token-' + i; return render();
      case 'slot':
        if (u.sel !== null && u.sel !== undefined) { u.assign[i] = u.sel; u.sel = null; }
        else if (u.assign[i] !== null) { u.assign[i] = null; }
        S.ui.focusId = 'slot-' + i; return render();
      case 'up':
        swap(u.order, i, i - 1); S.ui.focusId = 'up-' + (i - 1); return render();
      case 'down':
        swap(u.order, i, i + 1); S.ui.focusId = 'down-' + (i + 1); return render();
      case 'field':
        var at = u.seq.indexOf(i);
        if (at !== -1) u.seq.splice(at, 1); else u.seq.push(i);
        S.ui.focusId = 'field-' + i; return render();
      case 'tab-reset': u.seq = []; return render();

      case 'secret': S.screen = 'secret'; return render();
      case 'secret-close':
        S.secrets[S.pendingSecret] = true; S.pendingSecret = null;
        S.screen = 'wing'; save(); return render();

      case 'boss':
        S.screen = 'boss'; S.boss = { stage: 0, phase: 'intro', tries: 0, log: [] }; return render();
      case 'boss-begin':
        S.boss.phase = 'broken'; S.boss.log = []; return render();
      case 'boss-fix':
        S.boss.phase = 'fixed'; S.boss.tries = 0; S.boss.log = []; return render();
      case 'boss-next':
        if (S.boss.stage + 1 < G.boss.stages.length) {
          S.boss.stage++; S.boss.phase = 'broken'; S.boss.tries = 0; S.boss.log = [];
        } else { S.screen = 'end'; }
        save(); return render();
      case 'blk': return bossActivate(i);
    }
  }
  function swap(a, i, j) { var t = a[i]; a[i] = a[j]; a[j] = t; }

  /* ───────────────────────── вход ───────────────────────── */

  stage.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    handle(b.dataset.act, b.dataset, b);
  });

  /* фокусът върху блок в стаята на боса „изговаря“ какво има там */
  stage.addEventListener('focusin', function (e) {
    var b = e.target.closest('.blk');
    if (!b || S.screen !== 'boss') return;
    var st = G.boss.stages[S.boss.stage];
    var items = S.boss.phase === 'broken' ? st.items : st.fixedItems;
    var it = items[parseInt(b.dataset.i, 10)];
    if (!it) return;
    b.classList.add('lit');
    var logEl = stage.querySelector('.log');
    if (!logEl) return;
    var p = document.createElement('p');
    p.textContent = '🔊 ' + it.say;
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
    S.boss.log.push({ t: '🔊 ' + it.say, c: '' });
    if (S.boss.log.length > 40) S.boss.log.shift();
  });

  /* drag & drop за свързването — клавиатурният път (клик → клик) остава водещ */
  stage.addEventListener('dragstart', function (e) {
    var t = e.target.closest('.token');
    if (!t || t.disabled) return;
    e.dataTransfer.setData('text/plain', t.dataset.i);
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

  modebtn.addEventListener('click', toggleMode);
  function toggleMode() {
    S.mode = S.mode === 'solo' ? 'projector' : 'solo';
    paintChrome();
    render();
    announce('Режим: ' + (S.mode === 'projector' ? 'проектор' : 'соло'));
  }

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === 'Escape' && S.screen !== 'title') {
      e.preventDefault(); return handle('hub', {});
    }
    if (typing) {
      if (e.key === 'Enter' && S.screen === 'wing') { e.preventDefault(); check(); }
      return;
    }

    if (e.code === 'KeyP') { e.preventDefault(); return toggleMode(); }
    if (e.code === 'KeyR') {
      e.preventDefault();
      if (confirm('Да започнем ли отначало? Прогресът се изтрива.')) handle('restart', {});
      return;
    }
    if (e.code === 'KeyH') {
      var hb = stage.querySelector('[data-act="hint"]');
      if (hb) { e.preventDefault(); hb.click(); }
      return;
    }
    var onChrome = (t === document.body || t === stage || t.tagName === 'H2');
    if (e.key === 'ArrowLeft' && onChrome) {
      var bb = stage.querySelector('[data-act="back"]');
      if (bb) { e.preventDefault(); bb.click(); }
      return;
    }
    if ((e.key === 'ArrowRight' && onChrome) || (e.key === 'Enter' && t === document.body)) {
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
  render();
})();
