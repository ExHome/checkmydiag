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
  /** Comment nommer ce que le motif a capturé. Par défaut : « niveau X ». */
  detail?: (m: RegExpMatchArray) => string | undefined;
}

const DETECTEURS: Detecteur[] = [
  {
    nom: 'Retrait-gonflement des argiles',
    /*
     * Le risque n°1 en Gironde, et le moteur le ratait neuf fois sur dix.
     *
     * Mesuré sur 140 dossiers : 73 déclarent le bien concerné, le verdict n'en
     * annonçait que 6. Le motif ne connaissait qu'une seule des trois formes du
     * document — « zone d'exposition moyenne » —, avec l'apostrophe droite et
     * le tiret collé. Or la forme DOMINANTE, présente dans les 73, est la ligne
     * du tableau de synthèse :
     *
     *   Zonage du retrait-gonflement des argiles   Oui   Aléa Moyen
     *
     * Elle ne ressemble pas à une phrase, elle ne nomme pas le bien, et le
     * filtre des affirmations la jetait avant même le détecteur.
     *
     * Les trois formes sont ici, avec les deux apostrophes et le tiret libre.
     */
    positif:
      /Zonage du retrait[\s-]*gonflement des argiles\s+Oui(?:\s+Al[ée]a\s+(Faible|Moyen|Fort))?|zone d['’]exposition (forte|moyenne)[^.]{0,60}retrait|zone r[ée]glement[ée]e du risque retrait[\s-]*gonflement/i,
    negatif:
      /Zonage du retrait[\s-]*gonflement des argiles\s+Non|(?:pas|non) (?:concern[ée]|situ[ée])[^.]{0,40}retrait[\s-]*gonflement/i,
    niveau: 'attention',
    /* L'aléa, quand le tableau le donne : c'est lui qui décide de l'obligation
       d'étude de sol, à partir du niveau moyen. */
    detail: (m) => {
      const alea = m[1] ?? m[2];
      return alea ? `aléa ${alea.toLowerCase()}` : undefined;
    }
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
  /*
   * Les lignes de TABLEAU affirment, elles aussi.
   *
   * Le filtre ne gardait que des phrases — « le bien se situe… ». Or le tableau
   * de synthèse porte ses conclusions sous forme de colonnes : « Zonage du
   * retrait-gonflement des argiles | Oui | Aléa Moyen ». Aucun verbe, aucun
   * sujet nommé, et pourtant c'est là que 73 dossiers sur 140 déclarent le
   * risque le plus fréquent de la région. On les laisse passer nommément :
   * ouvrir le filtre en grand ferait rentrer le formulaire vierge, dont les
   * cases sont des images.
   */
  /*
   * L'imprimé officiel affirme, lui aussi — mais sa réponse est une croix.
   *
   * « L'immeuble est situé dans le périmètre d'un PPRt approuvé  oui non x »
   * commence exactement comme une affirmation sur le bien, et l'intitulé de
   * rubrique « … au regard de plans de prévention des risques technologiques
   * [PPRt] » est imprimé dans TOUS les états des risques. Résultat mesuré :
   * quarante-neuf volets sur soixante-trois annonçaient un risque
   * technologique, et pas un seul dossier ne portait de PPRt concerné.
   *
   * C'est le piège du catalogue, une fois de plus : un formulaire vierge n'est
   * pas un constat. Et la croix ne peut pas trancher — sa place a changé entre
   * deux millésimes du même éditeur (voir le carnet, § 30).
   *
   * Ce qui affirme vraiment reste lu : les conclusions rédigées (« le BIEN est
   * ainsi concerné par : - Le risque Inondation… ») et les lignes du tableau de
   * synthèse.
   */
  const FORMULAIRE_PPR =
    /est situ[ée]e? (?:dans|en)[^.]{0,60}(?:p[ée]rim[èe]tre d'un PPR|secteur d'expropriation|zone de prescription|secteur d'information sur les sols)|se situe dans une zone [àa] potentiel radon|est situ[ée]e? dans une commune de sismicit[ée]|risques (?:naturels|miniers|technologiques) pris en compte|est concern[ée] par des prescriptions de travaux dans le r[èe]glement/i;

  /*
   * Et la marque générale du formulaire : il propose au lieu d'affirmer.
   *
   * Deux formes le trahissent, quel que soit le risque et quel que soit
   * l'éditeur — les deux réponses côte à côte (« oui non »), et l'échelle
   * énumérée en entier (« zone 5 zone 4 zone 3 zone 2 zone 1 »). Une phrase qui
   * affirme ne fait ni l'un ni l'autre.
   *
   * C'est ce qui restait après le PPRt : « L'immeuble est situé dans un Secteur
   * d'Information sur les Sols (SIS) oui non x » faisait annoncer une pollution
   * des sols à des biens que le tableau déclare non concernés.
   */
  const PROPOSE_AU_LIEU_D_AFFIRMER = /oui\s*\W{0,4}\s*non|(?:zone\s*\d.{0,12}){3,}/i;

  const affirmations = lignes.filter((l) =>
    !FORMULAIRE_PPR.test(l) &&
    !PROPOSE_AU_LIEU_D_AFFIRMER.test(l) &&
    /(?:le bien|l['’]immeuble|la parcelle|le terrain|le logement) (?:se situe|ne se situe|est |n['’]est )|est ainsi concern[ée]|^\s*-\s*le risque|^le risque|la commune dans laquelle|zone de sismicit[ée]|potentiel radon|zone [àa] potentiel|Zonage du retrait[\s-]*gonflement|zone r[ée]glement[ée]e du risque/i.test(
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
      const detail = d.detail ? d.detail(m) : m[1] ? `niveau ${m[1]}` : undefined;
      if (detail) risque.detail = detail;
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

  /*
   * Les rubriques que le vendeur doit remplir lui-même.
   *
   * Elles ne relèvent pas du diagnostiqueur, et personne ne prévient le
   * vendeur qu'elles existent. Les signaler ici est l'un des rares endroits où
   * ce produit apporte quelque chose que le rapport ne dit pas.
   */
  const vendeur = champsDuVendeur(lignes);

  /*
   * Le second tableau, informatif mais concret. Il ne rejoint pas le verdict —
   * voir `risquesComplementaires` — mais il vaut d'être dit.
   */
  const complements = risquesComplementaires(lignes);
  const releves: NonNullable<Diagnostic['releves']> = [];
  if (complements.nappe?.concernee) {
    releves.push({
      genre: 'complement',
      libelle:
        'Un second tableau, plus loin dans le document et donné à titre informatif, classe le terrain en zone potentiellement sujette aux inondations de cave par remontée de nappe. Si le logement a une cave ou un sous-sol, c’est la ligne à retenir : elle ne se voit pas lors d’une visite en été.' +
        (complements.nappe.fiabiliteDeLaCarte
          ? ` La mention « fiabilité ${complements.nappe.fiabiliteDeLaCarte} » qualifie la carte, pas le danger : elle dit que la donnée est sûre, pas que le risque est élevé.`
          : '')
    });
  }
  /*
   * Les arrêtés sécheresse donnent sa chair au classement en argile. On ne les
   * dit que si le bien est effectivement en zone d'argile : ailleurs, ce serait
   * un chiffre inquiétant sans objet.
   */
  const catnat = arretesCatnat(lignes);
  const enZoneArgile = concernes.some((r) => r.nom.startsWith('Retrait-gonflement'));
  if (catnat && catnat.secheresse >= 3 && enZoneArgile) {
    releves.push({
      genre: 'complement',
      libelle:
        `« Zone d’argile » reste abstrait tant qu’on ne l’a pas mis en face de ceci : la commune a été reconnue ${catnat.secheresse} fois en état de catastrophe naturelle pour sécheresse et tassements différentiels` +
        (catnat.derniereSecheresse ? `, la dernière fois en ${catnat.derniereSecheresse}` : '') +
        '. Le tableau est dans votre état des risques. Attention : ces arrêtés concernent la commune, pas ce logement — ils ouvrent un droit à indemnisation à qui a subi un dommage, ils ne disent pas que cette maison en a subi un.'
    });
  }

  if (complements.icpe) {
    releves.push({
      genre: 'complement',
      libelle: `Le même tableau signale une ou plusieurs installations industrielles classées dans un rayon de ${complements.icpe} mètres. Cela ne veut pas dire qu’il y a un danger, mais que ces installations sont recensées et surveillées : la liste est consultable sur Géorisques.`
    });
  }

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
    ...(vendeur.argiles || vendeur.sinistres || releves.length
      ? {
          releves: [
            ...releves,
            ...(vendeur.sinistres
              ? [
                  {
                    genre: 'complement' as const,
                    libelle:
                      'La colonne « Indemnisé » du tableau des catastrophes naturelles est à remplir par le vendeur : vérifiez qu’elle l’a été sur votre exemplaire.'
                  }
                ]
              : []),
            ...(vendeur.argiles
              ? [
                  {
                    genre: 'complement' as const,
                    libelle:
                      'Argiles : si le logement a subi des fissures indemnisées et non réparées, le vendeur doit joindre la liste des travaux restant à faire (article R125-24 du code de l’environnement). La case correspondante est à cocher par lui.'
                  }
                ]
              : [])
          ]
        }
      : {}),
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

  /*
   * Les pièces qui ne comptent pas, nommées.
   *
   * L'écart entre les deux totaux n'est pas une subtilité de calcul : ce sont
   * des pièces entières — une cave, une terrasse, une buanderie — qui existent,
   * se visitent, et ne figurent pas dans la superficie vendue. Le tableau du
   * rapport les liste ; personne ne le lit.
   */
  const pieces = piecesMesurees(lignes);
  const horsCompte = pieces.filter((p) => p.privative === 0);
  const perdus = horsCompte.reduce((n, p) => n + p.auSol, 0);

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

  if (horsCompte.length && perdus > 0) {
    faits.push({
      libelle: 'Pièces hors superficie',
      valeur: `${fr(Math.round(perdus * 100) / 100)} m²`,
      precision: horsCompte
        .map((p) => p.nom.replace(/^.*?-\s*/, ''))
        .slice(0, 6)
        .join(', ')
    });
  }

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

/**
 * Ce que le VENDEUR doit remplir dans l'état des risques, et qui reste vide.
 *
 * Trois champs du formulaire ne relèvent pas du diagnostiqueur : la loi les
 * confie au vendeur, qui ignore le plus souvent qu'ils existent. Ils sont donc
 * livrés vierges, et le dossier est incomplet sans que personne ne le voie.
 *
 * ── Pourquoi cela compte plus qu'il n'y paraît ──────────────────────────────
 *
 * Le plus lourd des trois est celui des argiles. L'article R125-24 du code de
 * l'environnement impose au vendeur, si le bien a subi des désordres liés à la
 * sécheresse — indemnisés mais non réparés —, de joindre à l'état des risques
 * la liste des travaux restant à faire. Deux cases, « Oui » et « Non ». Quand
 * aucune n'est cochée, l'obligation n'est ni assumée ni écartée.
 *
 * Sur le dossier qui a servi à écrire ceci, le bien est en aléa Fort pour le
 * retrait-gonflement des argiles, dans une commune reconnue treize fois en
 * catastrophe naturelle sécheresse depuis 1989. C'est exactement le cas où
 * cette case compte.
 *
 * ── Ce qu'on affirme, et ce qu'on n'affirme pas ─────────────────────────────
 *
 * On ne dit jamais « le vendeur a oublié » : la case peut avoir été cochée à la
 * main sur le papier signé, et une coche manuscrite ne sort pas d'un PDF. On
 * dit que la rubrique existe et qu'aucune réponse n'est lisible — au lecteur
 * d'aller vérifier sur son exemplaire.
 */
export interface ChampsDuVendeur {
  /** La rubrique « travaux non réalisés » des argiles est présente. */
  argiles: boolean;
  /** Le tableau des arrêtés CATNAT, avec sa colonne « Indemnisé ». */
  sinistres: boolean;
}

export function champsDuVendeur(lignes: string[]): ChampsDuVendeur {
  const texte = lignes.join(' ');

  return {
    argiles: /Information relative aux travaux non r[ée]alis[ée]s/i.test(texte),
    /* La consigne s'adresse au lecteur : « cochez ci-dessous la case ». Elle
       n'apparaît que si le tableau des sinistres est là. */
    sinistres: /cochez[^.]{0,40}case correspondante[^.]{0,40}Indemnis/i.test(texte)
  };
}

/**
 * Le SECOND tableau de l'état des risques — celui que personne ne lit.
 *
 * L'imprimé officiel tient sur une page : PPRn, PPRm, PPRt, sismicité, radon,
 * SIS. C'est ce que la loi impose, et c'est ce qu'un lecteur attentif finit par
 * parcourir. Le générateur ajoute derrière un tableau « Etat des risques
 * complémentaires (Géorisques) », marqué « à titre informatif » — et ce tableau
 * porte des lignes autrement plus concrètes que le zonage sismique.
 *
 * Mesuré sur 140 dossiers du corpus : 68 % le contiennent, et sur ceux-là la
 * remontée de nappe est cochée « oui » dans 80 cas sur 83. Un dossier sur sept
 * réunit cette ligne ET une cave au logement.
 *
 * ── Le piège de lecture ────────────────────────────────────────────────────
 *
 * La phrase est : « Zones potentiellement sujettes aux inondations de cave,
 * fiabilité FORTE (dans un rayon de 500 mètres). » Le mot FORTE qualifie la
 * CARTE, pas le danger : il dit que la donnée est sûre, pas que le risque est
 * élevé. Écrire « risque de remontée de nappe : fort » serait un contresens —
 * exactement le genre de raccourci que ce produit ne doit jamais prendre.
 *
 * ── Ce qu'on en fait ───────────────────────────────────────────────────────
 *
 * Un complément, jamais un risque du verdict. Le verdict énonce ce que le
 * document oppose légalement à l'acheteur ; ces lignes-ci sont informatives, et
 * les mélanger reviendrait à durcir un état des risques de sa propre autorité.
 */
export interface RisquesComplementaires {
  /** La ligne « Remontées de nappes », si elle porte une réponse lisible. */
  nappe: { concernee: boolean; fiabiliteDeLaCarte: string | null } | null;
  /** Rayon, en mètres, dans lequel des installations classées sont recensées. */
  icpe: number | null;
}

export function risquesComplementaires(lignes: string[]): RisquesComplementaires {
  const nappe = ligneNappe(lignes);
  const icpe = lignes.join(' ').match(/rayon de (\d+)\s*m[èe]tres d['’]une ou plusieurs/i);

  return {
    nappe,
    icpe: icpe?.[1] ? Number(icpe[1]) : null
  };
}

/**
 * La ligne de la nappe, lue sur cinq lignes.
 *
 * Les colonnes du tableau sortent entrelacées du PDF : le détail arrive avant
 * le nom du risque, et la valeur deux lignes plus bas.
 *
 *   Zones potentiellement sujettes aux inondations de cave, fiabilité
 *   Remontées de nappes Oui
 *   FORTE (dans un rayon de 500 mètres).
 *
 * Chercher « fiabilité FORTE » à la suite ne trouvait qu'un cas sur huit.
 */
function ligneNappe(lignes: string[]): { concernee: boolean; fiabiliteDeLaCarte: string | null } | null {
  for (let i = 0; i < lignes.length; i++) {
    if (!/Remont[ée]es? de nappes?/i.test(lignes[i] ?? '')) continue;
    const fenetre = lignes.slice(i, i + 5).join(' ');
    const concernee = /\bOui\b/.test(fenetre) ? true : /\bNon\b/.test(fenetre) ? false : null;
    if (concernee === null) continue;
    const f = fenetre.match(/\b(FORTE|MOYENNE|FAIBLE)\b\s*\(dans un rayon/i);
    return { concernee, fiabiliteDeLaCarte: f?.[1] ? f[1].toLowerCase() : null };
  }
  return null;
}

/**
 * Ce que le classement en zone d'argile veut dire concrètement.
 *
 * L'état des risques annonce « retrait-gonflement des argiles : aléa moyen ».
 * Le lecteur n'en tire rien : c'est une couleur sur une carte. Trois pages plus
 * loin, le même document liste les arrêtés de catastrophe naturelle pris sur la
 * commune — et sur les communes girondines du corpus, la moitié de ces arrêtés
 * porte la mention « Sécheresse et réhydratation - Tassements différentiels ».
 *
 * Mesuré sur 140 dossiers : 94 portent ce tableau, avec en moyenne 16 arrêtés
 * sécheresse et jusqu'à 23. Ce n'est plus une couleur sur une carte : c'est le
 * nombre de fois où l'État a reconnu que des maisons de cette commune s'étaient
 * fissurées à cause du sol.
 *
 * ── Ce que ce compte ne dit PAS ────────────────────────────────────────────
 *
 * Il porte sur la COMMUNE, jamais sur le bien. Un arrêté ouvre le droit à
 * indemnisation à ceux qui ont subi un dommage ; il ne dit pas que cette maison
 * en a subi un. L'explication doit tenir les deux bouts, sans quoi elle
 * inquiète pour rien.
 */
export interface ArretesCatnat {
  total: number;
  secheresse: number;
  inondation: number;
  /** L'année du dernier épisode de sécheresse reconnu, si elle est lisible. */
  derniereSecheresse: number | null;
}

export function arretesCatnat(lignes: string[]): ArretesCatnat | null {
  const debut = lignes.findIndex((l) => /Arr[êe]t[ée]s CATNAT sur la commune/i.test(l));
  if (debut < 0) return null;
  /* Le tableau s'arrête au renvoi vers Géorisques, ou au bloc préfecture. */
  let fin = lignes.length;
  for (let i = debut + 1; i < lignes.length; i++) {
    if (/Pour en savoir plus|^\s*Pr[ée]fecture\s*:/i.test(lignes[i] ?? '')) {
      fin = i;
      break;
    }
  }

  const corps = lignes.slice(debut + 1, fin);
  let total = 0;
  let secheresse = 0;
  let inondation = 0;
  let derniereSecheresse: number | null = null;

  for (const l of corps) {
    /* Une ligne d'arrêté porte un intitulé de risque. Les dates peuvent être
       rejetées sur la ligne suivante quand l'intitulé est long — on compte donc
       sur l'intitulé, jamais sur la présence des dates. */
    const estSecheresse = /S[ée]cheresse et r[ée]hydratation/i.test(l);
    const estInondation = /d[ée]bordement de cours d'eau|ruissellement et coul[ée]e de boue|submersion marine/i.test(l);
    if (!estSecheresse && !estInondation && !/Temp[êe]te|Glissement de terrain|Mouvement de terrain|Avalanche|S[ée]isme/i.test(l))
      continue;
    total++;
    if (estSecheresse) {
      secheresse++;
      const an = l.match(/\d{1,2}\/\d{1,2}\/(\d{4})/);
      if (an?.[1]) {
        const annee = Number(an[1]);
        if (derniereSecheresse === null || annee > derniereSecheresse) derniereSecheresse = annee;
      }
    }
    if (estInondation) inondation++;
  }

  return total ? { total, secheresse, inondation, derniereSecheresse } : null;
}

/** Une pièce du tableau de mesurage. */
export interface PieceMesuree {
  nom: string;
  /** Ce qui compte au sens de la loi, en m². */
  privative: number;
  /** Ce que la pièce fait réellement au sol, en m². */
  auSol: number;
}

/**
 * Le tableau pièce par pièce du certificat de superficie.
 *
 * C'est la partie du rapport qui explique l'écart entre les deux chiffres
 * affichés — « Surface loi Carrez totale » et « Surface au sol totale » —, et
 * elle est la seule à le faire.
 *
 * ── Pourquoi cela vaut d'être lu ────────────────────────────────────────────
 *
 * Sur le dossier qui a servi à écrire ceci : 189,82 m² au sens Carrez pour
 * 236,66 m² au sol. Quarante-sept mètres carrés d'écart, soit un cinquième du
 * bien — et le tableau dit exactement lesquels : la cave, la terrasse, la
 * buanderie, l'atelier, la chaufferie. Chacune de ces pièces existe, se
 * visite, et ne compte pas.
 *
 * Un acheteur qui lit « 189,82 m² » et visite un bien qui en paraît beaucoup
 * plus n'a aucun moyen de comprendre l'écart sans ce tableau. C'est
 * précisément ce que le produit doit lui rendre.
 *
 * ── La forme lue ───────────────────────────────────────────────────────────
 *
 *   Rez de jardin - Cave            0      16.18
 *   1er étage - Chambre 01      17.36      17.36
 *
 * Deux nombres en fin de ligne : le privatif, puis le sol. Une ligne dont le
 * privatif vaut zéro désigne une pièce qui ne compte pas.
 */
export function piecesMesurees(lignes: string[]): PieceMesuree[] {
  const pieces: PieceMesuree[] = [];

  for (const ligne of lignes) {
    /*
     * Un nom de pièce, puis deux nombres. Le nom commence par un niveau
     * (« Rez de chaussée », « 1er étage », « Sous-sol ») ou par un mot :
     * l'ancrage sur les deux nombres finaux suffit à écarter le reste du
     * rapport, où l'on ne trouve pas cette forme.
     */
    /*
     * Le nom PEUT contenir des chiffres — « 1er étage - Chambre 01 » — et ma
     * première version l'interdisait, ce qui écartait une pièce sur deux.
     * L'ancrage se fait donc sur les deux derniers nombres de la ligne, pas sur
     * la forme du nom.
     */
    const m = /^(.{3,60}?)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s*$/.exec(ligne.trim());
    if (!m) continue;

    const nom = (m[1] ?? '').replace(/\s+/g, ' ').trim();
    const privative = Number((m[2] ?? '').replace(',', '.'));
    const auSol = Number((m[3] ?? '').replace(',', '.'));

    /* Le total récapitulatif n'est pas une pièce, et les lignes d'en-tête non
       plus. Une pièce a un nom qui ne parle ni de surface ni de total. */
    if (/total|superficie|surface|sens Carrez|commentaire/i.test(nom)) continue;
    if (!Number.isFinite(privative) || !Number.isFinite(auSol)) continue;
    /* Au sol nul et privatif non nul n'a pas de sens : c'est une ligne mal
       découpée, pas un mesurage. */
    if (auSol <= 0) continue;

    pieces.push({ nom, privative, auSol });
  }

  return pieces;
}
