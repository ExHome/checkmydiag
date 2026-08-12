# Ordre de mission — UX de Check My Diag

Cadre permanent. Il s'applique à toute évolution du site, sans qu'on ait à le
rappeler. En cas d'arbitrage, il tranche.

## Ce que le site fait

On dépose un diagnostic. On obtient trois choses, dans cet ordre :

1. **Ce que ça veut dire**, expliqué avec un schéma ;
2. **Si c'est grave**, et ce que ça change concrètement ;
3. **Ce qui cloche dans le dossier** — dates dépassées, diagnostic manquant,
   chiffres qui ne concordent pas.

Le troisième point est ce qui donne son nom au site : on ne se contente pas de
traduire le rapport, on le **vérifie**.

## Pour qui on travaille

Une personne qui vient de recevoir soixante pages de PDF technique, qui n'y
connaît rien, et qui a **une seule question** : *est-ce que c'est grave ?*

Elle n'est pas diagnostiqueur. Elle n'est pas agent immobilier. Elle est souvent
inquiète, parfois pressée, généralement sur un téléphone. Elle ne lira pas un
paragraphe de dix lignes.

## La règle au-dessus des autres

**Un jeune de quinze ans doit comprendre.** Pas « un adulte non spécialiste » :
quinze ans. C'est le niveau à viser pour chaque phrase du site.

En pratique :

- des phrases courtes, une idée par phrase ;
- des mots de tous les jours — si un mot ne se dit pas à table, il est expliqué
  ou il saute ;
- pas de tournure administrative : « il ne peut plus faire l'objet d'un
  nouveau bail » devient « on ne peut plus le louer » ;
- les sigles (DPE, CREP, ERP, DGI) toujours accompagnés de ce qu'ils veulent
  dire, à chaque fois ;
- une date plutôt qu'un renvoi à un texte de loi.

## Les six règles

### 1. Le schéma explique, le texte confirme — et le schéma est simple

Chaque diagnostic doit être compris **par son dessin**, avant toute lecture. Un
schéma qui se contente de rejouer les chiffres du rapport n'explique rien : le
bon schéma montre le **mécanisme** — par où part la chaleur, comment le plomb
arrive dans un enfant, pourquoi une grille bouchée tue.

Simple veut dire : **une seule idée par schéma**, six éléments au maximum, de
grandes formes, des mots courts posés à côté de ce qu'ils désignent. Pas de
légende à numéros qu'il faut faire correspondre au dessin. Si on doit expliquer
le schéma, c'est qu'il a échoué.

Avant d'ajouter un diagnostic, la question est : *quel dessin le fait
comprendre ?* Si on n'a pas la réponse, on n'a pas fini de réfléchir.

### 2. Signaler ce qui cloche, sans accuser

Le site vérifie le dossier : diagnostic périmé, diagnostic manquant, surfaces qui
ne concordent pas, dates éloignées les unes des autres. Ces points sont
présentés comme **des choses à vérifier**, jamais comme une faute du
diagnostiqueur — on n'a pas le rapport complet sous les yeux, et il existe
souvent une bonne raison.

Le ton juste : « Ce point mérite une question au professionnel. » Jamais :
« Votre diagnostic est faux. »

Et la règle du chiffre inventé s'applique ici plus qu'ailleurs : on ne signale
une incohérence que si les deux valeurs comparées ont été lues sans ambiguïté.

### 3. Simple et fluide

Une carte, un diagnostic, une réponse. L'essentiel visible : le verdict, les
chiffres clés, le schéma. Tout le reste est replié derrière « En savoir plus ».

Ce qui s'ouvre tout seul, c'est ce qui engage le lecteur : un point important,
une obligation de travaux, un délai légal.

Pas de tableau de bord, pas d'onglets, pas de réglages. On dépose, on comprend.

### 4. Jamais de chiffre inventé

Quand une valeur n'est pas lisible, on l'écrit et on dit pourquoi (« la
conclusion est cochée à la main sur le rapport »). Jamais d'estimation présentée
comme un constat, jamais de verdict par défaut.

C'est une règle d'interface autant que de moteur : la confiance est le produit.

### 5. Le document ne bouge pas

Rien n'est envoyé, rien n'est stocké, aucun compte n'est demandé. Cette promesse
est visible dès l'accueil, et elle doit rester vraie sans exception — y compris
pour une fonctionnalité pratique qui exigerait un aller-retour serveur.

### 6. Mobile d'abord, lisible par tous

Le premier écran est un téléphone. Contraste suffisant, cibles tactiles
généreuses, navigation au clavier, textes alternatifs sur les schémas, mode
sombre traité, aucun défilement horizontal.

## Ce qu'on refuse

- Le vocabulaire du métier repris tel quel « parce que c'est le terme exact ».
- Les longues pages d'explication réglementaire que personne ne lit.
- Le ton anxiogène : on informe, on ne fait pas peur. Un logement classé G n'est
  pas une catastrophe, c'est une situation avec des conséquences précises.
- Le ton commercial : aucun devis, aucune offre, aucune incitation à faire faire
  des travaux.
- Toute friction avant la valeur : compte, e-mail, publicité, bandeau.

## Comment on valide

Un écran est bon quand, en **dix secondes** et sans aide :

1. le lecteur sait si c'est grave ;
2. il a compris de quoi parle le diagnostic, grâce au dessin ;
3. il sait ce qu'il doit faire, s'il doit faire quelque chose.

Si l'une des trois manque, l'écran n'est pas fini.

Et le test qui prime sur tous les autres : **le faire lire à quelqu'un de
quinze ans**. S'il bute sur un mot, c'est le mot qui a tort.
