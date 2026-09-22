/* Общ инструментариум за тестовете: зарежда играта в jsdom и я „играе“. */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

/** Зарежда разделения проект (index.html + отделните файлове). */
function load() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    .replace(/<link[^>]*>/g, '')                 // без мрежа за шрифтовете
    .replace(/<script[^>]*><\/script>/g, '');    // скриптовете ги пускаме ръчно
  const dom = new JSDOM(html, { url: 'https://example.org/', runScripts: 'outside-only' });
  dom.window.eval(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'));
  dom.window.eval(fs.readFileSync(path.join(ROOT, 'game.js'), 'utf8'));
  return wrap(dom);
}

/** Зарежда слепения офлайн файл — истинско изпълнение на inline скриптовете. */
function loadBundle(file = 'igra-offline.html') {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8')
    .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, '');
  const dom = new JSDOM(html, { url: 'https://example.org/', runScripts: 'dangerously' });
  return wrap(dom);
}

function wrap(dom) {
  const doc = dom.window.document;
  const errors = [];
  dom.window.addEventListener('error', e => errors.push(e.message));

  const $ = s => doc.querySelector(s);
  const $$ = s => [...doc.querySelectorAll(s)];
  const click = s => {
    const el = typeof s === 'string' ? $(s) : s;
    if (!el) throw new Error('няма такъв елемент: ' + s);
    if (el.disabled) throw new Error('бутонът е заключен: ' + s);
    el.click();
  };
  const txt = () => $('#stage').textContent;

  return { dom, doc, $, $$, click, txt, errors, G: dom.window.GAME };
}

/** Дава верния отговор на текущата врата, какъвто и да е типът ѝ. */
function answer(ctx, s) {
  const { $, $$, click } = ctx;
  switch (s.kind) {
    case 'choice': case 'sr': case 'fix':
      click(`[data-act="opt"][data-i="${s.correct}"]`);
      break;
    case 'fill':
      $('#fill').value = s.accept[0];
      break;
    case 'match':
      s.pairs.forEach((p, i) => {
        const tok = $$('.token').find(t => t.textContent === p[1] && !t.disabled);
        if (!tok) throw new Error(`${s.id}: липсва парче „${p[1]}“`);
        click(tok);
        click(`#slot-${i}`);
      });
      break;
    case 'order':
      for (let pass = 0; pass < 25; pass++) {
        const cur = $$('.orderitem').map(r => s.items.indexOf(r.querySelector('.txt').textContent));
        if (cur.every((v, i) => v === i)) break;
        for (let i = 0; i < cur.length - 1; i++) {
          if (cur[i] > cur[i + 1]) { click(`#down-${i}`); break; }
        }
      }
      break;
    case 'tab':
      s.correct.forEach(i => click(`#field-${i}`));
      break;
    case 'tree':
      ['role', 'name', 'state'].forEach(k => { $('#tree-' + k).value = s[k].correct; });
      break;
    default:
      throw new Error(`${s.id}: непознат тип „${s.kind}“`);
  }
}

/** Минава едно крило докрай, отговаряйки вярно на всяка врата. */
function clearWing(ctx, w) {
  const { $, click, txt } = ctx;
  click(`[data-act="wing"][data-id="${w.id}"]`);
  w.steps.forEach(s => {
    if (s.t === 'room') { click('[data-act="next"]'); return; }
    answer(ctx, s);
    click('[data-act="check"]');
    if (!$('.verdict.ok')) throw new Error(`${s.id}: верният отговор беше отчетен за грешен`);
    if ($('[data-act="secret"]')) { click('[data-act="secret"]'); click('[data-act="secret-close"]'); }
    click('[data-act="next"]');
  });
  if (!txt().includes('Ключът е твой')) throw new Error(`${w.id}: няма съкровищница в края`);
  click('[data-act="hub"]');
}

/** Минава боса през всичките му етапи. */
function clearBoss(ctx) {
  const { $, click } = ctx;
  click('[data-act="boss"]');
  click('[data-act="boss-begin"]');
  ctx.G.boss.stages.forEach((st, i) => {
    const goal = st.items.findIndex(x => x.goal);
    if (goal !== -1) click(`#blk-${goal}`);
    else {
      const other = st.items.findIndex(x => !x.goal);
      click(`#blk-${other}`);
      click(`#blk-${other}`);
    }
    if (!$('[data-act="boss-fix"]')) throw new Error(`бос, етап ${i + 1}: не се стигна до поуката`);
    click('[data-act="boss-fix"]');
    click(`#blk-${st.fixedItems.findIndex(x => x.goal)}`);
    if (!$('[data-act="boss-next"]')) throw new Error(`бос, етап ${i + 1}: поправената страница не се затвори`);
    click('[data-act="boss-next"]');
  });
}

module.exports = { ROOT, load, loadBundle, answer, clearWing, clearBoss };
