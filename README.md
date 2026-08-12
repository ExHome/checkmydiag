# Check My Diag

Un particulier reçoit soixante pages de PDF technique et n'a qu'une question :
**est-ce que c'est grave ?**

Check My Diag lit son rapport de diagnostic immobilier dans le navigateur, en
sort le verdict de chaque diagnostic, un schéma, et ce que ça change
concrètement pour lui.

## Principes

1. **Le document ne quitte pas l'appareil.** Le PDF est lu par pdf.js côté
   client. Pas de serveur, pas de compte, pas de téléversement. La page
   fonctionne connexion coupée.
2. **Aucun chiffre inventé.** Tout ce qui s'affiche est extrait du rapport.
   Quand une valeur n'est pas lisible, c'est écrit — jamais deviné, jamais
   approché. Un verdict faux serait pire que pas de verdict.
3. **Le rapport reste la référence.** L'outil reformule, il ne remplace pas et
   n'a aucune valeur réglementaire.

## Diagnostics couverts

DPE et audit énergétique, installation électrique, installation de gaz, amiante,
plomb (CREP), termites, état des risques et pollutions (ERP), assainissement non
collectif, superficie loi Carrez.

Un « dossier technique » qui réunit plusieurs diagnostics dans un seul PDF est
découpé automatiquement, rapport par rapport.

## Deux pièges déjà traités

Ils expliquent la forme du code, autant les connaître avant d'y toucher.

- **L'étiquette A→G est une image.** Dans les rapports, la lettre colorée est
  dessinée : impossible de la lire. Elle est donc *recalculée* à partir de la
  consommation, de la surface et des émissions, avec les seuils de l'arrêté du
  31 mars 2021 et la règle du double seuil. L'interface le dit au lecteur.
- **Les rapports citent des chiffres qui ne sont pas ceux du logement.** Un
  audit énergétique contient le seuil légal (« CEF < 450 kWh/m²/an ») et les
  gains après travaux (« - 476 kWhEP/m²/an ») dans le même format que la
  consommation réelle. Le moteur ne lit donc **que** des valeurs dont la phrase
  d'origine désigne sans ambiguïté ce logement-ci, à son état actuel.

## Développement

```bash
npm install
npm run dev      # http://localhost:5181
npm test         # moteur d'analyse
npm run check    # types
```

### Tester sur de vrais rapports

`src/lib/analyse/reel.test.ts` rejoue le moteur sur un dossier de PDF réels. Ces
fichiers ne sont pas dans le dépôt (données personnelles) : le test se saute
tout seul s'il ne les trouve pas.

```bash
CMD_PDF_DIR="/chemin/vers/mes/rapports" npm test
```

Pour comprendre la structure d'un rapport récalcitrant :

```bash
node scripts/dump-pdf.mjs "rapport.pdf" 8      # texte, ligne par ligne
node scripts/inspect-pdf.mjs "rapport.pdf" 4   # fragments bruts + images
```

## Structure

| Chemin | Rôle |
| --- | --- |
| `src/lib/pdf.ts` | lecture du PDF (navigateur) |
| `src/lib/lignes.ts` | reconstruction des lignes à partir des fragments |
| `src/lib/analyse/decoupe.ts` | découpage d'un dossier en diagnostics |
| `src/lib/analyse/*.ts` | un extracteur par famille de diagnostic |
| `src/lib/modele.ts` | modèle de données commun |
| `src/composants/` | interface : dépôt, cartes, schémas |
