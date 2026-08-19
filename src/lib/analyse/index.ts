/**
 * Orchestration : d'un PDF déposé à une analyse affichable.
 */
import type { PageTexte } from '../lignes';
import type { Analyse, Bien, Diagnostic, TypeDiag } from '../modele';
import { decouper } from './decoupe';
import { natureDe } from './nature';
import { controlerCopropriete } from './copropriete';
import { analyserDpe } from './dpe';
import { analyserPlomb } from './plomb';
import { analyserAmiante, analyserTermites } from './reperages';
import { analyserElectricite, analyserGaz } from './securite';
import { analyserAssainissement, analyserCarrez, analyserErp } from './risques';
import { nonVisites } from './anomalies';
import { controler } from './coherence';
import { confianceDuDossier, origineDe } from './confiance';
import { reperer } from './reperes';
import { conclusionDe, graviteDe, lireSynthese, type BlocSynthese } from './synthese';
import { nombre, trouver } from './texte';
import { dateDuRapport } from './dateRapport';
import { lireTransaction, validite, type Transaction } from './transaction';
import type { PointDeControle } from '../modele';

type Extracteur = (lignes: string[], plage: [number, number]) => Diagnostic;

const EXTRACTEURS: Record<TypeDiag, Extracteur> = {
  dpe: analyserDpe,
  plomb: analyserPlomb,
  amiante: analyserAmiante,
  termites: analyserTermites,
  electricite: analyserElectricite,
  gaz: analyserGaz,
  erp: analyserErp,
  carrez: analyserCarrez,
  assainissement: analyserAssainissement
};

/** Ordre d'affichage : ce qui engage la sécurité et l'argent d'abord. */
const ORDRE: TypeDiag[] = [
  'dpe',
  'electricite',
  'gaz',
  'amiante',
  'plomb',
  'termites',
  'erp',
  'assainissement',
  'carrez'
];

function identifierBien(pages: PageTexte[], horsSection: string[]): Bien {
  /*
   * On cherche dans tout le dossier, et non plus dans ses six premières pages.
   *
   * Mesuré sur quarante dossiers réels : le type de bien, l'année et la surface
   * n'étaient retrouvés que dans un dossier sur quarante. Ils sont pourtant
   * écrits noir sur blanc — mais dans la fiche technique du logement et dans
   * l'attestation de surface habitable, c'est-à-dire vers la neuvième page et
   * au-delà. On lisait six pages d'un dossier qui en compte cinquante : la
   * vitrine restait vide alors que le rapport disait tout.
   *
   * Les pages de garde restent prioritaires : elles sont en tête de la source,
   * et `trouver` s'arrête à la première ligne qui répond.
   */
  const source = [...horsSection, ...pages.flatMap((p) => p.lignes)];
  const bien: Bien = {};

  const adresse = trouver(source, /^Adresse\s*:?[\s.]*(.{5,80}?)\s*(?:Adresse|$)/im);
  if (adresse?.[1] && !/^\s*:?\s*$/.test(adresse[1])) bien.adresse = adresse[1].trim();

  const commune = trouver(source, /Commune\s*:?[\s.]*(\d{5}\s+[^(]{2,40})/i);
  if (commune?.[1]) bien.commune = commune[1].trim();

  const dossier = trouver(source, /Num[ée]ro de dossier\s*:?\s*([\w\/.-]{4,25})/i);
  if (dossier?.[1]) bien.numeroDossier = dossier[1].trim();

  /*
   * « Type de bien », mais aussi « Type d'immeuble » : c'est ainsi que
   * l'appellent les rapports de repérage, et ils sont dix-sept sur trente à le
   * faire. Les points de conduite qui remplissent la ligne — « Type
   * d'immeuble : ......... Appartement » — sont sautés comme le reste des
   * séparateurs.
   */
  const type = trouver(
    source,
    /[Tt]ype (?:de bien|d[’']immeuble)\s*:?[\s.]*([A-Za-zÀ-ÿ' -]{3,30})/
  );
  if (type?.[1]) bien.typeBien = type[1].replace(/[\s.]+$/, '').trim();

  /*
   * L'année s'écrit « 1974 », « 1949 - 1974 », « < 1948 » ou « > 2012 » selon
   * le rapport et selon qu'elle est connue ou estimée. Le motif accepte donc
   * les tirets et les comparateurs : sans eux, une tranche de construction —
   * la forme la plus fréquente du corpus — ne ressortait pas.
   */
  /*
   * On s'arrete a l'annee, pas a la colonne d'a cote.
   *
   * La page de garde met deux colonnes sur la meme ligne : « Annee de
   * construction : 1900   Altitude : inferieur a 400 m ». Le motif ramassait
   * tout ce qui suivait, et le bien portait « Avant 1948 Altitude ».
   *
   * Ce n'est pas qu'un defaut d'affichage : cette annee decide si le produit
   * reclame un constat plomb ou un reperage amiante. Une valeur salie reste
   * lisible pour un humain, jamais pour le controle.
   */
  const annee = trouver(
    source,
    /[Aa]nnée de construction\s*:?[\s.]*((?:[Aa]vant |[Aa]près |[<>]\s*)?\d{4}(?:\s*[-–]\s*\d{4})?|[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ]{2,18}?\s*\d{4})/
  );
  if (annee?.[1]) bien.anneeConstruction = annee[1].replace(/\s+/g, ' ').trim();

  const surface = nombre(
    trouver(source, /surface\s+(?:de référence|habitable|utile)\s*:?[\s.]*([\d\s.,]+)\s*m/i)?.[1]
  );
  if (surface !== null) bien.surface = surface;

  const date = trouver(source, /Date du rep[ée]rage\s*:?[\s.]*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (date?.[1]) bien.dateRepérage = date[1];

  return bien;
}

/** Apostrophes typographiques, utilisées par une partie des générateurs. */
const APOSTROPHES = new RegExp('[\\u2019\\u02bc]', 'g');

/**
 * Uniformise les apostrophes avant toute analyse : « l'installation » et
 * « l’installation » doivent déclencher les mêmes motifs, sans quoi la moitié
 * des rapports passe à travers selon le logiciel qui les a produits.
 */
function normaliserPages(pages: PageTexte[]): PageTexte[] {
  return pages.map((p) => ({
    numero: p.numero,
    lignes: p.lignes.map((l) => l.replace(APOSTROPHES, "'")),
    // Les coordonnées doivent survivre à la normalisation : sans elles, plus
    // moyen de montrer du doigt la ligne dans le rapport.
    ...(p.positions
      ? {
          positions: p.positions.map((pos) => ({
            ...pos,
            texte: pos.texte.replace(APOSTROPHES, "'")
          }))
        }
      : {})
  }));
}

export function analyser(brutes: PageTexte[]): Analyse {
  const pages = normaliserPages(brutes);
  const { sections, horsSection, synthese, plageSynthese } = decouper(pages);
  const blocs = lireSynthese(synthese);

  const lignesTotales = pages.reduce((n, p) => n + p.lignes.length, 0);
  const illisible = pages.length > 0 && lignesTotales / pages.length < 4;

  const diagnostics: Diagnostic[] = [];
  for (const section of sections) {
    const extracteur = EXTRACTEURS[section.type];
    // La page de synthèse porte souvent la conclusion la plus explicite : on la
    // joint à la section pour que les extracteurs puissent s'en servir.
    const diag = extracteur([...section.lignes, ...synthese], section.plage);
    const reperes = reperer(section.type, section.pages);
    const feuillets = section.pages.map((p) => p.numero);

    /*
     * Le périmètre de la mission, pour tous les diagnostics.
     *
     * Ce que le diagnostiqueur n'a pas pu voir borne la portée de sa
     * conclusion : « rien trouvé » et « rien trouvé, mais les combles étaient
     * fermés » ne veulent pas dire la même chose. Seuls l'électricité et le gaz
     * le lisaient — les sept autres rendaient une conclusion sans jamais dire
     * ce qu'elle ne couvrait pas.
     *
     * Mesuré sur quarante dossiers : trente-huit rapports ouvrent une rubrique
     * de périmètre, trente-trois la nomment « pièces non visitées ».
     *
     * On ne remplace rien : les relevés déjà produits par l'extracteur passent
     * devant, et l'on ajoute ce qu'il n'avait pas vu.
     */
    const dejaVus = new Set((diag.releves ?? []).map((r) => `${r.genre}|${r.ou ?? ''}|${r.libelle}`));
    const perimetre = nonVisites(section.lignes).filter(
      (r) => !dejaVus.has(`${r.genre}|${r.ou ?? ''}|${r.libelle}`)
    );
    const releves = [...(diag.releves ?? []), ...perimetre];

    /*
     * La date, repêchée hors du volet quand il n'en porte pas.
     *
     * Mesuré sur le corpus : l'état des risques ne date JAMAIS son propre
     * volet — la découpe ne lui rattache pas la page qui le fait. Sans ce
     * repêchage, le diagnostic le plus fréquent du dossier, et l'un des deux
     * qui périment en six mois, échappe au contrôle de péremption.
     *
     * On ne repêche que si le volet s'est tu, et `dateDuRapport` applique aux
     * pages non rattachées les mêmes libellés stricts qu'ailleurs : elles
     * appartiennent à tout le monde, et y pêcher une date au hasard daterait
     * un rapport avec la visite d'un autre.
     */
    const dateRepechee = diag.date ?? dateDuRapport([], horsSection);

    diagnostics.push({
      ...diag,
      feuillets,
      ...(dateRepechee ? { date: dateRepechee } : {}),
      ...(releves.length ? { releves } : {}),
      ...(reperes.length ? { reperes } : {})
    });
  }

  // Un diagnostic peut figurer au dossier sans que son rapport détaillé ait été
  // reconnu (mise en page inhabituelle, pages scannées). Sa conclusion, elle,
  // est sur la page de synthèse : mieux vaut la restituer que de faire comme si
  // le diagnostic n'existait pas.
  for (const bloc of blocs) {
    if (diagnostics.some((d) => d.type === bloc.type)) continue;
    const diag = EXTRACTEURS[bloc.type](bloc.lignes, plageSynthese ?? [1, pages.length]);
    const depuisLaSynthese = depuisSynthese(diag, blocs);
    /*
     * Ici, le rapport lui-même n'est pas dans le PDF.
     *
     * On récupérait sa conclusion sur la page de synthèse — c'est mieux que de
     * faire comme si le diagnostic n'existait pas — et l'étiquette d'origine le
     * disait. Mais elle ne disait pas ce que cela COÛTE au lecteur : la
     * synthèse tient en une phrase, sans date, sans détail des matériaux, sans
     * les réserves ni les pièces non visitées. Or c'est là que tout se joue.
     *
     * Mesuré sur 140 dossiers : 21 constats amiante sur 49 sont dans ce cas —
     * et c'est ce qui explique à lui seul le taux de « constats sans date ».
     * Ils n'ont pas de date parce que le rapport qui la porte est ailleurs.
     */
    diagnostics.push({
      ...depuisLaSynthese,
      releves: [
        ...(depuisLaSynthese.releves ?? []),
        {
          genre: 'complement',
          libelle:
            'Le rapport détaillé de ce diagnostic ne figure pas dans le PDF : seule sa conclusion, recopiée en page de synthèse, a pu être lue. Réclamez-le au vendeur ou au diagnostiqueur — c’est lui qui porte la date, le détail de ce qui a été examiné, et les réserves.'
        }
      ]
    });
  }

  // Extracteur resté muet sur une section reconnue : la synthèse prend le relais.
  for (const [i, diag] of diagnostics.entries()) {
    if (diag.gravite === 'neutre' && !diag.source) {
      diagnostics[i] = depuisSynthese(diag, blocs);
    }
  }

  /*
   * Les durees de validite, une fois qu'on sait de quelle transaction il s'agit.
   *
   * Les extracteurs ne peuvent pas le savoir : chacun ne voit que son volet, et
   * la marque est ailleurs dans le dossier — la surface demandee, l'article
   * cite, la case du CREP. On la lit donc ici, sur l'ensemble, puis on precise
   * ce que chaque fiche annoncait en deux branches.
   *
   * « Validite : trois ans a la vente, six ans a la location » est vrai, mais
   * laisse le lecteur choisir. Quand le dossier tranche, on tranche avec lui ;
   * quand il ne tranche pas, on garde les deux — c'est le cas des dossiers qui
   * portent les deux surfaces.
   */
  const { transaction } = lireTransaction(pages.flatMap((p) => p.lignes));
  for (const [i, diag] of diagnostics.entries()) {
    diagnostics[i] = preciserValidite(diag, transaction);
  }

  diagnostics.sort((a, b) => ORDRE.indexOf(a.type) - ORDRE.indexOf(b.type));

  // L'origine se calcule en dernier : elle dépend du verdict final, une fois
  // que la synthèse a éventuellement pris le relais d'un extracteur muet.
  for (const [i, diag] of diagnostics.entries()) {
    diagnostics[i] = { ...diag, origine: origineDe(diag) };
  }

  const bien = identifierBien(pages, horsSection);

  // Le lecteur doit pouvoir descendre dans son rapport : on garde le texte de
  // toutes les pages des diagnostics reconnus, plafonné pour ne pas retenir un
  // dossier de cent pages en entier.
  const MAX_PAGES = 60;
  const textePages: Record<number, string[]> = {};
  for (const section of sections) {
    for (const page of section.pages) {
      if (Object.keys(textePages).length >= MAX_PAGES) break;
      textePages[page.numero] ??= page.lignes;
    }
  }

  // De quel document il s'agit, avant tout jugement sur son contenu.
  const toutesLesLignes = pages.flatMap((p) => p.lignes);
  const nature = natureDe(toutesLesLignes);

  return {
    bien,
    nature,
    diagnostics,
    textePages,
    controles: [
      /*
       * Les contrôles du dossier de vente ne valent que pour un dossier de
       * vente.
       *
       * Mesuré sur le corpus : un diagnostic technique global se voyait
       * reprocher l'absence d'un constat plomb et d'un diagnostic électricité.
       * Ces pièces sont dues par un vendeur pour son logement ; les réclamer à
       * un rapport de copropriété est un contresens, et c'est le genre de
       * reproche qui décrédibilise tout le reste. On ne garde donc, hors
       * dossier de vente, que ce qui vaut pour n'importe quel document : un
       * rapport périmé le reste, deux chiffres qui se contredisent aussi.
       */
      ...controler(bien, diagnostics, new Date(), plageSynthese !== null).filter(
        (c) =>
          (nature.genre === 'venteLocation' || c.genre !== 'manque') &&
          !dejaDansLeDocument(c, toutesLesLignes)
      ),
      // Un document de copropriété se contrôle sur son propre cadre légal : ce
      // qui lui manque est un défaut du dossier, au même titre qu'un rapport
      // périmé, et se lit au même endroit.
      ...controlerCopropriete(nature.genre, toutesLesLignes)
    ],
    nonExploites: [],
    illisible,
    nbPages: pages.length,
    confiance: confianceDuDossier(diagnostics)
  };
}

/**
 * Ce diagnostic est-il quelque part dans le document, meme non decoupe ?
 *
 * Reclamer un rapport qui est sous les yeux du lecteur est pire qu'un silence :
 * il cesse de faire confiance a tout le reste. Mesure avant ce garde-fou :
 * quinze dossiers sur cent se voyaient reclamer un DPE dont le numero ADEME
 * figure pourtant dans leurs pages — la decoupe ne l'avait pas reconnu comme
 * volet, mais il est bien la.
 *
 * On ne reclame donc que ce qui ne se trouve NULLE PART, avec la marque la plus
 * sure de chaque diagnostic : le numero ADEME pour le DPE, la mention legale
 * pour l'etat des risques.
 */
const MARQUE_INDUBITABLE: Partial<Record<TypeDiag, RegExp>> = {
  dpe: /N[°o]\s*ADEME|Diagnostic de performance\s*[ée]nerg[ée]tique/i,
  /*
   * Pour l'etat des risques, le TITRE ne prouve rien : « Etat des Risques et
   * Pollutions » figure dans la grille des prestations de tous les dossiers,
   * meme ceux qui n'en portent aucun. Retenir le titre revenait a ne plus
   * jamais reclamer ce diagnostic. Seule la mention legale prouve sa presence.
   */
  erp: /En application des articles L\s*\.?\s*125-5/i,
  plomb: /Constat de risque d'exposition au plomb|CREP/i,
  amiante: /rep[ée]rage des mat[ée]riaux et produits contenant de l'amiante/i,
  electricite: /Etat de l['’]Installation Int[ée]rieure d['’]Electricit[ée]/i,
  termites: /[ée]tat relatif [àa] la pr[ée]sence de termites/i
};

function dejaDansLeDocument(controle: PointDeControle, lignes: string[]): boolean {
  if (controle.genre !== 'manque' || !controle.type) return false;
  const marque = MARQUE_INDUBITABLE[controle.type];
  return marque ? lignes.some((l) => marque.test(l)) : false;
}

/**
 * Precise « trois ans a la vente, six ans a la location » quand on sait lequel.
 *
 * On ne reecrit pas la phrase : on la remplace par celle qui correspond, en
 * disant d'ou vient la certitude. Le lecteur doit pouvoir verifier — c'est son
 * rapport qui l'affirme, pas nous.
 */
function preciserValidite(diag: Diagnostic, transaction: Transaction | null): Diagnostic {
  if (!transaction) return diag;
  const vente = transaction === 'vente';

  const aFaire = diag.aFaire.map((phrase) => {
    /*
     * On ne recalcule rien : la phrase porte deja le resultat du constat, et
     * c'est lui qui commande pour le plomb. On ne fait que retenir la branche
     * qui s'applique, en disant d'ou vient la certitude.
     *
     * Une premiere version deduisait « constat positif » de la gravite affichee
     * et se trompait de sens : un constat positif s'y voyait annoncer « sans
     * limite de duree ». La phrase, elle, ne peut pas se tromper — elle vient
     * du meme calcul que le verdict.
     */
    if (/Validit[ée] : trois ans [àa] la vente, six ans [àa] la location\./i.test(phrase))
      return `Validité : ${vente ? 'trois ans' : 'six ans'} — ce dossier est un dossier ${vente ? 'de vente' : 'de location'}, et son rapport l’écrit lui-même.`;

    if (/valable qu[’']un an [àa] la vente, six ans [àa] la location/i.test(phrase))
      return phrase.replace(
        /valable qu[’']un an [àa] la vente, six ans [àa] la location/i,
        vente ? 'valable qu’un an, ce dossier étant un dossier de vente' : 'valable six ans, ce dossier étant un dossier de location'
      );

    if (/valable qu[’']un an [àa] la vente, six ans [àa] la location/i.test(phrase)) return phrase;
    return phrase;
  });

  return aFaire.some((p, i) => p !== diag.aFaire[i]) ? { ...diag, aFaire } : diag;
}

/** Remplace le verdict par la conclusion écrite au dossier, si elle existe. */
function depuisSynthese(diag: Diagnostic, blocs: BlocSynthese[]): Diagnostic {
  const conclusion = conclusionDe(blocs, diag.type);
  if (!conclusion) return diag;
  return {
    ...diag,
    verdict: conclusion,
    gravite: diag.gravite === 'neutre' ? graviteDe(conclusion) : diag.gravite,
    source: 'synthese'
  };
}
