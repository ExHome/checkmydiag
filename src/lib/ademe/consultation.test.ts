import { describe, expect, it, vi } from 'vitest';
import { consulterLAdeme, rangerLesDeperditions } from './consultation';

/**
 * La consultation de l'ADEME.
 *
 * Aucun de ces tests ne touche le réseau : `recuperer` est injecté. Un test qui
 * appelle un serveur tiers ne mesure pas le code, il mesure la connexion.
 */

/** Une fiche réelle de la base publique, réduite aux champs demandés. */
const FICHE = {
  numero_dpe: '2611E0031228S',
  etiquette_dpe: 'C',
  etiquette_ges: 'A',
  deperditions_murs: 593,
  deperditions_baies_vitrees: 28.6,
  deperditions_planchers_bas: 254.1,
  deperditions_planchers_hauts: 83.5,
  deperditions_ponts_thermiques: 454.4,
  deperditions_portes: 13.7,
  deperditions_renouvellement_air: 760.9,
  deperditions_enveloppe: 2188.2,
  cout_total_5_usages: 23106.4
};

/* Les paramètres sont déclarés pour que les tests puissent relire l'appel. */
const repond = (corps: unknown, ok = true, status = 200) =>
  vi.fn(
    async (_url: RequestInfo | URL, _init?: RequestInit) =>
      ({ ok, status, json: async () => corps }) as unknown as Response
  );

describe('consulter l’ADEME', () => {
  it('rend la fiche quand le numéro existe', async () => {
    const c = await consulterLAdeme('2611E0031228S', repond({ results: [FICHE] }));
    expect(c.etat).toBe('trouvée');
    if (c.etat === 'trouvée') {
      expect(c.fiche.etiquetteEnergie).toBe('C');
      expect(c.fiche.etiquetteClimat).toBe('A');
      expect(c.fiche.coutAnnuel).toBe(23106.4);
    }
  });

  /*
   * Le cœur de l'affaire : ces parts n'existent nulle part dans le PDF, dont la
   * page de déperditions est une image. Ici elles sont CALCULÉES à partir des
   * watts par kelvin que le logiciel a transmis — pas devinées.
   */
  it('calcule la part de chaque poste, sans en inventer aucune', () => {
    const { postes, total } = rangerLesDeperditions(FICHE);
    expect(total).toBeCloseTo(2188.2, 1);
    expect(postes[0]?.poste).toBe('Le renouvellement d’air');
    expect(postes[0]?.part).toBeCloseTo(760.9 / 2188.2, 4);
    /* Les parts font exactement 100 % : rien ne s'est perdu en route. */
    expect(postes.reduce((n, p) => n + p.part, 0)).toBeCloseTo(1, 6);
  });

  it('classe les postes du plus grand au plus petit', () => {
    const parts = rangerLesDeperditions(FICHE).postes.map((p) => p.wParK);
    expect(parts).toEqual([...parts].sort((a, b) => b - a));
  });

  /*
   * Un poste absent ne fait pas un camembert troué : la part se calcule sur la
   * somme de ce qu'on a reçu, et on ne parle que de ça.
   */
  it('reste juste quand un poste manque', () => {
    const { postes, total } = rangerLesDeperditions({
      deperditions_murs: 300,
      deperditions_portes: 100
    });
    expect(total).toBe(400);
    expect(postes.reduce((n, p) => n + p.part, 0)).toBeCloseTo(1, 6);
  });

  it('ne rend aucun poste quand la base n’en donne aucun', () => {
    expect(rangerLesDeperditions({ etiquette_dpe: 'D' })).toEqual({ postes: [], total: null });
  });

  /*
   * Trois réponses, jamais deux. « Pas de réseau » est notre problème ;
   * « ce numéro n'existe pas » est une information sur le rapport. L'écran ne
   * doit pas dire la même chose dans les deux cas.
   */
  it('distingue le DPE introuvable du serveur injoignable', async () => {
    const vide = await consulterLAdeme('2611E0031228S', repond({ results: [] }));
    expect(vide.etat).toBe('introuvable');

    const casse = vi.fn(async () => {
      throw new Error('offline');
    });
    const sansReseau = await consulterLAdeme('2611E0031228S', casse as unknown as typeof fetch);
    expect(sansReseau.etat).toBe('injoignable');

    const erreur = await consulterLAdeme('2611E0031228S', repond({}, false, 503));
    expect(erreur.etat).toBe('injoignable');
    if (erreur.etat === 'injoignable') expect(erreur.raison).toContain('503');
  });

  /*
   * LE GARDE-FOU. Un numéro mal extrait ne part pas sur un serveur tiers : on
   * n'envoie que ce qui a la forme d'un numéro ADEME. Ce qu'on n'envoie pas ne
   * peut pas fuir.
   */
  it('n’envoie rien quand le numéro n’a pas la bonne forme', async () => {
    const appel = repond({ results: [FICHE] });
    for (const mauvais of ['', 'néant', '12', 'N° ADEME : ', 'ADEME 2611E00']) {
      const c = await consulterLAdeme(mauvais, appel);
      expect(c.etat, mauvais).toBe('introuvable');
    }
    expect(appel).not.toHaveBeenCalled();
  });

  /*
   * On ne rapatrie pas la fiche entière : elle porte l'adresse et les
   * coordonnées du logement. On demande ce que le PDF ne peut pas donner, et
   * rien de plus.
   */
  it('ne demande que les champs utiles, et jamais l’adresse', async () => {
    const appel = repond({ results: [FICHE] });
    await consulterLAdeme('2611E0031228S', appel);
    const url = String(appel.mock.calls[0]?.[0] ?? '');
    expect(url).toContain('deperditions_murs');
    expect(url).toContain('etiquette_dpe');
    expect(url).not.toContain('adresse');
    expect(url).not.toContain('coordonnee');
    expect(url).not.toContain('_geopoint');
  });

  it('n’envoie que le numéro, et rien du rapport', async () => {
    const appel = repond({ results: [FICHE] });
    await consulterLAdeme('2611E0031228S', appel);
    const [url, options] = appel.mock.calls[0] ?? [];
    expect(String(url)).toContain('2611E0031228S');
    /* Pas de corps de requête : rien du PDF ne peut y être glissé. */
    expect((options as RequestInit | undefined)?.body).toBeUndefined();
    expect((options as RequestInit | undefined)?.method ?? 'GET').toBe('GET');
  });
});
