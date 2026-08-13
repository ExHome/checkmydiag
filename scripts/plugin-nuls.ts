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
import { pages, robots, sitemap } from '../src/lib/nuls/rendu';
import { liensMorts } from '../src/lib/nuls';

/** La forme du module de rendu, telle qu'elle est rechargée en développement. */
type Rendu = {
  pages: typeof pages;
  sitemap: typeof sitemap;
  robots: typeof robots;
  planche: () => string;
};

export function nuls(): Plugin {
  return {
    name: 'check-my-diag:pour-les-nuls',

    /**
     * En développement, le module est relu à chaque requête par le serveur
     * lui-même : une question ajoutée apparaît au rafraîchissement suivant,
     * sans redémarrage.
     */
    configureServer(serveur: ViteDevServer) {
      serveur.middlewares.use(async (requete, reponse, suite) => {
        const chemin = (requete.url ?? '/').split('?')[0] ?? '/';

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
      });
    },

    /**
     * Au build, les pages deviennent des fichiers. Un lien interne mort arrête
     * la construction : dans une rubrique dont le maillage est la raison
     * d'être, il ne peut pas y avoir de renvoi vers une question qui n'existe
     * pas.
     */
    generateBundle() {
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

      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() });
    }
  };
}
