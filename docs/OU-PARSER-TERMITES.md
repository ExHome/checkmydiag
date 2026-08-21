# OÙ PARSER — l'état relatif à la présence de termites

*Carnet de lecture de la branche « termites, constatations diverses et
champignons ». Ouvert le 21/08/2026.*

**Règle rappelée en tête.** On cherche un ENDROIT, pas une info : quel éditeur ·
quelle rubrique · quelles bornes · quelle disposition. Un endroit sans ces quatre
choses n'est pas un endroit. Et on lit les volets **en entier, un par un**, avant
de corriger quoi que ce soit.

---

## ⚠️⚠️ CE CARNET EST UNE CARTE **LICIEL**, ET RIEN D'AUTRE

**Tout ce qui suit a été lu chez un seul éditeur.** Les cinq lectures intégrales
et les quarante rubriques « constatations diverses » portent, sans exception,
l'étiquette `ÉDITEUR : LICIEL`.

Aude l'a rappelé le 21/08/2026, et c'est l'ordre de mission
`ODM_L_EDITEUR_CONDITIONNE_TOUT` : **on parse différemment pour chaque éditeur.**
Un repère mesuré sur un seul logiciel est **l'habitude de ce logiciel**, pas une
règle du diagnostic.

Concrètement, rien de ce qui est écrit plus bas ne peut être présenté comme
« la façon dont les rapports termites sont faits » :

- la rubrique s'appelle-t-elle « Constatations diverses » chez les autres ?
- porte-t-elle une lettre ? laquelle ?
- ses colonnes s'insèrent-elles de la même façon dans le texte ?
- « Néant - - » est-il la réponse vide partout ?
- le rappel réglementaire du § E — celui qui fabrique 104 faux positifs
  « mérule » — existe-t-il seulement ailleurs ?

**Aucune de ces questions n'a de réponse à ce stade.** Les sections ci-dessous
sont donc titrées LICIEL, et le lecteur qu'on écrira devra choisir sa carte après
avoir nommé l'éditeur — jamais avant.

### Le recensement, mesuré sur 250 volets termites

```
124  LICIEL (reconnu par la signature du PDF)
114  LICIEL (reconnu par la déclaration « Référence du logiciel validé »)
 11  INCONNU — aucune source ne le nomme
  1  BC2E (signature)
```

**238 LICIEL sur 250, soit 95 %.** Douze volets échappent, dont **onze que rien
ne nomme**. C'est peu, et c'est exactement pourquoi le piège est dangereux : un
lecteur écrit sur 95 % du corpus a l'air juste partout, et se tait — ou se
trompe — sur les 5 % restants.

### BC2E n'a pas UNE rubrique de texte libre, il en a QUATRE

Le seul volet BC2E du corpus porte :

```
I. CONSTATATIONS DIVERSES :
J. OBSERVATIONS :
K. INFORMATIONS :
L. ECARTS / ADJONCTIONS PAR RAPPORT A LA NORME NF P 03-201 :
```

LICIEL s'arrête à **J. – VISA et mentions**. BC2E va jusqu'à **L**, et ses
titres sont en CAPITALES, sans le tiret qui suit la lettre chez LICIEL
(« I. CONSTATATIONS » et non « I. - Constatations »).

L'ordre de mission (§ 10) vise les quatre : *Constatations diverses ·
Observations · Commentaires · Informations complémentaires · Notes.* **Verrière
n'en lit aucune.**

Et BC2E écrit une phrase que LICIEL n'écrit jamais :

> « Des indices d'infestation ont été repérés. **Ils ne sont pas causés par des
> termites.** »

C'est le constat le plus explicite du corpus sur la distinction que l'ordre de
mission (§ 11) exige — et un lecteur écrit sur LICIEL ne peut pas la trouver,
parce que la formulation n'existe pas chez LICIEL.

Sa réponse vide diffère aussi : **« Observations : Néant »**, et non
« Néant - - ».

### Les onze INCONNUS : ce qu'on peut en dire, et ce qu'on ne peut pas

Leurs titres de rubriques sont, mot pour mot, ceux de LICIEL — jusqu'au tiret
cadratin de « E. – Catégories de termites en cause : ».

⚠️ **Cela ne permet pas de les appeler LICIEL.** L'ordre de mission est explicite :
*« On garde sur une signature POSITIVE de l'éditeur, jamais sur l'absence d'un
signe. »* Se ressembler n'est pas être. Ce que la mesure autorise à écrire est
exactement ceci : **la carte de leurs rubriques est identique à celle de
LICIEL** — une observation, pas une identification.

Ce qu'elle signale, en revanche, c'est **qu'il manque une source
d'identification**. `identifierGenerateur` connaît trois sources — déclaration,
signature du PDF, pied de page de réseau — et aucune ne fonctionne sur ces onze.
Une quatrième piste existe : **la séquence exacte des titres de rubriques**. Mais
elle ne vaudra que mesurée disjointe, chez au moins deux éditeurs, et ce n'est
pas fait.

⚠️ **Aucune donnée du corpus n'entre ici.** Ni nom, ni adresse. Les numéros de
dossier sont des références internes de cabinet, pas des données personnelles.

---

## Ce que le lecteur fait aujourd'hui, et pourquoi c'est à refaire

*(Ce défaut-ci, lui, ne dépend d'aucun éditeur : chercher un mot dans tout un
volet est faux partout.)*

`reperages.ts` détecte les volets « xylophages », « mérule » et « constatations
diverses » en cherchant **des mots dans tout le volet** :

```ts
motif: /m[ée]rule|champignons? lignivores?|coniophore|pourriture …/i
```

Le commentaire du fichier l'assume : *« On se garde d'interpréter leur
conclusion : les formulations n'ont pas été mesurées. »* C'est exactement
« chercher une info, pas un endroit » — et ça se paie deux fois.

**Faux positif probablement garanti.** Le rappel réglementaire du § E est imprimé
dans TOUS les rapports, et il contient le mot :

> « Lorsque, dans une ou plusieurs communes, des foyers de **mérule** sont
> identifiés, un arrêté préfectoral […] délimite les zones de présence d'un
> risque de mérule. »

Un motif qui balaie le volet entier trouve donc « mérule » partout, y compris
dans les rapports qui n'en constatent aucune. *(À mesurer.)*

**Et il jette ce qu'on lui donne.** Verrière dit au lecteur que « la norme
n'oblige le diagnostiqueur ni à dire lesquels, ni où ». C'est vrai — et les
rapports le disent quand même, en clair, dans une rubrique nommée.

---

## LICIEL — L'ENDROIT : « Constatations diverses »

### ⚠️ La lettre de la rubrique CHANGE. On s'ancre sur le titre.

Trois lectures, un seul éditeur, trois lettres différentes :

```
lecture 1 (07/2024)   H. Constatations diverses      I. Moyens d'investigation
lecture 2 (11/2025)   I. Constatations diverses      H. Moyens d'investigation
lecture 3 (04/2026)   H. Constatations diverses      I. Moyens d'investigation
```

Les deux rubriques **échangent leur lettre** d'une version du modèle à l'autre.
S'ancrer sur « H. » revient à lire les moyens d'investigation une fois sur trois.

### La disposition : trois colonnes, et la première est souvent vide

```
H. - Constatations diverses :
Liste des ouvrages, parties        Localisation      Observations et
d'ouvrages                                           constatations diverses
                                   Général  -        [le texte, sur N lignes]
```

L'extraction rend l'en-tête sur deux ou trois lignes, puis le texte. La
localisation — « Général », ou une liste de pièces — précède le tiret de la
colonne vide.

### Les bornes

De « Constatations diverses » jusqu'au **titre suivant**, quel qu'il soit :
« Moyens d'investigation », « VISA et mentions », ou la « Note » de bas de
rubrique sur les autres agents de dégradation. Jamais la fin de page.

---

## Trois lectures d'un même bien, à un an d'intervalle

Les lectures 1, 2 et 3 sont **le même logement**, réexpertisé trois fois. C'est
une expérience naturelle, et elle démontre le défaut central.

```
15/07/2024   tableau D : « Absence d'indices » partout
             constatations diverses : indices d'autres agents (vrillettes)

20/11/2025   tableau D : PRÉSENCE d'indices de termites — plancher sur solives
             constatations diverses : vrillettes · traces d'humidité ·
                                      « pourriture fibreuse » · dégât des eaux

29/04/2026   tableau D : « Absence d'indices » partout
             constatations diverses : rappelle la découverte de 2025, et dit
                                      que le plancher bois a été remplacé
```

**Sur le rapport de 2026, Verrière annonce aujourd'hui « aucun indice
d'infestation de termites ».** C'est ce que dit le tableau, et c'est vrai. Mais
le rapport lui-même écrit, dans sa rubrique voisine, qu'il y a eu des termites
ici six mois plus tôt et que le plancher a dû être changé.

C'est *rassurer par omission* dans sa forme la plus nette : la phrase est exacte,
et le lecteur en tire une conclusion fausse.

## Ce que la rubrique porte, et que personne ne lit

Relevé sur ces trois lectures, mot pour mot :

- **L'espèce**, que la norme n'oblige pourtant pas à donner —
  « Indices d'infestations de **vrillettes** dans pannes du plafond R+1 » ; et
  l'annexe photo va plus loin : « Parasite : *Anobium punctatum* (Petites
  vrillettes) — Indices : bois piqué ».
- **Un champignon** — « il a été observé de la **pourriture fibreuse** et des
  traces d'humidité importante sur le plancher sur solives bois ».
- **L'histoire du bien** — la découverte de 2025, les travaux de 2026.
- **Le lieu**, précis, alors que Verrière répète que le rapport n'a pas à le
  donner : « dans pannes du plafond R+1: entré/Cuisine/Séjour et Mezzanine ».

## Deux autres endroits repérés, non encore lus

**Le niveau d'infestation de la commune**, en § A :

```
Le bien est situé dans une zone soumise à un arrêté préfectoral:
33800 BORDEAUX (Information au 14/04/2025)
Niveau d'infestation fort
```

« Niveau d'infestation **fort** » n'est lu nulle part. Il ne parle pas du bien
mais de sa commune, et c'est précisément ce qu'un acquéreur ne peut pas deviner.

**La rubrique G — ce qui n'a PAS été examiné.** Elle nomme la charpente :

> « charpente sous plafond sous rampant, accès combles insuffisant »

Dans un rapport de termites, la charpente non contrôlée n'est pas un détail.

---

## ⚠️ Un piège de forme déjà vu dans le tableau D

Quand un élément est infesté, la colonne « Résultats » passe à deux lignes, et
l'extraction **inverse l'ordre** :

```
Présence d'indices d'infestation de termites,      ← le résultat, ligne 1
Sol - Plancher sur solives                          ← l'ouvrage
Termites souterrains: altérations dans le bois      ← le résultat, ligne 2
```

Les lignes ordinaires, elles, mettent l'ouvrage à gauche et le résultat à droite,
sur une seule ligne. `zonesTermites` retombe sur ses pieds ici, mais par l'ordre
des lignes — pas par une règle qui tienne.

---

---

# LICIEL — LES QUARANTE CONSTATATIONS DIVERSES, LUES

*Extraites en bornant sur le TITRE, jamais sur la lettre, et lues une par une le
21/08/2026. Rubrique trouvée dans **40 volets sur 40**.*

## Ce que la rubrique contient réellement

Trois natures de contenu, et elles n'ont rien à voir entre elles.

```
« Néant - - »                    ~18 sur 40   la rubrique existe et ne dit rien
clauses de limite d'examen       ~17 sur 40   du texte-type, recopié à l'identique
constatations réelles              5 sur 40   dont 4 portent sur un même bien
```

**Cinq constatations réelles sur quarante.** Un lecteur qui verserait tout dans
une carte « Constatations diverses » noierait ces cinq informations sous
dix-sept clauses de style.

### Les cinq, exhaustivement — mots du rapport

| lecture | ce que le rapport écrit | où |
|---|---|---|
| 1 | « Présence d'indices d'infestation d'autres agents de dégradation biologique **du bois** » | 1er étage - Entrée /Cuisine/Séjour ; 2ème étage - mezzanine |
| 2 | « Indices d'infestations de **vrillettes** » | pannes du plafond R+1 |
| 2 | « **Traces d'humidité** sur plinthes bois » | R+1 : Salle de bain/wc |
| 2 | « indices d'infestation de **termites** […] suite à un **dégât des eaux** » | salle de bain |
| 2 | « de la **pourriture fibreuse** et des traces d'humidité importante » | plancher sur solives bois, salle de bain |
| 3 | l'historique 2025 + « des travaux ont été réalisés […] remplacement du plancher bois » | salle de bain |
| 4 | vrillettes + traces d'humidité | pannes plafond R+1 · plinthes salle de bain |
| 16 | « **Traces de moisissures** au plafond » · « Traces d'humidité sur plinthes » | RDC : Cuisine et Séjour · cuisine |

⚠️ **Les lectures 1 à 4 sont le même logement.** En biens distincts, deux sur
trente-sept portent une constatation réelle.

### Les clauses de limite, qui ne sont pas des constatations

Quatre blocs reviennent mot pour mot :

```
« Le diagnostic se limite aux zones rendues visibles et accessibles par le
  propriétaire »
« Les zones situées derrière les doublages des murs et plafonds n'ont pas été
  visitées par défaut d'accès »
« Nous nous engageons, lors d'une autre visite, à compléter le diagnostic sur
  les zones ayant été rendues accessibles »
« Les faces arrières des doublages (plâtre, bois) […] Eléments de la Charpente
  en partie non-visible au-dessus des plafonds rampants. Contrôle effectué sans
  déplacement de mobilier lourd, électroménager, cuisine aménagée, encombrement
  des pièces, stock de bois. »
```

L'ODM les sépare : elles vont à **ZONES NON EXAMINÉES / LIMITES DE L'EXAMEN**
(§ 14), pas à « Constatations diverses » (§ 10). Et elles nomment la **charpente**
— dans un rapport de termites, ce n'est pas un détail.

Une cinquième mention, dans la même famille, ne vise que ce bien-là :

```
« A cause de l'absence de trappe, un désardoisage ou un détuilage permettrait
  une inspection de la charpente non visible lors de la visite »
```

---

## Les quatre pièges de forme, mesurés

### 1. ⚠️ La colonne « Localisation » s'insère AU MILIEU d'une phrase

Systématique. La colonne de gauche est centrée verticalement sur le bloc de
texte, et l'extraction la pose à la ligne où elle tombe :

```
Nous nous engageons, lors d'une autre visite, à compléter le
Général - diagnostic sur les zones ayant été rendues accessibles
```

Recoller naïvement produit : *« …à compléter le **Général -** diagnostic sur les
zones… »*. La localisation doit être **retirée du texte et gardée à part** — c'est
précisément ce que l'ODM § 10 exige : chaque constatation reliée à sa
localisation.

### 2. ⚠️ Le pied de page s'insère au milieu, lui aussi

```
H. - Constatations diverses :
31/03/2025                        ← la date du pied de page
Liste des ouvrages, parties
```

et parfois en plein texte (lecture 3, « 29/04/2026 » entre deux mots d'une
phrase). Une date isolée sur sa ligne, dans cette rubrique, est de l'habillage —
jamais du contenu.

### 3. ⚠️ Les mots sont coupés par des espaces parasites

Dans le **titre** comme dans le texte :

```
« H. - Const atations diverses : »      « I. - Moyens d'i nvestigation »
« dispos itions »   « lam bris »   « n'on t pu »   « s tock de bois »
« ét é rendues »    « e t éléments »
```

C'est le même piège que « eff ondré » et « l'a gence » du corpus plomb. **On
compare des lignes aplaties** — espaces et apostrophes écrasés — sinon le titre
lui-même échappe au lecteur une fois sur quarante.

### 4. « Néant - - » n'est pas « rubrique absente »

Les deux tirets sont les colonnes « Liste des ouvrages » et « Localisation »,
vides. La rubrique existe et **répond**. Le distinguer d'une rubrique absente est
la différence entre *« le diagnostiqueur n'a rien constaté d'autre »* et *« on ne
sait pas s'il a regardé »*.

---

## Ce que le lecteur actuel manque, et ce qu'il invente

### Il manque « moisissures »

Le motif du produit est :

```
/m[ée]rule|champignons? lignivores?|coniophore|pourriture (?:cubique|fibreuse|molle)/i
```

**« Moisissures » n'y est pas.** Ni « altération fongique », ni « traces
d'humidité ». La lecture 16 — *« Traces de moisissures au plafond dans RDC:
Cuisine et Séjour »* — passe donc entièrement inaperçue.

Et l'ODM § 12 impose le mot du rapport : si le rapport écrit « moisissures »,
Verrière écrit **moisissures**. Ni « champignon », ni — surtout — « mérule ».

### Il annonce la mérule sur des rapports qui n'en parlent pas

**Le mot « mérule » n'apparaît dans AUCUNE des quarante rubriques.** Il n'apparaît
que dans le rappel réglementaire du § E, imprimé dans tous les rapports :

> « Lorsque, dans une ou plusieurs communes, des foyers de mérule sont
> identifiés, un arrêté préfectoral […] délimite les zones de présence d'un
> risque de mérule. »

### MESURÉ, sur 120 volets

```
le motif « mérule / champignons » du produit
  trouvé dans le VOLET ENTIER   : 106
  trouvé dans la RUBRIQUE       :   2

le rappel réglementaire du § E, qui contient le mot
  présent                       : 106      ← le même nombre, exactement

la rubrique « Constatations diverses »
  présente                      : 120 sur 120
  répondue « Néant »            :  48
```

**106 annonces, 2 constats. 104 faux positifs — 98 %.**

Les deux nombres coïncident au rapport près : le motif ne trouve **que** le
rappel légal. Verrière annonce donc aujourd'hui « Mérule et champignons du bois »
à 106 logements sur 120, dont 104 ne portent aucun constat de ce genre.

Et il faut ajouter l'erreur inverse : le rapport de la lecture 16 porte
« traces de moisissures » dans sa rubrique, et n'est **pas** compté dans ces 2 —
le motif ne connaît pas le mot. Le lecteur se trompe donc **dans les deux
sens à la fois**, sur le même volet : il crie au loup 104 fois, et il rate un
constat réel.

C'est le prix exact de « chercher une info, pas un endroit ».

---

## Où en est la branche

```
volets lus EN ENTIER            :  3
rubriques « constatations »     : 40
```

L'ordre permanent demande **cinquante lectures intégrales** avant toute
correction. Elles ne sont pas faites : **aucun code n'a été touché**, et rien ne
le sera avant. Ce carnet enregistre ce qui a été vu et mesuré, pas ce qui a été
décidé.

### Ce qui devra être corrigé, quand le droit d'y toucher sera acquis

1. **Borner sur la rubrique**, jamais sur le volet entier — 104 faux positifs.
2. **Comparer sur des lignes aplaties** — le titre lui-même échappe une fois sur
   quarante.
3. **Retirer la localisation du texte et la garder à part** — elle s'insère au
   milieu des phrases, et l'ODM § 10 exige que chaque constatation reste reliée
   à la sienne.
4. **Filtrer l'habillage inséré en plein texte**, dates de pied de page comprises.
5. **Séparer les clauses de limite des constatations** — ODM § 14 contre § 10.
6. **Écrire le mot du rapport** : moisissures, pourriture fibreuse, vrillettes,
   traces d'humidité. Jamais « mérule » à leur place — ODM § 12.
7. **Distinguer « Néant » de « rubrique absente »** — 48 volets sur 120 répondent
   « Néant », et répondre n'est pas se taire.

---

# LICIEL — LECTURES 4 ET 5, EN ENTIER

## Lecture 4 — le même bien, quatrième visite, et un piège d'identité

Chronologie du logement des lectures 1 à 4 : **15/07/2024 · 25/07/2025 ·
20/11/2025 · 29/04/2026**. Quatre rapports.

⚠️ **Les lectures 1 et 4 portent le MÊME numéro de dossier** — `24/IMO/0106P` —
pour deux visites séparées d'un an et deux rapports différents.

La règle que j'avais posée du côté du plomb — *« à numéro de dossier égal, la
date de rapport la plus récente gagne »* — **écarterait ici un rapport
authentique**. Elle vaut pour départager deux ÉDITIONS d'un même constat ; elle
ne vaut pas pour deux constats successifs qui réutilisent le numéro. Le
départage doit se faire sur la date de repérage, et deux dates de repérage
différentes signifient deux missions différentes.

---

## Lecture 5 — un bien sain, et le pire piège de forme vu jusqu'ici

Rapport `25/IMO/0527P`, neuf pièces, tout en « Absence d'indices ». Rien à
signaler au tableau D — et pourtant deux endroits majeurs y sont illisibles.

### ⚠️ Rubrique G : les colonnes du MILIEU et de DROITE s'insèrent dans celle de GAUCHE

```
G. - Identification des ouvrages, parties d'ouvrages et éléments qui n'ont pas
été examinés et justification :
Liste des ouvrages, parties
Localisation                    Motif
d'ouvrages
Rez de chaussée - Entrée, Rez de chaussée
- Chambre 1, Rez de chaussée - Chambre
2, Rez de chaussée - Salle de bain, Rez de
Mur           Revetement fixé          ← l'ouvrage ET le motif, plantés au milieu
chaussée - Séjour, Rez de chaussée -
Cuisine, Rez de chaussée - Cellier, Rez de
chaussée - Wc
```

Lu ligne à ligne, cela donne *« …Rez de chaussée - Salle de bain, Rez de **Mur
Revetement fixé** chaussée - Séjour… »*. Le nom d'une pièce est coupé en deux par
deux autres colonnes.

**Et l'information est majeure : les MURS de HUIT pièces n'ont pas été
examinés**, parce que le revêtement est fixé. C'est précisément l'écran
« ZONES NON EXAMINÉES » de l'ordre de mission (§ 14), et Verrière n'en lit rien.

C'est le même piège que la localisation des constatations diverses, en pire :
là-bas une colonne s'insérait dans le texte, ici **deux colonnes s'insèrent dans
une liste de pièces qu'elles coupent en deux**.

### ⚠️ Le tableau D reprend son en-tête au saut de page, et la pièce continue

```
… Cellier   Sol - Carrelage         Absence d'indices
            Plinthes - Carrelage    Absence d'indices
            Mur - Divers et Peinture Absence d'indices
[pied de page · numéro de page · en-tête du rapport]
Bâtiments et parties de
Ouvrages, parties d'ouvrages et éléments examinés
Résultats du diagnostic d'infestation (3)
bâtiments visités (1) (2)
            Porte (P1) - bois et peinture  Absence d'indices     ← toujours le Cellier
            Plafond - Divers et Peinture   Absence d'indices
Wc          Sol - Carrelage                Absence d'indices
```

**La pièce n'est PAS renommée après le saut de page.** Les deux derniers ouvrages
du Cellier n'ont, dans le texte, aucun rattachement — sauf à retenir la pièce
courante par-dessus l'en-tête réimprimé.

Corollaire : les lignes d'en-tête réimprimées — « Bâtiments et parties de »,
« bâtiments visités (1) (2) » — ne doivent jamais être prises pour un nom de
pièce.

### Deux formes du champ « arrêté préfectoral »

```
lecture 5   « Le bien est situé dans une zone soumise à un arrêté
              préfectoral n°2001-02-12 »                          ← forme courte

lectures    « Le bien est situé dans une zone soumise à un arrêté préfectoral:
2, 3, 4       33800 BORDEAUX (Information au 14/04/2025)
              Niveau d'infestation fort
              Arrêté préfectoral / Liste des arrêtés
              12-févr-01 - Arrêté préfectoral - »                 ← forme longue
```

Seule la forme longue porte le **niveau d'infestation de la commune**. Le lire
suppose donc d'accepter les deux formes et de se taire sur la première.

### Un endroit dont la réponse n'est PAS dans le texte

```
Informations collectées auprès du donneur d'ordre :
Présence de traitements antérieurs contre les termites
Présence de termites dans le bâtiment
Fourniture de la notice technique relatif à l'article R 131-3 du CCH …
```

Trois libellés, **aucune réponse**. Les cases sont vraisemblablement des images.
C'est un endroit où l'on doit écrire *« information non lisible dans le
rapport »* — jamais supposer un « non ». L'ordre de mission (§ 24) l'impose, et
c'est aussi la différence entre « le vendeur n'a pas signalé de traitement » et
« on n'a pas pu lire la réponse ».

---

---

# BC2E — LE VOLET LU EN ENTIER

*Le seul volet BC2E des 250. Lu intégralement le 21/08/2026. Rien de LICIEL ne
s'y applique.*

## ⚠️ Le cas décisif : la synthèse dit « rien », la rubrique I dit « des indices »

```
SYNTHÈSE
Dans les bâtiments, parties de bâtiment, pièces, volumes, ouvrages, parties
d'ouvrages et éléments examinés, il n'a pas été repéré d'indice d'infestation
par les termites.
```

Trois pages plus loin :

```
I. CONSTATATIONS DIVERSES :
Indices d'infestation par des agents de dégradation biologique du bois autres
que des termites :
Des indices d'infestation ONT ÉTÉ REPÉRÉS. Ils ne sont pas causés par des
termites.
```

Le tableau D est intégralement « Absence d'indices ». Il n'y a **aucune
contradiction juridique** — la synthèse ne parle que des termites, la rubrique I
parle des autres agents. Le rapport est correct.

Mais pour un acquéreur, lire *« il n'a pas été repéré d'indice d'infestation »*
puis, trois pages plus loin, *« des indices d'infestation ont été repérés »*,
c'est exactement ce que l'ordre de mission interdit de laisser passer : § 22
(moteur de contradictions), § 23 (pas de moyenne, pas d'effacement), § 3
(indice ≠ infestation, termites ≠ autres agents).

**Verrière doit afficher les deux phrases, chacune dans ses mots, et dire ce qui
les sépare.** C'est le cas d'école de la branche.

## Le § G de BC2E est un vrai tableau, et il est directement lisible

Là où LICIEL entrelace trois colonnes au point de couper un nom de pièce en
deux, BC2E écrit une ligne par élément, la pièce à gauche :

```
G. IDENTIFICATION DES OUVRAGES … QUI N'ONT PAS ÉTÉ EXAMINÉS ET JUSTIFICATION :
Pièces        Éléments non examinés
Sejour        faces cachées des meubles de cuisine
              solives, lambourdes de planchers (non visitable)
              présence de doublages de murs masquant des éléments (non démontable)
              sous-faces des parquets (non démontable)
              sous-faces des plinthes (non démontable)
Combles       charpente recouverte d'isolant
              combles perdus (non visitable)
Salle d'eau   présence de doublages de murs …
WC            présence de doublages de murs …
Chambre 01    (les cinq mêmes)
Chambre 02    (les cinq mêmes)
```

**Six pièces, dix-neuf éléments non examinés, chacun avec son motif.** C'est
exactement la structure OÙ ? / QUOI ? / POURQUOI ? que l'ordre de mission (§ 14)
réclame — et chez BC2E elle s'extrait sans effort, les lignes suivantes héritant
de la pièce.

Dont : **« Combles → charpente recouverte d'isolant · combles perdus (non
visitable) »**. La charpente non examinée, nommée et localisée.

## Le tableau D est bâti à l'envers de LICIEL

```
LICIEL   une ligne par OUVRAGE
         « Salle de bain/wc  Sol - Carrelage  Absence d'indices … »

BC2E     une ligne par PIÈCE, tous les ouvrages concaténés dans une cellule
         « Étage : RDC - Sejour | Sol ( Parquet) - Plinthe (Peinture Bois) -
           Plafond (Peinture Plâtre) - … - Radiateur 2 ( Métal) |
           Absence d'indices d'infestation de termites »
```

Et la pièce s'écrit **« Étage : RDC - Sejour »**, jamais « Sejour » seul.

⚠️ Le motif `PIECES` de `reperages.ts` exige un nom de pièce en tête de ligne
suivi d'un ouvrage. Il ne peut pas reconnaître « Étage : RDC - Sejour », et le
séparateur des ouvrages est un tiret, pas un saut de ligne. **BC2E ne rend donc
vraisemblablement aucune zone.** *(À mesurer.)*

## Quatre endroits que BC2E possède et que LICIEL n'a pas

**1. La zone contaminée, avec sa réponse.**

```
Lieu du constat situé dans une zone contaminée par les termites ou susceptible
de l'être à court terme (au sens de l'article L.133-5 du CCH) : OUI
```

Une phrase, une réponse en fin de ligne. Chez LICIEL, c'est un bloc de cinq
lignes avec « Niveau d'infestation fort ».

**2. Les informations du donneur d'ordre — RÉPONDUES.**

```
- Traitements antérieurs contre les termites : AUCUN
- Présence de termites dans le bâtiment : AUCUNES
- Fourniture de la notice technique … : NON
```

⚠️ **C'est l'endroit que LICIEL imprime sans réponse lisible.** Le même champ est
donc lisible chez un éditeur et muet chez l'autre. Un lecteur unique écrirait
« information non lisible » partout, et jetterait trois réponses claires.

**3. Les abords de l'immeuble.**

```
Indices d'infestation par des termites aux abords de l'immeuble examiné : Néant
```

Sous-rubrique de I. LICIEL ne l'a pas du tout.

**4. Les écarts à la norme, déclarés.**

```
L. ECARTS / ADJONCTIONS PAR RAPPORT A LA NORME NF P 03-201 :
Absence de copie de contrat de mission accepté par le donneur d'ordre annexée
au présent rapport …
```

Un écart réel à la norme, écrit par l'opérateur lui-même. Chez LICIEL, la ligne
équivalente est « Commentaires (Ecart par rapport à la norme, …) : Néant ».

## ⚠️ La rubrique E change de SENS entre les deux éditeurs

Même lettre, même titre — sens opposé.

```
LICIEL   « E. – Catégories de termites en cause : »
         suivi de deux pages de texte réglementaire générique, identique dans
         tous les rapports, qui ne dit RIEN du bien.

BC2E     « E. CATÉGORIE DE TERMITES EN CAUSE : »
         « Néant »
         → une RÉPONSE : aucune catégorie en cause dans ce bien.
```

C'est le plus bel exemple de « l'éditeur conditionne tout » que la branche ait
produit : un lecteur qui apprendrait chez BC2E que E est une réponse lirait, chez
LICIEL, deux pages de loi comme si c'était un constat.

## Et le faux positif « mérule » est un phénomène LICIEL

Le rappel réglementaire de BC2E cite **L 133-5** — l'ancienne rédaction — et il
**ne mentionne pas la mérule**. Le mot n'apparaît nulle part dans ce volet.

La mesure « 106 volets sur 120 déclenchent le motif mérule » est donc, elle
aussi, **une mesure LICIEL**. Elle reste vraie ; elle ne dit rien de BC2E.

---

*Lectures intégrales : 6 (5 LICIEL, 1 BC2E). Rubriques « constatations
diverses » LICIEL : 40. Volets INCONNUS extraits, non encore lus : 11.
Aucun code touché.*
