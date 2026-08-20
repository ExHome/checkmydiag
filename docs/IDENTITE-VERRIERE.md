# L'identité Verrière

> Ordre de mission du 20 août 2026 — **refonte totale**.
> Ce document remplace toute lecture antérieure de la charte. Il est la
> référence : si un écran, un composant ou un jeton le contredit, c'est l'écran,
> le composant ou le jeton qui a tort.

---

## Les quatre invariants

Rien d'autre n'est acquis.

### 1. Le logo

Il reste. On ne le réinvente pas, on ne le remplace pas, on ne le simplifie pas
sans demande. C'est le point d'ancrage de la marque.

### 2. Le nom

**Verrière** reste central, et se traite comme une vraie marque — pas comme le
nom d'un logiciel administratif.

### 3. Le vert Verrière — `#12463b`

Il reste le territoire de marque. **Mais il ne faut pas en déduire que tout doit
être vert.** Il fonctionne comme Apple utilise une couleur de marque : présent,
identifiable, parfaitement maîtrisé. Une application entièrement verte est un
contresens sur cet invariant, pas son application zélée.

### 4. L'exigence Apple

Natif, tactile, évident, précis, fluide, premium, extrêmement soigné. **Pas une
imitation littérale d'iOS** — le niveau d'exigence d'un produit Apple.

---

## Tout le reste doit mériter de survivre

Cartes, grilles, marges, ombres, fonds, typographies, pictogrammes, couleurs
secondaires, transitions, menus, architectures d'écran, boutons, schémas,
illustrations, navigation, composants, hiérarchies, animations.

> « Si une décision est moyenne, supprime-la. »

---

## Contrainte absolue : aucun ancien schéma

Pas de recyclage. Pas de variation. Pas de vieille illustration repeinte. Pas de
plan existant déplacé dans une nouvelle carte.

Tous les schémas se repensent dans une direction graphique neuve et cohérente.
Le critère de validation d'un schéma est une seule question :

> **Pourrait-on reconnaître qu'il vient de Verrière sans voir le logo ?**

Si non : refaire.

---

## Les tests qui décident

Un écran ne se valide pas parce qu'il est propre. Il passe ces tests, ou il est
refait.

| Test | La question | L'échec |
|---|---|---|
| **Le logo** | On retire le logo. Reste-t-il reconnaissable ? | Un dashboard générique |
| **Le CRM** | Ce composant pourrait-il être collé tel quel dans une banque, un CRM, un logiciel RH ? | Oui → le repenser |
| **Le noir et blanc** | Que reste-t-il si on retire toute couleur ? | L'information disparaît |
| **Le vide** | Est-ce respirant, ou seulement vide ? | Une impression de prototype |
| **Le recyclage** | Un ancien schéma est-il déguisé là-dedans ? | Oui → refaire |
| **La donnée manquante** | À quoi ressemble cet écran sur un dossier pauvre ? | Il s'effondre ou il ment |
| **Le mensonge** | Quelle donnée du rapport permet d'affirmer cela ? | Aucune → ne pas l'afficher |

Le dernier test prime sur tous les autres. **Un design qui ment est refusé,
quelle que soit sa beauté.**

---

## Ce qui est interdit

- Tableaux lourds, encadrés gris, blocs bordurés systématiques
- Phrases longues, petits titres partout
- Cartes identiques empilées — `titre + carte + carte + carte + bouton`
- Icônes de banque d'icônes sans personnalité
- Écrans tout-pâles : laver toutes les couleurs à 10 % d'opacité n'est pas de
  l'élégance
- Le bleu pétrole ; le sauge `#a6c39a` comme couleur de structure ; le corail
  comme socle
- Une zone **non contrôlée** représentée comme une zone saine

---

## Ce qui est demandé

**Du relief.** Premier plan (l'information essentielle), plan intermédiaire (le
contenu explicatif), arrière-plan (l'univers graphique).

**Des scènes, pas des cartes.** L'exemple donné : sur l'électricité, le chiffre
devient gigantesque, le tableau apparaît en arrière-plan, une ligne électrique
guide l'œil, une anomalie se révèle progressivement, le contenu apparaît au
toucher. *Voilà une scène.*

**Le bâtiment comme matériau graphique.** Lignes de plan, coupes, élévations,
matières, détails constructifs, vues éclatées, superpositions, zones techniques,
volumes, objets du logement. C'est l'avantage du produit : il parle du bâtiment,
alors le bâtiment doit vivre dedans.

**La chaleur — et elle ne vient pas d'un beige jaunâtre.** Elle vient des
matières, de la lumière, des proportions, de la typographie, des détails
sable/or, des transitions, des espaces.

> « Espace n'est pas vide. Un écran vide donne une impression de prototype ; un
> écran respirant donne une impression de luxe. »

---

## Les micro-applications

**70–80 % Verrière, 20–30 % personnalité métier.** Termites peut intégrer bois,
ambre, argile ; l'électricité une lumière jaune ; le gaz une tonalité chaude. Le
spectre réglementaire A→G du DPE peut servir de matière graphique.

Mais **tous doivent immédiatement sembler être Verrière**.

À cinq mètres, les micro-applications appartiennent à la même famille. À
cinquante centimètres, chacune a sa personnalité.

---

## La notation

Chaque proposition se note, et l'auto-complaisance est refusée.

| Critère | Points |
|---|---|
| Identité Verrière | /4 |
| Premium | /4 |
| UX | /4 |
| Chaleur | /3 |
| Originalité | /3 |
| Cohérence iPhone | /2 |

**Minimum acceptable : 18/20.** En dessous, on recommence.

---

## Règle de non-régression

À partir du 20 août 2026 :

- interdiction de revenir automatiquement aux anciens écrans ;
- interdiction de ressortir les anciens schémas ;
- interdiction de produire une nouvelle version « presque pareille ».

Chaque proposition doit montrer une **progression réelle**.

---

## L'objectif

> Pas « une application de diagnostic bien faite ». Une application qu'un
> particulier pourrait ouvrir **uniquement parce qu'elle est belle**, puis
> conserver **parce qu'elle est extraordinairement claire**. Et qu'un
> professionnel regarderait en pensant : « ils maîtrisent leur métier ».
