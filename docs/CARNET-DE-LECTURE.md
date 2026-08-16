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

### Le nombre d'arrêtés CATNAT dit quelque chose

Le dossier lu en compte **45 sur la commune**, dont **treize** pour
« Sécheresse et réhydratation — Tassements différentiels » depuis 1989.

Rapproché de la ligne « Zonage du retrait-gonflement des argiles : Oui, Aléa
Fort », cela dessine un risque concret — fissures, fondations — que ni le
rapport ni le produit ne formulent. Les deux informations sont à onze pages
d'écart.

---

## 8 · À vérifier lors des prochaines lectures

- [ ] Le tableau « E. — Anomalies identifiées » du gaz : c'est là qu'est la
      conclusion réelle, puisque la case cochée est illisible.
- [ ] Le volet électricité : mêmes rubriques que le gaz ? mêmes pièges ?
- [ ] Le CREP : comment les classes 0 à 3 sont-elles présentées ?
- [ ] Le DPE : où sont les seuils des petites surfaces ?
- [ ] Un dossier de copropriété (DTG, PPPT) : structure encore jamais lue.
