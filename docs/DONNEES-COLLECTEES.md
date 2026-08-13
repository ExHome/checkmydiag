# Ce que CheckMyDiag conserve

Arbitrage rendu le 13/08/2026 : **les données lues sont conservées, le document
ne l'est pas.**

> ⚠️ **Pas encore en vigueur.** Aucun envoi n'existe à ce jour. Tant que c'est
> le cas, l'interface continue de dire que rien n'est envoyé : on n'annonce pas
> une collecte qui n'a pas lieu. Ce document décrit ce qui partira, et sert de
> référence au test qui l'applique (`src/lib/mesure.test.ts`).

## La règle

Ce qui part est une **liste fermée**. Un champ qui ne figure pas ci-dessous ne
part pas — et le test échoue si le code en ajoute un.

C'est l'inverse de l'habitude : on ne retire pas ce qui est sensible d'un objet
complet, on construit un objet vide auquel on ajoute ce qui est autorisé. Un
oubli donne alors une donnée manquante, jamais une fuite.

## Ce qui part

| Champ | Exemple | Pourquoi |
| --- | --- | --- |
| `codePostal` | `33000` | La zone. C'est l'unité de vente de l'annuaire et la maille du compteur d'audience. |
| `quand` | `2026-08` | Le mois, pas la date. Suffit à l'historique glissant, ne permet pas de recouper avec une vente. |
| `typeBien` | `appartement` | Statistiques par type de logement. |
| `anneeConstruction` | `1949-1974` | Par tranche, jamais l'année exacte : l'année exacte plus la commune restreint déjà beaucoup. |
| `diagnostics[]` | `dpe:F`, `electricite:attention` | Le type et la gravité. C'est la matière des statistiques publiables et des déclencheurs de métier. |
| `controles[]` | `manque:electricite` | Ce qui manque au dossier. Mesure la qualité des dossiers du marché. |
| `confiance` | `0.82` | Part des champs lus avec certitude. Sert à surveiller le moteur, pas le logement. |

## Ce qui ne part jamais

- **le PDF**, sous aucune forme, même partielle, même chiffrée ;
- **le nom** du propriétaire, du locataire, de l'acquéreur ;
- **l'adresse exacte**, le numéro de voie, les références cadastrales ;
- **le numéro de dossier** du diagnostiqueur et le **numéro ADEME** : ils
  identifient le logement de façon certaine, et le second ouvre la base
  publique ;
- **le nom du cabinet** qui a établi le rapport ;
- **la date exacte** d'un diagnostic ;
- toute **surface**, tout **montant** : combinés à la commune, ils désignent un
  bien.

## Pourquoi ce niveau, et pas un autre

Le brief a besoin d'un compteur d'audience par zone (« 31 dossiers analysés ici
en septembre ») et de statistiques agrégées publiables (part des installations
électriques en anomalie, répartition des classes par commune). Les champs
ci-dessus y suffisent.

Ils ne suffisent pas à recontacter quelqu'un, ni à savoir quel bien a été
consulté — et c'est voulu. Le brief le dit lui-même : la partie la plus
sensible du dataset n'est pas la donnée technique, déjà publique via l'ADEME,
c'est **le signal d'intention** — quelqu'un consulte le diagnostic de tel bien
à tel moment. Une maille au code postal et au mois casse ce signal tout en
gardant la valeur statistique.

## Ce que cela impose avant le premier envoi

Rien de ceci n'est optionnel, et rien ne se rattrape après coup : une finalité
non annoncée à la collecte ne peut pas être régularisée plus tard.

1. **Informer avant le dépôt**, en une phrase lisible, à l'endroit où l'on
   dépose — pas dans une page de mentions légales.
2. **Base légale et finalité écrites** avant la première ligne collectée. Si la
   revente de données agrégées est envisagée un jour, elle doit être annoncée
   **dès maintenant** et faire l'objet d'un consentement distinct.
3. **Durée de conservation** définie, et purge automatique qui l'applique.
4. **Hébergement dans l'Union européenne.**
5. **Registre de traitement** et liste des sous-traitants.
6. Le texte de l'accueil change **le jour où l'envoi est branché**, pas avant.
   « Rien n'est envoyé » devient « Votre document reste sur votre appareil.
   Nous conservons seulement ce qui a été lu, sans votre nom ni votre
   adresse. »
