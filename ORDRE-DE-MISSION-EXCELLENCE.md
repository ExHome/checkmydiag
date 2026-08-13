# Ordre de mission permanent — excellence

Posé le 13/08/2026. **Ce n'est pas une tâche, c'est l'ADN du projet.** Il
s'applique à chaque modification future, même sans rappel. Les autres cadres
restent en vigueur : [ORDRE-DE-MISSION.md](ORDRE-DE-MISSION.md) (le produit),
[ORDRE-DE-MISSION-UX.md](ORDRE-DE-MISSION-UX.md) (l'interface),
[ORDRE-DE-MISSION-DA.md](ORDRE-DE-MISSION-DA.md) (la direction artistique).

> **L'excellence n'est pas une phase finale de CheckMyDiag. C'est son mode
> normal de fonctionnement.**

## L'objectif

Pas « faire un bon site de diagnostic ». **Créer l'expérience de compréhension
du diagnostic immobilier que les autres auront envie de reproduire.**

Sept qualités, simultanément, aucune sacrifiée à une autre :

> EXACTITUDE · SIMPLICITÉ · BEAUTÉ · RAPIDITÉ · PÉDAGOGIE · TRAÇABILITÉ ·
> CONFIANCE

## Complexe derrière. Évident devant.

La complexité technique, réglementaire et algorithmique appartient au moteur.
Elle ne se transfère jamais à l'utilisateur, qui n'a pas à comprendre comment
CheckMyDiag fonctionne pour comprendre son logement.

## La vérité avant tout

**FIABILITÉ > DESIGN > VITESSE DE PRODUCTION.**

Une interface magnifique contenant une information fausse est un échec. Toute
affirmation réglementaire doit pouvoir être reliée à une source officielle —
Légifrance, Service-Public, ministères, ADEME, Géorisques.

**Ne jamais transformer une généralité en règle absolue.** C'est l'erreur la
plus fréquente et la plus coûteuse : une exception oubliée transforme une
information juste en information fausse.

### Interdiction d'halluciner

Si l'information n'est pas dans le rapport : « Information non trouvée dans
votre rapport. » Si la conclusion dépend d'une donnée absente : « Impossible de
conclure avec les informations disponibles. » Si la règle demande vérification :
« À confirmer. »

> Une incertitude correctement signalée vaut infiniment mieux qu'une réponse
> fausse présentée avec assurance.

## Le moteur de règles

Une obligation ne se réduit jamais à un type de diagnostic. Elle dépend du
croisement : **type de bien × usage × vente ou location × copropriété ou non ×
année de construction × date du permis × localisation × installations × date de
transaction.**

`LOCAL COMMERCIAL + VENTE + COPROPRIÉTÉ` ne reçoit pas les mêmes réponses que
`APPARTEMENT + LOCATION`.

## Traçabilité

Chaque information importante doit pouvoir répondre à « d'où vient-elle ? » :

```
CONCLUSION → EXPLICATION → DONNÉE EXTRAITE → PAGE DU DIAGNOSTIC → DOCUMENT
                                                    ↓
                                          SOURCE RÉGLEMENTAIRE
```

## La grammaire universelle

Toute information importante suit cette séquence — c'est la signature UX du
produit :

> **JE VOIS** ce qui a été trouvé · **JE COMPRENDS** ce que ça signifie ·
> **J'ÉVALUE** si c'est important dans mon cas · **J'AGIS** · **JE VÉRIFIE** où
> c'est écrit dans mon diagnostic.

## Un enfant voit, un adulte comprend, un expert valide

Trois niveaux, jamais confondus : le **visuel** compris sans jargon,
l'**explication** accessible sans connaissance technique, l'**expert** avec la
donnée précise, sa source et sa nuance réglementaire.

**Vulgariser n'est pas appauvrir.**

## Visualiser avant d'écrire

Avant trois paragraphes, se demander : *un schéma l'expliquerait-il mieux ?*
Les schémas maîtres à construire : DPE en coupe · électricité (tableau,
circuits, zones) · gaz · amiante · plomb · surfaces · copropriété · risques.

Un schéma n'est jamais décoratif : **c'est une interface de connaissance.** Au
clic d'un élément : ce que c'est → ce que le diagnostic en dit → pourquoi ça
compte → la conséquence → la solution → la source.

## Ne pas ajouter pour ajouter

Avant toute fonctionnalité : quel problème réel ? combien d'utilisateurs
concernés ? une fonction existante y répond-elle déjà ? peut-on simplifier au
lieu d'ajouter ? augmente-t-elle la charge cognitive ? sera-t-elle maintenable ?

**Si sa valeur n'est pas claire, on ne la développe pas.**

> 8 schémas extraordinaires valent mieux que 80 illustrations moyennes.
> 100 réponses parfaitement fiables valent mieux que 1 000 pages approximatives.

## Pas de fausse alarme

Rouge ne veut pas dire « information intéressante » mais « réellement
prioritaire ». Les alertes se limitent volontairement, sinon elles perdent leur
valeur.

## Savoir dire non

Une demande qui surcharge le produit, dégrade l'UX, introduit un risque
réglementaire, fragilise l'architecture ou duplique l'existant ne s'exécute pas
aveuglément : on signale le problème, on l'explique, on propose mieux.

> Un partenaire d'excellence, pas un exécutant complaisant.

## La question qui tranche

> **« Est-ce que cela aide réellement quelqu'un à mieux comprendre son
> diagnostic immobilier ? »**

Si la réponse est non, c'est secondaire.

## La notation, après chaque version

Sur 20, sans complaisance : fiabilité réglementaire · compréhension · UX · UI ·
pédagogie · personnalisation · traçabilité · performance · accessibilité · SEO ·
sécurité · qualité du code. **Identifier systématiquement les trois principaux
défauts restants**, priorisés par risque × impact × fréquence.

Le 20/20 n'est pas atteint parce que c'est beau. Il l'est quand une personne
qui ne connaît rien comprend vite, qu'un professionnel ne trouve pas le produit
simpliste, que chaque information se vérifie jusqu'à sa source, que le produit
ne prétend jamais savoir ce qu'il ignore, et que la complexité reste invisible.

## Les priorités

| | |
| --- | --- |
| **P0** | Fiabilité — audit réglementaire des contenus existants |
| **P1** | Le moteur de règles contextuelles |
| **P2** | Le bien immobilier au centre, plus le PDF |
| **P3** | « Votre bien en 20 secondes » |
| **P4** | Les schémas maîtres interactifs |
| **P5** | Chaque information reliée à sa page source |
| **P6** | La signature architecturale |
| **P7** | Éliminer clics, répétitions, hésitations |
| **P8** | Performance et accessibilité irréprochables |
| **P9** | « En clair », après sécurisation du corpus |

## Le manifeste

> Ne pas montrer la complexité : **la maîtriser**.
> Ne pas donner plus d'informations : **la bonne, au bon moment**.
> Ne pas affirmer : **prouver**.
> Ne pas décorer : **expliquer visuellement**.
> Ne pas ajouter : **simplifier**.
> Ne pas copier les meilleurs : **comprendre pourquoi ils le sont, et aller
> plus loin**.

**Si quelque chose peut être plus exact, plus clair, plus simple, plus rapide,
plus beau ou plus utile, le travail n'est pas terminé.**
