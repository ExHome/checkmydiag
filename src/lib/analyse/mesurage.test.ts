/**
 * LE MESURAGE : DEUX LOIS SOUS UN SEUL TYPE, et l'écran doit les distinguer.
 *
 * Le type `carrez` recouvre le volet « mesurage », et ce volet porte tantôt la
 * superficie privative due à la VENTE, tantôt la surface habitable due à la
 * LOCATION. Vu à l'écran le 22/08/2026 sur une vraie attestation Boutin :
 * Verrière annonçait « Ce chiffre part dans l'acte de vente », et la fiche
 * entière parlait de copropriété, d'acheteur et de 5 % — cinq lignes fausses
 * ensemble, sur la pièce d'un bail.
 *
 * C'est exactement l'erreur que l'architecture par éditeur existe pour éviter,
 * arrivée un cran plus loin : le lecteur avait bien lu la loi, l'écran ne la
 * regardait pas.
 */
import { describe, expect, it } from 'vitest';
import { enPratique, ficheDe, FICHE_BOUTIN, FICHES } from './fiches';
import { lireLeMesurageEnDiagnostic } from './mesurage';
import type { Generateur } from '../atelier/editeur';

/*
 * ⚠️ Complété par la session architecte le 22/08 — trois champs manquaient.
 *
 * `Generateur` en compte sept ; celui-ci en donnait quatre. `svelte-check`
 * remontait donc une erreur de type, et `npm run check` est une étape
 * BLOQUANTE du déploiement : la CI serait passée au rouge et plus rien ne se
 * serait déployé, pour aucune session. Le volet mesurage reste propriétaire de
 * ce fichier ; seul le blocage transverse a été levé, sans toucher aux
 * assertions.
 */
const LICIEL: Generateur = {
  editeur: 'LICIEL',
  societe: 'LICIEL Diagnostics Environnement',
  logiciel: 'LICIEL Diagnostics v4',
  version: null,
  source: 'déclaration',
  preuve: 'LICIEL Diagnostics v4',
  genre: 'diagnostic'
};

const contexte = (lignes: string[]) => ({
  lignes,
  plage: [1, 3] as const,
  generateur: LICIEL
});

const BOUTIN = [
  'Attestation de surface n° 00/AAA/0000',
  'Attestation de surface habitable',
  'Surface habitable totale : 24,72 m² (vingt-quatre mètres carrés soixante-douze)',
  'Surface au sol totale : 24,72 m² (vingt-quatre mètres carrés soixante-douze)',
  "Parties de l'immeuble bâtis visitées Superficie habitable Surface au sol Commentaires",
  'R+1 - Séjour 20,22 20,22',
  'R+1 - Salle d’eau 4,5 4,5',
  'Superficie habitable en m² du ou des lot(s) :'
];

const CARREZ = [
  'Certificat de superficie n° 00/AAA/0000',
  'Certificat de superficie de la partie privative',
  'Surface loi Carrez totale : 42,00 m² (quarante-deux mètres carrés)',
  'Surface au sol totale : 44,80 m² (quarante-quatre mètres carrés quatre-vingts)',
  "Parties de l'immeuble bâtis visitées Superficie habitable Surface au sol Commentaires",
  'R+1 - Séjour 42,00 44,80',
  'Superficie privative en m² du ou des lot(s) :'
];

describe('le pont vers l’écran garde la loi du document', () => {
  const boutin = lireLeMesurageEnDiagnostic(contexte(BOUTIN));
  const carrez = lireLeMesurageEnDiagnostic(contexte(CARREZ));

  it('titre et verdict suivent la loi lue, dans les mots du rapport', () => {
    expect(boutin.titre).toBe('Surface habitable (loi Boutin)');
    expect(boutin.verdict).toBe('Surface habitable totale : 24,72 m².');
    expect(carrez.titre).toBe('Superficie privative (loi Carrez)');
    expect(carrez.verdict).toBe('Surface loi Carrez totale : 42 m².');
  });

  it('la lecture complète voyage jusqu’à l’écran', () => {
    expect(boutin.mesurage?.loi).toBe('boutin');
    expect(carrez.mesurage?.loi).toBe('carrez');
  });

  it('« bon » se déduit d’une valeur présente, jamais d’une absence', () => {
    expect(boutin.gravite).toBe('bon');
    const muet = lireLeMesurageEnDiagnostic(
      contexte(['Attestation de surface n° 00/AAA/0000', 'Attestation de surface habitable'])
    );
    expect(muet.gravite).toBe('neutre');
  });
});

describe('l’enjeu ne confond pas un bail avec un acte de vente', () => {
  it('Boutin engage le bailleur, pas le vendeur', () => {
    expect(enPratique('carrez', 'bon', 'boutin')).toBe(
      'Ce chiffre part dans le bail. Il engage le bailleur.'
    );
  });

  it('Carrez engage le vendeur', () => {
    expect(enPratique('carrez', 'bon', 'carrez')).toBe(
      'Ce chiffre part dans l’acte de vente. Il engage le vendeur.'
    );
  });

  it('sans loi connue, on garde la formulation de la vente', () => {
    /* C'est le cas du lecteur de repli : majoritaire, et déjà celui qui
       s'affichait. On ne bascule pas vers le bail sur une simple absence. */
    expect(enPratique('carrez', 'bon')).toMatch(/acte de vente/);
  });
});

describe('la fiche suit la loi du document', () => {
  it('une attestation Boutin ne fait acheter personne', () => {
    const fiche = ficheDe(lireLeMesurageEnDiagnostic(contexte(BOUTIN)));
    expect(fiche).toBe(FICHE_BOUTIN);
    const tout = Object.values(fiche).join(' ');
    /* Le mot « acheteur » a le droit d'y être — la fiche l'emploie pour dire
       que ce document ne lui est PAS dû. Ce qui est interdit, c'est de faire
       croire au lecteur qu'il achète : le recours de l'acheteur, le seuil des
       5 %, l'obligation en copropriété. */
    expect(tout).not.toMatch(/l’acheteur peut|on achète|5\s?%|obligatoire en copropriété/i);
    expect(tout).toMatch(/bail/i);
    expect(tout).toMatch(/locataire/i);
    expect(tout).toMatch(/vingtième/i);
  });

  it('un certificat Carrez garde la fiche de la vente', () => {
    expect(ficheDe(lireLeMesurageEnDiagnostic(contexte(CARREZ)))).toBe(FICHES.carrez);
  });

  it('sans lecture d’éditeur, la fiche Carrez reste', () => {
    expect(ficheDe({ type: 'carrez' })).toBe(FICHES.carrez);
  });
});
