/**
 * L'état descriptif : ce qu'est le bien, avant tout jugement sur son dossier.
 *
 * L'ordre d'un dossier est celui-ci — on présente le bien, on le décrit, puis
 * on l'analyse. Ces caractéristiques ouvrent donc la lecture, au-dessus du
 * verdict.
 *
 * On ne garde que ce qui décrit le logement : sa nature, son âge, ses surfaces,
 * son enveloppe. Les compteurs de contrôle et les références de dossier
 * décrivent la mission du diagnostiqueur, pas le bien — ils n'ont rien à faire
 * ici.
 */
import type { Analyse } from './modele';

/** Ce qui décrit le bien. */
const DECRIT = /type de bien|ann[ée]e de construction|surface|superficie|[ée]tage|niveau/i;
/**
 * Ce qu'on écarte : ce qui décrit la mission du diagnostiqueur, et ce qui
 * décrit la commune.
 *
 * « Niveau d'infestation de la commune » passait le filtre à cause du mot
 * « niveau » — or c'est une donnée de territoire, pas une caractéristique du
 * logement. Elle a sa place dans l'analyse des risques, pas dans l'état
 * descriptif du bien.
 */
const ECARTE = /contr[ôo]l|mesur|zones|unit[ée]s|risques concernant|de la commune|infestation/i;

const NOM_PAROI: Record<string, string> = {
  murs: 'Murs',
  toit: 'Toiture',
  plancher: 'Plancher bas',
  fenetres: 'Menuiseries'
};

export interface Caracteristique {
  libelle: string;
  valeur: string;
}

export function descriptifDe(analyse: Analyse): Caracteristique[] {
  const liste: Caracteristique[] = [];
  const vus = new Set<string>();

  for (const fait of analyse.diagnostics.flatMap((d) => d.faits)) {
    if (!DECRIT.test(fait.libelle) || ECARTE.test(fait.libelle)) continue;
    const cle = fait.libelle.toLowerCase();
    if (vus.has(cle)) continue;
    vus.add(cle);
    liste.push({ libelle: fait.libelle, valeur: fait.valeur });
  }

  // L'enveloppe fait partie du descriptif : c'est elle qu'on décrit quand on
  // parle des matériaux dans un état des lieux.
  const dpe = analyse.diagnostics.find((d) => d.type === 'dpe');
  if (dpe?.schema?.genre === 'dpe') {
    for (const [paroi, etat] of Object.entries(dpe.schema.isolation)) {
      if (etat === 'inconnu') continue;
      // « avec » et « sans » ne s'accordent pas : « menuiseries isolé » sautait
      // aux yeux, et l'accord dépendait du genre de chaque paroi.
      liste.push({
        libelle: NOM_PAROI[paroi] ?? paroi,
        valeur: etat === 'isole' ? 'avec isolant' : 'sans isolant'
      });
    }
  }

  return liste;
}
