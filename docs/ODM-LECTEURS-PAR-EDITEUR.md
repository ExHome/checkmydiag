# CONTRAINTE ABSOLUE — un lecteur par éditeur

*Posée par Aude le 21/08/2026, **permanente et générale à toute l'application**.
L'ordre complet vit dans la Dropbox :
`BACK OFFICE/VERRIERE/01_ORDRES_DE_MISSION/ORDRE-DE-MISSION-LECTEURS-PAR-EDITEUR.md`.
Ce fichier est sa trace dans le dépôt, et dit où elle est tenue par le code.*

---

## La règle

> **La bonne architecture est un lecteur PAR ÉDITEUR, choisi sur signature, et
> non un lecteur unique rafistolé. On commence par nommer l'éditeur avant de
> lire.**

Elle vaut pour **tous les volets** — DPE, électricité, gaz, plomb, amiante,
termites, ERP, Carrez, assainissement — et pour toute l'application.

## L'ordre des opérations, sans exception

1. **Nommer l'éditeur** — signature PDF, rubrique « Référence du logiciel
   validé », pied de page, ou à défaut le gabarit lui-même.
2. **Choisir le lecteur** de cet éditeur.
3. **Lire**, avec les repères de CET éditeur.
4. **Éditeur non couvert : le repli se déclare**, il ne se fait jamais en
   silence.

## Pourquoi une rustine ne peut pas suffire — la preuve, mesurée

| | **LICIEL** | **BC2E** |
|---|---|---|
| Le droit de l'amiante en annexe | imprimé dans **100 %** des volets, positifs comme négatifs | imprimé **seulement s'il y a un positif** |
| Donc « travaux de retrait », « Score 3 » | **bruit** | **signal** |

Un lecteur qui cherche ces mots se trompe chez l'un ; un lecteur qui les écarte
se trompe chez l'autre. **Le même mot, au même endroit, ne prouve pas la même
chose selon l'éditeur.**

Et les endroits eux-mêmes ne sont pas au même endroit : la conclusion est au
§ 1 page 2 chez LICIEL, dans le bloc `A` de la page 1 chez BC2E ; les locaux non
visités tiennent en un tableau chez l'un, trois chez l'autre ; les valeurs sont
en clair chez l'un, en sigles chez l'autre.

## Où c'est tenu par le code

| | |
|---|---|
| L'aiguillage | [`src/lib/analyse/lecteurs.ts`](../src/lib/analyse/lecteurs.ts) — `inscrireLecteur` / `choisirLecteur` |
| Le garde-fou | [`src/lib/analyse/lecteurs.test.ts`](../src/lib/analyse/lecteurs.test.ts) — 8 tests |
| Le branchement | [`src/lib/analyse/index.ts`](../src/lib/analyse/index.ts) — l'éditeur est nommé **avant** la découpe, et descend dans le contexte de chaque lecteur |

Ce que les tests interdisent, définitivement :

- prendre le lecteur d'un **autre** éditeur ;
- **deux replis** pour un même volet — ce serait le lecteur unique revenu par la
  fenêtre ;
- un repli **silencieux** : `choisirLecteur` rend toujours `repli: true` quand
  il n'a pas de lecteur pour cet éditeur ;
- appeler un lecteur **sans** générateur : il est dans le contexte, au même rang
  que le texte.

## Où en est le chantier — dit sans le farder

**Fait** : l'éditeur est nommé avant toute lecture, l'aiguillage existe, il est
branché sur les deux chemins de lecture (volet détaillé et repli par la page de
synthèse), et il est tenu par des tests. 1 322 tests passent.

**Reste** : les neuf lecteurs actuels ont été écrits en lisant du LICIEL. Ils
sont donc inscrits comme **lecteurs de repli** — « faute de mieux », et non
« pour tout le monde ». Migrer un volet, c'est :

1. écrire son lecteur **LICIEL** et l'inscrire sous ce nom ;
2. écrire son lecteur **BC2E** à partir de la carte ;
3. ne laisser au repli que ce qui vaut vraiment pour un éditeur inconnu ;
4. faire remonter `repli: true` **jusqu'à l'écran** — le lecteur doit dire à
   l'acquéreur qu'il lit un format qu'il ne connaît pas.

Ordre d'utilité, d'après le corpus : **amiante** (la carte est faite, deux
éditeurs), puis **plomb** (carte faite, LICIEL et BC2E), puis électricité.

## Les cartes qui alimentent les lecteurs

| Volet | Carte | Éditeurs couverts |
|---|---|---|
| Amiante | [`OU-PARSER-AMIANTE.md`](OU-PARSER-AMIANTE.md) | LICIEL · BC2E · ITGA (rapports d'essai) · sans-texte |
| Plomb | [`OU-PARSER.md`](OU-PARSER.md) | LICIEL · BC2E |
| Termites | [`OU-PARSER-TERMITES.md`](OU-PARSER-TERMITES.md) | LICIEL |
| Tous | [`REPERES-PAR-EDITEUR.md`](REPERES-PAR-EDITEUR.md) | ce qui est acquis, et chez qui |
