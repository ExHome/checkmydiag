/**
 * LES SYSTÈMES — chauffage, eau chaude, ventilation, froid, renouvelables.
 *
 * ── Deux sources, et pourquoi les deux ──────────────────────────────────────
 *
 * Le DPE décrit ses équipements à deux endroits, et ils ne disent pas la même
 * chose :
 *
 *  - la **fiche technique** (annexe) donne la donnée *structurée*, générateur
 *    par générateur : type, énergie, émetteur, année, régulation. C'est elle qui
 *    permet de tenir la règle du §10 — « s'il existe deux systèmes, les deux
 *    doivent apparaître » ;
 *  - la **vue d'ensemble des équipements** donne la *phrase* du rapport, celle
 *    que le diagnostiqueur a voulu lire au propriétaire, et deux postes qu'on ne
 *    trouve nulle part ailleurs : la **climatisation** et le **pilotage**.
 *
 * On lit les deux, on n'en fusionne aucun, et quand ils se contredisent on le
 * dit (§20) plutôt que d'arbitrer.
 *
 * ── La mise en page de la vue d'ensemble ────────────────────────────────────
 *
 * C'est un tableau à deux colonnes dont la première est une cellule fusionnée,
 * centrée verticalement sur ses rangées. L'extraction la pose donc au MILIEU de
 * sa description :
 *
 *     Panneau rayonnant électrique NFC… avec programmateur pièce par pièce
 *     individuel)
 *     Chauffage                                    ← l'étiquette, au milieu
 *     Radiateur électrique à fluide caloporteur…
 *     programmateur pièce par pièce (système individuel)
 *     Eau chaude sanitaire Ballon électrique à accumulation vertical…
 *
 * D'où la règle de rattachement, en deux temps :
 *
 *  - une étiquette qui porte déjà son texte sur sa ligne — « Climatisation
 *    Néant » — décrit une rangée d'une seule ligne : elle n'attire rien ;
 *  - une étiquette SEULE sur sa ligne est centrée sur plusieurs rangées : les
 *    lignes voisines lui reviennent, sans jamais franchir une autre étiquette.
 *
 * Ce n'est pas une commodité, c'est la géométrie du tableau. Sans le premier
 * temps, la dernière ligne du chauffage se collait à l'eau chaude, qui la
 * suivait d'une ligne.
 *
 * ── Les renouvelables ───────────────────────────────────────────────────────
 *
 * Le rapport écrit parfois, noir sur blanc : « Ce logement n'est pas encore
 * équipé de systèmes de production d'énergie renouvelable. » C'est une
 * affirmation, on la restitue. Mais on regarde aussi les générateurs : une
 * pompe à chaleur, un poêle à bois ou un chauffe-eau solaire EST une production
 * renouvelable. Si les deux se contredisent, c'est un point à vérifier, pas une
 * question à trancher.
 *
 * Portée : mesuré sur les vingt-six volets DPE LICIEL du corpus.
 */
import { rattacher } from './celluleFusionnee';
import type { Donnee, FicheTechnique } from './ficheTechnique';
import { blocs as blocsDe, type BlocFiche } from './ficheTechnique';

export interface Generateur {
  /** « Chauffage 1 » — `null` quand le rapport ne le nomme pas. */
  nom: string | null;
  type: string | null;
  energie: string | null;
  emetteur: string | null;
  /** « Installation de chauffage simple », « … avec appoint ». */
  installation: string | null;
  /** « divisé », « central ». */
  distribution: string | null;
  /** « Avec intermittence pièce par pièce avec minimum de température ». */
  regulation: string | null;
  annee: Donnee | null;
}

export interface ProductionEauChaude {
  nom: string | null;
  type: string | null;
  energie: string | null;
  production: string | null;
  volume: string | null;
  distribution: string | null;
  annee: Donnee | null;
}

export interface Ventilation {
  nom: string | null;
  type: string | null;
  energie: string | null;
  annee: Donnee | null;
  facadesExposees: string | null;
  logementTraversant: string | null;
  /** Faux quand le rapport décrit une ventilation par ouverture des fenêtres. */
  mecanique: boolean | null;
}

export interface PosteEquipement {
  poste: string;
  description: string;
}

export interface Renouvelables {
  /** Vrai/faux quand le rapport l'affirme ; `null` quand il n'en dit rien. */
  declarees: boolean | null;
  /** Ce que les générateurs laissent voir : « pompe à chaleur », « bois »… */
  indices: string[];
}

export interface Systemes {
  presente: boolean;
  chauffage: Generateur[];
  eauChaude: ProductionEauChaude[];
  ventilation: Ventilation | null;
  vueDEnsemble: PosteEquipement[];
  /** « Néant » quand il n'y en a pas — c'est le mot du rapport. */
  climatisation: string | null;
  pilotage: string | null;
  renouvelables: Renouvelables;
}

/** Les cinq postes de la vue d'ensemble, présents dans les vingt-six volets. */
const POSTES = [
  'Chauffage',
  'Eau chaude sanitaire',
  'Climatisation',
  'Ventilation',
  'Pilotage'
];

const DEBUT_VUE = /^Vue\s*d\s*[’'´`]?\s*ensemble\s+des\s+[ée]quipements/i;
const FIN_VUE = /^Recommandations\s+de\s+gestion|^Recommandations\s+d\s*[’'´`]?\s*am[ée]lioration|^Fiche\s+technique/i;

/** L'affirmation du rapport sur les renouvelables, telle qu'il l'imprime. */
const AUCUN_RENOUVELABLE =
  /n[’'´`]est\s+pas\s+encore\s+[ée]quip[ée]\s+de\s+syst[èe]mes?\s+de/i;

/**
 * Ce qui, dans le nom d'un générateur, désigne une production renouvelable.
 *
 * On ne cherche pas ces mots n'importe où : uniquement dans les libellés
 * d'équipement. « bois » traîne partout ailleurs — « menuiserie bois »,
 * « volets battants bois », « plafond sous solives bois » — et une recherche
 * large aurait trouvé du chauffage au bois dans chaque logement du corpus.
 */
const RENOUVELABLES: [RegExp, string][] = [
  [/pompe\s+[àa]\s+chaleur|\bPAC\b/i, 'pompe à chaleur'],
  [/solaire\s+thermique|chauffe-eau\s+solaire|CESI\b/i, 'solaire thermique'],
  [/photovolta[ïi]que/i, 'photovoltaïque'],
  [/(?:po[êe]le|insert|chaudi[èe]re|appareil)[^.]{0,30}\bbois\b|granul[ée]s?|\bpellets?\b|b[ûu]ches?/i, 'bois'],
  [/thermodynamique/i, 'chauffe-eau thermodynamique'],
  [/r[ée]seau\s+de\s+chaleur/i, 'réseau de chaleur']
];

function propre(t: string): string {
  return t.replace(/\s+/g, ' ').trim();
}

function texte(bloc: BlocFiche, libelle: RegExp): string | null {
  const c = bloc.champs.find((x) => libelle.test(x.libelle));
  return c && c.valeur ? c.valeur : null;
}

function donnee(bloc: BlocFiche, libelle: RegExp): Donnee | null {
  const c = bloc.champs.find((x) => libelle.test(x.libelle));
  return c && c.valeur ? { valeur: c.valeur, origine: c.origine } : null;
}

/**
 * La vue d'ensemble, rangée par rangée.
 *
 * Chaque ligne rejoint l'étiquette qui la nomme : la plus proche parmi celles
 * qui sont seules sur leur ligne, sans franchir d'autre étiquette. À égalité de
 * distance, celle du dessus gagne.
 */
export function lireVueDEnsemble(lignes: string[]): PosteEquipement[] {
  const debut = lignes.findIndex((l) => DEBUT_VUE.test(propre(l)));
  if (debut < 0) return [];
  let fin = lignes.findIndex((l, i) => i > debut && FIN_VUE.test(propre(l)));
  if (fin < 0) fin = lignes.length;

  const region = lignes
    .slice(debut + 1, fin)
    .map(propre)
    .filter(
      (l) =>
        l &&
        !/^description$/i.test(l) &&
        !/Page\s+\d+\s*\/\s*\d+\s*$/.test(l) &&
        !/^DPE.*p\.\d+$/i.test(l)
    );

  const motif = new RegExp(`^(${POSTES.join('|')})\\b\\s*(.*)$`, 'i');
  return rattacher(region, motif).map((r) => ({
    poste: propre(r.etiquette),
    description: r.lignes.join(' ').trim()
  }));
}

function lireGenerateur(bloc: BlocFiche): Generateur {
  return {
    nom: bloc.groupe,
    type: texte(bloc, /^Type g[ée]n[ée]rateur$/i),
    energie: texte(bloc, /^Energie utilis[ée]e$/i),
    emetteur: texte(bloc, /^Type [ée]metteur$/i),
    /* L'apostrophe s'écrit droite ou typographique selon la police du rapport. */
    installation: texte(bloc, /^Type d[’'´`]installation de chauffage$/i),
    distribution: texte(bloc, /^Type de chauffage$/i),
    regulation: texte(bloc, /^Equipement intermittence$/i),
    annee: donnee(bloc, /^Ann[ée]e installation/i)
  };
}

function lireEcs(bloc: BlocFiche): ProductionEauChaude {
  return {
    nom: bloc.groupe,
    type: texte(bloc, /^Type g[ée]n[ée]rateur$/i),
    energie: texte(bloc, /^Energie utilis[ée]e$/i),
    production: texte(bloc, /^Type de production$/i),
    volume: texte(bloc, /^Volume de stockage$/i),
    distribution: texte(bloc, /^Type de distribution$/i),
    annee: donnee(bloc, /^Ann[ée]e installation/i)
  };
}

function lireVentilation(bloc: BlocFiche): Ventilation {
  const type = texte(bloc, /^Type de ventilation$/i);
  return {
    nom: bloc.groupe,
    type,
    energie: texte(bloc, /^Energie utilis[ée]e$/i),
    annee: donnee(bloc, /^Ann[ée]e installation/i),
    facadesExposees: texte(bloc, /^Fa[çc]ades expos[ée]es$/i),
    logementTraversant: texte(bloc, /^Logement Traversant$/i),
    mecanique: type === null ? null : !/ouverture des fen[êe]tres|naturelle/i.test(type)
  };
}

/** Ce que les libellés d'équipement laissent voir d'une production renouvelable. */
export function indicesRenouvelables(libelles: (string | null)[]): string[] {
  const vus: string[] = [];
  for (const l of libelles) {
    if (!l) continue;
    for (const [motif, nom] of RENOUVELABLES) {
      if (motif.test(l) && !vus.includes(nom)) vus.push(nom);
    }
  }
  return vus;
}

export function lireSystemes(lignes: string[], fiche: FicheTechnique): Systemes {
  const vueDEnsemble = lireVueDEnsemble(lignes);
  const parPoste = (nom: string) =>
    vueDEnsemble.find((p) => p.poste.toLowerCase() === nom.toLowerCase())?.description ?? null;

  const chauffage = blocsDe(fiche, 'chauffage').map(lireGenerateur);
  const eauChaude = blocsDe(fiche, 'eauChaude').map(lireEcs);
  const ventilations = blocsDe(fiche, 'ventilation').map(lireVentilation);

  const affirme = lignes.some((l) => AUCUN_RENOUVELABLE.test(l));
  const indices = indicesRenouvelables([
    ...chauffage.flatMap((g) => [g.type, g.emetteur, g.energie]),
    ...eauChaude.flatMap((e) => [e.type, e.production, e.energie]),
    parPoste('Chauffage'),
    parPoste('Eau chaude sanitaire')
  ]);

  return {
    presente: fiche.presente || vueDEnsemble.length > 0,
    chauffage,
    eauChaude,
    ventilation: ventilations[0] ?? null,
    vueDEnsemble,
    climatisation: parPoste('Climatisation'),
    pilotage: parPoste('Pilotage'),
    renouvelables: { declarees: affirme ? false : null, indices }
  };
}
