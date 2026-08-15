/**
 * Le troisième niveau : pour ceux qui veulent vraiment savoir.
 *
 * Rien d'utile à la vente ici — c'est du savoir pour le plaisir, derrière une
 * icône de cerveau. La vie du termite, pourquoi l'amiante était un matériau
 * miracle, ce qui fait gonfler l'argile.
 *
 * Même registre antisèche : des faits, pas des phrases.
 */
import type { TypeDiag } from '../modele';

export interface Curiosite {
  titre: string;
  points: string[];
}

export const CURIOSITES: Partial<Record<TypeDiag, Curiosite>> = {
  termites: {
    titre: 'La vie du termite',
    points: [
      'Colonie de 100 000 à plusieurs millions d’individus',
      'Une reine pond jusqu’à 30 000 œufs par jour, et vit 20 ans',
      'Trois castes : ouvriers (aveugles), soldats (mandibules), reproducteurs (ailés)',
      'Ils mangent la cellulose du bois — mais ne la digèrent pas eux-mêmes',
      'Des micro-organismes dans leur intestin le font à leur place',
      'Ils fuient la lumière et l’air sec : d’où les tunnels de terre',
      'Progression : quelques mètres par an, en silence'
    ]
  },

  amiante: {
    titre: 'Pourquoi on en a mis partout',
    points: [
      'Fibre minérale naturelle, extraite de roches',
      'Résiste au feu jusqu’à 1 000 °C, isole, ne pourrit pas, coûte peu',
      'Surnommée « magic mineral » au XXᵉ siècle',
      'Une fibre mesure 400 fois moins qu’un cheveu de diamètre',
      'Trop fine pour être arrêtée par les poumons : elle s’y plante',
      'Le cancer apparaît 20 à 40 ans après l’exposition',
      'Interdite en France en 1997, après l’Islande (1983)'
    ]
  },

  plomb: {
    titre: 'Pourquoi le plomb dans la peinture',
    points: [
      'La céruse (carbonate de plomb) donne un blanc très couvrant',
      'Elle résiste à l’humidité : idéale pour les boiseries',
      'Utilisée depuis l’Antiquité, interdite en peinture en 1949',
      'Le corps le confond avec le calcium et le stocke dans les os',
      'Chez l’enfant, il passe dans le cerveau en développement',
      'Une dose infime suffit : quelques grains de poussière par jour',
      'Le saturnisme est une maladie à déclaration obligatoire'
    ]
  },

  dpe: {
    titre: 'D’où sort le calcul',
    points: [
      'Méthode 3CL : un modèle thermique du bâtiment, pas des relevés',
      'Il simule 12 mois de météo type, pièce par pièce',
      'Énergie finale = ce que vous achetez. Primaire = ce qu’il a fallu produire',
      'Coefficient de 1,9 pour l’électricité depuis 2026 : pertes de production et de transport',
      'D’où un logement tout électrique noté plus sévèrement qu’il n’y paraît',
      'Les DPE d’avant juillet 2021 utilisaient les factures : ils ne sont plus valables'
    ]
  },

  gaz: {
    titre: 'La chimie de la flamme',
    points: [
      'Combustion complète : méthane + oxygène → CO₂ + eau',
      'Manque d’air → combustion incomplète → monoxyde de carbone (CO)',
      'Le CO se fixe sur l’hémoglobine 200 fois mieux que l’oxygène',
      'Le sang circule, mais ne transporte plus rien',
      'Maux de tête, nausées, puis perte de connaissance',
      'Une flamme jaune et molle au lieu de bleue : premier signe visible'
    ]
  },

  erp: {
    titre: 'Ce qui fait gonfler l’argile',
    points: [
      'Les argiles gonflantes sont des smectites, en feuillets microscopiques',
      'L’eau s’intercale entre les feuillets et les écarte',
      'Le volume peut varier de 10 % entre saison sèche et saison humide',
      'Un sol qui descend de 5 cm suffit à fissurer un mur',
      'Les grands arbres aggravent tout : un chêne boit 300 litres par jour',
      'Premier poste d’indemnisation « catastrophe naturelle » en France'
    ]
  },

  electricite: {
    titre: 'Comment le différentiel voit la fuite',
    points: [
      'Il compare le courant qui part et celui qui revient',
      'Normalement, les deux sont égaux au milliampère près',
      'Une différence = du courant parti ailleurs — par la terre, ou par vous',
      'Au-delà de 30 mA, il coupe en moins de 30 millisecondes',
      '30 mA : le seuil sous lequel le cœur ne se met pas en fibrillation',
      'Un disjoncteur ordinaire, lui, ne protège que les fils'
    ]
  },

  carrez: {
    titre: 'D’où vient cette loi',
    points: [
      'Loi de 1996, du nom du député Gilles Carrez',
      'Née d’un abus : des lots vendus bien plus petits qu’annoncés',
      'Ne s’applique qu’aux lots de copropriété de plus de 8 m²',
      'Le vendeur qui se trompe de plus de 5 % rembourse au prorata',
      'L’acheteur a un an après l’acte pour le demander',
      'Aucune obligation de mesure pour une maison individuelle'
    ]
  }
};
