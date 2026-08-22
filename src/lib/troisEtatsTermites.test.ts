/**
 * ⚠️ LES TROIS ÉTATS DE LA NORME TERMITES — ET CELUI QUI MANQUE.
 *
 * NF P 03-201 ne connaît pas deux conclusions mais TROIS, et c'est la
 * contrainte qu'Aude répète depuis le début de ce chantier :
 *
 *   1. ABSENCE d'indice d'infestation
 *   2. PRÉSENCE d'indices d'infestation
 *   3. PRÉSENCE de termites   ← des insectes vivants, constatés
 *
 * Les deux premiers se distinguent d'un mot — « il n'a pas été repéré » contre
 * « il a été repéré ». Le troisième est d'une autre nature : on ne lit plus des
 * traces, on lit des termites.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE QUE MESURE CE FICHIER, ET POURQUOI IL EST ÉCRIT AINSI
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Mesuré le 22 août 2026 sur `analyserTermites`, avec trois rapports écrits
 * comme un diagnostiqueur les écrit :
 *
 *   absence d'indice      → gravité « bon »     · verdict juste       ✓
 *   présence d'indices    → gravité « alerte »  · verdict juste       ✓
 *   présence de termites  → gravité « neutre »  · « sa conclusion
 *                           n'a pas pu être lue »                     ✗
 *
 * Le cas le plus grave de la norme n'est pas classé comme grave : il n'est pas
 * lu du tout. Un acquéreur dont la cave abrite des termites vivants verrait
 * son écran annoncer que la conclusion n'est pas lisible.
 *
 * `reperages.ts:48` explique pourquoi : `etat: presence ? 'alerte' : 'bon'` —
 * deux branches, donc deux états, et le troisième n'a nulle part où aller.
 *
 * ── POURQUOI CES TESTS SONT MARQUÉS `fails` ────────────────────────────────
 *
 * `src/lib/analyse/` appartient à une autre session, qui y travaille en ce
 * moment. Y écrire une correction de fond exposerait son travail en cours.
 *
 * Un test rouge, lui, bloquerait le déploiement de toute l'application pour un
 * défaut qu'on ne corrige pas dans la minute — ce serait payer une dette avec
 * l'argent de quelqu'un d'autre.
 *
 * `it.fails` dit exactement la vérité : « ceci devrait passer, et ne passe
 * pas ». La suite reste verte, le défaut reste écrit noir sur blanc, et le
 * jour où le moteur lira le troisième état, CE FICHIER DEVIENDRA ROUGE — parce
 * qu'un `fails` qui réussit est une erreur. C'est ce qui garantit qu'on
 * reviendra ici plutôt que d'oublier.
 */
import { describe, expect, it } from 'vitest';
import { analyserTermites } from './analyse/reperages';

const ENTETE = [
  'ÉTAT RELATIF À LA PRÉSENCE DE TERMITES',
  'Le bien est situé dans une zone soumise à un arrêté préfectoral.'
];

const ABSENCE = [
  ...ENTETE,
  'Il n’a pas été repéré d’indice d’infestation de termites.',
  'Séjour — Plinthes — Absence d’indices d’infestation de termites'
];

const INDICES = [
  ...ENTETE,
  'Il a été repéré des indices d’infestation de termites.',
  'Cave — Solives — Présence d’indices d’infestation de termites'
];

const INFESTATION = [
  ...ENTETE,
  'Présence de termites vivants constatée dans la cave.',
  'Cave — Solives — Présence de termites'
];

describe('les deux états que la norme fait lire correctement', () => {
  it('absence d’indice : conclusion favorable', () => {
    const d = analyserTermites(ABSENCE, [6, 6]);
    expect(d.gravite).toBe('bon');
    expect(d.verdict).toMatch(/aucun indice/i);
  });

  it('présence d’indices : conclusion grave', () => {
    const d = analyserTermites(INDICES, [6, 6]);
    expect(d.gravite).toBe('alerte');
    expect(d.verdict).toMatch(/indices/i);
  });
});

describe('⚠️ le troisième état de la norme, celui qui n’est pas lu', () => {
  /**
   * Des termites vivants, c'est le maximum de gravité que ce diagnostic peut
   * porter. Aujourd'hui le moteur rend « neutre ».
   */
  it.fails('présence de termites : devrait être la conclusion la plus grave', () => {
    const d = analyserTermites(INFESTATION, [6, 6]);
    expect(d.gravite).toBe('alerte');
  });

  /**
   * Et le verdict devrait le dire. Aujourd'hui il annonce que la conclusion
   * n'a pas pu être lue — le pire message possible sur le pire des cas.
   */
  it.fails('présence de termites : le verdict devrait nommer les termites', () => {
    const d = analyserTermites(INFESTATION, [6, 6]);
    expect(d.verdict).toMatch(/termites/i);
    expect(d.verdict).not.toMatch(/n’a pas pu être lue/i);
  });

  /**
   * La zone concernée devrait ressortir. Aujourd'hui aucune zone n'est
   * produite du tout : l'écran n'a rien à montrer.
   */
  it.fails('présence de termites : la zone touchée devrait être nommée', () => {
    const d = analyserTermites(INFESTATION, [6, 6]);
    const zones = d.schema?.genre === 'pieces' ? d.schema.zones : [];
    expect(zones.some((z) => z.etat === 'alerte')).toBe(true);
  });

  /**
   * Ce test-ci passe, et c'est lui qui rend les trois précédents lisibles : il
   * montre ce que le moteur répond aujourd'hui, pour qu'on n'ait pas à le
   * deviner en lisant les échecs.
   */
  it('constate l’état actuel : la conclusion est déclarée illisible', () => {
    const d = analyserTermites(INFESTATION, [6, 6]);
    expect(d.gravite).toBe('neutre');
    expect(d.verdict).toMatch(/n’a pas pu être lue/i);
  });
});
