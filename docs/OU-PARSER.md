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
