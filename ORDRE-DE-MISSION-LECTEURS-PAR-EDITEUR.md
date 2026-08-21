# CONTRAINTE ABSOLUE, PERMANENTE ET GÉNÉRALE — un lecteur par éditeur

*Posée par Aude le 21/08/2026. Elle s'applique à **toute l'application**, et à
tous les diagnostics : DPE, électricité, gaz, plomb, amiante, termites, ERP,
Carrez, assainissement.*

---

## La règle

> **La bonne architecture est un lecteur par éditeur, choisi sur signature, et
> non un lecteur unique rafistolé. On commence par nommer l'éditeur avant de
> lire.**

## L'ordre des opérations, sans exception

1. **Nommer l'éditeur.** Signature PDF (`Producer` / `Creator`), rubrique
   « Référence du logiciel validé », ou marqueurs de mise en page mesurés.
2. **Choisir le lecteur** de cet éditeur.
3. **Lire**, avec les repères de CET éditeur — ceux de `docs/OU-PARSER.md`.
4. **Éditeur non reconnu : se taire.** Jamais deviner avec le lecteur d'un
   autre.

## Ce que cette règle a coûté avant d'être posée

La règle « pas de tableau d'anomalies, donc aucune anomalie » est vraie chez
LICIEL — mesurée sur neuf volets lus en entier, cinq sains sans tableau, quatre
avec. Elle avait été gardée derrière un garde-fou qui ne distingue rien : la
présence du catalogue des domaines.

Or **AnalysImmo imprime la même phrase d'ouverture** — « Anomalies avérées selon
les domaines suivants » — puis range ses anomalies tout autrement : six domaines
numérotés suivis de « Néant » ou d'un tableau à six colonnes, et jamais
d'en-tête « Domaines Anomalies ».

Mesuré sur la forme AnalysImmo : catalogue reconnu, tableau LICIEL absent, donc
**« l'installation ne présente aucune anomalie » sur un volet qui en porte
sept**. Une conformité inventée — la faute que le §43 de l'ordre électricité
interdit en tout premier.

## La règle de sûreté qui en découle

**On garde sur une signature POSITIVE de l'éditeur, jamais sur l'absence d'un
signe.**

L'absence d'un marqueur ne prouve rien. Elle peut vouloir dire « pas de
défaut » — ou « pas le bon éditeur ». Les deux se ressemblent exactement dans le
texte extrait, et l'un est une bonne nouvelle quand l'autre est un silence.

## Ce qu'elle implique pour le code

- Un extracteur ne s'écrit plus « pour un diagnostic », mais **pour un
  diagnostic chez un éditeur**.
- Une forme mesurée chez un seul éditeur est **l'habitude d'un logiciel**, pas
  une règle du métier. Elle ne se généralise qu'après mesure chez au moins deux.
- Un repère jamais mesuré chez un éditeur s'écrit **« non mesuré »**, jamais
  « absent ».
- Avant de toucher à un extracteur, se demander : *chez quel éditeur cette forme
  a-t-elle été mesurée ?*

## Où sont les repères

`docs/OU-PARSER.md` — les endroits, éditeur par éditeur, rubrique par rubrique,
avec leurs bornes et leur disposition. `docs/REPERES-PAR-EDITEUR.md` — ce qui
est acquis, et chez qui.

Voir aussi `ORDRE-DE-MISSION-ELECTRICITE.md`, dont le §39 dit la même chose sous
l'angle de l'apprentissage : une difficulté rencontrée une fois doit rendre
Verrière définitivement meilleure.
