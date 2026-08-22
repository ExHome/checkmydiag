# Un lecteur par éditeur — contrainte d'architecture

> **CONTRAINTE ABSOLUE, PERMANENTE ET GÉNÉRALE À TOUTE L'APPLICATION**
> (21/08/2026)
>
> La bonne architecture est **un lecteur par éditeur, choisi sur signature** —
> et non un lecteur unique rafistolé. On **nomme l'éditeur avant de lire**.

Ce document dit où en est le moteur par rapport à cette contrainte, et ce qu'il
faut changer. Il complète [OU-PARSER.md](OU-PARSER.md), qui dit *où* lire chez
chaque éditeur, et [REPERES-PAR-EDITEUR.md](REPERES-PAR-EDITEUR.md), qui dit
*chez qui* un repère est vrai.

## Pourquoi — la mesure qui tranche

Le gaz a servi d'épreuve, le 21/08/2026 : **26 volets LICIEL lus en entier**,
puis **6 volets BC2E**. Trois repères tirés des 26 premiers sont tombés en six
lectures :

| Repère tiré de LICIEL | Chez BC2E |
|---|---|
| « La conclusion ne se lit pas : les 5 réponses sont imprimées » | **Faux** — elle est écrite en clair, en tête, 6/6 |
| « La rubrique E porte les anomalies » | La lettre `E` existe, mais `B`, `F`, `G`, `H`… désignent **autre chose** |
| « Le code de contrôle a la forme `C.<n> - <n><lettre>` » | Code écrit **nu** (`8a1`, `K`) — le motif ne trouve rien |

Un lecteur unique qui essaie de couvrir les deux accumule des rustines, et se
trompe **silencieusement** chez le troisième éditeur.

## Où en est le moteur — mesuré

L'éditeur est déjà nommé, correctement, et tôt :

- `src/lib/atelier/editeur.ts` — `identifierGenerateur(meta, lignes)` rend
  l'éditeur, sa source (`déclaration` puis `signature`) et sa preuve.
- `src/lib/analyse/index.ts` ligne 234 — appelé une fois, avant le découpage.

**Mais il n'oriente rien.** La variable `generateur` n'est utilisée qu'une
seconde fois, ligne 411, pour être rangée dans le résultat. Les analyseurs sont
choisis par **type de diagnostic**, jamais par éditeur :

```ts
analyserDpe(…) · analyserPlomb(…) · analyserGaz(lignes, plage) · analyserElectricite(…)
```

`analyserGaz(lignes: string[], plage)` ne reçoit pas l'éditeur : il applique des
expressions régulières génériques à des lignes brutes. C'est, littéralement, le
lecteur unique que la contrainte interdit.

## Ce qu'il faut changer

1. **Passer l'éditeur aux analyseurs.** Leur signature devient
   `(lignes, plage, generateur)`. C'est mécanique et sans risque.
2. **Un registre de lecteurs par éditeur et par diagnostic**, sur le modèle déjà
   écrit dans `scripts/gaz-reperage.local.ts` :

```ts
const LECTEURS_GAZ = [
  { editeur: /liciel/i, lire: lireGazLiciel },
  { editeur: /bc2e/i,   lire: lireGazBc2e }
];
```

3. **Un éditeur non couvert n'est ni rejeté ni deviné.** Il passe par un lecteur
   générique **et le résultat est marqué « éditeur non couvert »**, pour être lu
   à la main. On ne comble pas un trou, on le déclare.
4. **Aucun repère n'est « constant »** tant qu'il n'a pas été mesuré chez au
   moins deux éditeurs. Les autres sont valables *chez qui ils ont été mesurés*,
   et « non mesuré » ailleurs — jamais « absent ».

## Ordre de marche

Commencer par le gaz : c'est le seul diagnostic dont les deux lecteurs sont
**déjà mesurés** — 26 volets LICIEL et 6 BC2E lus en entier, bornes et pièges
écrits dans OU-PARSER.md. Les autres diagnostics suivent au fur et à mesure que
leurs mesures existent, jamais avant.

Chaque lecteur ajouté vient avec ses cas de test et sa régression, conformément
au § 47 de [ODM-GAZ.md](ODM-GAZ.md) : une information rencontrée une fois
devient une compétence permanente.
