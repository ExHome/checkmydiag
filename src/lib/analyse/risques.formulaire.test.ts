import { describe, expect, it } from 'vitest';
import { analyserErp } from './risques';

/**
 * L'imprimé officiel de l'état des risques, tel qu'il sort du PDF.
 *
 * Il ne conclut rien : il propose les deux réponses côte à côte et coche d'une
 * croix — dont la place a changé entre deux millésimes du même éditeur. Le
 * produit le lisait pourtant comme une affirmation, parce que ses lignes
 * commencent par « L'immeuble est situé… ».
 *
 * Mesuré sur 63 volets : quarante-neuf annonçaient un « risque technologique »,
 * et pas un seul dossier ne portait de PPRt concerné. La pollution des sols
 * suivait le même chemin.
 */
const IMPRIME_VIERGE = [
  'État des Risques et Pollutions',
  "Situation de l'immeuble au regard de plans de prévention des risques technologiques [PPRt]",
  "L'immeuble est situé dans le périmètre d'un PPRt approuvé oui non x",
  "L'immeuble est situé dans le périmètre d'un PPRt prescrit oui non x",
  'Les risques technologiques pris en compte sont liés à : Risque Industriel Effet thermique Effet toxique',
  "L'immeuble est situé en secteur d'expropriation ou de délaissement oui non x",
  "Situation de l'immeuble au regard de la pollution des sols",
  "L'immeuble est situé dans un Secteur d'Information sur les Sols (SIS) oui non x",
  "L'immeuble est situé dans une commune de sismicité : Forte Moyenne Modérée Faible Très faible",
  'zone 5 zone 4 zone 3 zone 2 x zone 1',
  "L'immeuble se situe dans une Zone à Potentiel Radon : zone 3 zone 2 zone 1 x"
];

describe('l’imprimé officiel ne conclut rien', () => {
  it('n’annonce pas de risque technologique sur un formulaire vierge', () => {
    const d = analyserErp(IMPRIME_VIERGE, [1, 12]);
    expect(d.verdict).not.toMatch(/technologique/i);
  });

  it('n’annonce pas de pollution des sols sur un formulaire vierge', () => {
    const d = analyserErp(IMPRIME_VIERGE, [1, 12]);
    expect(d.verdict).not.toMatch(/pollution des sols/i);
  });

  it('lit toujours ce que la conclusion RÉDIGÉE affirme', () => {
    // La correction ne doit pas rendre le produit muet : les conclusions du
    // rapport, elles, affirment bien quelque chose sur ce bien-là.
    const d = analyserErp(
      [
        ...IMPRIME_VIERGE,
        'Selon les informations mises à disposition dans le Dossier Communal d’Information, le BIEN est ainsi concerné par :',
        '- Le risque Inondation et par la réglementation du PPRn Inondation approuvé le 05/12/2023'
      ],
      [1, 12]
    );
    expect(d.verdict).toMatch(/inondation/i);
  });

  it('lit toujours la ligne de tableau qui déclare l’argile', () => {
    const d = analyserErp(
      [...IMPRIME_VIERGE, 'Zonage du retrait-gonflement des argiles Oui Aléa Fort'],
      [1, 12]
    );
    expect(d.verdict).toMatch(/argiles/i);
  });
});
