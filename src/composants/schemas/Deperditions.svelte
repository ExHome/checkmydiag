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
  import Maison from './briques/Maison.svelte';
  import { exploration } from '../../lib/savoir/pile.svelte';

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
    cote: 'gauche' | 'droite';
  }

  /**
   * Les six chemins par où la chaleur s'en va.
   *
   * ── CE QUE CE DESSIN NE DIT PLUS ──────────────────────────────────────────
   *
   * Il portait deux chiffres, et aucun ne venait du rapport lu.
   *
   * `poids` donnait à chaque souffle une épaisseur différente — toiture 7,
   * ventilation 6, murs 6, fenêtres 4,5, jonctions 3,5, plancher 4 — et `part`
   * écrivait « 25-30 % », « 20-25 % »… Ce sont les ordres de grandeur NATIONAUX
   * de l'ADEME, codés en dur, rigoureusement identiques pour les 12 000
   * dossiers du corpus.
   *
   * Une épaisseur qui varie énonce une hiérarchie des pertes. Le lecteur
   * comprend « chez moi, c'est surtout le toit » — et son rapport ne dit pas
   * cela. Il ne le dit nulle part : mesuré sur le corpus, aucun texte de volet
   * DPE ne porte ces pourcentages, ils vivent dans une IMAGE du rapport.
   *
   * Un dessin ne se lit pas, il se croit : c'est ce qui le rend dangereux quand
   * il affirme. Les six souffles ont donc la même épaisseur. Le dessin dit OÙ
   * la chaleur passe — vrai des six — et se tait sur les proportions.
   */
  const SORTIES: Sortie[] = [
    { notion: 'toiture', paroi: 'toit', de: [250, 96], vers: [250, 44], cote: 'droite' },
    { notion: 'ventilation', de: [186, 176], vers: [110, 128], cote: 'gauche' },
    { notion: 'murs', paroi: 'murs', de: [156, 244], vers: [92, 244], cote: 'gauche' },
    { notion: 'fenetres', paroi: 'fenetres', de: [344, 200], vers: [412, 200], cote: 'droite' },
    { notion: 'pont-thermique', libelle: 'Jonctions', de: [344, 282], vers: [396, 282], cote: 'droite' },
    { notion: 'plancher-bas', libelle: 'Plancher', paroi: 'plancher', de: [250, 306], vers: [250, 372], cote: 'droite' }
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
   * CE QUE LE RAPPORT DIT DE CHAQUE PAROI — EN TOUTES LETTRES.
   *
   * Le mot « Isolé / Sans isolant / Non renseigné » n'existait que dans le
   * tableau d'impression, en `display: none` à l'écran. À l'écran, l'état d'une
   * paroi n'était donc porté QUE par la couleur d'un point sur le dessin.
   *
   * C'est une infraction au principe le plus simple de l'accessibilité — la
   * couleur ne porte jamais seule une information — et elle touchait la donnée
   * la plus utile du schéma. Un daltonien, une capture en noir et blanc, un
   * écran au soleil : trois façons de perdre l'information.
   */
  const MOT_ETAT: Record<string, string> = {
    isole: 'Isolé',
    nonIsole: 'Sans isolant',
    inconnu: 'Non renseigné',
    sansParoi: 'Rien à isoler'
  };

  /** L'état d'une sortie, sous forme de clé — les quatre cas sont distincts. */
  function cleEtat(sortie: Sortie): keyof typeof MOT_ETAT {
    if (!sortie.paroi) return 'sansParoi';
    const e = etatDe(sortie);
    return e === 'isole' ? 'isole' : e === 'nonIsole' ? 'nonIsole' : 'inconnu';
  }

  /** La paroi qu'on vient de toucher, s'il y en a une. */
  let paroiTouchee = $state<string | null>(null);

  /**
   * L'ACCÈS AU SAVOIR, RENDU AUX PUCES.
   *
   * Les huit notions du DPE — toiture, ventilation, murs, fenêtres, ponts
   * thermiques, plancher bas, chauffage, eau chaude — ne s'ouvraient que depuis
   * les étiquettes posées sur le dessin. En les retirant pour supprimer la
   * liste affichée deux fois, j'ai supprimé du même coup le SEUL chemin vers
   * ce savoir : il est devenu inatteignable.
   *
   * Il revient sur les puces, qui sont désormais les contrôles. Un premier
   * appui désigne la paroi sur le dessin — c'est le niveau 2, « où ». Un second
   * ouvre la notion — c'est le niveau 3, « comprendre ». Le geste est le même,
   * la profondeur augmente : c'est exactement la progressive disclosure
   * demandée, et ça évite un second contrôle par paroi.
   */
  function toucher(notion: string): void {
    if (paroiTouchee === notion) {
      exploration.ouvrir(notion);
      return;
    }
    paroiTouchee = notion;
  }

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


</script>

<figure class:papier>
  {#if !papier}
    <p class="invite">Touchez une paroi pour la situer, une seconde fois pour comprendre.</p>
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
        class:sans-paroi={!sortie.paroi}
        class:inconnu={!!sortie.paroi && etat === null}
        class:promu={paroiTouchee === sortie.notion}
      />
    {/each}

    <!--
      LES ÉTIQUETTES ONT QUITTÉ LE DESSIN.

      Elles y étaient toutes les huit — Toiture, Ventilation, Murs, Fenêtres,
      Jonctions, Plancher, Chauffage, Eau chaude — et TOUTES sont répétées
      juste dessous : les six parois dans leurs puces, les deux équipements
      dans le relevé. On lisait donc deux fois la même liste, avec en prime des
      noms qui différaient d'une fois à l'autre (« Ventilation » sur le dessin,
      « Air renouvelé » dans la puce).

      « Moins mais mieux » : quand la même chose est dite deux fois, on garde
      celle qui la dit le mieux. Les puces gagnent — elles portent le mot
      d'état, elles font 44 px de haut, et elles sont à taille de lecture au
      lieu d'être calées à la main en unités de viewBox.

      Le dessin garde ce que lui seul sait dire : la silhouette, les six
      souffles et leur tracé, le badge de classe. Il montre OÙ, il ne nomme
      plus.
    -->
  </svg>

  <!-- Le relevé, sur le document remis seulement : le lecteur qui tient une
       feuille ne peut pas ouvrir « et chez moi ? ». -->
  {#if papier}
    <table class="releve">
      <thead>
        <tr>
          <th>Par où</th>
          <!-- La colonne « Part des pertes » a disparu : elle imprimait les
               ordres de grandeur nationaux de l'ADEME comme s'ils venaient du
               dossier remis. -->
          <th>Ce que dit le rapport</th>

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
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <!-- On ne pose pas une question au lecteur : on lui dit ce que son rapport
       raconte. Le détail se prend sur le dessin. -->
  <!--
    LES SIX PAROIS, EN TOUTES LETTRES ET SOUS LE DOIGT.

    Chaque bouton nomme une paroi et dit son état avec un MOT, pas seulement
    avec la couleur d'un point sur le dessin. Le toucher met son souffle en
    évidence : c'est le lien entre la liste et le dessin, dans les deux sens.

    Ils sont en HTML et non dans le SVG : une cible de 44 px y est triviale,
    alors que dans un viewBox de 562 rendu sur 306 px, chaque unité vaut 0,54
    pixel et la même cible demanderait 81 unités de calcul à la main.
  -->
  <ul class="parois">
    {#each SORTIES as sortie (sortie.notion)}
      {@const cle = cleEtat(sortie)}
      <li>
        <button
          type="button"
          class="paroi {cle}"
          class:touchee={paroiTouchee === sortie.notion}
          aria-pressed={paroiTouchee === sortie.notion}
          onclick={() => toucher(sortie.notion)}
        >
          <span class="pastille-paroi" aria-hidden="true"></span>
          <span class="nom-paroi">{NOM_SORTIE[sortie.notion]}</span>
          <span class="etat-paroi">{MOT_ETAT[cle]}</span>
        </button>
      </li>
    {/each}
  </ul>

  <figcaption class="constat">
    <!--
      LE CONSTAT DISAIT CE QUE LE DESSIN MONTRE DEJA.

      « Votre logement est classé F. Le rapport donne les fenêtres comme
      isolées. » — la classe est sur la règle, segment retenu en encre pleine ;
      « fenêtres isolées » est écrit sur sa puce, avec le mot ISOLÉ.

      « Si le texte répète simplement le visuel : SUPPRIMER. » Rien ne se perd :
      les deux informations restent, montrées au lieu d'être dites.
    -->

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

  /*
   * UNE GRILLE, PAS UNE LIGNE QUI S'ETIRE.
   *
   * En flex, le nom prenait toute la place restante et le chiffre commencait
   * pile a sa suite : on lisait « Chauffage13 400 kWh/an », le mot colle au
   * nombre. Trois colonnes reglees d'avance, et les chiffres s'alignent d'une
   * ligne a l'autre -- ce qui est le propre d'un releve.
   */
  .autres-postes li {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: baseline;
    column-gap: var(--e4);
    row-gap: 2px;
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
    text-align: right;
  }

  /* Le cout passe sous le chiffre, aligne a droite avec lui : c'est la meme
     mesure vue autrement, pas une troisieme colonne. */
  .poste-cout {
    grid-column: 2;
    font-size: var(--t-micro);
    color: var(--encre-doux);
    font-variant-numeric: tabular-nums;
    text-align: right;
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

  /*
   * LES SIX PAROIS, SOUS LE DOIGT.
   *
   * Une grille de boutons plutôt qu'une liste de lignes : la cible fait 44 px
   * de haut, ce qu'un pouce vise, et les six tiennent sur deux colonnes même à
   * 320 px de large.
   */
  .parois {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(136px, 1fr));
    gap: 6px;
    margin: var(--e3) 0 0;
    padding: 0;
  }

  .paroi {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px 7px;
    padding: 6px 10px;
    background: var(--papier-doux, color-mix(in srgb, var(--encre) 5%, transparent));
    border: none;
    border-radius: 12px;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--encre) 18%, transparent);
    color: var(--n2, var(--encre));
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: box-shadow var(--duree) var(--courbe);
  }

  .nom-paroi {
    font-size: var(--t-petit);
    font-weight: 700;
  }

  /* LE MOT, et pas seulement la pastille : c'est lui qui porte l'état quand la
     couleur ne peut pas — daltonisme, noir et blanc, plein soleil. */
  .etat-paroi {
    flex: 1 0 100%;
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--n3, var(--encre-doux));
  }

  /* La pastille répète l'état en couleur. Elle ne le dit jamais seule. */
  .pastille-paroi {
    width: 9px;
    height: 9px;
    flex: none;
    border-radius: 50%;
    background: var(--trait-inconnu);
  }

  .paroi.nonIsole .pastille-paroi {
    background: var(--alerte);
  }

  .paroi.isole .pastille-paroi {
    background: var(--ok);
  }

  /* La promotion : la paroi touchée s'entoure, son souffle s'épaissit. Rien
     d'autre ne bouge — atténuer les cinq autres les ferait passer sous le seuil
     de contraste des éléments graphiques. */
  .paroi.touchee {
    box-shadow: 0 0 0 2px var(--action, var(--n6));
  }

  .paroi:focus-visible {
    outline: 2px solid var(--n2, var(--encre));
    outline-offset: 2px;
  }

  .souffle.promu {
    stroke-width: 8;
  }

  @media (prefers-reduced-motion: reduce) {
    .paroi {
      transition: none;
    }
  }

  /*
   * LE SOUFFLE — UNE SEULE ÉPAISSEUR, ET LA FORME PORTE L'ÉTAT.
   *
   * L'épaisseur variait pour dire le poids du poste : elle affirmait une
   * hiérarchie des pertes que le rapport ne donne pas. Les six sont désormais
   * identiques.
   *
   * Ce qui varie, c'est le TRACÉ — et c'est un signal qui survit au noir et
   * blanc, contrairement à la couleur seule :
   *
   *   trait plein        la paroi n'est pas isolée
   *   pointillé serré    elle est isolée
   *   pointillé fin      le rapport ne dit rien de cette paroi
   *   tirets longs       il n'y a pas de paroi à isoler (l'air renouvelé,
   *                      les jonctions : ils ne s'isolent pas)
   *
   * Les deux derniers cas étaient rendus À L'IDENTIQUE : rien ne distinguait
   * « le rapport se tait sur le toit » de « la ventilation n'a pas de paroi ».
   */
  .souffle {
    stroke: var(--alerte);
    stroke-width: 5;
    stroke-linecap: round;
    fill: none;
  }

  /* Isolée : le trait se rompt — la chaleur passe moins. */
  .souffle.isole {
    stroke: var(--ok);
    stroke-dasharray: 3 7;
  }

  /* Non isolée : trait plein, le seul qui ne se rompt jamais. */
  .souffle.non-isole {
    stroke-dasharray: none;
  }

  /* Le rapport ne dit rien de cette paroi : gris, presque pointillé. Ce n'est
     pas un constat rassurant, c'est une absence — elle ne prend donc ni le vert
     ni le rouge. */
  .souffle.inconnu {
    stroke: var(--trait-inconnu);
    stroke-dasharray: 1 6;
  }

  /* Rien à isoler ici. L'opacité seule ne suffirait pas — un trait pâle se lit
     comme un trait pâle, pas comme une catégorie : les tirets longs le disent. */
  .souffle.sans-paroi {
    stroke: var(--trait-inconnu);
    stroke-dasharray: 14 10;
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
