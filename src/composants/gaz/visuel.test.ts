/**
 * Ce que ces tests protègent : les quatre REFUS de l'écran gaz.
 *
 * Trois d'entre eux ne mesurent pas un calcul mais une abstention — ne pas dire
 * « conforme », ne pas afficher « 0 » quand on n'a pas lu, ne pas compter les
 * appareils quand on ne sait pas les compter. Ce sont les plus importants :
 * un calcul faux se voit, une affirmation inventée se croit.
 */
import { describe, expect, it } from 'vitest';
import type { LectureGaz } from '../../lib/lecteurs/gaz/modele';
import {
  ceQueLeRapportEtablit,
  couvertureDe,
  groupesDe,
  issueDe,
  niveauDominant,
  NOM_DU_NIVEAU,
  pointsClesDe,
  TITRE_BANDEAU
} from './visuel';

const vide: LectureGaz = {
  alimentee: null,
  natureGaz: null,
  appareils: [],
  anomalies: [],
  zonesNonControlees: [],
  pointsNonVerifies: [],
  constatations: [],
  conclusion: { lisible: false, pourquoi: 'case cochée' }
};

const anomalie = (code: string, niveau: LectureGaz['anomalies'][number]['niveau']) => ({
  code,
  niveau,
  libelle: `libellé de ${code}`,
  appareil: 'Chaudière',
  source: ''
});

describe('le bandeau ne dit jamais « conforme »', () => {
  it('aucun titre ne parle de conformité', () => {
    /*
     * Le mockup du pack porte « Installation intérieure de gaz non conforme ».
     * Ce diagnostic n'atteste d'aucune conformité : il classe des anomalies
     * selon la norme. Une installation ancienne peut n'être conforme à aucune
     * règle d'installation neuve sans porter la moindre anomalie.
     */
    for (const titre of Object.values(TITRE_BANDEAU)) {
      expect(titre.toLowerCase()).not.toMatch(/conform/);
    }
  });

  it('les noms de niveau restent ceux de la norme, jamais ceux du mockup', () => {
    /* Ordre d'Aude des 22 et 23/08/2026 : A1, A2, DGI, 32c et rien d'autre. */
    expect(Object.keys(NOM_DU_NIVEAU).sort()).toEqual(['32c', 'A1', 'A2', 'DGI']);
    for (const nom of Object.values(NOM_DU_NIVEAU)) {
      expect(nom.toLowerCase()).not.toMatch(/à risque|importantes|à améliorer/);
    }
  });
});

describe('une conclusion non lue n’est pas une bonne nouvelle', () => {
  it('sans conclusion lisible et sans anomalie, l’issue est « non lue »', () => {
    /*
     * Chez LICIEL la réponse est une case cochée, et la coche est un dessin qui
     * ne sort pas du PDF — 26 volets sur 26. Rendre « aucune » ici inventerait
     * une installation saine sur un rapport qui peut porter un DGI.
     */
    expect(issueDe(vide)).toBe('nonLue');
    expect(TITRE_BANDEAU[issueDe(vide)]).toMatch(/n’a pas pu être lue/);
  });

  it('« aucune » ne se dit que si le rapport l’écrit', () => {
    const dit: LectureGaz = {
      ...vide,
      conclusion: { lisible: true, texte: 'L’installation ne comporte aucune anomalie', source: '' }
    };
    expect(issueDe(dit)).toBe('aucune');
  });

  it('un DGI prime sur tout le reste', () => {
    const l: LectureGaz = { ...vide, anomalies: [anomalie('8b', 'A1'), anomalie('29c1', 'DGI')] };
    expect(issueDe(l)).toBe('dgi');
    expect(niveauDominant(l)).toBe('DGI');
  });
});

describe('les groupes sont ceux du rapport', () => {
  const l: LectureGaz = {
    ...vide,
    anomalies: [anomalie('29c1', 'DGI'), anomalie('29d5', 'A2'), anomalie('8b', 'A2'), anomalie('20.1', 'A1')]
  };

  it('rangés du plus grave au moins grave, sans groupe vide', () => {
    expect(groupesDe(l).map((g) => g.niveau)).toEqual(['DGI', 'A2', 'A1']);
    /* « 32c : 0 » ferait passer un silence du rapport pour un constat. */
    expect(groupesDe(l).some((g) => g.niveau === '32c')).toBe(false);
  });

  it('aucune anomalie ne se perd en chemin', () => {
    expect(groupesDe(l).reduce((n, g) => n + g.anomalies.length, 0)).toBe(l.anomalies.length);
  });
});

describe('ce que le rapport établit — et ce qu’il ne dit pas', () => {
  it('ne porte jamais un nombre d’appareils', () => {
    /*
     * Mesuré le 22/08/2026 : chez BC2E la rubrique D est disposée en colonnes
     * que le texte aplati entremêle. Deux règles de comptage essayées, deux
     * écartées — 0 volet sur 24, puis 5 sur 24. Tant qu'aucune ne tient, ce
     * nombre ne s'affiche pas : un nombre faux ferait croire l'installation
     * entièrement recensée.
     */
    const l: LectureGaz = {
      ...vide,
      natureGaz: 'Gaz naturel',
      appareils: [
        { designation: 'Chaudière', type: 'Raccordé', puissance: null, annee: null, entretienAppareil: null, entretienConduit: null, localisation: null, co: { etat: 'non renseignée' }, observations: [], source: '' }
      ]
    };
    for (const e of ceQueLeRapportEtablit(l)) {
      expect(e.libelle.toLowerCase()).not.toMatch(/appareil/);
    }
  });

  it('« non alimentée » se dit avec sa conséquence', () => {
    const l: LectureGaz = { ...vide, alimentee: 'NON' };
    const dit = ceQueLeRapportEtablit(l).find((e) => /alimentée/i.test(e.libelle));
    expect(dit?.valeur).toBe('Non');
    /* Sans cette réserve, « Non » se lirait comme une information de confort. */
    expect(dit?.reserve).toMatch(/essais n’ont pas pu être réalisés/);
  });
});

describe('la couverture compte, elle n’estime pas', () => {
  it('accorde « local » au pluriel comme « locaux »', () => {
    const l: LectureGaz = {
      ...vide,
      zonesNonControlees: [
        { zone: 'Grange', motif: null, source: '' },
        { zone: 'Débarras', motif: null, source: '' }
      ]
    };
    expect(couvertureDe(l).phrase).toMatch(/2 locaux n’ont pas pu être visités/);
    expect(couvertureDe(l).phrase).not.toMatch(/localaux/);
  });

  it('un seul point non vérifié se dit au singulier', () => {
    const l: LectureGaz = { ...vide, pointsNonVerifies: [{ appareil: null, point: 'S1', motif: null, source: '' }] };
    expect(couvertureDe(l).phrase).toMatch(/sur ce point/);
  });

  it('rien de manquant se dit aussi — et ne se tait pas', () => {
    expect(couvertureDe(vide).phrase).toMatch(/ne signale ni point de contrôle non réalisé/);
  });
});

describe('les points clés mettent d’abord ce qui coupe le gaz', () => {
  it('le DGI passe avant tout le reste', () => {
    const l: LectureGaz = {
      ...vide,
      alimentee: 'NON',
      anomalies: [anomalie('29c1', 'DGI')],
      pointsNonVerifies: [{ appareil: null, point: 'S1', motif: null, source: '' }]
    };
    expect(pointsClesDe(l)[0]?.ton).toBe('alerte');
    expect(pointsClesDe(l)[0]?.titre).toMatch(/danger grave et immédiat/i);
  });

  it('le monoxyde non mesuré se dit, parce qu’il ne se voit pas', () => {
    const l: LectureGaz = {
      ...vide,
      alimentee: 'OUI',
      appareils: [
        { designation: 'Chaudière', type: null, puissance: null, annee: null, entretienAppareil: null, entretienConduit: null, localisation: null, co: { etat: 'non réalisée' }, observations: [], source: '' }
      ]
    };
    expect(pointsClesDe(l).some((p) => /monoxyde/i.test(p.titre))).toBe(true);
  });
});
