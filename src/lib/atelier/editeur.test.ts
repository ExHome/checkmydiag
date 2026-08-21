import { describe, expect, it } from 'vitest';
import {
  generateursMeles,
  identifierGenerateur,
  logicielDeclare,
  signatureDuPdf
} from './editeur';

/**
 * Les chaînes de ce fichier sont RELEVÉES sur le corpus, pas inventées.
 *
 * Aucune ne porte de nom ni d'adresse : ce sont des lignes de générateur et des
 * métadonnées d'impression. Le corpus lui-même n'entre jamais dans le dépôt.
 */

describe('la rubrique « Référence du logiciel validé »', () => {
  it('nomme LICIEL, tel que 24 DDT du corpus l’écrivent', () => {
    const g = logicielDeclare([
      'Référence du logiciel validé : LICIEL Diagnostics v4 [Moteur BBS Slama: 2025]'
    ]);
    expect(g?.editeur).toBe('LICIEL');
    expect(g?.societe).toBe('LICIEL Diagnostics Environnement');
    expect(g?.version).toBe('v4');
  });

  it('nomme les quatre autres éditeurs lus hors Liciel', () => {
    const formes = [
      ['Référence du logiciel validé : DPEWIN version V5', 'DPE WIN', 'V5'],
      ['Référence du logiciel validé : DPEWIN version V4', 'DPE WIN', 'V4'],
      ["Référence du logiciel validé : Imm'PACT DPE Version 7A", "Imm'PACT", null],
      /* « 2021 » est la méthode de calcul, pas la version du logiciel : la
         version d'AnalysImmo est 4.1.1, et c'est elle qui commande la forme. */
      ['Référence du logiciel validé : AnalysImmo DPE 2021 4.1.1', 'AnalysImmo', '4.1.1']
    ] as const;
    for (const [ligne, editeur, version] of formes) {
      const g = logicielDeclare([ligne]);
      expect(g?.editeur, ligne).toBe(editeur);
      if (version) expect(g?.version, ligne).toBe(version);
    }
  });

  /*
   * 26 des 50 DDT mesurés n'ont pas de DPE — donc pas de rubrique, donc rien
   * qui nomme leur logiciel dans le texte. « Non trouvé » est la seule réponse
   * juste : on ne se rabat pas sur une recherche globale.
   */
  it('reste muette quand la rubrique est absente', () => {
    expect(logicielDeclare(['ÉTAT RELATIF À LA PRÉSENCE DE TERMITES', 'Néant'])).toBeNull();
  });
});

describe('les deux faux que le corps du rapport tend', () => {
  /*
   * « fisa » ressortait sur 40 rapports sur 50 : c'est « insuffisante », dans
   * le paragraphe amiante. Fisa-DPE est un vrai logiciel — et il n'était là
   * dans aucun de ces rapports.
   */
  it('« insuffisante » ne fait pas un logiciel Fisa-DPE', () => {
    const g = identifierGenerateur({}, [
      'dans les cas les plus graves produire une insuffisance respiratoire par',
      'contient au plus 2 couches en quantité suffisante pour analyse.'
    ]);
    expect(g.editeur).toBeNull();
    expect(g.source).toBe('inconnue');
  });

  /*
   * ITGA édite Imm'PACT ET analyse les prélèvements d'amiante. Dans le corps
   * d'un rapport LICIEL, « ITGA » désigne le laboratoire — jamais le
   * générateur. C'est la métadonnée `Creator`, elle, qui le désigne.
   */
  it('« ITGA » dans le corps est un laboratoire, pas un éditeur', () => {
    const g = identifierGenerateur({ producteur: 'iTextSharp™ 5.4.0 ©2000-2012 1T3XT BVBA' }, [
      'Laboratoire : 05.56.80.15.24 www.itga.fr Portée disponible',
      'Commande ITGA : IT0526-13070'
    ]);
    expect(g.editeur).toBe('LICIEL');
    expect(g.source).toBe('signature');
  });

  it('« ITGA » en métadonnée de création, lui, désigne bien Imm’PACT', () => {
    const g = identifierGenerateur({
      producteur: 'iTextSharp™ 5.5.13 ©2000-2018 iText Group NV (AGPL-version)',
      createur: 'ITGA'
    });
    expect(g.editeur).toBe("Imm'PACT");
  });
});

describe('l’empreinte d’impression du PDF', () => {
  it('reconnaît LICIEL sur la version 5.4 d’iTextSharp — 346 PDF du corpus', () => {
    const s = signatureDuPdf({ producteur: 'iTextSharp™ 5.4.0 ©2000-2012 1T3XT BVBA (AGPL-version)' });
    expect(s?.editeur).toBe('LICIEL');
    expect(s?.genre).toBe('diagnostic');
  });

  it('écarte les factures sans les ouvrir — 216 PDF d’une page', () => {
    expect(signatureDuPdf({ producteur: 'mPDF 8.0.17' })?.genre).toBe('facture');
  });

  it('reconnaît les états des risques PreventImmo', () => {
    const s = signatureDuPdf({
      producteur: 'itext-paulo-155 (itextpdf.sf.net-lowagie.com)',
      createur: 'pdftk-java 3.2.2'
    });
    expect(s?.editeur).toBe('PreventImmo');
  });

  /*
   * Le danger n'est pas de ne rien lire, c'est de conclure : sur une
   * numérisation, chaque volet paraît vide et le silence de l'extraction se lit
   * comme un rapport sans défaut. L'empreinte le dit AVANT toute lecture.
   */
  it('annonce une numérisation avant même d’extraire le texte', () => {
    const scanners = [
      { producteur: 'GPL Ghostscript 8.50', createur: 'PDFCreator Version 0.9.0' },
      { producteur: 'SECnvtToPDF V1.0', createur: 'TOSHIBA e-STUDIO3040C' },
      { producteur: 'MFPImgLib V3.5', createur: 'TOSHIBA e-STUDIO281c' },
      { producteur: 'RICOH MP C3503', createur: 'RICOH MP C3503' },
      { producteur: 'Microsoft: Print To PDF' }
    ];
    for (const meta of scanners) {
      expect(signatureDuPdf(meta)?.genre, meta.producteur).toBe('numérisation');
    }
  });

  /*
   * 59 PDF du corpus sortent d'une chaîne HTML2PDF qui ne nomme pas l'éditeur.
   * Le référentiel doit porter ce trou tel quel, pas une hypothèse.
   */
  it('avoue son ignorance sur la famille HTML2PDF, sans la combler', () => {
    const s = signatureDuPdf({ producteur: 'TCPDF 5.0.002 (http://www.tcpdf.org)', createur: 'HTML2PDF - TCPDF' });
    expect(s?.genre).toBe('diagnostic');
    expect(s?.editeur).toBeNull();
    expect(identifierGenerateur({ producteur: 'TCPDF 5.0.002', createur: 'HTML2PDF - TCPDF' }).source).toBe(
      'inconnue'
    );
  });
});

describe('quand les deux sources se contredisent', () => {
  it('la déclaration du rapport prime sur son empreinte d’impression', () => {
    const g = identifierGenerateur(
      { producteur: 'iTextSharp™ 5.4.0 ©2000-2012 1T3XT BVBA' },
      ['Référence du logiciel validé : AnalysImmo DPE 2021 4.1.1']
    );
    expect(g.editeur).toBe('AnalysImmo');
    expect(g.source).toBe('déclaration');
  });

  /*
   * Ce n'est pas une contradiction à arbitrer : c'est un dossier assemblé, dont
   * le DPE vient d'un logiciel et le reste d'un autre. Les repères d'un éditeur
   * ne valent alors que pour les volets qui sont de lui.
   */
  it('signale un dossier qui mêle deux générateurs', () => {
    expect(
      generateursMeles({ producteur: 'iTextSharp™ 5.4.0' }, [
        'Référence du logiciel validé : AnalysImmo DPE 2021 4.1.1'
      ])
    ).toBe(true);
    expect(
      generateursMeles({ producteur: 'iTextSharp™ 5.4.0' }, [
        'Référence du logiciel validé : LICIEL Diagnostics v4 [Moteur BBS Slama: 2025]'
      ])
    ).toBe(false);
  });
});
