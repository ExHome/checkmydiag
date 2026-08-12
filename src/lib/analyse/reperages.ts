/**
 * Repérages « présence / absence » : amiante et termites.
 *
 * Ces rapports listent les pièces contrôlées, une ligne par élément, et
 * concluent par une phrase type. On lit la phrase, et on compte les lignes qui
 * signalent une présence pour ne pas dépendre d'une seule formulation.
 */
import type { Diagnostic, Fait, Gravite } from '../modele';
import { compact, trouver } from './texte';

function zonesTermites(lignes: string[]): { nom: string; etat: Gravite; detail?: string }[] {
  const zones: { nom: string; etat: Gravite; detail?: string }[] = [];
  let pieceCourante = '';

  for (const ligne of lignes) {
    const colle = compact(ligne);
    if (!colle.includes('indicesdinfestation') && !colle.includes('indicedinfestation')) continue;

    // « Piece 1 Sol - Carrelage Absence d'indices d'infestation de termites »
    const piece = ligne.match(/^((?:Pi[eè]ce|Chambre|Cuisine|Salon|S[ée]jour|Salle|Garage|Cave|Grenier|Combles|WC|Couloir|Entr[ée]e|D[ée]gagement|Buanderie|Terrasse|Balcon|Ext[ée]rieur)[^-]*?)\s+(?:Sol|Mur|Plafond|Plinthes|Porte|Fen[eê]tre|Charpente|Escalier)/i);
    if (piece?.[1]) pieceCourante = piece[1].trim();

    const nom = pieceCourante || 'Zone contrôlée';
    const presence = colle.includes('presencedindices') || /pr[ée]sence d.indice/i.test(ligne);
    const existante = zones.find((z) => z.nom === nom);

    if (existante) {
      if (presence) existante.etat = 'alerte';
    } else {
      zones.push({ nom, etat: presence ? 'alerte' : 'bon' });
    }
  }
  return zones;
}

export function analyserTermites(lignes: string[], plage: [number, number]): Diagnostic {
  const zones = zonesTermites(lignes);
  const infestees = zones.filter((z) => z.etat === 'alerte');

  const phraseAbsence = trouver(
    lignes,
    /(?:il n'a pas [ée]t[ée] rep[ée]r[ée]|absence)[^.]*indice[^.]*infestation[^.]*termites?/i
  );
  const phrasePresence = trouver(
    lignes,
    /(?:il a [ée]t[ée] rep[ée]r[ée]|pr[ée]sence)[^.]*(?:indice|infestation)[^.]*termites?/i
  );

  const infeste = infestees.length > 0 || (!!phrasePresence && !phraseAbsence);

  const faits: Fait[] = [];
  if (zones.length) faits.push({ libelle: 'Zones contrôlées', valeur: String(zones.length) });
  if (infestees.length)
    faits.push({ libelle: 'Zones avec indices', valeur: String(infestees.length) });

  const arrete = trouver(lignes, /arr[eê]t[ée] pr[ée]fectoral\s*n?°?\s*([\w .-]{6,40})/i);
  if (arrete?.[1]) faits.push({ libelle: 'Arrêté préfectoral', valeur: arrete[1].trim() });
  const niveau = trouver(lignes, /Niveau d'infestation\s*(\w+)/i);
  if (niveau?.[1]) faits.push({ libelle: 'Niveau d’infestation de la commune', valeur: niveau[1] });
  const date = trouver(lignes, /Date du rep[ée]rage\s*:?[\s.]*(\d{2}\/\d{2}\/\d{4})/i);
  if (date?.[1]) faits.push({ libelle: 'Date du repérage', valeur: date[1] });

  return {
    type: 'termites',
    titre: 'Termites',
    verdict: infeste
      ? `Des indices d’infestation de termites ont été relevés${infestees.length ? ` dans ${infestees.length} zone${infestees.length > 1 ? 's' : ''}` : ''}.`
      : 'Aucun indice d’infestation de termites n’a été relevé dans les parties visitées.',
    gravite: infeste ? 'alerte' : 'bon',
    faits,
    explication: [
      'Le diagnostic termites est un examen visuel : le diagnostiqueur cherche des indices (galeries, cordonnets, bois altéré) sur ce qui est accessible sans rien démonter ni percer.',
      'Il ne garantit donc pas l’absence de termites dans les parties cachées — murs fermés, sous-sol inaccessible, charpente non visitable. C’est une photographie à un instant donné.',
      'Ce diagnostic n’est obligatoire que dans les communes couvertes par un arrêté préfectoral. Sa durée de validité est courte : six mois.'
    ],
    aFaire: infeste
      ? [
          'Déclarez l’infestation en mairie : c’est une obligation dès qu’un foyer est constaté.',
          'Faites intervenir une entreprise spécialisée pour un traitement curatif, et faites vérifier la charpente et les structures porteuses.',
          'À la vente, cet état doit être daté de moins de six mois au jour de la signature.'
        ]
      : [
          'Validité : six mois. Si la vente traîne, il faudra le refaire.',
          'Le rapport ne couvre que les parties visitées : lisez la liste des zones non accessibles, elle figure dans le rapport.'
        ],
    schema: zones.length ? { genre: 'pieces', zones } : null,
    pages: plage
  };
}

export function analyserAmiante(lignes: string[], plage: [number, number]): Diagnostic {
  // Piège : le titre du rapport contient « repérage des matériaux et produits
  // contenant de l'amiante », et le corps explique longuement ce qu'est
  // l'amiante. Chercher le mot ne prouve donc rien : seule compte la phrase de
  // conclusion normalisée, dans l'un ou l'autre sens.
  const phraseAbsence = trouver(
    lignes,
    /il n'?a pas [ée]t[ée] rep[ée]r[ée] de mat[ée]riaux(?: et produits)?(?: susceptibles de contenir| contenant)? de l'amiante/i
  );
  const phrasePresence = trouver(
    lignes,
    /il a [ée]t[ée] rep[ée]r[ée] des mat[ée]riaux(?: et produits)?(?: susceptibles de contenir| contenant)? de l'amiante|mis en [ée]vidence la pr[ée]sence[^.]{0,40}amiante/i
  );

  // La vraie conclusion est donnée liste par liste (A : flocages et
  // calorifugeages ; B : dalles, conduits, toitures ; C : avant démolition),
  // chacune sur sa ligne. C'est le seul endroit qui affirme quelque chose : le
  // reste du rapport ne fait qu'expliquer ce qu'est l'amiante (« en cas de
  // présence d'amiante… »), et comptait à tort dans une version précédente.
  const listes: { liste: string; presence: boolean }[] = [];
  for (const ligne of lignes) {
    const m = ligne.match(/Liste\s*([ABC])\s*:/i);
    if (!m?.[1]) continue;
    if (/n'?a\s*pas\s*[ée]t[ée]\s*rep[ée]r[ée]/i.test(ligne)) {
      listes.push({ liste: m[1].toUpperCase(), presence: false });
    } else if (/il\s*a\s*[ée]t[ée]\s*rep[ée]r[ée]/i.test(ligne)) {
      listes.push({ liste: m[1].toUpperCase(), presence: true });
    }
  }

  const listesAvecAmiante = listes.filter((l) => l.presence).map((l) => l.liste);
  const amianteTrouvee = !phraseAbsence && (!!phrasePresence || listesAvecAmiante.length > 0);
  const conclusionLue = !!phraseAbsence || listes.length > 0 || !!phrasePresence;

  const faits: Fait[] = [];
  const date = trouver(lignes, /Date du rep[ée]rage\s*:?[\s.]*(\d{2}\/\d{2}\/\d{4})/i);
  if (date?.[1]) faits.push({ libelle: 'Date du repérage', valeur: date[1] });
  if (listesAvecAmiante.length)
    faits.push({
      libelle: 'Listes concernées',
      valeur: listesAvecAmiante.join(', '),
      precision: 'A : flocages · B : dalles, conduits, toiture'
    });

  return {
    type: 'amiante',
    titre: 'Amiante',
    verdict: !conclusionLue
      ? 'Un repérage amiante figure au dossier ; sa conclusion n’a pas pu être lue automatiquement.'
      : amianteTrouvee
        ? 'Des matériaux contenant de l’amiante ont été repérés dans le bien.'
        : 'Aucun matériau contenant de l’amiante n’a été repéré dans les parties accessibles.',
    gravite: !conclusionLue ? 'neutre' : amianteTrouvee ? 'attention' : 'bon',
    faits,
    explication: [
      'Le repérage amiante ne concerne que les immeubles dont le permis de construire est antérieur au 1ᵉʳ juillet 1997. Il porte sur une liste réglementaire de matériaux (flocages, calorifugeages, faux plafonds, dalles de sol, conduits, toitures…).',
      'Trouver de l’amiante n’est pas une catastrophe en soi : un matériau amianté en bon état et non friable ne libère pas de fibres. Le danger apparaît quand il se dégrade, ou quand on le perce, ponce ou casse.',
      'Le repérage « avant vente » est visuel et non destructif : il ne voit pas ce qui est enfermé dans les murs. Un repérage plus poussé est exigé avant travaux ou démolition.'
    ],
    aFaire: amianteTrouvee
      ? [
          'Ne percez, ne poncez, ne découpez jamais un matériau amianté vous-même : faites appel à une entreprise certifiée.',
          'Selon le matériau et son état, le rapport impose soit une simple surveillance périodique (contrôle tous les trois ans), soit des travaux.',
          'Conservez le rapport : il devra être remis à toute entreprise intervenant dans le logement, et au futur acquéreur.'
        ]
      : [
          'Un repérage « avant vente » sans amiante n’a pas de limite de validité, tant qu’il n’y a pas de travaux.',
          'Avant des travaux touchant la structure, un repérage « avant travaux » (plus poussé, avec sondages) reste obligatoire.'
        ],
    schema: null,
    pages: plage
  };
}

export const _interne = { zonesTermites };
