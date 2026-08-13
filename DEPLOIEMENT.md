# Mettre Check My Diag en ligne

Il n'y a rien à faire d'autre que pousser sur `main`.

```
git push origin main
```

Le workflow **Déploiement GitHub Pages** se déclenche seul, construit le site et
le publie sur **https://exhome.github.io/checkmydiag/**. Compter un peu plus
d'une minute. On vérifie l'état avec `gh run list --limit 1`.

Après publication, le navigateur sert souvent l'ancien fichier : ajouter
`?v=<n'importe quoi>` à l'URL force le rechargement, sinon on croit à tort que
le déploiement n'est pas passé.

## Le dépôt

`github.com/ExHome/checkmydiag`, compte **ExHome**, et lui seul. Pas de second
dépôt, pas de publication ailleurs, pas de sous-dossier d'un autre site.

## Le piège des identifiants

Le `.gitconfig` de la machine déclare, pour `github.com`, un helper vide suivi
de `gh auth git-credential`. Le helper vide efface la chaîne héritée : le
gestionnaire d'identifiants Windows — celui qui porte **ExHome** — est écarté, et
c'est `gh` qui répond. Or `gh` est connecté en **Vnigma-dev**, qui n'a que la
lecture sur ce dépôt. D'où un `403 denied to Vnigma-dev` au moment de pousser.

La configuration locale de ce dépôt rétablit la bonne chaîne :

```
[credential "https://github.com"]
	helper =
	helper = manager
```

Elle est déjà en place (`.git/config`), ne s'exporte pas avec le dépôt, et ne
change rien pour les autres projets qui continuent d'utiliser `gh`. Si un clone
neuf refuse de pousser, c'est cette configuration qu'il faut refaire :

```
git config --local --replace-all credential."https://github.com".helper ""
git config --local --add credential."https://github.com".helper "manager"
```

## Le `base` de Vite

Il vaut `'./'` — des chemins relatifs, indispensables sur un sous-dossier GitHub
Pages. Ne pas le repasser à `'/'` : scripts, styles, worker pdf.js, polices et
pages « pour les nuls » cesseraient tous de se charger.
