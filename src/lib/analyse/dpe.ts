/**
 * DPE — diagnostic de performance énergétique.
 *
 * Particularité : dans les rapports, l'étiquette A→G est dessinée (image), pas
 * écrite. On ne peut donc pas la lire. En revanche la consommation annuelle, la
 * surface de référence et les émissions de CO₂ sont du texte : on refait le
 * calcul réglementaire, ce qui donne la même lettre — et on le dit au lecteur.
 */
import type { Diagnostic, Etiquette, Fait, Lettre } from '../modele';
import { contient, nombre, trouver } from './texte';

const LETTRES: Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/** Seuils de l'arrêté du 31 mars 2021, en kWh/m²/an d'énergie primaire. */
const SEUILS_ENERGIE = [70, 110, 180, 250, 330, 420];
/** Seuils en kg CO₂/m²/an. */
const SEUILS_CLIMAT = [6, 11, 30, 50, 70, 100];

export function classePour(valeur: number, seuils: number[]): Lettre {
  for (let i = 0; i < seuils.length; i++) {
    const seuil = seuils[i];
    if (seuil !== undefined && valeur < seuil) return LETTRES[i] as Lettre;
  }
  return 'G';
}

/** Le DPE retient la moins bonne des deux étiquettes (règle du double seuil). */
export function classeFinale(energie: Lettre | null, climat: Lettre | null): Lettre | null {
  if (!energie) return climat;
  if (!climat) return energie;
  return LETTRES.indexOf(energie) >= LETTRES.indexOf(climat) ? energie : climat;
}

interface Mesures {
  consoTotale: number | null;
  surface: number | null;
  emissions: number | null;
  consoParM2: number | null;
  gesParM2: number | null;
  /** Fourchette de coût annuel, telle qu'écrite dans le rapport. */
  cout: [string, string] | null;
}

/**
 * Un audit énergétique décrit d'abord l'état initial, puis des scénarios de
 * travaux qui réutilisent exactement la même mise en forme. Tout ce qui suit le
 * premier scénario décrit un logement qui n'existe pas encore : on coupe.
 */
function avantScenarios(lignes: string[]): string[] {
  const i = lignes.findIndex((l) => /sc[ée]nario|apr[èe]s travaux|[ée]tape 1\b/i.test(l));
  return i > 0 ? lignes.slice(0, i) : lignes;
}

/** Dernier montant en euros d'une ligne (les tableaux se terminent par le total). */
function dernierMontant(ligne: string | undefined): string | null {
  if (!ligne) return null;
  const montants = ligne.match(/[\d][\d\s.,]*\s*€/g);
  const dernier = montants?.[montants.length - 1];
  return dernier ? dernier.replace(/\s+/g, ' ').trim() : null;
}

/**
 * Format propre aux audits : le tableau de l'état initial donne la consommation
 * par usage puis le total, en kWh/m²/an, sous la forme « 578 EP (251 EF ) ».
 *
 * La colonne « total » n'est pas repérable par sa position : selon le
 * générateur, elle s'écrit « 442 (250 ) » avec les unités sur la ligne suivante,
 * et un logement bi-énergie ajoute une ligne (« Bois 102 EP (102 EF) ») qui
 * ressemble trait pour trait au total. On exploite donc la seule propriété
 * certaine : le total est supérieur ou égal à chacun de ses postes.
 */
function mesurerAudit(lignes: string[]): { consoParM2: number | null; cout: [string, string] | null } {
  // Le tableau de l'état initial est le premier « Montants et consommations
  // annuels d'énergie » du rapport ; les scénarios rejouent le même titre plus
  // loin. On se limite donc à ce premier tableau.
  const debut = lignes.findIndex((l) => /Montants et consommations annuels/i.test(l));
  const initial = debut >= 0 ? lignes.slice(debut, debut + 25) : avantScenarios(lignes);

  const candidats: number[] = [];
  for (const ligne of initial) {
    if (/€|ℓ/.test(ligne)) continue; // lignes de coûts et d'eau chaude
    for (const m of ligne.matchAll(/(\d{2,4})\s*(?:EP)?\s*\(\s*(\d{1,4})\s*(?:EF)?\s*\)/g)) {
      const ep = Number(m[1]);
      const ef = Number(m[2]);
      // L'énergie primaire est toujours supérieure ou égale à l'énergie finale :
      // une paire qui ne respecte pas cet ordre n'est pas une consommation.
      if (ep >= ef && ep <= 2000) candidats.push(ep);
    }
  }
  const consoParM2 = candidats.length ? Math.max(...candidats) : null;

  const bas = dernierMontant(initial.find((l) => /frais annuels/i.test(l)));
  const haut = dernierMontant(initial.find((l) => /fourchette/i.test(l)));

  return {
    consoParM2,
    cout: bas && haut ? [bas, haut] : null
  };
}

function mesurer(lignes: string[]): Mesures {
  // « énergie totale pour les 8 105 kWh entre 690 € et 960 € »
  const total =
    trouver(lignes, /énergie totale pour les\s*([\d\s.,]+?)\s*kWh/i) ??
    trouver(lignes, /consommation (?:annuelle )?totale\s*:?\s*([\d\s.,]+?)\s*kWh/i);

  // « Surface de référence : 22.4 m² » / « surface habitable : 86.70m² »
  const surf = trouver(lignes, /surface\s+(?:de référence|habitable|utile)\s*:?[\s.]*([\d\s.,]+)\s*m/i);

  // « Ce logement émet 261 kg de CO ₂ par an »
  const co2 = trouver(lignes, /émet\s*([\d\s.,]+?)\s*kg\s*de\s*CO/i);

  const consoTotale = nombre(total?.[1]);
  const surface = nombre(surf?.[1]);
  const emissions = nombre(co2?.[1]);

  // Volontairement, on ne cherche PAS un « xxx kWh/m²/an » écrit quelque part
  // dans le rapport : ces rapports citent des seuils réglementaires (« CEF < 450
  // kWh/m²/an ») et des gains après travaux (« - 476 kWhEP/m²/an ») dans le même
  // format. Un ratio ramassé au hasard afficherait un verdict faux — bien pire
  // que pas de verdict du tout. On ne calcule que depuis des valeurs dont la
  // phrase d'origine désigne sans ambiguïté ce logement.
  const consoParM2 = consoTotale !== null && surface ? Math.round(consoTotale / surface) : null;
  const gesParM2 =
    emissions !== null && surface ? Math.round((emissions / surface) * 10) / 10 : null;

  const coutEcrit = trouver(lignes, /entre\s*([\d\s.,]+)\s*€\s*et\s*([\d\s.,]+)\s*€\s*par an/i);
  const cout: [string, string] | null =
    coutEcrit?.[1] && coutEcrit[2] ? [`${coutEcrit[1].trim()} €`, `${coutEcrit[2].trim()} €`] : null;

  // Format « audit énergétique » : la consommation de l'état initial s'écrit
  // autrement, et le coût figure dans un tableau.
  const audit = consoParM2 === null || cout === null ? mesurerAudit(lignes) : null;

  return {
    consoTotale,
    surface,
    emissions,
    consoParM2: consoParM2 ?? audit?.consoParM2 ?? null,
    gesParM2,
    cout: cout ?? audit?.cout ?? null
  };
}

/** « chauffage Electrique 5 200 (2 261 é.f.) entre 450 € et 610 € » */
function postes(lignes: string[]): { nom: string; kwh: number; cout?: string }[] {
  const noms = ['chauffage', 'eau chaude', 'refroidissement', 'éclairage', 'auxiliaires'];
  const res: { nom: string; kwh: number; cout?: string }[] = [];

  for (const nom of noms) {
    const m = trouver(
      lignes,
      new RegExp(`^${nom}\\b[^\\d]*([\\d\\s.,]+?)\\s*(?:\\(|entre|$)(?:.*?(entre\\s*[\\d\\s.,]+\\s*€\\s*et\\s*[\\d\\s.,]+\\s*€))?`, 'i')
    );
    const kwh = nombre(m?.[1]);
    if (kwh !== null && kwh > 0) {
      const poste: { nom: string; kwh: number; cout?: string } = { nom, kwh };
      if (m?.[2]) poste.cout = m[2].replace(/\s+/g, ' ').trim();
      res.push(poste);
    }
  }
  return res;
}

function phraseVerdict(finale: Lettre | null): { verdict: string; gravite: Diagnostic['gravite'] } {
  switch (finale) {
    case 'A':
    case 'B':
      return {
        verdict: `Classe ${finale} : ce logement consomme très peu. Il est bien isolé et bien chauffé.`,
        gravite: 'bon'
      };
    case 'C':
    case 'D':
      return {
        verdict: `Classe ${finale} : ce logement consomme comme la plupart des logements français. Ni bon élève, ni mauvais.`,
        gravite: 'bon'
      };
    case 'E':
      return {
        verdict: 'Classe E : ce logement consomme beaucoup. Il n’est pas encore dans les deux pires classes, mais il s’en approche.',
        gravite: 'attention'
      };
    case 'F':
    case 'G':
      return {
        verdict: `Classe ${finale} : ce logement fait partie des plus gros consommateurs. On dit qu’il est une « passoire thermique ». La loi limite ce qu’on peut en faire.`,
        gravite: 'alerte'
      };
    default:
      return {
        verdict: 'Il y a bien un DPE dans ce dossier, mais ses chiffres n’ont pas pu être lus.',
        gravite: 'neutre'
      };
  }
}

function aFaire(finale: Lettre | null): string[] {
  const commun = [
    'Un DPE est valable 10 ans.',
    'Les sommes annoncées sont des calculs, pas vos vraies factures. Elles supposent qu’on chauffe à 19 °C et qu’on vit normalement dans le logement.',
    'Depuis 2021, le diagnostiqueur est responsable de ce qu’il écrit. Si le résultat est faux, on peut se retourner contre lui.'
  ];

  switch (finale) {
    case 'F':
    case 'G':
      return [
        'Louer : depuis le 1ᵉʳ janvier 2025, on ne peut plus louer un logement classé G à un nouveau locataire. Les logements F seront interdits à partir de 2028.',
        'Le loyer est bloqué. On ne peut plus l’augmenter, ni quand un nouveau locataire arrive, ni quand on renouvelle le bail.',
        'Vendre : si c’est une maison, il faut faire faire un audit énergétique et le donner à l’acheteur dès la première visite.',
        ...commun
      ];
    case 'E':
      return [
        'Pour vendre une maison classée E, il faut déjà fournir un audit énergétique.',
        'Le blocage des loyers touchera cette classe à partir de 2034.',
        ...commun
      ];
    default:
      return commun;
  }
}

export function analyserDpe(lignes: string[], plage: [number, number]): Diagnostic {
  const m = mesurer(lignes);

  const energie: Etiquette | null =
    m.consoParM2 !== null
      ? {
          lettre: classePour(m.consoParM2, SEUILS_ENERGIE),
          valeur: Math.round(m.consoParM2),
          unite: 'kWh/m²/an',
          recalculee: true
        }
      : null;

  const climat: Etiquette | null =
    m.gesParM2 !== null
      ? {
          lettre: classePour(m.gesParM2, SEUILS_CLIMAT),
          valeur: m.gesParM2,
          unite: 'kg CO₂/m²/an',
          recalculee: true
        }
      : null;

  const finale = classeFinale(energie?.lettre ?? null, climat?.lettre ?? null);
  const { verdict, gravite } = phraseVerdict(finale);

  // Un audit énergétique reprend le DPE, puis déroule des scénarios de travaux.
  // Ses tableaux ne se lisent pas comme ceux d'un DPE isolé : autant le dire.
  const estAudit = contient(lignes, 'audit energetique') || contient(lignes, 'audit énergétique');

  const faits: Fait[] = [];
  const ademe = trouver(lignes, /N°\s*ADEME\s*:?\s*([0-9A-Z]{8,})/i);
  const etabli = trouver(lignes, /[ÉEe]tabli le\s*:?\s*(\d{2}\/\d{2}\/\d{4})/);
  const valable = trouver(lignes, /[Vv]alable jusqu.{0,4}au\s*:?\s*(\d{2}\/\d{2}\/\d{4})/);
  const typeBien = trouver(lignes, /[Tt]ype de bien\s*:?[\s.]*([A-Za-zÀ-ÿ' -]{3,30})/);
  const annee = trouver(lignes, /[Aa]nnée de construction\s*:?[\s.]*([A-Za-zÀ-ÿ0-9 ]{3,20})/);

  if (m.surface !== null)
    faits.push({
      libelle: 'Surface de référence',
      valeur: `${m.surface.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} m²`
    });
  if (typeBien?.[1]) faits.push({ libelle: 'Type de bien', valeur: typeBien[1].trim() });
  if (annee?.[1]) faits.push({ libelle: 'Année de construction', valeur: annee[1].trim() });
  if (m.consoTotale !== null)
    faits.push({
      libelle: 'Consommation annuelle',
      valeur: `${m.consoTotale.toLocaleString('fr-FR')} kWh`,
      precision: 'chauffage, eau chaude, clim, éclairage, ventilation'
    });
  if (m.emissions !== null)
    faits.push({ libelle: 'Émissions', valeur: `${m.emissions.toLocaleString('fr-FR')} kg CO₂/an` });
  if (m.cout)
    faits.push({
      libelle: 'Coût annuel estimé',
      valeur: `entre ${m.cout[0]} et ${m.cout[1]}`,
      precision: 'usage standard, prix moyens des énergies'
    });
  if (etabli?.[1]) faits.push({ libelle: 'Établi le', valeur: etabli[1] });
  if (valable?.[1]) faits.push({ libelle: 'Valable jusqu’au', valeur: valable[1] });
  if (ademe?.[1]) faits.push({ libelle: 'N° ADEME', valeur: ademe[1] });

  const explication: string[] = [
    "Le DPE mesure deux choses : l'énergie que le logement consomme pour cinq usages (chauffage, eau chaude, climatisation, éclairage, ventilation) et le CO₂ qu'il émet. Chacune donne une lettre ; la lettre affichée sur l'annonce est la moins bonne des deux.",
    "Ces chiffres ne dépendent pas de vos habitudes : ils décrivent le bâtiment (isolation, fenêtres, chauffage) pour un usage standardisé. C'est ce qui permet de comparer deux logements entre eux."
  ];

  if (energie && climat) {
    explication.push(
      `Ici : ${energie.valeur} ${energie.unite} → classe ${energie.lettre} côté énergie, et ${climat.valeur} ${climat.unite} → classe ${climat.lettre} côté climat. La règle du double seuil retient donc ${finale}.`
    );
  }
  if (energie?.recalculee) {
    explication.push(
      "Précision de méthode : sur ce type de rapport, l'étiquette colorée est une image, illisible par un programme. La lettre ci-dessus a été recalculée à partir des chiffres écrits dans le rapport, avec les seuils officiels. Vérifiez qu'elle correspond bien à l'étiquette imprimée."
    );
  }
  if (energie && !climat) {
    explication.push(
      "Attention : seules les données de consommation ont pu être lues, pas les émissions de CO₂. La lettre affichée ne tient donc compte que de l'énergie ; si le logement émet beaucoup (fioul, gaz), l'étiquette officielle peut être moins bonne d'une ou deux classes."
    );
  }

  if (estAudit) {
    explication.push(
      "Ce document est un audit énergétique : il reprend le DPE, puis chiffre des scénarios de travaux étape par étape. Les gains annoncés en « - xxx kWh/m²/an » sont des économies attendues après travaux, pas la consommation actuelle du logement."
    );
  }

  const detailPostes = postes(lignes);

  return {
    type: 'dpe',
    titre: estAudit ? 'Audit énergétique (DPE inclus)' : 'Performance énergétique (DPE)',
    verdict:
      finale === null && estAudit
        ? "Audit énergétique : les tableaux de consommation de ce format ne sont pas lisibles automatiquement. Reportez-vous à l'étiquette imprimée dans le rapport."
        : verdict,
    gravite,
    faits,
    explication,
    analogie:
      finale === 'F' || finale === 'G'
        ? 'Un logement, c’est une bouteille thermos. Une bonne thermos garde le café chaud toute la journée. Celle-ci, c’est plutôt une casserole sans couvercle : vous chauffez, et ça part au plafond. Le chauffage, lui, tourne pour rattraper.'
        : 'Un logement, c’est une bouteille thermos. Plus elle est étanche, moins vous avez besoin de rallumer le chauffage. La lettre du DPE, c’est la note de votre thermos.',
    aFaire: aFaire(finale),
    schema: { genre: 'dpe', energie, climat, finale, postes: detailPostes },
    pages: plage,
    ...(etabli?.[1] ? { date: etabli[1] } : {})
  };
}

/** Exporté pour les tests. */
export const _interne = { mesurer, postes };
