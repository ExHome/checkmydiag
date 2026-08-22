# OÙ PARSER

*La carte des endroits, rangée **par éditeur**, puis par volet. Établie par
lecture intégrale, en application de `ODM_OU_PARSER.md` et de
`ODM_UNE_ERREUR_CINQUANTE_LECTURES.md`.*

---

## La règle, rappelée en tête

**Un endroit se décrit par QUATRE choses. S'il en manque une, ce n'est pas un
endroit :**

1. **L'éditeur** — sous quel nom la carte est rangée.
2. **L'intitulé exact** — jamais la page, le numéro ni la lettre.
3. **Les bornes** — où ça commence, et surtout **où ça finit**.
4. **La disposition interne** — la réponse n'est pas toujours là où le libellé
   est.

Trois issues, pas une de plus : **trouvé** · la rubrique dit **« Néant »**
(c'est une réponse) · la rubrique est **absente** (on ne cite rien).

---

# PLOMB — CREP

*Lectures en cours : 38 sur 50 (11 doublons ⇒ **39 rapports distincts**). 47 LICIEL et 3 BC2E extraits.*

## Ce qui diffère entre les deux éditeurs, et qui casse un lecteur naïf

| | **LICIEL** | **BC2E** |
|---|---|---|
| Conclusion chiffrée | page 1 du volet **et** § 6.1 | page 2, dans un tableau à deux colonnes |
| Les 5 situations | § 6.4, réponse **seule sur sa ligne** | page 2, réponse **en fin de première ligne du libellé** |
| Transmission ARS | § 6.5, formulaire OUI/NON | **phrase à deux états** — voir plus bas |
| Locaux visités | « Liste des locaux visités » | « Liste **détaillée** des locaux visités » |
| Étalonnage | tableau entrée/sortie, valeurs proches du seuil | « Mesure de début : 0.00 - Mesure de fin : 0.00 » |

---

## LICIEL

### Page 1 du volet · « Le CREP suivant concerne : » — **le champ de la mission**

```
Le CREP suivant concerne :
X Les parties privatives              Avant la vente
  Les parties occupées              X Avant la mise en location
  Les parties communes d'un immeuble  Avant travaux
```

**Deux colonnes de cases à cocher**, marquées d'un `X`. La gauche dit le
périmètre (privatif / occupé / parties communes), la droite dit la circonstance
(vente / location / travaux).

⚠️ **Le `X` change de côté selon la case cochée** — encore une colonne :

```
X Les parties privatives              Avant la vente          ← privatif …
  Les parties occupées              X Avant la mise en location  … + location
```
```
  Les parties privatives            X Avant la vente          ← communes …
X Les parties communes d'un immeuble  Avant travaux              … + vente
```

Le `X` précède le libellé de gauche quand c'est la gauche qui est cochée, et
celui de droite quand c'est la droite. Il faut donc lire **quel libellé suit
immédiatement le X**, pas la position dans la ligne.

⚠️ **C'est cet encart qui commande la durée de validité** : un an à la vente, six
ans à la location. Le produit annonce aujourd'hui les deux sans savoir lequel
s'applique. **Non lu.**

### Page 1 du volet · « Conclusion des mesures de concentration en plomb »

```
Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3
Nombre d'unités
66 6 60 0 0 0
de diagnostic
% 100 9 % 91 % 0 % 0 % 0 %
```

**Bornes** : le même en-tête apparaît **trois fois** dans le volet — ici, puis au
§ 5 « Résultats des mesures », puis au § 6.1. Le lecteur actuel prend la
**première** occurrence. Vu un rapport où la page de garde porte `0 - - - - -`
alors que le § 6.1 porte la même chose : ce n'est pas un défaut de lecture, ce
rapport n'a réellement aucune unité de diagnostic.

**Disposition** : la ligne de chiffres est **coupée** par le libellé —
`Nombre d'unités` / `66 6 60 0 0 0` / `de diagnostic`. La ligne des `%` suit.

⚠️ **Et cette disposition n'est pas stable.** Trois formes vues en cinq
lectures :

```
(1)  Nombre d'unités          (2)  Nombre d'unités        (3)  Nombre d'unités
     66 6 60 0 0 0                 0 - - - - -                 0 29 0 0 0
     de diagnostic                 de diagnostic               29
     % 100 9 % 91 % …              % 100                      de diagnostic
```

La troisième **rejette le total sur sa propre ligne**, après les cinq autres
chiffres. Le lecteur actuel cherche une ligne de **six** nombres dont la somme
retombe sur le total : il ne trouve que cinq, puis un seul, et abandonne.

**Vue deux fois sur vingt-huit lectures** (lectures 5 et 27) : ce n'est pas un
accident de mise en page isolé.

La seconde est un rapport qui n'a réellement **aucune** unité de diagnostic — ce
n'est pas un défaut de lecture.

**Il faut donc lire le tableau du § 6.1**, pas celui de la page de garde : c'est
le seul dont la norme et l'arrêté imposent le contenu.

### Page 1 du volet · « Présence et nombre d'enfants mineurs »

```
Nombre total :
Présence et nombre d'enfants mineurs,
NON
dont des enfants de moins de 6 ans
Nombre d'enfants de moins de 6 ans :
```

**La réponse est intercalée AU MILIEU du libellé**, sur sa propre ligne. C'est
l'encart que le § 4 de NF X 46-030 et le § 3 de l'annexe I de l'arrêté rendent
obligatoire — la raison d'être du CREP. **Non lu.**

⚠️ **Et sa casse n'est pas celle des autres réponses.** Trois formes relevées :

```
NON            ← capitales, comme les cinq situations
Oui            ← capitale initiale seulement
NON RENSEIGNÉ  ← un troisième état, ni oui ni non
```

Un motif en capitales — celui qui lit correctement le § 6.4 — **ne verrait pas
le « Oui »**. Et « Oui » est précisément la réponse qui compte : c'est celle qui
signale un enfant en bas âge dans un logement au plomb.

### § 5 · Les motifs de non-mesure — trois formes, et l'une vient de la norme

```
Non mesurée - NM   Absence de revêtement
Non mesurée - NM   Elément > 3m
NM : Non mesuré car l'unité de diagnostic n'est pas visée par la règlementation.
```

**« Elément > 3m » est réglementaire** : le § 9.3 de NF X 46-030 et le § 8.2 de
l'arrêté n'obligent l'opérateur à mesurer que jusqu'à **trois mètres de
hauteur**. Au-delà, des dispositions particulières se conviennent au contrat.

Ce n'est donc pas une négligence, c'est une limite du protocole — et c'est
exactement ce qu'un lecteur doit savoir de ce qui n'a pas été mesuré chez lui.

### § 5 · Le récapitulatif PAR LOCAL — ce qui permet de contrôler le seuil des 50 %

Chaque local du § 5 est précédé de son propre décompte :

```
Rez de chaussée / Parties communes - Local vélo
Nombre d'unités de diagnostic : 5 - Nombre d'unités de diagnostic de classe 3 repéré : 0 soit 0 %
```

**C'est l'endroit qui rend le premier seuil vérifiable.** « Au moins un local
présente au moins 50 % d'unités de classe 3 » se contrôle local par local, et le
rapport a déjà fait le calcul pour chacun. **Non lu.**

⚠️ **Et il existe sous DEUX formes, parfois dans le même rapport :**

```
(a) en-tête de chaque bloc de local
    1er étage - Palier
    Nombre d'unités de diagnostic : 15 - Nombre d'unités de classe 3 repéré : 0 soit 0 %
```
```
(b) tableau de synthèse en tête du § 5, une ligne par local
    Total UD  Non mesurées  Classe 0  Classe 1  Classe 2  Classe 3
    6 (75 %)  2 (25 %)      -         -         -
    Rez de chaussée - Cour  8
```

Dans la forme (b), **le nom du local vient APRÈS ses chiffres**, et son total est
collé derrière lui (`Rez de chaussée - Cour 8`). Les pourcentages sont entre
parenthèses, et les colonnes vides portent un tiret.

C'est le tableau (b) qui donne tout d'un coup — et c'est celui dont la forme est
la plus retorse.

### Page 2 · La phrase de conclusion — **trois états**

```
Lors de la présente mission il n'a pas été repéré de revêtements contenant du
plomb au-delà des seuils en vigueur.
```
```
Dans le cadre de la mission, il a été repéré des unités de diagnostics de
classe 1 et/ou 2. Par conséquent, le propriétaire doit veiller à …
```

```
Dans le cadre de la mission, il a été repéré des unités de diagnostics de
classe 3. Par conséquent, en application de l'article L.1334-9 du code de la
santé publique, le propriétaire du bien, objet de ce constat, doit effectuer les
travaux appropriés pour supprimer l'exposition au plomb …
```

Les trois états sont confirmés sur des rapports réels, dont deux **positifs avec
classe 3** (3 unités sur 82, puis 9 sur 63). Le troisième reproduit
l'article L. 1334-9, comme l'arrêté l'impose en première page.

⚠️ **Et le troisième état a lui-même DEUX libellés**, chez le même éditeur :

```
Dans le cadre de la mission, il a été repéré des unités de diagnostics de
classe 3. Par conséquent, en application de l'article L.1334-9 …
```
```
Du fait de la présence de revêtements contenant du plomb au-delà des seuils en
vigueur ET DE LA NATURE DES DÉGRADATIONS CONSTATÉES (DÉGRADÉ) sur certaines
unités de diagnostic et en application de l'article L. 1334-9 …
```

Le second nomme la dégradation. Quatre formulations en tout pour trois états —
un motif qui s'accrocherait à la phrase raterait la moitié des cas. **L'ancre est
l'article cité, pas la tournure.**

**C'est l'endroit qui donne le verdict en clair**, et il distingue les trois cas
que le décompte des classes oblige aujourd'hui à recalculer.

### § 6.2 · « Recommandations au propriétaire » — la conclusion, deuxième fois

```
Lors de la présente mission il a été mis en évidence la présence de revêtements
contenant du plomb au-delà des seuils en vigueur.
```

Même information, autre rubrique. Deux endroits disent la même chose : de quoi
se contrôler l'un l'autre.

### Le cas qui valide la correction du 20/08 sur la classe 1

Vingt-cinq lectures n'avaient montré que des `Classe 1 : 0`. La vingt-sixième
donne enfin le cas :

```
Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3
233 39 122 43 28 1
%    100  16,7 %  52,4 %  18,5 %  12 %  0,4 %
```

**43 unités de classe 1** — celles dont l'arrêté dit qu'elles sont « non dégradé
**ou non visible** ». C'est précisément le cas où écrire « en bon état » aurait
été faux quarante-trois fois dans un seul rapport.

### Et le corpus donne le cas en clair — lecture 35

```
136 mesure 1 7,55
Plafond  Divers  Toile de verre  Non Dégradé  1
137 mesure 2 8,17
```

**Un plafond à 7,55 puis 8,17 mg/cm² — huit fois le seuil — classé 1.** Parce
qu'il est recouvert de **toile de verre**.

C'est exactement le cas que l'annexe B de NF X 46-030 décrit avec un mur à
12,45 mg/cm². Je l'avais lu dans la norme hier ; le voici dans un vrai rapport.

Le produit écrivait « tous les revêtements concernés sont **en bon état** ». Huit
fois le seuil, sous une toile de verre : ce n'est pas « en bon état », c'est
**du plomb qu'on ne voit pas**. La correction du 20/08 tenait sur un texte ; elle
tient maintenant sur un cas.

**Et une seule unité de classe 3 sur 233 — 0,4 %** — suffit à déclencher la
conclusion qui cite L. 1334-9 et impose les travaux. Le seuil n'est pas une
proportion : c'est **une unité**.

### Cohérence interne — ce que les seuils permettent de vérifier

Sur les deux rapports positifs lus, les seuils du § 6.4 sont cohérents avec le
décompte du § 6.1 :

| Rapport | classe 3 / total | seuil des 20 % | réponse du rapport |
|---|---|---|---|
| 8 | 3 / 82 = 3,7 % | non atteint | NON ✔ |
| 9 | 9 / 63 = 14,3 % | non atteint | NON ✔ |

**Le seuil des 20 % est calculable.** Il permet donc de contrôler la réponse du
rapport, et non seulement de la lire — c'est le seul des cinq dans ce cas, avec
celui des 50 % s'il y a le détail par local.

### ⚠️ Le piège de la classe 2 — vérifié sur trois rapports

Un logement peut être massivement en plomb **sans déclencher aucun signalement** :

| Rapport | classe 2 | classe 3 | seuils § 6.4 |
|---|---|---|---|
| 32 | 14 / 31 = **45 %** | 0 | NON · NON |
| 33 | 20 / 35 = **57 %** | 0 | NON · NON |
| 23 | 31 / 61 = **51 %** | 3 (4,9 %) | NON · NON |

**Les deux seuils portent sur la classe 3, jamais sur la classe 2.** Un rapport
où 57 % des surfaces contiennent du plomb en état d'usage répond NON aux cinq
situations — et il a raison.

C'est un endroit où un motif mal borné, ou un lecteur pressé, lirait « 57 % » et
conclurait l'inverse. Le produit doit dire les deux choses sans les mélanger :
**beaucoup de plomb, aucun signalement** — parce que rien n'est dégradé.

### § 2.1 · L'appareil et son étalonnage

```
Étalon : FONDIS - N° NIST 2-1353 - Concentration 1,2 mg/cm² +/-0.1mg/cm²
Etalonnage entrée  1    10/11/2025  1 (+/- 0,1)
Etalonnage sortie  122  10/11/2025  1 (+/- 0,1)
```

Deux mesures test, à une valeur proche du seuil, comme la norme l'exige.
L'autorisation ASN porte sa date de fin de validité (`28/07/2029`).

⚠️ **La DATE de l'étalonnage est un contrôle, et elle se vérifie sans rien
supposer.**

Le § 9.2 de la norme et le § 4 de l'annexe I de l'arrêté imposent une
vérification **en début et en fin de CHAQUE constat**. La date portée au tableau
doit donc être celle du repérage.

Sur trente-huit lectures elle coïncide — sauf une :

```
Date du repérage : 12/11/2025
Etalonnage entrée  1   28/03/2024  1 (+/- 0,1)
Etalonnage sortie  89  28/03/2024  1 (+/- 0,1)
```

**Vingt mois d'écart.** C'est la date d'un autre chantier, restée dans le
formulaire.

Deux dates à comparer, rien de plus — et c'est de la même famille que les deux
contrôles que le produit fait déjà : l'attestation d'assurance et l'autorisation
ASN. Ce sont des **conditions de validité de la mesure**, écrites dans le
rapport. On les rapporte ; on ne juge pas celui qui les a saisies.

### § 2.3 · « Liste des locaux visités » et « Liste des locaux non visités ou non mesurés (avec justification) »

Deux rubriques successives, listes séparées par des virgules, sur plusieurs
lignes. La seconde dit **« Néant »** quand tout a été visité — c'est une réponse.

Quand elle n'est pas vide, le motif est `<local> (<motif>)` :

```
Liste des locaux non visités ou non mesurés (avec justification)
4ème étage - Combles (Impossibilité d'entrer)
```

**Le motif est entre parenthèses, collé au nom du local.** Deux rapports sur
vingt-six en portent un ; les autres disent « Néant ».

⚠️ **Et le second cas casse deux hypothèses du premier :**

```
Liste des locaux non visités ou non mesurés (avec justification)
Charpente sous plafond rampant (Contrôle de la charpente impossible sous les doublages dans le
grenier.)
```

— **la parenthèse court sur deux lignes**, il faut donc recoller ;
— **ce n'est pas un local mais un élément.** La rubrique mélange les deux : un
étage entier (« 4ème étage - Combles ») et une pièce d'ouvrage (« Charpente sous
plafond rampant »). Son intitulé le disait — « locaux non visités **ou non
mesurés** » — et je ne l'avais pas lu.

### § 6.4 · Les cinq situations — **la position de la réponse VARIE dans le même rapport**

C'est la découverte qui tranche, et elle interdit toute lecture par ordre de
lignes. Dans **un seul** rapport LICIEL, les cinq réponses ne sont pas placées
pareil :

```
Au moins un local … présente au moins 50% d'unités de diagnostic
NON                                                                  ← APRÈS
de classe 3
NON L'ensemble des locaux … 20% d'unités de diagnostic de classe 3   ← AVANT
Les locaux … au moins un plancher ou plafond menaçant de s'effondrer
NON                                                                  ← AU MILIEU
ou en tout ou partie effondré
```

Le OUI/NON occupe une **colonne** — à gauche chez LICIEL, à droite chez BC2E — et
l'extraction le pose dans le flux à la place que sa position verticale lui donne.
Avant, après ou au milieu du libellé selon la hauteur des lignes.

⚠️ **Et la MÊME ligne bascule d'un rapport à l'autre.** Le seuil des 20 %, chez
le même éditeur, dans la même rubrique :

```
NON L'ensemble des locaux … 20% d'unités de diagnostic de classe 3   ← lectures 4, 9, 14
```
```
L'ensemble des locaux … 20% d'unités de diagnostic de classe 3
NON                                                                  ← lecture 22
```

Quatre positions observées pour cette seule ligne, sur un seul éditeur. Il ne
s'agit donc même pas d'une habitude par éditeur : **c'est la mise en page qui
décide, rapport par rapport, selon la hauteur du libellé.**

**Conclusion : seule la géométrie peut apparier.** La réponse d'une situation est
le OUI/NON dont le `y` chevauche le bloc de son libellé. Tout appariement par
ordre, par proximité ou par comptage se trompera — et il se trompera en silence,
en donnant l'autre réponse plutôt qu'aucune.

Deux hypothèses ont été formulées puis **réfutées par la mesure** :

| Hypothèse | Ce qui l'a tuée |
|---|---|
| la réponse termine la ligne où le libellé commence | vrai chez BC2E, faux chez LICIEL |
| la i-ème réponse va à la i-ème situation | un rapport rend 4 réponses pour 5 situations |

### LE CAS D'ÉCOLE — lecture 29, le premier OUI du corpus

Vingt-huit lectures n'avaient donné que des NON. La vingt-neuvième porte la
chaîne complète, et elle se vérifie d'un bout à l'autre.

**Le § 5, récapitulatif par local :**

```
1er étage - Balcon 02
Nombre d'unités de diagnostic : 1 - Nombre d'unités de classe 3 repéré : 1 soit 100 %
```

Un balcon d'**une seule** unité, dégradée — écaillage, 7,57 mg/cm². Donc **100 %
de classe 3 dans ce local**.

**Le § 6.4 :**

```
Au moins un local … présente au moins 50% d'unités de diagnostic
OUI
de classe 3
NON L'ensemble des locaux … 20% d'unités de diagnostic de classe 3
```

Le premier seuil est atteint (100 % ≥ 50 %), le second ne l'est pas
(6 classes 3 sur 76 = 7,9 % < 20 %). **Les deux réponses sont exactes**, et le
récapitulatif par local permet de le vérifier.

**Le § 6.5 :**

```
Si le constat identifie au moins l'une de ces cinq situations, son auteur transmet, dans un délai de cinq
jours ouvrables, une copie du rapport au directeur général de l'agence régionale de santé
OUI
d'implantation du bien expertisé …
```

**Transmission : OUI.** Une situation suffit, et l'arrêté le dit ainsi.

### ⚠️ Ce que ce seul rapport prouve contre le lecteur actuel

`transmisALArs` cherche une **phrase d'action** — « nous avons donc […] transmis »,
« a été transmis à l'agence régionale ». Ce rapport n'en contient aucune : il
répond **`OUI` dans un formulaire**.

**Verrière dirait donc « pas de transmission » sur le seul rapport des vingt-neuf
qui a réellement transmis** — et sur le seul qui porte une situation de
saturnisme infantile.

C'est la démonstration que la phrase d'action ne suffit pas, et que le formulaire
du § 6.5 est l'endroit — chez LICIEL comme chez BC2E, avec deux dispositions
différentes.

### § 6.4 (suite) · la disposition vue chez BC2E — **réponse SEULE sur sa ligne**

```
Au moins un local … présente au moins 50% d'unités de diagnostic
NON
de classe 3
L'ensemble des locaux … présente au moins 20% d'unités de diagnostic de classe 3
OUI
```

⚠️ **Le libellé de la première situation est COUPÉ EN DEUX par la réponse.** Le
mot-clé `50% d'unités de diagnostic de classe 3` n'existe donc jamais d'un seul
tenant.

⚠️ **L'ancre ne doit pas être le titre de la rubrique** : le sommaire du rapport
porte « 6.4 Situations de risque de saturnisme infantile et de dégradation du
bâti 10 », et la borne de fin s'y referme immédiatement sur la ligne de sommaire
suivante. Zone obtenue : **1 ligne**. Il faut retenir la première occurrence
**dont la zone contient réellement une situation**.

### § 6.5 · Transmission à l'ARS — **le OUI/NON se déplace d'un rapport à l'autre**

Le texte réglementaire est recopié, et la réponse est posée dedans — mais pas au
même endroit :

```
… son auteur transmet, dans un délai de cinq
NON jours ouvrables, une copie du rapport …      ← collée au début de la 2e ligne
```
```
… son auteur transmet, dans un délai de cinq
jours ouvrables, une copie du rapport au directeur général …
NON                                               ← seule, après deux lignes
d'implantation du bien expertisé …
```

Même rubrique, même éditeur, deux rapports : la réponse n'est pas au même rang.
**Confirmation directe qu'aucune règle de position ne tient.**

### § 6.4 · une situation peut manquer

Un rapport n'imprime que **quatre** des cinq lignes : le seuil des 20 % est
absent, et le titre « Situations de dégradation de bâti » suit immédiatement la
première. Compter les réponses dans l'ordre décalerait donc tout — et un décalage
ici transforme un NON en OUI.

---

## BC2E

### Page 1 · Le sous-titre dit le champ

```
Constat des Risques d'Exposition au Plomb
PARTIE COMMUNE
```
ou
```
PARTIE PRIVATIVE - AVANT LOCATION
```

**Une seule ligne sous le titre**, en capitales. Trois valeurs observées :

```
PARTIE COMMUNE
PARTIE PRIVATIVE - AVANT LOCATION
PARTIE PRIVATIVE - AVANT VENTE
```

Plus simple que les cases de LICIEL, et tout aussi décisif. **La ligne d'articles
qui suit confirme** : `L1334-6` pour la vente, `L1334-7` pour la location,
`L1334-8` pour les parties communes.

Le rappel réglementaire le confirme plus bas, en changeant d'article selon le
cas : `L.1334-8` pour les parties communes, `L.1334-6 et L.1334-7` pour le
privatif.

### Page 2 · Le tableau à deux colonnes entrelacées

À gauche le décompte des classes, à droite les cinq situations.
**La réponse termine la première ligne du libellé** :

```
Unités de diagnostic en classe 2 : 0 0.0 % Les locaux … au moins un   OUI
plancher ou plafond menaçant de s'effondrer ou en
Unités de diagnostic en classe 3 : 0 0.0 %
partie ou tout effondré
Liste des pièces concernées : , Cave
```

**« Liste des pièces concernées »** n'apparaît **que** si une situation est OUI.
Elle est absente du rapport où les cinq sont NON.

### Page 2 · La transmission à l'ARS — **une phrase à DEUX ÉTATS**

```
Le rapport a été envoyé à l'agence régionale de santé.
```
```
Le rapport n'a pas été envoyé à l'agence régionale de santé.
```

⚠️ **Ce n'est pas une phrase d'action, c'est une ligne de formulaire.** Elle est
imprimée dans les deux cas. La lire comme une déclaration spontanée revient à
croire qu'un rapport qui la porte a forcément transmis.

### Page 1-2 · « État d'occupation du bien »

```
Le local est-il habité lors de la visite : NON   Présence de mineurs de -6 ans : NON
```

Trois états observés pour les mineurs : `NON`, `NON RENSEIGNÉ`, et
vraisemblablement `OUI`. **Non lu.**

### Page 1-2 · Les deux listes de locaux

```
Liste détaillée des locaux visités :
Entrée, Cage d'escalier, Dégagement, Cave
Liste détaillée des locaux non visités avec motif de l'absence de la visite :
Cour : Absence de clé
```

La seconde porte **le motif après deux-points**, une entrée par ligne. Elle dit
« Néant » quand il n'y en a pas.

### § 7 · Étalonnage

```
7. MESURES D'ÉTALONNAGES :
Mesure de début : 0.00 - Mesure de fin : 0.00
```

Format entièrement différent de LICIEL, et sur une seule ligne.

---

### § 6.3 · « Validité du constat » — **le rapport donne la DATE d'expiration**

C'est l'endroit le plus précieux du volet, et il a **deux états** selon le
résultat :

```
Validité du constat :
Du fait de la PRÉSENCE de revêtement contenant du plomb à des concentrations
supérieures aux seuils […] le présent constat a une durée de validité de 1 an
(jusqu'au 05/06/2023).
```
```
Validité du constat :
Du fait de l'ABSENCE de revêtement contenant du plomb […] il n'y a pas lieu de
faire établir un nouveau constat à chaque nouveau contrat de location.
```

**Le premier donne la date de péremption en clair, entre parenthèses.** Verrière
la déduit du décompte des classes ; le rapport l'a calculée. **Non lu.**

⚠️ **Et la phrase croise DEUX variables** : le résultat *et* le champ de la
mission. Quatre combinaisons observées :

| Champ | Résultat | Ce que le rapport écrit |
|---|---|---|
| vente | plomb présent | « durée de validité de **1 an** (jusqu'au JJ/MM/AAAA) » |
| location | plomb présent | « durée de validité de **6 ans** » |
| location | rien au-delà du seuil | « pas lieu de faire établir un nouveau constat **à chaque nouveau contrat de location** » |
| vente | rien au-delà du seuil | « il n'y a pas lieu de faire établir de nouveau constat » |

C'est le croisement que Verrière fait aujourd'hui à l'aveugle, faute de lire le
champ. **Le rapport, lui, a déjà tranché.**

⚠️ **Attention à la classe 2** : un constat sans aucune classe 3 mais avec deux
classes 2 porte tout de même « Du fait de la **présence** de revêtement contenant
du plomb […] durée de validité de 1 an ». C'est la **présence** qui périme, pas
la dégradation — ce que le produit dit déjà, et que le rapport confirme.

### § 6.3 (suite) · « Validité du constat » — la durée en toutes lettres

```
Validité du constat :
Du fait de l'absence de revêtement contenant du plomb […] il n'y a pas lieu de
faire établir un nouveau constat à chaque nouveau contrat de location. Le présent
constat sera joint à chaque contrat de location (article L 1334-7 …).
```

Le rapport **écrit lui-même** la conséquence en durée, et il l'adapte au cas —
vente ou location. Verrière la déduit du décompte des classes ; le rapport la
donne. **Non lu.**

### § 7 · Le texte intégral de L. 1334-9

Le rapport **reproduit l'article en entier**, y compris la phrase sur la
responsabilité pénale du bailleur. C'est l'article que l'audit du 21/08 avait
trouvé cité sans source dans le moteur — le rapport, lui, le porte.

---

## Ce que ces trois lectures ont déjà corrigé

1. **La transmission ARS chez BC2E** était lue comme une phrase d'action ; c'est
   un formulaire à deux états.
2. **Le champ de la mission** (vente / location / travaux) n'est lu chez aucun
   des deux, alors qu'il commande la durée de validité.
3. **Les enfants de moins de six ans** ne sont lus chez aucun des deux, alors que
   la norme et l'arrêté les rendent obligatoires.
4. **L'ancre des cinq situations** tombe sur le sommaire chez LICIEL.

---

## Observations de corpus

**Le même volet revient dans deux dossiers.** Les lectures 10 et 11 sont le même
rapport (`24/IMO/0157N`), extrait de deux PDF différents. Un dossier peut
embarquer le volet d'un autre — à prendre en compte avant de compter des
« rapports lus ».

**Et parfois ce sont deux VERSIONS du même rapport.** Les lectures 12 et 13
portent le même numéro (`24/IMO/0158N`) et les mêmes mesures, mais : rapport du
14 puis du 15 octobre, deux assurances différentes (`114.231.812` puis
`CDIAGK000266`), et surtout **la réponse sur les enfants passe de `NON` à
`Oui`**. Le second est une réédition corrigée.

Un dossier peut donc contenir la version périmée **et** la version corrigée. Se
fier à la première rencontrée, c'est lire l'ancienne.

⚠️ **Et ce n'est pas anecdotique : c'est systématique.** Sur les lectures 8 à 15,
une série entière de rapports du 14 octobre 2024 (`0154N`, `0155N`, `0156N`,
`0157N`, `0158N`) existe en **deux exemplaires**, distingués par la seule
attestation d'assurance :

```
version A :  N° de contrat 114.231.812     Date de validité : 31/12/2021
version B :  N° de contrat CDIAGK000266    Date de validité : 01/10/2025
```

Mêmes mesures, mêmes conclusions, même date de repérage. La version A porte une
assurance expirée trois ans avant le repérage ; la version B a été rééditée avec
la bonne. **Le contrôle d'attestation d'assurance de Verrière signale donc à bon
droit la version A — et il ne doit pas la signaler si la version B est dans le
même dossier.**

C'est un cas que le produit ne sait pas traiter : il analyse un volet, pas deux
volets concurrents. Une piste — le numéro de dossier est identique, la date de
rapport diffère : **la plus récente gagne.**

### Mesuré sur les cinquante lectures

**39 rapports distincts pour 50 lectures.** Onze lectures sont des doublons, et
un rapport revient **trois fois** :

```
3 ×  24/IMO/0159N      2 ×  24/IMO/0157N
2 ×  24/IMO/0162N      2 ×  24/IMO/0158N
2 ×  24/IMO/0160N      2 ×  23/IMO/0519N
2 ×  24/IMO/0154N
```

Toute la série d'octobre 2024 est concernée. **Compter des « rapports lus » sans
dédoublonner surestime la couverture de 22 %** — et c'est exactement le genre de
chiffre que je me serais attribué sans vérifier.

**La rubrique « Validité du constat » peut être VIDE** — c'est le cas sur un CREP
de parties communes, où la durée en années ne s'applique pas. Vide n'est pas
« non trouvé » : c'est cohérent avec le champ de la mission.

**Trois rapports du même jour partagent la même anomalie de saisie** : appareil
`Niton XLp 300`, source chargée le `01/02/2006`, et une autorisation ASN dont la
date de fin est **égale à sa date de début**. Ce n'est pas un accident isolé mais
une valeur recopiée. Verrière le signale déjà comme condition de validité — sans
juger celui qui l'a saisie.

---

## Lectures 40 à 50 — ce que la fin du corpus a appris

### La réponse du § 6.5 occupe QUATRE positions différentes, chez le même éditeur

Onze rapports LICIEL, une seule rubrique — « 6.5 Transmission du constat à
l'agence régionale de santé » — et quatre mises en page de la réponse :

```
lecture 44   NON  en tête de la LIGNE 1
             « NON Si le constat identifie au moins l'une de ces cinq situations, … »

lecture 43   NON  en tête de la LIGNE 2
   45 46 47  « Si le constat identifie au moins l'une de ces cinq situations, … »
   48 49 50  « NON jours ouvrables, une copie du rapport au directeur général … »

lecture 41   NON  SEUL sur sa ligne, entre la ligne 1 et la ligne 2
             « Si le constat identifie … dans un délai de cinq »
             « NON »
             « jours ouvrables, une copie du rapport … »

lecture 42   NON  SEUL sur sa ligne, APRÈS la ligne 2
             « Si le constat identifie … dans un délai de cinq »
             « jours ouvrables, une copie du rapport … »
             « NON »
             « d'implantation du bien expertisé … »
```

**Aucune règle d'ordre de ligne ne survit à ces quatre cas.** Ni « la réponse
termine la première ligne », ni « la réponse précède le libellé », ni « la
i-ième réponse répond à la i-ième question ». La seule chose qui reste vraie
dans les quatre : **la réponse est le mot le plus à gauche de sa bande
horizontale**, dans la colonne étroite qui longe le paragraphe. C'est de la
géométrie, pas de l'ordre de lecture.

### Le second OUI du corpus — et il est chez LICIEL (lecture 40)

Le rapport `22/IMO/0340` répond **OUI** deux fois :

```
§ 6.4  « Au moins un local parmi les locaux objets du constat présente au
         moins 50% d'unités de diagnostic de classe 3 »              OUI
§ 6.5  transmission à l'agence régionale de santé                    OUI
```

Trois choses en découlent.

1. **La lecture 29 n'était pas un cas isolé.** Deux rapports sur cinquante ont
   transmis à l'ARS, chez deux éditeurs différents, et **aucun des deux n'écrit
   de phrase d'action**. Les deux répondent dans un formulaire. Un lecteur qui
   cherche « le rapport a été transmis » manque les deux.

2. **Le seuil de 50 % se juge PAR LOCAL, pas sur le total.** Ce rapport porte
   36 unités de classe 3 sur 208, soit 17 % — donc **sous** les 20 % du second
   critère, qui est bien répondu `NON`. Et pourtant le premier critère est `OUI`,
   parce qu'un local pris isolément dépasse la moitié. On ne peut pas recalculer
   ce `OUI` depuis le tableau de synthèse : il faut le lire là où il est écrit.

3. **Le rapport porte lui-même la pièce justificative**, en tête de chaque local :

   ```
   Rez de jardin - Atelier
   Nombre d'unités de diagnostic : 8 - Nombre d'unités de diagnostic de
   classe 3 repéré : 1 soit 12.5 %
   ```

   C'est un endroit à part entière, présent chez LICIEL, et il donne le
   pourcentage par local sans aucun calcul de notre part.

### Le bloc des cinq situations est coupé par un saut de page (lecture 40)

Les situations 1 à 3 sont sur une page, les situations 4 et 5 sur la suivante,
séparées par le pied de page et le numéro de page. **Borner la rubrique « jusqu'à
la fin de la page » perd deux situations sur cinq.** La borne basse est le titre
suivant (« 6.5 »), pas la fin de page.

### Le piège de l'apostrophe espacée (lecture 44)

Le rapport `25/IMO/1001P` sort d'une autre version du moteur PDF. L'extraction
rend :

```
d ’ unités        au lieu de   d’unités
l ’ ensemble      au lieu de   l’ensemble
s ’ effondrer     au lieu de   s’effondrer
L.1334-10         au lieu de   L.1334 - 10
```

**Tous les motifs de `plomb.ts` échouent sur ce rapport** : ils cherchent
`d['’]unit[ée]s`, ils trouvent `d ’ unités`. Et symétriquement, les motifs qui
tolèrent les espaces autour du tiret de `L.1334 - 10` ne les trouvent plus ici.

Conclusion de forme, valable partout : **normaliser avant de chercher** —
apostrophes typographiques, espaces autour des apostrophes, espaces autour des
tirets internes aux références d'articles. Un motif qui décrit l'orthographe d'un
seul moteur de rendu n'est pas un motif, c'est une coïncidence.

Ce rapport a aussi un pied de page différent (autre adresse, pas de numéro
d'assurance) : **le pied de page ne peut pas servir d'ancre stable**, même chez
un seul cabinet.

### Une attestation d'assurance qui ne couvre pas la mission (lecture 47)

```
N° de contrat d'assurance   86517808/808109424
Date de validité :          30/09/2023
Date du repérage :          27/02/2024
```

Cas réel, et il n'est pas seul : les lectures 48 et 49 portent la même
attestation, périmée elle aussi au regard de leur date de repérage… sauf que ces
deux-là ont été faites en avril et mai 2023, donc **dans** la validité. Le
contrôle ne peut donc pas se faire sur le numéro de contrat : il se fait
date contre date, à chaque rapport.

Rappel du cadre : on affiche « attestation d'assurance à mettre à jour », on
n'affiche ni l'assureur ni le numéro, et on ne juge pas le diagnostiqueur.

### La réédition qui ne reprend pas tout (lecture 50)

Les lectures 49 et 50 sont **le même dossier** `23/IMO/0519N`, mêmes mesures,
mêmes locaux. Ce qui change dans la réédition :

```
                         lecture 49              lecture 50
date du repérage         16/05/2023              28/01/2025
n° de contrat            86517808/808109424      CDIAGK000266
date de validité         30/09/2023              01/10/2025
étalonnage entrée        16/05/2023              16/05/2023   ← inchangé
étalonnage sortie        16/05/2023              16/05/2023   ← inchangé
```

**L'attestation a été corrigée, l'étalonnage non.** Ce qui explique enfin les
trois écarts mesurés plus haut :

```
rapports avec date de repérage : 47
  étalonnage le même jour      : 44
  étalonnage à une autre date  :  3
```

Ces trois-là ne sont pas des appareils non vérifiés le jour de la visite : ce
sont **des rééditions dont la date d'étalonnage n'a pas été resaisie**. Verrière
ne doit donc pas conclure « appareil non vérifié » — elle lit et affiche les deux
dates, et laisse le lecteur voir l'écart. *Elle explique le diagnostic, elle ne
juge pas le diagnostiqueur.*

### « Rubrique absente » se prononce sur le rapport entier

Sur la lecture 45, le § 6.5 apparaît et le § 6.4 non — parce que l'extrait de
travail ne retient que des fenêtres autour des ancres. Le rappel vaut pour le
produit : **on ne conclut « rubrique absente » qu'après avoir balayé toutes les
pages**, jamais depuis une fenêtre de lecture.

---

## Ce que les cinquante lectures imposent de corriger

Par ordre de gravité mesurée.

1. **`transmisALArs` cherche une phrase, alors que c'est un formulaire.**
   Deux rapports sur cinquante ont transmis ; le lecteur actuel en manque deux
   sur deux. À réécrire sur la rubrique « 6.5 » et sa réponse `OUI`/`NON`.
2. **Les cinq situations doivent se lire à la géométrie.** Quatre positions de
   réponse constatées pour une seule rubrique.
3. **Normaliser apostrophes, espaces et tirets** avant tout motif.
4. **Borner les rubriques par le titre suivant**, pas par la fin de page.
5. **Lire le récapitulatif par local**, qui justifie le seuil des 50 %.
6. **Départager les rééditions** : à numéro de dossier égal, la date de rapport
   la plus récente gagne.
7. **Contrôler l'assurance date contre date**, jamais par numéro de contrat.

---

## Ce que la correction a changé, mesuré

Lecteur avant / après, sur les **120 premiers volets plomb** du corpus, éditeur
par éditeur. ⚠️ Compteurs seuls — rien du corpus ne sort d'ici.

```
                       volets   § 6.4 présente   situations OUI   transmis ARS
LICIEL   avant           117              117                0              6
         après           117              117                8              6
BC2E     avant             3                3                1              1
         après             3                3                1              1
```

**Zéro.** Le lecteur des cinq situations ne rendait rien sur 117 volets LICIEL —
c'est-à-dire sur 97 % de ce qu'il voit. Il ne se trompait pas : il se taisait, et
le silence ressemblait à « aucune situation constatée ». Huit situations cochées
`OUI` étaient dans les rapports, écrites en toutes lettres, page 15.

La rubrique était trouvée dans les 117 cas. C'est donc bien l'appariement de la
réponse au libellé qui échouait, et lui seul — exactement ce que les quatre
mises en page annonçaient.

### Deux affirmations que la mesure suivante a démenties

Sur 120 volets j'ai lu « 8 situations cochées, 6 transmissions » et j'en ai
conclu que deux rapports se contredisaient. **C'était faux, et l'erreur était
dans mon compteur** : il additionnait des SITUATIONS d'un côté et des RAPPORTS de
l'autre. Un rapport coche souvent plusieurs des cinq.

Repris proprement sur **200 volets**, rapport par rapport :

```
coche une situation mais § 6.5 = NON : 0
§ 6.5 = OUI mais aucune situation    : 0
```

**Aucune contradiction.** Les deux formulaires s'accordent partout.

Et la seconde, plus gênante encore, sur la même mesure :

```
transmission à l'ARS — même verdict avant / après : 200
                       vue maintenant, manquée avant :  0
                       vue avant, perdue maintenant  :  0
```

**La correction du § 6.5 ne gagne aucun rapport.** J'ai écrit qu'elle rattrapait
deux constats que le lecteur manquait : elle n'en rattrape aucun sur ce corpus.
Le motif de phrase les trouvait déjà, parce que les rapports LICIEL qui répondent
`OUI` portent AUSSI, plus bas, une remarque au passé composé — « Nous avons donc,
conformément à l'article L. 1334-10 […], transmis immédiatement une copie ».

Ce que la correction apporte reste réel, mais il faut le dire à sa taille : la
lecture ne repose plus sur une tournure de phrase que chaque éditeur écrit à sa
façon, mais sur la case du formulaire. C'est de la robustesse, pas de la
justesse — et je ne l'aurais pas su sans mesurer les deux versions côte à côte.

Le gain, lui, est entier sur les situations :

```
situations cochées OUI, sur 200 volets   avant :  1
                                         après : 22
```

### L'attestation d'assurance, même défaut de forme

Le contrôle ne connaissait qu'une écriture — « Numéro de police et date de
validité : … - 30/09/2023 », tout sur une ligne. Elle appartient à l'éditeur qui
pèse **3 volets sur 120**. Les 117 autres écrivent :

```
N° de contrat d'assurance      CDIAGK000266
Date de validité :             01/10/2025
```

Deux lignes, un autre intitulé — et le contrôle ne se déclenchait donc jamais
chez eux. La lecture 47 en porte le cas exact.

L'ancre reste le **contrat d'assurance**, jamais « Date de validité » seul : deux
lignes plus bas, le même intitulé sert à l'autorisation ASN de l'appareil, dont
la date de fin précède souvent le repérage sans rien dire de l'assurance.

---

## Qui a produit le volet plomb ? — la question n'avait jamais été posée

*Mesure du 21/08/2026, échantillon réparti sur tout le corpus : 11 358 PDF
candidats, 400 lus, **111 volets plomb**. Compteurs seuls.*

La carte ci-dessus range 117 volets sous « LICIEL » et 3 sous « BC2E ». Mais cet
éditeur-là est celui du **dossier**, nommé par la rubrique « Référence du
logiciel validé » — laquelle ne renseigne que le DPE. `editeur.ts` prévient
lui-même qu'un DDT peut mêler les générateurs.

En cherchant l'éditeur **sur les pages du volet plomb**, et sur elles seules :

```
éditeur du dossier          : LICIEL   111 / 111
éditeur nommé sur le volet  : inconnu  111 / 111
```

**Deux choses, et elles vont ensemble.**

1. **Les pages d'un CREP ne nomment jamais leur éditeur.** Ni rubrique logiciel,
   ni pied de page de réseau : 111 sur 111. Dire « ce CREP est un CREP LICIEL »
   est donc une **inférence tirée du DPE voisin**, jamais une lecture. Elle est
   probablement juste — un cabinet produit son dossier avec un seul outil — mais
   elle n'est pas mesurée, et elle tombe le jour où un dossier est assemblé.

2. **Le corpus plomb est mono-éditeur.** 111 volets sur 111 viennent de dossiers
   LICIEL. Ce n'est pas un défaut d'échantillonnage : c'est l'outil du cabinet.
   Les 3 volets BC2E sont l'exception qui a permis les seules comparaisons.

**Ce qu'il faut en conclure, et rien de plus** : tout ce que cette carte dit du
plomb est vrai *chez LICIEL*. Aucune règle plomb n'est aujourd'hui vérifiable
chez un second éditeur avec ce corpus. Le trou se déclare, il ne se comble pas —
il faudra des CREP d'ailleurs pour trancher.

---

## Lecture intégrale d'un CREP LICIEL — ce qu'elle ajoute

*Volet de 12 pages lu en entier, page à page, dans un dossier de 254 pages.*

### Le zéro s'écrit de DEUX façons dans le même rapport

Au § 6.1 « Classement des unités de diagnostic », le tableau de synthèse écrit
les classes vides **`0`**. Au § 5 « Résultats des mesures », le même décompte,
par local, écrit les mêmes classes vides **`-`** :

```
§ 5    Rez de chaussée - Plateau   12   2 (16,7 %)   5 (41,8 %)   -   5 (41,7 %)   -
§ 6.1  Nombre d'unités             12   2            5            0   5            0
```

Un lecteur qui attendrait six nombres au § 5 n'en trouve que quatre. C'est une
raison de plus de compter au § 6.1, comme le fait `compter()`.

### Le pourcentage est faux, l'effectif est juste

Sur ce rapport, 5 unités sur 12 valent 41,7 % — l'éditeur écrit **41,8 %** pour
la classe 0 et 41,7 % pour la classe 2, deux valeurs différentes pour le même
effectif. La ligne des pourcentages totalise **100,2 %**.

`compter()` écarte déjà toute ligne contenant `%`. **Ne jamais y revenir** : le
pourcentage de ce tableau n'est pas fiable, l'effectif l'est — et le contrôle
`non mesurées + classes = total` le vérifie.

### Les énumérations entre parenthèses sont des CATALOGUES, pas des constats

Ce rapport porte **zéro unité de classe 1**. Il écrit pourtant, deux fois :

```
il a été repéré des unités de diagnostics de classe 1 et/ou 2
… de la nature des dégradations constatées (non dégradé, non visible, état
d'usage) sur certaines unités de diagnostic
```

« et/ou », et une parenthèse qui liste les **trois** états de la norme alors que
le tableau n'en montre qu'un. C'est le même piège que le catalogue des six
domaines de l'électricité : une phrase pré-rédigée qui couvre tous les cas.

**Aucune classe ne se lit dans une phrase de conclusion.** Les chiffres sont au
§ 6.1, et `analyserPlomb` a raison de ne se fier qu'à eux — un lecteur qui
recopierait cette phrase annoncerait de la classe 1 dans un logement qui n'en a
aucune.

### Les traits d'union sont espacés partout

`au - delà`, `L.1334 - 10`, `R.1334 - 10`, `NF X46 - 030`, `info - certif.fr`.
Aucun motif de `plomb.ts` ne dépend d'un trait d'union collé — vérifié, il n'y en
a aucun — mais **tout motif futur doit tolérer `\s*-\s*`**, comme le fait déjà
`6\s*\.\s*4` pour les points.

### Ce que la lecture confirme sans rien changer

La position de la réponse du § 6.4 varie **dans le même rapport** : le premier
`NON` est inséré au milieu du libellé, coupé en deux lignes ; le deuxième le
précède. Les quatre mises en page décrites plus haut se vérifient ici.

Le § 6.3 donne la date en clair — « durée de validité de 1 an (jusqu'au
13/10/2025) » pour un repérage du 14/10/2024 : un an moins un jour.

---

## La note de bas de tableau n'est pas une borne — mesuré sur 107 volets

*21/08/2026. Le lecteur d'unités de diagnostic a été calé sur un volet lu en
entier, puis passé sur 107 volets plomb répartis dans tout le corpus.*

Le contrôle est celui du § 41 de l'ordre de mission : les unités reconstituées
doivent retomber sur le tableau de synthèse — même total, mêmes non mesurées,
mêmes classes.

```
volets plomb mesurés : 107   (tableau illisible : 11)
concordance          :  42   39 %
écarts               :  54
       16  unités manquantes + classes
       12  unités manquantes + non mesurées + classes
        9  unités manquantes + non mesurées
        8  trop d'unités + non mesurées
        6  trop d'unités + non mesurées + classes
        3  non mesurées + classes
```

**Trente-sept cas d'unités manquantes sur cinquante-quatre écarts.** La cause
était dans la borne de fermeture du tableau :

```
NM : Non mesuré car l'unité de diagnostic n'est pas visée par la règlementation.
Localisation des mesures sur croquis de repérage
```

Ces deux lignes ressemblent à une fin de tableau. **Ce sont des notes de bas de
tableau, réimprimées sous CHAQUE page.** S'en servir comme borne fermait le
tableau à la fin de sa première page : sur un CREP de plusieurs pages de
mesures, tout ce qui suivait était perdu.

Seul le passage à la rubrique suivante — § 6.1 « Classement des unités de
diagnostic » — ferme réellement le tableau.

**Ce que cela apprend, au-delà du plomb** : une borne de rubrique se prend sur un
titre de rubrique, jamais sur une phrase qui *ressemble* à une conclusion. Le
pied de page, la note, le rappel réglementaire se répètent — et une borne qui se
répète coupe le document au premier passage.

Et la leçon de méthode, qui est la même que celle des termites : **le lecteur
avait été calé sur un seul volet, où le tableau tenait sur une page.** Un repère
vu une fois n'est pas un repère.

---

## La ligne de base, sur échantillon FIGÉ — 21/08/2026

*120 dossiers tirés une fois sur 11 358 candidats, écrits à côté du registre et
relus tels quels à chaque passe. C'est la condition pour que deux mesures se
comparent : trois passes antérieures avaient donné 39 %, 47 % puis 33 % sur trois
échantillons différents — dont deux avec le même code.*

```
volets plomb mesurés : 33   (tableau illisible : 4)
concordance § 41     : 11   33 %
écarts               : 18
       13  unités manquantes (trois combinaisons)
        3  trop d'unités + non mesurées + classes
        2  non mesurées + classes
```

### La répartition des classes, enfin mesurée

```
classe 0 : 1 990   87 %
classe 1 :   110    5 %
classe 2 :   162    7 %
classe 3 :    17    1 %
```

**Un CREP est très majoritairement de la classe 0.** Sur 2 910 unités, 289
seulement dépassent le seuil — une sur dix. C'est une donnée de cadrage qui
manquait : elle dit que l'essentiel d'un constat décrit ce qui ne pose pas de
problème, et que le peu qui compte se cherche dans un dixième du tableau.

### Ce que cette répartition tranche

Le champ « état de conservation » n'est renseigné que sur **9 %** des unités.
Isolé, ce chiffre ressemble à un trou d'extraction. Rapporté aux seules unités
qui doivent en porter un — celles au-dessus du seuil, dont l'état décide s'il
s'agit d'une classe 1, 2 ou 3 :

```
état renseigné sur les unités au-dessus du seuil : 261 / 289   90 %
```

**Ce n'est donc pas un défaut.** Une unité de classe 0 n'a pas d'état de
conservation à décrire : il n'y a pas de revêtement au plomb à conserver. Les
28 unités restantes (10 %) sont à regarder, mais l'ordre de grandeur est bon.

⚠️ **La leçon de mesure** : un taux global ne dit rien tant qu'on ne l'a pas
rapporté à la population qui devrait le porter. J'ai failli conclure à un second
défaut d'extraction sur un chiffre qui décrivait en réalité la composition du
corpus.

---

## Deux hypothèses réfutées sur les unités manquantes

*Mesuré sur l'échantillon figé, 33 volets. La ligne de base est à 33 % de
concordance, dont 13 écarts sur 18 pour cause d'unités manquantes.*

### Ce n'est PAS une liste d'éléments trop courte

Première hypothèse : le lecteur ne reconnaîtrait pas certains éléments —
imposte, coffre, tablette, seuil, lambris, absents de sa liste.

La sonde a cherché, dans les bornes du tableau, **toute ligne portant un
classement 0-3 dont aucun élément n'est reconnu**. Elle n'en trouve aucune.

Allonger la liste des motifs n'aurait rien corrigé — et c'est exactement le
« lecteur unique rafistolé » que l'architecture par éditeur existe pour
empêcher.

### Ce n'est PAS la signature

Deuxième hypothèse, plus fondamentale : si l'en-tête de colonnes variait entre
versions du même logiciel, le tableau ne s'ouvrirait jamais et le lecteur
rendrait zéro unité — ce qui se compte comme « unités manquantes » sans qu'aucun
élément soit en cause.

```
signature LICIEL non reconnue : 0 / 33 volets
lecteur rendant zéro unité    : 1 / 33 volets
```

**La signature reconnaît tous les volets.** Le tableau s'ouvre partout, et le
lecteur rend des unités partout sauf une fois.

### Ce qui reste

Le déficit est donc **partiel** : le lecteur trouve des unités, mais pas toutes.
La question suivante n'est pas « pourquoi » mais **« combien »** — un ou deux de
moins par volet est un cas particulier récurrent, la moitié du tableau est un
défaut structurel, et on ne cherche pas la même chose dans les deux cas.

---

## Trois défauts trouvés en LISANT, après quatre sondes stériles

*21/08/2026, échantillon figé. Quatre sondes avaient réfuté trois hypothèses sans
rien trouver. Un volet de 105 unités ouvert et lu ligne à ligne a donné les trois
défauts en quelques minutes.*

### 1. Le nom du local était réimplémenté, et faux

Le lecteur remontait trois lignes au-dessus du récapitulatif et retenait la
première ligne « plausible ». Résultat sur ce volet :

```
  0 / 13   3ème étage - Entrée
  0 / 21   3ème étage - Chambre
  0 / 11   3ème étage - Salle d'eau/Wc
  0 / 60   3ème étage - Cuisine/Séjour
locaux captés SANS récapitulatif : « mesurées » | « Rapport du : »
```

Les 99 unités captées étaient rattachées à un fragment d'en-tête et à un pied de
page. `recapitulatifParLocal` faisait déjà ce travail, avec sa liste de ce qui
n'est **pas** un nom de local — on prend ses noms, dans l'ordre.

⚠️ **Le champ « local » était rempli à 100 % dans toutes les mesures.** Un taux de
remplissage ne dit rien de la justesse de ce qu'il remplit.

### 2. Un second chemin de nommage écrasait le premier

« Une ligne courte sans chiffre est un titre de local » : cette règle attrapait
« Rapport du : » en plein tableau. Le nom vient d'un seul endroit désormais.

### 3. Deux éléments manquaient à la liste

`Cheminée` — cinq occurrences dans le local qui perdait exactement cinq unités.
`Barreaux` — une, dans le local qui en perdait une.

**« Grille » n'a PAS été ajoutée.** Le § 3.2 du rapport la cite pourtant en
exemple d'élément métallique à mesurer — mais elle n'apparaît dans aucun tableau
lu. On ajoute ce qu'on a vu, jamais ce que le texte laisse supposer.

### Ce que ça donne

```
volet lu     0 / 105 correctement rattachées  →  105 / 105, quatre locaux sur quatre
échantillon  concordance § 41  33 %  →  45 %   (11 puis 15 volets sur 33)
             écarts            18    →  14
             récupération      2 911 / 2 960   98 %
```

⚠️ **Le taux de récupération a d'abord été annoncé à tort.** Le compteur ne
cumulait que les volets *en écart* — les concordants sortaient de la boucle
avant lui. Il décrivait donc le pire au lieu de l'ensemble. Deux indicateurs, et
il faut les deux : **98 %** dit ce que le lecteur retrouve, **45 %** dit combien
de dossiers sont exacts au sens du § 41. C'est le second qui commande le
branchement dans le produit.

### La leçon, et elle est dure

La sonde « éléments non reconnus » avait rendu **zéro**. Elle cherchait
exactement `Cheminée`, qui était sous ses yeux cinq fois. Elle était mal écrite,
et son zéro m'a fait éliminer la bonne hypothèse pendant quatre passes.

**Une sonde qui ment est pire qu'une absence de mesure** : un zéro ressemble à
une réponse. On lit d'abord, on sonde ensuite — et une sonde qui ne trouve rien
se vérifie sur un cas connu avant d'être crue.

---

## Les éléments d'unité de diagnostic, tels que les tableaux les nomment

*Liste tenue par la LECTURE, jamais par analogie. Chaque entrée a été vue à la
place d'unité de diagnostic dans un tableau du § 5.*

Le lecteur en connaissait seize. **Huit volets lus en entier en ont ajouté
quinze** :

```
cheminée · barreaux · marche · contremarche · faux limon · crémaillère
balustre · main courante · charpente · poteau · panne · solive
terrasse · façade · végétation
```

Six sont des pièces d'escalier : un escalier de 16 unités n'en rendait que 2.
Quatre sont des pièces de charpente, que le CREP mesure parce que le bois peut
porter une peinture au plomb. Les trois derniers sont des extérieurs — et
« végétation », que rien ne laissait prévoir, montre qu'une liste d'éléments ne
se devine pas : elle se lit.

### Ce qui a été refusé

**« Poutre »** — ajoutée par analogie avec « charpente », puis retirée : elle
n'apparaît dans aucun tableau lu. **« Lambris »** — retirée aussi : elle existe
dans les rapports, mais comme *revêtement* (« Plafond lambris bois vernis »), où
l'unité est le plafond. L'inscrire aurait fabriqué une unité de plus.

**« Grille »**, que le § 3.2 cite pourtant en exemple d'élément métallique à
mesurer, n'y est pas non plus : le texte la mentionne, aucun tableau ne la porte.

### Le prix d'un élargissement

Ajouter « Escalier » à la liste a créé **deux unités fantômes** : le tableau
récapitulatif du § 5 liste les pièces, et « RDC - Escalier 1  2  2 (100 %)… »
porte le mot. Les autres pièces y échappaient par hasard — « Cuisine » et
« Garage » ne sont pas des éléments.

D'où le garde-fou, vérifié sur les volets lus : **une ligne d'unité ne porte
jamais de pourcentage.** Les pourcentages vivent dans les récapitulatifs.

⚠️ **Élargir une liste de motifs se paie toujours quelque part**, et on ne le voit
qu'en mesurant après. C'est la raison d'être de l'échantillon figé.

---

## Le lecteur d'unités, arrivé à la concordance — et ce que ça ne prouve pas

*21/08/2026, échantillon figé de 120 dossiers, 33 volets plomb.*

```
                       départ    arrivée
concordance § 41        33 %      29 / 29 volets exploitables
écarts                  18        0
récupération            —         2 960 / 2 960 unités
```

Huit volets lus en entier ont donné **treize défauts**, dont deux dans du code
que je n'avais pas écrit (le nommage des locaux et la date du pied de page pris
pour un nom de pièce, tous deux dans `plomb.ts`, tous deux visibles dans le
produit).

### ⚠️ Ce que ce 100 % ne prouve pas

**Les corrections ont été faites en regardant cet échantillon.** Un lecteur
ajusté sur son propre terrain de mesure y réussit toujours : c'est du
sur-ajustement, pas de la justesse.

L'échantillon d'ajustement est donc archivé (`echantillon-crep-01.json`) et un
**second échantillon est tiré, que le lecteur n'a jamais vu**. C'est lui qui dit
la vérité. Tant que cette seconde mesure n'est pas faite, la première ne vaut
que comme « plus aucun défaut connu », jamais comme « le lecteur est juste ».

### La méthode qui a marché, en quatre temps

1. **Figer l'échantillon** — trois passes antérieures avaient donné 39 %, 47 %
   puis 33 % sur trois tirages différents, dont deux avec le même code.
2. **Lire un volet en écart en entier**, jamais sonder. Quatre sondes
   successives avaient réfuté trois hypothèses sans rien trouver ; la première
   lecture a donné trois défauts en quelques minutes.
3. **Corriger ce que la lecture montre**, et rien d'autre.
4. **Remesurer sur le même échantillon**, et regarder les DEUX chiffres : la
   concordance stricte peut monter pendant que la récupération baisse.

---

## Un endroit de plus : « Validité du constat » (§ 6.3)

Le CREP écrit lui-même jusqu'à quand il vaut. Verrière, elle, le **calculait** —
sans limite s'il ne trouve rien, douze mois sinon.

Douze mois, c'est la durée de la **vente** (article L. 1334-6). À la
**location**, c'est **six ans** : article R. 1334-11 du code de la santé
publique, énoncé déjà noté dans `reglement/textes.ts` et lu le 14/08/2026. Le
calcul ignorait la moitié de la règle.

### Mesuré, sur 200 volets

En comparant la date que le rapport écrit à celle que nous calculions :

```
120 rapports portent une date de fin écrite
 83 tombent juste  → tous cochés « Avant la vente »
 29 se trompent    → tous cochés « Avant la mise en location »,
                     et de 1825 jours, soit cinq ans à un jour près
```

**Zéro exception dans les deux sens.** Et l'effet sur le verdict affiché :

```
d'où vient la fin de validité
  écrite dans le rapport                : 157
  calculée faute de mieux                :  43

verdict « périmé » avant / après
  inchangé                               : 169
  déclaré périmé à tort, rendu valable   :  31
  devenu périmé                          :   0
```

**31 constats sur 200 — 15,5 % — étaient annoncés périmés alors qu'ils avaient
jusqu'à cinq ans à courir.** Aucun ne bascule dans l'autre sens.

### La correction n'est pas « ajouter six ans si location »

Elle est de **lire la date que le rapport écrit**. Cela supprime d'un coup le
calcul ET la lecture de la mission — donc deux occasions de se tromper. *Aucun
chiffre inventé : le rapport reste la référence.*

Le calcul reste en second recours pour les 43 volets où la rubrique est absente,
vide, ou d'une forme non reconnue.

### Les quatre réponses de la rubrique

```
120  « durée de validité de N an(s) (jusqu'au JJ/MM/AAAA) »
 30  « il n'y a pas lieu de faire établir un nouveau constat à chaque MUTATION »
 13  la même chose, « à chaque nouveau CONTRAT DE LOCATION »
 29  rubrique absente
  3  rubrique VIDE — un CREP de parties communes, où la durée en années ne
     s'applique pas. Vide n'est pas « non trouvé », et ce n'est pas non plus
     « sans limite » : on se tait.
  5  forme non reconnue
```

Les bornes : de « Validité du constat : » jusqu'à « Documents remis par le
donneur d'ordre » ou le titre 6.4 — le titre suivant, jamais la fin de page.

---

## Un endroit de plus : les enfants (« Renseignements », en tête)

C'est la raison d'être du CREP, et Verrière ne le lisait chez aucun éditeur. Le
saturnisme est une maladie de l'enfant : l'arrêté du 19 août 2011 nomme sa
première liste « situations de risque de saturnisme **infantile** », et le modèle
de rapport qu'il annexe pose la question **avant** les mesures.

### L'endroit, mesuré sur 200 volets

L'intitulé est présent dans **200 volets sur 200** — le seul endroit du CREP dont
on puisse le dire. La réponse occupe la ligne SUIVANTE, seule :

```
Nom de l'occupant, si différent du propriétaire
Nombre total :
Présence et nombre d'enfants mineurs,
NON
dont des enfants de moins de 6 ans   Nombre d'enfants de moins de 6 ans : 2
```

Après correction, le lecteur rend **21 OUI, 179 NON, zéro silence.**

### Deux pièges, dont un qui m'a coûté un volet

⚠️ **La casse change.** Le corpus écrit `NON` en capitales mais **`Oui`** en
capitale initiale — la même bascule que les lectures 12 et 13 avaient montrée sur
une réédition. Un motif qui n'accepte que les capitales lit tous les non et aucun
oui : il rendrait « aucun enfant » sur les 21 rapports qui disent l'inverse.

C'est une exception à la règle des capitales, et elle est bornée : on exige que
la ligne ne contienne QUE le mot, juste sous un intitulé connu. Ailleurs, « non »
finit une phrase ordinaire sur deux.

⚠️ **La réponse ne termine pas la ligne.** Mon premier motif la cherchait en fin
de ligne. Il a manqué un volet sur 200, et le seul de sa forme :

```
Le local est-il habité lors de la visite : NON  Présence de mineurs
de -6 ans : NON  Le local est-il en travaux : NON
```

Trois questions et trois réponses sur une ligne. Exiger la fin de ligne
manquait celle-ci — et aurait pu, ailleurs, prendre la réponse de la question
**suivante** pour la sienne. On lit donc la réponse collée à SON intitulé.

`Nombre total :` se promène aussi : tantôt sur la ligne d'avant, tantôt collé à
l'intitulé. On ne s'y ancre pas.

### Ce que le croisement montre

```
OUI, et du plomb au-delà du seuil (classes 1, 2 ou 3) : 13 sur 200
OUI, et du plomb DÉGRADÉ (classe 3)                   :  7 sur 200
```

**Sept rapports sur deux cents** décrivent un logement où vivaient des enfants
mineurs et où du plomb dégradé a été mesuré. C'est exactement la situation que
l'arrêté vise, et Verrière ne la disait nulle part.

Le fait ne s'affiche que sur un `OUI` : un `NON` ne dit rien à l'acquéreur,
puisque les occupants partent avec le vendeur. On rapproche deux endroits du
rapport, chacun cité dans ses mots, et on n'en tire aucune conclusion médicale.

### ⚠️ Ma sonde a laissé fuir deux noms

En mesurant les formes de cet endroit, mon masquage ne remplaçait que les
chiffres. Il a laissé passer **deux noms de personnes** dans ma sortie : « Nom de
l'occupant » est un champ libre, juste au-dessus de l'intitulé mesuré.

Rien n'est entré dans le dépôt, mais la règle est simple et je l'avais oubliée :
**une sonde qui masque « à peu près » ne masque pas.** Le masquage est désormais
une liste BLANCHE — les mots du formulaire, et rien d'autre ; tout le reste
devient « … ».

---

## Un endroit de plus : le récapitulatif par local

En tête de chaque local, le rapport écrit son compte et son pourcentage :

```
Rez de jardin - Atelier
Nombre d'unités de diagnostic : 8 - Nombre d'unités de diagnostic
de classe 3 repéré : 1 soit 12.5 %
```

C'est **exactement** ce que mesure la première situation de l'article 8 — « au
moins un local présente au moins 50 % d'unités de diagnostic de classe 3 » — et
le rapport le donne sans qu'on ait à calculer quoi que ce soit.

### Mesuré sur 200 volets

```
192  rapports le portent
  8  ne le portent pas
1812  locaux récapitulés
   0  ligne d'une forme que le motif ne reconnaisse
```

### Le croisement avec la case du § 6.4, et son seul point de friction

```
un local à 50 % ou plus            : 10
la case « 50 % » cochée OUI        :  8
les deux d'accord                  : 198 sur 200
case cochée sans local ≥ 50 %      :  0
local ≥ 50 % mais case non cochée  :  2
```

Les deux exceptions sont **exactement à 50 %** — 3 unités de classe 3 sur 6,
dans les deux cas. Nulle part ailleurs les deux endroits ne divergent.

L'arrêté écrit « **au moins** 50 % ». Deux lectures restent possibles, et **on ne
tranche pas** : soit le rapport applique un « plus de 50 % » strict, soit son
dénominateur n'est pas le même aux deux endroits — les unités non mesurées
peuvent compter ici et pas là.

**Verrière ne recalcule donc pas la case et ne dit pas que le rapport se
trompe.** Elle lit la case là où elle est cochée, et montre le récapitulatif à
côté. Les deux viennent du rapport ; le lecteur voit les deux. *Elle explique le
diagnostic, elle ne juge pas le diagnostiqueur.*

### Le piège du nom de la pièce

Le nom du local est sur la ligne d'AVANT — sauf quand un saut de page glisse
entre les deux l'en-tête du rapport ou son pied. Pris pour le nom, il ferait
afficher « Le local le plus touché — Constat de risque d'exposition au plomb
n° … ». On les écarte et on remonte de trois lignes au plus ; si rien de
plausible n'apparaît, **on laisse le nom vide plutôt que d'attribuer les chiffres
d'une pièce à une autre.**

### Ce que le fait rend, mesuré

```
rapports avec du plomb DÉGRADÉ (classe 3) : 49 sur 200
fait « Le local le plus touché » posé      : 47
dont le local est NOMMÉ                    : 47
```

Les deux manquants sont des rapports sans récapitulatif. **Aucun fait n'est posé
sans nom de pièce.** Répartition des pièces désignées : 15 autres, 13 pièces de
vie, 11 pièces d'eau, 8 circulations.

---

# ÉLECTRICITÉ — état de l'installation intérieure

*Ouvert le 21/08/2026. Trois volets lus en entier, chez trois éditeurs :
AnalysImmo (11 pages), DPE WIN V4 (5 pages), LICIEL (pages 2 à 4 sur 10).
Aucune ligne de ce chapitre ne vient d'une sonde : tout est lu.*

**Ce que ce chapitre ne couvre pas encore.** 57 volets élec sont au registre de
lecture ; trois sont lus ici. Imm'PACT n'a qu'une mention de sommaire, Expertec
et la famille HTML2PDF n'ont aucun volet élec dans le corpus hors Liciel. Les
lignes ci-dessous valent **chez les éditeurs où elles sont mesurées**, et nulle
part ailleurs.

## Borner le volet — le seul repère vrai chez les trois éditeurs

**La pagination interne du volet, en pied de page.** Chaque éditeur la formule à
sa manière, tous la portent sur **chaque** page du volet :

| Éditeur | Ce que dit le pied de page | Étendue mesurée |
|---|---|---|
| AnalysImmo | `<réf> ELEC 1 / 11` … `11 / 11` | 11 pages |
| DPE WIN V4 | `Etat de l'Installation intérieure d'Electricité <réf> - page 1/5` | 5 pages |
| LICIEL | `2 / 10`, sous l'en-tête `Etat de l'Installation Intérieure d'Electricité n° <réf>` | 10 pages |

C'est le seul repère de bornage vu chez **trois** éditeurs : il passe donc la
règle des deux. Le titre du volet, lui, ne borne rien — il apparaît aussi au
sommaire du dossier (page 3 chez AnalysImmo comme chez LICIEL).

## ⚠️ Le piège qui commande tout le reste : la case cochée

Les trois éditeurs impriment **la liste entière des domaines**, cochée ou non.
Ce qui distingue un domaine touché d'un domaine sain n'est donc jamais le texte.
Et l'état de la case s'extrait de **trois façons différentes** :

| Éditeur | Ce que devient la coche à l'extraction | Conséquence |
|---|---|---|
| **DPE WIN V4** | le caractère **9** seul sur sa ligne, ou sur la ligne *suivant* le libellé | lisible, mais jamais alignée : à lire par coordonnées |
| **LICIEL** | **rien du tout** — la case est un graphique | **le texte ne permet pas de conclure** |
| **AnalysImmo** | pas de case : le mot **Néant** sous le domaine sans anomalie | lisible en clair, le plus sûr des trois |

**Chez LICIEL, les deux conclusions opposées sont imprimées l'une sous l'autre :**

> L'installation intérieure d'électricité ne comporte aucune anomalie.
> L'installation intérieure d'électricité comporte une ou des anomalies.

Un lecteur de texte voit les deux et peut conclure l'une ou l'autre. **Il ne
faut donc pas lire la conclusion de LICIEL à cet endroit** — voir ci-dessous.

## Où lire le verdict, éditeur par éditeur

### LICIEL — dans la **première colonne du tableau d'anomalies**, pas dans la conclusion

Le tableau qui suit la liste des domaines a trois colonnes : `Domaines`,
`Anomalies`, `Photo`. La première colonne porte le domaine **numéroté** — par
exemple « 2. Dispositif de protection différentiel à l'origine de
l'installation », « 4. La liaison équipotentielle… », « 5. Matériels
électriques… ».

**Les domaines réellement touchés sont exactement ceux qui apparaissent dans
cette colonne.** C'est le seul endroit du volet où l'information existe en
toutes lettres.

⚠️ **Question ouverte, à trancher à la lecture suivante.** Dans le volet lu, la
cellule du domaine 2 contient **huit** libellés d'anomalie, dont deux seulement
portent un `Remarques :` avec localisation. On ne peut pas décider depuis le
texte si les six autres sont des anomalies retenues sans remarque, ou le
catalogue complet du domaine imprimé d'office. **Deux libellés y sont
mutuellement peu compatibles** — « Il n'existe aucun dispositif différentiel »
et « Au moins un dispositif de protection différentielle ne fonctionne pas pour
son seuil de déclenchement » — ce qui fait pencher vers le catalogue. Mais
pencher n'est pas mesurer. Un second volet LICIEL tranche : si les huit mêmes
lignes reviennent sur un autre bien, c'est un catalogue.

### DPE WIN V4 — trois rubriques cochées, dans cet ordre

1. `1 - Anomalies et/ou constatations diverses relevées lors du diagnostic :`
   quatre phrases exclusives, une seule cochée.
2. `2 - Les domaines faisant l'objet d'anomalies sont :` **onze** libellés.
3. `3 - Les constatations diverses concernent :` trois libellés.

### AnalysImmo — « Néant » ou un tableau, sous chacun des six domaines numérotés

`§5 CONCLUSIONS RELATIVES A L'EVALUATION DES RISQUES…` porte les six domaines
numérotés `1.` à `6.`, puis `Installations particulières : P1, P2.` et `P3. La
piscine privée ou le bassin de fontaine`. Sous chacun : **Néant**, ou un tableau.

## ⚠️ Le nombre de domaines n'est pas le même d'un éditeur à l'autre

| | AnalysImmo | DPE WIN V4 | LICIEL |
|---|---|---|---|
| Domaines listés | **6** + P1/P2 + P3 | **11** | **6** |
| Différentiel et prise de terre | groupés en un domaine | **séparés** en deux | groupés en un |
| Contact direct et protection mécanique | groupés en un | **séparés** en deux | groupés en un |
| Zones des locaux avec douche | dans le domaine 4 | domaine distinct | dans le domaine 4 |

Un lecteur qui compte six domaines se trompe d'un tiers chez DPE WIN. **Le
domaine ne se lit pas par son rang, il se lit par son libellé.**

## ⚠️ Le code d'article n'est pas une clé universelle

| Éditeur | Forme du code | Exemples |
|---|---|---|
| AnalysImmo | points et parenthèse fermante | `B.3.3.6 a1)`, `B.5.3 a)`, `B.8.3 e)` |
| DPE WIN V4 | pas de point après B, pas de parenthèse | `B2.3.1 h`, `B4.3 e`, `B5.3 a` |
| **LICIEL** | **aucun code** — l'anomalie n'est désignée que par son libellé | — |

Deux conséquences :

1. Une expression régulière sur `B\.\d` rate DPE WIN ; sur `B\d`, elle rate
   AnalysImmo. Et **chez DPE WIN le séparateur varie à l'intérieur du même
   tableau** : `B5.3.d` et `B5.3 b` s'y suivent.
2. **Chez LICIEL, il n'y a rien à faire correspondre qu'un libellé.** Ces
   libellés sont ceux du FD C16-600 : c'est donc une table de libellés, pas une
   table de codes, qui rapproche les trois éditeurs.

## ⚠️ Le même code apparaît dans des rubriques de sens opposé

Chez DPE WIN, `B5.3 a` est **une anomalie** ; `B5.3.d` et `B5.3 b` sont, deux
rubriques plus bas, des **points de contrôle n'ayant pu être vérifiés**. Même
famille de code, sens inverse.

Un ramassage de tous les codes du volet compte donc des points non vérifiés
comme des anomalies. **Sans rubrique bornée, on ne cite rien.**

### Les trois rubriques qui portent des codes, et ce qu'elles veulent dire

| Rubrique | Sens | Vu chez |
|---|---|---|
| Conclusion / anomalies identifiées | anomalie constatée | les trois |
| `Points de contrôle du diagnostic n'ayant pu être vérifiés` | **non contrôlé** — ni bon ni mauvais | DPE WIN |
| `Informations complémentaires` | **constat, souvent favorable** | AnalysImmo, DPE WIN |

**La polarité des `B11` se lit au dernier caractère** — mesuré sur deux
éditeurs, deux volets, à confirmer :

| | AnalysImmo (volet lu) | DPE WIN (volet lu) |
|---|---|---|
| `B11 a1` | présent — différentiel 30 mA en place | présent — idem |
| `B11 b…` | `b2` : « au moins un socle **n'est pas** à obturateur » | `b1` : « l'ensemble des socles **est** à obturateur » |
| `B11 c…` | `c2` : « ne possède pas un puits de 15 mm » | `c1` : « possède un puits de 15 mm » |

`1` = favorable, `2` = défavorable. **Compter les `B11` comme des anomalies est
une faute** : ici, `B11 a1` dit que l'installation *est* protégée.

## ⚠️ Le pavé pédagogique répète tous les noms de domaine

Les trois éditeurs ferment le volet par l'explication réglementaire des risques
— `§8 EXPLICITATIONS DETAILLEES…` chez AnalysImmo, `OBJECTIF DES DISPOSITIONS ET
DESCRIPTION DES RISQUES ENCOURUS` chez DPE WIN. **Ce pavé reprend en titres tous
les noms de domaine.** Qui cherche « Dispositif de protection différentiel » sur
le volet entier le trouve deux fois : dans la conclusion, et dans le cours.

Chez DPE WIN le pavé est indexé par **code de groupe** (`B1`, `B2`, …), ce qui
ajoute une quatrième famille de codes à ne pas confondre avec les trois autres.

## Où sont les mesures chiffrées — trois endroits différents

| Éditeur | Rubrique | Ce qu'on y trouve |
|---|---|---|
| DPE WIN V4 | `CARACTERISTIQUES DE L'INSTALLATION INTERIEURE…`, en tête | « mesure de la résistance de la prise de terre par la boucle d'impédance : *n* ohms » |
| AnalysImmo | `Autres constatations`, **rubrique non numérotée**, en puces libres | résistance de terre, calibre du disjoncteur, seuils de déclenchement mesurés |
| LICIEL | non mesuré dans les pages lues | — |

Chez AnalysImmo c'est une zone de texte libre de l'opérateur : les quatre puces
lues y sont rédigées à la main. **Fiabilité faible, mais c'est le seul endroit
où les valeurs existent.**

## Le cadeau d'AnalysImmo : la même anomalie, écrite trois fois

Le tableau du `§5` est **illisible en lecture par lignes** : ses six colonnes
s'entrelacent à l'extraction, et le libellé, la mesure compensatoire et
l'observation se mélangent sur la même ligne reconstruite. Il faudrait le lire
par coordonnées.

**Ce n'est pas nécessaire, parce que le même contenu est réécrit deux fois plus
bas, proprement :**

| Endroit | Forme | Contenu |
|---|---|---|
| `§5`, par domaine | 6 colonnes entrelacées (domaine 2) ou 4 (domaines 4, 6) | toutes les anomalies **+ le domaine** |
| `ANNEXE 1 – LISTE DES ANOMALIES COMPENSEES` | tableau propre à 4 colonnes | les anomalies **compensées seulement** |
| `ANNEXE 3 – PHOTO(S) DES ANOMALIES` | **clé-valeur à plat**, un bloc par anomalie | **toutes** les anomalies |

L'annexe 3 est la forme la plus simple du corpus, tous éditeurs confondus :
`Point de contrôle N° <code>`, puis `Description :`, `Observation(s)`,
`Localisation :`.

**Donc : lire l'annexe 3 pour la liste des anomalies, et le `§5` seulement pour
rattacher chaque code à son domaine.** À confirmer sur un second volet
AnalysImmo — l'annexe s'appelle « photos des anomalies », et rien ne dit encore
qu'elle existe quand l'opérateur n'a pris aucune photo.

## Le nombre de colonnes change à l'intérieur du même rapport

Chez AnalysImmo, le tableau du `§5` a **six** colonnes pour le domaine 2 —
celui qui admet des mesures compensatoires — et **quatre** pour les domaines 4
et 6, qui n'en admettent pas. Un lecteur qui fixe le nombre de colonnes sur la
première table décale tout le reste.

Chez DPE WIN le tableau des anomalies n'a que **deux** colonnes : le code, puis
une cellule unique où le libellé, le conseil, `Mesure compensatoire :` et
`Localisation :` s'empilent en lignes étiquetées.

## La localisation, chez les trois

| Éditeur | Où | Forme |
|---|---|---|
| AnalysImmo | colonne `Localisation(*)`, et `Localisation :` en annexe 3 | phrase courte |
| DPE WIN V4 | ligne `Localisation :` dans la cellule de l'anomalie | phrase courte |
| LICIEL | dans `Remarques :`, **mêlée au conseil**, entre parenthèses | noms de pièces **collés sans séparateur**, et répétés |

Chez LICIEL, la localisation n'est pas un champ : c'est la fin d'une phrase de
remarque, où les pièces s'agglutinent. Elle se lit, elle ne se découpe pas
proprement.

## Ce que ces trois lectures imposent au produit

1. **Ne jamais lire la conclusion élec de LICIEL dans la rubrique 5.** Lire la
   première colonne du tableau d'anomalies.
2. **Ne jamais compter les `B11`** parmi les anomalies.
3. **Ne jamais ramasser les codes hors d'une rubrique bornée** : les points non
   vérifiés partagent le namespace des anomalies.
4. **Ne pas indexer les domaines par leur rang** : six chez deux éditeurs, onze
   chez le troisième.
5. **La date de fin de validité est écrite dans le volet** — AnalysImmo :
   `Date de fin de validité : <date>`, sous `DATE, SIGNATURE ET CACHET`. Comme
   pour le CREP, elle se lit avant de se calculer.

## Rubriques rencontrées, éditeur par éditeur

Une case vide est **un trou de mesure**, pas une absence.

| Rubrique | AnalysImmo | DPE WIN V4 | LICIEL |
|---|---|---|---|
| Désignation du local / caractéristiques du bâtiment | `1` | `CARACTERISTIQUES DU BÂTIMENT` | non lu |
| Caractéristiques de l'installation | — | ✅ (avec la mesure de terre) | non lu |
| Donneur d'ordre | `2` | dans `MISSION` | non lu |
| Opérateur, certification, assurance | `3` | dans `MISSION` | non lu |
| Rappel des limites du champ | `4` | ✅ | `4.` |
| Conclusion / évaluation des risques | `5` | ✅ (3 sous-listes cochées) | `5.` |
| Tableau des anomalies | dans `5` | rubrique séparée | sous `5.` |
| Informations complémentaires | ✅ | ✅ | non lu |
| Points de contrôle non vérifiés | non relevé | ✅ | non lu |
| Avertissement particulier | `6` (Néant) | ✅ (fusionné aux constatations diverses) | non lu |
| Devoir de conseil | `7` (Néant) | fusionné au tableau d'anomalies | non lu |
| Autres constatations (mesures chiffrées) | ✅ non numérotée | — | non lu |
| Explicitations des risques (pavé) | `8` | ✅ indexé `B1`…`B11` | non lu |
| Parties non visitées | `9` (Néant) | ✅ (Néant) | non lu |
| Date, signature, fin de validité | ✅ | non relevé | non lu |
| Certificat de compétences | page image | non relevé | non lu |
| Annexe : anomalies compensées | ✅ | — | — |
| Annexe : photos des anomalies (clé-valeur) | ✅ | non relevé | non lu |
| Installations particulières P1/P2/P3 | ✅ (Néant) | dans les 11 domaines | ✅ |

**Sur 19 rubriques et 3 éditeurs, 27 cases sur 57 sont vides.** Le volet LICIEL
n'a été lu qu'en ses pages 2 à 4 sur 10 : ses colonnes se rempliront à la
lecture suivante.

## Ce qui reste à lire

1. **Les pages 1 et 5 à 10 du volet LICIEL** déjà ouvert.
2. **Un second volet LICIEL**, pour trancher la question du catalogue du domaine 2.
3. **Les 56 autres volets élec** du registre.
4. **Imm'PACT** : une seule mention en page 16, jamais ouverte.
5. **Le texte de l'arrêté du 28 septembre 2017**, annexe III — c'est lui qui
   impose le modèle, et il dira lequel des trois découpages de domaines est le
   sien.

---

# GAZ — État de l'installation intérieure

*Mesuré le 21/08/2026 sur le corpus terrain : **881 PDF parcourus, 26 volets gaz
distincts**, lus en entier. Norme NF P 45-500 (juillet 2022), arrêté du
6 avril 2007 modifié.*

## ⚠️ Ce que ce corpus ne permet pas

**Les 26 volets sont tous du même éditeur : LICIEL** (29 occurrences dont 22 par
déclaration du logiciel, 4 par signature du PDF). Rien de ce qui suit n'est
validé hors LICIEL. Conformément à la règle du référentiel, aucune entrée ci-
dessous n'est « constante » : elle est vraie *chez LICIEL*, et « non mesuré »
partout ailleurs.

Et 26 lectures ne sont pas 100. Le corpus terrain n'en contient pas davantage :
le plafond est celui du fonds, pas celui de la méthode. Ce qui suit est donc
**mesuré et reproductible, mais pas gravé**.

## Le plan des rubriques n'est pas le même dans tous les rapports LICIEL

Deux plans coexistent, et la différence porte précisément sur la conclusion :

| | 24 volets sur 26 | 2 volets sur 26 |
|---|---|---|
| Conclusion | **`H. - Conclusion`** | **`Conclusion :`, sans lettre** |
| Actions en cas de DGI | `I. -` | **`H. -`** |
| Actions en cas de 32c | `J. -` | **`I. -`** |

**Conséquence directe : « la rubrique H » ne désigne pas la même chose d'un
rapport à l'autre.** Un lecteur qui borne la conclusion à la lettre H lit, dans
deux rapports sur vingt-six, *les actions de fermeture de l'installation* à la
place du verdict. Borner par la lettre est ici une faute ; c'est l'intitulé qui
délimite, et lui seul.

## ⛔ L'endroit où la conclusion NE se lit PAS : la conclusion elle-même

La rubrique de conclusion est un **formulaire à cocher**. Les cinq réponses
possibles y sont imprimées, l'une sous l'autre, **dans les 26 volets sur 26** :

```
Conclusion :
L'installation ne comporte aucune anomalie.
L'installation comporte des anomalies de type A1 qui devront être réparées ultérieurement.
L'installation comporte des anomalies de type A2 qui devront être réparées dans les meilleurs délais.
L'installation comporte des anomalies de type DGI qui devront être réparées avant remise en service.
L'installation comporte une anomalie 32c qui devra faire l'objet d'un traitement particulier…
```

La réponse est la **case cochée**, qui est un glyphe : elle ne sort pas dans le
texte extrait. Mesuré : chacune des cinq phrases est présente exactement une
fois dans chacun des 26 volets.

**Donc chercher « L'installation ne comporte aucune anomalie » la trouve
toujours — 26 fois sur 26, y compris sur les rapports qui portent un DGI.**
C'est le faux positif le plus dangereux du volet gaz : il annonce une
installation saine là où le rapport demande une coupure immédiate.

La même remarque vaut pour les rubriques « en cas de DGI » et « en cas
d'anomalie 32c » : leur contenu — *fermeture totale, pose d'une étiquette de
condamnation, transmission au distributeur* — est imprimé **dans tous les
rapports**, y compris ceux sans la moindre anomalie. Ce sont des consignes de
procédure, jamais un constat.

## ✅ L'endroit qui répond : la rubrique E, bornée

**Bornes** — présentes dans les 26 volets sur 26 :

- ouverture : `E. - Anomalies identifiées`
- fermeture : `F. – Identification des bâtiments et parties du bâtiment…`
  (⚠️ tiret **demi-cadratin** dans F, trait d'union dans les autres lettres)

**Dans ces bornes, deux états, et ils s'excluent — mesuré 26/26 :**

| État | Forme | Volets |
|---|---|---|
| Aucune anomalie | la ligne `Néant - -` | 13 |
| Anomalies constatées | une ou plusieurs lignes portant un **code de point de contrôle** | 13 |
| Les deux à la fois | — | **0** |

Le code de point de contrôle est la référence de la norme : `C.4 - 7a2`,
`C.7 - 8a1`, `C.7 - 8b`, `C.10 - 14`, `C.14 - 19.1`, `C.14 - 19.8`. Motif
mesuré : `C.<n> - <n><lettre ou .n>`.

**C'est lui le repère, pas le mot.** Une ligne qui porte un code constate ; une
ligne qui n'en porte pas ne constate pas.

## Les trois parasites de la zone E, mesurés

Tout ce qui suit tombe **à l'intérieur des bornes** de E et cite A1, A2 ou DGI
sans rien constater :

1. **La fin de la légende de colonne**, coupée par la mise en page :
   `DGI (6) , 32c (7) )` — présente dans **9 volets sur 26**, dont **4 qui
   portent « Néant »**. Un lecteur qui cherche « DGI » dans la zone E annonce
   donc un Danger Grave et Immédiat sur quatre installations sans anomalie.
2. **Les notes de bas de tableau** `(4) A1 : …`, `(5) A2 : …`, `(6) DGI : …`,
   `(7) 32c : …` — une par type, chacune définissant son type en toutes lettres.
   Elles se reconnaissent à l'appel `(n)` en tête de ligne.
3. **Les lignes de continuation de ces notes**, qui n'ont plus l'appel `(n)` :
   *« fourniture du gaz, mais est suffisamment importante pour que la réparation
   soit réalisée dans les meilleurs délais. »* — c'est la suite de la note (5).
   Elles ne se filtrent pas par leur début : seule l'absence de code de contrôle
   les distingue.

## Rubrique A · « Installation alimentée en gaz » — le préalable

Endroit stable : rubrique `A. - Désignation du ou des bâtiments`, ligne
`Installation alimentée en gaz : …`. Présente dans les 26 volets.

Mesuré : **OUI dans 24, NON dans 2.**

Une installation non alimentée ne permet **aucun essai** : c'est le pendant gaz
du différentiel non déclenché de l'électricité. La portée de la conclusion en
dépend, et le rapport peut alors porter « Néant » en E sans que cela signifie
une installation saine. À signaler comme tel, jamais à confondre avec un
verdict favorable.

## Rubrique G · « Constatations diverses » — le gisement

Ni un fourre-tout ni un champ libre : elle porte des obligations de l'occupant
que rien d'autre du dossier ne dit — attestation de vacuité des conduits de
fumée, justificatif d'entretien de la chaudière, conduit de raccordement non
visitable, assemblage par ruban d'étanchéité. Présente dans les 26 volets.

## À vérifier avant de citer un chiffre du volet

Les annexes de sécurité contiennent des chiffres qui **ne décrivent pas le
logement** : *« 98 % des accidents, fuites et explosions sont recensés dans les
installations intérieures »* est une statistique nationale, imprimée dans tous
les rapports. Même piège que le seuil des 450 kWh du DPE.

## Ce qui reste à mesurer

- **Tout, hors LICIEL.** Aucun autre éditeur dans ce corpus.
- La rubrique D (identification des appareils) et la mesure de CO : non bornée.
- La contradiction F/G relevée au carnet (F « Néant » et G « certains points
  n'ont pu être contrôlés ») : vue sur un volet, non mesurée sur les 26.

---

## Lectures 4 à 12 — neuf volets LICIEL de plus, et la question du catalogue tranchée

*21/08/2026. Neuf volets LICIEL bornés par leur pagination interne, dont cinq
sans anomalie et quatre avec. Deux rapports du lot n'ont pas de volet élec.*

### La question du catalogue est tranchée : ce n'est PAS un catalogue

Le chapitre laissait ouverte une question : la cellule du domaine 2, avec ses
huit libellés dont deux seulement portaient une remarque, était-elle le
catalogue du domaine imprimé d'office ?

**Non.** Un volet lu ensuite ne porte qu'**une seule** ligne dans son domaine 5
et **une seule** dans son domaine 6, chacune avec sa remarque. Un catalogue
s'imprimerait là aussi. Il ne s'imprime pas.

**Donc les huit libellés du premier volet sont huit anomalies retenues** — une
installation gravement défaillante — et **six d'entre elles n'ont aucune
localisation**. C'est le cas que le §11 de l'ordre de mission anticipe : la
localisation n'est pas exhaustive, et son absence ne vaut pas absence
d'anomalie.

### ⚠️ Ce qui EST un catalogue, en revanche : la rubrique 5 elle-même

Trois volets sains, trois biens différents, trois années différentes. Le bloc
qui va de « Anomalies avérées selon les domaines suivants » à « Informations
complémentaires » est **identique au caractère près** dans les trois — même
empreinte après retrait des espaces.

C'est la preuve directe de ce que le chapitre avançait : **la rubrique 5 de
LICIEL ne porte aucune information.** Elle imprime les deux conclusions
opposées et les six domaines, toujours pareil. Seule la case graphique
distingue, et elle ne s'extrait pas.

### La règle qui en découle, et qui débloque le verdict LICIEL

**Le tableau `Domaines | Anomalies | Photo` est présent si et seulement s'il y a
des anomalies.** Mesuré sur neuf volets : les cinq sains n'en ont aucun, les
quatre autres en ont un.

| | Volets | Tableau d'anomalies | Ce que le rapport conclut |
|---|---|---|---|
| Sains | 5 | absent | aucune anomalie |
| Avec anomalies | 4 | présent | une ou des anomalies |

**Son absence vaut donc « aucune anomalie ».** C'est le seul signal lisible en
texte, et il tient sur neuf volets sans exception.

### ⚠️ La rubrique « Informations complémentaires », elle, est vraie — et lisible

Contrairement au §5, le bloc `IC. Socles de prise de courant…` est **rédigé par
rapport**, dans sa forme positive ou négative, sans case à cocher :

| | Volets sains | Volet défaillant |
|---|---|---|
| Différentiel 30 mA | « L'ensemble de l'installation électrique **est protégé** par au moins un dispositif différentiel à haute sensibilité ≤ 30 mA » | « **Il n'y a aucun** dispositif différentiel à haute sensibilité ≤ 30 mA » |
| Obturateurs | « L'ensemble des socles **est du type** à obturateur » | « **Au moins un** socle **n'est pas** de type à obturateur » + `Remarques :` avec localisation |
| Puits de 15 mm | « L'ensemble des socles **possède** un puits » | « **ne possède pas** un puits de 15 mm » + `Remarques :` |

C'est la même polarité que les `B11` d'AnalysImmo et de DPE WIN, chez un
**troisième** éditeur. La règle est donc acquise : **l'information
complémentaire porte un sens, elle n'est jamais une anomalie**, et sa forme
négative porte une localisation qu'il faut recueillir.

### Le test « zéro perte » du §37, mesuré sur dix volets

Outil : `scripts/elec-zeroperte.local.ts`. Il compte les lignes d'anomalie du
tableau et les compare à ce que le moteur restitue.

**Trois constats, tous des BLOCAGES au sens du §32 :**

1. **Le moteur ne restitue aucun repère d'anomalie** — zéro sur les dix volets,
   y compris ceux qui en portent treize. L'écran « toutes les anomalies » du
   §29 n'aurait rien à afficher.
2. **Le compte diverge.** Sur le volet le plus chargé, le moteur annonce
   « Points relevés = 4 » là où la seule cellule du domaine 2 en contient huit.
3. **Les localisations multiples sont collées en une seule chaîne** :
   `Où = 2ème étage - mezzaninne2ème étage - mezzaninne1er étage - Entrée /Cuisine/Séjour`.
   Le §32 nomme ce cas : « une anomalie mentionne plusieurs localisations et
   Verrière n'en garde qu'une sans avertissement → BLOCAGE ».

### ⚠️ Et le plus lourd : Verrière ne sait pas dire « installation saine »

Les cinq volets sans anomalie ressortent en gravité **`neutre`** — c'est-à-dire
« conclusion non lue » — et non `bon`.

La cause est exactement celle que le chapitre décrivait : les deux phrases
opposées de la rubrique 5 sont imprimées toutes les deux, la case est
graphique, donc la conclusion reste `inconnu`.

**Sur l'éditeur qui fait 80 % du corpus, Verrière est muette sur les
installations saines.** Le §6 de l'ordre exige pourtant que la vignette sache
afficher « Aucune anomalie identifiée ».

La règle du tableau absent, ci-dessus, est ce qui répare cela.

### Ce que ces neuf lectures ajoutent aux rubriques LICIEL

Le chapitre laissait la colonne LICIEL presque vide. Elle se remplit :

| Rubrique | LICIEL |
|---|---|
| Rappel des limites du champ | `4. –` |
| Conclusion / évaluation des risques | `5. –` — **boilerplate, sans information** |
| Tableau des anomalies | sous `5.`, présent seulement s'il y a des anomalies |
| Anomalies relatives aux installations particulières | ✅ sous le tableau (parties communes, piscine) |
| Informations complémentaires | ✅ table `IC.`, **rédigée par rapport** |
| Avertissement particulier | `6. –` |
| Points de contrôle n'ayant pu être vérifiés | ✅ table `Domaines / Points de contrôle`, `Néant -` si vide |
| Parties du bien n'ayant pu être visitées | ✅ sous `6.`, `Néant` si vide |
| Devoir de conseil | `7. –`, `Néant` si vide |
| Certification de l'opérateur | ✅ ligne `Nota :` sous `7.` |
| Dates de visite et d'établissement | ✅ `Visite effectuée le :` / `Etat rédigé à … le` |
| **Date de fin de validité** | ❌ **jamais écrite** — contrairement à AnalysImmo |
| Explicitations des risques (pavé) | ✅ `Informations complémentaires / Objectif des dispositions…` |

**La dernière ligne compte pour l'échéance** : AnalysImmo écrit sa date de fin
de validité, LICIEL ne l'écrit pas. La règle « lire avant de calculer », acquise
sur le CREP, ne peut donc pas être appliquée telle quelle : elle doit être
**par éditeur**, avec calcul en repli quand la date n'est pas écrite.

### Ce qui reste ouvert

- **Le pied de page de LICIEL est le repère de bornage**, mais l'en-tête du
  volet varie : `Etat de l'Installation Intérieure d'Electricité` avec des
  espaces insécables et des apostrophes typographiques différentes d'un rapport
  à l'autre. Le bornage doit tolérer ces variantes.
- **L'entrelacement des colonnes touche aussi LICIEL** : la cellule de domaine
  et la cellule d'anomalie se mélangent sur la même ligne reconstruite. Comme
  chez AnalysImmo, la lecture par lignes ne suffit pas.
- 45 volets élec du registre restent à lire.

## ⚠️ Correction du 21/08 — le motif de code était incomplet

La règle ci-dessus ne connaissait que la famille `C.<n> - <n><lettre>`. Le
corpus porte une **seconde famille**, liée aux mesures de monoxyde :

```
D.3 - S1        ← un code de point de contrôle, en zone E
S1 : la teneur en CO est trop importante, l'appareil ne fonctionne pas dans…
D.3 Appareils raccordés   S1) Taux de CO > 20 ppm
                          S2) Taux de CO > 20 ppm
                          S3) Taux de CO > 20 ppm
```

Mesuré : **un seul volet sur 26 porte un code S** (S1, S2 et S3 apparaissent en
tout 6 fois), et ce volet porte *aussi* un code C. **Aucun verdict ne change
donc sur ce corpus** — mais la règle ne tenait que par chance.

**Un rapport dont l'unique anomalie serait un dépassement de CO ne porterait
qu'un code S, et l'ancienne règle l'aurait classé « aucune anomalie » alors
qu'il porte un DGI.** Le motif à retenir couvre les deux familles :
`<LETTRE>.<n> - <n><suffixe>` **ou** `<LETTRE>.<n> - S<n>`.

---

# GAZ — Rubrique D · les appareils, leur localisation et le CO

**Bornes** — présentes dans les 26 volets sur 26 :
ouverture `D. - Identification des appareils`, fermeture `E. - Anomalies
identifiées`.

## Trois états, jamais deux

| État | Forme | Volets |
|---|---|---|
| Aucun appareil | `Néant - - - -` | 1 |
| Appareils identifiés | lignes de tableau | 25 |

Mesuré : **33 appareils sur 26 volets**, de 0 à 2 par volet.

Le volet sans appareil porte pourtant **deux anomalies** en rubrique E : elles
visent l'organe de coupure, pas un appareil. *Anomalie sans appareil n'est pas
une contradiction* — le moteur de contradictions ne doit pas la traiter comme
telle.

## ⚠️ L'ordre des lignes ne dit PAS le rattachement

La mise en page éclate chaque ligne du tableau, et les observations
s'intercalent **avant** l'appareil qu'elles décrivent. Relevé tel quel :

```
Mesure CO : Non réalisée          ← l'observation vient d'abord
Chaudière SAUNIER DUVAL           ← l'appareil ensuite
Modèle: THEMIS 23 E   Raccordé   23 kW   Rez de chaussée - Garage
```

**8 volets sur 26 portent plusieurs appareils ET au moins une mesure de CO.**
Dans ces huit cas, rattacher la mesure à l'appareil par l'ordre des lignes est
un pari. L'interdit du §15 de l'ordre de mission — *ne jamais rattacher une
mesure au mauvais appareil* — impose donc de **rattacher par la position
géométrique** (colonnes X/Y de `lignesPositionnees`), jamais par le flux de
texte.

## La mesure de CO a trois états, et le rapport les distingue

| Forme | Sens | Occurrences |
|---|---|---|
| `Mesure CO : 0 ppm`, `Mesure CO : >30 ppm` | mesure faite | 10 |
| `Mesure CO : Non réalisée` | test non réalisé | 12 |
| *aucune ligne CO* | information absente | 4 volets |

C'est exactement les trois états que le §29 interdit de fusionner :
`CONTRÔLÉ + ABSENCE D'ANOMALIE` ≠ `NON CONTRÔLÉ` ≠ `INFORMATION ABSENTE`.

⚠️ **`>30 ppm` est un seuil, pas une valeur.** Le format se conserve mot pour
mot : ni arrondi, ni converti, ni transformé en nombre.

## Le DGI peut être écrit en rubrique D, pas seulement en E

Relevé dans la colonne d'observations d'un appareil :

```
Résultat anomalie : DGI (S1) Appareil mis en Danger Grave et Imédiat,
le test de débit n'a donc pas pu être réalisé.
```

Deux conséquences. D'abord, **lire le DGI dans la seule rubrique E ne suffit
pas** : D et E doivent être croisés. Ensuite, la ligne dit à la fois l'anomalie
*et* le test qu'elle a empêché — un DGI peut rendre un autre contrôle
impossible, et les deux informations doivent survivre.

## Ce que la rubrique D porte encore, et qu'on garde

- **Localisation double** : en clair (`RDC - Cuisine`, `Rez de chaussée -
  Cellier`) **et** par renvoi au croquis annexe (`Localisation sur croquis :
  001`). Les deux se conservent : le second permet de pointer sur le plan.
- **Renvoi photo** : `Photo : PhGaz002` — traçabilité vers l'annexe
  photographique.
- **Motif d'impossibilité, au niveau de l'appareil** : *« Partiellement
  contrôlé car : Appareils d'utilisation présents ne pouvant être mis en marche
  pour les tests de débit et la mesure de CO »*. Il ne figure pas qu'en
  rubrique F : un appareil peut être partiellement contrôlé sans que la pièce
  soit inaccessible.
- **Entretien appareil / Entretien conduit** : `Oui`, `Non`, `Sans objet` —
  trois états là encore, et `Sans objet` n'est pas `Non`.
- **Fonctionnement** : `Incorrect` relevé sur l'appareil en DGI.
- **Un « appareil » peut ne pas en être un** : `Robinet en attente` figure dans
  la liste des installations intérieures. La liste est ouverte (§7) : on le
  conserve tel quel.

---

# GAZ — Rubriques F et G · le non-contrôlé et les constatations

**Bornes** — présentes dans les 26 volets sur 26 :

| Rubrique | Ouverture | Fermeture |
|---|---|---|
| F | `F. – Identification des bâtiments et parties du bâtiment…` | `G. - Constatations diverses` |
| G | `G. - Constatations diverses` | la conclusion (`H. - Conclusion` **ou** `Conclusion :` sans lettre) |

⚠️ Le tiret de `F.` est un **demi-cadratin** (`–`), celui de `G.` un trait
d'union (`-`). Un motif qui code le tiret en dur rate F dans 26 volets sur 26 —
c'est arrivé pendant cette mesure.

## ⚠️ La rubrique F contient DEUX questions, et une seule réponse visible

Son titre en pose deux :

> *« Identification des bâtiments et parties du bâtiment (pièces et volumes)
> **n'ayant pu être contrôlés** et motifs, **et** identification des **points de
> contrôles n'ayant pas pu être réalisés** »*

Le corps répond dans deux blocs distincts :

1. **Les pièces et volumes** — soit `Néant`, soit une liste avec motif entre
   parenthèses : *« 1er étage - Combles (Inaccessible en raison de
   l'encombrement) »*, *« combles dépendance (Absence de trappe de visite) »*.
   Mesuré : `Néant` dans 18 volets, une liste dans 8.
2. **Les points de contrôle non réalisés** — un second tableau, introduit par
   `Liste des points de contrôles n'ayant pas pu être réalisés :`, à colonnes
   *Point de contrôle · Points désignés · Appareil · Type · Observations*.

**Le piège, mesuré sur 1 volet sur 26 :** le premier bloc écrit `Néant` et le
second liste malgré tout six points non réalisés sur une chaudière — dont les
trois seuils de monoxyde `S1) S2) S3) Taux de CO > 20 ppm`, plus le débordement
de flamme à l'allumage et deux dépassements de débit.

Lire `Néant` en F et conclure « tout a été contrôlé » est donc faux. **Il faut
lire les deux blocs**, et le second n'existe que quand il a quelque chose à
dire : son absence n'est pas une réponse.

C'est aussi là que se trouve la matrice de tests réclamée par le § 27 de
l'ordre de mission : elle n'est pas à construire, elle est **déjà dans le
rapport**, sous ce titre.

## Rubrique G · constatations diverses

Présente 26/26. Elle porte, en petits caractères et sans mise en avant, des
éléments que rien d'autre du dossier ne dit :

- attestation de vacuité des conduits de fumées non présentée ;
- justificatif d'entretien de la chaudière non présenté ;
- conduit de raccordement non visitable ;
- assemblage par raccord mécanique au moyen d'un ruban d'étanchéité ;
- puis deux sous-blocs constants : *Documents remis par le donneur d'ordre* et
  *Observations complémentaires*, chacun pouvant porter `Néant`.

L'entretien annuel et le ramonage sont des obligations de l'occupant : leur
absence pèse en cas de sinistre. Le § 31 de l'ordre de mission a raison de
refuser que cette rubrique soit traitée comme une annexe.

## Ce que F impose au moteur de contradictions

Le § 33 demande un blocage quand *« un appareil non contrôlé sort sans
anomalie »*. La forme exacte à croiser est celle-ci : un appareil nommé dans le
second tableau de F (points non réalisés) **ne peut pas** ressortir en
« contrôlé, aucune anomalie ». Et le motif d'impossibilité peut être écrit à
deux endroits — en rubrique D sur la ligne de l'appareil, ou dans ce tableau de
F. Les deux se lisent.

---

# GAZ — BC2E, et ce que le second éditeur démolit

*Mesuré le 21/08/2026 sur le fonds Dropbox (18 622 PDF) : **6 volets gaz BC2E
distincts**, lus en entier. Norme NF P 45-500 du 12 janvier 2013 (LICIEL cite
l'édition de juillet 2022).*

Le référentiel prévenait qu'un repère mesuré chez un seul éditeur est
l'habitude d'un logiciel. Six rapports ont suffi à le vérifier : **trois des
repères tirés des 26 volets LICIEL ne survivent pas.**

## Ce qui tombe

### 1. « La conclusion ne se lit pas » — faux chez BC2E

Chez BC2E, la conclusion est écrite **en clair, sur une ligne, en tête du
volet**, juste après le bloc mission :

```
CONCLUSIONS
L'installation comporte une ou des anomalie(s) : A1
```

Mesuré : présente et lisible dans **6 volets sur 6**. L'impossibilité de lire la
conclusion est donc une habitude LICIEL, pas une propriété du diagnostic gaz.

### 2. Les lettres de rubrique ne désignent pas les mêmes rubriques

| Lettre | LICIEL | BC2E |
|---|---|---|
| A | Désignation des bâtiments | Propriétaire **et** Mission (deux blocs « A. ») |
| B | Propriétaire | Titulaire du contrat de fourniture |
| C | Opérateur | Opérateur |
| D | Appareils | Appareils |
| E | Anomalies | Anomalies |
| F | Non contrôlés **+ points non réalisés** | Bâtiments non contrôlés seuls |
| G | Constatations diverses | Constatations diverses **+ les 5 phrases** |
| H | Conclusion *(ou actions DGI)* | Actions en cas de DGI |
| I | Actions DGI | Actions en cas de 32c |
| J | Actions 32c | Observations diverses |
| K | — | **Points de contrôle non vérifiés** |

**Borner par la lettre est faux dès qu'on change d'éditeur.** Seul l'intitulé
délimite.

### 3. Le motif de code de point de contrôle ne marche pas

BC2E écrit le code **nu** : `8a1`, `8b`, `10`, `6a`, `6b1`, `6b2`.
LICIEL écrit le même code **préfixé du chapitre** : `C.7 - 8a1`.

C'est la même norme et le même point de contrôle : `8a1` est « au moins un
robinet de commande d'appareil est absent » chez les deux. **Le préfixe `C.<n>`
est une habitude LICIEL.** Un motif qui l'exige rate 100 % des anomalies BC2E.

## Ce qui tient — et devient une règle du métier

### Les cinq phrases imprimées existent chez les deux

BC2E imprime lui aussi les cinq réponses possibles, mot pour mot, dans **6
volets sur 6** — mais **en rubrique G**, à la suite des constatations diverses,
et non dans une rubrique de conclusion. Le formulaire à cocher est donc dans le
modèle réglementaire, pas dans le logiciel ; seul son emplacement change.

**Conséquence : la phrase « L'installation ne comporte aucune anomalie » est
présente dans 32 volets sur 32, tous éditeurs confondus.** Elle ne constate
jamais rien, nulle part.

### La matrice des tests non réalisés existe chez les deux

- LICIEL : second bloc de la rubrique F, `Liste des points de contrôles n'ayant
  pas pu être réalisés`.
- BC2E : rubrique K, `POINT(S) DE CONTRÔLE(S) NON VÉRIFIÉ(S)`, colonnes
  *Appareil / Installation · Point de contrôle · Motif*. Présente 6/6.

Le § 27 de l'ordre de mission est donc satisfait par la source chez les deux
éditeurs. Relevé chez BC2E : *« Absence de gaz : impossibilité de réaliser
l'étanchéité de l'installation gaz »*, et *« Appareil en service mais absence
d'une personne compétente désignée par le donneur d'ordre pour arrêter et
mettre en marche un appareil »*.

## Ce que BC2E fait mieux, et qu'il faut exploiter

- **Le rattachement anomalie → appareil est explicite** : le tableau E porte une
  colonne `APPAREIL` (`Appareil Etanche | 8a1 | A1 | au moins un robinet…`).
  Chez LICIEL il fallait le déduire de la géométrie des colonnes.
- **Un verdict par appareil**, en rubrique D : *« L'appareil ne comporte aucune
  anomalie. »* / *« L'appareil comporte une ou des anomalie(s) : A1 »*.
- **La cohérence interne se vérifie** : sur un volet où l'installation n'est pas
  alimentée, les quatre points non vérifiés portent tous le motif « Absence de
  gaz ». Le rapport se tient tout seul — et c'est exactement le § 5 de l'ordre
  de mission, écrit par le diagnostiqueur.

## ⚠️ Un faux positif du repérage, à corriger

Chercher le titre du volet page par page attrape aussi des **attestations
d'assurance** : leur liste de prestations contient « état de l'installation
intérieure de gaz ». Un fichier de 2 pages nommé `assrance…` est ainsi remonté
comme volet gaz. C'est le même faux ami que pour l'électricité — l'attestation
de certification et la liste de prestations citent tous les diagnostics sans en
contenir aucun.

**Le repérage doit exiger, en plus du titre, une rubrique du volet** (par
exemple `ANOMALIES IDENTIFIÉES` ou `IDENTIFICATION DES APPAREILS`).

## Les codes de points de contrôle — trois formes, pas une

Lecture intégrale des volets BC2E 1 et 2, croisée avec le tableau F du volet
LICIEL 15. La norme NF P 45-500 numérote ses points de **trois façons**, et
elles cohabitent dans un même rapport :

| Forme | Exemples relevés | Où |
|---|---|---|
| Numérique | `6a` `6b1` `6b2` `8a1` `8b` `10` `14` `19.1` `29c3` | les deux éditeurs |
| **Lettre seule** | `J` `K` `L` | BC2E (tableau E) et LICIEL (tableau F) |
| S + chiffre | `S1` `S2` `S3` — les seuils de CO | les deux |

Relevé mot pour mot chez BC2E :

```
Chaudière VMC Gaz   K   A1   le débit de gaz d'au moins un appareil raccordé est
                             trop important : l'appareil ne fonctionne pas dans des
                             conditions de sécurité satisfaisantes…
```

**Un motif qui exige un chiffre rate les points en lettre seule.** Et LICIEL les
préfixe comme les autres (`C.7 - 8a1`), BC2E jamais.

## ⚠️ Chez BC2E, `K` est à la fois un code et une rubrique

Le même document porte :

- `K` comme **point de contrôle**, dans la colonne du tableau E ;
- `K. POINT(S) DE CONTRÔLE(S) NON VÉRIFIÉ(S) :` comme **rubrique**.

Chercher « K » sans borner confond les deux. La rubrique se reconnaît au point
et au libellé qui suit ; le code est seul dans sa colonne.

## Rubrique J · les observations sont rattachées à l'appareil

BC2E écrit l'observation **deux fois**, et nomme l'appareil dans les deux :

```
D. …  Observation : Perte de pression dans le reseau eau
J. OBSERVATIONS DIVERSES :
Chaudière VMC Gaz : Perte de pression dans le reseau eau
```

Le rattachement n'est donc pas à deviner chez BC2E — il est écrit. C'est
l'inverse de LICIEL, où il faut le tirer de la géométrie des colonnes.

## Les rubriques de BC2E ont toutes deux états

`K. POINT(S) DE CONTRÔLE(S) NON VÉRIFIÉ(S)` porte quatre lignes dans un volet,
`néant` dans un autre. Idem pour `J`, et pour le bloc *Bâtiments ou parties du
bâtiment n'ayant pu être visités*. **`néant` est une réponse ; l'absence de la
rubrique n'en est pas une** — et les deux ne s'écrivent pas pareil.

## Une recommandation peut vivre hors de toute anomalie

Relevé sous le tableau D, sans code ni niveau :

> *« Faire contrôler la vacuité du conduit de fumée par une entreprise
> qualifiée de fumisterie. »*

Ce n'est ni une anomalie, ni une constatation diverse, ni une observation
d'appareil : c'est une recommandation libre, posée entre deux rubriques. Le
§ 44 — le test de la petite ligne — existe précisément pour celle-là.

## ⚠️ Deux versions d'un même volet ne portent pas les mêmes informations

Le corpus BC2E contient deux paires de rapports portant le même numéro de
mission à un chiffre près (`…017` / `…0171`, `…020` / `…0201`). Ce sont des
rééditions du même diagnostic. Comparées ligne à ligne, elles diffèrent — et
pas seulement sur la mise en page :

| | Première version | Réédition |
|---|---|---|
| Champ réglementaire | cite en plus le **décret n° 2016-1104** (logements en location) | ne le cite plus |
| Titulaire du contrat | *« Informations non communiquées »* | nom, adresse, qualité renseignés |
| Cadastre, nombre de pièces | vides | `AM 329/1`, `6` |
| Validité de l'assurance | 31/12/2020 | 31/12/2021 |
| Constatations diverses | porte des `NC (Non Concerné)` | ne les porte plus |
| **Points de contrôle non vérifiés** | — | **une ligne de plus** (`Installation 6b2`) |

**La réédition n'est pas une copie propre : elle ajoute et elle retire.** Sur
l'un des deux dossiers, elle ajoute un point de contrôle non vérifié que la
première version ne mentionnait pas.

Deux conséquences directes :

1. **Le comptage de complétude du § 34 doit se faire par document**, jamais sur
   un dossier qui contient deux versions : les nombres d'anomalies, de points
   non vérifiés et de constatations peuvent différer légitimement.
2. **Choisir silencieusement une version est une faute.** Si un dossier en
   contient deux, on le signale et on dit laquelle est lue — la plus récente
   n'étant pas toujours la plus complète.

⚠️ Cela jette un doute sur une décision prise plus tôt : dans le corpus LICIEL,
les fichiers `…_en_attente.pdf` ont été écartés comme doublons, sur leur seul
nom. Ils portaient 2 à 3 lignes d'écart avec leur homologue — **un écart du même
ordre que celui mesuré ici**. Ils doivent être relus et comparés, pas écartés.

---

# GAZ — PreventImmo, le troisième format, et la coche enfin lisible

*Un volet lu en entier le 22/08/2026, repéré sur le fonds Dropbox. **Un seul** :
rien de ce qui suit n'est une règle, tout est à confirmer.*

## ⚠️ La case cochée est un « X » DANS LE TEXTE

C'est la première fois. Relevé mot pour mot :

```
X L'installation ne comporte aucune anomalie.
L'installation comporte des anomalies de type A1 qui devront être réparées ultérieurement.
L'installation comporte des anomalies de type A2 qui devront être réparées dans les meilleurs délais.
L'installation comporte des anomalies de type DGI qui devront être réparées avant remise en service.
```

Les cinq phrases sont imprimées comme chez les deux autres éditeurs — mais la
réponse est marquée par un **X en tête de ligne**, et ce X sort à l'extraction.

**Mesuré : 0 marque de coche lisible dans les 26 volets LICIEL et les 6 volets
BC2E.** Chez eux la coche est un glyphe graphique, absent du texte. Chez
PreventImmo, elle se lit.

Conséquence : la règle « la conclusion ne se lit jamais dans la liste des cinq
phrases » est vraie chez LICIEL, vraie chez BC2E, **fausse ici**. C'est le
troisième format qui le montre, exactement comme le référentiel le prévoyait.

## Un plan sans lettres de rubrique

Ni `A.`, ni `B.`, ni `E.` : les rubriques sont des intitulés en texte suivi.

| | Intitulé |
|---|---|
| Cadre de la mission | `Mission` |
| Appareils | `Identification des appareils` |
| Anomalies | `Anomalies identifiées` |
| Pièces non visitées | `Locaux non visités` |
| Constatations | `Constatations diverses` |
| Actions | `Action de l'opérateur de diagnostic en cas de DGI` / `…en cas d'anomalie 32c` |

Aucun lecteur bornant sur une lettre ne peut lire ce format. Aucune rubrique de
points de contrôle non vérifiés non plus — ni le second bloc de F de LICIEL, ni
la rubrique K de BC2E.

## Trois autres écarts relevés

1. **L'alimentation est une phrase, pas un champ** : *« L'installation est
   alimentée. »* — là où LICIEL écrit `Installation alimentée en gaz : OUI` et
   BC2E pose un `OUI` sur sa propre ligne.
2. **Le tableau des anomalies est VIDE**, sans `Néant` : après l'en-tête, il n'y
   a que le lexique. C'est un troisième cas — ni ligne de constat, ni mention
   d'absence. Un lecteur qui exige `Néant` pour conclure « aucune anomalie »
   reste muet ici, alors que le X de la conclusion, lui, répond.
3. **Le verdict est écrit par appareil**, dans la colonne d'observations :
   *« Aucune anomalie. »* sur chacun des deux appareils.

## Ce que le découpage a raté

Le volet fait **3 pages** — le rapport le dit lui-même, `page 1 sur 3`. Le
découpeur n'en a borné qu'une : la conclusion, les constatations diverses et les
actions de l'opérateur tombaient hors de la plage, et une lecture qui s'y serait
fiée aurait perdu le verdict.

À retenir : **quand un rapport pagine lui-même son volet (`page n sur N`), cette
mention borne mieux que le découpage automatique.**

## Statut

**Un volet. Aucun lecteur PreventImmo n'est écrit**, et il ne le sera pas sur
cette base : une signature mesurée sur un seul document ne distingue pas un
format d'un accident de mise en page. Le repérage continue sur le fonds ; le
lecteur s'écrira quand il y aura de quoi le mesurer.

En attendant, l'aiguilleur fait ce qu'il doit : il rend `format inconnu`, et le
repérage a marqué ce fichier « éditeur non couvert, à lire ».

---

# GAZ — un quatrième format, et un bug qu'il a révélé

*Lecture du 22/08/2026 : 22 volets d'éditeur non nommé, extraits du fonds
Dropbox et lus un par un.*

## Ce que portent ces 22 volets

| Format | Volets | Reconnaissable à |
|---|---|---|
| LICIEL | 5 | `E. - Anomalies identifiées` — le format est lisible, c'est le **nom** de l'éditeur qui manque |
| **Format 4** | **6** | `Conclusion` sans lettre, titre en capitales espacées |
| Ni l'un ni l'autre | 11 | dont des courriers et attestations — voir plus bas |

## Le format 4 — la mise en page coupe les mots

Relevé mot pour mot :

```
E TAT DE L ’ INSTALLATION INTERIE URE DE GAZ
S ELON L ’ ARRETE DU 18 NOVEMBRE 2013 PORTANT RECONNAISSAN CE DE LA NORME NF P45 - 500
…devront être réparées ul térieurement.
Durée de validité du rapport : 3 ans , (la date de référence est la da te de la visite)
```

Le titre, les intitulés et jusqu'aux mots courants sont **coupés par des
espaces** — `INTERIE URE`, `ul térieurement`, `da te`, `RECONNAISSAN CE`.

**Aucun motif littéral ne tient là-dessus.** Un lecteur de ce format devra
normaliser les espaces avant de chercher quoi que ce soit — c'est probablement
aussi pourquoi l'identification d'éditeur échoue sur ces six volets.

Autres traits mesurés : la conclusion est en **première page** avec les cinq
phrases imprimées et aucune coche lisible ; les rubriques n'ont pas de lettres
(`Propriétaire`, `Adresse des locaux visités`, `Conclusion`, `Annexes
réglementaires`) ; le rapport porte un numéro de dossier de la forme
`BX33-19-03-LR-1695`.

## ⚠️ Le bug que ce corpus a révélé dans le lecteur LICIEL

Un des volets est au format LICIEL, mais c'est une **annexe** : elle imprime les
deux réponses possibles côte à côte, et coche d'un dessin.

```
Type de bâtiment : Appartement  Maison individuelle
Nature du gaz distribué : GN  GPL  Air propané ou butané
Installation alimentée en gaz : OUI  NON
```

Le lecteur testait `NON` avant `OUI` : il rendait donc **« installation non
alimentée »**. Or une installation non alimentée ne permet aucun essai — cette
seule valeur change la portée de tout le volet, et la rendre à tort est une
faute grave.

Corrigé : quand les deux réponses sont sur la ligne, le lecteur rend `null`.
L'information n'est pas dans le texte, on ne la devine pas. Un test la garde.

## Le repérage attrape encore des documents qui ne sont pas des diagnostics

Sur les 11 volets inclassés, au moins deux ne sont pas des rapports :

- une **attestation d'assurance** AXA, dans un dossier de 240 pages, dont la
  liste des activités garanties cite « État de l'installation intérieure de
  gaz » ;
- un **courrier d'organisme de certification** (surveillance documentaire), de
  2 pages, à l'encodage cassé.

⚠️ Le premier révèle une limite du repérage : dans un document composite, il
retient la **première** occurrence du titre. Ici, elle tombe page 27, dans
l'attestation — le vrai volet est ailleurs dans les 240 pages, et n'a pas été
lu. **Le repérage doit chercher toutes les occurrences, pas la première.**

## Mesure des lecteurs après cette lecture

Sur 55 volets soumis (26 LICIEL, 24 BC2E, 5 inconnus) :

| | |
|---|---|
| lus par un lecteur | 50 |
| format inconnu, déclaré comme tel | 5 |
| **documents reconnus par deux signatures** | **0** |
| conclusions lues | 24 — les BC2E, aucune LICIEL |
| points de contrôle non vérifiés remontés | 82 |
| appareils | 79 |

## L'échantillon témoin — ou comment un lecteur à 100 % en fait 77

Le lecteur d'unités CREP atteignait **0 écart et 100 % des unités** sur
l'échantillon figé de 150 dossiers. Le chiffre était vrai, et il ne prouvait
rien : chaque correction avait été faite **après** avoir lu ce corpus-là. Un
lecteur calé de cette façon peut n'avoir appris qu'un corpus, élément par
élément, sans rien comprendre de la forme.

Un second échantillon a donc été tiré, **figé lui aussi et disjoint par
construction**, sur lequel on ne corrige jamais. Il n'existe que pour mesurer.

| | figé (a servi à corriger) | témoin (jamais lu pour corriger) |
|---|---|---|
| volets plomb | 39 | 39 |
| concordance § 41 | 90 % | **77 %** |
| écarts | 0 | **6** |
| unités récupérées | 2 513 / 2 513 | 3 550 / 3 567 |
| état renseigné sur les unités au-dessus du seuil | 98 % | **79 %** |

**Treize points de concordance étaient du surapprentissage.** Sans le témoin,
ils auraient été annoncés comme un résultat.

### Ce que le témoin a montré et que le figé ne pouvait pas montrer

Cinq volets perdent des unités, un en fabrique deux de trop, et le plus gros
écart du lot atteint **11 unités sur 83**. Aucun de ces cas n'existait dans le
figé : ce sont des formes de tableau que le lecteur n'avait jamais rencontrées.

Une piste est ouverte, et elle n'est **pas encore établie** : l'extraction
collerait parfois deux unités sur une même ligne, et le lecteur n'en cherche
qu'une par ligne. La sonde en compte 35 — mais elle compte des *mots*, et
« Porte du placard » en contient deux pour une seule unité. Tant que ces lignes
n'ont pas été lues une par une, le chiffre est un signal, pas un défaut.

> ⚠️ Ce chiffre n'est pas comparable au 0 relevé sur le figé : les deux passes
> n'utilisaient pas la même liste d'éléments. La sonde recopiait la liste du
> lecteur au lieu de la lui demander, et sa copie avait vieilli. Elle la lui
> demande désormais — deux mesures faites avec deux règles différentes ne se
> comparent pas.

### La règle qui en sort

> Un échantillon sur lequel on corrige ne mesure plus rien. Il en faut un second,
> figé, disjoint, jamais lu pour corriger — et quand il révèle un défaut absent du
> premier, on **agrandit le lot d'apprentissage**, on ne corrige pas sur le témoin.

C'est pour ça que le mode `etendre` conserve les dossiers déjà figés et n'ajoute
que des dossiers pris hors du témoin : la non-régression tient, et le témoin
reste intact.

### Hypothèse réfutée : « deux unités collées sur une ligne »

Une sonde comptait 88 lignes portant plus d'un nom d'élément dans le tableau des
mesures, et j'y voyais la cause des unités perdues. **Elle ne l'est pas.** Les
43 formes distinctes, lues une par une, se répartissent en deux familles et
aucune ne porte deux unités :

- des phrases du **rappel réglementaire** — « balcons, rebords extérieurs de
  fenêtres », « nettoyer le sol, les rebords des fenêtres » — qui contiennent
  deux noms d'éléments et zéro unité de diagnostic ;
- des **noms composés désignant une seule unité** : *Porte placard*, *Porte
  fenêtre*, *Solives plafond*, *Faux plafond*, *Sol plastique*, *Dalle de sol*,
  *Plafond charpente*.

Compter des mots n'est pas constater un défaut. La sonde mesurait sa propre
définition, pas le rapport.

### Le vrai défaut : un élément de page devenu nom de local

Sur un volet de 407 unités, **deux locaux entiers rendaient zéro unité** et un
troisième n'avait pas de nom. La cause tient en une ligne : le rapport porte un
filigrane, imprimé **une fois par page**, qui s'intercale entre le titre d'un
local et son récapitulatif. La fonction qui nomme les locaux remonte de trois
lignes au-dessus du récapitulatif et retient la première ligne « plausible » —
elle a retenu le filigrane.

Le filigrane est alors devenu un nom de local. Et comme **le titre d'un local
ferme le tableau du local précédent**, ce faux titre refermait le tableau à
chaque page où il apparaissait. Les unités situées après lui n'étaient plus
dans aucun tableau.

Le repère qui les sépare est mesurable, pas supposé :

| | occurrences dans le volet |
|---|---|
| un vrai titre de local | **1** |
| le filigrane | **25** (une par page) |
| l'en-tête de colonnes | 52 |

Un nom de local ne se répète pas ; un élément de page se répète autant qu'il y a
de pages.

### Ce que la forme a corrigé, et ce que le témoin en dit

Deux corrections de fond ont suivi, et une seule chose permet de dire qu'elles
valent : **le témoin monte aussi.**

| | départ | + filigrane | + forme | + signature |
|---|---|---|---|---|
| apprentissage (117 volets) | 79 % | 81 % | 88 % | **89 %** |
| témoin (39 volets, jamais corrigés) | 77 % | 77 % | 82 % | **87 %** |
| volets où le lecteur FABRIQUE des unités | 1 / 2 | 1 / 2 | 1 / 2 | **0 / 0** |

**1. Une unité se reconnaît à sa place, pas à son nom.** Le lecteur n'acceptait
une ligne que si le nom de l'élément figurait dans une liste. Chaque volet neuf
apportait son mot manquant — *Boiseries*, *Structure*, *Cimaise* — et chaque
ajout ne réparait que le rapport qui l'avait révélé. Or la position, elle, ne
change pas :

```
A Cimaise Bois Peinture Non Dégradé 1
^ zone     ^ substrat            ^ classement
```

Ce qui se tient entre la zone et le substrat **est** le libellé, quel qu'il
soit. Trois garde-fous l'encadrent : un substrat doit suivre, le libellé ne peut
pas commencer par un chiffre (ce serait une ligne de mesure de la colonne de
gauche) ni dépasser 48 caractères (ce serait une phrase). Le témoin a gagné
5 points d'un coup — ce qu'aucun mot ajouté n'avait jamais fait.

**2. La signature ne signait rien.** Le format se reconnaissait au motif
`Unité de diagnostic.*Substrat`. Ce `.*` accepte n'importe quelle prose, et le
CREP en contient une :

> NOTE Une unité de diagnostic (UD) est un ou plusieurs éléments de
> construction ayant même substrat et même revêtement.

Cette note figure dans **tout** CREP, quel que soit le logiciel. Le lecteur
répondait donc « c'est mon format » sur les rapports de n'importe quel éditeur —
et un lecteur choisi sur une signature pareille n'est pas choisi. Elle ouvrait
en outre le tableau 46 lignes trop tôt, ce qui y faisait entrer le tableau de
synthèse du § 5 : la ligne « Sous-Sol - Escalier 3 » devenait une unité de
diagnostic de classe 3 qui n'existe pas.

Les intitulés de colonnes se **suivent** ; une phrase les sépare. Le motif
l'exige désormais, et plus aucun volet ne fabrique d'unité.

### Un CREP sur douze restait muet pour une coupure de ligne

Dix volets sur 117 étaient comptés « tableau illisible » — le plus gros bloc
d'échecs, devant tous les écarts réunis. Ils ne l'étaient pas : le lecteur
d'unités les lisait **tous**, signature reconnue, locaux nommés, 691 unités
reconstituées. C'est l'analyse en amont qui ne trouvait pas les six chiffres du
tableau de synthèse, et sans eux le produit n'affichait aucun schéma.

L'en-tête est pourtant entier. Ce sont les chiffres que l'extraction disperse :

```
Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3
Nombre d'unités
6 21 0 0 2        <- les non mesurées, puis les quatre classes
29                <- le total, rejeté seul sur sa ligne
de diagnostic
```

La colonne « Total » passe derrière les autres et le libellé se coupe en deux.
La lecture exigeait six nombres sur une seule ligne : elle en trouvait cinq,
puis un.

**Les deux sources concordent, et c'est ce qui permet de conclure.** Sur neuf de
ces dix volets, le total lu dans le tableau de synthèse tombe exactement sur le
nombre d'unités que le lecteur reconstitue par ailleurs — 29, 54, 27, 79, 32,
29, 58, 54, 227. Le § 41 est vérifié sans avoir été supposé.

Le dixième annonce **106 quand le lecteur en capte 102**. C'est un écart réel,
qu'aucune correction ne fabrique : il était masqué tant que le tableau n'était
pas lu du tout.

> ⚠️ La règle de lecture reste la somme. Si les cinq effectifs ne retombent pas
> exactement sur le total, on ne rend rien — un effectif approché serait un
> chiffre inventé, et un test l'interdit explicitement.

### Le compte y est : 117 volets sur 117

| | départ | + filigrane | + forme | + signature | + synthèse | + libellé éclaté |
|---|---|---|---|---|---|---|
| **apprentissage** (117 volets) | 79 % | 81 % | 88 % | 89 % | 97 % | **100 %** |
| **témoin** (39 volets, jamais corrigés) | 77 % | 77 % | 82 % | 87 % | 92 % | **92 %** |
| unités récupérées, apprentissage | | | | | | **9 602 / 9 602** |
| volets fabriquant des unités | 1 et 2 | | | 0 et 0 | 0 et 0 | **0 et 0** |
| tableaux illisibles | 10 et 3 | | | 10 et 3 | **0 et 0** | 0 et 0 |

**Aucune unité perdue, aucune unité inventée**, sur les 9 602 que les 117 volets
annoncent. C'est ce que le § 41 demande, et c'est vérifié volet par volet.

### La dernière disposition, et le piège qu'elle tendait

L'extraction rejette parfois le nom de l'unité sur ses DEUX lignes voisines et
ne laisse sur la sienne que sa zone, son substrat, son revêtement et sa classe :

```
16 Huisserie Fenêtre partie basse (< 1 m) 0,27   <- début du nom
A Bois Peinture 0                                 <- l'unité, sans aucun nom
17 intérieure (F1) partie haute (> 1 m) 0,31      <- fin du nom
```

L'unité s'appelle « Huisserie Fenêtre intérieure (F1) ». Chaque morceau est
écrit dans le rapport, on les remet bout à bout.

> ⚠️ **« Huisserie » SEULE est une localisation de mesure**, pas une unité — elle
> avait été retirée de la liste des éléments pour cette raison précise. Ce qui
> sépare les deux n'est pas le mot, c'est la forme : une unité réunit zone,
> substrat, revêtement et classement ; une localisation n'en porte aucun. La
> porte est étroite à dessein — sur 117 volets, elle capte quatre lignes.

Un second défaut est apparu en vérifiant le résultat plutôt qu'en le supposant :
une seule mesure sur deux était rattachée. La ligne `16 Huisserie Fenêtre…`
contient le mot « Fenêtre », le lecteur la prenait pour une unité voisine et
l'excluait du bloc — perdant sa mesure. **Une ligne qui ouvre sur un numéro
appartient à la colonne de gauche, quel que soit son vocabulaire.**

### Ce qui reste, et où le chercher

Le témoin tient à **92 %** : trois volets y perdent encore des unités, dans des
formes que le lot d'apprentissage ne contient pas. Huit points séparent les deux
échantillons, et c'est la mesure de ce qui reste appris par cœur.

**On ne corrige pas sur le témoin.** La suite est d'agrandir encore le lot
d'apprentissage — au-delà des 400 dossiers actuels, témoin toujours exclu —
jusqu'à ce que ces formes y apparaissent d'elles-mêmes.

---

## GAZ · BC2E — ce que la relecture du 22/08/2026 a corrigé

Deux défauts trouvés en relisant **un** volet en entier, alors que 24 volets
avaient déjà été lus sans les voir. Aucun des deux ne se signalait : le lecteur
rendait des anomalies parfaitement vraisemblables.

### 1 · Le point fait partie du code

`19.1` ressortait `19`, `20.1` ressortait `20`. Le motif s'arrêtait sur `\b`,
qui tombe **avant** le point. Or `19` et `20` existent aussi dans la norme :
la troncature ne produisait pas une erreur visible, elle produisait **un autre
point de contrôle**, tout aussi crédible.

Sur l'ensemble du corpus gaz, **41 anomalies** portaient un code pointé.

### 2 · Le libellé déborde de sa ligne — au-dessus ET en dessous

La colonne « LIBELLÉ DES ANOMALIES » est étroite. Quand le texte n'y tient pas,
la mise en page le fait courir sur les lignes voisines, et le texte aplati les
rend dans un ordre qui n'est pas celui de la lecture :

```
le conduit de raccordement présente un jeu aux assemblages supérieur à 2   ← le début
Chaudière 29c1 DGI                                                          ← le rang
mm de part et d autre du diamètre du conduit.                               ← la fin
```

Garder la seule ligne du rang perdait tout le libellé — y compris celui du
**DGI**, c'est-à-dire le motif pour lequel le gaz est coupé.

**La règle, mesurée sur les 32 rangs d'anomalie de tous les volets BC2E lus, et
qui les reconstitue tous les 32 :**

1. le rang porte du texte après son niveau, et ce texte finit par un point →
   il est complet, on ne rattache rien ;
2. sinon, on suit les lignes de débordement — celle du dessus quand le rang est
   nu, puis celles du dessous — jusqu'à retrouver le point final.

Deux règles plus simples ont été essayées **et écartées sur mesure** :
rattacher toujours colle le libellé du rang suivant (78 %), ne rattacher que
les rangs nus tronque les textes qui courent sur trois lignes (91 %).

### 3 · La rubrique D ne se compte pas — et on ne l'affiche donc pas

Chez BC2E, la rubrique « D. IDENTIFICATION DES APPAREILS » est disposée en
colonnes que le texte aplati entremêle : le genre de l'appareil, son type, sa
localisation et la colonne d'observation se retrouvent sur des lignes
différentes, dans un ordre qui varie.

Deux règles de comptage ont été mesurées, **deux ont été réfutées** :

| Hypothèse | Résultat |
|---|---|
| une phrase « L'appareil (ne) comporte… » par appareil | **0 volet sur 24** |
| le mot de type en tête de ligne | **5 volets sur 24** |

Tant qu'aucune règle ne tient sur le corpus, **le nombre d'appareils ne
s'affiche pas**. Un nombre faux serait plus grave qu'un nombre absent : il
ferait croire l'installation entièrement recensée.

### ⚠️ Le piège de sonde qui a failli faire conclure trop vite

La première mesure du type en tête de ligne a rendu **0 sur 24** — un résultat
qui aurait fait abandonner l'hypothèse. Le motif était
`/^(Non raccordé|Raccordé|Étanche)\b/` : en JavaScript, **`\b` ne se déclenche
pas après un caractère accenté**, `é` n'étant pas un caractère de mot. La sonde
ne mesurait rien. Corrigée, elle a rendu 5 sur 24 — assez pour écarter
l'hypothèse pour de bon, mais sur une mesure vraie.

*Voir la mémoire « les sondes qui mentent » : regarder le corpus avant de
croire un compteur.*
