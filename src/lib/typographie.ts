/**
 * Les espaces françaises, posées au moment d'afficher.
 *
 * Le français met une espace devant ses ponctuations doubles — « ; : ! ? » —
 * et à l'intérieur de ses guillemets. Une espace ordinaire y autorise un
 * retour à la ligne, et le navigateur en profite : dans la fiche du DPE, on
 * lisait
 *
 *     … On dit qu'il est une « passoire thermique
 *     ». La loi limite ce qu'on peut en faire.
 *
 * — le guillemet fermant seul, en tête de ligne. Le même défaut renvoie un
 * point d'interrogation ou un deux-points à la ligne suivante.
 *
 * ── Où cette fonction s'applique ───────────────────────────────────────────
 *
 * À L'AFFICHAGE, jamais à l'analyse. Les textes du rapport sont reconnus,
 * découpés et comparés avec des espaces ordinaires ; y glisser des insécables
 * en amont ferait échouer des correspondances. On corrige donc le dernier
 * maillon — ce qui part à l'écran — et lui seul.
 *
 * ── Pourquoi l'espace fine devant ; ! ? ────────────────────────────────────
 *
 * L'usage typographique français distingue l'espace fine insécable (U+202F),
 * devant le point-virgule, le point d'exclamation et le point d'interrogation,
 * de l'espace mot insécable (U+00A0), devant le deux-points et autour des
 * guillemets. Les deux empêchent la coupure ; la fine est simplement plus
 * discrète. On respecte la distinction plutôt que de tout aplatir.
 */

/** Espace mot insécable — deux-points, guillemets, symboles d'unité. */
const INSECABLE = ' ';
/** Espace fine insécable — point-virgule, exclamation, interrogation. */
const FINE = ' ';

/** Toute forme d'espace, y compris celles déjà insécables. */
const ESPACE = '[ \u00a0\u202f\u2009]';

const AVANT_FINE = new RegExp(`${ESPACE}*([;!?])`, 'g');
const AVANT_DEUX_POINTS = new RegExp(`${ESPACE}*(:)`, 'g');
const APRES_OUVRANT = new RegExp(`(«)${ESPACE}*`, 'g');
const AVANT_FERMANT = new RegExp(`${ESPACE}*(»)`, 'g');
/**
 * Un nombre et son unité ne se séparent pas : « 373 kWh », « 42 m² », « 15 % ».
 *
 * La fin d'unité se marque par ce qui SUIT, pas par `` : en fin de chaîne,
 * « 15 % » ne présente aucune frontière de mot après le pour-cent — le motif
 * échouait précisément là où l'unité est la plus fréquente, en fin de phrase.
 */
const AVANT_UNITE = new RegExp(
  '(\\d)' + ESPACE + '+(%|€|kWh|kg|m²|m³|cm|mm|ppm|°C|m)(?=[\\s.,;:!?)»]|$)',
  'g'
);

/**
 * Pose les espaces insécables françaises dans un texte destiné à l'écran.
 *
 * Idempotente : on peut l'appliquer deux fois sans dégât, puisque les motifs
 * absorbent les espaces déjà insécables.
 *
 * Une URL n'est pas du texte courant — `http://x` y perdrait son deux-points.
 * Les segments qui en contiennent sont donc laissés intacts.
 */
export function espacesFrancaises(texte: string): string {
  if (/https?:\/\//.test(texte)) return texte;

  return texte
    .replace(AVANT_FINE, `${FINE}$1`)
    .replace(AVANT_DEUX_POINTS, `${INSECABLE}$1`)
    .replace(APRES_OUVRANT, `$1${INSECABLE}`)
    .replace(AVANT_FERMANT, `${INSECABLE}$1`)
    .replace(AVANT_UNITE, `$1${INSECABLE}$2`);
}
