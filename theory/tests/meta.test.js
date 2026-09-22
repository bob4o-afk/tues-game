/* Мета таговете, от които зависи как страницата изглежда в Google и при споделяне.
   Лесно се чупят при преименуване и никой не забелязва, докато не се сподели линкът. */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.join(__dirname, '..', '..');
const SITE = 'https://bob4o-afk.github.io/tues-game';

const PAGES = [
  { file: 'index.html', url: SITE + '/', image: SITE + '/og.png' },
  { file: path.join('theory', 'index.html'), url: SITE + '/theory/', image: SITE + '/theory/og.png' }
];

function head(file) {
  return fs.readFileSync(path.join(REPO, file), 'utf8');
}
function meta(html, attr, name) {
  const re = new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, 'i');
  const m = html.match(re);
  return m ? m[1] : null;
}

for (const page of PAGES) {
  const html = head(page.file);

  test(`${page.file}: заглавие и описание за резултатите в Google`, () => {
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    assert.ok(title, 'няма <title>');
    assert.ok(title.length >= 20 && title.length <= 75,
      `заглавието е ${title.length} знака — Google реже около 60`);

    const desc = meta(html, 'name', 'description');
    assert.ok(desc, 'няма meta description');
    assert.ok(desc.length >= 80 && desc.length <= 320,
      `описанието е ${desc.length} знака — целѝ около 150`);
  });

  test(`${page.file}: каноничен адрес и индексиране`, () => {
    const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
    assert.equal(canon, page.url, 'каноничният адрес не сочи към тази страница');
    assert.match(meta(html, 'name', 'robots') || '', /index/, 'страницата не е разрешена за индексиране');
  });

  test(`${page.file}: Open Graph за споделяне`, () => {
    for (const p of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'og:locale']) {
      assert.ok(meta(html, 'property', p), `липсва ${p}`);
    }
    assert.equal(meta(html, 'property', 'og:url'), page.url, 'og:url сочи другаде');
    assert.equal(meta(html, 'property', 'og:image'), page.image, 'og:image сочи другаде');
    assert.ok(meta(html, 'property', 'og:image:alt'), 'картинката за споделяне няма alt текст');
    assert.equal(meta(html, 'name', 'twitter:card'), 'summary_large_image');
  });

  test(`${page.file}: картинката съществува и е 1200×630`, () => {
    const rel = meta(html, 'property', 'og:image').replace(SITE + '/', '');
    const buf = fs.readFileSync(path.join(REPO, rel));
    assert.equal(buf.subarray(1, 4).toString(), 'PNG', 'не е PNG');
    // размерите стоят в IHDR, веднага след 8-байтовия подпис и дължината/типа
    assert.equal(buf.readUInt32BE(16), 1200, 'ширината не е 1200');
    assert.equal(buf.readUInt32BE(20), 630, 'височината не е 630');
  });

  test(`${page.file}: структурирани данни за Google`, () => {
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(m, 'няма JSON-LD блок');
    const data = JSON.parse(m[1]);
    assert.equal(data['@context'], 'https://schema.org');
    assert.ok(data['@type'], 'няма @type');
    var langs = [].concat(data.inLanguage);
    assert.ok(langs.includes('bg'), 'българският не е обявен в inLanguage');
    assert.match(JSON.stringify(data), /bob4o-afk/, 'авторът не е отбелязан');
  });
}

test('sitemap.xml изброява всички страници', () => {
  const xml = fs.readFileSync(path.join(REPO, 'sitemap.xml'), 'utf8');
  for (const page of PAGES) {
    assert.ok(xml.includes(page.url), `${page.url} липсва в sitemap.xml`);
  }
});

test('robots.txt пуска ботовете и сочи sitemap-а', () => {
  const txt = fs.readFileSync(path.join(REPO, 'robots.txt'), 'utf8');
  assert.match(txt, /Allow: \//, 'ботовете не са допуснати');
  assert.match(txt, /Sitemap: .*sitemap\.xml/, 'няма препратка към sitemap.xml');
});
