/**
 * Les lecteurs de mesurage, éprouvés sur les formes relevées dans 18 volets lus
 * en entier le 22/08/2026 (`docs/OU-PARSER-MESURAGE.md`).
 *
 * Les extraits ci-dessous reproduisent la **disposition** des rapports —
 * l'ordre des lignes, les en-têtes cassés, les commentaires qui enjambent — et
 * rien d'autre : ni nom, ni adresse, ni référence de dossier. Le corpus ne
 * rentre jamais dans le dépôt ; ses formes, si.
 */
import { describe, expect, it } from 'vitest';
import { lireLeMesurage, LECTEURS_MESURAGE } from './index';
import { ecartNonCompte, piecesEcartees } from './modele';
import { confronter, lireLaSurfaceDeReference } from './reference';
import { signaturesQuiRepondent } from '../socle';

/** Certificat de superficie LICIEL — la forme Carrez, décimale à la virgule. */
const LICIEL_CARREZ = `
Certificat de superficie n° 00/AAA/0000
Certificat de superficie de la partie privative
Numéro de dossier : 00/AAA/0000
Date du repérage : 28/10/2024
Superficie privative en m² du ou des lot(s)
Surface loi Carrez totale : 122,73 m² (cent vingt - deux mètres carrés soixante - treize)
Surface au sol totale : 122,92 m² (cent vingt - deux mètres carrés quatre - vingt - douze)
1 / 4
Rapport du :
28/10/2024
Certificat de superficie n° 00/AAA/0000
Résultat du repérage
Documents remis par le donneur d’ordre à l’opérateur de repérage :
Néant
Liste des pièces non visitées :
1er étage - Combles (Absence de trappe de visite / Mansarde)
Représentant du propriétaire (accompagnateur) :
Sans accompagnateur
Tableau récapitulatif des surfaces de chaque pièce au sens Loi Carrez :
Superficie privative au
Parties de l'immeuble bâtis visitées Surface au sol Commentaires
sens Carrez
Rez de chaussée - Entrée 6,1 6,1
Rez de chaussée - Salle d'eau 3,88 3,88
Surface occupée par un chauffe eau fixe et
Rez de chaussée - Buhanderie 3,09 3,28
obligatoire
1er étage - Palier 11,7 11,7
Superficie privative en m² du ou des lot(s) :
Surface loi Carrez totale : 122,73 m² (cent vingt - deux mètres carrés soixante - treize)
Surface au sol totale : 122,92 m² (cent vingt - deux mètres carrés quatre - vingt - douze)
`
  .trim()
  .split('\n');

/** Attestation de surface LICIEL — la forme Boutin, décimale au point (2022). */
const LICIEL_BOUTIN = `
Attestation de surface n° 00/AAA/0000
Attestation de surface habitable
Numéro de dossier : 00/AAA/0000
Date du repérage : 24/01/2022
Attestation de surface n° 00/AAA/0000
Surface habitable totale: 60.72 m² (soixante mètres carrés soixante - douze)
Surface au sol totale: 60.72 m² (soixante mètres carrés soixante - douze)
2 / 4
Rapport du :
25/01/2022
Attestation de surface n° 00/AAA/0000
Résultat du repérage
Liste des pièces non visitées :
Néant
Représentant du propriétaire (accompagnateur) :
Sans accompagnateur
Parties de l'immeuble bâtis visitées Superficie habitable Surface au sol Commentaires
Rez de chaussée - Dégagement 7.68 7.68
Rez de chaussée - Séjour/Cuisine 25.33 25.33
Superficie habitable en m² du ou des lot(s) :
Surface habitable totale: 60.72 m² (soixante mètres carrés soixante - douze)
Surface au sol totale: 60.72 m² (soixante mètres carrés soixante - douze)
`
  .trim()
  .split('\n');

/** Attestation « Loi Carrez » BC2E — conclusion en tête, trois colonnes. */
const BC2E_CARREZ = `
Attestation de Superficie "Loi Carrez"
Loi Carrez : article 46 de la loi n° 65-557 du 10 juillet 1965 modifié par la loi n° 96-1107 du 18 décembre 1996
MISSION N° : 000000000 iND n° 1
Porte : Date de visite : 17/02/2021 Escalier :
CONCLUSIONS
Je soussigné(e) OPÉRATEUR atteste que :
La superficie privative (Loi Carrez) est : 30.02 m²
ATTESTATION LOI CARREZ : 1 sur 3
DDT : 4 sur 7
IDENTIFICATION DE L'OPÉRATEUR DE REPÉRAGE :
DÉTAIL DES SUPERFICIES :
SUPERFICIE PRIVATIVE DE LOT(S) en m²
Superficie privative « Loi Autres superficies
Étage Lot Local Superficie HSP < 1.80M
Carrez » exclues
05 Séjour/Cuisine 26.40 0.00 11.00
05 Salle d'eau 3.62 0.00 0.00
05 Débarras 0.00 0.00 5.02
Totaux 30.02 m² 0.00 m² 16.02 m²
Surface totale au sol (Carrez et Hors Carrez) : 46.04 m²
Particularités liées à ce mesurage :
Néant
Le réglement de copropriété et l'état descriptif de division n'ayant pas été fournis par le demandeur, cette attestation est délivrée
L'acte de propriété n'a pas été fourni.
Etablie le
17/02/2021
ATTESTATION LOI CARREZ : 2 sur 3
`
  .trim()
  .split('\n');

/** Attestation « Loi Boutin » BC2E — aucune surface au sol dans ce volet. */
const BC2E_BOUTIN = `
Attestation de Surface Habitable "Loi Boutin"
Conforme à l art. 78 de la loi n°2009-323 du 25 mars 2009
MISSION N° : 000000000 iND n° 1
Porte : Date de visite : 02/06/2021 Escalier :
CONCLUSIONS
Je soussigné OPÉRATEUR atteste que :
La superficie habitable est : 55.91 m²
ATTESTATION LOI BOUTIN : 1 sur 2
DÉTAIL DES SUPERFICIES :
SUPERFICIE HABITABLE en m²
Autres superficies
Étage Lot Local Superficie habitable Superficie HSP < 1.80M
exclues
RDC Entrée 7.62 0.00 0.00
RDC Jardin 0.00 14.56 0.00
SOUS-SOL Cave 0.00 14.00 0.00
Totaux 55.91 m² 28.56 m² 0.00 m²
Particularités liées à ce mesurage :
Néant
L'acte de propriété n'a pas été fourni.
Etablie le
02/06/2021
ATTESTATION LOI BOUTIN : 2 sur 2
`
  .trim()
  .split('\n');

/**
 * Le TROISIÈME gabarit BC2E — un mesurage qui ne relève d'aucune loi, et qui
 * l'écrit sur lui-même en deuxième ligne. Deux colonnes de surface, la colonne
 * « Lot » remplie, la conclusion sur deux lignes.
 */
const BC2E_SANS_LOI = `
Certificat de Surface
Ce certificat n'est pas une LOI CARREZ, ce document ne peut pas être utilisé comme une LOI CARREZ.
MISSION N° : 000000000
Type : Maison Nbre pièces : Lot : 1
Porte : Date de visite : 22/01/2021 Escalier :
CONCLUSIONS
Surface : 94.57 m²
Autre surface : 0 m²
CERTIFICAT DE SURFACE : 1 sur 2
DDT : 1 sur 2
IDENTIFICATION DE L'OPÉRATEUR DE REPÉRAGE :
DÉTAIL DES SUPERFICIES :
SURFACES en m²
Étage Lot Local Surfaces Autres Surfaces
RDC 1 Veranda 13.99 0
RDC 1 WC 1 1.58 0
RDC 1 Chambre 01 23.76 0
Totaux 94.57 m² 0 m²
Particularités liées à ce mesurage :
Partie Nuit
Etablie le
22/01/2021
CERTIFICAT DE SURFACE : 2 sur 2
`
  .trim()
  .split('\n');

describe('le certificat qui n’est encadré par aucune loi', () => {
  const lu = LECTEURS_MESURAGE[1]!.lire(BC2E_SANS_LOI);

  it('ne se range ni sous Carrez ni sous Boutin', () => {
    /* Sans le test du gabarit, il tombait dans le « sinon » et ressortait
       Boutin : une surface habitable annoncée sur un document qui déclare
       n'être encadré par aucun texte. */
    expect(lu.loi).toBe('aucune');
    expect(lu.intitule).toBe('Certificat de Surface');
  });

  it('remonte la mise en garde du document, mot pour mot', () => {
    expect(lu.miseEnGarde).toBe(
      "Ce certificat n'est pas une LOI CARREZ, ce document ne peut pas être utilisé comme une LOI CARREZ."
    );
  });

  it('lit sa conclusion sur deux lignes', () => {
    expect(lu.surfaceAnnoncee).toMatchObject({ valeur: 94.57, libelle: 'Surface' });
    expect(lu.autresTotaux).toEqual([
      { valeur: 0, libelle: 'Autre surface', source: 'Autre surface : 0 m²' }
    ]);
  });

  it('lit ses deux colonnes, et garde le lot qui est rempli ici', () => {
    expect(lu.pieces).toHaveLength(3);
    expect(lu.pieces[1]).toMatchObject({
      nom: 'WC 1',
      niveau: 'RDC · lot 1',
      retenue: 1.58,
      autres: [{ libelle: 'Autres Surfaces', valeur: 0 }]
    });
    /* La somme retombe sur le total annoncé : la preuve que rien n'est perdu. */
    const somme = lu.pieces.reduce((n, p) => n + p.retenue, 0);
    expect(somme).toBeCloseTo(39.33, 2);
  });

  it('garde la particularité, qui n’est pas « Néant »', () => {
    expect(lu.particularites).toEqual({ etat: 'renseignée', valeur: ['Partie Nuit'] });
  });

  it('une seule signature répond, comme pour les autres gabarits', () => {
    expect(signaturesQuiRepondent(LECTEURS_MESURAGE, BC2E_SANS_LOI)).toEqual(['BC2E']);
  });
});

describe('l’aiguilleur nomme l’éditeur avant de lire', () => {
  it('reconnaît LICIEL à son titre courant', () => {
    const lu = lireLeMesurage(LICIEL_CARREZ);
    expect(lu.etat).toBe('lu');
    if (lu.etat !== 'lu') return;
    expect(lu.editeur).toBe('LICIEL');
    expect(lu.preuve).toMatch(/^Certificat de superficie n°/);
  });

  it('reconnaît BC2E à son pied de volet', () => {
    const lu = lireLeMesurage(BC2E_BOUTIN);
    expect(lu.etat).toBe('lu');
    if (lu.etat !== 'lu') return;
    expect(lu.editeur).toBe('BC2E');
    expect(lu.preuve).toMatch(/^ATTESTATION LOI BOUTIN/);
  });

  it('déclare le format inconnu plutôt que de deviner', () => {
    const lu = lireLeMesurage(['Attestation de superficie', 'Surface : 42 m²']);
    expect(lu.etat).toBe('format inconnu');
  });

  it('jamais deux signatures sur le même document', () => {
    for (const volet of [LICIEL_CARREZ, LICIEL_BOUTIN, BC2E_CARREZ, BC2E_BOUTIN]) {
      expect(signaturesQuiRepondent(LECTEURS_MESURAGE, volet)).toHaveLength(1);
    }
  });

  it('ne prend pas la fiche de synthèse BC2E pour une attestation', () => {
    /* Elle porte la même phrase de conclusion, mais pas le pied du volet — et
       elle écrit elle-même qu'elle ne peut pas être utilisée seule. */
    const synthese = [
      'Fiche de Synthèse',
      'Cette fiche de synthèse ne dispense pas de la lecture des rapports de diagnostics.',
      'Attestation de superficie "Loi Carrez"',
      'La superficie privative (Loi Carrez) est : 30.02 m²',
      'DDT : 2 sur 2'
    ];
    expect(lireLeMesurage(synthese).etat).toBe('format inconnu');
  });
});

describe('LICIEL', () => {
  const carrez = LECTEURS_MESURAGE[0]!.lire(LICIEL_CARREZ);
  const boutin = LECTEURS_MESURAGE[0]!.lire(LICIEL_BOUTIN);

  it('nomme la loi sur l’intitulé du document, pas sur un mot croisé', () => {
    expect(carrez.loi).toBe('carrez');
    expect(carrez.intitule).toBe('Certificat de superficie de la partie privative');
    expect(boutin.loi).toBe('boutin');
    expect(boutin.intitule).toBe('Attestation de surface habitable');
  });

  it('retient la surface due par la loi, et cite son intitulé', () => {
    expect(carrez.surfaceAnnoncee).toMatchObject({
      valeur: 122.73,
      libelle: 'Surface loi Carrez totale'
    });
    expect(boutin.surfaceAnnoncee).toMatchObject({
      valeur: 60.72,
      libelle: 'Surface habitable totale'
    });
  });

  it('n’additionne pas le bloc de totaux imprimé deux fois', () => {
    /* Il apparaît en tête du volet ET en pied de tableau : même chiffre. */
    expect(carrez.autresTotaux).toHaveLength(1);
    expect(carrez.autresTotaux[0]).toMatchObject({
      valeur: 122.92,
      libelle: 'Surface au sol totale'
    });
  });

  it('lit le point comme la virgule décimale', () => {
    expect(boutin.autresTotaux[0]?.valeur).toBe(60.72);
    expect(boutin.pieces[0]?.retenue).toBe(7.68);
  });

  it('recolle le commentaire qui enjambe sa ligne de données', () => {
    const buhanderie = carrez.pieces.find((p) => /Buhanderie/.test(p.nom));
    expect(buhanderie?.commentaire).toBe(
      'Surface occupée par un chauffe eau fixe et obligatoire'
    );
    expect(buhanderie?.retenue).toBe(3.09);
    expect(buhanderie?.autres[0]).toEqual({ libelle: 'Surface au sol', valeur: 3.28 });
  });

  it('n’attribue le commentaire ni à la pièce d’avant ni à celle d’après', () => {
    expect(carrez.pieces.find((p) => /Salle d'eau/.test(p.nom))?.commentaire).toBeNull();
    expect(carrez.pieces.find((p) => /Palier/.test(p.nom))?.commentaire).toBeNull();
  });

  it('lit le commentaire resté sur la ligne, sans perdre la pièce', () => {
    /* Le défaut trouvé sur le corpus le 22/08 : un motif qui exigeait la fin de
       ligne après le second nombre rejetait ces deux pièces entièrement — sans
       erreur et sans trace. La somme tombait à 4,26 m² pour un total de 45,69. */
    const volet = [
      'Certificat de superficie n° 00/AAA/0000',
      'Certificat de superficie de la partie privative',
      'Superficie privative en m² du ou des lot(s)',
      'Surface loi Carrez totale : 45,69 m² (quarante - cinq mètres carrés soixante - neuf)',
      'Surface au sol totale : 49,74 m² (quarante - neuf mètres carrés soixante - quatorze)',
      'Tableau récapitulatif des surfaces de chaque pièce au sens Loi Carrez :',
      'Superficie privative au',
      "Parties de l'immeuble bâtis visitées Surface au sol Commentaires",
      'sens Carrez',
      '1er étage - Entrée /Cuisine/Séjour 27,75 29,25 Surface de marche',
      '1er étage - Salle de bain 4,26 4,26',
      '2ème étage - mezzaninne 13,68 16,23 Hauteur de moins de 1,80m',
      'Superficie privative en m² du ou des lot(s) :'
    ];
    const lu = LECTEURS_MESURAGE[0]!.lire(volet);
    expect(lu.pieces).toHaveLength(3);
    expect(lu.pieces[0]).toMatchObject({
      nom: '1er étage - Entrée /Cuisine/Séjour',
      retenue: 27.75,
      commentaire: 'Surface de marche'
    });
    expect(lu.pieces[2]).toMatchObject({
      nom: '2ème étage - mezzaninne',
      retenue: 13.68,
      commentaire: 'Hauteur de moins de 1,80m'
    });
    /* La vérification qui ne vient pas de nous : la somme retombe sur le total. */
    const somme = lu.pieces.reduce((n, p) => n + p.retenue, 0);
    expect(somme).toBeCloseTo(lu.surfaceAnnoncee!.valeur, 2);
  });

  it('ne prend pas le numéro d’une chambre pour sa surface', () => {
    /* Le défaut trouvé sur l'ÉCHANTILLON TÉMOIN : « Chambre 1 10,1 10,33 … »
       se lisait « Chambre », 1 m² retenu. Deux pièces d'un même volet, et le
       total tombait de 64,88 m² à 44,67 m² sans qu'aucune erreur ne soit levée. */
    const volet = [
      'Attestation de surface n° 00/AAA/0000',
      'Attestation de surface habitable',
      "Parties de l'immeuble bâtis visitées Superficie habitable Surface au sol Commentaires",
      '2ème étage - Entrée / Dégagement 6,03 6,03',
      '2ème étage - Wc 1,84 1,84',
      '2ème étage - Séjour / Cuisine 28,07 28,59 Embrasure de fenêtre(s)',
      '2ème étage - Chambre 1 10,1 10,33 Embrasure de fenêtre(s)',
      '2ème étage - Chambre 2 13,11 13,57 Embrasure de fenêtre(s)',
      '2ème étage - Salle de bain 5,73 5,73',
      'Superficie habitable en m² du ou des lot(s) :',
      'Surface habitable totale : 64,88 m² (soixante - quatre mètres carrés quatre - vingt - huit)',
      'Surface au sol totale : 66,09 m² (soixante - six mètres carrés zéro neuf)'
    ];
    const lu = LECTEURS_MESURAGE[0]!.lire(volet);
    expect(lu.pieces).toHaveLength(6);
    expect(lu.pieces[3]).toMatchObject({
      nom: '2ème étage - Chambre 1',
      retenue: 10.1,
      commentaire: 'Embrasure de fenêtre(s)'
    });
    expect(lu.pieces[4]).toMatchObject({ nom: '2ème étage - Chambre 2', retenue: 13.11 });
    const somme = lu.pieces.reduce((n, p) => n + p.retenue, 0);
    expect(somme).toBeCloseTo(64.88, 2);
  });

  it('ne prend pas un nombre pour un commentaire', () => {
    /* Sans cette garde, « Chambre 01 8.37 8.37 » se lirait « Chambre », 01 m²,
       8.37 m², commentaire « 8.37 » : un nom amputé et une surface inventée. */
    const volet = [
      'Certificat de superficie n° 00/AAA/0000',
      'Certificat de superficie de la partie privative',
      "Parties de l'immeuble bâtis visitées Superficie habitable Surface au sol Commentaires",
      'Rez de chaussée - Chambre 01 8.37 8.37',
      'Superficie privative en m² du ou des lot(s) :'
    ];
    expect(LECTEURS_MESURAGE[0]!.lire(volet).pieces[0]).toMatchObject({
      nom: 'Rez de chaussée - Chambre 01',
      retenue: 8.37,
      commentaire: null
    });
  });

  it('coiffe la colonne avec l’en-tête du rapport, pas le libellé du total', () => {
    /* « Surface loi Carrez totale » posé sur des valeurs pièce par pièce dirait
       « totale » au-dessus de ce qui ne l'est pas. L'en-tête Carrez est cassé
       en trois lignes, l'en-tête Boutin tient sur une : deux lectures. */
    expect(carrez.colonneRetenue).toBe('Superficie privative au sens Carrez');
    expect(boutin.colonneRetenue).toBe('Superficie habitable');
  });

  it('ne prend pas l’en-tête cassé pour un commentaire', () => {
    expect(carrez.pieces[0]?.nom).toBe('Rez de chaussée - Entrée');
    expect(carrez.pieces[0]?.commentaire).toBeNull();
  });

  it('distingue « Néant » d’une liste de pièces non visitées', () => {
    expect(boutin.piecesNonVisitees.etat).toBe('néant');
    expect(carrez.piecesNonVisitees).toMatchObject({
      etat: 'renseignée',
      valeur: [
        {
          designation: '1er étage - Combles',
          motif: 'Absence de trappe de visite / Mansarde'
        }
      ]
    });
  });

  it('lit les deux dates, qui ne sont pas la même', () => {
    expect(boutin.dateVisite).toBe('24/01/2022');
    expect(boutin.dateRapport).toBe('25/01/2022');
  });

  it('ne prête pas à LICIEL une rubrique qu’il n’imprime pas', () => {
    expect(carrez.particularites.etat).toBe('non renseignée');
  });
});

describe('BC2E', () => {
  const carrez = LECTEURS_MESURAGE[1]!.lire(BC2E_CARREZ);
  const boutin = LECTEURS_MESURAGE[1]!.lire(BC2E_BOUTIN);

  it('lit la conclusion écrite en tête du volet', () => {
    expect(carrez.surfaceAnnoncee).toMatchObject({
      valeur: 30.02,
      libelle: 'La superficie privative (Loi Carrez) est'
    });
    expect(boutin.surfaceAnnoncee).toMatchObject({
      valeur: 55.91,
      libelle: 'La superficie habitable est'
    });
  });

  it('ne confond pas les deux lois malgré le vocabulaire inversé', () => {
    /* BC2E dit « superficie habitable » là où LICIEL dit « surface habitable
       totale » : un motif bâti sur l'un de ces mots attribuerait ici la Carrez. */
    expect(boutin.loi).toBe('boutin');
    expect(carrez.loi).toBe('carrez');
  });

  it('garde les trois colonnes, avec les intitulés du rapport', () => {
    const jardin = boutin.pieces.find((p) => p.nom === 'Jardin');
    expect(jardin).toMatchObject({
      niveau: 'RDC',
      retenue: 0,
      autres: [
        { libelle: 'Superficie HSP < 1.80M', valeur: 14.56 },
        { libelle: 'Autres superficies exclues', valeur: 0 }
      ]
    });
  });

  it('ne traduit pas « HSP < 1.80M » : un jardin n’a pas de hauteur sous plafond', () => {
    const libelles = boutin.pieces.flatMap((p) => p.autres.map((a) => a.libelle));
    expect(new Set(libelles)).toEqual(
      new Set(['Superficie HSP < 1.80M', 'Autres superficies exclues'])
    );
  });

  it('ne reprend pas le premier des trois totaux, déjà lu en tête', () => {
    expect(boutin.autresTotaux.map((s) => s.valeur)).toEqual([28.56, 0]);
  });

  it('lit la surface au sol du Carrez, et n’en invente pas en Boutin', () => {
    expect(carrez.autresTotaux.at(-1)).toMatchObject({
      valeur: 46.04,
      libelle: 'Surface totale au sol (Carrez et Hors Carrez)'
    });
    expect(boutin.autresTotaux.some((s) => /au sol/i.test(s.libelle))).toBe(false);
  });

  it('relève les réserves de mission dans les mots du rapport', () => {
    expect(carrez.reserves).toContain("L'acte de propriété n'a pas été fourni.");
    expect(carrez.reserves.some((r) => /règlement|réglement/i.test(r))).toBe(true);
  });

  it('donne l’en-tête de colonne de BC2E, guillemets compris', () => {
    expect(carrez.colonneRetenue).toBe('Superficie privative « Loi Carrez »');
    expect(boutin.colonneRetenue).toBe('Superficie habitable');
  });

  it('ne prête pas à BC2E la rubrique des pièces non visitées', () => {
    expect(boutin.piecesNonVisitees.etat).toBe('non renseignée');
    expect(boutin.particularites.etat).toBe('néant');
  });

  it('lit les dates de visite et d’établissement', () => {
    expect(carrez.dateVisite).toBe('17/02/2021');
    expect(carrez.dateRapport).toBe('17/02/2021');
  });
});

describe('ce que les pièces écartées disent', () => {
  it('compte les mètres carrés qui existent et ne se vendent pas', () => {
    const carrez = LECTEURS_MESURAGE[0]!.lire(LICIEL_CARREZ);
    expect(ecartNonCompte(carrez)).toBe(0.19);
  });

  it('ne rend aucun écart quand il n’y a qu’un total à comparer', () => {
    const boutin = LECTEURS_MESURAGE[1]!.lire(BC2E_BOUTIN);
    /* Les deux autres colonnes valent moins que la surface retenue : rien à
       comparer, et un « 0 » laisserait croire qu'on a vérifié. */
    expect(ecartNonCompte(boutin)).toBeNull();
  });

  it('nomme les pièces mesurées puis écartées', () => {
    const boutin = LECTEURS_MESURAGE[1]!.lire(BC2E_BOUTIN);
    expect(piecesEcartees(boutin).map((p) => p.nom)).toEqual(['Jardin', 'Cave']);
  });
});

describe('la troisième surface : la référence, lue sur le DPE', () => {
  it('lit « Surface de référence », l’intitulé d’après 2024', () => {
    expect(lireLaSurfaceDeReference(['Surface de référence : 42,47 m²'])).toMatchObject({
      etat: 'lue',
      valeur: 42.47,
      libelle: 'Surface de référence'
    });
  });

  it('lit « Surface habitable », l’intitulé d’avant', () => {
    expect(lireLaSurfaceDeReference(['Surface habitable : 31.48 m²'])).toMatchObject({
      etat: 'lue',
      valeur: 31.48,
      libelle: 'Surface habitable'
    });
  });

  it('dit « absente » plutôt que zéro', () => {
    expect(lireLaSurfaceDeReference(['Type de bien : Appartement'])).toEqual({
      etat: 'absente'
    });
  });

  it('met les surfaces côte à côte sans en arbitrer aucune', () => {
    /* Le cas vu dans le corpus : la Carrez vaut 30,92 m², et le DPE du même
       dossier annonce 31,48 m² — le total au sol. Ce n'est pas une erreur, et
       ce n'est pas à nous de trancher. */
    const vues = confronter(
      {
        loi: 'carrez',
        surfaceAnnoncee: {
          valeur: 30.92,
          libelle: 'Surface loi Carrez totale',
          source: 'Surface loi Carrez totale : 30.92 m²'
        },
        autresTotaux: [
          {
            valeur: 31.48,
            libelle: 'Surface au sol totale',
            source: 'Surface au sol totale : 31.48 m²'
          }
        ]
      },
      {
        etat: 'lue',
        valeur: 31.48,
        libelle: 'Surface habitable',
        source: 'Surface habitable : 31.48 m²'
      }
    );
    expect(vues.map((v) => v.valeur)).toEqual([30.92, 31.48, 31.48]);
    expect(vues[0]?.ou).toBe('le certificat de superficie');
    expect(vues[2]?.ou).toBe('la page de garde du DPE');
    /* La surface due par la loi est en tête : c'est la seule qui s'écrira. */
    expect(vues[0]?.aQuoiCaSert).toMatch(/acte de vente/);
  });

  it('n’explique pas une colonne dont l’intitulé ne dit pas ce qu’elle contient', () => {
    /* « Superficie HSP < 1.80M » range un jardin et une cave — ni l'un ni
       l'autre n'a de hauteur sous plafond. On affiche l'intitulé du rapport et
       rien de plus : lui inventer un sens serait parler à sa place. */
    const vues = confronter(
      {
        loi: 'boutin',
        surfaceAnnoncee: {
          valeur: 55.91,
          libelle: 'La superficie habitable est',
          source: 'La superficie habitable est : 55.91 m²'
        },
        autresTotaux: [
          { valeur: 28.56, libelle: 'Superficie HSP < 1.80M', source: 'Totaux 55.91 m² 28.56 m²' }
        ]
      },
      { etat: 'absente' }
    );
    expect(vues[1]).toMatchObject({ quoi: 'Superficie HSP < 1.80M', aQuoiCaSert: null });
    expect(vues[0]?.aQuoiCaSert).toMatch(/bail/);
  });
});
