/**
 * LE VOCABULAIRE OFFICIEL DU DPE — releve chez l'ADEME.
 *
 * ── Pourquoi ce fichier existe ──────────────────────────────────────────────
 *
 * Jusqu'ici, mes vocabulaires venaient de vingt-six rapports LICIEL. Quand
 * j'ecrivais que l'isolation vaut « oui / non / inconnue / forte presomption »,
 * ce n'etait pas une regle du metier : c'etait ce que vingt-six rapports d'un
 * seul logiciel m'avaient montre. Un repere mesure sur un seul editeur est
 * l'habitude d'un logiciel.
 *
 * Le DPE est le SEUL diagnostic normalise : depuis le 1er juillet 2021, chaque
 * DPE est transmis a l'ADEME dans un format standardise, et la base publique
 * expose les valeurs possibles de chaque champ.
 *
 * Les listes ci-dessous sont donc **exhaustives et officielles**, relevees le
 * 22/08/2026 sur 15 409 991 DPE. L'API a repondu `total_other = 0` pour chacune :
 * aucune valeur ne manque.
 *
 *   Source : https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant
 *   Releve complet, avec les comptes : docs/reference/enumerations-dpe-ademe.json
 *
 * ── ⚠️ Ce que ces listes sont, et ce qu'elles ne sont pas ───────────────────
 *
 * C'est le vocabulaire de ce que le logiciel **transmet**, pas toujours de ce
 * que le PDF **imprime**. Les deux coincident pour la ventilation — le libelle
 * du PDF est mot pour mot celui de l'ADEME — mais pas partout. Chaque liste dit
 * lequel des deux cas elle est.
 *
 * ── A quoi ca sert ──────────────────────────────────────────────────────────
 *
 * A savoir quand on lit une valeur que personne ne connait. Une valeur hors
 * liste n'est pas une erreur du rapport : c'est le signe que notre lecture a
 * derape, ou qu'un editeur ecrit autrement. Dans les deux cas, ca se signale au
 * lieu de passer inapercu.
 *
 * ── Ce qu'on ne fait PAS ────────────────────────────────────────────────────
 *
 * On n'interroge pas l'ADEME en ligne. Ces listes sont relevees une fois et
 * inscrites ici, avec leur date. Envoyer le numero ADEME d'un logement a une API
 * publique, ce serait envoyer une donnee — et la promesse est que rien ne sort
 * du navigateur.
 */

/**
 * Les 39 systemes de ventilation, mot pour mot.
 *
 * La fiche technique du DPE imprime EXACTEMENT ces libelles : « Ventilation par
 * ouverture des fenetres », « VMC SF Hygro B avant 2001 ». C'est donc la liste
 * complete de ce qu'on peut lire a cet endroit.
 */
export const TYPE_VENTILATION = [
  "Ventilation par ouverture des fenêtres",
  "VMC SF Hygro B après 2012",
  "VMC SF Auto réglable de 1982 à 2000",
  "VMC SF Auto réglable après 2012",
  "VMC SF Auto réglable de 2001 à 2012",
  "Ventilation naturelle par conduit",
  "VMC SF Auto réglable avant 1982",
  "Ventilation par entrées d'air hautes et basses",
  "VMC SF Hygro A après 2012",
  "VMC SF Hygro B de 2001 à 2012",
  "VMC SF Hygro A de 2001 à 2012",
  "VMC SF Hygro A avant 2001",
  "Ventilation mécanique sur conduit existant avant 2013",
  "VMC SF Hygro B avant  2001",
  "Ventilation naturelle par conduit avec entrées d'air hygro",
  "Ventilation mécanique sur conduit existant à partir de 2013",
  "VMC Basse pression Hygro B",
  "VMC Basse pression Hygro A",
  "VMC SF Gaz avant  2001",
  "VMC SF Gaz de 2001 à 2012",
  "VMC SF Gaz après 2012",
  "VMC Basse pression Auto-réglable",
  "VMC DF individuelle avec échangeur à partir de 2013",
  "Ventilation hybride après 2012",
  "Ventilation hybride de 2001 à 2012",
  "Ventilation hybride avant  2001",
  "VMC DF individuelle avec échangeur avant 2013",
  "VMC DF collective avec échangeur avant 2013",
  "Ventilation hybride avec entrées d'air hygro après 2012",
  "VMC DF collective avec échangeur à partir de 2013",
  "VMC DF sans échangeur avant 2013",
  "VMC DF sans échangeur après 2012",
  "Ventilation hybride avec entrées d'air hygro de 2001 à 2012",
  "Ventilation hybride avec entrées d'air hygro avant  2001",
  "Non affecté",
  "Puits climatique avec échangeur avant 2013",
  "Puits climatique sans échangeur avant 2013",
  "Puits climatique avec échangeur à partir de 2013",
  "Puits climatique sans échangeur à partir de 2013"
] as const;

/**
 * Les dix categories d'energie renouvelable reconnues.
 *
 * Ma table maison en donnait six, devinees sur vingt-six rapports : il manquait
 * la geothermie, la cogeneration, l'eolienne, et le cas « il existe plusieurs
 * descriptifs ENR » — celui ou le logement en a plusieurs a la fois.
 */
export const CATEGORIE_ENR = [
  "réseau de chaleur ou de froid vertueux",
  "pompe à chaleur",
  "chauffage au bois",
  "Il existe plusieurs descriptifs ENR",
  "panneaux solaires thermiques",
  "chauffe-eau thermodynamique",
  "panneaux solaires photovoltaïques",
  "géothermie",
  "cogénération",
  "éolienne"
] as const;

/**
 * Les dix periodes de construction, telles que le calcul les decoupe.
 */
export const PERIODE_CONSTRUCTION = [
  "1948-1974",
  "avant 1948",
  "1989-2000",
  "2006-2012",
  "2013-2021",
  "1978-1982",
  "1983-1988",
  "1975-1977",
  "2001-2005",
  "après 2021"
] as const;

/**
 * Appartement, maison, immeuble — et rien d'autre.
 */
export const TYPE_BATIMENT = [
  "appartement",
  "maison",
  "immeuble"
] as const;

/**
 * Individuel, collectif, ou mixte.
 */
export const TYPE_INSTALLATION_CHAUFFAGE = [
  "individuel",
  "collectif",
  "mixte (collectif-individuel)"
] as const;

/**
 * L'inertie du batiment, qui commande le confort d'ete.
 */
export const CLASSE_INERTIE_BATIMENT = [
  "Moyenne",
  "Lourde",
  "Légère",
  "Très lourde"
] as const;

/**
 * Les trois etats du confort d'ete.
 */
export const INDICATEUR_CONFORT_ETE = [
  "moyen",
  "insuffisant",
  "bon"
] as const;

/**
 * Les quatre classes de qualite d'isolation.
 *
 * ⚠️ Ce n'est PAS le champ « Isolation » de la fiche technique, qui vaut
 * « oui / non / inconnue ». Celui-ci est une classe CALCULEE par le logiciel,
 * celui-la un CONSTAT du diagnostiqueur. Les confondre ferait dire au rapport
 * ce qu'il ne dit pas.
 */
export const QUALITE_ISOLATION_MURS = [
  "insuffisante",
  "bonne",
  "très bonne",
  "moyenne"
] as const;

/**
 * Cette valeur figure-t-elle dans la liste officielle ?
 *
 * Rend `null` quand il n'y a pas de liste pour ce champ : « je ne sais pas » et
 * « non » sont deux reponses differentes, et les confondre est le defaut que ce
 * produit existe pour eviter.
 */
export function estConnueDeLAdeme(
  liste: readonly string[] | undefined,
  valeur: string | null
): boolean | null {
  if (!liste || valeur === null) return null;
  const propre = valeur.trim().toLowerCase();
  return liste.some((v) => v.toLowerCase() === propre);
}
