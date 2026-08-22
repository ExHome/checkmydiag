# Ce que le visuel de référence apporte — et ce qu'il ne faut surtout pas en copier

*Lecture du 22/08/2026 de `01_VISUEL_REFERENCE_ELECTRICITE.png` (le fichier reste
en Dropbox : c'est une maquette).*

Le pack pose lui-même la règle, en tête de son README :

> Les chiffres, codes, articles, catégories, niveaux de risque et pourcentages
> visibles sur l'image sont **fictifs** et ne doivent jamais être codés comme
> valeurs par défaut.

Elle n'est pas de trop. **Le visuel contredit l'ordre de mission qui
l'accompagne sur quatre points**, et chacun est nommément interdit ailleurs dans
le même pack. Les reproduire créerait exactement la conformité inventée que tout
le reste interdit.

## Les quatre pièges du visuel

| Ce que la maquette affiche | Ce que le pack interdit, en toutes lettres |
|---|---|
| « Installation électrique **non conforme** » et « Installation non conforme à la **norme NF C 15-100** » | § 4 : « Ne jamais écrire *installation conforme à la NF C 15-100* ou *non conforme à la NF C 15-100* si cette conclusion n'existe pas dans la source et n'est pas juridiquement fondée par le diagnostic. » Un état de l'installation n'est pas une attestation de conformité à une norme d'installation neuve. |
| « NIVEAU DE RISQUE : **RISQUE MODÉRÉ** » | § 4 : « En l'absence de règle validée, afficher les anomalies **sans inventer de score ni de niveau de danger**. » |
| Trois catégories — **à risque (2) · importantes (5) · à améliorer (5)** | § 3 : « Ne jamais reclasser arbitrairement une anomalie en *critique*, *importante*, *modérée* ou *à améliorer* sans règle métier validée. » |
| « NIVEAU DE CONFIANCE : **80 %** » | Règle cardinale du README : les pourcentages de l'image sont fictifs. Un taux de confiance affiché sans méthode de calcul documentée est un chiffre inventé. |

S'y ajoutent les **« Art. 531.3.1 »** en marge des anomalies : ce sont des
articles de la NF C 15-100, alors que le diagnostic référence le FD C16-600
(« B7.3 a »). Le pack le dit : « les codes et numéros figurant sur le visuel ne
sont pas des références réglementaires à reproduire automatiquement ».

## Ce que le visuel apporte, et qu'il faut prendre

L'architecture, bloc par bloc — c'est elle, la vraie valeur de l'image :

1. **Résultat global** — un énoncé factuel, sur fond vert profond.
2. **Points clés** — 3 à 5 lignes, picto + titre court + une phrase.
3. **Résultat global détaillé** — les comptes, avec deux catégories que le
   produit n'a pas : **points de contrôle conformes** et **non applicable /
   non vérifié**.
4. **Ce qui a été contrôlé** — la liste des domaines, chacun avec son statut.
5. **Constatations diverses** — en puces, repliable.
6. **Les anomalies**, groupées, chacune avec sa référence en marge.
7. **Ce qui n'a pas été contrôlé** — combles, sous-sol, coffrets scellés,
   parties non visibles, dépendances — chacun avec son motif.
8. **Conseil Verrière**.
9. **Voir le rapport complet** — l'accès à la source.
10. Une barre basse : **Synthèse · Détails · Photos · Conseils**.

Et l'identité : l'éclair jaune sur le vert profond et l'ivoire de la charte, le
jaune employé comme repère et non comme alarme.

## Ce que cela change pour ce qui est déjà construit

L'application a le bloc 6, et lui seul. Les blocs 3, 4, 7 et 10 n'existent pas ;
les blocs 1, 2, 8 et 9 non plus.

**Mais le bloc 6 est le seul que le visuel ne sait pas faire correctement** : il
y groupe les anomalies par gravité inventée. La carte d'anomalie du produit, qui
cite le rapport et déclare ses silences, est plus juste que la maquette sur ce
point précis. On garde donc le fond et on prend la forme — jamais l'inverse.
