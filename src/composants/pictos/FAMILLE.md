# La famille des pictogrammes Verrière

Règle unique, opposable, vérifiée par `pictos.test.ts`. Elle existe parce que
huit pictogrammes dessinés séparément donnent huit bibliothèques différentes —
c'est ce que l'ODM du 19/08 interdit au § 4.

## La grille

| Ce qui est fixe | Valeur | Pourquoi |
|---|---|---|
| `viewBox` | `0 0 100 100` | une seule unité de mesure pour tous |
| Boîte optique | **14 → 86** | 14 unités de marge sur les quatre bords : le picto respire dans son icône sans jamais toucher le bord |
| Épaisseur de trait | **6** | à 28 px d'affichage, 6 unités font 1,7 px : le trait tient sans se boucher |
| Terminaisons | `round` / `round` | l'arrondi est le geste de la marque — il se retrouve dans le losange du logo et dans les rayons des cartes |
| Couleur | `#F7F6F2` **et rien d'autre** | la couleur vient du dégradé de l'icône, jamais du dessin |
| Densité | **2 à 6 formes** | au-delà, le dessin devient une illustration et se referme à petite taille |

## Le trait et la masse

Le dessin est **au trait**. Une seule masse pleine est tolérée par pictogramme,
et seulement pour l'élément qui porte l'identité — l'éclair de l'électricité, le
corps du termite. Jamais pour la structure : une maison, un cercle, un bouclier
et un hexagone restent des contours.

C'est ce que montre la planche de référence du pack : des contours nets, et une
masse unique qui accroche l'œil.

## Le centrage

Le centrage **optique** prime sur le centrage mathématique (§ 6). Une forme
lourde en bas — une maison, un bouclier — se remonte de deux à trois unités pour
paraître centrée. Le test vérifie la boîte ; l'œil vérifie l'équilibre.

## Ce qui est interdit

- Une épaisseur de trait différente d'un pictogramme à l'autre.
- Un aplat plein sur une forme de structure.
- Un détail de moins de 4 unités : il disparaît à 28 px.
- Une couleur autre que `#F7F6F2`.
- Un emoji, en interface, où que ce soit.
