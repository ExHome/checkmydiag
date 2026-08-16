/**
 * Le second tableau de l'état des risques, et la manière dont le PDF le rend.
 *
 * Ces formes sont recopiées de dossiers réels : les colonnes sortent
 * entrelacées, et le mot qui qualifie la carte ressemble à s'y méprendre à
 * celui qui qualifierait le danger.
 */
import { describe, expect, it } from 'vitest';
import { analyserErp, risquesComplementaires } from './risques';

/* La forme exacte, telle qu'elle sort du PDF : le détail avant le nom du
   risque, la valeur deux lignes plus bas. */
const TABLEAU = [
  'Etat des risques complémentaires (Géorisques)',
  'Risques Concerné Détails',
  'TRI : Territoire à',
  "Risque important Non",
  '-',
  "d'Inondation",
  'Zones potentiellement sujettes aux inondations de cave, fiabilité',
  'Remontées de nappes Oui',
  'FORTE (dans un rayon de 500 mètres).',
  'Non',
  '-',
  'Installation nucléaire',
  'ICPE : Installations Le bien se situe dans un rayon de 1000 mètres d’une ou plusieurs',
  'Oui',
  'industrielles',
  'installations identifiées.'
];

describe('les risques complémentaires', () => {
  it('lit la remontée de nappe malgré les colonnes entrelacées', () => {
    const r = risquesComplementaires(TABLEAU);
    expect(r.nappe?.concernee).toBe(true);
  });

  it('lit la fiabilité, qui est séparée du mot « fiabilité » par deux lignes', () => {
    expect(risquesComplementaires(TABLEAU).nappe?.fiabiliteDeLaCarte).toBe('forte');
  });

  it('lit le rayon des installations classées', () => {
    expect(risquesComplementaires(TABLEAU).icpe).toBe(1000);
  });

  it('ne dit rien quand le tableau est absent', () => {
    const r = risquesComplementaires(['Etat des Risques et Pollutions', 'Zonage de sismicité : 2 - Faible']);
    expect(r.nappe).toBeNull();
    expect(r.icpe).toBeNull();
  });

  it('distingue une nappe non concernée d’une nappe absente', () => {
    const r = risquesComplementaires(['Remontées de nappes', 'Non', '-']);
    expect(r.nappe).toEqual({ concernee: false, fiabiliteDeLaCarte: null });
  });
});

describe('ce que l’explication en fait', () => {
  const diag = analyserErp(
    [
      'Etat des Risques et Pollutions',
      'Document réalisé le : 03/08/2023',
      'Le bien ne se situe pas dans une zone d’un Plan d’Exposition au Bruit.',
      ...TABLEAU
    ],
    [1, 15]
  );

  it('signale la nappe en complément', () => {
    const dit = (diag.releves ?? []).map((r) => r.libelle).join(' ');
    expect(dit).toMatch(/remont[ée]e de nappe/i);
    expect(dit).toMatch(/cave ou un sous-sol/i);
  });

  it('dit que la fiabilité qualifie la carte et non le danger', () => {
    const dit = (diag.releves ?? []).map((r) => r.libelle).join(' ');
    expect(dit).toMatch(/qualifie la carte, pas le danger/i);
    /* Le contresens à ne jamais commettre : annoncer un risque « fort ». */
    expect(dit).not.toMatch(/risque[^.]{0,20}(?:fort|élevé)\b/i);
  });

  it('ne fait pas monter la gravité du verdict : ce tableau est informatif', () => {
    /* Rien dans l'imprimé officiel ici, sauf le bruit « non concerné ». Le
       second tableau ne doit pas transformer cela en alerte. */
    expect(diag.gravite).not.toBe('alerte');
    expect(diag.verdict).not.toMatch(/nappe/i);
  });
});
