/**
 * Conditions générales, et la preuve qu'elles ont été acceptées.
 *
 * Le visiteur accepte **avant** que son rapport soit analysé. C'est une
 * exigence produit, mais aussi la seule façon d'annoncer une conservation de
 * données au moment de la collecte — annoncée après, elle ne se régularise
 * pas.
 *
 * L'acceptation est horodatée et porte le numéro de version : si le texte
 * change sur un point qui engage le lecteur, on redemande. Elle vit dans le
 * stockage local, comme le reste : rien ne part d'ici.
 */

/**
 * Version du texte. À changer **uniquement** quand une clause qui engage le
 * lecteur bouge — pas pour une virgule : chaque changement fait redemander son
 * accord à tout le monde.
 */
export const VERSION_CGV = '2026-08-13';

/**
 * Identité de l'éditeur.
 *
 * ⚠️ Ces champs sont vides tant qu'ils n'ont pas été fournis. Des conditions
 * générales sans éditeur identifiable ne sont opposables à personne : tant
 * qu'ils le sont, l'interface affiche un avertissement au lieu de faire croire
 * à un texte valide.
 */
export const EDITEUR = {
  raisonSociale: '',
  formeJuridique: '',
  siret: '',
  adresse: '',
  email: '',
  directeurPublication: '',
  /** L'hébergement du site. Distinct de celui des données conservées. */
  hebergeur: 'GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis'
} as const;

/** Vrai quand l'éditeur est identifiable, donc quand le texte peut engager. */
export function editeurRenseigne(): boolean {
  return Boolean(EDITEUR.raisonSociale && EDITEUR.siret && EDITEUR.adresse && EDITEUR.email);
}

export interface Acceptation {
  version: string;
  /** Horodatage ISO. */
  quand: string;
}

const CLE = 'checkmydiag.cgv';

/** L'accord déjà donné, s'il porte bien sur la version en vigueur. */
export function acceptationEnCours(): Acceptation | null {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return null;
    const lu = JSON.parse(brut) as Partial<Acceptation>;
    if (lu.version !== VERSION_CGV || !lu.quand) return null;
    return { version: lu.version, quand: lu.quand };
  } catch {
    // Navigation privée, stockage plein, JSON abîmé : on redemande, c'est tout.
    return null;
  }
}

/** Enregistre l'accord. Renvoie ce qui a été retenu, pour l'afficher. */
export function accepter(maintenant: Date = new Date()): Acceptation {
  const acceptation: Acceptation = { version: VERSION_CGV, quand: maintenant.toISOString() };
  try {
    localStorage.setItem(CLE, JSON.stringify(acceptation));
  } catch {
    // Refuser d'analyser parce que le stockage est plein serait absurde :
    // l'accord vaut pour cette visite, il sera redemandé à la suivante.
  }
  return acceptation;
}

/** Efface l'accord — utilisé par le bouton qui vide les données du site. */
export function oublierAcceptation(): void {
  try {
    localStorage.removeItem(CLE);
  } catch {
    /* rien à faire */
  }
}

export interface Article {
  titre: string;
  /** Paragraphes. Une idée par paragraphe, phrases courtes. */
  points: string[];
}

/**
 * Le texte.
 *
 * Écrit pour être lu : phrases courtes, mots de tous les jours, aucune
 * tournure qui oblige à relire. Un lecteur de quinze ans doit comprendre ce
 * qu'il accepte — c'est la règle du projet, et elle ne s'arrête pas à la porte
 * du juridique.
 */
export const CGV: Article[] = [
  {
    titre: '1. Ce que fait ce site',
    points: [
      'CheckMyDiag lit un rapport de diagnostic immobilier et vous l’explique en français courant, avec des schémas.',
      'Il vous signale aussi ce qui mérite une question : un diagnostic périmé, un diagnostic absent du dossier, des chiffres qui ne concordent pas.',
      'Le service est gratuit pour vous, et le restera. Vous n’avez pas de compte à créer.'
    ]
  },
  {
    titre: '2. Ce que ce site n’est pas',
    points: [
      'CheckMyDiag n’est pas un diagnostiqueur. Il n’établit aucun diagnostic et n’a aucune valeur réglementaire.',
      'Le rapport signé par votre diagnostiqueur reste le seul document qui fait foi. En cas de différence entre ce que ce site affiche et ce que dit votre rapport, c’est votre rapport qui a raison.',
      'Ce site ne remplace pas l’avis d’un professionnel. Il vous aide à comprendre et à poser les bonnes questions.'
    ]
  },
  {
    titre: '3. Votre document reste chez vous',
    points: [
      'Votre PDF est lu directement par votre navigateur. Il n’est jamais envoyé sur un serveur, ni copié, ni transmis à qui que ce soit.',
      'Si vous choisissez de garder un dossier pour le rouvrir plus tard, il est enregistré dans votre propre navigateur. Vous pouvez l’effacer d’un bouton, à tout moment.'
    ]
  },
  {
    titre: '4. Ce que nous conservons',
    points: [
      'Nous conservons ce que le rapport nous a appris, jamais le rapport lui-même : le code postal, le mois, le type de logement, sa tranche d’âge, la nature et la gravité de chaque diagnostic, et ce qui manquait au dossier.',
      'Nous ne conservons jamais votre nom, votre adresse exacte, les références cadastrales, le numéro de dossier, le numéro ADEME, ni aucune surface ou aucun montant. Ces informations ne sortent pas de votre appareil.',
      'À quoi cela sert : compter combien de dossiers sont consultés dans chaque secteur, et publier des statistiques générales sur l’état des logements. Jamais à vous recontacter — nous n’avons aucun moyen de le faire.',
      'Ces informations sont conservées deux ans, puis effacées automatiquement.',
      'Vous pouvez demander l’effacement des informations vous concernant. Comme elles ne portent aucun identifiant, précisez le mois et le code postal de votre consultation pour que nous puissions les retrouver.'
    ]
  },
  {
    titre: '5. Les professionnels recommandés',
    points: [
      'Quand votre rapport signale un problème, le site peut vous indiquer un professionnel de votre secteur — un électricien si l’installation présente une anomalie, par exemple.',
      'Ce référencement est payant : le professionnel paie un abonnement fixe pour être présent sur son secteur. Cela est écrit à l’endroit où il apparaît.',
      'CheckMyDiag ne touche aucune commission sur les travaux, et n’est pas rémunéré au résultat. Le montant payé par le professionnel ne dépend jamais de ce que vous faites ensuite.',
      'Ce n’est ni un label, ni une garantie de qualité, ni une recommandation d’expert. Chaque professionnel est vérifié à son inscription (entreprise réelle, assurance en cours, qualification quand le métier l’exige), mais nous ne répondons pas de ses travaux.',
      'Vous n’êtes jamais mis en relation sans le vouloir : c’est vous qui appelez ou demandez un devis. Votre rapport n’est jamais transmis à un professionnel.'
    ]
  },
  {
    titre: '6. Les limites de l’outil',
    points: [
      'La lecture automatique d’un PDF n’est pas parfaite. Certains rapports sont des images, d’autres cochent leurs conclusions à la main : dans ce cas, le site vous le dit plutôt que de deviner.',
      'Nous ne garantissons pas que tout a été lu, ni que tout a été bien compris. Avant toute décision qui vous engage — acheter, vendre, faire des travaux, renoncer — reportez-vous à votre rapport et, si besoin, à un professionnel.',
      'Nous ne pouvons pas être tenus responsables d’une décision prise sur la seule base de ce site.'
    ]
  },
  {
    titre: '7. Ce que vous vous engagez à faire',
    points: [
      'Ne déposer que des documents que vous avez le droit d’utiliser.',
      'Ne pas tenter de perturber le service, ni de l’utiliser de façon automatisée pour en extraire le contenu en masse.'
    ]
  },
  {
    titre: '8. Le contenu du site',
    points: [
      'Les textes, les schémas et les explications de CheckMyDiag lui appartiennent. Vous pouvez les lire, les imprimer et les partager pour votre usage personnel.',
      'Votre rapport de diagnostic vous appartient. Nous n’en revendiquons rien.'
    ]
  },
  {
    titre: '9. Modifications',
    points: [
      'Ces conditions peuvent évoluer. Si une clause qui vous engage change, votre accord vous sera redemandé à votre prochaine visite.',
      'La version en vigueur porte sa date, en haut de cette page.'
    ]
  },
  {
    titre: '10. Droit applicable',
    points: [
      'Ces conditions relèvent du droit français.',
      'En cas de difficulté, écrivez-nous d’abord : la plupart des situations se règlent ainsi. Vous pouvez aussi saisir gratuitement un médiateur de la consommation, ou la CNIL pour ce qui touche à vos données.'
    ]
  }
];
