/**
 * Les notions de la surface.
 *
 * Trois surfaces coexistent pour le même logement, et personne ne le dit jamais
 * au vendeur : Carrez pour vendre, Boutin pour louer, surface de référence pour
 * le DPE. C'est la première source d'incompréhension d'un dossier.
 */
import { trouve, type Notion } from './socle';

export const NOTIONS_CARREZ: Notion[] = [
  {
    id: 'loi-carrez',
    terme: 'Loi Carrez',
    definition:
      'La règle qui définit la surface à écrire dans un acte de vente en copropriété : le sol des pièces closes, sous une hauteur d’au moins 1,80 m.',
    schema: 'surface',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Elle donne un chiffre comparable d’un bien à l’autre, et opposable.' },
          { texte: 'On déduit les murs, les cloisons, les marches et les gaines.' },
          { texte: 'Cave, garage, balcon et terrasse n’en font jamais partie.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Si la surface réelle est inférieure de plus de 5 % à celle de l’acte, l’acheteur peut demander une baisse du prix.',
            clips: ['rampant']
          },
          { texte: 'Il a un an après la signature pour le faire.' }
        ]
      },
      {
        rang: 7,
        bribes: [
          { texte: 'Le mesurage se fait pièce par pièce, au laser ou au mètre.' },
          {
            texte:
              'La surface habitable dite « Boutin », employée pour la location, se calcule autrement : elle exclut d’autres éléments.'
          }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const carrez = trouve(diagnostics, 'carrez');
      if (!carrez) return { etat: 'absent' };
      const surface = carrez.faits.find((f) => /superficie|surface/i.test(f.libelle));
      if (!surface)
        return { etat: 'muet', phrase: 'Le mesurage est dans votre dossier, mais son chiffre n’a pas pu être lu.' };
      return { etat: 'dit', phrase: `Votre rapport retient ${surface.valeur} au titre de la loi Carrez.` };
    }
  },

  {
    id: 'rampant',
    terme: 'Rampant',
    definition: 'La partie inclinée d’un toit, vue de l’intérieur : le plafond qui suit la pente.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Sous un rampant, la hauteur descend vite sous 1,80 m — et cette surface-là ne compte pas dans la loi Carrez.',
            clips: ['loi-carrez']
          },
          { texte: 'C’est la première cause d’écart entre la surface annoncée et la surface Carrez.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          {
            texte:
              'La surface reste utilisable — rangements, lit, bureau. Elle ne compte pas, elle n’est pas perdue.'
          }
        ]
      }
    ]
  }
];
