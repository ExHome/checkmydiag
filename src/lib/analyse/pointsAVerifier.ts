/**
 * LES POINTS À VÉRIFIER — les contradictions du rapport, jamais arbitrées.
 *
 * ── La règle ────────────────────────────────────────────────────────────────
 *
 * « Verrière ne tranche jamais arbitrairement entre deux données
 * contradictoires. » Quand le résumé du rapport et son annexe ne disent pas la
 * même chose, on montre **les deux**, on nomme l'endroit de chacune, et on
 * laisse le lecteur — ou son diagnostiqueur — décider.
 *
 * ── Pourquoi ces contradictions existent ────────────────────────────────────
 *
 * Le DPE se décrit deux fois : une fois en résumé (« Vue d'ensemble du
 * logement », « Vue d'ensemble des équipements »), une fois en détail (« Fiche
 * technique du logement »). Le résumé aplatit — c'est son rôle. Mais un résumé
 * qui aplatit sept murs en un mot peut dire « isolé » d'un logement dont deux
 * murs ne le sont pas.
 *
 * Ce n'est pas une faute du diagnostiqueur : c'est la limite d'un résumé. Le
 * signaler, c'est rendre au lecteur la question qu'il aurait dû se poser.
 *
 * ── Ce qu'on ne fait pas ────────────────────────────────────────────────────
 *
 * On ne conclut jamais qu'un rapport est faux. On dit : « ces deux endroits du
 * rapport ne disent pas la même chose », on cite les deux, et on propose la
 * question à poser. Voir la contrainte permanente : Verrière explique le
 * diagnostic, elle ne juge pas le diagnostiqueur.
 */
import type { Enveloppe } from './enveloppe';
import { compterIsolation } from './enveloppe';
import type { Systemes } from './systemes';

export interface PointAVerifier {
  /** Ce qui ne concorde pas, en une phrase. */
  titre: string;
  /** Ce que dit le premier endroit, avec son nom. */
  dUnCote: string;
  /** Ce que dit l'autre. */
  deLAutre: string;
  /** La question à poser — jamais une conclusion. */
  question: string;
}

/** Le résumé des parois, tel que la « Vue d'ensemble du logement » l'imprime. */
const RESUME_PAROIS = /^Vue\s*d\s*[’'´`]?\s*ensemble\s+du\s+logement/i;
const FIN_RESUME = /^Vue\s*d\s*[’'´`]?\s*ensemble\s+des\s+[ée]quipements|^Recommandations/i;

function resumeDuLogement(lignes: string[]): string {
  const debut = lignes.findIndex((l) => RESUME_PAROIS.test(l.trim()));
  if (debut < 0) return '';
  let fin = lignes.findIndex((l, i) => i > debut && FIN_RESUME.test(l.trim()));
  if (fin < 0) fin = lignes.length;
  return lignes
    .slice(debut + 1, fin)
    .join(' ')
    .replace(/\s+/g, ' ');
}

export function chercherLesContradictions(
  lignes: string[],
  enveloppe: Enveloppe,
  systemes: Systemes
): PointAVerifier[] {
  const points: PointAVerifier[] = [];
  const resume = resumeDuLogement(lignes);

  /*
   * 1. Le résumé dit « isolé » là où une paroi ne l'est pas.
   *
   * On ne se déclenche que sur un résumé qui affirme l'isolation SANS la nier
   * nulle part : « non isolé » y figure presque toujours quelque part, et un
   * test naïf aurait crié à chaque rapport.
   */
  const murs = enveloppe.parois.filter((p) => p.famille === 'mur');
  const compte = compterIsolation(murs);
  if (compte.nonIsole > 0 && compte.isole > 0) {
    points.push({
      titre: 'Les murs ne sont pas tous dans le même état',
      dUnCote: `L’annexe technique décrit ${murs.length} murs : ${compte.isole} isolé${
        compte.isole > 1 ? 's' : ''
      }, ${compte.nonIsole} non isolé${compte.nonIsole > 1 ? 's' : ''}${
        compte.inconnu ? `, ${compte.inconnu} sans indication` : ''
      }.`,
      deLAutre:
        'Le résumé du rapport, lui, décrit les murs en une seule ligne — c’est son rôle, mais il ne distingue pas les façades.',
      question:
        'Demandez lesquelles de vos façades sont isolées : les travaux ne portent que sur celles qui ne le sont pas.'
    });
  }

  /*
   * 2. Le résumé annonce du double vitrage alors qu'une baie est en simple.
   *
   * C'est la règle absolue du §6, prise par l'autre bout : ici on ne corrige pas
   * l'affichage, on signale que deux endroits du rapport divergent.
   */
  if (enveloppe.vitrages.simple > 0 && /double vitrage/i.test(resume)) {
    points.push({
      titre: 'Le résumé parle de double vitrage, mais il reste du simple vitrage',
      dUnCote: `L’annexe technique décrit ${enveloppe.vitrages.simple} baie${
        enveloppe.vitrages.simple > 1 ? 's' : ''
      } en simple vitrage.`,
      deLAutre: 'Le résumé des portes et fenêtres mentionne du double vitrage.',
      question:
        'Demandez quelles fenêtres sont encore en simple vitrage : ce sont elles qui perdent le plus.'
    });
  }

  /*
   * 3. Le rapport affirme n'avoir aucune énergie renouvelable, et décrit
   *    pourtant un équipement qui en est une.
   */
  const { declarees, indices } = systemes.renouvelables;
  if (declarees === false && indices.length > 0) {
    points.push({
      titre: 'Le rapport dit qu’il n’y a pas d’énergie renouvelable, mais en décrit une',
      dUnCote:
        'Le rapport écrit que le logement n’est pas encore équipé de production d’énergie renouvelable.',
      deLAutre: `Ses équipements comprennent pourtant : ${indices.join(', ')}.`,
      question:
        'Faites préciser ce point : une production renouvelable change le calcul et les aides auxquelles vous avez droit.'
    });
  }

  /*
   * 4. La ventilation n'est pas la même d'une rubrique à l'autre.
   *
   * L'annexe donne le modèle exact, le résumé la phrase. Quand l'un dit
   * « mécanique » et l'autre « par ouverture des fenêtres », l'enjeu dépasse
   * l'énergie : sans extraction, l'humidité stagne.
   */
  const vue = systemes.vueDEnsemble.find((p) => /^Ventilation$/i.test(p.poste));
  const fiche = systemes.ventilation;
  if (vue && fiche?.mecanique !== null && fiche !== null) {
    const vueDitMecanique = /VMC|simple flux|double flux|m[ée]canique|hygror[ée]glable/i.test(
      vue.description
    );
    const vueDitAucune = /ouverture des fen[êe]tres|naturelle/i.test(vue.description);
    if ((fiche.mecanique && vueDitAucune) || (!fiche.mecanique && vueDitMecanique)) {
      points.push({
        titre: 'La ventilation n’est pas décrite pareil aux deux endroits',
        dUnCote: `L’annexe technique indique : « ${fiche.type} ».`,
        deLAutre: `Le résumé des équipements indique : « ${vue.description} ».`,
        question:
          'Faites préciser quel système est réellement en place : sans ventilation mécanique, l’humidité s’évacue mal.'
      });
    }
  }

  /*
   * 5. Beaucoup de valeurs supposées.
   *
   * Ce n'est pas une contradiction, mais c'est la même famille : le rapport
   * annonce une précision qu'il n'a pas. Le seuil est haut — la moitié des
   * volets du corpus en portent moins de sept — pour que le signal reste rare.
   */
  if (enveloppe.valeursParDefaut >= 15) {
    points.push({
      titre: 'Une grande partie des données a été supposée, pas constatée',
      dUnCote: `${enveloppe.valeursParDefaut} valeurs de l’annexe portent la mention « valeur par défaut ».`,
      deLAutre:
        'Le résultat du calcul, lui, est présenté avec la même précision que s’il reposait sur des mesures.',
      question:
        'Demandez ce qui n’a pas pu être constaté sur place : c’est là que le résultat est le plus fragile.'
    });
  }

  return points;
}
