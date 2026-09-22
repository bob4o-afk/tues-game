# tues-game

Интерактивни уроци — по една игра на урок. Статични страници, без сървър и без build стъпка
за играене. Хостват се на GitHub Pages.

**На живо:** **https://bob4o-afk.github.io/tues-game/**

| Урок | Тема | Папка |
|---|---|---|
| 2 | HTML, семантика и ARIA — *Подземието на DOM-а* | [`theory/`](theory/) |

---

## Структура

```
tues-game/
├── index.html              начална страница със списъка на уроците
├── og.png                  картинката, която излиза при споделяне на линка
├── robots.txt sitemap.xml  за търсачките
├── build.js                сглобява dist/ — това, което отива на Pages
├── package.json            npm test, npm run build
├── .nojekyll               GitHub Pages да не пуска Jekyll
├── vercel.json             ако решиш да го качиш и на Vercel
├── tools/                  изходниците на og.png — не се качват
├── .github/workflows/ci.yml
└── theory/                 ← урок 2; всеки следващ урок е своя папка
    ├── index.html style.css game.js         играта
    ├── icons.js i18n.js content.*.js       икони, интерфейс, съдържание (BG/EN/FR)
    ├── bundle.js           слепва играта в един офлайн файл
    ├── igra-offline.html   ← генериран; за двоен клик и за раздаване
    ├── og.png              картинката за споделяне на този урок
    ├── tests/              63 теста
    └── README.md           как работи играта и как се добавят въпроси
```

---

## Работа по проекта

```bash
npm install          # веднъж — сваля jsdom за тестовете
npm test             # 63 теста: съдържание, преиграване, навигация, езици, стилове, мета, офлайн файл
npm run bundle       # пресглобява theory/igra-offline.html
npm run build        # bundle + сглобява dist/
npm run serve        # http://localhost:8000
```

> **Отваряй играта през `npm run serve`, не с двоен клик върху `theory/index.html`.**
> Safari и Firefox третират всеки `file://` като отделен произход и блокират съседните
> `style.css`, `game.js` и файловете със съдържанието. За двоен клик служи `igra-offline.html`.

### След промяна по въпросите

```bash
npm run bundle       # иначе тестът за остарял офлайн файл ще падне
npm test
```

---

## CI/CD

`.github/workflows/ci.yml` прави две неща:

| Кога | Какво |
|---|---|
| всеки push и всеки pull request | пуска `npm ci` и `npm test` |
| push в `main` и **само ако тестовете минат** | сглобява `dist/` и го публикува в GitHub Pages |

Деплоят зависи от тестовете (`needs: test`), така че счупена игра не стига до учениците.
Pull request-ите се тестват, но не се публикуват.

### Какво проверяват тестовете

| Файл | Проверява |
|---|---|
| `content.test.js` | всеки въпрос на **всеки от трите езика** е попълнен и решим, и трите превода съвпадат структурно: същите `id`-та, същите типове, същите позиции на верните отговори — иначе прогресът няма да се пренася между езиците |
| `lang.test.js` | играта се преиграва докрай на български, английски и френски; превключвателят сменя `<html lang>` и пази прогреса; `?lang=` в адреса се зачита; всеки речник има всички ключове |
| `style.test.js` | легендата с клавишите и режимът се крият на устройство без клавиатура, анимациите падат при `prefers-reduced-motion`, фокусът никога не се маха без заместник |
| `meta.test.js` | заглавия в границата, която Google реже, каноничните адреси, Open Graph, картинките 1200×630, валиден JSON-LD, sitemap и robots |
| `play.test.js` | цялата игра се преиграва докрай — 35 врати, всичките 8 типа, босът, финалът; краткият маршрут също стига до 4 ключа; грешният отговор дава подсказка, после обяснение, и не блокира |
| `nav.test.js` | картата скача във всички посоки, прегледът заключва отговорите, повторният опит не разваля записания резултат, а ключът се появява **само** след последната затворена врата |
| `boss.test.js` | в стаята на боса мишката не прави нищо — само Tab и Enter; на телефон стаята казва, че не може, и връща в залата |
| `bundle.test.js` | `igra-offline.html` е сглобен от текущите файлове, няма препратки към съседни файлове и се преиграва докрай |

---

## Първоначална настройка на GitHub Pages

```bash
cd tues-game
git init
git add -A
git commit -m "Подземието на DOM-а"
git branch -M main
git remote add origin https://github.com/bob4o-afk/tues-game.git
git push -u origin main
```

След първия push включи Pages **веднъж, ръчно**:

**Settings → Pages → Build and deployment → Source: `GitHub Actions`** → Save.

Това не може да се автоматизира: `configure-pages` има вход `enablement: true`, но
токенът на workflow-а няма право да създаде Pages сайт и стъпката пада с
`Resource not accessible by integration`. Един клик, веднъж за живота на репото.

Не избирай „Deploy from a branch“ — workflow-ът качва `dist/`, а не самото репо,
за да не тръгнат `node_modules` и тестовете нагоре.

След включването пусни наново последния workflow: **Actions → последния run →
Re-run failed jobs**.

Следи хода в раздела **Actions**. При първия успешен деплой адресът се появява там
и в **Settings → Pages**.

---

## Търсачки и споделяне

Всяка страница носи `title`, `description`, каноничен адрес, Open Graph, Twitter Card
и JSON-LD (`WebSite` за началната, `LearningResource` за урока). В корена стоят
`robots.txt` и `sitemap.xml`.

`og.png` (1200×630) е това, което се показва като карта, когато линкът се сподели в
Messenger, Discord, Slack, LinkedIn или Twitter.

### Да се появиш в Google

Мета таговете **не те индексират** — те решават само как изглеждаш, след като те намерят.
За да те намерят:

1. **Google Search Console** → Add property → URL prefix → `https://bob4o-afk.github.io/tues-game/`.
   GitHub Pages не позволява DNS запис, затова потвърди собствеността с HTML файла, който
   Search Console дава: сложи го в корена и добави името му в `ROOT_FILES` в `build.js`.
2. Там: **Sitemaps → подай** `sitemap.xml`, после **URL Inspection → Request indexing**.
3. Попълни полето **Website** в About на репото — това е реален входящ линк от домейн,
   който Google обхожда постоянно.

Индексирането отнема от няколко дни до седмици. За заявка като „bob4o-afk“ шансът е добър;
за „tues game“ се конкурираш с всичко останало с тези думи.

### Пресъздаване на картинките

Изходниците са в `tools/`. След промяна:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1200,630 \
  --screenshot=og.png "file://$PWD/tools/og-root.html"
```

Същото с `tools/og-theory.html` за `theory/og.png`. Тестовете проверяват, че файловете
съществуват и са точно 1200×630.

---

## Добавяне на нов урок

Всеки урок е самостоятелна папка с игра. Името ѝ е и парчето от адреса, затова го
избирай четимо на латиница — `theory`, `css`, `js-basics`.

1. Копирай `theory/` под новото име и смени съдържанието в `content.*.js`.
2. Добави ред в `LESSONS` в `build.js`.
3. Добави ред в списъка в `index.html`.
4. Добави тестовете му в `package.json`:
   ```json
   "test": "node --test theory/tests/*.test.js css/tests/*.test.js"
   ```

---

## Vercel (по избор)

Работи и там, без промени:

```bash
npm i -g vercel
vercel --prod
```

Framework: **Other**. Build command: `npm run build`. Output directory: `dist`.
