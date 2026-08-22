<script lang="ts">
  /**
   * Le retour au client, comme on le ferait à l'étude avant de signer.
   *
   * Trois temps, toujours les mêmes : ce que le dossier établit, où se situe le
   * bien, et ce qu'il faut faire. Rien n'est inventé — chaque phrase découle
   * d'une donnée lue dans le rapport, et ce que le rapport ne dit pas est
   * signalé comme tel.
   *
   * Le devoir de conseil est ici une contrainte d'écriture : on ne se contente
   * pas de rapporter, on dit ce qui engage, ce qui coûte et ce qui se négocie.
   */
  import type { Analyse, TypeDiag } from '../lib/modele';
  import MotsExpliques from './MotsExpliques.svelte';
  import RubanDpe from './RubanDpe.svelte';
  import DoubleSeuil from './schemas/DoubleSeuil.svelte';
  import { motsEmployes } from '../lib/lexique';
  import { libelleCourt } from '../lib/libelle';
  import { conseil, tousLesPoints } from '../lib/conseil';
  import { APPS } from '../lib/apps';

  /**
   * `surOuvrirDiagnostic` réalise le §13 de l'ordre de mission : « chaque carte
   * doit pouvoir renvoyer vers le diagnostic concerné ». C'est la navigation
   * croisée Diagnostic ↔ Explication ↔ Conseil ↔ Professionnel.
   */
  const {
    analyse,
    surOuvrirDiagnostic
  }: { analyse: Analyse; surOuvrirDiagnostic?: (type: TypeDiag) => void } = $props();

  const dpe = $derived(analyse.diagnostics.find((d) => d.type === 'dpe') ?? null);
  const lettre = $derived(dpe?.schema?.genre === 'dpe' ? dpe.schema.finale : null);
  /*
   * « Maison ou appartement » ne se lit plus ici. Cette vue s'en servait pour
   * décider si l'audit énergétique devait être annoncé ; c'est le DPE qui le
   * dit désormais, dans ses propres gestes, avec la condition écrite dans la
   * phrase — « si c'est une maison ». La donnée appartient au diagnostic.
   */

  /**
   * Le descriptif : de quel bien on parle, en une phrase.
   *
   * Adresse, nature, année, surface — les quatre choses qu'on annonce à voix
   * haute en ouvrant un dossier. Tout vient du rapport ; ce qui manque est
   * simplement omis.
   */
  const descriptif = $derived.by(() => {
    const faits = analyse.diagnostics.flatMap((d) => d.faits);
    const cherche = (motif: RegExp): string | undefined =>
      faits.find((f) => motif.test(f.libelle))?.valeur;

    const nature = cherche(/type de bien/i) ?? 'Logement';
    const annee = cherche(/ann[ée]e de construction/i);
    const surface = cherche(/superficie privative|surface de r[ée]f[ée]rence|surface habitable/i);

    const bouts = [nature];
    if (surface) bouts.push(`de ${surface}`);
    // L'adresse n'entre plus dans la phrase : elle ouvre la page dans le
    // bandeau du bien, et l'en-tête d'impression la porte de son côté. La
    // redire ici la donnait une troisième fois.
    // Les rapports écrivent tantôt « 1974 », tantôt « Avant 1948 » : la
    // préposition ne se colle donc pas les yeux fermés.
    if (annee) bouts.push(/^\s*(avant|après)/i.test(annee) ? `construit ${annee.toLowerCase()}` : `construit en ${annee}`);
    return `${bouts.join(' ')}.`;
  });

  /**
   * L'état descriptif : les caractéristiques du bien, relevées une à une.
   *
   * On ne garde que ce qui décrit le logement — sa nature, son âge, ses
   * surfaces, son enveloppe. Les compteurs de contrôle et les références de
   * dossier n'ont rien à faire ici : ils décrivent la mission, pas le bien.
   */
  const DECRIT = /type de bien|ann[ée]e de construction|surface|superficie|[ée]tage|niveau/i;
  const ECARTE = /contr[ôo]l|mesur|zones|unit[ée]s|risques concernant/i;

  const caracteristiques = $derived.by<{ libelle: string; valeur: string }[]>(() => {
    const liste: { libelle: string; valeur: string }[] = [];
    const vus = new Set<string>();

    for (const fait of analyse.diagnostics.flatMap((d) => d.faits)) {
      if (!DECRIT.test(fait.libelle) || ECARTE.test(fait.libelle)) continue;
      const cle = fait.libelle.toLowerCase();
      if (vus.has(cle)) continue;
      vus.add(cle);
      liste.push({ libelle: fait.libelle, valeur: fait.valeur });
    }

    // L'enveloppe fait partie du descriptif : c'est elle qu'on décrit quand on
    // parle de « matériaux » dans un état des lieux.
    if (dpe?.schema?.genre === 'dpe') {
      for (const [paroi, etat] of Object.entries(dpe.schema.isolation)) {
        if (etat === 'inconnu') continue;
        // « avec » et « sans » ne s'accordent pas : « menuiseries isolé »
        // sautait aux yeux, et l'accord dépendait du genre de chaque paroi.
        liste.push({
          libelle: NOM_PAROI[paroi] ?? paroi,
          valeur: etat === 'isole' ? 'avec isolant' : 'sans isolant'
        });
      }
    }

    return liste;
  });

  const NOM_PAROI: Record<string, string> = {
    murs: 'Murs',
    toit: 'Toiture',
    plancher: 'Plancher bas',
    fenetres: 'Menuiseries'
  };

  /** Les références du dossier, pour la ligne sous le trait de la page de garde. */
  const reference = $derived(
    analyse.diagnostics
      .flatMap((d) => d.faits)
      .find((f) => /num[ée]ro de dossier|dossier n/i.test(f.libelle))?.valeur ?? null
  );

  const visite = $derived(
    analyse.diagnostics.find((d) => d.date)?.date ??
      analyse.diagnostics
        .flatMap((d) => d.faits)
        .find((f) => /date de la visite|date du rep[ée]rage/i.test(f.libelle))?.valeur ??
      null
  );

  /**
   * Pourquoi ce logement-là perd sa chaleur.
   *
   * On nomme les parois que le rapport donne sans isolant, on rappelle l'ordre
   * de grandeur de chacune, et on dit par quoi commencer. Une paroi que le
   * rapport ne renseigne pas est annoncée comme non renseignée : c'est une
   * information, pas un trou.
   */
  const PART: Record<string, string> = {
    toit: 'le toit, premier poste de perte dans une maison',
    murs: 'les murs, deuxième poste et le plus coûteux à traiter',
    plancher: 'le plancher bas, surtout au-dessus d’une cave ou d’un vide sanitaire',
    fenetres: 'les fenêtres, qui pèsent moins qu’on ne le croit'
  };

  const pourquoi = $derived.by(() => {
    if (dpe?.schema?.genre !== 'dpe') return '';
    const iso = dpe.schema.isolation;

    const nues = Object.entries(iso).filter(([, e]) => e === 'nonIsole').map(([p]) => PART[p] ?? p);
    const inconnues = Object.entries(iso).filter(([, e]) => e === 'inconnu').length;

    const bouts: string[] = [];
    if (nues.length) {
      bouts.push(
        `Le rapport relève sans isolant : ${nues.join(' ; ')}. C’est de là que vient l’essentiel de la consommation calculée.`
      );
      if (nues.some((n) => n.startsWith('le toit'))) {
        bouts.push('Commencez par les combles : c’est le poste le moins cher et le plus rentable.');
      }
    } else {
      bouts.push('Le rapport ne relève aucune paroi sans isolant.');
    }
    if (inconnues) {
      bouts.push(
        inconnues > 1
          ? `${inconnues} parois ne sont pas renseignées dans le rapport : le diagnostiqueur n’a pas pu les observer.`
          : 'Une paroi n’est pas renseignée dans le rapport : le diagnostiqueur n’a pas pu l’observer.'
      );
    }
    return bouts.join(' ');
  });

  /**
   * D'où sort la lettre du DPE, et les chiffres qui décrivent le logement.
   *
   * C'est la question que tout le monde pose et à laquelle le rapport ne répond
   * jamais : on divise une consommation par une surface, on regarde la tranche.
   * Le reste — les parois nues, les postes — explique pourquoi la consommation
   * est là où elle est.
   */
  /**
   * Les tranches de l'étiquette énergie — pour les logements de plus de 40 m².
   *
   * Elles ne valent pas partout. L'arrêté du 25 mars 2024, en vigueur depuis le
   * 1er juillet 2024, donne aux logements dont la surface de référence est
   * inférieure ou égale à 40 m² des seuils qui leur sont propres, établis
   * surface par surface entre 8 et 40 m² et interpolés entre deux valeurs. Un
   * studio de vingt-cinq mètres carrés ne se lit donc pas sur cette échelle-ci.
   *
   * On ne recopie pas ce tableau-là : il fait trente-trois lignes et deux
   * colonnes, et une valeur mal relevée vaudrait moins que rien. Sous 40 m², on
   * dit donc la lettre et la consommation — que le rapport donne — sans
   * prétendre situer le logement dans une tranche qu'on n'affichera pas.
   */
  const TRANCHE: Record<string, string> = {
    A: 'moins de 70',
    B: 'de 70 à 110',
    C: 'de 110 à 180',
    D: 'de 180 à 250',
    E: 'de 250 à 330',
    F: 'de 330 à 420',
    G: 'plus de 420'
  };

  /** La surface de référence, quand le rapport la donne — en m². */
  const surfaceReference = $derived.by<number | null>(() => {
    const brut = analyse.diagnostics
      .flatMap((d) => d.faits)
      .find((f) => /surface de r[ée]f[ée]rence|surface habitable/i.test(f.libelle))?.valeur;
    const n = Number.parseFloat((brut ?? '').replace(',', '.').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
  });

  /** Sous 40 m², les seuils de l'échelle ne sont plus ceux-là. */
  const petiteSurface = $derived(surfaceReference !== null && surfaceReference <= 40);

  const chiffres = $derived.by<{ quoi: string; donc: string[] }[]>(() => {
    if (dpe?.schema?.genre !== 'dpe' || !lettre) return [];

    const donc: string[] = [];
    const surface = dpe.faits.find((f) => /surface/i.test(f.libelle))?.valeur;
    const conso = dpe.schema.energie;
    const climat = dpe.schema.climat;

    if (conso) {
      // La tranche n'est citée que là où elle s'applique : au-dessus de 40 m².
      const t = petiteSurface ? undefined : TRANCHE[conso.lettre];
      donc.push(
        `${conso.valeur} ${conso.unite}${surface ? ` — la consommation calculée divisée par ${surface}` : ''}. Ça tombe dans la tranche ${conso.lettre}${t ? ` (${t})` : ''}.`
      );
      if (petiteSurface) {
        donc.push(
          'Ce logement fait 40 m² ou moins : depuis le 1ᵉʳ juillet 2024, les seuils des étiquettes sont adaptés à sa surface, et ne sont pas ceux des logements plus grands.'
        );
      }
    }
    if (climat && conso && climat.lettre > conso.lettre) {
      donc.push(`Le CO₂ note ${climat.lettre} : c’est lui qui tire la lettre vers le bas.`);
    }
    for (const poste of dpe.schema.postes.slice(0, 5)) {
      donc.push(`${poste.nom} : ${Math.round(poste.kwh)} kWh${poste.cout ? ` — ${poste.cout}` : ''}.`);
    }

    return [{ quoi: `Classe ${lettre}`, donc }];
  });

  /**
   * La synthèse diagnostic par diagnostic vivait ici, en huit encarts
   * dépliables — et une seconde fois dans la vue « Les diagnostics », avec le
   * dessin en plus. Le lecteur lisait donc deux fois les mêmes huit verdicts,
   * dans deux vues qui prétendaient dire autre chose. Elle est partie là-bas,
   * en sommaire ancré : c'est sa place, puisque c'est là que se trouve le
   * détail qu'elle annonce. Cette vue-ci parle du bien et du conseil.
   */

  /** Ce que le dossier établit, diagnostic par diagnostic, sans commentaire. */
  const etat = $derived.by<string[]>(() => {
    const lignes: string[] = [];
    for (const d of analyse.diagnostics) {
      // Le verdict garde sa casse : « Classe C » ne devient pas « classe c ».
      const dit = libelleCourt(d);
      lignes.push(`${d.titre} : ${dit.charAt(0).toLowerCase() + dit.slice(1)}.`);
    }
    return lignes;
  });

  /**
   * Le conseil, dans l'ordre où il faut s'en occuper.
   *
   * Il était écrit ici, à la main, et il ne connaissait que trois choses : les
   * contrôles du dossier, les anomalies d'électricité et de gaz, et la lettre
   * du DPE. Six des neuf diagnostics n'y arrivaient donc jamais — amiante,
   * plomb, termites, état des risques, Carrez, assainissement —, alors que
   * chacun calcule ses gestes, phrase par phrase et sourcés au texte. Un
   * logement avec du plomb en classe 3, donc des travaux imposés par le code de
   * la santé publique, n'en disait pas un mot au lecteur qui venait ici
   * chercher ce qu'il fallait faire.
   *
   * Le rangement vit désormais dans `lib/conseil.ts`, où il se teste : la vue
   * ne décide plus de ce qui mérite d'être dit.
   */
  const leConseil = $derived(conseil(analyse));
  /** Les termes employés dans ce document-ci, pour l'annexe. */
  const lexique = $derived(motsEmployes([pourquoi, ...tousLesPoints(leConseil), ...etat]));

  /**
   * LE BANDEAU DES DIAGNOSTICS — la carte du dossier.
   *
   * Un onglet par rapport, avec son verdict en trois mots et sa pastille de
   * gravité. Le nom court et le verdict viennent des mêmes sources que la
   * grille d'accueil et le voyant (`apps.ts`, `libelle.ts`) : le lecteur
   * retrouve le même mot d'un écran à l'autre, sinon il croit lire deux
   * choses.
   *
   * `cible` est l'ancre du premier groupe de conseil où ce diagnostic parle.
   * Elle vaut `null` quand le dossier ne dit rien de lui — l'onglet reste alors
   * affiché, mais éteint : un diagnostic présent doit se voir même quand il n'y
   * a rien à en faire.
   */
  const bandeau = $derived.by(() =>
    analyse.diagnostics.map((d) => ({
      type: d.type,
      nom: APPS[d.type]?.nom ?? d.titre,
      dit: libelleCourt(d),
      gravite: d.gravite,
      cible: leConseil.diagnostics.some((c) => c.origine === d.type) ? ancre(d.type) : null
    }))
  );

  /** L'identifiant du bloc d'un diagnostic : une seule règle, aux deux bouts. */
  function ancre(origine: string): string {
    return `conseil-${origine}`;
  }

  /**
   * OÙ SE POSE CHAQUE POINT SUR LA VERRIÈRE.
   *
   * Ordre d'Aude (22/08/2026) : « pose des raccourcis sur la verrière, on
   * clique dessus et on a le conseil ». C'est le schéma du visuel de
   * référence — les pastilles dorées sur la structure, les conseils dessous.
   *
   * Chaque point vise l'endroit du bâti que son diagnostic concerne, et non une
   * place décorative : la toiture en haut, les menuiseries sur la façade
   * vitrée, le soubassement en bas pour ce qui touche aux revêtements et au
   * sol. Un lecteur qui clique le toit doit tomber sur la toiture.
   *
   * Les coordonnées sont en pourcentage de l'image, donc indépendantes de sa
   * taille d'affichage. Un domaine absent de cette table n'a PAS de point :
   * mieux vaut pas de pastille qu'une pastille posée n'importe où.
   */
  const POINTS: Record<string, { x: number; y: number }> = {
    /* Le faîtage : ce qui couvre. */
    couvreur: { x: 47, y: 10 },
    /* La pente vitrée, à droite : le verre et ses menuiseries. */
    menuisier: { x: 76, y: 27 },
    miroitier: { x: 84, y: 40 },
    /* Le mur pignon, à gauche. */
    facadier: { x: 10, y: 33 },
    isolation: { x: 16, y: 52 },
    /* L'intérieur : ce qui s'y branche et ce qui s'y respire. */
    electricite: { x: 58, y: 47 },
    ventilation: { x: 34, y: 42 },
    chauffage: { x: 44, y: 66 },
    gaz: { x: 66, y: 62 },
    eau: { x: 30, y: 70 },
    /* Le soubassement et le sol : revêtements, terrain, réseaux. */
    plomb: { x: 20, y: 82 },
    amiante: { x: 74, y: 80 },
    termites: { x: 62, y: 88 },
    erp: { x: 44, y: 94 },
    assainissement: { x: 82, y: 92 },
    carrez: { x: 8, y: 68 },
    dpe: { x: 88, y: 14 },
    dossier: { x: 92, y: 60 }
  };

  /**
   * À quel point rattacher une carte.
   *
   * Les cartes de travaux du DPE portent le métier dans leur clé — c'est lui
   * qui commande l'endroit, puisqu'un couvreur ne travaille pas là où travaille
   * un chauffagiste. Les autres suivent leur diagnostic.
   */
  function pointDe(carte: { cle: string; origine: string }): { x: number; y: number } | null {
    const parMetier: [RegExp, string][] = [
      [/couvreur/i, 'couvreur'],
      [/miroitier/i, 'miroitier'],
      [/menuisier/i, 'menuisier'],
      [/fa[çc]adier/i, 'facadier'],
      [/isolation/i, 'isolation'],
      [/ventilation/i, 'ventilation'],
      [/climaticien|chauffagiste/i, 'chauffage'],
      [/plombier/i, 'eau'],
      [/renouvelables/i, 'couvreur'],
      [/[ée]lectricien/i, 'electricite']
    ];
    if (carte.cle.startsWith('carte-travaux-')) {
      for (const [motif, cle] of parMetier) {
        if (motif.test(carte.cle)) return POINTS[cle] ?? null;
      }
      return null;
    }
    return POINTS[carte.origine] ?? null;
  }

  /**
   * LES PASTILLES, ECARTEES QUAND ELLES SE TOUCHENT.
   *
   * Ordre d'Aude (22/08/2026) : « decalage auto quand deux points se
   * touchent ». Le cas se produit des qu'un diagnostic appelle deux metiers :
   * l'electricite d'un dossier reel porte une carte pour le diagnostiqueur, qui
   * doit revenir voir la cave, et une pour l'electricien, qui doit chiffrer.
   * Les deux visaient le meme point du bati, et la seconde disparaissait sous
   * la premiere — donc devenait inaccessible a la souris.
   *
   * On garde le point d'origine pour la premiere pastille : c'est elle qui doit
   * tomber juste. Les suivantes se posent en couronne autour d'elle, a la
   * distance minimale qui les separe — un tour complet tous les six voisins,
   * puis un second anneau plus large. Le rattachement au bati reste lisible :
   * une pastille ecartee de 8 % reste sur la meme partie de la verriere.
   *
   * La comparaison se fait sur la distance reelle entre centres, pas sur
   * l'egalite des coordonnees : deux points a 1 % l'un de l'autre se
   * chevauchent tout autant que deux points confondus.
   */
  /**
   * L'ecart minimal entre deux centres, en pourcentage de l'image.
   *
   * A 9 %, les deux pastilles de l'electricite se touchaient bord a bord :
   * mesure, 41 px d'ecart pour 40 px de diametre. Cliquables, mais collees, et
   * l'oeil y lisait une seule tache. A 13 %, elles laissent une quinzaine de
   * pixels entre elles sur un cadre de 430 px — deux objets, pas un.
   */
  const ECART = 13;

  const pastilles = $derived.by(() => {
    const posees: { x: number; y: number }[] = [];

    const libre = (x: number, y: number): boolean =>
      posees.every((q) => Math.hypot(q.x - x, q.y - y) >= ECART);

    /* Borner dans l'image : une pastille poussee hors du cadre serait coupee. */
    const dansLeCadre = (v: number): number => Math.min(96, Math.max(4, v));

    const liste: { carte: (typeof leConseil.cartes)[number]; x: number; y: number }[] = [];

    for (const carte of leConseil.cartes) {
      const point = pointDe(carte);
      if (!point) continue;

      let x = point.x;
      let y = point.y;

      /* Deux anneaux de six places suffisent : au-dela, c'est que la table des
         points est a revoir, pas que le decalage manque de rayon. */
      for (let essai = 0; essai < 12 && !libre(x, y); essai++) {
        const rayon = ECART * (1 + Math.floor(essai / 6)) * 1.05;
        const angle = ((essai % 6) * Math.PI) / 3;
        x = dansLeCadre(point.x + Math.cos(angle) * rayon);
        y = dansLeCadre(point.y + Math.sin(angle) * rayon);
      }

      posees.push({ x, y });
      liste.push({ carte, x, y });
    }

    return liste;
  });

  /**
   * La carte ouverte par un clic sur la verrière.
   *
   * Cliquer un point ne se contente pas d'amener l'œil : il DÉPLIE le conseil,
   * sinon on arrive devant une carte fermée et le geste n'a rien donné.
   */
  let carteOuverte = $state<string | null>(null);

  function ouvrirDepuisLaVerriere(cle: string, origine: string): void {
    carteOuverte = cle;
    allerAu(ancre(origine));
  }

  /**
   * Les niveaux de recommandation, §7 de l'ordre de mission.
   *
   * « Le langage doit refléter exactement le niveau de certitude disponible. »
   * Aucun de ces libellés n'affirme à la place du rapport : le plus engageant,
   * « sécurité », n'est employé que là où le rapport a lui-même mis une
   * installation hors service.
   */
  const NIVEAUX: Record<string, string> = {
    urgence: 'Sécurité — sans attendre',
    necessaire: 'Intervention nécessaire',
    controle: 'Contrôle complémentaire',
    envisager: 'Intervention à envisager'
  };

  /**
   * Amener l'œil sur le groupe demandé.
   *
   * `block: 'center'` plutôt que `'start'` : la barre du site est fixe, et une
   * cible posée en haut passerait dessous. Centrer évite d'avoir à connaître sa
   * hauteur.
   *
   * ⚠️ PAS DE `behavior: 'smooth'` ICI, et ce n'est pas un oubli. Mesuré le
   * 21/08/2026 dans cette vue : le défilement doux est un NO-OP dans le
   * conteneur `.dedans-vue` — `scrollTop` ne bouge pas d'un pixel, quand le
   * même appel en `'auto'` amène la cible au centre. Le bouton semblait donc
   * mort alors que son gestionnaire s'exécutait. `Dicodiag.svelte` fait déjà
   * sans, et son sommaire fonctionne.
   */
  function allerAu(id: string | null): void {
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: 'center' });
  }

  /**
   * La numérotation des sections, calculée et non écrite à la main.
   *
   * Les chiffres romains étaient posés en dur de I à VII. Comme quatre sections
   * sur sept sont conditionnelles, un dossier sans DPE affichait I, II, puis V :
   * un document dont les articles sautent se lit comme un document amputé.
   */
  const ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  const numeros = $derived.by<Record<string, string>>(() => {
    const presentes = [
      caracteristiques.length ? 'descriptif' : null,
      dpe?.schema?.genre === 'dpe' ? 'chaleur' : null,
      lettre ? 'echelle' : null,
      chiffres.length ? 'classe' : null,
      'conseil',
      lexique.length ? 'mots' : null
    ].filter((c): c is string => c !== null);

    return Object.fromEntries(presentes.map((cle, i) => [cle, ROMAINS[i] ?? String(i + 1)]));
  });
</script>

<section class="notaire">
  <!-- La page de garde. Un document qu'une agence pose sur une table se
       reconnaît à son en-tête : le filet, l'objet, l'adresse en grand, et la
       ligne de références sous le trait. -->
  <header class="garde">
    <div class="ligne-haute">
      <p class="objet">Dossier de diagnostic technique</p>
      <!-- Le document s'emporte : chez le notaire, face au vendeur, à la banque. -->
      <button type="button" class="editer" onclick={() => window.print()}>
        Éditer le document
      </button>
    </div>

    <!--
      L'adresse en grand a quitté l'écran : elle ouvre désormais la page, dans
      le bandeau du bien, au-dessus du verdict. La répéter ici la donnait deux
      fois à quelques centimètres d'écart.

      À l'impression, en revanche, cette page redevient la première feuille
      d'un document qu'on pose sur une table : elle doit porter son adresse.
      D'où ce titre, réservé au papier.
    -->
    <h1 class="adresse au-papier">{analyse.bien.adresse || 'Le bien'}</h1>
    {#if analyse.bien.commune}
      <p class="commune au-papier">{analyse.bien.commune}</p>
    {/if}

    <p class="sous-titre">{descriptif}</p>

    <dl class="references">
      {#if reference}
        <div><dt>Référence</dt><dd>{reference}</dd></div>
      {/if}
      {#if visite}
        <div><dt>Visite</dt><dd>{visite}</dd></div>
      {/if}
      <div><dt>Diagnostics</dt><dd>{analyse.diagnostics.length}</dd></div>
      <div><dt>Pages du rapport</dt><dd>{analyse.nbPages}</dd></div>
    </dl>

    <RubanDpe epaisseur={5} />
  </header>

  <!--
    LE BANDEAU DES DIAGNOSTICS — la carte du dossier, en tête du conseil.

    Le conseil s'ouvrait sur la description du bien, puis enchaînait les
    sections : on lisait « à régulariser », « à négocier », sans jamais voir
    combien de rapports composent le dossier ni ce que chacun dit. La réponse
    existait pourtant — elle était calculée pour l'annexe des mots employés, et
    affichée nulle part.

    Un onglet par rapport, sa pastille de gravité, son verdict en trois mots.
    Et il conduit : cliquer amène aux gestes de ce diagnostic-là, plus bas.
    C'est la même forme que le bandeau de la vue « Les diagnostics » — deux
    dessins différents pour la même chose feraient croire à deux choses.
  -->
  {#if bandeau.length}
    <nav class="bandeau-diags" aria-label="Les diagnostics du dossier">
      {#each bandeau as d (d.type)}
        <button
          type="button"
          class="onglet-diag {d.gravite}"
          disabled={!d.cible}
          onclick={() => allerAu(d.cible)}
        >
          <span class="pastille" aria-hidden="true"></span>
          <span class="nom-onglet">{d.nom}</span>
          <span class="dit-onglet">{d.dit}</span>
        </button>
      {/each}
    </nav>
  {/if}

  <div class="feuille">
    {#if caracteristiques.length}
      <!--
        L'état descriptif a quitté cet endroit : il ouvre désormais la page,
        au-dessus du verdict. C'est l'ordre d'un dossier — on présente le bien,
        on le décrit, puis on l'analyse. Le garder ici le donnait deux fois.

        Le papier, lui, n'a pas ce bandeau : l'annexe y reste.
      -->
      <div class="au-papier">
        <!-- « Les caractéristiques du bien », et non plus « l'état
             descriptif » : ce nom désigne désormais, en tête de page, ce que
             chaque diagnostic conclut. Deux sections du même document ne
             peuvent pas porter le même titre en disant deux choses. -->
        <h2><span class="num">{numeros.descriptif}</span>Les caractéristiques du bien</h2>
        <dl class="caracteristiques">
          {#each caracteristiques as c (c.libelle)}
            <div>
              <dt>{c.libelle}</dt>
              <dd>{c.valeur}</dd>
            </div>
          {/each}
        </dl>
      </div>
    {/if}

    <!--
      LE SCHÉMA DES DÉPERDITIONS ET LE POSITIONNEMENT SONT PARTIS.

      Ordre d'Aude (22/08/2026) : « on dégage le schéma moche déperdition et
      note ». Ils décrivaient le logement — par où la chaleur s'en va, où le
      bien se situe sur l'échelle — et cette page-ci ne décrit rien : elle dit
      ce qu'il faut faire. Le §3 de l'ordre de mission l'écrit noir sur blanc :
      « cette page ne doit pas devenir une deuxième synthèse du diagnostic ».

      Les deux vivent toujours, à leur place : la vue « Les diagnostics » porte
      le schéma des déperditions, et l'écran DPE son positionnement.
    -->

    {#if chiffres.length}
      <!-- Les chiffres du logement, à leur place : juste après ce qui les
           produit. Ils étaient plus bas dans un relevé séparé, qui répétait
           déjà la moitié du conseil. -->
      <h2 class="apres"><span class="num">{numeros.classe}</span>D’où sort cette classe</h2>

      <!-- Les deux étiquettes avant les chiffres : c'est le mécanisme qui
           explique la lettre, et il se voit mieux qu'il ne se raconte. « Je
           consomme peu et je suis F » n'a de réponse qu'ici. -->
      {#if dpe?.schema?.genre === 'dpe'}
        <div class="planche-seuil">
          <DoubleSeuil
            energie={dpe.schema.energie}
            climat={dpe.schema.climat}
            finale={dpe.schema.finale}
          />
        </div>
      {/if}

      <ul class="chiffres">
        {#each chiffres as c (c.quoi)}
          <li>
            <p class="valeur">{c.quoi}</p>
            <ul class="detail">
              {#each c.donc as ligne}
                <li><MotsExpliques texte={ligne} /></li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>
    {/if}

    <!--
      ═══════════════════════════════════════════════════════════════════════
      MODULE « CONSEILS & PROFESSIONNELS »
      ═══════════════════════════════════════════════════════════════════════

      Ordre de mission du 22/08/2026. La page ne dit plus ce qui a été constaté
      — c'est le travail du diagnostic — mais UNE SEULE CHOSE : que faire
      maintenant, et par qui.

      Trois règles commandent tout ce qui suit :

        §2  Une carte n'apparaît que si le rapport la justifie. Un diagnostic
            sain n'en produit aucune.
        §12 Un métier, une carte. Cinq anomalies électriques donnent une carte
            Électricité qui dit « 5 points relevés », pas cinq cartes.
        §20 Aucune carte n'est dépliée par défaut. On ouvre ce qu'on veut lire.
    -->
    <!--
      ═══════════════════════════════════════════════════════════════════════
      MODULE « CONSEILS & PROFESSIONNELS » — au visuel de référence
      ═══════════════════════════════════════════════════════════════════════

      Ordre du 22/08/2026 : « VISUEL EXACT ». La composition, la typographie et
      la charte du visuel fourni sont reprises telles quelles — grand titre
      sérif vert profond, surtitre sable en capitales, cartes ivoire à médaillon
      circulaire, encart vert plein au centre, bandeau des bénéfices, ruban de
      mention légale en pied.

      Ce qui reste dynamique, et doit le rester : le NOMBRE de cartes, leur
      domaine, leur niveau, leur métier. Le visuel montre huit cartes de
      démonstration ; un dossier sans anomalie électrique n'en affiche aucune
      pour l'électricité (§2). Recopier la page telle quelle afficherait du faux
      contenu, ce que le §18 interdit.
    -->
    <section class="module-conseils" aria-labelledby="titre-conseils">
      <header class="entete-conseils">
        <div class="mots-entete">
          <h2 class="titre-module" id="titre-conseils">
            <span class="num au-papier">{numeros.conseil}</span>
            Conseils pour ce bien
          </h2>
          <p class="surtitre">Nos recommandations globales</p>
          <p class="intro-conseils">
            À la lecture de vos diagnostics, voici les points qui peuvent peser sur la sécurité, la
            performance et la valeur du bien — et le professionnel à consulter pour chacun.
          </p>

          {#if leConseil.aRegler.length}
            <!--
              L'encart au filet : ce qui fait repousser une signature. Les cartes
              sont rangées par urgence, mais repliées (§20) elles ne le MONTRENT
              pas, et le §189 demande qu'on sache en dix secondes sur quoi agir.
            -->
            <aside class="a-regler" aria-label="Ce qui bloque la signature">
              <p class="titre-regler">
                À régulariser avant la signature
                <span class="combien">{leConseil.aRegler.length}</span>
              </p>
              <ul>
                {#each leConseil.aRegler as ligne, i (i)}
                  <li>
                    <button type="button" onclick={() => allerAu(ancre(ligne.origine))}>
                      <span class="ou">{ligne.provenance}</span>
                      <span class="quoi-regler">{ligne.texte}</span>
                    </button>
                  </li>
                {/each}
              </ul>
            </aside>
          {/if}
        </div>

        <!-- La pastille verte du visuel, en haut à droite. -->
        <aside class="accroche">
          <p>Anticiper aujourd’hui, c’est sécuriser demain et valoriser votre bien.</p>
        </aside>
      </header>

      <!--
        LA VERRIÈRE.

        Ordre d'Aude : « je veux la verrière ». C'est l'illustration du visuel
        de référence, découpée dans le pack et servie en WebP — 82 Ko là où le
        PNG d'origine en pesait 1 390.

        Elle est décorative et le dit (`alt` vide, `aria-hidden`) : un lecteur
        d'écran n'a rien à y gagner, et la page doit se lire entière sans elle.
        `loading="lazy"` parce qu'elle n'est jamais le premier écran.
      -->
      <figure class="la-verriere">
        <div class="cadre-verriere">
          <img
            src="./verriere-conseils.webp"
            alt=""
            aria-hidden="true"
            width="860"
            height="980"
            decoding="async"
          />

          <!--
            LES RACCOURCIS SUR LA VERRIÈRE.

            Une pastille par conseil, posée à l'endroit du bâti qu'elle
            concerne. Un clic déplie le conseil et amène l'œil dessus.

            Ce sont de VRAIS boutons, pas des zones cliquables dessinées : ils
            se prennent au clavier, portent le nom de leur domaine, et la liste
            des cartes reste dessous pour qui ne peut pas viser une pastille.
          -->
          {#each pastilles as { carte, x, y } (carte.cle)}
            <button
              type="button"
              class="point {carte.niveau}"
              style:left="{x}%"
              style:top="{y}%"
              aria-label="{carte.domaine} — {NIVEAUX[carte.niveau]}"
              onclick={() => ouvrirDepuisLaVerriere(carte.cle, carte.origine)}
            >
              <span
                class="picto-point"
                aria-hidden="true"
                style:--picto={carte.origine !== 'dossier' && APPS[carte.origine]?.picto
                  ? `url(./pictos/${APPS[carte.origine].picto}.svg)`
                  : 'url(./pictos/conseil.svg)'}
              ></span>
            </button>
          {/each}
        </div>
        <figcaption>Cliquez un point de la verrière pour ouvrir le conseil.</figcaption>
      </figure>

      {#if leConseil.cartes.length}
        <div class="cartes">
          {#each leConseil.cartes as carte (carte.cle)}
            <article class="carte {carte.niveau}" id={ancre(carte.origine)}>
              <!-- Le médaillon circulaire du visuel : le pictogramme de la
                   mini-application, en crème sur le vert profond. -->
              <span
                class="medaillon"
                aria-hidden="true"
                style:--picto={carte.origine !== 'dossier' && APPS[carte.origine]?.picto
                  ? `url(./pictos/${APPS[carte.origine].picto}.svg)`
                  : 'url(./pictos/conseil.svg)'}
              ></span>

              <p class="domaine">{carte.domaine}</p>
              <p class="niveau"><span>{NIVEAUX[carte.niveau]}</span></p>

              <!-- L'affichage initial : une ligne, et rien d'autre (§123). -->
              <p class="conseil-ligne">{carte.conseil}</p>

              <div class="pro">
                <p class="pro-qui">{carte.recours.qui}</p>
                <p class="pro-quoi">{carte.recours.quoi}</p>
                <!--
                  Le bouton dit ce qu'il ne sait pas encore faire. L'annuaire du
                  §110 n'existe pas, et promettre une mise en relation qu'on ne
                  sait pas tenir vaut moins que pas de bouton.
                -->
                <button type="button" class="trouver" disabled>
                  Trouver un professionnel
                  <span class="bientot">bientôt</span>
                </button>
              </div>

              <div class="pieds-carte">
                <details class="pourquoi" open={carteOuverte === carte.cle}>
                  <summary>
                    Pourquoi ?
                    <span class="combien-points">
                      {carte.combien} point{carte.combien > 1 ? 's' : ''} relevé{carte.combien > 1
                        ? 's'
                        : ''}
                    </span>
                  </summary>
                  <ul>
                    {#each carte.pourquoi as point, i (i)}
                      <li><MotsExpliques texte={point} /></li>
                    {/each}
                  </ul>

                  {#if carte.sources.length}
                    <p class="titre-sources">Les textes qui le disent</p>
                    <ul class="sources">
                      {#each carte.sources as s (s.reference + s.url)}
                        <li>
                          <a href={s.url} target="_blank" rel="noopener noreferrer">{s.reference}</a>
                          <span class="lu">lu le {new Date(s.luLe).toLocaleDateString('fr-FR')}</span>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </details>

                {#if carte.echeance}
                  <span class="echeance" class:perime={carte.echeance.perimee}>
                    {carte.echeance.texte}
                  </span>
                {/if}

                {#if carte.origine !== 'dossier' && surOuvrirDiagnostic}
                  <!-- §13 : la navigation croisée, vers la micro-application. -->
                  <button
                    type="button"
                    class="voir-analyse"
                    onclick={() => surOuvrirDiagnostic(carte.origine as TypeDiag)}
                  >
                    Voir l’analyse <span aria-hidden="true">›</span>
                  </button>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <p class="rien-a-faire">
          Aucun de vos diagnostics n’appelle l’intervention d’un professionnel. Ce que chacun ne
          garantit pas reste à lire ci-dessous.
        </p>
      {/if}

      <!-- NOTRE CONSEIL GLOBAL (§14) — l'encart vert plein du visuel. -->
      <aside class="global">
        <span class="sceau" aria-hidden="true"></span>
        <p class="titre-global">Notre conseil global</p>
        <p>
          Les diagnostics permettent d’identifier des points de vigilance mais ne remplacent pas
          l’avis ni le devis d’un professionnel du bâtiment. Lorsque Verrière vous recommande une
          intervention, l’objectif est de vous permettre de mieux comprendre la situation,
          d’anticiper les éventuels travaux et de disposer d’éléments concrets avant votre décision.
        </p>
        <p class="or-global">
          Un devis vous donne un chiffre, et un chiffre se discute avant de signer.
        </p>
      </aside>

      <div class="bas-module">
        <section class="benefices" aria-label="Les bénéfices d’une action ciblée">
          <p class="titre-benefices">Les bénéfices d’une action ciblée</p>
          <ul>
            <li>Sécurité renforcée</li>
            <li>Valorisation de votre bien</li>
            <li>Maîtrise des coûts</li>
            <li>Confort &amp; durabilité</li>
            <li>Éléments concrets avant décision</li>
          </ul>
        </section>

        <aside class="accompagnement">
          <p class="titre-accompagnement">Besoin d’accompagnement ?</p>
          <p>
            Verrière prépare un annuaire de professionnels pour vous orienter. En attendant,
            demandez plusieurs devis et comparez-les avant de vous engager.
          </p>
        </aside>
      </div>

      {#if leConseil.reserves.length}
        <!--
          Replié, et jamais une carte : il n'y a rien à y faire, et le §3 interdit
          de refaire ici la synthèse du diagnostic.

          ⚠️ Mais ces lignes ne peuvent pas disparaître. Vérifié le 22/08/2026 :
          la fiche générique `Diagnostics.svelte` déclare une étape « Ce qu'il
          faut faire » et ne rend jamais `aFaire`. Pour sept diagnostics sur neuf,
          cette page est le seul endroit du produit où ces phrases existent.
        -->
        <details class="reserves">
          <summary>Ce que vos diagnostics ne garantissent pas</summary>
          {#each leConseil.reserves as reserve (reserve.domaine)}
            <p class="domaine-reserve">{reserve.domaine}</p>
            <ul>
              {#each reserve.points as point, i (i)}
                <li><MotsExpliques texte={point} /></li>
              {/each}
            </ul>
          {/each}
        </details>
      {/if}

      <!-- Le ruban de pied du visuel : la limite du document, toujours dite. -->
      <p class="mention">
        Ce document est un conseil général. Seuls des diagnostics et devis réalisés par des
        professionnels pourront préciser l’étendue et le coût des travaux à prévoir.
      </p>
    </section>

    {#if lexique.length}
      <!--
        L'annexe des termes, réservée au papier.

        À l'écran, chaque mot du métier est souligné là où il se lit et sa
        définition s'ouvre au clic : la reprendre en fin de page la donnait une
        seconde fois, et obligeait à descendre chercher ce qui était déjà sous
        le doigt.

        Sur le papier, on ne clique pas. Le document part chez des gens qui ne
        connaissent aucun de ces mots : l'annexe reste, et elle est
        indispensable.
      -->
      <div class="au-papier">
        <h2 class="apres"><span class="num">{numeros.mots}</span>Les mots employés</h2>
        <dl class="lexique">
          {#each lexique as mot (mot.nom)}
            <div>
              <dt>{mot.nom}</dt>
              <dd>{mot.definition}</dd>
            </div>
          {/each}
        </dl>
      </div>
    {/if}

    <p class="reserve">
      Ce point de situation est une lecture du dossier, pas un acte. Seul le rapport signé par le
      diagnostiqueur engage, et lui seul fait foi devant le notaire.
    </p>
  </div>
</section>

<style>
  .notaire {
    margin-bottom: var(--e6);
  }

  /* Le retour se pose à même le vert : pas d'encart, pas de caisson. Ce qui
     structure, ce sont les titres et les filets. */
  .feuille {
    color: var(--sur-fond);
  }

  /* Les sections sont numérotées en chiffres romains, comme les articles d'un
     acte. Le numéro est posé dans la marge : il rythme sans encombrer. */
  h2 {
    display: flex;
    align-items: baseline;
    gap: var(--e4);
    font-size: var(--t-titre);
    color: var(--verriere-vert);
    margin-bottom: var(--e4);
  }

  .num {
    flex: none;
    width: 2rem;
    font-family: var(--police);
    font-size: var(--t-petit);
    font-weight: 600;
    font-style: normal;
    letter-spacing: var(--suivi);
    /* --or ne tient que 4,15 de contraste sur le vert : le numéro d'article
       passe en or clair, comme les autres petits textes de la charte. */
    color: var(--verriere-vert);
    /* Aligné sur la ligne de base du titre, pas sur son haut. */
    align-self: baseline;
  }

  /* Un filet double sous chaque section : le trait or ténu, puis le blanc.
     C'est le détail qui distingue un document d'une page web. */
  h2.apres {
    margin-top: var(--e7);
    padding-top: var(--e5);
    border-top: 1px solid var(--surface-bord);
    box-shadow: 0 -3px 0 -2px var(--trait-or);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  li {
    position: relative;
    padding-left: var(--e4);
    font-size: var(--t-base);
    line-height: 1.5;
  }

  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.62em;
    width: 6px;
    height: 6px;
    border-radius: 1px;
    background: var(--verriere-vert);
  }



  /* Les deux planches se répondent côte à côte dès qu'il y a la place. */
  .planches {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
    gap: 0 44px;
  }

  .planche {
    min-width: 0;
  }

  /* Les deux étiquettes gardent la taille d'une planche : étalées sur toute la
     largeur de l'écran, des barres de couleur de plus d'un mètre de long ne se
     lisent plus — elles décorent. C'est un document technique, il a un format. */
  .planche-seuil {
    max-width: 420px;
    margin: 0 0 var(--e5);
    padding: var(--e4);
    background: var(--papier);
    border-radius: var(--rayon);
    color: var(--encre);
  }

  /* Le conseil se lit bloc par bloc, dans l'ordre où l'on s'en occupe.

     C'était un `columns: 2`, puis une grille en deux colonnes — laquelle tenait
     tant qu'il y avait trois sections : la première prenait toute la largeur,
     les deux autres se répondaient côte à côte.

     La quatrième section a cassé ça, et il a fallu le mesurer pour le voir :
     « À faire lever » et « À chiffrer, puis à négocier » se retrouvaient à la
     MÊME hauteur au pixel près (2373 px l'une et l'autre), dans deux colonnes
     voisines. Or l'ordre de ces deux-là porte tout le raisonnement du conseil —
     on ne négocie pas ce que personne n'a regardé. Côte à côte, ils se lisent
     comme deux options équivalentes, et la démonstration tombe.

     Une seule colonne, donc, comme sur le papier — où le bloc `@media print`
     faisait déjà exactement cela. L'écran et la feuille disent enfin la même
     chose, et la largeur de lecture reste tenue par `--mesure`. */
  /* ═══════════════════════════════════════════════════════════════════════
     LE MODULE « CONSEILS » — au visuel de référence
     ═══════════════════════════════════════════════════════════════════════

     Ordre du 22/08/2026 : « VISUEL EXACT ». Ce qui suit reprend la charte du
     visuel fourni, dans ses proportions : ivoire de fond, vert profond
     dominant, sable réservé aux détails (§165), grand titre sérif, médaillons
     circulaires, encart vert plein au centre, ruban de mention en pied.

     Aucune couleur n'est écrite en dur : toutes viennent des jetons de la
     charte, sinon le thème sombre et l'impression divergeraient du reste. */
  .module-conseils {
    --vert: var(--verriere-vert-profond);
    --sable: var(--verriere-sable-or);
    /*
     * ⚠️ DEUX SABLES, ET LE VISUEL N'EN CONNAÎT QU'UN.
     *
     * Le sable de la charte (#c8a96b) est fait pour le vert profond : mesuré
     * sur l'écran, il y donne 6,76 de contraste — largement au-dessus du seuil
     * AA. Sur l'ivoire, le même sable tombe à 2,08 : le surtitre « NOS
     * RECOMMANDATIONS GLOBALES » du visuel est donc illisible aux normes, et il
     * l'est aussi dans le visuel fourni.
     *
     * On garde le sable de la charte partout où il est posé sur du vert — c'est
     * la quasi-totalité du module —, et on en fonce une variante pour les rares
     * textes sable sur ivoire. À l'œil c'est le même or ; à la mesure, l'un
     * passe et l'autre non.
     */
    --sable-lisible: #8a6a1f;
    display: flex;
    flex-direction: column;
    gap: var(--e6);
  }

  /* ---- L'en-tête : les mots à gauche, la pastille verte à droite --------- */
  .entete-conseils {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--e5);
    align-items: start;
  }

  @media (min-width: 900px) {
    .entete-conseils {
      grid-template-columns: minmax(0, 1fr) 260px;
      gap: var(--e6);
    }
  }

  /* Le grand titre sérif du visuel. Il ne porte plus le chiffre romain à
     l'écran : le visuel ouvre sur un titre, pas sur un article numéroté. Le
     papier, lui, le garde — c'est là que la numérotation sert. */
  /*
   * ⚠️ LE SEUL TITRE SÉRIF DU PRODUIT, ET C'EST UN ARBITRAGE.
   *
   * `app.css` porte une décision de charte écrite noir sur blanc : « la charte
   * demande des titres en linéale grasse, pas en serif : Fraunces quitte donc
   * les titres ». Le visuel de référence du module Conseils est pourtant en
   * sérif, et l'ordre du 22/08/2026 dit « VISUEL EXACT ».
   *
   * On suit l'ordre, qui est postérieur — mais ICI SEULEMENT. Fraunces est déjà
   * chargée et servie en local : elle ne coûte rien de plus. Le jour où la
   * charte tranche dans l'autre sens, une ligne suffit à revenir.
   */
  .titre-module {
    margin: 0;
    font-family: var(--police-voix);
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 600;
    line-height: 1.04;
    letter-spacing: -0.015em;
    color: var(--vert);
  }

  /* Le chiffre romain reste au papier : le visuel ouvre sur un titre, pas sur
     un article numéroté. À l'impression, la numérotation sert encore. */
  .titre-module .num {
    display: none;
  }

  @media print {
    .titre-module .num {
      display: inline;
      margin-right: var(--e2);
    }
  }

  /* Le surtitre sable, en capitales espacées. */
  .surtitre {
    margin: var(--e3) 0 0;
    font-size: var(--t-petit);
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--sable-lisible);
  }

  .intro-conseils {
    margin: var(--e3) 0 0;
    max-width: var(--mesure);
    font-size: var(--t-base);
    line-height: 1.6;
    color: var(--sur-fond-doux);
  }

  /* La pastille verte du visuel : une phrase, et un filet sable dessous. */
  .accroche {
    padding: var(--e4);
    background: var(--vert);
    border-radius: var(--rayon);
    color: var(--papier);
  }

  .accroche p {
    margin: 0 0 var(--e3);
    font-size: var(--t-petit);
    line-height: 1.5;
  }

  .accroche::after {
    content: '';
    display: block;
    width: 46px;
    height: 2px;
    background: var(--sable);
  }

  /* ---- Ce qui bloque le rendez-vous ------------------------------------- */
  .a-regler {
    max-width: var(--mesure);
    margin: var(--e5) 0 0;
    padding: var(--e3) var(--e4);
    border: 1px solid var(--surface-bord);
    border-left: 3px solid var(--alerte-vive);
    background: var(--papier);
    border-radius: var(--rayon);
  }

  .titre-regler {
    display: flex;
    align-items: center;
    gap: var(--e2);
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--alerte-vive);
  }

  .combien {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4em;
    padding: 0 0.35em;
    border-radius: 999px;
    background: var(--alerte-vive);
    color: var(--papier);
    font-size: var(--t-micro);
  }

  .a-regler ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .a-regler li + li {
    margin-top: var(--e1);
  }

  .a-regler button {
    display: block;
    width: 100%;
    padding: var(--e1) 0;
    background: none;
    border: 0;
    font: inherit;
    font-size: var(--t-petit);
    text-align: left;
    color: var(--encre);
    cursor: pointer;
  }

  .a-regler button:hover .quoi-regler,
  .a-regler button:focus-visible .quoi-regler {
    text-decoration: underline;
  }

  .a-regler .ou {
    display: block;
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  /* ---- Les cartes -------------------------------------------------------
     Deux colonnes dès qu'il y a la place, comme le visuel. Une seule sur
     mobile (§170) : une carte par ligne, très lisible. */
  /* La verrière : une illustration, pas une bannière. Elle garde ses
     proportions, ne dépasse jamais la largeur de lecture, et se contente de la
     moitié de la hauteur d'écran pour ne pas repousser les cartes sous la
     ligne de flottaison — ce sont elles qu'on vient lire. */
  .la-verriere {
    margin: 0;
    text-align: center;
  }

  /* Le cadre porte les pastilles : elles se placent en pourcentage de LUI, et
     suivent donc l'image quelle que soit sa taille. */
  /*
   * ⚠️ LE CADRE DOIT AVOIR UNE TAILLE AVANT QUE L IMAGE ARRIVE.
   *
   * Il etait en `inline-block` autour d une image en `loading="lazy"` sans
   * taille intrinseque : le cadre mesurait donc 0 px, l image n entrait jamais
   * dans le champ, le navigateur ne la chargeait jamais, et le cadre restait a
   * 0 px. Les pastilles s empilaient dans un coin. Mesure a l ecran :
   * naturalWidth 0, cadre 0.
   *
   * Le rapport de forme reserve la place des le premier rendu, et la vue est
   * deja ouverte quand on arrive ici : le chargement differe n a rien a gagner.
   */
  .cadre-verriere {
    position: relative;
    display: block;
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
    aspect-ratio: 860 / 980;
  }

  /* La pastille du visuel : un anneau sable, un disque crème, le pictogramme du
     diagnostic au centre. C'est un bouton, il grossit sous le doigt. */
  .point {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 34px;
    height: 34px;
    padding: 0;
    display: grid;
    place-items: center;
    background: var(--papier);
    border: 2px solid var(--point-teinte, var(--sable));
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgb(255 255 255 / 0.55);
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .point:hover,
  .point:focus-visible {
    transform: translate(-50%, -50%) scale(1.18);
    box-shadow: 0 0 0 6px rgb(255 255 255 / 0.7);
  }

  .point.urgence,
  .point.necessaire {
    --point-teinte: var(--alerte-vive);
  }
  .point.controle {
    --point-teinte: var(--attention);
  }

  .picto-point {
    width: 16px;
    height: 16px;
    background: var(--vert);
    mask-image: var(--picto);
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
    -webkit-mask-image: var(--picto);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: contain;
  }

  .la-verriere figcaption {
    margin-top: var(--e2);
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  /* Le point ne se vise pas au doigt sur un petit écran : on l'agrandit. */
  @media (pointer: coarse) {
    .point {
      width: 40px;
      height: 40px;
    }
  }

  .la-verriere img {
    width: 100%;
    max-width: 430px;
    height: auto;
    max-height: 52vh;
    object-fit: contain;
  }

  /* Sur le papier, l'illustration ne sert à rien et coûte une demi-page. */
  @media print {
    .la-verriere {
      display: none;
    }
  }

  .cartes {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--e4);
  }

  @media (min-width: 780px) {
    .cartes {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .carte {
    display: flex;
    flex-direction: column;
    gap: var(--e2);
    padding: var(--e5);
    background: var(--papier);
    border: 1px solid var(--surface-bord);
    border-radius: 18px;
    break-inside: avoid;
  }

  /* Le médaillon circulaire : pictogramme crème sur vert profond. Le masque
     reprend le dessin du fichier SVG sans lui imposer sa couleur. */
  .medaillon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--vert);
    position: relative;
  }

  .medaillon::before {
    content: '';
    position: absolute;
    inset: 11px;
    background: var(--papier);
    mask-image: var(--picto);
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
    -webkit-mask-image: var(--picto);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: contain;
  }

  .domaine {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.25;
    color: var(--vert);
  }

  /* La puce « TYPE 1 À 2 » du visuel devient le niveau de recommandation :
     même dessin, un contenu qui ne ment pas. */
  .niveau {
    margin: var(--e1) 0 0;
  }

  .niveau span {
    display: inline-block;
    padding: 3px 10px;
    border: 1px solid var(--niveau-teinte, var(--sable));
    border-radius: 999px;
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--niveau-teinte, var(--sable));
  }

  .carte.urgence,
  .carte.necessaire {
    --niveau-teinte: var(--alerte-vive);
  }
  .carte.controle {
    --niveau-teinte: var(--attention);
  }
  .carte.envisager {
    --niveau-teinte: var(--sable-lisible);
  }

  .conseil-ligne {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    line-height: 1.6;
    color: var(--sur-fond-doux);
  }

  /* L'encart professionnel : le seul filet sable de la carte. */
  .pro {
    margin-top: var(--e2);
    padding: var(--e3);
    border: 1px solid var(--trait-or);
    border-radius: 12px;
  }

  .pro-qui {
    margin: 0;
    font-weight: 700;
    font-size: var(--t-petit);
    color: var(--vert);
  }

  .pro-quoi {
    margin: var(--e1) 0 var(--e2);
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  .trouver {
    display: inline-flex;
    align-items: center;
    gap: var(--e2);
    padding: var(--e2) var(--e4);
    background: var(--vert);
    border: 0;
    border-radius: 999px;
    color: var(--papier);
    font: inherit;
    font-size: var(--t-micro);
    font-weight: 700;
    cursor: pointer;
  }

  .trouver:disabled {
    cursor: default;
    opacity: 0.55;
  }

  .bientot {
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: var(--suivi);
  }

  .pieds-carte {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--e2) var(--e3);
    margin-top: var(--e2);
    padding-top: var(--e3);
    border-top: 1px solid var(--surface-bord);
    font-size: var(--t-petit);
  }

  .pourquoi {
    flex: 1 1 100%;
  }

  .pourquoi summary {
    cursor: pointer;
    font-weight: 700;
    color: var(--verriere-vert);
  }

  .combien-points {
    margin-left: var(--e2);
    font-weight: 400;
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  .pourquoi ul {
    margin: var(--e2) 0 0;
    padding-left: var(--e4);
    line-height: 1.55;
  }

  .titre-sources {
    margin: var(--e3) 0 0;
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  .echeance {
    font-family: var(--mono);
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  .echeance.perime {
    font-weight: 700;
    color: var(--alerte-vive);
  }

  .voir-analyse {
    margin-left: auto;
    padding: 0;
    background: none;
    border: 0;
    font: inherit;
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--verriere-vert);
    cursor: pointer;
  }

  .rien-a-faire {
    max-width: var(--mesure);
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.6;
    color: var(--sur-fond-doux);
  }

  /* ---- NOTRE CONSEIL GLOBAL (§14) ---------------------------------------
     L'encart vert plein du visuel, centré, avec son sceau circulaire. */
  .global {
    padding: var(--e6) var(--e5);
    background: var(--vert);
    border-radius: 18px;
    color: var(--papier);
    text-align: center;
  }

  .sceau {
    display: block;
    width: 44px;
    height: 44px;
    margin: 0 auto var(--e3);
    border: 1px solid var(--sable);
    border-radius: 50%;
    position: relative;
  }

  .sceau::before {
    content: '';
    position: absolute;
    inset: 12px;
    background: var(--sable);
    mask-image: url(./pictos/conseil.svg);
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
    -webkit-mask-image: url(./pictos/conseil.svg);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: contain;
  }

  .titre-global {
    margin: 0 0 var(--e3);
    font-size: var(--t-petit);
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .global p {
    margin: 0 auto;
    max-width: 62ch;
    font-size: var(--t-petit);
    line-height: 1.7;
  }

  /* Le trait sable, puis la phrase dorée : c'est la respiration du visuel. */
  .or-global {
    margin-top: var(--e4) !important;
    padding-top: var(--e4);
    border-top: 1px solid var(--sable);
    color: var(--sable);
    font-weight: 700;
  }

  /* ---- Le bas de page : bénéfices à gauche, accompagnement à droite ------ */
  .bas-module {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--e4);
  }

  @media (min-width: 900px) {
    .bas-module {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    }
  }

  .benefices {
    padding: var(--e5);
    border: 1px solid var(--surface-bord);
    border-radius: 18px;
  }

  .titre-benefices {
    margin: 0 0 var(--e4);
    text-align: center;
    font-size: var(--t-petit);
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--vert);
  }

  .benefices ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--e3);
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: center;
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  /* Chaque bénéfice a son filet sable au-dessus, comme les pictogrammes du
     visuel — un signe, sans dessiner cinq icônes qui n'existent pas. */
  .benefices li::before {
    content: '';
    display: block;
    width: 22px;
    height: 2px;
    margin: 0 auto var(--e2);
    background: var(--sable);
  }

  .accompagnement {
    padding: var(--e5);
    background: var(--vert);
    border-radius: 18px;
    color: var(--papier);
  }

  .titre-accompagnement {
    margin: 0 0 var(--e2);
    font-size: var(--t-petit);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--sable);
  }

  .accompagnement p {
    margin: 0;
    font-size: var(--t-micro);
    line-height: 1.6;
  }

  /* ---- Le pli des réserves, et le ruban de mention ---------------------- */
  .reserves {
    max-width: var(--mesure);
    font-size: var(--t-petit);
    line-height: 1.55;
  }

  .reserves summary {
    cursor: pointer;
    font-weight: 700;
    color: var(--sur-fond-doux);
  }

  .domaine-reserve {
    margin: var(--e3) 0 var(--e1);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  .mention {
    margin: 0;
    padding: var(--e3) var(--e4);
    background: var(--vert);
    border-radius: var(--rayon);
    color: var(--papier);
    font-size: var(--t-micro);
    line-height: 1.6;
    text-align: center;
  }

  .conseils {
    display: flex;
    flex-direction: column;
    gap: var(--e5);
  }

  .conseil {
    break-inside: avoid;
    max-width: var(--mesure);
  }

  /* Ce qui empêche de signer se distingue du reste : un filet, dès le premier
     coup d'œil, avant même d'avoir lu le titre. */
  .conseil:first-child {
    padding-left: var(--e4);
    border-left: 3px solid var(--verriere-sable-or);
  }

  /* ---- Ce qui bloque le rendez-vous, réuni --------------------------------

     Un encart, pas une section : il tient en quelques lignes, il ne porte que
     des renvois, et il disparaît quand rien ne bloque. Le filet à gauche est
     celui qui distinguait déjà « à régulariser » quand c'était un bloc — le
     lecteur retrouve le même signe. */
  .a-regler {
    max-width: var(--mesure);
    margin: 0 0 var(--e6);
    padding: var(--e3) var(--e4);
    border-left: 3px solid var(--alerte-vive);
    background: var(--surface-forte);
    border-radius: 0 var(--rayon) var(--rayon) 0;
  }

  .titre-regler {
    display: flex;
    align-items: center;
    gap: var(--e2);
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--alerte-vive);
  }

  .combien {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4em;
    padding: 0 0.35em;
    border-radius: 999px;
    background: var(--alerte-vive);
    color: var(--papier);
    font-size: var(--t-micro);
  }

  .a-regler ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .a-regler li + li {
    margin-top: var(--e1);
  }

  /* Chaque ligne est un renvoi : elle mène au bloc du diagnostic, plus bas. */
  .a-regler button {
    display: block;
    width: 100%;
    padding: var(--e1) 0;
    background: none;
    border: 0;
    font: inherit;
    font-size: var(--t-petit);
    text-align: left;
    color: var(--encre);
    cursor: pointer;
    border-radius: var(--rayon);
  }

  .a-regler button:hover .quoi-regler,
  .a-regler button:focus-visible .quoi-regler {
    text-decoration: underline;
  }

  .a-regler .ou {
    display: block;
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  /* La tête d'un bloc : le nom du diagnostic à gauche, sa date à droite. */
  .tete-conseil {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e4);
    margin-bottom: var(--e3);
    padding-bottom: var(--e2);
    border-bottom: 1px solid var(--surface-bord);
  }

  .titre-conseil {
    margin: 0;
    font-weight: 700;
    font-size: var(--t-base);
    color: var(--verriere-vert-profond);
  }

  /* La date vit avec son rapport : « valable jusqu'au » est une propriété du
     diagnostic, pas une ligne d'un tableau à part. */
  .echeance {
    flex: none;
    font-family: var(--mono);
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
    white-space: nowrap;
  }

  .echeance.perime {
    font-weight: 700;
    color: var(--alerte-vive);
  }

  /* Le temps auquel appartiennent les gestes qui suivent : à régulariser, à
     faire lever, à négocier, à savoir. Un intercalaire, pas un titre de plus. */
  .temps {
    margin: var(--e4) 0 var(--e1);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  .temps:first-of-type {
    margin-top: 0;
  }

  /* Ce qui bloque et ce qu'on ne sait pas se voient sans qu'on les cherche ;
     la marge de négociation aussi, parce que c'est là qu'on gagne de l'argent.
     Ce qui ne demande rien reste en gris. */
  .temps.avant {
    color: var(--alerte-vive);
  }

  .temps.lever,
  .temps.negocier {
    color: var(--verriere-vert-profond);
  }

  /* ---- Le bandeau des diagnostics ---------------------------------------

     Même dessin que le bandeau de la vue « Les diagnostics » : une ligne de
     pastilles qui défile, chacune avec sa gravité. La différence tient à ce
     qu'il fait — celui-là ne feuillette pas, il conduit au conseil du
     diagnostic, plus bas dans la page. D'où l'absence d'onglet « courant » :
     aucun n'est ouvert, ils mènent tous ailleurs. */
  .bandeau-diags {
    display: flex;
    gap: var(--e2);
    overflow-x: auto;
    scrollbar-width: none;
    padding: var(--e1) var(--e1) var(--e2);
    margin: 0 0 var(--e5);
    /* Ce qui déborde s'efface au bord plutôt que d'être tranché net : on
       comprend qu'il y en a d'autres. */
    mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent);
  }

  .bandeau-diags::-webkit-scrollbar {
    display: none;
  }

  .onglet-diag {
    flex: none;
    display: inline-flex;
    align-items: baseline;
    gap: var(--e2);
    padding: var(--e2) var(--e4);
    background: var(--surface-forte);
    border: 1px solid var(--surface-bord);
    border-radius: 999px;
    color: var(--sur-fond-doux);
    font-family: inherit;
    font-size: var(--t-petit);
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 0.18s ease,
      border-color 0.18s ease,
      color 0.18s ease;
  }

  .onglet-diag:hover:not(:disabled),
  .onglet-diag:focus-visible {
    background: var(--surface-bord);
    border-color: var(--gravite, var(--surface-bord));
    color: var(--sur-fond);
  }

  /* Un diagnostic dont le dossier ne dit rien reste affiché, mais éteint :
     présent au dossier, sans rien à en faire. */
  .onglet-diag:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .onglet-diag .pastille {
    align-self: center;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gravite, var(--sur-fond-doux));
    flex: none;
  }

  .nom-onglet {
    font-weight: 700;
    letter-spacing: var(--suivi-serre);
    color: var(--sur-fond);
  }

  /* Le verdict en trois mots, en retrait : le nom se lit d'abord. */
  .dit-onglet {
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  .onglet-diag.bon {
    --gravite: var(--verriere-vert);
  }
  .onglet-diag.attention {
    --gravite: var(--attention);
  }
  .onglet-diag.alerte {
    --gravite: var(--alerte-vive);
  }
  .onglet-diag.neutre {
    --gravite: var(--sur-fond-doux);
  }

  /* Sur le papier, rien ne défile : le bandeau devient un relevé qui passe à
     la ligne, et il garde tout son sens — c'est le sommaire du dossier. */
  @media print {
    .bandeau-diags {
      flex-wrap: wrap;
      overflow: visible;
      mask-image: none;
    }
  }

  /* Le professionnel à appeler, posé sous les gestes qu'il exécute. Un filet à
     gauche plutôt qu'un encadré : c'est une adresse, pas une alerte de plus. */
  .recours {
    margin: var(--e2) 0 0;
    padding-left: var(--e3);
    border-left: 2px solid var(--trait-or);
    font-size: var(--t-petit);
    line-height: 1.5;
  }


  .textes {
    margin-top: var(--e3);
    font-size: var(--t-petit);
  }

  .textes summary {
    cursor: pointer;
    color: var(--verriere-vert);
  }

  .sources {
    margin: var(--e2) 0 0;
    padding-left: var(--e4);
  }

  .sources li {
    margin-bottom: var(--e1);
  }

  .lu {
    margin-left: var(--e2);
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  /* Le calendrier n'a plus de tableau à lui : chaque date est remontée dans la
     tête du diagnostic qu'elle concerne, où « valable jusqu'au » se lit comme
     une propriété du rapport et non comme une ligne d'un relevé à part. */

  /* Les styles des encarts de synthèse sont partis avec eux, dans la vue
     « Les diagnostics » où le sommaire a repris leur rôle. */

  /* L'état descriptif : un relevé au filet, comme une notice d'architecte. */
  .caracteristiques {
    margin: var(--e4) 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 0 var(--e6);
  }

  .caracteristiques div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e3);
    padding: var(--e2) 0;
    border-bottom: 1px solid var(--surface-bord);
  }

  .caracteristiques dt {
    font-size: var(--t-micro);
    letter-spacing: 0.12em;
    color: var(--sur-fond-doux);
  }

  .caracteristiques dd {
    margin: 0;
    font-size: var(--t-base);
    font-weight: 600;
    color: var(--sur-fond);
    text-align: right;
    white-space: nowrap;
  }

  .pourquoi {
    margin: var(--e4) 0 0;
    font-size: var(--t-base);
    line-height: 1.55;
    color: var(--sur-fond-doux);
  }



  /* La page de garde : filet or, objet du document, adresse en grand, et la
     ligne de références sous le trait. C'est à ça qu'on reconnaît un document
     d'agence posé sur une table. */
  /* Le filet de garde est double : un trait or plein, un cheveu blanc dessous.
     C'est la signature d'un document imprimé. */
  .garde {
    border-top: 2px solid var(--verriere-sable-or);
    box-shadow: 0 3px 0 -2px var(--surface-bord);
    padding-top: var(--e5);
    margin-bottom: var(--e7);
  }

  .ligne-haute {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--e5);
    margin-bottom: var(--e5);
  }

  .objet {
    margin: 0;
    font-size: var(--t-micro);
    font-weight: 500;
    letter-spacing: 0.2em;
    color: var(--verriere-vert-profond);
  }

  .adresse {
    font-size: clamp(1.9rem, 4.6vw, 3rem);
    line-height: 1.05;
    margin: 0;
    color: var(--sur-fond);
  }

  /* Vu à l'écran juste au-dessus, dans le bandeau du bien : inutile de le
     répéter ici. Le papier, lui, n'a pas ce bandeau et garde son en-tête. */
  .au-papier {
    display: none;
  }

  @media print {
    .au-papier {
      display: block;
    }
  }

  .commune {
    margin: var(--e1) 0 0;
    font-family: var(--police-titre);
    font-size: clamp(1.2rem, 2.6vw, 1.6rem);
    color: var(--sur-fond-doux);
  }

  .sous-titre {
    margin: var(--e4) 0 0;
    font-family: var(--police-titre);
    font-style: italic;
    font-size: clamp(1rem, 2vw, 1.16rem);
    line-height: 1.5;
    max-width: var(--mesure);
    color: var(--sur-fond-doux);
  }

  /* Les références : en mono, comme le bandeau du site. */
  .references {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2) 44px;
    margin: var(--e5) 0 var(--e4);
    padding-top: var(--e4);
    border-top: 1px solid var(--surface-bord);
  }

  .references div {
    display: grid;
    gap: var(--e1);
  }

  .references dt {
    font-size: var(--t-micro);
    letter-spacing: 0.16em;
    color: var(--sur-fond-doux);
  }

  .references dd {
    margin: 0;
    font-family: var(--mono);
    font-size: var(--t-base);
    color: var(--sur-fond);
  }

  .editer {
    flex: none;
    /* Il faisait 43 px de haut : un pixel sous la cible tactile confortable. */
    min-height: 46px;
    background: none;
    border: 1px solid var(--trait-or);
    border-radius: 0;
    padding: var(--e3) var(--e4);
    font-size: var(--t-petit);
    font-weight: 500;
    letter-spacing: 0.14em;
    color: var(--verriere-vert);
    cursor: pointer;
    transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
  }

  .editer:hover {
    background: var(--verriere-sable-or);
    border-color: var(--verriere-sable-or);
    color: var(--vert-900);
  }

  /* L'annexe : un terme, sa définition, en deux colonnes. */
  .lexique {
    margin: 0;
    columns: 2;
    column-gap: 44px;
  }

  @media (max-width: 820px) {
    .lexique {
      columns: 1;
    }
  }

  .lexique div {
    break-inside: avoid;
    margin-bottom: var(--e3);
  }

  .lexique dt {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--verriere-vert-profond);
    margin-bottom: var(--e1);
  }

  .lexique dd {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  .reserve {
    margin: var(--e5) 0 0;
    padding-top: var(--e4);
    border-top: 1px solid var(--surface-bord);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond-doux);
    opacity: 0.75;
  }
</style>
