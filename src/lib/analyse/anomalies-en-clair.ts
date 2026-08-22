/**
 * Les anomalies électriques, dites en français de tous les jours.
 *
 * Le rapport écrit « L'enveloppe d'au moins un matériel est détériorée ».
 * Personne ne sait qu'« enveloppe » veut dire boîtier. La carte était fidèle et
 * inintelligible à la fois — l'inverse exact du standard des quinze ans.
 *
 * ## Ce que cette table est, et ce qu'elle n'est pas
 *
 * Elle **traduit**, elle n'interprète pas. Traduire n'est pas inventer : la
 * phrase du rapport reste affichée, entière, et la traduction se cache derrière
 * un bouton d'aide qu'il faut ouvrir. Le § 3 du pack électricité le demande en
 * ces termes — « une formulation pédagogique grand public et, dessous ou au
 * clic, la formulation technique exacte ».
 *
 * Trois règles tenues :
 *
 *  1. **Aucune gravité ajoutée.** On dit ce qui est constaté, jamais si c'est
 *     grave — le § 24 de l'ordre de mission l'interdit.
 *  2. **Aucun libellé deviné.** Un libellé absent de cette table n'a pas
 *     d'aide : le bouton ne s'affiche pas. Mieux vaut pas d'aide qu'une aide
 *     approximative.
 *  3. **Seuls les libellés réellement lus** dans le corpus y figurent. Ils
 *     viennent des volets lus en entier les 21 et 22/08/2026.
 */

/** Une clé insensible aux accents, à la casse et à la ponctuation. */
function cle(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Chaque entrée : un fragment reconnaissable du libellé normatif, et ce qu'il
 * veut dire. Le fragment est choisi assez long pour ne pas attraper autre chose.
 */
const EN_CLAIR: { fragment: string; enClair: string }[] = [
  {
    /* Le corpus écrit « manquante ou détériorée », l'exemple « détériorée » tout
       court : le fragment s'arrête donc avant la variante. Un fragment trop long
       ne reconnaît rien, et le bouton d'aide ne s'affiche jamais — mesuré à
       l'écran, pas deviné. */
    fragment: 'enveloppe d au moins un materiel est',
    enClair:
      'Le boîtier qui protège un appareil électrique est cassé, ouvert ou absent. Ce boîtier est ce qui empêche de toucher les parties sous tension.'
  },
  {
    fragment: 'au moins un materiel electrique vetuste',
    enClair:
      'Un matériel électrique est trop ancien pour encore protéger correctement — une douille, un interrupteur ou une prise d’une autre époque.'
  },
  {
    fragment: 'au moins un materiel electrique inadapte a l usage',
    enClair:
      'Un matériel est utilisé pour un usage auquel il n’est pas destiné — par exemple une douille provisoire de chantier laissée en place.'
  },
  {
    fragment: 'socle de prise de courant ne comporte pas de broche de terre',
    enClair:
      'Une prise n’a pas la petite tige métallique centrale, celle qui relie les appareils à la terre. Sans elle, un appareil en défaut n’a pas de chemin d’évacuation.'
  },
  {
    fragment: 'broche de terre non reliee a la terre',
    enClair:
      'Une prise a bien sa broche de terre, mais elle n’est raccordée à rien. Elle a l’apparence d’une prise protégée sans l’être.'
  },
  {
    fragment: 'circuit n alimentant pas des socles de prises de courant n est pas relie a la terre',
    enClair:
      'Un circuit — souvent celui de l’éclairage — n’est pas relié à la terre.'
  },
  {
    fragment: 'connexion avec une partie active nue sous tension accessible',
    enClair:
      'Un raccordement laisse un fil sous tension accessible au doigt — un domino non protégé, par exemple.'
  },
  {
    fragment: 'il n existe aucun dispositif differentiel',
    enClair:
      'Le tableau n’a pas de différentiel : l’appareil qui coupe le courant quand il fuit vers la terre ou vers une personne.'
  },
  {
    fragment: 'dispositif de protection differentielle ne fonctionne pas pour son seuil de declenchement',
    enClair:
      'Un différentiel est bien présent, mais il ne coupe pas quand il devrait. Testé, il n’a pas réagi au seuil prévu.'
  },
  {
    fragment: 'manoeuvre du bouton test',
    enClair:
      'Le bouton test du différentiel n’a pas déclenché la coupure. C’est le geste qui vérifie qu’il fonctionne encore.'
  },
  {
    fragment: 'continuite electrique de la liaison equipotentielle supplementaire',
    enClair:
      'Dans la salle d’eau, le fil qui relie entre eux la baignoire, les tuyaux et les masses métalliques ne conduit pas correctement.'
  },
  {
    fragment: 'conducteur isole n est pas place sur toute sa longueur dans un conduit',
    enClair:
      'Un fil court à l’air libre au lieu d’être protégé sur tout son trajet par une gaine, une goulotte ou une plinthe.'
  },
  {
    fragment: 'installation electrique ne repond pas aux prescriptions particulieres appliquees a ce local',
    enClair:
      'Dans la salle d’eau, un matériel est installé trop près de la baignoire ou de la douche pour ce qu’il est.'
  },
  {
    fragment: 'courant assigne calibre de la protection contre les surcharges',
    enClair:
      'Un disjoncteur laisse passer plus de courant que le fil qu’il protège ne peut en supporter. Le fil peut chauffer avant que la protection ne coupe.'
  }
];

/**
 * La phrase en clair, ou `null` quand on ne connaît pas ce libellé.
 *
 * `null` n'est pas un manque à combler : c'est le refus d'écrire une aide qu'on
 * n'a pas mesurée. L'interface n'affiche alors aucun bouton.
 */
export function enClair(libelle: string): string | null {
  const k = cle(libelle);
  for (const e of EN_CLAIR) {
    if (k.includes(e.fragment)) return e.enClair;
  }
  return null;
}

/** Combien de libellés cette table sait traduire — pour la mesure. */
export const NB_LIBELLES_TRADUITS = EN_CLAIR.length;
