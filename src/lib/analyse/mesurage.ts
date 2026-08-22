/**
 * LE MESURAGE, LU PAR ÉDITEUR — le pont entre la liseuse et l'écran.
 *
 * `analyserCarrez` (dans `risques.ts`) reste le **repli** : sept motifs en
 * cascade, écrits en regardant du LICIEL, appliqués faute de mieux à un éditeur
 * inconnu. Ce module-ci est ce qu'on applique quand on sait devant quoi on est.
 *
 * Ce qu'il apporte que le repli ne pouvait pas donner :
 *
 * - **la loi lue sur l'intitulé du document**, pas sur un mot croisé dans une
 *   phrase. Le repli cherchait « superficie privative » ou « surface habitable »
 *   indifféremment ; or LICIEL dit *surface* là où BC2E dit *superficie*, pour
 *   les deux lois. Le repli attribuait donc la Carrez à des attestations Boutin
 *   BC2E — la pièce d'une vente annoncée à qui tient celle d'une location ;
 * - **les pièces non visitées**, que le repli ne cherchait pas du tout. Une
 *   pièce non visitée n'est pas une pièce de 0 m² ;
 * - **les réserves de mission** — « L'acte de propriété n'a pas été fourni » —,
 *   écrites noir sur blanc dans 8 volets BC2E sur 8, et jamais affichées ;
 * - **les commentaires ligne à ligne**, qui disent POURQUOI une pièce ne compte
 *   pas.
 */
import type { Contexte } from './lecteurs';
import { lireLeMesurage } from '../lecteurs/mesurage';
import {
  ecartNonCompte,
  piecesEcartees,
  type LectureMesurage
} from '../lecteurs/mesurage/modele';
import type { Diagnostic, Fait } from '../modele';
import { analyserCarrez } from './risques';

const fr = (n: number): string => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

/**
 * Les mots employés à l'écran suivent la loi du document.
 *
 * On ne normalise pas : quand le rapport dit « superficie privative », l'écran
 * dit « superficie privative ». Traduire dans un vocabulaire maison ferait
 * perdre le lien avec la pièce que le lecteur a sous les yeux.
 */
function titreDe(lecture: LectureMesurage): string {
  if (lecture.loi === 'carrez') return 'Superficie privative (loi Carrez)';
  if (lecture.loi === 'boutin') return 'Surface habitable (loi Boutin)';
  /* Ni l'une ni l'autre, et le document le dit : le titre ne doit nommer
     aucune loi, sans quoi l'écran contredit la pièce qu'il affiche. */
  return 'Surface mesurée (sans portée juridique)';
}

function faitsDe(lecture: LectureMesurage): Fait[] {
  const faits: Fait[] = [];

  if (lecture.surfaceAnnoncee) {
    faits.push({
      libelle: lecture.surfaceAnnoncee.libelle,
      valeur: `${fr(lecture.surfaceAnnoncee.valeur)} m²`,
      precision:
        lecture.loi === 'carrez'
          ? 'le chiffre qui s’écrit dans l’acte de vente'
          : lecture.loi === 'boutin'
            ? 'le chiffre qui s’écrit dans le bail'
            : 'un métré, sans portée juridique'
    });
  }

  /* Les autres totaux gardent l'intitulé du rapport — y compris
     « Superficie HSP < 1.80M », qu'on ne traduit pas (voir `bc2e.ts`). */
  for (const autre of lecture.autresTotaux) {
    faits.push({ libelle: autre.libelle, valeur: `${fr(autre.valeur)} m²` });
  }

  /*
   * Les mètres carrés qui existent et ne comptent pas.
   *
   * Ce ne sont pas des décimales de calcul : ce sont des pièces entières — une
   * terrasse, une cave, un cellier occupé par un chauffe-eau. Le tableau du
   * rapport les liste ; personne ne le lit.
   */
  const ecart = ecartNonCompte(lecture);
  const ecartees = piecesEcartees(lecture);
  if (ecart !== null && ecartees.length) {
    faits.push({
      libelle: 'Pièces mesurées et non comptées',
      valeur: `${fr(ecart)} m²`,
      precision: ecartees.map((p) => p.nom.replace(/^.*?\s-\s/, '')).slice(0, 6).join(', ')
    });
  }

  /*
   * ⚠️ Une pièce non visitée n'est pas une pièce de 0 m².
   *
   * Elle n'a pas été mesurée du tout, et la surface annoncée ne la contient
   * pas. C'est un fait à part entière, et le repli ne le cherchait nulle part.
   */
  if (lecture.piecesNonVisitees.etat === 'renseignée') {
    const pieces = lecture.piecesNonVisitees.valeur;
    faits.push({
      libelle: 'Pièces non visitées',
      valeur: String(pieces.length),
      precision: pieces
        .map((p) => (p.motif ? `${p.designation} — ${p.motif}` : p.designation))
        .join(' · ')
    });
  }

  return faits;
}

/**
 * Ce que la mission n'a pas pu vérifier, dans les mots du rapport.
 *
 * BC2E écrit ces phrases dans 8 volets sur 8, et elles disent la chose la plus
 * concrète du document pour un acquéreur : la **consistance du lot n'a pas été
 * contrôlée**, faute de règlement de copropriété. Le repli les jetait.
 */
function reservesEnClair(lecture: LectureMesurage): string[] {
  if (!lecture.reserves.length) return [];
  return [
    'Le diagnostiqueur écrit lui-même ce qu’il n’a pas pu vérifier : ' +
      lecture.reserves.map((r) => `« ${r} »`).join(' ') +
      ' Autrement dit, il a mesuré ce qu’on lui a montré, sans pouvoir contrôler que ces pièces sont bien celles du lot vendu.'
  ];
}

const EXPLICATION_CARREZ = [
  'La loi Carrez s’applique à la vente d’un lot en copropriété, quel qu’en soit l’usage : logement, bureau ou local commercial.',
  'Ce chiffre diffère de la loi Boutin et de celui du DPE. Trois mesures pour un même logement, c’est normal : elles ne servent pas à la même chose.',
  'Les caves, les garages, les balcons et les terrasses ne comptent pas.'
];

const EXPLICATION_BOUTIN = [
  'La loi Boutin donne la surface habitable, et elle est due au locataire : elle s’écrit dans le bail.',
  'Pour vendre un lot en copropriété, c’est un autre mesurage qui est exigé — la superficie privative, dite loi Carrez. Elle est en général plus grande : elle compte les combles non aménagés, les greniers et les vérandas de plus d’1,80 m, que la surface habitable écarte.',
  'Ce chiffre diffère aussi de celui du DPE. Plusieurs mesures pour un même logement, c’est normal : elles ne servent pas à la même chose.'
];

const A_FAIRE_CARREZ = [
  'Si la superficie réelle est inférieure de plus de 5 % à celle annoncée à l’acte, l’acquéreur peut demander une réduction du prix au prorata, dans l’année qui suit la vente.',
  'Le mesurage n’a pas de durée de validité tant que le logement n’est pas modifié.'
];

const EXPLICATION_SANS_LOI = [
  'Ce document est un métré : il donne la surface des pièces, mesurée par un professionnel.',
  'Il ne relève d’aucun texte, et son auteur l’écrit en tête : il ne peut pas servir de mesurage loi Carrez.',
  'Pour vendre un lot en copropriété, c’est la superficie privative — loi Carrez — qui est exigée. Pour louer, c’est la surface habitable — loi Boutin. Ni l’une ni l’autre n’est ce document.'
];

const A_FAIRE_SANS_LOI = [
  'Ne pas reporter ce chiffre dans une promesse ou un acte de vente : le document écarte lui-même cet usage.',
  'Pour vendre, demander un mesurage loi Carrez ; pour louer, une attestation de surface habitable.'
];

const A_FAIRE_BOUTIN = [
  'Une surface habitable inférieure de plus d’un vingtième à celle du bail permet au locataire de demander une diminution du loyer.',
  'Si vous vendez, ce document ne suffit pas : demandez un mesurage loi Carrez.'
];

export function lireLeMesurageEnDiagnostic(contexte: Contexte): Diagnostic {
  const lignes = [...contexte.lignes];
  const plage = [...contexte.plage] as [number, number];
  const lu = lireLeMesurage(lignes);

  /*
   * Format non reconnu : on repasse au repli plutôt que de rendre un volet
   * muet. Le repli n'est pas fiable partout, mais il n'invente pas de loi —
   * et un dossier sans surface du tout serait pire que sa lecture approchée.
   */
  if (lu.etat !== 'lu') return analyserCarrez(lignes, plage);

  const lecture = lu.valeur;
  const carrez = lecture.loi === 'carrez';
  const sansLoi = lecture.loi === 'aucune';
  const nom = lecture.surfaceAnnoncee?.libelle ?? titreDe(lecture);

  return {
    type: 'carrez',
    titre: titreDe(lecture),
    verdict: lecture.surfaceAnnoncee
      ? `${nom} : ${fr(lecture.surfaceAnnoncee.valeur)} m².`
      : 'Un mesurage figure au dossier, mais la surface n’a pas pu être lue.',
    /*
     * `bon` se déduit ici d'une valeur PRÉSENTE — le total imprimé par le
     * rapport —, jamais d'une absence de marqueur. C'est ce qui le distingue
     * des conclusions favorables dangereuses relevées dans
     * `docs/LECTEURS-PAR-EDITEUR-ETAT.md` : sans surface lue, on rend `neutre`.
     */
    gravite: lecture.surfaceAnnoncee ? 'bon' : 'neutre',
    faits: faitsDe(lecture),
    analogie:
      '1,80 m, c’est la hauteur sous laquelle vous ne tenez pas debout. La loi considère que cette surface-là ne compte pas. Voilà pourquoi votre logement paraît plus petit sur le papier que dans la réalité.',
    explication: [
      /* La mise en garde du document passe AVANT tout le reste : c'est la
         première chose à savoir de la pièce qu'on tient. */
      ...(lecture.miseEnGarde ? [`Le document écrit lui-même : « ${lecture.miseEnGarde} »`] : []),
      ...(sansLoi ? EXPLICATION_SANS_LOI : carrez ? EXPLICATION_CARREZ : EXPLICATION_BOUTIN),
      ...reservesEnClair(lecture)
    ],
    aFaire: [
      ...(sansLoi ? A_FAIRE_SANS_LOI : carrez ? A_FAIRE_CARREZ : A_FAIRE_BOUTIN),
      ...(lecture.piecesNonVisitees.etat === 'renseignée'
        ? [
            'Une ou plusieurs pièces n’ont pas pu être visitées : leur surface n’est comptée nulle part. Demandez si elles doivent l’être.'
          ]
        : [])
    ],
    /* Le tableau que l'écran affiche déjà — mêmes champs que le repli, pour ne
       rien casser de `LesSurfaces.svelte`. */
    schema: lecture.pieces.length
      ? {
          genre: 'surfaces',
          pieces: lecture.pieces.map((p) => ({
            nom: p.niveau ? `${p.niveau} - ${p.nom}` : p.nom,
            privative: p.retenue,
            auSol: p.autres[0]?.valeur ?? p.retenue
          })),
          totalPrivative: lecture.surfaceAnnoncee?.valeur ?? null,
          totalAuSol: lecture.autresTotaux[0]?.valeur ?? null
        }
      : null,
    /* La lecture complète, pour la mini-app : elle porte les commentaires, les
       intitulés d'origine et les sources, que `faits` ne peut pas transporter. */
    mesurage: lecture,
    pages: plage,
    ...(lecture.dateRapport ? { date: lecture.dateRapport } : {})
  };
}
