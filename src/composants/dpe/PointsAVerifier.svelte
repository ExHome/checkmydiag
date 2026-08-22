<script lang="ts">
  /**
   * LES POINTS À VÉRIFIER — deux endroits du rapport qui ne disent pas pareil.
   *
   * ── Ce que cet écran ne fait pas ───────────────────────────────────────────
   *
   * Il ne dit jamais qu'un rapport est faux, ni qu'un diagnostiqueur s'est
   * trompé. Il dit : « ces deux endroits ne disent pas la même chose », il cite
   * les deux, et il donne la question à poser. Verrière explique le diagnostic,
   * elle ne juge pas le diagnostiqueur.
   *
   * ── Pourquoi les deux versions sont montrées ───────────────────────────────
   *
   * « Verrière ne tranche jamais arbitrairement entre deux données
   * contradictoires. » Choisir la version qui nous arrange serait exactement
   * l'erreur que ce produit existe pour éviter. Les deux versions sont donc
   * affichées côte à côte, avec leur origine, et le lecteur décide — ou fait
   * décider.
   *
   * Quand rien ne se contredit, ce bloc n'apparaît pas. Un écran qui trouve
   * toujours quelque chose à redire ne se lit plus.
   */
  import type { PointAVerifier } from '../../lib/analyse/pointsAVerifier';

  const { points = [] }: { points?: PointAVerifier[] } = $props();
</script>

{#if points.length > 0}
  <section class="controles" aria-labelledby="titre-controles">
    <h2 id="titre-controles">
      <span aria-hidden="true">⚠</span>
      {points.length === 1 ? 'Un point à vérifier' : `${points.length} points à vérifier`}
    </h2>
    <p class="cadre">
      Ces points ne sont pas des erreurs. Ce sont des endroits où le rapport se
      décrit de deux façons différentes — le plus souvent parce qu’un résumé
      simplifie ce que l’annexe détaille.
    </p>

    <ol>
      {#each points as point, i (point.titre + i)}
        <li>
          <b>{point.titre}</b>
          <div class="versions">
            <p><span class="ou">D’un côté</span>{point.dUnCote}</p>
            <p><span class="ou">De l’autre</span>{point.deLAutre}</p>
          </div>
          <p class="question">{point.question}</p>
        </li>
      {/each}
    </ol>
  </section>
{/if}

<style>
  .controles {
    display: grid;
    gap: 0.7rem;
  }

  h2 {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
    font-size: 1.05rem;
    color: var(--encre, #0a2b23);
  }

  .cadre {
    margin: 0;
    font-size: 0.83rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.6rem;
  }

  li {
    display: grid;
    gap: 0.4rem;
    padding: 0.8rem 0.9rem;
    border: 1px solid var(--verriere-sable-or, #c8a96b);
    border-radius: 8px;
    background: var(--papier, #fff);
  }

  li b {
    font-size: 0.88rem;
    color: var(--encre, #0a2b23);
  }

  /*
    Les deux versions ont exactement le même poids visuel. Donner plus de
    contraste à l'une serait déjà trancher.
  */
  .versions {
    display: grid;
    gap: 0.35rem;
  }

  .versions p {
    margin: 0;
    padding: 0.5rem 0.65rem;
    border-radius: 6px;
    background: var(--surface, rgb(10 43 35 / 3%));
    font-size: 0.81rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .ou {
    display: block;
    margin-bottom: 0.1rem;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--verriere-sable-encre, #896c33);
  }

  .question {
    margin: 0;
    font-size: 0.83rem;
    line-height: 1.5;
    font-weight: 500;
    color: var(--vert-verriere, #12463b);
  }
</style>
