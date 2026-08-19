<script lang="ts">
  /**
   * Le visuel de l'écran Gaz : la chaudière et sa jauge de vétusté.
   *
   * Transposition du bloc `case 'gaz'` de CHECKMYDIAG_APP.html (l. 809-830 pour
   * le rendu, l. 274-287 pour le style) : une carte, un intitulé, à gauche le
   * corps de chaudière à bord épais avec son écran sombre et ses trois flammes
   * qui vacillent, à droite l'âge en gros chiffre au-dessus d'une jauge graduée
   * 0 → 30 ans et sa note de repère.
   *
   * ── Ce qui change par rapport à la maquette, et pourquoi ────────────────────
   *
   * 1. LES CHIFFRES. La maquette décrit un bien fictif : « 1995 », « 28 ans »,
   *    une barre figée à 93 %, la conclusion « Celle-ci a largement dépassé ».
   *    Rien de tout cela n'est écrit ici. L'année vient du rapport déposé, l'âge
   *    s'en déduit, la conclusion se calcule. Quand l'année n'a pas été lue —
   *    c'est le cas le plus fréquent : elle est sur la plaque signalétique, pas
   *    dans le formulaire — la jauge disparaît et le composant DIT pourquoi. Un
   *    visuel qui affiche une valeur d'exemple ruine la seule promesse du
   *    produit.
   *
   * 2. LA LUMIÈRE EST INVERSÉE. La maquette pose ce dessin sur une carte
   *    blanche ; l'univers gaz est désormais un pétrole sombre (fond #213e44,
   *    carte #324c51). Tout ce qui était encre foncée passe aux jetons clairs
   *    de l'univers, tout ce qui était aplat pâle devient un voile de crème
   *    translucide. Le SUJET ne bouge pas : la flamme reste orange, l'afficheur
   *    reste un afficheur sombre à chiffres orange, la jauge garde son
   *    vert → rouge. Seule change la lumière qui tombe dessus.
   *
   *    Chaque couple est mesuré (WCAG 2.1, luminance relative avec correction
   *    gamma, voiles composés sur leur fond réel) et la mesure est écrite en
   *    face de la règle. Le pire texte du dessin tient 5,20:1, le pire élément
   *    porteur d'information 3,10:1.
   *
   * 3. DEUX ANIMATIONS. Les flammes montaient en animant leur HAUTEUR et la
   *    jauge se remplissait en animant sa LARGEUR : un recalcul de mise en page
   *    à chaque image, en boucle, sur un téléphone. Même dessin, même amplitude,
   *    obtenus par `scaleY` et `scaleX`. Effet de bord heureux : l'état final de
   *    la jauge vit désormais dans la règle de base, plus dans l'animation — la
   *    maquette devait rattraper ça avec un `width:93% !important` dans son bloc
   *    « reduced motion », ici couper l'animation ne peut pas vider la jauge.
   *
   * Le composant ne dessine QUE la carte de la maquette : pas de bandeau de
   * danger (le verdict de la fiche le porte déjà, en tête, en rouge), pas de
   * filigrane en fond d'écran. Ni l'un ni l'autre n'existe dans les maquettes.
   */

  const {
    annee = null,
    anneeControle = null,
    appareil = null
  }: {
    /** Année d'installation de l'appareil, lue au rapport. `null` = non lue. */
    annee?: number | null;
    /** Année du contrôle, lue au rapport. `null` = non lue. */
    anneeControle?: number | null;
    /** L'appareil tel que le rapport le nomme, s'il le nomme. */
    appareil?: string | null;
  } = $props();

  /**
   * Une année n'est retenue que si c'en est une.
   *
   * L'appelant calcule souvent son année par `Number(...)`, qui rend `NaN` sans
   * prévenir : sans ce filtre, l'écran de la chaudière afficherait « NaN » et
   * l'intitulé « année d'installation NaN ». Les bornes écartent en plus les
   * numéros de série pris pour des dates par l'extraction.
   */
  function anneeValide(v: number | null): number | null {
    return v !== null && Number.isInteger(v) && v >= 1900 && v <= 2200 ? v : null;
  }

  const anneeLue = $derived(anneeValide(annee));
  const controleLu = $derived(anneeValide(anneeControle));

  /**
   * L'âge, ou rien.
   *
   * Il se compte par rapport à la date du CONTRÔLE, jamais par rapport à
   * aujourd'hui : un rapport de 2019 dit l'âge de l'appareil en 2019, et le
   * vieillir de six ans en silence serait un chiffre de plus que personne n'a
   * lu. Second garde-fou, l'écart doit rester plausible — un âge absurde
   * affiché en 42px est pire qu'un âge absent.
   */
  const age = $derived.by(() => {
    if (anneeLue === null || controleLu === null) return null;
    const ecart = controleLu - anneeLue;
    return ecart >= 0 && ecart <= 70 ? ecart : null;
  });

  /** Pourquoi il n'y a pas de jauge. Le lecteur a droit à la raison exacte. */
  const raisonSansAge = $derived.by((): 'annee' | 'controle' | 'suspect' | null => {
    if (age !== null) return null;
    if (annee === null) return 'annee';
    if (anneeLue === null) return 'suspect';
    if (anneeControle === null) return 'controle';
    return 'suspect';
  });

  const MESSAGE_SANS_AGE: Record<'annee' | 'controle' | 'suspect', string> = {
    annee:
      'Sans elle, l’âge de l’appareil ne peut pas être calculé — et il ne sera pas inventé. Elle figure d’ordinaire sur la plaque signalétique, au dos ou sous l’appareil.',
    controle:
      'La date du contrôle n’a pas été lue dans le rapport. Sans elle, l’âge de l’appareil ne peut pas être calculé.',
    suspect:
      'L’année lue dans le rapport ne donne pas un âge plausible : elle a très probablement été mal reconnue. Rien ne s’affiche, plutôt qu’un chiffre faux.'
  };

  /** L'échelle de la maquette va de 0 à 30 ans. Au-delà, la jauge sature. */
  const part = $derived(age === null ? 0 : Math.min(age / 30, 1));

  /**
   * Le nom de l'appareil.
   *
   * « Chaudière » par défaut serait une affirmation : un diagnostic gaz peut ne
   * porter que sur une cuisinière et un chauffe-eau. Le repli est donc neutre,
   * et la formulation évite l'accord (« année d’installation », et non
   * « installée ») pour rester juste quel que soit le mot reçu.
   */
  const nom = $derived(appareil ?? 'Appareil au gaz');

  const titre = $derived(
    anneeLue !== null
      ? `${nom} — année d’installation ${anneeLue}`
      : `${nom} — année d’installation non indiquée`
  );

  /** Un afficheur ne peut pas être vide : quatre tirets disent « pas de valeur ». */
  const surEcran = $derived(anneeLue !== null ? String(anneeLue) : '– – – –');

  /**
   * La comparaison au repère d'usage.
   *
   * Elle se déduit de l'âge lu. La maquette conclut toujours « Celle-ci a
   * largement dépassé », parce qu'elle décrit un appareil de 28 ans.
   */
  const comparaison = $derived.by(() => {
    if (age === null) return '';
    if (age < 15) return 'Cet appareil est encore dans cette durée.';
    if (age <= 20) return 'Cet appareil y est.';
    return 'Cet appareil l’a dépassée.';
  });
</script>

<figure class="visuel-gaz apparait">
  <p class="titre">{titre}</p>

  <div class="banc">
    <!--
      La chaudière est un dessin, pas une donnée : tout ce qu'elle porte est
      repris en toutes lettres autour d'elle — l'année dans l'intitulé, le nom
      de l'appareil aussi. D'où `aria-hidden`.
    -->
    <div class="chaudiere" aria-hidden="true">
      <span class="ecran">{surEcran}</span>
      <span class="flammes">
        <span class="flamme"></span>
        <span class="flamme"></span>
        <span class="flamme"></span>
      </span>
      <span class="plaque">{nom}</span>
    </div>

    <div class="vetuste">
      {#if age !== null}
        <p class="age">
          <span class="age-n">{age}</span><span class="age-u">ans</span>
        </p>

        <div class="jauge" aria-hidden="true">
          <div class="barre"><i style="--part: {part}"></i></div>
          <div class="graduations"><span>0</span><span>15</span><span>30 ans</span></div>
        </div>

        <p class="repere">
          Repère d’usage, et non une lecture de votre rapport : une chaudière gaz se
          remplace en général entre 15 et 20 ans. {comparaison}
        </p>
      {:else if raisonSansAge !== null}
        <p class="inconnu">
          {#if raisonSansAge === 'annee'}
            <strong>L’année d’installation n’a pas été lue dans le rapport.</strong>
          {/if}
          {MESSAGE_SANS_AGE[raisonSansAge]}
        </p>
      {/if}
    </div>
  </div>
</figure>

<style>
  /* ── La carte ───────────────────────────────────────────────────────────────
     `.d-card` de la maquette. Elle s'habille aux jetons, et c'est pour ça
     qu'elle a suivi le passage au sombre sans qu'on la touche : dans l'écran
     gaz, `.dedans` pose maintenant `--papier: #324c51` et `--trait: #899694` à
     partir des `--u-*` de `styleUnivers('gaz')`. Le filet mesure 3,73:1 sur le
     fond de l'écran (#213e44) — c'est ce côté-là qui détache la carte. */
  .visuel-gaz {
    margin: 0 0 var(--e4);
    padding: var(--e4);
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-large);
  }

  /*
   * `.d-label` de la maquette.
   *
   * Deux corrections : le 10,5px passe au plus petit corps du produit (12px),
   * en dessous personne ne lit ; et le #C0A08D d'origine (un beige, jeton
   * inexistant côté produit, et de toute façon 1,79:1 sur la carte pétrole)
   * devient le texte doux de l'univers, #cbd8dd, mesuré 6,30:1 sur #324c51.
   */
  .titre {
    margin: 0 0 var(--e4);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  /* `.rig` : deux colonnes, la chaudière fixe, la jauge élastique. Le `wrap` est
     un ajout — sur un écran étroit la jauge passe dessous plutôt que d'écraser
     le chiffre de l'âge. */
  .banc {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e4);
    align-items: stretch;
  }

  /* ── La chaudière ─────────────────────────────────────────────────────────── */
  .chaudiere {
    flex: none;
    width: 112px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    padding: 12px 10px;
    /* Le bord est la seule ligne qui dessine l'objet : il doit tenir 3:1. À 24 %
       comme dans la maquette, l'accent clair composé sur la carte sombre ne
       donnait plus que 1,57:1 — la chaudière disparaissait. À 70 %, il mesure
       3,62:1 sur la carte. */
    border: 2.5px solid color-mix(in srgb, var(--u-accent, #fab88f) 70%, transparent);
    border-radius: 14px;
    /* La maquette pose du blanc à 55 % sur une carte blanche : le corps y est
       strictement invisible, seul le bord le dessine. Sur le pétrole, le même
       geste se fait à l'envers — un voile de crème très dilué, qui rend son
       volume au corps sans en faire une plaque laiteuse. */
    background: rgb(245 241 232 / 7%); /* = #40585c sur la carte */
  }

  /*
   * `.b-screen`. Un afficheur de chaudière est sombre à chiffres orange : c'est
   * le SUJET, il ne s'inverse pas parce que la page s'assombrit. Les deux
   * couleurs d'objet restent donc, le brun juste creusé de #33211a à #26160f —
   * sur une carte sombre, un afficheur éteint doit être plus sombre que ce qui
   * l'entoure pour rester un renfoncement, et les chiffres y gagnent (6,61:1
   * dans la maquette, 7,54:1 ici).
   *
   * Nouveau : le cerclage. Sur la carte blanche, le brun découpait l'afficheur
   * tout seul ; sur le corps sombre il ne le détache plus qu'à 2,36:1. Un filet
   * d'accent le borde — 4,45:1 sur le corps, 10,23:1 sur le verre. Il ne coûte
   * pas un pixel de hauteur, `box-sizing: border-box` étant global.
   *
   * Les chiffres tabulaires viennent de TEST_GAZ_CONTROLE.html — un afficheur
   * ne gigote pas.
   */
  .ecran {
    width: 100%;
    height: 33px;
    display: grid;
    place-items: center;
    border: 1px solid var(--u-accent, #fab88f);
    border-radius: 7px;
    background: #26160f;
    color: #ff8c42;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.6px;
    font-variant-numeric: tabular-nums;
  }

  .flammes {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    height: 32px;
  }

  /*
   * Les flammes.
   *
   * La maquette anime la HAUTEUR (19px ↔ 30px), donc la mise en page, à chaque
   * image, en boucle. Même dessin par `scaleY` depuis la base : hauteur fixe à
   * 30px, échelle 0,63 → 1. Le dégradé et le rayon se compriment exactement
   * comme ils le faisaient, mais l'animation reste sur le compositeur.
   *
   * Une flamme reste orange : le dégradé est celui de la maquette, sa base
   * seulement éclaircie de #ff6f00 à #ff8420. Le #ff6f00 ne tenait plus que
   * 2,80:1 sur le corps sombre — la flamme s'éteignait par le bas. À #ff8420
   * elle mesure 3,10:1, et sa pointe jaune 5,38:1. `--u-accent-vif` aurait été
   * le jeton naturel, mais son #f4701f tombe à 2,83:1 ici : c'est la seule
   * raison pour laquelle cette valeur reste écrite en clair.
   */
  .flamme {
    width: 10px;
    height: 30px;
    border-radius: 50% 50% 45% 45%;
    background: linear-gradient(180deg, #ffd54f, #ff8420);
    transform-origin: bottom center;
    animation: flamme 0.9s ease-in-out infinite;
  }

  .flamme:nth-child(2) {
    animation-delay: 0.15s;
  }

  .flamme:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes flamme {
    0%,
    100% {
      transform: scaleY(0.63);
      opacity: 0.85;
    }

    50% {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  /* `.b-cap`. Même correction de couleur que l'intitulé : 5,20:1 sur le corps
     de la chaudière (#40585c, le voile de crème composé sur la carte). C'est le
     texte le moins contrasté du dessin, et il est encore à 0,7 au-dessus du
     seuil. */
  .plaque {
    font-size: var(--t-micro);
    font-weight: 600;
    line-height: 1.35;
    text-align: center;
    color: var(--sur-fond-doux);
  }

  /* ── La jauge de vétusté ──────────────────────────────────────────────────── */
  .vetuste {
    flex: 1;
    min-width: 150px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--e3);
  }

  .age {
    margin: 0;
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  /*
   * `.life-n`.
   *
   * La maquette l'écrit en #F4701F, qui ne mesure que 2,92:1 sur blanc — sous
   * le seuil, y compris celui du grand texte (3:1). L'accent de l'univers dit
   * la même chose à 5,84:1, à l'œil c'est la même teinte.
   */
  .age-n {
    font-size: 42px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -2px;
    color: var(--u-accent, #a8480c);
    font-variant-numeric: tabular-nums;
  }

  .age-u {
    font-size: var(--t-petit);
    font-weight: 600;
    color: var(--sur-fond-doux);
  }

  /*
   * `.lifebar`.
   *
   * Le dégradé est décoratif — l'âge est écrit juste au-dessus, en toutes
   * lettres — mais son étendue doit rester perceptible : le jaune du milieu ne
   * pèse que 1,41:1 sur blanc. D'où le filet à l'accent, mesuré 5,84:1. La
   * hauteur de 9px de la maquette est conservée, `border-box` la garde exacte.
   */
  .barre {
    box-sizing: border-box;
    height: 9px;
    border: 1px solid var(--u-accent, #a8480c);
    border-radius: 5px;
    background: color-mix(in srgb, var(--u-accent, #a8480c) 10%, var(--papier));
    overflow: hidden;
  }

  /*
   * Le remplissage est posé par `transform`, jamais par `width` : l'état final
   * tient dans la règle, pas dans l'animation. Couper l'animation ne peut donc
   * pas laisser une jauge vide — c'est ce que la maquette devait rattraper avec
   * un `width:93% !important` dans son bloc « reduced motion ».
   */
  .barre i {
    display: block;
    height: 100%;
    width: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, #66bb6a 0%, #ffd54f 46%, #f4701f 76%, #d32f2f 100%);
    transform-origin: left center;
    transform: scaleX(var(--part, 0));
    animation: remplir 1.7s var(--courbe);
  }

  @keyframes remplir {
    from {
      transform: scaleX(0);
    }
  }

  /* `.lifesc`. Le 9,5px remonte à 12px, la couleur suit celle de l'intitulé. */
  .graduations {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-size: var(--t-micro);
    font-weight: 600;
    color: var(--sur-fond-doux);
  }

  .repere {
    margin: 0;
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--sur-fond-doux);
  }

  /*
   * Le cas « on ne sait pas ».
   *
   * Il occupe la place de la jauge au lieu de la laisser vide : une absence
   * expliquée est une information, une absence muette est une panne.
   */
  .inconnu {
    margin: 0;
    padding: var(--e3);
    background: color-mix(in srgb, var(--u-accent, #a8480c) 6%, var(--papier));
    border-left: 3px solid var(--u-accent, #a8480c);
    border-radius: var(--rayon);
    font-size: var(--t-petit);
    line-height: 1.6;
    color: var(--sur-fond); /* 6,91:1 sur ce fond teinté */
  }

  .inconnu strong {
    display: block;
    margin-bottom: 4px;
  }

  /*
   * Réduction des animations.
   *
   * La règle globale d'app.css ne fait que ramener les durées à 0,01 ms avec un
   * `!important` : elle ne peut pas arrêter la boucle infinie des flammes.
   * `animation: none` supprime le NOM de l'animation, que le `!important` sur
   * la durée ne recouvre pas — c'est la seule forme qui coupe vraiment. Chaque
   * élément garde son état final, parce qu'aucun ne dépend de son animation
   * pour être juste.
   */
  @media (prefers-reduced-motion: reduce) {
    .visuel-gaz,
    .flamme,
    .barre i {
      animation: none;
    }
  }
</style>
