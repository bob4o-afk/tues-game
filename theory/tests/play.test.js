/* Пълно преиграване: всяка врата, всеки тип, босът, финалът. */

const { test } = require('node:test');
const assert = require('node:assert');
const { load, answer, clearWing, clearBoss } = require('./helpers');

test('играта се преиграва докрай по пълния маршрут', () => {
  const ctx = load();
  const { $, $$, click, txt, G } = ctx;

  click('[data-act="start"][data-route="full"]');
  assert.ok(txt().includes('Валидаторът'), 'не се стигна до централната зала');

  for (const w of G.wings) clearWing(ctx, w);

  assert.equal($$('#keyring .keyslot.has').length, 4, 'четирите ключа не са на колана');
  assert.ok(!$('[data-act="boss"]').disabled, 'босът остана заключен с четири ключа');

  clearBoss(ctx);
  assert.ok(txt().includes('Осем атрибута'), 'няма финален екран');
  assert.deepEqual(ctx.errors, [], 'страницата е хвърлила грешка');
});

test('всичките осем типа врати се решават', () => {
  const ctx = load();
  const { click, G } = ctx;
  const seen = new Set();

  click('[data-act="start"][data-route="full"]');
  for (const w of G.wings) {
    for (const s of w.steps.filter(x => x.t === 'door')) seen.add(s.kind);
    clearWing(ctx, w);
  }

  assert.deepEqual([...seen].sort(),
    ['choice', 'fill', 'fix', 'match', 'order', 'sr', 'tab', 'tree'],
    'не всички типове врати се срещат в играта');
});

test('краткият маршрут също стига до четирите ключа', () => {
  const ctx = load();
  const { $$, click, G } = ctx;

  click('[data-act="start"][data-route="short"]');
  for (const w of G.wings) {
    click(`[data-act="wing"][data-id="${w.id}"]`);
    for (const s of w.steps) {
      if (s.t === 'room') { click('[data-act="next"]'); continue; }
      if (!s.core) continue;                     // краткият маршрут ги пропуска
      answer(ctx, s);
      click('[data-act="check"]');
      if ($$('[data-act="secret"]').length) { click('[data-act="secret"]'); click('[data-act="secret-close"]'); }
      click('[data-act="next"]');
    }
    click('[data-act="hub"]');
  }
  assert.equal($$('#keyring .keyslot.has').length, 4, 'краткият маршрут не раздаде четирите ключа');
});

test('грешният отговор дава подсказка, после обяснение, и не блокира', () => {
  const ctx = load();
  const { $, doc, click, G } = ctx;

  click('[data-act="start"][data-route="short"]');
  click('[data-act="wing"][data-id="basics"]');
  click('[data-act="next"]');

  const door = G.wings[0].steps.find(s => s.t === 'door' && s.core);
  const wrong = door.correct === 0 ? 1 : 0;

  doc.querySelector(`[data-act="opt"][data-i="${wrong}"]`).click();
  click('[data-act="check"]');
  assert.ok($('.hintbox'), 'първата грешка не даде подсказка');
  assert.ok(!$('.verdict'), 'първата грешка не бива да отваря вратата веднага');

  doc.querySelector(`[data-act="opt"][data-i="${wrong}"]`).click();
  click('[data-act="check"]');
  assert.ok($('.verdict.no'), 'втората грешка не показа обяснението');
  assert.ok($('[data-act="next"]'), 'играчът е заседнал след две грешки');
});
