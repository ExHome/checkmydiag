# OÙ PARSER — AMIANTE


*La carte des endroits du constat amiante, rangée **par éditeur**, puis par
**type de mission**. Établie par lecture intégrale, en application de
`ODM_OU_PARSER.md`, `ODM_EDITEUR_CONDITIONNE_TOUT.md` et
`ODM_LIRE_AVANT_DE_SONDER.md`.*

*Ordre d'Aude, 21/08/2026 : « lis tous les diags amiante du début à la fin,
apprends, et apprends où parser ». Ce fichier est le produit de cette lecture,
et il n'avance qu'à la lecture — jamais à la sonde.*

**État : 130 volets amiante lus, sur 511 documents examinés** (215 sans volet
amiante, 14 numérisations sans texte extractible). Éditeurs : LICIEL — dont
quatre cabinets confrères au même gabarit — et BC2E. Missions : vente, DTA,
DAPP, repérage avant travaux.

Un gabarit neuf se lit en intégral ; les suivants se lisent **en différentiel de
lignes** — chaque ligne d'un rapport est soit déjà lue mot pour mot, soit
présentée à la lecture. Rien n'est sauté. Registre de lecture :
`05_CORPUS_RAPPORTS/registre-amiante.json` (Dropbox, empreintes seules).

---

## La règle, rappelée en tête

**Un endroit se décrit par QUATRE choses. S'il en manque une, ce n'est pas un
endroit :**

1. **L'éditeur** — sous quel nom la carte est rangée.
2. **L'intitulé exact** — jamais la page, le numéro ni la lettre.
3. **Les bornes** — où ça commence, et surtout **où ça finit**.
4. **La disposition interne** — la réponse n'est pas toujours là où le libellé
   est.

Trois issues pour la **rubrique** : **trouvée** · elle dit **« Néant »** (c'est
une réponse) · elle est **absente** (on ne cite rien).

Et **trois issues pour le constat lui-même**, jamais deux : **présence** ·
**absence** · **non conclu**. *Mesuré chez LICIEL et chez BC2E, les deux seuls
éditeurs lus.* Le troisième état s'écrit en **neuf formes chez LICIEL** et en
**deux chez BC2E** — c'est le fait le plus dangereux de tout ce fichier, et il
ne s'écrit pas pareil d'un éditeur à l'autre.

---

## ⚠️ RIEN ICI NE VAUT « EN GÉNÉRAL » — la carte se lit par éditeur

**Ordre permanent d'Aude, rappelé le 21/08/2026 : on parse DIFFÉREMMENT pour
chaque éditeur** — et l'architecture qui en découle est
**[un lecteur par éditeur, choisi sur signature](ODM-LECTEURS-PAR-EDITEUR.md)**,
jamais un lecteur unique rafistolé. Cette carte est ce qui alimente ces
lecteurs : **une partie de ce fichier = un lecteur à écrire.** Ce fichier est donc rangé en deux parties étanches — **LICIEL**
et **BC2E** — et **aucune ligne d'une partie ne vaut dans l'autre.**

Trois conséquences, sans exception :

1. Un endroit décrit sous `# LICIEL` est **l'habitude de LICIEL** tant qu'il n'a
   pas été mesuré ailleurs. Il ne se transporte pas.
2. **Un trou se déclare, il ne se comble pas.** Une case « non mesuré » ci-dessous
   veut dire « jamais ouvert chez cet éditeur », **jamais** « absent ».
3. Avant de mettre un trait au compte d'un éditeur, vérifier qu'il ne vient pas
   du **texte réglementaire** — auquel cas il est chez tout le monde, et ne dit
   rien de personne.

---

## LE MÊME ENDROIT, CHEZ QUI — la table de correspondance

*Deux éditeurs de diagnostics lus — **LICIEL** et **BC2E** — plus un troisième
producteur d'un autre genre, le laboratoire **ITGA**, dont le rapport d'essai a
sa propre partie en fin de fichier. 22 endroits repérés. **Sur 44 cases, 9 sont
vides** : le référentiel n'est pas troué par négligence, il l'est parce que le
corpus est aux neuf dixièmes LICIEL.*

### Où le volet commence et finit

| L'endroit | **LICIEL** | **BC2E** |
|---|---|---|
| Nom de l'éditeur | métadonnée PDF seule — **et elle ment dès qu'un tiers a rouvert le fichier** | **pied de page, en clair** : « membre du réseau BC2E » |
| Titre du volet | en tête de chaque page : `Constat de repérage Amiante n° …` · `Dossier Technique Amiante n° …` · `Dossier Amiante – Parties privatives n° …` · `Repérage Amiante - Travaux n° …` — **se coupe parfois en deux lignes** | **aucun titre courant** ; le pied fait tout : `AMIANTE (DTA) : 3 sur 10` |
| Un fichier = | tout le DDT, volets à la suite | **un fichier par volet**, nommé d'après la mission (`…-dta.pdf`, `…-dapp.pdf`) |
| Longueur déclarée du volet | `Pagination : … est constitué de N pages` — **page 1 ou page 2 selon la version** | non mesuré |
| Pagination du volet | `1 / 15` en pied, propre au volet | `AMIANTE (DTA) : 1 sur 10` en pied |
| Pagination du dossier entier | `Rapport DDT : page 18 / 47` (vu chez un confrère) | non mesuré |

### Où la conclusion se lit

| L'endroit | **LICIEL** | **BC2E** |
|---|---|---|
| **Où elle est** | § 1, **page 2** du volet | bloc `A - CONCLUSIONS DU REPÉRAGE EFFECTIF`, **page 1** |
| **Comment elle est numérotée** | `1.1 Liste A :` puis `1.1 Liste B :` — **le même numéro deux fois** (`1.1.` seul en DAPP et en RAAT) | **pas de numéro** : des lettres, `A`, `B`, `C` |
| **Combien d'états** | **neuf**, portés par des lignes à tiret — **jusqu'à quatre dans un seul § 1.1** | **six**, portés par des phrases entières |
| **Ce qui tranche** | la fin de la ligne à tiret : `contenant de l'amiante` vs `pour lesquels des sondages…` vs `ayant fait l'objet d'analyse, ne contenant pas` | le milieu de la phrase : `contenant` vs `susceptibles de contenir` |
| **L'état « non conclu »** | `pour lesquels des sondages et/ou prélèvements doivent être effectués` · `pour lesquels les résultats d'analyse sont attendus` | `PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE.` · `pour lesquels des sondages et/ou des prélèvements doivent être effectués` |
| **Le piège commun** | `il a été repéré` ouvre présence, absence prouvée **et** non-conclu | idem, avec `susceptibles de contenir … ils ne contiennent pas d'amiante` |
| Localisation des matériaux | `<Description> (<Localisation>) pour lequel il est recommandé de …` | `<Local> (<Composant>) : <Localisation>` |
| Seconde conclusion, ailleurs | **oui** : la page `Résumé de l'expertise` du DDT, en d'autres mots (4 formes) | non mesuré (un fichier par volet : pas de page de synthèse) |

### Où l'on voit ce qui n'a pas été regardé

| L'endroit | **LICIEL** | **BC2E** |
|---|---|---|
| Rubrique | **un** tableau, § 1.2 : `Localisation` · `Parties du local` · `Raison` | **trois** tableaux distincts : `LOCAUX NON VISITES` · `ÉLÉMENTS NON EXAMINÉS` · `Matériaux … investigations complémentaires` |
| Rubrique vide | `Néant -` | `Néant Néant Néant` |
| Colonnes entrelacées | **oui** — les autres colonnes s'impriment au milieu d'une localisation longue | non mesuré |
| Clause de style à écarter | **oui** — le bloc « Le diagnostic se limite aux zones rendues visibles… » | non mesuré |
| Conséquence juridique imprimée | **oui**, et seulement si la rubrique n'est pas vide ; **variante DTA sans les vices cachés** | **oui**, autre rédaction, **sans** mention du vendeur |
| Engagement de revenir | non mesuré | **oui** : « BC2E s'engage à venir visiter […] dans les quinze jours calendaires » |

### Où l'on voit le détail des matériaux

| L'endroit | **LICIEL** | **BC2E** |
|---|---|---|
| Tableau de ce qui a été **regardé** | § 5.0.1 / 5.0.2 (absents en DAPP et en RAAT) — ⚠️ **`Néant -` dans les volets négatifs**, voir plus bas | § 4.1 / 4.2 / 4.3 |
| Liste des **pièces visitées** | **§ 3.2.6**, `Descriptif des pièces visitées` — le seul inventaire de ce qui a été VU | non mesuré |
| Tableau de ce qui **contient** de l'amiante | § 5.1, **avec des sous-listes après le renvoi en astérisque** | § 5.1 / 5.2 / 5.3 (conclusions et recommandations) |
| Forme des valeurs | **texte en clair** : `Présence d'amiante (Sur jugement personnel)` | **sigles**, avec la légende imprimée sous le tableau : `JPOR` `MM` `DOC` `RASP` `MPPNCA` `MPSCA` |
| Colonne « y a-t-il de l'amiante » | mêlée à la justification | **colonne `Amiante` séparée** : `NON` · `Susceptible` · `Analyse` |
| Nomenclature du composant | courte : `Conduits` | **chemin complet de l'annexe 13-9** : `Conduits, canalisations, et équipements intérieurs / Conduit de fluide / Conduits` |
| État de conservation | `Matériau non dégradé` · `dégradé (étendue ponctuelle)` · `en décollement` · `Produit en mauvais état` | non mesuré |
| Résultat de cotation | `Résultat EP` (75 fois) · `Score 3` (2 fois) ; `Score 1`, `Score 2`, `AC1`, `AC2` **jamais** | `AC1` rencontré ; `score = 1/2/3` et `EP` `AC1` `AC2` `Aucune` définis en légende |
| Zone de similitude d'ouvrage | non mesuré | **oui**, § 4.4 |

### Où l'on voit ce que vaut la preuve

| L'endroit | **LICIEL** | **BC2E** |
|---|---|---|
| Laboratoire | § 2, rempli 3 fois sur 130 : ITGA · Eurofins LEM · PROTEC | § 1, `- -` quand vide ; `Aucune analyse effectuée` en DAPP |
| Accréditation Cofrac | champ présent, **souvent laissé vide alors que le labo est nommé** | non mesuré |
| Modalité d'analyse | annexe 7.2 : `Analyse à réaliser: Toutes les couches (1 à 1)` **ou `mélangées`** | non mesuré |
| Ce que le rapport contient | non mesuré | **§ 9, check-list** : `Schéma de repérage : oui` · `Rapports d'analyses : non` · `Copie de l'attestation d'assurance : présent` |
| Date du permis de construire | non mesuré (seulement `Date de construction : < 1949`) | **§ 2.2.7** : `Non précisée (antérieur au 1er juillet 1997 sur déclaration du mandataire)` |
| Écarts à la norme NF X 46-020 | non mesuré | **§ 6**, rubrique dédiée |

### Où le droit est imprimé — et ce que sa présence prouve

| | **LICIEL** | **BC2E** |
|---|---|---|
| Texte réglementaire en annexe | **imprimé dans 100 % des volets**, positifs comme négatifs | **imprimé seulement s'il y a un positif** |
| Conséquence | `retrait`, `Score 3`, `cinq fibres par litre` sont du **bruit** | ces mêmes mots en page 1 sont un **signal** |

⚠️ **C'est la ligne la plus importante de la table.** Le même mot, au même
endroit d'un rapport, ne prouve pas la même chose selon l'éditeur. Un lecteur
qui cherche des mots plutôt que des cases se trompe forcément chez l'un des
deux.

### Ce que les deux éditeurs font pareil — les seuls traits promus au métier

Deux traits seulement ont été mesurés **chez les deux**, et eux seuls peuvent
être dits du métier plutôt que du logiciel :

| Trait | LICIEL | BC2E |
|---|---|---|
| **Le sommaire annonce moins de rubriques que le corps** | ✅ (DTA : 3 annoncées au § 4, 4 imprimées) | ✅ (`8.1`, `8.2` annoncées, `8.3` imprimée) |
| **Une phrase d'ouverture identique introduit des conclusions opposées** | ✅ (`il a été repéré` → présence, absence prouvée, non conclu) | ✅ (`il a été repéré des matériaux susceptibles…` → absence) |

**Tout le reste est l'habitude d'un logiciel.**

---

## Avant tout : l'amiante n'est pas UN rapport, c'est QUATRE missions

C'est le premier fait de la lecture, et il commande tout le reste. Même
éditeur, même gabarit, mêmes numéros de paragraphes — et pourtant **la
conclusion ne se numérote pas pareil, le § 4.3 ne porte pas la même rubrique,
et le § 5.0 n'existe pas dans toutes les missions.** *(Mesuré chez LICIEL.)*

*Mesuré **chez LICIEL** pour les quatre missions ; **chez BC2E** pour le DTA et
le DAPP seulement — son constat de vente et son RAAT n'ont jamais été ouverts.*

| Mission | Titre courant, en tête de chaque page (LICIEL) | Sous-titre de la page 1 (LICIEL) | Textes cités |
|---|---|---|---|
| **Vente** | `Constat de repérage Amiante n° …` | « pour l'établissement du constat établi à l'occasion de la **vente** d'un immeuble bâti » | L. 1334-13, R. 1334-20 et 21, R. 1334-23 et 24 |
| **DTA** (parties communes, tertiaire) | `Dossier Technique Amiante n° …` | « à intégrer au **dossier technique « amiante »** » | R. 1334-**17, 18**, 20 et 21, R. 1334-23 et 24 |
| **DTA, variante ancienne** | `Constat de repérage Amiante n° …` | idem DTA | idem DTA |
| **DAPP** (parties privatives) | `Dossier Amiante – Parties privatives n° …` | « des matériaux et produits **de la liste A** à intégrer au « Dossier Amiante – Parties Privatives » » | **R. 1334-16** |
| **Avant travaux** (RAAT) | `Repérage Amiante - Travaux n° …` | « …dans les immeubles bâtis **avant réalisation de travaux** » | **code du TRAVAIL** : L. 4412-2, décret 2017-899, arrêté du 16 juillet 2019 |

⚠️ **Le titre courant ne suffit pas à reconnaître la mission** : un DTA de 2021
porte `Constat de repérage Amiante`, un DTA de 2025 porte
`Dossier Technique Amiante`. **C'est le sous-titre de la page 1 qui statue**,
lui seul, et il tient sur deux ou trois lignes juste sous le titre.

⚠️ **L'avertissement de tête ne dit PAS la mission — il dit ce qu'elle n'est
pas.** Le paragraphe « la présente mission de repérage **ne répond pas** aux
exigences prévues pour les missions […] avant démolition d'immeuble **ou avant
réalisation de travaux** » est imprimé dans **toutes** les missions ci-dessus.
Chercher « avant réalisation de travaux » pour reconnaître un repérage avant
travaux écarte donc exactement l'inverse de ce qu'on vise — c'est le défaut qui
a fait examiner 568 candidats sans en retenir un (journal, 20/08).

### Ce que la mission change, en un tableau

| | Vente | DTA | DAPP |
|---|---|---|---|
| Conclusion | `1.1 Liste A :` **puis** `1.1 Liste B :` | idem | **`1.1.` seul**, sans liste |
| Listes couvertes | A **et** B | A **et** B | **A seule** |
| Textes cités en tête | L. 1334-13, R. 1334-20 et 21 | R. 1334-17, 18, 20 et 21 | **varie** : tantôt L. 1334-13 + R. 1334-20 et 21, tantôt R. 1334-16 et 17 |
| § 5.0.1 / 5.0.2 (matériaux repérés) | présents | présents | **absents** |
| § 5.3 (non-amiante sur justificatif) | **absent** | présent | présent |
| Phrase de responsabilité au § 1.2 | finit par « …le vendeur reste responsable au titre des vices cachés » | **s'arrête à `(Listes "A" et "B")`** | non mesuré |
| Annexe 7.5 | « Documents annexés » | « Recommandations générales de sécurité » (pousse les documents en 7.6) | non mesuré |
| Pagination déclarée | « …, la conclusion est située en page 2 » | sans cette fin de phrase | sans cette fin de phrase |

---

---

# LICIEL


*Lectures : **65 volets** — constats de vente, DTA, DAPP et 5 RAAT. Signature
`iTextSharp™ 5.4.0` dans les dix cas ; la version du **moteur DPE**
(TribuEnergie 1.4.2x, BBS Slama 2024.6.1.0) ne dit rien de la mise en page du
volet amiante. Un DDT sur trois ne déclare aucun logiciel : la signature PDF
est alors le seul nom disponible.*

## Le volet se borne tout seul — trois marques, et la meilleure est un compte

1. **Le titre courant**, répété en tête de **chaque** page du volet (`Constat de
   repérage Amiante n° …`, `Dossier Technique Amiante n° …`,
   `Dossier Amiante – Parties privatives n° …`, `Repérage Amiante - Travaux
   n° …`). C'est la borne de gauche et de droite : la page qui ne le porte plus
   n'est plus dans le volet.

   ⚠️ **Le titre courant se coupe en deux lignes** dans certains rapports :
   `Dossier Amiante –` puis, ligne suivante, `n° 25/IMO/0417`. Chercher le titre
   entier échoue alors sur toutes les pages du volet — et le volet devient
   invisible. **On borne sur le début du titre (`Dossier Amiante`, `Constat de
   repérage Amiante`, `Repérage Amiante`), jamais sur la ligne complète.**
2. **La pagination propre au volet**, en pied : `1 / 15`, `2 / 15`… Chaque volet
   du dossier repart à `1` et compte **ses** pages, pas celles du DDT.
3. **Le volet déclare sa propre longueur**, en page 1 :

```
Pagination : le présent rapport avec les annexes comprises, est constitué de 15 pages,
la conclusion est située en page 2.
```

⚠️ **C'est le seul endroit du corpus où un volet dit combien il doit peser.** Il
donne un contrôle qu'aucun autre diagnostic n'offre : si l'extraction ne rend
pas ce nombre de pages, il manque quelque chose — et un rapport tronqué se lit
autrement comme un rapport sans défaut.

⚠️ **Le pied de page change de raison sociale d'un rapport à l'autre** —
`SARL DGLM EXPERTISES | 76 COURS PORTAL…`, `DGLM EXPERTISES | 76 cours Portal…`,
`SARL DGLM EXPERTISES | 27 TER RUE DES SABLES…` — et l'assureur avec
(`MMA`, `ALLIANZ`, `KLARITY`). Le pied n'est donc pas une constante à écarter en
dur : il se reconnaît à sa **forme** (`… | Tél. : …` puis `RCS`/`N°SIREN`), pas à
son contenu.

## § 1 · « Les conclusions » — l'endroit qui statue

**Bornes** : commence à la ligne `1. – Les conclusions` (parfois `1 . – Les
conclusions`), finit à `2. – Le(s) laboratoire(s) d'analyses`.

### ⚠️ En vente et en DTA, les deux listes portent le MÊME numéro

```
1.1 Liste A : Dans le cadre de mission décrit à l'article 3.2 , il n'a pas été repéré
- de matériaux ou produits de la liste A contenant de l'amiante.
1.1 Liste B : Dans le cadre de mission décrit à l'article 3.2 , il a été repéré :
- des matériaux et produits de la liste B contenant de l'amiante sur jugement personnel :
```

**`1.1` deux fois — jamais `1.1` puis `1.2`.** Le § 1.2 existe, mais c'est celui
des locaux non visités. Un lecteur qui découpe sur le numéro fond les deux
listes en une seule et perd la liste B, **qui porte tous les résultats positifs
lus jusqu'ici**. On découpe sur `Liste A :` / `Liste B :`, jamais sur le numéro
— d'autant qu'un rapport lu écrit `1. 1 Liste B` (espace au milieu du numéro).

**En DAPP il n'y a qu'un seul § 1.1, et il ne nomme aucune liste :**

```
1.1. Dans le cadre de mission décrit à l'article 3.2, il n'a pas été repéré de matériaux ou produits
contenant de l'amiante.
```

### ⚠️⚠️ NEUF états de la réponse, et non deux

Le § 1.1 s'ouvre toujours de la même façon — `Dans le cadre de mission décrit à
l'article 3.2, il [n']a [pas] été repéré` — puis **une ligne à tiret** qui porte
tout le sens. En voici les neuf formes rencontrées — **et un même § 1.1 peut en porter
quatre à la fois**, une par ligne à tiret :

| La ligne à tiret | Ce que ça veut dire |
|---|---|
| `- de matériaux ou produits de la liste X contenant de l'amiante.` (précédé de `il n'a pas`) | **rien** |
| `- des matériaux et produits de la liste X contenant de l'amiante sur jugement personnel :` | **amiante** |
| `- des matériaux et produits de la liste X contenant de l'amiante sur jugement de l'opérateur :` | **amiante** |
| `- des matériaux et produits de la liste X contenant de l'amiante sur décision de l'opérateur :` | **amiante** |
| `- des matériaux et produits de la liste X pour lesquels des sondages et/ou prélèvements doivent être effectués :` | **non conclu** — rien n'a été prélevé |
| `- des matériaux et produits de la liste X pour lesquels les résultats d'analyse des sondages et/ou prélèvements sont en attente :` | **non conclu** — le laboratoire n'a pas rendu |
| `- des matériaux et produits de la liste A ayant fait l'objet d'analyse, ne contenant pas d'amiante :` | **rien**, mais **prouvé** |
| `- des matériaux et produits de la liste B contenant de l'amiante après analyse en laboratoire :` | **amiante**, **prouvée** |
| `- des matériaux et produits de la liste X contenant de l'amiante sur anciennes analyses :` | **amiante**, sur une pièce **non jointe** |

**Cinq de ces huit lignes commencent par `- des matériaux et produits de la
liste X`**, et trois d'entre elles ne disent PAS qu'il y a de l'amiante. Le mot
qui tranche arrive après le nom de la liste :

- `contenant de l'amiante` → **présence** ;
- `pour lesquels des sondages…` / `pour lesquels les résultats…` → **non
  conclu** ;
- `ayant fait l'objet d'analyse, ne contenant pas d'amiante` → **absence**.

⚠️ La dernière est la plus traître : elle contient `contenant de l'amiante`
précédé de `ne … pas`, séparés par un retour à la ligne dans plusieurs volets.

**Chaque forme est suivie d'une ligne par matériau**, dont la fin change avec
l'état : `pour lequel il est recommandé de réaliser une évaluation périodique.`
pour une présence, `/ Non prélevé pour ne pas altérer sa fonction)` ou
`/ En attente des résultats d'analyse)` pour un non-conclu.

La ligne de matériau a une forme fixe :

```
Revêtements durs (amiante - ciment) (RDC - Chambre 3) pour lequel il est recommandé de réaliser une
évaluation périodique.*
```

soit **`<Description> (<Localisation>) pour lequel il est recommandé de <préconisation>.`**
— et elle **passe à la ligne au milieu** ; la préconisation se lit donc sur deux
lignes, jamais sur une.

⚠️ **La fin de la ligne a une seconde forme**, qui donne le sigle au lieu de la
phrase :

```
Conduits dont l'état de conservation est : EP
```

soit `<Description> dont l'état de conservation est : <EP|AC1|AC2>`. Un lecteur
qui attend « pour lequel il est recommandé de » perd le matériau entier. Suit un astérisque de renvoi de quatre lignes
(« il est rappelé la nécessité d'avertir de la présence d'amiante toute personne
pouvant intervenir… ») qui n'est imprimé **que** s'il y a un positif.

⚠️ **`il n'a pas été repéré` et `il a été repéré` partagent la même fin de
phrase.** Le seul caractère qui les sépare est le `n'` — et le corpus l'écrit
tantôt `n'`, tantôt `n’`. Chercher `a été repéré` rend VRAI dans les deux cas.

## § 1.2 · Les locaux non visités — une rubrique vide est un résultat

**Intitulé exact** : `1.2. Dans le cadre de mission décrit à l'article 3.2 les
locaux ou parties de locaux, composants ou parties de composants qui n'ont pu
être visités et pour lesquels des investigations complémentaires sont
nécessaires afin de statuer sur la présence ou l'absence d'amiante :`

**Tableau à trois colonnes** — `Localisation` | `Parties du local` | `Raison`.
Vide, il porte `Néant -` sur une ligne.

⚠️ Une mention en capitales apparaît dans certains dossiers, hors de toute
rubrique numérotée : **`DIAGNOSTIC AMIANTE NON VALABLE POUR AVANT TRAVAUX /
DEMOLITION.`** C'est le même avertissement que celui du § 1, en plus court et en
plus visible — et il vaut d'être restitué tel quel, parce qu'un acquéreur qui
prévoit des travaux doit le lire.

**Motifs réellement rencontrés** : `Absence de trappe de visite`,
`Trappe de visite non accessible`, `Accès condamné`, `Encombrement trop
important`, `Revetement fixé`, `Impossibilité d'investigation approfondie non
destructive`, `Absence d'accès : préconisation de création d'accès sécurisé par
le propriétaire`, `Présence de meubles et objets non déplaçables`,
`Moyen d'accès insuffisant`, `Sécurité insuffisante pour se déplacer`,
`Absence de clé`, `Impossibilité d'entrer`, `Revêtements de sol collées`,
`Hauteur trop importante de la trappe d'accés (3m80)`.

⚠️ Le dernier montre que la colonne `Raison` porte parfois **une mesure** —
`(3m80)` — et non un motif de catalogue. On cite la raison telle quelle.

### ⚠️ Trois pièges dans ce seul tableau

**1. Une clause de style se glisse parmi les vraies observations.** *(Règle
resserrée après lecture plus large — voir « Correction » en fin de fichier :
c'est le bloc de six lignes qui est une clause, pas la mention « Ensemble du
bien ».)* Plusieurs volets lus portent, en plus des vraies pièces, une
ligne dont la colonne « Raison » tient six lignes et commence par « Le
diagnostic se limite aux zones rendues visibles et accessibles par le
propriétaire ». Elle est identique au caractère près d'un rapport à l'autre.
Compter les lignes du tableau, c'est compter cette clause comme une pièce non
visitée. **On lit la colonne `Localisation` : `Ensemble du bien` = clause.**

**2. La cellule « Raison » traverse le saut de page.** Vue coupée en plein
milieu d'une phrase : « Absence d'accès : préconisation de » / *pied de page,
en-tête de la page suivante* / « propriétaire. » Le tableau doit se recoller
avant d'être lu.

**3. Les colonnes s'entrelacent quand la localisation est longue.** Quand une
même raison vaut pour dix pièces, la colonne `Localisation` s'étale sur cinq
lignes et les deux autres colonnes sont imprimées **au milieu** :

```
3ème étage - Entrée / Dégagement, 3ème étage -
Chambre 1, 3ème étage - Chambre 2, 3ème étage
- Chambre 3, 3ème étage - Wc, 3ème étage -   Mur   Revetement fixé
Séjour, 3ème étage - Balcon, 3ème étage -
Cuisine, 3ème étage - Salle de bain
```

À la lecture ligne à ligne, `3ème étage - Mur` devient une pièce, et
`Revetement fixé` se rattache à la mauvaise. **Il faut la position
horizontale** (`lignesPositionnees`), comme au tableau des colonnes entrelacées
du CREP.

### La conséquence, imprimée seulement si la rubrique n'est pas vide

```
Certains locaux, parties de locaux ou composants n'ont pas pu être sondés, des investigations
approfondies doivent être réalisées […] Les obligations règlementaires du (des) propriétaire(s)
prévues aux articles R.1334-15 à R.1334-18 du Code de la Santé Publique, ne sont pas remplies
conformément aux dispositions de l'article 3 de l'arrêté du 12 Décembre 2012 (Listes "A" et "B").
De ce fait le vendeur reste responsable au titre des vices cachés en cas de présence d'Amiante.
En cas de présence d'Amiante, et si il y a obligation de retrait, ce dernier sera à la charge du
vendeur.
```

**Elle est présente exactement dans les volets dont le § 1.2 n'est pas
« Néant ».** C'est donc un vrai signal, et le seul endroit du volet qui tire la
conséquence juridique pour l'acquéreur. Elle mérite d'être citée telle quelle.

⚠️ **En DTA, la phrase s'arrête à `(Listes "A" et "B")`** : pas de vendeur, pas
de vices cachés. Le lecteur qui exige la fin de la phrase rate la moitié des
cas.

⚠️ Piège de motif déjà payé une fois (carnet § 15) : `R.1334-15 à R.1334-18`
contient **trois points**. Toute recherche en `[^.]*` coupe la phrase en trois.
Et la phrase **traverse un saut de page** dans plusieurs volets lus.

## § 2 · Le(s) laboratoire(s) d'analyses

Trois lignes à valeur unique, la première suffit :
`Raison sociale et nom de l'entreprise : ... Il n'a pas été fait appel à un
laboratoire d'analyse` — sinon le nom du labo et son `Numéro de l'accréditation
Cofrac`. **Jamais vu rempli en dix lectures** : tous les volets lus concluent
sur jugement, sans prélèvement.

## § 3.2.6 · Le périmètre de repérage effectif — DEUX blocs, pas un

1. **`Descriptif des pièces visitées`** : la liste des pièces, imprimée **sur
   deux colonnes**, ce qui donne à l'extraction des lignes du type
   `1er étage - Entrée, 2ème étage - Pallier,` — **deux pièces par ligne, et la
   colonne de droite n'est pas la suite de celle de gauche.**
2. **Un tableau `Localisation` | `Description`** qui décrit chaque pièce
   composant par composant (`Sol : Parquet et Bois`, `Mur A, B, C, D : plâtre et
   Peinture`, `Plafond : …`). C'est l'inventaire de ce qui a été regardé —
   plusieurs pages à lui seul dans une maison. Il vaut `Néant -` dans un volet
   lu, alors même que la liste des pièces au-dessus en compte onze.

⚠️ Ce tableau **n'est pas un constat** : il dit de quoi sont faits les
composants, jamais s'ils contiennent de l'amiante. Le mot `Divers` y est courant
et ne signifie rien de plus que « non identifié ».

⚠️ **Le champ `Périmètre de repérage` de la page 1 porte parfois l'exclusion
lui-même** : `Toutes parties accessibles sans démontage ni destruction, Cave non
accesible : Abscence de clef`. Il est aussi, dans deux volets lus, **entièrement
vide**.

## § 4 · Conditions de réalisation — ⚠️ le sommaire ment sur le corps

| | Ce que le **sommaire** annonce | Ce que le **corps** imprime |
|---|---|---|
| Vente | 4.1, 4.2, 4.3 Écarts, 4.4 Prélèvements | identique |
| DTA | 4.1, 4.2, **4.3 Plan et procédures de prélèvements** | **4.1, 4.2, 4.3 Écarts, 4.4 Plan et procédures** |

**Mesuré sur les trois DTA lus : le sommaire annonce trois sous-rubriques, le
corps en imprime quatre.** C'est la démonstration la plus nette de la règle
« l'endroit se prend dans le corps, jamais dans la table des matières ».

### § 4.2 · Ce que la rubrique donne, et qu'on ne trouve nulle part ailleurs

```
Date de la commande : 29/05/2025
Date(s) de visite de l'ensemble des locaux : 22/05/2025
Heure d'arrivée : 14 h 38
Durée du repérage : 03 h 40
Personne en charge d'accompagner l'opérateur de repérage : VOISIN
```

⚠️ `Durée du repérage` s'écrit aussi **`Temps passé sur site : 2H`** — autre
libellé, autre format d'heure (`03 h 40` contre `2H`).

⚠️ **La date de visite n'est pas la date du rapport.** Sur un volet lu, sept
jours les séparent — et la « date de la commande » y est **postérieure** à la
visite. Trois dates dans cinq lignes ; le produit n'en cite qu'une.

L'accompagnateur est une donnée de fait utile et jamais restituée :
`Mme <nom>`, `Agent immobilier`, `Locataire : Melle`, `Aucun accompagnateur`,
`Sans accompagnateur`.

### § 4.3 · Écarts — un formulaire à trois colonnes, et une case vaut réponse

```
Observations                                            Oui   Non   Sans Objet
Plan de prévention réalisé avant intervention sur site   -     -       X
Vide sanitaire accessible                                X
Combles ou toiture accessibles et visitables             X
```

⚠️ **La position du `X` seule dit la réponse** : sur les deux dernières lignes,
rien ne distingue `Oui` de `Non` dans le texte extrait — la colonne se lit à la
position horizontale, pas à l'ordre des mots. **Non lisible ligne à ligne : il
faut la position.**

⚠️ Ce formulaire est le **seul endroit** qui dise si les combles et le vide
sanitaire ont été vus — et il peut contredire le § 1.2, qui dit ailleurs que les
combles n'étaient pas accessibles. **Endroit de contrôle croisé.**

### § 4.4 · Deux phrases, et l'une peut mentir

| Ce qui est imprimé | Vu dans |
|---|---|
| `Aucun prélèvement n'a été réalisé.` | 9 volets sur 10 |
| `L'ensemble des prélèvements a été réalisé dans le respect du plan et des procédures d'intervention.` | 1 volet (DTA 2021) |

⚠️ Dans ce volet-là, **aucun prélèvement n'existe** : le § 2 dit qu'aucun
laboratoire n'a été saisi, l'annexe 7.2 dit « Aucun rapport d'essai n'a été
fourni ». La phrase est donc **fausse dans son propre rapport**. Ce n'est pas
une règle de gabarit (les deux autres DTA lus impriment « Aucun prélèvement ») :
c'est une case laissée à sa valeur par défaut. **On ne lit jamais « des
prélèvements ont été faits » à cet endroit sans vérifier le § 2 et l'annexe
7.2.**

## § 5 · Les résultats détaillés — jusqu'à cinq tableaux, et un seul conclut

| Rubrique | Intitulé **vente** | Intitulé **DTA** | DAPP | Ce qu'elle porte |
|---|---|---|---|---|
| 5.0.1 | `Liste des matériaux repérés de la liste A` | `Identification des matériaux repérés de la liste A` | **absente** | **tout** ce qui a été inspecté en liste A |
| 5.0.2 | `Liste des matériaux repérés de la liste B` | `Identification des matériaux repérés de la liste B` | **absente** | **tout** ce qui a été inspecté en liste B |
| 5.1 | `Liste des matériaux ou produits contenant de l'amiante, états de conservation, conséquences réglementaires (fiche de cotation)` | idem | présente | **les seuls positifs**, avec cotation |
| 5.2 | `Listes des matériaux et produits ne contenant pas d'amiante après analyse` | idem | présente | les négatifs **prouvés par analyse** |
| 5.3 | *absente* | `Liste des matériaux ou produits ne contenant pas d'amiante sur justificatif` | présente | négatifs prouvés sur pièce |

⚠️⚠️⚠️ **ET IL N'EST PAS DAVANTAGE UN INVENTAIRE DE CE QUI A ÉTÉ REGARDÉ.**

*Correction du 22/08/2026, mesurée en sondant le corpus DGLM sur la chaîne
entière.* La ligne d'en-tête de ce document annonçait que les § 5.0.1 / 5.0.2
portent « **tout** ce qui a été inspecté » en liste A ou B. **Les volets
négatifs le démentent** : les deux tableaux y répondent

```
5.0.1 Liste des matériaux repérés de la liste A
Localisation  Identifiant + Description  Conclusion (justification)  Etat de conservation  Commentaires
Néant -
Aucun autre matériau de la liste A n'a été repéré dans périmètre de repérage mentionné au paragraphe 3.2.6
```

— et ils renvoient eux-mêmes au § 3.2.6. Le § 5.0.x ne liste donc que ce que
l'opérateur a **retenu**, pas ce qu'il a **parcouru**. Y chercher les
« éléments contrôlés » du visuel, c'est chercher dans le seul tableau qui se
tait précisément quand il n'y a rien à déclarer — c'est-à-dire dans la
très grande majorité des cas.

**L'inventaire de ce qui a été vu est au § 3.2.6**, et nulle part ailleurs :
`Descriptif des pièces visitées`, imprimé **sur deux colonnes**, deux pièces par
ligne, refermé par l'en-tête `Localisation Description` du tableau des
composants. Une pièce s'y reconnaît à sa forme — `<niveau> - <pièce>` — et non
à son nom : c'est une signature positive, et le pied de page (`SARL … | Tél.`,
`3 / 14`, `Rapport du :`) tombe alors de lui-même. Lu par
`perimetreDe()` dans `src/lib/lecteurs/amiante/liciel.ts`.

⚠️⚠️ **Le piège central du volet amiante : le § 5.0.2 n'est pas une liste
d'amiante.** C'est la liste de ce que l'opérateur a *retenu* en liste B, et sa
colonne `Conclusion (justification)` porte aussi bien la présence que l'absence.
Vu dans les dix volets lus :

| Ce que porte la colonne | Ce que ça veut dire |
|---|---|
| `Présence d'amiante (Sur jugement personnel)` | **positif**, sans analyse |
| `Présence d'amiante (Sur décision de l'opérateur)` | **positif**, sans analyse |
| `Absence d'amiante (sur jugement de l'opérateur)` | **négatif**, sans analyse |
| `Matériau ou produit qui par nature ne contient pas d'amiante` | négatif d'office (PVC, métal) |
| `Susceptible de contenir de l'amiante (Non prélevé pour ne pas altérer sa fonction)` | **non conclu** |
| `En attente des résultats d'analyse` | **non conclu**, laboratoire saisi |
| `Néant -` | rien d'inspecté en liste B |

**Compter les lignes de ce tableau, c'est annoncer de l'amiante là où
l'opérateur a écrit qu'il n'y en a pas** — et la formulation de l'absence
contient le mot `amiante` comme celle de la présence, à un préfixe près
(`Présence` / `Absence`), lui-même coupé de sa justification par un saut de
ligne. C'est la faute qui a fait annoncer de l'amiante à dix-sept logements
(carnet § 27), reprise ici sur son vrai terrain.

⚠️ **La justification change de mots sans changer de sens** :
`Sur jugement personnel`, `sur jugement de l'opérateur`, `Sur décision de
l'opérateur` — trois formes en dix lectures, même éditeur, même gabarit. **On ne
liste pas les formes : on lit ce qui précède, `Présence` ou `Absence`.**

⚠️ **Le même matériau est compté dans deux tableaux.** Un `M001` conclu « par
nature ne contient pas d'amiante » figure au § 5.0.2 **et** au § 5.3. Sommer les
tableaux double le compte.

### ⚠️ Le troisième état : « susceptible », et LICIEL le porte aussi

Il était écrit plus haut que LICIEL n'a que deux issues et que seul BC2E sait
dire « on ne sait pas encore ». **Une lecture plus large l'a démenti.** Un
constat LICIEL lu porte, au § 1.1 Liste B, une troisième forme :

```
- des matériaux et produits de la liste B pour lesquels des sondages et/ou prélèvements doivent être
effectués :
```

⚠️ **Cette phrase ne contient ni « contenant de l'amiante » ni « il n'a pas été
repéré ».** Elle échappe donc aux deux motifs qui servent à lire la conclusion,
et un lecteur qui n'a que deux cases range ce rapport dans « rien trouvé ».

Le § 5.1 la reprend dans une **sous-liste propre**, sous le tableau des
positifs :

```
Listes des matériaux pour lesquels des sondages et/ou prélèvements doivent être effectués :
Identifiant: M002
Description: Conduits
Liste selon annexe.13-9 du CSP: B     Susceptible de contenir de l'amiante
                                      (Non prélevé pour ne pas altérer sa fonction)
```

**Une quatrième valeur pour la colonne `Conclusion (justification)` :**
`Susceptible de contenir de l'amiante (Non prélevé pour ne pas altérer sa
fonction)`. Le motif de non-prélèvement est écrit — c'est ce qu'un acquéreur a
besoin de lire, et c'est exactement ce qu'un compteur de lignes perd.

### Le § 2 change d'intitulé, lui aussi

| Intitulé | État vide |
|---|---|
| `2. – Le(s) laboratoire(s) d'analyses` | `Il n'a pas été fait appel à un laboratoire d'analyse` |
| `2. – Analyses chimiques du laboratoire` | `Aucune analyse chimique n'a été réalisée en laboratoire.` |

Deux rédactions pour la même rubrique, chez le même éditeur.

### Ce que la localisation peut porter d'autre

`R+1 - Salle de bain; R+1 - Cuisine` — **plusieurs pièces dans une seule cellule,
séparées par un point-virgule**. Et le champ `Type de logement` ne dit pas
toujours un logement : `Cave`, `Bureaux > 300 m²`, `Local commercial mixte en
copropriété`, `Parties communes`, `Pavillon individuel`, `Appartement - T3`.
Le champ `Fonction principale du bâtiment` prend alors `Autres`, `Commerce`,
`Bureaux`.

### ⚠️⚠️⚠️ Le § 5.1 a des SOUS-LISTES, et le tableau principal peut dire « Néant » pendant qu'elles alertent

C'est le piège le plus grave rencontré, et il est l'exact inverse de celui du
§ 5.0.2 : là où le § 5.0.2 sur-annonce, **le § 5.1 sous-annonce**.

Vu dans un constat de vente d'un local commercial :

```
5.1 Liste des matériaux ou produits contenant de l'amiante, … (fiche de cotation)
Matériaux ou produits contenant de l'amiante
Localisation   Identifiant + Description   Conclusion (justification)   Etat de conservation** et préconisations*
Néant -                                                     ← le tableau principal est VIDE
* Un détail des conséquences … ** détails fournis en annexe 7.3 …

Listes des matériaux pour lesquels des résultats d'analyse sont attendus :   ← SOUS-LISTE
Localisation              Identifiant + Description        Justification            Etat de conservation et préconisations
RDC - Salle restaurant 1  Identifiant: ZPSO-001-P001       En attente des           Produit en mauvais état
RDC - Wc 1                Description: Faux plafonds       résultats d'analyse      Souligne_Score 3**
                          Liste selon annexe.13-9 du CSP: A                         Il faut faire réaliser des travaux
                                                                                    de retrait ou de confinement
                                                                                    des faux plafonds.
```

**Le tableau principal dit `Néant`. La sous-liste dit : faux plafonds de liste A,
produit en mauvais état, Score 3, travaux de retrait ou de confinement — en
attente d'analyse.**

Un lecteur qui s'arrête au tableau principal conclut « aucun matériau amianté »
sur un local dont le faux plafond est en mauvais état et coté Score 3.

**Deux sous-listes connues, toutes deux imprimées APRÈS le renvoi en astérisque
du tableau principal** (`* Un détail des conséquences… ** détails fournis en
annexe 7.3…`), ce qui les fait passer pour du hors-tableau :

| Intitulé de la sous-liste | Colonnes |
|---|---|
| `Listes des matériaux pour lesquels des sondages et/ou prélèvements doivent être effectués :` | Localisation · Identifiant + Description · Justification · Etat et préconisations · Photo |
| `Listes des matériaux pour lesquels des résultats d'analyse sont attendus :` | idem |

⚠️ **Le renvoi en astérisque n'est donc pas la fin du § 5.1.** La borne du § 5.1
est `5.2 Listes des matériaux et produits ne contenant pas d'amiante après
analyse`, et rien d'autre.

⚠️ **L'identifiant change de forme** : `M001`, `M002`… dans les cas courants,
mais `ZPSO-001-P001` ici — l'identifiant de zone et de prélèvement. On ne
suppose pas la forme `M\d+`.

**Quatre valeurs d'état de conservation, mesurées :**
`Matériau non dégradé` (51) · `Matériau dégradé (étendue ponctuelle)` ·
`Matériau en décollement` · `Produit en mauvais état`.

**Et les résultats, mesurés sur toutes les fiches de cotation lues :**
`Résultat EP` **75 fois**, `Score 3` **2 fois**, `Score 1`, `Score 2`, `AC1`,
`AC2` **jamais** — ces quatre-là n'existent, dans ce corpus, que dans le texte
d'annexe. (Chez BC2E, `AC1` apparaît en revanche dans le tableau § 4.2.)

### L'annexe 7.2 dit COMMENT l'analyse est faite — et ce n'est pas neutre

```
ZPSO-001-P001  RDC - Wc 1  Calorifugeages, Faux plafonds  Faux plafonds
               Detail Couches à analyser: Dalle de faux plafond + carton
               Analyse à réaliser: Toutes les couches mélangées
```

Deux modalités rencontrées : **`Toutes les couches (1 à 1)`** et **`Toutes les
couches mélangées`**. Ce n'est pas la même analyse — mélanger les couches peut
diluer la couche amiantée dans les autres. **C'est l'endroit qui dit ce que le
résultat vaut**, et il n'est nulle part ailleurs.

### § 5.1 · La fiche de cotation — l'endroit qui dit la gravité

Colonnes : `Localisation` | `Identifiant + Description` | `Conclusion
(justification)` | `Etat de conservation** et préconisations*` | `Photo`.

```
                                        Matériau non dégradé
Identifiant: M001                       Résultat EP**
Description: Revêtements durs (amiante-ciment)
Liste selon annexe.13-9 du CSP: B       Préconisation : Il est recommandé de réaliser
                                        une évaluation périodique.
```

Trois informations empilées dans **une seule cellule**, dans cet ordre :

1. **l'état** — `Matériau non dégradé` / `Matériau dégradé (étendue ponctuelle)` ;
2. **le résultat de cotation** — `Résultat EP` (évaluation périodique), et
   d'après l'annexe 7.4 : `AC1` (action corrective de premier niveau) et `AC2`
   (second niveau) pour la liste B, `Score 1 / 2 / 3` pour la liste A ;
3. **la préconisation en clair** — `Il est recommandé de réaliser une évaluation
   périodique.`

⚠️ **Un matériau dégradé peut rester en EP.** Un volet lu porte
`Matériau dégradé (étendue ponctuelle)` → `Résultat EP`. La dégradation ne
commande pas seule le résultat : **lire le résultat, jamais le déduire de
l'état.**

⚠️ Le § 5.0.2 porte le même résultat sous une forme codée —
`EP (Z - III - RF)`, `EP (Z - II - RF)` — dont la partie entre parenthèses n'est
expliquée nulle part dans le rapport. **Non élucidé** ; à ne pas restituer tant
qu'on ne sait pas ce qu'elle dit.

## § 7 · Les annexes — ⚠️ le plus gros piège du volet

Le volet imprime **le texte réglementaire intégral** en annexe, à l'identique,
que le logement porte de l'amiante ou non :

- 7.3 — les grilles d'évaluation des listes A et B, avec les trois degrés
  d'exposition aux **circulations d'air**, aux **chocs et vibrations**, et les
  trois niveaux de risque de dégradation ;
- 7.4 — les articles **R. 1334-27, R. 1334-28, R. 1334-29 et R. 1334-29-3** in
  extenso, avec `Score 1`, `Score 2`, `Score 3`, le seuil de **cinq fibres par
  litre**, le délai de **trente-six mois**, et le détail de `EP` / `AC1` / `AC2`.

**Tout le vocabulaire de la gravité vit donc dans le volet même quand rien n'a
été trouvé** : « travaux de confinement ou de retrait », « mesure
d'empoussièrement », « Score 3 », « action corrective de second niveau ». Un
lecteur qui cherche ces mots dans le volet les trouve dans **100 %** des
rapports. C'est la leçon des six domaines de l'électricité (carnet § 16),
appliquée à l'amiante — et elle est ici plus dangereuse, parce que les mots sont
plus alarmants.

**Bornes de l'annexe** : elle commence à la page dont la première ligne utile
est `ANNEXES` suivie de `Au rapport de mission de repérage n° …`, et court
jusqu'à la fin du volet. **Rien de ce qui est cité ne doit provenir d'après
cette ligne** — sauf les grilles remplies, ci-dessous.

### 7.3 · La seule chose lisible dans l'annexe : la grille REMPLIE

Deux états, et ils se distinguent sur une ligne :

| Vide | `Grilles d'évaluation […] de la liste A` puis `Aucune évaluation n'a été réalisée` |
|---|---|
| Remplie | un petit formulaire à six lignes, avant les critères |

```
Grilles d'évaluation de l'état de conservation des matériaux ou produit de la liste B
Dossier n° 21/IMO/0046
Date de l'évaluation : 07/08/2021
Bâtiment / local ou zone homogène : Rez de chaussée - Arriere cuisine
Identifiant Matériau : M001
Matériau : Conduits
Résultat EP : Il est recommandé de réaliser une évaluation périodique.
```

⚠️ **`Date de l'évaluation` est une quatrième date**, distincte de la visite, de
la commande et de l'émission du rapport.

### 7.2 · Rapports d'essais — et les photos qui ne prouvent rien

`Identification des prélèvements :` puis un tableau à cinq colonnes, `- - - - -`
quand il est vide, puis `Copie des rapports d'essais : Aucun rapport d'essai n'a
été fourni ou n'est disponible`.

⚠️ Le bloc `Photos` qui le précède (`Photo n° PhA001`, `Localisation`,
`Ouvrage`, `Partie d'ouvrage`, `Description`) **existe aussi pour un matériau
conclu SANS amiante** : un volet lu photographie un conduit de cave dont la
conclusion est « Absence d'amiante ». Une photo n'est pas un positif. Quand il
n'y en a pas, la page porte `Aucune photo/illustration n'a été jointe à ce
rapport.`

---

## Le DTA n'est pas un rapport : c'est un CLASSEUR — et ses numéros se heurtent

Le `Dossier Technique Amiante` de 2025 contient le constat comme **partie 1**,
puis sept parties de plus, listées en page 2 :

```
1. Rapport de mission de repérage des matériaux et produits contenant de l'amiante
   à intégrer au Dossier technique amiante
2. Résultat des évaluations périodiques
3. Suivi des travaux de retrait et de confinement de l'amiante
4. Fiche récapitulative du Dossier technique amiante
   Recommandations générales de sécurité du dossier technique amiante
```

Le corps, lui, numérote autrement que ce sommaire (encore) :

| § du classeur | Intitulé | Forme |
|---|---|---|
| 2 | `Rapports de repérage` | tableau : n° de rapport, date, société + opérateur, objet |
| 3 | `Liste des locaux ayant donnés lieu au repérage` | **une ligne par liste (A, B)** : locaux visités / pièces non visitées avec le motif entre parenthèses |
| 4.1 / 4.2 | `Matériaux et produits de la liste A / B de l'annexe 13-9 contenant de l'amiante` | la **fiche récapitulative** ; colonne finale `MESURES obligatoires associées` (liste A) ou `MESURES préconisées par l'opérateur` (liste B) |
| 5.1 / 5.2 / 5.3 | `Evaluation des matériaux […] liste A / liste B / hors liste A, B` | colonnes `Date de la visite`, `Matériaux`, `Localisation`, `Etat de conservation et préconisations`, `Mesures d'empoussièrement` |
| 6.1 / 6.2 / 6.3 | `Travaux de retrait ou de confinement – Mesures conservatoires` | `Nature des travaux`, `Date`, `Entreprises intervenantes`, `Résultats de l'examen visuel et mesures d'empoussièrement` |
| 7 | `Croquis et Photos` | |
| 8 | `Recommandations générales de sécurité du dossier technique amiante` | texte réglementaire long (dangerosité, code du travail, déchets) |

⚠️⚠️ **Les numéros du classeur et ceux du constat se heurtent dans le MÊME
PDF.** `4.1` vaut « Bilan de l'analyse documentaire » dans le constat et
« Matériaux de la liste A contenant de l'amiante » dans le classeur ; `5.1`
vaut « fiche de cotation » d'un côté et « Évaluation des matériaux de la liste
A » de l'autre. **Chercher un numéro dans le volet amiante d'un DTA, c'est
tomber sur deux rubriques différentes.** On borne d'abord la partie (par son
titre en toutes lettres), on cherche le numéro ensuite — ou mieux, on ne
cherche jamais le numéro.

⚠️ **Les tableaux 5.x et 6.x n'écrivent pas « Néant » quand ils sont vides** :
ils n'ont que leurs en-têtes. Le vide s'y lit à l'absence de ligne, pas à un
mot — contrairement aux 4.1/4.2 qui portent `Néant - -`.

⚠️ Le § 3 du classeur est **le troisième endroit** où les pièces non visitées
sont écrites (après le § 1.2 et le § 3.2.6 du constat), et le seul qui les range
par liste.

⚠️ Ce tableau porte, en notes de bas de tableau, **deux rappels réglementaires
imprimés en petit** qui disent la règle et non le constat :

```
(1) Tous les locaux doivent être obligatoirement visités.
(2) Pour les locaux non visités, permettre leur identification et en indiquer le motif
    (exemple : locaux inaccessibles, clefs absentes...) et, lorsqu'elle est connue,
    la date du repérage complémentaire programmé.
```

« locaux inaccessibles, clefs absentes » y est un **exemple du texte**, pas un
motif observé. Le confondre avec une observation, c'est inventer une pièce non
visitée.

### La page « Version du dossier » — le DTA se date lui-même

```
Version du dossier :
Révision        Date         Objet
Version initiale 21/08/2025  Établissement du Dossier Technique
À conserver même après destruction
```

C'est l'endroit qui dira, un jour, qu'un DTA a été mis à jour — **et le seul**.

---

## Les dialectes typographiques de LICIEL — quatre variables, indépendantes

Même éditeur, même `iTextSharp 5.4.0`, quatre façons d'écrire les mêmes mots.
**Mesuré sur les dix volets lus. Elles ne varient pas ensemble** : chaque
rapport tire sa combinaison.

| Variable | Formes rencontrées |
|---|---|
| Apostrophe | `l'amiante` (droite) · `l’amiante` (typographique) · **`l ’ amiante` (typographique entourée d'espaces)** |
| Tirets d'articles | `R. 1334 - 20`, `13 - 9` (espacés) · `R. 1334-20`, `13-9` (collés) |
| Guillemets | `(Listes "A" et "B")` · `(Listes “A” et “B”)` |
| Mots coupés à l'extraction | `rep érage`, `Descri ptif`, `insuf FISA nte`, `réglementai res`, `exigence s`, `Signatu res`, `c onsiste` |
| Numéros | `1.1` · `1. 1` · `1 . – Les conclusions` |

⚠️ **Aucun motif écrit dans un dialecte ne marche dans les autres**, et la
coupure de mot tombe **au hasard** : elle peut couper n'importe quel mot de
n'importe quelle rubrique. Toute recherche de texte dans ce volet doit donc
normaliser d'abord — apostrophes, guillemets, tirets, espaces multiples — et
**ne jamais dépendre d'un mot long resté entier**.

C'est le piège de l'apostrophe espacée (OU-PARSER, lecture 44) confirmé sur
l'amiante, et **il porte cette fois sur la phrase qui statue**
(`il n'a pas été repéré`), pas sur une rubrique secondaire.

---

## La page de synthèse du DDT — une seconde conclusion, en d'autres mots

Le DDT LICIEL ouvre sur un `Résumé de l'expertise n° …`, tableau
`Prestations` | `Conclusion`, ligne `Amiante` :

```
Amiante   Dans le cadre de la mission, il n'a pas été repéré de matériaux et produits
          susceptibles de contenir de l'amiante.
```

⚠️ **Ce n'est pas la phrase du volet** : le volet dit « de matériaux ou produits
de la liste A **contenant** de l'amiante », le résumé dit « **susceptibles de
contenir** ». Les deux endroits statuent, avec des mots différents, et le résumé
**fond les listes A et B en une seule ligne**. La page porte d'ailleurs son
propre avertissement : « Cette page de synthèse ne peut être utilisée
indépendamment du rapport d'expertise complet. »

**Quatre formes du résumé, mesurées :**

| Ce que le résumé imprime | État |
|---|---|
| `il n'a pas été repéré de matériaux et produits susceptibles de contenir de l'amiante.` | rien |
| `il a été repéré des matériaux et produits contenant de l'amiante.` | **amiante** |
| `susceptibles de contenir de l'amiante pour lesquels des sondages et/ou prélèvements doivent être effectués.` | **non conclu** |
| `Dans le cadre de la mission décrite en tête de rapport, il a été repéré des matériaux et produits susceptibles de contenir de l'amiante : après analyse, ils ne contiennent pas d'amiante.` | **rien** (RAAT) |

⚠️⚠️ **La quatrième est la phrase-piège de BC2E, mot pour mot, chez LICIEL.**
« Il a été repéré des matériaux et produits susceptibles de contenir de
l'amiante » suivi de « **après analyse, ils ne contiennent pas d'amiante** » :
une absence écrite avec les mots d'une présence, et **prouvée par le
laboratoire**. Le même piège chez deux éditeurs n'est plus une habitude de
logiciel — mais **deux éditeurs ne sont pas le métier** : c'est un trait
**mesuré chez les deux seuls éditeurs lus**, et il reste à vérifier chez le
troisième.

⚠️ Noter aussi l'ouverture : `Dans le cadre de la mission **décrite en tête de
rapport**` au lieu de `décrit à l'article 3.2`. Le renvoi lui-même change.

⚠️ La troisième ne commence pas par « il a été repéré » : la cellule du tableau
débute directement par « susceptibles de contenir ». **Le résumé aussi a trois
issues**, et la troisième n'a aucun mot commun avec les deux autres.

**Endroit de contrôle** : les deux conclusions doivent s'accorder. Un désaccord
entre le résumé et le § 1 du volet est une erreur grossière du rapport, du type
que l'ODM « génie des diags » demande de traquer.

---

## Une ligne neuve dans les rapports récents : la norme

Les volets de 2025 portent, sous les textes réglementaires de la page 1 :

```
Norme(s) utilisée(s)   Norme NF X 46 - 020 d'Août 2017 : Repérage des matériaux et produits
                       contenant de l'amiante dans les immeubles bâtis
```

Absente des volets DGLM de 2021 à 2023 lus — **mais présente dès 2020 chez un
cabinet confrère au même gabarit**. Ce n'est donc pas une nouveauté de calendrier
mais un trait de **version du logiciel**. Le bloc de tête s'intitule alors
`Références réglementaires **et normatives**`.

**C'est l'endroit qui dit sous quelle version de la norme le repérage a été
fait** — et donc ce qu'on peut en attendre.

---


---

## LA QUATRIÈME MISSION LICIEL : le repérage avant travaux (RAAT)


*Cinq RAAT lus le 21/08, tous LICIEL. **Ce n'est pas le même métier** : ni le
même code, ni les mêmes listes, ni le même § 5. Un lecteur écrit pour le constat
de vente n'en comprend pas une ligne.*

### Ce qui change tout : ce n'est plus le code de la santé publique

| | Constat de vente / DTA / DAPP | **RAAT** |
|---|---|---|
| Titre courant | `Constat de repérage Amiante n° …` | **`Repérage Amiante - Travaux n° …`** |
| Sous-titre | « …à l'occasion de la vente… » | **« …dans les immeubles bâtis avant réalisation de travaux »** |
| Code | **santé publique** — L. 1334-13, R. 1334-20 et 21 | **TRAVAIL — L. 4412-2** |
| Textes | arrêtés du 12 déc. 2012 et 26 juin 2013 | **décret n° 2017-899 du 9 mai 2017**, **arrêté du 16 juillet 2019 modifié** |
| Ce qu'on cherche | les **listes A et B** de l'annexe 13-9 | les **10 catégories** de l'annexe 1 de l'arrêté du 16 juillet 2019 |
| Périmètre | le bien | **la zone impactée par les travaux** |
| § 5 | 5.0.1 / 5.0.2 / 5.1 / 5.2 / (5.3) | **5.1 par catégorie · 5.2 zone par zone** |
| Conclusion | `1.1 Liste A` + `1.1 Liste B` | **`1.1.` seul, sans liste** |

⚠️ **Le RAAT ne connaît ni liste A ni liste B.** Chercher « liste A » ou
« liste B » dans un RAAT ne rend rien — et un lecteur qui en conclut « aucune
liste renseignée » se trompe de rapport. **On lit d'abord le titre courant.**

### § 1.1 · La conclusion — une seule phrase, et un renvoi

```
1.1. Dans le cadre de mission décrit à l'article 3.2, il a été repéré des matériaux et produits
contenant de l'amiante. (Détaillé en partie 5 du présent rapport)
```

⚠️ **La conclusion ne dit ni quoi, ni où.** Elle renvoie à la partie 5. C'est le
seul volet du corpus dont le § 1 ne porte aucune localisation : tout est dans le
détail, et un lecteur qui s'arrête à la conclusion n'a rien à restituer.

⚠️ Le § 1.2 change de mot : « investigations **approfondies** » au RAAT, contre
« investigations **complémentaires** » ailleurs. Même rubrique, autre libellé.

### § 2 · Le laboratoire — enfin rempli, et c'est le piège ITGA

```
Raison sociale et nom de l'entreprise : ... Institut technique des gaz et de l'air (ITGA)
Adresse : ................................ 3, Armand-Herpin-Lacroix, CS 46537 35065 Rennes
Numéro de l'accréditation Cofrac : .........
```

**Premier § 2 rempli du corpus** — et deux laboratoires distincts sur les cinq
RAAT lus : **ITGA** (Rennes) et **Eurofins LEM**. Et il confirme sur pièce le faux
d'identification déjà tenu par un test : **ITGA est ici le LABORATOIRE**, pas
l'éditeur Imm'PACT. Le nom d'un éditeur peut donc apparaître dans une rubrique
nommée sans désigner l'éditeur.

⚠️ Le `Numéro de l'accréditation Cofrac` est **vide** alors que le laboratoire
est nommé. Rubrique renseignée à moitié : on cite ce qui est écrit, on ne
complète pas.

### § 3.2.4 · Le programme de repérage — dix catégories imprimées en entier

Le RAAT imprime le **programme réglementaire complet** de l'annexe 1 de l'arrêté
du 16 juillet 2019 : dix catégories, de « 1 - Couvertures, Toitures, Terrasses
et étanchéités » à « 10 - Aménagements, voiries et réseaux divers », chacune
suivie de ses composants.

⚠️⚠️ **C'est le même piège que les six domaines de l'électricité, en plus
gros.** « Faux plafonds », « Conduits de fluides », « Portes coupe-feu »,
« Chaudières », « Vide-ordures » sont imprimés **dans tous les RAAT**, qu'ils
existent ou non dans le bâtiment. **Ce catalogue n'est pas un constat** — c'est
le texte de l'arrêté, recopié. Rien de ce qui s'y trouve ne peut être cité comme
observé.

### § 3.2.6 · Le périmètre — et le champ qui devrait dire les travaux

```
3.2.6 Le périmètre de repérage
Programme détaillé des travaux :
Néant
```

⚠️ **`Programme détaillé des travaux` est le champ prévu pour dire quels travaux
justifient le repérage — et il est à `Néant` dans les cinq RAAT lus.**

**L'endroit qui porte réellement les travaux est le champ `Périmètre de
repérage` de la page 1**, et il les dit en clair :

```
Repérage amiante avant travaux avant réfection de la couverture (remplacement plaques en fibrociment).
Repérage amiante avant travaux avant pose de borne électrique pour recharge de véhicule.
    Emplacements des prélévements nécessaires fournis sur plan par la société <bureau d'études>.
Repérage amiante avant travaux de réfection des sol d'une salle de bains suite à un dégât des eaux.
Repérage amiante avant travaux à partir de plan de travaux fournis par le bureau d'étude.
```

**C'est la donnée qui borne tout le rapport** : un RAAT ne vaut que pour la zone
impactée par ces travaux-là. La citer est indispensable — un RAAT de salle de
bains ne dit rien du reste du logement.

⚠️ Les deux champs se contredisent donc systématiquement : `Programme détaillé
des travaux : Néant` alors que le périmètre décrit les travaux. **On lit le
périmètre, jamais le programme.**

### § 5.1 · La liste par catégorie — l'endroit qui porte les prélèvements

Un bloc par matériau, introduit par son identifiant :

```
M023 : Partie à inspecter : Conduits.
Niveau : Niveau 1

Localisation      Description                        n° de sondage  Echantillon  N° Echantillon  Photo
WC, combles       Identifiant : M023                       1            Oui           P023
                  Description : Conduits
                  Résultat : Présence d'amiante
```

**Six colonnes**, et la conclusion est **au milieu de la deuxième**, sous
`Identifiant :` et `Description :`, sur la ligne `Résultat :`.

| Ce que porte `Résultat :` | Ce que ça veut dire |
|---|---|
| `Absence d'amiante` | négatif |
| `Présence d'amiante` | **positif** |

Et la colonne `Echantillon` porte `Oui`, ou **`Aucun prélèvement`** — un matériau
inspecté sans être prélevé, dont le résultat repose alors sur le seul jugement.

⚠️ **La colonne `Localisation` s'étale et entrelace les autres.** Vu sur un
matériau commun à douze pièces : la localisation occupe douze lignes, et
`Identifiant`, `Description`, `Résultat` sont imprimés **au milieu** de cette
colonne. Lue ligne à ligne, la conclusion se retrouve encastrée entre deux noms
de pièces. **Il faut la position.**

### § 5.2 · Le récapitulatif zone par zone — et une cinquième justification

Colonnes : `Zone` | `Identifiant + Description` | `Conclusion (justification)` |
`Photo`.

```
Localisation : Escalier sud ouest
Echantillons : P001                  Absence d'amiante
M001                                 (Après analyse en laboratoire)
Description : Enduits, peinture
```

**`(Après analyse en laboratoire)`** — c'est la cinquième forme de
justification du corpus, après `Sur jugement personnel`, `sur jugement de
l'opérateur`, `Sur décision de l'opérateur` et `Non prélevé pour ne pas altérer
sa fonction`. **C'est la seule qui repose sur une preuve.**

Sur le RAAT lu : **28 échantillons, P001 à P028**, dont **quatre positifs**.
C'est le premier volet du corpus où l'amiante est établie **par analyse** et non
sur jugement.

### Annexe 7.2 · Les rapports d'essais — remplie, enfin

```
Identification des échantillons prélevés :
Identifiant et échantillons  Localisation  Composant de la construction  Parties du composant  Description  Photo
M005 - P005   Niveau 1 - Balcon 1   Revêtements de sol (l'analyse doit    Colles bitumineuses   Colles Carrelage
                                    concerner chacune des couches                              Commentaires prélèvement: …
                                    du revêtement)                                             Analyse à réaliser: Toutes les
                                                                                               couches (1 à 1)
```

Deux mentions à retenir, et elles sont réglementaires :

- **« l'analyse doit concerner chacune des couches du revêtement »**, imprimée
  dans la colonne du composant pour les revêtements de sol ;
- **`Analyse à réaliser: Toutes les couches (1 à 1)`**, qui dit combien de
  couches l'échantillon comportait et combien ont été analysées.

⚠️ **C'est l'endroit qui permet de dire qu'une analyse est incomplète** : un
`(1 à 3)` sur un revêtement multicouche ne prouve pas l'absence d'amiante dans
les deux autres couches. Non rencontré encore — à guetter.

### ⚠️ Ce que la découpe actuelle fait des RAAT — un défaut mesuré

Sur les cinq RAAT lus, la découpe du moteur (`src/lib/analyse/decoupe.ts`)
attribue au volet amiante :

| Pages du fichier | Pages attribuées au volet |
|---|---|
| 96 | 4 à 58 ✅ |
| 24 | **1 à 4** ❌ |
| 37 | **2 à 6** ❌ |
| 32 | **3 à 5** ❌ |
| 26 | 3 à 17 ✅ |

**Trois RAAT sur cinq sont bornés à quatre ou cinq pages** alors que le volet en
fait vingt ou trente. Le contenu perdu est précisément le § 5 — les
prélèvements, les résultats d'analyse, le récapitulatif zone par zone. **Un
volet tronqué se lit exactement comme un volet sans amiante.**

La cause probable est le titre courant : le RAAT porte `Repérage Amiante -
Travaux n° …`, qui n'est pas dans la table des ouvertures de section, et la
découpe s'arrête au premier changement de forme. **Défaut relevé, non corrigé** :
`ODM_UNE_ERREUR_CINQUANTE_LECTURES.md` interdit le correctif à chaud, et la
correction devra se mesurer sur les RAAT du corpus, pas sur ces cinq-là.

Même défaut mesuré sur la fiche récapitulative BC2E : pages 1-2 attribuées sur
un document de 9 pages.

### L'annexe 7.5 change encore de titre

En RAAT : `7.5 Recommandations générales de sécurité` — sans « du dossier
technique amiante », et les documents annexés passent en `7.6`. **Trois valeurs
différentes pour le même numéro d'annexe selon la mission** (vente : documents
annexés ; DTA : recommandations du DTA ; RAAT : recommandations générales).

---


---

## LA LISTE A, chez LICIEL — un flocage en Score 3


*Trouvé au 92ᵉ volet : une copropriété bordelaise de quatre niveaux, DTA de
parties communes, **flocages amiantés dans les caves, cotés Score 3**. C'est le
seul volet du corpus qui porte de l'amiante en liste A, et il apprend à lui seul
plus que les quatre-vingt-onze autres.*

### Ce que le § 1.1 porte — et qui casse tout ce qui précède

```
1.1 Liste A : Dans le cadre de mission décrit à l'article 3.2, il a été repéré :
- des matériaux et produits de la liste A contenant de l'amiante sur anciennes analyses :
Flocages (Sous-Sol - Parties Communes / Caves) pour lequel il faut faire réaliser des travaux
de retrait ou de confinement.*
1.1 Liste B : Dans le cadre de mission décrit à l'article 3.2, il a été repéré :
- des matériaux et produits de la liste B contenant de l'amiante sur anciennes analyses :
Conduits (Rez de chaussée / Extérieur - Local 2) pour lequel il est recommandé de réaliser une
évaluation périodique.*
- des matériaux et produits de la liste B contenant de l'amiante après analyse en laboratoire :
Conduits (Sous-Sol - Parties Communes / Caves) pour lequel il est recommandé de réaliser
une évaluation périodique.*
- des matériaux et produits de la liste B contenant de l'amiante sur décision de l'opérateur :
Plaques (fibres-ciment) (Rez de chaussée / Exterieur - Extérieur / Parking) pour lequel il est
recommandé de réaliser une évaluation périodique.*
- des matériaux et produits de la liste B pour lesquels des sondages et/ou prélèvements doivent
être effectués :
                            ← SAUT DE PAGE, pied de page, en-tête ←
Conduits (Sous-Sol - Parties Communes / Caves) / Non prélevé pour ne pas altérer sa fonction)
```

⚠️⚠️⚠️ **UNE SEULE LISTE PORTE QUATRE LIGNES À TIRET.** Chacune a sa
justification et son lot de matériaux. Un lecteur qui prend « la ligne qui suit
`Liste B :` » n'en lit **qu'une sur quatre** — et laquelle, selon l'ordre
d'impression.

**La règle qui en sort** : après `Liste X :`, on lit **toutes** les lignes
commençant par `-` jusqu'à la ligne suivante `Liste …` ou `1.2.`, et **chacune
porte son propre état**. Le § 1.1 n'est pas une phrase : c'est une liste de
listes.

⚠️ Et la quatrième ligne est **coupée par un saut de page** : son intitulé finit
la page 2 du volet, ses matériaux ouvrent la page 3, séparés par le pied de page
et l'en-tête. La recoller est obligatoire.

### La huitième justification : `sur anciennes analyses`

Le flocage n'a été ni prélevé ni jugé : il est reconnu **sur des analyses
antérieures**, faites avant ce repérage. Le corpus donne donc, pour la seule
colonne « Conclusion (justification) », **six valeurs** :

| Justification | Ce sur quoi elle repose |
|---|---|
| `Sur jugement personnel` / `sur jugement de l'opérateur` / `Sur décision de l'opérateur` | l'œil de l'opérateur |
| `Après analyse en laboratoire` | une analyse faite pour ce rapport |
| **`Sur anciennes analyses`** | **une analyse antérieure, non jointe** |
| `Non prélevé pour ne pas altérer sa fonction` | rien — non conclu |
| `En attente des résultats d'analyse` | rien — non conclu |

⚠️ `Sur anciennes analyses` mérite d'être restituée telle quelle : le rapport
s'appuie sur une pièce **qu'il ne fournit pas**. Ce n'est pas un jugement, ce
n'est pas une preuve jointe.

### La fiche de cotation d'un Score 3 — et un artefact du logiciel

```
                                       Matériau en décollement
Identifiant: M002                      Souligne_Score 3**
Description: Flocages
Liste selon annexe.13-9 du CSP: A      Il faut faire réaliser des travaux de retrait ou de
                                       confinement des flocages.
```

Trois choses à retenir, et la troisième est un défaut :

1. **`Matériau en décollement`** — troisième valeur d'état de conservation,
   après `Matériau non dégradé` et `Matériau dégradé (étendue ponctuelle)`.
2. **La préconisation de la liste A n'a pas de préfixe `Préconisation :`** — elle
   est écrite d'un bloc : `Il faut faire réaliser des travaux de retrait ou de
   confinement des flocages.` Un lecteur qui cherche `Préconisation :` la rate
   exactement dans le cas le plus grave.
3. ⚠️⚠️ **`Souligne_Score 3`** — le gabarit laisse fuir sa propre instruction de
   mise en forme. La valeur réelle est `Score 3` ; `Souligne_` est un ordre
   d'affichage du logiciel, imprimé tel quel dans le PDF. Un lecteur qui cherche
   `Résultat Score 3` ne trouve rien, et un lecteur qui recopie la cellule
   affiche « Souligne_Score 3 » à un acquéreur.

**Le code d'état diffère aussi selon la liste** : `(F - Ib)` en liste A,
`(Z - III - RF)` en liste B. Aucun des deux n'est expliqué dans le rapport —
**non élucidé, à ne pas restituer.**

### Ce que Score 3 veut dire, et pourquoi ce rapport est le plus grave du corpus

L'annexe 7.4 du même volet le dit, en citant l'article R. 1334-27 :

> Score 3 – Les travaux de confinement ou de retrait de l'amiante sont mis en
> œuvre selon les modalités prévues à l'article R. 1334-29.

et l'article R. 1334-29 fixe le délai : **trente-six mois**, avec des mesures
conservatoires dans l'intervalle et information du préfet dans les deux mois.

C'est le seul dossier lu où ce texte d'annexe — imprimé à l'identique dans
quatre-vingt-onze autres volets sans rien signifier — **s'applique réellement**.

⚠️ **C'est la démonstration de la règle des annexes**, prise par l'autre bout :
les mots « travaux de retrait ou de confinement » sont présents dans 100 % des
volets, et **dans un seul ils désignent une obligation**. Ce qui distingue ce
volet-là n'est pas la présence des mots, c'est **la case `Etat de conservation`
du § 5.1 et la ligne à tiret du § 1.1**.

### Le reste du volet, pour mémoire

- **§ 2** : `Eurofins LEM`, 20 rue du Kochersberg, Saverne — **`Numéro de
  l'accréditation Cofrac` laissé vide** alors que le laboratoire est nommé et
  qu'une analyse a servi de base à une conclusion.
- **§ 1.2** : deux locaux non visités, `Absence de clef` (avec un `f`), dont une
  **chaufferie** — c'est-à-dire l'endroit où les calorifugeages vivent.
- Le § 1.2 non vide entraîne la phrase des obligations non remplies, ici dans sa
  **variante DTA** : elle s'arrête à `(Listes "A" et "B")`, sans les vices
  cachés.

---

## LE CAS D'ÉCOLE LICIEL : le même bien, deux rapports, onze jours


*Le corpus contient, dans le même dossier client, **le pré-rapport et le rapport
définitif du même repérage** — dossier `2503CS_31791`, un local commercial mixte
avec habitation. Les deux ont été lus. Ils disent deux choses différentes, et
c'est le meilleur enseignement de toute la lecture.*

### Ce que chacun conclut

| | **Pré-rapport, 15/05/2025** | **Rapport définitif, 26/05/2025** |
|---|---|---|
| En-tête | `Pré - Rapport du 15/05/2025 de la mission de repérage…` | `Rapport de mission de repérage…` |
| **Liste A** — faux plafonds, 9 pièces | `- des matériaux et produits de la liste A **pour lesquels les résultats d'analyse des sondages et/ou prélèvements sont attendus** : Faux plafonds (…) / En attente des résultats d'analyse)` | `- des matériaux et produits de la liste A **ayant fait l'objet d'analyse, ne contenant pas d'amiante** : Faux plafonds (…)` |
| **Liste B** — dalles de sol, 2 pièces | `- des matériaux et produits de la liste B **contenant de l'amiante après analyse en laboratoire** :` | **identique** |
| Laboratoire | `PROTEC` — accréditation Cofrac `1-0918` | identique |

**Onze jours séparent les deux documents, et ce qui change est exactement ce que
le laboratoire devait dire.** La liste B était déjà tranchée — l'amiante est
là, dans les dalles de sol de la réserve et de l'entrée. La liste A attendait :
les faux plafonds de l'étage. Le définitif les innocente.

### Les quatre choses que ce couple démontre

**1. « Il a été repéré » ouvre les quatre conclusions.** Dans ces deux
documents, `il a été repéré :` introduit successivement une attente d'analyse,
une absence prouvée, et une présence prouvée. Le mot n'a aucune valeur : **tout
est dans la ligne à tiret qui suit.**

**2. Le suspens porte sur la liste A, celle qui coûte le plus cher.** Les faux
plafonds sont de la liste A : s'ils avaient contenu de l'amiante, le propriétaire
tombait sous les scores 1/2/3 de l'article R. 1334-27, avec mesure
d'empoussièrement ou travaux de retrait. **Le pré-rapport ne pouvait donc rien
garantir sur le poste le plus lourd du bien.**

**3. Un pré-rapport circule.** Celui-ci était rangé dans le dossier client sous
un nom qui ne le dit pas (`AMIANTE 14.05.25.pdf`). **Rien, dans le nom du
fichier, ne distingue un document provisoire d'un document définitif** — seule
la deuxième ligne de la page 1 le dit.

**4. Le même bien peut avoir deux vérités selon le PDF ouvert.** Il faut donc,
avant toute restitution : lire l'en-tête (`Pré - Rapport` ?), lire la date
d'émission, et — si deux rapports portent le même numéro de dossier — **retenir
le plus récent, en le disant**.

### Combien de volets portent quoi — mesuré sur 93 volets extraits

*93 volets amiante extraits du corpus, dont 70 lus ligne à ligne. Comptage des
formes de conclusion, une ligne pouvant apparaître deux fois dans un volet (une
par liste).*

| Forme | Occurrences | Volets |
|---|---|---|
| `il n'a pas été repéré` (absence) | 113 | **78** |
| `contenant de l'amiante sur jugement / décision de l'opérateur` | 9 | **8** |
| `contenant de l'amiante après analyse en laboratoire` | 3 | **3** |
| `ayant fait l'objet d'analyse, ne contenant pas d'amiante` | 1 | 1 |
| `pour lesquels des sondages et/ou prélèvements doivent être effectués` | 7 | **4** |
| `pour lesquels les résultats d'analyse … sont attendus` | 3 | **3** |

**Onze volets sur 93 portent de l'amiante. Sept ne concluent pas.** Autrement
dit : **sur les dix-huit volets qui ne sont pas un simple « rien trouvé », près
de quatre sur dix ne tranchent pas.** Un produit qui n'a que deux cases se
trompe donc sur près de 40 % des dossiers intéressants — et jamais sur les
dossiers vides, qui sont pourtant les seuls où il a l'air juste.

### Ce que la mesure donne sur les lignes de liste

Sur **70 documents**, 18 lignes ouvrent une liste par `Liste X : … il a été
repéré :`. Réparties ainsi :

| | Nombre | Part |
|---|---|---|
| **Vraie présence d'amiante** | 12 | 67 % |
| **Non conclu** (sondages à faire, ou analyse en attente) | 5 | 28 % |
| **Absence prouvée par analyse** | 1 | 6 % |

⚠️⚠️ **Un tiers de ces lignes ne dit pas qu'il y a de l'amiante.** Un lecteur qui
décide « présence » sur `Liste X : … il a été repéré` se trompe une fois sur
trois — et il se trompe dans les deux sens : il annonce de l'amiante là où le
laboratoire a conclu qu'il n'y en a pas, et il ferme un dossier que le
laboratoire n'a pas encore rendu.

**C'est ce que fait aujourd'hui `src/lib/analyse/reperages.ts`** (la boucle qui
lit `Liste ([ABC])` puis teste `il a été repéré`). Le défaut est **mesuré, non
corrigé** : `ODM_UNE_ERREUR_CINQUANTE_LECTURES.md` interdit le correctif à
chaud, et la correction devra se mesurer sur les rapports du corpus qui portent
ces formes, pas sur ces dix-huit lignes.

### Et la liste A, enfin

Aucun des 70 volets lus ne porte d'amiante **en liste A**. Le seul qui la
renseigne est celui-ci — **faux plafonds analysés, sans amiante**. Les flocages
et les calorifugeages n'ont pas encore été rencontrés, et avec eux tout le
vocabulaire des scores 1/2/3, de la mesure d'empoussièrement et des travaux de
retrait reste, dans ce corpus, **du texte d'annexe et rien d'autre**.

---

## Le gabarit LICIEL n'appartient pas à LICIEL — et la métadonnée ment


*Six documents lus le 21/08 dans les dossiers clients : quatre viennent de
**confrères** (SARL DIE2M / groupe EDEC, CSD BORDEAUX, CARRE D'EXPERTS), deux
sont des rapports DGLM réexportés. **Les six portent le gabarit LICIEL au mot
près** — même titre, même sous-titre, même numérotation, même phrase de
pagination.*

### ⚠️⚠️ La signature PDF nomme le dernier outil, pas l'éditeur

| Signature `Producer` | Ce que le gabarit est |
|---|---|
| `Microsoft® Word 2019` | LICIEL |
| `Microsoft® Word pour Microsoft 365` | LICIEL |
| `GdPicture Managed PDF Plugin Ver. 4.5` | LICIEL |
| `iTextSharp™ 5.4.0` | LICIEL |

**Quatre documents sur six rendaient « éditeur inconnu »** alors que le rapport
est un LICIEL de bout en bout. Un rapport imprimé, annoté puis réenregistré perd
sa signature d'origine : la métadonnée dit **qui a touché le fichier en
dernier**, jamais qui a produit le rapport.

C'est le complément indispensable de la règle des deux endroits
(`REPERES-PAR-EDITEUR.md`) : la signature est **sûre quand elle nomme un
éditeur**, elle n'est **pas concluante quand elle nomme un outil bureautique**.

**Ce qui, lui, ne ment pas : le gabarit du volet amiante.** Trois marques
suffisent à reconnaître la famille LICIEL sans ouvrir la métadonnée :

1. le sous-titre `Rapport de mission de repérage des matériaux et produits
   contenant de l'amiante pour l'établissement du constat…` ;
2. la phrase `Pagination : le présent rapport avec les annexes comprises, est
   constitué de N pages` ;
3. la numérotation `1 Les conclusions` / `2 Le(s) laboratoire(s) d'analyses` /
   `3 La mission de repérage` / `5.1 … (fiche de cotation)`.

### Ce que quatre cabinets différents changent au même gabarit

**Rien à la structure. Tout au détail — et le détail est là où l'on parse.**

| Endroit | Formes rencontrées |
|---|---|
| Bloc des textes en tête | `Références réglementaires` · `Références réglementaires **et normatives**` |
| Ligne de la norme | absente · `Norme(s) utilisée(s)  Norme NF X 46 - 020 d'Août 2017` |
| Qui commande | `Le commanditaire` · `Le donneur d'ordre` |
| § 4.3 | `Écarts […] par rapport aux **arrêtés** en vigueur` · `… par rapport aux **normes** en vigueur` |
| Phrase de pagination | en **page 1**, après la date d'émission · en **page 2**, juste avant le sommaire |
| Fin de la pagination | `…, la conclusion est située en page 2` · sans cette fin |
| § 5 | `5.0.1` + `5.0.2` + `5.1` + `5.2` · `5.1` + `5.2` + `5.3`, **sans 5.0** |

⚠️ **Correction à ce qui était écrit plus haut** : la composition du § 5 n'est
**pas** commandée par la seule mission. Un constat de **vente** de 2020 lu ici
porte `5.1 / 5.2 / 5.3` **sans** `5.0`, exactement comme un DAPP. C'est un trait
de **version du logiciel**, que la mission recoupe sans le déterminer. On ne
déduit donc jamais la mission de la présence du § 5.0 — **on lit le sous-titre.**

### Deux états du document que rien d'autre ne signale

#### Le pré-rapport

```
Constat de repérage Amiante n° 2503CS_31791
Pré - Rapport du 15/05/2025 de la mission de repérage des matériaux et produits
contenant de l'amiante pour l'établissement du constat établi à l'occasion de la vente…
```

**La mention `Pré - Rapport du <date> de la mission…` s'insère à la place même
du sous-titre qui déclare la mission.** Le document n'est pas le rapport : c'est
un état provisoire. Un lecteur qui borne sur `Rapport de mission de repérage`
ne le reconnaît pas, et le lit comme un rapport définitif.

#### La double pagination

```
CSD BORDEAUX | 220, avenue de la libération CDG 33110 Le Bouscat | Tél. : …
1 / 10
N°SIREN : 822597597 | Compagnie d'assurance : PACIFICA n° 9258667908   Rapport du : 30/07/2020
Rapport DDT : page 18 / 47
```

Deux paginations dans le même pied : **celle du volet** (`1 / 10`) et **celle du
dossier entier** (`Rapport DDT : page 18 / 47`). La seconde donne la position du
volet dans le DDT sans avoir à la calculer — et permet de vérifier qu'aucune
page n'a été retirée du dossier.

### ⚠️ Correction : « Ensemble du bien » n'est pas toujours une clause de style

Il était écrit plus haut que la ligne `Ensemble du bien` du § 1.2 est une clause
de style. **Une lecture plus large l'a démenti.** Un constat lu porte trois
lignes `Ensemble du bien` **renseignées** :

```
Localisation          Parties du local                                    Raison
Ensemble du bien      Sol, murs et plinthes                               Présence de meubles et objets non déplaçables
Ensemble du bien      Sous face des doublages de murs, gaines             Impossibilité d'investigation approfondie
                      électriques, coffrages, conduit de cheminée         non destructive
```

Ce sont de vraies observations : la colonne `Parties du local` est remplie, et
la raison est propre au logement.

**La règle juste est donc plus étroite** : ce qui est une clause de style, c'est
le **bloc de six lignes qui commence par « Le diagnostic se limite aux zones
rendues visibles et accessibles par le propriétaire »** et court jusqu'à
« …accès combles insuffisant, etc. ». Il se reconnaît à son texte, identique au
caractère près d'un rapport à l'autre — jamais à la seule mention
`Ensemble du bien`.

---

# BC2E — réseau, gabarit `TCPDF / HTML2PDF`


*Lectures intégrales : **4 documents** — 2 DTA (dont un positif), 1 fiche
récapitulative de DTA, 1 DAPP. Signature `TCPDF 5.0.002` + `Creator: HTML2PDF -
TCPDF`. **C'est la famille qui était le seul trou d'identification du corpus**
(59 documents, aucun lu) : elle est nommée, et son nom est écrit en clair dans
le rapport — voir ci-dessous.*

## Ce que BC2E change, et qui casse un lecteur écrit pour LICIEL

| | **LICIEL** | **BC2E** |
|---|---|---|
| Un fichier | tout le DDT, volets à la suite | **un fichier par volet**, nommé `…-dta.pdf`, `…-dapp.pdf`, `…-fiche_recap_dta.pdf` |
| L'éditeur se nomme | métadonnée seule | **pied de page : « membre du réseau BC2E »** |
| La conclusion | § 1, en page 2 | **bloc `A - CONCLUSIONS DU REPÉRAGE EFFECTIF` en page 1** |
| Les non-visités | un tableau (§ 1.2) | **trois tableaux distincts** (locaux / éléments / matériaux à investiguer) |
| Le tableau de résultats | 5 colonnes, texte en clair | **9 colonnes, valeurs en sigles**, légende imprimée dessous |
| Numérotation | 1 conclusions … 7 annexes | **1 laboratoire … 9 annexes** — décalée d'un cran |
| Norme citée | `NF X 46-020` depuis 2025 | citée **et** dotée d'une rubrique d'écarts (§ 6) |

## La borne la plus sûre du corpus : le pied de page

```
DGLM EXPERTISES / LE MOINE Thibault membre du réseau BC2E
76 COURS PORTAL - 33000 BORDEAUX                        n° de rapport : 331000039
Tel : … - Mail : … - Web : https://dglm.bc2e.com        AMIANTE (DTA) : 3 sur 10
Siret : 891287070
```

**Le pied de page dit, sur chaque page : l'éditeur, le numéro de rapport, LE
VOLET, LA MISSION, et la pagination du volet.** Rien d'équivalent ailleurs.
Formes vues : `AMIANTE (DTA) : n sur N`, `DIAGNOSTIC AMIANTE (DAPP) : n sur N`,
`FICHE RECAPITULATIVE DTA : n sur N`.

⚠️ **Le nom de l'éditeur est dans le CORPS, pas dans la métadonnée** — la
signature PDF ne dit que `TCPDF`, qui est une bibliothèque d'impression, pas un
éditeur. C'est l'exception à la règle « on ne cherche jamais une marque dans le
corps » : ici le pied de page est une **rubrique**, à position fixe, pas un mot
rencontré au hasard.

## Page 1 · Le bloc `A - CONCLUSIONS DU REPÉRAGE EFFECTIF`

⚠️⚠️ **La phrase la plus dangereuse du corpus amiante est ici.** Cinq états, et
**quatre commencent par les mêmes cinq mots** :

| Ce qui est imprimé | Ce que ça veut dire |
|---|---|
| `il n'a pas été repéré de matériaux ou produits susceptibles de contenir de l'amiante.` | **rien** |
| `il a été repéré des matériaux et produits susceptibles de contenir de l'amiante : marquage des matériaux, ils ne contiennent pas d'amiante dans :` | **rien** — le matériau porte un marquage qui l'exclut |
| `il a été repéré des matériaux ou produits susceptibles de contenir de l'amiante pour lesquels des sondages et/ou des prélèvements doivent être effectués dans :` | **on ne sait pas encore** |
| `il a été repéré des matériaux et produits contenant de l'amiante sur décision de l'opérateur (jugement personnel) dans :` | **amiante** |
| `il a été repéré des matériaux et produits contenant de l'amiante : document consulté dans :` | **amiante**, établi sur pièce |

**Le mot qui tranche est `susceptibles de contenir` contre `contenant`** — et il
tombe au milieu de la phrase, après « il a été repéré des matériaux ». Un
lecteur qui cherche `il a été repéré` annonce de l'amiante dans quatre cas sur
cinq, dont deux où le rapport dit exactement le contraire.

Et il existe un sixième état, qui ne conclut pas du tout :

```
PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE.
```

⚠️ **Un rapport qui ne conclut pas.** Il faut le restituer comme une absence de
réponse — jamais comme une absence d'amiante. *(LICIEL a sa propre forme de cet
état, découverte plus tard : voir « Le troisième état » dans la partie LICIEL.
Le rapprochement des deux gabarits le confirme : **chez LICIEL comme chez BC2E,
un constat amiante a trois issues, pas deux** — mesuré chez les deux, pas
au-delà.)*

**La ligne de localisation** qui suit chaque état a une forme fixe :
`<Local> (<Composant>) : <Localisation>` — par exemple
`SOUS-SOL - Cave (Conduits) : Plafond`, `Garages 1 (Plaques) : Toiture Garages`.

## Page 1 · Le bloc `B - OBLIGATIONS ET RECOMMANDATIONS RÉGLEMENTAIRES…`

Deux paragraphes, un par liste (`Matériaux et produits de la liste A…` puis
`… de la liste B…`), dont l'état vide est `Aucune obligation réglementaire à
signaler.` et l'état plein, vu sur le DTA positif :

```
Une ou plusieurs évaluations périodiques sont recommandées
Se reporter au paragraphe 5.2 du présent rapport pour connaître le detail des recommandations
réglementaires.
```

suivi de deux rappels réglementaires (examen visuel et mesure d'empoussièrement
après retrait, entreprise certifiée obligatoire) qui **ne sont imprimés que
lorsqu'il y a un positif** — contrairement à LICIEL, qui imprime tout le droit
en annexe dans tous les cas. **Chez BC2E, la présence du mot « retrait » en page
1 est donc un vrai signal.**

## Page 2 · Le bloc `C - …INVESTIGATIONS COMPLÉMENTAIRES…` — trois tableaux

Là où LICIEL fond tout dans un seul tableau, BC2E distingue :

| Tableau | Colonnes | Vide |
|---|---|---|
| `LOCAUX NON VISITES` | `Etage` · `Local` · `Motif` | `Néant Néant Néant` |
| `ÉLÉMENTS NON EXAMINÉS` | `Etage` · `Local` · `Éléments et motif` | idem |
| `Matériaux ou produits susceptibles de contenir de l'amiante pour lesquels des investigations complémentaires sont nécessaires` | `Etage` · `Local` · `Localisation` · `Composant` · `Motif` | idem |

Puis la même phrase de manquement réglementaire que chez LICIEL, mais dans une
autre rédaction : `Il est rappelé au propriétaire que les obligations
réglementaires prévues aux articles R.1334-15 à R.1334-18 […] ne sont pas
remplies…` — **sans** la mention du vendeur et des vices cachés.

Et deux clauses propres à BC2E, qu'aucun autre éditeur lu ne porte :

- `Le présent rapport de repérage ne peut pas constituer la fiche récapitulative
  du dossier technique amiante […] Il ne peut donc pas constituer l'état
  mentionnant la présence ou l'absence de matériaux ou produits contenant de
  l'amiante requis pour la vente de l'immeuble bâti.` — **le rapport dit
  lui-même à quoi il ne sert pas.** C'est une information capitale pour un
  acquéreur, et elle n'est nulle part ailleurs.
- `BC2E s'engage à venir visiter les locaux ou parties d'immeuble inaccessibles
  lors de la visite initiale et à mettre à jour le présent rapport si […] dans
  les quinze jours calendaires…` — un engagement commercial daté, dans le corps
  du rapport.

## § 4 · Les résultats détaillés — neuf colonnes et une légende imprimée

`4.1` liste A · `4.2` liste B · `4.3` programme complémentaire ·
`4.4 Zones présentant des similitudes d'ouvrage`.

Colonnes : `Étage` · `Local ou zone homogène` · `Localisation` · `Composant` ·
`Numéro de prélèvement` · **`Amiante`** · **`Critère de conclusion`** ·
`Motif si MPSCA` · `Type de recommandation`.

⚠️ **Les valeurs sont des sigles, et la légende est imprimée sous chaque
tableau** — c'est un endroit, pas un savoir extérieur :

```
Abréviations utilisées pour les critères de conclusion :
JPOR : Jugement personnel de l'opérateur de repérage - MM : Marquage matériau - DOC : Document
consulté - RASP : Résultat d'analyse suite à prélèvement - MPPNCA : matériau ou produit qui par
nature ne contient pas d'amiante - MPSCA : matériau ou produit restant susceptible de contenir de
l'amiante pour lequel des investigations complémentaires doivent être effectuées

Codification des résultats d'évaluation de l'état de conservation (liste A) :
score = 1 : Faire réaliser une évaluation périodique de l'état de conservation
score = 2 : Faire réaliser une surveillance du niveau d'empoussièrement
score = 3 : Faire réaliser des travaux de retrait ou de confinement.

(liste B) : EP : Évaluation périodique - AC1 : Action corrective de premier niveau -
AC2 : Action corrective de second niveau - Aucune : Le matériau ou produit ne contenant pas
d'amiante, aucune recommandation n'est à formuler.
```

**Valeurs vues dans la colonne `Amiante`** : `NON` · `Susceptible` · `Analyse`.
La colonne `Composant` porte le chemin complet de la nomenclature de l'annexe
13-9 : `Planchers et plafonds / Planchers / Dalle de sol`,
`Conduits, canalisations, et équipements intérieurs / Conduit de fluide /
Conduits`. **C'est le vrai vocabulaire réglementaire, et il n'existe pas chez
LICIEL, qui écrit seulement « Conduits ».**

⚠️ **Un désaccord interne repéré, non tranché** : dans le DTA lu, le § 4.2 porte
une ligne `RASP` / `AC1` (donc une action corrective sur un matériau analysé),
alors que le § 5.2 « Recommandations réglementaires […] liste B » est `Néant` et
que le bloc B de la page 1 dit « aucune obligation réglementaire à signaler ».
Le même rapport annonce par ailleurs des prélèvements **en cours d'analyse**.
**À vérifier en lecture positionnelle avant d'en conclure quoi que ce soit** :
les colonnes de ce tableau sont larges et l'extraction linéaire peut les
décaler. Noté ici pour ne pas être perdu.

## § 2.2.6 / 2.2.7 · Le périmètre — et la date du permis de construire

BC2E sépare **le périmètre à repérer** (« constitué des seules parties communes
de l'immeuble ») du **périmètre de repérage effectif**, et donne dans ce dernier
ce que LICIEL ne donne jamais :

```
Date du permis de contruire : Non précisée (antérieur au 1er juillet 1997 sur déclaration du mantadaire)
Année de construction : 1900
```

⚠️ **C'est l'endroit qui dit pourquoi le repérage est dû** — le seuil du
1er juillet 1997 — et il dit aussi **d'où vient l'information** (déclaration du
mandataire, et non pièce). Chez LICIEL, la page 1 porte seulement
`Date de construction : < 1949` ou `Date du permis de construire non connue`.

Le tableau du périmètre effectif est autrement plus fin : `Étage` · `Local` ·
`Élément : Revêtement / Substrat`, avec le détail par ouvrant —
`Porte 1 : dormant intérieur ( PVC)`, `Escalier 1 : contre-marche ( Pierres)`.

## § 9 · Les annexes — une check-list, et c'est un contrôle de complétude

```
- Grilles réglementaires d'évaluation de l'état de conservation des flocages … : sans objet
- … des calorifugeages … : sans objet
- … des faux-plafonds … : sans objet
- … des matériaux ou produits de la liste B … : sans objet
- Illustration photographique : non
- Schéma de repérage : oui
- Rapports d'analyses du laboratoire : non
- Documents annexés au présent rapport : aucun
- Copie du certificat de compétence de l'opérateur de diagnostic : présent
- Copie de l'attestation d'assurance couvrant l'opérateur de repérage : présent
```

**Le rapport déclare ce qu'il contient, pièce par pièce.** C'est le seul endroit
du corpus qui permette de dire « il manque une pièce » sans l'avoir cherchée.
⚠️ Et il se contrôle : un rapport qui annonce `Rapports d'analyses du
laboratoire : non` mais dont le § 4.2 porte un `RASP` se contredit.

## La fiche récapitulative de DTA — un document à part, et un piège de lecture

Fichier distinct (`…-fiche_recap_dta.pdf`), pied de page
`FICHE RECAPITULATIVE DTA : n sur 9`, titre `Dossier Technique Amiante / FICHE
RECAPITULATIVE / DTA N° : …`.

Elle reprend, sous d'autres numéros, le repérage (§ 4 « Résultats détaillés »
= le tableau des rapports de repérage ; § 5 « Liste des parties de l'immeuble
bâti ayant donné lieu aux repérages » = les locaux visités et non visités).

⚠️⚠️ **Son § 3, `DÉTENTEUR DU DOSSIER TECHNIQUE AMIANTE`, est un formulaire
VIDE, destiné au propriétaire** : `Nom :`, `Fonction :`, `Adresse complète :`,
`Modalité de consultation de ce dossier :`, `Horaires :`… **Ici, une rubrique
vide n'est PAS un résultat** — c'est un champ que le diagnostiqueur n'avait pas
à remplir. C'est la première exception rencontrée à la règle « une rubrique
présente et vide est une réponse », et elle se reconnaît à ce que **toute la
rubrique** est vide, libellés compris.

⚠️ **La découpe actuelle borne mal ce document** : elle attribue au volet
amiante les pages 1-2 d'un fichier qui en compte 9. Défaut d'outil, à corriger.

## Deux traits qui ne sont donc PAS des habitudes de LICIEL

1. **Le sommaire ment sur le corps.** Chez BC2E aussi : le sommaire annonce
   `8.1 Remarques diverses` et `8.2 Remarques importantes`, le corps imprime en
   plus `8.3 Intégration du présent rapport au dossier technique amiante`.
   Mesuré chez **les deux éditeurs lus** — c'est le seuil minimal pour ne plus
   parler d'habitude de logiciel, et le seuil seulement : deux ne font pas le
   métier.
2. **Le texte réglementaire imprimé par défaut.** Il existe chez les deux, mais
   **BC2E n'imprime les rappels de retrait/confinement que s'il y a un
   positif**, là où LICIEL les imprime toujours. Le même mot n'a donc pas la
   même valeur selon l'éditeur : `retrait` en page 1 est un signal chez BC2E, un
   bruit chez LICIEL. **C'est l'illustration exacte de « l'éditeur conditionne
   tout ».**

---

---

# ITGA — le RAPPORT D'ESSAI du laboratoire

*Un troisième producteur, et un troisième gabarit. Ce n'est pas un diagnostic :
c'est **la pièce que le constat cite** quand il conclut « après analyse en
laboratoire ». 17 exemplaires repérés dans le corpus, rangés dans des dossiers
`RESULTATS ANALYSE` et nommés `M.<numéro>.<n>.pdf`. **Une page.**

Signature : `iTextSharp™ 5.5.13 … · Creator: ITGA`.*

⚠️ **C'est ici que le faux d'identification se règle définitivement.** ITGA édite
le logiciel Imm'PACT **et** exploite un laboratoire d'analyse. La signature
`Creator: ITGA` sur un document d'une page nommé `M.…pdf` ne désigne **pas**
l'éditeur Imm'PACT : elle désigne **le laboratoire**. Le genre du document se lit
à son titre, pas à sa signature.

## Où le rapport d'essai se lit

| L'endroit | Ce qu'il porte |
|---|---|
| Titre | `RAPPORT D'ESSAI N° <réf> EN DATE DU <date>` |
| Objet | `RECHERCHE ET IDENTIFICATION D'AMIANTE SUR UN PRELEVEMENT DE MATERIAU` |
| Accréditation | `Accréditation n° 1-5968` en tête, avec renvoi à `www.cofrac.fr` |
| Client | raison sociale et adresse du **diagnostiqueur**, pas du propriétaire |
| Références | `Commande ITGA : IT…` · `Echantillon ITGA : IT…` · `Reçu au laboratoire le : <date>` |
| Ce que le client a déclaré | `Réf. Client :` · `Commande <nom>` · `Dossier client` · **`Echantillon P1 - Toile sur calorifugeage - Cave`** |
| Ce que le labo a vu | `Description ITGA : Toile fibreuse blanche avec poussières` |
| Méthode | MOLP (parties pertinentes de `NF ISO 22262-1`) et META (`NF X 43-050`), préparation conforme à l'**arrêté du 1er octobre 2019** |
| **Résultat** | `Amiante non détecté` **ou `Présence de fibres`** |
| **Variété d'amiante** | colonne à part : `---` quand rien n'est détecté, **`Chrysotile`** quand il y en a |
| Traçabilité de l'analyse | `Analyste : <initiales>` · `Nombre de préparations : 3` · `Nombre de supports d'analyse : 4` |
| Validation | `Validé par : <nom>, Chef d'équipe` |
| Diffusion | « La reproduction de ce rapport d'essai n'est autorisée que sous sa forme intégrale » |
| Conservation | « les échantillons sont conservés pendant 6 mois et les rapports pendant 10 ans » |

## ⚠️ Un fichier porte PLUSIEURS rapports d'essai — un par page

Le fichier `M.3782883.1.pdf` contient les rapports `IT052607-6089` **et**
`IT052607-6090`, un par page, chacun avec son échantillon, son résultat et sa
validation. **La borne est la ligne `RAPPORT D'ESSAI N° … EN DATE DU …` en tête
de page**, jamais le fichier.

Lire le premier et s'arrêter, c'est ignorer les autres prélèvements du même
chantier — et il suffit d'un positif parmi eux.

## Les deux états du résultat, mot pour mot

| Ce qui est imprimé | Variété | Ce que ça veut dire |
|---|---|---|
| `Amiante non détecté` | `---` | **rien au-dessus du seuil** — et pas « absence », voir plus bas |
| `Présence de fibres` | **`Chrysotile`** (vue), ou une autre des six variétés | **amiante**, avec son minéral nommé |

⚠️ `Présence de fibres` **ne contient pas le mot « amiante »**. Un lecteur qui
cherche « amiante » dans la colonne Résultat trouve le négatif
(`Amiante non détecté`) et rate le positif. **C'est le même piège que le § 1.1
de LICIEL, transposé au laboratoire** : la phrase qui alerte est celle où le mot
attendu manque.

## ⚠️⚠️ Les deux phrases qui changent la valeur du résultat

**1. La localisation ne vient pas du laboratoire.**

> Le laboratoire n'est pas responsable des données fournies par le client qui
> sont simplement retranscrites ci-dessous.

La ligne `Echantillon P1 - Toile sur calorifugeage - Cave` est **le texte du
diagnostiqueur**, recopié. Le laboratoire ne garantit ni la pièce, ni le
matériau : il garantit ce qu'il a trouvé dans le sachet. **Un rapport d'essai ne
prouve donc jamais qu'un matériau donné d'une pièce donnée contient de
l'amiante — il prouve ce que contenait l'échantillon.**

**2. « Non détecté » n'est pas « absent ».**

> (1) Aucune fibre d'amiante n'a été détectée, l'échantillon objet de l'essai
> peut éventuellement renfermer une teneur en fibre d'amiante **inférieure à la
> limite de détection**.

Et la limite est écrite plus haut, deux fois :

> La détection de fibres d'amiante est garantie si la teneur est **supérieure ou
> égale à 0,1 % en masse**.

**C'est exactement la leçon de la classe 0 du plomb** — « sous le seuil » n'est
pas « absence » — mais écrite ici **par le laboratoire lui-même**, en note de bas
de page, dans le seul document que personne ne lit. Un produit qui restitue
« pas d'amiante » sur la foi d'un rapport d'essai dit plus que le laboratoire.

## ⚠️ Deux défauts de fabrication imprimés dans le texte

```
RAPPORT D'ESSAI N° IT052412-1422 EN DATE DU ¤DATERAPPORT 09/12/2024
<ignorediff/>
…
¤VALIDEUR
Validé par : Maxime BECK Chef d'équipe
…
<ignorediff>
```

- **`¤DATERAPPORT` et `¤VALIDEUR`** : des champs de fusion non résolus, imprimés
  tels quels avant leur valeur ;
- **`<ignorediff/>` et `<ignorediff>`** : des balises techniques de l'outil de
  composition, imprimées dans la page.

Même famille que le `Souligne_Score 3` de LICIEL : **le gabarit laisse fuir son
code**. Conséquence pratique : la date du rapport se lit **après** un mot qui
n'en est pas un, et un lecteur qui prend « le mot qui suit `EN DATE DU` » rend
`¤DATERAPPORT`.

## Ce que ce document apporte au constat

C'est **le seul endroit du corpus** où l'on trouve :

- la **variété d'amiante** identifiée (la colonne existe ; sur l'exemplaire lu
  elle porte `---`, faute de détection) ;
- le **seuil de détection** (0,1 % en masse) ;
- la **méthode** (MOLP, META) et sa **norme** ;
- la **date de réception au laboratoire**, distincte de celle du prélèvement et
  de celle du rapport de repérage ;
- le **nombre de préparations et de supports** — c'est-à-dire l'effort d'analyse.

⚠️ **Aucun constat lu ne reprend ces éléments.** Le constat écrit « après analyse
en laboratoire » et s'arrête là. Le rapport d'essai est joint — ou pas — en
annexe 7.2, dont le corpus dit le plus souvent : « Aucun rapport d'essai n'a été
fourni ou n'est disponible ».

**Endroit de contrôle** : un constat qui conclut « après analyse en laboratoire »
et dont l'annexe 7.2 dit qu'aucun rapport d'essai n'est disponible s'appuie sur
une pièce qu'il ne montre pas.

---

# LES RAPPORTS SANS ÉDITEUR — ceux qu'on ne peut pas lire

*Ce n'est pas un gabarit : c'est l'absence de gabarit. **14 documents du corpus
amiante n'ont aucun texte extractible.** Ils se lisent, à l'écran, comme
n'importe quel constat ; à l'extraction, ils rendent des pages vides.*

## Le cas rencontré

Un ancien constat amiante d'un cabinet confrère, rangé dans un dossier client
sous « anciens diagnostics » : **huit pages, zéro ligne**. Signature
`iLovePDF` — un compresseur d'images, pas un éditeur de diagnostics.

⚠️⚠️ **Un volet sans texte se lit exactement comme un volet sans amiante.** Le
produit ne dit pas « je n'ai pas pu lire » : il dit « rien trouvé ». C'est la
seule faute de ce corpus qui ne vienne pas d'une phrase mal lue, mais d'une
phrase **jamais vue**.

## Ce qui le dit AVANT toute lecture

**La signature d'impression**, et elle seule :

| Signature | Nombre dans 2 500 PDF | Ce que c'est |
|---|---|---|
| `GPL Ghostscript · PDFCreator` | 30 | numérisation |
| `iLovePDF` | 13 | image recompressée |
| `— · —` (aucune métadonnée) | 9 | plans, pièces jointes |

C'est le seul repère qui protège d'une conclusion fausse, et il se lit **sans
ouvrir une page**.

## La règle qui en découle

**Un document dont le texte extrait pèse moins que quelques centaines de
caractères n'est pas un document sans amiante : c'est un document non lu.** La
liseuse l'inscrit au registre sous `numérisation sans texte`, et ne conclut
rien. Le produit doit faire de même — et le dire à l'acquéreur, qui a le droit
de savoir que sa pièce est illisible.

---

## Ce qui reste à lire

1. **Un volet avec de l'amiante en liste A** (flocages, calorifugeages, faux
   plafonds) — aucun des dix lus n'en porte. C'est là que vivent `Score 1/2/3`,
   la mesure d'empoussièrement et la grille de la liste A remplie.
2. ~~**Un volet avec prélèvement et rapport d'essai**~~ — **fait** : le RAAT
   lu porte 28 échantillons analysés par l'ITGA, dont quatre positifs. Reste à
   en voir un dans un **constat de vente**, où le § 5.2 « ne contenant pas
   d'amiante après analyse » n'a jamais été vu rempli.
3. ~~**Un repérage avant travaux (RAAT)**~~ — **fait** : cinq lus, section
   dédiée ci-dessus. Reste à voir un RAAT **avant démolition**, et un RAAT dont
   le `Programme détaillé des travaux` est renseigné.
4. **Imm'PACT et les six logiciels validés jamais vus** (ARGOS, CLIMAWIN,
   KLK DIAG, PLÉIADES, WINDPE, DJESERDIAG). Deux éditeurs lus, ce n'est pas
   encore le métier.
5. **Le désaccord interne du DTA BC2E** (§ 4.2 `AC1` contre § 5.2 `Néant`), à
   reprendre en lecture positionnelle.
6. **Un volet amiante d'un rapport NUMÉRISÉ** : 42 documents du corpus n'ont
   aucun texte extractible, et le silence de l'extraction s'y lit comme une
   absence d'amiante.


