# Où parser le DPE

> Relevé du 21/08/2026, sur le corpus DGLM. **26 volets DPE lus en entier**
> (LICIEL) + **6 volets DPE d'un autre éditeur** (BC2E). Mesures reproductibles
> par `scripts/*.local.ts` — la sortie reste hors du dépôt, qui est public.
>
> Cadre : [`ODM-DPE.md`](ODM-DPE.md). Règle d'éditeur :
> [`REPERES-PAR-EDITEUR.md`](REPERES-PAR-EDITEUR.md).

## 1. Ce qui manquait, et où c'était

`INTITULES` dans `src/lib/analyse/rubriques.ts` **n'a aucune entrée pour le
DPE**. Le moteur cherchait donc ses chiffres au motif libre sur tout le volet
(`/Montants et consommations annuels/`, `/frais annuels/`, `/émet ([\d\s.,]+) kg
de CO/`…) — exactement ce que la règle maîtresse interdit : chercher une
information au lieu de chercher un endroit.

### Les rubriques du volet DPE, telles que LICIEL les imprime

Relevées sur les 26 volets, dans l'ordre de lecture. Une rubrique n'est retenue
ici que si elle est présente dans **au moins 80 %** des volets.

| Rang | Rubrique | Ce qu'elle porte |
|---|---|---|
| 1 | Performance énergétique et climatique | les deux étiquettes — **en image** |
| 2 | Estimation des coûts annuels d'énergie | fourchette basse/haute, année de référence |
| 3 | Informations diagnostiqueur | identité, certification |
| 4 | Système de ventilation en place | ventilation, en une ligne |
| 5 | Montants et consommations annuels d'énergie | consommations par poste |
| 6 | Recommandations d'usage pour votre logement | gestes, sans valeur d'analyse |
| 7 | Vue d'ensemble du logement | le **résumé** des parois — une ligne par famille |
| 8 | Vue d'ensemble des équipements | le résumé des systèmes |
| 9 | Recommandations de gestion et d'entretien | priorité 3 de l'ODM §18 |
| 10 | Recommandations d'amélioration de la performance | priorités 1 et 2 (§18) |
| 11 | Évolution de la performance après travaux | les scénarios (§19) |
| 12 | **Fiche technique du logement** | **la description réelle du bâtiment** |

Le produit lisait la rubrique 7 — le résumé — et ignorait la rubrique 12, qui en
est la source. C'est le défaut central.

## 2. La fiche technique — le gisement

En annexe, un tableau à trois colonnes : **Donnée d'entrée · Origine de la
donnée · Valeur renseignée**. Rubriques internes : *Généralités*, *Enveloppe*,
*Systèmes*.

Lecteur : [`src/lib/analyse/ficheTechnique.ts`](../src/lib/analyse/ficheTechnique.ts).

### Ce que la lecture rend, sur 26 volets

**4 831 champs**, **594 objets du bâtiment** :

| Objet | Nombre | Dont non nommés par le rapport |
|---|---:|---:|
| ponts thermiques | 156 | — |
| murs | 153 | 6 |
| baies (fenêtres, portes-fenêtres) | 113 | 6 |
| planchers hauts | 33 | — |
| générateurs de chauffage | 32 | — |
| planchers bas | 31 | — |
| ventilations | 26 | — |
| productions d'eau chaude | 26 | — |
| portes | 24 | — |

Un seul bloc du corpus reste sans genre reconnu (« Année installation
équipement »). Il est **conservé sans nom**, jamais rattaché d'office.

### La colonne du milieu — le tri de l'ODM §1, écrit par le rapport

| Origine | Occurrences | Ce que ça veut dire |
|---|---:|---|
| Observé / mesuré | 4 600 | le diagnostiqueur a constaté |
| Valeur par défaut | 152 | **le logiciel a supposé** |
| Estimé | 56 | approché |
| Donnée en ligne | 23 | issue d'une base (altitude…) |

Les 26 volets portent au moins une valeur par défaut, jusqu'à **29** pour l'un
d'eux. Une « année d'isolation » par défaut n'est pas une année d'isolation :
c'est l'aveu qu'on ne la connaît pas. Le moteur n'en lisait aucune.

### La grammaire, et ses quatre pièges — tous mesurés

1. **une ligne = une rangée** — « Isolation Observé / mesuré non » ;
2. **libellé enroulé autour de sa valeur** — la ligne du milieu *commence* par
   l'origine, les deux moitiés du libellé l'encadrent ;
3. **valeur enroulée autour de son libellé** — la ligne du milieu *finit* par
   l'origine ;
4. **le nom de l'objet tombe n'importe où** : seul sur sa ligne, collé devant un
   libellé, **intercalé dans une valeur enroulée** (`Mur 4 Nord` entre les deux
   moitiés), ou **collé devant la suite d'une valeur** (`Mur 4 Ouest inconnu`).

D'où la segmentation retenue : **on ne segmente pas sur le nom**, qui tombe où il
veut, mais sur deux propriétés du tableau — un libellé qui se répète (sept murs,
c'est sept fois « Surface du mur ») et un libellé qui change de genre (le plafond
finit là où « Surface de baies » commence). Sans cette seconde frontière, le
plafond emportait la première fenêtre et la porte un pont thermique.

## 3. Le DPE en image — un mutisme que rien ne signalait

Les 6 volets DPE **BC2E** (empreinte `TCPDF 5.0.002 · HTML2PDF - TCPDF`) ne
contiennent **aucun texte de corps** : **7,1 lignes par page**, toutes en-tête et
pied de page. Contre 37 à 59 lignes par page chez LICIEL. Le DPE y est imprimé en
image.

**Le contrôle de lisibilité du moteur est global, le mutisme est local.**
Mesuré sur un rapport BC2E de 45 pages : 30,1 lignes/page en moyenne, **aucune
page vide** — parce que l'en-tête s'imprime par-dessus l'image. `analyse/index.ts`
le déclare donc *lisible*, et pourtant :

| Volet | Pages | Lignes/page | |
|---|---|---:|---|
| plomb | 4–12 | 61,3 | lisible |
| gaz | 13–15 | 49,0 | lisible |
| électricité | 16–20 | 67,4 | lisible |
| Carrez | 21–22 | 41,0 | lisible |
| **DPE** | **23–27** | **7,2** | **muet** |
| **ERP** | **28–44** | **7,0** | **muet** |

Le DPE s'en tire par chance : sans chiffres, il dit « ses chiffres n'ont pas pu
être lus ». **L'ERP, non** — un état des risques muet se lit comme un état des
risques sans risque. À traiter (hors périmètre DPE, mais à ne pas perdre).

**À faire** : mesurer la lisibilité **par volet** et non par document, et
annoncer le volet en image au lieu de le lire à vide.

## 4. Portée, et ce qui n'est pas mesuré

- Tout ce qui précède est établi sur **LICIEL** — seul éditeur du corpus dont le
  DPE soit en texte. **La mise en page de la fiche technique chez les autres
  éditeurs n'est pas mesurée.** Un trou se déclare, il ne se comble pas.
- Les six DPE BC2E n'apprennent rien de la fiche technique : ils sont en image.
- L'étiquette A→G reste une image chez tous : la lettre continue d'être retrouvée
  par le calcul, avec sa mention de méthode.
- Le schéma des déperditions est en image lui aussi (§15 de l'ODM) — mais la
  fiche technique donne désormais surfaces, matériaux et états d'isolation
  paroi par paroi, de quoi expliquer *où part la chaleur* sans inventer un
  pourcentage.

## 5. Les trois autres tableaux à cellules fusionnées

Le piège de la fiche technique se rejoue **trois fois** dans le DPE. Une seule
grammaire les lit toutes : [`celluleFusionnee.ts`](../src/lib/analyse/celluleFusionnee.ts).

| Tableau | Étiquette | Ce qu'elle nomme |
|---|---|---|
| Fiche technique | « Mur 4 Ouest » | dix rangées de données |
| Vue d'ensemble des équipements | « Chauffage » | deux générateurs |
| Recommandations d'amélioration | « Mur » | une consigne de travaux |
| Recommandations d'entretien | « Ventilation » | deux gestes |

**Deux repères, dans cet ordre.**

1. **La phrase.** L'étiquette est centrée dans sa rangée : elle tombe donc *à
   l'intérieur* du texte qu'elle nomme, souvent au milieu d'une phrase. Une
   phrase coupée par une étiquette lui appartient, sans discussion.
2. **La distance,** pour ce qui reste. Une étiquette qui porte déjà sa
   description sur sa ligne — « Climatisation Néant » — décrit une rangée d'une
   ligne et n'attire rien ; une étiquette seule, ou suivie d'une cellule d'une
   *autre* colonne (« Eau chaude sanitaire COP = 3 »), réclame les phrases
   voisines sans jamais franchir une autre étiquette.

Une phrase ne s'arrête pas qu'à son point : les tableaux portent des notes sans
ponctuation finale (« Travaux à réaliser en lien avec la copropriété »). Le
second signal est qu'**une nouvelle phrase commence par une majuscule**.

### ⚠️ L'apostrophe s'écrit de deux façons

L'extraction rend tantôt `'`, tantôt `’`, selon la police du rapport. Un motif
qui n'accepte qu'une des deux rate la rangée : ici, il ratait la frontière entre
deux générateurs de chauffage, qui se retrouvaient **mêlés dans un seul bloc**.
Tout libellé à apostrophe accepte désormais les deux formes.

## 6. Ce que les autres rubriques rendent, sur 26 volets

| Rubrique | Résultat |
|---|---|
| Vue d'ensemble des équipements | 26/26, cinq postes chacun (chauffage, ECS, climatisation, ventilation, pilotage) |
| Générateurs de chauffage | 32 sur 26 rapports — **6 rapports en ont deux** |
| Packs de travaux | 26/26 en ont **deux**, avec leur montant estimé |
| Commentaire du diagnostiqueur | 26/26 |
| Gestes d'entretien | 5 postes par rapport |
| Climatisation | 25 « Néant », 1 équipé |

### Ce que le rapport ne donne pas — mesuré, déclaré, jamais comblé

- **Les classes projetées après travaux** (§19). La rubrique « Évolution de la
  performance après travaux » ne contient en texte que du discours général sur
  la rénovation et les aides. Les lettres sont en image. On ne montre donc pas
  « E → C » ; on montre les deux packs, leurs lots, leurs consignes, leurs
  performances visées et leurs montants — et on écrit que les lettres sont sur
  le PDF.
- **Les pourcentages de déperdition** (§15). Aucun, dans aucun volet.
- **L'étiquette A→G elle-même.** La lettre reste retrouvée par le calcul.
- **Les couleurs de l'étiquette climat.** Elles ne sont pas dans le corpus
  (l'étiquette est une image) et les valeurs trouvées en ligne datent d'avant
  2021. L'échelle violette est donc un **rendu Verrière déclaré comme tel**, à
  remplacer dès qu'elle sera relevée au texte réglementaire.

## 7. Ce que l'écran affiche aujourd'hui

Sept composants, tous branchés sur ces lectures. Banc d'essai :
`enveloppe.html` (logement inventé, mise en page réelle).

- **`DoubleEtiquette`** — les deux étiquettes au format DPE, et sous elles :
  *« C'est la moins bonne des deux qui est retenue »*, avec la mention de celle
  qui tire vers le bas. La surface de référence porte une aide dépliable qui dit
  à quoi elle sert et **pourquoi elle diffère de la surface Carrez**.
- **`PourquoiCetteNote`** — les causes, classées par la surface que le rapport
  donne, chacune avec la donnée qui la fonde ; puis **ce qui est déjà
  performant**, parce qu'un écran qui n'énumère que les défauts n'est plus cru.
- **`Deperditions`** — « Où part la chaleur » : les surfaces qui donnent sur le
  froid, la plus grande d'abord. Une paroi contre un local chauffé n'y figure
  pas. Garde-fou écrit : *la longueur d'une barre est une surface, pas une
  perte*.
- **`LesParois`** — murs, plafond, plancher bas, fenêtres, **paroi par paroi**,
  avec le mot exact du rapport quand il nuance (« forte présomption »).
- **`LesSystemes`** — tous les générateurs, l'ECS, la ventilation (avec l'alerte
  humidité), un vrai volet **confort d'été**, les renouvelables en trois états.
- **`LesTravaux`** — les deux packs dans la hiérarchie du rapport, avec montants
  et performances visées, le mot du diagnostiqueur, et les gestes repliés.
- **`PointsAVerifier`** — les contradictions, **les deux versions côte à côte**,
  jamais arbitrées, avec la question à poser.

### Check-list du §25 — état

**Cochées** : bien identifié · classe énergétique · classe climat · murs
analysés · toutes les familles de murs conservées · isolation des murs vérifiée ·
fenêtres analysées · toutes les familles de fenêtres conservées · simple vitrage
recherché explicitement · double/triple recherché · menuiseries analysées ·
toiture/plafond analysés · isolation haute analysée · plancher bas analysé ·
chauffage analysé · **tous les générateurs conservés** · ECS analysée ·
ventilation analysée · refroidissement analysé · confort d'été analysé ·
énergies renouvelables recherchées · déperditions analysées · ponts thermiques
recherchés · recommandations récupérées · scénarios de travaux récupérés ·
données absentes identifiées · contradictions recherchées · aucune donnée
inventée · restitution utilisateur compréhensible · restitution technique
accessible · format application respecté.

**Restent ouvertes** :

- **consommations et coûts** (§17) — lus par `dpe.ts`, pas encore repris dans le
  nouvel écran ;
- **sources internes conservées** (§21, niveau 4) — le renvoi vers la page du
  PDF demande que le lecteur de la fiche technique porte les numéros de page,
  ce qu'il ne fait pas encore ;
- **les autres éditeurs** — tout ce document est mesuré sur LICIEL.

## 8. L'aiguillage — un lecteur par éditeur

> **CONTRAINTE ABSOLUE, PERMANENTE ET GÉNÉRALE À TOUTE L'APPLICATION.**
> Voir [LECTEUR-PAR-EDITEUR.md](LECTEUR-PAR-EDITEUR.md) pour l'architecture.

Tout ce qui précède est mesuré **sur LICIEL et sur lui seul**. Ces lectures ne
sont donc plus appelées en direct : elles sont enfermées derrière un aiguilleur
qui **nomme l'éditeur avant de lire**.

- `src/lib/lecteurs/dpe/liciel.ts` — le lecteur LICIEL et sa signature.
- `src/lib/lecteurs/dpe/index.ts` — le registre et `lireLeDpe(lignes)`.
- Socle commun : `src/lib/lecteurs/socle.ts` (`Lecteur<T>`, `aiguiller`).

### La signature retenue, et pourquoi celle-là

Le DPE est le seul diagnostic dont **le texte réglementaire impose de nommer le
logiciel** : sa fiche technique porte la rubrique « Référence du logiciel
validé ». Tous les éditeurs l'impriment, chacun avec son nom. C'est donc une
signature **positive et déclarative**, la plus forte possible, et elle ne repose
sur aucune habitude de mise en page.

On ne reconnaît jamais un format par ce qu'il n'a pas : « ce n'est pas LICIEL
donc c'est l'autre » attribue au hasard dès le troisième éditeur.

### Mesure de l'aiguillage, sur les 32 volets extraits

| Résultat | Volets |
|---|---:|
| Lus par le lecteur LICIEL, reconnus par déclaration | **26** |
| `format inconnu` — aucune signature ne répond | **6** (BC2E, corps en image) |
| Reconnus par **deux** signatures à la fois | **0** |

Les six BC2E ne sont pas un échec : c'est la bonne réponse. Leur DPE est imprimé
en image, il n'y a rien à lire, et l'écran le dit — `FormatInconnu.svelte`
affiche ce qu'on a essayé et conseille de redemander le rapport d'origine.

### Ce qu'un test garde

`src/lib/lecteurs/dpe/liciel.test.ts` interdit qu'un lecteur réponde hors de son
format : un DPE d'un autre éditeur **n'est pas lu**, un document qui ne se nomme
pas n'est reconnu par personne, et un autre logiciel validé ne passe pas pour du
LICIEL.

### Ajouter un éditeur

Une ligne dans `LECTEURS_DPE`, un fichier à côté. **Jamais** élargir un motif du
lecteur LICIEL pour qu'il « passe aussi » ailleurs.
