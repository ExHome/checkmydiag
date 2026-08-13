/**
 * Les notions de la maison — celles qu'on touche sur le schéma du DPE.
 *
 * L'ordre de mission les nomme une par une (§ 2) : toiture, isolation, murs,
 * fenêtres, plancher, ventilation, chauffage, eau chaude. Chacune est un point
 * de clic sur le dessin, et chacune sait répondre « et chez moi ? » à partir du
 * rapport déposé — ou avouer qu'elle ne peut pas.
 */
import type { Diagnostic, EtatIsolation, Isolation } from '../modele';
import { trouve, type ChezMoi, type Notion } from './socle';

/** Le schéma DPE du dossier, s'il a pu être lu. */
function dpe(diagnostics: Diagnostic[]): { diag: Diagnostic; schema: Extract<Diagnostic['schema'], { genre: 'dpe' }> } | null {
  const diag = trouve(diagnostics, 'dpe');
  if (!diag || diag.schema?.genre !== 'dpe') return null;
  return { diag, schema: diag.schema };
}

/**
 * Chaque paroi avec son genre et son nombre : les phrases sont fabriquées, donc
 * l'accord doit l'être aussi. « La toiture comme isolé » décrédibilise tout le
 * reste.
 */
const PAROIS: Record<keyof Isolation, { nom: string; accord: string; etre: string }> = {
  toit: { nom: 'la toiture', accord: 'ée', etre: 'est' },
  murs: { nom: 'les murs', accord: 'és', etre: 'sont' },
  fenetres: { nom: 'les fenêtres', accord: 'ées', etre: 'sont' },
  plancher: { nom: 'le plancher bas', accord: 'é', etre: 'est' }
};

const NOM_PAROI: Record<keyof Isolation, string> = {
  toit: PAROIS.toit.nom,
  murs: PAROIS.murs.nom,
  fenetres: PAROIS.fenetres.nom,
  plancher: PAROIS.plancher.nom
};

/**
 * Ce que le rapport dit de l'isolation d'une paroi. « Non renseigné » est une
 * réponse à part entière : c'est même la plus fréquente, et la taire
 * reviendrait à laisser croire que le logement est isolé.
 */
function paroi(cle: keyof Isolation) {
  return (diagnostics: Diagnostic[]): ChezMoi => {
    const lu = dpe(diagnostics);
    if (!lu) return { etat: 'absent' };

    const etat: EtatIsolation | undefined = lu.schema.isolation?.[cle];
    const { nom, accord, etre } = PAROIS[cle];

    if (etat === 'isole')
      return { etat: 'dit', phrase: `Votre rapport donne ${nom} comme isol${accord}.` };
    if (etat === 'nonIsole')
      return {
        etat: 'dit',
        phrase: `Votre rapport donne ${nom} comme non isol${accord} — c’est par là que la chaleur part.`
      };
    return {
      etat: 'muet',
      phrase: `Votre rapport ne dit pas si ${nom} ${etre} isol${accord}. Ne pas savoir n’est pas une bonne nouvelle : c’est une question à poser.`
    };
  };
}

/**
 * La part d'un poste dans la consommation, telle que le rapport la donne.
 * `sujet` s'écrit en toutes lettres, article compris : les phrases fabriquées
 * ne se rattrapent pas à coups de concaténation.
 */
function poste(motif: RegExp, sujet: string, complement: string) {
  return (diagnostics: Diagnostic[]): ChezMoi => {
    const lu = dpe(diagnostics);
    if (!lu) return { etat: 'absent' };

    const postes = lu.schema.postes ?? [];
    const total = postes.reduce((n, p) => n + p.kwh, 0);
    const cible = postes.find((p) => motif.test(p.nom));

    if (!cible || total === 0)
      return { etat: 'muet', phrase: `Votre rapport ne détaille pas la part ${complement}.` };

    return {
      etat: 'dit',
      phrase: `${sujet} pèse ${Math.round((cible.kwh / total) * 100)} % de la consommation retenue par votre DPE.`
    };
  };
}

export const NOTIONS_DPE: Notion[] = [
  {
    id: 'toiture',
    terme: 'Toiture',
    definition:
      'La paroi haute du logement : toit, combles perdus ou aménagés. C’est par elle que part le plus de chaleur, parce que l’air chaud monte.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: '25 à 30 % des déperditions d’une maison mal isolée, plus que toute autre paroi.', clips: ['deperdition'] },
          {
            texte:
              'C’est aussi la moins chère à traiter : dérouler un isolant dans des combles perdus se fait en une journée.',
            clips: ['isolation']
          }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Combles perdus : isolant soufflé ou déroulé, sans toucher à la charpente.' },
          { texte: 'Combles aménagés : isolation sous rampants, ou par l’extérieur si la couverture est refaite.', clips: ['rampant'] },
          { texte: 'Toujours vérifier la ventilation après coup : un comble isolé et étanche condense.', clips: ['ventilation'] }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Le diagnostiqueur relève le type d’isolant et son épaisseur quand il peut les voir, et retient une valeur par défaut sinon — pénalisante.',
            clips: ['resistance-thermique']
          }
        ]
      }
    ],
    chezMoi: paroi('toit')
  },

  {
    id: 'isolation',
    terme: 'Isolation',
    definition:
      'La couche de matériau qui freine le passage de la chaleur entre l’intérieur et l’extérieur. Elle ne produit rien : elle retient.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Elle garde la chaleur l’hiver, et la tient dehors l’été.' },
          {
            texte:
              'Son efficacité se mesure par une résistance thermique — plus elle est élevée, moins la chaleur passe.',
            clips: ['resistance-thermique']
          }
        ]
      },
      {
        rang: 3,
        bribes: [
          { texte: 'C’est le premier levier du DPE : chauffer moins, plutôt que chauffer autrement.' },
          {
            texte:
              'Un mur isolé change aussi le confort : une paroi froide se ressent même quand la pièce est à 20 °C.'
          }
        ]
      },
      {
        rang: 4,
        bribes: [
          {
            texte:
              'Mal posée, elle crée des zones où elle s’interrompt — un pont thermique — et la moisissure s’y installe.',
            clips: ['pont-thermique']
          },
          { texte: 'Isoler sans ventiler enferme l’humidité produite par les occupants.', clips: ['ventilation'] }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const lu = dpe(diagnostics);
      if (!lu) return { etat: 'absent' };
      const isolation = lu.schema.isolation;
      if (!isolation)
        return { etat: 'muet', phrase: 'Votre rapport ne dit pas ce qui est isolé, paroi par paroi.' };

      const nommees = (cherche: EtatIsolation): string[] =>
        (Object.keys(NOM_PAROI) as (keyof Isolation)[])
          .filter((p) => isolation[p] === cherche)
          .map((p) => NOM_PAROI[p]);

      const nues = nommees('nonIsole');
      const faites = nommees('isole');
      const inconnues = nommees('inconnu');

      if (!nues.length && !faites.length)
        return { etat: 'muet', phrase: 'Votre rapport ne conclut sur aucune paroi.' };

      const morceaux: string[] = [];
      if (faites.length) morceaux.push(`${faites.join(', ')} : isolé.`);
      if (nues.length) morceaux.push(`${nues.join(', ')} : sans isolant.`);
      if (inconnues.length) morceaux.push(`${inconnues.join(', ')} : non renseigné.`);
      return { etat: 'dit', phrase: morceaux.join(' ') };
    }
  },

  {
    id: 'resistance-thermique',
    terme: 'Résistance thermique',
    definition:
      'La mesure de ce qu’un matériau freine la chaleur, notée R et exprimée en m²·K/W. Plus R est grand, mieux la paroi isole.',
    niveaux: [
      {
        rang: 1,
        bribes: [
          { texte: 'R dépend de deux choses : l’épaisseur posée et la nature de l’isolant.' },
          { texte: 'Elle s’additionne : deux couches de R = 3,5 donnent R = 7.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'C’est le seul chiffre qui permet de comparer deux isolants entre eux — une épaisseur seule ne dit rien.'
          },
          { texte: 'Les aides aux travaux imposent un R minimal : R ≥ 7 en combles perdus, R ≥ 3,7 en murs.' }
        ]
      }
    ]
  },

  {
    id: 'murs',
    terme: 'Murs',
    definition:
      'Les parois verticales qui séparent le logement de l’extérieur. Deuxième poste de déperdition, et le plus coûteux à traiter.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: '20 à 25 % des pertes. Cher à isoler, mais c’est ce qui change le plus le confort.', clips: ['deperdition'] },
          { texte: 'Un mur froid se ressent même dans une pièce chauffée : le corps rayonne vers lui.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          {
            texte:
              'Par l’extérieur : plus efficace, traite les ponts thermiques, mais change la façade et coûte cher.',
            clips: ['pont-thermique']
          },
          { texte: 'Par l’intérieur : moins cher, mais mange de la surface habitable et laisse les jonctions.', clips: ['isolation'] }
        ]
      }
    ],
    chezMoi: paroi('murs')
  },

  {
    id: 'fenetres',
    terme: 'Fenêtres',
    definition:
      'Les menuiseries vitrées. Elles pèsent moins qu’on ne le croit dans les déperditions, mais elles se voient et s’entendent.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          {
            texte:
              '10 à 15 % des pertes seulement. Les changer avant d’isoler les combles, c’est beaucoup dépenser pour peu gagner.',
            clips: ['toiture']
          },
          { texte: 'En revanche, elles règlent le bruit, les courants d’air et la sensation de paroi froide.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Double vitrage récent, ou survitrage quand la menuiserie est saine.' },
          {
            texte:
              'Remplacer des fenêtres dans un logement sans ventilation mécanique le rend étanche : l’humidité reste dedans.',
            clips: ['ventilation']
          }
        ]
      }
    ],
    chezMoi: paroi('fenetres')
  },

  {
    id: 'plancher-bas',
    terme: 'Plancher bas',
    definition:
      'Le sol du premier niveau habité, quand il donne sur une cave, un vide sanitaire, un garage ou directement sur la terre.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: '7 à 10 % des pertes : le poste le plus discret.', clips: ['deperdition'] },
          { texte: 'Souvent le plus simple à traiter — on isole par-dessous, sans toucher au logement.' }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Le diagnostiqueur ne peut renseigner ce plancher que s’il accède au dessous. Sans cave visitable, il retient une valeur par défaut.'
          }
        ]
      }
    ],
    chezMoi: paroi('plancher')
  },

  {
    id: 'ventilation',
    terme: 'Ventilation',
    definition:
      'Le renouvellement de l’air du logement : l’air vicié sort, l’air neuf entre. Par des grilles, ou par une VMC.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Elle évacue l’humidité que produisent les occupants — douches, cuisine, respiration.' },
          { texte: 'Elle évacue aussi le monoxyde de carbone d’un appareil à combustion.', clips: ['monoxyde-de-carbone'] }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Elle coûte de l’énergie : 20 à 25 % des déperditions passent par l’air renouvelé. On ne la supprime pas pour autant.',
            clips: ['deperdition']
          },
          { texte: 'Plus un logement est isolé et étanche, plus sa ventilation devient vitale.', clips: ['isolation'] }
        ]
      },
      {
        rang: 4,
        bribes: [
          { texte: 'Sans elle : condensation, moisissures, dégradation des peintures et de l’isolant.' },
          { texte: 'Boucher une grille pour ne plus sentir le courant d’air est le geste à ne jamais faire.' }
        ]
      }
    ],
    chezMoi: () => ({
      etat: 'muet',
      phrase:
        'Le DPE relève le type de ventilation, mais ne mesure pas si elle fonctionne. Sur ce point, seul un contrôle sur place conclut.'
    })
  },

  {
    id: 'pont-thermique',
    terme: 'Pont thermique',
    definition:
      'Zone du bâtiment où la barrière isolante est interrompue ou moins performante, ce qui facilite les échanges de chaleur.',
    schema: 'pont-thermique',
    niveaux: [
      {
        rang: 1,
        bribes: [
          { texte: 'Jonction d’un mur et d’un plancher, contour de fenêtre, attache de balcon.' },
          { texte: 'L’isolant s’arrête, le froid passe : comme un couloir dans un mur.' }
        ]
      },
      {
        rang: 4,
        bribes: [
          { texte: '5 à 10 % des déperditions, mais surtout des taches noires dans les angles.' },
          { texte: 'La paroi y est plus froide : la vapeur d’eau s’y condense, la moisissure suit.', clips: ['ventilation'] }
        ]
      },
      {
        rang: 6,
        bribes: [
          {
            texte:
              'Une isolation par l’extérieur les traite en continu. Par l’intérieur, ils subsistent presque toujours.',
            clips: ['isolation', 'murs']
          }
        ]
      }
    ],
    chezMoi: () => ({
      etat: 'muet',
      phrase:
        'Le DPE calcule les ponts thermiques à partir du bâti, mais ne les localise pas dans votre logement.'
    })
  },

  {
    id: 'chauffage',
    terme: 'Chauffage',
    definition:
      'Le système qui produit la chaleur du logement. Le DPE regarde autant la façon dont il la produit que la quantité consommée.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: 'C’est presque toujours le premier poste de consommation, loin devant les autres.' },
          {
            texte:
              'L’énergie compte autant que l’appareil : l’électricité est comptée ×2,3 en énergie primaire.',
            clips: ['energie-primaire']
          }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Changer d’abord ce qui fuit, ensuite ce qui chauffe : un bon appareil dans une passoire reste cher.', clips: ['isolation'] },
          { texte: 'Pompe à chaleur, chaudière à condensation, réseau de chaleur — selon l’énergie disponible.' }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Le calcul est conventionnel : 19 °C dans les pièces de vie, une occupation type, une météo de référence. Ce n’est pas votre facture.'
          }
        ]
      }
    ],
    chezMoi: poste(/chauff/i, 'Le chauffage', 'du chauffage')
  },

  {
    id: 'eau-chaude',
    terme: 'Eau chaude sanitaire',
    definition:
      'L’eau chaude des douches et des robinets — abrégée ECS dans les rapports. Elle se compte à part du chauffage.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: 'Deuxième poste dans un logement bien isolé, où le chauffage a fondu.' },
          { texte: 'Un ballon ancien perd sa chaleur en permanence, même sans qu’on tire d’eau.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Chauffe-eau thermodynamique, solaire, ou simplement un ballon mieux isolé et mieux réglé.' },
          { texte: 'Calorifuger les tuyaux qui traversent des locaux non chauffés.' }
        ]
      }
    ],
    chezMoi: poste(/eau chaude|ecs|sanitaire/i, 'L’eau chaude', 'de l’eau chaude')
  },

  {
    id: 'deperdition',
    terme: 'Déperdition',
    definition:
      'La chaleur qui s’échappe du logement à travers ses parois et par l’air renouvelé. C’est ce que le DPE cherche à chiffrer.',
    schema: 'perimetre',
    niveaux: [
      {
        rang: 1,
        bribes: [
          { texte: 'Toiture 25-30 %, murs 20-25 %, air renouvelé 20-25 %.', clips: ['toiture', 'murs', 'ventilation'] },
          { texte: 'Fenêtres 10-15 %, jonctions 5-10 %, plancher bas 7-10 %.', clips: ['fenetres', 'pont-thermique', 'plancher-bas'] }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Ces parts sont des ordres de grandeur moyens. Dans votre logement, elles dépendent de ce qui est déjà isolé.',
            clips: ['isolation']
          }
        ]
      }
    ]
  },

  {
    id: 'energie-primaire',
    terme: 'Énergie primaire',
    definition:
      'L’énergie qu’il a fallu produire pour vous livrer celle que vous consommez, transport et pertes compris. C’est l’unité de l’étiquette du DPE.',
    schema: 'energie',
    niveaux: [
      {
        rang: 1,
        bribes: [
          { texte: 'Électricité : ×2,3, à cause des pertes de production et de transport.' },
          { texte: 'Gaz, fioul, bois : ×1 — ce qui arrive au compteur est ce qui a été produit.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'C’est pourquoi un logement tout électrique est noté plus sévèrement qu’il ne coûte à chauffer.',
            clips: ['chauffage']
          }
        ]
      }
    ]
  }
];
