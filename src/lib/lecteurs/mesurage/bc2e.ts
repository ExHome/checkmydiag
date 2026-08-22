/**
 * LE LECTEUR DE MESURAGE — FORMAT BC2E.
 *
 * Mesuré sur 8 volets lus en entier le 22/08/2026
 * (`docs/OU-PARSER-MESURAGE.md` § 5). Ce n'est pas une variante de LICIEL :
 * c'est un autre document, et quatre choses interdisent de réutiliser l'autre
 * lecteur.
 *
 * 1. **Le vocabulaire est inversé.** BC2E écrit `La superficie habitable est`
 *    là où LICIEL écrit `Surface habitable totale`, et `La superficie privative
 *    (Loi Carrez) est` là où LICIEL écrit `Surface loi Carrez totale`. Un motif
 *    bâti sur « surface » ou sur « superficie » attribue la mauvaise loi chez
 *    l'autre éditeur — silencieusement, avec un chiffre vraisemblable.
 * 2. **La conclusion est en tête**, sous `CONCLUSIONS`, avant tout détail.
 *    Chez LICIEL elle encadre le tableau. Même volet, dispositions opposées.
 * 3. **Le tableau a trois colonnes de surface**, pas deux, et aucune ne
 *    s'appelle « surface au sol ».
 * 4. **La surface au sol n'existe qu'en Carrez**, sur une ligne à elle, APRÈS
 *    les totaux. Le volet Boutin BC2E n'en porte aucune.
 */
import type { Lecteur } from '../socle';
import {
  nombre,
  type LectureMesurage,
  type Loi,
  type PieceMesuree,
  type Rubrique,
  type Surface
} from './modele';

/**
 * La signature : le pied de volet, qui nomme le document ET sa pagination.
 *
 * Positive, et mesurée 8 fois sur 8. C'est aussi ce qui distingue le vrai volet
 * de la **fiche de synthèse** BC2E : celle-ci porte la même phrase de
 * conclusion, mais son pied ne dit que `DDT : n sur N`. Elle écrit elle-même
 * qu'elle « ne peut pas être utilisée seule » — la lire comme une attestation
 * ferait passer un résumé pour la pièce due au notaire.
 */
const PIED_DU_VOLET =
  /^(ATTESTATION\s+LOI\s+(?:CARREZ|BOUTIN)|CERTIFICAT\s+DE\s+SURFACE)\s*:\s*\d+\s+sur\s+\d+/i;

/**
 * LE TROISIÈME GABARIT DE BC2E, et il ne relève d'aucune loi.
 *
 * `CERTIFICAT DE SURFACE` n'est ni une Carrez ni une Boutin, et le document
 * l'écrit lui-même en deuxième ligne. Sa maquette diffère sur trois points, et
 * les trois cassent le lecteur des deux autres gabarits :
 *
 *   1. la conclusion tient sur DEUX lignes — `Surface : 94.57 m²` puis
 *      `Autre surface : 0 m²` — au lieu d'une seule phrase ;
 *   2. le tableau n'a que DEUX colonnes de surface, `Surfaces` et
 *      `Autres Surfaces`, contre trois ailleurs ;
 *   3. la colonne `Lot` est REMPLIE — `RDC 1 Veranda 13.99 0` —, alors qu'elle
 *      est vide dans les deux autres gabarits.
 *
 * Un lecteur unique aurait rendu zéro pièce et zéro surface, en silence.
 */
const GABARIT_SANS_LOI = /^CERTIFICAT\s+DE\s+SURFACE\s*:\s*\d+\s+sur\s+\d+/i;

/** Le titre de la 1ʳᵉ page du certificat sans loi. */
const TITRE_SANS_LOI = /^Certificat de Surface\s*$/i;

/**
 * La mise en garde du document sur lui-même — recopiée, jamais reformulée.
 *
 * ⚠️ C'est la ligne la plus importante du gabarit : elle dit que le chiffre ne
 * vaut pas pour une vente en copropriété. Elle doit remonter jusqu'à l'écran.
 */
const MISE_EN_GARDE = /n['’]est pas une LOI CARREZ/i;

/** La conclusion du certificat sans loi : deux lignes, deux nombres. */
const SANS_LOI_SURFACE = /^Surface\s*:\s*([\d\s.,]+?)\s*m/i;
const SANS_LOI_AUTRE = /^Autre surface\s*:\s*([\d\s.,]+?)\s*m/i;

/**
 * Une ligne du certificat sans loi : étage, lot, local, puis DEUX nombres.
 *
 * `RDC 1 WC 1 1.58 0` — le nom de la pièce porte lui-même un chiffre, et c'est
 * le retour arrière du moteur qui tranche : `WC` seul laisserait « 1 1.58 0 »,
 * soit trois nombres pour deux colonnes.
 */
const LIGNE_SANS_LOI =
  /^(\S+)\s+(\S+)\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s*$/;

/** La ligne de totaux du certificat sans loi : deux nombres, pas trois. */
const TOTAUX_SANS_LOI = /^Totaux\s+([\d\s.,]+?)\s*m²\s+([\d\s.,]+?)\s*m²\s*$/i;

/** Les intitulés de ses deux colonnes, tels qu'imprimés. */
const COLONNES_SANS_LOI = ['Surfaces', 'Autres Surfaces'] as const;

/** Le titre de la 1ʳᵉ page, où la loi est nommée entre guillemets. */
const TITRE_CARREZ = /^Attestation de Superficie\s*[«"“]?\s*Loi Carrez/i;
const TITRE_BOUTIN = /^Attestation de Surface Habitable\s*[«"“]?\s*Loi Boutin/i;

/** La conclusion, en tête du volet, sous la rubrique `CONCLUSIONS`. */
const CONCLUSIONS: { motif: RegExp; libelle: string; loi: Loi }[] = [
  {
    motif: /^La superficie privative\s*\(\s*Loi Carrez\s*\)\s*est\s*:\s*([\d\s.,]+?)\s*m/i,
    libelle: 'La superficie privative (Loi Carrez) est',
    loi: 'carrez'
  },
  {
    motif: /^La superficie habitable est\s*:\s*([\d\s.,]+?)\s*m/i,
    libelle: 'La superficie habitable est',
    loi: 'boutin'
  }
];

/**
 * Une ligne du tableau : étage, local, puis TROIS nombres.
 *
 * ⚠️ **RISQUE CONNU, NON TRANCHÉ.** Ce motif exige un premier jeton pour la
 * colonne « Étage ». Dans les 8 volets lus elle est toujours remplie — `RDC`,
 * `01`, `03`, `05`, `SOUS-SOL` —, mais rien ne garantit qu'un logement de
 * plain-pied ne la laisse pas vide. La ligne deviendrait alors
 * `Séjour/Cuisine 26.40 0.00 11.00`, le motif n'y trouverait plus de local, et
 * **la pièce serait perdue sans erreur** — exactement la faute qui a coûté deux
 * pièces sur trois chez LICIEL.
 *
 * On ne rustine pas sur une hypothèse : l'ordre de mission demande de relire,
 * pas de deviner, et aucun volet du corpus n'a encore montré ce cas. Ce qui
 * protège en attendant, c'est le **contrôle d'addition** de l'écran : une pièce
 * perdue fait que la somme ne retombe plus sur le total, et Verrière le dit au
 * lieu de le corriger. Le jour où un volet BC2E affiche un écart de somme,
 * c'est ici qu'il faut regarder d'abord.
 */
const LIGNE = /^(\S+)\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s*$/;

/** La ligne de totaux : trois nombres suivis chacun de leur unité. */
const TOTAUX =
  /^Totaux\s+([\d\s.,]+?)\s*m²\s+([\d\s.,]+?)\s*m²\s+([\d\s.,]+?)\s*m²/i;

/** Propre au Carrez BC2E, après les totaux, sur une ligne à elle. */
const AU_SOL = /^Surface totale au sol\s*\(\s*Carrez et Hors Carrez\s*\)\s*:\s*([\d\s.,]+?)\s*m/i;

/**
 * Les intitulés des deux colonnes supplémentaires, tels qu'imprimés.
 *
 * ⚠️ `Superficie HSP < 1.80M` **n'est pas une colonne de hauteur**, quoi que son
 * intitulé annonce. Mesuré : `RDC Jardin 0.00 14.56 0.00` et `SOUS-SOL Cave 0.00
 * 14.00 0.00` — un jardin n'a pas de hauteur sous plafond. Cette colonne sert de
 * fourre-tout aux surfaces écartées. On recopie donc l'intitulé tel quel et on
 * ne le traduit pas : le renommer « surfaces sous 1,80 m » affirmerait, à la
 * place du rapport, ce que le rapport ne dit pas.
 *
 * L'en-tête est cassé sur trois lignes dans le texte extrait (`Autres
 * superficies` avant la ligne des colonnes, `exclues` après) : le recomposer à
 * la lecture rendrait des libellés tronqués une fois sur deux.
 */
const COLONNES = ['Superficie HSP < 1.80M', 'Autres superficies exclues'] as const;

/**
 * L'en-tête de la colonne retenue, tel que BC2E l'imprime — et il est cassé en
 * deux en Carrez (`Superficie privative « Loi` puis `Carrez »`), d'où ces deux
 * constantes plutôt qu'un recollage qui rendrait un libellé tronqué une fois
 * sur deux.
 */
const COLONNE_RETENUE: Record<'carrez' | 'boutin' | 'aucune', string> = {
  carrez: 'Superficie privative « Loi Carrez »',
  boutin: 'Superficie habitable',
  aucune: 'Surfaces'
};

/** Ce que la mission n'a pas pu contrôler, dans les mots du rapport. */
const RESERVE =
  /(n['’]a pas été fourni|n['’]ayant pas été fournis?|Aucun document probant n['’]ayant été fourni)/i;

function lireTableau(lignes: readonly string[], sansLoi: boolean): PieceMesuree[] {
  const debut = lignes.findIndex((l) => /^DÉTAIL DES SUPERFICIES\s*:/i.test(l.trim()));
  if (debut < 0) return [];

  const pieces: PieceMesuree[] = [];
  for (const brute of lignes.slice(debut + 1)) {
    const ligne = brute.trim();
    if (sansLoi ? TOTAUX_SANS_LOI.test(ligne) : TOTAUX.test(ligne)) break;

    if (sansLoi) {
      const m = LIGNE_SANS_LOI.exec(ligne);
      if (!m) continue;
      const retenue = nombre(m[4]);
      const autre = nombre(m[5]);
      if (retenue === null || autre === null) continue;
      pieces.push({
        /* Le lot est REMPLI dans ce gabarit : on le garde avec l'étage plutôt
           que de le jeter — un logement scindé en lots, c'est ce qui explique
           qu'un certificat ne couvre qu'une partie de la maison. */
        nom: m[3]!.trim(),
        niveau: `${m[1]!.trim()} · lot ${m[2]!.trim()}`,
        retenue,
        autres: [{ libelle: COLONNES_SANS_LOI[1], valeur: autre }],
        commentaire: null,
        source: ligne
      });
      continue;
    }

    const m = LIGNE.exec(ligne);
    if (!m) continue;
    const retenue = nombre(m[3]);
    const hsp = nombre(m[4]);
    const exclues = nombre(m[5]);
    if (retenue === null || hsp === null || exclues === null) continue;
    pieces.push({
      nom: m[2]!.trim(),
      niveau: m[1]!.trim(),
      retenue,
      autres: [
        { libelle: COLONNES[0], valeur: hsp },
        { libelle: COLONNES[1], valeur: exclues }
      ],
      /* Le tableau BC2E n'a pas de colonne de commentaires : aucun des volets
         lus n'en porte. On rend `null`, jamais une chaîne vide. */
      commentaire: null,
      source: ligne
    });
  }
  return pieces;
}

/** Une rubrique à trois états : « Néant », un contenu, ou pas de rubrique. */
function lireParticularites(lignes: readonly string[]): Rubrique<string[]> {
  const debut = lignes.findIndex((l) =>
    /^Particularités liées à ce mesurage\s*:/i.test(l.trim())
  );
  if (debut < 0) return { etat: 'non renseignée' };

  const texte: string[] = [];
  for (const brute of lignes.slice(debut + 1)) {
    const ligne = brute.trim();
    if (!ligne) continue;
    if (/^(Etablie le|Cachet|Signature|RÉSERVE DE PROPRIÉTÉ)/i.test(ligne)) break;
    if (RESERVE.test(ligne)) break;
    if (/^Néant\s*$/i.test(ligne)) return { etat: 'néant', source: lignes[debut]!.trim() };
    texte.push(ligne);
  }
  return texte.length ? { etat: 'renseignée', valeur: texte } : { etat: 'non renseignée' };
}

function lireBC2E(lignes: readonly string[]): LectureMesurage {
  const nettes = lignes.map((l) => l.trim());

  /*
   * La loi se lit sur le PIED, pas sur un mot croisé dans une phrase : c'est le
   * seul endroit où BC2E la nomme sans ambiguïté sur chaque page du volet.
   */
  const pied = nettes.find((l) => PIED_DU_VOLET.test(l));
  const sansLoi = !!pied && GABARIT_SANS_LOI.test(pied);
  /* ⚠️ Trois gabarits, pas deux. Sans le test du certificat sans loi, celui-ci
     tombait dans le `else` et ressortait « Boutin » — une surface habitable
     annoncée sur un document qui déclare n'être encadré par aucun texte. */
  const loi: Loi = sansLoi ? 'aucune' : pied && /CARREZ/i.test(pied) ? 'carrez' : 'boutin';

  const titre = sansLoi ? TITRE_SANS_LOI : loi === 'carrez' ? TITRE_CARREZ : TITRE_BOUTIN;
  const intitule = nettes.find((l) => titre.test(l)) ?? '';
  const miseEnGarde = nettes.find((l) => MISE_EN_GARDE.test(l)) ?? null;

  let surfaceAnnoncee: Surface | null = null;
  const autresTotaux: Surface[] = [];

  if (sansLoi) {
    /*
     * La conclusion tient sur deux lignes. `Autre surface` n'est pas nommée
     * autrement : on garde son intitulé, et on ne lui prête aucun sens — le
     * document ne dit pas ce qu'elle recouvre.
     */
    for (const ligne of nettes) {
      if (!surfaceAnnoncee) {
        const v = nombre(SANS_LOI_SURFACE.exec(ligne)?.[1]);
        if (v !== null) surfaceAnnoncee = { valeur: v, libelle: 'Surface', source: ligne };
      }
      if (!autresTotaux.length) {
        const v = nombre(SANS_LOI_AUTRE.exec(ligne)?.[1]);
        if (v !== null) autresTotaux.push({ valeur: v, libelle: 'Autre surface', source: ligne });
      }
    }
  } else {
    for (const ligne of nettes) {
      for (const { motif, libelle, loi: quelle } of CONCLUSIONS) {
        if (surfaceAnnoncee || quelle !== loi) continue;
        const valeur = nombre(motif.exec(ligne)?.[1]);
        if (valeur !== null) surfaceAnnoncee = { valeur, libelle, source: ligne };
      }
    }

    const ligneTotaux = nettes.find((l) => TOTAUX.test(l));
    if (ligneTotaux) {
      const m = TOTAUX.exec(ligneTotaux)!;
      /* Le premier des trois nombres redit la surface déjà lue en tête : on ne
         le reprend pas, ce n'est pas une seconde mesure. */
      for (const [i, libelle] of COLONNES.entries()) {
        const valeur = nombre(m[i + 2]);
        if (valeur !== null) autresTotaux.push({ valeur, libelle, source: ligneTotaux });
      }
    }
    const ligneAuSol = nettes.find((l) => AU_SOL.test(l));
    if (ligneAuSol) {
      const valeur = nombre(AU_SOL.exec(ligneAuSol)![1]);
      if (valeur !== null)
        autresTotaux.push({
          valeur,
          libelle: 'Surface totale au sol (Carrez et Hors Carrez)',
          source: ligneAuSol
        });
    }
  }

  const dateVisite =
    /Date de visite\s*:\s*(\d{2}\/\d{2}\/\d{4})/i.exec(nettes.join('\n'))?.[1] ?? null;
  const iEtablie = nettes.findIndex((l) => /^Etablie le\s*:?\s*$/i.test(l));
  const dateRapport =
    iEtablie >= 0 ? (/^(\d{2}\/\d{2}\/\d{4})$/.exec(nettes[iEtablie + 1] ?? '')?.[1] ?? null) : null;

  return {
    loi,
    intitule,
    miseEnGarde,
    surfaceAnnoncee,
    autresTotaux,
    pieces: lireTableau(nettes, sansLoi),
    colonneRetenue: sansLoi ? COLONNES_SANS_LOI[0] : COLONNE_RETENUE[loi],
    /* Rubrique propre à LICIEL : BC2E n'en imprime aucune. Le dire « non
       renseignée » est exact ; le dire « néant » ferait d'un silence une
       bonne nouvelle. */
    piecesNonVisitees: { etat: 'non renseignée' },
    particularites: lireParticularites(nettes),
    reserves: [...new Set(nettes.filter((l) => RESERVE.test(l)))],
    dateVisite,
    dateRapport
  };
}

export const LECTEUR_MESURAGE_BC2E: Lecteur<LectureMesurage> = {
  editeur: 'BC2E',
  quoi: 'mesurage',
  reconnait(lignes) {
    const pied = lignes.map((l) => l.trim()).find((l) => PIED_DU_VOLET.test(l));
    return pied ? { preuve: pied } : null;
  },
  lire: lireBC2E
};
