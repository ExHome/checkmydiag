/**
 * Les documents de copropriété, contrôlés au regard de leur propre cadre légal.
 *
 * Un diagnostic technique global et un projet de plan pluriannuel de travaux
 * n'ont pas de modèle imposé — contrairement au DPE ou à l'état de
 * l'installation électrique, dont l'arrêté fixe jusqu'à la mise en page. D'un
 * cabinet à l'autre, ils n'ont ni le même plan, ni la même longueur, ni le même
 * prix. En extraire des données chiffrées de façon fiable serait une illusion.
 *
 * En revanche, la loi dit exactement ce qu'ils doivent **contenir**. Et ça, on
 * peut le vérifier : un volet manquant se voit, quel que soit le plan du
 * rapport. C'est le contrôle qu'un professionnel fait en ouvrant le document, et
 * que personne ne remet au conseil syndical.
 *
 * Les textes, vérifiés :
 *  - DTG  — art. L731-1 du code de la construction et de l'habitation :
 *           quatre volets, plus l'évaluation du coût et de la liste des travaux
 *           nécessaires dans les dix ans ;
 *  - PPPT — art. 14-2 de la loi n° 65-557 du 10 juillet 1965 : liste des
 *           travaux, niveau de performance, estimation sommaire du coût et
 *           hiérarchisation, proposition d'échéancier.
 *
 * On signale ce qui manque. On n'affirme jamais qu'un rapport est bon : un volet
 * présent n'est pas un volet bien fait, et ce n'est pas à un programme d'en
 * juger.
 */
import type { PointDeControle } from '../modele';
import { compact } from './texte';
import type { GenreDocument } from './nature';

interface Volet {
  /** Le nom du volet, dans les mots de la loi. */
  nom: string;
  /** Ce que le lecteur doit y trouver, dans les siens. */
  quoi: string;
  /** Les formes sous lesquelles un rapport l'annonce. */
  marques: RegExp[];
}

/** Les quatre volets de l'article L731-1, dans l'ordre du texte. */
const VOLETS_DTG: Volet[] = [
  {
    nom: 'l’état apparent des parties communes et des équipements communs',
    quoi: 'ce que valent aujourd’hui la toiture, les façades, les cages d’escalier, la chaufferie',
    marques: [
      /etatapparentdespartiescommunes/,
      /analysedeletatapparent/,
      /etatapparentdesequipementscommuns/,
      /etatdespartiescommunesetdesequipements/
    ]
  },
  {
    nom: 'l’état technique au regard des obligations légales et réglementaires',
    quoi: 'ce que l’immeuble doit à la réglementation et qu’il ne respecte peut-être plus',
    marques: [
      /obligationslegalesetreglementaires/,
      /etattechniquedelimmeuble/,
      /auregarddesobligationslegales/,
      /conformitereglementairedelimmeuble/
    ]
  },
  {
    nom: 'l’analyse des améliorations possibles de la gestion technique et patrimoniale',
    quoi: 'ce que la copropriété gagnerait à changer dans sa façon de gérer son bâtiment',
    marques: [
      /gestiontechniqueetpatrimoniale/,
      /ameliorationspossibles/,
      /analysedesameliorations/,
      /ameliorationdelagestion/
    ]
  },
  {
    nom: 'le diagnostic de performance énergétique de l’immeuble',
    quoi: 'ce que l’immeuble entier consomme, et sa classe',
    marques: [
      /diagnosticdeperformanceenergetique/,
      /dpecollectif/,
      /performanceenergetiqueetclimatique/,
      /auditenergetique/
    ]
  }
];

/** Les quatre composantes de l'article 14-2 pour le plan de travaux. */
const VOLETS_PPPT: Volet[] = [
  {
    nom: 'la liste des travaux nécessaires',
    quoi: 'ce qu’il faudra faire, poste par poste',
    marques: [/listedestravaux/, /travauxnecessaires/, /programmedetravaux/, /listedesactions/]
  },
  {
    nom: 'l’estimation du niveau de performance',
    quoi: 'ce que l’immeuble atteindrait une fois ces travaux faits',
    marques: [/niveaudeperformance/, /performanceapre?st?ravaux/, /gainenergetique/, /scenario/]
  },
  {
    nom: 'l’estimation sommaire du coût et sa hiérarchisation',
    quoi: 'ce que ça coûte, et par quoi commencer',
    marques: [
      /estimationsommaire/,
      /estimationducout/,
      /hierarchisation/,
      /priorisation/,
      /coutestimatif/
    ]
  },
  {
    nom: 'la proposition d’échéancier',
    quoi: 'sur quelles années les travaux se répartissent',
    marques: [/echeancier/, /calendrierdestravaux/, /planningprevisionnel/, /sur10ans|surdixans/]
  }
];

/** L'évaluation décennale, propre au DTG (art. L731-1, dernier alinéa). */
const DECENNALE: RegExp[] = [
  /dixprochainesannees/,
  /10prochainesannees/,
  /surlesdixans/,
  /evaluationsommairedu?cout/,
  /listedestravauxnecessaires/
];

function presente(texte: string, marques: RegExp[]): boolean {
  return marques.some((m) => m.test(texte));
}

/**
 * Ce qui manque à un document de copropriété pour être complet.
 *
 * Rendu sous forme de points de contrôle : ce sont exactement les mêmes objets
 * que les rapports périmés ou les incohérences de chiffres, et ils se lisent au
 * même endroit. Un volet manquant est un défaut du dossier, pas une curiosité.
 */
export function controlerCopropriete(genre: GenreDocument, lignes: string[]): PointDeControle[] {
  if (genre !== 'dtg' && genre !== 'pppt') return [];

  const texte = compact(lignes.join(' '));
  const volets = genre === 'dtg' ? VOLETS_DTG : VOLETS_PPPT;
  const article =
    genre === 'dtg'
      ? 'l’article L. 731-1 du code de la construction et de l’habitation'
      : 'l’article 14-2 de la loi du 10 juillet 1965';
  const nomCourt = genre === 'dtg' ? 'Le diagnostic technique global' : 'Le plan de travaux';

  const points: PointDeControle[] = [];
  const manquants = volets.filter((v) => !presente(texte, v.marques));

  for (const v of manquants) {
    points.push({
      titre: `${nomCourt} ne traite pas ${v.nom}`,
      explication: `${article.charAt(0).toUpperCase()}${article.slice(1)} impose ce volet : on doit y trouver ${v.quoi}. Rien de tel n’a été repéré dans le document.`,
      quoiFaire:
        'Demandez au syndic la partie manquante avant de faire voter quoi que ce soit : un document incomplet ne remplit pas son obligation, et l’assemblée délibère alors sur une base tronquée.',
      genre: 'manque'
    });
  }

  // L'évaluation décennale n'est pas un volet parmi d'autres : c'est elle qui
  // sert à provisionner le fonds de travaux.
  if (genre === 'dtg' && !presente(texte, DECENNALE)) {
    points.push({
      titre: 'Le diagnostic technique global ne chiffre pas les travaux des dix ans à venir',
      explication:
        'L’article L. 731-1 demande une évaluation sommaire du coût et une liste des travaux nécessaires à la conservation de l’immeuble dans les dix prochaines années. C’est ce chiffrage qui sert à calibrer le fonds de travaux.',
      quoiFaire:
        'Sans lui, la copropriété ne sait pas ce qu’elle doit provisionner. Réclamez-le au diagnostiqueur : il fait partie de la mission.',
      genre: 'manque'
    });
  }

  return points;
}

/** Les volets attendus d'un genre — pour les montrer, pas seulement les compter. */
export function voletsAttendus(genre: GenreDocument): { nom: string; quoi: string }[] {
  const volets = genre === 'dtg' ? VOLETS_DTG : genre === 'pppt' ? VOLETS_PPPT : [];
  return volets.map(({ nom, quoi }) => ({ nom, quoi }));
}

/** Quels volets sont présents, pour l'affichage détaillé. */
export function voletsPresents(genre: GenreDocument, lignes: string[]): boolean[] {
  const volets = genre === 'dtg' ? VOLETS_DTG : genre === 'pppt' ? VOLETS_PPPT : [];
  const texte = compact(lignes.join(' '));
  return volets.map((v) => presente(texte, v.marques));
}
