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
        /*
         * Deux fautes tenaient dans cette phrase. Le mot « coché » décrivait une
         * lecture que le moteur ne fait pas — les cases du formulaire sont des
         * images, seules les phrases rédigées sont lues. Et un seul détecteur
         * négatif suffisait à la déclencher, alors que la sismicité, le radon,
         * les argiles, la pollution des sols, les PPRT et l'inondation n'avaient
         * pas été regardés.
         */
        return {
          etat: 'dit',
          phrase:
            'Parmi les risques que nous savons lire, aucun n’est signalé ici — et nous n’en lisons qu’une partie. La liste complète est dans le tableau de votre état des risques : vérifiez-la, et comparez avec Géorisques.'
        };
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
  },

  {
    id: 'radon',
    terme: 'Radon',
    definition:
      'Un gaz radioactif naturel, sans odeur ni couleur, qui sort du sous-sol granitique et s’accumule dans les pièces mal ventilées.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          {
            texte:
              'L’état des risques ne mesure rien : il dit seulement dans quelle zone se trouve la commune, sur une échelle de 1 à 3. C’est une carte du sous-sol, pas une analyse de votre logement.'
          },
          {
            texte:
              'Zone 1 : potentiel faible. Zone 2 : faible, mais avec des failles qui peuvent faire remonter le gaz. Zone 3 : potentiel significatif — une partie de la Gironde et tout le Massif central y sont.'
          }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            /*
             * Le piège que la fiche d'information annexée entretient — et qu'un
             * brief antérieur avait déjà commis. Elle écrit « le niveau moyen
             * dans l'habitat français est inférieur à 100 Bq/m³ » : c'est une
             * MOYENNE CONSTATÉE, pas une limite. La fiche ne cite jamais le
             * seuil, qui est trois fois plus haut.
             */
            texte:
              'Le chiffre à retenir est 300 becquerels par mètre cube : c’est à partir de là que le code de la santé publique demande d’agir. Les 100 Bq/m³ que citent les fiches d’information sont la moyenne des logements français, pas une limite à ne pas dépasser.'
          },
          {
            texte:
              'Le risque n’est pas immédiat : c’est une exposition de longue durée qui compte, et elle est la deuxième cause de cancer du poumon après le tabac.'
          }
        ]
      },
      {
        rang: 6,
        bribes: [
          {
            texte:
              'Le premier geste ne coûte rien : aérer, et vérifier que les grilles de ventilation ne sont pas bouchées. Le radon se dilue dès que l’air circule.'
          },
          {
            texte:
              'Pour savoir où l’on en est, il faut mesurer : un dosimètre se pose deux mois en période de chauffe, dans la pièce de vie. C’est la seule façon de connaître le chiffre de son propre logement.'
          }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const erp = trouve(diagnostics, 'erp');
      if (!erp) return { etat: 'absent' };
      const zone = /radon \(niveau (\d)\)/i.exec(erp.verdict)?.[1];
      if (!zone)
        return {
          etat: 'muet',
          phrase: 'Votre état des risques ne mentionne pas de zone à potentiel radon.'
        };
      return {
        etat: 'dit',
        phrase:
          zone === '3'
            ? 'Votre commune est en zone 3, celle du potentiel le plus fort : une mesure chez vous a du sens.'
            : `Votre commune est en zone ${zone}. Le zonage porte sur le sous-sol de la commune, pas sur votre logement : seule une mesure dirait ce qu’il en est chez vous.`
      };
    }
  }
];
