# OÙ PARSER — l'état relatif à la présence de termites

*Carnet de lecture de la branche « termites, constatations diverses et
champignons ». Ouvert le 21/08/2026.*

**Règle rappelée en tête.** On cherche un ENDROIT, pas une info : quel éditeur ·
quelle rubrique · quelles bornes · quelle disposition. Un endroit sans ces quatre
choses n'est pas un endroit. Et on lit les volets **en entier, un par un**, avant
de corriger quoi que ce soit.

⚠️ **Aucune donnée du corpus n'entre ici.** Ni nom, ni adresse. Les numéros de
dossier sont des références internes de cabinet, pas des données personnelles.

---

## Ce que le lecteur fait aujourd'hui, et pourquoi c'est à refaire

`reperages.ts` détecte les volets « xylophages », « mérule » et « constatations
diverses » en cherchant **des mots dans tout le volet** :

```ts
motif: /m[ée]rule|champignons? lignivores?|coniophore|pourriture …/i
```

Le commentaire du fichier l'assume : *« On se garde d'interpréter leur
conclusion : les formulations n'ont pas été mesurées. »* C'est exactement
« chercher une info, pas un endroit » — et ça se paie deux fois.

**Faux positif probablement garanti.** Le rappel réglementaire du § E est imprimé
dans TOUS les rapports, et il contient le mot :

> « Lorsque, dans une ou plusieurs communes, des foyers de **mérule** sont
> identifiés, un arrêté préfectoral […] délimite les zones de présence d'un
> risque de mérule. »

Un motif qui balaie le volet entier trouve donc « mérule » partout, y compris
dans les rapports qui n'en constatent aucune. *(À mesurer.)*

**Et il jette ce qu'on lui donne.** Verrière dit au lecteur que « la norme
n'oblige le diagnostiqueur ni à dire lesquels, ni où ». C'est vrai — et les
rapports le disent quand même, en clair, dans une rubrique nommée.

---

## L'ENDROIT : « Constatations diverses »

### ⚠️ La lettre de la rubrique CHANGE. On s'ancre sur le titre.

Trois lectures, un seul éditeur, trois lettres différentes :

```
lecture 1 (07/2024)   H. Constatations diverses      I. Moyens d'investigation
lecture 2 (11/2025)   I. Constatations diverses      H. Moyens d'investigation
lecture 3 (04/2026)   H. Constatations diverses      I. Moyens d'investigation
```

Les deux rubriques **échangent leur lettre** d'une version du modèle à l'autre.
S'ancrer sur « H. » revient à lire les moyens d'investigation une fois sur trois.

### La disposition : trois colonnes, et la première est souvent vide

```
H. - Constatations diverses :
Liste des ouvrages, parties        Localisation      Observations et
d'ouvrages                                           constatations diverses
                                   Général  -        [le texte, sur N lignes]
```

L'extraction rend l'en-tête sur deux ou trois lignes, puis le texte. La
localisation — « Général », ou une liste de pièces — précède le tiret de la
colonne vide.

### Les bornes

De « Constatations diverses » jusqu'au **titre suivant**, quel qu'il soit :
« Moyens d'investigation », « VISA et mentions », ou la « Note » de bas de
rubrique sur les autres agents de dégradation. Jamais la fin de page.

---

## Trois lectures d'un même bien, à un an d'intervalle

Les lectures 1, 2 et 3 sont **le même logement**, réexpertisé trois fois. C'est
une expérience naturelle, et elle démontre le défaut central.

```
15/07/2024   tableau D : « Absence d'indices » partout
             constatations diverses : indices d'autres agents (vrillettes)

20/11/2025   tableau D : PRÉSENCE d'indices de termites — plancher sur solives
             constatations diverses : vrillettes · traces d'humidité ·
                                      « pourriture fibreuse » · dégât des eaux

29/04/2026   tableau D : « Absence d'indices » partout
             constatations diverses : rappelle la découverte de 2025, et dit
                                      que le plancher bois a été remplacé
```

**Sur le rapport de 2026, Verrière annonce aujourd'hui « aucun indice
d'infestation de termites ».** C'est ce que dit le tableau, et c'est vrai. Mais
le rapport lui-même écrit, dans sa rubrique voisine, qu'il y a eu des termites
ici six mois plus tôt et que le plancher a dû être changé.

C'est *rassurer par omission* dans sa forme la plus nette : la phrase est exacte,
et le lecteur en tire une conclusion fausse.

## Ce que la rubrique porte, et que personne ne lit

Relevé sur ces trois lectures, mot pour mot :

- **L'espèce**, que la norme n'oblige pourtant pas à donner —
  « Indices d'infestations de **vrillettes** dans pannes du plafond R+1 » ; et
  l'annexe photo va plus loin : « Parasite : *Anobium punctatum* (Petites
  vrillettes) — Indices : bois piqué ».
- **Un champignon** — « il a été observé de la **pourriture fibreuse** et des
  traces d'humidité importante sur le plancher sur solives bois ».
- **L'histoire du bien** — la découverte de 2025, les travaux de 2026.
- **Le lieu**, précis, alors que Verrière répète que le rapport n'a pas à le
  donner : « dans pannes du plafond R+1: entré/Cuisine/Séjour et Mezzanine ».

## Deux autres endroits repérés, non encore lus

**Le niveau d'infestation de la commune**, en § A :

```
Le bien est situé dans une zone soumise à un arrêté préfectoral:
33800 BORDEAUX (Information au 14/04/2025)
Niveau d'infestation fort
```

« Niveau d'infestation **fort** » n'est lu nulle part. Il ne parle pas du bien
mais de sa commune, et c'est précisément ce qu'un acquéreur ne peut pas deviner.

**La rubrique G — ce qui n'a PAS été examiné.** Elle nomme la charpente :

> « charpente sous plafond sous rampant, accès combles insuffisant »

Dans un rapport de termites, la charpente non contrôlée n'est pas un détail.

---

## ⚠️ Un piège de forme déjà vu dans le tableau D

Quand un élément est infesté, la colonne « Résultats » passe à deux lignes, et
l'extraction **inverse l'ordre** :

```
Présence d'indices d'infestation de termites,      ← le résultat, ligne 1
Sol - Plancher sur solives                          ← l'ouvrage
Termites souterrains: altérations dans le bois      ← le résultat, ligne 2
```

Les lignes ordinaires, elles, mettent l'ouvrage à gauche et le résultat à droite,
sur une seule ligne. `zonesTermites` retombe sur ses pieds ici, mais par l'ordre
des lignes — pas par une règle qui tienne.

---

*Lectures faites : 3. À faire avant toute correction : 47.*
