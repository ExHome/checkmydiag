/**
 * État des risques et pollutions (ERP), superficie Carrez, assainissement.
 *
 * L'ERP n'est pas une inspection du logement : c'est la recopie de ce que
 * l'administration sait de la commune et de la parcelle. Le lecteur croit
 * souvent qu'on est venu mesurer quelque chose chez lui — l'explication doit
 * lever ce malentendu.
 */
import type { Diagnostic, Fait, Gravite } from '../modele';
import { nombre, trouver } from './texte';

interface Detecteur {
  nom: string;
  /** Présence du risque. */
  positif: RegExp;
  /** Absence explicite : prioritaire sur le positif. */
  negatif?: RegExp;
  niveau: Gravite;
}

const DETECTEURS: Detecteur[] = [
  {
    nom: 'Retrait-gonflement des argiles',
    positif: /zone d'exposition (forte|moyenne)[^.]{0,60}retrait/i,
    negatif: /(?:pas|non) (?:concern[ée]|situ[ée])[^.]{0,40}retrait[ -]gonflement/i,
    niveau: 'attention'
  },
  {
    nom: 'Sismicité',
    positif: /risque sismique \(niveau (\d)[^)]*\)/i,
    niveau: 'attention'
  },
  {
    nom: 'Inondation',
    positif: /(?:PPR|plan de pr[ée]vention)[^.]{0,40}inondation|zone inondable/i,
    negatif: /ne se situe pas[^.]{0,60}inondation/i,
    niveau: 'alerte'
  },
  {
    nom: 'Plan d’exposition au bruit',
    positif: /se situe dans une zone d'un plan d'exposition au bruit/i,
    negatif: /ne se situe pas dans une zone d'un plan d'exposition au bruit/i,
    niveau: 'attention'
  },
  {
    nom: 'Radon',
    positif: /potentiel radon[^.]{0,30}(?:niveau\s*)?([23])/i,
    negatif: /potentiel radon[^.]{0,30}(?:niveau\s*)?1\b/i,
    niveau: 'attention'
  },
  {
    nom: 'Pollution des sols',
    positif: /secteur d'information sur les sols|\bSIS\b/i,
    negatif: /aucun secteur d'information sur les sols/i,
    niveau: 'alerte'
  },
  {
    nom: 'Risque technologique',
    positif: /plan de pr[ée]vention des risques technologiques|\bPPRT\b/i,
    negatif: /ne se situe pas[^.]{0,60}technologique/i,
    niveau: 'alerte'
  },
  {
    nom: 'Sinistre indemnisé (catastrophe naturelle)',
    positif: /sinistre[s]? indemnis[ée][s]?[^.]{0,60}catastrophe/i,
    negatif: /aucun sinistre[^.]{0,40}indemnis/i,
    niveau: 'attention'
  }
];

export function analyserErp(lignes: string[], plage: [number, number]): Diagnostic {
  // Le formulaire ERP énumère tous les risques existants pour que le
  // diagnostiqueur coche les bons — et les cases sont des images. On ne lit donc
  // que les phrases rédigées, celles qui affirment quelque chose sur ce bien.
  const affirmations = lignes.filter((l) =>
    /le bien (?:se situe|ne se situe|est )|est ainsi concern[ée]|^\s*-\s*le risque|^le risque|la commune dans laquelle/i.test(
      l
    )
  );
  const texte = affirmations.join(' ');
  const risques: { nom: string; niveau: Gravite; detail?: string }[] = [];

  for (const d of DETECTEURS) {
    if (d.negatif?.test(texte)) {
      risques.push({ nom: d.nom, niveau: 'bon', detail: 'non concerné' });
      continue;
    }
    const m = texte.match(d.positif);
    if (m) {
      const risque: { nom: string; niveau: Gravite; detail?: string } = { nom: d.nom, niveau: d.niveau };
      if (m[1]) risque.detail = `niveau ${m[1]}`;
      risques.push(risque);
    }
  }

  const concernes = risques.filter((r) => r.niveau !== 'bon');
  const alertes = concernes.filter((r) => r.niveau === 'alerte');

  const faits: Fait[] = [];
  if (concernes.length)
    faits.push({ libelle: 'Risques concernant le bien', valeur: String(concernes.length) });
  const date = trouver(lignes, /(?:[ée]tabli|d[ée]livr[ée]|date)[^.]{0,20}(\d{2}\/\d{2}\/\d{4})/i);
  if (date?.[1]) faits.push({ libelle: 'Établi le', valeur: date[1] });

  return {
    type: 'erp',
    titre: 'Risques et pollutions (ERP)',
    verdict: concernes.length
      ? `Le bien est concerné par : ${concernes.map((r) => r.nom.toLowerCase() + (r.detail ? ` (${r.detail})` : '')).join(', ')}.`
      : 'Aucun risque majeur recensé pour ce bien dans les documents consultés.',
    gravite: alertes.length ? 'alerte' : concernes.length ? 'attention' : 'bon',
    faits,
    explication: [
      'Personne n’est venu mesurer quoi que ce soit chez vous. Le diagnostiqueur recopie ce que l’administration sait déjà du terrain : les risques connus de la commune et de la parcelle.',
      'Un risque dans la liste ne veut pas dire qu’il se passe quelque chose. Il veut dire que la zone est classée. Résultat : des règles s’appliquent quand on construit, et l’assurance en tient compte.',
      'Le plus fréquent, surtout dans le Sud-Ouest, c’est l’argile. En été elle sèche et se tasse, en hiver elle gonfle. La maison bouge avec elle, et les murs se fissurent.'
    ],
    aFaire: [
      'Validité : six mois. C’est le diagnostic qui périme le plus vite, avec les termites.',
      'En zone d’argiles moyenne ou forte, une construction neuve impose une étude de sol ; pour un bien existant, surveillez les fissures et évitez de planter de grands arbres près des fondations.',
      'Vérifiez auprès de votre assureur ce que couvre votre contrat en cas de catastrophe naturelle : la franchise légale s’applique.'
    ],
    schema: risques.length ? { genre: 'risques', risques } : null,
    pages: plage,
    ...(date?.[1] ? { date: date[1] } : {})
  };
}

export function analyserCarrez(lignes: string[], plage: [number, number]): Diagnostic {
  const m =
    trouver(lignes, /superficie\s+(?:loi\s+)?carrez\s+totale\s*:?[\s.]*([\d\s.,]+)\s*m/i) ??
    trouver(lignes, /surface\s+(?:loi\s+)?carrez\s+totale\s*:?[\s.]*([\d\s.,]+)\s*m/i) ??
    trouver(lignes, /superficie\s+(?:privative\s+)?(?:totale|habitable|carrez)\s*:?[\s.]*([\d\s.,]+)\s*m/i) ??
    trouver(lignes, /surface\s+(?:loi\s+)?carrez\s*:?[\s.]*([\d\s.,]+)\s*m/i);
  const surface = nombre(m?.[1]);

  const auSol = nombre(trouver(lignes, /surface au sol totale\s*:?[\s.]*([\d\s.,]+)\s*m/i)?.[1]);

  const fr = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

  const faits: Fait[] = [];
  if (surface !== null) faits.push({ libelle: 'Superficie privative', valeur: `${fr(surface)} m²` });
  if (auSol !== null)
    faits.push({
      libelle: 'Surface au sol',
      valeur: `${fr(auSol)} m²`,
      precision: 'avant déduction des murs et des hauteurs sous 1,80 m'
    });

  return {
    type: 'carrez',
    titre: 'Superficie (loi Carrez)',
    verdict:
      surface !== null
        ? `Superficie privative mesurée : ${fr(surface)} m²${auSol !== null ? ` (${fr(auSol)} m² au sol)` : ''}.`
        : 'Un mesurage est présent dans le dossier, mais la surface n’a pas pu être lue.',
    gravite: surface !== null ? 'bon' : 'neutre',
    faits,
    explication: [
      'La loi Carrez sert à vendre un logement en copropriété. On mesure le sol des pièces, mais seulement là où le plafond est à plus de 1,80 m. On enlève les murs, les cloisons et les gaines techniques.',
      'Ce chiffre n’est pas le même que la surface écrite dans un bail (la loi Boutin), ni que celle du DPE. Trois chiffres différents pour le même logement, c’est normal : ils ne servent pas à la même chose.',
      'Les caves, les garages, les balcons et les terrasses ne comptent pas.'
    ],
    aFaire: [
      'Si la superficie réelle est inférieure de plus de 5 % à celle annoncée à l’acte, l’acquéreur peut demander une réduction du prix au prorata, dans l’année qui suit la vente.',
      'Le mesurage n’a pas de durée de validité tant que le logement n’est pas modifié.'
    ],
    schema: null,
    pages: plage
  };
}

export function analyserAssainissement(lignes: string[], plage: [number, number]): Diagnostic {
  const texte = lignes.join(' ');

  // Deux missions très différentes portent ce nom : le contrôle du raccordement
  // au tout-à-l'égout, et le contrôle d'une installation autonome (fosse). Le
  // vocabulaire du rapport les distingue.
  const collectif = /eaux us[ée]es se d[ée]versent dans le r[ée]seau d'assainissement collectif/i.test(texte);
  const autonome = /assainissement non collectif|\bSPANC\b|fosse (?:septique|toutes eaux)|[ée]pandage/i.test(texte);
  const pluvialesMelees = /eaux pluviales[^.]{0,120}identique aux eaux us[ée]es/i.test(texte);
  const nonConforme = /non[- ]conform/i.test(texte);

  const faits: Fait[] = [];
  if (collectif) faits.push({ libelle: 'Raccordement', valeur: 'réseau collectif' });
  if (pluvialesMelees)
    faits.push({
      libelle: 'Eaux pluviales',
      valeur: 'même réseau',
      precision: 'réseau dit unitaire'
    });

  let verdict = 'Un contrôle d’assainissement figure au dossier.';
  let gravite: Gravite = 'neutre';
  if (nonConforme) {
    verdict = 'L’installation d’assainissement a été jugée non conforme.';
    gravite = 'attention';
  } else if (collectif) {
    verdict = 'Le logement est raccordé au réseau d’assainissement collectif de la commune.';
    gravite = 'bon';
  } else if (autonome) {
    verdict = 'Le logement dispose d’une installation d’assainissement autonome.';
    gravite = 'neutre';
  }

  return {
    type: 'assainissement',
    titre: collectif && !autonome ? 'Raccordement à l’assainissement' : 'Assainissement',
    verdict,
    gravite,
    faits,
    explication: collectif
      ? [
          'Ce contrôle vérifie où partent les eaux du logement : les eaux usées (cuisine, salle de bains, WC) doivent rejoindre le réseau collectif de la commune, le tout-à-l’égout.',
          pluvialesMelees
            ? 'Ici, les eaux de pluie rejoignent le même réseau que les eaux usées : c’est ce qu’on appelle un réseau unitaire, courant dans les centres anciens. Ce n’est pas un défaut du logement, mais certaines communes imposent de séparer les deux lors de travaux.'
            : 'Les eaux de pluie, elles, suivent normalement un circuit distinct.',
          'Un raccordement absent ou mal fait est à la charge du propriétaire, et la commune peut l’imposer sous astreinte.'
        ]
      : [
          'Ce contrôle concerne les logements non raccordés au tout-à-l’égout : fosse, filtre, épandage. Il est réalisé par le service public d’assainissement non collectif (SPANC) de la commune.',
          'Il vérifie que les eaux usées sont bien collectées et traitées sans danger pour la santé ni pour l’environnement.'
        ],
    aFaire: nonConforme
      ? [
          'L’acquéreur dispose d’un an après la signature pour réaliser les travaux de mise en conformité. C’est un point de négociation classique.',
          'Le coût d’une réhabilitation complète se chiffre couramment en milliers d’euros : demandez un devis avant de vous engager.'
        ]
      : ['Validité : trois ans pour un contrôle d’installation autonome.'],
    schema: null,
    pages: plage
  };
}
