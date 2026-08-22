# Ordre général — comment les sessions se partagent le dépôt

*Posé par la session **architecte** le 22/08/2026, sur ordre d'Aude
(« tu gères toutes les branches, tu peux donner des ordres généraux »).*

**Cet ordre s'adresse à toutes les sessions de Verrière, quel que soit leur
volet.** Il ne change rien à ce que chacune produit ; il change seulement
l'endroit où elle l'écrit.

---

## Le défaut qu'on corrige

Aujourd'hui, toutes les sessions travaillent dans **une seule copie** du dépôt,
`dev/checkmydiag`, sur **une seule branche**, `main`, avec **un seul**
`.git/index`.

Trois conséquences déjà vécues, toutes le 22/08 :

1. **Un commit emporte le travail indexé d'une autre session.** `.git/index` est
   un fichier unique. Deux sessions qui indexent écrivent dans le même panier ;
   la première qui committe emporte tout. Une mini-app entière est ainsi partie
   dans un commit intitulé « Le module dit *sable* là où il disait *or* », son
   propre message de commit jeté.
2. **`git add <fichier partagé>` emporte les modifications en cours des
   autres.** Rien n'est perdu, mais l'attribution devient fausse.
3. **La suite de tests devient illisible.** Le 22/08 à 14 h 53, quatre tests
   électricité ressortaient rouges — sur un fichier de test réécrit *pendant*
   l'exécution. Personne ne peut distinguer une panne d'un instantané.

Aucune de ces trois choses n'est une faute de session. Ce sont des
**conséquences mécaniques du partage d'une copie de travail**, et elles se
reproduiront tant que la copie sera partagée.

---

## La règle : un worktree par session

Git sait donner à chaque session **sa propre copie des fichiers et son propre
index**, tout en partageant un seul historique. C'est `git worktree`.

### Quand une session démarre sur un volet

```bash
cd /c/Users/degen/dev/checkmydiag
git worktree add ../verriere-<volet> -b session/<volet>
cd ../verriere-<volet>
```

Puis on travaille normalement dans `../verriere-<volet>`. `npm install` y est à
refaire une fois.

### Quand le volet est prêt

```bash
npm test                       # vert AVANT d'indexer, jamais entre add et commit
git add -A && git commit -m "…"
git switch main && git merge session/<volet> && git push
```

### Ce qu'on y gagne

- Un `git commit` n'emporte **que** ses propres fichiers : l'index n'est plus
  partagé.
- `npm test` mesure **un arbre stable** : plus de rouge fantôme.
- L'historique attribue chaque changement au volet qui l'a écrit.

---

## ⚠️ La migration ne se fait pas sur un travail en cours

Un `git worktree add` crée une copie **propre**, depuis un commit. Les
modifications non commitées restent dans la copie principale.

**Donc : une session qui a du travail non commité ne migre pas tout de suite.**
Elle finit son lot, elle committe, *puis* elle bascule. Migrer avant, c'est
laisser son travail derrière soi.

Au 22/08 à 15 h, trois sessions sont dans ce cas — amiante, électricité, gaz —
pour 698 lignes.

---

## En attendant que tout le monde soit migré

Ces trois règles restent en vigueur dans la copie partagée :

1. **Tester d'abord, indexer et committer ensuite, dans la même commande.**
   Jamais de `npm test` de quinze secondes entre `git add` et `git commit`.
2. **Avant `git add` d'un fichier qu'on n'a pas créé**, lire `git diff <fichier>`
   et savoir ce qui n'est pas de soi. Si c'est gros, attendre ou le dire dans le
   message de commit.
3. **Après un `git commit` qui répond « nothing to commit », ne pas refaire le
   travail** : le chercher d'abord dans les commits récents,
   `git log --oneline -6 --name-only -- <dossier>`.

---

## ⚠️ Le fichier non suivi est le seul vrai risque de perte

Un fichier modifié mais non commité est encore rattrapable : git le voit. Un
fichier **jamais ajouté** n'existe que sur le disque.

Au 22/08 à 15 h, `src/composants/gaz/` — cinq fichiers dont `MiniAppGaz.svelte`,
déjà branchée dans `Diagnostics.svelte` — est dans ce cas. Une copie de
sauvegarde a été posée hors dépôt par l'architecte :
`dev/backups-exhome/verriere-gaz-non-suivi-2026-08-22/`.

**La session gaz reste seule propriétaire de ce commit.** L'architecte
sauvegarde, il ne committe pas à la place d'un volet.

---

## Ce que l'architecte fait, et ne fait pas

| Il fait | Il ne fait pas |
|---|---|
| Mesurer l'état réel dans le dépôt | Croire un document qui raconte l'état |
| Trancher les défauts transverses que personne ne possède | Patcher un fichier qu'une session est en train d'écrire |
| Signaler un test rouge à la session qui tient le volet | Corriger le volet d'un autre |
| Sauvegarder un travail en danger | Le committer à la place de son auteur |

La règle « un volet par session » reste entière pour les sessions ouvrières.
Elle ne borne pas l'architecte, dont le travail est exactement le transverse
qu'elle laisse sans propriétaire.
