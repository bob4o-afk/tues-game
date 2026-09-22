/* Съдържанието на трите езика: всеки въпрос трябва да е попълнен, решим
   и структурно еднакъв с останалите езици — прогресът се дели между тях. */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'icons.js'));
require(path.join(ROOT, 'i18n.js'));
['bg', 'en', 'fr'].forEach(function (l) { require(path.join(ROOT, 'content.' + l + '.js')); });

const LANGS = global.window.LANGS.map(l => l.code);
const I18N = global.window.I18N;
const ICONS = global.window.ICONS;
const CONTENT = global.window.CONTENT;

function doors(c) {
  return c.wings.reduce((a, w) => a.concat(w.steps.filter(s => s.t === 'door')), []);
}

test('и трите езика имат съдържание', () => {
  assert.deepEqual(LANGS, ['bg', 'en', 'fr']);
  for (const l of LANGS) assert.ok(CONTENT[l], `липсва content.${l}.js`);
});

for (const lang of LANGS) {
  const c = CONTENT[lang];

  test(`${lang}: всяко крило е попълнено`, () => {
    assert.equal(c.wings.length, 4, 'очакваме четири крила');
    for (const w of c.wings) {
      assert.ok(w.id && w.name && w.artifact && w.blurb, `${w.id}: липсва поле`);
      assert.ok(w.secret && w.secret.title && w.secret.text, `${w.id}: празна скрита стая`);
      assert.ok(ICONS.wings[w.id], `${w.id}: няма икона в icons.js`);
    }
  });

  test(`${lang}: всяка врата има въпрос, подсказка и обяснение`, () => {
    const ids = new Set();
    for (const s of doors(c)) {
      assert.ok(!ids.has(s.id), `${s.id}: повтарящо се id`);
      ids.add(s.id);
      assert.ok(s.q, `${s.id}: няма въпрос`);
      assert.ok(s.hint, `${s.id}: няма подсказка`);
      assert.ok(s.explain, `${s.id}: няма обяснение`);
    }
    assert.ok(ids.size >= 30, `очакваме поне 30 врати, има ${ids.size}`);
  });

  test(`${lang}: всяка стая има заглавие и увод`, () => {
    for (const w of c.wings) {
      for (const s of w.steps.filter(x => x.t === 'room')) {
        assert.ok(s.title && s.lead, `${w.id}: стая без заглавие или увод`);
      }
    }
  });

  test(`${lang}: верният отговор на всяка врата съществува`, () => {
    for (const s of doors(c)) {
      switch (s.kind) {
        case 'choice': case 'sr':
          assert.ok(s.options.length >= 3, `${s.id}: по-малко от 3 опции`);
          assert.notEqual(s.options[s.correct], undefined, `${s.id}: correct е извън опциите`);
          break;
        case 'fix':
          assert.ok(s.lines.length >= 2, `${s.id}: по-малко от 2 реда`);
          assert.notEqual(s.lines[s.correct], undefined, `${s.id}: correct е извън редовете`);
          break;
        case 'fill':
          assert.ok(s.accept && s.accept.length, `${s.id}: няма приеман отговор`);
          assert.ok(s.before !== undefined && s.after !== undefined, `${s.id}: няма контекст`);
          break;
        case 'match':
          assert.ok(s.pairs.length >= 3, `${s.id}: по-малко от 3 двойки`);
          assert.equal(new Set(s.pairs.map(p => p[1])).size, s.pairs.length,
            `${s.id}: две двойки с еднакъв отговор — задачата е двусмислена`);
          break;
        case 'order':
          assert.ok(s.items.length >= 3, `${s.id}: по-малко от 3 елемента`);
          break;
        case 'tab':
          assert.equal(s.fields.length, s.correct.length, `${s.id}: броят полета не съвпада`);
          assert.deepEqual([...s.correct].sort((a, b) => a - b), s.fields.map((_, i) => i),
            `${s.id}: редът не е пермутация`);
          break;
        case 'tree':
          for (const k of ['role', 'name', 'state']) {
            assert.ok(s[k].options.includes(s[k].correct), `${s.id}: ${k}.correct липсва в опциите`);
          }
          break;
        default:
          assert.fail(`${s.id}: непознат тип „${s.kind}“`);
      }
    }
  });

  test(`${lang}: краткият маршрут покрива всяко крило`, () => {
    for (const w of c.wings) {
      const core = w.steps.filter(s => s.t === 'door' && s.core).length;
      assert.ok(core >= 3, `${w.id}: само ${core} въпроса в краткия маршрут`);
    }
  });

  test(`${lang}: босът има цел и поука на всеки етап`, () => {
    assert.ok(c.boss.intro && c.boss.outro, 'липсва увод или финал');
    assert.ok(c.boss.stages.length >= 4, 'очакваме поне 4 етапа');
    c.boss.stages.forEach((st, i) => {
      const n = `${lang}, бос, етап ${i + 1}`;
      assert.ok(st.task && st.lesson && st.fixedTask && st.fix, `${n}: липсва поле`);
      assert.ok(st.fixedItems.some(x => x.goal), `${n}: поправената страница няма цел`);
      if (!st.unknowable) assert.ok(st.items.some(x => x.goal), `${n}: счупената страница няма цел`);
      if (st.unknowable) assert.ok(st.wrongMsg, `${n}: етап без цел трябва да има отговор при грешка`);
    });
  });

  test(`${lang}: интерфейсът е преведен изцяло`, () => {
    const base = Object.keys(I18N.bg);
    const mine = I18N[lang];
    assert.ok(mine, `няма речник за ${lang}`);
    const missing = base.filter(k => mine[k] === undefined);
    assert.deepEqual(missing, [], `непреведени ключове: ${missing.join(', ')}`);
    const extra = Object.keys(mine).filter(k => I18N.bg[k] === undefined);
    assert.deepEqual(extra, [], `ключове, които ги няма в българския: ${extra.join(', ')}`);
  });
}

test('преводите съвпадат структурно с българското съдържание', () => {
  const base = doors(CONTENT.bg);
  for (const lang of LANGS.filter(l => l !== 'bg')) {
    const mine = doors(CONTENT[lang]);
    assert.equal(mine.length, base.length, `${lang}: различен брой врати`);

    base.forEach((b, i) => {
      const m = mine[i];
      const at = `${lang}/${b.id}`;
      assert.equal(m.id, b.id, `${at}: разместени id-та — прогресът няма да се пренесе`);
      assert.equal(m.kind, b.kind, `${at}: различен тип`);
      assert.equal(!!m.core, !!b.core, `${at}: различен краткия маршрут`);
      if ('correct' in b && !Array.isArray(b.correct)) {
        assert.equal(m.correct, b.correct, `${at}: верният отговор е на друга позиция`);
      }
      if (Array.isArray(b.correct)) {
        assert.deepEqual(m.correct, b.correct, `${at}: различен ред`);
      }
      if (b.options) assert.equal(m.options.length, b.options.length, `${at}: различен брой опции`);
      if (b.pairs) assert.equal(m.pairs.length, b.pairs.length, `${at}: различен брой двойки`);
      if (b.items) assert.equal(m.items.length, b.items.length, `${at}: различен брой елементи`);
      if (b.fields) assert.equal(m.fields.length, b.fields.length, `${at}: различен брой полета`);
      if (b.lines) assert.equal(m.lines.length, b.lines.length, `${at}: различен брой редове`);
    });

    const bw = CONTENT.bg.wings.map(w => w.id);
    assert.deepEqual(CONTENT[lang].wings.map(w => w.id), bw, `${lang}: различни крила`);
    assert.equal(CONTENT[lang].boss.stages.length, CONTENT.bg.boss.stages.length,
      `${lang}: различен брой етапи на боса`);
  }
});

test('съдържанието не носи икони — те са в icons.js', () => {
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  for (const lang of LANGS) {
    const src = fs.readFileSync(path.join(ROOT, 'content.' + lang + '.js'), 'utf8');
    src.split('\n').forEach((line, i) => {
      // в примерния код емоджи е част от урока (бутон с иконка) — там е позволено
      if (/code:|lines:|say:|fix:|text:|before:|after:/.test(line)) return;
      assert.ok(!emoji.test(line), `content.${lang}.js:${i + 1} носи икона: ${line.trim().slice(0, 60)}`);
    });
  }
});
