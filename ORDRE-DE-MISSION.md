# Ordre de mission — Check My Diag

Cadre permanent de l'application. Il s'applique sans qu'on ait à le rappeler, et
il tranche en cas d'arbitrage. Le volet interface a son propre document :
[ORDRE-DE-MISSION-UX.md](ORDRE-DE-MISSION-UX.md).

## Ce que c'est

**L'antisèche du diagnostic immobilier.**

On dépose un PDF. Le rapport devient cliquable : chaque ligne s'explique en face,
en quelques puces, avec un dessin. Et le dossier est vérifié — périmé, manquant,
chiffres qui ne concordent pas.

Ni un cours, ni un rapport de plus. Une antisèche : ce qu'on garde sous la main
quand on ne connaît pas le sujet et qu'il faut décider.

## Pour qui

Un particulier qui vend, achète ou loue. Il vient de recevoir soixante pages de
jargon et n'a qu'une question : **est-ce que c'est grave ?**

Il a quinze ans dans sa tête quand il lit ce document. Il est sur un téléphone.
Il n'ira pas chercher la réponse à la page 47.

## Les trois promesses

Elles ne se négocient pas. Une fonctionnalité qui en casse une ne se fait pas.

1. **Le document ne quitte pas l'appareil.** Lecture par pdf.js dans le
   navigateur. Aucun serveur, aucun compte, aucune trace. Les dossiers gardés
   restent dans le stockage local, effaçables d'un bouton.
2. **Aucun chiffre inventé.** Quand une valeur n'est pas lisible, on l'écrit et
   on dit pourquoi. Un verdict faux sur un document légal coûte plus cher qu'un
   verdict manquant.
3. **Le rapport reste la référence.** L'outil reformule, il ne remplace pas et
   n'a aucune valeur réglementaire.

## Ce que l'application fait

**Trois niveaux de lecture, chacun à un clic.**

| Niveau | Contenu |
| --- | --- |
| Le voyant | Un gros picto, trois mots : « Classe C », « Pas d'amiante », « Plomb — salle de bain » |
| L'antisèche | La ligne du rapport, puis des puces. Une cascade quand la question en appelle une autre |
| Le cerveau | Pour les curieux : la vie du termite, pourquoi l'amiante était un matériau miracle |

**Et deux services que personne d'autre ne rend :**

- **Le rapport annoté** — les pages du PDF affichées, les passages surlignés,
  l'explication en face.
- **Le contrôle du dossier** — diagnostic périmé, diagnostic absent, surfaces
  qui divergent, conclusion illisible. Avec la question à poser, jamais une
  accusation.

**Neuf diagnostics** : DPE et audit, électricité, gaz, amiante, plomb, termites,
état des risques, assainissement, superficie Carrez. Un dossier technique qui les
réunit est découpé automatiquement.

## La mise en relation professionnelle

**Arbitrage rendu le 13/08/2026.** Une version précédente de ce document
interdisait « toute mise en relation commerciale ». Ce n'est plus vrai : elle
est décidée, et elle est le modèle économique du projet — un professionnel
exclusif par métier et par code postal, au forfait. Voir
[docs/BRIEF.md](docs/BRIEF.md) pour le détail.

Elle arrive avec ses garde-fous, et **ceux-là ne se négocient pas** : ce sont
eux qui font qu'elle ne détruit pas la confiance qui fait le produit.

1. **Déclenchée par un constat du rapport**, jamais affichée par défaut.
2. **Jamais avant que le constat ne soit compris** : rien dans les deux
   premiers niveaux de lecture.
3. **Un seul professionnel par constat**, trois encarts par dossier au maximum,
   même si dix constats les justifieraient.
4. **Visuellement séparée de l'explicatif.** Aucune confusion possible entre un
   constat du diagnostiqueur et une suggestion de prestataire.
5. **Le caractère payant est annoncé**, en clair, là où l'encart apparaît.
6. **Aucune commission sur les travaux**, aucune rémunération à la performance.
7. **Ton neutre** : « Un électricien est référencé sur votre secteur », jamais
   « faites appel à notre partenaire ».
8. **Aucun encart si la zone n'a pas de professionnel validé.** Pas de repli
   silencieux sur une zone voisine.

## Ce que l'application ne fait pas

- Aucun conseil qui engage : on explique ce que dit le rapport, on ne se
  substitue pas au diagnostiqueur.
- Aucune publicité — un encart déclenché par un constat n'est pas une bannière.
- Aucune donnée client dans le dépôt. Les tests lisent des rapports réels depuis
  un dossier hors dépôt (`CMD_PDF_DIR`, `CMD_CALIB_DIR`).

## Le standard

Une fonctionnalité est finie quand :

1. un lecteur de quinze ans comprend, sans aide ;
2. en dix secondes, il sait si c'est grave et ce qu'il doit faire ;
3. rien n'est affirmé qui ne soit lu dans le rapport ;
4. ça tient sur un téléphone.

## La conduite technique

- Vite + Svelte 5 + TypeScript strict. Zéro erreur `svelte-check` avant tout
  commit.
- Le moteur d'analyse est testé (`npm test`), et **calibré sur de vrais
  rapports** avant d'être cru sur parole. Trois faux verdicts ont été trouvés
  ainsi, invisibles autrement — voir le README.
- Les pièges connus de ces documents sont documentés : étiquette en image,
  chiffres qui ne décrivent pas le logement, conclusions cochées à la main.
  Quiconque touche au moteur les lit d'abord.

## Le cap

1. **Mettre en ligne.** Le produit est prêt ; il attend un compte GitHub.
2. **Élargir la couverture** : calibrer électricité, gaz et assainissement sur
   davantage de rapports réels.
3. **Étendre les cascades** : chaque terme du rapport doit finir par avoir sa
   question et sa réponse.
