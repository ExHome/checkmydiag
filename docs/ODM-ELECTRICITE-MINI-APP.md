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

## Ce que la planche montre, et qui n'est pas une donnée

| La planche affiche | Ce que la carte porte |
|---|---|
| « Installation électrique non conforme » | la phrase du rapport. Le § 4 interdit d'écrire une (non-)conformité à la NF C 15-100 : ce diagnostic n'en atteste aucune |
| « NIVEAU DE RISQUE · RISQUE MODÉRÉ » | le compte réel d'anomalies. Aucune échelle de risque n'existe dans un état de l'installation intérieure |
| trois familles — à risque / importantes / à améliorer | les **domaines** du rapport, qui sont sa propre colonne de gauche. Le § 3 interdit de reclasser sans règle validée ; le § 2 demande justement « des familles utiles à la compréhension » |
| « Art. 531.3.1 » sur chaque anomalie | le code du rapport **quand il en écrit un**. LICIEL n'en écrit pas toujours |
| « Points de contrôle conformes : 18 » | ce nombre n'est écrit dans aucun rapport lu |
| « NIVEAU DE CONFIANCE : 80 % » | § 7 : « à défaut de méthode validée, remplacer le pourcentage par une phrase factuelle » |

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
