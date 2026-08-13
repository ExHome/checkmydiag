/**
 * La police des cartes de partage : Fraunces, figée.
 *
 * Trois obstacles se sont présentés, et chacun explique une ligne de ce fichier.
 *
 * 1. La police du site est livrée en woff2, que le rastériseur ne sait pas lire.
 *    On la décompresse donc en TrueType.
 * 2. C'est une police **variable**. Le rastériseur en tire l'instance par
 *    défaut, qui n'est pas celle qu'affiche un navigateur, et surtout les
 *    largeurs de `hmtx` cessent d'être fiables. On la fige donc sur ses axes —
 *    graisse 600, taille optique 144, celle des grands titres.
 * 3. Le rastériseur **ignore silencieusement** les polices passées en mémoire
 *    (`fontBuffers`) : il retombe sur une police de secours sans rien signaler,
 *    ce qui donne des cartes dessinées dans un caractère qui n'est pas celui de
 *    la marque. Seul `fontFiles` fonctionne — d'où le fichier temporaire.
 *
 * Au passage, la police est réduite aux seuls caractères réellement dessinés :
 * une centaine de kilo-octets deviennent une vingtaine.
 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mesureur, type Mesure } from './metriques-police';

/** Le nom de famille, tel qu'il doit être demandé dans le SVG. */
export const FAMILLE = 'Fraunces';

export interface PoliceFigee {
  /** Le chemin du fichier à passer au rastériseur. */
  fichier: string;
  /** La mesure exacte, lue dans cette même police. */
  mesure: Mesure;
}

/**
 * Prépare la police pour un lot de cartes.
 *
 * `textes` sert au sous-ensemblage : tout caractère qui n'y figure pas ne sera
 * pas dessiné. On y ajoute donc de quoi tenir si un texte change sans qu'on y
 * pense.
 *
 * `racine` est le dossier du projet. Il est demandé plutôt que déduit : au
 * build, le dossier courant est celui du projet et un chemin relatif suffisait ;
 * en développement, le serveur peut être lancé depuis n'importe où, et la police
 * était alors cherchée à côté d'un autre dépôt.
 */
export async function preparerPolice(textes: string[], racine = '.'): Promise<PoliceFigee> {
  const [{ default: subset }, woff2] = await Promise.all([
    import('subset-font'),
    import('wawoff2')
  ]);

  const variable = Buffer.from(
    await woff2.default.decompress(readFileSync(join(racine, 'public/polices/fraunces.woff2')))
  );

  const base =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
    ' .,;:!?()[]«»“”—–-…’\'"/&%€°²+=<>' +
    'àâäéèêëîïôöùûüÿçœæÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇŒÆ';

  const figee = Buffer.from(
    await subset(variable, base + textes.join(''), {
      targetFormat: 'truetype',
      // Les titres des cartes sont grands : c'est la taille optique qui leur
      // donne leurs empattements et leur contraste.
      variationAxes: { wght: 600, opsz: 144 }
    })
  );

  const fichier = join(mkdtempSync(join(tmpdir(), 'cmd-cartes-')), 'fraunces.ttf');
  writeFileSync(fichier, figee);

  return { fichier, mesure: mesureur(figee) };
}
