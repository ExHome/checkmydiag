# Les repères de lecture, éditeur par éditeur

*Ordre d'Aude, 21/08/2026 : **l'atelier doit poser des repères de lecture PAR
ÉDITEUR.** Ce fichier est le référentiel qui en découle. Il complète
[REPERES-DE-LECTURE.md](REPERES-DE-LECTURE.md), qui dit OÙ regarder, et
[ENCARTS-QUI-PORTENT.md](ENCARTS-QUI-PORTENT.md), qui dit ce que chaque rubrique
porte. Celui-ci dit **chez qui c'est vrai**.*

---

## La règle

**Un repère mesuré sur un seul éditeur n'est pas un repère du métier : c'est
l'habitude d'un logiciel.**

⚠️ **Et l'architecture qui en découle est une contrainte absolue, permanente et
générale à toute l'application** : *un lecteur par éditeur, choisi sur
signature, jamais un lecteur unique rafistolé* — voir
[`ODM-LECTEURS-PAR-EDITEUR.md`](ODM-LECTEURS-PAR-EDITEUR.md), tenue par
`src/lib/analyse/lecteurs.ts` et ses tests. Cent rapports LICIEL ont fait passer quatre traits
pour des règles ; l'épreuve hors Liciel les a démentis en douze rapports.

Trois conséquences, qui s'appliquent sans exception :

1. **Aucune entrée du référentiel n'est valable « en général ».** Elle est
   valable *chez les éditeurs où elle a été mesurée*, et nulle part ailleurs.
   « Constant » est interdit tant que le repère n'a pas été vu chez **au moins
   deux éditeurs**.
2. **Un trou se déclare, il ne se comble pas.** Un repère jamais mesuré chez un
   éditeur s'écrit « non mesuré », jamais « absent ».
3. **Avant de mettre un trait au compte d'un éditeur, vérifier qu'il n'est pas
   dans le texte réglementaire.** Le catalogue des six domaines de l'électricité
   avait été rangé au compte de Liciel : c'est le modèle imposé par l'annexe III
   de l'arrêté du 28 septembre 2017. Ce qui est propre à Liciel, c'est de les
   imprimer tous les six même sans résultat.

---

## Nommer l'éditeur : le repère qui commande tous les autres

Rien ne se range par éditeur tant que l'éditeur n'est pas nommé. Le module
[`src/lib/atelier/editeur.ts`](../src/lib/atelier/editeur.ts) le fait, et sa
mesure est reproductible (`scripts/editeurs-corpus.local.ts`).

**Le générateur n'est déclaré qu'à deux endroits** — mesuré sur 700 PDF du
corpus et 50 DDT lus en entier :

| | Où | Portée | Fiabilité |
|---|---|---|---|
| **Déclaration** | rubrique « Référence du logiciel validé » | **le DPE seul** | la meilleure : le rapport se nomme |
| **Signature** | métadonnées PDF `Producer` / `Creator` | le fichier entier | sûre pour la famille, muette sur la version |

**Un DDT sans DPE ne nomme son logiciel nulle part dans son texte** : 26 des 50
DDT mesurés sont dans ce cas. Seule la signature reste.

### Deux faux, et pourquoi on ne cherche jamais une marque dans le corps

| Ce qu'on croit lire | Ce que c'est | Fréquence |
|---|---|---|
| « fisa » → Fisa-DPE | « insuf**FISA**nte », phrase sur l'insuffisance respiratoire du volet amiante | **40 rapports sur 50** |
| « ITGA » → Imm'PACT | le **laboratoire** qui a analysé les prélèvements — « Commande ITGA : IT0526-13070 » | corps d'un rapport LICIEL |

ITGA édite Imm'PACT *et* analyse l'amiante : le même nom désigne un éditeur et
un labo. En métadonnée `Creator`, il désigne l'éditeur ; dans le corps, le labo.
Les deux cas sont tenus par un test.

---

## L'état du corpus, mesuré le 21/08/2026

700 PDF, pris à la racine des dossiers clients.

| Éditeur | Documents | Nommé par |
|---|---|---|
| **LICIEL** | 345 | signature `iTextSharp 5.4.x`, confirmée par 260 déclarations |
| **PreventImmo** (états des risques) | 29 | signature `itext-paulo` + `pdftk-java` |
| **Imm'PACT** | 1 | signature `iTextSharp 5.5.13` + `Creator: ITGA` |
| **BC2E** (ex-« famille non identifiée ») | **59** (215 sur 2 500 PDF re-mesurés le 21/08) | chaîne `TCPDF / HTML2PDF`, un fichier par volet — **nommée le 21/08 : le pied de page porte « membre du réseau BC2E »** |
| **ITGA (laboratoire)** | 17 | `iTextSharp 5.5.13` + `Creator: ITGA` — **rapports d'essai, pas des diagnostics** |

**375 des 434 documents de diagnostic portaient un éditeur nommé — 86 %.** Les
59 autres formaient **une seule famille**, seul trou d'identification du corpus.

**21/08/2026 — le trou est comblé : c'est BC2E**, et le rapport le dit dans son
pied de page, sur chaque page : « DGLM EXPERTISES / <opérateur> **membre du
réseau BC2E** ». Le même pied donne le volet, la mission et la pagination du
volet (`AMIANTE (DTA) : 3 sur 10`). **100 % des documents de diagnostic du
corpus portent désormais un éditeur nommé.**

⚠️ C'est une exception apparente à la règle « on ne cherche jamais une marque
dans le corps » — et elle n'en est pas une : ici, le nom est dans une
**rubrique** à position fixe (le pied de page), pas dans un mot rencontré au
hasard du texte.

Le reste des 700 n'est pas à lire, et l'atelier n'a pas à l'ouvrir :

| | | |
|---|---|---|
| **216 factures** | `mPDF 8.x`, une page, nommées `F#####_###.pdf` | écartées sans ouverture |
| **42 numérisations** | Ghostscript/PDFCreator, TOSHIBA, RICOH, Print To PDF | **aucun texte extractible** |
| 8 divers | LibreOffice, sans métadonnées | plans, pièces jointes |

⚠️ **Les 42 numérisations sont le vrai danger.** Sur un tel document chaque volet
paraît vide, et le silence de l'extraction se lit exactement comme un rapport
sans défaut. La signature d'impression le dit **avant** toute lecture — c'est le
seul repère qui protège d'une conclusion fausse.

---

## Ce qui est acquis, et chez qui

Repris de l'épreuve hors Liciel (douze rapports, cinq éditeurs, 436 pages) et
des 100 rapports LICIEL lus. **Lire les colonnes, pas les lignes** : une case
vide est un trou de mesure, pas une absence.

| Trait de forme | LICIEL | AnalysImmo | DPE WIN | Imm'PACT | Expertec Pro | BC2E |
|---|---|---|---|---|---|---|
| Un fichier PDF **par volet**, nommé d'après la mission | ❌ | non mesuré | non mesuré | non mesuré | non mesuré | ✅ `…-dta.pdf`, `…-dapp.pdf` |
| Pied de page nommant l'éditeur, le volet et la mission | ❌ | non mesuré | non mesuré | non mesuré | non mesuré | ✅ |
| Conclusion amiante en **page 1** | ❌ (page 2) | non mesuré | non mesuré | non mesuré | non mesuré | ✅ |
| Résultats amiante en **sigles + légende imprimée** (JPOR, MM, DOC, RASP, MPSCA) | ❌ (texte en clair) | non mesuré | non mesuré | non mesuré | non mesuré | ✅ |
| Droit de l'amiante imprimé **même sans positif** | ✅ (toujours) | non mesuré | non mesuré | non mesuré | non mesuré | ❌ (seulement si positif) |
| Le sommaire annonce moins de rubriques que le corps | ✅ | non mesuré | non mesuré | non mesuré | non mesuré | ✅ |
| Rubrique « Référence du logiciel validé » | ✅ | ✅ | ✅ | ✅ | non mesuré | non mesuré |
| Six domaines électricité imprimés même sans résultat | ✅ | ❌ verdict par domaine | non mesuré | non mesuré | non mesuré | non mesuré |
| Synthèse en tableau à **colonnes entrelacées** | ✅ | ❌ titres majuscules + texte | non mesuré | non mesuré | non mesuré | non mesuré |
| Tableau d'anomalies à 6 colonnes (code de norme, mesure compensatoire) | ❌ | ✅ | non mesuré | non mesuré | non mesuré | non mesuré |
| Caractères doublés à l'extraction | ❌ | ❌ | ❌ | ❌ | ✅ | non mesuré |
| En-têtes quadruplés | ❌ | ❌ | ✅ (V5) | ❌ | ❌ | non mesuré |
| DPE ancienne génération (pas de schéma des déperditions) | ❌ | ❌ | ✅ (V4, modèle 6.A) | ✅ (modèle 6.1) | non mesuré | non mesuré |
| Le CREP prend la **pièce** comme unité, la mesure comme ligne | ❌ | non mesuré | non mesuré | non mesuré | ✅ | non mesuré |
| Rapport **numérisé** rencontré | ❌ | ❌ | non mesuré | ✅ 40 p. vides / 72 | ❌ | non mesuré |

**Ce que ce tableau dit surtout, c'est ce qu'il ne dit pas.** Sur neuf traits et
six éditeurs, 30 cases sur 54 sont « non mesuré ». Le référentiel n'est pas
troué par négligence : il l'est parce qu'un seul éditeur a été lu en profondeur.

---

## Ce qu'il reste à faire, par ordre d'utilité

1. ~~**Nommer la famille HTML2PDF**~~ — **fait le 21/08** : c'est BC2E, nommé
   après lecture intégrale de quatre de ses documents amiante. Reste à lire ses
   autres volets (DPE, électricité, plomb, termites), jamais ouverts.
2. **Six des dix logiciels validés n'ont jamais été vus** : ARGOS, CLIMAWIN,
   KLK DIAG, PLÉIADES, WINDPE, DJESERDIAG. Les sources publiques rassemblées
   dans `VERRIERE_Corpus_Formats_Diagnostics_Hors_Liciel_v1.zip` couvrent
   AnalysImmo, DPE WIN, Imm'PACT, Expertec et Diagamter — pas ceux-là.
3. **Remplir les colonnes du tableau ci-dessus**, un éditeur à la fois, en
   lisant — jamais en sondant.
