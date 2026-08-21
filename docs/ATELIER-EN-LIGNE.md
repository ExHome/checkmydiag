# Mettre Verrière sur son domaine, et l'atelier derrière un portail

*Décisions d'Aude, 21/08/2026 : le site en construction ; l'atelier accessible
à elle seule ; et — « pourquoi localhost, je veux verriere-diag » — sur son
domaine, pas sur une adresse d'attente.*

---

## L'état réel, mesuré le 21/08

| | |
|---|---|
| `verriere-diag.fr` pointe vers | **213.186.33.5** — une IP OVH, page de parking |
| Le domaine est géré par | **OVH** (`ns106.ovh.net`, `dns106.ovh.net`) |
| En HTTPS | **ne répond pas** — redirection vers `www.` en clair |
| Le site de Verrière est sur | `exhome.github.io/checkmydiag` (page de chantier) |

**Le domaine et le site ne se connaissent pas.** Rien ne les relie : c'est
pour ça que l'atelier s'ouvre aujourd'hui sur `localhost`. Il n'y a pas d'autre
raison — l'atelier lui-même est prêt.

---

## Ce qui est prêt côté dépôt

```bash
npm run build     # le site public — dist/, sans une ligne d'atelier
npm run atelier   # la version d'Aude — dist-atelier/, avec l'atelier
```

Vérifié aux deux builds : `dist/` ne contient aucune trace d'atelier,
`dist-atelier/` contient `assets/AtelierDeTravail-*.js`. Le mode `atelier`
lit `.env.atelier` ; un `npm run build` ordinaire ne le voit jamais, et ne peut
donc pas embarquer l'atelier par accident. Un test
(`src/lib/atelier/hors-bundle.test.ts`) échoue si un import statique revient.

---

## Le chemin recommandé : déléguer le domaine à Cloudflare

Pourquoi Cloudflare plutôt qu'OVH ou GitHub Pages : **c'est le seul des trois
qui sache refuser une requête avant de servir le fichier.** GitHub Pages en
offre gratuite n'a aucun contrôle d'accès, et un mot de passe dans une page
statique n'en est pas un. Un portail Cloudflare Access est gratuit à ce volume
et demande une authentification par e-mail avant que le fichier ne parte.

Le résultat visé :

| Adresse | Ce qu'elle sert | Qui y accède |
|---|---|---|
| `verriere-diag.fr` | la page de chantier, puis le produit | tout le monde |
| `atelier.verriere-diag.fr` | l'atelier de travail | **Aude seule** |

### Les quatre gestes — ils demandent tes comptes, donc ils te reviennent

**1. Déléguer le domaine.** Sur `dash.cloudflare.com` → *Add a site* →
`verriere-diag.fr` → offre *Free*. Cloudflare importe les enregistrements
existants et affiche **deux serveurs de noms** (du type `xxx.ns.cloudflare.com`).
Les reporter chez OVH : espace client → *Domaines* → `verriere-diag.fr` →
onglet *Serveurs DNS* → remplacer `ns106.ovh.net` / `dns106.ovh.net` par les
deux de Cloudflare. La bascule prend de quelques minutes à quelques heures.

**2. Publier le site.** *Workers & Pages* → *Create* → *Pages* → *Upload
assets*, projet `verriere`. Y déposer le dossier assemblé de la page de
chantier (`chantier/index.html` + `public/logo/`). Puis *Custom domains* →
`verriere-diag.fr`.

**3. Publier l'atelier.** Même chemin, projet `atelier-verriere`, en déposant
`dist-atelier/` (produit par `npm run atelier`). Puis *Custom domains* →
`atelier.verriere-diag.fr`.

⚠️ **Entre ce geste et le suivant, l'atelier est en ligne sans protection.**
Enchaîner immédiatement, ou poser la règle d'accès avant de déposer les
fichiers.

**4. Poser le portail.** *Zero Trust* → *Access* → *Applications* → *Add an
application* → *Self-hosted*, sur `atelier.verriere-diag.fr`. Règle :
*Allow* → *Emails* → ton adresse, et elle seule. Cloudflare enverra un code à
usage unique à chaque connexion.

**Puis vérifier**, en navigation privée : `atelier.verriere-diag.fr` doit
demander une authentification. S'il affiche l'atelier, la règle n'est pas
active — ne rien y laisser tant que ce n'est pas corrigé.

---

## Brancher le pont

Claude ne répond que si le pont tourne sur ton poste — c'est le prix de la clé
qui ne sort jamais. Lui dire l'adresse de l'atelier au lancement :

```bash
set PONT_ATELIER=https://atelier.verriere-diag.fr
node scripts/pont-claude.mjs
```

Depuis un autre appareil, l'atelier s'ouvre et le carnet fonctionne, **mais
Claude y est absent** : le pont n'y est pas.

---

## Si tu préfères ne pas toucher aux serveurs de noms

Deux replis, moins bons mais réels :

- **L'atelier sur `atelier-verriere.pages.dev`** (l'adresse que Cloudflare
  fournit d'office), protégé par Access. Ce n'est pas ton domaine, mais c'est
  protégé et ça ne demande aucun changement DNS.
- **Le site sur `verriere-diag.fr` via GitHub Pages** : chez OVH, quatre
  enregistrements A vers `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`,
  un CNAME `www` → `exhome.github.io`, et un fichier `CNAME` ajouté au
  déploiement. **Mais alors l'atelier ne peut pas y vivre** : GitHub Pages ne
  sait pas refuser une requête.

---

## Ce qui reste vrai

Le site publié ne contient que la page de chantier : l'application n'est pas
construite, son code n'est pas déployé, `assets/` et `sitemap.xml` répondent
404. La page porte `noindex` — à retirer le jour de l'ouverture, en rétablissant
`npm run build` et `path: dist` dans `.github/workflows/pages.yml`. Le
référencement acquis se reconstruit ; il ne se retrouve pas d'un clic.
