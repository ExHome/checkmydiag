<script lang="ts">
  /**
   * LA RÈGLE — une graduation, deux aiguilles, une frontière.
   *
   * ── La question à laquelle cet écran répond ────────────────────────────────
   *
   * « Ma lettre, c'est grave — et qu'est-ce qu'elle m'interdit ? »
   *
   * Le lecteur ne demande pas combien il consomme. Depuis 2021 la lettre n'est
   * plus une note, c'est un statut juridique : il ouvre le DPE pour savoir s'il
   * a encore le droit de louer, et ce que ce logement lui coûtera par an.
   *
   * ── Pourquoi une règle, et pas un escalier ────────────────────────────────
   *
   * L'escalier A→G montrait la lettre. Il ne montrait ni la SECONDE note, ni
   * les seuils, ni la distance au seuil. Or le DPE est le seul diagnostic du
   * dossier dont le verdict est un point sur une graduation numérique, avec
   * DEUX notes dont la pire commande.
   *
   * Le lecteur recevait donc cette phrase : « 305 kWh/m²/an → classe E côté
   * énergie, et 42 kg CO₂/m²/an → classe D côté climat. La règle du double
   * seuil retient donc E. » Il faut la lire en entier, tenir deux nombres, deux
   * lettres et une règle de comparaison en tête, puis conclure.
   *
   * Sur la règle, une aiguille est visiblement plus à droite que l'autre : la
   * comparaison EST le dessin. Et elle répond en plus à une question qu'aucun
   * texte du produit ne posait — « suis-je au bord ou au milieu de ma
   * classe ? » — qui est exactement ce qui décide si des travaux valent la
   * peine.
   *
   * ── Les seuils sont ceux de CE logement ───────────────────────────────────
   *
   * L'arrêté du 25 mars 2024 donne des seuils différents aux petites surfaces.
   * Poser la graduation générale sur un studio afficherait une frontière fausse
   * et une distance au seuil fausse. La surface est lue dans les faits du
   * rapport ; sans elle, on garde l'échelle générale et on ne prétend rien
   * d'autre.
   */
  import type { Etiquette, Lettre } from '../../lib/modele';
  import { seuilsEnergie, seuilsClimat } from '../../lib/analyse/seuilsPetitesSurfaces';

  const {
    energie = null,
    climat = null,
    finale = null,
    surface = null
  }: {
    energie?: Etiquette | null;
    climat?: Etiquette | null;
    finale?: Lettre | null;
    /** La surface de référence, lue dans les faits. Commande les seuils. */
    surface?: number | null;
  } = $props();

  const LETTRES: Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  /** Les seuils de l'arrêté, échelle générale. */
  const GENERAUX_ENERGIE = [70, 110, 180, 250, 330, 420];
  const GENERAUX_CLIMAT = [6, 11, 30, 50, 70, 100];

  /** Sous ce seuil, l'arrêté du 25 mars 2024 ajuste les bornes. */
  const PETITE_SURFACE = 40;

  const petite = $derived(surface !== null && surface <= PETITE_SURFACE);

  const seuils = $derived.by(() => {
    if (petite && surface !== null) {
      const e = seuilsEnergie(surface);
      const c = seuilsClimat(surface);
      if (e && c) return { energie: e, climat: c, ajustes: true };
    }
    return { energie: GENERAUX_ENERGIE, climat: GENERAUX_CLIMAT, ajustes: false };
  });

  /**
   * Où poser une aiguille sur la règle, de 0 à 1.
   *
   * La graduation n'est PAS linéaire : chaque classe occupe un septième de la
   * règle, et l'aiguille se place proportionnellement À L'INTÉRIEUR de son
   * segment, entre les deux seuils réels de sa classe. C'est ce qui permet de
   * lire « au tout début du E » ou « à deux doigts du F ».
   *
   * La classe G est ouverte vers le haut : aucune position proportionnelle
   * n'est calculable, l'aiguille se cale en début de segment et le composant le
   * dit.
   */
  function position(valeur: number | null, lettre: Lettre | null, bornes: number[]) {
    if (valeur === null || lettre === null) return null;
    const i = LETTRES.indexOf(lettre);
    if (i < 0) return null;

    const large = 1 / LETTRES.length;
    const bas = i === 0 ? 0 : (bornes[i - 1] ?? 0);
    const haut = bornes[i];

    if (haut === undefined) return { x: i * large + large * 0.12, ouvert: true };

    const dedans = haut > bas ? Math.min(1, Math.max(0, (valeur - bas) / (haut - bas))) : 0.5;
    return { x: i * large + dedans * large, ouvert: false, bas, haut };
  }

  const aiguilleEnergie = $derived(
    position(energie?.valeur ?? null, energie?.lettre ?? null, seuils.energie)
  );
  const aiguilleClimat = $derived(
    position(climat?.valeur ?? null, climat?.lettre ?? null, seuils.climat)
  );

  /** Celle des deux qui commande la classe : la plus mauvaise. */
  const decisive = $derived.by(() => {
    if (!energie?.lettre || !climat?.lettre) return null;
    return LETTRES.indexOf(energie.lettre) >= LETTRES.indexOf(climat.lettre)
      ? 'energie'
      : 'climat';
  });

  const nombreFr = (n: number): string =>
    n.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

  /** Ce que la classe impose, et à quelle date. Ces dates viennent de la LOI. */
  const ECHEANCE: Partial<Record<Lettre, string>> = {
    E: 'Location interdite à partir de 2034',
    F: 'Location interdite à partir de 2028',
    G: 'Nouveau bail interdit depuis 2025'
  };

  /** La ligne de réponse, à une place fixe. */
  let touchee = $state<'energie' | 'climat' | Lettre | null>(null);

  const dit = $derived.by(() => {
    if (touchee === 'energie' && energie?.valeur != null && aiguilleEnergie) {
      const bornes = aiguilleEnergie.ouvert
        ? `au-delà de ${nombreFr(seuils.energie[5] ?? 420)}`
        : `entre ${nombreFr(aiguilleEnergie.bas ?? 0)} et ${nombreFr(aiguilleEnergie.haut ?? 0)}`;
      return `Énergie : ${nombreFr(energie.valeur)} ${energie.unite ?? 'kWh/m²/an'} — classe ${energie.lettre}, ${bornes}.${decisive === 'energie' ? ' C’est cette note qui fait votre classe.' : ''}`;
    }
    if (touchee === 'climat' && climat?.valeur != null && aiguilleClimat) {
      const bornes = aiguilleClimat.ouvert
        ? `au-delà de ${nombreFr(seuils.climat[5] ?? 100)}`
        : `entre ${nombreFr(aiguilleClimat.bas ?? 0)} et ${nombreFr(aiguilleClimat.haut ?? 0)}`;
      return `Climat : ${nombreFr(climat.valeur)} ${climat.unite ?? 'kg CO₂/m²/an'} — classe ${climat.lettre}, ${bornes}.${decisive === 'climat' ? ' C’est cette note qui fait votre classe.' : ''}`;
    }
    if (typeof touchee === 'string' && LETTRES.includes(touchee as Lettre)) {
      const l = touchee as Lettre;
      return ECHEANCE[l] ?? `Classe ${l} : aucune échéance de location connue à ce jour.`;
    }
    return null;
  });
</script>

<figure class="regle">
  <figcaption class="intitule">Votre logement sur l’échelle</figcaption>

  <!-- L'AIGUILLE ÉNERGIE, au-dessus de la règle. -->
  <div class="piste haut">
    {#if aiguilleEnergie}
      <button
        type="button"
        class="aiguille energie"
        class:decisive={decisive === 'energie'}
        style:left="{aiguilleEnergie.x * 100}%"
        onclick={() => (touchee = touchee === 'energie' ? null : 'energie')}
        aria-label="Consommation d’énergie : {nombreFr(energie?.valeur ?? 0)} {energie?.unite ??
          ''}"
      >
        <span class="valeur">{nombreFr(energie?.valeur ?? 0)}</span>
        <span class="pointe" aria-hidden="true"></span>
      </button>
    {/if}
  </div>

  <!-- LA RÈGLE : sept segments, un par classe. -->
  <div class="graduation" role="group" aria-label="Les sept classes, de A à G">
    {#each LETTRES as l (l)}
      <button
        type="button"
        class="segment etq-{l.toLowerCase()}"
        class:retenue={l === finale}
        onclick={() => (touchee = touchee === l ? null : l)}
        aria-label="Classe {l}{l === finale ? ', la classe de ce logement' : ''}"
      >
        <span class="lettre">{l}</span>
      </button>
    {/each}
  </div>

  <!-- L'AIGUILLE CLIMAT, en dessous — la seconde note, invisible jusqu'ici. -->
  <div class="piste bas">
    {#if aiguilleClimat}
      <button
        type="button"
        class="aiguille climat"
        class:decisive={decisive === 'climat'}
        style:left="{aiguilleClimat.x * 100}%"
        onclick={() => (touchee = touchee === 'climat' ? null : 'climat')}
        aria-label="Émissions de gaz à effet de serre : {nombreFr(climat?.valeur ?? 0)} {climat?.unite ??
          ''}"
      >
        <span class="pointe" aria-hidden="true"></span>
        <span class="valeur">{nombreFr(climat?.valeur ?? 0)}</span>
      </button>
    {/if}
  </div>

  <p class="dit" aria-live="polite">
    {#if dit}
      {dit}
    {:else if !finale}
      <span class="invite">
        L’échelle est celle de l’arrêté. Ce rapport n’a pas permis d’y placer ce
        logement.
      </span>
    {:else}
      <span class="invite">Touchez une aiguille ou une classe.</span>
    {/if}
  </p>

  {#if seuils.ajustes}
    <!-- Une frontière fausse ferait croire à une marge qui n'existe pas. -->
    <p class="reserve">
      Logement de {nombreFr(surface ?? 0)}&nbsp;m²&nbsp;: les seuils sont ceux des
      petites surfaces (arrêté du 25 mars 2024), pas ceux de l’échelle générale.
    </p>
  {/if}

  {#if decisive}
    <p class="reserve">
      Deux notes sont calculées&nbsp;: la plus mauvaise fait la classe.
    </p>
  {/if}
</figure>

<style>
  .regle {
    margin: 0;
  }

  .intitule {
    margin: 0 0 var(--e4);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--n3, var(--encre-doux));
  }

  /* Les deux pistes d'aiguille encadrent la règle. Leur hauteur est réservée :
     sans elle, l'apparition d'une aiguille pousserait la graduation. */
  .piste {
    position: relative;
    height: 34px;
  }

  .aiguille {
    position: absolute;
    top: 0;
    bottom: 0;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    min-width: 44px;
    padding: 0;
    background: none;
    border: none;
    color: var(--encre);
    cursor: pointer;
  }

  .piste.bas .aiguille {
    justify-content: flex-start;
  }

  .valeur {
    font-size: var(--t-micro);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
  }

  /* La pointe : un triangle qui désigne un point de la règle. */
  .pointe {
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
  }

  .piste.haut .pointe {
    border-top: 8px solid var(--encre-doux);
  }

  .piste.bas .pointe {
    border-bottom: 8px solid var(--encre-doux);
  }

  /*
   * L'AIGUILLE DÉCISIVE.
   *
   * Celle des deux qui fait la classe. C'est le mécanisme le plus mal compris
   * du DPE — « pourquoi F alors que je consomme peu ? » — et il se voit ici
   * sans un mot : une aiguille est plus à droite que l'autre, et c'est elle qui
   * porte la marque.
   */
  .aiguille.decisive .valeur {
    color: var(--encre);
    font-weight: 800;
  }

  .piste.haut .aiguille.decisive .pointe {
    border-top-color: var(--encre);
    border-left-width: 7px;
    border-right-width: 7px;
    border-top-width: 10px;
  }

  .piste.bas .aiguille.decisive .pointe {
    border-bottom-color: var(--encre);
    border-left-width: 7px;
    border-right-width: 7px;
    border-bottom-width: 10px;
  }

  .aiguille:not(.decisive) .valeur {
    color: var(--n3, var(--encre-doux));
  }

  .aiguille:focus-visible {
    outline: 2px solid var(--encre);
    outline-offset: 2px;
    border-radius: 6px;
  }

  /* LA GRADUATION — sept segments d'égale largeur, un par classe. */
  .graduation {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    height: 44px;
  }

  .segment {
    position: relative;
    display: grid;
    place-items: center;
    padding: 0;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    /* Le segment non retenu reste lisible mais en retrait : la classe du
       logement est le seul aplat en encre pleine. */
    opacity: 0.42;
    transition: opacity var(--duree) var(--courbe);
  }

  .segment.retenue {
    opacity: 1;
    box-shadow: 0 0 0 2.5px var(--encre);
    z-index: 1;
  }

  .segment:hover,
  .segment:focus-visible {
    opacity: 0.75;
  }

  .segment:focus-visible {
    outline: 2px solid var(--encre);
    outline-offset: 2px;
  }

  .etq-a {
    background: var(--etq-a);
  }
  .etq-b {
    background: var(--etq-b);
  }
  .etq-c {
    background: var(--etq-c);
  }
  .etq-d {
    background: var(--etq-d);
  }
  .etq-e {
    background: var(--etq-e);
  }
  .etq-f {
    background: var(--etq-f);
  }
  .etq-g {
    background: var(--etq-g);
  }

  /* L'encre des lettres tient sur les sept teintes de l'arrêté : elles ne se
     retouchent pas, c'est l'encre qui s'adapte. Voir `--encre-etiquette`. */
  .lettre {
    font-size: var(--t-petit);
    font-weight: 800;
    color: var(--encre-etiquette);
  }

  .dit {
    min-height: 42px;
    margin: var(--e4) 0 0;
    padding: var(--e3);
    background: color-mix(in srgb, var(--encre) 6%, transparent);
    border-radius: var(--rayon-petit);
    font-size: var(--t-petit);
    line-height: 1.45;
    color: var(--encre);
  }

  .invite {
    color: var(--n3, var(--encre-doux));
    font-style: italic;
  }

  .reserve {
    margin: var(--e3) 0 0;
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--n3, var(--encre-doux));
    max-width: var(--mesure);
  }

  @media (prefers-reduced-motion: reduce) {
    .segment {
      transition: none;
    }
  }
</style>
