# Carnet de lecture des rapports

Ce carnet consigne ce qu'on apprend en **lisant des dossiers entiers**, page par
page, plutôt qu'en relevant des motifs.

La distinction n'est pas rhétorique. Un relevé de formes ne montre que ce qu'on
lui demande de chercher : il a caché pendant des mois la mention la plus fiable
du corpus, parce qu'elle est écrite sur deux lignes et que la première n'en
porte aucune trace. On lit donc, et on note.

Rien de ce qui est écrit ici ne provient d'un dossier identifiable : ce sont des
constats de structure et des points de vigilance métier, jamais des données de
personne.

---

## 1 · Comment un dossier technique est bâti

Chez ce cabinet — et l'ossature vaut pour la plupart des générateurs :

| Pages | Contenu |
|---|---|
| 1–2 | Page de garde : identité du bien, du client, **grille des 40 prestations possibles** |
| 3–4 | « Résumé de l'expertise » : une conclusion par diagnostic |
| 5 et suivantes | Un volet par diagnostic, chacun avec sa propre numérotation (« 3 / 8 ») |

### La page de garde ne dit pas ce que contient le dossier

Elle liste les quarante prestations que le cabinet sait faire, avec une case à
cocher devant chacune. **Les coches ne sortent pas du PDF** — ce sont des
dessins, pas des caractères. On ne peut donc pas s'en servir pour savoir quels
diagnostics sont présents ; il faut aller voir les volets eux-mêmes.

### Chaque volet répète son en-tête et son pied de page

L'en-tête donne le nom du diagnostic et le numéro de dossier ; le pied donne le
cabinet, sa pagination interne, son RCS, et **« Rapport du : » suivi de la date
sur la ligne d'après**.

C'est la date la plus fiable du dossier : présente sur chaque page de chaque
volet. Aucun extracteur ne la lisait, parce qu'ils lisent ligne par ligne et
qu'elle est coupée en deux.

---

## 2 · La page de synthèse est un tableau à deux colonnes

« Prestations » à gauche, « Conclusion » à droite. À l'extraction, les deux
colonnes s'entrelacent : le nom de la prestation se retrouve **coupé au milieu
du texte de sa propre conclusion**.

Exemple de ce que produit l'extraction, sur l'état des risques :

```
Etat des Risques et          ← début du libellé
<quatre lignes de conclusion>
Pollutions                   ← fin du libellé
<suite de la conclusion>
```

Toute lecture de cette page qui suppose « un libellé, puis sa conclusion »
échoue. C'est probablement la raison pour laquelle la synthèse est si mal
exploitée aujourd'hui.

---

## 3 · Les dates, et leurs sosies

### Les formes qui datent vraiment le rapport

- `Date du repérage : JJ/MM/AAAA` — repérages (amiante, plomb, termites, surface)
- `Date(s) de la visite faisant l'objet du CREP JJ/MM/AAAA` — plomb
- `Visite effectuée le JJ/MM/AAAA.` — termites, en fin de volet
- `Document réalisé le : JJ/MM/AAAA` — état des risques
- `Date de réalisation : 12 novembre 2024 (Valable 6 mois)` — état des risques,
  **en toutes lettres**
- `Rapport du :` + date **sur la ligne suivante** — pied de chaque page
- `Fait à VILLE , le JJ/MM/AAAA` — signature, en dernier recours

### Les dates qui ne sont pas la sienne

Un dossier en est plein, et chacune ferait dire « valable jusqu'au … » à un
document périmé :

- le **téléphone du cabinet**, en pied de chaque page : `Tél. : 05.56.12.34.56`
  se lit comme une date pour un motif un peu permissif ;
- l'**assurance** du diagnostiqueur : date d'effet, d'expiration, numéro de
  police, « valable jusqu'au » ;
- son **certificat de compétence** et sa date de délivrance ;
- l'**étalonnage de l'appareil** et le **dernier chargement de sa source
  radioactive** — le plomb se mesure au fluorescence X ;
- les **arrêtés de catastrophe naturelle** et les **plans de prévention**, dont
  l'état des risques est rempli ;
- les **textes réglementaires** cités.

Le volet de l'état des risques ne contient **aucune** date de rapport : que des
dates d'approbation d'arrêtés. La sienne est sur une page que la découpe ne lui
rattache pas.

---

## 4 · Ce qu'un lecteur ne verra jamais tout seul

Points relevés en lisant, et que la mise en page enterre.

### L'aléa argile est chiffré, mais noyé

La synthèse consacre **quinze lignes** au retrait-gonflement des argiles :
articles du code, obligations du maître d'ouvrage, attestation RGA, garantie
catastrophe naturelle. Le mot qui compte — **« Aléa Fort »** — n'apparaît pas
là : il est dans un tableau, quatre pages plus loin.

### Le nombre de sites pollués voisins

`Basias, Basol, Icpe | Oui | 36 sites* à - de 500 mètres`, avec en note :
« ce chiffre ne comprend pas les sites non localisés de la commune ». Une
information forte, en petits caractères, dans un tableau « donné à titre
informatif ».

### Le « Mode ÉDITION » de l'état des risques

L'ERP porte la mention : *« En mode EDITION, l'utilisateur est responsable de la
localisation et de la détermination de l'exposition aux risques. »*

Autrement dit, le fournisseur de données ne garantit pas le repérage du bien sur
la carte : c'est l'opérateur qui l'a placé. Un ERP en mode ÉDITION n'a pas la
même valeur qu'un ERP géolocalisé automatiquement, et rien ne le dit au lecteur.

### La validité de six mois, écrite une seule fois

`Date de réalisation : 12 novembre 2024 (Valable 6 mois)`. C'est la seule
mention de la durée, sur la première ligne d'un document de vingt et une pages.

---

## 5 · Ce que les volets disent bien

À noter aussi : tout n'est pas piégeux.

- Le **tableau de repérage termites** est parfaitement lisible en linéaire :
  `Chambre 1 | Sol - Parquet | Absence d'indices d'infestation de termites`.
- Les rubriques **F, G et H** du termites — parties non visitées, ouvrages non
  examinés, constatations diverses — sont explicites, et vides quand il n'y a
  rien (« Néant »).
- La **liste des pièces visitées** est donnée en clair, pièce par pièce.

---

## 6 · Le gaz : les essais, et ce qu'ils cachent

### La conclusion est un formulaire dont la coche est un dessin

Les quatre issues sont imprimées dans chaque rapport — « ne comporte aucune
anomalie », « des anomalies de type A1 », « de type A2 », « de type DGI » — et
l'on coche celle qui s'applique. **La coche ne sort pas du PDF.** Vérifié en
lisant deux volets entiers : les quatre libellés se suivent, sans marque.

L'état des risques, lui, est produit par un autre éditeur et sort ses coches
en `x` dans le texte. **Les cases à cocher dépendent donc du générateur** : un
seul exemple ne fait pas une règle.

### La rubrique E dit ce que la coche ne dit pas

« E. — Anomalies identifiées » est du texte. Chaque anomalie y porte son point
de contrôle normé, son type et son risque :

```
C.7 - 8b  Organe de Coupure d'Appareil (OCA)   A2
Remarques : L'extrémité de la tuyauterie en attente n'est pas obturée
Risque(s) constaté(s) : Dégagement de gaz et donc un risque d'explosion
```

Piège : l'en-tête de colonne énumère les quatre types comme légende — une ligne
qui les cite tous n'est pas un constat.

Et une distinction qui commande tout : rubrique **présente et vide** = aucune
anomalie constatée, c'est un résultat ; rubrique **absente** = on n'a pas su
lire, ce n'en est pas un.

### Les essais sur place, rubrique D

```
Mesure CO : Non réalisée
Fonctionnement : Appareil à l'arrêt
Chaudière MARQUE MODELE — 23 kW — Installation: 1997
```

Le monoxyde de carbone ne se voit pas, ne se sent pas, et tue. Quand l'appareil
est resté à l'arrêt, **l'essai le plus important n'a pas eu lieu** — et le
rapport peut conclure « aucune anomalie ». Ce n'est pas la même chose qu'une
installation vérifiée.

L'année d'installation est là aussi, et donne la vétusté que le rapport ne
commente jamais.

---

## 7 · L'état des risques : ce qui est écrit et jamais lu

### La colonne « Indemnisé » est à remplir par le vendeur

Le tableau des arrêtés de catastrophe naturelle porte une colonne « Indemnisé »,
**vide**, avec la consigne : « cochez ci-dessous la case correspondante ». Ce
n'est pas au diagnostiqueur de la remplir.

Un ERP livré avec cette colonne vierge est donc incomplet au sens de l'article
L125-5 du code de l'environnement : l'information sur les sinistres indemnisés
fait partie de ce qui est dû à l'acquéreur. Personne ne le remarque.

Dans le même bloc, le champ **« Établi le : » reste vide** alors que le
document porte par ailleurs sa date de réalisation.

### Trois cases que le vendeur doit remplir, et qui restent vides

Le même état des risques en compte trois, toutes vierges :

1. **« Indemnisé »**, dans le tableau des arrêtés CATNAT.
2. **« Établi le : »**, au pied de la déclaration de sinistres.
3. **« Argiles — Information relative aux travaux non réalisés »**, le plus
   lourd des trois.

Cette dernière reproduit l'article R125-24 du code de l'environnement : en cas
de vente, si le bien a subi des désordres liés à la sécheresse, indemnisés mais
non réparés, **le vendeur doit joindre la liste des travaux restant à faire**.
Deux cases, « Oui » et « Non ». Aucune n'est cochée.

Le dossier lu est en zone d'aléa **Fort** pour le retrait-gonflement des
argiles, dans une commune reconnue treize fois en catastrophe naturelle
sécheresse. C'est exactement le cas où cette case compte — et c'est le cas où
elle est vide.

Ces trois champs ne sont pas du ressort du diagnostiqueur : ils incombent au
vendeur, qui ignore le plus souvent qu'ils existent. Un produit qui explique un
dossier devrait le lui dire.

### Le radon : 100 Bq/m³ n'est pas un seuil

La fiche d'information annexée écrit : « le niveau moyen de radon dans l'habitat
français est inférieur à 100 Bq/m³ ». C'est une **moyenne constatée**, pas une
limite réglementaire.

Le seuil d'action est de **300 Bq/m³** (code de la santé publique). La confusion
entre les deux est facile — la fiche ne cite pas le second — et elle est
exactement celle qu'un brief antérieur avait déjà commise.

### Le nombre d'arrêtés CATNAT dit quelque chose

Le dossier lu en compte **45 sur la commune**, dont **treize** pour
« Sécheresse et réhydratation — Tassements différentiels » depuis 1989.

Rapproché de la ligne « Zonage du retrait-gonflement des argiles : Oui, Aléa
Fort », cela dessine un risque concret — fissures, fondations — que ni le
rapport ni le produit ne formulent. Les deux informations sont à onze pages
d'écart.

---

## 8 · Le plomb : ce que « non mesurée » veut dire

Le tableau de conclusion du CREP compte six colonnes :

```
Total  Non mesurées  Classe 0  Classe 1  Classe 2  Classe 3
 208        39         130         1         2        36
```

**« Non mesurée » ne veut pas dire « pas contrôlée ».** Le détail du rapport
l'écrit, unité par unité :

```
Mur Pierre           Non mesurée - NM   Absence de revêtement
Plinthes Carrelage   Non mesurée - NM   Absence de revêtement
Fenêtre Métal        Non mesurée - NM   Absence de revêtement
```

Une unité non mesurée est une unité **sans revêtement à mesurer** : pierre nue,
carrelage, métal, PVC. Le plomb se cherche dans les peintures ; là où il n'y en
a pas, il n'y a rien à mesurer, et la norme NF X46-030 prévoit ce classement.

Le taux de non mesurées ne dit donc rien de la qualité du contrôle : il dit
combien de surfaces du logement ne sont pas peintes.

> **Erreur commise ici même.** J'avais tempéré la conclusion d'un constat
> rassurant au motif que 19 % des unités n'étaient pas mesurées, croyant qu'une
> part du logement avait échappé au contrôle. C'est l'inverse du service rendu :
> inquiéter sur une donnée normale. La règle qui en sort — **avant de faire
> d'un chiffre une réserve, chercher ce que la norme en dit.**

Ce qui compte vraiment dans ce tableau, c'est la **classe 3** : revêtement au
plomb dégradé. L'article L.1334-9 du code de la santé publique impose alors au
propriétaire des travaux pour supprimer l'exposition, et la transmission du
constat aux occupants et à toute entreprise intervenant.

Le rapport relève aussi la présence d'**enfants de moins de six ans**, et le
nombre. C'est le facteur qui déclenche le risque de saturnisme infantile.

---

## 9 · Le CREP : les cinq situations, et la validité

### Les cinq situations de risque sont chiffrées

Arrêté du 19 août 2011, articles 1 et 8. Le rapport y répond une par une :

| Situation | Seuil |
|---|---|
| Un local à au moins **50 %** d'unités de classe 3 | calculable |
| L'ensemble des locaux à au moins **20 %** | calculable |
| Un plancher ou plafond menaçant de s'effondrer | constaté sur place |
| Coulures, ruissellements, écoulements d'eau sur plusieurs unités d'une même pièce | constaté |
| Moisissures ou taches d'humidité sur plusieurs unités d'une même pièce | constaté |

**Une seule suffit** à déclencher la transmission du constat au directeur
général de l'ARS dans les cinq jours ouvrables (article L. 1334-10), qui en
informe le préfet.

Le logement est alors signalé à l'administration sanitaire. Ce n'est ni une
sanction ni une interdiction de vendre — mais le vendeur l'ignore souvent, et
l'acquéreur ne le trouve jamais : c'est en page 15 sur 19.

Sur le constat lu, la première situation était remplie : salle d'eau à 86 % de
classe 3, salle de bain à 80 %. La transmission a été faite.

> **Piège de lecture.** La rubrique 6.5 reproduit le texte de l'arrêté — « si le
> constat identifie au moins l'une de ces cinq situations, son auteur
> transmet… » — dans TOUS les rapports, y compris ceux qui n'ont rien transmis.
> Seule la phrase au passé dit que ça a été fait : « Nous avons donc […]
> transmis immédiatement une copie du rapport ».

### La validité dépend du RÉSULTAT, pas du type

C'est le seul diagnostic dans ce cas.

- Constat **négatif** — aucun revêtement au-dessus des seuils : validité
  **illimitée**, pas besoin d'en refaire un à chaque mutation.
- Constat **positif** — au moins une unité de classe 1, 2 ou 3 : **un an** en
  vente (article L. 1334-6), six ans en location (L. 1334-7).

Une seule unité de classe 1 suffit : le texte parle de **présence** de
revêtements au-dessus des seuils, pas de leur dégradation. Un logement avec du
plomb en parfait état a quand même un constat qui périme.

### Le classement, tel que la norme le définit

| Concentration | Dégradations | Classe |
|---|---|---|
| < seuil | — | 0 |
| ≥ seuil | non dégradé ou non visible | 1 |
| ≥ seuil | état d'usage | 2 |
| ≥ seuil | dégradé | 3 |

Seuil : **1 mg/cm²** (arrêté du 19 août 2011, article 5).

Stratégie de mesurage : une mesure si elle dépasse le seuil ; deux si la
première ne le dépasse pas ; trois si les deux premières ne le dépassent pas
mais que des unités du même type ont dépassé dans le même local.

---

## 11 · Le second tableau de l'état des risques

Après l'imprimé officiel — celui que la loi impose —, le générateur ajoute un
tableau « Etat des risques complémentaires (Géorisques) » marqué *à titre
informatif*. Personne ne le lit, et il porte des lignes autrement plus concrètes
que le zonage sismique.

Mesuré sur 140 dossiers : 68 % le contiennent. La remontée de nappe y est cochée
« oui » dans 80 cas sur 83, et un dossier sur sept la réunit avec une cave au
logement. Les installations classées dans un rayon donné y figurent une fois sur
deux.

### Ses colonnes sortent entrelacées

    Zones potentiellement sujettes aux inondations de cave, fiabilité
    Remontées de nappes Oui
    FORTE (dans un rayon de 500 mètres).

Le détail arrive **avant** le nom du risque, la valeur deux lignes plus bas.
Chercher « fiabilité FORTE » à la suite ne trouvait qu'un cas sur huit.

### « Fiabilité forte » ne veut pas dire « risque fort »

Le mot qualifie la **carte**, pas le danger : il dit que la donnée est sûre. Le
raccourci serait un contresens, et un contresens alarmant.

---

## 12 · L'argile, ou pourquoi une sonde verte ne prouve rien

Le retrait-gonflement des argiles est le risque n°1 de la région. Sur 140
dossiers, 73 déclarent le bien concerné — le moteur en annonçait **6**.

Trois causes empilées, dont aucune n'était visible depuis un test unitaire :

1. **La forme dominante est une ligne de tableau**, pas une phrase :
   `Zonage du retrait-gonflement des argiles | Oui | Aléa Moyen`. Le détecteur ne
   connaissait que « zone d'exposition moyenne », apostrophe droite et tiret
   collé.
2. **Le filtre des affirmations la jetait** avant même le détecteur : il ne
   gardait que les lignes nommant le bien, et une ligne de tableau n'a ni verbe
   ni sujet.
3. **La découpe fermait l'ERP à sa première page.** Ses pages suivantes viennent
   d'un autre éditeur et ne répètent pas le titre : elles portent « Mode EDITION »
   et l'adresse. Douze fois, le tableau tombait exactement une page après la fin
   de la plage.

### La leçon, et elle vaut pour tout le reste

L'épreuve du corpus n'a **pas bougé d'une unité** entre avant et après. Elle
compte les verdicts qui existent, jamais ceux qui disent vrai : un état des
risques annonçant « aucun risque majeur recensé » sur un bien classé en argile y
figurait comme réussi.

Une mesure de présence ne vaut pas une mesure de justesse. Toute sonde qui ne
compare pas ce que le document DIT à ce que le moteur EN RETIENT peut rester
verte sur une erreur de fond.

---

## 13 · Ce qu'on a failli écrire, et qu'il ne fallait pas

Chaque dossier porte les garanties de l'opérateur : échéance de certification
par prestation, et validité de la police d'assurance. Comparer ces dates à celle
de la visite est immédiat, et paraît être un beau contrôle.

Mesure faite : **45 dossiers sur 113 portent une assurance expirée au jour du
rapport.** De quoi crier à l'anomalie — sauf qu'il n'y a que quatre dates
d'assurance distinctes dans tout l'échantillon (01/10/2025, 30/09/2023,
31/12/2021, 31/12/2022), et que les retards se groupent en paquets nets.

Ce sont les échéances annuelles successives d'une même police : le modèle de
document n'est pas mis à jour au renouvellement. L'opérateur est assuré ; c'est
le papier qui traîne. Annoncer « le diagnostiqueur n'était pas assuré » aurait
été faux, et grave.

Aucun signal n'a été ajouté. La mesure n'a servi qu'à éviter une fausse alerte —
c'est déjà sa fonction.

---

## 14 · Le DPE : ce que « muet » recouvrait

Quatre DPE sur dix sortaient sans lettre. Le mot cachait deux choses très
différentes, et il a fallu les séparer avant de corriger quoi que ce soit.

**Sept étaient de vrais échecs de lecture** : un des trois nombres du calcul
manquait — consommation totale, surface de référence, émissions.

**Trente-trois étaient un refus assumé** : des logements de 40 m² ou moins, pour
lesquels le moteur préférait se taire plutôt qu'appliquer une échelle trop
sévère. Un tiers du corpus. À Bordeaux, les studios sont partout.

### La table existe, elle était seulement à aller chercher

Relevée au texte de l'arrêté du 25 mars 2024, puis vérifiée à ses bornes : la
ligne 40 m² redonne exactement les seuils généraux de 2021. Résultat mesuré :
42 % de DPE muets, puis **4 %**.

### Une lettre recalculée n'est pas celle du rapport

Un DPE de 2023 portait l'échelle d'alors. Le même studio calculé aujourd'hui
change de classe — c'est la réforme, pas une contradiction. Le champ
`recalculee` existe pour que rien ne les confonde, et l'explication des réformes
dit déjà pourquoi la lettre a bougé.

### Ce que la page du DPE ne dira jamais au texte

Le confort d'été liste « bonne inertie / logement traversant / toiture isolée » —
mais c'est le catalogue des caractéristiques possibles, et seules les cochées
comptent. La coche est dessinée. On ne peut pas savoir lesquelles sont vraies.

---

## 15 · Le constat amiante, lu en entier

### Sa date est écrite trois fois

« Date du repérage », « Date d'émission du rapport de repérage, remis au
propriétaire le … », et « Rapport du : » en pied de page, sur deux lignes. Il
n'y a donc jamais de raison de repartir sans date — sauf si le rapport lui-même
n'est pas au dossier, ce qui est le cas une fois sur deux.

### La rubrique 1.2 dit ce qu'on n'a pas pu regarder

Tableau à trois colonnes — Localisation, Parties du local, Raison — dont la
première déborde sur cinq lignes quand quinze pièces sont concernées. Motifs
réellement rencontrés : absence de trappe de visite, revêtement fixé,
impossibilité d'investigation non destructive, encombrement, absence de clé.

Sur 28 constats : 10 rubriques portent « Néant », 9 n'ont aucun empêchement,
5 en portent vraiment. Une rubrique présente et vide est un RÉSULTAT — même
règle qu'à la rubrique E du gaz.

### Et le rapport en tire la conséquence lui-même

> les obligations réglementaires du propriétaire ne sont pas remplies […] de ce
> fait le vendeur reste responsable au titre des vices cachés

C'est-à-dire : le constat ne protège pas le vendeur sur ce qu'il n'a pas pu
voir. Sur le dossier lu, quatorze pièces de murs et quinze de sols n'avaient pas
pu être sondées — presque tout le logement.

### Un piège de motif à retenir

`[^.]` ne convient pas dans une phrase qui cite des articles : « R.1334-15 à
R.1334-18 » contient trois points, et chacun coupe la recherche. La sonde qui
mesurait ce cas portait le même défaut et annonçait zéro occurrence sur tout le
corpus — alors que la phrase était sous les yeux dans le premier rapport lu.

---

## 16 · L'électricité, lue en entier — et la liste qui ne dit rien

Deux volets lus intégralement : un rapport sans anomalie (janvier 2023,
location) et un rapport qui en relève cinq (octobre 2024, vente).

### La conclusion est un formulaire, comme au gaz

Les deux issues sont imprimées l'une sous l'autre — « ne comporte aucune
anomalie », « comporte une ou des anomalies » — et l'on coche. La coche est un
dessin. Chercher l'une des deux phrases dans le volet donne donc un faux
positif dans un rapport sur deux.

### La liste des domaines n'est PAS un constat

Sous « Anomalies avérées selon les domaines suivants : » vient une liste de six
domaines. Le moteur la prenait pour un relevé — elle ne l'est pas : c'est le
**catalogue de l'arrêté du 28 septembre 2017**, imprimé à l'identique dans tous
les rapports.

Mesuré sur trente et un volets : **six domaines, les mêmes, dans 100 % des
cas** — quatorze rapports sans anomalie comme dix-sept qui en ont. Conséquence
avant correction : **quatorze logements sur trente et un se voyaient annoncer
un défaut électrique qu'ils n'avaient pas.** Après : trente verdicts justes sur
trente et un.

C'est la leçon du §12 qui se répète : une sonde de présence reste verte sur une
erreur de fond. Ici, la liste était *présente*, donc « lue » ; elle ne
*disait* rien.

### Ce qui constate vraiment, en deux variantes

| Variante | Forme | Ce qu'elle donne |
|---|---|---|
| 2023 | `Libellé de l'anomalie : B7.3 a  L'Enveloppe d'au moins un matériel est détériorée.` | le défaut exact, avec son code de norme |
| 2024 | tableau `Domaines / Anomalies / Photo`, domaines **numérotés** | quels domaines, et le libellé normé |

Dans la seconde, les deux colonnes s'entrelacent à l'extraction — le nom du
domaine est coupé au bout de trois mots et la suite de la ligne appartient déjà
au texte de l'anomalie. Ce qui survit, c'est le **numéro en tête de ligne**, et
il suit l'ordre du catalogue. Le numéro dit lequel, l'amorce du libellé
confirme, et le lecteur apprend enfin *lesquels* des six domaines sont en
cause, au lieu d'un simple compte.

### Le piège : un second tableau, numéroté pareil

Deux rapports sans la moindre anomalie se voyaient reprocher trois domaines. La
cause : un autre tableau, même numérotation, mais qui **décrit** au lieu de
juger — « 1. L'appareil général de | Coupure de l'ensemble de l'installation
électrique », « 2. Dispositif de protection | Emplacement ». Ce qui les sépare
est leur en-tête : `Domaines Anomalies Photo` d'un côté, `Domaines Informations
complémentaires` de l'autre. Sans cet ancrage, la lecture d'un tableau attrape
son voisin.

### Les mesures compensatoires

Le rapport de 2024 écrit, après deux anomalies : *« (Cette anomalie fait l'objet
d'une mesure compensatoire pour limiter le risque de choc électrique) »*. Ce
n'est pas un détail de rédaction : une anomalie compensée n'expose pas au même
danger qu'une anomalie nue. Verrière ne le dit pas encore.

### Et ce que la rubrique 6 apprend

« Points de contrôle n'ayant pu être vérifiés » : tableau Domaines / Points de
contrôle, « Néant - » quand tout a pu l'être. Présente et vide = résultat —
troisième volet à confirmer la règle, après le gaz et l'amiante.

---

## 17 · Vente ou location : le même dossier ne dit pas la même chose

Les deux dossiers lus n'ont pas le même objet, et le rapport l'écrit lui-même.

| | Location (janvier 2023) | Vente (octobre 2024) |
|---|---|---|
| Surface | attestation **loi Boutin** (habitable) | certificat **loi Carrez** (privative) |
| Électricité | « prévu à l'article 3-3 de la loi n°89-462 […] **durée de validité de 6 ans** » | « **durée de validité de 3 ans** » |
| Parties | Bailleur / Locataire | Vendeur / Acquéreur |

La validité de l'électricité et du gaz **dépend de la transaction**, pas du
diagnostic : trois ans à la vente, six ans à la location. Le préambule du volet
le dit en toutes lettres, et il change d'un dossier à l'autre. Un produit qui
annoncerait « validité : 6 ans » à un vendeur se tromperait du double.

Le CREP suit une logique voisine mais distincte (§9) : sa validité dépend du
résultat *et* de la transaction — illimitée si négatif, un an en vente et six
ans en location si positif.

---

## 18 · L'imprimé officiel de l'ERP : la croix, et de quel côté

Contrairement au reste du dossier, l'imprimé officiel de l'état des risques
sort ses coches en texte. Mais la croix ne se lit pas seule :

```
L'immeuble est situé dans le périmètre d'un PPRn prescrit      oui X non
L'immeuble est situé dans le périmètre d'un PPRn approuvé      oui non X
```

**C'est la position de la croix entre les deux mots qui répond.** Chercher
« prescrit » puis « oui » sur la même ligne se trompe une fois sur deux — les
deux mots y sont toujours.

Même mécanique pour les zonages, où la croix suit la valeur retenue :

```
zone 5   zone 4   zone 3   zone 2 X   zone 1        → sismicité 2
zone 3   zone 2   zone 1 X                          → potentiel radon 1
Feu de forêt X   autre                              → le risque coché
```

### L'argile, troisième formulation

Le §12 en connaissait deux. Un troisième dossier l'écrit en **texte
réglementaire**, dans la synthèse : *« Le bien se situe dans une zone
réglementée du risque retrait-gonflement des argiles (L.132-4 du Code de la
construction et de l'habitation) »*, suivi de quinze lignes sur l'étude
géotechnique et l'attestation RGA obligatoire depuis le 1er janvier 2024. Le
mot « aléa » n'y figure pas.

Et le tableau Géorisques, lui, la formule en phrase : « Le bien se situe dans
une zone d'aléa Fort. » — là où le §12 avait relevé une ligne de tableau
`Zonage du retrait-gonflement des argiles | Oui | Aléa Moyen`. Une même réalité,
trois écritures : c'est le cas d'école de la notion canonique et de ses
variantes.

---

## 19 · L'assurance : la preuve du §13

Le §13 avait conclu, par la statistique, que les assurances « expirées » du
corpus étaient un modèle de document non mis à jour. Un dossier lu en entier le
démontre :

- pied de page, sur les 43 pages : `MMA n° 114.231.812` ;
- volets et attestation sur l'honneur : `114.231.812 - 31/12/2022`, expirée au
  jour du rapport (10/01/2023) ;
- **annexe, attestation d'assurance** : cabinet courtier, compagnie **Allianz**,
  police `86517808`, *« Période de validité : du 03/01/2023 au 02/02/2023 »*.

L'opérateur était donc bien assuré. **Le pied de page et l'attestation sur
l'honneur portent l'ancienne police ; l'attestation jointe en annexe fait foi.**
Un second dossier (octobre 2024) le confirme : pied de page `MMA 114.231.812`,
volets `KLARITY CDIAGK000266 - 01/10/2025`.

### Et l'attestation sur l'honneur est un modèle, elle aussi

Elle liste les certifications par prestation — amiante, termites, gaz, plomb,
DPE, électricité — dans un dossier qui ne contient ni amiante, ni termites, ni
gaz. Chercher un diagnostic par son nom dans le texte entier y trouve donc six
prestations absentes. Même piège que l'en-tête commercial : c'est le **titre en
tête de page** qui dit ce que le dossier contient.

---

## 20 · Le DPE vierge, et le local sans chauffage

Un dossier de vente porte, en synthèse : **« DPE vierge – Pas de système de
chauffages fixes. »** Le bien est un plateau de 51,20 m² au rez-de-chaussée.

Sans système de chauffage fixe, la méthode 3CL n'a rien à calculer : le DPE
sort sans étiquette. Ce n'est ni un oubli du diagnostiqueur, ni un dossier
incomplet — mais un produit qui affiche « DPE : non lu » ou reste muet laisse
croire à un manque. Il faut le dire, et dire pourquoi.

À vérifier au texte avant d'en faire une règle : depuis la réforme de 2021, le
DPE vierge a disparu pour les logements ; le cas rencontré est un local dont la
destination n'est pas celle d'un logement chauffé. La distinction se tranche au
texte, pas à l'observation.

---

## 21 · Le premier document d'immeuble : un DTG, lu en entier

Trente-cinq pages, juin 2026, mise en copropriété de quatre lots répartis en
trois bâtiments. C'est le premier rapport de copropriété jamais lu ici, et il
ne ressemble à rien de ce qui précède : autre éditeur, autre mise en page,
autre logique.

### Il ne conclut pas, il programme

Un diagnostic de logement rend un verdict par diagnostic. Le DTG rend un
**calendrier de dépenses sur dix ans**, réparti en trois périodes — 0 à 2 ans,
3 à 5 ans, 6 à 10 ans — et son lecteur n'est pas un acheteur mais une
assemblée générale qui vote.

Sa structure, en onze sections : informations administratives · fiche
d'identification de la copropriété · introduction (cadre, validité, périmètre,
limites) · analyse de l'état apparent des parties communes · évaluation
sommaire des coûts et calendrier · situation du syndicat au regard de ses
obligations · améliorations de la gestion technique et patrimoniale · synthèse
du bilan énergétique · conclusions · déclaration sur l'honneur et assurance ·
annexe.

### L'échelle des curatifs se lit à l'envers

| Classement | Ce qu'il veut dire |
|---|---|
| **Curatif niveau 1** | **impact FORT** — risque pour les personnes |
| Curatif niveau 2 | impact modéré — ouvrage affaibli |
| Curatif niveau 3 | impact faible — à traiter tôt |
| Entretien · Signalements · Énergie | pas des travaux ; jamais chiffrés pour les deux premiers |

Le niveau 1 est le plus grave — l'intuition dit l'inverse.

Et **le montant ne dit pas la gravité** : sur ce rapport, le seul niveau 1 —
une balustrade d'escalier dégradée, donc un risque de chute — était le poste le
**moins cher** du calendrier, très loin derrière une façade classée niveau 3.
Trier par la colonne des euros revient à commencer par le mauvais bout.

### Le rapport signale lui-même ce qui lui manque

Son bilan porte « Bilan énergétique : Absent », et sa section 6 :
« Aucun bilan énergétique n'a été réalisé à ce jour ». Or le DPE de l'immeuble
est l'un des volets que le DTG doit comporter.

Le rapport reproduit le calendrier d'obligation — 1ᵉʳ janvier 2026 pour les
copropriétés d'au plus cinquante lots. Si ce calendrier se confirme au texte
officiel (**il n'a pas encore pu être relu à la source**), un DTG de juin 2026
sur quatre lots est postérieur à l'entrée en vigueur, et le manque est réel.
C'est exactement le contrôle qu'un traqueur d'erreurs grossières doit savoir
faire — à condition de vérifier le texte avant de l'affirmer.

### Sept rubriques vides, et un état intermédiaire

« Aucun élément. » revient sept fois : administration, contrats d'entretien,
diagnostics obligatoires, ascenseur, porte automatique, améliorations
générales, améliorations énergétiques. Et « Parties communes non visitées :
Aucun élément. »

Même règle qu'au gaz et à l'amiante : **présente et vide = un résultat**. Mais
le DTG en ajoute une nuance que les diagnostics de logement n'ont pas : la
sécurité incendie porte trois obligations commentées « Copropriété en cours de
création » — ni présent, ni manquant, mais **sans objet pour l'instant**.

### Ce qui cloche dans le dossier lu

Cinq points, notés comme cas techniques :

1. **deux adresses différentes** dans le même rapport — la localisation de
   l'immeuble d'un côté, le propriétaire et le donneur d'ordre de l'autre, dans
   une autre commune. Une seule des deux peut être le bien diagnostiqué ;
2. le **numéro de rapport est un nom de société**, pas un numéro ;
3. le **champ assurance est vide** partout — page d'administration et pied des
   34 pages — alors que l'attestation jointe en annexe est complète et valide.
   Deuxième éditeur, même conclusion qu'au §19 : le pied de page ne dit rien,
   l'annexe fait foi ;
4. **numéro d'immatriculation vide** — cohérent pour une mise en copropriété,
   à ne pas confondre avec un oubli sur une copropriété existante ;
5. le **projet de règlement de copropriété** est porté « Sans objet » alors que
   la mission est précisément une mise en copropriété. À confronter au décret
   du 28 décembre 2016.

### Et l'attestation d'assurance est un catalogue de plus

Elle énumère **toutes** les activités assurées — soixante lignes, du repérage
sur navires à la qualité de l'air. Troisième forme du même piège, après
l'en-tête commercial et l'attestation sur l'honneur : un texte imprimé dans
tous les rapports ne dit rien de celui qu'on lit.

---

## 22 · Les ligatures, ou le défaut qui se lit comme une absence

Le générateur du DTG code « fi », « fl » et « ffi » dans un glyphe de ligature
que pdf.js rend en **fragment séparé**. Assemblés avec des espaces, ils
éclatent un mot sur trois :

```
dé fi nition     identi fi ant     véri fi cation     in fl uence
a fi n           su ffi t          quali fi é         modi fi cations
```

**Cinquante-deux mots** du seul rapport lu étaient dans ce cas. Aucun motif de
recherche n'y survit : chercher « vérification » dans un DTG ne trouve rien.

Et c'est là que le défaut est vicieux — il ne casse rien, il ne lève aucune
erreur, il **renvoie zéro**. Une sonde qui mesure « combien de DTG mentionnent
une vérification » aurait répondu « aucun », et on en aurait conclu que les DTG
n'en parlent pas. C'est le §12 sous une autre forme, et la parenté avec les
sondes qui mentent est directe.

Corrigé à la source, dans la reconstruction des lignes : un fragment qui n'est
qu'une ligature se recolle à ses voisins. Ni « fi », ni « fl », ni « ff », ni
« ffi », ni « ffl » n'étant un mot français, la règle ne risque rien. Mesure :
**52 → 0**, aucune régression sur les dossiers de logement, quatre tests.

---

## 23 · Le gaz, relu en entier — et le verdict qui rassurait à tort

Le §6 avait lu deux volets gaz et compris la mécanique. Il manquait la mesure.
Elle est faite, et elle était mauvaise : sur les rapports dont la synthèse
écrit la conclusion en clair, le produit se trompait **trois fois sur trois** —
et toujours dans le sens le plus dangereux, « aucune anomalie » là où le
rapport demandait une réparation dans les meilleurs délais.

Après correction : **sept sur sept justes**.

### Pourquoi le gaz n'avait jamais été mesuré

La sonde cherchait la conclusion de synthèse à la phrase
« L'installation intérieure de gaz… ». Or la page de synthèse écrit seulement
**« L'installation comporte des anomalies de type A2 »** — le mot « gaz » est
dans la colonne d'à côté, celle du libellé de prestation. Zéro dossier
mesurable sur soixante : la sonde ne rendait pas un mauvais chiffre, elle ne
rendait rien, et personne ne s'en était étonné.

### Trois sortes de lignes citent A1, A2 ou DGI — une seule constate

```
(selon la norme) (A1 , A2 ,        ← la légende de colonne, coupée en deux
DGI , 32c )                          lignes par la mise en page
Tuyauteries fixes - Espace A2 …    ← LE CONSTAT
(4) A1 : L'installation présente…  ← les notes de bas de tableau,
(5) A2 : L'installation présente…    une par type, chacune n'en citant qu'un
```

Les notes se reconnaissent à leur appel en tête de ligne — `(3)`, `(4)`… — et
la légende à ce qu'elle cite plusieurs types d'un coup. Ce qui reste constate.

Se tromper coûte dans les deux sens : lire les notes fait annoncer « A1 et A2
et DGI » à tous les rapports du corpus ; les écarter trop largement fait
annoncer « aucune anomalie » sur le seul diagnostic qui peut faire couper le
gaz le jour même.

### La rubrique G est un gisement, et personne ne la lit

« G. — Constatations diverses » n'est pas un fourre-tout. Sur le rapport lu,
elle porte quatre lignes que rien d'autre du dossier ne dit :

- *Attestation de contrôle de moins d'un an de la vacuité des conduits de
  fumées non présentée* ;
- *Justificatif d'entretien de moins d'un an de la chaudière non présenté* ;
- *Le conduit de raccordement n'est pas visitable* ;
- *Au moins un assemblage par raccord mécanique est réalisé au moyen d'un ruban
  d'étanchéité.*

L'entretien annuel de la chaudière et le ramonage sont des obligations de
l'occupant, et leur absence pèse en cas de sinistre. C'est le genre
d'information qu'un acheteur voudrait connaître, et elle est en petits
caractères sous un titre qui annonce des « constatations diverses ».

### Une contradiction interne, dans le même volet

La rubrique **F** — parties et points de contrôle n'ayant pu être contrôlés —
porte « Néant ». La rubrique **G**, deux lignes plus bas, écrit : *« Certains
points de contrôles n'ont pu être contrôlés. De ce fait la responsabilité du
donneur d'ordre reste pleinement engagée. »*

Les deux ne peuvent pas être vraies. À signaler comme telle : ni trancher, ni
taire.

### « Installation alimentée en gaz : NON »

Écrit en rubrique A, et tout le volet en découle. La rubrique D — identification
des appareils — porte « Néant », alors que la rubrique G parle d'une chaudière.
Une installation non alimentée ne permet **aucun essai** : c'est le pendant gaz
du différentiel non déclenché de l'électricité, et il change la portée de la
conclusion.

### Le quatrième type : 32c

Au-delà d'A1, A2 et DGI, le rapport prévoit **32c** : chaudière de type VMC GAZ
dont le dispositif de sécurité collective est en défaut. Elle ne se répare pas
par le propriétaire mais par **le syndic ou le bailleur social**, sous contrôle
du distributeur. Le produit la traite à part, et ne la compte pas parmi les
anomalies du logement.

### Un libellé de la norme qui dit le contraire de ce qu'il constate

Relevé mot pour mot :

> `5 : l'espace annulaire de la canalisation gaz à la pénétration dans le
> logement est obturé. Si oui, il est obturé. (Nota: ce libellé comporte une
> erreur et sera prochainement corrigé par l'AFNOR pour être remplacé par
> "l'espace annulaire […] n'est pas obturée.")`

Le libellé officiel affirme que le défaut *est* corrigé, alors qu'il constate
l'inverse — et le rapport le signale lui-même. Un lecteur qui s'arrête à la
première phrase comprend « tout va bien » sur une anomalie **A2**, dont le
risque est écrit deux lignes plus bas : accumulation de gaz et explosion.

C'est la démonstration que **la source d'un texte ne garantit pas sa
justesse** : ici, c'est la norme elle-même qui se trompe, et le diagnostiqueur
qui rattrape.

### Ce que le volet dit encore, et qu'on gardera

- La **norme employée est datée** : `AFNOR NF P 45-500 (juillet 2022)`, écrite
  deux fois en tête de volet.
- La **validité est de trois ans** à la vente, écrite dans le préambule —
  comme l'électricité, et pour la même raison (§17).
- Le **numéro de compteur** figure au dossier : c'est lui que le distributeur
  demande en cas de DGI.
- En cas de DGI, l'opérateur **ferme lui-même** l'installation, pose une
  étiquette de condamnation, prévient le distributeur et remet au client une
  « fiche informative distributeur de gaz ». Le rapport décrit cette procédure
  qu'aucun particulier ne connaît.

---

## 24 · L'anomalie compensée : deux vérités, pas une contradiction

Quatre rapports du corpus relèvent, dans le tableau d'anomalies de
l'électricité, **un seul point** — « Au moins un socle de prise de courant
comporte une broche de terre non reliée à la terre » — assorti de la mention :

> *(Cette anomalie fait l'objet d'une mesure compensatoire pour limiter le
> risque de choc électrique.)*

Et leur page de synthèse conclut « ne comporte aucune anomalie ».

Les deux disent vrai. La broche non reliée est bien une anomalie ; le
différentiel 30 mA qui protège l'ensemble limite déjà le risque de choc, et
c'est cela que la mesure compensatoire nomme.

Le produit suivait le tableau et contredisait la synthèse : quatre logements
sur soixante s'entendaient annoncer un défaut électrique que leur rapport
n'annonçait pas. Il suit désormais la conclusion du rapport **et** dit le point
compensé, dans les faits. Ni trancher, ni taire.

La mesure le confirme : **59 verdicts justes sur 60**.

---

## 25 · Le plomb, mesuré — et deux sondes qui mentaient

Le CREP du dossier de vente lu page à page, puis mesuré sur le corpus.
Résultat, et c'est le premier de cette qualité : **22 verdicts justes sur 22.**
Le moteur du plomb est bon.

Mais il a fallu deux tentatives pour le savoir, et les deux premières
annonçaient des erreurs qui n'existaient pas.

### Première sonde : elle lisait la page de garde

Elle cherchait « plomb » dans les cinq premières pages du dossier pour y
trouver la conclusion de synthèse. Elle tombait sur la **grille des quarante
prestations du cabinet** — « Exposition au plomb (CREP) » — imprimée sur tous
les dossiers, et concluait « présence de plomb » partout.

C'est le piège n°1 du carnet, écrit noir sur blanc au §2 de
[[checkmydiag-calibrer-sur-corpus]] — et commis en écrivant l'outil censé le
déjouer. Deux « erreurs du moteur » ont été annoncées sur cette base.

### Deuxième sonde : elle lisait la couleur, pas la phrase

Corrigée pour prendre la vérité au **tableau des classes** — du texte, qui se
recompte —, elle comptait encore trois erreurs. Elles n'existaient pas non
plus : le produit disait « Du plomb est présent, mais tous les revêtements
concernés sont en bon état (classe 1) », avec la gravité « bon ». La sonde
lisait la gravité et en déduisait « pas de plomb ».

**On mesure ce que le produit DIT, pas la couleur qu'il affiche.** Une gravité
« bon » sur un constat positif est un choix juste : il n'y a rien à faire
d'urgent.

### La leçon, qui vaut au-delà du plomb

Trois erreurs annoncées, zéro réelle. Une sonde est un programme comme un
autre : elle se vérifie sur un cas connu avant de servir de juge. Le réflexe
qui a sauvé la mesure : **ouvrir la ligne que la sonde a retenue**, et regarder
d'où elle vient. Les deux fois, elle venait d'ailleurs que du volet.

---

## 26 · Ce que le CREP dit et que le produit ne lisait pas

### Ses cases sont cochées EN TEXTE

Contrairement au gaz et à l'électricité, l'en-tête du CREP sort ses croix :

```
X Les parties privatives          X Avant la vente
  Les parties occupées              Avant la mise en location
  Les parties communes              Avant travaux
```

C'est la première marque lisible qui dise **vente ou location**, et elle est
précieuse : toutes les validités en dépendent (§17). Les cases cochées ne
dépendent donc pas du diagnostic mais du **formulaire** : un même dossier peut
mêler des coches lisibles et des coches dessinées.

### La validité dépend du résultat, et le produit se trompait

Le §9 l'avait établi : **une seule unité de classe 1 rend le constat positif**,
et un constat positif n'est valable qu'un an à la vente, six ans à la location.
C'est la présence de plomb qui compte, pas sa dégradation — article R. 1334-11
du code de la santé publique, déjà inscrit au référentiel.

Or le produit annonçait « sans limite de durée à la vente » dès qu'aucune unité
n'était classée 3. Un vendeur dont les peintures au plomb sont intactes s'y
serait fié, et aurait présenté un constat caduc à la signature.

Corrigé : trois cas distincts au lieu de deux — négatif (aucune limite),
positif sans classe 3 (un an, pas de travaux imposés), classe 3 (un an, et
travaux obligatoires). Trois tests le verrouillent.

Le savoir était au carnet et au référentiel ; c'est le code qui ne l'avait pas
suivi. **Un acquis n'est acquis que là où il est appliqué.**

### « Non mesurée » a une seconde raison

Le §8 avait établi la première : pas de revêtement à mesurer — pierre nue,
carrelage, métal. Le rapport en donne une autre, dans sa méthodologie :

> Les éléments de construction de facture récente ou clairement identifiables
> comme **postérieurs au 1er janvier 1949** ne sont pas mesurés, à l'exception
> des huisseries ou autres éléments métalliques.

Une unité non mesurée peut donc être simplement trop récente pour contenir du
plomb. Deux raisons, aucune inquiétante.

### Et une incohérence d'arrondi

Sur le constat lu : 5 unités de classe 0 et 5 de classe 2, sur 12 au total. Le
rapport écrit **41,8 %** pour l'une et **41,7 %** pour l'autre — le même
compte, deux pourcentages. Sans conséquence, mais c'est le genre d'écart qui
fait douter d'un tableau quand on le remarque sans l'expliquer.

---

## 10 · À vérifier lors des prochaines lectures

- [x] ~~Le tableau « E. — Anomalies identifiées » du gaz est la conclusion
      réelle.~~ → vérifié et mesuré, §23 : trois sortes de lignes y citent les
      types, une seule constate. De 0/3 à 7/7 justes.
- [x] ~~Le volet électricité : mêmes rubriques que le gaz ?~~ -> voir §16 :
      même conclusion-formulaire, mais sa liste de domaines est un catalogue,
      et deux variantes de tableau constatent vraiment.
- [x] ~~Le CREP : comment les classes 0 à 3 sont-elles présentées ?~~ → un
      tableau à six colonnes, du texte, qui se recompte. Mesuré : 22/22 justes.
- [ ] Le DPE : où sont les seuils des petites surfaces ?
- [x] ~~Un dossier de copropriété (DTG, PPPT) : structure jamais lue.~~ → un DTG
      lu en entier, voir §21. Restent le PPPT, le DTA, le RAAT et le DPE
      collectif.
- [ ] Les termites : « informations collectées auprès du donneur d'ordre »
      (traitement antérieur, présence déclarée) sont des cases dessinées, donc
      illisibles. Y a-t-il une autre trace de ces réponses dans le rapport ?
- [x] ~~L'amiante repart sans date dans 43 % des cas~~ → ce n'était pas une
      lecture manquée : le rapport n'est pas au dossier une fois sur deux.
- [x] ~~Le DPE est muet dans 42 % des cas~~ → 33 studios sur 40, faute de la
      table des petites surfaces. Réglé : 4 %.
- [ ] Le gaz ne produit aucun schéma (0 %), le mesurage non plus.
- [ ] L'amiante n'a de schéma que dans 53 % des cas.
- [ ] L'ERP reste muet dans 11 % des cas : lesquels ?
- [ ] Une rubrique présente et VIDE est un résultat — gaz et amiante le
      confirment. Faut-il le dire au lecteur (« tout a pu être examiné ») ?
- [ ] Mesurer la JUSTESSE et non la présence, volet par volet : une sonde qui
      compare ce que le document déclare à ce que le verdict en retient, sur le
      modèle de `argile-detectee.local.ts`. Fait pour l'argile ; reste le plomb,
      l'électricité, les termites.
- [ ] Un rapport dont la synthèse dit « aucune anomalie » et dont le volet
      porte six libellés d'anomalie : contradiction du rapport, ou section qui
      déborde sur le volet voisin ? Un cas sur trente et un, à ouvrir.
- [ ] `conclusionDe` ne rattache pas la conclusion électricité que la page de
      synthèse écrit pourtant en clair sur ce même dossier : gain à prendre.
- [x] ~~Les mesures compensatoires de l'électricité : les dire.~~ → fait, §24.
      Reste à les expliquer au lecteur, dans les notions.
- [ ] Vente ou location : le dossier le dit (Boutin/Carrez, 6 ans/3 ans). En
      déduire la nature de la transaction, et adapter toutes les validités.
- [ ] Vérifier au texte officiel le calendrier du DPE collectif — article
      L126-31 du CCH et article 158 de la loi n° 2021-1104. Cité par un DTG,
      pas encore relu à la source : tant que ce n'est pas fait, aucun contrôle
      ne peut s'appuyer dessus.
- [ ] Le PPPT, le DTA et le RAAT : jamais ouverts. Le corpus en contient.
- [ ] Les ligatures : d'autres générateurs sont-ils concernés ? Mesurer sur le
      corpus combien de rapports en portent, plutôt que sur le seul DTG lu.
- [ ] La rubrique G du gaz — constatations diverses — porte l'entretien de la
      chaudière et le ramonage non justifiés. Rien ne les remonte encore.
- [ ] « Installation alimentée en gaz : NON » : le dire, comme le différentiel
      non essayé. Mesurer d'abord sa fréquence sur le corpus.
- [ ] La contradiction F « Néant » / G « certains points n'ont pu être
      contrôlés » : la signaler sans trancher.
- [ ] Lire les croix du CREP (« X Avant la vente » / « Avant la mise en
      location ») pour déduire la transaction, et en tirer toutes les validités.
- [ ] Un CREP dont le tableau porte « 0 0 0 0 0 0 » : aucune unité mesurée
      n'est pas « aucun plomb ». Vu une fois, à retrouver et à traiter.
- [ ] Vérifier au texte la validité du CREP en location (six ans) : le
      référentiel la donne, la lecture ne l'a pas encore confirmée sur pièce.
