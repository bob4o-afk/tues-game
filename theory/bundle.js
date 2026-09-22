#!/usr/bin/env node
/* Слепва index.html, style.css и всички скриптове в един файл.
   Нужен е, защото Safari и Firefox третират всеки file:// като отделен произход
   и блокират зареждането на съседните файлове при двоен клик.

   Употреба:  node theory/bundle.js   →   theory/igra-offline.html  */

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const OUT = 'igra-offline.html';

// единственият риск при вграждане е литерал, който затваря тага
const guard = s => s.replace(/<\/script>/gi, '<\\/script>');

let html = read('index.html');

// <link rel="stylesheet" href="./нещо.css">  →  <style>…</style>
html = html.replace(/[ \t]*<link rel="stylesheet" href="\.\/([^"]+)">\r?\n?/g,
  (_, file) => '<style>\n' + read(file) + '\n</style>\n');

// <script src="./нещо.js"></script>  →  <script>…</script>
html = html.replace(/[ \t]*<script src="\.\/([^"]+)"><\/script>\r?\n?/g,
  (_, file) => '<script>\n' + guard(read(file)) + '\n</script>\n');

html = html.replace('<title>',
  '<!-- Генериран файл. Редактирай източниците и пусни: npm run bundle -->\n<title>');

const left = html.match(/(?:src|href)="\.\/[^"]+"/g);
if (left) {
  console.error('❌ останали са външни препратки:', left.join(', '));
  process.exit(1);
}

module.exports = { build: () => html, OUT };

if (require.main === module) {
  fs.writeFileSync(path.join(dir, OUT), html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`✅ theory/${OUT} · ${kb} KB · работи с двоен клик във всеки браузър`);
}
