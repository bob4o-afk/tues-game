/* Няколко правила в CSS-а, които лесно се трият по невнимание и никой не забелязва. */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./helpers');

const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');

/** Същият CSS без коментари — иначе коментарът пред едно правило се брои за част
    от селектора му. */
const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Връща телата на ВСИЧКИ @media блока с това условие, слепени.
    Условието се среща повече от веднъж в файла — затова не само първия. */
function mediaBlock(condition) {
  const needle = '@media ' + condition;
  const out = [];
  let from = 0, i;
  while ((i = css.indexOf(needle, from)) !== -1) {
    const open = css.indexOf('{', i);
    let depth = 0;
    for (let j = open; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}' && --depth === 0) {
        out.push(css.slice(open + 1, j));
        from = j;
        break;
      }
    }
    if (from <= i) break;
  }
  return out.length ? out.join('\n') : null;
}

test('легендата с клавишите се крие на устройство без клавиатура', () => {
  const block = mediaBlock('(hover:none) and (pointer:coarse)');
  assert.ok(block, 'няма media заявка за устройства с груб показалец');
  assert.match(block, /\.footbar\s*\{[^}]*display:\s*none/,
    'легендата с клавишите не се крие на телефон');
});

test('анимациите се изключват при prefers-reduced-motion', () => {
  const block = mediaBlock('(prefers-reduced-motion:reduce)');
  assert.ok(block, 'няма media заявка за намалено движение');
  assert.match(block, /animation:\s*none/, 'анимациите не се изключват');
  assert.match(block, /transition:\s*none/, 'преходите не се изключват');
});

test('ключът се вдига над номерата на тесен екран', () => {
  const block = mediaBlock('(max-width:620px)');
  assert.ok(block, 'няма media заявка за тесен екран');
  assert.match(block, /\.mapdot\.end\s*\{[^}]*order:\s*-1/,
    'ключът не се вдига над номерата на телефон');
});

test('фокусът винаги има видима следа', () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px/,
    'няма видим фокус пръстен');
  // класическата вреда: изтриване на пръстена за всичко наведнъж
  assert.ok(!/\*\s*:focus\s*\{/.test(css), 'фокусът е махнат глобално с *:focus');
  // всеки outline:none трябва да е на :focus селектор, който има :focus-visible двойник
  const killers = [...bare.matchAll(/([^{}]+)\{[^}]*outline:\s*none/g)]
    .map(m => m[1].trim().split('\n').pop().trim());
  for (const sel of killers) {
    assert.match(sel, /:focus\b/, `outline:none на неочакван селектор: ${sel}`);
    const base = sel.replace(/:focus\b/, '');
    assert.ok(
      bare.includes(base + ':focus-visible'),
      `${sel} маха пръстена без да даде :focus-visible заместник`
    );
  }
});
