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
      'Électricité : ×2,3 (pertes de production et transport)',
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
  }
];
