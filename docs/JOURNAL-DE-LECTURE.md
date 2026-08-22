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
- **Le schéma des déperditions est dit en mots** (§64) : la page est une image —
  31 volets sur 31 la nomment, aucun pourcentage dans le texte — mais le
  descriptif du logement décrit chaque paroi. Le moteur le lisait déjà pour
  dessiner, jamais pour parler : **0 → 24** volets qui disent par où la chaleur
  s'en va. Deux trous d'extraction corrigés au passage — les murs (**0 → 13**,
  tous justifiés) et « avec isolation extérieure », qui ne comptait pas.
- **L'homme de l'art sort du périmètre** (§65) : assurance, certification et
  impartialité ne seront ni extraites ni signalées. Verrière explique le
  diagnostic, elle ne juge pas le diagnostiqueur.
- **L'attestation d'assurance est contrôlée, en silence** (§66) : signalée
  uniquement si sa date ne couvre pas le rapport — **24 sur 70**, zéro à tort,
  et 46 dossiers muets. Le libellé est « attestation à mettre à jour », jamais
  « défaut d'assurance » : cinq dates distinctes pour 59 rapports, écart médian
  de deux mois — c'est un champ figé dans le générateur, pas un cabinet sans
  couverture. Ni l'assureur ni le numéro de police ne sont montrés.
- **Le schéma de déperditions du DPE se découpe dans la page** (§67) : ses
  pourcentages sont dans une image — 14 à 15 bitmaps par page, zéro « % » en
  texte — et le schéma dessiné de Verrière affichait, lui, les ordres de
  grandeur **nationaux** de l'ADEME, identiques pour tous les dossiers. On
  découpe donc le vrai schéma et on le montre : le lecteur voit ses chiffres,
  le produit n'en invente aucun. Rectangle identique sur 7 pages sur 7.
  **L'affichage est branché** (§68) : `SchemaDuRapport` dans la section « Où ? »
  de la fiche DPE, sous le dessin — celui-ci explique le chemin, celui-là donne
  la part. Chaîne validée dans le navigateur sur un rapport de 51 pages ; le
  découpage lui-même reste à voir à l'œil, un onglet masqué ne dessinant pas.

> **Ce qui est en cours** : lecture intégrale des 100 premiers rapports, un par
> un, annexes comprises, **sans sonde** — règle du 20/08. La structure ne se
> valide qu'au centième. Rien n'est implémenté d'ici là ; les observations vont
> au registre et à la carte des encarts.
>
> **APRÈS LES 100** — demandé le 20/08 : la Dropbox VERRIÈRE contient
> `VERRIERE_Corpus_Formats_Diagnostics_Hors_Liciel_v1.zip`, des rapports faits
> par **d'autres éditeurs** que celui de DGLM. Les lire de la même façon, et
> s'entraîner à y retrouver les encarts qui portent. C'est l'épreuve de la
> carte : un encart qui ne se retrouve que chez un seul éditeur n'est pas un
> repère, c'est une habitude de générateur.

## Compteurs

| | Total |
|---|---|
| Rapports lus en entier | 9 |
| Volets lus page à page | 30 |
| Volets et documents lus page à page | 9 |
| Erreurs de moteur trouvées par la lecture | 7 majeures |
| Corrections livrées | 46 |
| Tests de non-régression ajoutés | 125 |
| Fausses alertes de mes propres sondes, écartées avant annonce | 9 |
| Sondes de justesse écrites | 16 |
| Notions métier versées au produit | 6 |
| Fiches versées à la Dropbox | 2 |
| Points ouverts au carnet | 16 |

## Couverture par diagnostic

Ce que « lu » veut dire ici : le volet a été lu page à page, pas survolé.

| Diagnostic | Volets lus | Justesse mesurée | État |
|---|---|---|---|
| Électricité | 3 | **60/60** verdicts justes (contre 17/31) | catalogue démasqué et rendu robuste aux libellés longs |
| Gaz | 4 | **7/7** verdicts justes (contre 0/3) | rubrique E lue juste ; rubrique G et « installation non alimentée » restent à remonter |
| DPE | 3 | **2 %** de muets (contre 4 %) , **24/24** déperditions dites | le schéma est une image, le descriptif du logement le redit en mots |
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

### 21 août 2026 — la liseuse amiante : 14 documents, et un second éditeur nommé

**Ordre d'Aude** : « tu es la liseuse amiante de Verrière, va dans la Dropbox
DGLM et lis tous les diags amiante du début à la fin, apprends et apprends où
parser. »

**Outil posé** : `scripts/amiante-lire.local.ts` — il nomme l'éditeur **avant**
d'ouvrir, borne le volet amiante, écrit le texte intégral du volet plus une page
avant et une après, et tient son propre registre d'empreintes dans la Dropbox
(`05_CORPUS_RAPPORTS/registre-amiante.json`). Un sixième argument permet
d'**écarter un éditeur** : sans lui, un corpus aux neuf dixièmes LICIEL ne rend
jamais qu'un seul gabarit.

**Corpus** : 15 673 PDF sous `AA -CLIENTS`, dont **11 114 candidats** une fois
les factures et les fichiers en attente écartés.

**Lu** : 14 documents en entier — **10 LICIEL** (5 constats de vente, 3 DTA,
2 DAPP) et **4 BC2E** (2 DTA dont un positif, 1 fiche récapitulative, 1 DAPP).
Carte des endroits : [`OU-PARSER-AMIANTE.md`](OU-PARSER-AMIANTE.md), 836 lignes.
Ce que la lecture apprend du métier : carnet § 80.

**Le trou d'identification du corpus est comblé.** La famille `TCPDF /
HTML2PDF` — 59 documents, aucun encore lu, seul éditeur non identifié du
corpus — **est BC2E**, et elle le dit en clair dans son pied de page : « membre
du réseau BC2E ». Le pied de page donne en prime, sur chaque page, le volet, la
mission et la pagination du volet : `AMIANTE (DTA) : 3 sur 10`. C'est la borne
la plus sûre rencontrée dans tout le corpus.

**Quatre missions, et non une.** Vente, DTA, DAPP, repérage avant travaux. Elles
ne se distinguent ni par le titre courant (un DTA de 2021 porte « Constat de
repérage Amiante », un DTA de 2025 porte « Dossier Technique Amiante »), ni par
l'avertissement de tête, qui parle de démolition et de travaux **dans toutes**.
Seul le sous-titre de la page 1 statue.

Et la mission change la structure : en DAPP, la conclusion n'a **qu'un** § 1.1
et ne nomme aucune liste ; les § 5.0.1 et 5.0.2 n'existent pas ; le § 5.3, lui,
apparaît. Un lecteur écrit pour la vente lit un DAPP de travers.

**Trois pièges qui feraient annoncer de l'amiante là où il n'y en a pas** :

1. `il a été repéré des matériaux et produits **susceptibles de contenir** de
   l'amiante : marquage des matériaux, **ils ne contiennent pas d'amiante**` —
   BC2E, page 1. Quatre des six états de conclusion commencent par les mêmes
   cinq mots.
2. Le § 5.0.2 de LICIEL, qui liste ce qui a été **regardé** en liste B et non ce
   qui contient de l'amiante — `Absence d'amiante` y côtoie `Présence
   d'amiante`, et le même matériau est recompté au § 5.3.
3. Les annexes de LICIEL, qui impriment **tout le droit de l'amiante** dans
   100 % des rapports : « travaux de retrait ou de confinement », « Score 3 »,
   « cinq fibres par litre ». Chez BC2E, ces mêmes mots ne sortent que s'il y a
   un positif. **Le même mot est un signal chez l'un et un bruit chez l'autre.**

**Un état inconnu du produit** : `PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE.`
Un rapport qui ne conclut pas. Ni présence, ni absence : une question ouverte.

**Un trait promu au métier** : le sommaire ment sur le corps. Mesuré chez les
deux éditeurs — un DTA LICIEL annonce trois sous-rubriques au § 4 et en imprime
quatre ; un DTA BC2E annonce `8.1` et `8.2` et imprime aussi `8.3`. Ce n'est
plus l'habitude d'un logiciel.

**Un défaut d'outil relevé** : la découpe borne la fiche récapitulative BC2E aux
pages 1-2 d'un document qui en compte 9.

**Par où reprendre** : `npx vite-node scripts/amiante-lire.local.ts -- "<racine>"
<sortie> <combien> [motif de nom] [éditeur à écarter]`. Le registre reprend seul
où la lecture s'est arrêtée. Restent à ouvrir : un volet portant de l'amiante en
**liste A** (aucun des quatorze n'en porte), un volet avec **prélèvement et
rapport d'essai**, un **repérage avant travaux**, Imm'PACT, et un rapport
**numérisé** — où le silence de l'extraction se lit comme une absence.

### 21 août 2026, suite — six documents de plus, et la métadonnée prise en défaut

Lecture ciblée sur les fichiers nommés « amiante », « RAAT », « avant travaux » :
**65 candidats, 12 ouverts, 6 lus** — soit **20 documents amiante lus en
entier** dans la journée.

**Quatre viennent de cabinets confrères** (SARL DIE2M / groupe EDEC, CSD
BORDEAUX, CARRE D'EXPERTS), rangés dans les dossiers clients comme pièces
antérieures. **Les six portent le gabarit LICIEL au mot près.**

**La métadonnée a menti quatre fois sur six.** Signatures rencontrées :
`Microsoft® Word 2019`, `Microsoft® Word pour Microsoft 365`,
`GdPicture Managed PDF Plugin Ver. 4.5` — quatre documents rendus « éditeur
inconnu » alors que le rapport est un LICIEL de bout en bout. Un rapport
réenregistré perd sa signature d'origine : **la métadonnée nomme le dernier
outil qui a touché le fichier, pas celui qui a produit le rapport.** La règle
des deux endroits tient toujours, mais elle se complète : une signature qui
nomme un **outil bureautique** n'est pas concluante ; il faut alors lire le
gabarit.

**Deux corrections à ce que la lecture du matin avait établi** — c'est
`ODM_UNE_ERREUR_CINQUANTE_LECTURES.md` qui joue, et il vaut mieux qu'il joue
ici que dans le produit :

1. **La composition du § 5 n'est pas commandée par la mission.** Un constat de
   **vente** de 2020 porte `5.1 / 5.2 / 5.3` **sans** `5.0`, exactement comme un
   DAPP. C'est un trait de **version du logiciel**. On ne déduit donc jamais la
   mission du § 5 : on lit le sous-titre de la page 1.
2. **« Ensemble du bien » n'est pas toujours une clause de style.** Un constat
   lu porte trois lignes `Ensemble du bien` **renseignées**, avec parties du
   local et raisons propres au logement. Ce qui est une clause, c'est le bloc de
   six lignes « Le diagnostic se limite aux zones rendues visibles… » — reconnu
   à son texte, jamais à la seule localisation.

**Deux états du document que rien d'autre ne signale** :

- **le pré-rapport** — `Pré - Rapport du 15/05/2025 de la mission de repérage…`,
  inséré à la place même du sous-titre qui déclare la mission. Un document
  provisoire qui se lit comme un rapport définitif si l'on borne mal ;
- **la double pagination** — `1 / 10` pour le volet et `Rapport DDT : page 18 /
  47` pour le dossier entier, dans le même pied de page.

**Ce que la journée n'a toujours pas trouvé** : un repérage **avant travaux**.
Le filtre par nom de fichier n'en a pas rendu un seul sur 65 candidats — les
22 fichiers nommés « RAAT » restent à ouvrir un par un.

### 21 août 2026, fin de journée — 28 documents, et une troisième issue

Huit documents de plus (**10 885 candidats restants**), dont un DTA BC2E et sept
DDT LICIEL. **28 documents amiante lus en entier dans la journée.**

**La correction la plus importante de la journée.** Il avait été écrit le matin
que LICIEL n'a que deux issues — trouvé / pas trouvé — et que seul BC2E sait
dire « on ne sait pas encore ». C'est faux. Un constat LICIEL lu porte, au
§ 1.1 Liste B :

> \- des matériaux et produits de la liste B **pour lesquels des sondages et/ou
> prélèvements doivent être effectués** :

et, au § 5.1, une sous-liste dédiée dont la conclusion est
`Susceptible de contenir de l'amiante (Non prélevé pour ne pas altérer sa
fonction)`.

⚠️ **Cette phrase ne contient ni « contenant de l'amiante » ni « il n'a pas été
repéré ».** Elle échappe aux deux motifs qui servent à lire la conclusion. Un
lecteur à deux cases la range dans « rien trouvé » — alors que le rapport dit
qu'il n'a pas conclu, et pourquoi.

**Acquis, chez les deux éditeurs : un constat amiante a TROIS issues, pas deux.**
Présence · absence · **non conclu**. C'est la même leçon que la classe 0 du
plomb (« sous le seuil » n'est pas « absence »), sur un autre volet.

Deux variantes de plus, mineures mais qui cassent un motif : le § 2 s'intitule
tantôt `Le(s) laboratoire(s) d'analyses` (vide : « Il n'a pas été fait appel à un
laboratoire d'analyse »), tantôt `Analyses chimiques du laboratoire` (vide :
« Aucune analyse chimique n'a été réalisée en laboratoire. ») ; et une cellule de
localisation peut porter **plusieurs pièces séparées par un point-virgule**.

**Le corpus amiante n'est pas un corpus de logements** : `Cave`,
`Bureaux > 300 m²`, `Local commercial mixte en copropriété`, `Parties communes`
figurent au champ « Type de logement ».

### 21 août 2026, nuit — 70 documents, la quatrième mission, et sept états au lieu de deux

La lecture n'a pas été interrompue. **70 documents amiante lus**, 365 examinés,
sur 10 800 candidats restants.

**La quatrième mission est ouverte : le repérage avant travaux (RAAT).** Cinq
lus. Ce n'est pas le même métier :

- ce n'est **pas** le code de la santé publique mais le **code du travail**
  (L. 4412-2, décret 2017-899 du 9 mai 2017, arrêté du 16 juillet 2019) ;
- il n'y a **ni liste A ni liste B**, mais les **dix catégories** de l'annexe 1
  de l'arrêté du 16 juillet 2019, imprimées en entier — nouveau catalogue
  réglementaire à ne jamais lire comme un constat ;
- le § 5 n'a plus rien de commun : `5.1 Liste des produits et matériaux
  présentées par catégorie`, `5.2 Récapitulatif zone par zone` ;
- la conclusion du § 1.1 **ne dit ni quoi ni où** : elle renvoie à la partie 5.

**Le § 2 « laboratoire » est enfin rempli** — ITGA (Rennes) et Eurofins LEM.
C'est le premier volet du corpus où l'amiante est établie **par analyse** :
28 échantillons P001 à P028, quatre positifs. Et cela confirme sur pièce le faux
d'identification déjà tenu par un test : **ITGA y est le laboratoire, pas
l'éditeur Imm'PACT.**

⚠️ Le champ `Programme détaillé des travaux` est à **`Néant` dans les cinq
RAAT** — alors que c'est lui qui devrait dire les travaux. Ce qui les dit, c'est
le champ `Périmètre de repérage` de la page 1 : « avant réfection de la
couverture (remplacement plaques en fibrociment) », « avant pose de borne
électrique pour recharge de véhicule », « de réfection des sols d'une salle de
bains suite à un dégât des eaux ». **Un RAAT ne vaut que pour ces travaux-là**,
et c'est la première chose à restituer.

**La découverte qui remet en cause tout ce qui précède : le § 1.1 a SEPT états,
pas deux.** Quatre lignes sur sept commencent par `- des matériaux et produits
de la liste X`, et **trois d'entre elles ne disent pas qu'il y a de l'amiante** :

- `… pour lesquels des sondages et/ou prélèvements doivent être effectués` — rien
  n'a été prélevé ;
- `… pour lesquels les résultats d'analyse des sondages et/ou prélèvements sont
  en attente` — le laboratoire n'a pas rendu ;
- `… ayant fait l'objet d'analyse, ne contenant pas d'amiante` — **absence
  prouvée**, écrite avec les mots d'une présence.

Et la synthèse du DDT porte la même chose en quatre formes, dont
`il a été repéré des matériaux et produits susceptibles de contenir de
l'amiante : après analyse, ils ne contiennent pas d'amiante`. **C'est la
phrase-piège relevée le matin chez BC2E, mot pour mot, chez LICIEL.** Le même
piège chez deux éditeurs n'est plus l'habitude d'un logiciel : **c'est la langue
du métier.**

**Autres endroits ajoutés à la carte** : le titre courant qui se coupe en deux
lignes (`Dossier Amiante –` / `n° …`) et rend le volet invisible à un bornage
naïf ; la seconde forme de la ligne de matériau (`Conduits dont l'état de
conservation est : EP`) ; la mention en capitales `DIAGNOSTIC AMIANTE NON
VALABLE POUR AVANT TRAVAUX / DEMOLITION.` ; les notes de bas de tableau du DTA
(« locaux inaccessibles, clefs absentes » y est un **exemple du texte**, pas un
motif observé) ; quatre motifs de non-visite de plus ; `Temps passé sur site`
comme variante de `Durée du repérage`.

**Méthode** : un gabarit neuf se lit en intégral ; les suivants se lisent **en
différentiel de lignes** — chaque ligne est soit déjà lue mot pour mot, soit
présentée à la lecture. Rien n'est sauté, et le rendement se voit : le lot 8 n'a
plus rien apporté sur le gabarit LICIEL de vente, signe que ce gabarit-là
approche de la saturation.

**Reste** : la liste A (flocages, calorifugeages, faux plafonds) — toujours pas
un seul en 70 lectures ; Imm'PACT ; un rapport numérisé ; un RAAT avant
démolition.

### 21 août 2026, nuit — le flocage en Score 3, et le § 1.1 qui porte quatre conclusions

La lecture continue. **92 volets extraits, 86 lus**, 407 documents examinés.

**La liste A est trouvée.** Une copropriété de quatre niveaux, DTA de parties
communes : **flocages amiantés dans les caves, cotés Score 3** — travaux de
retrait ou de confinement, trente-six mois, préfet informé sous deux mois. Le
seul volet du corpus où le texte d'annexe, imprimé à l'identique dans les
quatre-vingt-onze autres, **désigne une obligation réelle**.

**Et il retourne la règle des annexes.** Elle disait : « ces mots ne prouvent
rien ». Elle devient : **ces mots ne prouvent rien par leur présence ; ce qui
prouve, c'est la case `Etat de conservation` du § 5.1 et la ligne à tiret du
§ 1.1.** Un produit qui écarte le vocabulaire de gravité au lieu de le rattacher
à sa case rate exactement le dossier où il fallait alerter.

**Découverte de structure, la plus lourde de la journée : un même § 1.1 porte
JUSQU'À QUATRE LIGNES À TIRET pour la seule liste B** — amiante sur anciennes
analyses, amiante après analyse en laboratoire, amiante sur décision de
l'opérateur, et matériaux restant à sonder. Quatre états, quatre justifications,
une seule rubrique. Un lecteur qui prend « la ligne qui suit `Liste B :` » en
lit **une sur quatre** — et la quatrième est coupée par un saut de page.

**Neuvième forme de conclusion** : `contenant de l'amiante sur anciennes
analyses` — une présence établie sur une pièce **que le rapport ne joint pas**.

**Un défaut de fabrication imprimé noir sur blanc** : la cellule du Score 3
porte `Souligne_Score 3`. L'instruction de mise en forme du logiciel fuit dans
le texte. Le seul dossier grave du corpus est aussi celui où le gabarit laisse
voir son code.

**Mesure sur 93 volets extraits** : 78 disent « rien trouvé », **11 portent de
l'amiante**, **7 ne concluent pas**. Autrement dit, sur les dix-huit volets qui
ne sont pas un simple négatif, **près de quatre sur dix ne tranchent pas**.

**Défaut du moteur, mesuré et non corrigé** : `src/lib/analyse/reperages.ts`
décide « présence » dès que la ligne d'une liste contient `il a été repéré`. Sur
les dix-huit lignes de ce type rencontrées, **six n'annoncent pas d'amiante**
(cinq non conclus, une absence prouvée par analyse). Un tiers d'erreur, dans les
deux sens. `ODM_UNE_ERREUR_CINQUANTE_LECTURES.md` interdit le correctif à chaud :
le défaut est écrit dans la carte, la correction se mesurera sur le corpus.

**Amélioration de la liseuse** : elle borne désormais le volet sur **le titre
courant** (`Constat de repérage Amiante`, `Dossier Technique Amiante`,
`Repérage Amiante - Travaux`, `Dossier Amiante`) et sur **le pied de page BC2E**
(`AMIANTE (DTA) : n sur N`), en union avec la découpe du moteur. Motif : la
découpe seule tronquait trois RAAT sur cinq à quatre pages, et un volet tronqué
se lit comme un volet sans amiante.

### 21 août 2026 — rappel d'Aude : « on parse différemment pour chaque éditeur »

**La carte avait dérivé.** Elle comptait cinq parties de niveau 1, dont trois qui
n'étaient pas des éditeurs — « la quatrième mission », « le cas d'école », « la
liste A ». Or ces trois-là sont **des observations LICIEL et rien d'autre** : les
sortir de la partie LICIEL, c'était laisser croire qu'elles valent partout.

**Remis en ordre.** Le fichier est désormais rangé en quatre parties étanches,
une par producteur : **LICIEL** · **BC2E** · **ITGA (laboratoire)** · **les
documents sans éditeur**. Rien d'une partie ne vaut dans une autre.

**Ajouté en tête : la table de correspondance « le même endroit, chez qui »** —
22 endroits, deux éditeurs, et **9 cases vides sur 44**, déclarées « non
mesuré ». Le tableau dit surtout ce qu'il ne dit pas.

**Et deux traits seulement sont mesurés chez les deux éditeurs** — donc seuls
candidats à être des traits du métier plutôt que d'un logiciel : le sommaire qui
annonce moins de rubriques que le corps, et la phrase d'ouverture identique qui
introduit des conclusions opposées. **Tout le reste est l'habitude d'un
logiciel.**

**Un troisième producteur est entré dans la carte : ITGA, le laboratoire.**
17 documents du corpus, une page chacun, `RAPPORT D'ESSAI N° … EN DATE DU …`.
C'est la pièce que les constats citent quand ils écrivent « après analyse en
laboratoire », et personne ne l'avait ouverte. Elle apprend trois choses que le
constat ne dit jamais :

- **le seuil** : « la détection est garantie si la teneur est supérieure ou égale
  à **0,1 % en masse** », et la note (1) précise que « non détecté » n'exclut pas
  une teneur inférieure à la limite. **« Non détecté » n'est pas « absent »** —
  la leçon de la classe 0 du plomb, écrite par le laboratoire lui-même ;
- **la localisation n'engage pas le laboratoire** : « Le laboratoire n'est pas
  responsable des données fournies par le client qui sont simplement
  retranscrites » — la pièce et le matériau sont le texte du diagnostiqueur ;
- **le positif ne contient pas le mot « amiante »** : le résultat s'écrit
  `Amiante non détecté` au négatif, mais **`Présence de fibres`** au positif,
  avec la variété (`Chrysotile`) dans une colonne à part. Chercher « amiante »
  dans la colonne Résultat trouve le négatif et rate le positif.

Et le gabarit du laboratoire laisse fuir son code comme celui de LICIEL :
`¤DATERAPPORT`, `¤VALIDEUR`, `<ignorediff/>` imprimés dans la page.

**Un fichier de rapports d'essai en contient plusieurs** — un par page. La borne
est le titre, jamais le fichier.

**Enfin, le danger le mieux documenté a été rencontré en vrai** : un constat
amiante d'un cabinet confrère, **huit pages, zéro texte extractible**, signature
`iLovePDF`. Un volet sans texte se lit exactement comme un volet sans amiante.
14 documents du corpus amiante sont dans ce cas ; ils ont désormais leur partie
dans la carte, et la signature les dénonce **avant** toute lecture.

### 21 août 2026 — trois mesures, trois échantillons, aucune comparaison

Le lecteur d'unités de diagnostic du CREP a été mesuré trois fois de suite
contre le tableau de synthèse. Trois passes, trois résultats :

```
39 %   sur 107 volets
47 %   sur  55 volets   (après correction des bornes)
33 %   sur  33 volets   (même code que la précédente)
```

**Les trois échantillons étaient différents.** Entre la deuxième et la
troisième, le code n'avait pas bougé — seul le tirage. Quatorze points d'écart
sans qu'une ligne change.

J'ai présenté la deuxième comme une amélioration de la première. C'était faux :
je comparais deux terrains, pas deux versions. Une correction dont l'effet se
mesure sur un autre échantillon que celui du diagnostic n'est pas mesurée du
tout.

**Ce qui est corrigé** : l'échantillon est tiré une fois, écrit à côté du
registre de lecture, et relu tel quel à chaque passe. Pour en changer, il faut
le supprimer sciemment. Le chiffre ne bouge plus alors que parce que le code a
bougé.

**La leçon, générale** : avant de comparer deux mesures, vérifier qu'elles ont
regardé la même chose. Un chiffre qui bouge parce que le terrain bouge ne mesure
rien — et il est plus dangereux qu'une absence de mesure, parce qu'il a l'air
d'un résultat.


### 21 août 2026 — l'amiante migré : un lecteur LICIEL, un lecteur BC2E

Premier volet passé à l'architecture par éditeur
(`docs/ODM-LECTEURS-PAR-EDITEUR.md`).

**Trois modules, trois séries de tests** :

| | |
|---|---|
| `lecteurs.ts` | l'aiguillage — l'éditeur est **dans le contexte**, il n'est plus possible d'écrire un lecteur qui l'ignore. 8 tests |
| `amiante.listes.ts` | le § 1.1 **chez LICIEL**, corrigé sur 130 volets. 10 tests |
| `amiante.bc2e.ts` | le bloc `A` **chez BC2E**, écrit sur sa propre carte. 9 tests |

**Deux fautes corrigées, mesurées sur de vrais rapports.**

**1. Une fausse présence.** Le lecteur décidait « présence » dès que la ligne
d'une liste portait « il a été repéré ». Sur les dix-huit lignes de ce type du
corpus, **six n'annoncent pas d'amiante** : cinq non conclus, une absence
prouvée par analyse. Le § 1.1 se lit maintenant ligne à tiret par ligne à tiret,
et une liste peut en porter quatre.

**2. Une fausse ABSENCE — la plus grave.** Vérification sur un DTA de
copropriété dont la liste B porte quatre conduits amiantés : le produit rendait
**« Aucun matériau contenant de l'amiante n'a été repéré »**. Cause : la ligne
écrit `conte nant de l'amiante` — **LICIEL coupe les mots au hasard de
l'extraction**, et le motif ratait la ligne entière.

La recherche se fait désormais sur le texte **sans aucun espace**, ce qui fait
disparaître toute la famille (`matéria ux`, `exigence s`, `Descri ptif`,
`rep érage`). Après correction, le même rapport rend : *« Amiante repérée :
Conduits (Sous - Sol - Cave), et 3 autres. Une évaluation périodique est
recommandée. »*

⚠️ **On cherche sans espaces, on cite avec.** La forme compacte sert à trouver,
jamais à restituer — une localisation s'écrit « SOUS-SOL - Cave », et la coller
la déforme. Le même piège a été pris et corrigé dans le lecteur BC2E.

**Vérifié sur pièce**, trois rapports passés par `analyser()` :

| Rapport | Éditeur choisi | Verdict |
|---|---|---|
| DTA parties communes | **BC2E** | « ne conclut pas encore : des prélèvements restent à faire » |
| DTA copropriété positive | **BC2E** | « repère des matériaux contenant de l'amiante » |
| DTA copropriété, 4 conduits | **LICIEL** | « Amiante repérée : Conduits (Sous - Sol - Cave), et 3 autres » |

**1 320 tests passent.**

⚠️ **Signalé, non touché** : `src/lib/analyse/securite.ts` appelle
`ressembleALiciel` sans l'importer (la fonction vit dans
`tableau-anomalies.ts`). Le fichier est en cours d'écriture par une autre
session — l'appel plante à l'exécution sur un volet électricité à cinq domaines.
Ce n'est pas dans le périmètre de la migration amiante.
