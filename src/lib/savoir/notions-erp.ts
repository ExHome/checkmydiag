/**
 * Les notions de l'état des risques (ERP).
 *
 * Ce document ne dit rien du logement : il dit ce que le terrain risque. D'où
 * une règle d'écriture particulière — on ne parle jamais de « défaut ».
 */
import { trouve, type Notion } from './socle';

export const NOTIONS_ERP: Notion[] = [
  {
    id: 'erp',
    terme: 'État des risques',
    definition:
      'Le document qui recense les risques connus à l’adresse du bien — inondation, séisme, argiles, pollution, installations classées — d’après les cartes officielles.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Il informe l’acheteur ou le locataire avant qu’il s’engage.' },
          { texte: 'Il décrit une commune et une parcelle, jamais l’état du bâtiment.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Un risque coché ne veut pas dire qu’il s’est produit : il dit que la zone y est exposée.'
          },
          { texte: 'Il conditionne ce que votre assurance couvrira, et à quelles conditions.' }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Il est rempli à partir des arrêtés préfectoraux et des cartes officielles, sans visite du bien.'
          },
          { texte: 'Il doit dater de moins de six mois au jour de la signature.' }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const erp = trouve(diagnostics, 'erp');
      if (!erp) return { etat: 'absent' };
      if (erp.schema?.genre === 'risques') {
        const cites = erp.schema.risques.filter((r) => r.niveau !== 'bon').map((r) => r.nom);
        if (cites.length)
          return { etat: 'dit', phrase: `Votre adresse est exposée à : ${cites.join(', ')}.` };
        return { etat: 'dit', phrase: 'Aucun risque n’est coché à votre adresse dans ce document.' };
      }
      return { etat: 'dit', phrase: erp.verdict };
    }
  },

  {
    id: 'retrait-gonflement',
    terme: 'Retrait-gonflement des argiles',
    definition:
      'Le mouvement d’un sol argileux qui se rétracte en séchant et gonfle en se gorgeant d’eau, et fait travailler ce qui est posé dessus.',
    niveaux: [
      {
        rang: 1,
        bribes: [
          { texte: 'L’argile se comporte comme une éponge : elle prend et rend l’eau.' },
          { texte: 'Le sol descend l’été, remonte l’hiver — de quelques centimètres.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'C’est le premier risque naturel en France par le nombre de maisons concernées, loin devant l’inondation.',
            clips: ['erp']
          },
          { texte: 'Il touche surtout les maisons individuelles peu fondées, pas les immeubles.' }
        ]
      },
      {
        rang: 4,
        bribes: [
          { texte: 'Des fissures en escalier, qui suivent les joints, souvent aux angles et près des ouvertures.' },
          { texte: 'Elles s’ouvrent et se referment au fil des saisons : c’est la signature du phénomène.' },
          { texte: 'Dans les cas graves, la structure est atteinte et la reprise coûte très cher.' }
        ]
      },
      {
        rang: 5,
        bribes: [
          { texte: 'Une sécheresse marquée, puis un hiver pluvieux.' },
          { texte: 'Un arbre trop proche, qui pompe l’eau du sol d’un seul côté de la maison.' },
          { texte: 'Une fuite de canalisation enterrée, qui gorge le terrain localement.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          {
            texte:
              'Ça ne se répare pas côté maison : c’est le terrain. On agit sur l’eau — gouttières, drainage, distance des arbres.'
          },
          {
            texte:
              'La reconnaissance de catastrophe naturelle par arrêté conditionne la prise en charge par l’assurance.',
            clips: ['erp']
          },
          { texte: 'Depuis 2020, une étude de sol est obligatoire pour construire en zone exposée.' }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const erp = trouve(diagnostics, 'erp');
      if (!erp) return { etat: 'absent' };
      if (erp.schema?.genre === 'risques') {
        const argile = erp.schema.risques.find((r) => /argile|retrait|gonflement/i.test(r.nom));
        if (argile)
          return {
            etat: 'dit',
            phrase: `Votre état des risques mentionne ce point : ${argile.nom}${argile.detail ? ` — ${argile.detail}` : ''}.`
          };
        return { etat: 'dit', phrase: 'Votre état des risques ne mentionne pas le retrait-gonflement des argiles.' };
      }
      return { etat: 'muet', phrase: 'L’état des risques est là, mais son détail n’a pas pu être lu.' };
    }
  }
];
