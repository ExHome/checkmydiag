import { describe, expect, it } from 'vitest';
import { analyser } from './index';

/**
 * Deux dossiers minimaux, batis sur les marques relevees en lisant : la duree
 * que le rapport annonce, la surface demandee, l'article cite.
 *
 * Le produit disait « Validite : trois ans a la vente, six ans a la location ».
 * C'etait vrai, et cela laissait le lecteur choisir — alors que son dossier
 * repond.
 */
const page = (numero: number, ...lignes: string[]) => ({ numero, lignes });

const VENTE = [
  page(1, 'Dossier Technique Immobilier', 'Certificat de superficie de la partie privative'),
  page(
    2,
    'Etat de l’Installation Intérieure d’Electricité',
    'Cet état de l’installation intérieure d’électricité a une durée de validité de 3 ans.',
    'L’installation intérieure d’électricité ne comporte aucune anomalie.'
  )
];

const LOCATION = [
  page(1, 'Dossier Technique Immobilier', 'Attestation de surface habitable'),
  page(
    2,
    'Etat de l’Installation Intérieure d’Electricité',
    'l’état de l’installation électrique prévu à l’article 3 - 3 de la loi n°89 - 462 du 6 juillet 1989',
    'Cet état de l’installation intérieure d’électricité a une durée de validité de 6 ans.',
    'L’installation intérieure d’électricité ne comporte aucune anomalie.'
  )
];

describe('la durée de validité, une fois la transaction connue', () => {
  const elec = (pages: ReturnType<typeof page>[]) =>
    analyser(pages).diagnostics.find((d) => d.type === 'electricite')?.aFaire.join(' ') ?? '';

  it('dit « trois ans » sur un dossier de vente', () => {
    const texte = elec(VENTE);
    expect(texte).toMatch(/Validité : trois ans/);
    expect(texte).toMatch(/dossier de vente/);
    expect(texte).not.toMatch(/six ans à la location/);
  });

  it('dit « six ans » sur un dossier de location', () => {
    const texte = elec(LOCATION);
    expect(texte).toMatch(/Validité : six ans/);
    expect(texte).toMatch(/dossier de location/);
  });

  it('garde les deux quand le dossier ne tranche pas', () => {
    // Un dossier qui porte les deux surfaces existe vraiment : mieux vaut
    // enoncer les deux durees que d'en choisir une au hasard.
    const partage = [
      page(1, 'Dossier Technique Immobilier', 'Certificat de superficie de la partie privative', 'Attestation de surface habitable'),
      page(2, 'Etat de l’Installation Intérieure d’Electricité', 'L’installation intérieure d’électricité ne comporte aucune anomalie.')
    ];
    expect(elec(partage)).toMatch(/trois ans à la vente, six ans à la location/);
  });
});
