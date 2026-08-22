/**
 * LA PREMIÈRE SCÈNE : les zones d'un état termites.
 *
 * C'est le remplacement du premier des trente et un schémas, et il sert de
 * patron aux suivants : une fonction qui traduit un `Diagnostic` en `Scene`,
 * sans rien ajouter et sans rien taire.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE QU'ON DESSINE, ET CE QU'ON REFUSE DE DESSINER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Le modèle ne porte AUCUNE géométrie : `schema.zones` donne des noms et un
 * état, rien d'autre. Dessiner un plan d'appartement plausible reviendrait à
 * inventer la forme du logement de quelqu'un — et un lecteur croirait
 * reconnaître le sien.
 *
 * On dessine donc une ENFILADE : une case par zone, dans l'ordre du rapport,
 * et l'on écrit que c'est cet ordre-là et pas celui du logement. Une bande,
 * pas une carte.
 *
 * ── POURQUOI LES CINQ ÉTATS COMPTENT ICI PLUS QU'AILLEURS ─────────────────
 *
 * Un état termites est le diagnostic où l'écart entre « rien vu » et « pas
 * regardé » coûte le plus cher : la première phrase rassure, la seconde
 * n'engage rien. Le langage des scènes force à les distinguer — `bon` exige
 * la preuve qu'on a regardé, `nonControle` exige le motif du rapport.
 */
import type { Diagnostic } from '../../lib/modele';
import { motDuRapport, noteDeLecture, type Brique, type Scene } from './scene';

/** Largeur d'une case et écart entre deux, en unités du dessin. */
const CASE = 18;
const ECART = 4;
const HAUTEUR = 26;

/**
 * L'état d'une zone, traduit depuis la gravité que le moteur lui a donnée.
 *
 * `neutre` devient `nonConclu` et non `nonControle` : quand le moteur ne
 * conclut pas, c'est NOTRE lecture qui manque, pas la visite du
 * diagnostiqueur. La nuance est tout l'objet du cinquième état.
 */
function etatDeLaZone(zone: { nom: string; etat: string; detail?: string }): Brique & { forme: 'cellule' } {
  const base = {
    forme: 'cellule' as const,
    id: `z-${zone.nom.replace(/\s+/g, '-')}`,
    d: '',
    nom: zone.nom.replace(/\s*[—–-]\s*$/, '').trim(),
    dit: motDuRapport(zone.detail ?? zone.nom)
  };

  switch (zone.etat) {
    case 'alerte':
      return { ...base, etat: 'alerte' };
    case 'attention':
      return { ...base, etat: 'attention' };
    case 'bon':
      /*
       * La sonde est la phrase du rapport pour cette zone. Sans détail, on
       * cite la formule normalisée — c'est elle qui figure au tableau, ligne
       * par ligne, et c'est bien une preuve qu'on a regardé là.
       */
      return {
        ...base,
        etat: 'bon',
        sonde: motDuRapport(zone.detail ?? 'Absence d’indices d’infestation de termites')
      };
    default:
      return {
        ...base,
        etat: 'nonConclu',
        note: noteDeLecture('Nous n’avons pas su lire la conclusion pour cette zone.')
      };
  }
}

/** Place les cases côte à côte et leur donne leur tracé. */
function poser(briques: (Brique & { forme: 'cellule' })[]): Brique[] {
  return briques.map((b, i) => {
    const x = i * (CASE + ECART);
    return { ...b, d: `M${x} 0h${CASE}v${HAUTEUR}H${x}z` };
  });
}

/**
 * La scène d'un état termites.
 *
 * Rend `null` quand le rapport ne donne aucune zone : une scène vide vaut
 * moins que pas de scène du tout, et l'écran a d'autres façons de dire qu'il
 * n'a rien lu.
 */
export function sceneZonesTermites(d: Diagnostic): Scene | null {
  const zones = d.schema?.genre === 'pieces' ? d.schema.zones : [];
  if (!zones.length) return null;

  const cases = zones.map(etatDeLaZone);

  /*
   * CE QUE LA SCÈNE NE MONTRE PAS. Deux phrases, toujours affichées.
   *
   * La première est la limite du diagnostic lui-même : il ne voit que ce qui
   * est accessible. La seconde est la limite du DESSIN : l'ordre des cases est
   * celui du rapport, et quelqu'un qui y chercherait le plan de son logement
   * se tromperait.
   */
  const horsChamp = [
    motDuRapport(
      'Le repérage est visuel et porte sur les parties accessibles : un mur fermé, un vide sanitaire ou un meuble encombrant n’ont pas été contrôlés.'
    ),
    motDuRapport('Les zones sont dans l’ordre du rapport, pas dans celui de votre logement.')
  ];

  /* Les limites d'inspection que le rapport nomme s'ajoutent aux deux
     précédentes : ce sont les angles morts DE CE dossier. */
  for (const e of d.constatations?.entrees ?? []) {
    if (e.nature === 'limite') {
      horsChamp.push(motDuRapport(e.ou ? `${e.terme} — ${e.ou}` : e.terme));
    }
  }

  return {
    titre: 'Les zones regardées',
    question: 'Où le diagnostiqueur est-il allé, et qu’a-t-il vu ?',
    briques: poser(cases),
    horsChamp
  };
}

/** La largeur du dessin, pour que les cases ne soient ni étirées ni serrées. */
export function largeurDe(scene: Scene): number {
  const n = scene.briques.length;
  return n * CASE + Math.max(0, n - 1) * ECART;
}

export const HAUTEUR_SCENE = HAUTEUR;
