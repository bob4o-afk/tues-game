/* Движението из крилото и правилото, че ключът се дава само в края. */

const { test } = require('node:test');
const assert = require('node:assert');
const { load, answer } = require('./helpers');

function openWing(id = 'basics') {
  const ctx = load();
  ctx.click('[data-act="start"][data-route="full"]');
  ctx.click(`[data-act="wing"][data-id="${id}"]`);
  ctx.wing = ctx.G.wings.find(w => w.id === id);
  ctx.steps = ctx.wing.steps;
  return ctx;
}

test('картата показва по една точка за всяка стъпка', () => {
  const ctx = openWing();
  assert.equal(ctx.$$('.mapdot').length, ctx.steps.length + 1,
    'очакваме точка за всяка стъпка плюс съкровищницата');
  assert.ok(ctx.$('.mapdot[aria-current="step"]'), 'текущата стъпка не е отбелязана');
});

test('картата скача до произволна стъпка в двете посоки', () => {
  const ctx = openWing();
  const last = ctx.steps.length - 1;
  ctx.click(`[data-act="goto"][data-i="${last}"]`);
  assert.equal(ctx.$$('.mapdot')[last].getAttribute('aria-current'), 'step');
  ctx.click('[data-act="goto"][data-i="0"]');
  assert.ok(ctx.txt().includes(ctx.steps[0].title), 'скокът назад не се получи');
});

test('Назад връща и отваря вече отговорена врата в режим преглед', () => {
  const ctx = openWing();
  const { $, $$, click } = ctx;
  click('[data-act="next"]');
  const door = ctx.steps[1];
  answer(ctx, door);
  click('[data-act="check"]');
  click('[data-act="next"]');

  assert.ok($('[data-act="back"]'), 'няма бутон Назад');
  click('[data-act="back"]');
  assert.ok($('.verdict.rev'), 'отговорената врата не се отвори в режим преглед');
  assert.ok($$('.opt')[door.correct].classList.contains('good'), 'верният отговор не е показан');
  assert.ok($$('.opt').every(o => o.disabled), 'отговорите в преглед не са заключени');
});

test('повторният опит не разваля вече записания резултат', () => {
  const ctx = openWing();
  const { $, doc, click } = ctx;
  click('[data-act="next"]');
  const door = ctx.steps[1];
  answer(ctx, door);
  click('[data-act="check"]');
  click('[data-act="next"]');
  click('[data-act="back"]');

  click('[data-act="retry"]');
  assert.ok(!$('.verdict'), 'повторният опит не изчисти резултата');

  const wrong = door.correct === 0 ? 1 : 0;
  doc.querySelector(`[data-act="opt"][data-i="${wrong}"]`).click();
  click('[data-act="check"]');
  doc.querySelector(`[data-act="opt"][data-i="${wrong}"]`).click();
  click('[data-act="check"]');

  click('[data-act="back"]');
  click('[data-act="goto"][data-i="1"]');
  assert.match($('.verdict.rev').textContent, /от първи опит/,
    'грешният повторен опит е презаписал първия резултат');
});

test('ключът не се вижда и не се стига, докато има незатворена врата', () => {
  const ctx = openWing();
  const { $, $$, click, txt } = ctx;

  assert.ok(!$('.mapdot.end:not(.locked)'), 'ключът се вижда преди края на коридора');
  assert.ok(!$('.mapdot.end[data-act]'), 'заключената точка е кликаема');

  const last = ctx.steps.length - 1;
  click(`[data-act="goto"][data-i="${last}"]`);
  answer(ctx, ctx.steps[last]);
  click('[data-act="check"]');
  if ($('[data-act="secret"]')) { click('[data-act="secret"]'); click('[data-act="secret-close"]'); }
  click('[data-act="next"]');

  assert.ok(!txt().includes('Ключът е твой'), 'краят на коридора раздаде ключ предсрочно');
  assert.match(txt(), /Тук би трябвало да има ключ/, 'няма обяснение защо нишата е празна');
  assert.ok($('[data-act="goto"]'), 'няма път обратно към незатворената врата');
  assert.equal($$('#keyring .keyslot.has').length, 0, 'ключ се е появил на колана предсрочно');
});

test('ключът се появява чак след последната затворена врата', () => {
  const ctx = openWing();
  const { $, $$, click, txt } = ctx;

  ctx.steps.forEach((s, i) => {
    if (s.t !== 'door') return;
    click(`[data-act="goto"][data-i="${i}"]`);
    if ($('.verdict')) return;
    answer(ctx, s);
    click('[data-act="check"]');
    if ($('[data-act="secret"]')) { click('[data-act="secret"]'); click('[data-act="secret-close"]'); }
  });

  assert.ok($('.mapdot.end:not(.locked)'), 'ключът не се появи след последната врата');
  click('.mapdot.end');
  assert.match(txt(), /Ключът е твой/, 'съкровищницата не се отвори');
  assert.equal($$('#keyring .keyslot.has').length, 1, 'ключът не влезе на колана');
});

test('състоянието на всяка точка се чете и без цвят', () => {
  const ctx = openWing();
  ctx.click('[data-act="next"]');
  answer(ctx, ctx.steps[1]);
  ctx.click('[data-act="check"]');

  const labels = ctx.$$('.mapdot[data-act]').map(d => d.getAttribute('aria-label'));
  assert.ok(labels.some(l => /отворена от първи опит/.test(l)), 'няма състояние „отворена“');
  assert.ok(labels.some(l => /още заключена/.test(l)), 'няма състояние „заключена“');
  assert.ok(labels.every(l => l && l.length > 3), 'кликаема точка без достъпно име');

  // заключената съкровищница е скрита от четеца, но обяснението до нея не е
  const locked = ctx.$('.mapdot.end.locked');
  assert.equal(locked.getAttribute('aria-hidden'), 'true', 'декоративната точка не е скрита от четеца');
  assert.match(ctx.$('.map .sr-only').textContent, /след като са отворени всички врати/,
    'няма обяснение за четеца защо съкровищницата е заключена');
});
