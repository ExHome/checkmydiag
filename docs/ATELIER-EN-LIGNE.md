# Mettre l'atelier en ligne, pour Aude et personne d'autre

*Décision du 21/08/2026 : « je veux que le site soit en off pour le moment et
que seulement moi y aie accès, il ne doit pas être visible » — puis, sur le
moyen : l'atelier en ligne, derrière un vrai portail d'accès.*

---

## Ce qui est déjà fait, et ce qui reste à faire

| | État |
|---|---|
| L'atelier est **absent du bundle public** | ✅ fait, prouvé au build, tenu par un test |
| La **publication automatique** est désarmée | ✅ fait — plus rien ne monte sur un push |
| Le pont accepte l'adresse de l'atelier privé | ✅ fait — variable `PONT_ATELIER` |
| Créer le projet Cloudflare Pages | ⬜ **à faire par Aude** |
| Poser le portail Cloudflare Access | ⬜ **à faire par Aude** |

---

## Pourquoi un portail, et pas un mot de passe

Le site est **statique** : tout ce qu'il contient est téléchargé par le
navigateur avant qu'une seule ligne ne s'exécute. Un mot de passe vérifié dans
la page se lit donc dans le code, et le contenu qu'il « protège » est déjà là.
Ce n'est pas une sécurité faible : ce n'en est pas une.

La protection réelle tient en deux temps, et les deux sont posés :

1. **L'atelier n'est pas dans le site public.** `npm run build` ne le compile
   pas. Il n'y a rien à trouver, même en lisant le code livré.
2. **L'atelier privé est derrière une authentification**, faite par
   l'hébergeur, **avant** que le fichier ne soit servi. C'est Cloudflare Access
   qui refuse la requête, pas une page qui demande poliment.

---

## Les deux builds

```bash
npm run build                 # le produit — aucune ligne d'atelier
VITE_ATELIER=1 npm run build  # la version d'Aude — à mettre derrière le portail
```

Mesuré : le premier ne laisse aucune trace d'atelier dans `dist/`, le second y
ajoute `assets/AtelierDeTravail-*.js`. Un test
(`src/lib/atelier/hors-bundle.test.ts`) échoue si quelqu'un ramène un import
statique — ce qui rendrait l'atelier public au premier déploiement, sans que
rien ne le signale.

---

## La marche à suivre — gestes d'Aude

Ces gestes demandent d'être connectée à ses comptes : ils lui reviennent.

**1. Créer le projet Cloudflare Pages.** Sur `dash.cloudflare.com` →
*Workers & Pages* → *Create* → *Pages* → *Upload assets*. Nom suggéré :
`atelier-verriere`. Y déposer le dossier `dist/` produit par
`VITE_ATELIER=1 npm run build`. L'adresse obtenue ressemble à
`https://atelier-verriere.pages.dev`.

⚠️ **Entre cette étape et la suivante, l'atelier est en ligne sans protection.**
Faire les deux d'affilée, ou déposer les fichiers seulement après avoir posé la
règle d'accès.

**2. Poser le portail.** *Zero Trust* → *Access* → *Applications* → *Add an
application* → *Self-hosted*, sur le domaine du projet. Règle d'accès :
*Allow* → *Emails* → son adresse, et elle seule. Cloudflare envoie un code à
usage unique à chaque connexion ; personne d'autre ne passe. Gratuit à ce
volume.

**3. Vérifier depuis un autre navigateur.** En navigation privée, l'adresse
doit demander une authentification et non afficher l'atelier. Si l'atelier
s'affiche, la règle n'est pas active : ne rien y déposer tant que ce n'est pas
corrigé.

**4. Brancher le pont.** Claude ne répond que si le pont tourne sur le poste
d'Aude — c'est le prix de la clé qui ne sort jamais. Au lancement, lui dire
l'adresse de l'atelier :

```bash
set PONT_ATELIER=https://atelier-verriere.pages.dev
node scripts/pont-claude.mjs
```

Depuis un autre appareil (téléphone, autre poste), l'atelier s'ouvre et le
carnet fonctionne, **mais Claude y est absent** : le pont n'est pas là. C'est
une conséquence assumée du choix de ne jamais exposer la clé.

---

## Ce qui reste vrai du site public

Le site publié sur `exhome.github.io/checkmydiag` **reste en ligne, inchangé** —
c'est le produit, et il n'a rien à voir avec l'atelier. Sa publication
automatique est simplement désarmée : rien de neuf n'y montera tant que le job
`deploiement` de `.github/workflows/pages.yml` porte sa condition
`workflow_dispatch`. Les tests et les types, eux, continuent de tourner à chaque
push.

Le fichier `public/CNAME` porte `verriere-diag.fr` mais **n'est pas commité** :
le domaine n'est donc pas encore branché. C'est une décision à part, à prendre
le jour où le produit sortira.
