/* Играта трябва да се преиграва докрай на всеки от трите езика,
   а прогресът да се пренася при смяна на езика. */

const { test } = require('node:test');
const assert = require('node:assert');
const { load, clearWing, clearBoss, answer } = require('./helpers');

const LANGS = ['bg', 'en', 'fr'];

for (const lang of LANGS) {
  test(`${lang}: играта се преиграва докрай`, () => {
    const ctx = load(lang);
    assert.equal(ctx.doc.documentElement.lang, lang, 'атрибутът lang не е сменен');
    assert.ok(ctx.txt().includes(ctx.T['title.h2']), 'началният екран не е на този език');

    ctx.click('[data-act="start"][data-route="full"]');
    for (const w of ctx.G.wings) clearWing(ctx, w);
    assert.equal(ctx.$$('#keyring .keyslot.has').length, 4, 'четирите ключа не са събрани');
    clearBoss(ctx);
    assert.ok(ctx.txt().includes(ctx.T['end.h2']), 'няма финален екран');
    assert.deepEqual(ctx.errors, [], 'страницата е хвърлила грешка');
  });
}

test('превключвателят сменя езика и пази прогреса', () => {
  const ctx = load('bg');
  const { $, $$, click } = ctx;

  assert.equal($$('.langbtn').length, 3, 'няма бутон за всеки език');
  assert.equal($('.langbtn[aria-pressed="true"]').dataset.lang, 'bg', 'текущият език не е отбелязан');

  // отговаряме на една врата на български
  click('[data-act="start"][data-route="full"]');
  click('[data-act="wing"][data-id="basics"]');
  click('[data-act="next"]');
  const door = ctx.G.wings[0].steps.find(s => s.t === 'door');
  answer(ctx, door);
  click('[data-act="check"]');
  assert.ok($('.verdict.ok'), 'вратата не се отвори');

  // сменяме на английски
  click('.langbtn[data-lang="en"]');
  assert.equal(ctx.doc.documentElement.lang, 'en', 'html lang не се смени');
  assert.equal($('.langbtn[aria-pressed="true"]').dataset.lang, 'en', 'бутонът не се отбеляза');

  const en = ctx.dom.window.I18N.en;
  assert.ok($('.panel').textContent.includes(en['wing.doorReview']),
    'страницата не е на английски след смяната');
  assert.ok($('.verdict.rev'), 'отговорената врата не е запомнена след смяната на езика');

  // и обратно
  click('.langbtn[data-lang="fr"]');
  const fr = ctx.dom.window.I18N.fr;
  assert.ok($('.panel').textContent.includes(fr['wing.doorReview']), 'френският не се приложи');
  assert.ok($('.verdict.rev'), 'прогресът се загуби при втората смяна');
});

test('езикът се взима от ?lang= в адреса', () => {
  const fr = load('fr');
  assert.ok(fr.txt().includes(fr.T['title.h2']), '?lang=fr не се зачете');
  const en = load('en');
  assert.ok(en.txt().includes(en.T['title.h2']), '?lang=en не се зачете');
});

test('всеки език има всички ключове на интерфейса', () => {
  const ctx = load('bg');
  const I18N = ctx.dom.window.I18N;
  const base = Object.keys(I18N.bg).sort();
  for (const l of LANGS) {
    assert.deepEqual(Object.keys(I18N[l]).sort(), base, `${l}: речникът се разминава с българския`);
  }
});
