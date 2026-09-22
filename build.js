#!/usr/bin/env node
/* Сглобява dist/ — това, което отива на GitHub Pages.
   Копира се само явно изброеното, за да не тръгнат node_modules и тестовете нагоре.

   Добавяне на нов урок: един ред в LESSONS. */

const fs = require('fs');
const path = require('path');

const LESSONS = [
  { dir: 'theory', files: ['index.html', 'style.css', 'data.js', 'game.js', 'igra-offline.html', 'og.png', 'README.md'] }
];
const ROOT_FILES = ['index.html', 'og.png', 'robots.txt', 'sitemap.xml', '.nojekyll'];

const root = __dirname;
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

let n = 0;
const copy = (from, to) => {
  const src = path.join(root, from);
  if (!fs.existsSync(src)) {
    console.error('❌ липсва файл: ' + from);
    process.exit(1);
  }
  const dst = path.join(dist, to);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  n++;
};

ROOT_FILES.forEach(f => copy(f, f));
LESSONS.forEach(l => l.files.forEach(f => copy(path.join(l.dir, f), path.join(l.dir, f))));

console.log(`✅ dist/ · ${n} файла · ${LESSONS.length} урок(а)`);
