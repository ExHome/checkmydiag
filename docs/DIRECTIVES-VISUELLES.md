# Directives visuelles de Verrière

*Généralisées par la session **architecte** le 22/08/2026, sur ordre d'Aude.*
*Permanent. S'applique à tous les écrans, tous les volets, toutes les sessions.*

---

## Ce que ce document est, et ce qu'il n'est pas

Dix sessions ont corrigé un visuel aujourd'hui, chacune dans son coin. Chaque
correction portait une règle — et aucune n'était écrite ailleurs que dans un
message de commit que les autres ne liraient jamais.

**Les onze directives ci-dessous sont ces règles, sorties de leur volet.** Chacune
est suivie du cas mesuré qui la fonde : ce ne sont pas des principes, ce sont des
constats généralisés.

Pour **d'où vient une couleur** (charte, univers, jetons), voir
[ORDRE-HOMOGENEITE-VISUELLE.md](ORDRE-HOMOGENEITE-VISUELLE.md). Ici on traite de
**comment on décide et comment on vérifie**.

---

## 0. La règle qui commande les autres

> **Un visuel Verrière est ivoire et vert — sauf s'il porte une photographie.**
> *Aude, 22/08/2026.*

La couleur entre dans une page **par l'image**. Sans photographie, la page ne va
pas l'emprunter ailleurs : ni doré, ni sable, ni couleur métier en aplat.

Cela recoupe exactement la mesure du 20/08 sur la publicité : **58 % de lumière,
21 % de verts profonds**, et le reste — moins d'un cinquième — porté par les
*photographies*, le sable et les couleurs métier. Retirez la photo, et les
quatre cinquièmes qui restent sont l'ivoire et le vert.

⚠️ **Point ouvert, non tranché** : `lib/univers.ts` donne à chaque diagnostic un
`accentVif` vif — violet amiante, bleu gaz, orange termites — posé sur des
écrans qui ne portent aucune photographie. Si cette règle vaut aussi pour eux,
les dix valeurs sont à revoir. La charte propose d'ailleurs autre chose à leur
place : des **matières** (bakélite et cuivre, laiton, pierre, bois, verre
quadrillé), pas des aplats de couleur. Rien ne bouge avant arbitrage — dix
univers changés, c'est tout le produit.

---

## I. La vérification

### 1. Le visuel se vérifie à l'écran, jamais dans l'éditeur

Relire son CSS ne montre ni un contraste, ni une barre mal posée, ni une cible
trop petite. La mesure se prend dans le navigateur, à une taille d'écran
déclarée, sur l'écran réellement rendu.

> **Le cas.** Quatre défauts trouvés que le code ne montrait pas — dont une barre
> d'onglets en `position: absolute` qui se posait au bas du *conteneur*, mesurée
> à y = 2930 sur un écran de 812 : elle n'apparaissait qu'après avoir tout fait
> défiler. Sur le visuel, c'est une barre d'application : elle reste sous le
> pouce.

La même sonde marche sur le site déployé. C'est là que la preuve se prend en
dernier ressort — pas dans `dist/`.

### 2. Ce qu'on n'a pas pu vérifier se déclare

Un écran qui ne s'affiche qu'avec un rapport chargé, un panneau qui ne composite
pas : on le dit dans le commit, on ne laisse pas croire que la mesure a été
faite.

> **Le cas.** « Non vérifié : le rendu à l'écran. Les composants touchés ne
> s'affichent qu'avec un rapport chargé. » Écrit noir sur blanc plutôt que
> passé sous silence.

### 3. Après correction, on remesure et on publie les chiffres

Une correction non remesurée est une intention. Les valeurs d'après vont dans le
commit, pas seulement celles d'avant.

---

## II. Ce qui doit se lire

### 4. Un signal doit se lire. Un ornement n'a pas à passer le seuil

Le seuil de contraste s'applique à ce qui **informe** : une alerte, un état, un
onglet, une mention « non renseigné ». Il ne s'applique pas de la même façon à
une signature de marque, qui n'informe de rien.

> **Le cas.** Trois signaux corrigés — le « ! » des pastilles d'alerte à 2,68,
> les mentions « Non renseignée » à 3,95, et **trois onglets inactifs à 1,66**,
> pratiquement invisibles. « Une alerte qu'on ne lit pas ne sert à rien, et un
> onglet qu'on ne voit pas n'est pas un onglet. »
>
> **Et le contre-exemple, gardé tel quel** : le sur-titre bronze à 3,11. « Ce
> n'est pas un signal, c'est un ornement de marque. On ne touche pas à une
> signature pour un seuil qui ne la concerne pas. »

⚠️ Cette directive n'autorise pas à classer en « ornement » ce qui gêne. La
question est : **si personne ne le lit, perd-on une information ?** Si oui, c'est
un signal.

### 5. On corrige un contraste par la valeur, jamais par la teinte

Même couleur, quelques crans plus foncés. Changer la teinte pour gagner du
contraste, c'est corriger un défaut en en créant un autre — la charte.

> **Le cas.** `#ea8423 → #ab580b`, `#d15a19 → #b04711`, `#c7c6c5 → #706b64`.
> Trois passages sous le seuil réglés sans qu'aucune couleur ne change de
> famille.

### 6. Une zone non contrôlée ne se lit jamais comme une zone saine

Cela vaut aussi pour les mécanismes d'interface : un accordéon fermé qui ne dit
pas ce qu'il contient se lit comme un bloc vide.

> **Le cas.** Le panneau « Ce qui n'a pas été contrôlé » garde son **compte
> visible même replié**. « L'interdire à l'écrit et l'autoriser à l'écran serait
> la même faute. »

### 7. Deux objets distincts doivent se lire comme deux

La superposition ne se règle pas à l'œil : elle se mesure en pixels de jour entre
les bords, à la taille réelle du cadre.

> **Le cas.** Deux pastilles au même point : la seconde disparaissait sous la
> première, donc devenait inaccessible, **sans que rien ne le signale**. Écartées
> en couronne, d'abord de 9 % — mesuré : 41 px d'écart pour 40 px de diamètre,
> « cliquables, mais collées, et l'œil y lisait une seule tache ». Portées à
> 13 % : 59 px, soit 19 px de jour sur un cadre de 430.

### 8. Une cible se dimensionne pour un pouce

27 px n'est pas une cible. Les liens en ligne dans un paragraphe sont l'exception
admise ; tout contrôle isolé ne l'est pas.

---

## III. La fidélité au visuel de référence

### 9. Une couleur de son cru est un défaut, même jolie

Toute couleur affichée se compare à celle **relevée dans le visuel de
référence**. Inventer une nuance « qui va bien » produit exactement l'effet
inverse de celui recherché.

> **Le cas.** `#b9b2a6` sur les chevrons — « elle était de moi, et elle les
> rendait presque invisibles ». Mesuré dans l'image de référence, le trait des
> chevrons tombe autour de `#06070a` : ils sont **sombres**.

### 10. L'accent se mesure en surface, pas en intention

Un accent est une proportion. On la relève sur le visuel de référence, en
pixels, avant de décider ce qu'il habille.

> **Le cas.** Le doré mesuré à **0,28 %** du visuel termites — 1 086 pixels sur
> 393 216 — et seulement sur du texte, un sous-titre et un pictogramme.
> **Jamais un fond.** Le produit, lui, en avait fait des aplats avec du padding.
>
> Corollaire tenu par un test : **un fond n'est pas un filet.** Un doré dans un
> bloc qui a du padding non nul ou une hauteur minimale est une surface, et
> échoue.

### 11. Ce que la maquette ne peut pas montrer se tranche par ce qu'elle montre

Une maquette mobile ne montre pas d'état de survol. Elle ne peut donc pas
trancher — mais elle montre son bouton principal, et c'est de là qu'on part.
L'absence dans le visuel n'est pas une autorisation à inventer.

> **Le cas.** Sept boutons se remplissaient d'or au survol. Le visuel montre son
> bouton principal en vert profond : les survols passent au vert, encre ivoire,
> 9,88 de contraste. **La bordure reste dorée** — sur fond vert profond, un
> bouton vert ne se détache qu'à 1,42 ; c'est le filet qui le borne, et un filet
> est précisément ce que les packs appellent un accent discret.

### 12. Un écart assumé avec le dessin s'écrit

On peut s'écarter du visuel. On ne peut pas le faire en silence : l'écart, sa
raison et son sens vont dans le commit.

> **Le cas.** Deux écarts assumés le même jour, argumentés tous les deux — un
> chevron atténué sur les lignes qui ne mènent à aucun bloc, parce que « le
> rythme du visuel est là ; la promesse d'un détail qui n'existe pas, non ».

---

## Les deux pièges du jour, à ne pas reprendre

**Une couleur hors charte n'est pas forcément une faute.** `#1c1c1c` est l'encre
des pastilles DPE, choisie parce que les couleurs de l'arrêté ne se retouchent
pas, et déjà mesurée sur les sept teintes. L'architecte a failli ordonner de la
remplacer. **On regarde le contexte avant de corriger.**

**Un repli n'est pas une valeur en dur.** `var(--u-surface, #f5f1e8)` prend sa
couleur dans l'univers. Une sonde qui les compte reproche à un composant d'être
correctement branché — elle en a inventé vingt.

Et la règle qui couvre les deux : **regarder ce qu'on mesure avant de conclure de
la mesure.**
