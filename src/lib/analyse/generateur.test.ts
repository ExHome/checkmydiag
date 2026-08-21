import { describe, expect, it } from 'vitest';
import { analyser } from './index';
import type { PageTexte } from '../lignes';

/**
 * L'éditeur descend jusqu'à l'analyse — et il y arrive en premier.
 *
 * « L'éditeur conditionne le formalisme. L'éditeur conditionne tout. »
 *
 * Ce n'est pas une information de plus dans la fiche : c'est ce qui dit quelle
 * carte de lecture appliquer. Une mise en page mesurée sur cent rapports d'un
 * même générateur n'est pas une règle du métier — c'est l'habitude d'un
 * logiciel, et le lecteur qui la généralise se trompe partout ailleurs.
 *
 * Vérifié en vrai sur le CREP : la réponse OUI/NON des cinq situations termine
 * la première ligne du libellé chez un éditeur, et occupe une ligne à elle
 * seule chez un autre. Appliquer la mauvaise carte fait lire un NON là où le
 * rapport dit OUI — sur une situation de saturnisme infantile.
 *
 * L'empreinte d'impression était déjà portée par le chargeur de PDF ; elle
 * n'était simplement jamais transmise à l'analyse.
 */
const page = (lignes: string[]): PageTexte[] => [
  { numero: 1, lignes: ['Dossier de Diagnostic Technique', ...lignes] }
];

describe('l’éditeur, première question de l’analyse', () => {
  it('lit la rubrique que le rapport porte lui-même', () => {
    const a = analyser(page(['Référence du logiciel validé : LICIEL Diagnostics v4']));
    expect(a.generateur?.editeur).toBe('LICIEL');
    expect(a.generateur?.source).toBe('déclaration');
  });

  it('se rabat sur l’empreinte d’impression quand la rubrique manque', () => {
    /* Un dossier sans DPE ne nomme son logiciel nulle part dans son texte : la
       rubrique du logiciel validé n'existe que s'il y a un DPE. */
    const a = analyser(page(['ÉTAT DU BÂTIMENT RELATIF À LA PRÉSENCE DE TERMITES']), {
      producteur: 'iTextSharp 5.4.0'
    });
    expect(a.generateur?.editeur).toBe('LICIEL');
    expect(a.generateur?.source).toBe('signature');
  });

  it('nomme le réseau reconnu à son pied de page', () => {
    const a = analyser(
      page([
        'CONSTAT DE RISQUE D’EXPOSITION AU PLOMB',
        'Tel : 06 00 00 00 00 - Mail : contact@bc2e.com - Web : cabinet.bc2e.com DIAGNOSTIC PLOMB 1 sur 8'
      ]),
      { producteur: 'TCPDF 5.0.002' }
    );
    expect(a.generateur?.editeur).toBe('BC2E');
  });

  it('ne devine pas quand rien ne le nomme', () => {
    const a = analyser(page(['CONCLUSIONS DU REPÉRAGE']), {
      producteur: 'Microsoft® Word pour Microsoft 365'
    });
    expect(a.generateur?.editeur).toBeNull();
    expect(a.generateur?.source).toBe('inconnue');
  });

  it('fonctionne sans métadonnées — le paramètre reste facultatif', () => {
    const a = analyser(page(['Référence du logiciel validé : DPEWIN version V5']));
    expect(a.generateur?.editeur).toBe('DPE WIN');
  });
});
