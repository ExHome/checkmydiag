/**
 * L'enveloppe du logement — le bâtiment reconstruit à partir de sa fiche technique.
 *
 * ── Ce que ce module remplace ───────────────────────────────────────────────
 *
 * Le modèle historique tenait l'isolation en quatre mots : `murs`, `toit`,
 * `plancher`, `fenetres`, chacun dans un seul état. Un logement à sept murs —
 * deux non isolés, quatre isolés, un inconnu — s'y résumait par un mot unique.
 * C'est la moyenne trompeuse que l'ordre de mission interdit (§5) : « ne jamais
 * résumer plusieurs murs différents par "murs isolés" ».
 *
 * Ici, chaque paroi et chaque baie garde son identité, sa surface, son
 * orientation, son matériau, son état d'isolation **et l'origine de cette
 * donnée**. Rien n'est fusionné ; rien n'est déduit d'une autre paroi.
 *
 * ── Les mots du rapport, avant l'interprétation ─────────────────────────────
 *
 * Chaque élément conserve la formulation exacte du rapport à côté de son état
 * normalisé (`isolationDite`, `vitrageDit`). Le champ « Isolation » du corpus
 * vaut « oui », « non », « inconnue », mais aussi « oui (observation
 * indirecte) » et « forte présomption ». Une présomption n'est pas un constat :
 * elle rejoint l'état « inconnu », et le mot du rapport reste affiché à côté.
 * L'utilisateur lit ce que le diagnostiqueur a écrit, puis notre lecture.
 *
 * ── Ce qui donne sur le froid ───────────────────────────────────────────────
 *
 * La colonne « Type d'adjacence » dit contre quoi la paroi s'appuie :
 * « l'extérieur » (62 fois), « un local chauffé » (38), « des circulations »,
 * « un terre-plein », « un vide-sanitaire », « un comble très faiblement
 * ventilé »… Une paroi contre un local chauffé ne perd rien ; toutes les autres
 * sont déperditives. C'est le rapport qui le dit, pas nous.
 *
 * ── Le schéma des déperditions, sans chiffre inventé ────────────────────────
 *
 * La page « Schéma des déperditions de chaleur » du DPE est une image : aucun
 * pourcentage n'existe dans le texte, sur aucun des volets lus. On ne peut donc
 * pas dire « 25 % par la toiture », et on ne le dira pas.
 *
 * Ce qu'on peut dire, et qui vient entièrement du rapport : quelles surfaces
 * donnent sur le froid, combien de mètres carrés chacune, et laquelle est
 * isolée. Le classement par surface déperditive répond à « où part la chaleur »
 * sans jamais franchir la ligne du chiffre supposé.
 *
 * ── Portée ──────────────────────────────────────────────────────────────────
 *
 * Mesuré sur les vingt-six volets DPE LICIEL du corpus. Les autres éditeurs ne
 * sont pas mesurés : `presente` reste faux et l'écran le dit, plutôt que de
 * montrer un bâtiment vide. Voir `docs/OU-PARSER-DPE.md`.
 */
import type { EtatIsolation } from '../modele';
import {
  blocs as blocsDe,
  type BlocFiche,
  type Donnee,
  type FicheTechnique,
  type OrigineDonnee
} from './ficheTechnique';

/* `Donnee` vit avec la fiche technique, qui la produit ; on la réexporte ici. */
export type { Donnee } from './ficheTechnique';

export type FamilleParoi = 'mur' | 'plancherBas' | 'plancherHaut' | 'porte';

export interface Paroi {
  /** « Mur 3 Sud » — `null` quand le rapport ne l'a pas nommée. */
  nom: string | null;
  famille: FamilleParoi;
  surface: number | null;
  /** « l'extérieur », « un local chauffé »… tel qu'écrit. */
  adjacence: string | null;
  /** Faux contre un local chauffé ; `null` si l'adjacence n'est pas donnée. */
  deperditive: boolean | null;
  materiau: string | null;
  epaisseur: string | null;
  isolation: EtatIsolation;
  /** Le mot du rapport : « oui », « forte présomption »… */
  isolationDite: string | null;
  origineIsolation: OrigineDonnee | null;
  epaisseurIsolant: string | null;
  anneeIsolation: Donnee | null;
}

export type Vitrage = 'simple' | 'double' | 'triple';

export interface Baie {
  nom: string | null;
  surface: number | null;
  orientation: string | null;
  /** La paroi qui la porte : « Mur 3 Sud ». */
  placement: string | null;
  ouverture: string | null;
  menuiserie: string | null;
  vitrage: Vitrage | null;
  vitrageDit: string | null;
  lameAir: string | null;
  volets: string | null;
  /** Coefficient U calculé par le logiciel, tel qu'imprimé. */
  u: string | null;
}

/** Les quatre états du §6 : on ne dit « tout est performant » qu'à bon droit. */
export type VerdictVitrage = 'toutPerformant' | 'heterogene' | 'simpleVitrage' | 'insuffisant';

export interface Vitrages {
  verdict: VerdictVitrage;
  simple: number;
  double: number;
  triple: number;
  inconnu: number;
}

export interface PosteDeperdition {
  libelle: string;
  famille: FamilleParoi | 'baie';
  surface: number;
  isolation: EtatIsolation;
  /**
   * L'état, dit dans les mots du poste : un mur est « non isolé », une fenêtre
   * est « en simple vitrage ». Appeler « isolé » un double vitrage sonnerait
   * faux, et une phrase qui sonne faux se fait relire deux fois.
   */
  mot: string;
  /** Le matériau, l'adjacence, la nuance du rapport — rassemblés. */
  detail: string;
}

export interface Bien {
  typeDeBien: Donnee | null;
  anneeConstruction: Donnee | null;
  surfaceReference: Donnee | null;
  nombreNiveaux: Donnee | null;
  hauteurSousPlafond: Donnee | null;
  departement: Donnee | null;
  altitude: Donnee | null;
}

export interface Enveloppe {
  presente: boolean;
  bien: Bien;
  parois: Paroi[];
  baies: Baie[];
  vitrages: Vitrages;
  /** Les surfaces qui donnent sur le froid, la plus grande d'abord. */
  deperditions: PosteDeperdition[];
  /** Toujours `false` : la page des déperditions du DPE est une image. */
  pourcentagesDisponibles: boolean;
  /** Nombre de champs dont la valeur est supposée par le logiciel, pas constatée. */
  valeursParDefaut: number;
}

const VIDE: Enveloppe = {
  presente: false,
  bien: {
    typeDeBien: null,
    anneeConstruction: null,
    surfaceReference: null,
    nombreNiveaux: null,
    hauteurSousPlafond: null,
    departement: null,
    altitude: null
  },
  parois: [],
  baies: [],
  vitrages: { verdict: 'insuffisant', simple: 0, double: 0, triple: 0, inconnu: 0 },
  deperditions: [],
  pourcentagesDisponibles: false,
  valeursParDefaut: 0
};

function texte(bloc: BlocFiche, libelle: RegExp): string | null {
  const c = bloc.champs.find((x) => libelle.test(x.libelle));
  return c && c.valeur ? c.valeur : null;
}

function donnee(bloc: BlocFiche, libelle: RegExp): Donnee | null {
  const c = bloc.champs.find((x) => libelle.test(x.libelle));
  return c && c.valeur ? { valeur: c.valeur, origine: c.origine } : null;
}

/** « 23,63 m² », « 88.34 m² » — virgule ou point, l'unité suit. */
function metres(valeur: string | null): number | null {
  if (!valeur) return null;
  const m = valeur.match(/(\d[\d\s]*(?:[.,]\d+)?)/);
  if (!m || !m[1]) return null;
  const n = Number(m[1].replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * L'état d'isolation, à partir du mot du rapport.
 *
 * « oui » et « oui (observation indirecte) » constatent une isolation ; « non »
 * en constate l'absence. « forte présomption » et « inconnue » ne constatent
 * rien : ils vont à `inconnu`, et le mot exact reste affiché à côté — c'est le
 * §1, trois états et pas deux.
 */
export function etatIsolation(dit: string | null): EtatIsolation {
  if (!dit) return 'inconnu';
  const v = dit.trim().toLowerCase();
  if (/^non\b|^non isol/.test(v)) return 'nonIsole';
  if (/^oui\b|^isol/.test(v)) return 'isole';
  return 'inconnu';
}

/** Une paroi contre un local chauffé ne perd rien ; tout le reste donne sur le froid. */
export function estDeperditive(adjacence: string | null): boolean | null {
  if (!adjacence) return null;
  return !/local\s+chauff/i.test(adjacence);
}

function lireVitrage(dit: string | null): Vitrage | null {
  if (!dit) return null;
  if (/triple/i.test(dit)) return 'triple';
  if (/double/i.test(dit)) return 'double';
  if (/simple/i.test(dit)) return 'simple';
  return null;
}

function lireParoi(bloc: BlocFiche, famille: FamilleParoi): Paroi {
  /*
   * « Isolation » est l'isolation de la paroi elle-même. « Etat isolation des
   * parois Aiu / Aue » décrit l'enveloppe du LOCAL VOISIN non chauffé : deux
   * choses différentes, qu'on ne mélange pas. Faute de « Isolation », on se
   * rabat sur « Type isolation » (« ITI », « ITE », « non isolé »), qui constate
   * aussi.
   */
  const dit = texte(bloc, /^Isolation$/i) ?? texte(bloc, /^Isolation ?:/i) ?? texte(bloc, /^Type isolation$/i);
  const champIso = bloc.champs.find((c) =>
    /^Isolation$|^Isolation ?:|^Type isolation$/i.test(c.libelle)
  );
  const adjacence = texte(bloc, /^Type d.adjacence$/i) ?? texte(bloc, /^Type de local adjacent$/i);
  const surface = metres(
    texte(bloc, /^Surface (?:du mur|de plancher (?:bas|haut)|de porte)$/i) ??
      texte(bloc, /^Surface/i)
  );

  return {
    nom: bloc.groupe,
    famille,
    surface,
    adjacence,
    deperditive: estDeperditive(adjacence),
    materiau:
      texte(bloc, /^Mat[ée]riau mur$/i) ??
      texte(bloc, /^Type de p[bh]$/i) ??
      texte(bloc, /^(?:Nature de la menuiserie|Type de porte)$/i),
    epaisseur: texte(bloc, /^Epaisseur mur$/i),
    isolation: etatIsolation(dit),
    isolationDite: dit,
    origineIsolation: champIso?.origine ?? null,
    epaisseurIsolant: texte(bloc, /^Epaisseur isolant$/i),
    anneeIsolation:
      donnee(bloc, /^Ann[ée]e isolation$/i) ?? donnee(bloc, /^Ann[ée]e de construction\/r[ée]novation$/i)
  };
}

function lireBaie(bloc: BlocFiche): Baie {
  const vitrageDit = texte(bloc, /^Type de vitrage$/i);
  return {
    nom: bloc.groupe,
    surface: metres(texte(bloc, /^Surface de baies$/i)),
    orientation: texte(bloc, /^Orientation des baies$/i),
    placement: texte(bloc, /^Placement$/i),
    ouverture: texte(bloc, /^Type ouverture$/i),
    menuiserie: texte(bloc, /^Type menuiserie$/i),
    vitrage: lireVitrage(vitrageDit),
    vitrageDit,
    lameAir: texte(bloc, /^Epaisseur lame air$/i),
    volets: texte(bloc, /^Type volets$/i),
    u: texte(bloc, /^U Fen[êe]tre/i)
  };
}

/**
 * Le verdict du §6 : quatre états, et « tout est performant » ne se dit qu'à
 * bon droit.
 *
 * Une seule baie en simple vitrage suffit à le signaler, même si huit autres
 * sont en double. Vingt baies du corpus sont dans ce cas, et le résumé du
 * rapport les faisait disparaître.
 */
export function verdictVitrage(baies: Baie[]): Vitrages {
  const compte = { simple: 0, double: 0, triple: 0, inconnu: 0 };
  for (const b of baies) {
    if (b.vitrage) compte[b.vitrage] += 1;
    else compte.inconnu += 1;
  }
  const connus = compte.simple + compte.double + compte.triple;
  let verdict: VerdictVitrage;
  if (compte.simple > 0) verdict = 'simpleVitrage';
  else if (connus === 0) verdict = 'insuffisant';
  else if (compte.inconnu > 0) verdict = 'heterogene';
  else verdict = 'toutPerformant';
  return { verdict, ...compte };
}

/** L'état d'une paroi, dans les mots d'une paroi. */
function motParoi(p: Paroi): string {
  if (p.isolation === 'isole') return 'isolé';
  if (p.isolation === 'nonIsole') return 'non isolé';
  return 'isolation non précisée';
}

/** L'état d'une baie, dans les mots d'une baie. */
function motBaie(b: Baie): string {
  return b.vitrageDit ?? 'vitrage non précisé';
}

function detailParoi(p: Paroi): string {
  const mots: string[] = [];
  if (p.materiau) mots.push(p.materiau);
  if (p.adjacence) mots.push(`donne sur ${p.adjacence}`);
  /*
   * La nuance du rapport ne se perd pas : « forte présomption » n'est ni un oui
   * ni un non, et l'utilisateur doit lire le mot du diagnostiqueur.
   */
  if (p.isolationDite && !/^(oui|non|inconnue?)$/i.test(p.isolationDite.trim())) {
    mots.push(`le rapport écrit « ${p.isolationDite} »`);
  }
  return mots.join(' · ');
}

/**
 * Le classement des surfaces qui donnent sur le froid.
 *
 * Ce n'est pas le schéma du rapport — celui-là est une image, et il n'existe
 * nulle part en texte. C'est la description des parois, remise dans l'ordre des
 * surfaces. Aucun pourcentage : le rapport n'en donne aucun.
 */
export function classerDeperditions(parois: Paroi[], baies: Baie[]): PosteDeperdition[] {
  const postes: PosteDeperdition[] = [];

  for (const p of parois) {
    if (p.deperditive === false || p.surface === null || p.surface <= 0) continue;
    postes.push({
      libelle: p.nom ?? nomParDefaut(p.famille),
      famille: p.famille,
      surface: p.surface,
      isolation: p.isolation,
      mot: motParoi(p),
      detail: detailParoi(p)
    });
  }

  for (const b of baies) {
    if (b.surface === null || b.surface <= 0) continue;
    postes.push({
      libelle: b.nom ?? 'Une baie',
      famille: 'baie',
      surface: b.surface,
      /* Un simple vitrage est la paroi nue du vitrage : le ranger ainsi. */
      isolation: b.vitrage === 'simple' ? 'nonIsole' : b.vitrage ? 'isole' : 'inconnu',
      mot: motBaie(b),
      detail: [b.menuiserie, b.orientation, b.u ? `U = ${b.u}` : null]
        .filter(Boolean)
        .join(' · ')
    });
  }

  return postes.sort((a, b) => b.surface - a.surface);
}

function nomParDefaut(famille: FamilleParoi): string {
  switch (famille) {
    case 'mur':
      return 'Une paroi non nommée';
    case 'plancherBas':
      return 'Le plancher bas';
    case 'plancherHaut':
      return 'Le plafond';
    case 'porte':
      return 'Une porte';
  }
}

export function lireEnveloppe(fiche: FicheTechnique): Enveloppe {
  if (!fiche.presente) return VIDE;

  const generalites = fiche.blocs.find((b) => b.champs.some((c) => /^D[ée]partement$/i.test(c.libelle)));
  const bien: Bien = generalites
    ? {
        typeDeBien: donnee(generalites, /^Type de bien$/i),
        anneeConstruction: donnee(generalites, /^Ann[ée]e de construction$/i),
        surfaceReference: donnee(generalites, /^Surface de r[ée]f[ée]rence/i),
        nombreNiveaux: donnee(generalites, /^Nombre de niveaux/i),
        hauteurSousPlafond: donnee(generalites, /^Hauteur moyenne sous plafond$/i),
        departement: donnee(generalites, /^D[ée]partement$/i),
        altitude: donnee(generalites, /^Altitude$/i)
      }
    : VIDE.bien;

  const parois: Paroi[] = [
    ...blocsDe(fiche, 'mur').map((b) => lireParoi(b, 'mur')),
    ...blocsDe(fiche, 'plancherBas').map((b) => lireParoi(b, 'plancherBas')),
    ...blocsDe(fiche, 'plancherHaut').map((b) => lireParoi(b, 'plancherHaut')),
    ...blocsDe(fiche, 'porte').map((b) => lireParoi(b, 'porte'))
  ];
  const baies = blocsDe(fiche, 'baie').map(lireBaie);

  return {
    presente: true,
    bien,
    parois,
    baies,
    vitrages: verdictVitrage(baies),
    deperditions: classerDeperditions(parois, baies),
    pourcentagesDisponibles: false,
    valeursParDefaut: fiche.champs.filter((c) => c.origine === 'défaut').length
  };
}

/**
 * Le résumé d'une famille de parois — sans jamais l'aplatir en un seul mot.
 *
 * Renvoie le compte des trois états. L'écran s'en sert pour dire « quatre murs
 * isolés, deux non isolés, un inconnu », et non « murs isolés ».
 */
export function compterIsolation(parois: Paroi[]): Record<EtatIsolation, number> {
  const compte: Record<EtatIsolation, number> = { isole: 0, nonIsole: 0, inconnu: 0 };
  for (const p of parois) compte[p.isolation] += 1;
  return compte;
}
