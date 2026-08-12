/**
 * Montrer du doigt.
 *
 * Le lecteur a son rapport sous les yeux : plutôt que de lui servir un cours à
 * côté, on pointe la ligne qui compte et on l'explique. Les coordonnées viennent
 * de l'extraction du texte : on sait où chaque phrase se trouve sur la page.
 *
 * Les explications sont des puces, pas des paragraphes : trois ou quatre mots
 * par ligne, ce qui compte et rien d'autre.
 */
import type { PageTexte } from '../lignes';
import type { TypeDiag } from '../modele';

export interface Repere {
  /** Page du PDF où poser le repère (1-indexé). */
  page: number;
  /** Emplacement de la ligne, en unités PDF (origine en bas à gauche). */
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  titre: string;
  /** Identifiant du petit dessin qui illustre la notion. */
  schema?: string;
  /** L'explication, en puces courtes. */
  points: string[];
  /** La ligne du rapport elle-même : sert à la retrouver dans le texte. */
  extrait: string;
}

interface Cible {
  motif: RegExp;
  titre: string;
  /** Identifiant du petit dessin qui illustre la notion. */
  schema?: string;
  points: string[];
}

const CIBLES: Partial<Record<TypeDiag, Cible[]>> = {
  dpe: [
    {
      motif: /émet\s*[\d\s.,]+\s*kg\s*de\s*CO/i,
      titre: 'Les émissions de CO₂',
      schema: 'co2',
      points: [
        'Le gaz rejeté pour chauffer le logement',
        'Dépend de l’énergie : gaz et fioul en rejettent beaucoup',
        'Électricité et bois : beaucoup moins',
        'Donne la deuxième lettre du DPE'
      ]
    },
    {
      motif: /entre\s*[\d\s.,]+\s*€\s*et\s*[\d\s.,]+\s*€\s*par an/i,
      titre: 'Le coût annoncé',
      schema: 'cout',
      points: [
        'Compte : chauffage, eau chaude, clim, éclairage, ventilation',
        'Ne compte pas : électroménager, télé, box',
        'Calculé à 19 °C, occupation moyenne',
        'Ce n’est pas votre facture'
      ]
    },
    {
      motif: /Surface\s+(?:de référence|habitable)/i,
      titre: 'La surface de référence',
      schema: 'surface',
      points: [
        'Compte : pièces chauffées, couloirs, placards',
        'Ne compte pas : garage, cave, balcon',
        'Sert à calculer la note',
        'Différente de la surface de l’acte de vente'
      ]
    },
    {
      motif: /N°\s*ADEME/i,
      titre: 'Le numéro ADEME',
      points: [
        'Enregistrement dans la base publique de l’État',
        'Prouve que le DPE existe officiellement',
        'Sans lui : aucune valeur'
      ]
    },
    {
      motif: /[Vv]alable jusqu/i,
      titre: 'La date de fin',
      schema: 'validite',
      points: ['Un DPE vaut 10 ans', 'Après : à refaire pour vendre ou louer']
    }
  ],

  plomb: [
    {
      motif: /Total.*Non mesur.*Classe 0/i,
      titre: 'Le tableau qui résume tout',
      schema: 'classes',
      points: [
        'Seule la colonne « classe 3 » compte vraiment',
        'Classe 3 = peinture dégradée, qui fait de la poussière',
        'Classes 0, 1, 2 : aucune obligation',
        'Une seule classe 3 déclenche des travaux'
      ]
    },
    {
      motif: /classe 3/i,
      titre: 'Ce que déclenche une classe 3',
      points: [
        'Travaux obligatoires pour le propriétaire',
        'Occupants à prévenir',
        'Entreprises intervenant sur place à prévenir',
        'Validité réduite à 1 an pour une vente'
      ]
    }
  ],

  termites: [
    {
      motif: /(?:n'a pas été repéré|présence).{0,60}indice.{0,30}termites?/i,
      titre: 'La conclusion',
      points: [
        'Vaut pour ce qui était visible ce jour-là',
        'Rien n’a été démonté ni percé',
        'Validité : 6 mois seulement'
      ]
    },
    {
      motif: /arrêté préfectoral/i,
      titre: 'Pourquoi ce diagnostic',
      points: [
        'Obligatoire seulement dans les communes classées',
        'Votre commune est citée ici',
        'C’est le préfet qui décide'
      ]
    }
  ],

  electricite: [
    {
      motif: /Conclusion relative à l'évaluation des risques/i,
      titre: 'La conclusion, cochée à la main',
      schema: 'case',
      points: [
        'Deux phrases imprimées, une seule cochée',
        'Cherchez la coche : c’est votre résultat',
        'Un programme ne peut pas lire une case'
      ]
    },
    {
      motif: /différentiel/i,
      titre: 'Le point le plus important',
      points: [
        'Coupe le courant qui fuit vers une personne',
        'Son absence : l’anomalie la plus grave',
        'La plus fréquente dans les logements anciens'
      ]
    }
  ],

  gaz: [
    {
      motif: /^Conclusion|H\.\s*-\s*Conclusion/i,
      titre: 'La conclusion, cochée à la main',
      schema: 'case',
      points: [
        'Quatre phrases imprimées, une seule cochée',
        'A1 : à réparer un jour',
        'A2 : à réparer vite',
        'DGI : gaz coupé le jour même'
      ]
    }
  ],

  erp: [
    {
      motif: /le bien se situe dans une zone/i,
      titre: 'Le risque de votre terrain',
      points: [
        'Cette phrase décrit votre parcelle',
        'Pas la commune entière',
        'Compte pour l’assurance et les travaux'
      ]
    },
    {
      motif: /sismique/i,
      titre: 'La sismicité',
      points: [
        'Presque tout le Sud-Ouest est en zone 2 (faible)',
        'Aucun tremblement de terre attendu',
        'Impose des règles aux constructions neuves'
      ]
    }
  ],

  amiante: [
    {
      motif: /Liste [ABC]\s*:/i,
      titre: 'Les listes A, B et C',
      schema: 'listes',
      points: [
        'A : flocages, calorifugeages — les plus dangereux',
        'B : dalles, conduits, toitures — les plus courants',
        'C : uniquement avant démolition'
      ]
    }
  ],

  carrez: [
    {
      motif: /superficie.{0,20}carrez.{0,20}totale|surface.{0,20}carrez.{0,20}totale/i,
      titre: 'Le chiffre de l’acte',
      points: [
        'C’est lui qui engage le vendeur',
        'Compte le sol sous plus de 1,80 m',
        'Murs et cloisons déduits',
        'Écart de plus de 5 % : baisse de prix possible'
      ]
    }
  ]
};

export function reperer(type: TypeDiag, pages: PageTexte[]): Repere[] {
  const cibles = CIBLES[type];
  if (!cibles) return [];

  const reperes: Repere[] = [];
  const dejaVus = new Set<string>();

  for (const page of pages) {
    if (!page.positions) continue;

    for (const cible of cibles) {
      if (dejaVus.has(cible.titre)) continue;

      const ligne = page.positions.find((l) => cible.motif.test(l.texte));
      if (!ligne) continue;

      dejaVus.add(cible.titre);
      reperes.push({
        page: page.numero,
        x: ligne.x,
        y: ligne.y,
        largeur: ligne.largeur,
        hauteur: ligne.hauteur,
        titre: cible.titre,
        ...(cible.schema ? { schema: cible.schema } : {}),
        points: cible.points,
        extrait: ligne.texte
      });
    }
  }

  // Une page à la fois : les repères d'une même page se lisent ensemble.
  const parPage = new Map<number, Repere[]>();
  for (const r of reperes) {
    const liste = parPage.get(r.page);
    if (liste) liste.push(r);
    else parPage.set(r.page, [r]);
  }

  const meilleure = [...parPage.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  return meilleure ? meilleure[1] : [];
}
