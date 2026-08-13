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
import { releverTout } from './anomalies';

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
   * La liste « Anomalies avérées selon les domaines suivants » tranche ce que
   * la case cochée ne permettait pas de lire : elle n'est imprimée que s'il y
   * a des anomalies. Là où le moteur se taisait — deux rapports lus sur
   * vingt-neuf —, il peut désormais conclure, et dire lesquelles.
   */
  const etat = conclusion.etat === 'inconnu' && anomalies.length > 0 ? 'anomalies' : conclusion.etat;
  const total = conclusion.nombre ?? (anomalies.length > 0 ? anomalies.length : null);

  const groupes = THEMES_ELEC.map((t) => ({
    nom: t.nom,
    nombre: trouverToutes(lignes, t.motif).length
  })).filter((g) => g.nombre > 0);

  let gravite: Gravite = 'neutre';
  let verdict =
    'La conclusion est cochée à la main : un programme ne peut pas la lire. Elle est sur la page « Conclusion » du rapport.';
  if (etat === 'aucune') {
    gravite = 'bon';
    verdict = 'L’installation électrique ne présente aucune anomalie.';
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
    } else {
      verdict =
        'L’installation électrique présente des anomalies : le rapport recommande d’agir pour éliminer les dangers.';
    }
  }

  const faits: Fait[] = [];
  if (conclusion.nombre !== null) {
    faits.push({ libelle: 'Anomalies relevées', valeur: String(conclusion.nombre) });
  } else if (anomalies.length > 0) {
    faits.push({
      libelle: 'Points relevés',
      valeur: String(anomalies.length),
      precision: 'domaines et libellés énumérés par le rapport'
    });
  }
  const date = trouver(lignes, /Date (?:du|de la) (?:rep[ée]rage|visite|diagnostic)\s*:?[\s.]*(\d{2}\/\d{2}\/\d{4})/i);
  if (date?.[1]) faits.push({ libelle: 'Date de la visite', valeur: date[1] });

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
      'Le diagnostiqueur ne démonte rien. Il ne peut donc rien dire de l’état des fils à l’intérieur des murs.'
    ],
    aFaire:
      total && total > 0
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
    schema: groupes.length ? { genre: 'anomalies', groupes, total: total ?? 0 } : null,
    pages: plage,
    ...(releves.length ? { releves } : {}),
    ...(date?.[1] ? { date: date[1] } : {})
  };
}

export function analyserGaz(lignes: string[], plage: [number, number]): Diagnostic {
  const dateVisite = trouver(
    lignes,
    /Date (?:du|de la) (?:rep[ée]rage|visite|diagnostic|contr[ôo]le)\s*:?[\s.]*(\d{2}\/\d{2}\/\d{4})/i
  );
  const conclusion = conclure(lignes, /installation(?: int[ée]rieure(?: de gaz)?)?/);
  const releves = releverTout(lignes);
  const anomalies = releves.filter((r) => r.genre === 'anomalie');

  // Même levier que pour l'électricité : la liste des domaines tranche là où
  // la case cochée reste illisible. Le gaz en avait le plus besoin — six
  // rapports sur sept restaient sans verdict.
  const etat = conclusion.etat === 'inconnu' && anomalies.length > 0 ? 'anomalies' : conclusion.etat;
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
    ? ''
    : phrasesTypes
        .map((m) => (m[1] ?? '').toUpperCase())
        .join(' ');
  const a1 = types.includes('A1');
  const a2 = types.includes('A2');
  const dgi = types.includes('DGI');

  let gravite: Gravite = 'neutre';
  let verdict =
    'La conclusion est cochée à la main : un programme ne peut pas la lire. Elle est sur la page « Conclusion » du rapport.';
  if (dgi) {
    gravite = 'alerte';
    verdict = 'Danger grave et immédiat (DGI) : une partie de l’installation gaz doit être mise hors service.';
  } else if (etat === 'aucune') {
    gravite = 'bon';
    verdict = 'L’installation de gaz ne présente aucune anomalie.';
  } else if (etat === 'anomalies' || a1 || a2) {
    gravite = 'attention';
    const listeTypes = [a1 && 'A1', a2 && 'A2'].filter(Boolean).join(' et ');
    verdict = listeTypes
      ? `L’installation de gaz présente des anomalies de type ${listeTypes}, à faire réparer.`
      : `L’installation de gaz présente ${total ?? 'des'} anomalie${total === 1 ? '' : 's'}.`;
  }

  const faits: Fait[] = [];
  if (total !== null) faits.push({ libelle: 'Anomalies relevées', valeur: String(total) });
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
