# ORDRE DE MISSION — MINI-APP AMIANTE

*Reçu d'Aude le 22/08/2026, pack `VERRIERE_AMIANTE_PACK_CLAUDE.zip` (Dropbox,
`BACK OFFICE/VERRIERE`). Le pack contient le visuel de référence, cet ordre et
un prompt court. **Les données du mockup sont illustratives : aucune ne doit
devenir une valeur par défaut.***

---


## 1. Référence impérative

- Utiliser le visuel joint comme référence de direction artistique et d'architecture.
- Conserver l'univers Verrière : ivoire chaud, vert profond, beige/sable, relief subtil, typographie éditoriale premium et excellente lisibilité mobile.
- Les textes et valeurs du mockup sont illustratifs : aucune donnée fictive ne doit devenir une valeur par défaut.

## 2. Architecture obligatoire de la synthèse

**POINTS CLÉS** : conclusion principale, présence/absence de matériaux ou produits contenant de l'amiante (MPCA), éléments nécessitant une attention et accès au détail.
**RÉSULTAT GLOBAL** : conclusion fidèle au périmètre réellement examiné. Ne jamais extrapoler aux zones non visitées.
**ÉLÉMENTS / MATÉRIAUX CONTRÔLÉS** : restituer les composants, zones, locaux ou matériaux réellement examinés et leur résultat lorsque le rapport le permet.
**CONSTATATIONS DIVERSES** : restituer les observations complémentaires du diagnostiqueur, état apparent, dégradations, accessibilité, réserves, poussières, travaux ou autres remarques réellement présentes.
**CE QUI N'A PAS ÉTÉ CONTRÔLÉ** : lister toutes les zones, composants ou matériaux non visités, non accessibles, masqués, recouverts, non démontables ou hors périmètre signalés dans le rapport, avec la raison lorsqu'elle est disponible.
**COMPLÉTUDE / CONFIANCE** : ne jamais afficher arbitrairement « 90 % ». Un pourcentage n'est permis que si une règle métier validée existe ; sinon employer une formulation factuelle.
**CONSEIL VERRIÈRE** : conseils contextualisés après les faits, sans contredire le rapport ni créer de fausse garantie.
**ACCÈS** : prévoir Synthèse, Détails, Photos, Conseils et Voir le rapport complet.

## 3. Cas où de l'amiante est repéré

- La mini-app doit être aussi aboutie pour un diagnostic positif que pour un diagnostic négatif.
- Pour chaque MPCA : afficher la désignation extraite, la localisation, le résultat, l'état/score/évaluation lorsqu'il existe et les suites prévues par le rapport.
- Faire ressortir les matériaux dégradés ou nécessitant une action sans dramatisation.
- Relier les prélèvements et analyses laboratoire aux matériaux concernés lorsque le rapport le permet.
- Séparer clairement constat, obligation, recommandation et explication pédagogique.

## 4. Ce qui n'a pas été contrôlé — règle critique

- Une zone non contrôlée ne doit JAMAIS être présentée comme saine ou exempte d'amiante.
- Employer un statut fidèle : Non contrôlé, Non accessible, Non visible, Hors périmètre ou formulation issue du rapport.
- Afficher la cause : doublage, revêtement, absence d'accès, encombrement, élément non démontable, sécurité, etc., uniquement lorsqu'elle est connue.
- Les limites du repérage doivent rester visibles et compréhensibles par un particulier.

## 5. Constatations diverses

- Le bloc doit apparaître dès que le rapport contient des observations utiles qui ne rentrent pas dans le résultat principal.
- Ne jamais supprimer une observation parce qu'elle paraît secondaire.
- Reformuler pour rendre compréhensible, mais conserver le sens exact et permettre l'accès à la formulation source.

## 6. Règle absolue de données

**INTERDICTION D'INVENTER** : chaque donnée visible doit provenir du rapport ou d'une règle métier explicitement validée.
- Si une donnée manque : masquer le champ ou afficher Non renseigné selon la règle UX.
- Si l'extraction est incertaine ou contradictoire : signaler l'incertitude au lieu de choisir arbitrairement.
- Chaque information importante doit pouvoir remonter à sa page, rubrique, tableau ou extrait source.
- La pédagogie ne doit jamais modifier la portée technique ou les limites du diagnostic.

## 7. États métier à prévoir

- Aucun MPCA repéré dans le périmètre contrôlé.
- Un ou plusieurs MPCA repérés.
- Matériau avec état de conservation ou évaluation nécessitant une suite.
- Prélèvement/analyse laboratoire présent.
- Zones ou composants non accessibles/non contrôlés.
- Constatations diverses présentes.
- Rapport incomplet ou page manquante.
- Extraction incertaine ou information contradictoire.
- Donnée non renseignée.

## 8. Ordre d'exécution Claude


## 1. Reproduire et perfectionner l'architecture du visuel de référence.


## 2. Brancher chaque bloc sur les données réellement extraites.

3. Ajouter systématiquement Constatations diverses lorsqu'elles existent.
4. Ajouter systématiquement Ce qui n'a pas été contrôlé lorsqu'une limite existe.
5. Prévoir tous les scénarios positifs, négatifs, incomplets et incertains.

## 6. Rendre les données importantes traçables vers la source.


## 7. Tester sur plusieurs rapports Amiante réellement différents.

8. Contrôler mobile, desktop, densité, lisibilité et absence de troncature.
9. Effectuer une revue de non-régression métier et graphique avant livraison.
10. Ne pas considérer l'écran terminé parce qu'il est beau : il doit être exact, exhaustif, pédagogique et fiable.

## 9. Critères de validation

- [ ] Résultat global fidèle au rapport.
- [ ] Aucun contenu inventé.
- [ ] MPCA et localisations correctement restitués lorsqu'ils existent.
- [ ] Constatations diverses présentes lorsqu'elles existent.
- [ ] Toutes les limites et zones non contrôlées visibles.
- [ ] Aucune zone non contrôlée présentée comme exempte.
- [ ] État/évaluation et suites correctement restitués lorsqu'applicables.
- [ ] Traçabilité vers la source.
- [ ] Design Verrière respecté.
- [ ] Lecture mobile impeccable.
- [ ] Cas positif et cas négatif testés.

---

## Ce que la lecture du corpus impose en plus

*130 volets amiante lus les 21 et 22/08 — carte : [`OU-PARSER-AMIANTE.md`](OU-PARSER-AMIANTE.md).
Ces points ne contredisent pas l'ordre : ils disent avec quelles données il se
tient.*

### Le « RÉSULTAT GLOBAL » a TROIS issues, pas deux

Présence · absence · **non conclu**. Le troisième état existe chez les deux
éditeurs lus, sous neuf formulations chez LICIEL et deux chez BC2E :
`PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE`, `pour lesquels des sondages et/ou
prélèvements doivent être effectués`, `pour lesquels les résultats d'analyse
sont attendus`.

**Un rapport qui ne conclut pas ne peut pas afficher « Aucun matériau contenant
de l'amiante repéré ».** C'est la même règle que « une zone non contrôlée n'est
jamais présentée comme saine », appliquée au résultat global lui-même. Mesuré :
sur les 18 volets qui ne sont pas un simple négatif, **près de quatre sur dix ne
tranchent pas**.

### Le lecteur dépend de l'éditeur

Contrainte absolue du 21/08 —
[`ODM-LECTEURS-PAR-EDITEUR.md`](ODM-LECTEURS-PAR-EDITEUR.md). L'écran se branche
sur le lecteur de l'éditeur, jamais sur un lecteur unique. Chez LICIEL la
conclusion vit au § 1 page 2 ; chez BC2E, dans le bloc `A` de la page 1.

### « ÉLÉMENTS / MATÉRIAUX CONTRÔLÉS » ne se déduit pas d'un tableau

⚠️ Le § 5.0.2 de LICIEL liste ce qui a été **regardé**, et sa colonne de
conclusion porte aussi bien `Présence d'amiante` que `Absence d'amiante` ou
`Matériau ou produit qui par nature ne contient pas d'amiante`. Compter ses
lignes, c'est annoncer de l'amiante à un logement qui n'en a pas. Et le même
matériau y est recompté au § 5.3.

### « COMPLÉTUDE / CONFIANCE » : pourquoi aucun pourcentage n'est permis

L'ordre l'interdit déjà. La lecture dit pourquoi il n'existe **aucune** règle
qui le permettrait aujourd'hui : le nombre de zones non contrôlées n'est pas
comparable d'un rapport à l'autre — la ligne « Ensemble du bien » est tantôt une
clause de style de six lignes, tantôt trois observations réelles. Un compte de
lignes ne mesure donc rien.

**Ce qui se dit à la place, et qui est vrai** : ce que le rapport déclare
lui-même. `Pagination : le présent rapport […] est constitué de N pages` permet
de dire qu'il manque des pages ; la rubrique des non-visités permet de dire
combien de locaux n'ont pas été ouverts, **et lesquels**.

### Ce que l'écran doit pouvoir dire, et que le mockup ne montre pas

| État | Ce qui doit s'afficher |
|---|---|
| Prélèvements en cours d'analyse | « le rapport ne conclut pas encore » — jamais un résultat |
| Matériau en liste A, `Score 3` | l'obligation de travaux, sous 36 mois, et l'information du préfet |
| Absence prouvée par analyse | « analysé, sans amiante » — plus fort qu'un jugement, et le dire |
| Présence `sur anciennes analyses` | la preuve est une pièce **que le rapport ne joint pas** |
| Rapport sans texte extractible | « je n'ai pas pu lire ce document » — 14 cas dans le corpus |
| Éditeur non couvert | le repli se déclare, il ne se fait jamais en silence |

---

## Ce qui a été MESURÉ, le 22/08/2026

*§ 8.7 de l'ordre : « tester sur plusieurs rapports Amiante réellement
différents ». La chaîne entière — PDF → découpe → lecteur d'éditeur → écran —
passée sur douze volets amiante tirés du corpus DGLM, un DDT sur 133.*

| | avant | après |
|---|---|---|
| périmètre § 3.2.6 lu | — | **11 / 12** volets, 61 pièces |
| bloc « Éléments contrôlés » rempli | 0 | **11 / 12** |
| bloc « Ce qui n'a pas été contrôlé » **avec ses entrées** | **0 / 12** | **5 / 12** |
| contradictions détectées | — | **0** |
| pieds de page pris pour des pièces | — | **0** |

### Les deux défauts que la mesure a trouvés

**1. Le § 1.2 perdait ses lignes en silence.** Le lecteur n'acceptait une ligne
du tableau des locaux non visités que si elle portait deux espaces consécutifs
ou le mot `Toutes`. Un constat réel dont le § 1.2 dit

```
1er étage - Entrée, 1er étage - Séjour  Sous faces des planchers  non démontable
1er étage - Entrée, 1er étage - Séjour  Plancher sous moquette collée  non démontable
```

rendait **zéro entrée** : l'extraction avait ramené les colonnes à un espace
simple. Les deux seules limites du rapport tombaient — dans le bloc qui existe
pour les dire, et sur un rapport qui imprime juste en dessous que « les
obligations réglementaires du (des) propriétaire(s) […] ne sont pas remplies ».
La signature manquante est **positive** : une ligne de ce tableau commence par
une localisation, `<niveau> - <local>`, la même forme qu'au § 3.2.6.

**2. La carte de complétude affichait 100 % sur presque tout le corpus.** Le
dénominateur valait `pièces examinées + locaux non visités` ; le second terme
étant toujours nul à cause du défaut ci-dessus, la carte annonçait « toutes les
pièces ont été examinées, le rapport ne signale aucun local resté fermé » — y
compris sur le constat des deux planchers non sondés. Un dénominateur amputé ne
donne pas un chiffre approximatif : **il donne toujours 100 %.** Le calcul est
désormais interdit tant que la rubrique des non-visités n'a pas été LUE
(`Bloc.lue`), et trois états sont distingués partout : non lue · lue et
« Néant » · lue et remplie.

### Ce qui reste ouvert

- **Le périmètre n'est pas lu chez BC2E.** Le repli se déclare (`lue: false`),
  le bloc se masque au lieu d'affirmer un périmètre vide. La carte renvoie aux
  § 4.1 / 4.2 / 4.3, dont la disposition n'a pas encore été sondée.
- **Le niveau de risque et le pourcentage sont des règles à valider par Aude.**
  Ils ne sont pas recopiés du mockup : ils se calculent (`visuel.ts`), et chaque
  règle est écrite. L'ordre § 2 n'autorise un pourcentage que « si une règle
  métier validée existe » — la règle existe et se vérifie ligne à ligne, sa
  validation appartient à Aude.
