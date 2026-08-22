# Ordre général — l'homogénéité visuelle de Verrière

*Posé par la session **architecte** le 22/08/2026, sur ordre d'Aude : « notre
charte graphique, c'est comme notre référence d'image Verrière ».*

**Cet ordre s'adresse à toutes les sessions.** Il ne demande à personne de
redessiner quoi que ce soit — il demande que chaque couleur vienne d'un endroit
nommé.

---

## Le principe, en une phrase

**Une couleur du produit se prend dans `src/app.css` ou dans l'univers de son
diagnostic (`src/lib/univers.ts`). Nulle part ailleurs.**

Ce n'est pas une règle de goût. Une valeur écrite en dur dans un composant
n'appartient à aucun des deux systèmes : elle ne suit pas un changement de
charte, elle ne bascule pas en sombre, et elle échappe à la mesure de contraste
que `univers.test.ts` fait sur les sept univers. Elle est invisible à tous les
garde-fous que le produit s'est donnés.

⚠️ **L'hétérogénéité voulue reste voulue.** Sept univers, une couleur par
diagnostic : c'est le design system, il ne change pas. Ce qui est visé ici,
c'est la couleur qui n'est dans aucun des sept.

---

## La mesure du 22/08/2026

| | |
|---|---|
| Couleurs légitimes (charte + univers) | **60** |
| Valeurs posées en dur, hors des deux | **197** |
| Composants concernés | **33** |

⚠️ **Un repli ne compte pas.** `var(--u-surface, #f5f1e8)` prend sa couleur dans
l'univers ; le hex n'est que le défaut si l'univers est absent. La première
mesure les comptait et annonçait 217 écarts — vingt d'entre eux reprochaient à
un composant d'être correctement branché. Le compte juste est 197.

Et le déployé, lui, est propre : aucune couleur bannie (corail, sable de
l'ancienne charte, bleu pétrole) n'est servie — vérifié sur 12 points d'entrée,
56 fichiers, en hexadécimal comme en composantes `rgb()`.

---

## Les quatre couleurs qui traversent le produit

Une couleur posée en dur dans trois fichiers ou plus n'est plus un détail
local : c'est un jeton qui n'a jamais été créé.

| Couleur | Où | Ce que c'est | Ce qu'on en fait |
|---|---|---|---|
| `#1c1c1c` | 5 fichiers | l'**encre des pastilles DPE**, choisie pour tenir sur les sept teintes de l'arrêté — et déjà mesurée par `encre-etiquette.test.ts` | **Ne pas la remplacer.** Elle est juste. En faire un jeton nommé dans `app.css` pour cesser de la recopier |
| `#0e3b30` | 3 fichiers | un **troisième vert profond**, déclaré en dur sous le nom `--vert-nuit`, ni `#0a2b23` ni `#12463b` | ordre net : `--verriere-vert-profond` |
| `#ffd54a` | 3 fichiers | un jaune vif, hors charte | à trancher par le volet : `--verriere-sable-or`, ou l'accent de l'univers |
| `#c05621` | 3 fichiers, tous DPE | orange brique, sans doute une échelle thermique | à trancher par le volet DPE : si l'échelle est réglementaire, elle se déclare comme telle |

⚠️ **Une couleur hors charte n'est pas forcément une faute.** `#1c1c1c` est le
contre-exemple : elle a été choisie parce que les couleurs réglementaires ne se
retouchent pas, et un test la garde déjà. Trois autres candidates — `#f5f1e8`,
`#cbd8dd` et les couleurs de `VisuelTermites` — ont disparu de cette liste dès
qu'on a cessé de compter les replis. **On regarde le contexte avant de
corriger** : c'est la différence entre un ordre et une bévue.

---

## L'ordre, volet par volet

Chaque session réaligne **son** volet. Personne ne touche au volet d'un autre
([[ORDRE-COORDINATION-DES-SESSIONS]]).

| Volet | Couleurs en dur | Le gros morceau |
|---|---|---|
| **DPE** | **48** | `MiniAppDpe.svelte` à lui seul en pose 32 |
| Termites | 15 | `MiniAppTermites.svelte` |
| Plomb | 14 | `MiniAppPlomb.svelte` |
| Électricité | 13 | `MiniAppElectricite.svelte` |
| Gaz | 12 | `MiniAppGaz.svelte` |
| Amiante | 9 | `Amiante.svelte` |

**Écrans partagés — ils n'ont pas de session propriétaire.** `Arrivee.svelte`
(32), `Bureau.svelte` (14), `Diagnostics.svelte` (9), `Dicodiag.svelte` (3). Ils
reviennent à l'architecte, et se traitent quand plus personne n'écrit dedans.

**Les visuels**, eux non plus, n'ont pas de propriétaire : `VisuelRisques` (17),
`VisuelPlomb` (14), `VisuelAmiante` (11). `VisuelTermites` est propre.

---

## Comment on vérifie que l'ordre est réalisé

`src/lib/homogeneite.test.ts` mesure la dette de chaque composant et la compare
à son **plafond** du 22/08. C'est un cliquet :

- **la dette ne peut pas grandir** — une couleur en dur de plus, et le test
  passe au rouge en nommant les couleurs en cause ;
- **le plafond ne peut pas rester en l'air** — un volet qui se réaligne doit
  descendre son plafond dans le même lot, sinon la place libérée redeviendrait
  un droit à polluer pour la session suivante ;
- **un composant neuf naît à zéro** — l'absence de la liste vaut plafond zéro.

La cible est zéro partout. Un plafond n'est pas un droit : c'est une dette
datée.

---

## ⚠️ Une dérive prise sur le fait pendant la mesure

Entre 15 h 25 et 15 h 31 le 22/08, `src/composants/Lecteur.svelte` est passé de
**1 à 3** couleurs en dur : `#e8dcc8`, `#f7f0e5`, `#fbf5ec` — trois crèmes que
la charte ne contient pas, et dont deux ressemblent à l'ivoire officiel sans en
être.

Le plafond a été calé sur 3 pour ne pas livrer un test rouge qui bloquerait tout
le monde. **La session qui tient ce fichier est priée de les rattacher aux
jetons de la charte et de redescendre son plafond à 0.**

C'est exactement ce que ce dispositif existe pour empêcher : six minutes ont
suffi.

---

## `VisuelRisques.svelte` — la question est tranchée, par la mesure

Ce composant porte une palette entièrement Material Design — 17 couleurs hors
charte, dont `--or: #00796b`, un teal nommé « or ». Ses commentaires parlent de
« la maquette », ce qui posait une vraie question : reproduction d'un visuel
fourni, qu'on ne touche pas, ou reste d'avant la refonte, qu'on réaligne ?

**Vérifié dans la Dropbox `BACK OFFICE/VERRIERE` :**

- les packs reçus sont AMIANTE, CONSEILS, CORPUS_FORMATS_HORS_LICIEL, DPE,
  ELECTRICITE, GAZ, TERMITES — **il n'y a pas de pack risques** ;
- aucun fichier fourni (`.html`, `.svg`, `.css`) ne contient `#00796b`,
  `#a5d6a7`, `#546e7a` ni `#e0f7fa`.

Ce n'est donc la reproduction de rien : **c'est un reste, et il se réaligne.**

L'univers `erp` existe déjà dans `lib/univers.ts`, avec ses huit rôles — fond
ivoire, texte vert profond, `accentVif: #5b7f9c` pour l'eau, trait sable. Et
`VisuelRisques` n'utilise **aucun** jeton d'univers : zéro `var(--u-…)` dans
tout le fichier, là où les autres visuels s'y branchent.

⚠️ **Le réalignement n'est pas un remplacement un pour un.** Ce visuel décrit
des aléas — argile, inondation, radon — et ses teintes portent du sens. Passer
aux jetons de l'univers demande de décider ce que chaque couleur représente,
volet par volet. C'est un lot, pas une passe de `sed`.

**Les jetons de l'ancienne charte** — `--or`, `--or-fonce`, `--or-clair`,
`--or-pale`, `--petrole`, `--petrole-fonce` — sont redéclarés huit fois dans
`Diagnostics.svelte`, `Cgv.svelte` et `VisuelRisques.svelte`, et
`charte.test.ts` ne les voit pas : il ne cherche les redéclarations que dans
`app.css`. Les valeurs sont bonnes, ce sont les noms qui mentent. **La
correction du garde-fou et celle des huit redéclarations doivent partir dans le
même lot**, sinon la CI passe au rouge sur `main`.
