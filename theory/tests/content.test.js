/* Съдържанието в data.js: всеки въпрос трябва да е попълнен и решим. */

const { test } = require('node:test');
const assert = require('node:assert');

global.window = {};
require('../data.js');
const G = global.window.GAME;

test('всяко крило е попълнено', () => {
  assert.equal(G.wings.length, 4, 'очакваме четири крила');
  for (const w of G.wings) {
    assert.ok(w.id && w.name && w.artifact && w.blurb, `${w.id}: липсва поле`);
    assert.ok(w.secret && w.secret.title && w.secret.text, `${w.id}: празна скрита стая`);
  }
});

test('всяка врата има уникално id, въпрос, подсказка и обяснение', () => {
  const ids = new Set();
  for (const w of G.wings) {
    for (const s of w.steps.filter(x => x.t === 'door')) {
      assert.ok(!ids.has(s.id), `${s.id}: повтарящо се id`);
      ids.add(s.id);
      assert.ok(s.q, `${s.id}: няма въпрос`);
      assert.ok(s.hint, `${s.id}: няма подсказка`);
      assert.ok(s.explain, `${s.id}: няма обяснение`);
    }
  }
  assert.ok(ids.size >= 30, `очакваме поне 30 врати, има ${ids.size}`);
});

test('всяка стая има заглавие и увод', () => {
  for (const w of G.wings) {
    for (const s of w.steps.filter(x => x.t === 'room')) {
      assert.ok(s.title && s.lead, `${w.id}: стая без заглавие или увод`);
    }
  }
});

test('верният отговор на всяка врата съществува', () => {
  for (const w of G.wings) {
    for (const s of w.steps.filter(x => x.t === 'door')) {
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
          assert.ok(s.before !== undefined && s.after !== undefined, `${s.id}: няма контекст около полето`);
          break;
        case 'match':
          assert.ok(s.pairs.length >= 3, `${s.id}: по-малко от 3 двойки`);
          assert.equal(new Set(s.pairs.map(p => p[1])).size, s.pairs.length,
            `${s.id}: две двойки имат еднакъв отговор — задачата е двусмислена`);
          break;
        case 'order':
          assert.ok(s.items.length >= 3, `${s.id}: по-малко от 3 елемента`);
          break;
        case 'tab':
          assert.equal(s.fields.length, s.correct.length, `${s.id}: броят полета не съвпада с реда`);
          assert.deepEqual([...s.correct].sort((a, b) => a - b), s.fields.map((_, i) => i),
            `${s.id}: редът не е пермутация на полетата`);
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
  }
});

test('краткият маршрут покрива всяко крило', () => {
  for (const w of G.wings) {
    const core = w.steps.filter(s => s.t === 'door' && s.core).length;
    assert.ok(core >= 3, `${w.id}: само ${core} въпроса в краткия маршрут`);
  }
});

test('босът има цел и поука на всеки етап', () => {
  assert.ok(G.boss.stages.length >= 4, 'очакваме поне 4 етапа');
  G.boss.stages.forEach((st, i) => {
    const n = `бос, етап ${i + 1}`;
    assert.ok(st.task && st.lesson && st.fixedTask && st.fix, `${n}: липсва поле`);
    assert.ok(st.fixedItems.some(x => x.goal), `${n}: поправената страница няма цел`);
    if (!st.unknowable) assert.ok(st.items.some(x => x.goal), `${n}: счупената страница няма цел`);
    if (st.unknowable) assert.ok(st.wrongMsg, `${n}: етап без цел трябва да има отговор при грешка`);
  });
});
