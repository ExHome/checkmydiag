# Audit visuel — état des lieux du 13/08/2026

Première étape de la méthode imposée par
[ORDRE-DE-MISSION-DA.md](../ORDRE-DE-MISSION-DA.md) : *auditer avant de
toucher*. Tout ce qui suit est mesuré sur le code, pas estimé à l'œil.

## Le constat qui change tout

**Le design system existe déjà.** `src/app.css` déclare 63 variables : une
palette de verts en six valeurs, l'or en quatre, les encres, les papiers, les
couleurs sémantiques, les sept étiquettes réglementaires A→G, une échelle
d'espacement en huit crans, une échelle typographique en sept crans, trois
interlettrages, deux rayons, deux ombres, trois familles de caractères.

Le problème n'était donc pas l'absence de système. **C'est qu'il était
contourné.**

### Adhérence au système, avant

| Propriété | Au système | En dur | Conforme |
| --- | --- | --- | --- |
| Couleur | 178 | 21 | **89 %** |
| Rayons | 16 | 24 | 40 % |
| Typographie | 10 | 129 | **7 %** |
| Espacement (`padding`) | 3 | 49 | **5 %** |
| Espacement (`margin`) | 3 | 66 | **4 %** |

La couleur tenait. La typographie et la respiration — précisément les deux
points sur lesquels l'ordre de mission insiste le plus — étaient à l'abandon.

### Le désordre typographique, chiffré

**48 tailles de police distinctes** étaient déclarées dans les composants, pour
une application de trois écrans. Dont, dans un intervalle d'un seul pixel :

```
0.92rem · 0.93rem · 0.94rem · 0.95rem · 0.96rem · 0.97rem · 0.98rem
```

Sept tailles que personne ne peut distinguer, mais qui rendent toute cohérence
impossible : chaque composant réinventait sa propre mesure.

S'y ajoutaient **huit tailles en pixels** (10, 10.5, 11, 11.5, 12.5, 13, 17,
22 px). Une taille en pixels ignore le réglage de taille de caractères du
lecteur : c'est un défaut d'accessibilité autant qu'un défaut de système.

## Ce qui a été corrigé

**121 tailles ramenées à l'échelle**, dans 26 fichiers, chacune au cran le plus
proche — puis les quatre titres à 1.30 / 1.32 / 1.34 / 1.35 rem ralliés au cran
de titre.

| | avant | après |
| --- | --- | --- |
| Conformité typographique | 7 % | **99 %** |
| Tailles distinctes peintes à l'écran | 48 déclarées | **13** |

Sur l'écran de résultat, 97 % du texte tient désormais sur quatre crans :
15,36 px (corps), 13,12 px (légendes), 10,88 px (mentions), 18,24 px (chapô).
Le reste sont les titres fluides en `clamp()`, qui doivent le rester.

Aucune régression : 115 tests verts, `svelte-check` à 0 erreur, rendu vérifié
au navigateur.

## Ce qui reste, par ordre d'écart

1. **Espacements — 4 %.** C'est le plus gros chantier restant, et celui qui
   porte la « respiration » de l'ordre de mission. 115 marges et retraits en
   dur, alors que huit crans existent (`--e1` à `--e8`).
2. **Rayons — 40 %.** Dix valeurs différentes (0, 1, 2, 4, 8, 10, 12, 14, 20 px,
   50 %, 999 px) pour deux crans déclarés. La charte annonce « des rayons
   discrets, presque droits » : les 20 px et les 999 px la contredisent.
3. **Couleurs — 89 %.** 32 teintes en dur subsistent. Le point sensible : trois
   verts cohabitent — `#093f30` (le système), `#0c6b4f` et `#08402f` (venus du
   brief). L'ordre de mission tranche : **on garde le vert du projet**, les deux
   autres doivent disparaître.

## Deux points à arbitrer

**`--t-micro` vaut 0,68 rem, soit 10,88 px** — et il est utilisé 132 fois sur
l'écran de résultat. C'est sous le minimum communément admis (12 px). L'ordre de
mission interdit le « texte minuscule pour faire premium » et demande de
contrôler la taille minimale : ce cran mérite d'être remonté, mais cela touche
beaucoup d'écrans et doit être décidé, pas subi.

**La police de texte est celle du système** (`system-ui`), pas une police
choisie. Fraunces porte les titres et fait déjà beaucoup pour l'identité ; mais
« la qualité d'une revue d'architecture » se joue autant dans le texte courant.
Le brief produit mentionne Karla. À trancher.
