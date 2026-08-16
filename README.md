# Verrière

Un particulier reçoit soixante pages de PDF technique et n'a qu'une question :
**est-ce que c'est grave ?**

Verrière lit son rapport de diagnostic immobilier dans le navigateur. Le
rapport s'affiche d'un côté, les passages qui comptent y sont surlignés : on en
touche un, l'explication arrive en face — en puces, avec un petit dessin. Des
antisèches, pas un cours.

## Point ouvert : le dessin des pages

Les pages du PDF sont dessinées pour être annotées. **Ce rendu ne fonctionne pas
dans le navigateur de prévisualisation de Claude Code** — à vérifier dans un
navigateur ordinaire.

Ce qui a été écarté par la mesure, pour ne pas refaire le tour deux fois :

| Hypothèse | Résultat |
| --- | --- |
| Résolution demandée trop grande | 200 px ne va pas plus vite que 900 px |
| Canevas détaché du document | l'attacher au DOM ne change rien |
| Document abîmé par l'extraction | un second document rouvert bloque pareil |
| Attente d'une police système | `useSystemFonts: false` + `disableFontFace` : identique |
| Le document lui-même | un PDF d'un seul carré rouge s'ouvre en 141 ms et ne se dessine pas |

En attendant, l'interface se replie sur le **texte** de la page, avec les mêmes
surlignages : l'écran reste utilisable, et le dessin s'ajoute dès qu'il aboutit
(huit secondes maximum par page, en tâche de fond).

## Principes

1. **Le document ne quitte pas l'appareil.** Le PDF est lu par pdf.js côté
   client. Pas de serveur, pas de compte, pas de téléversement. La page
   fonctionne connexion coupée.
2. **Aucun chiffre inventé.** Tout ce qui s'affiche est extrait du rapport.
   Quand une valeur n'est pas lisible, c'est écrit — jamais deviné, jamais
   approché. Un verdict faux serait pire que pas de verdict.
3. **Le rapport reste la référence.** L'outil reformule, il ne remplace pas et
   n'a aucune valeur réglementaire.

## Diagnostics couverts

DPE et audit énergétique, installation électrique, installation de gaz, amiante,
plomb (CREP), termites, état des risques et pollutions (ERP), assainissement non
collectif, superficie loi Carrez.

Un « dossier technique » qui réunit plusieurs diagnostics dans un seul PDF est
découpé automatiquement, rapport par rapport.

## Trois pièges déjà traités

Ils expliquent la forme du code, autant les connaître avant d'y toucher.

- **L'étiquette A→G est une image.** Dans les rapports, la lettre colorée est
  dessinée : impossible de la lire. Elle est donc *recalculée* à partir de la
  consommation, de la surface et des émissions, avec les seuils de l'arrêté du
  31 mars 2021 et la règle du double seuil. L'interface le dit au lecteur.
- **Les rapports citent des chiffres qui ne sont pas ceux du logement.** Un
  audit énergétique contient le seuil légal (« CEF < 450 kWh/m²/an ») et les
  gains après travaux (« - 476 kWhEP/m²/an ») dans le même format que la
  consommation réelle. Le moteur ne lit donc **que** des valeurs dont la phrase
  d'origine désigne sans ambiguïté ce logement-ci, à son état actuel.
- **Il n'existe pas de rapport isolé par diagnostic.** Un diagnostiqueur ne
  remet pas un `ELEC.pdf` et un `GAZ.pdf` : il remet un dossier technique qui
  contient tout. Le banc de calibration a longtemps échantillonné par nom de
  fichier et tirait donc zéro fichier pour six familles sur sept — sans que
  rien ne le signale. Il mesure aujourd'hui **par diagnostic trouvé**, et
  imprime une carte de couverture.
  Ce que cette carte a montré : dans deux tiers des dossiers, il n'y a
  réellement pas de diagnostic électricité. Le moteur ne le rate pas, il est
  absent — d'où le contrôle qui le réclame désormais.

## « En clair »

Une rubrique publique de questions-réponses, à `/en-clair/` : un thème par
famille de sujets, une page par question, un dessin quand il explique mieux
qu'un paragraphe.

Elle ne vit **pas** dans l'application. Ce sont de vraies pages HTML, écrites
dans `dist/` au moment du build par `scripts/plugin-nuls.ts` — sans bundle, sans
hydratation, sans appel réseau. C'est une décision de référencement autant que
d'accessibilité : une réponse qui n'existe qu'après exécution d'un bundle
n'existe ni pour un moteur de recherche, ni pour un téléphone en bord de réseau.

| Chemin | Rôle |
| --- | --- |
| `src/lib/nuls/socle.ts` | les types : une question, un thème, une source |
| `src/lib/nuls/themes/*.ts` | le contenu, un fichier par thème |
| `src/lib/nuls/dessins.ts` | les schémas, en SVG écrit à la main |
| `src/lib/nuls/rendu.ts` | la fabrique des pages, du sitemap et du robots.txt |
| `src/lib/nuls/og.ts` | les cartes de partage (1200 × 630) |
| `scripts/plugin-nuls.ts` | le plugin Vite : sert en dev, écrit au build |
| `public/en-clair.css` | la feuille de la rubrique, autonome |

### Les cartes de partage

Une image par page — 89 —, rendue en PNG 1200 × 630 au build par
`@resvg/resvg-js`, dans `dist/og/`. La question y est écrite en Fraunces, coupée
en lignes selon la largeur réelle du texte. Elles sont visibles en développement
à `/og/<thème>/<question>.png`.

Trois pièges y sont déjà tombés, autant les connaître avant d'y toucher :

- **Le rastériseur ignore `fontBuffers`.** Sans rien signaler : il retombe sur
  une police de secours, et les cartes sortent dans un caractère qui n'est pas
  celui de la marque. Seul `fontFiles` fonctionne — d'où le fichier temporaire
  écrit par `scripts/police-cartes.ts`.
- **Fraunces est une police variable.** Le rastériseur en tire une instance qui
  n'est pas celle du navigateur, et les largeurs de `hmtx` cessent d'être
  fiables. Elle est donc figée (graisse 600, taille optique 144) avant usage.
- **Mesurer en rendant coûte 200 ms par appel.** Les largeurs sont donc lues
  dans les tables de la police (`scripts/metriques-police.ts`), et
  `metriques-police.test.ts` vérifie que ce calcul colle bien au tracé. C'est ce
  test qui a démasqué les deux points précédents.

L'étape `fonts-dejavu-core` du workflow de déploiement reste nécessaire : les
mentions du bas de carte sont dans la linéale du système, pas dans Fraunces.

### Avant la première mise en ligne

**Signez le site.** `src/lib/nuls/editeur.ts` vaut encore `null`. Tant qu'il
l'est, trois pages ne sont pas fabriquées — « qui écrit ces pages », les
mentions légales, la page de confidentialité — et aucun auteur n'apparaît dans
les données structurées.

Ce n'est pas une formalité : ces pages parlent de plomb chez des enfants, de
monoxyde de carbone et de décisions à plusieurs dizaines de milliers d'euros.
Sur ce terrain, un moteur de recherche regarde *qui écrit* avant de regarder ce
qui est écrit. C'est le manque le plus coûteux du site, et `npm run seo` le
répète à chaque passage.

Rien n'y est deviné à votre place : des mentions légales inventées engageraient
quelqu'un.

**Réglez l'adresse du site.** `SITE`, en tête de `src/lib/nuls/rendu.ts`, sert
aux liens canoniques, aux données structurées et au sitemap. Sa valeur par
défaut est un exemple. Passez la vôtre par l'environnement :

```bash
CMD_SITE=https://mon-domaine.fr npm run build
```

Un canonique qui pointe vers un domaine qui n'est pas le vôtre est pire que pas
de canonique.

### La boucle de référencement, automatique

Le cadre est écrit dans
[ORDRE-DE-MISSION-REFERENCEMENT.md](ORDRE-DE-MISSION-REFERENCEMENT.md). Il ne se
pilote pas à la main :

```bash
npm run seo
```

L'audit compare le corpus au **registre des intentions**
(`src/lib/nuls/intentions.ts`) — ce que les gens tapent réellement dans un
moteur de recherche — et imprime la couverture, les questions à écrire triées
par poids, les pages sans schéma, sans « piège » ou sans retour au rapport du
lecteur, et celles dont le contenu réglementaire n'a pas été revérifié depuis
plus de six mois.

Ce registre **doit rester plus large que le corpus** : ce sont ses lignes sans
réponse qui indiquent le travail suivant. Une couverture à 100 % est le signal
qu'il faut l'élargir, pas qu'on a fini.

L'audit tourne à chaque déploiement (informatif), et une tâche programmée
hebdomadaire exécute la boucle complète — analyser, écrire deux à quatre
questions manquantes, revérifier les règles datées, contrôler, rendre compte.

### Ajouter une question

Une entrée dans le tableau `questions` du thème concerné. La réponse courte est
ce que lira la majorité des gens — et c'est la description de la page dans les
résultats de recherche : elle doit se suffire.

`npm test` refuse le corpus si un renvoi pointe vers une question qui n'existe
pas, si deux questions partagent une adresse, si un dessin est appelé sans
exister, ou si une réponse réglementaire n'est pas datée. Le build s'arrête sur
les mêmes renvois morts.

En développement, `/en-clair/planche/` affiche les dessins côte à côte.
Cette page n'est jamais publiée : elle sert à repérer d'un coup celui qui déborde
de son cadre.

## Développement

```bash
npm install
npm run dev      # http://localhost:5181
npm test         # moteur d'analyse
npm run check    # types
```

### Tester sur de vrais rapports

`src/lib/analyse/reel.test.ts` rejoue le moteur sur un dossier de PDF réels. Ces
fichiers ne sont pas dans le dépôt (données personnelles) : le test se saute
tout seul s'il ne les trouve pas.

```bash
CMD_PDF_DIR="/chemin/vers/mes/rapports" npm test
```

Pour comprendre la structure d'un rapport récalcitrant :

```bash
node scripts/dump-pdf.mjs "rapport.pdf" 8      # texte, ligne par ligne
node scripts/inspect-pdf.mjs "rapport.pdf" 4   # fragments bruts + images
```

## Structure

| Chemin | Rôle |
| --- | --- |
| `src/lib/pdf.ts` | lecture du PDF (navigateur) |
| `src/lib/lignes.ts` | reconstruction des lignes à partir des fragments |
| `src/lib/analyse/decoupe.ts` | découpage d'un dossier en diagnostics |
| `src/lib/analyse/*.ts` | un extracteur par famille de diagnostic |
| `src/lib/modele.ts` | modèle de données commun |
| `src/composants/` | interface : dépôt, cartes, schémas |
