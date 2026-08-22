# Mini-app DPE — où sont les données, et ce qui manque

> Livrable n° 3 de l'ordre de mission du 22 août 2026 : « mapping des champs
> DPE vers chaque carte ». Mesuré, pas supposé — chaque ligne a été vérifiée
> dans le dépôt le 22 août 2026.

## Ce que l'ordre exige, et où ça se trouve

| carte exigée | module qui la produit | branché ? |
|---|---|---|
| **Enveloppe du bâtiment** | `analyse/enveloppe.ts` → `lireEnveloppe(fiche)` | non |
| **Chauffage & ECS** | `analyse/systemes.ts` → `lireSystemes(lignes, fiche)` | non |
| **Ventilation** | `analyse/systemes.ts`, type `Ventilation` | non |
| **Surface de référence** | `faits`, libellé « Surface de référence » | **oui** |
| Résultat global | `schema` de genre `dpe` | **oui** |
| Recommandations | `travaux` | **oui** |
| Constatations diverses | `constatations` | selon éditeur |
| Non contrôlé | `constatations.entrees` de nature `limite` | selon éditeur |

## La bonne nouvelle : tout est déjà écrit

Les trois cartes techniques ne sont pas à concevoir. Elles existent :

- **le lecteur** `lecteurs/dpe/liciel.ts` produit, en une passe,
  `fiche`, `enveloppe`, `systemes`, `travaux`, `causes`, `dejaBien`, `points` ;
- **les composants** `composants/dpe/LesParois.svelte`,
  `composants/dpe/LesSystemes.svelte` et `composants/dpe/Deperditions.svelte`
  savent déjà les afficher.

## Ce qui manque, exactement

**Un seul maillon, et il est nommable :** `LECTEURS_DPE` n'est appelé nulle
part.

```
lecteurs/dpe/liciel.ts   → LECTEUR_DPE_LICIEL     ✓ écrit
lecteurs/dpe/index.ts    → LECTEURS_DPE           ✓ exporté
analyse/…                → aucun appel            ✗ ← le maillon manquant
```

À titre de comparaison, la chaîne de l'électricité, elle, est complète :
`analyse/securite.ts` importe `LECTEURS_ELECTRICITE` et s'en sert. Le DPE, le
gaz et le plomb ont leur lecteur mais personne ne l'appelle.

Conséquence mesurée sur le dossier de démonstration : le diagnostic DPE porte
`type, titre, verdict, gravite, faits, explication, demarche, analogie, aFaire,
schema, pages, travaux, date, feuillets, reperes, origine` — et **ni
`enveloppe`, ni `systemes`, ni `ventilation`**.

Les composants `dpe/` ne sont donc montés nulle part : ils n'auraient rien à
afficher.

## Ce que cela veut dire pour la mini-app

1. **Les quatre cartes techniques ne peuvent pas encore être branchées.** Ce
   n'est pas un travail d'affichage : il manque l'appel au lecteur dans la
   chaîne d'analyse, et cet appel vit dans `src/lib/analyse/`.

2. **Sur un rapport non-LICIEL, elles resteront vides**, et c'est voulu : la
   contrainte « un lecteur par éditeur, choisi sur signature » interdit de
   deviner la structure d'un rapport dont on ne reconnaît pas l'éditeur. Un
   écran qui affiche « non renseigné » chez un éditeur inconnu dit la vérité ;
   un écran qui invente une enveloppe ne la dit pas.

3. **Le dossier de démonstration ne porte pas de signature LICIEL.** Même une
   fois le maillon posé, la démo montrera les cartes vides. Pour vérifier
   l'écran, il faut un vrai rapport LICIEL du corpus.

## Les deux pièges à ne pas reproduire

**La surface de référence n'est pas la surface habitable.** L'ordre insiste, et
le DPE 2021 les distingue : la surface de référence sert au calcul, la surface
habitable est une notion juridique. Les afficher l'une pour l'autre fausse la
lecture d'un chiffre qui divise la consommation — donc la classe.

**Le niveau de confiance de la maquette (85 %) est illustratif.** L'ordre le
dit lui-même : « ne pas conserver 85 % sans méthode de calcul validée ». Aucune
règle de complétude n'existe aujourd'hui dans le produit. Tant qu'elle
n'existe pas, ce bloc ne doit pas être affiché : un score inventé donnerait au
lecteur une certitude que le document n'a pas.
