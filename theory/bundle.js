#!/usr/bin/env node
/* Слепва index.html + style.css + data.js + game.js в един файл.
   Нужен е, защото Safari и Firefox третират всеки file:// като отделен произход
   и блокират зареждането на съседните файлове при двоен клик.

   Употреба:  node theory/bundle.js   →   theory/igra-offline.html  */

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const OUT = 'igra-offline.html';

let html = read('index.html');
const css = read('style.css');
const data = read('data.js');
const game = read('game.js');

// скриптовете влизат както са; единствената опасност е литерал, който затваря тага
const guard = s => s.replace(/<\/script>/gi, '<\\/script>');

html = html
  .replace(
    /[ \t]*<link rel="stylesheet" href="\.\/style\.css">\r?\n?/,
    '<style>\n' + css + '\n</style>\n'
  )
  .replace(
    /[ \t]*<script src="\.\/data\.js"><\/script>\r?\n?/,
    '<script>\n' + guard(data) + '\n</script>\n'
  )
  .replace(
    /[ \t]*<script src="\.\/game\.js"><\/script>\r?\n?/,
    '<script>\n' + guard(game) + '\n</script>\n'
  )
  .replace(
    '<title>',
    '<!-- Генериран файл. Редактирай източниците и пусни: node build.js -->\n<title>'
  );

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
