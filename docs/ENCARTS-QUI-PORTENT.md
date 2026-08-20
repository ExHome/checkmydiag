# Les encarts qui portent l'information

*Où l'information importante se trouve, encart par encart. Établi par lecture
intégrale de **56 rapports, 2 548 pages** — ERP 45 volets, DPE 30, surface 27,
électricité 23, termites 12, amiante 4, gaz 3, plomb 3.*

**Ce document n'est pas une règle d'extraction.** La structure ne se valide qu'au
centième rapport ; ce qui suit est la carte de ce qui a été vu, avec pour chaque
encart s'il s'est montré **constant** ou **variable**.

Les cent lectures faites, l'implémentation a commencé : les encarts marqués
**✅ *implémenté*** sont lus par Verrière, chacun avec sa mesure sur le corpus et
un test qui vérifie qu'on ne trouve rien hors de la rubrique. Les autres restent
des observations.

---

## La règle que ces lectures imposent

**On ne cherche pas une info. On cherche un ENDROIT.**

Chercher une information, c'est la trouver partout. Un motif lâché sur un volet
entier ramène ce qui lui ressemble, pas ce qu'on veut : chercher
`Intitulé (localisation)` dans un volet amiante a donné cinq faux matériaux et
raté le vrai ; chercher une localisation dans le tableau du § 5 a donné « Rez de
chaussée - **conducteurs** Entrée/séjour/cuisine ».

Chercher un endroit, c'est ne trouver que ce qui s'y trouve. **La rubrique
délimite ; le vocabulaire, jamais.** Et quand la rubrique manque, on ne cite
rien — mieux vaut se taire que citer faux.

Ce document est donc une carte d'endroits, pas un dictionnaire de formulations.

---

## L'ENDROIT QUI COMMANDE TOUS LES AUTRES

**« Référence du logiciel validé »** — le seul encart vérifié sur **cinq
éditeurs**, Liciel compris.

```
Référence du logiciel validé : DPEWIN version V5
Référence du logiciel validé : DPEWIN version V4
Référence du logiciel validé : Imm'PACT DPE Version 7A
Référence du logiciel validé : AnalysImmo DPE 2021 4.1.1
```

Le rapport **déclare lui-même le générateur qui l'a produit**, et souvent la
version de la méthode de calcul qui va avec — « 3CL-DPE2021 (Moteur V1.4.25.1) »
contre « 3CL-DPE, version 1.3 ».

C'est décisif, parce que **beaucoup dépend du générateur** : le tableau à
colonnes entrelacées n'existe que chez Liciel, les caractères doublés sont
propres à Expertec Pro, les en-têtes quadruplés à DPEWIN V5, et les DPE d'avant
2021 n'ont ni schéma des déperditions ni « description isolation ».

⚠️ **Ce que le générateur ne commande PAS** — corrigé le 20/08/2026, après
lecture de l'arrêté du 28 septembre 2017. J'avais rangé ici le **catalogue des
six domaines** de l'électricité comme une habitude de Liciel. C'est le **modèle
imposé par l'arrêté**, § 5 de son annexe III. Ce qui est propre à cet éditeur,
c'est de les imprimer tous les six même sans résultat.

**Avant de mettre un trait au compte d'un éditeur, vérifier qu'il n'est pas dans
le texte.**

**On lit donc cet encart d'abord, et il dit comment lire les autres.**

---

## AVANT TOUT : SAVOIR QU'ON NE PEUT PAS LIRE

Un rapport du corpus hors Liciel est **scanné**. Mesuré :

| Document | Pages | Vides | Quasi vides |
|---|---|---|---|
| Imm'PACT (DDT 72 p.) | 72 | **40** | 9 |
| AnalysImmo (DDT 74 p.) | 74 | 4 | 2 |
| Expertec Pro (97 p.) | 97 | **0** | 0 |

**Deux tiers de ce document sont illisibles** par extraction de texte : son
contenu est en image. Ne subsistent que les en-têtes et pieds de page ajoutés
par le générateur — « Dossier de Diagnostic Technique · Réf : Page 20 / 72 ».

**Le danger n'est pas de ne rien lire, c'est de conclure.** Sur un tel document,
chaque volet paraît vide : aucune anomalie électrique, aucun matériau amianté,
aucun indice de termites. Le silence de l'extraction se lit alors exactement
comme un rapport sans défaut.

**Ce qui doit être fait** : mesurer la densité de texte par page avant toute
lecture, et **le dire** quand elle s'effondre — « ce rapport est scanné, je ne
peux pas le lire ». Une page vide n'est pas une page sans anomalie.

C'est le § 23 de l'ordre de mission maître, rencontré en vrai : *ne jamais
masquer un échec d'extraction, ne jamais présenter une absence comme un
résultat.*

---

## Ce qui ressort de la lecture

**L'information importante ne vit pas là où on la cherche d'instinct.** La
conclusion d'un volet tient en une phrase, souvent illisible telle quelle — le
formulaire imprime toutes ses réponses possibles et coche la bonne avec un
dessin. Ce qui a de la valeur est dans les encarts qui l'entourent : ce qui n'a
pas pu être vérifié, ce qui a été constaté en plus, ce que le rapport
recommande, et le risque qu'il nomme.

**Trois encarts se sont révélés systématiquement porteurs**, sur tous les volets
où ils existent :

| Encart | Volet | Ce qu'il porte |
|---|---|---|
| **§ 6 — Avertissement particulier** | électricité | les points de contrôle non vérifiés, et pourquoi |
| **E — Anomalies identifiées** | gaz | code de norme, libellé, pièce, geste **et risque** |
| **Vue d'ensemble du logement** | DPE | chaque paroi, sa description et son isolation |

Et **un encart s'est révélé décisif alors qu'il paraît anodin** : le § 7 du volet
électricité, intitulé « devoir de conseil ». Il porte « Néant » presque partout —
mais sur un dossier, il signalait *la présence de connexions présentant des
parties actives nues sous tension*, qui ne figurait dans aucun tableau
d'anomalies.

---

## ÉLECTRICITÉ — 23 volets lus

### § 5 · Conclusion — le tableau « Domaines / Anomalies » — **constant**

C'est là que vit l'anomalie. Trois choses y sont toujours réunies :

- le **libellé normalisé** (« L'Enveloppe d'au moins un matériel est manquante ou
  détériorée », « L'installation électrique comporte au moins une connexion avec
  une partie active nue sous tension accessible ») ;
- une ligne **Remarques** qui mêle **deux natures de texte** : le constat
  normalisé du formulaire, puis une **précision libre du diagnostiqueur** —
  « PRISE ECS », « Ampoule située dans la zone 2 », « Luminaire plafond
  conducteurs apparents », « Douille type chantier ». Cette précision-là est
  écrite à la main, dans ses mots ; c'est la plus parlante du volet et la moins
  prévisible. Puis le **geste** (« Faire intervenir un électricien qualifié afin
  de… ») ;
- la **localisation** entre parenthèses — mais voir le piège.

**Piège 1 — les deux colonnes s'entrelacent.** Le libellé du domaine est à
gauche, l'anomalie à droite, et l'extraction alterne leurs lignes. Y lire un
texte au fil donne du charabia : *« Faire intervenir un ÉLÉMENTS SOUS TENSION -
électricien qualifié »*.

**Piège 2 — la localisation n'est pas toujours là**, et pas toujours au même
endroit : après le geste sur un rapport, avant la précision sur un autre,
absente sur un troisième, multiple sur un quatrième (« R+2 - Cuisine, R+2 -
Salle de bains + Wc »).

**Piège 3 — la mention compensatoire change la conclusion.** « (Cette anomalie
fait l'objet d'une mesure compensatoire pour limiter le risque de choc
électrique) » : la synthèse conclut alors « aucune anomalie », et elle a raison.

### § 5 · Les deux phrases de conclusion — **constant, et inexploitable seul**

Les deux formulations contradictoires sont **toujours imprimées l'une sous
l'autre** :

```
L'installation intérieure d'électricité ne comporte aucune anomalie.
L'installation intérieure d'électricité comporte une ou des anomalies.
```

La case cochée est un dessin. Le texte ne permet pas de trancher : c'est la
**page 3 du dossier** — le résumé de l'expertise — qui donne la conclusion en
clair, et elle, elle est fiable.

### § 5 · « Informations complémentaires » / rubrique IC. — **constant, à ne pas confondre**

Trois lignes sur la protection différentielle et les prises. Elles ne sont **pas
des anomalies**, et elles ne sont **pas toujours favorables** :

- « **L'ensemble** de l'installation électrique est protégé par au moins un
  dispositif différentiel à haute sensibilité ≤ 30 mA » → rassurant ;
- « **Une partie seulement** de l'installation… » → défavorable ;
- « **Il n'y a aucun dispositif différentiel** à haute sensibilité 30 mA » →
  aucune protection des personnes contre l'électrocution.

Les trois sont écrits au même endroit, dans les mêmes termes, à une négation
près. Le volet qui porte le troisième porte aussi, dans son tableau
d'anomalies : « **Présence de fusible(s) entouré papier d'aluminium** × 2
fusible 20 A type gF à remplacer » — des fusibles shuntés, qui ne fondront plus.
Aucune protection différentielle, et les protections contre les surintensités
neutralisées : c'est l'installation la plus dangereuse du corpus, et les deux
moitiés de ce constat vivent dans deux encarts différents.

**Et cet encart ne se lit jamais seul.** Un volet affirme ici « l'ensemble de
l'installation est protégé par au moins un dispositif différentiel », pendant
que son tableau d'anomalies, quinze lignes plus haut, porte :

> La manœuvre du bouton test du (des) dispositif(s) de protection
> différentielle **n'entraîne pas leur déclenchement**.

Les deux sont vrais : le dispositif existe, et il ne fonctionne pas. Lire
l'information complémentaire sans le tableau fait conclure à une installation
protégée alors que l'organe qui protège les personnes de l'électrocution ne
répond pas. **Deux endroits, une seule réalité — il faut les deux.**

### § 6 · Avertissement particulier — **constant, et le plus sous-estimé**

Deux listes : les **points de contrôle non vérifiés** avec leur motif, et les
**parties non visitées**.

Le plus souvent « Néant ». Mais un volet conclut « aucune anomalie » tout en
listant ici **neuf points non vérifiés** — coupure d'ensemble, emplacement du
différentiel, sensibilité, bouton test, protections contre les surintensités —
tous au motif que *« L'installation n'était pas alimentée en électricité le jour
de la visite »*. « Aucune anomalie » ne veut alors presque rien dire.

### § 7 · Devoir de conseil — **variable, et à ne jamais sauter**

« Néant » dans la quasi-totalité des volets lus. Sur l'un d'eux :

> Certains points de contrôles n'ont pu être effectués. De ce fait **la
> responsabilité du propriétaire reste pleinement engagée** en cas d'accident.
> **Constatations supplémentaires** : Il a été repéré la présence de connexions
> de matériel électrique présentant des **parties actives nues sous tension** en
> amont de l'installation.

Un danger réel, hors de tout tableau d'anomalies. C'est l'encart qui justifie à
lui seul de lire le volet jusqu'au bout.

### Annexe · Photos — **variable**

Quand elle existe, elle reprend l'anomalie **au propre, sur une seule colonne**,
avec son **code de norme** :

```
Libellé de l'anomalie : B7.3 a L'Enveloppe d'au moins un matériel est
manquante ou détériorée.
Remarques : … (Rez de chaussée - Entrée/séjour/cuisine)
```

Mais elle manque souvent, ou ne contient qu'une photo de compteur sans libellé.

---

## GAZ — 3 volets lus, les plus riches du corpus

### E · Anomalies identifiées — **constant**

Le seul encart de tout le corpus qui réunit **cinq informations** sur la même
ligne :

| | |
|---|---|
| code de norme | `C.7-8b`, `C.14-19.1` |
| gravité | A1 · A2 · DGI · 32c |
| libellé | « L'extrémité de l'organe de coupure d'appareil ou de la tuyauterie en attente n'est pas obturée » |
| geste | « Poser ou faire poser un bouchon par un installateur gaz qualifié » |
| **risque constaté** | « **Dégagement de gaz et donc un risque d'explosion** » |

Le **risque constaté** n'existe nulle part ailleurs dans le corpus. C'est
l'information la plus parlante pour un habitant, et le gaz est le seul volet à
la donner.

Les deux anomalies rencontrées sont les mêmes sur les deux dossiers : robinet en
attente non obturé, et amenée d'air absente ou trop éloignée — cette dernière
portant le risque d'**intoxication au monoxyde de carbone**.

### D · Identification des appareils — **constant**

Chaudière avec **marque, modèle et puissance**, son type de raccordement, sa
pièce, la **mesure de CO** (« 0 ppm », ou « Non réalisée » quand la chaudière est
étanche et non visible), et l'état des entretiens appareil et conduit.

### G · Constatations diverses — **constant**

Porte ce qui manque au dossier : « Attestation de contrôle de moins d'un an de
la vacuité des conduits de fumées **non présentée** ».

### H · Conclusion — **constant, et inexploitable seul**

Les **cinq** conclusions possibles sont imprimées : aucune / A1 / A2 / DGI / 32c.
Même piège qu'en électricité, avec cinq lignes au lieu de deux.

---

## DPE — 30 volets lus

### p. 4 · Vue d'ensemble du logement — **constant**

Chaque paroi, sa description et son isolation. C'est la **source textuelle des
déperditions**, et la seule.

**Trois nuances que « non isolé » seul ne dit pas** :

- « donnant sur **un local chauffé** », « sur un **hall d'entrée avec dispositif
  de fermeture automatique** », « sur un **garage privé collectif** », « sur un
  **terre-plein** » : la paroi ne donne pas sur l'extérieur ;
- un même poste porte **plusieurs murs** séparés par « / » — jusqu'à cinq, dont
  un seul non isolé ;
- l'isolation est le plus souvent dite par un **substantif** (« avec isolation
  intérieure ») et non par l'adjectif.

### p. 4 · Vue d'ensemble des équipements — **constant**

Chauffage, eau chaude, climatisation, ventilation, pilotage. Cet encart **explique
parfois l'absence d'un autre volet** : « chaudière gaz installée à partir de
2016 » — moins de quinze ans, l'état gaz n'est pas exigible.

### p. 3 · Montants et consommations — **constant**

Consommation et coût **par poste** — chauffage, eau chaude, éclairage,
auxiliaires — en kWh primaire et final, avec la fourchette en euros.

### p. 5 · Recommandations d'amélioration — **constant**

Les deux packs de travaux, et le **montant estimé** (« 8 500 à 12 700 € »), avec
la performance visée (SCOP = 4, COP = 3).

### p. 2 · Confort d'été — **constant, et ce n'est PAS un catalogue**

Deux encarts voisins occupent cette page, et ils sont de natures opposées :

- « **Diverses solutions existent** : chauffe-eau thermodynamique, pompe à
  chaleur, panneaux solaires, réseau de chaleur, géothermie, chauffage au
  bois » → c'est un **catalogue**, identique sur tous les rapports ;
- « **Les caractéristiques de votre logement améliorant le confort d'été** » →
  c'est un **constat**, et il varie : « toiture isolée » seule sur un dossier,
  « bonne inertie du logement, logement traversant » sur un autre, « fenêtres
  équipées de volets extérieurs » sur un troisième.

Les deux colonnes s'entrelacent à l'extraction, ce qui les fait passer pour une
seule liste — et j'ai d'abord classé l'ensemble comme un catalogue. C'était
faux : la moitié droite décrit vraiment le logement.

**Conséquence pratique** : le garde-fou qui écarte ces lignes du descriptif
d'isolation a raison de le faire — « toiture isolée » du confort d'été n'est pas
la ligne du descriptif — mais il fait perdre du même coup une information qui
existe.

### p. 2 · Schéma des déperditions — **constant, et en image**

31 volets sur 31 le nomment, **aucun ne porte de « % » dans son texte**.

---

## TERMITES — 12 volets lus

> ⚠️ **Les lettres de ce volet ne sont pas fiables — correction du 20/08/2026,
> après lecture de l'arrêté du 29 mars 2007.**
>
> L'annexe 1 de l'arrêté fixe le modèle du rapport, et ses rubriques vont de
> **A à H** :
>
> | | Rubrique du modèle réglementaire |
> |---|---|
> | A | Désignation du ou des bâtiments |
> | B | Désignation du client |
> | C | Désignation de l'opérateur de diagnostic |
> | D | Bâtiments et parties visités · éléments infestés ou non |
> | E | Parties **n'ayant pu être visitées** et justification |
> | F | Ouvrages et éléments **qui n'ont pas été examinés** et justification |
> | G | Moyens d'investigation utilisés |
> | H | Constatations diverses |
>
> **Mais les rapports ne suivent pas ces lettres.** Mesuré sur le corpus :
> « Constatations diverses » sort en **H onze fois**, en **G trois fois**, en
> **I une fois** ; « Moyens d'investigation » en **I onze fois** et en **H une
> fois**. Les éditeurs insèrent des rubriques que le modèle n'a pas, et tout ce
> qui suit se décale.
>
> Les lettres ci-dessous décrivent donc ce qu'un rapport donné portait, **pas une
> position stable**. C'est la règle de `ODM_LISEUSE_TOUS_EDITEURS.md`, rencontrée
> en vrai : *un endroit se nomme — il ne se repère ni par sa page, ni par son
> numéro, ni par sa lettre.*
>
> Le code, lui, lit les **intitulés** : aucun motif n'est ancré sur une lettre.
> C'était cette carte qui donnait le mauvais exemple.
>
> **Et la norme que l'arrêté désigne n'est pas celle qui est publiée.** Version
> consolidée lue le 20/08/2026 : l'article 1er vise « NF P 03-201 **de mars
> 2012** », dernière mise à jour au 1er juillet 2012. La norme publiée est celle
> de **février 2016**, qui remplace celle de 2012. Pas de vide — l'article admet
> « toutes autres normes ou spécifications techniques équivalentes » — mais la
> référence réglementaire a quatorze ans de retard sur l'étagère.

**Les lettres de rubriques ne sont pas fixes.** Vérifié sur quatre volets :

| | Trois volets sur quatre | Le quatrième |
|---|---|---|
| **G** | Ouvrages non examinés | Ouvrages non examinés |
| **H** | Constatations diverses | **Moyens d'investigation** |
| **I** | Moyens d'investigation | **Constatations diverses** |

H et I sont permutées. Une lecture qui irait chercher « la rubrique H » y
trouverait, selon le rapport, une réserve sur ce qui n'a pas été vu — ou la
description du poinçon et de la hachette.

**C'est la même leçon que pour les pages, appliquée aux lettres : un endroit se
nomme, il ne se repère ni par sa page, ni par son numéro, ni par sa lettre.**
Seul l'intitulé tient.

### A · Situation en regard d'un arrêté préfectoral — **constant**

« Le bien est situé dans une zone soumise à un arrêté préfectoral » ou
« Néant ». C'est ce qui explique pourquoi le diagnostic est au dossier.

### D · Tableau des éléments examinés — **constant, et le plus fin du corpus**

**Pièce par pièce, élément par élément** : sol, plinthes, murs A/B/C/D, plafond,
porte, fenêtre — avec le résultat de chacun. Terrasse et place de parking
comprises.

**Piège** : deux constats voisins dans les mêmes colonnes — les termites, et les
**autres agents de dégradation biologique** (insectes du bois, champignons,
mérule). Les confondre annonce une infestation qui n'existe pas.

### Notes de bas de page — **constant, et jamais lu**

La **Note 1** dit que les autres agents sont signalés « pour information », sans
obligation d'en donner la nature ni le lieu. La **Note 2** rappelle
l'obligation de **déclaration en mairie** en cas de présence de termites.

### G · Ouvrages non examinés — **constant, et il nuance la rubrique D**

Trouvé en lisant par endroit, ce que la recherche par mot n'aurait jamais donné.
Un volet déclare ici :

```
Localisation : 2ème étage - Entrée/Séjour, Cuisine, Chambre, Salle de bain/Wc
Ouvrages     : Mur
Motif        : Revêtement fixé
```

Les **murs de quatre pièces n'ont pas été examinés** — pendant que la rubrique D,
juste au-dessus, porte « Mur - Plâtre et Peinture : Absence d'indices » pour ces
mêmes pièces.

Ce n'est pas une contradiction, c'est la **portée réelle du constat** : l'absence
d'indices vaut pour ce qui est visible, pas pour ce que le revêtement fixé
cache. La rubrique D seule fait croire à un contrôle complet ; la rubrique G dit
ce qu'il valait.

Le rapport ajoute son engagement : « notre cabinet s'engage à retourner sur les
lieux afin de compléter le constat aux parties d'immeubles non visitées, dès
lors que les dispositions permettant un contrôle auront été prises ».

### H · Constatations diverses — **constant, et il double parfois la rubrique G**

Une information peut changer d'encart d'un rapport à l'autre. La restriction sur
ce que le diagnostic n'a pas pu voir apparaît :

- en **G** sur un dossier — « Mur / Revêtement fixé », par localisation ;
- en **H** sur un autre, en clair et sans localisation :

> Le diagnostic se limite aux zones rendues visibles et accessibles par le
> propriétaire. Les zones situées derrière les doublages des murs et plafonds
> n'ont pas pu être examinées.

…pendant que la rubrique G du même rapport dit « Néant ».

**Conséquence** : connaître l'encart ne suffit pas, il faut connaître **les
encarts possibles** pour une information donnée. Un « Néant » en G ne veut pas
dire que tout a été examiné : il faut lire H aussi.

C'est également en H que se trouve la **Note 1** sur les autres agents de
dégradation biologique, sur certains millésimes.

### F · Parties non visitées — **constant**

---

## AMIANTE — 4 volets lus

### 1.1 · Conclusions — **constant, deux conclusions séparées**

Liste A et liste B concluent **séparément** dans le constat de vente. Le
**Dossier Amiante Parties Privatives**, lui, ne porte qu'une conclusion (liste A
seule).

### 1.2 · Locaux non visités — **constant**

Tableau `Localisation / Parties du local / Raison` — « 4ème étage - Combles /
Toutes / Impossibilité d'entrer ». Suivi de la conséquence, écrite par le
rapport : les obligations du propriétaire **ne sont pas remplies** pour ces
parties.

### 5.1 · Fiche de cotation — **constant quand il y a de l'amiante**

L'**état de conservation** : « Matériau dégradé », « (étendue ponctuelle) ». La
seule chose qui distingue une amiante stable d'une amiante qui s'abîme.

### A · Conclusions du repérage effectif — **un seul éditeur, et il fallait le lire** ✅ *implémenté*

Cette rubrique ne dit pas toujours oui ou non. Elle peut dire **pas encore** :

```
A - CONCLUSIONS DU REPÉRAGE EFFECTIF :
PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE.
Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il a été repéré des matériaux et
produits susceptibles de contenir de l'amiante : marquage des matériaux, ils ne contiennent pas
d'amiante dans :
SOUS-SOL - Cave (Conduits) : Plafond
Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il a été repéré des matériaux ou
produits susceptibles de contenir de l'amiante pour lesquels des sondages et/ou des prélèvements
doivent être effectués dans :
Cage d'escalier (Dalle de sol) : Sol
Dégagement (Dalle de sol) : sol
```

**Deux informations, et elles se contredisent en apparence.** La ligne en
capitales dit que le laboratoire n'a pas rendu ses résultats ; la phrase qui la
suit rassure — « ils ne contiennent pas d'amiante ». Un lecteur qui s'arrête à
la seconde croit tenir un constat définitif.

**Deux listes de même forme, de sens opposé.** `Local (Composant) : détail`
apparaît deux fois : sous la phrase qui *conclut*, et sous celle qui dit qu'il
reste à *sonder*. Les confondre transforme une réponse en non-réponse, ou
l'inverse. Ce sont les phrases d'introduction qui les séparent, jamais leur forme.

**Le piège d'endroit** : la phrase sur les sondages figure aussi au § 2.2, comme
description de la méthode, dans **tous** les rapports. Hors rubrique, elle ferait
annoncer des prélèvements en attente à chaque repérage.

*Vu chez un seul éditeur — non confirmé ailleurs.*

---

## PLOMB — 2 encarts qui ne parlent pas de plomb

### Situations de risque de saturnisme infantile — **variable** ✅ *implémenté*

Deux seuils réglementaires, répondus par OUI ou NON :

```
Au moins une pièce du local objet du constat présente        NON
au moins 50% d'unités de diagnostic en classe 3
L'ensemble des locaux objets du constat présente au          NON
moins 20% d'unités de diagnostic en classe 3
```

### Situations de dégradation du bâti — **variable, et c'est le plus lourd** ✅ *implémenté*

```
Les locaux objets du constat présentent au moins un          OUI
plancher ou plafond menaçant de s'effondrer ou en
partie ou tout effondré
Liste des pièces concernées : , Cave
…des traces importantes de coulure, de ruissellement…        NON
…des moisissures ou de nombreuses tâches d'humidité          NON
Le rapport a été envoyé à l'agence régionale de santé.
```

**Un constat sans une seule unité classée 3 — donc vert — qui porte un plafond
menaçant de s'effondrer, la cave nommée, et un signalement aux autorités
sanitaires.** Le CREP le dit lui-même dans son rappel : il repère « les facteurs
de dégradation du bâti permettant d'identifier les situations d'insalubrité ».

**Le piège de forme, et il est sévère.** Ces deux encarts occupent la colonne de
droite d'un tableau à deux colonnes, dont la gauche porte le décompte des
classes. La réponse termine la ligne où le libellé **commence** ; le mot qui
identifie la situation — « plancher », « coulure », « 50 % » — tombe sur une
ligne de continuation. **Ils ne sont jamais sur la même ligne :**

```
Unités de diagnostic en classe 2 : 0 0.0 % Les locaux … au moins un   OUI
plancher ou plafond menaçant de s'effondrer ou en
Unités de diagnostic en classe 3 : 0 0.0 %
partie ou tout effondré
```

On repère la situation à son mot, puis on **remonte** de trois lignes au plus
jusqu'à la première qui se termine par OUI ou NON — en capitales, car en
minuscules « non » termine une phrase sur deux.

**« Liste des pièces concernées »** suit la situation qu'elle concerne, et le
rapport laisse traîner devant elle la virgule d'une liste vide.

**Le verbe change d'un éditeur à l'autre** : « nous avons donc **transmis** » chez
LICIEL, « le rapport a été **envoyé** » ici. Le motif ne connaissait que le
premier, et laissait passer le second.

**Le piège d'endroit** : le rappel réglementaire du CREP énumère les cinq mêmes
situations, dans les mêmes mots, dans **tous** les rapports — y compris ceux qui
n'en constatent aucune.

---

## SURFACE — 27 volets lus

### Tableau récapitulatif — **constant**

Chaque pièce avec sa superficie, sa surface au sol, et un **commentaire** qui
explique les écarts : « Pièce dont la fonction l'exclut de la surface carrez »
(balcon : 0 m² Carrez, 4,67 m² au sol), « Surface occupée par un chauffe-eau
fixe et obligatoire ».

**À vérifier avant de lire** : Carrez ou Boutin. Le même lot a été mesuré en
Carrez pour une vente et en surface habitable pour une location — même chiffre,
mais deux notions.

---

## ÉTAT DES RISQUES — 45 volets lus

### Tableau de synthèse du volet — **constant, et fiable**

`Type / Nature du risque / État de la procédure / Date / Concerné / Travaux /
Réf.` C'est la source à lire, **pas l'imprimé officiel** — celui-ci existe en
deux mises en page inverses et une lecture naïve y lit la réponse opposée.

### Prescriptions de travaux — **constant quand la colonne Travaux dit oui**

Elles sont **conditionnelles** : « en zone rouge hachurée », « sous la condition
réseau de distribution de fluide (concessionnaire) », « établissement de soins ».
Aucune ne vise un appartement ordinaire. Annoncer « des prescriptions de travaux
existent » sans cette nuance fait croire à des travaux dus.

### Arrêtés de catastrophe naturelle — **constant**

Jusqu'à 28 arrêtés sur une commune. La colonne **« Indemnisé » est toujours
vide** : c'est au vendeur de la remplir, et elle ne l'est jamais.

---

## DOSSIER — encarts hors volets

### Résumé de l'expertise — **constant en existence, VARIABLE en position**

Une conclusion par prestation, **en clair**. C'est la source la plus fiable pour
les conclusions que le formulaire n'arrive pas à trancher — quand elle la porte.

**Piège 0 — une ligne peut être vide.** Un dossier de 2021 liste « Amiante »
sans aucune conclusion en face, alors qu'il contient bien un volet amiante de
douze pages. La prestation est nommée, la conclusion manque. Il faut alors la
chercher dans le volet lui-même, et l'absence de conclusion en synthèse ne dit
rien du résultat.

**Piège 1 — sa position bouge.** Page 3 sur la plupart des dossiers, **page 2**
sur d'autres. Le chercher à une page fixe le manque ; il se cherche par son
intitulé, « Résumé de l'expertise n° … ».

**Piège 2 — c'est un tableau, et un tableau ne ponctue pas ses cellules.** Le
recollage jusqu'au premier point fait déborder la conclusion d'un volet sur le
suivant.

### Fin de dossier · Attestation sur l'honneur — **constant**

La pièce qui réunit tout ce qu'un notaire cherche : **certifications par
prestation** avec leur échéance, **assurance** avec sa validité, **impartialité**,
moyens. Elle est en dernière page, après les annexes.

### Objet de la mission — **constant, et trompeur**

Le **catalogue des prestations** que le cabinet sait faire. Ce n'est pas le
contenu du dossier.

Son contenu varie d'un millésime à l'autre — quarante entrées sur les uns,
trente-cinq sur les autres, avec des lignes qui apparaissent (« Déchets /
PEMD », « Performance numérique ») et d'autres qui changent de place. Le
reconnaître à sa liste exacte ne tient pas ; c'est sa **forme** qui le trahit —
trois entrées ou plus alignées sur une ligne.

---

## Ce qui reste à vérifier au-delà du 100e rapport

- La **découpe manque des volets entiers** : sept sur 56 rapports — un contrôle
  assainissement et six Dossiers Amiante Parties Privatives, de dix à douze
  pages chacun.
- Les **numérotations d'articles divergent** entre millésimes pour la même
  obligation (L.126-4/L.126-5 contre L.133-4/R.133-3).
- Un rapport de 2025 écrit ses **apostrophes entourées d'espaces** (« l '
  installation ») ; un autre porte une **entité HTML non décodée** (`&gt;`).

---

## ÉPREUVE HORS LICIEL — ce qui tient, ce qui était une habitude

*Douze rapports de cinq éditeurs différents — AnalysImmo, DPEWIN V4 et V5,
Imm'PACT, Expertec Pro — 436 pages. Tout ce qui précède venait d'un seul
générateur ; voici ce qui y résiste.*

### Ce qui n'était PAS une constante du métier

**Le catalogue des six domaines est propre à Liciel.** Chez lui, la liste des
six domaines réglementaires est imprimée sans résultat, et un tableau séparé
donne les anomalies — d'où la confusion qui faisait annoncer neuf anomalies pour
quatre. **Chez AnalysImmo, chaque domaine porte son propre verdict** :

```
1. L'appareil général de commande et de protection et son accessibilité.
   Néant
2. Dispositif de protection différentiel / Prise de terre.
   [tableau d'anomalie]
3. Dispositif de protection contre les surintensités.
   Néant
```

Il n'y a rien à démasquer : le document répond domaine par domaine.

**Le tableau à deux colonnes entrelacées est propre à Liciel.** La synthèse
d'AnalysImmo est faite de **titres en majuscules suivis de leur texte** —
`CONSTAT AMIANTE`, `CERTIFICAT DE SUPERFICIE`, `DIAGNOSTIC ELECTRICITE` — donc
sans entrelacement. Le charabia des colonnes mélangées ne peut pas s'y produire.

### Ce qu'un autre éditeur donne et que Liciel tait

Le tableau d'anomalies électriques d'AnalysImmo a **six colonnes** là où Liciel
en a trois :

| | |
|---|---|
| **N° article de l'anomalie** | `B.3.3.6 a1)` |
| Libellé | « Au moins un socle de prise de courant ne comporte pas de broche de terre » |
| **N° article de la mesure compensatoire** | `B.3.3.6.1` |
| Localisation | « Notamment aux chambres » |
| **Libellé de la mesure compensatoire** | « protection du circuit par au moins un dispositif différentiel ≤ 30 mA » |
| **Observation** libre | « Présence de prises 2 pôles vétustes » |

Deux informations que Liciel ne donne **jamais** en électricité : le **code de
norme de l'anomalie** — chez lui il n'apparaît qu'en annexe photos, et
rarement — et le **détail de la mesure compensatoire**, réduite chez Liciel à
une parenthèse sans contenu.

### Le catalogue existe quand même, ailleurs

AnalysImmo répète en **en-tête de chaque page** : « MG DIAG vous permet de gérer
l'ensemble des diagnostics obligatoires : Amiante, Termite… ». Même piège que le
catalogue des prestations de Liciel, à un autre endroit — et cette fois sur
soixante-quatorze pages au lieu de deux.

### Le DPE d'avant 2021 : même information, autre encart, parfois plus précis

**Ni « schéma des déperditions », ni « description isolation »** dans les DPE
d'ancienne génération — modèles **6.A** (DPEWIN V4) et **6.1** (Imm'PACT). La
carte du DPE ne vaut que pour le modèle réglementaire de 2021.

L'information existe pourtant, sous l'intitulé **« Descriptif du logement et de
ses équipements »**, en **trois colonnes thématiques** et en listes à puces :

```
Logement                    | Chauffage et refroidissement | Eau chaude sanitaire, ventilation
Murs :                      | Système de chauffage :       | Système de production d'ECS :
- Mur en béton banché Ep <=20cm avec isolant (ITI) Ep=10 cm
- Mur en briques pleines simples Ep <=9cm avec isolant (ITI) Ep=7 cm
- Mur en béton banché Ep <=20cm non isolé
```

**Et il est parfois plus riche que le modèle 2021.** Imm'PACT numérote les
parois et donne l'épaisseur d'isolant : « Mur 1 : blocs de béton creux, ép.
20 cm ou moins, isolation par l'intérieur (ITI), **épaisseur d'isolation :
10 cm** ». Le DPE 2021 dit « avec isolation intérieure » sans le chiffre.

Le vocabulaire de l'isolation change aussi : « **avec isolant (ITI)** » et
« **non isolé** » ici, « avec isolation intérieure » là. Un motif ancré sur la
formulation de 2021 ne trouve rien dans un rapport de 2019.

**Autre encart propre à l'ancien modèle** : « Rapport d'entretien ou
d'inspection des chaudières joint : **Non requis** ».

### Un piège d'extraction propre à DPEWIN V5

Ses en-têtes de colonnes sont **répétés autant de fois qu'il y a de colonnes**,
sur une seule ligne :

```
description description description description isolation isolation isolation isolation
```

Chercher la ligne « description isolation » pour borner l'encart ne la trouve
pas sous cette forme.

### Le CREP d'Expertec Pro : la pièce comme unité, et la mesure comme ligne

Le tableau le plus détaillé de tout le corpus, tous éditeurs confondus. Il est
organisé **par pièce**, en titres majuscules — `SOUS SOL CHAUFFERIE`,
`RDC SALLE D'EAU`, `COMBLES GRENIER` — et chaque ligne est **une mesure** :

```
RDC SALLE D'EAU
N° Mes | Zone | Unité de diagnostic | Substrat | Revêt. apparent | Localisa mesure | Rés | mg/cm² | Classe
2042   |  A   | porte1              | Bois     | Peinture        |                 | NEG |  0,1   |   0
2046   |  A   | mur bas             | Plâtre   | Papier peint    | <1m.            | NEG |  0,5   |   0
2047   |  A   | mur haut            | Plâtre   | Papier peint    | >1m.            | NEG |  0,4   |   0
…
Nombre total d'UD 8 · Nbre d'unités de classe 3 : 0 · Pourcentage de classe 3 : 0%
```

La **zone** (A/B/C/D) désigne les quatre murs de la pièce, la **localisation de
mesure** distingue le bas et le haut du mur (`<1m.` / `>1m.`), et un
**récapitulatif par pièce** clôt chaque tableau.

Chez Liciel, le CREP donne un récapitulatif global — Total, Non mesurées,
Classes 0 à 3 — mais le détail par pièce n'apparaît pas de cette façon.

### Un piège d'extraction propre à Expertec Pro : les caractères doublés

Ses titres sortent avec **chaque caractère répété** :

```
D O S S I E R  D E  D I A G N O S T I C S  T E C H N I Q U E S
C C O O N N C C L L U U S S I I O O N N
D D a a t t e e   d d e e   m m i i s s s s i i o o n n
```

Aucun motif texte ne fonctionne sur ces lignes. En revanche le **sommaire
paginé** de la page 2 donne les rubriques et leurs pages : c'est par là qu'on
entre dans ce document.

### La réserve sur la synthèse : Liciel est l'exception

| Éditeur | Ce que dit sa synthèse |
|---|---|
| AnalysImmo | « Document ne pouvant en aucun cas être annexé à un acte authentique » |
| Expertec Pro | « Seuls les rapports réglementaires complets, annexes comprises, pourront être annexés à l'acte authentique » |
| Liciel | « ne peut être utilisée indépendamment du rapport d'expertise complet » |

Deux éditeurs sur trois excluent explicitement la synthèse de l'acte. Liciel se
contente de dire qu'elle ne s'utilise pas seule. **La synthèse est une aide à la
lecture, pas une pièce du dossier** — et c'est une raison de plus d'aller lire le
volet.

---

## BC2E — deux endroits que personne d'autre ne donne

*Format des plus anciens dossiers DGLM, produit par les cabinets du réseau
BC2E. Trouvé dans les dossiers clients, pas dans le corpus hors Liciel.*

### La double pagination — le bornage offert par le document ✅ *implémenté*

Chaque pied de page porte **deux compteurs à la fois** :

```
ATTESTATION LOI CARREZ : 1 sur 2      ← position dans le VOLET
DDT : 4 sur 6                          ← position dans le DOSSIER
```

Aucun autre éditeur ne fait cela. Le document dit lui-même où commence et où
finit chaque volet, et combien de pages il compte. C'est **le bornage que la
découpe cherche à deviner ailleurs** — et de quoi repérer une page manquante.

À comparer à LICIEL, qui annonce sa pagination une seule fois, en tête de volet
(« le présent rapport est constitué de 11 pages »), et à AnalysImmo, qui écrit
`ELEC 2 / 11` — la pagination du volet seul.

**Les six libellés du dossier réel**, et ils ne se ressemblent pas :

```
DIAGNOSTIC TERMITES 1 sur 4      ← pas de deux-points
DIAGNOSTIC PLOMB 1 sur 8         ← pas de deux-points
DIAGNOSTIC DPE : 2 sur 11
ATTESTATION LOI CARREZ : 1 sur 2
AMIANTE (DTA) : 3 sur 10         ← pas de mot d'ouverture, et des parenthèses
ERP : 12 sur 12                  ← trois lettres, rien d'autre
```

**Ce qui a failli être perdu** : la première lecture exigeait un deux-points et
un mot d'ouverture — DIAGNOSTIC, ATTESTATION, RAPPORT. Elle ne laissait passer
que le DPE et l'attestation Carrez : **quatre volets sur six restaient invisibles
dans le document qui les borne le mieux**. Et elle ne regardait que les douze
premières lignes de la feuille, alors que la double pagination est en **pied de
page**, collée à la ligne de contact du cabinet.

On lit donc la **forme** et non le vocabulaire : un libellé en capitales suivi de
« n sur m », **en fin de ligne**, en haut ou en bas de la feuille. Mesuré sur
127 documents : sept libellés ressortent, tous de cet éditeur, **aucun bruit**.

**`DDT` n'est pas un volet** : c'est le compteur du dossier. Le prendre pour une
déclaration rouvrirait une section à chaque page.

### L'avertissement sur l'incomplétude du dossier ✅ *implémenté*

En page 1, et nulle part ailleurs dans le corpus :

> Seuls les rapports de diagnostics **demandés par le vendeur** ou un mandataire
> figurent dans le présent dossier. L'existence et le contenu de diagnostics
> réalisés antérieurement ou par un autre opérateur **ne sont pas connus**. En
> conséquence, [le cabinet] ne saurait en aucun cas être tenu pour responsable
> en cas d'**absence d'un ou plusieurs diagnostics**. Il appartient au vendeur de
> compléter le présent dossier autant que de besoin.

Le diagnostiqueur déclare d'emblée que **le dossier peut être incomplet**, et
que la charge de le compléter revient au vendeur. C'est la base explicite du
contrôle de complétude : ce que Verrière signale comme manquant, le rapport
lui-même prévient qu'il peut l'être.

**L'endroit** : la page de garde, et elle seule. Bornée aux soixante premières
lignes, pour ne pas confondre cette clause avec les réserves de responsabilité
qui closent chaque volet, et qui disent tout autre chose. Mesuré : 2 documents
sur 127 la portent, tous deux en page de garde, aucun manqué ailleurs.

**Et elle ne met personne en cause** : la clause est exacte et régulière. Un test
vérifie que Verrière la remonte sans parler de faute ni de manquement.

### Autres traits

**L'attestation sur l'honneur est en page 2**, juste après la garde — chez
LICIEL elle est en dernière page, après les annexes.

**« PAS D'ACCOMPAGNATEUR » est coupé en deux** par la mise en page : « PAS » sur
la ligne du champ, « D'ACCOMPAGNATEUR » deux lignes plus bas.

### BC2E — l'amiante, et un état que personne d'autre ne déclare

**Un constat peut n'être pas définitif, et le dire.** En tête des conclusions :

> **PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE.**
> […] il a été repéré des matériaux susceptibles de contenir de l'amiante **pour
> lesquels des sondages et/ou des prélèvements doivent être effectués** dans :
> Cage d'escalier (Dalle de sol), Dégagement (Dalle de sol).

Le rapport annonce que ses conclusions **attendent le laboratoire**. Aucun autre
éditeur du corpus ne porte cet état. Le lire « aucune amiante repérée » serait
un contresens : rien n'est encore tranché.

**Trois rubriques nommées** au lieu d'une conclusion unique :

| | |
|---|---|
| **A** | conclusions du repérage effectif |
| **B** | obligations et recommandations réglementaires, séparées liste A / liste B |
| **C** | parties pour lesquelles des investigations complémentaires sont nécessaires |

**Et trois tableaux distincts dans la rubrique C**, là où LICIEL n'en a qu'un :

```
LOCAUX NON VISITÉS         Etage | Local | Motif                              → RDC | Cour | Absence de clé
ÉLÉMENTS NON EXAMINÉS      Etage | Local | Éléments et motif                  → Néant
MATÉRIAUX À INVESTIGUER    Etage | Local | Localisation | Composant | Motif
```

Trois natures d'empêchement séparées : le local fermé, l'élément non examiné, le
matériau qui attend son prélèvement. LICIEL les mélange en un seul tableau
`Localisation / Parties du local / Raison`.

La conséquence est écrite en clair : « les obligations réglementaires prévues
aux articles R.1334-15 à R.1334-18 **ne sont pas remplies** ».

### BC2E — le CREP dit si le logement est dangereux pour un enfant, et s'il est insalubre

Deux encarts que LICIEL ne porte pas, et qui sont l'enjeu même du constat.

**Les deux seuils du saturnisme infantile, évalués explicitement :**

```
Situations de risque de saturnisme infantile :
  Au moins une pièce présente au moins 50 % d'unités de diagnostic en classe 3   → NON
  L'ensemble des locaux présente au moins 20 % d'unités en classe 3              → NON
```

Ce sont les deux critères réglementaires qui déclenchent l'obligation de travaux
et le signalement. LICIEL donne le décompte par classe et laisse le lecteur
faire le calcul ; BC2E répond à la question.

**Les trois situations de dégradation du bâti, et l'envoi à l'ARS :**

```
Situations de dégradation du bâti mises en évidence :
  au moins un plancher ou plafond menaçant de s'effondrer, ou effondré   → OUI
  Liste des pièces concernées : Cave
  traces importantes de coulure, ruissellement ou écoulement             → NON
  moisissures ou nombreuses taches d'humidité                            → NON

Le rapport a été envoyé à l'agence régionale de santé.
```

**Un plafond menaçant de s'effondrer, et le rapport transmis à l'ARS** : un
signalement d'insalubrité aux autorités sanitaires, dans un volet qu'on croit
consacré au plomb.

Le rappel réglementaire du même document l'explique : le CREP sert à mesurer les
revêtements **et** à « repérer les facteurs de dégradation du bâti permettant
d'identifier les **situations d'insalubrité** ». Le plomb n'est pas son seul
objet.

**Deux autres précisions du même encart** : le CREP **parties communes** relève
d'un arrêté distinct — celui du 19 août 2011 relatif aux *travaux* en parties
communes — et « la recherche de canalisations en plomb **ne fait pas partie** du
champ d'application du CREP », ce qu'un acquéreur suppose souvent l'inverse.

Sur ce dossier, **14 unités sur 46 sont non mesurées** — 30 %.

### La réserve sur la synthèse : le compte s'établit

| Éditeur | Ce que dit sa synthèse |
|---|---|
| AnalysImmo | « ne pouvant **en aucun cas** être annexé à un acte authentique » |
| Expertec Pro | « **seuls** les rapports réglementaires complets pourront être annexés » |
| BC2E | « ne peut remplacer **en aucun cas** les rapports qui doivent être annexés » |
| LICIEL | « ne peut être utilisée indépendamment du rapport complet » |

**Trois éditeurs sur quatre** excluent explicitement leur synthèse de l'acte.
LICIEL est l'exception, avec la formule la plus faible.
