import { describe, it, expect } from 'vitest';
import { espacesFrancaises } from './typographie';

const INSEC = ' ';
const FINE = ' ';

describe('les espaces françaises', () => {
  it('retient le guillemet fermant en fin de ligne', () => {
    /* Le défaut relevé à l'écran sur la fiche du DPE : le « » » tombait seul
       au début de la ligne suivante. */
    const rendu = espacesFrancaises('une « passoire thermique ». La loi limite');
    expect(rendu).toBe(`une «${INSEC}passoire thermique${INSEC}». La loi limite`);
  });

  it('colle la ponctuation double à son mot', () => {
    expect(espacesFrancaises('Où ? Ici : là ; ainsi !')).toBe(
      `Où${FINE}? Ici${INSEC}: là${FINE}; ainsi${FINE}!`
    );
  });

  it('pose l’espace même quand il n’y en avait aucune', () => {
    expect(espacesFrancaises('Attention: ceci')).toBe(`Attention${INSEC}: ceci`);
  });

  it('ne sépare pas un nombre de son unité', () => {
    expect(espacesFrancaises('373 kWh, 42 m², 15 %')).toBe(
      `373${INSEC}kWh, 42${INSEC}m², 15${INSEC}%`
    );
  });

  it('s’applique deux fois sans rien abîmer', () => {
    const une = espacesFrancaises('un « mot » ; et 12 %');
    expect(espacesFrancaises(une)).toBe(une);
  });

  it('laisse une URL intacte', () => {
    /* Sans cette garde, « http://x » perdrait son deux-points au profit d'une
       insécable, et le lien deviendrait faux. */
    const url = 'voir https://exhome.github.io/checkmydiag/ : la page';
    expect(espacesFrancaises(url)).toBe(url);
  });

  it('ne touche pas à un texte qui n’a rien à corriger', () => {
    expect(espacesFrancaises('Aucun indice de termites relevé.')).toBe(
      'Aucun indice de termites relevé.'
    );
  });
});
