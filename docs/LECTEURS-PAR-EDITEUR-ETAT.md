# Un lecteur par éditeur — l'état des lieux

*Mesure du 21/08/2026, contre
[ORDRE-DE-MISSION-LECTEURS-PAR-EDITEUR.md](../ORDRE-DE-MISSION-LECTEURS-PAR-EDITEUR.md).*

---

## Le critère de danger, et pourquoi c'est celui-là

Tous les extracteurs ne courent pas le même risque. Celui qui relève un chiffre
et ne le trouve pas rend « non lisible » : le lecteur n'apprend rien, mais rien
de faux.

**Le danger est ailleurs : dans les extracteurs qui concluent une BONNE
NOUVELLE.** Chez eux, l'absence d'un marqueur a deux causes possibles — « pas de
défaut » ou « pas le bon éditeur » — et les deux se ressemblent exactement dans
le texte extrait. L'une est une bonne nouvelle, l'autre est un silence.

C'est la faute mesurée le 21/08 : un volet AnalysImmo portant sept anomalies
ressortait « ne présente aucune anomalie », parce qu'une habitude de LICIEL
avait été généralisée.

## La mesure

Extracteurs qui posent une conclusion favorable (`gravite: 'bon'`,
`etat: 'aucune'`), et savent-ils devant quel éditeur ils se trouvent ?

| Extracteur | Conclusions favorables | Signature d'éditeur |
|---|---|---|
| `securite.ts` (électricité, gaz) | 8 | ✅ depuis la correction du 21/08 |
| `dpe.ts` | 5 | ❌ |
| `plomb.ts` | 2 | ❌ |
| `risques.ts` (ERP) | 2 | ❌ |

**Trois extracteurs sur quatre concluent une bonne nouvelle sans savoir chez
quel éditeur ils lisent.** Ils sont dans la même classe de risque exactement
que le défaut corrigé — pas nécessairement fautifs aujourd'hui, mais rien ne les
en empêche.

⚠️ **Cette mesure est une première passe, pas un verdict.** Elle compte des
motifs dans le source ; elle ne dit pas si chaque conclusion favorable découle
réellement d'une absence. Il faut lire les quatre extracteurs pour trancher, cas
par cas. Ce qu'elle établit est plus modeste et suffisant : **là où il faudrait
une signature d'éditeur, il n'y en a pas.**

## Ce qui n'est pas encore couvert, et qui l'est déjà

Le modèle existe dans le dépôt : `scripts/gaz-reperage.local.ts` range ses
repères dans une table **par éditeur**, et `docs/OU-PARSER.md` sépare ses
sections LICIEL et BC2E. C'est ce patron qu'il faut reprendre, pas en inventer
un autre.

La même loi a été trouvée deux fois le même jour, par deux chemins
indépendants :

- **sur le gaz** — trois repères tirés de 26 volets LICIEL tombent en six volets
  BC2E : la conclusion ne se lit pas au même endroit, les lettres de rubrique ne
  désignent pas les mêmes rubriques, et le motif de code de point de contrôle ne
  trouve rien chez le second ;
- **sur l'électricité** — la règle du tableau d'anomalies, vraie chez LICIEL,
  inventait une conformité chez AnalysImmo.

Deux diagnostics, deux couples d'éditeurs, la même conclusion. Ce n'est plus une
observation : c'est la règle d'architecture.

## L'ordre des travaux

1. **Lire les trois extracteurs non gardés** — `dpe.ts`, `plomb.ts`,
   `risques.ts` — et déterminer, pour chaque conclusion favorable, si elle
   découle d'une absence. Une conclusion tirée d'une phrase présente ne court
   aucun risque ; une conclusion tirée d'un silence en court un.
2. **Poser la signature d'éditeur en entrée d'analyse**, une fois pour toutes,
   plutôt qu'un test de forme dans chaque extracteur.
3. **Basculer diagnostic par diagnostic**, en commençant par l'électricité, dont
   les trois formes sont lues et documentées.
4. **Mon propre lecteur de tableau élec en fait partie** : il est LICIEL de bout
   en bout et s'applique encore sans condition. Il ne trouve rien ailleurs, donc
   il ne casse rien — mais c'est la même erreur de principe en germe.
