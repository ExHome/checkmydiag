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
import { dateDuRapport } from './dateRapport';

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
    /* Deux formulations courantes : « risque sismique (niveau 3) » dans les
       modèles anciens, « zone de sismicité de niveau 3 » dans les récents. La
       seconde n'était pas reconnue, et le risque disparaissait du verdict. */
    positif: /risque sismique \(niveau (\d)[^)]*\)|zone de sismicit[ée](?:[^.]{0,20}niveau)?\s*(\d)/i,
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
  /*
   * Le filtre ne connaissait que « le bien se situe / ne se situe pas ».
   *
   * Les rapports écrivent aussi « l'immeuble », « la parcelle », « le terrain »,
   * et énoncent la sismicité ou le potentiel radon sans nommer le bien du tout.
   * Ces lignes-là étaient écartées, et le diagnostic ressortait « aucun risque »
   * alors que le document en portait.
   */
  const affirmations = lignes.filter((l) =>
    /(?:le bien|l['’]immeuble|la parcelle|le terrain|le logement) (?:se situe|ne se situe|est |n['’]est )|est ainsi concern[ée]|^\s*-\s*le risque|^le risque|la commune dans laquelle|zone de sismicit[ée]|potentiel radon|zone [àa] potentiel/i.test(
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
  /*
   * La date passe par la fonction commune.
   *
   * Le motif d'ici cherchait « établi », « délivré » ou « date » suivis d'un
   * jour. Aucun des trois n'apparaît dans la forme réelle de l'état des
   * risques — « Document réalisé le : … » — et huit volets sur dix repartaient
   * sans date. Or l'ERP ne vaut que six mois : c'est le diagnostic où
   * l'oubli coûte le plus cher.
   *
   * Le motif attrapait en revanche les dates d'approbation des plans de
   * prévention, dont le volet est rempli. `dateDuRapport` les écarte.
   */
  const date = dateDuRapport(lignes);
  if (date) faits.push({ libelle: 'Établi le', valeur: date });

  return {
    type: 'erp',
    titre: 'Risques et pollutions (ERP)',
    /*
     * Rien de reconnu ne veut pas dire aucun risque.
     *
     * Les cases du formulaire sont des images : le moteur ne lit que les
     * phrases rédigées. Quand aucune n'est reconnue, il n'a rien lu — et
     * répondre « aucun risque majeur recensé » revenait à rassurer sur un
     * document qu'on n'avait pas ouvert. On renvoie donc au tableau du rapport
     * et à Géorisques, la base officielle dont l'état des risques est tiré.
     */
    verdict: risques.length
      ? concernes.length
        ? `Le bien est concerné par : ${concernes.map((r) => r.nom.toLowerCase() + (r.detail ? ` (${r.detail})` : '')).join(', ')}.`
        : 'Aucun risque majeur recensé pour ce bien dans les documents consultés.'
      : 'Nous n’avons pas réussi à lire la liste des risques de ce document. Cela ne veut pas dire qu’il n’y en a pas : reportez-vous au tableau de votre état des risques, et vérifiez votre adresse sur Géorisques.',
    gravite: !risques.length
      ? 'neutre'
      : alertes.length
        ? 'alerte'
        : concernes.length
          ? 'attention'
          : 'bon',
    faits,
    analogie:
      'L’argile, c’est une éponge. Quand il pleut, elle gonfle. Quand il fait sec, elle rétrécit. Et votre maison est posée dessus : elle suit le mouvement, et les murs finissent par se fissurer.',
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
    ...(date ? { date } : {})
  };
}

/**
 * De quel mesurage il s'agit — et ce ne sont pas les mêmes règles.
 *
 * La loi Carrez donne la superficie privative d'un lot de copropriété, et elle
 * est due à la **vente**. La loi Boutin donne la surface habitable, et elle est
 * due à la **location**. Les deux ne comptent pas la même chose : les combles
 * non aménagés, greniers et vérandas de plus d'1,80 m entrent dans la Carrez et
 * pas dans la Boutin, si bien que le premier chiffre dépasse souvent le second.
 *
 * L'extracteur les confondait : il cherchait « superficie privative » ou
 * « surface habitable » indifféremment et titrait toujours « loi Carrez ». Sur
 * les vingt-neuf dossiers du corpus qui portent une attestation de surface
 * habitable, on annonçait donc au lecteur la pièce exigée pour vendre alors
 * qu'il tenait celle exigée pour louer.
 */
function loiDuMesurage(lignes: string[]): 'carrez' | 'boutin' | null {
  const texte = lignes.join(' ');
  if (/loi\s*carrez|superficie\s+privative|article\s*46\s+de\s+la\s+loi/i.test(texte)) {
    return 'carrez';
  }
  if (/loi\s*boutin|surface\s+habitable/i.test(texte)) return 'boutin';
  return null;
}

export function analyserCarrez(lignes: string[], plage: [number, number]): Diagnostic {
  const loi = loiDuMesurage(lignes);

  const m =
    trouver(lignes, /superficie\s+(?:loi\s+)?carrez\s+totale\s*:?[\s.]*([\d\s.,]+)\s*m/i) ??
    trouver(lignes, /surface\s+(?:loi\s+)?carrez\s+totale\s*:?[\s.]*([\d\s.,]+)\s*m/i) ??
    trouver(lignes, /superficie\s+privative\s*(?:totale)?\s*:?[\s.]*([\d\s.,]+)\s*m/i) ??
    // « Surface habitable totale : 86,82 m² », la forme la plus fréquente du
    // corpus, que les motifs précédents laissaient passer.
    trouver(lignes, /surface\s+habitable\s+(?:totale|du logement)\s*:?[\s.]*([\d\s.,]+)\s*m/i) ??
    trouver(lignes, /superficie\s+(?:totale|habitable)\s*:?[\s.]*([\d\s.,]+)\s*m/i) ??
    trouver(lignes, /surface\s+habitable\s*:?[\s.]*([\d\s.,]+)\s*m/i) ??
    trouver(lignes, /surface\s+(?:loi\s+)?carrez\s*:?[\s.]*([\d\s.,]+)\s*m/i);
  const surface = nombre(m?.[1]);

  const auSol = nombre(trouver(lignes, /surface au sol totale\s*:?[\s.]*([\d\s.,]+)\s*m/i)?.[1]);

  const fr = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

  /* Chaque loi a son vocabulaire : on emploie celui du document qu'on lit. */
  const boutin = loi === 'boutin';
  const nomSurface = boutin ? 'Surface habitable' : 'Superficie privative';

  const faits: Fait[] = [];
  if (surface !== null) faits.push({ libelle: nomSurface, valeur: `${fr(surface)} m²` });

  /*
   * Le mesurage porte sa date, comme tout rapport — et ce module ne la
   * cherchait pas du tout : cent pour cent des attestations repartaient sans.
   *
   * Une superficie Carrez n'a pas de durée de validité, ce qui rend l'oubli
   * moins spectaculaire qu'ailleurs. Mais sa date sert aux contrôles de
   * cohérence entre rapports du même dossier : deux mesurages à un an
   * d'intervalle qui ne donnent pas la même surface, c'est une question à
   * poser avant de signer.
   */
  const date = dateDuRapport(lignes);
  if (auSol !== null)
    faits.push({
      libelle: 'Surface au sol',
      valeur: `${fr(auSol)} m²`,
      precision: 'avant déduction des murs et des hauteurs sous 1,80 m'
    });

  return {
    type: 'carrez',
    titre: boutin ? 'Surface habitable (loi Boutin)' : 'Superficie (loi Carrez)',
    verdict:
      surface !== null
        ? `${nomSurface} mesurée : ${fr(surface)} m²${auSol !== null ? ` (${fr(auSol)} m² au sol)` : ''}.`
        : 'Un mesurage est présent dans le dossier, mais la surface n’a pas pu être lue.',
    gravite: surface !== null ? 'bon' : 'neutre',
    faits,
    analogie:
      '1,80 m, c’est la hauteur sous laquelle vous ne tenez pas debout. La loi considère que cette surface-là ne compte pas. Voilà pourquoi votre logement paraît plus petit sur le papier que dans la réalité.',
    explication: boutin
      ? [
          // Le document lu est une attestation de surface habitable : on parle
          // de location, et on prévient que ce n'est pas la pièce d'une vente.
          'La loi Boutin donne la surface habitable, et elle est due au locataire : elle s’écrit dans le bail.',
          'Pour vendre un lot en copropriété, c’est un autre mesurage qui est exigé — la superficie privative, dite loi Carrez. Elle est en général plus grande : elle compte les combles non aménagés, les greniers et les vérandas de plus d’1,80 m, que la surface habitable écarte.',
          'Ce chiffre diffère aussi de celui du DPE. Plusieurs mesures pour un même logement, c’est normal : elles ne servent pas à la même chose.'
        ]
      : [
          // Attention au raccourci : la loi Carrez ne vise pas « les logements »
          // mais tout lot de copropriété, quel que soit son usage — un bureau, un
          // local commercial y sont soumis. Ce que la loi écarte, ce sont les
          // caves, garages, parkings et les lots de moins de 8 m².
          'La loi Carrez s’applique à la vente d’un lot en copropriété, quel qu’en soit l’usage : logement, bureau ou local commercial.',
          'Ce chiffre diffère de la loi Boutin et de celui du DPE. Trois mesures pour un même logement, c’est normal : elles ne servent pas à la même chose.',
          'Les caves, les garages, les balcons et les terrasses ne comptent pas.'
        ],
    aFaire: boutin
      ? [
          'Une surface habitable inférieure de plus d’un vingtième à celle du bail permet au locataire de demander une diminution du loyer.',
          'Si vous vendez, ce document ne suffit pas : demandez un mesurage loi Carrez.'
        ]
      : [
          'Si la superficie réelle est inférieure de plus de 5 % à celle annoncée à l’acte, l’acquéreur peut demander une réduction du prix au prorata, dans l’année qui suit la vente.',
          'Le mesurage n’a pas de durée de validité tant que le logement n’est pas modifié.'
        ],
    schema: null,
    pages: plage,
    ...(date ? { date } : {})
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
  /*
   * Le rappel légal n'est pas un constat.
   *
   * Presque tous les rapports du SPANC — y compris ceux qui concluent à la
   * conformité — recopient l'article L. 1331-11-1 : « en cas de non-conformité,
   * les travaux sont réalisés dans un délai d'un an après l'acte de vente ». La
   * recherche brute de « non conform » attrapait ce rappel et mettait en alerte
   * une installation validée. On écarte donc d'abord les tournures
   * conditionnelles, puis on n'accepte qu'une conclusion portant sur
   * l'installation elle-même.
   */
  const sansRappelLegal = texte.replace(
    /(?:en cas de|lorsqu[e’']|si)\s+(?:l[e’']\s*)?(?:installation|dispositif)?[^.]{0,120}non[- ]conform[^.]*\./gi,
    ' '
  );
  const nonConforme = /(?:avis|conclusion|installation|dispositif)[^.]{0,80}non[- ]conform/i.test(
    sansRappelLegal
  );
  const conforme =
    /(?:avis|conclusion|installation|dispositif)[^.]{0,80}\bconforme\b/i.test(sansRappelLegal) &&
    !nonConforme;

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
  } else if (conforme) {
    // Cette branche n'existait pas : un avis de conformité explicite tombait
    // dans le cas général et se lisait comme une absence de conclusion.
    verdict = 'L’installation d’assainissement a été jugée conforme.';
    gravite = 'bon';
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
    analogie:
      'Vos eaux usées partent forcément quelque part : soit dans le tout-à-l’égout de la commune, soit dans une installation à vous, enterrée dans le jardin. Ce contrôle dit laquelle des deux, et si elle fait son travail.',
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
