<script lang="ts">
  /**
   * OÙ PART LA CHALEUR — le schéma des déperditions, sans chiffre inventé.
   *
   * ═══════════════════════════════════════════════════════════════════════════
   * CE QUE CE SCHÉMA EST, ET CE QU'IL N'EST PAS
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * Le DPE consacre une page entière à un « Schéma des déperditions de chaleur »
   * avec un pourcentage par poste. **Cette page est une image.** Sur les
   * vingt-six volets lus, aucun ne porte le moindre pourcentage dans son texte.
   * Nous ne pouvons donc pas écrire « 25 % par la toiture », et nous ne
   * l'écrirons pas : un pourcentage inventé oriente des travaux réels.
   *
   * Ce que le rapport donne, en toutes lettres, dans sa fiche technique :
   *
   *  - la SURFACE de chaque paroi et de chaque baie ;
   *  - ce qu'il y a DERRIÈRE — « l'extérieur », « un local chauffé », « un
   *    terre-plein », « un comble faiblement ventilé » ;
   *  - l'ÉTAT D'ISOLATION de chacune, avec le mot du diagnostiqueur.
   *
   * Le schéma montre donc exactement cela : les surfaces qui donnent sur le
   * froid, la plus grande d'abord, chacune avec son isolation. Une paroi contre
   * un local chauffé n'y figure pas — elle ne perd rien, et la montrer enverrait
   * l'utilisateur isoler un mur qui n'en a pas besoin.
   *
   * La longueur d'une barre est une surface, pas une perte. C'est écrit sous le
   * schéma, parce qu'un lecteur pressé lirait « perte ».
   */
  import type { PosteDeperdition } from '../../lib/analyse/enveloppe';

  const {
    postes = [],
    pourcentagesDisponibles = false
  }: { postes?: PosteDeperdition[]; pourcentagesDisponibles?: boolean } = $props();

  const maximum = $derived(Math.max(1, ...postes.map((p) => p.surface)));
  const total = $derived(postes.reduce((n, p) => n + p.surface, 0));

  /*
   * Trois états, jamais deux : « inconnu » n'est pas « isolé », il a sa propre
   * trame. La FORME vient de l'état ; le MOT vient du poste, qui seul sait s'il
   * parle d'un mur ou d'un vitrage.
   */
  const TRAMES = { nonIsole: 'nu', isole: 'manteau', inconnu: 'doute' } as const;

  const FAMILLES: Record<PosteDeperdition['famille'], string> = {
    mur: 'Mur',
    plancherBas: 'Plancher bas',
    plancherHaut: 'Plafond',
    porte: 'Porte',
    baie: 'Fenêtre'
  };
</script>

<section class="deperditions" aria-labelledby="titre-deperditions">
  <h2 id="titre-deperditions">Où part la chaleur</h2>

  {#if postes.length === 0}
    <p class="rien">
      Le rapport ne décrit aucune paroi donnant sur l’extérieur de façon
      exploitable. Rien n’est affiché ici plutôt qu’un schéma approximatif.
    </p>
  {:else}
    <p class="cle">
      Voici <b>les surfaces de votre logement qui donnent sur le froid</b>, de la plus
      grande à la plus petite, avec ce que le rapport dit de leur isolation.
    </p>

    <ol class="liste">
      {#each postes as poste, i (poste.libelle + i)}
        {@const trame = TRAMES[poste.isolation]}
        <li>
          <div class="entete">
            <span class="nom">{poste.libelle}</span>
            <span class="metres">{poste.surface.toLocaleString('fr-FR')} m²</span>
          </div>
          <div class="piste">
            <div
              class="barre {trame}"
              style:width="{Math.round((poste.surface / maximum) * 100)}%"
            ></div>
          </div>
          <p class="detail">
            <span class="pastille {trame}" aria-hidden="true"></span>
            <b>{poste.mot}</b>{#if poste.detail}<span> — {poste.detail}</span>{/if}
            <span class="famille">{FAMILLES[poste.famille]}</span>
          </p>
        </li>
      {/each}
    </ol>

    <!--
      L'avertissement n'est pas une précaution juridique : c'est la moitié de
      l'information. Sans lui, la barre la plus longue se lit comme « c'est par
      là que ça part », ce que le rapport ne dit nulle part.
    -->
    <p class="garde-fou">
      <b>La longueur d’une barre est une surface, pas une perte.</b>
      {#if !pourcentagesDisponibles}
        Le rapport ne chiffre pas ses déperditions poste par poste : la page qui le
        fait est une image, et ses pourcentages n’existent pas en texte. Une grande
        surface mal isolée perd beaucoup, mais seul le calcul du diagnostiqueur dit
        combien.
      {/if}
      Total des surfaces donnant sur le froid : {total.toLocaleString('fr-FR', {
        maximumFractionDigits: 1
      })} m².
    </p>
  {/if}
</section>

<style>
  .deperditions {
    display: grid;
    gap: 0.9rem;
  }

  h2 {
    margin: 0;
    font-size: 1.05rem;
    color: var(--encre, #0a2b23);
  }

  .cle,
  .rien {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .liste {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.85rem;
  }

  .entete {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .nom {
    font-weight: 600;
    color: var(--encre, #0a2b23);
  }

  .metres {
    font-variant-numeric: tabular-nums;
    color: var(--encre-doux, #4a5a55);
  }

  .piste {
    height: 0.6rem;
    border-radius: 999px;
    background: var(--surface, rgb(10 43 35 / 3%));
    overflow: hidden;
  }

  .barre {
    height: 100%;
    border-radius: 999px;
  }

  /*
    La grammaire des trois états, la même que la coupe du logement : plein quand
    le rapport relève une isolation, nu quand il n'en relève pas, en raies quand
    il ne dit rien. Trois formes, pas trois couleurs — la couleur seule
    n'atteint pas tout le monde.
  */
  .barre.nu,
  .pastille.nu {
    background: #c05621;
  }

  .barre.manteau,
  .pastille.manteau {
    background: var(--vert-verriere, #12463b);
  }

  .barre.doute,
  .pastille.doute {
    background: repeating-linear-gradient(
      135deg,
      var(--encre-doux, #4a5a55) 0 2px,
      var(--papier-doux, #f7f6f2) 2px 6px
    );
  }

  .pastille {
    display: inline-block;
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 2px;
    vertical-align: baseline;
  }

  .detail {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    margin: 0.35rem 0 0;
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--encre-doux, #4a5a55);
  }

  .famille {
    margin-left: auto;
    padding: 0.05rem 0.4rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 999px;
    font-size: 0.7rem;
    color: var(--verriere-sable-encre, #896c33);
  }

  .garde-fou {
    margin: 0;
    padding: 0.7rem 0.9rem;
    border-left: 3px solid var(--verriere-sable-or, #c8a96b);
    background: var(--verriere-sable-voile, rgb(200 169 107 / 16%));
    border-radius: 0 6px 6px 0;
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--encre, #0a2b23);
  }
</style>
