<script lang="ts">
  /**
   * La maison du dossier — le schéma-mère de Verrière.
   *
   * C'est ici que le langage se voit en entier : huit éléments dessinés, huit
   * clips, et derrière chacun une notion qui descend jusqu'à « et chez moi ? »
   * (§ 2 de ORDRE-DE-MISSION-SCHEMAS.md). Le dessin n'illustre pas le propos :
   * il est le propos.
   *
   * Le tableau qui doublait le dessin a été retiré : ce qu'il disait — isolé,
   * sans isolant, non renseigné — est désormais porté par la couleur du point,
   * et détaillé au niveau 8 de chaque notion. Une seule information, un seul
   * endroit (§ 11).
   *
   * Sans mot, on doit encore comprendre (§ 8) : six souffles sortent du logement,
   * gros là où l'on perd le plus.
   */
  import type { EtatIsolation, Isolation, Lettre } from '../../lib/modele';
  import ClipDessin from '../savoir/ClipDessin.svelte';
  import Maison from './briques/Maison.svelte';

  const {
    isolation = null,
    lettre = null,
    papier = false,
    postes = null
  }: {
    isolation?: Isolation | null;
    lettre?: Lettre | null;
    /**
     * LA CONSOMMATION PAR POSTE, TELLE QUE LE RAPPORT L'IMPRIME.
     *
     * Le schéma dessinait les mêmes ordres de grandeur nationaux pour tous les
     * dossiers : les épaisseurs de souffle viennent d'une table codée en dur,
     * et les pourcentages n'étaient écrits que sur le document imprimé. À
     * l'écran, le dessin ne portait AUCUN chiffre du logement.
     *
     * Or le rapport en donne, et le moteur les lisait déjà : chauffage, eau
     * chaude, éclairage, auxiliaires, en kWh et en euros par an. Mesuré sur 50
     * dossiers du corpus : 29 DPE sur 31 les portent, 115 postes dont 111 avec
     * leur fourchette de coût.
     *
     * Ils s'attachent aux deux ÉQUIPEMENTS, pas aux parois : un poste dit ce
     * qui consomme, une paroi dit par où ça part. Les confondre serait faux.
     */
    postes?: { nom: string; kwh: number; cout?: string }[] | null;
    /**
     * Le document remis. Sur papier on ne clique pas : l'invitation disparaît,
     * les points cessent d'appeler, et le relevé reprend son rôle — c'est le
     * seul endroit où il ne fait pas double emploi avec les clips.
     */
    papier?: boolean;
  } = $props();

  /** Les couleurs officielles de l'étiquette, pour poser la classe sur la maison. */
  const TEINTE_LETTRE: Record<Lettre, string> = {
    A: '#319834',
    B: '#33cc31',
    C: '#cbfc34',
    D: '#fbfe06',
    E: '#fbcc05',
    F: '#fc9935',
    G: '#fc0205'
  };

  interface Sortie {
    /** La notion qui s'ouvre au clic. */
    notion: string;
    /** Le libellé posé sur le dessin, quand il doit être plus court que le terme. */
    libelle?: string;
    /** La paroi correspondante dans le rapport, s'il y en a une. */
    paroi?: keyof Isolation;
    /** Le souffle de chaleur : départ, arrivée. L'arrivée porte le clip. */
    de: [number, number];
    vers: [number, number];
    /** L'épaisseur du souffle dit le poids du poste, sans écrire un chiffre. */
    poids: number;
    /** L'ordre de grandeur ADEME, écrit seulement sur le document remis. */
    part: string;
    cote: 'gauche' | 'droite';
  }

  /**
   * Les six chemins par où la chaleur s'en va. Les épaisseurs suivent les ordres
   * de grandeur de l'ADEME — toiture d'abord, plancher bas en dernier.
   */
  const SORTIES: Sortie[] = [
    { notion: 'toiture', paroi: 'toit', de: [250, 96], vers: [250, 44], poids: 7, part: '25-30 %', cote: 'droite' },
    { notion: 'ventilation', de: [186, 176], vers: [110, 128], poids: 6, part: '20-25 %', cote: 'gauche' },
    { notion: 'murs', paroi: 'murs', de: [156, 244], vers: [92, 244], poids: 6, part: '20-25 %', cote: 'gauche' },
    { notion: 'fenetres', paroi: 'fenetres', de: [344, 200], vers: [412, 200], poids: 4.5, part: '10-15 %', cote: 'droite' },
    { notion: 'pont-thermique', libelle: 'Jonctions', de: [344, 282], vers: [396, 282], poids: 3.5, part: '5-10 %', cote: 'droite' },
    { notion: 'plancher-bas', libelle: 'Plancher', paroi: 'plancher', de: [250, 306], vers: [250, 372], poids: 4, part: '7-10 %', cote: 'droite' }
  ];

  /** Le libellé lisible d'une sortie, pour le relevé du document remis. */
  const NOM_SORTIE: Record<string, string> = {
    toiture: 'Toiture',
    ventilation: 'Air renouvelé',
    murs: 'Murs',
    fenetres: 'Fenêtres',
    'pont-thermique': 'Jonctions',
    'plancher-bas': 'Plancher bas'
  };

  /**
   * Les deux équipements. Ils ne laissent pas partir la chaleur : ils la
   * produisent. D'où le filet fin plutôt qu'un souffle — le dessin ne doit pas
   * dire d'eux ce qui est faux.
   */
  const EQUIPEMENTS = [
    { notion: 'chauffage', depuis: [201, 268] as [number, number], point: [96, 320] as [number, number], cote: 'gauche' as const },
    { notion: 'eau-chaude', libelle: 'Eau chaude', depuis: [308, 268] as [number, number], point: [404, 320] as [number, number], cote: 'droite' as const }
  ];

  /**
   * Le relevé : tous les postes du rapport, dans son ordre.
   *
   * Ils étaient destinés au dessin ; ils n'y tenaient pas. Ici ils sont à
   * taille de lecture, alignés en colonnes, et le lecteur peut les comparer
   * d'un coup d'œil — ce qu'un chiffre posé le long d'un trait ne permet pas.
   */
  const postesLus = $derived(postes ?? []);

  function etatDe(sortie: Sortie): 'isole' | 'nonIsole' | null {
    if (!isolation || !sortie.paroi) return null;
    const etat: EtatIsolation = isolation[sortie.paroi];
    return etat === 'inconnu' ? null : etat;
  }

  const NOM_PAROI: Record<string, string> = {
    toit: 'le toit',
    murs: 'les murs',
    fenetres: 'les fenêtres',
    plancher: 'le plancher'
  };

  /**
   * Le constat, tiré du rapport et pas d'une moyenne nationale : la classe du
   * logement, puis ce que le diagnostiqueur a noté paroi par paroi.
   */
  const constat = $derived.by(() => {
    const debut = lettre ? `Votre logement est classé ${lettre}.` : 'Votre logement.';
    if (!isolation) return `${debut} Le rapport ne dit pas ce qui est isolé.`;

    const nommees = (cherche: EtatIsolation): string[] =>
      Object.entries(isolation)
        .filter(([, etat]) => etat === cherche)
        .map(([paroi]) => NOM_PAROI[paroi])
        .filter((nom): nom is string => nom !== undefined);

    const nues = nommees('nonIsole');
    const faites = nommees('isole');

    if (!nues.length && !faites.length) return `${debut} Le rapport ne dit pas ce qui est isolé.`;

    // « le plancher comme non isolé », mais « les murs et le toit comme non isolés ».
    const accord = (liste: string[]): string =>
      liste.length > 1 || liste[0]?.startsWith('les') ? 's' : '';

    if (!nues.length)
      return `${debut} Le rapport donne ${faites.join(', ')} comme isolé${accord(faites)}.`;
    return `${debut} Le rapport donne ${nues.join(', ')} comme non isolé${accord(nues)} — c’est par là que ça part.`;
  });
</script>

<figure class:papier>
  {#if !papier}
    <p class="invite">Touchez un point de la maison.</p>
  {/if}

  <!-- Le cadre déborde à gauche et à droite du dessin : les libellés des clips
       font partie du schéma, pas de sa marge. -->
  <!--
    LE CADRE S'ELARGIT POUR LES DEUX CLIPS DU BAS.

    « Chauffage » part vers la gauche depuis x=96, « Eau chaude » vers la droite
    depuis x=404. A 20 unites de police, les deux sortaient du cadre — de 3 et
    6 px, mesures a l'ecran. Ce ne sont pas les points d'ancrage qu'il faut
    bouger : ils designent les equipements dessines, et les deplacer ferait
    montrer autre chose.

    Vingt unites de chaque cote, donc. Le cadre passe a 562, ce qui rapetisse
    tout d'autant : `--t-clip` remonte a 22. Reglee sur la mesure, pas sur le
    calcul -- a 23, « Eau chaude » ressortait du cadre. C'est la valeur la plus
    grande qui tienne.
  -->
  <svg style="--t-clip: 22px" viewBox="-28 0 562 420" role="group" aria-label="La maison du dossier : les endroits par où la chaleur s’échappe, et les deux équipements qui la produisent.">
    <!-- Le terrain : un filet et ses hachures, comme sur une coupe. -->
    <path d="M40 344 H460" class="sol" />
    {#each Array.from({ length: 22 }, (_, i) => 44 + i * 19) as x}
      <path d="M{x} 344 l-9 12" class="hachure" />
    {/each}

    <!-- La maison : la brique commune de la bibliothèque. C'est d'elle que
         viennent les proportions employées partout ailleurs. -->
    <Maison x={152} y={132} l={196} cheminee fondation fenetres={2} porte />

    <!-- Les cotes : c'est ce qui donne au dessin son air de planche. -->
    <g class="cote">
      <path d="M152 332 H348M152 327 v10M348 327 v10" />
      <text x="250" y="324" class="cotation">le bâti</text>
    </g>
    <g class="cote">
      <path d="M124 132 V296M119 132 h10M119 296 h10" />
    </g>

    <circle cx="266" cy="270" r="3" class="poignee" />

    <!-- La chaudière et le ballon : les deux seuls objets de l'intérieur. Ils
         suffisent à dire que le logement produit sa chaleur et son eau chaude. -->
    <g class="equipement">
      <rect x="186" y="248" width="30" height="40" rx="3" />
      <path d="M193 258h16M193 266h16M193 274h10" class="detail" />
      <path d="M201 248 v-10 h14" class="tuyau" />
    </g>
    <g class="equipement">
      <rect x="296" y="246" width="24" height="44" rx="12" />
      <path d="M308 246 v-8" class="tuyau" />
      <path d="M302 262 q6 6 12 0" class="detail" />
    </g>

    <!-- La classe du logement, posée sur sa façade : c'est sa maison. -->
    {#if lettre}
      <g transform="translate(196 152)">
        <rect x="-22" y="-16" width="44" height="32" rx="8" fill={TEINTE_LETTRE[lettre]} />
        <!--
          UNE SEULE ENCRE, ET ELLE TIENT SUR LES SEPT.
          
          La lettre basculait entre `var(--encre)` pour C, D, E et `#fff` pour
          les quatre autres. Mesure a l'ecran des quatre au blanc : B 2,14 ·
          F 2,15 · A 3,70 · G 4,08 — toutes sous le seuil de 4,5, et deux
          franchement illisibles.
          
          Les couleurs de l'arrete ne se retouchent pas : c'est l'encre qui doit
          tenir partout. `--encre-etiquette` est calculee pour cela -- ses sept
          mesures sont ecrites au jeton, dans app.css -- et la pastille de
          l'escalier A→G emploie la meme, choisie sur la meme mesure.

          La valeur ne se recopie pas ici : un test de la charte interdit les
          couleurs en dur dans un schema, et il a raison meme pour un
          commentaire -- une valeur citee a deux endroits finit par diverger.
        -->
        <text x="0" y="7" class="classe" fill="var(--encre-etiquette)">
          {lettre}
        </text>
      </g>
    {/if}

    <!-- Les souffles : le dessin dit « ça part par là » avant toute lecture. -->
    {#each SORTIES as sortie (sortie.notion)}
      {@const etat = etatDe(sortie)}
      <path
        d="M{sortie.de[0]} {sortie.de[1]} L{sortie.vers[0]} {sortie.vers[1]}"
        class="souffle"
        class:isole={etat === 'isole'}
        class:non-isole={etat === 'nonIsole'}
        style:stroke-width={sortie.poids}
      />
    {/each}

    <!-- Les filets des équipements : fins, ils ne disent pas une fuite. -->
    {#each EQUIPEMENTS as equipement (equipement.notion)}
      <!--
        LES CHIFFRES NE TIENNENT PAS DANS LE CADRE — ILS DESCENDENT.

        Premier essai : « 13 400 kWh/an » écrit sous « Chauffage », dans le
        dessin. Mesuré à l'écran, il sortait du cadre de 35 unités, et « 4 100
        kWh/an » de 17. Élargir le viewBox rapetissait tout le reste sous le
        seuil de lisibilité ; rétrécir le chiffre le rendait illisible — le SVG
        n'a que 306 px de large, chaque unité vaut 0,54 pixel.

        Les chiffres vont donc dans le relevé, sous le dessin, en HTML : à
        taille normale, alignés, comparables, et sans contrainte de cadre. Le
        dessin garde ses libellés et ses couleurs — il montre OÙ, le relevé dit
        COMBIEN.
      -->
      <ClipDessin
        id={equipement.notion}
        libelle={equipement.libelle}
        x={equipement.point[0]}
        y={equipement.point[1]}
        depuis={equipement.depuis}
        cote={equipement.cote}
      />
    {/each}

    {#each SORTIES as sortie (sortie.notion)}
      <ClipDessin
        id={sortie.notion}
        libelle={sortie.libelle}
        x={sortie.vers[0]}
        y={sortie.vers[1]}
        cote={sortie.cote}
        etat={etatDe(sortie)}
      />
    {/each}
  </svg>

  <!-- Le relevé, sur le document remis seulement : le lecteur qui tient une
       feuille ne peut pas ouvrir « et chez moi ? ». -->
  {#if papier}
    <table class="releve">
      <thead>
        <tr>
          <th>Par où</th>
          <th>Ce que dit le rapport</th>
          <th>Part des pertes</th>
        </tr>
      </thead>
      <tbody>
        {#each SORTIES as sortie (sortie.notion)}
          {@const etat = etatDe(sortie)}
          <tr>
            <th scope="row">{NOM_SORTIE[sortie.notion]}</th>
            <td class={etat ?? 'muet'}>
              {#if etat === 'isole'}Isolé
              {:else if etat === 'nonIsole'}Sans isolant
              {:else if sortie.paroi}Non renseigné
              {:else}—{/if}
            </td>
            <td class="part">{sortie.part}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <!-- On ne pose pas une question au lecteur : on lui dit ce que son rapport
       raconte. Le détail se prend sur le dessin. -->
  <figcaption class="constat">
    {constat}

    <!--
      LES POSTES QUE LE DESSIN NE PEUT PAS PLACER.

      L'éclairage et les auxiliaires — ventilation mécanique, pompes, circulateurs
      — consomment sans correspondre à un endroit du dessin. Les accrocher à une
      paroi serait faux ; les taire priverait le lecteur de chiffres que son
      rapport imprime.

      Ils prennent donc leur place ici, en toutes lettres, avec leur coût quand le
      rapport le donne. Rien n'est additionné : ce sont ses lignes, pas notre
      total.
    -->
    {#if postesLus.length}
      <ul class="autres-postes">
        {#each postesLus as p (p.nom)}
          <li>
            <span class="poste-nom">{p.nom}</span>
            <span class="poste-kwh">{p.kwh.toLocaleString('fr-FR')} kWh/an</span>
            {#if p.cout}<span class="poste-cout">{p.cout}</span>{/if}
          </li>
        {/each}
      </ul>
    {/if}
  </figcaption>
</figure>

<style>
  figure {
    margin: 0;
  }

  /* Les postes hors dessin. Une ligne par poste, le nom à gauche, les chiffres
     alignés à droite en chasse tabulaire : c'est un relevé, il se compare
     verticalement. */
  .autres-postes {
    list-style: none;
    margin: var(--e3) 0 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }

  .autres-postes li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--e2);
    font-size: var(--t-petit);
    color: var(--encre);
  }

  /* Pas de `capitalize` : il met une majuscule à CHAQUE mot et donnait « Eau
     Chaude », que le rapport n'écrit pas ainsi. Seule la première lettre de la
     ligne se relève — le reste appartient au rapport. */
  .poste-nom {
    flex: 1;
    min-width: 0;
  }

  .poste-nom::first-letter {
    text-transform: uppercase;
  }

  .poste-kwh {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .poste-cout {
    font-size: var(--t-micro);
    color: var(--encre-doux);
    font-variant-numeric: tabular-nums;
  }

  .invite {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    letter-spacing: 0.14em;
    font-weight: 600;
    color: var(--or-fonce);
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
    margin-inline: auto;
  }

  /* La palette de la maison : vert DGLM, or, crème, encre. Rien d'autre. */
  /* La maison est dessinée à l'encre du contexte : posée sur le vert elle est
     claire, posée sur du papier elle est sombre. Un seul dessin, deux fonds. */
  .sol {
    stroke: currentColor;
    stroke-width: 1.2;
    opacity: 0.35;
  }

  .hachure {
    stroke: currentColor;
    stroke-width: 0.8;
    opacity: 0.22;
  }

  /* Les cotes : le trait de la planche d'exécution, en or, très fin. */
  .cote path {
    stroke: var(--or);
    stroke-width: 0.9;
    fill: none;
    opacity: 0.75;
  }

  .cotation {
    font-size: 20.5px;
    letter-spacing: 0.12em;
    fill: var(--or-fonce);
    text-anchor: middle;
    opacity: 0.85;
  }








  .poignee {
    fill: var(--or-fonce);
  }

  /* Les équipements : même trait que la maison, en plus discret. Ils sont là
     pour être désignés, pas pour être admirés. */
  .equipement rect {
    fill: var(--surface-forte);
    stroke: currentColor;
    stroke-width: 1.4;
    opacity: 0.85;
  }

  .equipement .detail,
  .equipement .tuyau {
    stroke: currentColor;
    stroke-width: 1.2;
    fill: none;
    opacity: 0.55;
  }

  /* Le souffle : la seule chose qui doit se comprendre sans un mot. Son
     épaisseur dit le poids du poste ; sa couleur, ce que le rapport en sait. */
  .souffle {
    stroke: var(--or-fonce);
    stroke-linecap: round;
    fill: none;
    opacity: 0.9;
  }

  .souffle.isole {
    stroke: var(--ok);
    opacity: 0.55;
  }

  .souffle.non-isole {
    stroke: var(--alerte);
  }

  .classe {
    font-size: var(--t-titre);
    font-weight: 900;
    text-anchor: middle;
  }

  .constat {
    margin-top: var(--e3);
    font-size: var(--t-base);
    font-weight: 650;
    line-height: 1.45;
    color: var(--encre-doux);
  }

  /* Sur le document remis, les points ne clignent plus et ne se laissent pas
     survoler : ils redeviennent de simples repères de planche. */
  .papier :global(.clip) {
    cursor: default;
    pointer-events: none;
  }

  .papier :global(.clip .halo) {
    animation: none;
    opacity: 0;
  }

  /* Le relevé sous le dessin : ce que le rapport dit de chaque endroit.

     À l'écran, il ne s'affiche pas. Le dessin porte déjà les six mêmes lignes
     avec les six mêmes valeurs : le tableau les redisait mot pour mot, juste
     en dessous. Un schéma qu'il faut doubler d'un tableau est un schéma qui a
     échoué — et celui-ci n'a pas échoué.

     Sur le papier, il revient : le lecteur qui tient une feuille ne peut rien
     toucher, et c'est là que le relevé reprend son utilité. */
  .releve {
    display: none;
    width: 100%;
    border-collapse: collapse;
    margin-top: var(--e4);
    font-size: var(--t-petit);
  }

  @media print {
    .releve {
      display: table;
    }
  }

  .releve th,
  .releve td {
    text-align: left;
    padding: var(--e2) var(--e1);
    border-bottom: 1px solid var(--trait-fin);
  }

  .releve thead th {
    font-size: var(--t-micro);
    font-weight: 600;
    letter-spacing: 0.12em;
    color: var(--gris);
    border-bottom-color: var(--trait);
  }

  .releve tbody th {
    font-weight: 700;
    color: var(--encre);
    width: 30%;
  }

  .releve .isole {
    color: var(--ok);
    font-weight: 600;
  }

  .releve .nonIsole {
    color: var(--alerte);
    font-weight: 600;
  }

  .releve .muet {
    color: var(--gris);
  }

  .releve .part {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--encre-doux);
    white-space: nowrap;
  }
</style>
