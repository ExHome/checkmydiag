/**
 * Installations intérieures d'électricité et de gaz.
 *
 * Ces deux diagnostics fonctionnent pareil : une liste de points de contrôle
 * normalisés, et une conclusion qui annonce le nombre d'anomalies. Le gaz ajoute
 * une gradation (A1, A2, DGI) qu'il faut absolument expliquer : « DGI » veut dire
 * que le distributeur peut couper le gaz le jour même.
 */
import type { Diagnostic, Fait, Gravite } from '../modele';
import { trouver, trouverToutes } from './texte';
import { anomaliesDetaillees, domainesConstates, releverTout } from './anomalies';
import {
  anomaliesDuTableau,
  catalogueDesDomaines,
  localisationsDe,
  porteUnTableauDAnomalies
} from './tableau-anomalies';
import { rubrique as rubriqueDe } from './rubriques';
import { dateFrancaise, OU_REFAIRE, reformesElectricite } from './reformes';

/** Thèmes de la norme XC 16-600, dans l'ordre où ils apparaissent au rapport. */
const THEMES_ELEC: { motif: RegExp; nom: string }[] = [
  { motif: /appareil g[ée]n[ée]ral de commande et de protection/i, nom: 'Coupure d’urgence' },
  { motif: /diff[ée]rentiel|protection diff[ée]rentielle/i, nom: 'Protection différentielle' },
  { motif: /prise de terre|installation de mise [aà] la terre/i, nom: 'Mise à la terre' },
  { motif: /surintensit[ée]|dispositif de protection contre les surintensit/i, nom: 'Protection des circuits' },
  { motif: /salle d'eau|liaison [ée]quipotentielle/i, nom: 'Salle d’eau' },
  { motif: /mat[ée]riels? (?:[ée]lectriques? )?(?:v[ée]tustes?|inadapt[ée]s?)|risque de contact direct/i, nom: 'Matériel vétuste ou dangereux' },
  { motif: /conducteurs? non prot[ée]g[ée]s?/i, nom: 'Conducteurs non protégés' }
];

/**
 * Conclusion d'un état d'installation.
 *
 * Piège : ces rapports contiennent une légende qui explique chaque cas de figure
 * (« si l'installation ne comporte aucune anomalie… », « DGI : danger grave et
 * immédiat… »). Chercher les mots-clés isolés fait donc conclure n'importe quoi.
 * On n'accepte que les formules de conclusion normalisées, en entier.
 */
interface Conclusion {
  etat: 'aucune' | 'anomalies' | 'inconnu';
  nombre: number | null;
}

function conclure(lignes: string[], sujet: RegExp): Conclusion {
  const chiffre =
    trouver(lignes, new RegExp(`${sujet.source}[^.]{0,40}comporte\\s*(\\d+)\\s*anomalie`, 'i')) ??
    trouver(lignes, /nombre (?:total )?d'anomalies?\s*(?:constat[ée]es?)?\s*:?\s*(\d+)/i);
  if (chiffre?.[1]) {
    const n = Number(chiffre[1]);
    return { etat: n > 0 ? 'anomalies' : 'aucune', nombre: n };
  }

  const aucune = trouver(
    lignes,
    new RegExp(`${sujet.source}[^.]{0,40}ne comporte (?:aucune anomalie|pas d'anomalie)`, 'i')
  );
  const presence = trouver(
    lignes,
    new RegExp(
      `${sujet.source}[^.]{0,40}comporte (?:une ou des anomalies|des anomalies|une anomalie)`,
      'i'
    )
  );

  // Le rapport imprime TOUTES les conclusions possibles et coche la bonne — or
  // la case cochée est une image. Quand les deux formulations contradictoires
  // sont présentes, le texte ne permet pas de trancher : on se tait, et la page
  // de synthèse du dossier prendra le relais.
  if (aucune && presence) return { etat: 'inconnu', nombre: null };
  if (aucune) return { etat: 'aucune', nombre: 0 };
  if (presence) return { etat: 'anomalies', nombre: null };

  return { etat: 'inconnu', nombre: null };
}

export function analyserElectricite(lignes: string[], plage: [number, number]): Diagnostic {
  const conclusion = conclure(lignes, /installation int[ée]rieure d'[ée]lectricit[ée]/);
  const releves = releverTout(lignes);
  const anomalies = releves.filter((r) => r.genre === 'anomalie');

  /*
   * Ce qui tranche, et ce qui ne tranche pas.
   *
   * La liste « Anomalies avérées selon les domaines suivants » ne tranche
   * RIEN : c'est le catalogue de l'arrêté, imprimé dans tous les rapports
   * (voir `estCatalogueDomaines`). Seuls les libellés « Libellé de l'anomalie :
   * B7.3 a … » constatent quelque chose — ils ne sont écrits que s'il y a
   * quelque chose à écrire.
   *
   * Quand rien ne constate, on se tait : la page de synthèse du dossier, elle,
   * écrit la conclusion en clair, et `depuisSynthese` la reprend.
   */
  const constates = domainesConstates(lignes);
  /*
   * Un point unique, compensé, ne fait pas basculer le verdict.
   *
   * Quatre rapports du corpus relèvent une seule anomalie — une broche de terre
   * non reliée — et précisent qu'elle « fait l'objet d'une mesure compensatoire
   * pour limiter le risque de choc électrique » : un différentiel 30 mA protège
   * l'ensemble. Leur page de synthèse conclut « ne comporte aucune anomalie ».
   *
   * Contredire le rapport serait présomptueux, le taire serait incomplet : on
   * suit sa conclusion, et le point compensé est dit dans les faits.
   */
  const nonCompenses = constates.filter((d) => !d.compense);

  /*
   * Les anomalies du tableau de la rubrique 5 — la seconde mise en page.
   *
   * `anomaliesDetaillees` lit une annexe « Libellé de l'anomalie : » que tous
   * les rapports n'ont pas. Neuf volets lus en entier portent les leurs dans le
   * tableau, et le produit n'en restituait alors aucune.
   */
  const duTableau = anomaliesDuTableau(lignes);

  /*
   * Le silence du tableau vaut conclusion — mais seulement là où il parle.
   *
   * La rubrique 5 imprime les deux conclusions opposées l'une sous l'autre, et
   * la case qui les départage est un graphique : le texte ne permet pas de
   * conclure, et les volets sains ressortaient « conclusion non lue ». Le
   * tableau, lui, ne s'imprime que s'il y a quelque chose à y mettre — mesuré
   * sur neuf volets, cinq sains sans tableau, quatre avec.
   *
   * On n'en tire une absence d'anomalie QUE si le catalogue des domaines est
   * imprimé : c'est lui qui atteste qu'on est bien devant cette mise en page.
   * Ailleurs, on continue de se taire plutôt que de conclure à tort.
   */
  const catalogueImprime = catalogueDesDomaines(lignes).length >= 5;

  let etat = conclusion.etat;
  if (etat === 'inconnu') {
    if (anomalies.length > 0 || nonCompenses.length > 0 || duTableau.length > 0) {
      etat = 'anomalies';
    } else if (catalogueImprime && !porteUnTableauDAnomalies(lignes)) {
      etat = 'aucune';
    }
  }

  const total =
    conclusion.nombre ?? (duTableau.length || anomalies.length || null);

  const groupes = THEMES_ELEC.map((t) => ({
    nom: t.nom,
    nombre: trouverToutes(lignes, t.motif).length
  })).filter((g) => g.nombre > 0);

  let gravite: Gravite = 'neutre';
  let verdict =
    'La conclusion est cochée à la main : un programme ne peut pas la lire. Elle est sur la page « Conclusion » du rapport.';

  /*
   * Ce que le diagnostiqueur n'a pas pu essayer.
   *
   * Quand l'installation n'était pas alimentée, les essais de déclenchement du
   * différentiel n'ont pas eu lieu — et c'est le seul organe du tableau qui
   * protège les personnes. Le rapport le dit dans sa rubrique 6 ; le produit
   * l'ignorait.
   */
  const nonVerifies = pointsNonVerifies(lignes);

  /*
   * Le différentiel non essayé change la portée de la conclusion.
   *
   * C'est le seul organe du tableau qui protège les PERSONNES : il coupe le
   * courant quand celui-ci passe par quelqu'un. Quand l'installation n'était
   * pas alimentée le jour de la visite, son déclenchement n'a pas pu être
   * essayé — et « aucune anomalie » ne veut alors pas dire qu'il fonctionne.
   */
  const differentielNonEssaye = nonVerifies.some((p) =>
    /d[ée]clenche|diff[ée]rentiel|bouton test/i.test(p.quoi)
  );

  if (etat === 'aucune') {
    if (differentielNonEssaye) {
      gravite = 'attention';
      verdict =
        'Aucune anomalie relevée — mais le déclenchement du différentiel n’a pas pu être essayé : l’installation n’était pas alimentée le jour de la visite.';
    } else {
      gravite = 'bon';
      verdict = 'L’installation électrique ne présente aucune anomalie.';
    }
  } else if (etat === 'anomalies') {
    gravite = total !== null && total >= 5 ? 'alerte' : 'attention';

    /*
     * Deux comptes à ne pas confondre, et c'est une question d'exactitude :
     * le rapport annonce parfois lui-même un nombre d'anomalies — on le cite
     * alors tel quel. Sinon, on ne dispose que des points qu'il énumère
     * (domaines et libellés), ce qui n'est pas la même chose : un domaine peut
     * en recouvrir plusieurs. On dit donc « points relevés », pas
     * « anomalies », plutôt que d'affirmer un chiffre que le rapport n'écrit
     * nulle part.
     */
    if (conclusion.nombre !== null) {
      verdict = `L’installation électrique présente ${conclusion.nombre} anomalie${conclusion.nombre > 1 ? 's' : ''}.`;
    } else if (anomalies.length > 0) {
      verdict = `L’installation électrique présente des anomalies : ${anomalies.length} point${anomalies.length > 1 ? 's' : ''} relevé${anomalies.length > 1 ? 's' : ''} dans le rapport.`;
    } else if (nonCompenses.length > 0) {
      verdict = `L’installation électrique présente des anomalies sur ${nonCompenses.length} des six domaines contrôlés.`;
    } else {
      verdict =
        'L’installation électrique présente des anomalies : le rapport recommande d’agir pour éliminer les dangers.';
    }
  }

  const faits: Fait[] = [];
  if (nonCompenses.length > 0) {
    /* « Lesquels » vaut mieux que « combien » : le lecteur sait alors si c'est
       la coupure d'urgence — qu'on manœuvre en cas d'incendie — ou la salle
       d'eau, et il peut demander le bon devis. */
    faits.push({
      libelle: 'Domaines en anomalie',
      valeur: String(nonCompenses.length),
      precision: nonCompenses.map((d) => d.nom).join(', ')
    });
  }
  const compenses = constates.filter((d) => d.compense);
  if (compenses.length > 0) {
    faits.push({
      libelle: 'Point relevé, mais compensé',
      valeur: compenses.map((d) => d.nom).join(', '),
      precision: 'le rapport signale une mesure compensatoire qui limite le risque'
    });
  }
  if (conclusion.nombre !== null) {
    faits.push({ libelle: 'Anomalies relevées', valeur: String(conclusion.nombre) });
  } else if (duTableau.length > 0 || anomalies.length > 0) {
    /* Le tableau de la rubrique 5 énumère plus finement que les domaines : on
       cite le plus complet des deux comptes, jamais le plus petit. */
    const compte = Math.max(duTableau.length, anomalies.length);
    faits.push({
      libelle: 'Points relevés',
      valeur: String(compte),
      precision:
        duTableau.length >= anomalies.length
          ? 'anomalies énumérées une à une par le rapport'
          : 'domaines et libellés énumérés par le rapport'
    });
  }
  /*
   * OÙ, et QUOI FAIRE — ce que le rapport écrit et que le produit taisait.
   *
   * La fiche annonçait « des anomalies : 1 point relevé dans le rapport », et
   * s'arrêtait là. Le tableau du § 5 dit pourtant la pièce et le geste :
   *
   *   « Faire intervenir un électricien qualifié afin de remplacer les
   *   matériels présentant des détériorations (Rez de chaussée -
   *   Entrée/séjour/cuisine) »
   *
   * Mesuré sur vingt-quatre volets porteurs d'une anomalie : la localisation
   * sortait zéro fois, le geste zéro fois. Un propriétaire apprenait qu'il
   * avait « un point », sans savoir lequel, ni où, ni qui appeler.
   */
  const detaillees = anomaliesDetaillees(lignes);
  /*
   * TOUTES les localisations, des deux mises en page.
   *
   * Le §10 de l'ordre de mission exige de conserver chacune ; le §32 fait un
   * blocage d'une seule gardée en silence. Les rapports en collent plusieurs
   * dans la même parenthèse, sans séparateur : elles sont séparées à la
   * lecture du tableau, pas ici.
   */
  const ou = [
    // L'annexe colle elle aussi ses pièces sans séparateur : elle passe par le
    // même séparateur que le tableau, sinon « 2ème étage - mezzanine2ème étage
    // - mezzanine1er étage - Entrée » ressortait tel quel, illisible.
    ...detaillees.flatMap((d) => (d.ou ? localisationsDe(`(${d.ou})`) : [])),
    ...duTableau.flatMap((a) => a.localisations)
  ];
  if (ou.length) {
    faits.push({
      libelle: 'Où',
      valeur: [...new Set(ou)].join(' · '),
      precision: 'localisation donnée par le rapport'
    });
  }
  const geste = detaillees.find((d) => d.geste)?.geste ?? duTableau.find((a) => a.geste)?.geste;
  if (geste) {
    faits.push({ libelle: 'Ce que le rapport demande', valeur: geste });
  }

  const date = trouver(lignes, /Date (?:du|de la) (?:rep[ée]rage|visite|diagnostic)\s*:?[\s.]*(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (date?.[1]) faits.push({ libelle: 'Date de la visite', valeur: date[1] });

  if (nonVerifies.length) {
    /* Le motif est le même pour tous les points d'un rapport : on le cite une
       fois, plutôt que de répéter dix lignes identiques. */
    const motif = nonVerifies[0]?.motif ?? '';
    faits.push({
      libelle: 'Points non vérifiés',
      valeur: String(nonVerifies.length),
      precision: motif
    });
  }

  return {
    type: 'electricite',
    titre: 'Installation électrique',
    verdict,
    gravite,
    faits,
    analogie:
      'Le différentiel, c’est un vigile à l’entrée : il compte le courant qui entre et celui qui ressort. S’il en manque — parce qu’il est passé par vous — il coupe tout, en une fraction de seconde.',
    explication: [
      'Ce diagnostic ne dit pas si l’installation est aux normes d’aujourd’hui. Il contrôle six points de sécurité, sur les installations qui ont plus de quinze ans.',
      'Une anomalie ne rend pas le logement inhabitable : elle signale un risque, décharge ou incendie. Les deux plus fréquentes : pas de différentiel, mise à la terre inefficace.',
      'Le diagnostiqueur ne démonte rien. Il ne peut donc rien dire de l’état des fils à l’intérieur des murs.',

      /*
       * Ce que l'arrêté dit lui-même du champ de ce diagnostic — § 4 de son
       * annexe III, « Rappel des limites du champ de réalisation ».
       *
       * Arrêté du 28 septembre 2017, lu en entier le 20/08/2026. Il abroge celui
       * du 8 juillet 2008, et c'est lui qui fait foi ici : NF C 16-600 n'est pas
       * d'application obligatoire, donc pas consultable gratuitement, et nous ne
       * l'avons pas.
       *
       * Le texte impose au rapport d'écrire que des éléments dangereux « peuvent
       * ne pas être repérés », puis les énumère : parties incorporées au gros ou
       * au second œuvre, parties masquées par du mobilier, boîtes de connexion,
       * conduits, plinthes, goulottes, huisseries, éléments chauffants noyés dans
       * la maçonnerie, luminaires de piscine, parties non visibles des tableaux
       * même capot démonté, et l'inadéquation entre le calibre des protections et
       * la section des conducteurs sur toute la longueur des circuits.
       *
       * C'est la phrase qui manque le plus au lecteur : un état sans anomalie
       * n'est pas un certificat d'installation sûre. Elle est écrite noir sur
       * blanc dans son rapport, dans une rubrique que personne n'ouvre.
       */
      'Le rapport le dit lui-même, et c’est l’arrêté qui l’y oblige : des éléments dangereux peuvent ne pas avoir été repérés. Tout ce qui est noyé dans les murs, caché derrière un meuble, ou logé dans une boîte de connexion, une goulotte, une plinthe ou une huisserie échappe au contrôle — de même que le fond du tableau électrique, capot démonté.',
      'Et il y a ce que ce diagnostic ne regarde pas du tout : ce qui est branché plutôt qu’installé, les circuits internes des appareils fixes, la production solaire et ses batteries, et tout ce qui vit en basse tension — téléphone, télévision, informatique, vidéophone, alarme.',

      /* La réforme de 2017, quand la date du rapport la déclenche. */
      ...reformesElectricite(dateFrancaise(date?.[1])).map((r) => r.texte)
    ],
    aFaire:
      (total && total > 0) || nonCompenses.length > 0
        ? [
            'Aucune obligation légale de faire les travaux pour vendre : le rapport est informatif. Mais l’acheteur les découvrira et pourra négocier.',
            'Traitez en priorité l’absence de dispositif différentiel 30 mA et les défauts de mise à la terre : ce sont les deux points qui protègent les personnes.',
            'Faites établir un devis par un électricien avant la vente : cela évite une renégociation improvisée le jour de la signature.',
            'Validité : trois ans à la vente, six ans à la location.'
          ]
        : [
            'Validité : trois ans à la vente, six ans à la location.',
            'Aucune anomalie relevée ne veut pas dire installation neuve : le diagnostic ne contrôle que six points de sécurité.'
          ],
    /*
     * Le renvoi, quand le diagnostic est antérieur à la refonte de 2017.
     *
     * Pas vers une rectification — il n'en existe pas pour l'électricité, un
     * rapport ancien ne se met pas à jour, il se refait — mais vers l'annuaire
     * officiel des diagnostiqueurs certifiés.
     */
    ...(reformesElectricite(dateFrancaise(date?.[1])).length
      ? {
          demarche: {
            texte: OU_REFAIRE.texte,
            url: OU_REFAIRE.url,
            quoiEmporter: OU_REFAIRE.comment
          }
        }
      : {}),
    schema: groupes.length ? { genre: 'anomalies', groupes, total: total ?? 0 } : null,
    pages: plage,
    ...(releves.length ? { releves } : {}),
    ...(date?.[1] ? { date: date[1] } : {})
  };
}

export function analyserGaz(lignes: string[], plage: [number, number]): Diagnostic {
  const dateVisite = trouver(
    lignes,
    /Date (?:du|de la) (?:rep[ée]rage|visite|diagnostic|contr[ôo]le)\s*:?[\s.]*(\d{1,2}\/\d{1,2}\/\d{4})/i
  );
  const conclusion = conclure(lignes, /installation(?: int[ée]rieure(?: de gaz)?)?/);
  const releves = releverTout(lignes);
  const anomalies = releves.filter((r) => r.genre === 'anomalie');

  // Le gaz, lui, a une vraie rubrique de constat — « E. — Anomalies
  // identifiées » —, et c'est elle qui tranche. La liste de domaines partagée
  // avec l'électricité ne conclut pas : voir `estCatalogueDomaines`.
  /*
   * Une rubrique d'anomalies présente et VIDE conclut.
   *
   * Le formulaire de fin de rapport ne dit rien — ses quatre cases sont toutes
   * imprimées, et la coche est un dessin. Mais si la rubrique « E. — Anomalies
   * identifiées » existe et ne liste rien, le diagnostiqueur n'a rien
   * constaté : c'est un résultat, et il vaut « aucune anomalie ».
   */
  const rubrique = sectionAnomalies(lignes);
  const etat =
    conclusion.etat === 'inconnu' && anomalies.length > 0
      ? 'anomalies'
      : conclusion.etat === 'inconnu' && rubrique !== null && rubrique.types === ''
        ? 'aucune'
        : conclusion.etat;
  const total = conclusion.nombre ?? (anomalies.length > 0 ? anomalies.length : null);

  // Même piège pour les types d'anomalie : la page de conclusion du rapport
  // énumère A1, A2 et DGI, chacun dans sa propre phrase, avec une case à cocher.
  // Une énumération complète est donc un formulaire, pas un constat.
  const phrasesTypes = trouverToutes(
    lignes,
    /comporte (?:une|des) anomalies? de type ((?:A1|A2|DGI)(?:\s*,?\s*(?:et\s*)?(?:A1|A2|DGI))*)/gi
  );
  const formulaire = phrasesTypes.length >= 3;
  const types = formulaire
    ? /*
       * Le formulaire ne dit rien — mais le TABLEAU des anomalies, si.
       *
       * Les quatre conclusions possibles figurent toutes dans chaque rapport,
       * et l'on coche celle qui s'applique. Vérifié en lisant : la coche est un
       * dessin, elle ne sort pas du PDF. Le produit renonçait donc, et un
       * rapport gaz sur deux ressortait sans conclusion.
       *
       * La rubrique « E. — Anomalies identifiées », elle, est du texte. Chaque
       * anomalie y porte son point de contrôle normé et son type — « Organe de
       * Coupure d'Appareil (OCA)  A2 » — avec le risque encouru en clair. C'est
       * une source plus sûre que la case : elle dit ce qui a été constaté, pas
       * ce que l'opérateur a coché.
       */
      typesDuTableau(lignes)
    : phrasesTypes
        .map((m) => (m[1] ?? '').toUpperCase())
        .join(' ');
  const a1 = types.includes('A1');
  const a2 = types.includes('A2');
  const dgi = types.includes('DGI');

  /*
   * Les essais faits sur place, remontés avant les types d'anomalie.
   *
   * Une installation « sans anomalie » dont on n'a pas mesuré le monoxyde de
   * carbone n'a pas été contrôlée sur le point qui compte le plus. Le rapport
   * l'écrit — « Mesure CO : Non réalisée », « Appareil à l'arrêt » — dans un
   * tableau de la page 2 que personne ne lit.
   */
  const essais = essaisGaz(lignes);
  /* Le gaz etait-il ouvert ? Lu tot : le verdict en depend autant que les faits. */
  const alimente = alimenteEnGaz(lignes);

  let gravite: Gravite = 'neutre';
  let verdict =
    'La conclusion est cochée à la main : un programme ne peut pas la lire. Elle est sur la page « Conclusion » du rapport.';
  if (dgi) {
    gravite = 'alerte';
    verdict = 'Danger grave et immédiat (DGI) : une partie de l’installation gaz doit être mise hors service.';
  } else if (etat === 'aucune') {
    /*
     * « Aucune anomalie » ne veut pas dire la même chose selon que le CO a été
     * mesuré ou non.
     *
     * Quand l'appareil est resté à l'arrêt, l'essai le plus important du
     * diagnostic n'a pas eu lieu : le monoxyde de carbone ne se voit pas, ne se
     * sent pas, et tue. Annoncer une installation saine sur la foi d'un
     * contrôle qui n'a pas pu se faire serait une fausse réassurance — et c'est
     * exactement ce que le produit affichait.
     *
     * La gravité descend donc à « attention » : il reste quelque chose à
     * vérifier, et l'acheteur doit le savoir avant de signer.
     */
    if (essais.co === 'non-realisee') {
      gravite = 'attention';
      verdict = essais.aLArret
        ? 'Aucune anomalie relevée — mais le monoxyde de carbone n’a pas été mesuré : l’appareil était à l’arrêt le jour de la visite.'
        : 'Aucune anomalie relevée — mais le monoxyde de carbone n’a pas été mesuré.';
    } else {
      gravite = alimente === false ? 'attention' : 'bon';
      verdict =
        alimente === false
          ? 'Aucune anomalie relevée — mais l’installation n’était pas alimentée en gaz le jour de la visite : aucun essai n’a pu être fait.'
          : 'L’installation de gaz ne présente aucune anomalie.';
    }
  } else if (etat === 'anomalies' || a1 || a2) {
    gravite = 'attention';
    const listeTypes = [a1 && 'A1', a2 && 'A2'].filter(Boolean).join(' et ');
    verdict = listeTypes
      ? `L’installation de gaz présente des anomalies de type ${listeTypes}, à faire réparer.`
      : `L’installation de gaz présente ${total ?? 'des'} anomalie${total === 1 ? '' : 's'}.`;
  }

  const faits: Fait[] = [];
  if (total !== null) faits.push({ libelle: 'Anomalies relevées', valeur: String(total) });

  if (essais.co === 'non-realisee') {
    faits.push({
      libelle: 'Mesure du monoxyde de carbone',
      valeur: 'non réalisée',
      precision: essais.aLArret
        ? 'l’appareil était à l’arrêt le jour de la visite'
        : 'le rapport ne dit pas pourquoi'
    });
  } else if (essais.co === 'realisee') {
    faits.push({
      libelle: 'Mesure du monoxyde de carbone',
      valeur: essais.ppm !== null ? `${essais.ppm} ppm` : 'réalisée'
    });
  }

  if (essais.anneeAppareil !== null) {
    faits.push({
      libelle: 'Appareil installé en',
      valeur: String(essais.anneeAppareil),
      precision: 'une chaudière gaz dure en général 15 à 20 ans'
    });
  }

  /*
   * Ce que la rubrique G a relevé, et que personne ne lit.
   *
   * L'entretien annuel de la chaudière et le ramonage sont dus par l'occupant ;
   * sans justificatif, l'assureur peut discuter sa garantie après un sinistre.
   * Le rapport le note, sous un titre qui n'annonce rien.
   */
  /*
   * Le gaz coupe : ce que la conclusion ne peut pas dire.
   *
   * Quand l'installation n'etait pas alimentee, aucun essai n'a eu lieu.
   * « Aucune anomalie » signifie alors « rien constate », pas « installation
   * verifiee » — et un acheteur doit le savoir avant de signer.
   */
  if (alimente === false) {
    /*
     * Deux causes derriere un meme « non », et elles s'opposent.
     *
     * Le gaz peut etre coupe DEPUIS LONGTEMPS — logement vide, contrat resilie —
     * et alors rien n'a pu etre essaye. Mais il peut aussi avoir ete ferme PAR
     * L'OPERATEUR le jour meme, apres un danger grave et immediat : dans ce cas
     * l'installation a bel et bien ete examinee, et c'est le diagnostic qui a
     * conduit a la coupure. Dire « aucun essai n'a pu etre fait » y serait faux.
     */
    faits.push({
      libelle: 'Installation alimentée le jour de la visite',
      valeur: 'non',
      precision: dgi
        ? 'l’opérateur a fermé l’alimentation après le danger grave et immédiat'
        : 'aucun essai n’a pu être fait : ni mesure du monoxyde, ni contrôle en fonctionnement'
    });
  }

  /*
   * La contradiction interne, dite sans etre tranchee.
   *
   * C'est au diagnostiqueur de preciser laquelle des deux rubriques dit vrai.
   * Le produit ne peut pas le savoir — mais il peut faire en sorte que la
   * question soit posee.
   */
  if (contradictionControle(lignes)) {
    faits.push({
      libelle: 'Le rapport se contredit',
      valeur: 'sur ce qui a pu être contrôlé',
      precision:
        'sa rubrique F ne signale aucun point non contrôlé, sa rubrique G dit que certains ne l’ont pas été — à faire préciser'
    });
  }

  const constatations = constatationsGaz(lignes);
  if (constatations.length) {
    faits.push({
      libelle: constatations.length > 1 ? 'Constatations du rapport' : 'Constatation du rapport',
      valeur: constatations.join(' · '),
      precision: 'relevé en rubrique G, « constatations diverses »'
    });
  }

  if (a1) faits.push({ libelle: 'Type A1', valeur: 'présent', precision: 'à corriger sans urgence' });
  if (a2) faits.push({ libelle: 'Type A2', valeur: 'présent', precision: 'à corriger rapidement' });
  if (dgi) faits.push({ libelle: 'DGI', valeur: 'oui', precision: 'mise hors service immédiate' });

  return {
    type: 'gaz',
    titre: 'Installation de gaz',
    verdict,
    gravite,
    faits,
    analogie:
      'Une flamme, ça mange de l’air. Si la grille de ventilation est bouchée, elle continue de brûler mais mal : elle fabrique du monoxyde de carbone. Un gaz qu’on ne voit pas, qu’on ne sent pas, et qui endort.',
    explication: [
      'Le diagnostiqueur vérifie les tuyaux, les appareils au gaz, la ventilation et le conduit de fumées. Il cherche deux dangers : une fuite, et une intoxication au monoxyde de carbone.',
      // Les trois niveaux sont désormais cliquables dans le texte (lexique.ts) :
      // les détailler ici les expliquerait deux fois.
      'Les défauts sont classés en trois niveaux : A1, A2 et DGI, du moins grave au plus urgent.',
      'Le monoxyde de carbone ne se voit pas et ne sent rien. C’est pour ça qu’une grille de ventilation bouchée est prise aussi au sérieux qu’une fuite.'
    ],
    aFaire: dgi
      ? [
          'Ne remettez pas l’installation en service vous-même : faites intervenir un professionnel du gaz, qui délivrera une attestation.',
          'Le distributeur a été informé ; la remise en service passe par lui après réparation.',
          'Vérifiez les grilles de ventilation : ne les obstruez jamais, même en hiver.'
        ]
      : [
          'Validité : trois ans à la vente, six ans à la location.',
          'Faites entretenir votre chaudière chaque année : c’est une obligation, et c’est ce qui évite la plupart des A2.',
          'Un détecteur de monoxyde de carbone coûte quelques dizaines d’euros et se pose en cinq minutes.'
        ],
    ...(releves.length ? { releves } : {}),
    schema: null,
    pages: plage,
    ...(dateVisite?.[1] ? { date: dateVisite[1] } : {})
  };
}

/**
 * Les types d'anomalie relevés dans le tableau du rapport gaz.
 *
 * La rubrique « E. — Anomalies identifiées » liste ce qui a été constaté, une
 * anomalie par bloc, chacune portant son type : A1, A2, DGI, ou 32c. C'est la
 * seule conclusion lisible du document — la case cochée en fin de rapport est
 * un dessin, et ne sort pas du PDF.
 *
 * ── Les deux pièges de cette rubrique ───────────────────────────────────────
 *
 * Son EN-TÊTE énumère les quatre types, comme légende de colonne :
 * « (selon la norme) (A1 , A2 , DGI , 32c ) ». Une ligne qui les cite tous est
 * donc une légende, jamais un constat — même règle que pour la page de
 * conclusion.
 *
 * Et le tableau ne s'arrête pas tout seul : il faut le borner à la rubrique
 * suivante (« F. — … »), sans quoi on ramasse les rappels réglementaires qui
 * expliquent ce que sont A1, A2 et DGI.
 */
function typesDuTableau(lignes: string[]): string {
  return sectionAnomalies(lignes)?.types ?? '';
}

/**
 * La rubrique des anomalies : présente et vide, ou absente ?
 *
 * La distinction commande la conclusion, et rien ne la remplace. Une rubrique
 * PRÉSENTE mais vide dit « aucune anomalie constatée » — c'est un résultat.
 * Une rubrique ABSENTE dit seulement qu'on n'a pas su la lire — ce n'en est
 * pas un.
 *
 * Les confondre revient à annoncer une installation saine parce qu'on n'a rien
 * trouvé à lire. C'est le contraire du service rendu, et sur le gaz cela
 * porterait sur le seul diagnostic qui peut faire couper l'alimentation le
 * jour même.
 */
function sectionAnomalies(lignes: string[]): { types: string } | null {
  const r = rubriqueDe(lignes, 'gaz', 'anomalies');
  if (!r) return null;
  return { types: typesConstates(r.lignes) };
}

/**
 * Les types d'anomalie que le tableau CONSTATE — A1, A2, DGI.
 *
 * Trois sortes de lignes citent ces sigles, et une seule constate :
 *
 *  - la **légende de colonne** en cite plusieurs d'affilée
 *    (« (selon la norme) (A1 , A2 , » puis « DGI , 32c ) ») ;
 *  - les **notes de bas de tableau** en définissent un chacune, précédées de
 *    leur appel — « (4) A1 : L'installation présente une anomalie… » ;
 *  - le **constat**, enfin, qui porte le point de contrôle normé et son type :
 *    « Tuyauteries fixes - Espace annulaire   A2 ».
 *
 * Confondre les trois se paie cher, et dans les deux sens : lire les notes fait
 * annoncer « A1 et A2 et DGI » à tous les rapports ; les écarter trop largement
 * fait annoncer « aucune anomalie » à une installation à réparer dans les
 * meilleurs délais. C'est ce second cas que le corpus a montré — sur le seul
 * diagnostic qui peut faire couper le gaz le jour même.
 */
export function typesConstates(lignes: string[]): string {
  const trouves = new Set<string>();

  for (const ligne of lignes) {
    // Une note : son appel ouvre la ligne.
    if (/^\s*\(\s*\d\s*\)/.test(ligne)) continue;
    const cites = ligne.match(/(?:A1|A2|DGI|32c)/gi) ?? [];
    // Une légende : plusieurs types sur la même ligne.
    if (cites.length >= 2) continue;
    for (const t of cites) trouves.add(t.toUpperCase().replace('32C', '32c'));
  }

  // « 32c » relève du syndic et du distributeur, pas du propriétaire : le
  // produit la traite à part et ne la compte pas parmi A1/A2/DGI.
  trouves.delete('32c');
  return [...trouves].join(' ');
}

/**
 * La rubrique G du gaz — « Constatations diverses » — et ce qu'elle enterre.
 *
 * Ce n'est pas un fourre-tout. Sur un rapport lu en entier, elle portait quatre
 * lignes que rien d'autre du dossier ne dit :
 *
 *     Attestation de contrôle de moins d'un an de la vacuité des conduits de
 *     fumées non présentée
 *     Justificatif d'entretien de moins d'un an de la chaudière non présenté
 *     Le conduit de raccordement n'est pas visitable
 *     Au moins un assemblage par raccord mécanique est réalisé au moyen d'un
 *     ruban d'étanchéité
 *
 * L'entretien annuel de la chaudière et le ramonage sont des obligations de
 * l'occupant, et leur absence pèse en cas de sinistre : l'assureur les demande.
 * C'est le genre d'information qu'un acheteur voudrait connaître, et elle est
 * en petits caractères sous un titre qui annonce des « constatations diverses ».
 *
 * On ne remonte que ce qui constate : les rappels de responsabilité et les
 * mentions de forme restent au rapport.
 */
const CONSTATATIONS_UTILES: { motif: RegExp; dit: string }[] = [
  {
    motif: /entretien de moins d['’]un an de la chaudi[èe]re non pr[ée]sent/i,
    dit: 'entretien annuel de la chaudière non justifié'
  },
  {
    motif: /vacuit[ée] des conduits de fum[ée]es? non pr[ée]sent/i,
    dit: 'ramonage des conduits non justifié'
  },
  {
    motif: /conduit de raccordement n['’]est pas visitable/i,
    dit: 'conduit de raccordement non visitable'
  },
  {
    motif: /ruban d['’][ée]tanch[ée]it[ée]/i,
    dit: 'un raccord réalisé au ruban d’étanchéité'
  }
];

/**
 * L'installation etait-elle alimentee le jour de la visite ?
 *
 * La rubrique A du gaz porte « Installation alimentee en gaz : NON » — quatre
 * volets sur dix-sept du corpus. Quand le gaz est coupe, AUCUN essai n'a pu
 * etre fait : ni la mesure de monoxyde, ni le controle des raccordements en
 * fonctionnement, ni le declenchement des securites.
 *
 * Le rapport peut alors conclure « ne comporte aucune anomalie » — et c'est
 * exact au sens du protocole, puisqu'on ne constate rien. Mais ce n'est pas la
 * meme chose qu'une installation verifiee. C'est le pendant du differentiel non
 * essaye en electricite, et le produit ne le disait pas.
 */
export function alimenteEnGaz(lignes: string[]): boolean | null {
  const ligne = lignes.find((l) => /Installation aliment[ée]e en gaz/i.test(l));
  if (!ligne) return null;
  if (/Installation aliment[ée]e en gaz\s*:?\s*\.*\s*NON\b/i.test(ligne)) return false;
  if (/Installation aliment[ée]e en gaz\s*:?\s*\.*\s*OUI\b/i.test(ligne)) return true;
  return null;
}

/**
 * Le rapport se contredit-il sur ce qu'il a pu controler ?
 *
 * La rubrique F — « bâtiments et parties du bâtiment n'ayant pu être contrôlés »
 * — porte « Néant » : tout a pu l'etre. Et deux lignes plus bas, la rubrique G
 * ecrit « Certains points de controle n'ont pu etre controles. De ce fait la
 * responsabilite du donneur d'ordre reste pleinement engagee ».
 *
 * Les deux ne peuvent pas etre vraies. Mesure : quatre volets sur dix-huit.
 *
 * On ne tranche pas — ni pour rassurer, ni pour inquieter. On le dit, parce que
 * c'est au diagnostiqueur de preciser, et parce qu'un acheteur qui l'ignore ne
 * saura jamais quelle partie de son installation a vraiment ete vue.
 */
export function contradictionControle(lignes: string[]): boolean {
  const f = rubriqueDe(lignes, 'gaz', 'nonControles');
  const g = rubriqueDe(lignes, 'gaz', 'constatations');
  if (!f || !g) return false;
  const fDitNeant = f.lignes.some((l) => /^\s*N[ée]ant\s*$/i.test(l));
  const gDitNonControle = g.lignes.some((l) =>
    /points? de contr[ôo]les? n['’]ont? pu [êe]tre contr[ôo]l/i.test(l)
  );
  return fDitNeant && gDitNonControle;
}

export function constatationsGaz(lignes: string[]): string[] {
  const r = rubriqueDe(lignes, 'gaz', 'constatations');
  if (!r) return [];
  const texte = r.lignes.join(' ');
  return CONSTATATIONS_UTILES.filter((c) => c.motif.test(texte)).map((c) => c.dit);
}

/** Ce que les essais sur place ont donné — ou n'ont pas donné. */
export interface EssaisGaz {
  /** Mesure du monoxyde de carbone : faite, non faite, ou non lue. */
  co: 'realisee' | 'non-realisee' | null;
  /** Le taux mesuré, en ppm, quand il est écrit. */
  ppm: number | null;
  /** Vrai si au moins un appareil n'a pas pu être mis en marche. */
  aLArret: boolean;
  /** L'année d'installation de l'appareil, quand le rapport la porte. */
  anneeAppareil: number | null;
}

/**
 * Les essais faits sur place, rubrique « D. — Identification des appareils ».
 *
 * Un état du gaz n'est pas qu'une liste de points cochés : le diagnostiqueur
 * fait des essais. Le plus important est la mesure du monoxyde de carbone dans
 * les produits de combustion — le CO ne se voit pas, ne se sent pas, et tue.
 *
 * ── Pourquoi c'est ici que ça se joue ───────────────────────────────────────
 *
 * Le rapport écrit « Mesure CO : Non réalisée » et, juste dessous,
 * « Fonctionnement : Appareil à l'arrêt ». Autrement dit : le contrôle le plus
 * important du diagnostic n'a pas eu lieu, faute d'avoir pu allumer la
 * chaudière. C'est une information capitale pour un acheteur, et elle est
 * enterrée dans un tableau de la page 2, en petits caractères.
 *
 * Un rapport sans anomalie ET sans mesure de CO ne dit pas « tout va bien » :
 * il dit « je n'ai pas pu vérifier ce qui compte le plus ». La nuance change
 * tout, et personne ne la voit.
 *
 * L'année d'installation est relevée au passage : elle donne la vétusté de
 * l'appareil, que le rapport ne commente jamais.
 */
export function essaisGaz(lignes: string[]): EssaisGaz {
  /* Même correction que pour les anomalies : la rubrique se trouve par son
     intitulé, et se borne à la partie suivante quelle que soit sa lettre. À
     défaut de rubrique, on cherche dans tout le volet plutôt que de renoncer —
     deux rapports du corpus n'ont pas cette partie. */
  const r = rubriqueDe(lignes, 'gaz', 'appareils');
  const zone = r ? r.lignes : lignes;

  const mentions = zone.filter((l) => /Mesure\s*CO/i.test(l));
  const nonRealisee = mentions.some((l) => /Mesure\s*CO\s*:?\s*Non/i.test(l));
  /*
   * Une mesure CHIFFRÉE est une mesure réalisée.
   *
   * Aucun rapport du corpus n'écrit « Mesure CO : Oui ». Ils écrivent la
   * valeur — « Mesure CO : 0 ppm » — et neuf volets sur dix-huit la portent
   * ainsi. Aucun n'était compté : le produit annonçait « le monoxyde de
   * carbone n'a pas été mesuré » à des lecteurs dont le rapport donnait le
   * relevé, et ce relevé était rassurant.
   */
  const realisee = mentions.some((l) =>
    /Mesure\s*CO\s*:?\s*(?:Oui|R[ée]alis|[\d.,]+\s*ppm)/i.test(l)
  );

  /*
   * Le taux, virgule comprise.
   *
   * « 0,3 ppm » se lisait « 3 ppm » : le motif n'acceptait que des chiffres
   * entiers, et ramassait ce qui suivait la virgule. Un facteur dix sur une
   * mesure de monoxyde de carbone.
   */
  const taux = trouver(zone, /Mesure\s*CO[^\n]{0,30}?(\d{1,5}(?:[.,]\d{1,2})?)\s*ppm/i);
  const annee = trouver(zone, /Installation\s*:?\s*(19\d{2}|20\d{2})\b/i);

  return {
    co: realisee ? 'realisee' : nonRealisee ? 'non-realisee' : null,
    ppm: taux?.[1] ? Number(taux[1].replace(',', '.')) : null,
    aLArret: zone.some((l) => /Fonctionnement\s*:?\s*Appareil\s+[àa]\s+l['’]arr[êe]t/i.test(l)),
    anneeAppareil: annee?.[1] ? Number(annee[1]) : null
  };
}

/** Un point de contrôle que le diagnostiqueur n'a pas pu vérifier. */
export interface PointNonVerifie {
  /** Ce qui aurait dû être contrôlé. */
  quoi: string;
  /** Pourquoi ça n'a pas pu l'être. */
  motif: string;
}

/**
 * La rubrique « Points de contrôle n'ayant pu être vérifiés ».
 *
 * C'est le pendant électrique de la mesure de CO manquante du gaz, et il est
 * tout aussi grave. Relevé dans un rapport réel :
 *
 *   Dispositif de protection différentiel — Courant différentiel-résiduel assigné
 *   Point à vérifier : Déclenche, lors de l'essai de fonctionnement
 *   Motifs : L'installation n'était pas alimentée en électricité le jour de la visite.
 *
 * Autrement dit : personne n'a vérifié que le différentiel déclenche. Or c'est
 * lui qui coupe le courant quand il passe par quelqu'un — c'est le seul organe
 * du tableau qui protège les personnes, et non le matériel.
 *
 * Le rapport conclut quand même, avec sa liste d'anomalies. Un lecteur en
 * retire que l'installation a été contrôlée. Elle ne l'a pas été sur ce qui
 * compte le plus.
 *
 * ── Ce qui n'est pas de cette rubrique ──────────────────────────────────────
 *
 * Les « parties non visitées » du logement sont autre chose : une pièce fermée
 * ne dit rien de la qualité du contrôle ailleurs. Ici, le point de contrôle
 * existait, était accessible, et n'a pas pu être ESSAYÉ.
 */
export function pointsNonVerifies(lignes: string[]): PointNonVerifie[] {
  const debut = lignes.findIndex((l) =>
    /Points? de contr[ôo]le n[’']?ayant pu [êe]tre v[ée]rifi[ée]s?/i.test(l)
  );
  if (debut < 0) return [];

  /*
   * La rubrique suivante s'annonce « 7. – … », avec un tiret entouré d'espaces.
   *
   * Ce tiret n'est pas un détail : les DOMAINES du tableau sont numérotés eux
   * aussi — « 1. L'appareil général de commande » — et un motif qui se contente
   * du numéro coupe la rubrique dès sa première ligne. C'est ce qu'il faisait,
   * et il ne remontait donc jamais rien.
   *
   * ── Pourquoi le découpage en rubriques ne sert PAS ici ──────────────────
   *
   * On a essayé, et il fallait le mesurer plutôt que le supposer : borner à la
   * partie suivante du rapport paraît plus solide que ce tiret. Ça ne l'est
   * pas. Les domaines de ce tableau portent des numéros de la MÊME famille que
   * les parties de l'arrêté — 1, 2, 3 — et le squelette ne peut pas les
   * distinguer. La borne tombait alors sur le premier domaine, c'est-à-dire une
   * ligne après le début, et la liste redevenait vide.
   *
   * L'outil des rubriques vaut pour les parties d'un rapport, pas pour ce qui
   * vit à l'intérieur d'une partie. Le tiret reste, et il est ici le bon
   * critère : les parties le portent, les domaines non.
   */
  const fin = lignes.findIndex((l, i) => i > debut && /^\s*\d+\s*[.]?\s*[–—-]\s+/.test(l));
  const zone = lignes.slice(debut + 1, fin > debut ? fin : undefined);

  const points: PointNonVerifie[] = [];
  let quoi: string | null = null;

  for (const ligne of zone) {
    const aVerifier = /Point [àa] v[ée]rifier\s*:?\s*(.+)$/i.exec(ligne.trim());
    if (aVerifier?.[1]) {
      quoi = aVerifier[1].trim();
      continue;
    }
    const motif = /Motifs?\s*:?\s*(.+)$/i.exec(ligne.trim());
    if (motif?.[1] && quoi) {
      points.push({ quoi, motif: motif[1].trim() });
      quoi = null;
    }
  }

  return points;
}
