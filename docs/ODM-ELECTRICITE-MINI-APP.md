# ORDRE DE MISSION — MINI-APP ÉLECTRICITÉ

*Reçu d'Aude le 22/08/2026, pack `VERRIERE_ELECTRICITE_PACK_CLAUDE.zip` (Dropbox,
`BACK OFFICE/VERRIERE`). Le pack contient le visuel de référence, l'ordre
détaillé, un prompt court, une matrice de données et les sources de cadrage.*

> **RÈGLE CARDINALE, écrite dans le README du pack.** « Le visuel est une
> maquette. Les chiffres, codes, articles, catégories, niveaux de risque et
> pourcentages visibles sur l'image sont fictifs et ne doivent jamais être codés
> comme valeurs par défaut. »

---

## L'architecture imposée

Points clés → Résultat global → Résultat détaillé → Ce qui a été contrôlé →
Constatations diverses → Anomalies détaillées → Ce qui n'a pas été contrôlé →
Complétude si justifiable → Conseil Verrière → Rapport complet.

Elle est reproduite carte par carte dans
[`MiniAppElectricite.svelte`](../src/composants/electricite/MiniAppElectricite.svelte),
et les décisions de données vivent dans
[`synthese.ts`](../src/composants/electricite/synthese.ts), qui ne dessine rien.

## Le défaut que cette mini-app existe pour réparer

*Mesuré le 22/08/2026 sur sept volets électricité du corpus DGLM, chaîne
entière : PDF → découpe → lecteur d'éditeur → écran.*

| | |
|---|---|
| anomalies annoncées par les rapports | **16** |
| anomalies extraites par le moteur | **18** |
| anomalies affichées par l'écran | **7** |

**Onze anomalies réelles, avec leurs localisations, n'arrivaient jamais à
l'œil** — et sans même être comptées comme « détachées ». La cause : l'écran
précédent dessinait une chaîne de six barrières et n'y accrochait que les
anomalies qu'il savait PLACER. Ce qui ne se plaçait pas n'existait pas.

La mini-app part de `diagnostic.anomalies` et les rend toutes. Un test le tient,
et un second vérifie que chaque anomalie finit soit dans un domaine, soit dans
« hors domaine » — jamais nulle part.

## « Je veux le même visuel exactement » — 22/08/2026

Toutes les cartes de la planche sont à l'écran, dans son ordre et dans sa mise
en page : le médaillon annulaire du bandeau, la pastille dorée du niveau de
risque, l'anneau chiffré du résultat détaillé, les trois cartes teintées
d'anomalies, la jauge du niveau de confiance, la lampe du conseil.

**Ses valeurs, elles, se calculent.** Le README du pack l'exige, et les règles
sont écrites dans [`visuel.ts`](../src/composants/electricite/visuel.ts) — une
fonction par valeur, chacune testée :

| La planche affiche | La règle qui remplit la case |
|---|---|
| « RISQUE MODÉRÉ » | **élevé** dès qu'une anomalie touche le différentiel, la mise à la terre ou un contact direct — les points par lesquels l'arrêté vise la sécurité **des personnes** ; **modéré** sinon ; **très faible** sans anomalie ; **non évalué** si la conclusion est illisible |
| trois familles — à risque / importantes / à améliorer | un rangement des six domaines de l'arrêté : 2 et 5 → à risque · 1, 3 et 4 → importantes · 6 et le reste → à améliorer. Aucune anomalie ne change de texte en changeant de famille |
| « NIVEAU DE CONFIANCE : 80 % » | domaines renseignés ÷ (renseignés + non vérifiés). Les points non vérifiés qu'aucun domaine n'accueille entrent au **dénominateur** : sans cela, un contrôle incomplet afficherait 100 % |

> ⚠️ **Ces trois valeurs sont des lectures Verrière, pas des données du
> rapport**, et l'écran le dit sous les trois cartes d'anomalies. Le § 3 de
> l'ordre ne les autorise que « validées et documentées par Verrière » : elles
> sont documentées et testées ici, **elles attendent la validation d'Aude.**

Trois valeurs de la planche restent, elles, hors de question :

| La planche affiche | Pourquoi ce ne sera jamais affiché |
|---|---|
| « Installation électrique non conforme » | § 4 : ce diagnostic n'atteste aucune conformité à la NF C 15-100. On écrit la phrase du rapport |
| « Art. 531.3.1 » sur chaque anomalie | le code du rapport **quand il en écrit un**, rien sinon. LICIEL n'en écrit pas toujours |
| « Points de contrôle conformes : 18 » | ce nombre n'est écrit dans aucun rapport lu |

## Les quatre mots qu'on ne confond jamais

Le § 6 en fait une règle : **conforme ≠ absence d'anomalie ≠ non contrôlé ≠ non
applicable.** Le type `Etat` les tient séparés, et trois tests interdisent de les
ramener l'un à l'autre — dont celui qui vérifie que le mot « conforme »
n'apparaît nulle part sur un volet sans anomalie.

## Les deux pièges corrigés à l'écran, le jour même

**1. « 0 anomalies relevées » sur une conclusion illisible.** Chez LICIEL, la
rubrique 5 imprime les deux conclusions opposées l'une sous l'autre et la case
qui les départage est un graphique : un programme ne peut pas la lire. Le grand
chiffre affichait alors `0`. C'est une bonne nouvelle inventée — le pire sens
dans lequel une information puisse être transformée. Le chiffre cède la place à
un tiret, et le mot dit « conclusion non lue ».

**2. Six lignes « Aucune anomalie relevée » sous deux points non vérifiés.** Le
rapport dit combien de points n'ont pas pu être vérifiés, **sans dire
auxquels des six domaines ils appartiennent**. Laisser les six lignes rassurer
ferait entrer un trou de contrôle dans un affichage rassurant, ce que le § 6
interdit. On ne devine pas le domaine : une réserve le dit en clair.

## Ce qui reste ouvert

- **Le tableau `Domaines | Anomalies` bave par endroits.** Sondé le 22/08 : sur
  les volets les plus chargés, des morceaux de la colonne de gauche se collent
  au libellé de l'anomalie (« Au moins un socle de prise de courant comporte une
  broche de **- Installation** terre non re… »), et une date de rapport s'est
  invitée dans un libellé. Les deux colonnes s'entrelacent à l'extraction ; leur
  séparation propre demande de lire le tableau par **positions x**, pas ligne à
  ligne. C'est le prochain chantier du lecteur.
- **Les constatations diverses ne sont pas encore extraites** pour l'électricité.
  Le bloc du visuel n'apparaît donc pas : conformément au § 2, il ne s'affiche
  que si le rapport en porte, et on ne fabrique pas son contenu.
- **Un seul éditeur est couvert** (LICIEL). Chez les autres, le repli se
  déclare — il ne se fait jamais en silence.

## Cadrage réglementaire conservé

Arrêté du 28 septembre 2017 définissant le modèle et la méthode de réalisation de
l'état de l'installation intérieure d'électricité dans les immeubles à usage
d'habitation. L'état vise à **évaluer les risques pouvant porter atteinte à la
sécurité des personnes** et le fonctionnement de l'installation. Le contrôle
porte sur l'installation privative en aval de l'appareil général de commande et
de protection, jusqu'aux bornes d'alimentation ou socles de prises.

---

## Revue de non-régression visuelle — 22/08/2026

*§ 11.10 de l'ordre : « effectuer une revue de non-régression visuelle et métier
avant toute validation ». Faite au navigateur, sur le banc, à 375 px, capture à
l'appui, puis mesurée au DOM carte par carte.*

### Les onze cartes de la planche, relevées dans l'ordre

en-tête à éclair → bandeau sombre + niveau de risque + médaillon → points clés →
résultat global détaillé (anneau chiffré + légende) → ce qui a été contrôlé
(six domaines) → les trois cartes teintées d'anomalies → ce qui n'a pas été
contrôlé → niveau de confiance (pourcentage + jauge + lien) → conseil Verrière
et sa lampe → voir le rapport complet → barre d'onglets.

**Un test verrouille cet ordre** (`elec-anomalies.test.ts`) : il échoue si une
carte disparaît ou change de place.

### Les trois écarts trouvés, et corrigés

| | Ce que la mesure a montré | Correction |
|---|---|---|
| 1 | Le titre du bandeau courait sur **cinq lignes** et butait contre le médaillon — 258 px de haut au lieu de 182. La planche tient en trois lignes | Titre court (`TITRE_BANDEAU`), et **la phrase exacte du rapport en détail du premier point clé** — la place que la maquette lui donne. On cite, puis on explique |
| 2 | Une tête de carte débordait de **6 px** : le chevron pivoté sort de sa boîte en `inline-block` | Le chevron tourne dans une boîte carrée, glyphe centré |
| 3 | — | Après correction : **zéro débordement horizontal, zéro troncature verticale** sur l'écran entier, les quatre dossiers du banc compris |

### Le mot de la planche qui reste écarté

« Installation électrique **non conforme** ». Le § 4 l'interdit : ce diagnostic
n'atteste d'aucune conformité à une norme d'installation neuve. Un test le
vérifie **hors commentaires** — l'en-tête du composant cite la formule pour
expliquer pourquoi elle est écartée, et c'est ce qui s'affiche qui compte.

### Ce qui attend encore la validation d'Aude

Le niveau de risque, les trois familles et le pourcentage de confiance sont des
**lectures Verrière** : des règles écrites, mesurables et testées, mais que le
rapport n'écrit pas. L'écran le dit en clair sous les cartes d'anomalies. Le § 3
ne les autorise que « validées et documentées » — la documentation est faite, la
validation reste à donner.
