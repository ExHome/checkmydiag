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

- Dernier volet lu en entier : **électricité**, deux dossiers (un sans anomalie,
  un avec cinq), plus les volets DPE, surface et ERP qui les accompagnaient.
- **Reprendre par** : les quatre points ouverts en fin de carnet — le rapport
  dont la synthèse et le volet se contredisent, le rattachement de la synthèse
  électricité, les mesures compensatoires, et la lecture vente/location.
- **Jamais lu à ce jour** : un dossier de copropriété — **DTG, PPPT, DTA,
  RAAT, DPE collectif**. C'est le cœur de métier DGLM et le plus grand trou du
  corpus lu.

## Compteurs

| | Total |
|---|---|
| Rapports lus en entier | 2 |
| Volets lus page à page | 8 |
| Erreurs de moteur trouvées par la lecture | 1 majeure |
| Corrections livrées | 2 |
| Tests de non-régression ajoutés | 6 |
| Sondes de justesse écrites | 2 |
| Points ouverts au carnet | 12 |

## Couverture par diagnostic

Ce que « lu » veut dire ici : le volet a été lu page à page, pas survolé.

| Diagnostic | Volets lus | Justesse mesurée | État |
|---|---|---|---|
| Électricité | 2 | **30/31** verdicts justes (contre 17/31) | catalogue démasqué, deux variantes de constat lues |
| Gaz | 2 (sessions antérieures) | non mesurable sur l'échantillon | rubrique E connue ; la synthèse ne le nomme pas comme attendu |
| DPE | 2 | 4 % de muets | cas du DPE vierge rencontré, pas encore traité |
| ERP | 3 | argile 73/140 dossiers | trois écritures de l'argile connues ; l'imprimé officiel et ses croix restent à exploiter |
| Plomb | 1 (session antérieure) | — | classes et cinq situations lues |
| Amiante | 1 (session antérieure) | — | rubrique 1.2 lue |
| Termites | 1 (session antérieure) | — | tableau de repérage lu |
| Surface | 2 | — | Boutin et Carrez distingués |
| **Copropriété** (DTG, PPPT, DTA, RAAT, DPE collectif) | **0** | — | **jamais ouvert** |

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
