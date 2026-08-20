# Mémoire d'excellence — Verrière

> Ce fichier est le référentiel permanent exigé par le §15 de la Constitution.
> Il n'est pas une documentation du code : il capitalise **ce qu'on a appris en
> se trompant**, pour qu'une erreur corrigée une fois ne se corrige pas deux
> fois pour la même cause.
>
> Chaque entrée porte une **mesure**, pas une impression. Une règle sans chiffre
> est une opinion, et les opinions ne protègent de rien.

---

## ANTI_PATTERNS — ce qu'il ne faut plus jamais reproduire

### A1. La sonde qui ment

**Trois fois dans la même session**, un outil de mesure a produit un faux défaut,
et trois fois j'ai failli « corriger » quelque chose de sain.

| Ce que la sonde lisait | Ce qu'elle rendait | La vérité |
|---|---|---|
| `color(srgb 0.69 0.71 0.68)` interprété en 0-255 | contraste 1,73 | 5,83 |
| un voile translucide à 14 % ignoré, remontée jusqu'au `body` blanc | 1,39 sur les sept onglets | 9,83 et 5,72 |
| bloc CSS découpé à la première accolade fermante | « jeton introuvable » | le jeton était là |

**Règle.** Avant de croire une mesure qui accuse, vérifier la mesure elle-même
sur un cas dont on connaît la réponse. Une sonde qui trouve beaucoup de défauts
d'un coup est suspecte avant d'être utile.

**Corollaire mesuré.** Le plomb affichait « 22 % de localisation » — chiffre
alarmant. Après séparation des cas : 8 CREP **négatifs** (rien à localiser, c'est
normal), 4 positifs localisés, **1 seul** réellement défaillant. Le 22 % mesurait
autre chose que ce qu'il annonçait.

### A2. Le compteur de mots pris pour un compteur d'anomalies

`schema.groupes` comptait les **occurrences d'un mot** dans le volet
électricité. Les six domaines de l'arrêté du 28 septembre 2017 étant imprimés
dans *tous* les rapports :

> **15 volets sur 33 ne relevaient aucune anomalie — et les 15 affichaient six
> groupes d'anomalies.** 33 sur 33 avaient un écart entre le total annoncé et la
> somme des groupes.

Le lecteur d'un logement sain voyait six manettes orange, chacune légendée
« 3 anomalies », **sous la phrase « le rapport ne relève aucune anomalie »**.

**Règle.** Compter des occurrences d'un motif dans un texte réglementaire ne
produit jamais un compte de constats : le texte réglementaire est imprimé que le
constat existe ou non. Un compte doit venir d'une **liste énumérée**, pas d'une
recherche.

**Règle générale.** Transformer une information non trouvée en information
rassurante est interdit. Transformer une **bonne** nouvelle en mauvaise est pire :
on alarme quelqu'un pour rien, sur un sujet où l'alarme coûte cher.

### A3. La donnée extraite puis jetée

**Trois occurrences**, toutes trouvées en cherchant « pourquoi cet écran ne dit-il
rien ? » :

| Donnée | Extraite par | Ce qui l'affichait |
|---|---|---|
| les emplacements du plomb (zone, élément, classe) | `plomb.ts` | rien |
| le tableau pièce par pièce de la Carrez | `piecesMesurees()` | un total |
| la consommation par poste du DPE (29 sur 31) | `analyserDpe` | rien |

**Règle.** Avant de conclure qu'une information manque, chercher si elle est
déjà **extraite et non transportée**. Le moteur en sait presque toujours plus que
l'écran n'en montre.

### A4. Le dessin qui doit se démentir lui-même

Le coffret électrique passait trois paragraphes de commentaire à expliquer que ce
n'était **pas** le tableau du logement, puis l'écrivait sous le dessin : « un
module par point de contrôle de la norme, pas par circuit ».

**Règle.** Un dessin qui a besoin d'un démenti coûte plus qu'il ne rapporte. Il
fait croire quelque chose de faux à ceux qui ne lisent pas la légende — c'est-à-dire
presque tout le monde. Le remplacer, pas l'annoter.

### A5. Le mensonge par mise en page

Le visuel du plomb dessinait cinq éprouvettes dont la hauteur venait de
`max(PLANCHER, min(1, n / base) * ECHELLE)`. Sur un constat réel du corpus :

> tube de la **classe 0** (le « rien ») rempli à **0,68** · classe 3 à **0,19**,
> alors que 36 revêtements dégradés déclenchaient des travaux obligatoires.

L'œil lisait « majoritairement vert ».

**Règle.** Une échelle qui donne le plus de place au « rien » ment, même si chaque
chiffre est exact. Vérifier ce que la **surface visuelle** raconte, pas seulement
ce que les valeurs disent.

### A6. Le décor qui se déclare lui-même décoratif

Le tronc des termites portait dans son propre commentaire : « entièrement
décoratif : tout ce qu'il montre est écrit dessous ». Il coûtait un disque de
cernes, un dégradé hors charte, une ombre, un halo et trois animations.

**Neuf animations en boucle** ont été retirées dans six composants — dont une
grille de cases qui « respirait » **au-dessus d'un constat de parasites**.

**Règle.** Une animation en boucle attire l'œil en permanence. Sur un écran qui
porte un diagnostic, c'est du bruit qui concurrence l'information. Une animation
se garde si elle **démontre** ; sinon elle part.

### A7. Le signal de provenance posé à l'envers

Le seul bloc encadré de la fiche — fond plein, filet de 3 px — habillait de la
**prose de Verrière**, pendant que le chiffre du rapport et les relevés n'avaient
aucune marque.

**Règle.** La matière la plus forte de l'écran appartient à la donnée du rapport,
jamais au commentaire.

---

## DESIGN_PRINCIPLES — les principes validés par la mesure

### P1. La distinction rapport / explication tient sans la couleur

Quatre signaux, aucun chromatique :

1. **la matière** — le rapport sur carte opaque, Verrière en texte nu ;
2. **le bord gauche** — la carte va bord à bord, l'explication est en retrait de 14 px ;
3. **les chiffres** — tabulaires sur la carte, proportionnels hors carte ;
4. **l'italique** — interdite au rapport, réservée à Verrière.

*Vérification :* passer la fiche en `grayscale(1) blur(3px)` — les quatre tiennent.

### P2. Six niveaux de texte, pas deux

Avant : **neuf noms de jetons** s'effondraient sur une seule valeur et quatre sur
une seconde. Il n'existait que deux niveaux réels, séparés d'un facteur 1,5 —
aucune hiérarchie n'est exprimable avec deux valeurs.

Après, mesuré sur la fiche DPE : **12,07 → 10,96 → 8,74 → 5,72 → 5,69**.

### P3. La forme porte l'état avant la couleur

Un daltonien lit la forme, une capture en noir et blanc aussi.

| Objet | Comment la forme dit l'état |
|---|---|
| barrière électrique | porte pleine / fendue / contour tireté |
| souffle de déperdition | trait plein / pointillé serré / pointillé fin / tirets longs |

### P4. Une couleur de gravité ne s'écrit pas

`--alerte` et `--attention` sont calées pour des **éléments graphiques**, dont le
seuil WCAG est 3:1. Employées comme couleur de **texte**, elles tombent sous 4,5 :

| | mesuré |
|---|---|
| « Anomalie » en `--alerte` | 3,91 |
| « Périmé depuis le… » | 4,40 |

**Le mot prend l'encre pleine et la graisse ; la couleur reste sur le dessin.**
La couleur renforce le mot, elle ne le porte pas.

### P5. Quand la même chose est dite deux fois, garder celle qui la dit le mieux

Le dessin des déperditions portait huit étiquettes, **toutes** répétées en
dessous. Les puces ont gagné : elles portent le mot d'état, font 44 px de haut,
et sont à taille de lecture au lieu d'être calées en unités de viewBox.

### P6. Le visuel d'identité d'un écran est ce que ce diagnostic sait dire de mieux

- Carrez → **le tableau de ses pièces** (un certificat de superficie *est* une liste de pièces)
- Plomb → **la liste des pièces** (le CREP est le diagnostic le plus finement localisé)
- Électricité → **la chaîne des barrières** (les six domaines sont une défense en profondeur)
- DPE → **la règle à deux aiguilles** (le seul verdict qui soit un point sur une graduation)

---

## READING_RULES — ce que les rapports font vraiment

Mesuré sur **60 dossiers réels** du corpus.

### R1. Qui situe, et qui ne situe rien

| Diagnostic | Volets | Avec localisation |
|---|---|---|
| Carrez | 33 | **100 %** — 224 lieux |
| Termites | 26 | **100 %** — 207 lieux |
| Amiante | 28 | 46 % |
| Plomb | 18 | 22 % (dont 8 CREP négatifs : rien à situer) |
| Électricité | 33 | **0 %** |
| DPE | 38 | **0 %** |
| ERP | 48 | **0 %** |
| Gaz | 6 | **0 %** |

**72 %** des dossiers nomment au moins trois pièces distinctes.

**Conséquence de conception.** Un « bâtiment à explorer » ne peut pas pointer une
pièce sur le DPE, l'électricité, l'ERP ni le gaz. Toute maquette qui le suppose
est morte-née.

### R2. Les faux noms de pièce

Parmi les « pièces » les plus fréquentes du corpus : **« Liste A » (13) et
« Liste B » (13)** — ce sont les catégories réglementaires de l'amiante, pas des
lieux. Un plan naïf leur donnerait un mur.

### R3. Ce que le corpus dit des noms de pièces

**148 zones sur 149** portent un vrai nom : « Salle d'eau », « Chambre 1 »,
« Séjour / Cuisine », « Dégagement ». Une seule était générique.

*Leçon :* si la vitrine montre « Pièce 1, Pièce 2 », c'est la **vitrine** qui est
pauvre, pas le moteur.

### R4. Le tableau de la Carrez

**33 volets sur 33** portent le tableau pièce par pièce. Mais **5 sur 32** ne
s'additionnent pas — un dossier donne 1 457,93 m² de lignes pour 22,93 m²
annoncés (des nombres d'un autre tableau ramassés au passage).

**Règle.** Un tableau qu'on additionne et qui ne donne pas le total imprimé juste
en dessous est **pire** que pas de tableau : le lecteur croit que le certificat se
contredit, alors que c'est notre lecture qui a fauté. Se taire, et dire pourquoi.

### R5. La consommation par poste du DPE

**29 volets sur 31**, soit 115 postes dont 111 avec leur coût en euros.
Chauffage, eau chaude, éclairage, auxiliaires, refroidissement.

---

## EDGE_CASES — les cas limites rencontrés

| Cas | Ce qu'il casse | Traitement |
|---|---|---|
| CREP avec deux murs classe 3 dans la même pièce | clé Svelte dupliquée (`e.element + e.classe`) | l'index entre dans la clé |
| logement ≤ 40 m² | les seuils du DPE changent (arrêté du 25 mars 2024) | seuils lus via `seuilsEnergie(surface)` |
| classe G | ouverte vers le haut, pas de position proportionnelle | aiguille calée en début de segment, et on le dit |
| « les fenêtres » au féminin pluriel | accord déduit du seul nombre → « isolés » | la marque d'accord est rangée à côté du nom |
| conclusion cochée à la main | aucune conclusion lisible | état `nonLue` : on n'affirme rien sur aucune barrière |
| ventilation, ponts thermiques | pas de paroi à isoler | état distinct de « le rapport se tait » |

---

## VISUAL_GRAMMAR — le langage visuel, et ses pièges techniques

### G1. Le piège de l'unité SVG

`--t-petit` vaut 14 px. Écrit sur un `<text>`, ce ne sont **pas** 14 pixels
d'écran : ce sont 14 **unités du viewBox**.

> Avant correction : **41 textes SVG sur 44 sous 11 px**, dont six à 8,4. Le pire,
> le schéma des déperditions, à **6,7 px**.

**Règle.** Dans un bloc de style SVG — reconnaissable à son `fill:` — la taille
s'écrit en unités du viewBox, jamais avec un jeton du design system. Gardé par
`schemas/taille-texte.test.ts`.

**Corollaire.** Remonter les tailles sous le plancher **une par une** écrase la
hiérarchie (quatre tailles distinctes devenues identiques). Appliquer un **facteur
uniforme** par fichier, calculé pour que la plus petite atteigne le plancher.

### G2. `stop-color` n'accepte pas la couleur moderne

`stop-color="rgb(255 255 255 / 9%)"` : l'alpha est **purement ignoré** dans un
attribut de présentation SVG. Le dégradé sort **noir opaque**.

Écrire `stop-color` et `stop-opacity` **séparés**, la forme canonique.

**Ce que ce défaut enseigne.** Aucune mesure de contraste ne pouvait le révéler —
le fautif n'écrit aucun texte. Il n'a été vu qu'en **rendant le dessin en image et
en le regardant**.

### G3. L'encre qui s'écrit sur une étiquette réglementaire

Les sept couleurs de l'arrêté ne se retouchent pas : c'est l'encre qui doit tenir
sur les sept. Le blanc échoue sur quatre (B 2,14 · F 2,15 · A 3,70 · G 4,08).

`--encre-etiquette: #071008` → A 5,22 · B 9,04 · C 16,12 · D 17,74 · E 12,65 ·
F 8,97 · G 4,74.

### G4. Une surface claire au milieu d'un écran sombre

Le ciel de la coupe de terrain est un dégradé **opaque** pâle. Le texte posé
dessus héritait de l'encre claire de l'univers : **1,09**. D'où
`--encre-sur-clair`, qui le remonte à 12,94.

### G5. Le relief, c'est de la lumière — pas un effet

Trois procédés, pas un de plus : un dégradé qui donne le volume, deux arêtes d'un
pixel (claire en haut, sombre en bas), une ombre de contact qui **pose** l'objet.

Intensité réglée **à l'œil**, trois rendus côte à côte : à 9/16 le volume se
devine à peine, à 14/26 le bas de façade avale ses fenêtres. **12/22** se voit sans
écraser.

### G6. Les espaces françaises se posent au rendu

Le texte est analysé et ses termes reconnus avec des espaces **ordinaires** : y
glisser des insécables plus tôt fait échouer des correspondances. Le dernier
maillon — ce qui part à l'écran — est le seul endroit sûr.

---

## WHAT_WORKS — ce qui a été validé

- **La chaîne des barrières** (électricité) : les six domaines deviennent une
  défense en profondeur, dans l'ordre où le courant les franchirait. Elle ne
  connaît que `d.releves` — le champ menteur n'entre plus nulle part.
- **La règle à deux aiguilles** (DPE) : la comparaison des deux notes *est* le
  dessin. Sur l'exemple, énergie à 78 % de la graduation contre climat à 40 % :
  on voit pourquoi c'est F. Et « entre 330 et 420 » répond à une question
  qu'aucun texte ne posait — suis-je au bord ou au milieu de ma classe ?
- **Le tableau des surfaces** avec garde de cohérence : il se tait quand la somme
  ne retombe pas sur le total imprimé.
- **Le décrochement de 14 px** : le seul signal de provenance qui survive à une
  capture floutée en noir et blanc.

---

## WHAT_FAILED — ce qui a échoué, et pourquoi

- **Poser les chiffres sur le dessin.** « 13 400 kWh/an » sous « Chauffage »
  sortait du cadre de 35 unités. Élargir le viewBox rapetissait tout sous le seuil
  de lisibilité ; rétrécir le chiffre le rendait illisible — le SVG ne fait que
  306 px de large, une unité y vaut 0,54 pixel. **Les chiffres sont descendus en
  HTML sous le dessin** : il montre *où*, le relevé dit *combien*.
- **Descendre l'explicatif sans distinguer les écrans** : a vidé la scène de la
  Carrez (32 px de dessin pour 3 552 px de texte).
- **Retirer les étiquettes du dessin sans regarder ce qu'elles portaient** : a
  supprimé le seul accès aux huit notions du DPE, devenues inatteignables.
- **Un test qui interdit de citer une valeur dans un commentaire** : deux tests
  ont échoué sur leur propre documentation. Un tel test pousse à écrire de moins
  bons commentaires — il doit viser le code sans ses commentaires.

---

## REGRESSION_TESTS — ce qui protège les acquis

| Fichier | Ce qu'il empêche |
|---|---|
| `schemas/taille-texte.test.ts` | qu'un jeton de taille revienne dans un bloc SVG |
| `composants/niveaux-texte.test.ts` | que les six niveaux s'effondrent, et que la provenance repose sur la couleur |
| `composants/elec-anomalies.test.ts` | que la chaîne reparle à `schema.groupes` |
| `schemas/deperditions.test.ts` | que le dessin réaffirme des ordres de grandeur nationaux |
| `visuels/encre-etiquette.test.ts` | que l'encre des étiquettes soit recopiée au lieu d'être un jeton |
| `lib/typographie.test.ts` | que les espaces françaises se perdent |
| `composants/LesSurfaces.test.ts` | qu'un tableau qui ne s'additionne pas s'affiche quand même |

---

## OPEN_QUESTIONS — ce qui reste imparfaitement résolu

Le §25 de la Constitution rend ce chapitre obligatoire.

1. **L'électricité ne situe rien, alors que la donnée existe.**
   `anomaliesDetaillees()` produit la localisation **par anomalie** ;
   l'analyseur l'aplatit dans un fait global avant qu'elle atteigne l'écran.
   Le champ `ou` du modèle reste vide pour l'électricité. C'est de la plomberie,
   pas de la lecture — et son arrivée débloquerait la couche la plus attendue.

2. **`schema.groupes` est faux à la source.** L'affichage est gardé, mais
   l'analyseur compte toujours des mots : l'écart total/groupes subsiste sur
   13 dossiers sur 33.

3. **L'amiante extrait tout et n'affiche rien.** Matériau nommé, localisation,
   état de conservation avec la **citation exacte** du rapport, suite prescrite,
   composant non sondé et motif de l'empêchement — le modèle n'a pas de case pour
   les recevoir, et la citation est jetée.

4. **Le gaz n'a pas de schéma dans le modèle.** `analyserGaz` rend `schema: null` :
   CO mesuré ou non, appareil à l'arrêt, gaz fermé, types A1/A2/DGI meurent
   aplatis en chaînes. Or le gaz est le seul diagnostic qui gradue par **délai**,
   et le seul qui teste un système **vivant** — « aucune anomalie » sur des tuyaux
   froids ne veut pas dire la même chose.

5. **L'image du schéma de déperditions n'est pas branchée.**
   `Document.schemaDeperditions()` découpe le rectangle officiel dans la page du
   DPE ; **31 volets sur 31** le nomment, et aucun ne porte de pourcentage dans
   son texte — ils vivent dans cette image. C'est la seule façon d'afficher les
   vrais pourcentages sans en inventer un seul.

6. **La capture d'écran du volet est intermittente**, ce qui a laissé passer le
   dégradé noir et la liste affichée deux fois. Le contournement — rendre le SVG
   en PNG hors navigateur — ne couvre pas le HTML.

---

## La question finale

> « Si j'avais deux heures supplémentaires, qu'est-ce que je changerais ? »

Le geste signature du DPE. Le §15 de l'ordre de mission demande d'**explorer le
bâtiment énergétiquement** ; l'écran actuel propose une **liste de six boutons**.
Tant que ce geste n'existe pas, le DPE n'est pas refondu — il est corrigé.

> « Qu'est-ce que je ne vois peut-être pas encore ? »

Que l'asymétrie mesurée en R1 — quatre diagnostics qui situent tout, quatre qui
ne situent rien — n'est peut-être pas une limite à contourner, mais **le sujet
lui-même**. Huit regards ont inspecté ce logement ; chacun n'a vu qu'une partie,
et leurs champs ne se recouvrent pas. Aucun produit du secteur ne montre cela.
