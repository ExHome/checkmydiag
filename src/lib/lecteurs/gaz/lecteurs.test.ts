/**
 * Ce que ces tests protègent : la contrainte du 21/08/2026, « un lecteur par
 * éditeur, choisi sur signature ». Deux d'entre eux ne mesurent pas une
 * extraction mais l'architecture elle-même — qu'aucune signature ne reconnaisse
 * deux formats, et qu'aucun lecteur ne réponde hors du sien.
 *
 * Les extraits reproduisent la FORME des volets lus le 21/08/2026 (26 LICIEL,
 * 6 BC2E) : intitulés, en-têtes de colonnes, libellés de la norme. Aucune
 * donnée d'un rapport réel n'y figure.
 */
import { describe, expect, it } from 'vitest';
import { signaturesQuiRepondent } from '../socle';
import { LECTEURS_GAZ, lireLeGaz } from './index';
import { LECTEUR_GAZ_BC2E } from './bc2e';
import { LECTEUR_GAZ_LICIEL } from './liciel';

const LICIEL = [
  'Etat de l’installation intérieure de Gaz n° 00/XXX/0000',
  'A. - Désignation du ou des bâtiments',
  'Installation alimentée en gaz : ...... OUI',
  'D. - Identification des appareils',
  'Observations :',
  'Chaudière MARQUE Modèle: MODELE Etanche 24 kW Rez de chaussée - Cellier',
  'Mesure CO : 0 ppm',
  '(1) Cuisinière, table de cuisson, chauffe - eaux, chaudière, radiateur, ….',
  'E. - Anomalies identifiées',
  '(selon la norme) (A1 , A2 ,',
  'DGI (6) , 32c (7) )',
  'Tuyauteries fixes - Espace annulaire non obturé C.10 - 14 A2',
  '(4) A1 : L’installation présente une anomalie à prendre en compte lors d’une intervention ultérieure',
  '(5) A2 : L’installation présente une anomalie dont le caractère de gravité ne justifie pas que l’on interrompe aussitôt la',
  'fourniture du gaz, mais est suffisamment importante pour que la réparation soit réalisée dans les meilleurs délais.',
  'F. – Identification des bâtiments et parties du bâtiment (pièces et volumes) n’ayant pu être',
  'contrôlés et motifs, et identification des points de contrôles n’ayant pas pu être réalisés:',
  '1er étage - Combles (Inaccessible en raison de l’encombrement)',
  'Nota : Nous attirons votre attention sur le fait que la responsabilité du donneur d’ordre reste pleinement engagée',
  'G. - Constatations diverses',
  'Commentaires :',
  'Justificatif d’entretien de moins d’un an de la chaudière non présenté',
  'H. - Conclusion',
  'Conclusion :',
  'L’installation ne comporte aucune anomalie.',
  'L’installation comporte des anomalies de type A1 qui devront être réparées ultérieurement.',
  'L’installation comporte des anomalies de type A2 qui devront être réparées dans les meilleurs délais.',
  'L’installation comporte des anomalies de type DGI qui devront être réparées avant remise en service.',
  'L’installation comporte une anomalie 32c qui devra faire l’objet d’un traitement particulier par le syndic'
];

const BC2E = [
  'État des Installations Intérieures de Gaz',
  'Référence normative : d’après la norme NF P 45-500 du 12 janvier 2013',
  'A. PROPRIETAIRE A. MISSION',
  'Distributeur Gaz : GrDF Nature du gaz : Gaz naturel Installation',
  'OUI',
  'alimentée :',
  'CONCLUSIONS',
  'L’installation comporte une ou des anomalie(s) : A1',
  'Il est rappelé que :',
  'D. IDENTIFICATION DES APPAREILS :',
  'GENRE (1), OBSERVATION : anomalie, débit calorifique, taux de CO',
  'Chaudière VMC Gaz, MARQUE, MODELE Raccordé nc Cuisine  L’appareil comporte une ou des anomalie(s) : A1',
  'E. ANOMALIES IDENTIFIÉES :',
  'POINT DE A1, A2, DGI,',
  'Chaudière VMC Gaz 8a1 A1 au moins un robinet de commande d appareil est absent.',
  'A1: l’installation présente une anomalie à prendre en compte lors d’une intervention ultérieure sur l’installation.',
  'F. IDENTIFICATION DES BÂTIMENTS ET PARTIES DU BÂTIMENT (PIECES ET VOLUMES) N’AYANT PU ÊTRE',
  'Bâtiments ou parties du bâtiment n’ayant pu être visités :',
  'Néant',
  'G. CONSTATATIONS DIVERSES :',
  'Justificatif d’entretien de moins d’un an de la chaudière non présenté',
  'L’installation ne comporte aucune anomalie',
  'L’installation comporte des anomalies de type A1 qui devront être réparées ultérieurement',
  'H. ACTIONS DE L’OPÉRATEUR DE DIAGNOSTIC EN CAS DE DGI :',
  'J. OBSERVATIONS DIVERSES :',
  'K. POINT(S) DE CONTRÔLE(S) NON VÉRIFIÉ(S) :',
  'APPAREIL / INSTALLATION POINT DE CONTRÔLE MOTIF',
  'Installation 6a Absence de gaz : impossibilité de réaliser l étanchéité de l installation gaz',
  'Etabli le 00/00/0000'
];

describe('l’architecture : un lecteur par éditeur', () => {
  it('aucune signature ne reconnaît deux formats', () => {
    expect(signaturesQuiRepondent(LECTEURS_GAZ, LICIEL)).toEqual(['LICIEL']);
    expect(signaturesQuiRepondent(LECTEURS_GAZ, BC2E)).toEqual(['BC2E']);
  });

  it('un lecteur ne reconnaît pas le format de l’autre', () => {
    expect(LECTEUR_GAZ_LICIEL.reconnait(BC2E)).toBeNull();
    expect(LECTEUR_GAZ_BC2E.reconnait(LICIEL)).toBeNull();
  });

  it('un format inconnu se déclare, il ne se rafistole pas', () => {
    const autre = ['ÉTAT DE L’INSTALLATION GAZ', 'Rubriques inconnues de nos deux lecteurs'];
    const lu = lireLeGaz(autre);
    expect(lu.etat).toBe('format inconnu');
    if (lu.etat === 'format inconnu') expect(lu.essayes).toEqual(['LICIEL', 'BC2E']);
  });

  it('l’aiguillage nomme l’éditeur et cite sa preuve', () => {
    const lu = lireLeGaz(BC2E);
    expect(lu.etat).toBe('lu');
    if (lu.etat === 'lu') {
      expect(lu.editeur).toBe('BC2E');
      expect(lu.preuve).toMatch(/ANOMALIES IDENTIFI|POINT\(S\) DE CONTR/i);
    }
  });
});

describe('LICIEL — ce que 26 volets ont imposé', () => {
  const lu = LECTEUR_GAZ_LICIEL.lire(LICIEL);

  it('ne prétend pas lire la conclusion, et dit pourquoi', () => {
    expect(lu.conclusion.lisible).toBe(false);
    if (!lu.conclusion.lisible) expect(lu.conclusion.pourquoi).toMatch(/case cochée/i);
  });

  it('ne prend pas la légende de colonne pour une anomalie', () => {
    expect(lu.anomalies.map((a) => a.source)).not.toContain('DGI (6) , 32c (7) )');
  });

  it('ne prend pas les notes de bas de tableau, ni leurs lignes de continuation', () => {
    const libelles = lu.anomalies.map((a) => a.libelle).join(' ');
    expect(libelles).not.toMatch(/L’installation présente une anomalie à prendre en compte/);
    expect(libelles).not.toMatch(/fourniture du gaz, mais est suffisamment importante/);
  });

  it('retient l’anomalie, avec son code préfixé et son niveau', () => {
    expect(lu.anomalies).toHaveLength(1);
    expect(lu.anomalies[0]?.code).toBe('C.10 - 14');
    expect(lu.anomalies[0]?.niveau).toBe('A2');
  });

  it('ne rattache pas l’anomalie à un appareil : ce format ne le permet pas', () => {
    expect(lu.anomalies[0]?.appareil).toBeNull();
  });

  /*
   * La régression du 22/08 : une anomalie s'étale sur PLUSIEURS lignes — code
   * seul, puis niveau, puis libellé — et une version du lecteur ne gardait que
   * la ligne du code. Les A1, A2 et DGI du rapport étaient perdus.
   *
   * Le piège de la correction : les appels de note `(3)`, `(4) (5)` figurent
   * aussi dans l'en-tête du tableau. Fermer le bloc dessus faisait ressortir
   * « zéro anomalie » sur un volet qui porte un DGI.
   */
  it('lit une anomalie étalée sur plusieurs lignes, niveau compris', () => {
    const etale = [
      'E. - Anomalies identifiées',
      'Anomalies',
      '(3)',
      'Points de contrôle observées',
      '(4) (5) Libellé des anomalies et recommandations Photos',
      '(selon la norme) (A1 , A2 ,',
      'DGI (6) , 32c (7) )',
      'C.7 - 8a1',
      'Au moins un organe de coupure d’appareil est',
      'Organe de Coupure d’Appareil A1',
      'absent. (Chaudière MARQUE MODELE)',
      'D.3 - S1',
      'DGI Remarques : (RDC - Cuisine)',
      'Présence d’un taux de CO (Monoxyde de Carbone) supérieur à 25 ppm',
      '(4) A1 : L’installation présente une anomalie à prendre en compte',
      '(5) A2 : L’installation présente une anomalie dont le caractère',
      'fourniture du gaz, mais est suffisamment importante pour que la réparation',
      'F. – Identification des bâtiments et parties du bâtiment'
    ];
    const a = LECTEUR_GAZ_LICIEL.lire(etale).anomalies;
    expect(a).toHaveLength(2);
    expect(a[0]?.niveau).toBe('A1');
    expect(a[1]?.niveau).toBe('DGI');
    expect(a[0]?.libelle).toMatch(/organe de coupure d’appareil est.*absent/i);
    /* « Monoxyde de Carbone » est une glose de la norme, pas un appareil. */
    expect(a[1]?.appareil).toBeNull();
    expect(a[0]?.appareil).toMatch(/Chaudière/);
    /* La continuation de la note (5) n'appartient à aucune anomalie. */
    expect(a.map((x) => x.libelle).join(' ')).not.toMatch(/fourniture du gaz, mais est suffisamment/);
  });

  it('lit l’alimentation, la zone non contrôlée et son motif', () => {
    expect(lu.alimentee).toBe('OUI');
    expect(lu.zonesNonControlees[0]?.zone).toMatch(/Combles/);
    expect(lu.zonesNonControlees[0]?.motif).toMatch(/encombrement/i);
  });

  it('recopie la mesure de CO telle quelle', () => {
    expect(lu.appareils[0]?.co).toEqual({ etat: 'mesurée', valeur: '0 ppm' });
  });

  /*
   * Le volet d'annexe imprime les deux réponses et coche la bonne d'un dessin.
   * Répondre « NON » y serait pire que se taire : une installation non
   * alimentée ne permet aucun essai, et toute la portée du volet en dépend.
   */
  it('ne conclut pas quand les deux réponses sont imprimées', () => {
    const annexe = [
      'Etat de l’Installation Intérieure de GAZ',
      'Annexe',
      'E. - Anomalies identifiées',
      'Type de bâtiment : Appartement Maison individuelle',
      'Nature du gaz distribué : GN GPL Air propané ou butané',
      'Installation alimentée en gaz : OUI NON'
    ];
    expect(LECTEUR_GAZ_LICIEL.lire(annexe).alimentee).toBeNull();
  });
});

describe('BC2E — ce que 6 volets ont démenti', () => {
  const lu = LECTEUR_GAZ_BC2E.lire(BC2E);

  it('lit la conclusion, qui est écrite en clair', () => {
    expect(lu.conclusion.lisible).toBe(true);
    if (lu.conclusion.lisible) expect(lu.conclusion.texte).toMatch(/une ou des anomalie\(s\) : A1/);
  });

  it('lit le code nu, que le motif de LICIEL ne trouverait pas', () => {
    expect(lu.anomalies).toHaveLength(1);
    expect(lu.anomalies[0]?.code).toBe('8a1');
    expect(lu.anomalies[0]?.niveau).toBe('A1');
  });

  it('rattache l’anomalie à son appareil, parce que le format l’écrit', () => {
    expect(lu.anomalies[0]?.appareil).toMatch(/Chaudière VMC Gaz/);
  });

  it('lit la rubrique K, qui n’existe pas chez LICIEL', () => {
    expect(lu.pointsNonVerifies).toHaveLength(1);
    expect(lu.pointsNonVerifies[0]?.point).toBe('6a');
    expect(lu.pointsNonVerifies[0]?.motif).toMatch(/Absence de gaz/i);
  });

  it('n’avale pas les cinq phrases imprimées de la rubrique G', () => {
    expect(lu.constatations.join(' ')).not.toMatch(/ne comporte aucune anomalie/);
    expect(lu.constatations.join(' ')).toMatch(/Justificatif d’entretien/);
  });
});

/**
 * LES DEUX DÉFAUTS TROUVÉS LE 22/08/2026, EN RELISANT UN VOLET RÉEL.
 *
 * Ni l'un ni l'autre ne se voyait : le lecteur rendait des anomalies
 * parfaitement vraisemblables, avec un code qui existe et un libellé lisible.
 * C'est ce qui les rendait dangereux. Ces tests sont là pour qu'ils ne
 * reviennent pas — la forme reproduite est celle du volet, sans ses données.
 */
describe('BC2E — ce qu’une relecture du 22/08/2026 a corrigé', () => {
  /* La colonne « LIBELLÉ » est étroite : son texte court sur les lignes voisines. */
  const DEBORDEMENT = [
    'État des Installations Intérieures de Gaz',
    'K. POINT(S) DE CONTRÔLE(S) NON VÉRIFIÉ(S) :',
    'E. ANOMALIES IDENTIFIÉES :',
    'APPAREIL LIBELLÉ DES ANOMALIES ET RECOMMANDATIONS',
    'Chaudière 29d5 A2 le conduit de raccordement n est pas démontable.',
    'le conduit de raccordement présente un jeu aux assemblages estimé supérieur à 2',
    'Chaudière 29c1 DGI',
    'mm de part et d autre du diamètre du conduit.',
    'Radiateur non raccordé 19.1 A2 le local équipé n est pas pourvu d une amenée d air.',
    'le local équipé ou prévu pour un appareil d utilisation n est pas pourvu de sortie d',
    'Radiateur non raccordé 20.1 A1',
    'air.',
    'A1: l’installation présente une anomalie à prendre en compte lors d’une intervention ultérieure.',
    'F. IDENTIFICATION DES BÂTIMENTS ET PARTIES DU BÂTIMENT N’AYANT PU ÊTRE'
  ];
  const lu = LECTEUR_GAZ_BC2E.lire(DEBORDEMENT);
  const parCode = (c: string) => lu.anomalies.find((a) => a.code === c);

  it('le point fait partie du code : 19.1 n’est pas 19, 20.1 n’est pas 20', () => {
    expect(lu.anomalies.map((a) => a.code)).toEqual(['29d5', '29c1', '19.1', '20.1']);
    /* 19 et 20 existent aussi dans la norme : la troncature restait crédible. */
    expect(parCode('19')).toBeUndefined();
    expect(parCode('20')).toBeUndefined();
  });

  it('un rang nu récupère son libellé, au-dessus ET en dessous', () => {
    /* Sans cela, le DGI — le niveau qui fait couper le gaz — arrivait sans motif. */
    expect(parCode('29c1')?.libelle).toBe(
      'le conduit de raccordement présente un jeu aux assemblages estimé supérieur à 2 mm de part et d autre du diamètre du conduit.'
    );
    expect(parCode('20.1')?.libelle).toBe(
      'le local équipé ou prévu pour un appareil d utilisation n est pas pourvu de sortie d air.'
    );
  });

  it('un rang déjà complet ne vole pas le libellé du suivant', () => {
    expect(parCode('29d5')?.libelle).toBe('le conduit de raccordement n est pas démontable.');
    expect(parCode('19.1')?.libelle).toBe('le local équipé n est pas pourvu d une amenée d air.');
  });

  it('le libellé ne répète plus l’appareil, le code ni le niveau', () => {
    for (const a of lu.anomalies) {
      expect(a.libelle).not.toMatch(/^(Chaudière|Radiateur)/);
      expect(a.libelle).not.toMatch(new RegExp(`\b${a.niveau}\b`));
    }
  });
});
