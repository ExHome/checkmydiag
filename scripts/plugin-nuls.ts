/**
 * Le plugin qui fabrique « Les diags pour les nuls ».
 *
 * La rubrique n'est pas une route de l'application : ce sont de vraies pages
 * HTML, écrites dans `dist/` au moment du build. Le lecteur qui arrive d'un
 * moteur de recherche reçoit sa réponse dans la première réponse du serveur,
 * sans attendre un bundle — et le robot qui l'indexe la voit aussi.
 *
 * En développement, les mêmes pages sont servies à la volée : elles se
 * rechargent à chaque requête, donc écrire une question et rafraîchir suffit.
 */
import type { Plugin, ViteDevServer } from 'vite';
import { cartes, pages, robots, sitemap, textesDesCartes } from '../src/lib/nuls/rendu';
import { liensMorts } from '../src/lib/nuls';
import { FAMILLE, preparerPolice, type PoliceFigee } from './police-cartes';

/** La forme du module de rendu, telle qu'elle est rechargée en développement. */
type Rendu = {
  pages: typeof pages;
  cartes: typeof cartes;
  textesDesCartes: typeof textesDesCartes;
  sitemap: typeof sitemap;
  robots: typeof robots;
  planche: () => string;
};

/**
 * La police est préparée une fois puis gardée : la figer et l'écrire coûte une
 * seconde, et on rend quatre-vingt-dix cartes.
 */
let police: Promise<PoliceFigee> | null = null;
const policeDesCartes = (textes: string[], racine: string): Promise<PoliceFigee> =>
  (police ??= preparerPolice(textes, racine));

/**
 * Le rendu d'une carte en PNG.
 *
 * Le rastériseur est chargé à la demande : c'est un module natif, il n'a rien à
 * faire dans la configuration de Vite tant qu'aucune carte n'est demandée.
 *
 * `loadSystemFonts` reste actif pour la linéale des mentions ; le titre, lui,
 * vient du fichier — et seulement de lui, car les polices passées en mémoire
 * sont ignorées sans le dire (voir `police-cartes.ts`).
 */
async function png(svg: string, fichier: string): Promise<Buffer> {
  const { Resvg } = await import('@resvg/resvg-js');
  const rendu = new Resvg(svg, {
    font: { fontFiles: [fichier], loadSystemFonts: true, defaultFontFamily: FAMILLE }
  });
  return Buffer.from(rendu.render().asPng());
}

export function nuls(): Plugin {
  /** La racine du projet, seule façon fiable de retrouver la police. */
  let racine = '.';

  return {
    name: 'check-my-diag:pour-les-nuls',

    configResolved(config) {
      racine = config.root;
    },

    /**
     * En développement, le module est relu à chaque requête par le serveur
     * lui-même : une question ajoutée apparaît au rafraîchissement suivant,
     * sans redémarrage.
     */
    configureServer(serveur: ViteDevServer) {
      serveur.middlewares.use(async (requete, reponse, suite) => {
        // Sans ce filet, une promesse rejetée ici n'est pas rattrapée par
        // Connect : Node tue le processus, et le serveur de développement
        // disparaît sans laisser de message. Vu.
        try {
          await servir(serveur, requete.url ?? '/', reponse, suite);
        } catch (erreur) {
          serveur.config.logger.error(
            `[pour-les-nuls] ${requete.url} : ${erreur instanceof Error ? erreur.stack : erreur}`
          );
          reponse.statusCode = 500;
          reponse.end('La rubrique n’a pas pu être fabriquée. Voir le terminal.');
        }
      });

      async function servir(
        serveur: ViteDevServer,
        url: string,
        reponse: Parameters<Parameters<ViteDevServer['middlewares']['use']>[0]>[1],
        suite: () => void
      ): Promise<void> {
        const chemin = url.split('?')[0] ?? '/';

        // Les cartes de partage, rendues à la demande : c'est le seul moyen de
        // les regarder avant une mise en ligne.
        if (chemin.startsWith('/og/') && chemin.endsWith('.png')) {
          const rendu = (await serveur.ssrLoadModule('/src/lib/nuls/rendu.ts')) as Rendu;
          const { fichier, mesure } = await policeDesCartes(rendu.textesDesCartes(), racine);
          const carte = rendu.cartes(mesure).find((c) => `/${c.chemin}` === chemin);
          if (!carte) return suite();
          reponse.setHeader('Content-Type', 'image/png');
          reponse.end(await png(carte.svg, fichier));
          return;
        }

        if (chemin === '/sitemap.xml' || chemin === '/robots.txt') {
          const rendu = (await serveur.ssrLoadModule('/src/lib/nuls/rendu.ts')) as Rendu;
          const xml = chemin === '/sitemap.xml';
          reponse.setHeader('Content-Type', xml ? 'application/xml' : 'text/plain; charset=utf-8');
          reponse.end(xml ? rendu.sitemap() : rendu.robots());
          return;
        }

        // Le test porte sur le segment entier : sans lui, `/pour-les-nuls.css`
        // — la feuille de la rubrique, servie depuis `public/` — serait pris
        // pour une page et redirigé.
        if (chemin !== '/pour-les-nuls' && !chemin.startsWith('/pour-les-nuls/')) return suite();

        // Sans barre finale, les chemins relatifs de la page se résoudraient un
        // cran trop haut : on redirige plutôt que de servir une page cassée.
        if (!chemin.endsWith('/') && !chemin.endsWith('.html')) {
          // 302 et non 301 : une redirection permanente reste dans le cache du
          // navigateur bien après la correction, et rend le développement
          // ingérable. La mise en ligne, elle, est affaire du serveur d'hébergement.
          reponse.statusCode = 302;
          reponse.setHeader('Location', `${chemin}/`);
          reponse.end();
          return;
        }

        const rendu = (await serveur.ssrLoadModule('/src/lib/nuls/rendu.ts')) as Rendu;

        // La planche de contrôle : tous les dessins côte à côte. Elle n'existe
        // qu'ici, jamais dans `dist/`.
        if (chemin === '/pour-les-nuls/planche/') {
          reponse.setHeader('Content-Type', 'text/html; charset=utf-8');
          reponse.end(await serveur.transformIndexHtml(chemin, rendu.planche()));
          return;
        }

        const voulu = `${chemin.replace(/^\//, '')}${chemin.endsWith('/') ? 'index.html' : ''}`;
        const page = rendu.pages().find((p) => p.chemin === voulu);

        if (!page) return suite();

        reponse.setHeader('Content-Type', 'text/html; charset=utf-8');
        reponse.end(await serveur.transformIndexHtml(chemin, page.contenu));
      }
    },

    /**
     * Au build, les pages deviennent des fichiers. Un lien interne mort arrête
     * la construction : dans une rubrique dont le maillage est la raison
     * d'être, il ne peut pas y avoir de renvoi vers une question qui n'existe
     * pas.
     */
    async generateBundle() {
      const morts = liensMorts();
      if (morts.length) {
        this.error(
          `Renvois vers des questions inexistantes :\n  ${morts.join('\n  ')}\n` +
            'Corrigez le champ `aussi` de ces questions, ou écrivez celles qui manquent.'
        );
      }

      for (const page of pages()) {
        this.emitFile({ type: 'asset', fileName: page.chemin, source: page.contenu });
      }

      const { fichier, mesure } = await policeDesCartes(textesDesCartes(), racine);
      for (const carte of cartes(mesure)) {
        this.emitFile({
          type: 'asset',
          fileName: carte.chemin,
          source: await png(carte.svg, fichier)
        });
      }

      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() });
    }
  };
}
