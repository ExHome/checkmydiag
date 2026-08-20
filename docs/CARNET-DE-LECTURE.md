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

## 27 · L'amiante : dix-sept logements se voyaient annoncer une amiante inexistante

La pire fausse alerte trouvée à ce jour, et la plus visible — il suffisait de
lire une carte pour la voir.

Le produit affichait :

> **Amiante repérée : Code postal, ville : . 33360 CAMBLANES ET MEYNAC
> (France), et 2 autres.**

…sur un rapport dont la conclusion écrit « il n'a pas été repéré de matériaux
ou produits de la liste A contenant de l'amiante ». Ailleurs, le « matériau »
cité était l'adresse du bien, ou **la raison sociale du cabinet**.

**Mesuré : dix-sept volets sur dix-neuf.** Deux verdicts justes sur dix-neuf.

### Deux fautes superposées

**La première est un motif trop large.** La liste des matériaux se lit par sa
forme — un intitulé, puis sa localisation entre parenthèses :

```
Dalles de sol (Cuisine)                        ← un matériau
Code postal, ville : . 33800 BORDEAUX (France) ← la page de couverture
```

Les deux ont la même forme. Le volet commençant par sa page de couverture, qui
est pleine d'adresses, de communes et de raisons sociales, le motif y trouvait
toujours de quoi remplir un verdict.

**La seconde est plus grave, et c'est elle qui rendait la première visible** :
le verdict citait le premier matériau trouvé **sans vérifier que le rapport en
avait repéré un**. La gravité, elle, était calculée sur la conclusion — d'où
une carte qui annonçait « Amiante repérée » avec une pastille verte. Le produit
se contredisait dans le même bloc, et personne ne l'avait vu.

Corrigé : le détail ne parle que si la conclusion dit qu'il y a quelque chose,
et les lignes d'identité sont écartées. **Dix-neuf sur dix-neuf.** Trois tests
tiennent l'acquis, dont un qui vérifie que verdict et gravité s'accordent.

### La conclusion tient sur deux lignes, et la première porte la négation

```
1.1 Liste A : Dans le cadre de mission décrit à l’article 3.2 , il n'a pas été repéré
- de matériaux ou produits de la liste A contenant de l'amiante.
```

Lue ligne à ligne, la seconde dit exactement le contraire de la première. C'est
le même piège que la date « Rapport du : », et il coûte ici un contresens
complet.

### Deux listes, deux conclusions

Le constat conclut **séparément** sur la **liste A** — flocages, calorifugeages,
faux plafonds — et sur la **liste B** — le reste des matériaux accessibles. Un
rapport peut être négatif sur l'une et positif sur l'autre, et les
conséquences ne sont pas les mêmes. Les confondre en un seul verdict ferait
perdre l'essentiel.

### Le rapport annonce sa propre pagination

En page de couverture :

> Pagination : le présent rapport avec les annexes comprises, est constitué de
> **11 pages**, la conclusion est située en **page 2**.

C'est un contrôle d'intégrité offert : si le volet n'a pas le nombre de pages
qu'il s'attribue, il en manque — ou la découpe s'est trompée.

**Mesuré : sur vingt volets qui annoncent leur pagination, vingt sont plus
courts que ce qu'ils annoncent, de près de quinze pages en moyenne.** La
découpe ferme donc systématiquement l'amiante après sa conclusion, et tout ce
qui suit — la liste détaillée des matériaux, leur état de conservation, les
parties non visitées — n'est jamais lu.

Le verdict reste juste, puisqu'il vient de la conclusion. Mais quand il y a de
l'amiante, le produit ne peut pas dire **lequel**.

**Corrigé le 19/08/2026, et la cause était d'une simplicité désarmante** : ce
générateur répète son titre courant en tête de chaque page — « Constat de
repérage Amiante n° … » — et ce titre ne figurait pas parmi les marqueurs de
découpe. La section se fermait donc après la conclusion, et les neuf pages
suivantes partaient hors section.

**Mesuré après : 1 volet sur 20 reste plus court que ce qu'il annonce**, contre
20 sur 20. La justesse ne bouge pas — 19 sur 19 —, et aucun autre diagnostic
n'est touché : électricité 30/31, gaz 3/3, plomb 13/13.

Une leçon de méthode : le défaut était invisible depuis les verdicts, qui
restaient justes. C'est **le rapport lui-même qui a dénoncé la découpe**, en
annonçant sa pagination. Un document qui se compte est un document qui se
vérifie — à chercher ailleurs.

---

## 28 · Les termites : le moteur est juste, et le rapport dit plus qu'il n'en a l'air

**Mesuré : 38 verdicts justes sur 38.** Avec le plomb et l'amiante corrigé, le
troisième diagnostic à sortir sans faute.

Le §5 avait déjà noté que ce volet se lit bien : le tableau D est linéaire —
`Plateau  Sol - Béton  Absence d'indices d'infestation de termites` — et les
rubriques F, G et H sont explicites, « Néant » quand il n'y a rien.

### Ce que la lecture ajoute

**Le rapport dit si le bien est en zone d'arrêté.** En tête du volet :

> Situation du bien en regard d'un arrêté préfectoral pris en application de
> l'article L 131-5 du CCH : **Néant**

C'est déterminant : l'état termites n'est exigible à la vente que dans les
zones délimitées par arrêté préfectoral (article L. 126-24 du CCH, cité par le
rapport lui-même). Un champ à « Néant » ne veut pas dire que le diagnostic est
inutile — il a été fait —, mais il dit quelque chose du risque local que le
produit ne restitue pas.

**Le même arrêté vaut pour la mérule.** L'article L. 131-3 délimite les zones
de termites *et* les zones de risque mérule. Le rapport le cite ; le produit
n'en parle jamais.

**Une obligation que les propriétaires ignorent** : en cas de présence de
termites, la loi impose une **déclaration en mairie** (articles L. 126-4 et
L. 126-5 du CCH). C'est écrit en note de bas de page, sous « Nota 2 ».

**Le périmètre va jusqu'à dix mètres** des extérieurs de l'habitation, dans la
limite de la propriété — et le sondage des boiseries se fait au poinçon,
systématiquement. Deux précisions qui expliquent ce que le diagnostic peut
affirmer, et ce qu'il ne peut pas.

### Et la confirmation d'un point ouvert

- [x] ~~Les termites : les « informations collectées auprès du donneur d'ordre »
      ont-elles une autre trace ?~~ → non, confirmé §28 : ces trois lignes ne
      seront jamais lisibles.
antérieur, présence déclarée de termites, notice technique — sont bien des
**cases dessinées**, sans autre trace dans le rapport. Le §10 le soupçonnait ;
la lecture le confirme. Ces trois lignes ne seront jamais lisibles.

---

## 29 · Quatre sondes, quatre mensonges — la leçon de la journée

En une séance, **quatre outils de mesure ont accusé le moteur à tort** :

| Sonde | Ce qu'elle croyait mesurer | Ce qu'elle mesurait |
|---|---|---|
| plomb (1) | la conclusion de synthèse | la grille des 40 prestations de la page de garde |
| plomb (2) | la présence de plomb | la couleur de la pastille |
| termites (1) | une infestation | le mot « infestation » dans « aucun indice d'infestation » |
| termites (2) | un verdict positif | rien : l'apostrophe typographique ne correspondait pas |

Aucune n'a été publiée : chaque écart a été ouvert et regardé avant d'être
annoncé. Mais le compte est net — **sur ce corpus, il est plus facile d'écrire
une sonde fausse qu'un extracteur faux**, parce qu'une sonde ne casse rien : un
zéro se lit comme un résultat.

Les quatre gardes qui en sortent :

1. **Ouvrir la ligne que la sonde a retenue**, toujours, avant de conclure quoi
   que ce soit. Trois fois sur quatre, elle venait d'ailleurs que du volet.
2. **La négation est en tête de phrase, jamais dans le mot.** Tester l'absence
   avant la présence.
3. **Mesurer ce que le produit DIT, pas la couleur qu'il affiche.**
4. **Les apostrophes diffèrent** entre le produit et les rapports. Accepter les
   deux, partout.

---

## 30 · L'état des risques, lu en entier — et la croix qui change de côté

Vingt pages lues page à page, sur un bien de Bordeaux en zone inondable. Le
§7 avait décrit ce document ; ce qui suit le complète sur trois points qu'une
seule lecture ne pouvait pas donner.

### Deux mises en page coexistent, et elles sont inverses

L'imprimé officiel — celui que la loi impose — sort ses croix en texte. Mais la
place de la réponse a changé entre deux millésimes du même éditeur, devenu
Septeo Solutions Proptech :

```
2023        L'immeuble est situé dans le périmètre d'un PPRn approuvé   oui non x
                                                                         ↑ après

2024        non x
            L'immeuble est situé dans le périmètre d'un PPRn prescrit   oui
             ↑ avant, sur la ligne précédente
```

**Mesuré sur 63 volets : 28 portent la réponse après la phrase, 21 avant, 14
restent illisibles.** Les deux formes sont donc presque à parts égales, et
elles se contredisent : une lecture qui cherche la croix après la phrase lit,
sur la seconde, le mot resté seul à la fin — c'est-à-dire la réponse opposée.

Sur le dossier lu, cela change tout : le bien **est** en PPRn Inondation
approuvé, avec prescriptions de travaux. Une lecture naïve aurait annoncé
l'inverse.

**Ce que le produit fait, et pourquoi il ne se trompe pas** : il lit le tableau
de synthèse du volet — `PPRn Inondation approuvé 05/12/2023 oui oui p.3` — et
non l'imprimé. Vérifié : sur les sept biens en PPR approuvé de l'échantillon,
il le dit sept fois. L'imprimé officiel reste donc un gisement inexploité, pas
une source d'erreur.

### Les prescriptions de travaux sont conditionnelles

Le tableau de synthèse porte deux colonnes, « Concerné » et « Travaux ». Quand
la seconde dit oui, le rapport détaille — et ce détail se lit mal :

> Pour le PPR « Inondation » approuvé le 05/12/2023, des prescriptions
> s'appliquent dans les cas suivants :
> - Quelle que soit la zone et sous la condition « aire de stationnement ou
>   garage souterrain (gestionnaire, public ou privé) » : référez-vous au
>   règlement, page(s) 94
> - … « cuve à combustible (propriétaire ou gestionnaire) » : page(s) 86

Ce ne sont pas des travaux imposés au logement : ce sont des cas de figure, à
recouper avec ce que le bien possède. Un acquéreur qui lit « des prescriptions
de travaux existent » sans cette nuance croira devoir faire des travaux ; un
autre qui a un garage souterrain passera à côté de ce qui le concerne.

### Quarante-trois arrêtés de catastrophe naturelle

Sur la commune lue : crues et ruissellements presque chaque année, sécheresses
à répétition, une tempête, une submersion marine. La colonne « Indemnisé »
reste vide — c'est au vendeur de la remplir (§7), et elle ne l'est jamais.

### La rubrique argiles a maintenant sa page

Le §7 l'avait trouvée noyée dans le bloc des sinistres. Le millésime 2024 lui
consacre une page entière — « Argiles : information relative aux travaux non
réalisés » — avec le texte de l'article R. 125-24 reproduit, et deux cases
« Oui / Non ».

**Elles ne sont pas cochées.** Deux éditeurs, deux millésimes, deux communes
différentes : la case reste vierge. Ce n'est donc pas un oubli isolé, c'est un
défaut structurel de la chaîne — le vendeur ignore que cette case existe.

### Deux chiffres qui situent

- **100 sites** Basias, Basol ou ICPE à moins de 500 mètres, contre 36 et 2 sur
  les deux autres dossiers lus. Le chiffre est en petits caractères, dans un
  tableau « donné à titre informatif ».
- **Un risque nouveau apparaît** dans ce millésime : le **recul du trait de
  côte**. Ici, « commune non concernée » — mais la ligne existe désormais, et
  Verrière ne la connaît pas.

---

## 31 · Trois cas d'espèce, relevés en poursuivant la lecture

Lecture cumulative : on ne note que ce que le dossier ajoute.

### Un ERP peut peser cent onze pages, dont quatre-vingt-trois de règlement

Un dossier de location de Bordeaux ne contient **qu'un seul diagnostic** —
l'état des risques — mais le PDF fait 111 pages : le rapport en occupe 12, et
le **règlement du PPR Inondation y est annexé en entier**, 83 pages signées de
la Direction Départementale de l'Équipement, plus l'arrêté préfectoral et la
fiche d'information acquéreur-locataire.

La découpe a raison de ne pas les rattacher — ce sont des textes officiels
tiers, pas le rapport. Mais un produit qui affiche « 99 pages non exploitées »
inquiéterait à tort. Il faut savoir dire : *c'est un état des risques, et son
règlement de prévention est joint.*

### Deux plans de prévention peuvent coexister sur le même risque

```
PPRn  Inondation  approuvé   07/07/2005  oui  oui   p.3
PPRn  Inondation  prescrit   02/03/2012  oui  non   p.3
```

Le même bien est concerné par **deux procédures simultanées** — l'une approuvée
avec prescriptions de travaux, l'autre prescrite sans. Lire « le » PPR au
singulier fait perdre la moitié de l'information, et probablement la plus
contraignante des deux.

### Les sites pollués voisins se comptent par centaines

Trois dossiers lus, trois ordres de grandeur : **2**, **100** et **118** sites
Basias, Basol ou ICPE à moins de 500 mètres. Le chiffre figure en petits
caractères dans un tableau « donné à titre informatif », et rien ne dit au
lecteur ce qu'est un ordre de grandeur normal. À Bordeaux intra-muros, la
centaine est la règle : l'annoncer sans repère serait alarmiste.

---

## 32 · Le formulaire de l'ERP annonçait un risque technologique à 49 biens sur 63

La lecture d'un état des risques de Pessac a fait apparaître, dans le verdict du
produit, un « risque technologique » que le rapport ne porte nulle part.

### La cause, et c'est la troisième fois du même genre

L'imprimé officiel énumère les rubriques que la loi impose, qu'elles concernent
le bien ou non :

```
Situation de l'immeuble au regard de plans de prévention des risques technologiques [PPRt]
L'immeuble est situé dans le périmètre d'un PPRt approuvé   oui non x
L'immeuble est situé dans le périmètre d'un PPRt prescrit   oui non x
```

Ces lignes commencent par « L'immeuble est situé » : le filtre des affirmations
les gardait, et le détecteur y trouvait « PPRt ». Elles sont imprimées dans
**tous** les états des risques.

**Mesuré : 49 volets sur 63 annonçaient un risque technologique. Pas un seul
dossier ne porte de PPRt concerné.**

C'est le catalogue de l'électricité (§16) et l'attestation d'assurance (§19)
sous une troisième forme : *un texte imprimé dans tous les rapports ne dit rien
de celui qu'on lit*. La règle est désormais acquise trois fois ; elle mérite
d'être cherchée partout où un formulaire précède un constat.

### Deux marques reconnaissent un formulaire, quel que soit le risque

1. **les deux réponses côte à côte** — « oui non » ;
2. **l'échelle énumérée en entier** — « zone 5 zone 4 zone 3 zone 2 zone 1 ».

Une phrase qui affirme ne fait ni l'un ni l'autre. En écartant ces deux formes,
la fausse alerte technologique tombe de **49 à 1**, la pollution des sols de
plusieurs dossiers à **zéro** — et l'inondation reste annoncée dans **26**
dossiers, ce qui prouve que la détection utile n'a pas été perdue.

### Et une omission du rapport, que le produit répare

Sur ce même dossier de Pessac, le tableau de synthèse porte
`Zonage du retrait-gonflement des argiles | Oui | Aléa Fort`. Les
**conclusions rédigées** du rapport, elles, ne citent que la sismicité :
l'argile — le risque n°1 de la région, et le seul « fort » du dossier — n'y
figure pas.

Un lecteur qui s'arrête aux conclusions ne saura donc jamais que son bien est
en aléa fort. Verrière le dit. C'est exactement ce pour quoi elle existe, et
c'est le premier cas où on peut le montrer aussi nettement.

---

## 33 · Le DPE aussi se fermait trop tôt — et il emportait sa fiche technique

Le contrôle de pagination, appliqué au DPE : **58 volets sur 58 étaient plus
courts que ce qu'ils annoncent**, de près de sept pages en moyenne.

Ce qui se perdait n'est pas accessoire. Les pages manquantes sont la **fiche
technique du logement** — celle qui porte le type de bien, l'année de
construction, les surfaces, les matériaux de chaque mur, les systèmes. C'est
exactement ce que le §« calibrer sur corpus » avait identifié comme la source
du type, de la surface et de l'année.

### Pourquoi elle échappait

Le DPE **ne répète pas son titre** sur ses annexes. La page qui les ouvre porte
« DPE / ANNEXES p. 7 », et les suivantes n'ont aucun en-tête : elles ne se
reconnaissent qu'à leur **pied de page**, où le numéro change à chaque feuille :

```
SARL DGLM EXPERTISES | Tél : 06.72.70.03.38 | Dossier : 22/IMO/0549   Page 8 / 11
```

Aucun fragment fixe ne peut attraper ça — c'est une **forme**, pas un mot. La
découpe ne savait reconnaître que des fragments ; elle sait désormais
reconnaître une forme quand un rapport ne répète pas son titre.

**Mesuré après : 7 volets sur 58 restent courts**, et le DPE ne sort sans
lettre que dans **2 %** des cas, contre 4 % auparavant.

### Ce que ces deux corrections ont en commun

L'amiante (§27) et le DPE se fermaient tôt pour la même raison de fond : la
découpe cherchait un titre là où le rapport n'en met pas. Et dans les deux cas,
**c'est le document qui a dénoncé le défaut en se comptant** — « constitué de
11 pages » pour l'un, « Page 8 / 11 » pour l'autre.

Un rapport qui se compte est un rapport qui se vérifie. Il reste à chercher
cette annonce partout où elle existe.

---

## 34 · Le rapport déclare l'argile, et ne la dit pas

C'est le constat le plus net de toute la lecture, et il tient en trois nombres.
Sur 63 états des risques :

| | |
|---|---|
| déclarent l'argile dans leur tableau de synthèse | **55** |
| la citent dans leurs **conclusions rédigées** | **3** |
| Verrière la dit | **42** |

**Cinquante-deux rapports sur cinquante-cinq taisent, dans leur conclusion, un
risque qu'ils déclarent quatre pages plus haut.**

Ce n'est pas une négligence du diagnostiqueur : les conclusions rédigées ne
reprennent que les **procédures officielles** — PPR, sismicité, radon — et le
retrait-gonflement des argiles vit dans le second tableau, celui qui porte la
mention « donné à titre informatif ». La chaîne est ainsi faite.

Sauf que c'est le **risque n°1 de la région**, qu'il fissure les maisons, et
qu'il déclenche depuis 2024 une obligation d'étude géotechnique et
d'attestation RGA (§18). Un lecteur qui s'arrête aux conclusions — c'est-à-dire
tout le monde — ne saura jamais que son bien est en aléa moyen ou fort.

**Verrière le dit dans 42 cas sur 55** — puis, une heure plus tard, dans
**55 sur 55**.

Les treize manquants tenaient à une **quatrième écriture**, trouvée en lisant :
le tableau Géorisques sort le détail AVANT le nom de sa propre ligne.

```
Le bien se situe dans une zone d'aléa Moyen.
Retrait / gonflement des argiles
```

La phrase seule ne nomme pas l'argile ; le libellé seul n'affirme rien. Il
fallait les lire ensemble — c'est le piège d'entrelacement du §11, appliqué à
la ligne la plus importante du document.

Quatre écritures pour une même réalité, désormais : ligne de tableau, phrase
Géorisques, texte réglementaire (§18), et détail-avant-libellé. **Une notion
canonique, ses variantes observées.**

### Deux vérifications faites en chemin

Sur un bien de Bordeaux dont le tableau porte `PPRn Inondation approuvé
05/12/2023 | **non** | non`, le produit **ne dit pas** l'inondation : la
commune a un plan, le bien n'y est pas. La correction du formulaire (§32) tient
donc dans les deux sens — elle n'a pas rendu le produit sourd.

Et l'omission de l'argile en conclusion est confirmée **deux fois sur deux** sur
les dossiers lus intégralement, avant même la mesure.

---

## 35 · Le catalogue échappait encore, et l'extraction coupe les mots

Un dossier complet de six volets a montré deux choses d'un coup.

### Le produit reprenait les six domaines comme six anomalies

Alors que `estCatalogueDomaines` existe depuis le matin. Il exigeait que **cinq
intitulés sur six** correspondent, et deux échouaient — non parce que le texte
diffère, mais parce que les libellés **recollés** sont longs :

```
La liaison équipotentielle et installation électrique adaptées aux conditions
particulières des locaux contenant une douche ou une baignoire
```

Entre « liaison équipotentielle » et « douche », il y a quatre-vingt-huit
caractères ; le motif en tolérait quatre-vingts. Le catalogue n'était donc plus
reconnu, et le produit annonçait six anomalies à une installation qui n'en avait
aucune.

Deux corrections : les distances passent à cent quarante caractères, et le
seuil s'assouplit quand la liste est **complète** — six entrées dont quatre
reconnues suffisent. La probabilité qu'un rapport constate exactement six
domaines dont quatre correspondent mot pour mot à l'arrêté est nulle.

**Mesuré après : 60 verdicts électricité justes sur 60**, et 7 sur 7 au gaz.

### L'extraction coupe les mots en deux

Relevé au passage, dans le même libellé :

```
… adapté à la section des conducteurs, sur ch aque circuit
```

« chaque » sort en « ch aque ». Ce n'est pas la ligature du §22 — c'est un
espace inséré au milieu d'un mot par la mise en page justifiée. Aucun motif
cherchant « chaque circuit » ne le trouvera.

À retenir comme classe de piège : **entre deux caractères d'un même mot, il
peut y avoir un espace**. Les motifs longs doivent donc rester tolérants, et
c'est aussi pour cela que le seuil du catalogue a été assoupli plutôt que
durci.

### Et le certificateur n'est pas un matériau

Le même dossier affichait, sous un verdict « aucun matériau contenant de
l'amiante » :

> Matériau repéré : QUALIXPERT 17 rue Borrel 81100 CASTRES (détail sur
> www.info-certif.fr)

Le filtre d'identité du §27 avait nettoyé le verdict, pas le **fait** affiché
en dessous. La carte se contredisait donc encore d'une ligne à l'autre. Le
détail ne s'affiche plus que si le rapport a repéré quelque chose — même règle
que le verdict, appliquée au même endroit.

---

## 36 · Le rapport qui se declare, et un quatrieme generateur

Un dossier de vente a revele un generateur inconnu — celui d'un reseau de
diagnostiqueurs. Ses pages ne portent pas le titre du diagnostic mais le nom du
cabinet, et la decoupe ramenait son DPE de **onze pages a une seule**.

### Il dit pourtant tout ce qu'il faut

En tete de chaque feuille :

```
DIAGNOSTIC DPE : 2 sur 11
DDT : 11 sur 33
```

Le type du volet, la position de la page dans ce volet, et la position dans le
dossier entier. C'est le document **le plus explicite du corpus** — et le seul
que la decoupe ne savait pas lire, parce qu'elle cherchait un titre.

Quand un rapport se declare ainsi, sa declaration l'emporte sur tout le reste :
elle ne se deduit pas, elle se lit. Le DPE retrouve ses onze pages.

### Il fallait aussi le sortir du sommaire

Ses pages portent peu de texte — beaucoup de graphiques — et citent plusieurs
diagnostics dans leur en-tete commercial. Le test du sommaire les interceptait
donc **avant** qu'on regarde ce qu'elles disent d'elles-memes. Une page qui
declare son volet n'est ni une page de garde ni un sommaire.

### Quatre generateurs, quatre facons de se reperer

| Generateur | Ce qui identifie ses pages |
|---|---|
| LICIEL | le titre du diagnostic, repete en en-tete |
| Preventimmo / Kinaxia / Septeo (ERP) | « Mode EDITION » et l'adresse du bien |
| celui du DTG | rien : ligatures eclatees, titre absent |
| reseau BC2E | **une declaration explicite du volet et de sa pagination** |

Aucun ne se lit comme les autres. C'est la meilleure raison de ne jamais
generaliser une regle de lecture apres un seul editeur.

---

## 37 · Les autres volets ne se ferment PAS trop tot — et c'est un resultat

Le point de reprise designait un chantier : chercher les volets qui se ferment
avant la fin, comme l'amiante et le DPE. Le controle de pagination generalise a
tous les volets donne ceci :

| volet | volets | annoncent leur pagination | plus courts |
|---|---|---|---|
| carrez | 33 | 33 | **0** |
| dpe | 37 | 37 | **0** |
| termites | 26 | 26 | **0** |
| electricite | 33 | 33 | **0** |
| plomb | 18 | 18 | **0** |
| gaz | 6 | 6 | **0** |
| amiante | 13 | 13 | 2 |
| erp | 50 | 48 | 33 |

**Tous les rapports annoncent leur pagination** — le controle est universel, et
c'est une bonne nouvelle en soi. Sept volets sur huit sont decoupes juste.

### Les trente-trois ERP « trop courts » n'en sont pas

L'etat des risques compte **ses annexes** dans son total : l'arrete prefectoral,
les fiches d'information sismicite et radon, parfois le reglement du PPR en
quatre-vingt-trois pages. La decoupe les exclut a raison — ce sont des textes
de l'Etat, pas le rapport.

Reste a verifier que le CONTENU utile est dans la plage. Mesure : la conclusion
redigee y figure 35 fois sur 50, elle est absente du document 6 fois, et 9 fois
elle est ailleurs. Ces neuf-la ont ete ouverts un par un :

> **la conclusion est en page 3, c'est-a-dire dans la page de synthese du
> dossier — avant le volet.**

Ce n'est donc pas un defaut de decoupe : ces rapports ne repetent pas leur
conclusion dans leur volet, et le moteur lit la synthese separement. Rien n'est
perdu, et la mesure le confirme : **45 dossiers sur 45 se voient dire l'argile**,
zero fausse alerte technologique, zero pollution des sols inventee.

### La lecon

**Un ecart mesure n'est pas un defaut tant qu'on n'a pas ouvert un cas.** Trois
sondes successives ont annonce ici un probleme qui n'existait pas — la
pagination qui compte les annexes, puis la conclusion « hors plage » qui etait
en realite en amont. La correction juste, cette fois, etait de **ne rien
corriger**.

C'est la sixieme sonde menteuse de la journee, et la premiere dont l'erreur
aurait conduit a casser une decoupe qui marche.

---

## 38 · « Arrete prefectoral : pris en application de l »

Un rapport termites de sept pages, lu en entier, affichait ce fait dans la
fiche du produit. Il ne dit rien a personne — c'est un morceau de la QUESTION,
pas la reponse.

Le rapport pose la question sur une ligne et repond sur la suivante :

```
Situation du bien en regard d'un arrete prefectoral pris en application de
l'article L 131-5 du CCH :
Neant
```

Le motif cherchait « arrete prefectoral » suivi de n'importe quoi, et ramassait
la suite de la question.

**Ce que le champ vaut vraiment.** L'etat termites n'est exigible a la vente
que dans les communes delimitees par arrete prefectoral (article L. 126-24 du
CCH). Un « Neant » n'est donc pas un vide : il dit que **la commune n'est pas
en zone**, et que le diagnostic a ete fait sans y etre tenu. C'est une
information pour l'acquereur, pas une case vide.

Le produit affiche desormais « aucun — la commune n'est pas en zone delimitee
par arrete », ou le numero de l'arrete quand il y en a un.

### Et l'apostrophe, encore

Le premier test ecrit pour cette correction a echoue : mon motif cherchait
« d'un arrete » avec l'apostrophe droite, et le rapport ecrit « d'un » avec
l'apostrophe typographique. C'est la garde n°4 du §29 — celle que j'avais
consignee le matin meme.

**Une regle ecrite ne se respecte pas toute seule.** Le test, lui, l'a
rattrapee en trois secondes.

---

## 39 · La mesure compensatoire, expliquee au lecteur

Le §24 avait etabli le fait : un rapport peut relever une anomalie, la dire
compensee, et conclure malgre tout que l'installation n'en comporte pas. Les
deux disent vrai. Restait a l'expliquer a celui qui lit.

C'est fait, et la notion tient en trois idees :

1. **Ce que c'est** — une prise dont la broche de terre n'est pas raccordee est
   une anomalie ; si un differentiel 30 mA protege tout le logement, il coupera
   le courant avant que le choc ne devienne dangereux.
2. **Compense ne veut pas dire repare** — la broche reste a raccorder le jour ou
   l'on refait l'electricite. Ce n'est simplement pas une urgence.
3. **La compensation peut tomber** — si le dispositif qui protege disparait, un
   differentiel remplace par un modele inadapte par exemple, le defaut redevient
   entier. Ce qui rend l'installation sure aujourd'hui doit etre maintenu.

La troisieme n'est ecrite dans aucun rapport. Elle se deduit du mecanisme, et
c'est exactement le genre de chose qu'un lecteur ne peut pas trouver seul.

### Et le point ouvert de l'electricite se referme

Le carnet gardait en suspens « un rapport dont la synthese dit aucune anomalie
et dont le volet porte six libelles ». La mesure du jour repond : **24 verdicts
electricite justes sur 24**, zero faux. Ce cas etait le catalogue non reconnu
(§35), et il a disparu avec lui.

---

## 40 · Vente ou location : le dossier le dit, et cela commande les durees

C'etait le dernier point ouvert de l'electricite. Rien n'ecrit la transaction en
toutes lettres sur la page de garde — mais le dossier se trahit de quatre
facons, toutes relevees en lisant :

| Marque | Penche vers |
|---|---|
| « durée de validité de 3 ans » (electricite, gaz) | vente |
| « durée de validité de 6 ans » | location |
| « article 3-3 de la loi n°89-462 » (rapports locatifs) | location |
| certificat de superficie, loi Carrez | vente |
| attestation de surface habitable, bail d'habitation | location |
| CREP coche « X Avant la vente » / « X Avant la mise en location » | l'un ou l'autre |

**Mesure sur soixante dossiers : 37 vendus, 13 loues, 8 indecis, 2 muets.**
Cinquante sur soixante se laissent classer.

### Une cinquieme piste, essayee et abandonnee

L'etat des risques nomme les parties — « Bailleur / Locataire » ou « Vendeur /
Acquereur ». C'etait tentant, et faux : l'imprime porte l'intitule **meme quand
la case est vide**, et les fiches d'information annexes parlent toutes
d'« acquereur - locataire ». Huit dossiers en devenaient contradictoires.

C'est le piege du formulaire pour la quatrieme fois de la journee, apres le
catalogue de l'electricite, l'attestation d'assurance et les rubriques PPRt.
**Un intitule imprime partout ne dit rien du dossier qu'on lit.**

### Les huit indecis ne sont pas un echec

Ils portent reellement **les deux surfaces** — un certificat Carrez et une
attestation de surface habitable dans le meme dossier. Cela arrive : un
proprietaire qui fait tout faire d'un coup, sans savoir encore s'il vendra ou
louera. Se taire est alors la seule reponse juste : annoncer « trois ans »
quand c'est six, ou l'inverse, ferait presenter un document caduc a la
signature.

### Ce qui reste a faire

Le module lit la transaction et sait en deduire les durees. Il reste a les
brancher sur les fiches — aujourd'hui, l'electricite et le gaz annoncent encore
« trois ans a la vente, six ans a la location », ce qui est vrai mais laisse le
lecteur choisir.

---

## 41 · L'etat des risques qui ne dit plus « Mode EDITION »

Un millesime de decembre 2025 change d'en-tete : ses pages ne portent plus que
**la date**, et rien n'y rappelle le rapport. La decoupe, qui cherchait
« Mode EDITION » ou l'adresse, se fermait a la troisieme page.

Ce qui se perdait : les **conclusions redigees**, en page seize — celles qui
enumerent ce dont le bien est reellement concerne. Sur le dossier lu, un
**risque sismique** y disparaissait, alors que le tableau du haut avait bien
donne l'argile.

### Le pied de page, encore

Ce qui reste stable est en bas :

```
Réf. 25/IMO/1047N – Page 17 / 17
```

Le numero change a chaque feuille : aucun fragment fixe ne l'attrape. C'est une
**forme**, exactement comme le « Page 8 / 11 » du DPE (§33). Le mecanisme
existait deja ; il suffisait de lui donner ce motif-la.

### Ce que la mesure donne

| | avant | apres |
|---|---|---|
| conclusions hors plage | 9 sur 50 | **0** |
| inondations detectees | 19 | **22** |
| faux risques technologiques | 0 | 0 |
| autres volets degrades | — | aucun |

Trois biens de plus voient leur inondation annoncee, et aucune conclusion ne
tombe plus hors de son volet.

### La lecon, et c'est la troisieme fois

Amiante, DPE, maintenant l'etat des risques : **quand un rapport ne repete pas
son titre, il se reconnait a son pied de page**. Les trois fois, la marque etait
une forme numerotee, et les trois fois le document se comptait lui-meme.

Il faut desormais regarder le pied avant l'en-tete quand une section parait
courte.

---

## 42 · « Validite : trois ans a la vente, six ans a la location »

C'etait vrai, et cela laissait le lecteur choisir — alors que son dossier
repond. Le §40 avait appris a lire la transaction ; elle est desormais branchee
sur les fiches :

> **Validite : trois ans — ce dossier est un dossier de vente, et son rapport
> l'ecrit lui-meme.**

Pour le plomb, la phrase garde son conditionnement au resultat : « du plomb a
ete detecte, meme en bon etat. Le constat est donc positif, et il n'est valable
qu'un an, ce dossier etant un dossier de vente. »

Et quand le dossier ne tranche pas — il porte les deux surfaces —, les deux
durees restent enoncees. Mieux vaut laisser choisir que choisir au hasard.

### Une erreur de sens, attrapee par la lecture du resultat

La premiere version deduisait « constat positif » de la gravite affichee. Elle
se trompait de sens, et un constat plomb positif s'y voyait annoncer **« sans
limite de duree »** — l'inverse exact de ce qu'il faut dire, sur le seul
diagnostic ou la duree depend du resultat.

La correction n'a pas ete de mieux calculer, mais de **ne plus calculer** : la
phrase que la fiche portait deja contient le resultat, puisqu'elle sort du meme
raisonnement que le verdict. On ne fait que retenir la branche qui s'applique.

**Recalculer ce qu'on a deja sous la main, c'est se donner une seconde chance
de se tromper.**

---

## 43 · La rubrique G du gaz, enfin remontee

Le §23 l'avait reperee comme « un gisement que personne ne lit ». Elle est
desormais lue :

> **Constatations du rapport** : entretien annuel de la chaudiere non justifie ·
> ramonage des conduits non justifie · conduit de raccordement non visitable ·
> un raccord realise au ruban d'etancheite

L'entretien annuel de la chaudiere et le ramonage sont dus par l'occupant.
**Sans justificatif, l'assureur peut discuter sa garantie apres un sinistre** —
et c'est ecrit en petits caracteres sous un titre qui annonce des
« constatations diverses ».

### La frequence qui aurait pu tromper

| Constatation | volets |
|---|---|
| entretien annuel de la chaudiere non justifie | 16 |
| ramonage des conduits non justifie | 16 |
| conduit de raccordement non visitable | 15 |
| un raccord au ruban d'etancheite | 12 |

**Seize volets sur dix-huit.** Une telle frequence est exactement ce qui a
trompe quatre fois deja : un texte present partout est en general un
formulaire, pas un constat.

**Deux volets sur dix-huit n'en portent aucune.** La rubrique varie donc — ce
sont bien des constats. Et le taux s'explique : les proprietaires ne
fournissent presque jamais ces justificatifs au diagnostiqueur le jour de la
visite.

C'est la premiere fois qu'une frequence de quatre-vingt-neuf pour cent survit a
l'examen. Ce qui l'a sauvee n'est pas un raisonnement : ce sont les deux
dossiers qui ne la portent pas.

### Ce qui reste au rapport

« La responsabilite du donneur d'ordre reste pleinement engagee » est imprimee
partout : elle ne constate rien sur ce logement-la. Elle reste au rapport.

---

## 44 · « Installation alimentee en gaz : NON »

Quatre volets sur dix-sept portent ce champ a NON. Quand le gaz est coupe,
**aucun essai n'a lieu** : ni mesure du monoxyde, ni controle en fonctionnement,
ni declenchement des securites. Le rapport peut alors conclure « ne comporte
aucune anomalie » — exact au sens du protocole, puisqu'on ne constate rien, mais
ce n'est pas une installation verifiee.

Le produit ne le disait jamais. Il l'annonce desormais, et descend la gravite a
« attention » :

> Aucune anomalie relevee — mais l'installation n'etait pas alimentee en gaz le
> jour de la visite : aucun essai n'a pu etre fait.

C'est le pendant exact du differentiel non essaye en electricite (§16).

### Deux causes derriere le meme « non », et elles s'opposent

Le gaz peut etre coupe **depuis longtemps** — logement vide, contrat resilie —
et alors rien n'a pu etre essaye.

Mais il peut aussi avoir ete ferme **par l'operateur le jour meme**, apres un
danger grave et immediat : la rubrique I du rapport decrit cette procedure,
fermeture totale et pose d'une etiquette de condamnation. Dans ce cas
l'installation **a bel et bien ete examinee** — c'est le diagnostic qui a conduit
a la coupure. Dire « aucun essai n'a pu etre fait » y serait faux, et
minimiserait un danger grave.

La precision change donc selon qu'un DGI est constate ou non. C'est la troisieme
fois qu'un meme champ recouvre deux causes opposees — apres « sans rapport / sans
date » a l'amiante et « refus assume / echec de lecture » au DPE.

**Un champ ne se lit jamais seul : il se lit avec ce qui l'entoure.**

---

## 45 · Le rapport qui se contredit sur ce qu'il a pu voir

Repere au §23, mesure aujourd'hui : **quatre volets gaz sur dix-huit** portent
deux affirmations incompatibles, a deux lignes d'ecart.

```
F. – Identification des batiments et parties du batiment n'ayant pu etre controles
Neant

G. - Constatations diverses
Certains points de controles n'ont pu etre controles. De ce fait la
responsabilite du donneur d'ordre reste pleinement engagee.
```

La premiere dit que tout a pu etre vu. La seconde dit le contraire, et en tire
une consequence juridique — la responsabilite du proprietaire reste engagee sur
ce qui n'a pas ete controle.

### On le dit, on ne tranche pas

Le produit ne peut pas savoir laquelle des deux rubriques dit vrai : il ne
verra jamais le logement. Mais il peut faire en sorte que la question soit
posee :

> **Le rapport se contredit** : sa rubrique F ne signale aucun point non
> controle, sa rubrique G dit que certains ne l'ont pas ete — a faire preciser.

C'est le traqueur d'erreurs grossieres de l'ordre de mission, dans sa forme la
plus simple : ni rassurer, ni inquieter, **rendre visible ce qui ne colle pas**.

### Ce que la fiche gaz dit desormais d'un seul dossier

Sur le rapport lu au §23, elle porte maintenant quatre choses qu'aucune ne
figurait il y a vingt-quatre heures :

- l'installation **n'etait pas alimentee** le jour de la visite ;
- le rapport **se contredit** sur ce qu'il a pu controler ;
- l'entretien de la chaudiere et le ramonage **ne sont pas justifies** ;
- les anomalies sont de **type A2**, a reparer dans les meilleurs delais.

Le meme document, lu autrement.

---

## 46 · La couverture, enfin mesuree

L'ordre de mission la demande depuis le debut : ou Verriere est-elle competente,
et ou le corpus manque-t-il ? Cent dossiers analyses de bout en bout, 391 fiches
produites :

| volet | fiches | verdict utile | faits par fiche |
|---|---|---|---|
| carrez | 60 | **100 %** | 2,4 |
| amiante | 40 | **100 %** | 0,9 |
| plomb | 29 | **100 %** | 4,0 |
| electricite | 54 | 98 % | 2,4 |
| termites | 46 | 98 % | 3,4 |
| dpe | 63 | 97 % | 8,4 |
| erp | 82 | 90 % | 1,8 |
| gaz | 15 | 87 % | 2,9 |
| assainissement | 2 | **0 %** | 0,0 |

**375 fiches sur 391 portent un verdict utile — 96 %.** Aucun dossier de
l'echantillon ne ressort sans aucun diagnostic reconnu.

### Ce que le tableau dit vraiment

**Le DPE est le plus disert** : 8,4 faits par fiche, contre 0,9 pour l'amiante.
L'ecart n'est pas un defaut — un DPE porte des chiffres a foison, un constat
amiante negatif n'a presque rien a dire. Mais il montre ou le lecteur trouvera
de la matiere, et ou il faudra la lui apporter autrement.

**L'ERP est le moins bon des volets frequents** : 90 %, et 1,8 fait par fiche
alors que c'est le document le plus dense du dossier. Les huit fiches muettes
sont a ouvrir.

**L'assainissement est un trou, et il restera ouvert** : deux volets sur cent
dossiers, aucun verdict. Cherche sur cent cinquante autres dossiers, il n'en
reste aucun. C'est trop rare pour justifier un chantier tant qu'un cas ne se
presente pas — mais c'est note.

### Pourquoi cette mesure manquait

On mesurait la JUSTESSE volet par volet — l'electricite, le gaz, le plomb — sans
jamais demander combien de fiches disent quelque chose. Les deux questions sont
differentes : un volet peut etre juste a 100 % et muet neuf fois sur dix.

---

## 47 · Huit fiches d'etat des risques fabriquees a partir d'une ligne

Les huit ERP muets du §46, ouverts un par un. La cause est la meme dans les
huit, et elle est plus grave qu'un defaut de lecture.

**La section ERP faisait une seule page — la page 2 du dossier**, celle qui
porte la fin de la grille des prestations :

```
Etat parasitaire   Etat des Installations gaz   Etat des lieux (Loi Scellier)
Etat des Risques et Pollutions   Plomb dans l'eau   Radon
Etat des lieux   Securite Incendie   Accessibilite Handicapes
```

Cette ligne suffisait a ouvrir un volet. Et **dans les huit dossiers, le vrai
etat des risques etait ABSENT** — aucune page ne porte « En application des
articles L125-5 ».

Le produit affichait donc une fiche pour un document qui n'existe pas, en
disant « nous n'avons pas reussi a lire la liste des risques ». Le lecteur
comprend « le produit n'a pas su lire » quand il faudrait comprendre **« le
document manque a votre dossier »** — et l'etat des risques est obligatoire a la
vente.

### Pourquoi la page passait

La page de garde etait ecartee parce qu'elle declenche quatre marqueurs ou plus.
Sa SUITE n'en declenche qu'un seul : « Etat des Risques et Pollutions ». Les
autres intitules de la grille — « Plomb dans l'eau », « Securite piscines »,
« Accessibilite Handicapes » — ne sont les titres d'aucun rapport, donc aucun
marqueur ne les connait.

Ce sont justement eux qui trahissent le catalogue commercial. **Trois d'entre
eux suffisent** : aucun diagnostic ne s'appelle « Securite piscines ».

### La mesure

| | avant | apres |
|---|---|---|
| fiches ERP | 82 | **74** |
| ERP sans verdict utile | 8 | **0** |
| couverture totale | 375/391 (96 %) | **375/383 (98 %)** |

Aucune fiche utile n'a ete perdue : les huit supprimees ne decrivaient rien.

### Ce qui reste a faire, et c'est plus important

Ces huit dossiers **n'ont pas d'etat des risques**. Le produit ne fabrique plus
de fiche vide, mais il ne dit pas encore ce qui manque. Or l'absence d'un
diagnostic obligatoire est une information de premier ordre pour un acheteur —
plus utile, souvent, que le contenu d'un diagnostic present.

---

## 48 · Dire ce qui MANQUE — et ne jamais reclamer ce qui est la

Le §47 avait montre que huit dossiers sur cent n'ont aucun etat des risques. Le
produit ne fabrique plus de fiche vide, mais il ne le disait pas encore.

Il le dit desormais. Le controle des manques existait — il reclamait l'amiante
avant 1997, le plomb avant 1949, l'electricite au-dela de quinze ans — mais
**deux diagnostics y echappaient parce qu'ils ne dependent pas de l'age du
logement**, et qu'ils etaient places derriere la garde qui exige de connaitre
l'annee : l'etat des risques et le DPE.

### Le garde-fou qui a failli tout annuler

Premiere mesure : **quinze dossiers sur cent se voyaient reclamer un DPE dont le
numero ADEME figure pourtant dans leurs pages**. La decoupe ne l'avait pas
reconnu comme volet, mais le document est bien la.

**Reclamer un rapport qui est sous les yeux du lecteur est pire qu'un silence**
— il cesse de faire confiance a tout le reste. On ne reclame donc plus que ce
qui ne se trouve NULLE PART, avec la marque la plus sure de chaque diagnostic.

Sauf que la premiere marque choisie pour l'etat des risques etait son titre. Or
« Etat des Risques et Pollutions » figure dans la **grille des prestations** de
tous les dossiers, meme ceux qui n'en portent aucun : le garde-fou annulait
purement et simplement le chantier — plus aucune reclamation, jamais.

Cinquieme fois que cette grille trompe. **Seule la mention legale prouve la
presence du rapport** : « en application des articles L. 125-5 ».

### La mesure

| Reclamation | dossiers sur 100 |
|---|---|
| etat des risques | 22 |
| amiante | 15 |
| DPE | 13 |
| plomb | 10 |
| electricite | 9 |

Quarante-quatre dossiers sur cent portent au moins un manque — et la
contre-epreuve donne **zero reclamation a tort** pour l'ERP comme pour le DPE.

### Pourquoi c'est le chantier le plus utile de la nuit

Tout ce qui precede ameliorait la lecture d'un document present. Celui-ci dit ce
qui n'y est pas — et l'absence d'un diagnostic obligatoire est souvent plus
lourde de consequences que le contenu d'un diagnostic present. Un acquereur qui
signe sans etat des risques n'a pas ete informe d'un risque d'inondation ou
d'argile ; il pourra le reprocher.

---

## 49 · L'annee qui fonde les reclamations

Le §48 fait reclamer un reperage amiante quand le logement date d'avant 1997, un
constat plomb avant 1949. Ces reclamations ne valent que si **l'annee lue est la
bonne** — sinon le produit reclame a tort, ce qui est exactement ce qu'il ne
faut pas faire.

Verification : sur dix-neuf reclamations, **dix-huit reposaient sur une annee
reellement ecrite au document**. La dix-neuvieme portait :

> Annee lue : « **Avant 1948 Altitude** » · ecrite au document : « Avant 1948 »

C'est le bug de la colonne voisine, deja corrige dans le DPE au §42 et qui
subsistait la ou il compte le plus : la page de garde met deux colonnes sur la
meme ligne — « Annee de construction : 1900   Altitude : inferieur a 400 m » —
et le motif ramassait tout ce qui suivait.

**Une valeur salie reste lisible pour un humain, jamais pour un controle.**
« Avant 1948 Altitude » se comprend d'un coup d'oeil ; mais la fonction qui en
extrait un millesime pour decider s'il faut reclamer un constat plomb, elle, n'y
comprend rien.

Apres correction : **dix-neuf sur dix-neuf**.

### La lecon, et elle vaut pour toutes les extractions

Un champ mal extrait ne fait pas toujours de degat visible. Celui-ci s'affichait
depuis des semaines sans que personne ne s'en emeuve — jusqu'a ce qu'il serve a
DECIDER quelque chose. **Le jour ou une donnee cesse d'etre affichee pour etre
utilisee, sa proprete cesse d'etre cosmetique.**

---

## 50 · « 9/04/2026 » — le jour sur un seul chiffre

Un rapport termites d'avril 2026, lu en entier, ne montrait aucune date dans sa
fiche. Le document en porte pourtant trois :

```
Date du reperage : 9/04/2026
Visite effectuee le 9/04/2026
Fait a LANGON , le 9/04/2026
```

Le jour est ecrit **sur un chiffre**. Tous les motifs du produit exigeaient
`\d{2}` — deux chiffres, toujours — et la date etait perdue.

### Ce que cela coutait

La date n'est pas un ornement : c'est elle qui decide de la peremption. Le
termites ne vaut que **six mois** ; l'etat des risques aussi. Sans date, aucun
controle de validite ne peut se faire, et le produit ne peut pas dire au
lecteur que son rapport est perime.

Sept motifs corriges dans cinq fichiers, plus les deux fonctions qui DECOUPENT
une date — car elargir la capture sans elargir le decoupage aurait donne une
date lue mais incalculable. Deux tests verifient qu'un rapport du 9 avril est
bien perime au 1er decembre, et ne l'est pas au 1er mai.

### La rarete n'excuse rien

Mesure : **aucun autre dossier de l'echantillon de cent** ne porte cette forme.
Un cas sur cent, peut-etre moins.

Mais c'est un cas ou le produit se tait sur une peremption possible, et le cout
d'une correction qui elargit un motif est nul. **Un defaut rare qui fait perdre
une information legale ne se traite pas comme une coquille.**

---

## 51 · « Etat degrade (classe 2) » — le mot de la classe 3

Un constat plomb lu en entier affichait :

> 2 revetements au plomb en **etat degrade** (classe 2) : a surveiller et a
> entretenir.

L'arrete du 19 aout 2011 nomme pourtant trois etats, et ils ne se melangent pas :

| Classe | Etat, selon l'arrete |
|---|---|
| 1 | non degrade, ou non visible |
| 2 | **etat d'usage** |
| 3 | **degrade** |

Le produit employait le mot de la classe 3 pour decrire une classe 2. Et ce
n'est pas une nuance de style : **c'est la degradation qui declenche
l'obligation de travaux** de l'article L. 1334-9 du code de la sante publique.
Annoncer « degrade » sur une classe 2, c'est faire croire a des travaux
obligatoires qui ne le sont pas — inquieter sur une situation qui demande de
l'entretien, pas des travaux.

Le meme mot etait employe dans les faits : « En mauvais etat » pour la classe 3,
« Uses ou erafles » pour la classe 2. Le premier est vague, le second n'est pas
le terme de la norme.

**Corrige** : « en etat d'usage (classe 2) : a surveiller et a entretenir, sans
travaux obligatoires », et « degrades (classe 3) : des travaux sont
obligatoires ». Les faits portent desormais « Degrades » et « En etat d'usage »,
avec la precision « uses ou erafles, mais pas degrades ».

### Ce que ce cas apprend

Le carnet porte ce tableau depuis le §9 — il avait ete releve en lisant la
norme, et il etait juste. **Le code, lui, ne l'avait pas suivi.** C'est la
deuxieme fois : la validite du CREP positif (§25) etait dans le meme cas.

Un savoir consigne n'est acquis que la ou il est applique. Le carnet ne se
verifie pas tout seul — il faut, de temps en temps, relire le code AVEC lui.

---

## 52 · Relire le code AVEC le carnet : ce que la revue a donne

Le §51 avait montre que deux savoirs consignes n'etaient pas appliques. Revue
systematique des affirmations chiffrees du carnet, confrontees au code :

| Ce que le carnet etablit | Dans le code ? |
|---|---|
| termites : validite six mois, declaration en mairie si presence | **oui** |
| amiante : listes A et B conclues separement | **oui** |
| plomb : cinq situations de risque, seuils 50 % et 20 % | **oui** |
| plomb : classe 2 = etat d'usage, classe 3 = degrade | corrige au §51 |
| CREP positif : un an a la vente | corrige au §25 |
| **radon : le seuil d'action est 300 Bq/m³** | **manquant** |

Le code suit le carnet bien mieux que la premiere impression ne le laissait
craindre. Un seul manque, mais il est serieux.

### Le radon n'avait aucune notion

Le produit annonce « radon (niveau 2) » dans ses verdicts d'etat des risques, et
le lecteur n'avait **rien** pour comprendre ce que cela veut dire.

Or c'est precisement la que le §7 avait releve un piege avere : la fiche
d'information annexee ecrit « le niveau moyen dans l'habitat francais est
inferieur a 100 Bq/m³ » et **ne cite jamais le seuil**. Un lecteur pressé
retient 100 comme une limite. Le seuil d'action du code de la sante publique est
**300**, trois fois plus haut.

La notion ecrite dit donc, dans l'ordre : le zonage porte sur le sous-sol de la
COMMUNE et non sur le logement ; le chiffre a retenir est 300 et les 100 sont
une moyenne ; le risque est celui d'une exposition longue, deuxieme cause de
cancer du poumon apres le tabac ; et le premier geste ne coute rien — aerer,
verifier que les grilles ne sont pas bouchees.

Elle lit aussi la zone dans le verdict, et adapte : en zone 3, « une mesure chez
vous a du sens ».

### La lecon de la revue

**Relire le code avec le carnet en main prend une heure et trouve ce que la
lecture de mille dossiers ne trouverait pas.** Les deux exercices ne cherchent
pas la meme chose : lire un rapport revele ce que le produit lit mal ; relire le
carnet revele ce qu'il ne dit pas du tout.

---

## 53 · « Classe 0 : pas de plomb » — le seuil qui manquait

La notion des classes existait et les distinguait bien. Mais elle ouvrait sur :

> Classe 0 : **pas de plomb**.

C'est faux, et cela rassure a tort. La classe 0 signifie **sous le seuil**, pas
absence : l'arrete du 19 aout 2011 fixe ce seuil a **1 mg/cm²**, et c'est lui
qui separe la classe 0 des trois autres. Il n'apparaissait nulle part dans le
produit — ni dans les verdicts, ni dans les notions.

Un logement peut donc contenir du plomb en dessous du seuil et ressortir
« classe 0 ». Dire « pas de plomb » est une simplification qui deforme.

**Corrige** : « Classe 0 : sous le seuil reglementaire d'un milligramme par
centimetre carre. Cela ne veut pas dire zero plomb — cela veut dire trop peu
pour compter. » Les trois autres classes disent desormais « au-dessus du
seuil », ce qui rend l'echelle lisible d'un coup.

### Et la strategie de mesurage, enfin expliquee

Deux bribes ajoutees au rang 7, celui du « comment le diagnostic l'evalue » :

- **la mesure ne casse rien** — un appareil a fluorescence X pose contre la
  paroi excite les atomes du revetement et lit ce qu'ils renvoient ; une mesure
  suffit si elle depasse le seuil, sinon le diagnostiqueur en fait une
  deuxieme, parfois une troisieme ;
- **« non mesuree » n'est pas « non controlee »** — la ou il n'y a pas de
  revetement, pierre nue, carrelage ou metal, il n'y a rien a mesurer.

Cette seconde regle est au carnet depuis le §8, ou elle avait coute une erreur :
j'y avais tempere une conclusion rassurante au motif que 19 % des unites
n'etaient pas mesurees. Elle etait dans le moteur ; elle n'etait pas dans ce que
le lecteur peut lire.

---

## 54 · Neuf anomalies annoncees, quatre reelles

Un dossier complet de soixante-dix-huit pages — six volets, le premier depuis
longtemps — a montre deux choses.

### Le rapport repete la meme anomalie, mot pour mot

```
Libelle de l'anomalie : B7.3 d  L'installation electrique comporte au moins
une connexion avec une partie active nue sous tension accessible.
Remarques : … (2eme etage - mezzaninne, 1er etage - Entree /Cuisine/Sejour)
Photo PhEle002
```

Trois fois de suite. **Memes remarques, memes localisations, meme photo.** Ce ne
sont pas trois constats : c'est le generateur qui repete la ligne pour chaque
local cite.

Mesure : **huit volets sur vingt-six** en portent, et le compte annonce etait
gonfle de **treize anomalies sur soixante-six** — un cinquieme de trop.

**Et le gonflement faussait la gravite**, pas seulement le chiffre : la fiche
bascule en « alerte » au-dela de cinq points. Ce dossier passait donc en alerte
avec neuf points annonces, alors qu'il en a quatre. Corrige, il redescend a
« attention » — ce qui est le juste niveau.

### Le code de la norme perdait son suffixe

« B3.3.6 **a1** » etait capture comme « B3.3.6 », et le « a1 » restait colle au
texte : la fiche affichait « a1 Au moins un socle de prise de courant… ». Ni le
code, ni le libelle. Corrige.

---

## 55 · Mon propre filtre excluait un tiers du corpus

Le point de reprise demandait depuis plusieurs cycles de trouver un dossier
complet, et la lecture ne ramenait que des etats des risques isoles. La cause
n'etait pas le corpus.

L'outil de selection ecarte les reperages avant travaux, hors perimetre. Il
cherchait « avant realisation de travaux » **dans le texte des six premieres
pages**. Or le constat amiante AVANT-VENTE porte cet avertissement :

> la presente mission de reperage ne repond pas aux exigences prevues pour les
> missions de reperage des materiaux et produits contenant de l'amiante **avant
> demolition d'immeuble ou avant realisation de travaux**

**Tout dossier contenant un constat amiante de vente etait donc exclu.** Cinq
cent soixante-huit candidats examines sans en retenir un seul.

C'est le piege du texte imprime partout — celui du catalogue de l'electricite,
de l'attestation d'assurance, des rubriques PPRt, de la grille des prestations —
applique cette fois **a mon propre outil**. La sixieme forme, et la premiere qui
se retourne contre l'instrument plutot que contre le produit.

Corrige : on ne cherche plus que dans les deux premieres pages, en ecartant
explicitement les lignes d'avertissement. Le premier essai a ramene un dossier
de six volets.

**La lecon** : un outil de mesure obeit aux memes regles que ce qu'il mesure. Il
faut le relire avec la meme suspicion.

---

## 56 · Sept logements se voyaient annoncer des termites qu'ils n'ont pas

La plus grave fausse alerte depuis celle de l'amiante, et elle tenait a trois
mots.

Le tableau D du rapport termites porte **deux constats differents**, dans les
memes colonnes :

```
Entree /Cuisine/Sejour  Sol - parquet   Absence d'indices d'infestation de termites
Charpente               Bois            Presence d'indices d'infestation d'AUTRES
                                        AGENTS de degradation biologique
```

Le moteur cherchait « presence d'indices d'infestation » sans regarder **de
quoi**. Une vrillette dans une plinthe, un capricorne dans une charpente, de la
merule derriere un mur : tous devenaient des termites.

### La mesure

| | |
|---|---|
| volets termites lus | 45 |
| le produit annoncait une infestation de termites | **9** |
| le tableau nomme vraiment des termites | **2** |
| le volet parle d'autres agents | 6 |
| **fausses alertes** | **7** |

Sept logements sur neuf annonces. Apres correction : **deux annonces, zero
fausse alerte** — exactement les deux dossiers ou le tableau nomme les termites.

### Pourquoi ce n'est pas une nuance

Les termites obligent a une **declaration en mairie** (articles L. 126-4 et
L. 126-5 du code de la construction), ils engagent la valeur du bien, et leur
presence se transmet a l'acquereur. Une vrillette dans une plinthe, non : c'est
un desagrement, pas une procedure.

Et le rapport lui-meme est formel — le dossier lu porte **vingt-sept lignes**
« Absence d'indices d'infestation de termites », **zero** ligne de presence, et
sa synthese conclut « il n'a pas ete repere d'indice d'infestation de termites ».
Le produit annoncait pourtant une alerte.

### Ce que cela apprend

Le §5 notait que ce volet « se lit bien » et que « les rubriques sont
explicites ». C'etait vrai — le tableau EST lisible. Mais lisible ne veut pas
dire lu : le moteur y prenait un mot sur trois.

**Une mesure de justesse ne se fait pas une fois pour toutes.** Les termites
avaient ete mesures a 38 sur 38 — mais sur la conclusion GLOBALE du volet, pas
sur le detail des zones. Le detail, lui, n'avait jamais ete confronte au
rapport.

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
- [ ] Élargir la découpe de l'amiante à la pagination qu'il annonce (20/20
      volets trop courts, 14,8 pages en moyenne) : c'est ce qui empêche de dire
      QUEL matériau contient de l'amiante.
- [ ] Conclure séparément sur la liste A et la liste B : le rapport le fait,
      le produit les fond en un seul verdict.
- [ ] L'ERP reste muet dans 11 % des cas : lesquels ?
- [ ] Une rubrique présente et VIDE est un résultat — gaz et amiante le
      confirment. Faut-il le dire au lecteur (« tout a pu être examiné ») ?
- [ ] Mesurer la JUSTESSE et non la présence, volet par volet : une sonde qui
      compare ce que le document déclare à ce que le verdict en retient, sur le
      modèle de `argile-detectee.local.ts`. Fait pour l'argile ; reste le plomb,
      l'électricité, les termites.
- [x] ~~Un rapport dont la synthèse dit « aucune anomalie » et dont le volet
      porte six libellés.~~ → c'était le catalogue non reconnu (§35). 24/24.
- [ ] `conclusionDe` ne rattache pas la conclusion électricité que la page de
      synthèse écrit pourtant en clair sur ce même dossier : gain à prendre.
- [x] ~~Les mesures compensatoires : les dire, puis les expliquer.~~ → fait,
      §24 et §39.
- [x] ~~Vente ou location : en déduire la nature de la transaction.~~ → fait,
      §40 : 50 dossiers sur 60 classés. Reste à brancher les durées sur les
      fiches.
- [ ] Vérifier au texte officiel le calendrier du DPE collectif — article
      L126-31 du CCH et article 158 de la loi n° 2021-1104. Cité par un DTG,
      pas encore relu à la source : tant que ce n'est pas fait, aucun contrôle
      ne peut s'appuyer dessus.
- [ ] Le PPPT, le DTA et le RAAT : jamais ouverts. Le corpus en contient.
- [ ] Les ligatures : d'autres générateurs sont-ils concernés ? Mesurer sur le
      corpus combien de rapports en portent, plutôt que sur le seul DTG lu.
- [x] ~~La rubrique G du gaz : l'entretien et le ramonage non justifiés.~~ →
      fait, §43. 16 volets sur 18 en portent, et 2 n'en portent aucune : ce
      sont bien des constats.
- [x] ~~« Installation alimentée en gaz : NON » : le dire.~~ → fait, §44.
      4 volets sur 17, et la nuance selon qu'un DGI est constaté ou non.
- [x] ~~La contradiction F « Néant » / G « certains points n'ont pu être
      contrôlés ».~~ → faite, §45 : 4 volets sur 18, signalée sans être
      tranchée.
- [ ] Lire les croix du CREP (« X Avant la vente » / « Avant la mise en
      location ») pour déduire la transaction, et en tirer toutes les validités.
- [ ] Un CREP dont le tableau porte « 0 0 0 0 0 0 » : aucune unité mesurée
      n'est pas « aucun plomb ». Vu une fois, à retrouver et à traiter.
- [ ] Vérifier au texte la validité du CREP en location (six ans) : le
      référentiel la donne, la lecture ne l'a pas encore confirmée sur pièce.
- [x] ~~Restituer la « situation du bien au regard d'un arrêté préfectoral ».~~
      → fait, §38 : « aucun — la commune n'est pas en zone délimitée ».
- [ ] La mérule : le même arrêté la délimite, le produit n'en parle jamais.
- [ ] La déclaration en mairie obligatoire en cas de termites (L. 126-4 et
      L. 126-5) : à dire au propriétaire.
- [ ] Exploiter l'imprimé officiel de l'ERP : deux mises en page inverses,
      mesurées 28 contre 21 sur 63 volets, et 14 illisibles. Le tableau de
      synthèse suffit aujourd'hui, mais l'imprimé porte des réponses que rien
      d'autre ne donne.
- [ ] Distinguer les prescriptions de travaux CONDITIONNELLES (garage
      souterrain, cuve à combustible…) des travaux imposés : le rapport les
      liste comme des cas de figure, le produit pourrait alarmer à tort.
- [ ] Le recul du trait de côte : ligne nouvelle des ERP 2024, inconnue du
      produit.
- [ ] Lire les DEUX lignes de PPR quand un risque en porte plusieurs
      (approuvé + prescrit) : le produit n'en retient qu'une.
- [ ] Savoir dire qu'un règlement de PPR est annexé, plutôt que de compter des
      pages non exploitées.
- [ ] Le radon annoncé « niveau 2 » quand la colonne « Votre immeuble » du
      tableau porte « non » : le zonage est communal, l'obligation ne vise que
      la zone 3. À trancher au texte avant de changer quoi que ce soit.
- [ ] Un dernier volet sur 63 annonce encore un risque technologique : trouver
      d'où il vient.
- [x] ~~Treize dossiers déclarent l'argile sans que Verrière la dise.~~ →
      quatrième écriture trouvée, § 34 : le détail précède le libellé. 55/55.
- [x] ~~Les huit fiches ERP muettes sur 82.~~ → §47 : elles etaient fabriquees
      a partir de la grille des prestations, et le vrai ERP etait absent.
- [x] ~~**Dire ce qui MANQUE**.~~ → fait, §48 : 44 dossiers sur 100 portent au
      moins un manque, et zéro réclamation à tort.
- [ ] L'assainissement : deux volets sur cent dossiers, aucun verdict. À
      traiter quand un cas se présentera.
- [x] ~~Relire le code AVEC le carnet en main.~~ → fait, §52 : un seul manque
      trouve, le radon, qui n'avait aucune notion.
- [x] ~~Le seuil plomb de 1 mg/cm².~~ → fait, §53, avec la strategie de
      mesurage et le sens de « non mesuree ».
- [ ] Le volet « autres agents de dégradation biologique » a sa propre
      conclusion, que le produit ne lit pas : la restituer, puisqu'elle existe
      dans 6 dossiers sur 45.

## 57 · Les autres agents du bois : le rapport dit lui-même ce que son constat vaut

Le §56 les avait écartés du compte des termites — sept logements sur neuf se
voyaient annoncer une infestation qu'ils n'avaient pas. Les écarter réparait le
verdict, mais laissait le lecteur sans réponse : sa ligne « présence d'indices »
existe, elle est dans son rapport, et le produit n'en disait plus rien.

Ce qu'elle vaut, le rapport l'écrit, en note de bas de page — et c'est la seule
fois du corpus où un document explique lui-même la portée de son propre constat :

> **Note 1** : Les indices d'infestation des autres agents de dégradation
> biologique du bois sont notés de manière générale **pour information** du
> donneur d'ordre, il n'est donc **pas nécessaire d'en indiquer la nature, le
> nombre et la localisation précise**. Si le donneur d'ordre le souhaite, il
> fait réaliser une recherche de ces agents dont la méthodologie et les éléments
> sont décrits dans la norme **NF P 03-200**.

Trois choses en découlent, qui changent la façon de le restituer.

**C'est un signalement, pas un diagnostic.** Le diagnostiqueur n'a pas cherché
ces agents : il les a vus en cherchant les termites, et il le note. Détailler ce
qu'il n'a pas relevé serait inventer.

**Ni l'espèce, ni le nombre, ni le lieu ne sont dus.** Un produit qui promettrait
« où » et « lesquels » promettrait ce que la norme n'exige pas — et le rapport ne
le porte effectivement jamais.

**Une prestation distincte existe** : la recherche NF P 03-200, à commander en
plus. C'est la seule suite utile, et elle n'est écrite nulle part ailleurs que
dans cette note que personne ne lit.

### Ce que le produit dit maintenant

Un fait, et deux phrases qui donnent la mesure :

```
Indices d’autres agents du bois : relevés
  (insectes ou champignons — le rapport les signale pour information,
   sans avoir à dire lesquels ni où)
```

**Mesuré sur 40 volets termites : 13 en portent, zéro écart avec le rapport,
zéro passage en alerte à tort.** Un tiers des volets, donc — trois fois plus que
l'estimation de départ, qui en donnait six sur quarante-cinq. Et un volet cumule
les deux constats : de vrais termites *et* d'autres agents, ce qui confirme que
les deux lignes du tableau sont bien indépendantes.

### La leçon de méthode

Corriger une fausse alerte laisse un trou. La ligne qui provoquait l'erreur ne
disparaît pas du rapport : elle reste sous les yeux du lecteur, et si le produit
se tait, c'est lui qui a l'air incomplet. **Une correction n'est finie que quand
ce qu'on a cessé de dire à tort est dit juste.**

---

## 58 · Le PDF était protégé, sa transcription ne l'était pas

Cinquante et une pages de rapport se sont retrouvées **dans le dépôt public**,
cette nuit, entre deux commits.

Le script de lecture prend un chemin de sortie en second argument. Lancé sans,
il retombe sur son défaut — `dossier.txt` — qui s'écrit dans le répertoire
courant, c'est-à-dire dans le dépôt. Le fichier contenait le nom du
propriétaire, l'adresse du bien, celle du cabinet, et tout le texte des
cinquante et une pages.

Le commit du cycle était parti deux minutes plus tôt. **C'est la seule raison
pour laquelle rien n'est publié.**

### Ce que la règle protégeait, et ce qu'elle ne protégeait pas

Le `.gitignore` portait depuis longtemps :

```
# Jamais de rapports de diagnostic dans le dépôt : ils contiennent le nom et
# l'adresse de vraies personnes.
*.pdf
```

La règle était juste, et le raisonnement derrière était juste. Il lui manquait
une marche : **ce n'est pas le format qui porte les données, c'est le contenu.**
Un PDF exclu et sa transcription admise protègent exactement rien — la
transcription est même pire, puisqu'elle est en clair et cherchable.

### La garde

Trois motifs ajoutés au `.gitignore`, et surtout un test qui ne lit pas le
`.gitignore` : une règle peut être écrite puis contournée par un `add -f`. Le
test regarde **ce que git suit réellement**, et refuse tout fichier ayant la
forme d'une sortie de lecture — `.pdf`, `.encours.json`, `dossier*.txt`,
`corpus-*.txt` — ainsi que toute sonde jetable du corpus.

Vérifié qu'il mord : un fichier fautif ajouté de force le fait tomber.

### La leçon

**Une protection qui nomme un format ne protège qu'un format.** Les autres
règles de ce carnet valent d'être relues sous cet angle : celles qui désignent
un contenu tiennent, celles qui désignent un contenant ont un angle mort.

Et une seconde, plus rude : cette faille n'a pas été trouvée en cherchant, mais
en regardant par hasard le résultat d'une commande de routine. **Le hasard n'est
pas une méthode.** D'où le test, qui tournera à chaque fois.

---

## 59 · Un verdict électrique qui parlait de préfecture

Sur la fiche du produit, en toutes lettres :

> **Électricité** — L'installation intérieure d'électricité ne comporte aucune
> anomalie 06/01/2025 fait apparaître que la commune dans laquelle se trouve le
> bien fait l'objet d'un arrêté préfectoral n°33-2019-07-23-004 en date du
> 23/07/2019 en matière d'obligation d'Information Acquéreur Locataire sur les
> Risques Naturels, Miniers et Technologiques…

Trois cents caractères, coupés net par l'abrègement. Le verdict était juste au
début, et devenait du charabia — un lecteur qui voit ça doute de toute la fiche.

**Mesuré : 9 verdicts sur 334, tous en électricité.**

### Le tableau de synthèse ne ponctue pas ses cellules

C'est toute l'explication. Le recollage des lignes en phrases s'arrête au point
final ; le tableau n'en met aucun :

```
Prestations   Conclusion
Électricité   L'installation intérieure d'électricité ne comporte aucune anomalie
              L'Etat des Risques délivré par SARL DGLM EXPERTISES en date du
              06/01/2025 fait apparaître que la commune dans laquelle se trouve
              …
Etat des Risques et          ← l'intitulé de la prestation n'arrive qu'ICI,
des argiles (L.132-4…)          six lignes plus bas, coupé en deux par le texte
Pollutions                      de sa propre conclusion
```

Les deux conclusions n'en faisaient qu'une, et cette phrase géante contenait
« électricité » avant « état des risques ». Le premier motif trouvé l'emportait.

**Corrigé** : on ferme aussi la phrase quand la ligne suivante **ouvre** la
conclusion d'un autre diagnostic — l'ouverture se cherchant dans les soixante
premiers caractères seulement, car plus loin un nom de diagnostic ne commence
rien : la conclusion de l'état des risques cite les argiles et la sismicité sans
changer de sujet.

### Et derrière, un second défaut : la raison sociale prise pour un ourlet

La coupure a bien eu lieu, mais **une ligne trop tard**. Le filtre qui retire le
pied de page répété reconnaissait « SARL » à lui seul — et la conclusion de
l'état des risques s'ouvre sur « L'Etat des Risques délivré par **SARL** DGLM
EXPERTISES en date du ». Sa première ligne était jetée ; le reste, devenu
orphelin, retombait sur le volet d'avant.

Un vrai pied de page porte des **coordonnées** : un RCS, un téléphone, un numéro
d'assurance. C'est cela qu'on exige désormais — ou deux marques faibles
ensemble. La phrase qui ne fait que nommer le cabinet reste.

### Le résultat

| | Avant | Après |
|---|---|---|
| Verdicts qui débordent | 9 | **0** |
| Verdicts de plus de 220 caractères | 46 | **35** |
| Fiches portant un verdict utile | 329/332 (98 %) | **329/334 (99 %)** |

Deux conclusions ont été **rendues** : elles étaient absorbées par le volet
voisin et n'existaient nulle part. Électricité, amiante et termites conservent
leur justesse — vérifié avant/après, à l'identique.

### La leçon

**Un séparateur qu'on croit universel ne l'est que dans le texte suivi.** Le
point final organise un paragraphe ; il n'organise rien dans un tableau, où la
mise en page fait le travail que la ponctuation ferait ailleurs. Toute règle de
recollage doit prévoir ce qui n'est pas de la prose.

---

## 60 · La septième sonde menteuse — et cette fois elle accusait ma propre correction

En contrôlant qu'aucune justesse n'avait régressé, la sonde termites a annoncé
**six verdicts faux**, tous « rapport = infesté, moteur = sain ».

C'était elle qui se trompait, et pour la raison exacte que le §56 venait de
corriger dans le moteur : sa règle de vérité cherchait « présence d'indices
d'infestation » sans exiger « **de termites** ». Elle comptait donc les autres
agents de dégradation biologique comme des termites — l'erreur que le moteur ne
fait plus.

**On corrige le produit, et on oublie de corriger l'instrument qui le juge.**
Après réparation : 26 sur 26.

C'est la septième sonde de ce corpus à accuser le moteur à tort, et la première
à le faire **parce que le moteur avait progressé**. La garde s'allonge d'un
cran : quand une correction change une définition, **chercher qui d'autre porte
l'ancienne**.

---

## 61 · « Votre commune est-elle concernée ? » — la réponse était dans le rapport

Le §28 l'avait signalé sans le traiter : le volet termites porte, en tête, un
champ qui dit si le bien est en zone d'arrêté préfectoral.

```
Situation du bien en regard d'un arrêté préfectoral pris en application
de l'article L 131 - 5 du CCH :
............................ ...... Le bien est situé dans une zone
                                    soumise à un arrêté préfectoral.
```

**Mesuré sur 39 volets : 32 portent ce champ. Dix-sept disent que le bien EST en
zone délimitée, quinze disent « Néant ».** Le produit n'en restituait presque
rien — son motif exigeait « Néant » seul sur sa ligne, et **ne connaissait pas
du tout la réponse positive**, qui est pourtant la majoritaire.

Il butait sur trois formes du même champ :

| Forme rencontrée | Ce que voyait l'ancien motif |
|---|---|
| `Néant` seul sur la ligne suivante | lu |
| `.......... ...... Néant` (points de conduite) | rien |
| `N éant` (mot coupé par le générateur) | rien |
| `Le bien est situé dans une zone soumise…` | rien |

**Corrigé : 32 volets sur 32, zéro écart avec le rapport.**

### Ce que cela change pour le lecteur

La fiche disait une généralité :

> Ce diagnostic n'est demandé que dans les communes où le préfet a signalé la
> présence de termites.

Vraie, et inutile : elle laissait chacun deviner de quel côté il tombait. Elle
dit maintenant, quand le rapport le dit :

> Votre commune est classée en zone de risque termites par arrêté du préfet :
> c'est ce qui explique la présence de ce diagnostic au dossier.

### Et l'obligation que les propriétaires ignorent

En cas de présence de termites, l'infestation **doit être déclarée en mairie**.
Ce n'est pas une déduction : le rapport l'écrit, en note de bas de page.

> **NOTE 2** : Dans le cas de la présence de termites, il est rappelé
> l'obligation de déclaration en mairie de l'infestation prévue aux articles
> L 133-4 et R 133-3 du code de la construction et de l'habitation.

La phrase n'apparaît que si le rapport constate des termites — sinon elle
alarmerait sans objet.

**Point ouvert, à vérifier au texte** : les millésimes ne citent pas les mêmes
articles. Celui-ci dit **L 133-4 et R 133-3** ; un autre volet lu citait
**L 126-4 et L 126-5**. Le CCH a été recodifié, et l'un des deux jeux est
probablement périmé — mais tant que Légifrance n'a pas répondu, le produit se
contente de dire *que* l'obligation existe, sans citer d'article. C'est la règle
de la hiérarchie des sources : le rapport dit le fait, le texte officiel seul
tranche la référence.

---

## 62 · Le corps de l'amiante : cinq faux matériaux, et le vrai perdu pour un caractère

Premier chantier mené sous l'ordre de mission maître du 20/08 — *le corps du
rapport fait foi*. La mesure qui l'a déclenché : **l'amiante fait 15,8 pages par
volet et n'en sort que 1,5 fait.** Le plus gros écart du dossier avec le plomb.

### Ce que le produit affichait

Sur un constat d'octobre 2024, liste B positive :

> **Amiante repérée : Décembre 2012 (Listes "A" et "B"), et 4 autres.**

Les cinq « matériaux » étaient : un bout de texte réglementaire, l'organisme
certificateur avec son adresse, deux intitulés de la grille de repérage
(« Ouvrage : Conduits de fluides (air, eaux, autres fluides) ») et un renvoi à
l'article 11 d'un arrêté.

**Le seul vrai matériau n'y était pas.**

### Deux fautes, dont une à un caractère près

**La première : le balayage.** La fonction parcourait tout le volet en cherchant
la forme `Intitulé (précision)`. Le volet en est plein. C'est la fausse alerte du
§27 revenue sous une autre forme — le filtre écartait les adresses, pas les
intitulés réglementaires. **Un filtre par liste noire ne peut pas tenir** : on
ne peut pas énumérer tout ce qu'un rapport contient et qui n'est pas un
matériau.

**La seconde : une limite arbitraire.** Le vrai matériau était

```
Conduits fibres - ciment ( Façade arrière immeuble / Visible depuis
                           l'appartement du R+1)
```

et sa localisation fait **soixante et un caractères** contre une limite de
soixante. Le repérage situe parfois par un chemin entier — bâtiment, étage,
pièce, et d'où le matériau est visible.

Les deux fautes se cachaient l'une l'autre : le balayage remplissait le verdict,
donc personne ne voyait qu'il manquait quelque chose.

### La correction : prendre le problème par l'autre bout

C'est **la rubrique du rapport qui délimite**, pas le vocabulaire. La rubrique
1.1 énumère les matériaux repérés, juste après « il a été repéré : », et
s'arrête à l'astérisque de renvoi ou à la rubrique suivante. Hors de cette
fenêtre, on ne cite rien.

Et **pas de repli**. Sans rubrique, aucun matériau — mesuré, le repli ramenait
23 lignes fausses sur 43. Elles ne s'affichaient pas, un garde-fou posé ailleurs
n'ouvrant le détail que sur conclusion positive ; mais elles n'attendaient qu'un
changement de ce garde-fou. Vérifié : supprimer le repli ne coûte **aucun**
matériau légitime.

### L'état de conservation, que le rapport cote et que personne ne lisait

La fiche de cotation du §5.1 donne l'information la plus lourde du volet :

```
Matériau dégradé
(étendue ponctuelle)
```

C'est la seule chose qui distingue une amiante stable d'une amiante qui s'abîme
— et l'explication du produit disait justement « tout dépend de l'état du
matériau » sans dire dans quel état était le sien.

**Mesuré : sur 22 volets, 4 sont positifs ; les 4 sont cotés par le rapport, et
le produit n'en disait rien. 0/4 → 4/4.**

Trois gardes : on n'attribue la cotation à un matériau que si l'appariement ne
fait aucun doute — une cotation, un matériau ; sinon on énonce sans attribuer.
Une absence de cotation n'est **pas** un bon état, c'est un état inconnu. Et
« non dégradé » se dit aussi : un diagnostic n'est pas un catalogue de
problèmes.

### Le verdict, après

> Amiante repérée : Conduits fibres - ciment (Façade arrière immeuble / Visible
> depuis l'appartement du R+1). Une évaluation périodique est recommandée : on
> revient contrôler l'état tous les trois ans.
> **État de conservation : dégradé** — Conduits fibres - ciment, étendue
> ponctuelle.

QUOI, OÙ, DANS QUEL ÉTAT, ET QUELLE SUITE.

### Et la huitième sonde menteuse

Deux de mes sondes disaient que tout allait bien : « 4 volets positifs, 4
matériaux nommés ». Elles comptaient la **présence** d'un matériau, jamais sa
**justesse**. Un faux matériau compte comme un matériau.

**Mesurer la présence, c'est se mesurer soi-même.** La sonde utile est celle qui
compte les faux — et elle ne doit regarder que ce que le produit **affiche**,
pas ce que la fonction retourne : les 23 faux vivaient sur des volets où le
détail ne s'ouvre jamais.

---

## 63 · Lire comme un notaire : quatre repères à zéro

Nouvel ordre de mission le 20/08 — *tu es notaire, et tu sais où regarder*. Le
lecteur doit connaître la carte du dossier avant de l'ouvrir.

Premier travail : mesurer ce qu'un notaire cherche, et ce que le lecteur en dit.
Sur soixante-dix dossiers, en ne comptant que les **libellés de faits et les
verdicts** :

| Repère | Dans le rapport | Restitué |
|---|---|---|
| Surface (Carrez ou habitable) | 38 | **38 (100 %)** |
| Validité du diagnostic | 23 | 21 (91 %) |
| Date du rapport | 70 | 58 (83 %) |
| Date de la visite | 70 | 57 (81 %) |
| Numéro ADEME du DPE | 42 | 28 (67 %) |
| Périmètre de repérage | 70 | 1 (1 %) |
| **Certification de l'opérateur** | 47 | **0** |
| **Assurance et sa validité** | 60 | **0** |
| **Impartialité et indépendance** | 28 | **0** |
| **Désignation du lot** | 70 | **0** |

Les quatre derniers sont exactement ceux qu'un notaire ouvre en premier : qui a
signé, est-il certifié, est-il assuré, et de quel lot parle-t-on.

### La neuvième sonde menteuse, et ce qu'elle apprend sur la mesure

La première version de cette mesure annonçait **82 % pour l'assurance**. En
ouvrant, ce n'était pas l'assurance du diagnostiqueur : c'était une phrase de
l'état des risques sur le **coût des assurances**, dans un paragraphe
d'explication.

D'où la règle : **un repère est restitué quand il porte un LIBELLÉ**, pas quand
son mot apparaît quelque part dans un paragraphe. Et un corollaire utile —
**avec un motif large, les valeurs basses sont fiables et les hautes ne le sont
pas** : un motif trop large ne peut que surestimer. Les quatre zéros étaient
donc solides dès la première mesure ; les 82 % ne l'étaient pas.

### La désignation du lot : 0 → 68 sur 70

Un rapport qui décrit le mauvais lot ne vaut rien, quelle que soit sa qualité.

La difficulté est de mise en page : la page de garde est sur deux colonnes, et
la désignation se coupe où elle peut.

```
Désignation et situation du ou des lot(s) de copropriété :
Bat. B; Etage RDC; Porte 21; Compl.
Résidence La Paix, Lot numéro Non communiqué
```

**Une liste noire de rubriques ne tient pas.** Première tentative : prendre les
trois lignes suivantes en écartant ce qui ressemble à une rubrique. La page de
garde en enchaîne une dizaine, et chaque rubrique oubliée prolongeait la
désignation — « Lot numéro Non communiqué **Repérage Amiante avant travaux
de** ».

**La liste blanche tient.** On garde les lignes qui ressemblent à une
désignation : bâtiment, étage, porte, lot, résidence, niveau, appartement. On
décrit ce qu'on cherche au lieu d'énumérer ce qu'on refuse — c'est la même
leçon qu'au §62 sur les matériaux amiantés, et elle vaut deux fois.

### Onze maisons individuelles, et une négation qui se perdait

Onze dossiers sur soixante-dix ne sont **pas** en copropriété, et le rapport le
dit à cet endroit même. Ma sonde les avait classés « suspects » parce que le mot
« lot » n'y figure pas : **c'est elle qui avait tort, pas le lecteur.** Une
maison individuelle n'a ni lot, ni tantièmes, ni parties communes — c'est une
information notariale, pas une absence de réponse.

Mais la phrase est coupée en deux par la mise en page :

```
Ce bien ne fait pas partie d'une
copropriété
```

La liste blanche ne gardait que la seconde ligne. Résultat : « copropriété »
tout seul — et **la négation était dans la moitié perdue**. Une désignation
tronquée de cette façon ne dit pas seulement moins : elle dit le contraire.

C'est le piège de la conclusion amiante du §27, revenu à un troisième endroit.
**Sur ces rapports, la moitié d'une phrase affirme souvent l'inverse de la
phrase.**

### Et une leçon sur mes propres tests

Mon test posait la phrase de la maison individuelle **sur une seule ligne**. Il
passait au vert pendant que le corpus, lui, la coupait en deux. Un test écrit de
mémoire teste la mémoire ; seul un test tiré du rapport réel teste le rapport.

**Limite connue, assumée** : un fragment de nom de résidence sans marqueur —
« JARDINS DE SAINTONG » — est écarté par la liste blanche. La désignation reste
exploitable (étage, porte, numéro de lot) ; la reconstituer entièrement
demanderait de rouvrir la porte aux rubriques.

---

## 64 · Le schéma des déperditions est une image — le rapport le redit en mots

Demande d'Aude : *la liseuse doit prendre en compte le schéma de déperdition du
DPE*. C'est la page qui explique le classement énergétique et qui oriente les
travaux : une maison en coupe, une flèche par poste, par où la chaleur s'en va.

**Elle est en image.** Mesuré : **31 volets DPE sur 31 la nomment, aucun ne porte
le moindre pourcentage dans son texte.** Comme l'étiquette A→G, le schéma est
dessiné, et rien n'en sortira jamais par extraction.

Mais le rapport dit la même chose ailleurs, en toutes lettres, dans le
descriptif du logement :

```
description isolation
Murs                Mur en béton banché d'épaisseur ≤ 20 cm non isolé donnant sur un local chauffé
Plancher bas        Dalle béton non isolée donnant sur un local chauffé
Toiture/plafond     Dalle béton donnant sur l'extérieur (terrasse) avec isolation extérieure
Portes et fenêtres  Fenêtres battantes métal, double vitrage à isolation renforcée
```

### Le moteur lisait déjà — pour dessiner, jamais pour parler

Première surprise : `lireIsolation` existe, et elle est bien faite. Elle porte
même le garde-fou contre les pictogrammes « confort d'été » — cette page liste
« toiture isolée » et « fenêtres équipées de volets » comme des icônes, cochées
ou non, et sans ce filtre le produit concluait à une toiture isolée qui ne
l'était pas.

Écrire un second module aurait été une régression déguisée. Le trou n'était pas
la lecture, c'était la **restitution** : mesuré, le produit ne disait **en mots
quel poste est isolé dans aucun des 31 volets**, alors que 24 en ont au moins un
qui ne l'est pas. L'information n'existait que dans le dessin.

**Un dessin se regarde ; une phrase se retient et se cherche.** Les deux doivent
dire la même chose.

### Deux trous d'extraction, trouvés en écrivant les tests

**Les murs n'étaient jamais lus — zéro sur trente et un.** Le motif exigeait
« donnant » ou « d'épaisseur » collé au mot « mur » :

```
murs? (?:donnant|d'épaisseur|ext)
```

Or le tableau met l'intitulé de colonne devant sa description, et toute la
description s'intercale : « **Murs** Mur en béton banché **d'épaisseur** ≤ 20 cm
non isolé ». Corrigé : **0 → 13**, et les treize sont justifiés par une ligne
réelle du rapport, vérifié un par un.

**« Avec isolation extérieure » ne comptait pas comme isolé.** Le motif positif
n'acceptait que l'adjectif — « isolé », « isolée ». Le descriptif, lui, emploie
presque toujours le substantif : « avec isolation intérieure (réalisée entre
1989 et 2000) ». Une paroi décrite isolée restait donc « inconnue », donc muette.
On exige « avec » devant, parce que « isolation » tout court apparaît aussi dans
l'intitulé de colonne « description isolation », qui ne constate rien.

### Ce que la fiche dit maintenant

> **Par où la chaleur s'en va** : les murs, le plancher et les fenêtres
> — *la toiture : le rapport la décrit isolée*

Et dans l'explication : « Le rapport décrit les murs, le plancher et les fenêtres
comme non isolés : c'est par là que part l'essentiel de la chaleur, et c'est ce
que montre le schéma des déperditions du DPE. »

Les parois dont l'isolation n'a pas pu être lue ne sont comptées ni parmi les
bonnes ni parmi les mauvaises. **« Non trouvé » n'est pas « non ».**

### Et, deux fois de suite, la même leçon sur mes tests

Mon test posait la ligne de la toiture **raccourcie de mémoire** — sans « donnant
sur l'extérieur ». Il échouait, et il avait raison d'échouer : sans marque de
descriptif, le moteur refuse de conclure, et c'est ce refus qui écarte les
pictogrammes du confort d'été.

C'est la deuxième fois dans la même nuit qu'un test écrit de mémoire échoue là
où le corpus passe. **Recopier, ne jamais reconstituer.**

---

## 65 · Ce que Verrière ne contrôlera pas : l'homme de l'art

La mesure notariale du §63 avait laissé trois repères à zéro : l'assurance du
diagnostiqueur (60 rapports sur 70 la portent), sa certification (47), sa
mention d'impartialité (28).

**Décision d'Aude, le 20/08 : on n'y va pas.** Ce serait mal vu des confrères.

Ce n'est pas un renoncement technique, c'est une frontière de produit, et elle
se tient. Un outil qui pointe l'assurance ou la certification d'un cabinet se
lit comme une mise en cause de la profession, pas comme un service à
l'acquéreur — et le réseau de confrères est le canal par lequel Verrière
existera.

**Verrière explique le diagnostic, elle ne juge pas le diagnostiqueur.**

La ligne de partage est nette et opérationnelle : les repères qui portent sur le
**bien** — lot, validité, dates, surfaces, périmètre de repérage — restent
pleinement dans le périmètre. Ceux qui portent sur **l'homme de l'art** en
sortent : ni extraits, ni affichés, ni signalés comme manquants.

Le référentiel de lecture porte cette frontière, pour que la mesure ne la
rouvre pas à chaque passage.

---

## 66 · « Attestation à mettre à jour », pas « défaut d'assurance »

Le §65 avait sorti l'assurance du périmètre. Aude l'y remet, mais à une
condition précise : **regarder si le diagnostiqueur est assuré pour la mission,
et ne le faire apparaître que s'il y a un défaut.** Puis, sur le libellé :
**« attestation d'assurance à mettre à jour » plutôt que « défaut
d'assurance ».**

La mesure lui donne raison sur le fond, et c'est ce qui rend la nuance
indispensable.

### 24 sur 59 — un chiffre qu'il ne fallait surtout pas publier tel quel

Le rapport porte, en page de garde :

```
Numéro de police et date de validité : ....... 86517808/808109424 - 30/09/2023
```

Comparée à la date du rapport, cette date est dépassée dans **24 dossiers sur
59**. Quarante pour cent. Sur les rapports de DGLM elle-même.

Un tel chiffre appelle l'ouverture avant l'annonce — et la distribution
tranche :

| Occurrences | Date de fin de validité |
|---|---|
| 33 | 01/10/2025 |
| 8 | 31/12/2021 |
| 8 | 30/09/2023 |
| 7 | 31/12/2022 |
| 3 | 01/10/2026 |

**Cinq dates pour cinquante-neuf rapports.** Ce sont les millésimes successifs
d'une même attestation, et l'**écart médian est de deux mois** — le délai
ordinaire entre l'expiration d'une attestation et sa mise à jour dans le modèle
de document.

Ce n'est donc pas un cabinet qui travaille sans couverture : c'est **un champ
figé dans le générateur**. Écrire « défaut d'assurance » aurait été une
accusation, fausse dans la quasi-totalité des cas, portée contre la profession
qui distribuera le produit.

### Ce que le contrôle dit, et ce qu'il ne dit pas

> **L'attestation d'assurance jointe n'est plus à jour.** L'attestation
> reproduite dans le rapport était valable jusqu'au 30/09/2023, alors que le
> rapport est daté du 23/11/2023. C'est presque toujours la pièce du dossier qui
> n'a pas été actualisée, et non la couverture elle-même — mais un dossier qui
> arrive chez le notaire avec une attestation périmée peut être renvoyé.

Trois gardes, chacune tenue par un test :

**Silencieux quand tout va bien.** Pas de ligne « assurance : valide », pas de
coche verte. Quarante-six dossiers sur soixante-dix ne disent rien.

**Ni l'assureur ni le numéro de police ne sont montrés.** Ils ne regardent pas
le lecteur, et les afficher mettrait en cause le confrère nommément.

**Le mot « défaut d'assurance » est interdit par le test lui-même**, au même
titre que « non assuré ».

**Mesuré en sortie : 24 signalés, zéro à tort.**

### La leçon

Un chiffre juste peut porter une conclusion fausse. Ici, la date **est** dépassée
— la mesure ne se trompe pas — mais ce qu'elle prouve n'est pas ce qu'elle
semble prouver. **Entre la mesure et l'affirmation, il y a une inférence, et
c'est elle qu'il faut ouvrir.** La distribution des valeurs l'a fait tomber en
une minute : cinq dates distinctes ne décrivent pas soixante cabinets, elles
décrivent un formulaire.

---

## 67 · Les vrais pourcentages sont dans l'image — on la découpe

Aude : *sur l'image tu as les pourcentages de déperdition.* Elle a raison, et
c'est tout le problème.

### Ce que la mesure établit

La page du DPE porte « Schéma des déperditions de chaleur ». Mesuré :

- **31 volets DPE sur 31** la nomment ;
- **aucun** ne porte le moindre caractère « % » dans son texte ;
- la page compte **14 à 15 images bitmap**, dont une pleine page 1240×1754.

Aucune extraction de texte ne les atteindra jamais. C'est le même mur que
l'étiquette A→G.

### Et ce que le produit affichait à la place

Le schéma dessiné de Verrière — le schéma-mère, six souffles — porte des parts
qui viennent d'une **table codée en dur** : « toiture 25-30 % », « murs
20-25 % ». Ce sont les **ordres de grandeur nationaux de l'ADEME**, identiques
pour tous les dossiers. Le dessin explique le mécanisme, et il le fait bien ;
mais il ne portait aucun chiffre du logement.

Les deux constats se rejoignent : les chiffres du logement existent, ils sont
dans l'image, et nulle part ailleurs.

### La décision : montrer, ne pas recopier

Plutôt qu'un OCR — dix mégaoctets de données de reconnaissance au chargement,
un taux d'erreur à mesurer avant d'oser afficher un chiffre —, on **découpe le
schéma dans la page et on le montre tel quel**. Le lecteur voit ses
pourcentages ; le produit n'en invente aucun.

Le mécanisme existait déjà : `photoDuBien` rejoue la pile graphique du PDF pour
retrouver le rectangle exact d'une image, dessine la page, puis y découpe ce
rectangle. Il suffisait d'un autre critère de choix.

**Le repère est le titre** : le schéma est sous lui, en haut à gauche. Mesuré
sur sept pages, le rectangle retenu est **identique au point près — x=43, y=541,
237×210** —, parce que la maquette du DPE est réglementaire et ne varie pas. Les
bornes restent larges malgré tout : un jour un générateur décalera cette
maquette, et mieux vaut ne rien trouver que découper à côté.

Le PNG plutôt que le JPEG, aussi : ce sont des traits fins et des chiffres, que
la compression JPEG rend flous.

### Ce qui reste ouvert, et qui n'est pas de moi

L'extraction est faite et validée sur sept pages. **L'affichage ne l'est pas** :
il touche `Deperditions.svelte` et `Diagnostics.svelte`, que travaille une autre
session en ce moment. Poser deux schémas de déperditions côte à côte serait
aussi une question de mise en page, pas seulement de code — le dessin explique
le mécanisme, l'image donne les chiffres, et leur articulation se décide.

Le découpage lui-même n'a pas pu être vérifié à l'œil : il exige un canevas,
donc un navigateur. La sélection du rectangle, elle, l'a été — sept fois sur
sept.

---

## 68 · Le schéma du rapport est branché — et un onglet caché ne dessine pas

Le §67 avait livré l'extraction sans l'affichage. Il est branché : App →
Lecteur → Diagnostics → `SchemaDuRapport`, dans la section « Où ? » de la fiche
DPE, juste sous le dessin de Verrière.

Les deux se répondent, et c'est voulu : **le dessin explique le chemin** — six
souffles, avec les ordres de grandeur nationaux de l'ADEME, les mêmes pour tous
les dossiers puisqu'ils viennent d'une table — et **l'image donne la part** de
ce logement-ci. La légende le dit en une ligne, pour que personne ne les
confonde.

### Le blocage, et ce qu'il apprend

Première tentative, la fonction ne rendait jamais la main. Cinquante et une
pages, trente-sept secondes, rien.

**Le premier soupçon était juste sur le principe, faux sur le cas.** Le fichier
porte, en commentaire, la raison d'être de ses deux documents : *le premier a
servi à extraire le texte, dans cet état ses rendus ne se terminent pas*. Or
j'appelais `getTextContent` sur le document de **dessin** — exactement ce que ce
commentaire interdit. Corrigé : la page se trouve désormais dans le texte déjà
extrait à l'ouverture, et les positions relevées donnent l'ordonnée du titre.
Le document de dessin ne sert plus qu'à dessiner, et on n'ouvre qu'une page au
lieu de cinquante et une.

**Mais le blocage est resté.** Le vrai coupable se voyait en une ligne :

```js
document.visibilityState  // "hidden"
```

Un onglet masqué ne dessine pas — `page.render()` n'y rend jamais la main. La
preuve que ce n'est pas mon code : **`photoDuBien` bloque exactement pareil**,
dans le même onglet, alors qu'elle est en production depuis des semaines.

### Ce qui est vérifié, et ce qui ne l'est pas

Vérifié **dans le navigateur**, sur un vrai rapport de 51 pages :

```
page 11 · yTitre 759 · 14 images · CIBLE 43,541 237x210
```

Le même rectangle qu'en mesure hors ligne, au point près. La chaîne entière —
trouver la page, lire l'ordonnée du titre, rejouer la pile graphique, écarter le
fond de page et les pictogrammes, retenir le schéma — fonctionne.

**Non vérifié : le rendu et le découpage eux-mêmes.** Ils exigent un onglet
visible. Le code en est repris trait pour trait de `photoDuBien`, qui découpe
correctement en production, mais la reprise d'un code juste n'est pas une
preuve. À regarder à la première ouverture d'un dossier réel.

### Deux règles pour la prochaine fois

**Un test dans un onglet caché ne teste pas le dessin.** Vérifier
`document.visibilityState` avant de conclure qu'une fonction de rendu est
cassée.

**Comparer avec une fonction voisine qui marche coûte trente secondes et
tranche.** Ici, faire tourner `photoDuBien` sur le même document a déplacé le
soupçon de mon code vers l'environnement, immédiatement.

---
