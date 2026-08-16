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

## 10 · À vérifier lors des prochaines lectures

- [ ] Le tableau « E. — Anomalies identifiées » du gaz : c'est là qu'est la
      conclusion réelle, puisque la case cochée est illisible.
- [ ] Le volet électricité : mêmes rubriques que le gaz ? mêmes pièges ?
- [ ] Le CREP : comment les classes 0 à 3 sont-elles présentées ?
- [ ] Le DPE : où sont les seuils des petites surfaces ?
- [ ] Un dossier de copropriété (DTG, PPPT) : structure encore jamais lue.
- [ ] Les termites : « informations collectées auprès du donneur d'ordre »
      (traitement antérieur, présence déclarée) sont des cases dessinées, donc
      illisibles. Y a-t-il une autre trace de ces réponses dans le rapport ?
- [ ] L'amiante repart sans date dans 43 % des cas — le plus mauvais chiffre de
      tous les volets. Où sa date est-elle écrite ?
- [ ] Le DPE est muet dans 42 % des cas : quelle conclusion ne sait-on pas lire ?
- [ ] Le gaz ne produit aucun schéma (0 %), le mesurage non plus.
- [ ] Mesurer la JUSTESSE et non la présence : une sonde par volet qui compare
      ce que le document déclare à ce que le verdict en retient, sur le modèle de
      `argile-detectee.local.ts`.
