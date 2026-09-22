/* Стаята на боса: само клавиатура на компютър, отказ на телефон. */

const { test } = require('node:test');
const assert = require('node:assert');
const { load, clearWing } = require('./helpers');

function toBoss(ctx) {
  ctx.click('[data-act="start"][data-route="full"]');
  for (const w of ctx.G.wings) clearWing(ctx, w);
  ctx.click('[data-act="boss"]');
}

/* истински клик с мишката — detail 1; Enter върху бутон дава detail 0 */
function mouse(ctx, sel) {
  const el = ctx.$(sel);
  const w = ctx.dom.window;
  const down = new w.MouseEvent('mousedown', { bubbles: true, cancelable: true, detail: 1 });
  el.dispatchEvent(down);
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
  return down;
}

test('в стаята на боса мишката не прави нищо, клавиатурата — да', () => {
  const ctx = load();
  toBoss(ctx);
  assert.ok(ctx.doc.body.classList.contains('kbd-only'), 'стаята не е маркирана като само за клавиатура');
  assert.ok(ctx.txt().includes(ctx.T['boss.kbdOnly']), 'няма бележка, че мишката не работи');

  mouse(ctx, '[data-act="boss-begin"]');
  assert.ok(ctx.$('[data-act="boss-begin"]'), 'кликът с мишката все пак влезе в тъмното');

  ctx.click('[data-act="boss-begin"]');               // Enter → detail 0
  const st = ctx.G.boss.stages[0];
  const goal = st.items.findIndex(x => x.goal);
  const sel = `#blk-${goal !== -1 ? goal : 0}`;
  const down = mouse(ctx, sel);
  assert.ok(down.defaultPrevented, 'натискането с мишката слага фокус върху блока');
  assert.ok(!ctx.$('[data-act="boss-fix"]'), 'кликът с мишката задейства блок');

  ctx.click('[data-act="hub"]');
  assert.ok(!ctx.doc.body.classList.contains('kbd-only'), 'мишката остана изключена и извън стаята');
  mouse(ctx, '[data-act="boss"]');
  assert.ok(ctx.$('[data-act="boss-begin"]'), 'мишката не работи в централната зала');
  assert.deepEqual(ctx.errors, []);
});

test('на телефон стаята на боса казва, че не може, и връща в залата', () => {
  for (const lang of ['bg', 'en', 'fr']) {
    const ctx = load(lang);
    ctx.dom.window.matchMedia = q => ({ matches: q === '(hover:none) and (pointer:coarse)' });
    toBoss(ctx);
    assert.ok(ctx.txt().includes(ctx.T['boss.phoneH2']), lang + ': няма съобщение за телефон');
    assert.ok(!ctx.$('[data-act="boss-begin"]'), lang + ': на телефон все пак може да се влезе');
    assert.ok(!ctx.doc.body.classList.contains('kbd-only'), lang + ': докосването е изключено');
    mouse(ctx, '[data-act="hub"]');                     // докосване
    assert.ok(ctx.txt().includes(ctx.T['hub.h2']), lang + ': бутонът към залата не работи с докосване');
  }
});
