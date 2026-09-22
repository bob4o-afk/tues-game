/* Lesson content in ENGLISH.
   Pure data. Adding a question is one object in steps.
   Icons live in icons.js, interface strings in i18n.js.
   Door kinds: choice | sr | fix | fill | match | order | tab | tree
   core: true  →  the question is also part of the short route (a 45-minute class).

   Door ids must match across languages — progress is shared. */

window.CONTENT = window.CONTENT || {};
window.CONTENT.en = {

wings: [
/* ═══════════════════════════ WING I ═══════════════════════════ */
{
  id: 'basics',
  name: 'Basics',
  artifact: 'The Scroll of Structure',
  blurb: 'What markup is, what a document is made of, how elements are written.',
  secret: {
    title: 'The tags the web gave birth to and tried to forget',
    text: 'Netscape shipped <blink> — text that flashes. Legend says the idea was born in a bar in one evening. Microsoft answered with <marquee> — text that crawls across the screen. Both tags are dead today, but they left a mark: flashing content is a proven danger for people with photosensitive epilepsy, and WCAG now has an explicit rule against it. A tag from 1995 is the reason a standard exists today.',
    code: '<blink>BUY NOW</blink>\n<marquee>Welcome to my homepage!</marquee>'
  },
  steps: [
    { t:'room', title:'The language of markup', lead:'HTML = HyperText Markup Language. Three words, three ideas — and not one of them is “programming”.',
      code:'This is <em>important</em>, and this — <strong>very important</strong>.',
      points:[
        'HyperText — text that points at other text. The link is the whole revolution.',
        'Markup — you label every piece of content with what it is.',
        'Language — it has grammar and a standard, but no variables, conditionals or loops.',
        'The idea is older than the web: editors marked up manuscripts with a blue pencil.'
      ]},

    { t:'door', id:'I.1', core:true, kind:'choice',
      q:'What does “markup” mean in HTML?',
      options:['That the language marks your mistakes','That you <b>label</b> pieces of content with tags','That the code is compiled before it runs','That the text gets coloured automatically'],
      correct:1,
      hint:'Think where the word comes from — the print shop, not programming.',
      explain:'Markup comes from the editorial practice of “marking up” a manuscript for print. You are not describing logic — you are describing what each piece of text is.',
      teach:'Ask the class: who else “marks up” things so a machine can understand them? (barcodes, sheet music)'},

    { t:'door', id:'I.2', kind:'choice',
      q:'Which of these is <b>not</b> true about HTML?',
      options:['It is not a programming language','It descends from SGML','It has versions up to HTML 7','It forgives syntax errors'],
      correct:2,
      hint:'When did you last see a version number next to the word HTML?',
      explain:'HTML today is a Living Standard — a living document with no version numbers. There will be no “HTML 6”. That is why “is this supported?” is a question for caniuse.com, not for a version number.',
      teach:'Remember Lesson 1: TCP/IP works the same way — the standard lives, it is not reissued.'},

    { t:'room', title:'Anatomy of a document', lead:'Every line in <head> does a concrete job. Remove it and something breaks.',
      code:'<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>The title in the tab</title>\n  </head>\n  <body>\n    <h1>The visible heading</h1>\n  </body>\n</html>',
      points:[
        '<head> — metadata. Invisible to the eye, required by the machine.',
        '<body> — everything that is seen.',
        'Without charset, non-Latin text turns into mojibake.',
        'Without lang the screen reader reads the text with the wrong accent entirely.'
      ]},

    { t:'door', id:'I.3', core:true, kind:'fill',
      q:'One attribute decides which voice the screen reader uses. Fill it in.',
      before:'<html ', after:'="en">', accept:['lang'],
      hint:'Four letters. It answers “what language is this document in?”',
      explain:'lang="en" tells the screen reader which speech synthesiser to use. A missing lang is among the most common accessibility failures on the whole web — one attribute, once, skipped by millions of sites.',
      teach:'Open any site with Inspect and check whether it has lang. Usually it does not.'},

    { t:'door', id:'I.4', core:true, kind:'choice',
      q:'What happens if you remove <b>&lt;!DOCTYPE html&gt;</b>?',
      options:['The page does not load at all','The browser falls into quirks mode','CSS stops working','Absolutely nothing'],
      correct:1,
      hint:'The browser has to decide which rules to render by — today’s, or the ones from 1998.',
      explain:'The doctype describes nothing any more — it is a switch between standards mode and quirks mode. In quirks mode the browser deliberately emulates old bugs (a different box model) and your layout breaks. In HTML 4 the doctype was a long URL; HTML5 shrank it to the shortest string that still does the job.',
      teach:'Show the old HTML 4.01 doctype on screen — the reaction is guaranteed.'},

    { t:'room', title:'Element, tag, attribute', lead:'Three words that get mixed up constantly.',
      code:'        opening tag     content     closing tag\n             ↓             ↓           ↓\n        <a href="/home" class="btn">Home</a>\n         ↑     ↑\n       name  attribute\n\n        └──────────── element ────────────┘',
      points:[
        'Tag — what you type: <p>',
        'Element — opening tag + content + closing tag',
        'Attribute — extra information, only in the opening tag',
        'Void elements have no content and no closing tag: img, br, hr, input, meta, link'
      ]},

    { t:'door', id:'I.5', core:true, kind:'fix',
      q:'Which line is wrong?',
      lines:['<section>','  <p>This is <strong>text</p></strong>','  <p>And this one is fine.</p>','</section>'],
      correct:1,
      hint:'Nesting dolls do not cross.',
      explain:'Elements nest inside one another, they never cross. The correct form is <p>This is <strong>text</strong></p>. The browser will fix it for you — that is exactly what makes HTML “forgiving” — but what it decides to fix is not your decision.',
      teach:'Show in Inspect how the browser rearranged the DOM. They see the gap between what they wrote and what came out.'},

    { t:'door', id:'I.6', kind:'choice',
      q:'Which of these is a <b>void</b> element?',
      options:['&lt;p&gt;','&lt;div&gt;','&lt;img&gt;','&lt;span&gt;'],
      correct:2,
      hint:'Which one cannot have anything inside it?',
      explain:'<img> has no content and no closing tag. The same goes for br, hr, input, meta and link.',
      teach:''},

    { t:'door', id:'I.7', kind:'match',
      q:'Match each term with its definition.',
      pairs:[['tag','what you type: <p>'],['element','opening + content + closing'],['attribute','name="value" in the opening tag'],['void element','no closing tag: <img>']],
      hint:'A tag is part of an element, not the element itself.',
      explain:'People say “tag” for everything. The distinction matters exactly when you are reading the standard or an error message.',
      teach:''},

    { t:'room', title:'Looks versus meaning', lead:'Two pairs of tags look identical and mean different things. This is where semantics begins.',
      code:'<b>bold</b>            → looks only\n<strong>important</strong>  → importance the machine understands\n\n<i>italic</i>          → looks only\n<em>emphasis</em>      → stress the reader can pronounce',
      points:[
        '<b> and <i> are purely visual — valid, but semantically empty.',
        '<strong> and <em> carry meaning and reach the accessibility tree.',
        'Identical on screen, different to the machine. That is semantics in one sentence.'
      ]},

    { t:'door', id:'I.8', kind:'choice',
      q:'What is the difference between <b>&lt;b&gt;</b> and <b>&lt;strong&gt;</b>?',
      options:['The colour of the text','No difference, they are synonyms','&lt;strong&gt; carries meaning, &lt;b&gt; is only appearance','&lt;b&gt; is deprecated and invalid'],
      correct:2,
      hint:'Both make text bold. We are asking what the machine knows afterwards.',
      explain:'<b> is perfectly valid today — it just says nothing beyond “make it bold”. <strong> says “this is important”, and that reaches the screen reader, which can change its intonation.',
      teach:'Ask: if we turn off the CSS, which of the two still means something?'}
  ]
},

/* ═══════════════════════════ WING II ═══════════════════════════ */
{
  id:'semantics',
  name:'Semantics',
  artifact:'The Compass of Meaning',
  blurb:'Landmarks, headings, lists, links versus buttons, alt text.',
  secret:{
    title:'spacer.gif — the age of tables',
    text:'From 1996 to 2005 the entire web was built with layout tables and invisible 1×1 pixel GIFs stretched to whatever gap was needed. A whole generation of developers built websites with a spreadsheet tool. That is exactly why role="presentation" exists — there had to be a way to tell the screen reader “this table is not data, ignore it”.',
    code:'<table border="0" cellpadding="0">\n  <tr>\n    <td><img src="spacer.gif" width="1" height="20"></td>\n    <td>Content</td>\n  </tr>\n</table>'
  },
  steps:[
    { t:'room', title:'Semantics = choosing the tag by meaning', lead:'The two blocks can look identical on screen, pixel for pixel. The difference is for everyone who is not looking at the screen.',
      code:'<!-- div soup -->\n<div class="header">\n  <div class="nav">\n    <div class="item" onclick="go(\'/\')">Home</div>\n  </div>\n</div>\n\n<!-- the same thing, semantically -->\n<header>\n  <nav>\n    <a href="/">Home</a>\n  </nav>\n</header>',
      points:[
        'The semantic version is shorter and works with a keyboard without a single line of JavaScript.',
        '<div> and <span> are semantically empty — they are the last choice, not the first.',
        'Your markup is read by screen readers, Google, reader mode, bots, and by your colleague six months from now.'
      ]},

    { t:'door', id:'II.1', core:true, kind:'choice',
      q:'Which element may have only <b>one visible</b> instance per page?',
      options:['&lt;nav&gt;','&lt;main&gt;','&lt;section&gt;','&lt;article&gt;'],
      correct:1,
      hint:'Which of them cannot be two things at once by definition?',
      explain:'<main> marks the main content and is the target of the skip link. There is no way to have two main contents. The funny part is that <main> was added to the standard last — in 2013 — because until then everyone used <div id="content">.',
      teach:''},

    { t:'door', id:'II.2', core:true, kind:'match',
      q:'Match each element with the landmark role it gets.',
      pairs:[['<header>','banner'],['<nav>','navigation'],['<aside>','complementary'],['<footer>','contentinfo']],
      hint:'The role names describe the region, not the tag.',
      explain:'Screen readers have a dedicated key for jumping between landmarks. The user skips the menu and reaches the content in one keystroke — instead of going through 40 links.',
      teach:'Show the Landmarks panel in the Accessibility Inspector on somebody’s site.'},

    { t:'room', title:'The map of the page', lead:'HTML5 gives you elements that describe the regions. The screen reader uses them as a map.',
      code:'┌────────────────────────────────────────┐\n│ <header>          (banner)             │\n│   <nav>           (navigation)         │\n├───────────────────────┬────────────────┤\n│ <main>    (main)      │ <aside>        │\n│   <article>           │ (complementary)│\n│     <h1> <p> ...      │                │\n├───────────────────────┴────────────────┤\n│ <footer>          (contentinfo)        │\n└────────────────────────────────────────┘',
      points:[
        '<article> — if you cut it out and put it elsewhere, it still makes sense.',
        '<section> — part of something bigger, wants a heading.',
        '<div> — only when you need a hook for CSS.',
        '<header> and <footer> are landmarks only when they sit directly in <body>.'
      ]},

    { t:'door', id:'II.3', core:true, kind:'fix',
      q:'Which line is the biggest accessibility problem?',
      lines:['<header>','  <nav>','    <div class="item" onclick="go(\'/\')">Home</div>','  </nav>','</header>'],
      correct:2,
      hint:'Try reaching that element with the Tab key alone.',
      explain:'A <div> with onclick is not focusable, has no role and does not respond to Enter. A single <a href="/">Home</a> gives you all of that for free — plus right click → “Open in new tab”.',
      teach:'Demonstrate live: take your hand off the mouse and try to press that “button”.'},

    { t:'room', title:'Headings are navigation', lead:'Headings are not font sizes. They are the table of contents of the document.',
      code:'<h1>Web technologies course</h1>\n  <h2>Lesson 2 — HTML and ARIA</h2>\n    <h3>Semantics</h3>\n    <h3>Forms</h3>\n  <h2>Lesson 3 — CSS</h2>',
      points:[
        'One <h1> per page.',
        'Do not skip levels: you never go from h2 straight to h4.',
        'Need a smaller font? That is CSS’s job, not <h4>’s.',
        'In WebAIM surveys, headings are the number one way of finding your way around a long page.'
      ]},

    { t:'door', id:'II.4', kind:'choice',
      q:'Why should you not jump from &lt;h2&gt; straight to &lt;h4&gt;?',
      options:['The browser throws an error','It breaks the structure the screen reader navigates by','CSS stops applying','Google drops the site from the index'],
      correct:1,
      hint:'Think of a book’s table of contents with a whole level missing.',
      explain:'A skipped level says “there is a sub-section here, but under what?” A user navigating with the H key loses the hierarchy. Nothing crashes — the map just becomes wrong.',
      teach:''},

    { t:'door', id:'II.5', core:true, kind:'sr',
      q:'What will the screen reader say?',
      code:'<img src="IMG_4821.jpg">',
      options:['“image” and nothing more','The file name: “I M G 4 8 2 1 dot j p g”','Nothing — it skips it','“photo”'],
      correct:1,
      hint:'A missing alt does not mean silence.',
      explain:'When alt is missing entirely, the screen reader tries to say something useful and reads the file name. That is why an empty alt="" matters: it explicitly says “skip me, I am decoration”.',
      teach:'Ask the class how they would name a file if they knew someone would read it aloud.'},

    { t:'door', id:'II.6', kind:'choice',
      q:'When do you use <b>alt=""</b> (empty, but present)?',
      options:['Never — that is a mistake','When you cannot think of anything to write','When the image is pure decoration','When the image is the logo'],
      correct:2,
      hint:'Does it help to hear a description of a swirl?',
      explain:'A decorative image carries no information — an empty alt hides it from the reader. A logo, however, is usually inside a link to the homepage, and then alt describes the action: alt="Home".',
      teach:''},

    { t:'door', id:'II.7', core:true, kind:'choice',
      q:'“Open a modal dialog” — link or button?',
      options:['A link, because you click it','A button','It makes no difference','A &lt;div&gt; with onclick'],
      correct:1,
      hint:'Does the address in the browser change?',
      explain:'The rule is simple: if the address changes — link. If it does not — button. A link goes somewhere, a button does something. A button also responds to both Enter and Space, while a link responds only to Enter.',
      teach:'Ask: does right click → “Open in new tab” make any sense on this?'},

    { t:'door', id:'II.8', kind:'sr',
      q:'Screen readers have a mode that lists every link on the page. What does the user see here?',
      code:'<a href="/shipping">click here</a>\n<a href="/returns">click here</a>\n<a href="/contact">click here</a>',
      options:['The three addresses','A list of three identical “click here” rows','The page titles','Nothing'],
      correct:1,
      hint:'That mode shows only the link text, lifted out of the sentence around it.',
      explain:'Link text has to make sense on its own, out of context. “Click here”, “more” and “read more” are useless in such a list.',
      teach:''},

    { t:'door', id:'II.9', kind:'tree',
      q:'Fill in what the machine knows about this element.',
      code:'<a href="/profile">My profile</a>',
      role:{options:['link','button','heading','text'],correct:'link'},
      name:{options:['(none)','/profile','My profile','profile'],correct:'My profile'},
      state:{options:['(none)','checked','expanded','disabled'],correct:'(none)'},
      hint:'The name comes from the text inside the element, not from href.',
      explain:'Role: link. Name: the text content “My profile”. State: none — a link has no state. That is exactly why link text matters so much: it is the name.',
      teach:''}
  ]
},

/* ═══════════════════════════ WING III ═══════════════════════════ */
{
  id:'forms',
  name:'Forms',
  artifact:'The Seal of Consent',
  blurb:'Labels, field types, grouping, errors — where accessibility costs the most.',
  secret:{
    title:'Why a label makes the checkbox bigger',
    text:'Clicking a <label> focuses and toggles the field it is tied to. That turns a 13×13 pixel checkbox into a whole sentence you can click. A free UX bonus from one correct attribute — and the only reason not to do it is not knowing. On a phone, the difference between a 13px and a 300px target is the difference between a form that works and one that annoys.',
    code:'<label for="terms">\n  <input type="checkbox" id="terms">\n  I accept the terms and conditions\n</label>'
  },
  steps:[
    { t:'room', title:'The label is not optional', lead:'A field without a label is a box with no writing on it. The reader says “text field” and that is all.',
      code:'<!-- for points at id -->\n<label for="email">Email</label>\n<input type="email" id="email" name="email">\n\n<!-- or wrapping -->\n<label>\n  Email\n  <input type="email" name="email">\n</label>\n\n<!-- placeholder is NOT a label -->\n<input type="email" placeholder="Email">',
      points:[
        'The placeholder disappears exactly when you start typing.',
        'Its contrast is deliberately low — often below the readability requirement.',
        'You cannot click it to focus the field.',
        'Some readers do not announce it at all.'
      ]},

    { t:'door', id:'III.1', core:true, kind:'choice',
      q:'Which is <b>not</b> a reason a placeholder cannot replace &lt;label&gt;?',
      options:['It disappears while typing','It has low contrast','It makes the field slower','It is not clickable'],
      correct:2,
      hint:'Three of these are real problems. The fourth simply does not happen.',
      explain:'Performance has nothing to do with it. The problems are about comprehension: vanishing text, low contrast, a missing click target and inconsistent announcement.',
      teach:''},

    { t:'door', id:'III.2', core:true, kind:'fill',
      q:'Tie the label to the field. Which attribute is missing?',
      before:'<label ', after:'="email">Email</label>', accept:['for'],
      hint:'Three letters. In JSX it is written htmlFor, if that helps.',
      explain:'for points at the field’s id. From then on, clicking the text focuses the field, and the screen reader knows what the field is called.',
      teach:''},

    { t:'room', title:'Types do the work for you', lead:'One attribute saves you validation, a keyboard and a widget.',
      code:'<input type="email">   validation + @ on the keyboard\n<input type="tel">     numeric keypad on a phone\n<input type="date">    built-in date picker\n<input type="number">  steppers, digits only\n<input type="file" accept="image/*">',
      points:[
        'A native type brings behaviour you would otherwise hand-write and get wrong.',
        'autocomplete="email" makes the browser fill it in — huge for people with motor impairments.',
        'required gives you validation without a single line of JavaScript.'
      ]},

    { t:'door', id:'III.3', core:true, kind:'choice',
      q:'What is the default <b>type</b> of a &lt;button&gt; inside a &lt;form&gt;?',
      options:['button','submit','reset','none — you must state it'],
      correct:1,
      hint:'The classic bug: you click “Show password” and the page reloads.',
      explain:'Every <button> in a form is a submit button until you say otherwise. For a button that does something else, write type="button" explicitly.',
      teach:'This is the bug everyone has written at least once. Ask who has been caught by it.'},

    { t:'door', id:'III.4', kind:'choice',
      q:'The screen reader says: “Courier, radio button, 1 of 2.” What is missing?',
      code:'<label><input type="radio" name="delivery"> Courier</label>\n<label><input type="radio" name="delivery"> To the office</label>',
      options:['&lt;fieldset&gt; and &lt;legend&gt;','aria-label on each field','&lt;form&gt; around everything','value attributes'],
      correct:0,
      hint:'The user hears the options. But not the question.',
      explain:'<fieldset> groups them and <legend> supplies the question: “Delivery method”. Without it you hear the answers without knowing what they answer.',
      teach:''},

    { t:'room', title:'Hints and errors', lead:'An error has to be tied to the field, not merely sitting next to it.',
      code:'<label for="pass">Password</label>\n<input type="password" id="pass"\n       aria-describedby="hint err"\n       aria-invalid="true" required>\n<p id="hint">At least 8 characters.</p>\n<p id="err" role="alert">The password is too short.</p>',
      points:[
        'aria-describedby attaches extra text to the field.',
        'aria-invalid="true" says the field is in an error state.',
        'role="alert" announces the message the moment it appears.',
        'A red border on its own is not information.'
      ]},

    { t:'door', id:'III.5', kind:'match',
      q:'Match the attribute with what it does.',
      pairs:[['aria-describedby','attaches extra text'],['aria-invalid','the field is in error'],['required','mandatory field'],['autocomplete','the browser fills it in for you']],
      hint:'One of them has nothing to do with ARIA and has worked for years.',
      explain:'The first two are ARIA — they only announce. The other two are native and actually change what the browser does.',
      teach:''},

    { t:'door', id:'III.6', kind:'choice',
      q:'Why is &lt;input type="tel"&gt; better than type="text" for a phone number?',
      options:['It validates the number','The phone shows a numeric keypad','It formats the number automatically','There is no difference'],
      correct:1,
      hint:'Think about what someone filling the form on a phone sees.',
      explain:'type="tel" does not validate (numbers differ too much worldwide), but it brings up the numeric keypad. One attribute saves the user two taps on every field.',
      teach:''},

    { t:'door', id:'III.7', core:true, kind:'tab',
      q:'Click the fields in the order the Tab key will visit them.',
      fields:[
        {label:'Search', attr:''},
        {label:'Name', attr:''},
        {label:'Email', attr:'tabindex="1"'},
        {label:'Message', attr:''},
        {label:'Send', attr:''}
      ],
      correct:[2,0,1,3,4],
      hint:'A positive tabindex does not queue up with the others. It jumps ahead of everyone.',
      explain:'Elements with a positive tabindex are visited FIRST, ordered by their number, and only then comes the natural document order. That is why “Email” is first even though it is third on the page. Use only tabindex="0" and tabindex="-1".',
      teach:'Ask: if this site has 30 such fields, where does the user end up?'},

    { t:'door', id:'III.8', kind:'choice',
      q:'The error message is shown <b>only</b> as a red border. What is the problem?',
      options:['Red is an aggressive colour','Colour is not information for everyone','Borders are an outdated approach','There is no problem'],
      correct:1,
      hint:'Who will not see the red? Think of at least three different people.',
      explain:'Colour blindness, a screen reader, a black-and-white printout, bright sun on the screen. Information has to be encoded at least twice: colour + text + icon.',
      teach:'Around 8% of men have some form of colour blindness. In a class of 30 that is statistically at least one.'}
  ]
},

/* ═══════════════════════════ WING IV ═══════════════════════════ */
{
  id:'aria',
  name:'ARIA',
  artifact:'The Prism of Roles',
  blurb:'The accessibility tree, roles, states, live regions and the five rules.',
  secret:{
    title:'An accordion without a single line of JavaScript',
    text:'<details> and <summary> give you a working accordion: it opens, it closes, it responds to the keyboard, it announces its state to the screen reader. Millions of lines of JavaScript exist in the world to recreate something the browser hands you for free — and they usually recreate it worse.',
    code:'<details>\n  <summary>Show more</summary>\n  <p>The hidden content.</p>\n</details>'
  },
  steps:[
    { t:'room', title:'The accessibility tree', lead:'The browser does not hand your HTML to the screen reader. It builds a second structure.',
      code:'  HTML ──parse──▶ DOM ──▶ Accessibility Tree ──▶ 🔊 reader\n                   │                              ⌨️ voice\n                   └──▶ CSSOM ──▶ Render Tree ──▶ 🖥️ pixels',
      points:[
        'Every node has four things: role, name, state, value.',
        'Role — what is this? Name — what is it called? State — what state is it in?',
        'Voice control and automated tests run on the same tree.',
        'See it yourself: DevTools → Elements → Accessibility.'
      ]},

    { t:'door', id:'IV.1', core:true, kind:'choice',
      q:'What does ARIA actually <b>do</b>?',
      options:['Changes the appearance','Adds keyboard support','Changes what the browser announces','Makes the element focusable'],
      correct:2,
      hint:'ARIA is a label stuck on the box. What changes inside the box?',
      explain:'ARIA changes nothing visually, adds no behaviour, does not make an element focusable and brings no keyboard support. It changes only what is written in the accessibility tree. Everything else remains your job.',
      teach:'This is the most important slide in the whole section. Say it twice.'},

    { t:'room', title:'Where the name comes from', lead:'The browser searches in a strict order. The first thing found wins.',
      code:'1. aria-labelledby   points at another element’s id\n2. aria-label        text written in the attribute\n3. the native one    <label>, alt, <legend>, <caption>\n4. the content       the text inside <button>Send</button>\n5. title             last resort, unreliable',
      points:[
        'aria-labelledby beats everything — including the visible text.',
        'That is why a wrong aria-label is more dangerous than a missing one: it silences the correct text.',
        'Voice control uses the same name: “click Send”.'
      ]},

    { t:'door', id:'IV.2', core:true, kind:'order',
      q:'Put the accessible name computation in order. The strongest at the top.',
      items:['aria-labelledby','aria-label','the native one (label / alt / legend)','the text content','title'],
      hint:'At the top is the one that can silence all the others.',
      explain:'ARIA attributes beat the native ones, and title comes last and is unreliable. From this follows a practical rule: do not put aria-label on a button that already has sensible text — you risk replacing it with something worse.',
      teach:''},

    { t:'door', id:'IV.3', kind:'choice',
      q:'What are the four things the accessibility tree knows about an element?',
      options:['tag, class, id, style','role, name, state, value','width, height, colour, position','parent, child, sibling, root'],
      correct:1,
      hint:'What is this? What is it called? What state is it in? What is its value?',
      explain:'Role, Name, State, Value. If you know these and the three questions behind them, you know how every assistive technology thinks.',
      teach:''},

    { t:'door', id:'IV.4', core:true, kind:'sr',
      q:'What does the screen reader announce?',
      code:'<button aria-expanded="false">Menu</button>',
      options:['“Menu”','“Menu, button”','“Menu, button, collapsed”','“Menu, collapsed”'],
      correct:2,
      hint:'Three things: name, role, state. Where does each come from?',
      explain:'The name “Menu” comes from the text, the role “button” from the tag, the state “collapsed” from aria-expanded. Only the third one is ARIA. The other two you get for free.',
      teach:'Ask the class which of the three comes from ARIA. They almost always say “all of them”.'},

    { t:'room', title:'Live regions', lead:'If JavaScript changes text on the screen, the reader does not notice. You have to tell it to watch.',
      code:'<div aria-live="polite" id="status"></div>\n<!-- later: status.textContent = "Added to cart" -->\n\n<div role="alert">Payment declined.</div>',
      points:[
        'polite — waits for the reader to finish. For “Saved”, “3 results”.',
        'assertive — interrupts immediately. Only for errors and expiring timers.',
        'role="alert" is assertive, ready-made.',
        'The region must exist in the DOM BEFORE you put text into it.'
      ]},

    { t:'door', id:'IV.5', core:true, kind:'fix',
      q:'Which line breaks rule 4 of ARIA?',
      lines:['<nav>','  <button aria-hidden="true">Send</button>','  <span aria-hidden="true">🗑️</span>','</nav>'],
      correct:1,
      hint:'One of them is focusable. The other is not.',
      explain:'aria-hidden on a focusable element creates a phantom: the button is reachable with Tab, but the reader has nothing to say. The user is standing on nothing. On the decorative icon, however, it is exactly the right thing.',
      teach:''},

    { t:'door', id:'IV.6', kind:'choice',
      q:'When do you use aria-live="assertive"?',
      options:['On every change on the screen','Only for something critical: an error, an expiring timer','Never','When the page loads'],
      correct:1,
      hint:'What does it mean to interrupt someone mid-sentence?',
      explain:'assertive interrupts the reader immediately. Used for every little thing, it turns the page into one continuous interruption. For everything else — polite.',
      teach:''},

    { t:'door', id:'IV.7', core:true, kind:'fill',
      q:'The button has only an icon. Give it a name.',
      before:'<button aria-', after:'="Close">✕</button>', accept:['label'],
      hint:'Five letters. Text written directly in the attribute.',
      explain:'Without a name the reader says only “button” and the information ends there. aria-label gives a name where there is no visible text. Rule 5: every interactive element must have an accessible name.',
      teach:''},

    { t:'room', title:'The five rules of ARIA', lead:'The official Rules of ARIA Use. If this is all you remember — it is enough.',
      code:'1. Do not use ARIA if a native element exists.\n2. Do not change native semantics without a reason.\n3. Every interactive ARIA element works with a keyboard.\n4. No role="presentation" or aria-hidden on anything focusable.\n5. Every interactive element has an accessible name.',
      points:[
        'No ARIA is better than bad ARIA. — W3C',
        'ARIA is a scalpel, not a sticking plaster.',
        'It is needed for tabs, trees, comboboxes, modals and live messages — things HTML has no element for.'
      ]},

    { t:'door', id:'IV.8', kind:'choice',
      q:'State rule 1 of ARIA.',
      options:['Always add a role to every element','If a native HTML element with the same semantics exists — use it','ARIA is written before class','Every div needs an aria-label'],
      correct:1,
      hint:'Which is shorter: <button>, or a div with a role, a tabindex and two keydown handlers?',
      explain:'<button> brings focus, Enter, Space, disabled and the right role for free. The same thing with a div takes around 30 lines of JavaScript, which are almost always incomplete.',
      teach:''},

    { t:'door', id:'IV.9', kind:'tree',
      q:'Fill in the node in the accessibility tree.',
      code:'<label for="a">I agree</label>\n<input type="checkbox" id="a" checked>',
      role:{options:['checkbox','textbox','button','switch'],correct:'checkbox'},
      name:{options:['a','(none)','I agree','checkbox'],correct:'I agree'},
      state:{options:['(none)','checked','expanded','invalid'],correct:'checked'},
      hint:'The name comes from the associated label, the state from the field’s attribute.',
      explain:'Role: checkbox (from type). Name: “I agree” (from <label for>). State: checked. All three come from native HTML — not a single line of ARIA.',
      teach:''},

    { t:'door', id:'IV.10', kind:'choice',
      q:'According to WebAIM’s analyses, pages that <b>use</b> ARIA average <b>more</b> accessibility errors than pages without it. Why?',
      options:['ARIA is badly designed','It is applied as a plaster over broken markup — and applied wrongly','Screen readers do not support it','The statistics are wrong'],
      correct:1,
      hint:'Who reaches for ARIA — the person who wrote <button>, or the person who wrote <div>?',
      explain:'ARIA is not to blame. What is to blame is that people reach for it once the markup is already broken, and then apply it at random. Hence the rule: no ARIA is better than bad ARIA.',
      teach:'This is the moment to go back to rule 1 and close the circle.'}
  ]
}
],

/* ═══════════════════════════ THE BOSS ═══════════════════════════ */
boss: {
  intro: 'The four keys turn. The door opens and the screen goes dark.\n\nFrom here on you see nothing. You move with Tab, you activate with Enter, and everything you learn about the page comes from a single voice.\n\nThis is exactly what the web looks like for someone using a screen reader.',
  stages: [
    {
      title:'Stage 1 — A page without headings',
      task:'Find the “Shipping” section.',
      items:[
        {say:'paragraph, Welcome to our electronics store with over 20 years of experience'},
        {say:'paragraph, We work with leading brands and offer a warranty on all products'},
        {say:'paragraph, Our team is available every working day'},
        {say:'paragraph, Founded in 2004, the shop began as a small repair service'},
        {say:'paragraph, We deliver anywhere in the country by courier within 48 hours', goal:true},
        {say:'paragraph, Follow us on social media for promotions'}
      ],
      lesson:'Without headings the page is one endless paragraph. The H key in a screen reader jumps from heading to heading — but only if there are headings. You just went through everything to find one sentence.',
      fixedTask:'Now the same thing, with <h2>. Find “Shipping”.',
      fixedItems:[
        {say:'heading level 2, About us'},
        {say:'heading level 2, Shipping', goal:true},
        {say:'heading level 2, Warranty'},
        {say:'heading level 2, Contact'}
      ],
      fix:'<h2>Shipping</h2>'
    },
    {
      title:'Stage 2 — Links without text',
      task:'Go to the page about returning an item.',
      unknowable:true,
      items:[
        {say:'link, click here'},
        {say:'link, click here'},
        {say:'link, click here'},
        {say:'link, click here'},
        {say:'link, click here'},
        {say:'link, click here'}
      ],
      wrongMsg:'A cookie policy page opened. Go back.',
      lesson:'There was no way to know. That is exactly the problem. Link text has to make sense on its own — because the reader has a mode that lists only the links, lifted out of the sentences around them.',
      fixedTask:'Now with meaningful text. Find the returns page.',
      fixedItems:[
        {say:'link, Shipping and delivery times'},
        {say:'link, Returning an item', goal:true},
        {say:'link, Warranty terms'},
        {say:'link, Contact'}
      ],
      fix:'<a href="/returns">Returning an item</a>'
    },
    {
      title:'Stage 3 — Buttons without a name',
      task:'Add the product to the cart.',
      unknowable:true,
      items:[
        {say:'button'},
        {say:'button'},
        {say:'button'},
        {say:'button'}
      ],
      wrongMsg:'The product was removed from your wishlist.',
      lesson:'An icon button with no name is announced simply as “button”. The information ends there. aria-label="Add to cart" is one attribute and it solves everything.',
      fixedTask:'Now with names. Add to the cart.',
      fixedItems:[
        {say:'button, Add to wishlist'},
        {say:'button, Compare'},
        {say:'button, Add to cart', goal:true},
        {say:'button, Share'}
      ],
      fix:'<button aria-label="Add to cart">🛒</button>'
    },
    {
      title:'Stage 4 — A form without labels',
      task:'Fill in your email.',
      unknowable:true,
      items:[
        {say:'text field'},
        {say:'text field'},
        {say:'text field'},
        {say:'text field'}
      ],
      wrongMsg:'You typed your email into the postcode field.',
      lesson:'A placeholder is not a label. A field without <label> is a box with no writing on it — and a wrongly filled form is the difference between the person buying something and giving up.',
      fixedTask:'Now with labels. Fill in the email.',
      fixedItems:[
        {say:'text field, Name'},
        {say:'text field, Email', goal:true},
        {say:'text field, Phone'},
        {say:'text field, Postcode'}
      ],
      fix:'<label for="email">Email</label>\n<input id="email" type="email">'
    },
    {
      title:'Stage 5 — An error shown only in colour',
      task:'Submit the form.',
      unknowable:true,
      items:[
        {say:'text field, Email'},
        {say:'button, Send', silent:true},
        {say:'link, Terms and conditions'}
      ],
      wrongMsg:'Nothing happens. Silence.',
      lesson:'The form is not submitting because the email is invalid — and that is shown only as a red border. For someone who cannot see the screen, the page simply goes quiet. This is why role="alert" exists: the message is announced the moment it appears.',
      fixedTask:'Now with role="alert". Send it again.',
      fixedItems:[
        {say:'text field, Email, invalid entry'},
        {say:'button, Send', goal:true, onGoal:'alert: The email is invalid. Please check the address.'},
        {say:'link, Terms and conditions'}
      ],
      fix:'<p role="alert">The email is invalid.</p>'
    }
  ],
  outro:'You have just been through a page the way millions of people go through one every day.\n\nThe difference between the broken version and the fixed one was eight attributes.'
}
};
