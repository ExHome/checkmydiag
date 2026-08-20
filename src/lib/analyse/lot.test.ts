import { describe, expect, it } from 'vitest';
import { analyser } from './index';
import type { PageTexte } from '../lignes';

/**
 * La désignation du lot — le premier repère qu'un notaire ouvre.
 *
 * Un rapport qui décrit le mauvais lot ne vaut rien, quelle que soit sa qualité
 * par ailleurs. Mesuré : les soixante-dix dossiers la portent tous, et le
 * lecteur n'en disait rien. Il en lit désormais soixante-huit, sans erreur.
 *
 * Les trois formes ci-dessous sont reprises telles quelles du corpus. La page
 * de garde étant sur deux colonnes, la désignation se coupe où elle peut — et
 * la rubrique suivante la suit immédiatement, sans ligne vide.
 */
const page = (lignes: string[]): PageTexte[] => [{ numero: 1, lignes }];

const EN_TETE = [
  'Dossier Technique Immobilier',
  'Numéro de dossier : 25/IMO/0391P',
  'Désignation et situation du ou des lot(s) de copropriété :'
];

describe('la désignation du lot', () => {
  it('recolle la désignation coupée par la mise en page', () => {
    const { bien } = analyser(
      page([...EN_TETE, 'Bat. B; Etage RDC; Porte 21; Compl.', 'Résidence La Paix, Lot numéro Non communiqué'])
    );
    expect(bien.lot).toBe('Bat. B; Etage RDC; Porte 21; Compl. Résidence La Paix, Lot numéro Non communiqué');
  });

  it('s’arrête à la rubrique suivante', () => {
    /*
     * Sans cet arrêt, la désignation se prolongeait par l'intitulé de la
     * mission : « Lot numéro Non communiqué Repérage Amiante avant travaux de ».
     */
    const { bien } = analyser(
      page([...EN_TETE, 'Lot numéro Non communiqué', 'Repérage Amiante avant travaux de démolition'])
    );
    expect(bien.lot).toBe('Lot numéro Non communiqué');
  });

  it('rapporte la maison individuelle telle que le rapport la nomme', () => {
    /*
     * Onze dossiers sur soixante-dix ne sont pas en copropriété, et le rapport
     * le dit à cet endroit même. C'est une information notariale — pas de lot,
     * pas de tantièmes, pas de parties communes — et non une absence de réponse.
     */
    /*
     * La phrase est coupée en deux par la mise en page, comme dans le corpus.
     * Sans son début, il reste « copropriété » — et la négation, qui est dans
     * la moitié perdue, dit alors le contraire de ce que le rapport écrit.
     */
    const { bien } = analyser(
      page([...EN_TETE, 'Ce bien ne fait pas partie d’une', 'copropriété', 'Périmètre de repérage :'])
    );
    expect(bien.lot).toMatch(/ne fait pas partie d['’]une copropriété/);
  });

  it('ne laisse pas la virgule d’une ligne perdue en tête', () => {
    const { bien } = analyser(page([...EN_TETE, 'Périmètre de repérage : toutes parties', ', Lot numéro 21']));
    expect(bien.lot).toBe('Lot numéro 21');
  });

  it('ne dit rien quand le dossier ne porte pas la rubrique', () => {
    const { bien } = analyser(page(['Dossier Technique Immobilier', 'Numéro de dossier : 25/IMO/0391P']));
    expect(bien.lot).toBeUndefined();
  });
});
