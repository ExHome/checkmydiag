# Journal de lecture du corpus DGLM

Ce journal répond à trois questions, et à elles seules : **où en est-on**,
**qu'est-ce que la lecture a rapporté**, et **par où reprendre**. Ce que la
lecture apprend du métier va dans [`CARNET-DE-LECTURE.md`](CARNET-DE-LECTURE.md) ;
ici, on compte.

Il applique l'ordre de mission permanent du 19/08/2026 —
`BACK OFFICE/VERRIERE/01_ORDRES_DE_MISSION/ODM_LECTURE_CORPUS_DGLM.md` dans la
Dropbox.

> Rien d'identifiable ici. Le registre qui dit quels rapports ont été lus vit
> dans la Dropbox, avec le corpus, et ne contient que des empreintes —
> `05_CORPUS_RAPPORTS/registre-lecture.json`. Le dépôt est public.

---

## Point de reprise

**Au 19 août 2026, nuit.** Travail de nuit demandé jusqu'à 8 h : lecture des
diagnostics et entretien de la Dropbox, en cycles d'une demi-heure.

- Dernier document lu en entier : un **DTG** de mise en copropriété (35 pages)
  — le premier document d'immeuble du carnet. Avant lui, deux DDT complets
  (location et vente) pour le volet **électricité**.
- **Périmètre fixé le 19/08** : les diagnostics classiques de la **vente et de
  la location**, et eux seuls. RAAT, avant-démolition, DTA, DTG et PPPT
  attendent leur tour — ordre de passage, pas abandon. Les rapports d'essai de
  laboratoire, factures et attestations ne sont pas des diagnostics et ne se
  lisent pas.
- **Reprendre par** : les diagnostics classiques, la copropriété passant après
  — décision du 19/08. Faits : plomb (22/22), amiante (19/19), termites
  (38/38), ERP (PPR approuvé annoncé 7 fois sur 7). Les six diagnostics
  classiques sont désormais mesurés, et la découpe de l'amiante est corrigée
  (1 volet trop court sur 20, contre 20). ~~Prochain chantier : vérifier si d'autres volets
  se ferment trop tôt.~~ → **fait, et clos par la mesure** (§37) : sept volets
  sur huit sont découpés juste, et les trente-trois ERP « trop courts »
  comptaient leurs annexes officielles. Rien à corriger.
- **À vérifier au texte avant tout contrôle** : le calendrier du DPE collectif
  (L126-31 du CCH, article 158 de la loi n° 2021-1104), cité par le DTG mais
  pas encore relu à la source. Légifrance n'a pas répondu aux adresses
  essayées le 19/08.
- **La déduction vente/location est faite et branchée** (§40, §42) : 50 dossiers
  sur 60 classés, et les fiches annoncent désormais « Validité : trois ans — ce
  dossier est un dossier de vente, et son rapport l'écrit lui-même ».
- **La rubrique G du gaz est remontée** (§43) : entretien de chaudière et
  ramonage non justifiés, conduit non visitable. 16 volets sur 18 en portent.
- **« Installation alimentée en gaz : NON » est dit** (§44) : 4 volets sur 17,
  avec la nuance selon qu'un DGI est constaté ou non.
- **La contradiction interne du gaz est signalée** (§45) : 4 volets sur 18.
- **Les autres agents du bois sont dits, avec leur réserve** (§57) : écartés du
  compte des termites, ils ne sont plus tus pour autant — **13 volets sur 40**
  en portent, et le rapport écrit lui-même que ce constat vaut « pour
  information », sans nature ni lieu, une recherche NF P 03-200 existant à
  part. Zéro écart, zéro alerte à tort.
- **TypeScript strict est vert** : deux dettes soldées — un import mort laissé
  par le chantier vente/location, une branche jamais atteinte dans
  `preciserValidite`, et un littéral de test incomplet depuis l'ajout des
  schémas.
- **La couverture est mesurée** (§46) : 375 fiches sur 391 portent un verdict
  utile, soit **96 %**, sur cent dossiers analysés de bout en bout.
- **Les huit fiches ERP muettes sont réglées** (§47) : elles étaient fabriquées
  à partir de la grille des prestations, et le vrai rapport était absent.
  Couverture : **375/383, soit 98 %**.
- **Dire ce qui manque est fait** (§48) : 44 dossiers sur 100 portent au moins
  un manque signalé, et zéro réclamation à tort.
- **Les réclamations amiante et plomb sont vérifiées** (§49) : 19 sur 19
  reposent sur une année réellement écrite au document.
- **La revue « code contre carnet » est faite** (§52) : un seul manque, le
  radon, qui n'avait aucune notion alors que le produit l'annonce.
- **Le seuil plomb est écrit** (§53), avec la stratégie de mesurage et le sens
  de « non mesurée ».
- **Le filtre de sélection est corrigé** (§55) : il excluait tout dossier
  contenant un constat amiante de vente. La lecture ramène de nouveau des
  dossiers complets.
- **La confusion termites / autres agents est corrigée** (§56) : 7 fausses
  alertes sur 9 annonces, ramenées à zéro.
- **Le corpus ne peut plus entrer dans le dépôt** (§58) : cinquante et une pages
  de rapport s'y sont écrites cette nuit, entre deux commits — le `.gitignore`
  excluait les PDF, pas leur transcription. Bouché, et tenu par un test qui
  regarde ce que git suit réellement, pas ce que le `.gitignore` déclare.
- **Les verdicts ne débordent plus d'un volet sur l'autre** (§59) : 9 verdicts
  électriques sur 334 parlaient d'arrêté préfectoral — le tableau de synthèse ne
  ponctue pas ses cellules, et le recollage allait jusqu'au premier point. Deux
  défauts corrigés (fermeture au changement de prestation, raison sociale non
  prise pour un pied de page) ; **0 débordement, et 2 conclusions rendues** à
  des volets qui n'en avaient plus. Couverture 98 % → **99 %**.
- **Septième sonde menteuse** (§60) : elle accusait le moteur de six faux
  termites, en portant encore la définition que le moteur venait d'abandonner.
  Quand une correction change une définition, chercher qui d'autre porte
  l'ancienne.
- **La zone d'arrêté préfectoral est dite** (§61) : 32 volets sur 39 portent le
  champ, **17 en zone délimitée** et 15 « Néant ». Le produit ne lisait que la
  réponse négative, et seulement quand elle tenait seule sur sa ligne. 32/32,
  zéro écart. La fiche dit maintenant de quel côté tombe CE bien, et rappelle la
  déclaration en mairie quand des termites sont constatés.
- **Le corps de l'amiante est lu** (§62), premier chantier sous l'ordre de
  mission maître du 20/08 : le produit citait **cinq faux matériaux** — textes
  réglementaires, organisme certificateur, intitulés de grille — et perdait le
  vrai parce que sa localisation faisait 61 caractères contre une limite de 60.
  C'est désormais la rubrique du rapport qui délimite, sans repli. Et
  l'**état de conservation** est dit : 0/4 → **4/4**, zéro faux matériau
  affiché.
- **Huitième sonde menteuse** : deux sondes comptaient la *présence* d'un
  matériau, jamais sa justesse. Un faux matériau compte comme un matériau.
- **Les repères notariaux sont mesurés** (§63), sous l'ordre de mission « tu es
  notaire » : sur 70 dossiers, quatre repères sont à **zéro** — certification de
  l'opérateur (47 rapports le portent), assurance (60), impartialité (28),
  désignation du lot (70).
- **La désignation du lot est lue** : **0 → 68 sur 70**, zéro erreur. Une liste
  noire de rubriques ne tenait pas ; la liste blanche — ce qui ressemble à une
  désignation — tient. Onze maisons individuelles reconnues comme telles.
- **Neuvième sonde menteuse** : elle annonçait 82 % de restitution pour
  l'assurance en trouvant une phrase de l'ERP sur le coût des assurances. Avec
  un motif large, les valeurs basses sont fiables, les hautes ne le sont pas.

> **Prochain chantier** : les trois repères notariaux encore à zéro —
> **certification** de l'opérateur (47 rapports sur 70 la portent), **assurance**
> et sa date de validité (60), **impartialité** (28). Un diagnostic signé par un
> opérateur non certifié ou non assuré n'a pas la même valeur, et le notaire le
> vérifie avant tout le reste. Ensuite : le corps du plomb (798 lignes par volet,
> 4,1 faits), puis la mérule.

## Compteurs

| | Total |
|---|---|
| Rapports lus en entier | 9 |
| Volets lus page à page | 30 |
| Volets et documents lus page à page | 9 |
| Erreurs de moteur trouvées par la lecture | 7 majeures |
| Corrections livrées | 42 |
| Tests de non-régression ajoutés | 113 |
| Fausses alertes de mes propres sondes, écartées avant annonce | 9 |
| Sondes de justesse écrites | 9 |
| Notions métier versées au produit | 6 |
| Fiches versées à la Dropbox | 2 |
| Points ouverts au carnet | 16 |

## Couverture par diagnostic

Ce que « lu » veut dire ici : le volet a été lu page à page, pas survolé.

| Diagnostic | Volets lus | Justesse mesurée | État |
|---|---|---|---|
| Électricité | 3 | **60/60** verdicts justes (contre 17/31) | catalogue démasqué et rendu robuste aux libellés longs |
| Gaz | 4 | **7/7** verdicts justes (contre 0/3) | rubrique E lue juste ; rubrique G et « installation non alimentée » restent à remonter |
| DPE | 3 | **2 %** de muets (contre 4 %) | annexes rattachées : 7 volets courts sur 58, contre 58 |
| ERP | 9 | **1/63** faux risque techno (contre 49/63) ; argile rattrapée **55/55** | le formulaire vierge n'est plus lu comme un constat |
| Plomb | 2 | **22/22** verdicts justes | le moteur est bon ; la validité du constat positif était fausse, corrigée |
| Amiante | 6 | **19/19** verdicts justes, **4/4** état de conservation | le corps est lu : matériau, localisation, suite et état ; zéro faux matériau affiché |
| Termites | 4 | **38/38** verdicts justes, **40/40** autres agents, **32/32** zone d'arrêté | les deux constats sont distingués ; la zone d'arrêté et la déclaration en mairie sont dites ; la mérule reste à restituer |
| Surface | 2 | — | Boutin et Carrez distingués |
| **DTG** | **1** | — | structure, curatifs, rubriques vides et cinq points de vigilance ; notions versées au produit |
| *(découpe)* | 20 volets amiante | **1/20** trop courts, contre 20/20 | le titre courant manquait aux marqueurs |
| PPPT, DTA, RAAT, DPE collectif | 0 | — | **jamais ouverts** — le corpus en contient |

## Ce que chaque séance a rapporté

### 19 août 2026 — l'électricité

**Deux dossiers lus en entier** : un DDT de location de 43 pages (janvier 2023,
sans anomalie électrique) et un DDT de vente de 248 pages (octobre 2024, sept
volets, cinq domaines en anomalie).

**Ce que la lecture a trouvé, et que douze sondes vertes avaient manqué :** la
liste « Anomalies avérées selon les domaines suivants » est le catalogue de
l'arrêté, imprimé partout, et non un constat. Le moteur la lisait comme un
relevé et annonçait un défaut électrique à **quatorze logements sur trente et
un qui n'en avaient aucun**.

**Corrections livrées :**

1. le catalogue est reconnu et ne conclut plus rien (`estCatalogueDomaines`) ;
2. les domaines réellement constatés sont lus dans le tableau qui les numérote
   (`domainesConstates`), ancré sur son en-tête pour ne pas confondre avec le
   tableau voisin qui décrit l'installation au lieu de la juger.

**Mesure, avant et après**, sur trente et un volets d'électricité dont la page
de synthèse écrit la conclusion en clair :

| | Justes | Faux |
|---|---|---|
| Avant | 17 | **14**, tous en fausse alerte |
| Après | **30** | 1, à instruire |

Et le produit dit désormais *lesquels* des six domaines sont en cause, non plus
seulement combien.

**Six tests** verrouillent ces acquis, dont deux tirés mot pour mot des
rapports lus.

### 19 août 2026 — le premier document d'immeuble

**Un DTG lu en entier** : 35 pages, mise en copropriété de quatre lots, trois
bâtiments. Autre éditeur que les dossiers de logement, autre mise en page,
autre logique — il ne rend pas un verdict mais un calendrier de dépenses sur
dix ans, et son lecteur est une assemblée générale.

**Ce que la lecture a trouvé :** un défaut d'extraction qui ne casse rien et
renvoie zéro. Le générateur code les ligatures **fi, fl, ffi** en fragments
isolés — « dé fi nition », « identi fi ant », « a fi n » — et **52 mots** du
seul rapport lu en sortaient éclatés. Aucun motif de recherche n'y survit, et
une sonde qui mesure ce que les DTG mentionnent aurait répondu « rien » sans
que rien ne paraisse cassé.

**Correction livrée :** les fragments qui ne sont qu'une ligature sont recollés
à la reconstruction des lignes. Mesure **52 → 0**, aucune régression sur les
dossiers de logement (électricité toujours à 30/31), quatre tests.

**Versé au produit :** quatre notions de copropriété — DTG, curatifs, PPPT,
DPE collectif — avec les deux pièges qui comptent : le **niveau 1 est le plus
grave**, et le montant ne dit rien de la gravité.

**Versé à la Dropbox** (`03_METIER_DIAGNOSTICS/`) : la fiche de lecture du DTG
et un mémo de synthèse des pièges, document par document. L'état de référence
de la bible a été actualisé.

**Cinq points de vigilance** relevés dans le dossier lu, dont deux adresses
différentes pour un même bien et un champ d'assurance vide sur les 34 pages —
alors que l'attestation jointe en annexe est complète. Deuxième éditeur, même
règle : **le pied de page ne dit rien, l'annexe fait foi.**

### 19 août 2026 — le gaz, enfin mesuré

Le volet gaz du dossier de vente lu page à page. Sa justesse n'avait jamais pu
être mesurée : la sonde cherchait « L'installation intérieure de gaz » quand la
page de synthèse écrit seulement « L'installation comporte des anomalies de
type A2 ». Elle ne rendait pas un mauvais chiffre — elle ne rendait **rien**.

Sonde corrigée, mesure faite : **0 juste sur 3**, et toujours dans le sens le
plus dangereux — « aucune anomalie » là où le rapport demande une réparation
dans les meilleurs délais.

**Cause :** dans la rubrique « E. — Anomalies identifiées », trois sortes de
lignes citent A1, A2 ou DGI — la légende de colonne, les notes de bas de
tableau, et le constat. Une seule constate. La lecture les distingue désormais
par leur forme, jamais par leur position.

**Après : 7 sur 7 justes.**

**Et l'échantillon élargi à 120 dossiers a montré autre chose** : quatre
rapports d'électricité relèvent un point unique — une broche de terre non
reliée — assorti d'une **mesure compensatoire**, et concluent en synthèse
« aucune anomalie ». Les deux disent vrai. Le produit suivait le tableau et
contredisait le rapport ; il suit maintenant sa conclusion et dit le point
compensé dans les faits. **Électricité : 59 justes sur 60.**

Huit tests supplémentaires, dont un tiré mot pour mot de la rubrique E lue.

### 19 août 2026 — le plomb, et trois erreurs qui n'existaient pas

**Mesure : 22 verdicts justes sur 22.** Le moteur du plomb est bon — c'est le
premier diagnostic à sortir sans faute de la mesure.

Il a fallu trois sondes pour l'établir, et les deux premières accusaient à
tort. La première cherchait la conclusion dans les cinq premières pages et
lisait la **grille des quarante prestations du cabinet** — le piège n°1 du
carnet, commis en écrivant l'outil censé le déjouer. La seconde lisait la
**gravité** au lieu du verdict : « Du plomb est présent, mais tous les
revêtements sont en bon état » porte la couleur « bon », et c'est justifié.

Trois erreurs annoncées, zéro réelle, aucune publiée. Une sonde se vérifie sur
un cas connu avant de servir de juge.

**La vraie erreur était ailleurs**, et la lecture l'a trouvée : le produit
annonçait « sans limite de durée à la vente » dès qu'aucune unité n'était
classée 3. Or **une seule unité de classe 1 rend le constat positif**, et un
constat positif ne vaut qu'un an à la vente — c'est la présence de plomb qui
compte, pas sa dégradation. Un vendeur s'y fiant aurait présenté un constat
caduc à la signature.

Le savoir était déjà au carnet (§9) et au référentiel (R. 1334-11) ; le code ne
l'avait pas suivi. **Un acquis n'est acquis que là où il est appliqué.** Trois
tests le verrouillent désormais.

Relevé au passage : le CREP sort ses croix **en texte** — « X Avant la vente » —
et c'est la première marque lisible qui dise vente ou location.

### 19 août 2026 — l'amiante, et la pire fausse alerte du corpus

Le produit affichait « **Amiante repérée : Code postal, ville : . 33360
CAMBLANES ET MEYNAC (France), et 2 autres** » sur des rapports dont la
conclusion dit qu'il n'a rien été repéré. Ailleurs, le « matériau » cité était
la raison sociale du cabinet.

**Mesuré : 17 volets sur 19.** Deux verdicts justes sur dix-neuf.

Deux fautes superposées. Le motif qui lit les matériaux — un intitulé, puis sa
localisation entre parenthèses — a la même forme qu'une ligne d'adresse, et le
volet commence par sa page de couverture. Surtout, le verdict citait ce
« matériau » **sans vérifier que le rapport en avait repéré un** : la gravité,
elle, venait de la conclusion. La carte annonçait donc de l'amiante avec une
pastille verte, et se contredisait dans le même bloc.

**Après : 19 sur 19.** Trois tests tiennent, dont un qui vérifie que le verdict
et la gravité s'accordent.

**Une mesure nouvelle, et un chantier ouvert** : le constat amiante annonce sa
propre pagination — « le présent rapport est constitué de 11 pages, la
conclusion est située en page 2 ». Sur **20 volets sur 20**, la découpe leur
attribue moins de pages qu'ils n'en revendiquent, **15 en moyenne**. Le verdict
reste juste puisqu'il vient de la conclusion, mais la liste détaillée des
matériaux n'est jamais lue : quand il y a de l'amiante, le produit ne peut pas
dire lequel.

### 19 août 2026 — les termites, et le compte des sondes

**38 verdicts justes sur 38.** Troisième diagnostic sans faute, après le plomb
et l'amiante corrigé. Le tableau se lit en linéaire : ce volet ne piège pas.

Ce que la lecture ajoute sans corriger : le rapport dit **si le bien est en
zone d'arrêté préfectoral** — l'état termites n'est exigible que là —, le même
arrêté délimite les zones de **mérule**, et la présence de termites oblige à
une **déclaration en mairie**. Trois informations que Verrière ne restitue pas.

**Le compte des sondes est sévère** : quatre outils de mesure ont accusé le
moteur à tort dans la même séance. Aucune erreur n'a été publiée, chaque écart
ayant été ouvert avant d'être annoncé. La leçon : sur ce corpus, il est plus
facile d'écrire une sonde fausse qu'un extracteur faux, parce qu'une sonde ne
casse rien — un zéro se lit comme un résultat.

### 19 août 2026 — l'état des risques, et la croix qui change de côté

Vingt pages lues page à page, sur un bien de Bordeaux **en zone inondable avec
prescriptions de travaux**.

**La découverte : deux mises en page coexistent, et elles sont inverses.** Dans
le millésime 2023, la croix suit la phrase — « … PPRn approuvé  oui non x ».
Dans celui de 2024, la réponse est sur la ligne **précédente** — « non x »,
puis la phrase. Mesuré sur 63 volets : **28 contre 21**, et 14 illisibles.

Une lecture qui chercherait la croix après la phrase lirait donc, sur la
seconde forme, le mot resté seul en fin de ligne : la réponse opposée. Sur le
dossier lu, cela aurait annoncé « pas de PPR » à un bien en zone inondable.

**Le produit ne s'y trompe pas** : il lit le tableau de synthèse du volet, pas
l'imprimé. Vérifié — sur les sept biens en PPR approuvé de l'échantillon, il le
dit sept fois. L'imprimé officiel reste un gisement inexploité, pas une source
d'erreur.

Trois autres acquis : les **prescriptions de travaux sont conditionnelles** (un
garage souterrain, une cuve à combustible) et non imposées au logement ; la
**case argiles du vendeur reste vierge** sur deux éditeurs et deux millésimes,
ce qui en fait un défaut structurel et non un oubli ; et un **risque nouveau**
apparaît dans les ERP 2024, le recul du trait de côte, que Verrière ne connaît
pas.

### 19 août 2026 — la découpe de l'amiante, et un rapport qui se compte

La cause du volet tronqué était d'une simplicité désarmante : ce générateur
répète son titre courant en tête de chaque page — « Constat de repérage
Amiante n° … » — et ce titre **ne figurait pas parmi les marqueurs de
découpe**. La section se fermait après la conclusion ; les neuf pages
suivantes, celles qui portent la liste des matériaux, partaient hors section.

**Mesuré : 1 volet sur 20 reste plus court que ce qu'il annonce, contre 20 sur
20.** La justesse ne bouge pas (19/19) et aucun autre diagnostic n'est touché —
électricité 30/31, gaz 3/3, plomb 13/13. Deux tests verrouillent la découpe,
dont un qui vérifie qu'elle s'arrête bien au rapport suivant.

**La leçon de méthode** : ce défaut était invisible depuis les verdicts, qui
restaient justes. C'est le rapport lui-même qui a dénoncé la découpe, en
annonçant sa pagination. Un document qui se compte est un document qui se
vérifie — à chercher ailleurs.

**Incident à noter** : la correction de la fausse alerte amiante, livrée une
heure plus tôt, avait été écrasée dans `reperages.ts` par une autre session
travaillant sur le même dépôt. Les trois tests écrits pour elle l'ont
immédiatement signalé. Sans eux, la régression repartait en production.

### 19 août 2026 — lecture continue, trois cas d'espèce

Deux dossiers de plus, lus dans le périmètre vente/location.

**Un ERP de 111 pages dont 83 de règlement de PPR annexé** : le rapport en
occupe douze, le reste est le règlement de prévention, l'arrêté préfectoral et
la fiche d'information, signés des services de l'État. La découpe a raison de
ne pas les rattacher — mais il faudra savoir le dire, plutôt que de laisser
croire à 99 pages non exploitées.

**Deux plans de prévention sur le même risque** : un PPRn Inondation approuvé
en 2005 et un autre prescrit en 2012, tous deux concernant le bien, l'un avec
prescriptions de travaux et l'autre sans. Lire « le » PPR au singulier fait
perdre la plus contraignante des deux.

**Les sites pollués voisins se comptent par centaines** : 2, 100 et 118 sur les
trois dossiers lus. À Bordeaux intra-muros, la centaine est la règle — annoncer
le chiffre sans repère serait alarmiste.

Un RAAT a été ouvert puis écarté : il relève du code du travail et d'un
programme de repérage bien plus large (dix familles au lieu des listes A et B).
Il est hors périmètre pour le moment, et inscrit au registre comme « vu ».

### 19 août 2026 — le formulaire de l'ERP, troisième catalogue démasqué

Un état des risques de Pessac portait, dans le verdict du produit, un « risque
technologique » absent du rapport. La cause est celle qu'on connaît désormais
par cœur : l'imprimé officiel énumère les rubriques que la loi impose, qu'elles
concernent le bien ou non, et ses lignes commencent par « L'immeuble est
situé » — donc le filtre des affirmations les gardait.

**Mesuré : 49 volets sur 63. Pas un seul dossier ne porte de PPRt concerné.**

Deux marques reconnaissent un formulaire, quel que soit le risque : les deux
réponses côte à côte (« oui non ») et l'échelle énumérée en entier (« zone 5
zone 4 zone 3 »). En les écartant, le faux risque technologique tombe à **1**,
la pollution des sols à **0**, et l'inondation reste annoncée **26** fois —
la détection utile est intacte. Quatre tests le verrouillent.

**Et un cas qui justifie le produit à lui seul** : sur ce même dossier, le
tableau déclare l'argile en **aléa fort**, et les conclusions rédigées du
rapport ne citent que la sismicité. Un lecteur qui s'arrête aux conclusions ne
saura jamais que son bien est en aléa fort. Verrière le dit.

### 19 août 2026 — le DPE emportait sa fiche technique

Le contrôle de pagination, appliqué au DPE : **58 volets sur 58** étaient plus
courts que ce qu'ils annoncent, de près de sept pages. Ce qui se perdait est la
**fiche technique du logement** — type de bien, année, surfaces, matériaux,
systèmes.

Le DPE ne répète pas son titre sur ses annexes : ses pages ne se reconnaissent
qu'à leur pied, « Dossier : 22/IMO/0549  Page 8 / 11 », où le numéro change à
chaque feuille. Aucun fragment fixe ne pouvait l'attraper — c'est une forme,
pas un mot. La découpe sait désormais reconnaître une forme quand un rapport ne
répète pas son titre.

**Après : 7 volets courts sur 58**, et le DPE ne sort sans lettre que dans
**2 %** des cas, contre 4 %. Deux tests de plus.

Avec l'amiante, cela fait deux découpes corrigées par le même moyen : **le
document se compte lui-même**. C'est le contrôle le plus rentable rencontré
jusqu'ici, et il reste à le chercher partout où il existe.

### 19 août 2026 — ce que Verrière fait de plus utile, enfin mesuré

Sur 63 états des risques : **55 déclarent l'argile** dans leur tableau de
synthèse, **3 seulement la citent dans leurs conclusions rédigées**, et
**Verrière la dit dans 42**.

Cinquante-deux rapports sur cinquante-cinq taisent donc, dans leur conclusion,
un risque qu'ils déclarent quatre pages plus haut. Ce n'est pas une négligence :
les conclusions ne reprennent que les procédures officielles, et l'argile vit
dans le tableau « donné à titre informatif ». Sauf que c'est le risque n°1 de la
région, qu'il fissure les maisons, et qu'il déclenche depuis 2024 une obligation
d'étude géotechnique.

C'est l'argument produit le plus fort mesuré à ce jour. Les treize dossiers où
Verrière se taisait tenaient à une **quatrième écriture** — le tableau
Géorisques sort le détail avant le nom de sa propre ligne : « Le bien se situe
dans une zone d'aléa Moyen. » puis « Retrait / gonflement des argiles ». Une
fois lue, **55 sur 55**.

**Contre-épreuve faite** : sur un bien dont le tableau porte « PPRn Inondation
approuvé | non », le produit ne dit pas l'inondation. La correction du
formulaire tient dans les deux sens.

### 19 août 2026 — le catalogue échappait encore

Un dossier complet de six volets a montré que `estCatalogueDomaines` laissait
passer des catalogues entiers : il exigeait cinq intitulés sur six, et deux
échouaient parce que les libellés **recollés** dépassent la distance tolérée par
les motifs. Le produit annonçait alors six anomalies à une installation qui n'en
avait aucune.

Distances portées à cent quarante caractères, et seuil assoupli quand la liste
est complète — six entrées dont quatre reconnues. **60 verdicts électricité
justes sur 60**, 7 sur 7 au gaz.

**Une classe de piège nouvelle** : l'extraction coupe les mots. « sur chaque
circuit » sort en « sur ch aque circuit ». Ce n'est pas une ligature, c'est un
espace inséré au milieu d'un mot par la justification. Les motifs longs doivent
rester tolérants.

Et le fait « Matériau repéré : QUALIXPERT 17 rue Borrel… » s'affichait encore
sous un verdict « aucun matériau » : le détail ne paraît plus que si le rapport
a repéré quelque chose.

**Note d'atelier** : un test de la charte des schémas est rouge, sur un
composant en cours de modification par une autre session. Il n'est pas de ce
chantier et n'a pas été touché.

### 19 août 2026, nuit — mise en place du travail continu

Cycle arrêté pour la nuit, une demi-heure : lire un dossier entier → vérifier ce
que Verrière en dit → mesurer avant de conclure → corriger avec un test →
consigner → inscrire au registre → commiter → entretenir la Dropbox une fois
sur trois.

**Sélection des dossiers améliorée** : le corpus est plein d'états des risques
isolés qui n'apprennent plus rien après le troisième. Les candidats sont
désormais filtrés sur leur pagination — un dossier complet compte au moins
trente-cinq pages, et le nombre de pages se lit sans extraire une seule ligne.

**Deux DPE lus sans rien trouver à corriger** : un logement classé D et un
studio de 20 m² classé C, tous deux justes, avec leurs réformes correctement
datées — dont celle du facteur de conversion de l'électricité, au 1ᵉʳ janvier
2026. C'est le premier diagnostic sur lequel deux lectures d'affilée ne
révèlent rien : signe que le DPE est solide.

### 19 août 2026, nuit — le chantier des découpes, clos sans correction

Le contrôle de pagination généralisé à tous les volets : **carrez, DPE,
termites, électricité, plomb et gaz sont découpés juste** — zéro volet plus
court que ce qu'il annonce. L'amiante en garde deux sur treize.

Les **trente-trois ERP « trop courts » n'en sont pas** : l'état des risques
compte ses annexes dans son total — arrêté préfectoral, fiches d'information,
parfois le règlement du PPR en quatre-vingt-trois pages — et la découpe les
exclut à raison.

Restait à vérifier le contenu utile. La conclusion rédigée manque à la plage
neuf fois sur cinquante ; les neuf cas ouverts un par un montrent qu'elle est
**en page 3, dans la synthèse du dossier, avant le volet**. Le moteur lit la
synthèse séparément : rien n'est perdu.

**Contre-épreuve** : 45 dossiers sur 45 se voient dire l'argile, zéro fausse
alerte technologique, zéro pollution des sols inventée, 19 inondations
conservées.

**La leçon** : un écart mesuré n'est pas un défaut tant qu'on n'a pas ouvert un
cas. Trois sondes ont annoncé ici un problème inexistant, et la correction
juste était de ne rien corriger.

### 19 août 2026, nuit — l'arrêté préfectoral du termites

Un rapport termites de sept pages affichait « Arrêté préfectoral : pris en
application de l » — un morceau de la question, pas la réponse. Le rapport
interroge sur une ligne et répond « Néant » sur la suivante.

Ce champ n'est pas un vide : l'état termites n'est exigible à la vente que dans
les communes délimitées par arrêté, et un « Néant » dit que **la commune n'y est
pas**. Le produit affiche désormais « aucun — la commune n'est pas en zone
délimitée par arrêté », ou le numéro quand il y en a un.

Le premier test a échoué sur une **apostrophe typographique** — la garde
consignée le matin même. Une règle écrite ne se respecte pas toute seule ; le
test l'a rattrapée en trois secondes.

### 19 août 2026, nuit — la mesure compensatoire, expliquée

Un rapport peut relever une anomalie, la dire compensée, et conclure que
l'installation n'en comporte pas : les deux disent vrai. Le produit le disait
déjà ; il l'explique désormais, en trois idées — ce que c'est, que **compensé
ne veut pas dire réparé**, et que **la compensation peut tomber** si le
dispositif qui protège disparaît.

La troisième n'est écrite dans aucun rapport. Elle se déduit du mécanisme, et
c'est ce qu'un lecteur ne peut pas trouver seul.

**Un point ouvert se referme** : le rapport dont la synthèse disait « aucune
anomalie » quand le volet portait six libellés était le catalogue non reconnu.
Mesure du cycle : **24 verdicts électricité justes sur 24**, 5 sur 5 au gaz.

Un rapport termites lu au passage, juste, sans rien à corriger — la correction
de l'arrêté préfectoral du cycle précédent s'y vérifie.

### 19 août 2026, nuit — vente ou location, le dossier le dit

Dernier point ouvert de l'électricité, et il commande toutes les durées : trois
ans pour l'électricité et le gaz à la vente, six ans à la location ; un an pour
un constat plomb positif à la vente, six ans à la location.

Rien ne l'écrit sur la page de garde, mais le dossier se trahit — la durée que
le rapport annonce lui-même, l'article 3-3 de la loi de 1989 qu'il cite pour la
location, la surface demandée (Carrez pour vendre, habitable pour louer), et la
case du CREP cochée en texte.

**Mesure : 37 dossiers vendus, 13 loués, 8 indécis, 2 muets sur 60.**

**Une cinquième piste essayée et abandonnée** : les parties nommées par l'état
des risques. L'imprimé porte « bailleur » et « locataire » même pour une vente,
et huit dossiers en devenaient contradictoires. C'est le piège du formulaire
pour la quatrième fois — un intitulé imprimé partout ne dit rien du dossier
qu'on lit.

**Les huit indécis ne sont pas un échec** : ils portent réellement les deux
surfaces, un certificat Carrez et une attestation habitable. Se taire est alors
la seule réponse juste.

### 19 août 2026, nuit — l'ERP qui ne dit plus « Mode EDITION »

Un millésime de décembre 2025 change d'en-tête : ses pages ne portent plus que
la date. La découpe se fermait à la troisième page, et les **conclusions
rédigées** tombaient en page seize — un **risque sismique** s'y perdait.

Ce qui reste stable est en bas : « Réf. 25/IMO/1047N – Page 17 / 17 ». Une
forme, comme le « Page 8 / 11 » du DPE ; le mécanisme existait déjà.

**Mesure : conclusions hors plage, 9 sur 50 → 0. Inondations détectées, 19 →
22.** Aucun autre volet dégradé, zéro faux risque technologique.

**Troisième fois que la même leçon revient** — amiante, DPE, état des risques :
quand un rapport ne répète pas son titre, il se reconnaît à son pied de page, et
la marque est une forme numérotée. Regarder le pied avant l'en-tête quand une
section paraît courte.

### 19 août 2026, nuit — les durées de validité, branchées

« Validité : trois ans à la vente, six ans à la location » était vrai et
laissait le lecteur choisir. Les fiches disent maintenant **la durée qui
s'applique**, et d'où vient la certitude : « ce dossier est un dossier de vente,
et son rapport l'écrit lui-même ».

Quand le dossier ne tranche pas — il porte les deux surfaces —, les deux durées
restent énoncées.

**Une erreur de sens attrapée en vérifiant** : la première version déduisait
« constat positif » de la gravité affichée et se trompait de sens ; un constat
plomb positif s'y voyait annoncer « sans limite de durée », l'inverse exact de
ce qu'il faut dire. La correction n'a pas été de mieux calculer, mais de **ne
plus calculer** : la phrase portait déjà le résultat.

Recalculer ce qu'on a sous la main, c'est se donner une seconde chance de se
tromper.

### 19 août 2026, nuit — la rubrique G du gaz

Repérée au §23 comme « un gisement que personne ne lit », elle est désormais
remontée : **entretien annuel de la chaudière non justifié, ramonage des
conduits non justifié, conduit de raccordement non visitable**. Ces obligations
sont dues par l'occupant, et sans justificatif l'assureur peut discuter sa
garantie après un sinistre.

**La fréquence aurait pu tromper** : seize volets sur dix-huit en portent. C'est
exactement le profil d'un formulaire — et c'est ce qui a induit en erreur quatre
fois déjà. Mais **deux volets sur dix-huit n'en portent aucune** : la rubrique
varie, ce sont bien des constats. Le taux s'explique simplement, les
propriétaires ne fournissent presque jamais ces justificatifs le jour de la
visite.

Première fois qu'une fréquence de 89 % survit à l'examen — et ce qui l'a sauvée
n'est pas un raisonnement, ce sont les deux dossiers qui ne la portent pas.

### 20 août 2026, nuit — le gaz coupé le jour de la visite

Quatre volets sur dix-sept portent « Installation alimentée en gaz : NON ».
Aucun essai n'a alors lieu — ni mesure du monoxyde, ni contrôle en
fonctionnement — et « aucune anomalie » veut dire « rien constaté », pas
« installation vérifiée ». Le produit le dit désormais, et descend la gravité à
« attention ».

**Deux causes opposées derrière le même « non »** : le gaz coupé depuis
longtemps, où rien n'a pu être essayé ; ou fermé **par l'opérateur le jour même**
après un danger grave et immédiat — et là, l'installation a bel et bien été
examinée. Dire « aucun essai n'a pu être fait » y serait faux et minimiserait le
danger. La précision change selon qu'un DGI est constaté.

Troisième champ à recouvrir deux causes opposées, après « sans rapport / sans
date » à l'amiante et « refus assumé / échec de lecture » au DPE. **Un champ ne
se lit jamais seul.**

Deux erreurs attrapées par les tests au passage : une constante utilisée avant
sa déclaration — que la suite du corpus n'atteignait pas — et un fixture qui
plaçait un constat hors de sa rubrique.

### 20 août 2026, nuit — le rapport qui se contredit

Repérée au §23, mesurée aujourd'hui : **quatre volets gaz sur dix-huit** portent
deux affirmations incompatibles à deux lignes d'écart. La rubrique F dit
« Néant » — tout a pu être contrôlé — et la rubrique G dit que certains points
ne l'ont pas été, en en tirant une conséquence juridique.

Le produit ne peut pas savoir laquelle dit vrai : il ne verra jamais le
logement. Mais il fait poser la question — « à faire préciser ». Ni rassurer,
ni inquiéter : rendre visible ce qui ne colle pas.

**La fiche gaz d'un même dossier porte maintenant quatre choses qui n'y étaient
pas il y a vingt-quatre heures** : installation non alimentée, contradiction
interne, entretien et ramonage non justifiés, anomalies de type A2. Le même
document, lu autrement.

### 20 août 2026, nuit — la couverture, enfin mesurée

L'ordre de mission la demandait depuis le début. Cent dossiers analysés de bout
en bout, 391 fiches produites : **375 portent un verdict utile, soit 96 %**.
Aucun dossier ne ressort sans aucun diagnostic reconnu.

Carrez, amiante et plomb sont à 100 % ; électricité, termites et DPE entre 97 et
98 % ; **l'ERP à 90 %** et le gaz à 87 %. L'assainissement est à zéro sur deux
volets — trop rare pour justifier un chantier, cherché en vain sur cent
cinquante autres dossiers.

**Ce que le tableau dit d'autre** : le DPE porte 8,4 faits par fiche, l'amiante
0,9. L'écart n'est pas un défaut — un constat amiante négatif n'a presque rien à
dire — mais il montre où le lecteur trouvera de la matière. L'ERP, lui, est le
document le plus dense du dossier et n'en porte que 1,8 : c'est là qu'est la
marge.

**Pourquoi cette mesure manquait** : on mesurait la justesse volet par volet
sans jamais demander combien de fiches disent quelque chose. Un volet peut être
juste à 100 % et muet neuf fois sur dix.

### 20 août 2026, nuit — huit fiches fabriquées à partir d'une ligne

Les huit ERP muets du §46, ouverts un par un : la section faisait **une seule
page**, celle qui porte la fin de la grille des prestations du cabinet. La ligne
« Etat des Risques et Pollutions   Plomb dans l'eau   Radon » suffisait à ouvrir
un volet.

Et **dans les huit dossiers, le vrai état des risques était absent**. Le produit
affichait donc une fiche pour un document inexistant, en disant « nous n'avons
pas réussi à lire la liste des risques » — le lecteur comprend « le produit n'a
pas su lire » quand il faudrait comprendre « le document manque ».

Ce qui trahit le catalogue commercial, ce sont les intitulés qui ne sont les
titres d'aucun rapport : « Plomb dans l'eau », « Sécurité piscines »,
« Accessibilité Handicapés ». Trois suffisent.

**Fiches ERP : 82 → 74. Muettes : 8 → 0. Couverture : 96 % → 98 %.** Aucune
fiche utile perdue.

**Le vrai chantier apparaît là** : dire ce qui manque. L'absence d'un diagnostic
obligatoire est souvent plus utile à un acheteur que le contenu d'un diagnostic
présent.

### 20 août 2026, nuit — dire ce qui manque

Le contrôle des manques existait, mais **l'état des risques et le DPE y
échappaient** : ils ne dépendent pas de l'âge du logement et se trouvaient
derrière la garde qui exige de connaître l'année de construction.

**Le garde-fou a failli tout annuler.** Première mesure : quinze dossiers sur
cent se voyaient réclamer un DPE dont le numéro ADEME figure pourtant dans leurs
pages. Réclamer un rapport qui est sous les yeux du lecteur est pire qu'un
silence. On ne réclame donc plus que ce qui ne se trouve nulle part — mais la
première marque choisie pour l'ERP était son titre, qui figure dans la grille
des prestations de tous les dossiers. Le garde-fou supprimait alors toute
réclamation. **Cinquième fois que cette grille trompe** : seule la mention
légale prouve la présence du rapport.

**Résultat : 44 dossiers sur 100 portent au moins un manque** — 22 états des
risques, 15 amiante, 13 DPE, 10 plomb, 9 électricité — et **zéro réclamation à
tort**, vérifié par contre-épreuve sur les deux diagnostics ajoutés.

C'est le chantier le plus utile de la nuit : tout le reste améliorait la lecture
d'un document présent, celui-ci dit ce qui n'y est pas.

### 20 août 2026, nuit — l'année qui fonde les réclamations

Réclamer un repérage amiante ou un constat plomb repose sur l'année de
construction : si elle est mal lue, la réclamation est fausse. Vérification sur
dix-neuf réclamations : **dix-huit reposaient sur une année réellement écrite au
document**, la dix-neuvième portait « Avant 1948 **Altitude** ».

C'est le bug de la colonne voisine, déjà corrigé dans le DPE et qui subsistait
là où il compte le plus. **Une valeur salie reste lisible pour un humain, jamais
pour un contrôle** : « Avant 1948 Altitude » se comprend d'un coup d'œil, mais
la fonction qui en extrait un millésime pour décider n'y comprend rien.

Après correction : **19 sur 19**.

La leçon vaut pour toutes les extractions : ce champ s'affichait depuis des
semaines sans émouvoir personne — jusqu'à ce qu'il serve à **décider** quelque
chose. Le jour où une donnée cesse d'être affichée pour être utilisée, sa
propreté cesse d'être cosmétique.

### 20 août 2026, nuit — « 9/04/2026 »

Un rapport termites ne montrait aucune date dans sa fiche. Le document en porte
trois — mais le jour est écrit **sur un seul chiffre**, et tous les motifs du
produit exigeaient deux chiffres.

Ce n'est pas un détail d'affichage : la date décide de la **péremption**, et le
termites ne vaut que six mois. Sans elle, aucun contrôle de validité ne peut se
faire.

Sept motifs corrigés dans cinq fichiers, **plus les deux fonctions qui découpent
une date** — élargir la capture sans élargir le découpage aurait donné une date
lue mais incalculable. Deux tests vérifient qu'un rapport du 9 avril est bien
périmé au 1ᵉʳ décembre, et ne l'est pas au 1ᵉʳ mai.

**La rareté n'excuse rien** : aucun autre dossier de l'échantillon de cent ne
porte cette forme. Mais c'est un cas où le produit se tait sur une péremption
possible, et élargir un motif ne coûte rien.

### 20 août 2026, nuit — le mot de la classe 3 sur une classe 2

Un constat plomb affichait « 2 revêtements au plomb en **état dégradé** (classe
2) ». L'arrêté du 19 août 2011 nomme pourtant trois états distincts : non
dégradé en classe 1, **état d'usage** en classe 2, **dégradé** en classe 3.

Ce n'est pas une nuance de style : **c'est la dégradation qui déclenche
l'obligation de travaux** de l'article L. 1334-9. Annoncer « dégradé » sur une
classe 2 fait croire à des travaux obligatoires qui ne le sont pas.

Corrigé dans le verdict et dans les faits, qui portent désormais les mots de la
norme — « Dégradés » et « En état d'usage ».

**Ce que ce cas apprend** : le carnet porte ce tableau depuis le §9, relevé en
lisant la norme, et il était juste. Le code ne l'avait pas suivi. C'est la
deuxième fois après la validité du CREP positif. **Un savoir consigné n'est
acquis que là où il est appliqué** — et le carnet ne se vérifie pas tout seul.

### 20 août 2026, nuit — relire le code avec le carnet

Revue systématique des affirmations chiffrées du carnet, confrontées au code :
termites (validité six mois, déclaration en mairie), amiante (listes A et B
conclues séparément), plomb (cinq situations, seuils 50 % et 20 %) — **tout y
est**. Le code suit le carnet mieux que la première impression ne le laissait
craindre.

**Un seul manque, et il est sérieux** : le radon n'avait aucune notion. Le
produit annonce « radon (niveau 2) » dans ses verdicts, et le lecteur n'avait
rien pour comprendre.

C'est précisément là que le carnet avait relevé un piège avéré : la fiche
d'information annexée écrit « le niveau moyen dans l'habitat français est
inférieur à 100 Bq/m³ » et **ne cite jamais le seuil**, qui est de **300**.

La notion écrite dit le zonage (il porte sur la commune, pas sur le logement),
le seuil, le risque — exposition longue, deuxième cause de cancer du poumon — et
le geste qui ne coûte rien : aérer, vérifier les grilles. Elle lit la zone dans
le verdict et adapte son propos.

**La leçon** : relire le code avec le carnet prend une heure et trouve ce que la
lecture de mille dossiers ne trouverait pas. Lire un rapport révèle ce que le
produit lit mal ; relire le carnet révèle ce qu'il **ne dit pas du tout**.

### 20 août 2026, nuit — le seuil qui manquait

La notion des classes du plomb ouvrait sur « Classe 0 : **pas de plomb** ».
C'est faux et cela rassure à tort : la classe 0 signifie **sous le seuil**, pas
absence. L'arrêté du 19 août 2011 le fixe à **1 mg/cm²**, et il n'apparaissait
nulle part dans le produit.

Les quatre classes disent maintenant « sous le seuil » ou « au-dessus du seuil »,
ce qui rend l'échelle lisible d'un coup.

**Deux bribes ajoutées au rang 7** : la mesure ne casse rien — fluorescence X
posée contre la paroi, une mesure si elle dépasse le seuil, deux ou trois sinon —
et « non mesurée » n'est pas « non contrôlée », puisqu'il n'y a rien à mesurer
là où il n'y a pas de revêtement.

Cette seconde règle est au carnet depuis le §8, où elle avait coûté une erreur.
Elle était dans le moteur ; elle n'était pas dans ce que le lecteur peut lire.

### 20 août 2026, nuit — neuf anomalies annoncées, quatre réelles

Un dossier complet de 78 pages, six volets — le premier depuis longtemps.

**Le rapport répète la même anomalie mot pour mot** : trois fois « B7.3 d »,
mêmes remarques, mêmes localisations, même photo. Huit volets sur vingt-six en
portent, et le compte était gonflé de **treize anomalies sur soixante-six**.

Le gonflement faussait aussi **la gravité** : la fiche bascule en alerte au-delà
de cinq points. Ce dossier y passait avec neuf points annoncés alors qu'il en a
quatre ; il redescend à « attention ».

**Et mon propre filtre excluait un tiers du corpus.** L'outil de sélection
cherchait « avant réalisation de travaux » dans le texte — or le constat amiante
avant-vente porte cet avertissement pour dire qu'il ne s'y substitue pas. Tout
dossier contenant un constat amiante de vente était écarté : 568 candidats
examinés sans en retenir un seul.

C'est le piège du texte imprimé partout, sixième forme, et la première qui se
retourne contre **l'instrument** plutôt que contre le produit. Un outil de mesure
obéit aux mêmes règles que ce qu'il mesure.

### 20 août 2026, nuit — sept logements, des termites qu'ils n'ont pas

La plus grave fausse alerte depuis celle de l'amiante, et elle tenait à trois
mots. Le tableau D porte deux constats dans les mêmes colonnes : celui des
**termites**, et celui des **« autres agents de dégradation biologique »** —
vrillettes, capricornes, mérule. Le moteur cherchait « présence d'indices
d'infestation » sans regarder de quoi.

**Mesure sur 45 volets** : le produit annonçait 9 infestations de termites, le
tableau n'en nomme que **2**. Sept fausses alertes. Après correction : deux
annonces, **zéro fausse alerte**.

Ce n'est pas une nuance : les termites obligent à une déclaration en mairie et
engagent la valeur du bien ; une vrillette dans une plinthe, non.

Le dossier qui a servi de révélateur porte **27 lignes « Absence d'indices
d'infestation de termites », zéro de présence**, et sa synthèse conclut qu'il
n'a rien été repéré. Le produit annonçait une alerte.

**Ce que cela apprend** : les termites avaient été mesurés à 38 sur 38 — mais sur
la conclusion **globale** du volet, jamais sur le détail des zones. Une mesure de
justesse ne se fait pas une fois pour toutes : elle ne vaut que pour ce qu'elle
a regardé.
