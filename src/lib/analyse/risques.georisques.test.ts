/**
 * Le second tableau de l'état des risques, et la manière dont le PDF le rend.
 *
 * Ces formes sont recopiées de dossiers réels : les colonnes sortent
 * entrelacées, et le mot qui qualifie la carte ressemble à s'y méprendre à
 * celui qui qualifierait le danger.
 */
import { describe, expect, it } from 'vitest';
import { analyserErp, arretesCatnat, risquesComplementaires } from './risques';

/* Recopié d'un dossier girondin : dix-neuf arrêtés, dont onze sécheresse. */
const CATNAT = [
  'Arrêtés CATNAT sur la commune',
  'Risque Début Fin JO Indemnisé',
  "Par une crue (débordement de cours d'eau) - Par ruissellement et coulée de boue 20/06/2022 22/06/2022 11/08/2022",
  'Sécheresse et réhydratation - Tassements différentiels 01/10/2018 31/12/2018 26/10/2019',
  'Sécheresse et réhydratation - Tassements différentiels 01/01/2017 30/06/2017 20/10/2018',
  'Sécheresse et réhydratation - Tassements différentiels 01/03/2012 31/03/2012 25/05/2013',
  "Par une crue (débordement de cours d'eau) - Par ruissellement et coulée de boue",
  '24/01/2009 27/01/2009 29/01/2009',
  'Tempête (vent) 06/11/1982 10/11/1982 02/12/1982',
  'Pour en savoir plus, chacun peut consulter en préfecture ou en mairie, le dossier départemental',
  'Sécheresse et réhydratation - Tassements différentiels 01/01/1900 31/12/1900 01/01/1901'
];

describe('les arrêtés de catastrophe naturelle', () => {
  it('compte les arrêtés par famille', () => {
    const a = arretesCatnat(CATNAT);
    expect(a?.secheresse).toBe(3);
    expect(a?.inondation).toBe(2);
    expect(a?.total).toBe(6);
  });

  it('s’arrête à la fin du tableau, pas à la fin du document', () => {
    /* La dernière ligne est après le renvoi Géorisques : elle appartient à une
       autre page et ne doit pas être comptée. */
    expect(arretesCatnat(CATNAT)?.derniereSecheresse).toBe(2018);
  });

  it('compte une ligne dont les dates sont rejetées à la ligne suivante', () => {
    /* L'intitulé long fait passer les trois dates à la ligne d'après : compter
       sur la présence des dates perdrait cet arrêté. */
    expect(arretesCatnat(CATNAT)?.inondation).toBe(2);
  });

  it('ne dit rien quand le tableau est absent', () => {
    expect(arretesCatnat(['Etat des Risques et Pollutions'])).toBeNull();
  });
});

describe('le croisement argile ↔ arrêtés sécheresse', () => {
  const lignes = [
    'Etat des Risques et Pollutions',
    'Document réalisé le : 03/08/2023',
    'Le bien se situe dans une zone d’exposition moyenne au retrait-gonflement des argiles.',
    ...CATNAT
  ];

  it('donne sa chair au classement en argile', () => {
    const dit = (analyserErp(lignes, [1, 15]).releves ?? []).map((r) => r.libelle).join(' ');
    expect(dit).toMatch(/3 fois en état de catastrophe naturelle/);
    expect(dit).toMatch(/2018/);
  });

  it('dit que ces arrêtés visent la commune et non le logement', () => {
    const dit = (analyserErp(lignes, [1, 15]).releves ?? []).map((r) => r.libelle).join(' ');
    expect(dit).toMatch(/concernent la commune, pas ce logement/i);
  });

  it('se tait hors zone d’argile : le chiffre inquiéterait sans objet', () => {
    const ailleurs = analyserErp(
      [
        'Etat des Risques et Pollutions',
        'Document réalisé le : 03/08/2023',
        'Le bien ne se situe pas dans une zone de retrait-gonflement des argiles.',
        ...CATNAT
      ],
      [1, 15]
    );
    const dit = (ailleurs.releves ?? []).map((r) => r.libelle).join(' ');
    expect(dit).not.toMatch(/catastrophe naturelle/);
  });
});

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
