# Ordre de mission — anti-doublon

*Posé par la session **architecte** le 22/08/2026, sur ordre d'Aude.*
*Permanent. S'applique à toutes les sessions, à tous les volets.*

---

## La règle

**On cherche avant de créer. Deux implémentations de la même intention sont un
défaut, jamais une variante.**

Et sa moitié aussi importante, apprise le jour même où cet ordre est écrit :

**Avant de supprimer un doublon, on prouve que c'en est un.** Deux modules qui
se ressemblent peuvent être deux étages d'un même mécanisme. Les fusionner casse
un système sain.

---

## Pourquoi ce risque est structurel ici

Ce dépôt est écrit par **dix sessions en parallèle**, une par volet, qui ne se
voient pas. Aucune n'a la vue d'ensemble, et chacune, devant un besoin, a le
réflexe de créer plutôt que de chercher — parce que chercher suppose de
connaître le travail des autres.

Le doublon n'est donc pas de la négligence : c'est la conséquence mécanique du
travail parallèle. Il ne disparaîtra pas par la vigilance, seulement par une
méthode et une mesure.

---

## Les quatre formes, toutes mesurées le 22/08

### 1. Deux implémentations, une seule branchée

`src/lib/lecteurs/amiante/` (4 fichiers) et `src/lib/lecteurs/plomb/` (2) sont
écrits, testés, conformes au socle — et **appelés nulle part**. En production,
ces deux volets sont lus par `analyse/amiante.*` et `analyse/plomb.ts`.
`lireLesUnites` n'est atteint que par `socle.test.ts` ;
`composants/amiante/depuisLecteurs.ts`, écrit pour faire la jonction, n'est
importé par personne.

C'est la forme la plus coûteuse : le travail est fait deux fois, et la moitié ne
sert pas.

### 2. Le remplaçant qui ne remplace pas

`visuels/ChaineBarrieres.svelte` (397 lignes) et `visuels/VisuelAmiante.svelte`
(516 lignes) ont été écrits le 20/08 pour remplacer des schémas. La refonte des
mini-apps est passée ailleurs, et personne ne les a retirés. Ils ne sont dans
aucun bundle — ils encombrent le dépôt et peuvent être ressortis par erreur.

**Remplacer, c'est aussi supprimer.** Un remplaçant livré sans retrait de
l'ancien fait deux vérités dans le dépôt.

### 3. La valeur recopiée au lieu d'être nommée

197 couleurs posées en dur, dont un **second ivoire** (`#f5f1e8` à deux points
de `#f7f6f2`) et un **troisième vert profond** (`#0e3b30`). Et six jetons de
l'ancienne charte redéclarés **huit fois** dans les composants.

Une valeur recopiée est un doublon qui ne se voit pas : rien ne casse, tout
diverge. Voir [ORDRE-HOMOGENEITE-VISUELLE.md](ORDRE-HOMOGENEITE-VISUELLE.md).

### 4. Le débranché provisoire que personne ne rebranche

Celui-ci n'était connu de personne : c'est le test écrit avec cet ordre qui l'a
nommé.

`composants/Arrivee.svelte` — **585 lignes** — a été débranché le 21/08 par le
commit « Le site passe en construction, et l'atelier sort du bundle public ». Le
site a rouvert le lendemain, sur ta décision. L'écran, lui, n'est jamais revenu.

Il porte **32 couleurs en dur**, ce qui en faisait le premier porteur de dette
visuelle du produit — pour un écran que personne n'atteint. La dette réelle des
écrans vivants est donc de **165**, pas 197.

Un débranchement provisoire sans date de retour devient un doublon permanent :
deux écrans d'accueil existent, un seul est vrai, et rien ne le dit.

### 5. Le doublon de façade

`analyse/index.ts` inscrit LICIEL **et** BC2E pour les termites — avec le même
lecteur (`avecConstatations`) pour les deux. Deux noms, une seule carte : la
contrainte « un lecteur par éditeur » est satisfaite en apparence et violée en
fait.

---

## Avant de créer : trois questions

**1. Est-ce que ça existe déjà ?**
```bash
git ls-files 'src/**' | grep -i <le mot du besoin>
grep -rn "export function <le verbe>" src/lib src/composants
```
Chercher le **besoin**, pas le nom qu'on allait donner. Un aiguillage peut
s'appeler `aiguiller`, `choisir`, `router` ou `dispatcher`.

**2. Si ça existe et ne convient pas — pourquoi ?**
Répondre par écrit, dans le commentaire d'en-tête. « Je n'avais pas vu » n'est
pas une réponse ; « le socle ne dégrade jamais, il me fallait un repli » en est
une, et elle se discute.

**3. Est-ce que je remplace quelque chose ?**
Alors le retrait de l'ancien part **dans le même lot**. Pas plus tard.

---

## Devant un doublon suspecté : prouver avant de fusionner

⚠️ **Le 22/08, l'architecte a annoncé « deux aiguillages rivaux » et recommandé
d'en supprimer un. C'était faux.** `lecteurs/socle.ts` choisit le format *dans*
un volet sur signature ; `analyse/lecteurs.ts` choisit le lecteur *de* volet
d'après l'éditeur du dossier. Deux étages d'un même mécanisme, et
`analyse/index.ts` documente même la règle qui les articule — « un maillon, pas
deux », le cas du DPE. Les fusionner aurait cassé un système sain.

La preuve se prend en trois points :

- **qui appelle quoi** — `grep -rn "from '.*<module>'" src` ;
- **avec quelles entrées** — deux modules qui reçoivent des choses différentes
  ne font pas la même chose ;
- **ce que dit l'en-tête** — dans ce dépôt, les modules expliquent leur raison
  d'être. La lire coûte deux minutes et évite une régression.

Sans ces trois points, on **signale**, on ne fusionne pas.

---

## Comment on vérifie

`src/lib/doublons.test.ts` recense les composants `.svelte` que plus personne
n'importe, et les compare à une liste d'orphelins **déclarés**. Un composant qui
sort de l'usage sans être retiré fait passer le test au rouge et se nomme
lui-même.

Comme pour l'homogénéité, c'est un cliquet : la liste ne peut que rétrécir.

⚠️ **Un piège rencontré en l'écrivant :** un fichier cité dans un test compte
comme « utilisé » par une recherche naïve. `VisuelAmiante.svelte` a cessé
d'apparaître orphelin dès que `homogeneite.test.ts` l'a nommé dans sa liste de
plafonds. La recherche d'usages ignore donc les `*.test.ts`.

---

## Ce que l'architecte fait de son côté

Il tient la vue que les sessions n'ont pas. Concrètement : il recense les
doublons, il tranche ceux qui traversent les volets, et il signale aux sessions
ceux qui leur appartiennent. Il ne fusionne jamais dans le volet d'un autre
([ORDRE-COORDINATION-DES-SESSIONS.md](ORDRE-COORDINATION-DES-SESSIONS.md)).
