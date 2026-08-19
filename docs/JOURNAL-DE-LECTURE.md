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

**Au 19 août 2026.**

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
  (1 volet trop court sur 20, contre 20). **Prochain chantier** : vérifier si
  d'autres volets se ferment trop tôt, en cherchant les rapports qui annoncent
  leur pagination.
- **À vérifier au texte avant tout contrôle** : le calendrier du DPE collectif
  (L126-31 du CCH, article 158 de la loi n° 2021-1104), cité par le DTG mais
  pas encore relu à la source. Légifrance n'a pas répondu aux adresses
  essayées le 19/08.
- Restent ouverts sur l'électricité : la contradiction synthèse/volet d'un
  rapport, le rattachement de la synthèse, les mesures compensatoires, et la
  déduction vente/location.

## Compteurs

| | Total |
|---|---|
| Rapports lus en entier | 5 |
| Volets lus page à page | 15 |
| Volets et documents lus page à page | 9 |
| Erreurs de moteur trouvées par la lecture | 6 majeures |
| Corrections livrées | 13 |
| Tests de non-régression ajoutés | 34 |
| Fausses alertes de mes propres sondes, écartées avant annonce | 6 |
| Sondes de justesse écrites | 2 |
| Notions métier versées au produit | 4 |
| Fiches versées à la Dropbox | 2 |
| Points ouverts au carnet | 15 |

## Couverture par diagnostic

Ce que « lu » veut dire ici : le volet a été lu page à page, pas survolé.

| Diagnostic | Volets lus | Justesse mesurée | État |
|---|---|---|---|
| Électricité | 3 | **60/60** verdicts justes (contre 17/31) | catalogue démasqué et rendu robuste aux libellés longs |
| Gaz | 3 | **7/7** verdicts justes (contre 0/3) | rubrique E lue juste ; rubrique G et « installation non alimentée » restent à remonter |
| DPE | 3 | **2 %** de muets (contre 4 %) | annexes rattachées : 7 volets courts sur 58, contre 58 |
| ERP | 8 | **1/63** faux risque techno (contre 49/63) ; argile rattrapée **55/55** | le formulaire vierge n'est plus lu comme un constat |
| Plomb | 2 | **22/22** verdicts justes | le moteur est bon ; la validité du constat positif était fausse, corrigée |
| Amiante | 2 | **19/19** verdicts justes (contre 2/19) | fausse alerte massive corrigée ; la découpe reste 15 pages trop courte |
| Termites | 2 | **38/38** verdicts justes | le moteur est bon ; zone d'arrêté et mérule restent à restituer |
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
