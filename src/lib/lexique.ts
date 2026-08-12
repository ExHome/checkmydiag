/**
 * Les mots qu'on ne peut pas employer sans les expliquer.
 *
 * Le retour au client emploie forcément des termes de la profession — passoire,
 * audit, DGI, opposable. Les éviter appauvrirait le propos ; les laisser sans
 * explication trahirait le devoir de conseil. On les définit donc une fois, ici,
 * et cette table sert aux deux usages : le mot souligné dans la phrase, et le
 * lexique en annexe du document remis.
 */
export interface Mot {
  /** Le mot tel qu'il apparaît en annexe. */
  nom: string;
  motif: RegExp;
  definition: string;
}

export const LEXIQUE: Mot[] = [
  {
    nom: 'Passoire énergétique',
    motif: /passoires? [ée]nerg[ée]tiques?/i,
    definition:
      'Un logement classé F ou G. Le mot est officiel : il déclenche le gel du loyer, puis l’interdiction de louer.'
  },
  {
    nom: 'Audit énergétique',
    motif: /audits? [ée]nerg[ée]tiques?/i,
    definition:
      'Une étude plus poussée que le DPE, avec des scénarios de travaux chiffrés. Elle doit être remise à l’acheteur, en plus du DPE, pour vendre une maison mal classée.'
  },
  {
    nom: 'DGI',
    motif: /\bDGI\b/,
    definition:
      'Danger grave et immédiat. Le diagnostiqueur coupe le gaz sur place le jour même et prévient le distributeur : seule une intervention professionnelle permet de le remettre en service.'
  },
  {
    nom: 'Gel du loyer',
    motif: /gel[ée]?s? (?:du |des )?loyers?|loyer est gel[ée]/i,
    definition:
      'Le loyer ne peut plus être augmenté : ni révision annuelle, ni réévaluation entre deux locataires.'
  },
  {
    nom: 'Opposable',
    motif: /\bopposables?\b/i,
    definition:
      'Le document engage juridiquement. Un acheteur qui constate une erreur peut se retourner contre le diagnostiqueur.'
  },
  {
    nom: 'Devis',
    motif: /devis/i,
    definition:
      'Un chiffrage écrit par un artisan. C’est la pièce qui transforme une anomalie du rapport en montant discutable devant le vendeur.'
  },
  {
    nom: 'Déperdition',
    motif: /d[ée]perditions?/i,
    definition: 'La chaleur qui s’échappe du logement, paroi par paroi.'
  },
  {
    nom: 'Sans démontage',
    motif: /sans d[ée]montage/i,
    definition:
      'Le diagnostiqueur regarde, il ne casse rien. Pas de trou, pas de cloison déposée : ce qui est caché reste inconnu. C’est la limite commune à tous ces diagnostics.'
  },
  {
    nom: 'Vide sanitaire',
    motif: /vide sanitaire/i,
    definition:
      'L’espace d’air laissé entre le sol et le plancher du rez-de-chaussée. Il protège de l’humidité, mais refroidit le plancher.'
  },
  {
    nom: 'Combles',
    motif: /combles?/i,
    definition:
      'Le volume situé sous la toiture. Isoler leur plancher est le chantier le moins cher et le plus rentable de tous.'
  },
  {
    nom: 'Anomalie',
    motif: /anomalies?/i,
    definition:
      'Un point de l’installation qui ne respecte pas la norme de sécurité contrôlée. Ce n’est pas une panne : l’installation fonctionne, mais elle expose à un risque.'
  }
];

/** Les mots du lexique effectivement employés dans ces textes. */
export function motsEmployes(textes: string[]): Mot[] {
  return LEXIQUE.filter((mot) => textes.some((t) => mot.motif.test(t)));
}
