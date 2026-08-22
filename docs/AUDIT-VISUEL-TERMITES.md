# Audit — mini-app TERMITES contre le visuel de référence

Référence : `01_VISUEL_REFERENCE_TERMITES.png`, pack `VERRIERE_TERMITES_PACK_CLAUDE`
(22/08/2026). **Matrice = l'écran de DROITE**, conformément à l'ordre de mission.

Audité : `src/composants/termites/MiniAppTermites.svelte`, état du 22/08 à 14:25.

> Cet audit ne modifie aucun fichier. Il est écrit pour être appliqué par la
> session qui tient l'écran.

---

## Ce qui est déjà conforme

| Élément du visuel | État |
|---|---|
| Fond ivoire chaud, colonne centrée | ✅ `#faf8f3` |
| « TERMITES » en serif capitale, interlettrage large | ✅ |
| « SYNTHÈSE DU DIAGNOSTIC » en petites capitales laiton | ✅ |
| Ordre des blocs (points clés → résultat → constatations → non contrôlé → complétude → conseil) | ✅ |
| Points clés : cartes blanches, pastille ronde à gauche, chevron à droite | ✅ |
| Résultat global : carte vert pâle, anneau + bouclier à gauche, texte serif à droite | ✅ |
| Constatations diverses : carte repliable avec chevron, puces rondes, filigrane végétal | ✅ |
| Ce qui n'a pas été contrôlé : triangle d'attention, statut ambre aligné à droite | ✅ |
| Complétude et Conseil : cartes crème, feuille en tête | ✅ |
| Barre d'onglets Synthèse · Détails · Photos · Conseils, actif en vert nuit | ✅ |

La structure est fidèle. Les écarts qui suivent portent sur le rendu, pas sur
l'architecture.

---

## A. Écarts à corriger — le visuel dit autre chose

### A1. La barre supérieure manque entièrement
**Visuel** : chevron retour « ‹ » à gauche et menu « ••• » à droite, sur la même
ligne que l'icône termite, en vert nuit.
**Écran** : `header.entete` ne contient que l'insecte, le titre et le sous-titre.
**Où** : l. 88-101.

### A2. Onze signes sont des caractères de police, pas des dessins
C'est **le** point d'approximation. Le visuel dessine chaque signe ; l'écran
emprunte des glyphes à la police, dont la graisse ne s'accorde pas au reste et
dont le rendu change d'un appareil à l'autre.

| Signe | Visuel | Écran | Ligne |
|---|---|---|---|
| Pastille « conforme » | coche blanche dans disque vert plein | `✓` | 80 |
| Pastille « attention » | bouclier ambre | `△` | 80 |
| Pastille « alerte » | « i » cerclé | `!` | 80 |
| Chevron de ligne | chevron fin dessiné | `›` | 116 |
| Chevron de repli | chevron fin dessiné | `⌄` | 165 |
| Triangle d'attention | triangle ambre à liseré | `△` | 196 |
| Feuille (complétude) | feuille nervurée laiton | `❧` | 271 |
| Feuille (conseil) | feuille nervurée laiton | `❧` | 285 |
| Onglet Synthèse | maison pleine | `⌂` | 303 |
| Onglet Détails | liste à puces | `☰` | 304 |
| Onglet Photos | appareil photo | `▣` | 305 |
| Onglet Conseils | ampoule | `✿` | 306 |

**À faire** : les remplacer par des `<svg>` inline, au trait, à la même graisse
que l'insecte de l'en-tête et que le filigrane — qui sont déjà en SVG et
montrent le bon niveau de finition.

### A3. L'insecte de l'en-tête est une approximation
**Visuel** : termite finement dessiné — tête, thorax, abdomen segmenté, six
pattes articulées, deux antennes, trait fin laiton.
**Écran** : trois ellipses pleines et quatre traits droits (l. 90-98). La
silhouette se lit, la finesse non.

### A4. Le bouton « Voir le rapport complet » n'est pas sur cet écran
**Visuel** : le bouton vert nuit pleine largeur figure sur l'écran de **gauche**.
L'écran de droite, qui sert de matrice, se termine par « Conseil Verrière » puis
les onglets.
**À trancher** : le garder est utile, mais c'est un écart. Il peut descendre
sous les onglets ou passer sur l'écran Détails.

### A5. La carte « Constatations diverses » est trop bleue
**Visuel** : fond quasi blanc, très légèrement bleuté, avec un liseré fin.
**Écran** : `--bleu-voile: #e8eef4`, nettement plus saturé.

### A6. Les cartes n'ont pas de liseré
**Visuel** : bordure fine sur chaque carte, en plus de l'ombre portée.
**Écran** : `box-shadow` seule, sans `border`.

### A7. La police de titrage est générique
**Visuel** : serif de titrage à fort contraste, éditoriale.
**Écran** : `Georgia, 'Times New Roman', serif`. Georgia est une serif d'écran
robuste, pas la lettre du visuel.

---

## B. Écarts volontaires — à NE PAS corriger

Le README du pack est explicite : *aucune donnée du visuel ne doit être
considérée comme une donnée métier réelle*. Les points suivants sont des refus
délibérés, et ils sont justes.

### B1. « NIVEAU DE RISQUE — TRÈS FAIBLE »
Aucun rapport termites ne qualifie un niveau de risque. L'écran garde la place
et y met la portée du constat. **Conforme au § B.**

### B2. « 90 % » et sa barre de progression
Le § E l'interdit nommément. L'écran garde la carte, remplace le chiffre par une
phrase factuelle, et **supprime la barre avec lui** — une barre sans valeur
mesurée serait un score déguisé. **Correct.**

### B3. Les trois points clés du visuel
« Aucun termite vivant observé », « Aucun dégât identifié », « Pas d'indice
d'activité récent » : les rapports concluent globalement, pas indice par indice.
Les reprendre serait inventer trois constats. **Correct.**

### B4. Le mot du statut sous chaque point clé
L'écran ajoute « RIEN À SIGNALER » sous le titre, absent du visuel. C'est le
§ 4 : un statut doit être lisible par le texte et l'icône, pas par la seule
couleur. **À conserver.**

### B5. « Non visitée » et « Non examiné » au lieu de « Non contrôlé »
Le visuel met une mention unique. Le rapport, lui, distingue une **pièce non
visitée** d'un **ouvrage non examiné** là où l'opérateur est entré. Les
confondre perdrait une information. **L'écran est ici plus juste que le
visuel.**

---

## Ordre de traitement suggéré

1. **A2** — les onze signes en SVG. C'est ce qui se voit le plus, et ce qui
   sépare une maquette d'un écran fini.
2. **A1** — la barre supérieure (chevron retour, menu).
3. **A3** — l'insecte, redessiné au trait.
4. **A5, A6, A7** — réglage fin : teinte de la carte bleutée, liserés, police.
5. **A4** — décision sur le bouton « Voir le rapport complet ».
