<script lang="ts">
  /**
   * LA DOUBLE ÉTIQUETTE — énergie et climat, au format du DPE.
   *
   * ═══════════════════════════════════════════════════════════════════════════
   * POURQUOI DEUX ÉTIQUETTES, ET POURQUOI LA MENTION EN DESSOUS
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * Le DPE ne donne pas une note : il en donne deux. L'étiquette énergie mesure
   * ce que le logement consomme ; l'étiquette climat, ce qu'il rejette. Un
   * logement peut être B en énergie et E en climat — c'est le cas du chauffage
   * au gaz, sobre mais carboné.
   *
   * Et la classe affichée partout ailleurs — celle de l'annonce immobilière,
   * celle qui interdit la location — est **la moins bonne des deux**. C'est la
   * règle du double seuil, et presque personne ne la connaît. La montrer sans
   * l'écrire serait laisser croire que la bonne des deux compte.
   *
   * ── Les couleurs ───────────────────────────────────────────────────────────
   *
   * L'échelle énergie est celle du dépôt, reprise des plaquettes de la maison.
   * L'échelle climat n'a PAS été vérifiée au texte réglementaire : les valeurs
   * trouvées en ligne datent d'avant 2021 et contredisent l'échelle énergie
   * qu'on utilise déjà. Elle est donc ici un **rendu Verrière** du dégradé
   * violet, déclaré comme tel, à remplacer dès que les valeurs officielles
   * auront été relevées à la source. On ne grave pas une couleur réglementaire
   * sur un billet de blog.
   *
   * ── Ce qui n'est jamais inventé ────────────────────────────────────────────
   *
   * L'étiquette imprimée dans le PDF est une image : aucun programme ne la lit.
   * La lettre affichée ici est retrouvée à partir des chiffres écrits dans le
   * rapport, avec les seuils officiels. Quand un chiffre manque, la colonne
   * reste muette et le dit — elle ne se remplit pas d'une lettre plausible.
   */
  import type { Etiquette, Lettre } from '../../lib/modele';

  const {
    energie = null,
    climat = null,
    finale = null,
    surfaceReference = null
  }: {
    energie?: Etiquette | null;
    climat?: Etiquette | null;
    finale?: Lettre | null;
    /** Telle qu'écrite dans la fiche technique : « 61,68 m² ». */
    surfaceReference?: string | null;
  } = $props();

  const LETTRES: Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  /** L'échelle réglementaire de l'énergie, déjà en usage dans la maison. */
  const ENERGIE: Record<Lettre, string> = {
    A: '#319834',
    B: '#33cc31',
    C: '#cbfc34',
    D: '#fbfe06',
    E: '#fbcc05',
    F: '#fc9935',
    G: '#fc0205'
  };

  /** Rendu Verrière du dégradé violet — non vérifié au texte, voir l'en-tête. */
  const CLIMAT: Record<Lettre, string> = {
    A: '#f2edf7',
    B: '#dcd0ea',
    C: '#c3b0dc',
    D: '#a68cc9',
    E: '#8566b2',
    F: '#5f4390',
    G: '#3a2560'
  };

  /** Sous D, le fond est trop clair pour porter du blanc. */
  const encre = (l: Lettre, climatique: boolean) =>
    climatique ? (LETTRES.indexOf(l) >= 3 ? '#fff' : '#2a1c42') : LETTRES.indexOf(l) <= 3 ? '#1c1c1c' : '#fff';

  let aideOuverte = $state(false);

  const laquelle = $derived(
    finale === null
      ? null
      : energie?.lettre === finale && climat?.lettre === finale
        ? 'les deux'
        : energie?.lettre === finale
          ? 'énergie'
          : climat?.lettre === finale
            ? 'climat'
            : null
  );
</script>

<section class="double" aria-labelledby="titre-etiquettes">
  <h2 id="titre-etiquettes">Les deux étiquettes de votre logement</h2>

  <div class="paire">
    {#each [{ cle: 'energie', titre: 'Énergie', sous: 'consommation', e: energie, couleurs: ENERGIE, climatique: false }, { cle: 'climat', titre: 'Climat', sous: 'gaz à effet de serre', e: climat, couleurs: CLIMAT, climatique: true }] as bloc (bloc.cle)}
      <figure class="etiquette">
        <figcaption>
          <b>{bloc.titre}</b>
          <span>{bloc.sous}</span>
        </figcaption>

        <ol class="echelle">
          {#each LETTRES as lettre (lettre)}
            {@const active = bloc.e?.lettre === lettre}
            <li
              class="bande"
              class:active
              style:background={bloc.couleurs[lettre]}
              style:color={encre(lettre, bloc.climatique)}
            >
              <span class="lettre">{lettre}</span>
              {#if active && bloc.e}
                <span class="valeur"
                  >{bloc.e.valeur.toLocaleString('fr-FR')}
                  <small>{bloc.e.unite}</small></span
                >
              {/if}
            </li>
          {/each}
        </ol>

        {#if !bloc.e}
          <p class="muette">
            Le rapport ne donne pas les chiffres qui permettraient de retrouver cette
            lettre. Lisez celle imprimée sur l’étiquette du rapport.
          </p>
        {/if}
      </figure>
    {/each}
  </div>

  <!--
    LA MENTION QUI CHANGE TOUT. Elle n'est pas une note de bas de page : c'est
    la règle qui décide de la classe affichée dans l'annonce et de ce que la loi
    autorise. Elle est donc écrite en clair, sous les deux étiquettes.
  -->
  <p class="regle">
    <strong>C’est la moins bonne des deux qui est retenue.</strong>
    {#if finale && laquelle === 'les deux'}
      Ici, les deux donnent <b>{finale}</b> : la classe du logement est <b>{finale}</b>.
    {:else if finale && laquelle}
      Ici, c’est l’étiquette <b>{laquelle}</b> qui tire vers le bas : la classe du
      logement est <b>{finale}</b>, et non celle de l’autre étiquette.
    {:else}
      La classe du logement est celle de la plus mauvaise des deux étiquettes, jamais
      une moyenne des deux.
    {/if}
  </p>

  {#if surfaceReference}
    <p class="surface">
      <span>Surface de référence : <b>{surfaceReference}</b></span>
      <button
        type="button"
        class="aide"
        aria-expanded={aideOuverte}
        onclick={() => (aideOuverte = !aideOuverte)}
      >
        <span aria-hidden="true">?</span>
        <span class="lu">Qu’est-ce que la surface de référence ?</span>
      </button>
    </p>
    {#if aideOuverte}
      <!--
        Pourquoi cette aide, et pas une autre : tous les chiffres de l'étiquette
        sont divisés par cette surface. Se tromper d'un mètre carré déplace la
        lettre. Et ce n'est PAS la surface Carrez, que l'acquéreur a sous les
        yeux dans le même dossier : deux chiffres différents pour le même
        logement, sans que rien ne l'explique.
      -->
      <div class="explication">
        <p>
          C’est la surface sur laquelle tout le DPE est calculé : la consommation et
          les émissions affichées sont des totaux <b>divisés par elle</b>. Elle
          décide donc directement de la lettre.
        </p>
        <p>
          C’est la surface habitable, augmentée des vérandas chauffées et des locaux
          chauffés d’au moins 1,80 m sous plafond.
        </p>
        <p>
          <b>Elle n’est pas la surface Carrez</b> du même dossier, qui ne compte ni
          les vérandas ni certains locaux. Deux chiffres différents pour le même
          logement, c’est normal : ils ne mesurent pas la même chose.
        </p>
      </div>
    {/if}
  {/if}

  {#if energie?.recalculee || climat?.recalculee}
    <p class="methode">
      L’étiquette colorée du rapport est une image, qu’aucun programme ne sait lire.
      Les lettres ci-dessus sont retrouvées à partir des chiffres écrits dans le
      rapport, avec les seuils officiels — c’est une manière de lire l’étiquette, pas
      de la corriger. Le logiciel du diagnostiqueur est validé par l’ADEME : son
      calcul fait foi.
    </p>
  {/if}
</section>

<style>
  .double {
    display: grid;
    gap: 1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.05rem;
    letter-spacing: 0.01em;
    color: var(--encre, #0a2b23);
  }

  .paire {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: 1rem;
  }

  .etiquette {
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }

  figcaption {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  figcaption b {
    font-size: 0.95rem;
    color: var(--encre, #0a2b23);
  }

  figcaption span {
    font-size: 0.8rem;
    color: var(--encre-doux, #4a5a55);
  }

  .echelle {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }

  /*
    La bande de la classe obtenue est plus longue et plus haute que les autres :
    c'est la forme même de l'étiquette réglementaire, où la classe atteinte
    dépasse l'échelle. On la reprend parce qu'elle est reconnaissable au premier
    coup d'œil — et l'écran doit se lire en trois secondes.
  */
  .bande {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 1.6rem;
    padding: 0 0.55rem;
    width: 62%;
    border-radius: 0 3px 3px 0;
    font-size: 0.8rem;
    transition: width 0.2s ease;
  }

  .bande.active {
    width: 100%;
    min-height: 2.4rem;
    font-weight: 600;
    box-shadow: 0 1px 6px rgb(10 43 35 / 22%);
  }

  .lettre {
    font-weight: 700;
    font-size: 0.95rem;
  }

  .bande.active .lettre {
    font-size: 1.35rem;
  }

  .valeur {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
  }

  .valeur small {
    font-weight: 400;
    opacity: 0.85;
  }

  .muette,
  .methode {
    margin: 0;
    font-size: 0.78rem;
    line-height: 1.45;
    color: var(--encre-doux, #4a5a55);
  }

  .regle {
    margin: 0;
    padding: 0.7rem 0.9rem;
    border-left: 3px solid var(--vert-verriere, #12463b);
    background: var(--surface, rgb(10 43 35 / 3%));
    border-radius: 0 6px 6px 0;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--encre, #0a2b23);
  }

  .surface {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 0.88rem;
    color: var(--encre, #0a2b23);
  }

  .aide {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.35rem;
    height: 1.35rem;
    border: 1px solid var(--vert-verriere, #12463b);
    border-radius: 50%;
    background: transparent;
    color: var(--vert-verriere, #12463b);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
  }

  .aide:hover,
  .aide:focus-visible {
    background: var(--vert-verriere, #12463b);
    color: var(--ivoire, #f7f6f2);
  }

  .lu {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .explication {
    display: grid;
    gap: 0.5rem;
    padding: 0.8rem 0.9rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 6px;
    background: var(--papier, #fff);
    font-size: 0.83rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .explication p {
    margin: 0;
  }
</style>
