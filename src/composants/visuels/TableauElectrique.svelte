<script module lang="ts">
  /**
   * Le tableau électrique — le visuel de l'écran Électricité.
   *
   * ── Pourquoi ce dessin-là ───────────────────────────────────────────────────
   *
   * Le diagnostic électrique ne se raconte pas : il se regarde. Un coffret, des
   * modules clipsés sur un rail, des manettes relevées, et le courant qui
   * circule. Le lecteur reconnaît l'objet avant d'avoir lu un mot — c'est ce que
   * la maquette a compris, et c'est ce qu'on reprend, module pour module.
   *
   * ── Pourquoi ce n'est PAS le tableau du logement ────────────────────────────
   *
   * La maquette dessine dix modules, C1 à C10, dont deux usés. Un rapport
   * d'installation intérieure d'électricité n'écrit jamais ça : il ne compte pas
   * les circuits, il ne les nomme pas, il ne dit pas lequel est fatigué. Dessiner
   * dix modules reviendrait à inventer un décompte — exactement ce que ce produit
   * s'interdit.
   *
   * Alors le coffret garde sa forme et change de sujet : UN MODULE PAR POINT DE
   * CONTRÔLE DE LA NORME. Cette liste-là, elle, est réglementaire, fixe, et ne
   * dépend pas du rapport déposé. Ce qui dépend du rapport, c'est l'état de
   * chaque module — et quand le rapport ne permet pas de le trancher, la manette
   * reste éteinte au lieu de s'allumer au hasard. La réserve est écrite sous le
   * dessin, pas cachée dans ce commentaire.
   *
   * ── Ce qui passe par les jetons, et ce qui reste écrit ici ──────────────────
   *
   * Ce dessin était déjà sombre : l'électricité était le seul écran noir du
   * produit, et ses couleurs avaient été mesurées sur une carte presque noire,
   * le #14212b de l'ancien univers. Le passage au pétrole ne l'a donc pas rendu
   * illisible d'un coup — il a fait pire, il l'a rendu illisible par endroits :
   * la carte s'est ÉCLAIRCIE jusqu'au #335455, et trois couples sont passés
   * sous le seuil sans que rien ne change à l'écran de manière visible. Le gris
   * doux tombait à 4,21, l'orange d'usure à 3,57, le gris éteint à 2,61.
   *
   * Ce qui ÉCRIT et ce qui SÉPARE passe désormais par les jetons de l'univers :
   * `--u-texte`, `--u-texte-doux`, `--u-accent-vif`, `--u-trait`. Le prochain
   * mouvement de charte les emportera sans qu'on rouvre ce fichier — et brancher
   * les manettes sur l'accent vif ne trahit rien, puisque le jaune de phase EST
   * déjà, à la valeur près, l'accent vif de l'écran Électricité.
   *
   * Ce qui reste écrit ici, ce sont les couleurs de SUJET : un coffret est un
   * boîtier anthracite, une manette usée tire vers l'orange, une manette hors
   * tension est grise. Aucun jeton ne dit cela, et un jeton qui le dirait serait
   * un jeton de trop. Elles gardent une valeur en dur, mesurée sur son fond
   * réel, au même titre que les sept teintes A→G de l'étiquette.
   *
   * Les valeurs de repli sont celles de l'univers Électricité : rendu à plat —
   * page complète, impression — le conteneur `.dedans` n'est pas là, donc
   * `--u-*` non plus. Ce repli jouait autrefois contre le dessin, quand la
   * charte était claire et que `--encre` valait le bleu pétrole #12463b ; la
   * charte étant sombre des deux côtés, il joue maintenant avec lui.
   *
   * Une seule couleur de la maquette reste refusée : le #5F7686 des repères, qui
   * ne tient que 2,35 sur le corps du module — remplacé par le texte doux de
   * l'univers, #cbd8dd (7,65).
   */

  /** Ce que le rapport permet de dire d'un point de contrôle. */
  export type EtatPoint = 'anomalie' | 'sansAnomalie' | 'inconnu';

  export interface PointControle {
    /** Le point de contrôle de la norme, nommé en français courant. */
    nom: string;
    etat: EtatPoint;
    /** Le libellé exact du rapport, quand il en donne un. */
    detail?: string;
  }

  /*
   * L'état se dit toujours en toutes lettres. Une manette orange au milieu de
   * manettes jaunes, ça se voit — mais « ça se voit » ne vaut que pour ceux qui
   * voient, et une capture d'écran envoyée à un artisan ne se lit pas en couleur.
   */
  const MOT: Record<EtatPoint, string> = {
    anomalie: 'anomalie',
    sansAnomalie: 'rien à signaler',
    inconnu: 'non lu'
  };
</script>

<script lang="ts">
  import type { Gravite } from '../../lib/modele';

  const {
    points,
    nombreAnnonce,
    gravite
  }: {
    /**
     * Les points de contrôle à dessiner, dans l'ordre de la norme. Une liste
     * vide n'est pas une erreur : c'est le cas « on n'a rien pu lire », et le
     * coffret se dessine porte fermée.
     */
    points: PointControle[];
    /**
     * Le nombre d'anomalies que le rapport ÉCRIT, et lui seul. Surtout pas le
     * nombre de lignes qu'on a su compter : ce n'est pas le même chiffre.
     */
    nombreAnnonce: number | null;
    gravite: Gravite;
  } = $props();

  /** Les points auxquels le rapport rattache nommément une anomalie. */
  const rattachees = $derived(points.filter((p) => p.etat === 'anomalie').length);
  const inconnus = $derived(points.filter((p) => p.etat === 'inconnu').length);

  /* La phrase du haut : ce que le rapport conclut, sans arrondi ni supposition. */
  const compte = $derived.by((): string => {
    if (nombreAnnonce !== null) {
      if (nombreAnnonce === 0) return 'Le rapport conclut à aucune anomalie.';
      return `Le rapport annonce ${nombreAnnonce} anomalie${nombreAnnonce > 1 ? 's' : ''}.`;
    }
    if (gravite === 'bon') return 'Le rapport conclut à aucune anomalie.';
    if (gravite === 'attention' || gravite === 'alerte') {
      return 'Le rapport signale des anomalies, sans en écrire le nombre.';
    }
    return 'La conclusion du rapport n’a pas pu être lue : elle est cochée à la main.';
  });

  /*
   * L'écart entre ce que le rapport annonce et ce qu'on a su rattacher à un
   * point précis. Le taire donnerait un dessin plus propre et un produit moins
   * honnête : le lecteur compterait les manettes orange et trouverait un autre
   * chiffre que celui de la page de conclusion. Les deux sens sont dits, parce
   * que le rattachement se fait sur le libellé et peut aussi bien en désigner
   * trop peu que trop.
   */
  const ecart = $derived.by((): string | null => {
    if (nombreAnnonce === null) return null;

    if (nombreAnnonce > rattachees) {
      if (rattachees === 0) {
        return 'Aucune n’a pu être rattachée à un point de contrôle précis : le coffret ne les montre donc pas.';
      }
      return `${rattachees} ${rattachees > 1 ? 'ont pu être rattachées' : 'a pu être rattachée'} à un point de contrôle ci-dessous ; les autres ne sont pas nommées dans le texte lu.`;
    }

    if (rattachees > nombreAnnonce) {
      return `${rattachees} points de contrôle sont signalés ci-dessous : une même anomalie peut en concerner plusieurs. C’est le chiffre du rapport qui fait foi.`;
    }

    return null;
  });
</script>

<figure class="tableau">
  <p class="intitule">Le coffret, point de contrôle par point de contrôle</p>

  <!-- Le dessin ne porte aucune information qui ne soit pas écrite juste en
       dessous : il est donc retiré de l'arbre d'accessibilité en entier. -->
  <div class="coffret" aria-hidden="true">
    <div class="rail"></div>

    {#if points.length}
      <div class="modules">
        {#each points as p, i (p.nom)}
          <div class="module {p.etat}" style="--i: {i}">
            <span class="manette"></span>
            <em class="repere">{i + 1}</em>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Porte fermée : on sait qu'il y a un tableau, on ne sait pas ce qu'il y
           a dedans. C'est plus juste qu'une rangée de manettes grises, qui
           laisserait croire à un nombre de points. -->
      <div class="porte"><span class="porte-mot">?</span></div>
    {/if}

    <!-- Le courant. Décoratif, et c'est assumé : c'est le seul endroit du
         composant qui bouge sans rien affirmer. -->
    <div class="fil">
      {#each [0, 1, 2] as k (k)}
        <span class="course" style="--retard: {k * 0.85}s"><i class="etincelle"></i></span>
      {/each}
    </div>
  </div>

  <figcaption>
    <p class="compte">{compte}</p>

    {#if points.length}
      <ol class="liste">
        {#each points as p, i (p.nom)}
          <li class={p.etat}>
            <!-- Le numéro ne sert qu'à retrouver le module dans le dessin ;
                 le dessin étant masqué aux lecteurs d'écran, il n'a rien à leur
                 dire — et la liste ordonnée les numérote déjà. -->
            <span class="num" aria-hidden="true">{i + 1}</span>
            <span class="texte">
              <span class="nom">{p.nom}</span>
              <span class="etat">{MOT[p.etat]}</span>
              {#if p.detail}<span class="detail">{p.detail}</span>{/if}
            </span>
          </li>
        {/each}
      </ol>
    {/if}

    {#if ecart}<p class="reserve">{ecart}</p>{/if}

    {#if inconnus > 0}
      <p class="reserve">
        {inconnus === 1
          ? 'Un point n’a pas pu être lu dans le rapport : sa manette reste éteinte.'
          : `${inconnus} points n’ont pas pu être lus dans le rapport : leurs manettes restent éteintes.`}
      </p>
    {/if}

    <p class="reserve">
      Un module par point de contrôle de la norme, pas par circuit du logement :
      le rapport n’écrit pas combien votre tableau compte de circuits.
    </p>
  </figcaption>
</figure>

<style>
  /*
   * La carte de l'univers. Les jetons `--u-*` sont posés par `styleUnivers()`
   * sur le conteneur de l'écran ; les valeurs de repli sont exactement celles de
   * l'univers Électricité, pour que les mesures de contraste tiennent aussi hors
   * de l'application — dossier à plat, impression, montage de test.
   */
  .tableau {
    margin: var(--e3) 0 0;
    padding: var(--e4);
    background: var(--u-surface, #14212b);
    border: 1px solid var(--u-trait, #24333f);
    border-radius: var(--rayon);

    /* Couleurs de sujet du coffret, mesurées sur leur fond réel. */
    --coffret: #0c1a22;
    --module-haut: #26383f;
    --module-bas: #182830;
    --sous-tension: #ffd54f; /* 12,54 sur le coffret · 8,65 sur le module */
    --usure: #ff8a65; /*        7,65 sur le coffret · 5,28 sur le module */
    --eteinte: #7d94a3; /*      5,59 sur le coffret · 3,86 sur le module */
    --ecrit: #e8eef2; /*       13,99 sur la carte */
    /*
     * Eclairci de #a8bcc7 a #bccdd7.
     *
     * Ces valeurs avaient ete mesurees sur les fonds du COFFRET, qui sont
     * tres sombres. Mais quatre classes qui s'en servent -- detail, etat,
     * intitule, reserve -- s'ecrivent en dehors du coffret, sur la surface de
     * l'univers. La mesure ne les couvrait pas : 4,36 mesure a l'ecran sur
     * l'electricite, sous le seuil de 4,5, quinze fois.
     */
    --ecrit-doux: #bccdd7; /*   plus de 4,5 sur le coffret, le module ET la surface */
  }

  .intitule {
    margin: 0 0 var(--e3);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    /* La maquette écrit ces intitulés en #5F7686 : 3,45 sur la carte, sous le
       seuil. Le gris clair de l'univers passe à 8,33. */
    color: var(--ecrit-doux);
  }

  /* ---- Le coffret ------------------------------------------------------- */
  .coffret {
    padding: var(--e4);
    background: var(--coffret);
    border: 2px solid rgb(255 213 79 / 20%);
    border-radius: var(--rayon);
  }

  /* Le rail DIN : la barre sur laquelle tout se clipse. Il dépasse les modules,
     comme un vrai rail — c'est ce qui permet de ne pas étirer sept modules sur
     toute la largeur pour remplir le vide. */
  .rail {
    height: 5px;
    margin-bottom: var(--e3);
    border-radius: 3px;
    background: linear-gradient(90deg, rgb(255 213 79 / 34%), rgb(255 213 79 / 10%));
  }

  /*
   * La maquette fixe cinq colonnes pour dix modules, chacun large d'environ
   * 53 px. Le nombre de points de contrôle, lui, n'est pas garanti : une grille
   * en `1fr` étirerait sept modules sur 800 px de large, soit des modules de
   * 240 px de haut (leur rapport est de 1:2). Les modules gardent donc leur
   * taille et se posent sur le rail les uns après les autres, en repassant à la
   * ligne quand la place manque.
   */
  .modules {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2);
  }

  .module {
    position: relative;
    flex: 0 1 54px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    aspect-ratio: 0.5;
    min-width: 0;
    padding-top: 6px;
    background: linear-gradient(180deg, var(--module-haut), var(--module-bas));
    border: 1px solid rgb(255 255 255 / 9%);
    border-radius: 5px;

    /* L'enclenchement : les modules se clipsent l'un après l'autre. Transform et
       opacité seulement, et l'origine en bas — un module se rabat sur son rail. */
    transform-origin: bottom center;
    opacity: 0;
    animation: enclenche 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--i, 0) * 55ms);
  }

  @keyframes enclenche {
    from {
      opacity: 0;
      transform: translateY(9px) scaleY(0.82);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  /* La manette. Relevée et jaune : le circuit est sous tension et rien n'est
     signalé dessus. */
  .manette {
    display: block;
    flex: none;
    width: 10px;
    height: 15px;
    border-radius: 2px;
    background: var(--sous-tension);
    box-shadow: 0 0 8px rgb(255 213 79 / 55%);
  }

  .module.anomalie .manette {
    background: var(--usure);
    box-shadow: 0 0 8px rgb(255 138 101 / 55%);
  }

  /* Éteinte : pas de halo du tout. L'absence de lumière est le message. */
  .module.inconnu .manette {
    background: var(--eteinte);
    box-shadow: none;
    opacity: 0.75;
  }

  .repere {
    position: absolute;
    bottom: 4px;
    font-size: 0.6875rem;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    /* 6,21 sur le haut du module, 7,71 sur le bas — le pire cas passe. */
    color: var(--ecrit-doux);
  }

  /* La porte fermée, quand rien n'a pu être lu. */
  .porte {
    display: grid;
    place-items: center;
    height: 84px;
    border: 1px solid rgb(255 255 255 / 9%);
    border-radius: 5px;
    background: repeating-linear-gradient(
      135deg,
      var(--module-bas) 0 10px,
      var(--module-haut) 10px 20px
    );
  }

  .porte-mot {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--eteinte);
  }

  /* ---- Le courant ------------------------------------------------------- */
  .fil {
    position: relative;
    height: 2px;
    margin-top: var(--e3);
    border-radius: 2px;
    background: rgb(255 213 79 / 12%);
    overflow: hidden;
  }

  /*
   * La maquette anime `left`, ce qui fait recalculer la mise en page à chaque
   * image. Le chariot fait toute la largeur du fil et se déplace en `transform` :
   * l'étincelle collée à son bord gauche parcourt donc exactement le fil, et le
   * compositeur travaille seul.
   */
  .course {
    position: absolute;
    inset: 0;
    animation: parcours 2.5s linear infinite;
    animation-delay: var(--retard, 0s);
  }

  @keyframes parcours {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }

  .etincelle {
    position: absolute;
    top: -2.5px;
    left: -8px;
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--sous-tension);
    box-shadow: 0 0 9px var(--sous-tension);
  }

  /* ---- Ce qui est écrit -------------------------------------------------- */
  figcaption {
    margin-top: var(--e4);
  }

  .compte {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--ecrit);
  }

  .liste {
    margin: var(--e3) 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--e2);
  }

  .liste li {
    display: flex;
    gap: var(--e3);
    align-items: baseline;
  }

  /* Le numéro fait le lien avec le module du dessin. Il porte la couleur de
     l'état : c'est le seul endroit où couleur et mot disent la même chose au
     même endroit, donc le seul endroit où la couleur aide vraiment. */
  .num {
    flex: none;
    min-width: 1.4em;
    font-size: var(--t-petit);
    font-weight: 700;
    text-align: right;
    color: var(--sous-tension);
  }

  .liste li.anomalie .num {
    color: var(--usure);
  }

  .liste li.inconnu .num {
    color: var(--eteinte);
  }

  .texte {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--e2);
    align-items: baseline;
  }

  .nom {
    font-size: var(--t-petit);
    color: var(--ecrit);
  }

  .etat {
    font-size: var(--t-micro);
    color: var(--ecrit-doux);
  }

  .detail {
    flex-basis: 100%;
    font-size: var(--t-micro);
    line-height: 1.45;
    color: var(--ecrit-doux);
  }

  /* Les réserves. Jamais absentes, jamais en tout petit gris illisible :
     8,33 de contraste, comme le reste du texte secondaire. */
  .reserve {
    margin: var(--e3) 0 0;
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--ecrit-doux);
  }

  /*
   * Svelte n'applique rien de tout seul aux animations écrites à la main : la
   * coupure est explicite, et les étincelles deviennent trois points posés sur
   * le fil — le courant se lit encore, il ne bouge plus.
   */
  @media (prefers-reduced-motion: reduce) {
    .module {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .course {
      animation: none;
    }

    .course:nth-child(1) {
      transform: translateX(24%);
    }

    .course:nth-child(2) {
      transform: translateX(54%);
    }

    .course:nth-child(3) {
      transform: translateX(84%);
    }
  }
</style>
