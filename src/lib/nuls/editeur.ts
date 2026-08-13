/**
 * Qui écrit ces pages.
 *
 * C'est le levier manquant le plus lourd, et il ne se code pas : il se remplit.
 * Ces pages parlent de plomb chez des enfants, de monoxyde de carbone et de
 * décisions à plusieurs dizaines de milliers d'euros. Sur ce terrain-là, un
 * moteur de recherche pose une question avant toutes les autres — *qui a écrit
 * ça, et de quel droit ?* — et un site anonyme n'y répond pas.
 *
 * ⚠️ Check My Diag est une **marque indépendante** (décision du 13/08/2026) :
 * elle ne s'adosse à aucun cabinet de diagnostic, et `societe` reste vide si
 * l'auteur ne souhaite pas mentionner son activité. Indépendant ne veut pas dire
 * anonyme pour autant : `auteur` et `metier` restent indispensables, car c'est
 * la compétence de la personne qui rend ces pages crédibles — pas une enseigne.
 *
 * Tant que `EDITEUR` vaut `null`, les pages « qui écrit », « mentions légales »
 * et « confidentialité » ne sont pas fabriquées. C'est volontaire : une page de
 * confiance à moitié remplie inspire moins confiance que pas de page du tout.
 * `npm run seo` le signale comme le manque le plus coûteux du site.
 *
 * Rien ici ne doit être deviné. Les mentions légales engagent, et un numéro
 * inventé serait pire qu'une case vide.
 */

export interface Editeur {
  /** La personne qui signe. Un nom, pas une marque : c'est elle qu'on croit. */
  auteur: string;
  /** Son métier, dit simplement. Ex. « diagnostiqueur immobilier certifié ». */
  metier: string;
  /** Depuis quand elle l'exerce. L'ancienneté est un argument, pas une coquetterie. */
  depuis?: string;
  /** Les certifications détenues, telles qu'elles s'écrivent. */
  certifications?: string[];
  /**
   * L'entreprise éditrice, si le site est édité par une société. Laissée vide
   * tant que la marque reste indépendante d'une activité commerciale.
   */
  societe?: string;
  siret?: string;
  /** L'adresse du siège, telle qu'elle doit figurer aux mentions légales. */
  adresse?: string;
  courriel?: string;
  /** Le site professionnel, s'il existe : c'est aussi un lien qui compte. */
  siteProfessionnel?: string;
  /** Le responsable de la publication, s'il diffère de l'auteur. */
  responsablePublication?: string;
  /** L'hébergeur, avec sa raison sociale et son adresse. Obligatoire. */
  hebergeur?: string;
}

/**
 * À renseigner avant la mise en ligne. Gabarit :
 *
 * ```ts
 * export const EDITEUR = {
 *   auteur: 'Prénom Nom',
 *   metier: 'diagnostiqueur immobilier certifié',
 *   depuis: '2011',
 *   certifications: ['DPE avec mention', 'Amiante avec mention', 'Plomb', 'Gaz', 'Électricité', 'Termites'],
 *   adresse: 'Rue, code postal, ville',
 *   courriel: 'contact@exemple.fr',
 *   hebergeur: 'GitHub Pages — GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis'
 * } as Editeur | null;
 * ```
 *
 * `certifications` porte beaucoup : c'est la preuve de compétence la plus
 * vérifiable qui existe dans ce métier, et elle est publique.
 */
// L'assertion n'est pas décorative : sans elle, TypeScript retient que la valeur
// est littéralement `null` et réduit à `never` toutes les branches qui
// s'exécuteront le jour où elle sera remplie.
export const EDITEUR = null as Editeur | null;

/** Ce qui manque pour que les pages de confiance puissent être publiées. */
export function manquants(): string[] {
  if (!EDITEUR) {
    return [
      'tout : `EDITEUR` vaut encore null dans src/lib/nuls/editeur.ts',
      'sans lui, ni page « qui écrit », ni mentions légales, ni page de confidentialité'
    ];
  }

  const requis: [keyof Editeur, string][] = [
    ['auteur', 'le nom de la personne qui signe'],
    ['metier', 'son métier'],
    ['adresse', 'l’adresse à faire figurer aux mentions légales'],
    ['courriel', 'une adresse de contact'],
    ['hebergeur', 'l’hébergeur, avec sa raison sociale et son adresse']
  ];

  return requis.filter(([champ]) => !EDITEUR[champ]).map(([, quoi]) => quoi);
}

export const signature = (): string | null =>
  EDITEUR ? `${EDITEUR.auteur}, ${EDITEUR.metier}` : null;
