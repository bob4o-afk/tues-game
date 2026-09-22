/* Слепеният офлайн файл: трябва да е актуален и да се играе. */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { loadBundle, clearWing, clearBoss, ROOT } = require('./helpers');
const bundler = require('../bundle.js');

test('igra-offline.html е сглобен от текущите файлове', () => {
  const onDisk = fs.readFileSync(path.join(ROOT, bundler.OUT), 'utf8');
  assert.equal(onDisk, bundler.build(),
    'слепеният файл е остарял — пусни „npm run bundle“ и го комитни');
});

test('слепеният файл няма препратки към съседни файлове', () => {
  const html = fs.readFileSync(path.join(ROOT, bundler.OUT), 'utf8');
  assert.equal(html.match(/(?:src|href)="\.\//g), null,
    'останала е относителна препратка — при двоен клик Safari ще я блокира');
});

test('слепеният файл се преиграва докрай', () => {
  const ctx = loadBundle();
  assert.ok(ctx.G, 'data.js не се е изпълнил в слепения файл');
  ctx.click('[data-act="start"][data-route="full"]');
  for (const w of ctx.G.wings) clearWing(ctx, w);
  clearBoss(ctx);
  assert.ok(ctx.txt().includes(ctx.T['end.h2']), 'няма финален екран');
  assert.deepEqual(ctx.errors, [], 'страницата е хвърлила грешка');
});
