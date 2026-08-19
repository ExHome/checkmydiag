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
- **Reprendre par** : les diagnostics classiques, la copropriété passant après
  — décision du 19/08. Dans l'ordre : le **plomb** et l'**amiante**, dont la
  justesse n'a jamais été mesurée, puis les **termites** et l'**ERP**.
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
| Rapports lus en entier | 3 |
| Volets et documents lus page à page | 9 |
| Erreurs de moteur trouvées par la lecture | 3 majeures |
| Corrections livrées | 5 |
| Tests de non-régression ajoutés | 18 |
| Sondes de justesse écrites | 2 |
| Notions métier versées au produit | 4 |
| Fiches versées à la Dropbox | 2 |
| Points ouverts au carnet | 15 |

## Couverture par diagnostic

Ce que « lu » veut dire ici : le volet a été lu page à page, pas survolé.

| Diagnostic | Volets lus | Justesse mesurée | État |
|---|---|---|---|
| Électricité | 2 | **59/60** verdicts justes (contre 17/31) | catalogue démasqué, deux variantes de constat lues, anomalies compensées distinguées |
| Gaz | 3 | **7/7** verdicts justes (contre 0/3) | rubrique E lue juste ; rubrique G et « installation non alimentée » restent à remonter |
| DPE | 2 | 4 % de muets | cas du DPE vierge rencontré, pas encore traité |
| ERP | 3 | argile 73/140 dossiers | trois écritures de l'argile connues ; l'imprimé officiel et ses croix restent à exploiter |
| Plomb | 1 (session antérieure) | — | classes et cinq situations lues |
| Amiante | 1 (session antérieure) | — | rubrique 1.2 lue |
| Termites | 1 (session antérieure) | — | tableau de repérage lu |
| Surface | 2 | — | Boutin et Carrez distingués |
| **DTG** | **1** | — | structure, curatifs, rubriques vides et cinq points de vigilance ; notions versées au produit |
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
