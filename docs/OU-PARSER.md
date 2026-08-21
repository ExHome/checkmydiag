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

*Lectures en cours : 31 sur 50 (11 doublons ⇒ **39 rapports distincts**). 47 LICIEL et 3 BC2E extraits.*

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

### § 2.1 · L'appareil et son étalonnage

```
Étalon : FONDIS - N° NIST 2-1353 - Concentration 1,2 mg/cm² +/-0.1mg/cm²
Etalonnage entrée  1    10/11/2025  1 (+/- 0,1)
Etalonnage sortie  122  10/11/2025  1 (+/- 0,1)
```

Deux mesures test, à une valeur proche du seuil, comme la norme l'exige.
L'autorisation ASN porte sa date de fin de validité (`28/07/2029`).

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

*À suivre : 19 lectures restantes.*
