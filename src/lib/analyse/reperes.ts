/**
 * Montrer du doigt.
 *
 * Le lecteur a son rapport sous les yeux : plutôt que de lui servir un cours à
 * côté, on pointe la ligne qui compte et on l'explique. Les coordonnées viennent
 * de l'extraction du texte : on sait où chaque phrase se trouve sur la page.
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
  texte: string;
}

interface Cible {
  motif: RegExp;
  titre: string;
  texte: string;
}

const CIBLES: Partial<Record<TypeDiag, Cible[]>> = {
  dpe: [
    {
      motif: /émet\s*[\d\s.,]+\s*kg\s*de\s*CO/i,
      titre: 'Les émissions de CO₂',
      texte:
        'C’est le gaz rejeté pour chauffer le logement. Il dépend surtout de l’énergie utilisée : le gaz et le fioul en rejettent beaucoup, l’électricité et le bois beaucoup moins.'
    },
    {
      motif: /entre\s*[\d\s.,]+\s*€\s*et\s*[\d\s.,]+\s*€\s*par an/i,
      titre: 'Le coût annoncé',
      texte:
        'Ce n’est pas votre facture, c’est un calcul. Il suppose qu’on chauffe à 19 °C et qu’on vive normalement dans le logement. Votre facture réelle dépend de vous, de l’hiver et du prix de l’énergie.'
    },
    {
      motif: /Surface\s+(?:de référence|habitable)/i,
      titre: 'La surface de référence',
      texte:
        'C’est elle qui sert à calculer la note. Attention : elle n’est pas forcément égale à la surface écrite dans l’acte de vente (la loi Carrez), qui se mesure autrement.'
    },
    {
      motif: /N°\s*ADEME/i,
      titre: 'Le numéro ADEME',
      texte:
        'Chaque DPE est enregistré dans une base publique de l’État. Ce numéro prouve que le diagnostic existe officiellement — sans lui, le document n’a aucune valeur.'
    },
    {
      motif: /[Vv]alable jusqu/i,
      titre: 'La date de fin de validité',
      texte: 'Un DPE vaut dix ans. Passé cette date, il faut le refaire pour vendre ou louer.'
    }
  ],

  plomb: [
    {
      motif: /Total.*Non mesur.*Classe 0/i,
      titre: 'Le tableau qui résume tout',
      texte:
        'La seule ligne à regarder vraiment : le nombre d’éléments en classe 3. Ce sont les peintures dégradées, celles qui font de la poussière. Les classes 0, 1 et 2 ne créent aucune obligation.'
    },
    {
      motif: /classe 3/i,
      titre: 'Ce que déclenche une classe 3',
      texte:
        'Dès qu’il y a une classe 3, le propriétaire doit faire des travaux pour supprimer le risque, et prévenir les occupants ainsi que toute entreprise qui viendra travailler.'
    }
  ],

  termites: [
    {
      motif: /(?:n'a pas été repéré|présence).{0,60}indice.{0,30}termites?/i,
      titre: 'La conclusion',
      texte:
        'Elle ne vaut que pour ce qui était visible le jour de la visite, et seulement six mois. Le diagnostiqueur n’a rien démonté.'
    },
    {
      motif: /arrêté préfectoral/i,
      titre: 'Pourquoi ce diagnostic est demandé',
      texte:
        'Il n’est obligatoire que dans les communes où le préfet a constaté la présence de termites. Si votre commune est citée ici, c’est le cas.'
    }
  ],

  electricite: [
    {
      motif: /Conclusion relative à l'évaluation des risques/i,
      titre: 'La conclusion, cochée à la main',
      texte:
        'Deux phrases sont imprimées, une seule est cochée. Regardez laquelle porte la coche : c’est le résultat de votre installation. Un programme ne peut pas lire une case.'
    },
    {
      motif: /différentiel/i,
      titre: 'Le point le plus important',
      texte:
        'Le dispositif différentiel coupe le courant quand l’électricité fuit vers une personne. Son absence est l’anomalie la plus grave, et la plus fréquente dans les logements anciens.'
    }
  ],

  gaz: [
    {
      motif: /^Conclusion|H\.\s*-\s*Conclusion/i,
      titre: 'La conclusion, cochée à la main',
      texte:
        'Quatre phrases sont imprimées : aucune anomalie, A1, A2, DGI. Une seule est cochée. DGI veut dire danger grave et immédiat : dans ce cas, le gaz est coupé le jour même.'
    }
  ],

  erp: [
    {
      motif: /le bien se situe dans une zone/i,
      titre: 'Le risque qui concerne votre terrain',
      texte:
        'Cette phrase décrit votre parcelle, pas la commune entière. C’est celle qui compte pour votre assurance et pour d’éventuels travaux.'
    },
    {
      motif: /sismique/i,
      titre: 'La sismicité',
      texte:
        'Presque tout le sud-ouest est en zone 2, dite « faible ». Cela ne veut pas dire qu’un tremblement de terre est attendu : c’est un classement qui impose des règles aux constructions neuves.'
    }
  ],

  amiante: [
    {
      motif: /Liste [ABC]\s*:/i,
      titre: 'Les listes A, B et C',
      texte:
        'La liste A, ce sont les matériaux les plus dangereux (flocages, calorifugeages). La liste B, les plus courants : dalles de sol, conduits, toitures. La C ne concerne que les démolitions.'
    }
  ],

  carrez: [
    {
      motif: /superficie.{0,20}carrez.{0,20}totale|surface.{0,20}carrez.{0,20}totale/i,
      titre: 'Le chiffre qui ira dans l’acte',
      texte:
        'C’est cette surface qui engage le vendeur. Si la surface réelle est inférieure de plus de 5 %, l’acheteur peut demander une baisse du prix dans l’année qui suit la vente.'
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
        texte: cible.texte
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
