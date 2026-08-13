/**
 * Les garde-fous de la rubrique.
 *
 * Une centaine de pages écrites à la main finit toujours par dériver : un
 * renvoi vers une question renommée, un dessin qui n'existe plus, deux
 * questions qui partagent une adresse. Rien de tout cela ne se voit à l'œil, et
 * tout se voit ici.
 */
import { describe, expect, it } from 'vitest';
import { DESSINS } from './dessins';
import { FICHES, liees, liensMorts, THEMES } from './index';
import { NOTIONS } from '../savoir/notions';
import { cartes, pages, sitemap } from './rendu';
import { couper, poser } from './og';

/**
 * Une mesure grossière, pour les contrôles qui ne dépendent pas de la police :
 * l'adresse d'une carte est la même quelle que soit la largeur de ses lettres.
 * La mesure exacte est vérifiée dans `scripts/metriques-police.test.ts`.
 */
const mesureApprochee = (texte: string, taille: number): number => texte.length * taille * 0.5;

describe('le corpus', () => {
  it('ne renvoie jamais vers une question qui n’existe pas', () => {
    expect(liensMorts()).toEqual([]);
  });

  it('donne une adresse unique à chaque question', () => {
    const ids = FICHES.map((f) => f.question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('donne une adresse unique à chaque thème', () => {
    const ids = THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('n’emploie que des adresses lisibles dans une URL', () => {
    const propre = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    for (const { question } of FICHES) expect(question.id, question.id).toMatch(propre);
    for (const theme of THEMES) expect(theme.id, theme.id).toMatch(propre);
  });

  it('ne désigne que des dessins qui existent', () => {
    for (const theme of THEMES) {
      if (theme.dessin) expect(DESSINS[theme.dessin], theme.dessin).toBeDefined();
      for (const q of theme.questions) {
        if (q.dessin) expect(DESSINS[q.dessin], `${q.id} → ${q.dessin}`).toBeDefined();
      }
    }
  });

  it('ne désigne que des notions du panneau de savoir qui existent', () => {
    const connues = new Set(NOTIONS.map((n) => n.id));
    for (const { question } of FICHES) {
      for (const id of question.savoir ?? []) {
        expect(connues.has(id), `${question.id} → ${id}`).toBe(true);
      }
    }
  });
});

describe('la forme des réponses', () => {
  it('pose des questions, pas des titres', () => {
    for (const { question } of FICHES) {
      expect(question.question.endsWith('?'), question.id).toBe(true);
    }
  });

  it('répond en dix secondes : une réponse courte, jamais un paragraphe', () => {
    for (const { question } of FICHES) {
      expect(question.court.length, question.id).toBeGreaterThan(60);
      expect(question.court.length, question.id).toBeLessThan(400);
    }
  });

  it('date tout contenu réglementaire', () => {
    for (const { question } of FICHES) {
      expect(question.verifie, question.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('n’écrit jamais un tableau bancal', () => {
    for (const { question } of FICHES) {
      const t = question.tableau;
      if (!t) continue;
      for (const ligne of t.lignes) {
        expect(ligne.length, `${question.id} — ligne de ${ligne.length} cellules`).toBe(
          t.colonnes.length
        );
      }
    }
  });

  it('ne laisse aucune question sans porte de sortie', () => {
    for (const fiche of FICHES) {
      expect(liees(fiche).length, fiche.question.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('pose chaque question sur sa carte sans jamais dépasser quatre lignes', () => {
    for (const { question } of FICHES) {
      const { taille, lignes } = poser(question.question, 1040, mesureApprochee);
      expect(lignes.length, question.question).toBeLessThanOrEqual(4);
      // Un mot plus large que la ligne ne serait pas coupé : il déborderait.
      for (const ligne of lignes) {
        expect(mesureApprochee(ligne, taille), ligne).toBeLessThanOrEqual(1040);
      }
    }
  });

  it('coupe aux espaces, sans perdre ni ajouter un mot', () => {
    const titre = 'Puis-je encore louer un logement classé F ou G ?';
    expect(couper(titre, 60, 400, mesureApprochee).join(' ')).toBe(titre);
  });
});

describe('les pages produites', () => {
  const produites = pages();

  it('fabrique une page par question, par thème, plus l’accueil', () => {
    expect(produites.length).toBe(FICHES.length + THEMES.length + 1);
  });

  it('porte la réponse dans le HTML servi, sans exécuter de JavaScript', () => {
    const page = produites.find((p) => p.chemin.includes('combien-de-temps-un-diagnostic'));
    expect(page?.contenu).toContain('Chaque diagnostic a sa propre durée');
    // Aucune page de la rubrique ne charge de script : c'est ce qui garantit
    // qu'un robot d'indexation voit exactement ce que voit le lecteur.
    expect(page?.contenu).not.toMatch(/<script(?![^>]*application\/ld\+json)/);
  });

  it('décrit chaque page pour les moteurs de recherche', () => {
    for (const page of produites) {
      expect(page.contenu, page.chemin).toContain('<link rel="canonical"');
      expect(page.contenu, page.chemin).toContain('name="description"');
      expect(page.contenu, page.chemin).toContain('application/ld+json');
      expect(page.contenu.match(/<h1>/g)?.length, `${page.chemin} — un seul h1`).toBe(1);
    }
  });

  it('écrit des données structurées valides', () => {
    for (const page of produites) {
      const bloc = page.contenu.match(
        /<script type="application\/ld\+json">\n([\s\S]*?)\n    <\/script>/
      );
      expect(bloc, page.chemin).not.toBeNull();
      expect(() => JSON.parse(bloc![1] as string), page.chemin).not.toThrow();
    }
  });

  it('donne à chaque page sa propre carte de partage, et elle sera bien produite', () => {
    const rendues = cartes(mesureApprochee);
    const adresses = new Set(rendues.map((c) => c.chemin));
    expect(adresses.size, 'une carte par page, sans doublon d’adresse').toBe(produites.length);

    for (const page of produites) {
      const carte = page.contenu.match(/og:image" content="[^"]*\/(og\/[^"]+)"/)?.[1];
      expect(carte, page.chemin).toBeDefined();
      expect(adresses.has(carte as string), `${page.chemin} → ${carte}`).toBe(true);
    }
  });

  it('recense toutes les pages au plan du site', () => {
    const plan = sitemap();
    for (const page of produites) {
      const adresse = page.chemin.replace(/index\.html$/, '');
      expect(plan, adresse).toContain(`/${adresse}<`);
    }
  });
});
