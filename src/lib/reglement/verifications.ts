/**
 * Ce que l'État demande de vérifier sur son DPE.
 *
 * Le ministère publie un document destiné aux particuliers, « Comprendre mon
 * DPE », qui énumère cinq éléments clés à contrôler soi-même. C'est, mot pour
 * mot, la mission de cette application — énoncée par celui qui écrit la règle.
 *
 * On reprend donc ces cinq points tels quels, dans leur ordre, avec pour chacun
 * ce que le rapport déposé en dit. Là où l'application peut lire la donnée, elle
 * la montre ; là où seul le lecteur peut trancher — « ces énergies sont-elles
 * bien les vôtres ? » —, elle pose la question sans y répondre.
 *
 * Le premier point mérite une note. La vérification du numéro se fait sur
 * l'Observatoire de l'ADEME, et c'est le lecteur qui s'y rend : l'application ne
 * l'interroge pas. Elle ne le fera jamais — envoyer le numéro d'un DPE à un
 * serveur reviendrait à dire où habite quelqu'un, et le fichier ne quitte pas
 * l'appareil. On donne le numéro et l'adresse ; le geste appartient au lecteur.
 *
 * Source : « Comprendre mon DPE », ministère de la Transition écologique,
 * https://www.ecologie.gouv.fr/sites/default/files/Comprendre%20mon%20DPE.pdf
 * lu le 14 août 2026.
 */
import type { Diagnostic } from '../modele';

export interface Verification {
  /** Le point, dans les mots du document officiel. */
  point: string;
  /** Pourquoi il compte, tel que le document l'explique. */
  pourquoi: string;
  /** Ce que le rapport déposé en dit, si l'application a su le lire. */
  releve: string | null;
  /** Ce que le lecteur doit faire pour trancher. */
  quoiFaire: string;
  /** L'adresse officielle où aller, quand il y en a une. */
  lien?: { texte: string; url: string };
}

/**
 * L'adresse de l'Observatoire.
 *
 * Attention : ce n'est plus celle qu'imprime « Comprendre mon DPE ». Le document
 * du ministère renvoie à `observatoire-dpe.ademe.fr`, qui ne résout plus ; le
 * service a été réuni avec celui des audits sous `observatoire-dpe-audit`.
 * Vérifié le 14 août 2026 : l'ancienne adresse ne répond pas, la nouvelle si.
 *
 * La leçon vaut d'être écrite : recopier fidèlement un document officiel ne
 * suffit pas, car un document officiel vieillit aussi. Une adresse se teste.
 */
export const OBSERVATOIRE = 'https://observatoire-dpe-audit.ademe.fr/accueil';

/** Le fait `libelle` du diagnostic, ou `null`. */
function fait(dpe: Diagnostic, libelle: string): string | null {
  return dpe.faits.find((f) => f.libelle === libelle)?.valeur ?? null;
}

/**
 * Les cinq vérifications officielles, confrontées au rapport déposé.
 *
 * Rien n'est jugé : on rapproche, on n'arbitre pas. L'application ne sait pas
 * quelle est la vraie surface d'un logement ni quelle énergie le chauffe — le
 * lecteur, lui, le sait.
 */
export function verificationsDpe(dpe: Diagnostic): Verification[] {
  const numero = fait(dpe, 'N° ADEME');
  const surface = fait(dpe, 'Surface de référence') ?? fait(dpe, 'Surface habitable');

  /* Les énergies figurent dans les postes du DPE : chauffage au fioul, eau
     chaude électrique. C'est cette liste que le lecteur doit reconnaître. */
  const postes =
    dpe.schema?.genre === 'dpe' ? dpe.schema.postes.map((p) => p.nom).filter(Boolean) : [];

  return [
    {
      point: 'Le numéro de votre DPE',
      pourquoi:
        'Un DPE valable est enregistré à l’Observatoire de l’ADEME. Si le numéro ne s’y trouve pas, le document n’a pas de valeur.',
      releve: numero,
      quoiFaire: numero
        ? 'Saisissez ce numéro dans « Trouver un DPE ». Si le message « Ce DPE est introuvable » s’affiche, recontactez votre diagnostiqueur.'
        : 'Le numéro n’a pas été retrouvé dans le document. Il figure en haut de la première page du DPE, sur treize caractères.',
      lien: { texte: 'Observatoire de l’ADEME', url: OBSERVATOIRE }
    },
    {
      point: 'La surface habitable',
      pourquoi:
        'Le ministère la signale comme « très importante pour votre étiquette » : la consommation est divisée par elle, donc une surface fausse fausse la classe. Elle peut ne pas correspondre à la surface chauffée.',
      releve: surface,
      quoiFaire:
        'Comparez-la à ce que vous savez de votre logement, véranda chauffée comprise. Si vous aviez remis des justificatifs au diagnostiqueur, vérifiez avec lui que c’est bien cette surface qui a été retenue.'
    },
    {
      point: 'L’énergie renseignée pour les cinq usages',
      pourquoi:
        'Le DPE note le logement sur le chauffage, l’eau chaude, le refroidissement, l’éclairage et les auxiliaires. Une énergie mal renseignée déplace l’étiquette climat, donc parfois la classe entière.',
      releve: postes.length ? postes.join(', ') : null,
      quoiFaire:
        'Assurez-vous que les sources d’énergie mentionnées sont bien celles utilisées chez vous. C’est vous qui savez si vous chauffez au gaz, au fioul ou à l’électricité.'
    },
    {
      point: 'La vue d’ensemble de votre logement',
      pourquoi:
        'Le rapport décrit les parois — murs, toiture, plancher, menuiseries — et leur isolation. Ce descriptif commande le calcul : une paroi donnée pour isolée alors qu’elle ne l’est pas améliore la note à tort.',
      releve: null,
      quoiFaire:
        'Relisez le descriptif dans votre rapport et confrontez-le à ce que vous connaissez du bâtiment, notamment les travaux déjà faits.'
    },
    {
      point: 'La vue d’ensemble des équipements',
      pourquoi:
        'La chaudière, le chauffe-eau, la ventilation : leur nature et leur âge pèsent lourd dans le résultat.',
      releve: null,
      quoiFaire:
        'Vérifiez que les équipements décrits sont bien les vôtres, et signalez tout remplacement récent à votre diagnostiqueur.'
    }
  ];
}

/**
 * Les recours, dans l'ordre que le ministère indique.
 *
 * Ils comptent autant que les vérifications : constater une erreur sans savoir
 * à qui s'adresser ne mène à rien. Beaucoup ignorent que le diagnostiqueur est
 * surveillé par un organisme de certification, dont le nom figure sur leur
 * propre rapport.
 */
export const RECOURS = [
  {
    etape: 'Reprenez contact avec votre diagnostiqueur',
    quoi: 'C’est lui qui a saisi les données ; une erreur matérielle se corrige à ce niveau.'
  },
  {
    etape: 'Portez réclamation auprès de son organisme de certification',
    quoi: 'Son nom est au bas de la première page de votre DPE, dans le bandeau « informations diagnostiqueur ». C’est lui qui surveille et contrôle ses compétences.'
  },
  {
    etape: 'Utilisez la médiation de la consommation',
    quoi: 'Gratuite pour vous. Le diagnostiqueur est tenu de vous communiquer les coordonnées du médiateur dont il relève. C’est une alternative à l’action judiciaire.'
  }
] as const;
