# Conformité à l'ordre de mission ÉLECTRICITÉ — état mesuré

*Mesure du 21/08/2026, contre
[ORDRE-DE-MISSION-ELECTRICITE.md](../ORDRE-DE-MISSION-ELECTRICITE.md).*

**Rien ici n'est estimé.** Chaque verdict vient soit de la lecture du code
(`src/lib/analyse/anomalies.ts`, `securite.ts`, `modele.ts`), soit des trois
volets élec lus en entier et consignés au chapitre ÉLECTRICITÉ de
[OU-PARSER.md](OU-PARSER.md). Une case sans preuve est écrite « non mesuré »,
jamais « conforme ».

---

## Le verdict en une ligne

**Le modèle de données rend deux règles de l'ordre structurellement
impossibles.** Ce n'est pas un défaut de réglage : c'est la forme de l'objet
qui interdit de les tenir. Tant qu'il n'est pas changé, les §9 et §14 ne
peuvent pas être satisfaits, quel que soit le soin de l'extraction.

## §8 — « Une anomalie = un objet complet »

L'ordre exige neuf champs par anomalie. Voici ce que porte l'objet aujourd'hui
(`Releve` et `AnomalieDetaillee`) :

| Champ exigé par le §8 | État | Preuve |
|---|---|---|
| RÉFÉRENCE | ✅ | `code?: string` |
| LIBELLÉ SOURCE | ✅ | `libelle: string` |
| LOCALISATION | ⚠️ **une seule** | `ou?: string` — le §10 exige « conserver toutes celles données » |
| FAMILLE | ⚠️ **non rattachée** | la famille vit dans `DomaineConstate`, pas dans l'anomalie |
| ÉLÉMENT CONCERNÉ | ❌ | aucun champ |
| NOMBRE / PLURALITÉ | ❌ | aucun champ — voir §9 ci-dessous |
| MESURE COMPENSATOIRE | ❌ **au mauvais niveau** | voir §14 ci-dessous |
| EXPLICATION VERRIÈRE | ❌ | aucun champ au niveau de l'anomalie |
| SOURCE DANS LE RAPPORT | ❌ | ni page, ni ancre sur l'anomalie |

**Quatre champs sur neuf.** Et le §8 dit expressément que « B3 — anomalie
terre » est insuffisant : c'est pourtant très exactement la forme actuelle.

## §14 — la faute structurelle

> « Chaque mesure compensatoire doit être attachée à l'anomalie qu'elle
> compense. **Interdiction de faire une liste séparée sans correspondance.** »

Aujourd'hui, la compensation est un **booléen posé sur le domaine** :

```
export interface DomaineConstate {
  numero: number;
  nom: string;
  compense: boolean;   // ← sur le DOMAINE, pas sur l'anomalie
}
```

Conséquence directe, et elle est grave : un domaine qui porte trois anomalies
dont **une seule** est compensée les marque **toutes les trois** comme
compensées. Le lien « quelle anomalie bénéficie de quelle protection » — la
question que le §14 pose mot pour mot — n'existe pas dans le modèle.

Et le libellé de la mesure est perdu : `compense` ne retient qu'un vrai/faux,
là où les rapports écrivent la mesure en toutes lettres.

**Ce n'est pas une lacune d'extraction : la donnée est dans les rapports.** Les
trois lectures le prouvent :

| Éditeur | Ce que le rapport écrit, par anomalie |
|---|---|
| DPE WIN V4 | `Mesure compensatoire : non` ou `Mesure compensatoire validée : <code> - <libellé complet>` |
| AnalysImmo | colonnes `N° article (2)` + `Libellé des mesures compensatoires correctement mises en œuvre (3)`, en regard de l'anomalie ; puis réécrites en clair dans `ANNEXE 1 – LISTE DES ANOMALIES COMPENSEES` |
| LICIEL | mention rattachée au domaine — **seul cas où la source elle-même ne descend pas à l'anomalie** |

Deux éditeurs sur trois donnent le lien, et le moteur le jette.

## §9 — la pluralité, « POINT ABSOLUMENT ESSENTIEL »

Aucun champ ne porte l'étendue. L'ordre exige de distinguer :

- « plusieurs prises ne sont pas reliées à la terre » ;
- « au moins un élément concerné selon le rapport » ;
- une localisation citée en exemple, quand l'étendue réelle est plus large.

Le §11 ajoute que Verrière ne doit jamais laisser croire qu'une seule prise est
concernée parce qu'une seule localisation est citée. **Or les libellés
normatifs du FD C16-600 commencent presque tous par « Au moins un… »** — la
pluralité est donc dans le texte source, prête à être lue, et rien ne la
recueille.

## §10 — les localisations multiples

`ou?: string` ne retient qu'une chaîne. Le volet LICIEL lu en porte plusieurs
dans une même remarque, collées sans séparateur et répétées :
`(2ème étage - mezzaninne2ème étage - mezzaninne1er étage - Entrée /Cuisine/Séjour…)`.

Une seule localisation survit — et le §32 qualifie précisément ce cas de
**BLOCAGE** : « une anomalie mentionne plusieurs localisations et Verrière n'en
garde qu'une sans avertissement ».

## §36 — le contrôle de complétude, case par case

39 cases. **UNE SEULE CASE NON CONTRÔLÉE = DOSSIER NON TERMINÉ.**

| | Case | État |
|---|---|---|
| 1 | Bien identifié | ⚠️ partiel — l'adresse et la date existent au niveau du dossier, pas rattachées au volet élec |
| 2 | Périmètre compris | ❌ le rappel des limites est lu comme du texte, jamais restitué |
| 3 | Installation alimentée / non alimentée | ❌ jamais extrait — §18 en fait une information majeure |
| 4 | Synthèse lue | ✅ `Conclusion` |
| 5 | Toutes les familles contrôlées | ⚠️ six domaines codés en dur ; **onze chez DPE WIN** |
| 6 | Toutes les lignes d'anomalies lues | ❌ non mesuré — aucun compteur §33 |
| 7 | Toutes les références récupérées | ⚠️ `code` optionnel, **absent chez LICIEL** |
| 8 | Tous les libellés conservés | ✅ |
| 9 | Toutes les localisations récupérées | ❌ une seule par anomalie |
| 10 | Pluralité respectée | ❌ aucun champ |
| 11 | Aucune anomalie diluée | ❌ non mesuré |
| 12 | Mesures compensatoires recherchées | ⚠️ détectées, au niveau du domaine |
| 13 | Chaque mesure rattachée à son anomalie | ❌ **impossible dans le modèle** |
| 14 | Aucune anomalie compensée supprimée | ✅ le code dit les deux, à raison |
| 15 | Compensé jamais présenté comme réparé | ✅ le libellé actuel dit « limite le risque » |
| 16 | Appareil général analysé | ⚠️ comme domaine, sans carte |
| 17 | Protection différentielle analysée | ⚠️ idem |
| 18 | Mise à la terre analysée | ⚠️ idem — le §21 demande une carte propre |
| 19 | Surintensités analysées | ⚠️ idem |
| 20 | Salle d'eau analysée | ❌ aucun traitement distinct — le §22 l'exige |
| 21 | Contacts directs analysés | ⚠️ comme domaine |
| 22 | Matériels vétustes analysés | ⚠️ comme domaine |
| 23 | Conducteurs analysés | ⚠️ comme domaine |
| 24 | Installations particulières recherchées | ❌ P1/P2/P3 hors des six domaines codés |
| 25 | Constatations diverses lues | ❌ **jamais extraites** — §16 les dit prioritaires |
| 26 | Points non vérifiés identifiés | ✅ `pointsNonVerifies` |
| 27 | Limites de l'examen identifiées | ❌ |
| 28 | Photos reliées | ❌ |
| 29 | Synthèse comparée aux anomalies | ⚠️ un cas traité (conclusion muette) |
| 30 | Contradictions recherchées | ❌ pas de moteur §32 |
| 31 | Sources conservées | ❌ pas d'ancre page |
| 32 | Aucune donnée inventée | ✅ discipline tenue |
| 33 | Aucune gravité inventée | ✅ |
| 34 | Aucune conformité inventée | ✅ |
| 35 | Deuxième lecture réalisée | ❌ pas de seconde passe §34 |
| 36 | Restitution par pièce | ❌ |
| 37 | Restitution par thème | ⚠️ par domaine, sans navigation |
| 38 | Format application respecté | ❌ les 14 cartes du §30 n'existent pas |
| 39 | Explication pour non-électricien | ⚠️ une phrase de verdict, pas de plume par anomalie |

**8 cases tenues, 14 partielles, 17 manquantes.** Dossier non terminé, au sens
du §36.

## L'ordre des travaux qui en découle

Il n'est pas discutable : le modèle commande tout le reste.

1. **Refaire l'objet anomalie** aux neuf champs du §8, avec `localisations: string[]`,
   `pluralite`, et une `mesureCompensatoire` **portée par l'anomalie** — libellé
   compris, pas un booléen. Sans quoi §9, §10, §13 et §14 restent hors d'atteinte.
2. **Compteurs du §33** : lignes détectées contre lignes structurées, et le
   blocage du §32 quand les deux divergent.
3. **Extraire ce qui n'est jamais lu** : constatations diverses (§16), limites
   de l'examen (§19), installation alimentée ou non (§18), installations
   particulières P1/P2/P3.
4. **Onze domaines, pas six** — et lus par libellé, jamais par rang.
5. **Les cartes du §30**, salle d'eau et mise à la terre d'abord (§21, §22).
6. **La plume par anomalie** (§25) et la restitution par pièce (§26).

## Ce que la lecture des trois volets ajoute au cahier des charges

Le chapitre ÉLECTRICITÉ de [OU-PARSER.md](OU-PARSER.md) tient les endroits.
Trois d'entre eux commandent l'extraction :

- **Chez LICIEL, la conclusion ne se lit pas dans la rubrique 5** : les deux
  phrases opposées y sont imprimées. Le verdict est dans la première colonne du
  tableau d'anomalies.
- **Chez AnalysImmo, l'annexe 3 réécrit toutes les anomalies en clé-valeur à
  plat** — c'est la forme la plus simple du corpus, et elle porte la
  localisation et l'observation.
- **Les `B11` ne sont pas des anomalies** : ce sont des informations
  complémentaires, souvent favorables. Les compter serait la faute que le §2
  interdit.
