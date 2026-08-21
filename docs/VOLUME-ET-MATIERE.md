# Volume, profondeur et matiere — ordre de mission

> **Recu d'Aude le 21 aout 2026.** Contrainte permanente. Ce document en garde
> le texte de decision et, en second, le systeme construit pour l'executer.

## L'objectif, dans ses mots

Faire disparaitre tout effet plat. L'application doit donner une sensation de
profondeur, de lumiere, de matiere et d'architecture.

Le resultat ne doit **pas** ressembler a : une application SaaS generique, une
succession de cartes plates, une interface sombre uniforme, une accumulation
d'ombres, un faux effet « luxe » obtenu avec du dore, un simple degrade pose
derriere les contenus.

Le resultat doit evoquer : **un cabinet d'architecture premium, contemporain,
chaleureux, lumineux, precis et extremement maitrise.**

## Les regles qui ne se negocient pas

- **Interdiction du vert plat.** Le fond ne doit jamais etre uniforme :
  plusieurs nuances tres proches, zones plus sombres en peripherie, zones
  eclairees autour des contenus importants. L'oeil ne doit pas identifier le
  degrade — il doit ressentir que l'espace a de la profondeur.
- **Une seule source de lumiere** pour toute l'interface, en haut a gauche.
  Elle commande le fond, les cartes, les bordures, les pictogrammes. Aucun
  objet ne s'eclaire dans une autre direction.
- **Des halos larges, diffus, presque imperceptibles.** Jamais flashy, jamais
  neon, jamais « gaming ».
- **Les bords plus denses que le centre** — un vignettage architectural tres
  subtil qui ramene le regard vers le contenu.
- **Une structure architecturale au fond** : montants de verriere, trame de
  vitrage. Opacite tres faible : on la ressent plus qu'on ne la voit.
- **Une micro-texture** de 2 a 4 % de presence maximum. Jamais l'impression
  d'une texture telechargee.
- **Trois plans au minimum** : le fond, les surfaces intermediaires, le
  premier plan. « Si tout ressort, rien ne ressort. »
- **Pas d'ombres noires generiques.** Grande diffusion, faible opacite,
  plusieurs couches faibles. La profondeur vient de la luminosite, pas du noir.
- **La lumiere plutot que l'ombre** : un micro-eclat sur le bord superieur
  vaut mieux qu'un gros bloc a ombre portee.
- **Le verre depoli sur 10 a 20 % des surfaces au maximum.** Pas de
  glassmorphism partout.
- **Le dore devient exceptionnel** : un detail, un micro-accent. Jamais de
  bordure doree systematique.
- **La regle du 80 / 15 / 5** : 80 % de surfaces sobres, 15 % avec relief,
  5 % tres mises en avant.
- **Pas de faux 3D** : ni biseau, ni degrade metallique, ni embossage
  excessif, ni carte gonflee.

## Les quatre tests

1. **Test de profondeur.** En niveaux de gris, on doit distinguer le fond, le
   second plan, le premier plan et l'element actif. Meme valeur partout =
   echec.
2. **Test du flou.** Ecran floute, on doit encore savoir ou regarder et quel
   bloc est principal. Tout qui fusionne = echec.
3. **Test « bureau d'architecte ».** Cette interface pourrait-elle etre
   presentee dans un grand cabinet contemporain sans paraitre amateur ?
4. **Test « pas de SaaS ».** Ressemble-t-elle a un dashboard construit avec
   une bibliotheque de composants ? Si oui, reprendre.

Et deux garde-fous : **le premium ne doit jamais ralentir Verriere**, et
**aucun effet ne doit degrader la lisibilite**. Sur mobile : alleger les flous
et les textures, garder les halos et le relief principal.

## Interdiction de se declarer satisfait

> « Interdiction de presenter un resultat comme termine si la difference
> visuelle n'est pas evidente. »

Tout lot de volume se livre avec un avant/apres : ce qui etait plat, ce qui a
change, pourquoi, ce que cela apporte.

---

# Le systeme construit pour l'executer

## Ce qui etait plat, mesure avant de commencer

| ou | mesure |
|---|---|
| les trois ombres de la charte | 6 %, 10 % et 12 % d'opacite — invisibles sur ivoire |
| l'ecran d'un diagnostic | 28 surfaces sur 50 sans aucune ombre |
| le fond du bureau | un degrade a deux arrets, sans halo ni trame ni texture |
| le relief existant | present sur les seules icones d'application (22 % et 30 %) |

## La lumiere : une seule, en haut a gauche

Toutes les valeurs du systeme en decoulent. Un degrade de surface part de
155 degres, une ombre se decale vers le bas et la droite, un micro-eclat se
pose sur l'arete du haut. Il n'y a pas d'exception : un objet eclaire
autrement se lit comme un defaut de rendu.

## Les trois plans

| jeton | a quoi il sert | ou |
|---|---|---|
| `--relief-pose` | ce qui appartient au fond | zones techniques, blocs d'information |
| `--relief-souleve` | ce qui se detache | cartes secondaires, panneaux |
| `--relief-avant` | ce qui vient vers le lecteur | vignette active, constat majeur, action |

Chacun combine une ombre de contact courte et dense, une ombre d'ambiance
longue et diluee, et un micro-eclat sur l'arete superieure. Aucune n'est
noire : elles sont faites du vert profond du produit, ce qui evite le voile
gris qu'une ombre neutre pose sur une teinte.

## Le fond, en cinq couches

1. le degrade de base, trois nuances de vert tres proches ;
2. un halo ivoire large et diffus, en haut a gauche — la source ;
3. un halo vert plus lumineux, plus bas, qui evite l'aplat ;
4. la trame de verriere : montants verticaux et traverses, opacite tres faible ;
5. le vignettage : les bords se densifient, le centre respire.

Le tout en degrades CSS, sans image : rien a telecharger, rien a decoder.
