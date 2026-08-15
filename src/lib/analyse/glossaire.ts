/**
 * Le glossaire : les mots du métier, expliqués là où ils apparaissent.
 *
 * Ces termes se retrouvent dans tous les rapports, quel que soit le diagnostic.
 * Toute ligne qui en contient un devient cliquable — c'est ce qui permet de
 * toucher presque n'importe quel mot du document.
 *
 * Registre antisèche, comme partout : des fragments, des flèches.
 */
import type { Suite } from './reperes';

export interface Terme {
  motif: RegExp;
  titre: string;
  /** Le dessin qui montre la notion : chaque mot du métier a le sien. */
  schema?: string;
  points: string[];
  suites?: Suite[];
}

export const GLOSSAIRE: Terme[] = [
  {
    motif: /[ée]nergie primaire/i,
    titre: 'Énergie primaire',
      schema: 'energie',
    points: [
      'Ce qu’il a fallu produire, pas ce que vous achetez',
      'Électricité : ×1,9 depuis le 1ᵉʳ janvier 2026 (×2,3 avant)',
      'Gaz, fioul, bois : ×1',
      'D’où un logement tout électrique noté plus sévèrement'
    ]
  },
  {
    motif: /[ée]nergie finale|\b[ée]\.?\s?f\.?\b/i,
    titre: 'Énergie finale',
      schema: 'energie',
    points: ['Ce qui arrive au compteur', 'Ce que vous payez vraiment', 'Toujours inférieure à l’énergie primaire']
  },
  {
    motif: /pont thermique/i,
    titre: 'Pont thermique',
      schema: 'pont-thermique',
    points: [
      'Endroit où l’isolant s’interrompt',
      'Jonction mur/plancher, contour de fenêtre, balcon',
      'Le froid y passe comme dans un couloir',
      'C’est là qu’apparaissent moisissures et taches noires'
    ]
  },
  {
    motif: /d[ée]perdition/i,
    titre: 'Déperdition',
      schema: 'perimetre',
    points: [
      'La chaleur qui s’échappe du logement',
      'Toit ~30 %, murs ~25 %, air renouvelé ~25 %',
      'Fenêtres ~15 %, sol ~10 %'
    ]
  },
  {
    motif: /\bVMC\b|ventilation m[ée]canique/i,
    titre: 'VMC',
      schema: 'vmc',
    points: [
      'Ventilation mécanique contrôlée',
      'Extrait l’air humide, fait entrer l’air neuf',
      'Sans elle : humidité, moisissures, air vicié',
      'Ne jamais boucher les bouches d’extraction'
    ]
  },
  {
    motif: /fluorescence X/i,
    titre: 'Appareil à fluorescence X',
    schema: 'classes',
    points: [
      'Un pistolet posé contre le mur',
      'Il excite la matière et lit le rayonnement renvoyé',
      'Mesure le plomb sans gratter ni percer',
      'Contient une source radioactive scellée, très encadrée'
    ]
  },
  {
    motif: /unit[ée] de diagnostic|\bUD\b/i,
    titre: 'Unité de diagnostic',
      schema: 'classes',
    points: [
      'Un élément contrôlé : un mur, une porte, une plinthe',
      'Chacune reçoit sa note de 0 à 3',
      'Un logement en compte souvent 50 à 100'
    ]
  },
  {
    motif: /flocage|calorifugeage/i,
    titre: 'Flocage, calorifugeage',
    points: [
      'Flocage : matériau projeté au plafond ou sur une structure',
      'Calorifugeage : isolant enroulé autour des tuyaux',
      'Les deux sont friables → liste A, la plus dangereuse',
      'Ils libèrent des fibres au moindre choc'
    ]
  },
  {
    motif: /fibro[- ]?ciment/i,
    titre: 'Fibrociment',
      schema: 'fibrociment',
    points: [
      'Ciment armé de fibres d’amiante',
      'Plaques ondulées de toiture, conduits, bacs',
      'Non friable : sans danger tant qu’il est intact',
      'Le casser ou le percer libère les fibres'
    ]
  },
  {
    motif: /liaison [ée]quipotentielle/i,
    titre: 'Liaison équipotentielle',
      schema: 'terre',
    points: [
      'Un fil qui relie tout le métal de la salle de bains',
      'Baignoire, tuyaux, radiateur, huisseries',
      'Tout est mis au même potentiel → pas de différence → pas de choc'
    ]
  },
  {
    motif: /prise de terre|mise [àa] la terre/i,
    titre: 'Mise à la terre',
      schema: 'terre',
    points: [
      'Un piquet planté dans le sol, relié au tableau',
      'Évacue le courant qui s’échappe d’un appareil',
      'Sans elle, le différentiel ne peut pas faire son travail'
    ]
  },
  {
    motif: /\bDGI\b|danger grave et imm[ée]diat/i,
    titre: 'DGI',
      schema: 'case',
    points: [
      'Danger grave et immédiat',
      'Le diagnostiqueur coupe le gaz sur place, le jour même',
      'Il prévient le distributeur',
      'Remise en service par un professionnel uniquement'
    ]
  },
  {
    motif: /cordonnet|galeries?[- ]tunnels?/i,
    titre: 'Cordonnet',
      schema: 'identite',
    points: [
      'Petit tunnel de terre le long d’un mur',
      'Les termites le construisent pour fuir la lumière',
      'Souvent le seul indice visible',
      'Large comme un crayon, couleur de la terre'
    ]
  },
  {
    motif: /arr[êe]t[ée] pr[ée]fectoral/i,
    titre: 'Arrêté préfectoral',
      schema: 'identite',
    points: [
      'Décision du préfet qui vise une commune entière',
      'Rend un diagnostic obligatoire sur son territoire',
      'Termites, mérule, information sur les risques'
    ]
  },
  {
    motif: /retrait[- ]gonflement|argileu/i,
    titre: 'Retrait-gonflement',
      schema: 'identite',
    points: [
      'L’argile gonfle avec l’eau, se rétracte en séchant',
      'Le sol monte et descend au fil des saisons',
      'La maison suit → fissures en escalier',
      'Premier poste de catastrophe naturelle en France'
    ]
  },
  {
    motif: /\bopposable\b/i,
    titre: 'Opposable',
      schema: 'identite',
    points: [
      'Depuis 2021, le DPE engage juridiquement',
      'Un acheteur peut se retourner contre le diagnostiqueur',
      'Avant, c’était une simple information'
    ]
  },
  {
    motif: /sans d[ée]montage ni destruction|non destructi/i,
    titre: 'Sans démontage',
      schema: 'perimetre',
    points: [
      'Le diagnostiqueur regarde, il ne casse rien',
      'Pas de trou, pas de dépose de cloison',
      'Ce qui est caché reste inconnu',
      'C’est la limite de tous ces diagnostics'
    ]
  },

  /* ═══════════════════════════════════════════════════════════════════════════
     Les mots que les rapports emploient vraiment.

     Les entrées ci-dessus avaient été écrites de mémoire. Celles-ci sortent
     d'une mesure : quarante rapports du corpus, balayés à la recherche d'une
     liste de termes techniques. Le nombre entre parenthèses, dans les
     commentaires, est le nombre de dossiers où le mot apparaît — c'est lui qui
     a décidé de l'ordre, et non l'intérêt qu'on leur trouve.

     Le décalage était net : « volume », « loi Carrez », « radon » et
     « plancher » sont dans trente-huit dossiers sur quarante, et le lexique
     n'en contenait aucun.
     ═══════════════════════════════════════════════════════════════════════ */

  /* ---- Le périmètre de la mission : ce qui a pu être vu, et ce qui ne l'a
     pas pu. C'est la famille la plus importante — elle dit ce que le rapport
     ne couvre pas. ------------------------------------------------------- */
  {
    // 28 dossiers
    motif: /non accessibles?|inaccessibles?/i,
    titre: 'Non accessible',
    schema: 'perimetre',
    points: [
      'Une zone que le diagnostiqueur n’a pas pu atteindre',
      'Trappe condamnée, meuble scellé, vide sanitaire fermé, hauteur',
      'Elle n’est pas déclarée saine : elle n’est pas contrôlée',
      'Le rapport doit dire laquelle, et pourquoi'
    ]
  },
  {
    // 21 dossiers
    motif: /\br[ée]serves?\b/i,
    titre: 'Réserve',
    schema: 'perimetre',
    points: [
      'Ce que le diagnostiqueur retire de sa conclusion',
      'Il constate, mais il précise ce qu’il n’a pas pu vérifier',
      'Une conclusion rassurante avec réserves n’est pas une garantie',
      'À lire avant la conclusion, pas après'
    ]
  },
  {
    // 10 dossiers
    motif: /\bsondages?\b/i,
    titre: 'Sondage',
    schema: 'perimetre',
    points: [
      'Un point d’essai : on pique, on gratte, on perce un peu',
      'Le bois se sonde au poinçon, les peintures s’analysent point par point',
      'Un sondage ne dit rien de ce qui est à trente centimètres',
      'Leur nombre et leur place sont dans le rapport'
    ]
  },

  /* ---- Les surfaces. Trois mesures différentes pour le même logement, et
     c'est normal : elles ne comptent pas la même chose. ------------------- */
  {
    // 38 dossiers
    motif: /loi carrez|superficie carrez/i,
    titre: 'Loi Carrez',
    schema: 'surface',
    points: [
      'La surface qui sera écrite dans l’acte de vente',
      'Parties privatives closes et couvertes, sous 1,80 m de hauteur',
      'Ni cave, ni garage, ni balcon, ni terrasse',
      'Copropriété seulement — une maison individuelle n’y est pas soumise'
    ]
  },
  {
    // 38 dossiers
    motif: /loi boutin|surface habitable[^.]{0,30}location/i,
    titre: 'Loi Boutin',
    schema: 'surface',
    points: [
      'La surface écrite dans un bail de location',
      'C’est la surface habitable, au sens du code de la construction',
      'Elle exclut les combles non aménagés, caves, garages, terrasses',
      'Elle diffère de la Carrez : ce n’est pas une erreur'
    ]
  },
  {
    // 34 dossiers
    motif: /surface habitable/i,
    titre: 'Surface habitable',
    schema: 'surface',
    points: [
      'Le plancher, moins les murs, cloisons, marches, gaines et embrasures',
      'Sous 1,80 m de hauteur, ça ne compte pas',
      'C’est la base de la loi Boutin',
      'Plus petite que la surface au sol, toujours'
    ]
  },
  {
    // 33 dossiers
    motif: /surface de plancher/i,
    titre: 'Surface de plancher',
    schema: 'surface',
    points: [
      'Celle de l’urbanisme : permis de construire, taxes',
      'Elle sert à l’administration, pas à la vente',
      'Encore un autre calcul — ne la comparez pas à la Carrez'
    ]
  },
  {
    // 38 dossiers
    motif: /\bannexes?\b/i,
    titre: 'Annexe',
    schema: 'surface',
    points: [
      'Cave, garage, cellier, remise, combles non aménagés',
      'Elles ne comptent ni en Carrez ni en Boutin',
      'Une annonce peut les additionner : lisez le détail du mesurage'
    ]
  },
  {
    // 31 dossiers
    motif: /v[ée]randas?|loggias?/i,
    titre: 'Véranda, loggia',
    schema: 'surface',
    points: [
      'Cas limites du mesurage, et sources d’écart fréquentes',
      'Une véranda close et couverte peut compter en Carrez',
      'Une loggia ouverte, non',
      'Le rapport doit dire ce qu’il a retenu, pièce par pièce'
    ]
  },
  {
    // 12 dossiers
    motif: /hauteur sous plafond/i,
    titre: 'Hauteur sous plafond',
    schema: 'surface',
    points: [
      'Le seuil qui décide : 1,80 m',
      'Sous cette hauteur, la surface ne compte pas',
      'D’où les combles et les sous-pentes qui « disparaissent » du calcul'
    ]
  },

  /* ---- L'électricité. Le vocabulaire le plus dense des rapports. -------- */
  {
    // 38 dossiers
    motif: /\bvolumes?\b/i,
    titre: 'Volume (salle de bains)',
    schema: 'electricite',
    points: [
      'La salle de bains est découpée en zones autour du point d’eau',
      'Plus on est près de l’eau, moins on a le droit d’y mettre',
      'Une prise mal placée dans un volume est une anomalie',
      'C’est la raison des interdits qui paraissent arbitraires'
    ]
  },
  {
    // 27 dossiers
    motif: /appareil g[ée]n[ée]ral de commande et de protection|\bAGCP\b/i,
    titre: 'Appareil général de commande',
    schema: 'electricite',
    points: [
      'L’interrupteur qui coupe toute l’installation',
      'Il doit être accessible, à l’intérieur du logement',
      'Son absence ou son inaccessibilité est une anomalie',
      'C’est ce qu’on cherche quand ça sent le brûlé'
    ]
  },
  {
    // 27 dossiers
    motif: /dispositif diff[ée]rentiel|interrupteur diff[ée]rentiel/i,
    titre: 'Dispositif différentiel',
    schema: 'electricite',
    points: [
      'Il compare le courant qui part et celui qui revient',
      'S’il en manque, c’est qu’il passe ailleurs — par vous',
      'Il coupe en quelques millisecondes',
      'Sans lui, la prise de terre ne protège pas'
    ]
  },
  {
    // 27 dossiers
    motif: /socles? de prise/i,
    titre: 'Socle de prise',
    schema: 'electricite',
    points: [
      'La prise murale elle-même',
      'On regarde sa fixation, sa terre, son état, sa place',
      'Une prise cassée ou sans terre est relevée une par une'
    ]
  },
  {
    // 29 dossiers
    motif: /\bfusibles?\b/i,
    titre: 'Fusible',
    schema: 'electricite',
    points: [
      'L’ancêtre du disjoncteur : un fil qui fond',
      'Encore présent dans les tableaux anciens',
      'Le fil remplacé par un clou ou du fil de fer : danger direct',
      'Un tableau à fusibles n’est pas interdit, il est surveillé'
    ]
  },
  {
    // 28 dossiers
    motif: /conducteurs?\b/i,
    titre: 'Conducteur',
    schema: 'electricite',
    points: [
      'Le fil, tout simplement',
      'Sa section décide de ce qu’il peut porter sans chauffer',
      'Un fil trop fin sur un gros appareil, c’est un départ de feu',
      'Les couleurs disent la fonction : bleu neutre, vert-jaune terre'
    ]
  },

  /* ---- Le gaz. ---------------------------------------------------------- */
  {
    // 33 dossiers
    motif: /ventilations?|amen[ée]e d.air/i,
    titre: 'Ventilation, amenée d’air',
    schema: 'gaz',
    points: [
      'Une flamme consomme de l’air : il faut qu’il entre',
      'Grille bouchée, joint trop étanche : la combustion s’étouffe',
      'C’est ainsi que naît le monoxyde de carbone',
      'La grille bouchée est l’anomalie gaz la plus fréquente'
    ]
  },
  {
    // 25 dossiers
    motif: /raccordements?\b/i,
    titre: 'Raccordement',
    schema: 'gaz',
    points: [
      'Le lien entre la tuyauterie fixe et l’appareil',
      'Tuyau souple daté : il se remplace à sa date',
      'Un raccordement périmé se voit à l’œil, sur le tuyau'
    ]
  },

  /* ---- L'amiante. ------------------------------------------------------- */
  {
    // 21 dossiers
    motif: /faux[- ]plafonds?/i,
    titre: 'Faux plafond',
    schema: 'amiante',
    points: [
      'Plafond suspendu, en dalles ou en plaques',
      'Liste A de l’amiante : la plus surveillée',
      'Ce qu’il y a au-dessus n’est pas visible sans démontage'
    ]
  },
  {
    // 18 dossiers
    motif: /[ée]valuation p[ée]riodique/i,
    titre: 'Évaluation périodique',
    schema: 'amiante',
    points: [
      'Ce que le rapport impose quand l’amiante est là mais en bon état',
      'On ne retire rien : on revient voir, tous les trois ans',
      'C’est une obligation qui suit le logement, donc son propriétaire'
    ]
  },

  /* ---- Les termites et le bois. Les mots que vous citez : le rapport les
     emploie sans jamais les définir. ------------------------------------- */
  {
    // 8 dossiers
    motif: /concr[ée]tions?/i,
    titre: 'Concrétion',
    schema: 'termites',
    points: [
      'Un dépôt dur formé par les termites, mélange de terre et de salive',
      'Il bouche les fentes et tapisse les galeries',
      'C’est un indice : les termites sont passés là',
      'On le trouve souvent au pied des murs et sur les bois enterrés'
    ]
  },
  {
    // 8 dossiers
    motif: /r[ée]ticulitermes?/i,
    titre: 'Reticulitermes',
    schema: 'termites',
    points: [
      'Le nom savant du termite souterrain, celui de France métropolitaine',
      'Il vit dans le sol et remonte vers le bois',
      'Il fuit la lumière : il creuse sans jamais sortir',
      'D’où la surface intacte au-dessus d’un bois vidé'
    ]
  },
  {
    // 8 dossiers
    motif: /galeries?[- ]tunnels?|\bgaleries?\b/i,
    titre: 'Galerie',
    schema: 'termites',
    points: [
      'Le couloir creusé dans le bois, ou construit en terre le long d’un mur',
      'La galerie-tunnel est un tube de terre qui traverse un obstacle',
      'Elle permet aux termites d’atteindre le bois sans voir le jour'
    ]
  },
  {
    // 8 dossiers
    motif: /poin[çc]ons?\b/i,
    titre: 'Poinçon',
    schema: 'termites',
    points: [
      'La pointe avec laquelle le diagnostiqueur sonde le bois',
      'Un bois sain résiste, un bois vidé s’enfonce',
      'C’est l’outil du diagnostic termites, avec le maillet'
    ]
  },

  /* ---- Le bâti : les mots d'architecture que les rapports emploient comme
     s'ils allaient de soi. ----------------------------------------------- */
  {
    // 33 dossiers
    motif: /embrasures?/i,
    titre: 'Embrasure',
    schema: 'surface',
    points: [
      'L’épaisseur du mur autour d’une porte ou d’une fenêtre',
      'Le recoin où l’on se tient pour regarder dehors',
      'Elle ne compte pas dans la surface habitable'
    ]
  },
  {
    // 37 dossiers
    motif: /cloisons?\b/i,
    titre: 'Cloison',
    schema: 'surface',
    points: [
      'Un mur intérieur qui ne porte rien',
      'On peut l’abattre — un mur porteur, non',
      'Son emprise se déduit de la surface habitable'
    ]
  },
  {
    // 29 dossiers
    motif: /plinthes?\b/i,
    titre: 'Plinthe',
    schema: 'surface',
    points: [
      'La baguette en bas du mur, au raccord du sol',
      'Souvent peinte, souvent ancienne : le plomb s’y cache',
      'Souvent en bois : les termites la traversent'
    ]
  },

  /* ---- Le DPE et les risques. ------------------------------------------ */
  {
    // 26 dossiers
    motif: /valeurs? par d[ée]faut/i,
    titre: 'Valeur par défaut',
    schema: 'dpe',
    points: [
      'Ce que le logiciel met quand on ne sait pas',
      'Mur d’époque inconnue : on prend la valeur la plus défavorable',
      'Beaucoup de valeurs par défaut : le DPE est pessimiste',
      'Les justificatifs fournis les remplacent — cela peut changer la classe'
    ]
  },
  {
    // 38 dossiers
    motif: /\bradon\b/i,
    titre: 'Radon',
    schema: 'risques',
    points: [
      'Un gaz radioactif naturel, issu du sous-sol granitique',
      'Il n’a ni odeur ni couleur, il s’accumule dans les pièces basses',
      'Le classement est communal : il dit le potentiel, pas votre mesure',
      'Aérer suffit dans la plupart des cas ; se mesurer coûte peu'
    ]
  },
  {
    // 31 dossiers
    motif: /sismicit[ée]/i,
    titre: 'Sismicité',
    schema: 'risques',
    points: [
      'La zone sismique de la commune, de 1 (très faible) à 5 (forte)',
      'Elle commande les règles de construction, pas un danger immédiat',
      'C’est une information sur le terrain, pas sur le logement'
    ]
  },
  {
    // 31 dossiers
    motif: /\bSIS\b|secteurs? d.information sur les sols/i,
    titre: 'SIS',
    schema: 'risques',
    points: [
      'Secteur d’information sur les sols',
      'Un terrain où l’État sait qu’une pollution a existé',
      'Il doit être signalé à l’acheteur',
      'Il ne dit pas que votre sol est pollué : il dit qu’il faut regarder'
    ]
  },
  {
    // 31 dossiers
    motif: /zonages?\b/i,
    titre: 'Zonage',
    schema: 'risques',
    points: [
      'Une carte officielle qui découpe le territoire',
      'L’état des risques recopie ces cartes, il ne visite pas le terrain',
      'Être en zone ne veut pas dire être touché'
    ]
  }
];
