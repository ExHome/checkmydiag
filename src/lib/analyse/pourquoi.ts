/**
 * POURQUOI CETTE NOTE — le lien entre le résultat et ses causes.
 *
 * ── Ce que l'écran doit répondre ────────────────────────────────────────────
 *
 * Pas « DPE : D » mais « pourquoi suis-je D ? ». La lettre est un résultat ; ce
 * module rassemble ce qui, dans le rapport, l'explique — et rien d'autre.
 *
 * ── La règle de fabrication ─────────────────────────────────────────────────
 *
 * Chaque cause énoncée ici s'appuie sur une donnée **lue dans le rapport**, et
 * la porte avec elle (`preuve`). Aucune cause n'est déduite d'une autre, aucune
 * n'est ajoutée « parce que c'est souvent le cas ». Un logement dont on ne sait
 * rien ne reçoit aucune cause : la liste est vide, et l'écran le dit.
 *
 * C'est la traçabilité du §27 appliquée à l'explication : on doit toujours
 * pouvoir répondre « pourquoi Verrière affirme-t-elle cela ? ».
 *
 * ── L'ordre ─────────────────────────────────────────────────────────────────
 *
 * Les causes sortent par poids décroissant, et le poids n'est pas un chiffre
 * inventé : c'est la **surface déperditive** que la cause concerne, que le
 * rapport donne en toutes lettres. Une paroi non isolée de soixante mètres
 * carrés passe devant une fenêtre de deux. Aucun pourcentage n'est affiché — le
 * rapport n'en donne aucun.
 */
import type { Enveloppe } from './enveloppe';
import type { Systemes } from './systemes';

export interface Cause {
  /** « Le plancher bas n'est pas isolé » — la cause, en une phrase. */
  titre: string;
  /** Ce que le rapport écrit, mot pour mot ou presque. */
  preuve: string;
  /** Ce que ça fait au résultat, sans chiffrer ce que le rapport ne chiffre pas. */
  effet: string;
  /** Surfaces concernées, en m² — l'ordre de grandeur, pas un pourcentage. */
  surface: number;
  genre: 'enveloppe' | 'baie' | 'systeme' | 'ventilation';
}

/**
 * Le genre du nom de la paroi, pour que la phrase s'accorde.
 *
 * « Plancher n'est pas isolée » se fait relire deux fois, et une phrase qu'on
 * relit deux fois coûte de la confiance. Le genre se déduit du nom que le
 * rapport donne — « Mur 1 Nord », « Fenêtre 2 Sud » — et non de la famille,
 * parce que c'est ce nom qui est affiché juste avant.
 */
function accord(nom: string | null, famille: string): 'e' | '' {
  if (nom) return /^(fen[êe]tre|porte|baie|toiture|dalle)/i.test(nom.trim()) ? 'e' : '';
  return famille === 'porte' || famille === 'baie' ? 'e' : '';
}

/** Les énergies dont la lettre climat souffre le plus, telles que le DPE les nomme. */
const CARBONEES = /fioul|charbon|gaz\s+(?:naturel|propane|butane)|propane|butane|GPL/i;

export function pourquoiCetteNote(enveloppe: Enveloppe, systemes: Systemes): Cause[] {
  const causes: Cause[] = [];

  /* 1. Les parois non isolées, la plus grande d'abord. */
  for (const p of enveloppe.parois) {
    if (p.isolation !== 'nonIsole' || p.deperditive === false || !p.surface) continue;
    causes.push({
      titre: `${p.nom ?? 'Une paroi'} n’est pas isolé${p.nom ? accord(p.nom, p.famille) : 'e'}`,
      preuve: [p.materiau, p.epaisseur, p.adjacence ? `donne sur ${p.adjacence}` : null]
        .filter(Boolean)
        .join(' · '),
      effet:
        'Une paroi non isolée qui donne sur le froid laisse la chaleur partir en continu, tout l’hiver.',
      surface: p.surface,
      genre: 'enveloppe'
    });
  }

  /* 2. Le simple vitrage, poste par poste — jamais fondu dans une moyenne. */
  for (const b of enveloppe.baies) {
    if (b.vitrage !== 'simple' || !b.surface) continue;
    causes.push({
      titre: `${b.nom ?? 'Une fenêtre'} est en simple vitrage`,
      preuve: [b.menuiserie, b.vitrageDit, b.u ? `U = ${b.u}` : null].filter(Boolean).join(' · '),
      effet:
        'Une vitre simple laisse passer plusieurs fois plus de chaleur qu’un double vitrage, à surface égale.',
      surface: b.surface,
      genre: 'baie'
    });
  }

  /*
   * 3. L'absence de ventilation mécanique.
   *
   * Elle ne pèse pas une surface : on lui donne le poids de zéro pour qu'elle
   * reste en fin de liste des postes chiffrés, sans disparaître. Son enjeu
   * dépasse l'énergie — sans extraction, l'humidité stagne et décolle les
   * peintures, ce que le constat plomb du même dossier finit par constater.
   */
  if (systemes.ventilation?.mecanique === false) {
    causes.push({
      titre: 'Le logement n’a pas de ventilation mécanique',
      preuve: systemes.ventilation.type ?? 'ventilation par ouverture des fenêtres',
      effet:
        'L’air se renouvelle en ouvrant les fenêtres, donc en chauffant l’extérieur. Et l’humidité s’évacue mal.',
      surface: 0,
      genre: 'ventilation'
    });
  }

  /*
   * 4. L'énergie de chauffage, quand elle est carbonée.
   *
   * C'est la cause qui explique un écart entre les deux étiquettes : un
   * logement peut consommer peu et émettre beaucoup. On ne l'énonce que si le
   * rapport nomme l'énergie.
   */
  for (const g of systemes.chauffage) {
    const energie = g.energie ?? g.type ?? '';
    if (!CARBONEES.test(energie)) continue;
    causes.push({
      titre: `Le chauffage fonctionne ${/fioul/i.test(energie) ? 'au fioul' : 'à une énergie fossile'}`,
      preuve: [g.type, g.energie].filter(Boolean).join(' · '),
      effet:
        'Cette énergie pèse sur l’étiquette climat, celle des gaz à effet de serre — parfois plus que sur celle de la consommation.',
      surface: 0,
      genre: 'systeme'
    });
  }

  return causes.sort((a, b) => b.surface - a.surface);
}

/**
 * Ce qui est déjà performant.
 *
 * L'ordre de mission demande les deux : « qu'est-ce qui est déjà performant ? »
 * autant que « qu'est-ce qui doit être amélioré ? ». Un écran qui n'énumère que
 * les défauts se lit comme un réquisitoire, et le lecteur cesse d'y croire.
 */
export function ceQuiEstDejaBien(enveloppe: Enveloppe, systemes: Systemes): Cause[] {
  const bons: Cause[] = [];

  for (const p of enveloppe.parois) {
    if (p.isolation !== 'isole' || !p.surface) continue;
    bons.push({
      titre: `${p.nom ?? 'Une paroi'} est isolé${p.nom ? accord(p.nom, p.famille) : 'e'}`,
      preuve: [p.materiau, p.epaisseurIsolant ? `isolant ${p.epaisseurIsolant}` : null]
        .filter(Boolean)
        .join(' · '),
      effet: 'Cette paroi retient déjà la chaleur : il n’y a rien à y refaire.',
      surface: p.surface,
      genre: 'enveloppe'
    });
  }

  const performantes = enveloppe.baies.filter((b) => b.vitrage === 'double' || b.vitrage === 'triple');
  if (performantes.length > 0) {
    bons.push({
      titre: `${performantes.length} fenêtre${performantes.length > 1 ? 's sont' : ' est'} en double ou triple vitrage`,
      preuve: performantes
        .map((b) => [b.nom, b.vitrageDit].filter(Boolean).join(' : '))
        .slice(0, 4)
        .join(' · '),
      effet: 'Ces vitrages ne sont pas le point faible du logement.',
      surface: performantes.reduce((n, b) => n + (b.surface ?? 0), 0),
      genre: 'baie'
    });
  }

  if (systemes.ventilation?.mecanique === true) {
    bons.push({
      titre: 'Le logement a une ventilation mécanique',
      preuve: systemes.ventilation.type ?? '',
      effet: 'L’air se renouvelle sans qu’on ait à ouvrir les fenêtres en plein hiver.',
      surface: 0,
      genre: 'ventilation'
    });
  }

  return bons.sort((a, b) => b.surface - a.surface);
}
