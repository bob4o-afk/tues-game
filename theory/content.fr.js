/* Contenu de la leçon en FRANÇAIS.
   Données pures. Ajouter une question, c’est ajouter un objet dans steps.
   Les icônes sont dans icons.js, l’interface dans i18n.js.
   Types de portes : choice | sr | fix | fill | match | order | tab | tree
   core: true  →  la question fait aussi partie du parcours court (cours de 45 min).

   Les identifiants des portes doivent rester identiques d’une langue à l’autre —
   la progression est partagée. */

window.CONTENT = window.CONTENT || {};
window.CONTENT.fr = {

wings: [
/* ═══════════════════════════ AILE I ═══════════════════════════ */
{
  id: 'basics',
  name: 'Les bases',
  artifact: 'Le Parchemin de la structure',
  blurb: 'Ce qu’est le balisage, de quoi est fait un document, comment s’écrivent les éléments.',
  secret: {
    title: 'Les balises que le web a enfantées puis tenté d’oublier',
    text: 'Netscape a sorti <blink> — du texte qui clignote. La légende dit que l’idée est née dans un bar, en une soirée. Microsoft a répondu avec <marquee> — du texte qui défile. Les deux balises sont mortes aujourd’hui, mais elles ont laissé une trace : le contenu clignotant est un danger avéré pour les personnes atteintes d’épilepsie photosensible, et WCAG comporte désormais une règle explicite contre lui. Une balise de 1995 est la raison d’être d’une norme actuelle.',
    code: '<blink>ACHETEZ MAINTENANT</blink>\n<marquee>Bienvenue sur ma page !</marquee>'
  },
  steps: [
    { t:'room', title:'Le langage du balisage', lead:'HTML = HyperText Markup Language. Trois mots, trois idées — et aucune ne dit « programmation ».',
      code:'Ceci est <em>important</em>, et ceci — <strong>très important</strong>.',
      points:[
        'HyperText — du texte qui pointe vers d’autre texte. Le lien, c’est toute la révolution.',
        'Markup — le balisage : tu étiquettes chaque morceau de contenu par ce qu’il est.',
        'Language — il a une grammaire et une norme, mais ni variables, ni conditions, ni boucles.',
        'L’idée est plus ancienne que le web : les correcteurs annotaient les manuscrits au crayon bleu.'
      ]},

    { t:'door', id:'I.1', core:true, kind:'choice',
      q:'Que signifie « markup » dans HTML ?',
      options:['Que le langage marque tes erreurs','Que tu <b>étiquettes</b> des morceaux de contenu','Que le code est compilé avant de tourner','Que le texte se colore automatiquement'],
      correct:1,
      hint:'Pense à l’origine du mot — l’imprimerie, pas la programmation.',
      explain:'Markup vient de la pratique éditoriale consistant à « marquer » un manuscrit pour l’impression. Tu ne décris pas une logique — tu décris ce qu’est chaque morceau de texte.',
      teach:'Demande à la classe : qui d’autre « balise » les choses pour qu’une machine les comprenne ? (code-barres, partition)'},

    { t:'door', id:'I.2', kind:'choice',
      q:'Laquelle de ces affirmations est <b>fausse</b> à propos de HTML ?',
      options:['Ce n’est pas un langage de programmation','Il descend de SGML','Il a des versions jusqu’à HTML 7','Il pardonne les erreurs de syntaxe'],
      correct:2,
      hint:'Quand as-tu vu pour la dernière fois un numéro de version à côté du mot HTML ?',
      explain:'HTML est aujourd’hui un Living Standard — un document vivant sans numéro de version. Il n’y aura pas de « HTML 6 ». C’est pourquoi « est-ce pris en charge ? » est une question pour caniuse.com, pas pour un numéro de version.',
      teach:'Rappelle la leçon 1 : TCP/IP fonctionne pareil — la norme vit, elle n’est pas rééditée.'},

    { t:'room', title:'Anatomie d’un document', lead:'Chaque ligne du <head> fait un travail concret. Enlève-la et quelque chose casse.',
      code:'<!DOCTYPE html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Le titre dans l’onglet</title>\n  </head>\n  <body>\n    <h1>Le titre visible</h1>\n  </body>\n</html>',
      points:[
        '<head> — les métadonnées. Invisibles à l’œil, obligatoires pour la machine.',
        '<body> — tout ce qui se voit.',
        'Sans charset, les accents se transforment en charabia.',
        'Sans lang, le lecteur d’écran lit le texte avec le mauvais accent.'
      ]},

    { t:'door', id:'I.3', core:true, kind:'fill',
      q:'Un attribut décide de la voix qu’utilisera le lecteur d’écran. Complète-le.',
      before:'<html ', after:'="fr">', accept:['lang'],
      hint:'Quatre lettres. Il répond à « dans quelle langue est ce document ? »',
      explain:'lang="fr" indique au lecteur d’écran quelle synthèse vocale utiliser. L’absence de lang fait partie des défauts d’accessibilité les plus fréquents du web — un attribut, une fois, oublié par des millions de sites.',
      teach:'Ouvre n’importe quel site avec l’inspecteur et vérifie s’il a lang. Le plus souvent, non.'},

    { t:'door', id:'I.4', core:true, kind:'choice',
      q:'Que se passe-t-il si tu enlèves <b>&lt;!DOCTYPE html&gt;</b> ?',
      options:['La page ne se charge pas du tout','Le navigateur passe en quirks mode','Le CSS cesse de fonctionner','Absolument rien'],
      correct:1,
      hint:'Le navigateur doit décider selon quelles règles rendre la page — celles d’aujourd’hui ou celles de 1998.',
      explain:'Le doctype ne décrit plus rien — c’est un interrupteur entre standards mode et quirks mode. En quirks mode, le navigateur imite volontairement de vieux bugs (un autre modèle de boîte) et ta mise en page casse. En HTML 4, le doctype était une longue URL ; HTML5 l’a réduit à la plus courte chaîne qui fasse encore ce travail.',
      teach:'Montre l’ancien doctype HTML 4.01 à l’écran — la réaction est garantie.'},

    { t:'room', title:'Élément, balise, attribut', lead:'Trois mots que l’on confond sans arrêt.',
      code:'        balise ouvrante   contenu    balise fermante\n             ↓              ↓            ↓\n        <a href="/home" class="btn">Accueil</a>\n         ↑     ↑\n       nom  attribut\n\n        └──────────── élément ────────────┘',
      points:[
        'Balise — ce que tu tapes : <p>',
        'Élément — balise ouvrante + contenu + balise fermante',
        'Attribut — une information en plus, uniquement dans la balise ouvrante',
        'Les éléments vides n’ont ni contenu ni balise fermante : img, br, hr, input, meta, link'
      ]},

    { t:'door', id:'I.5', core:true, kind:'fix',
      q:'Quelle ligne est fautive ?',
      lines:['<section>','  <p>Ceci est du <strong>texte</p></strong>','  <p>Et celle-ci va bien.</p>','</section>'],
      correct:1,
      hint:'Les poupées russes ne se croisent pas.',
      explain:'Les éléments s’emboîtent les uns dans les autres, ils ne se croisent jamais. La forme correcte est <p>Ceci est du <strong>texte</strong></p>. Le navigateur va le corriger pour toi — c’est précisément ce qui rend HTML « indulgent » — mais ce qu’il décide de corriger ne dépend pas de toi.',
      teach:'Montre dans l’inspecteur comment le navigateur a réorganisé le DOM. Ils voient l’écart entre ce qu’ils ont écrit et ce qui est sorti.'},

    { t:'door', id:'I.6', kind:'choice',
      q:'Lequel de ces éléments est <b>vide</b> (void) ?',
      options:['&lt;p&gt;','&lt;div&gt;','&lt;img&gt;','&lt;span&gt;'],
      correct:2,
      hint:'Lequel ne peut rien contenir ?',
      explain:'<img> n’a ni contenu ni balise fermante. Idem pour br, hr, input, meta et link.',
      teach:''},

    { t:'door', id:'I.7', kind:'match',
      q:'Associe chaque terme à sa définition.',
      pairs:[['balise','ce que tu tapes : <p>'],['élément','ouvrante + contenu + fermante'],['attribut','nom="valeur" dans la balise ouvrante'],['élément vide','sans balise fermante : <img>']],
      hint:'Une balise fait partie d’un élément, elle n’est pas l’élément.',
      explain:'On dit « balise » pour tout. La distinction compte précisément quand tu lis la norme ou un message d’erreur.',
      teach:''},

    { t:'room', title:'L’apparence contre le sens', lead:'Deux paires de balises se ressemblent et signifient autre chose. C’est là que commence la sémantique.',
      code:'<b>gras</b>                → apparence seulement\n<strong>important</strong>  → une importance que la machine comprend\n\n<i>italique</i>            → apparence seulement\n<em>accentuation</em>      → une emphase que le lecteur peut prononcer',
      points:[
        '<b> et <i> sont purement visuels — valides, mais vides de sens.',
        '<strong> et <em> portent un sens et atteignent l’arbre d’accessibilité.',
        'Identiques à l’écran, différents pour la machine. Voilà la sémantique en une phrase.'
      ]},

    { t:'door', id:'I.8', kind:'choice',
      q:'Quelle est la différence entre <b>&lt;b&gt;</b> et <b>&lt;strong&gt;</b> ?',
      options:['La couleur du texte','Aucune, ce sont des synonymes','&lt;strong&gt; porte un sens, &lt;b&gt; n’est qu’une apparence','&lt;b&gt; est obsolète et invalide'],
      correct:2,
      hint:'Les deux mettent en gras. On demande ce que la machine en sait ensuite.',
      explain:'<b> est parfaitement valide aujourd’hui — il ne dit simplement rien de plus que « mets en gras ». <strong> dit « ceci est important », et cela atteint le lecteur d’écran, qui peut changer d’intonation.',
      teach:'Demande : si on coupe le CSS, lequel des deux veut encore dire quelque chose ?'}
  ]
},

/* ═══════════════════════════ AILE II ═══════════════════════════ */
{
  id:'semantics',
  name:'Sémantique',
  artifact:'La Boussole du sens',
  blurb:'Points de repère, titres, listes, liens contre boutons, texte alternatif.',
  secret:{
    title:'spacer.gif — l’ère des tableaux',
    text:'De 1996 à 2005, tout le web a été bâti avec des tableaux de mise en page et des GIF invisibles de 1×1 pixel, étirés à la taille voulue. Toute une génération de développeurs a construit des sites avec un outil de tableur. C’est exactement pour cela que role="presentation" existe — il fallait un moyen de dire au lecteur d’écran « ce tableau n’est pas des données, ignore-le ».',
    code:'<table border="0" cellpadding="0">\n  <tr>\n    <td><img src="spacer.gif" width="1" height="20"></td>\n    <td>Contenu</td>\n  </tr>\n</table>'
  },
  steps:[
    { t:'room', title:'La sémantique, c’est choisir la balise par le sens', lead:'Les deux blocs peuvent être identiques à l’écran, au pixel près. La différence est pour tous ceux qui ne regardent pas l’écran.',
      code:'<!-- soupe de div -->\n<div class="header">\n  <div class="nav">\n    <div class="item" onclick="go(\'/\')">Accueil</div>\n  </div>\n</div>\n\n<!-- la même chose, en sémantique -->\n<header>\n  <nav>\n    <a href="/">Accueil</a>\n  </nav>\n</header>',
      points:[
        'La version sémantique est plus courte et marche au clavier sans une seule ligne de JavaScript.',
        '<div> et <span> sont vides de sens — ce sont le dernier choix, pas le premier.',
        'Ton balisage est lu par les lecteurs d’écran, Google, le mode lecture, les robots, et par ton collègue dans six mois.'
      ]},

    { t:'door', id:'II.1', core:true, kind:'choice',
      q:'Quel élément ne peut avoir qu’<b>une seule instance visible</b> par page ?',
      options:['&lt;nav&gt;','&lt;main&gt;','&lt;section&gt;','&lt;article&gt;'],
      correct:1,
      hint:'Lequel, par définition, ne peut pas être deux choses à la fois ?',
      explain:'<main> marque le contenu principal et sert de cible au lien d’évitement. On ne peut pas avoir deux contenus principaux. Le plus drôle, c’est que <main> a été ajouté en dernier à la norme — en 2013 — parce que jusque-là tout le monde utilisait <div id="content">.',
      teach:''},

    { t:'door', id:'II.2', core:true, kind:'match',
      q:'Associe chaque élément au rôle de repère qu’il reçoit.',
      pairs:[['<header>','banner'],['<nav>','navigation'],['<aside>','complementary'],['<footer>','contentinfo']],
      hint:'Les noms de rôles décrivent la zone, pas la balise.',
      explain:'Les lecteurs d’écran ont une touche dédiée pour sauter de repère en repère. L’utilisateur saute le menu et atteint le contenu en une frappe — au lieu de traverser 40 liens.',
      teach:'Montre le panneau Landmarks de l’inspecteur d’accessibilité sur le site de quelqu’un.'},

    { t:'room', title:'La carte de la page', lead:'HTML5 fournit des éléments qui décrivent les zones. Le lecteur d’écran s’en sert comme d’une carte.',
      code:'┌────────────────────────────────────────┐\n│ <header>          (banner)             │\n│   <nav>           (navigation)         │\n├───────────────────────┬────────────────┤\n│ <main>    (main)      │ <aside>        │\n│   <article>           │ (complementary)│\n│     <h1> <p> ...      │                │\n├───────────────────────┴────────────────┤\n│ <footer>          (contentinfo)        │\n└────────────────────────────────────────┘',
      points:[
        '<article> — si tu le découpes et le poses ailleurs, il garde du sens.',
        '<section> — une partie d’un ensemble plus grand, qui réclame un titre.',
        '<div> — seulement quand il te faut une accroche pour le CSS.',
        '<header> et <footer> ne sont des repères que placés directement dans <body>.'
      ]},

    { t:'door', id:'II.3', core:true, kind:'fix',
      q:'Quelle ligne pose le plus gros problème d’accessibilité ?',
      lines:['<header>','  <nav>','    <div class="item" onclick="go(\'/\')">Accueil</div>','  </nav>','</header>'],
      correct:2,
      hint:'Essaie d’atteindre cet élément avec la seule touche Tab.',
      explain:'Un <div> avec onclick n’est pas focalisable, n’a pas de rôle et ne réagit pas à Entrée. Un simple <a href="/">Accueil</a> te donne tout cela gratuitement — plus le clic droit → « Ouvrir dans un nouvel onglet ».',
      teach:'Fais la démonstration en direct : lâche la souris et essaie d’appuyer sur ce « bouton ».'},

    { t:'room', title:'Les titres sont une navigation', lead:'Les titres ne sont pas des tailles de police. Ils sont la table des matières du document.',
      code:'<h1>Cours de technologies web</h1>\n  <h2>Leçon 2 — HTML et ARIA</h2>\n    <h3>Sémantique</h3>\n    <h3>Formulaires</h3>\n  <h2>Leçon 3 — CSS</h2>',
      points:[
        'Un seul <h1> par page.',
        'Ne saute pas de niveau : on ne passe jamais de h2 directement à h4.',
        'Il te faut une police plus petite ? C’est le travail du CSS, pas de <h4>.',
        'Dans les enquêtes WebAIM, les titres sont le moyen numéro un de s’orienter dans une longue page.'
      ]},

    { t:'door', id:'II.4', kind:'choice',
      q:'Pourquoi ne faut-il pas passer de &lt;h2&gt; directement à &lt;h4&gt; ?',
      options:['Le navigateur renvoie une erreur','Cela casse la structure par laquelle navigue le lecteur d’écran','Le CSS cesse de s’appliquer','Google retire le site de l’index'],
      correct:1,
      hint:'Pense à une table des matières où il manque un niveau entier.',
      explain:'Un niveau sauté dit « il y a une sous-partie ici, mais sous quoi ? ». L’utilisateur qui navigue avec la touche H perd la hiérarchie. Rien ne plante — la carte devient simplement fausse.',
      teach:''},

    { t:'door', id:'II.5', core:true, kind:'sr',
      q:'Que va lire le lecteur d’écran ?',
      code:'<img src="IMG_4821.jpg">',
      options:['« image » et rien de plus','Le nom du fichier : « I M G 4 8 2 1 point j p g »','Rien — il le saute','« photo »'],
      correct:1,
      hint:'Un alt manquant ne veut pas dire silence.',
      explain:'Quand alt manque totalement, le lecteur d’écran essaie de dire quelque chose d’utile et lit le nom du fichier. C’est pour cela qu’un alt="" vide compte : il dit explicitement « saute-moi, je suis décoratif ».',
      teach:'Demande à la classe comment ils nommeraient un fichier en sachant qu’on le lira à voix haute.'},

    { t:'door', id:'II.6', kind:'choice',
      q:'Quand utilise-t-on <b>alt=""</b> (vide, mais présent) ?',
      options:['Jamais — c’est une erreur','Quand on ne sait pas quoi écrire','Quand l’image est purement décorative','Quand l’image est le logo'],
      correct:2,
      hint:'Est-ce utile d’entendre la description d’une arabesque ?',
      explain:'Une image décorative ne porte aucune information — un alt vide la cache au lecteur. Le logo, lui, est généralement dans un lien vers l’accueil, et alors alt décrit l’action : alt="Accueil".',
      teach:''},

    { t:'door', id:'II.7', core:true, kind:'choice',
      q:'« Ouvrir une fenêtre modale » — lien ou bouton ?',
      options:['Un lien, puisqu’on clique dessus','Un bouton','Cela n’a pas d’importance','Un &lt;div&gt; avec onclick'],
      correct:1,
      hint:'L’adresse dans le navigateur change-t-elle ?',
      explain:'La règle est simple : si l’adresse change — lien. Sinon — bouton. Un lien mène quelque part, un bouton fait quelque chose. Le bouton répond en plus à Entrée et à Espace, le lien seulement à Entrée.',
      teach:'Demande : le clic droit → « Ouvrir dans un nouvel onglet » a-t-il un sens ici ?'},

    { t:'door', id:'II.8', kind:'sr',
      q:'Les lecteurs d’écran ont un mode qui liste tous les liens de la page. Que voit l’utilisateur ici ?',
      code:'<a href="/livraison">cliquez ici</a>\n<a href="/retours">cliquez ici</a>\n<a href="/contact">cliquez ici</a>',
      options:['Les trois adresses','Une liste de trois lignes identiques « cliquez ici »','Les titres des pages','Rien'],
      correct:1,
      hint:'Ce mode n’affiche que le texte du lien, sorti de la phrase qui l’entoure.',
      explain:'Le texte d’un lien doit avoir du sens tout seul, hors contexte. « Cliquez ici », « plus » et « en savoir plus » ne servent à rien dans une telle liste.',
      teach:''},

    { t:'door', id:'II.9', kind:'tree',
      q:'Complète ce que la machine sait de cet élément.',
      code:'<a href="/profil">Mon profil</a>',
      role:{options:['link','button','heading','text'],correct:'link'},
      name:{options:['(aucun)','/profil','Mon profil','profil'],correct:'Mon profil'},
      state:{options:['(aucun)','checked','expanded','disabled'],correct:'(aucun)'},
      hint:'Le nom vient du texte à l’intérieur de l’élément, pas du href.',
      explain:'Rôle : link. Nom : le contenu textuel « Mon profil ». État : aucun — un lien n’a pas d’état. C’est précisément pour cela que le texte du lien compte tant : c’est le nom.',
      teach:''}
  ]
},

/* ═══════════════════════════ AILE III ═══════════════════════════ */
{
  id:'forms',
  name:'Formulaires',
  artifact:'Le Sceau du consentement',
  blurb:'Étiquettes, types de champs, regroupement, erreurs — là où l’accessibilité coûte le plus cher.',
  secret:{
    title:'Pourquoi une étiquette agrandit la case à cocher',
    text:'Cliquer sur un <label> met le focus sur le champ associé et le coche. Cela transforme une case de 13×13 pixels en une phrase entière cliquable. Un bonus d’ergonomie gratuit offert par un attribut correct — et la seule raison de s’en priver, c’est de ne pas le savoir. Sur un téléphone, l’écart entre une cible de 13 px et une de 300 px, c’est l’écart entre un formulaire qui marche et un formulaire qui agace.',
    code:'<label for="conditions">\n  <input type="checkbox" id="conditions">\n  J’accepte les conditions générales\n</label>'
  },
  steps:[
    { t:'room', title:'L’étiquette n’est pas facultative', lead:'Un champ sans étiquette est une boîte sans inscription. Le lecteur dit « champ de texte » et c’est tout.',
      code:'<!-- for pointe vers id -->\n<label for="email">Courriel</label>\n<input type="email" id="email" name="email">\n\n<!-- ou en enveloppant -->\n<label>\n  Courriel\n  <input type="email" name="email">\n</label>\n\n<!-- placeholder n’est PAS une étiquette -->\n<input type="email" placeholder="Courriel">',
      points:[
        'Le placeholder disparaît précisément quand tu commences à écrire.',
        'Son contraste est volontairement faible — souvent sous le seuil de lisibilité.',
        'Tu ne peux pas cliquer dessus pour activer le champ.',
        'Certains lecteurs ne l’annoncent pas du tout.'
      ]},

    { t:'door', id:'III.1', core:true, kind:'choice',
      q:'Laquelle <b>n’est pas</b> une raison pour qu’un placeholder ne remplace pas &lt;label&gt; ?',
      options:['Il disparaît pendant la saisie','Il a un faible contraste','Il ralentit le champ','Il n’est pas cliquable'],
      correct:2,
      hint:'Trois de ces points sont de vrais problèmes. Le quatrième n’arrive tout simplement pas.',
      explain:'La performance n’a rien à voir. Les problèmes portent sur la compréhension : un texte qui s’évapore, un faible contraste, une cible de clic absente et une annonce inégale.',
      teach:''},

    { t:'door', id:'III.2', core:true, kind:'fill',
      q:'Relie l’étiquette au champ. Quel attribut manque ?',
      before:'<label ', after:'="email">Courriel</label>', accept:['for'],
      hint:'Trois lettres. En JSX on l’écrit htmlFor, si cela aide.',
      explain:'for pointe vers l’id du champ. Dès lors, cliquer sur le texte active le champ, et le lecteur d’écran sait comment il s’appelle.',
      teach:''},

    { t:'room', title:'Les types travaillent à ta place', lead:'Un attribut t’épargne une validation, un clavier et un composant.',
      code:'<input type="email">   validation + @ sur le clavier\n<input type="tel">     pavé numérique sur le téléphone\n<input type="date">    sélecteur de date intégré\n<input type="number">  flèches, chiffres uniquement\n<input type="file" accept="image/*">',
      points:[
        'Un type natif apporte un comportement que tu écrirais sinon à la main, avec des bugs.',
        'autocomplete="email" fait remplir par le navigateur — énorme pour les personnes à mobilité réduite.',
        'required donne la validation sans une seule ligne de JavaScript.'
      ]},

    { t:'door', id:'III.3', core:true, kind:'choice',
      q:'Quel est le <b>type</b> par défaut d’un &lt;button&gt; dans un &lt;form&gt; ?',
      options:['button','submit','reset','aucun — il faut le préciser'],
      correct:1,
      hint:'Le bug classique : tu cliques sur « Afficher le mot de passe » et la page se recharge.',
      explain:'Tout <button> dans un formulaire est un bouton d’envoi tant que tu ne dis pas le contraire. Pour un bouton qui fait autre chose, écris type="button" explicitement.',
      teach:'C’est le bug que tout le monde a écrit au moins une fois. Demande qui s’est fait avoir.'},

    { t:'door', id:'III.4', kind:'choice',
      q:'Le lecteur d’écran dit : « Coursier, bouton radio, 1 sur 2. » Que manque-t-il ?',
      code:'<label><input type="radio" name="livraison"> Coursier</label>\n<label><input type="radio" name="livraison"> En point relais</label>',
      options:['&lt;fieldset&gt; et &lt;legend&gt;','aria-label sur chaque champ','&lt;form&gt; autour du tout','des attributs value'],
      correct:0,
      hint:'L’utilisateur entend les réponses. Mais pas la question.',
      explain:'<fieldset> les regroupe et <legend> fournit la question : « Mode de livraison ». Sans cela, tu entends les réponses sans savoir à quoi elles répondent.',
      teach:''},

    { t:'room', title:'Aides et erreurs', lead:'Une erreur doit être rattachée au champ, pas simplement posée à côté.',
      code:'<label for="pass">Mot de passe</label>\n<input type="password" id="pass"\n       aria-describedby="aide err"\n       aria-invalid="true" required>\n<p id="aide">Au moins 8 caractères.</p>\n<p id="err" role="alert">Le mot de passe est trop court.</p>',
      points:[
        'aria-describedby rattache un texte complémentaire au champ.',
        'aria-invalid="true" indique que le champ est en erreur.',
        'role="alert" annonce le message dès son apparition.',
        'Une bordure rouge à elle seule n’est pas une information.'
      ]},

    { t:'door', id:'III.5', kind:'match',
      q:'Associe l’attribut à ce qu’il fait.',
      pairs:[['aria-describedby','rattache un texte complémentaire'],['aria-invalid','le champ est en erreur'],['required','champ obligatoire'],['autocomplete','le navigateur remplit à ta place']],
      hint:'L’un d’eux n’a rien à voir avec ARIA et fonctionne depuis des années.',
      explain:'Les deux premiers sont ARIA — ils ne font qu’annoncer. Les deux autres sont natifs et changent réellement le comportement du navigateur.',
      teach:''},

    { t:'door', id:'III.6', kind:'choice',
      q:'Pourquoi &lt;input type="tel"&gt; vaut-il mieux que type="text" pour un téléphone ?',
      options:['Il valide le numéro','Le téléphone affiche un pavé numérique','Il formate le numéro automatiquement','Il n’y a pas de différence'],
      correct:1,
      hint:'Pense à ce que voit la personne qui remplit le formulaire depuis son téléphone.',
      explain:'type="tel" ne valide pas (les numéros varient trop dans le monde), mais il fait apparaître le pavé numérique. Un attribut épargne deux gestes à l’utilisateur sur chaque champ.',
      teach:''},

    { t:'door', id:'III.7', core:true, kind:'tab',
      q:'Clique les champs dans l’ordre où la touche Tab les visitera.',
      fields:[
        {label:'Recherche', attr:''},
        {label:'Nom', attr:''},
        {label:'Courriel', attr:'tabindex="1"'},
        {label:'Message', attr:''},
        {label:'Envoyer', attr:''}
      ],
      correct:[2,0,1,3,4],
      hint:'Un tabindex positif ne prend pas la file. Il passe devant tout le monde.',
      explain:'Les éléments avec un tabindex positif sont visités EN PREMIER, classés par leur numéro, et seulement ensuite vient l’ordre naturel du document. C’est pourquoi « Courriel » passe en tête alors qu’il est troisième sur la page. N’utilise que tabindex="0" et tabindex="-1".',
      teach:'Demande : si ce site a 30 champs de ce genre, où atterrit l’utilisateur ?'},

    { t:'door', id:'III.8', kind:'choice',
      q:'Le message d’erreur n’est signalé que par une bordure rouge. Où est le problème ?',
      options:['Le rouge est une couleur agressive','La couleur n’est pas une information pour tout le monde','Les bordures sont une approche dépassée','Il n’y a pas de problème'],
      correct:1,
      hint:'Qui ne verra pas le rouge ? Pense à au moins trois personnes différentes.',
      explain:'Daltonisme, lecteur d’écran, impression en noir et blanc, plein soleil sur l’écran. L’information doit être codée au moins deux fois : couleur + texte + icône.',
      teach:'Environ 8 % des hommes ont une forme de daltonisme. Dans une classe de 30, cela fait statistiquement au moins un.'}
  ]
},

/* ═══════════════════════════ AILE IV ═══════════════════════════ */
{
  id:'aria',
  name:'ARIA',
  artifact:'Le Prisme des rôles',
  blurb:'L’arbre d’accessibilité, les rôles, les états, les régions live et les cinq règles.',
  secret:{
    title:'Un accordéon sans une seule ligne de JavaScript',
    text:'<details> et <summary> donnent un accordéon qui marche : il s’ouvre, il se ferme, il répond au clavier, il annonce son état au lecteur d’écran. Des millions de lignes de JavaScript existent dans le monde pour recréer ce que le navigateur offre gratuitement — et le recréent généralement moins bien.',
    code:'<details>\n  <summary>Afficher la suite</summary>\n  <p>Le contenu masqué.</p>\n</details>'
  },
  steps:[
    { t:'room', title:'L’arbre d’accessibilité', lead:'Le navigateur ne donne pas ton HTML au lecteur d’écran. Il construit une seconde structure.',
      code:'  HTML ──parse──▶ DOM ──▶ Arbre d’accessibilité ──▶ 🔊 lecteur\n                   │                                ⌨️ voix\n                   └──▶ CSSOM ──▶ Render Tree ──▶ 🖥️ pixels',
      points:[
        'Chaque nœud a quatre choses : rôle, nom, état, valeur.',
        'Rôle — qu’est-ce que c’est ? Nom — comment ça s’appelle ? État — dans quel état est-ce ?',
        'La commande vocale et les tests automatisés tournent sur le même arbre.',
        'Vois-le toi-même : DevTools → Elements → Accessibility.'
      ]},

    { t:'door', id:'IV.1', core:true, kind:'choice',
      q:'Que <b>fait</b> réellement ARIA ?',
      options:['Change l’apparence','Ajoute la prise en charge du clavier','Change ce qu’annonce le navigateur','Rend l’élément focalisable'],
      correct:2,
      hint:'ARIA est une étiquette collée sur la boîte. Qu’est-ce qui change dans la boîte ?',
      explain:'ARIA ne change rien visuellement, n’ajoute aucun comportement, ne rend pas un élément focalisable et n’apporte pas le clavier. Elle ne change que ce qui est écrit dans l’arbre d’accessibilité. Tout le reste reste ton travail.',
      teach:'C’est la diapositive la plus importante de toute la section. Dis-le deux fois.'},

    { t:'room', title:'D’où vient le nom', lead:'Le navigateur cherche dans un ordre strict. Le premier trouvé l’emporte.',
      code:'1. aria-labelledby   pointe vers l’id d’un autre élément\n2. aria-label        texte écrit dans l’attribut\n3. le natif          <label>, alt, <legend>, <caption>\n4. le contenu        le texte dans <button>Envoyer</button>\n5. title             dernier recours, peu fiable',
      points:[
        'aria-labelledby bat tout — y compris le texte visible.',
        'C’est pourquoi un aria-label erroné est plus dangereux qu’un aria-label absent : il fait taire le texte correct.',
        'La commande vocale utilise le même nom : « clique Envoyer ».'
      ]},

    { t:'door', id:'IV.2', core:true, kind:'order',
      q:'Mets dans l’ordre le calcul du nom accessible. Le plus fort en haut.',
      items:['aria-labelledby','aria-label','le natif (label / alt / legend)','le contenu textuel','title'],
      hint:'En haut se trouve celui qui peut faire taire tous les autres.',
      explain:'Les attributs ARIA battent le natif, et title vient en dernier et n’est pas fiable. D’où une règle pratique : ne mets pas d’aria-label sur un bouton qui a déjà un texte correct — tu risques de le remplacer par pire.',
      teach:''},

    { t:'door', id:'IV.3', kind:'choice',
      q:'Quelles sont les quatre choses que l’arbre d’accessibilité sait d’un élément ?',
      options:['balise, classe, id, style','rôle, nom, état, valeur','largeur, hauteur, couleur, position','parent, enfant, voisin, racine'],
      correct:1,
      hint:'Qu’est-ce que c’est ? Comment ça s’appelle ? Dans quel état est-ce ? Quelle est sa valeur ?',
      explain:'Rôle, Nom, État, Valeur. Si tu connais ces quatre-là et les trois questions derrière, tu sais comment pense toute technologie d’assistance.',
      teach:''},

    { t:'door', id:'IV.4', core:true, kind:'sr',
      q:'Qu’annonce le lecteur d’écran ?',
      code:'<button aria-expanded="false">Menu</button>',
      options:['« Menu »','« Menu, bouton »','« Menu, bouton, réduit »','« Menu, réduit »'],
      correct:2,
      hint:'Trois choses : nom, rôle, état. D’où vient chacune ?',
      explain:'Le nom « Menu » vient du texte, le rôle « bouton » de la balise, l’état « réduit » de aria-expanded. Seul le troisième est de l’ARIA. Les deux autres, tu les as gratuitement.',
      teach:'Demande à la classe laquelle des trois vient d’ARIA. Ils répondent presque toujours « les trois ».'},

    { t:'room', title:'Les régions live', lead:'Si JavaScript change un texte à l’écran, le lecteur ne le remarque pas. Il faut lui dire de surveiller.',
      code:'<div aria-live="polite" id="status"></div>\n<!-- plus tard : status.textContent = "Ajouté au panier" -->\n\n<div role="alert">Paiement refusé.</div>',
      points:[
        'polite — attend que le lecteur ait fini. Pour « Enregistré », « 3 résultats ».',
        'assertive — interrompt aussitôt. Seulement pour les erreurs et les minuteurs qui expirent.',
        'role="alert" est un assertive tout prêt.',
        'La région doit exister dans le DOM AVANT que tu y mettes du texte.'
      ]},

    { t:'door', id:'IV.5', core:true, kind:'fix',
      q:'Quelle ligne enfreint la règle 4 d’ARIA ?',
      lines:['<nav>','  <button aria-hidden="true">Envoyer</button>','  <span aria-hidden="true">🗑️</span>','</nav>'],
      correct:1,
      hint:'L’un est focalisable. L’autre non.',
      explain:'aria-hidden sur un élément focalisable crée un fantôme : le bouton s’atteint avec Tab, mais le lecteur n’a rien à dire. L’utilisateur se tient sur du vide. Sur l’icône décorative, en revanche, c’est exactement la bonne chose.',
      teach:''},

    { t:'door', id:'IV.6', kind:'choice',
      q:'Quand utilise-t-on aria-live="assertive" ?',
      options:['À chaque changement à l’écran','Seulement pour du critique : une erreur, un minuteur qui expire','Jamais','Au chargement de la page'],
      correct:1,
      hint:'Que veut dire interrompre quelqu’un au milieu d’une phrase ?',
      explain:'assertive interrompt le lecteur immédiatement. Employé pour la moindre broutille, il transforme la page en interruption permanente. Pour tout le reste — polite.',
      teach:''},

    { t:'door', id:'IV.7', core:true, kind:'fill',
      q:'Le bouton n’a qu’une icône. Donne-lui un nom.',
      before:'<button aria-', after:'="Fermer">✕</button>', accept:['label'],
      hint:'Cinq lettres. Du texte écrit directement dans l’attribut.',
      explain:'Sans nom, le lecteur dit seulement « bouton » et l’information s’arrête là. aria-label donne un nom là où il n’y a pas de texte visible. Règle 5 : tout élément interactif doit avoir un nom accessible.',
      teach:''},

    { t:'room', title:'Les cinq règles d’ARIA', lead:'Les Rules of ARIA Use officielles. Si tu ne retiens que cela — cela suffit.',
      code:'1. N’utilise pas ARIA s’il existe un élément natif.\n2. Ne change pas la sémantique native sans raison.\n3. Tout élément ARIA interactif marche au clavier.\n4. Pas de role="presentation" ni d’aria-hidden sur du focalisable.\n5. Tout élément interactif a un nom accessible.',
      points:[
        'Pas d’ARIA vaut mieux qu’une mauvaise ARIA. — W3C',
        'ARIA est un scalpel, pas un pansement.',
        'Elle est nécessaire pour les onglets, les arbres, les listes déroulantes, les modales et les messages live — des choses pour lesquelles HTML n’a pas d’élément.'
      ]},

    { t:'door', id:'IV.8', kind:'choice',
      q:'Énonce la règle 1 d’ARIA.',
      options:['Ajoute toujours un rôle à chaque élément','S’il existe un élément HTML natif de même sémantique — utilise-le','ARIA s’écrit avant class','Chaque div a besoin d’un aria-label'],
      correct:1,
      hint:'Lequel est plus court : <button>, ou un div avec un rôle, un tabindex et deux gestionnaires keydown ?',
      explain:'<button> apporte le focus, Entrée, Espace, disabled et le bon rôle, gratuitement. La même chose avec un div demande une trentaine de lignes de JavaScript, presque toujours incomplètes.',
      teach:''},

    { t:'door', id:'IV.9', kind:'tree',
      q:'Complète le nœud dans l’arbre d’accessibilité.',
      code:'<label for="a">J’accepte</label>\n<input type="checkbox" id="a" checked>',
      role:{options:['checkbox','textbox','button','switch'],correct:'checkbox'},
      name:{options:['a','(aucun)','J’accepte','checkbox'],correct:'J’accepte'},
      state:{options:['(aucun)','checked','expanded','invalid'],correct:'checked'},
      hint:'Le nom vient de l’étiquette associée, l’état de l’attribut du champ.',
      explain:'Rôle : checkbox (depuis type). Nom : « J’accepte » (depuis <label for>). État : checked. Les trois viennent du HTML natif — pas une ligne d’ARIA.',
      teach:''},

    { t:'door', id:'IV.10', kind:'choice',
      q:'D’après les analyses de WebAIM, les pages qui <b>utilisent</b> ARIA comptent en moyenne <b>plus</b> d’erreurs d’accessibilité que celles qui s’en passent. Pourquoi ?',
      options:['ARIA est mal conçue','On la pose en pansement sur un balisage cassé — et on la pose mal','Les lecteurs d’écran ne la prennent pas en charge','Les statistiques sont fausses'],
      correct:1,
      hint:'Qui se tourne vers ARIA — celui qui a écrit <button>, ou celui qui a écrit <div> ?',
      explain:'ARIA n’y est pour rien. Ce qui est en cause, c’est qu’on y recourt quand le balisage est déjà cassé, et qu’on l’applique alors au hasard. D’où la règle : pas d’ARIA vaut mieux qu’une mauvaise ARIA.',
      teach:'C’est le moment de revenir à la règle 1 et de boucler la boucle.'}
  ]
}
],

/* ═══════════════════════════ LE BOSS ═══════════════════════════ */
boss: {
  intro: 'Les quatre clés tournent. La porte s’ouvre et l’écran s’éteint.\n\nÀ partir d’ici, tu ne vois plus rien. Tu te déplaces avec Tab, tu actives avec Entrée, et tout ce que tu apprends de la page vient d’une seule voix.\n\nVoilà exactement à quoi ressemble le web pour quelqu’un qui utilise un lecteur d’écran.',
  stages: [
    {
      title:'Étape 1 — Une page sans titres',
      task:'Trouve la section « Livraison ».',
      items:[
        {say:'paragraphe, Bienvenue dans notre magasin d’électronique fort de plus de 20 ans d’expérience'},
        {say:'paragraphe, Nous travaillons avec les grandes marques et garantissons tous nos produits'},
        {say:'paragraphe, Notre équipe est disponible tous les jours ouvrés'},
        {say:'paragraphe, Fondée en 2004, la boutique a commencé comme un petit atelier de réparation'},
        {say:'paragraphe, Nous livrons partout dans le pays par coursier sous 48 heures', goal:true},
        {say:'paragraphe, Suivez-nous sur les réseaux sociaux pour les promotions'}
      ],
      lesson:'Sans titres, la page est un seul paragraphe sans fin. La touche H d’un lecteur d’écran saute de titre en titre — mais seulement s’il y a des titres. Tu viens de traverser tout le reste pour trouver une phrase.',
      fixedTask:'Maintenant la même chose, avec <h2>. Trouve « Livraison ».',
      fixedItems:[
        {say:'titre niveau 2, À propos'},
        {say:'titre niveau 2, Livraison', goal:true},
        {say:'titre niveau 2, Garantie'},
        {say:'titre niveau 2, Contact'}
      ],
      fix:'<h2>Livraison</h2>'
    },
    {
      title:'Étape 2 — Des liens sans texte',
      task:'Va à la page sur le retour d’un article.',
      unknowable:true,
      items:[
        {say:'lien, cliquez ici'},
        {say:'lien, cliquez ici'},
        {say:'lien, cliquez ici'},
        {say:'lien, cliquez ici'},
        {say:'lien, cliquez ici'},
        {say:'lien, cliquez ici'}
      ],
      wrongMsg:'Une page sur les cookies s’est ouverte. Reviens en arrière.',
      lesson:'Il n’y avait aucun moyen de savoir. C’est précisément le problème. Le texte d’un lien doit avoir du sens tout seul — parce que le lecteur a un mode qui ne liste que les liens, sortis des phrases qui les entourent.',
      fixedTask:'Maintenant avec un texte parlant. Trouve la page des retours.',
      fixedItems:[
        {say:'lien, Livraison et délais'},
        {say:'lien, Retour d’un article', goal:true},
        {say:'lien, Conditions de garantie'},
        {say:'lien, Contact'}
      ],
      fix:'<a href="/retours">Retour d’un article</a>'
    },
    {
      title:'Étape 3 — Des boutons sans nom',
      task:'Ajoute le produit au panier.',
      unknowable:true,
      items:[
        {say:'bouton'},
        {say:'bouton'},
        {say:'bouton'},
        {say:'bouton'}
      ],
      wrongMsg:'Le produit a été retiré de ta liste d’envies.',
      lesson:'Un bouton-icône sans nom est annoncé simplement « bouton ». L’information s’arrête là. aria-label="Ajouter au panier" est un seul attribut et règle tout.',
      fixedTask:'Maintenant avec des noms. Ajoute au panier.',
      fixedItems:[
        {say:'bouton, Ajouter à la liste d’envies'},
        {say:'bouton, Comparer'},
        {say:'bouton, Ajouter au panier', goal:true},
        {say:'bouton, Partager'}
      ],
      fix:'<button aria-label="Ajouter au panier">🛒</button>'
    },
    {
      title:'Étape 4 — Un formulaire sans étiquettes',
      task:'Saisis ton courriel.',
      unknowable:true,
      items:[
        {say:'champ de texte'},
        {say:'champ de texte'},
        {say:'champ de texte'},
        {say:'champ de texte'}
      ],
      wrongMsg:'Tu as saisi ton courriel dans le champ du code postal.',
      lesson:'Un placeholder n’est pas une étiquette. Un champ sans <label> est une boîte sans inscription — et un formulaire mal rempli, c’est la différence entre la personne qui achète et celle qui abandonne.',
      fixedTask:'Maintenant avec des étiquettes. Saisis le courriel.',
      fixedItems:[
        {say:'champ de texte, Nom'},
        {say:'champ de texte, Courriel', goal:true},
        {say:'champ de texte, Téléphone'},
        {say:'champ de texte, Code postal'}
      ],
      fix:'<label for="email">Courriel</label>\n<input id="email" type="email">'
    },
    {
      title:'Étape 5 — Une erreur signalée par la seule couleur',
      task:'Envoie le formulaire.',
      unknowable:true,
      items:[
        {say:'champ de texte, Courriel'},
        {say:'bouton, Envoyer', silent:true},
        {say:'lien, Conditions générales'}
      ],
      wrongMsg:'Rien ne se passe. Silence.',
      lesson:'Le formulaire ne part pas parce que le courriel est invalide — et cela n’est signalé que par une bordure rouge. Pour qui ne voit pas l’écran, la page se tait, tout simplement. Voilà pourquoi role="alert" existe : le message est annoncé au moment où il apparaît.',
      fixedTask:'Maintenant avec role="alert". Renvoie-le.',
      fixedItems:[
        {say:'champ de texte, Courriel, valeur invalide'},
        {say:'bouton, Envoyer', goal:true, onGoal:'alerte : Le courriel est invalide. Vérifie l’adresse.'},
        {say:'lien, Conditions générales'}
      ],
      fix:'<p role="alert">Le courriel est invalide.</p>'
    }
  ],
  outro:'Tu viens de traverser une page comme des millions de personnes en traversent une chaque jour.\n\nEntre la version cassée et la version réparée, l’écart était de huit attributs.'
}
};
