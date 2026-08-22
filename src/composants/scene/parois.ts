/**
 * LA SCÈNE DES PAROIS — la deuxième, et la plus instructive.
 *
 * Un DPE décrit le logement paroi par paroi : murs, planchers, toiture,
 * portes, chacun avec sa surface, son matériau, et ce que le rapport dit de
 * son isolation. C'est de là que vient la classe, et c'est là que le lecteur
 * comprend pourquoi il paie ce qu'il paie.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LA DISTINCTION QUI JUSTIFIE LE LANGAGE ENTIER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Vu sur un rapport réel, à l'écran, le 22 août : cinq murs, dont deux dont
 * le rapport écrit « inconnue » à la ligne isolation. Ce ne sont pas des murs
 * non isolés — ce sont des murs dont le diagnostiqueur n'a pas pu établir
 * l'isolation. Un écran qui les peindrait en rouge annoncerait un défaut que
 * personne n'a constaté ; en vert, il rassurerait sans preuve.
 *
 * D'où le partage, qui suit la source de l'information et non sa couleur :
 *
 *   isolé       → `bon`, et la SONDE cite ce que le rapport a mesuré ;
 *   non isolé   → `alerte`, c'est un constat du rapport ;
 *   inconnu     → `nonControle`, avec pour MOTIF le mot du rapport lui-même
 *                 (« inconnue »). Le rapport dit qu'il ne sait pas : c'est une
 *                 information, et elle lui appartient ;
 *   illisible   → `nonConclu`, avec une note de Verrière. Là, le silence est
 *                 le nôtre.
 *
 * ── L'ANNÉE SUPPOSÉE ────────────────────────────────────────────────────────
 *
 * Le logiciel du diagnostiqueur déduit parfois une année d'isolation de la
 * période de construction. Le modèle le marque (`origineIsolation`), et la
 * scène le répète mot pour mot : « supposée par le logiciel, pas constatée sur
 * place ». Une valeur déduite affichée comme un fait est un mensonge par
 * omission de sa provenance.
 */
import type { Paroi } from '../../lib/analyse/enveloppe';
import { motDuRapport, noteDeLecture, type Brique, type Scene } from './scene';

const CASE = 18;
const ECART = 4;
const HAUTEUR = 26;

/** Le nom d'une paroi, ou son rang quand le rapport ne la nomme pas. */
function nomDe(p: Paroi, rang: number): string {
  if (p.nom) return p.nom;
  switch (p.famille) {
    case 'mur':
      return `Mur ${rang + 1}`;
    case 'plancherBas':
      return 'Plancher bas';
    case 'plancherHaut':
      return 'Toiture';
    case 'porte':
      return 'Porte';
  }
}

/**
 * Ce que le rapport écrit de cette paroi, en une ligne.
 *
 * Les éléments sont repris tels quels et séparés par des points médians : on
 * ne fait pas de phrase, parce qu'une phrase ajouterait une syntaxe que le
 * rapport n'a pas.
 */
function ceQueDitLeRapport(p: Paroi): string {
  const bouts = [
    p.materiau,
    p.surface !== null ? `${p.surface} m²` : null,
    p.epaisseur,
    p.adjacence ? `donne sur ${p.adjacence}` : null
  ].filter((x): x is string => Boolean(x));
  return bouts.length ? bouts.join(' · ') : 'le rapport ne détaille pas cette paroi';
}

/** L'état d'une paroi, selon QUI ne sait pas. */
function etatDe(p: Paroi): Brique & { forme: 'paroi' } {
  const base = {
    forme: 'paroi' as const,
    id: '',
    d: '',
    nom: '',
    dit: motDuRapport(ceQueDitLeRapport(p)),
    dehors: 'haut' as const
  };

  if (p.isolation === 'isole') {
    /*
     * Le vert porte sa preuve. `isolationDite` est le mot du rapport — « oui »,
     * « forte présomption » —, et l'épaisseur d'isolant quand elle est donnée.
     */
    const preuve = [p.isolationDite ?? 'isolé', p.epaisseurIsolant]
      .filter((x): x is string => Boolean(x))
      .join(' — ');
    return { ...base, etat: 'bon', sonde: motDuRapport(preuve) };
  }

  if (p.isolation === 'nonIsole') {
    return { ...base, etat: 'alerte' };
  }

  /*
   * `inconnu`. Deux cas, et ils ne se disent pas pareil.
   *
   * Si le rapport a écrit un mot — « inconnue » —, c'est LUI qui déclare ne
   * pas savoir : l'information lui appartient, et on la cite. Sinon, la ligne
   * n'a pas été lue, et le silence est le nôtre.
   */
  return p.isolationDite
    ? { ...base, etat: 'nonControle', motif: motDuRapport(p.isolationDite) }
    : {
        ...base,
        etat: 'nonConclu',
        note: noteDeLecture('Nous n’avons pas su lire l’isolation de cette paroi.')
      };
}

/**
 * La note sur l'année d'isolation, et d'où elle vient.
 *
 * ── UNE ERREUR QUE LES TYPES ONT ATTRAPÉE ───────────────────────────────────
 *
 * Ce test cherchait d'abord l'origine « defaut », sans accent — une valeur que
 * j'avais supposée. Les vraies sont « observé », « défaut », « en ligne » et
 * « estimé ». La mention « supposée par le logiciel » ne se serait donc JAMAIS
 * affichée, et une année déduite serait passée pour une année constatée.
 *
 * Trois des quatre origines ne sont pas une observation. Toutes les trois
 * doivent le dire : une valeur prise dans une table, cherchée en ligne ou
 * estimée n'engage pas le diagnostiqueur de la même façon que ce qu'il a vu.
 */
export function anneeSupposeeDe(p: Paroi): string | null {
  if (!p.anneeIsolation) return null;
  const { valeur, origine } = p.anneeIsolation;
  if (!valeur) return null;

  switch (origine) {
    case 'défaut':
      return `Année d’isolation : ${valeur} — supposée par le logiciel, pas constatée sur place.`;
    case 'estimé':
      return `Année d’isolation : ${valeur} — estimée, pas constatée sur place.`;
    case 'en ligne':
      return `Année d’isolation : ${valeur} — reprise d’une base de données, pas constatée sur place.`;
    default:
      return `Année d’isolation : ${valeur}`;
  }
}

/**
 * La scène des parois.
 *
 * `null` sans paroi : un dessin vide ne vaut pas mieux qu'une phrase, et
 * l'écran en a une.
 */
export function sceneParois(parois: readonly Paroi[]): Scene | null {
  if (!parois.length) return null;

  const briques: Brique[] = parois.map((p, i) => {
    const b = etatDe(p);
    const x = i * (CASE + ECART);
    return {
      ...b,
      id: `p-${i}`,
      nom: nomDe(p, i),
      d: `M${x} 0h${CASE}v${HAUTEUR}H${x}z`
    };
  });

  /*
   * CE QUE LA SCÈNE NE MONTRE PAS.
   *
   * La première phrase est la limite du DPE lui-même : il décrit, il ne sonde
   * pas. La seconde est celle du dessin — les parois sont côte à côte dans
   * l'ordre du rapport, elles ne dessinent pas le logement.
   */
  const horsChamp = [
    motDuRapport(
      'Le diagnostiqueur décrit les parois sans les ouvrir : une isolation invisible peut lui échapper, dans un sens comme dans l’autre.'
    ),
    motDuRapport('Les parois sont dans l’ordre du rapport, pas dans celui de votre logement.')
  ];

  return {
    titre: 'Les parois du logement',
    question: 'Qu’est-ce qui sépare l’intérieur du dehors, et est-ce isolé ?',
    briques,
    horsChamp
  };
}

export function largeurParois(scene: Scene): number {
  const n = scene.briques.length;
  return n * CASE + Math.max(0, n - 1) * ECART;
}

export const HAUTEUR_PAROIS = HAUTEUR;
