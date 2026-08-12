<script lang="ts">
  /**
   * La page du rapport, telle qu'elle est, avec des repères posés dessus.
   *
   * C'est le cœur du site : le lecteur regarde son propre document et
   * l'explication vient à lui, à l'endroit exact où il regarde. Pas un cours à
   * côté — une annotation sur sa page.
   */
  import type { Diagnostic } from '../lib/modele';
  import type { PageRendue } from '../lib/pdf';
  import MiniSchema from './MiniSchema.svelte';

  interface Props {
    reperes: NonNullable<Diagnostic['reperes']>;
    page: PageRendue;
    numero: number;
  }

  const { reperes, page, numero }: Props = $props();

  let choisi = $state(0);
  const actif = $derived(reperes[choisi] ?? reperes[0]);

  /**
   * Les coordonnées PDF partent du bas à gauche, les coordonnées écran du haut
   * à gauche : il faut retourner l'axe vertical.
   */
  function cadre(r: NonNullable<Diagnostic['reperes']>[number]) {
    const marge = 3;
    return {
      left: ((r.x - marge) / page.largeur) * 100,
      top: ((page.hauteur - r.y - r.hauteur) / page.hauteur) * 100,
      width: ((r.largeur + marge * 2) / page.largeur) * 100,
      height: ((r.hauteur + marge * 2) / page.hauteur) * 100
    };
  }
</script>

<div class="lecteur">
  <div class="page">
    <img src={page.image} alt="Page {numero} de votre rapport" />

    {#each reperes as repere, i (repere.titre)}
      {@const c = cadre(repere)}
      <button
        type="button"
        class="surligne"
        class:actif={i === choisi}
        style:left="{c.left}%"
        style:top="{c.top}%"
        style:width="{c.width}%"
        style:height="{c.height}%"
        aria-label={repere.titre}
        onclick={() => (choisi = i)}
      >
        <span class="puce">{i + 1}</span>
      </button>
    {/each}
  </div>

  <aside class="explication">
    <p class="entete muet petit">Page {numero} de votre rapport</p>

    <div class="onglets" role="tablist" aria-label="Passages expliqués">
      {#each reperes as repere, i (repere.titre)}
        <button
          type="button"
          role="tab"
          aria-selected={i === choisi}
          class:actif={i === choisi}
          onclick={() => (choisi = i)}
        >
          <span class="numero">{i + 1}</span>
          {repere.titre}
        </button>
      {/each}
    </div>

    {#if actif}
      {#key actif.titre}
        <div class="texte apparait">
          <h4>{actif.titre}</h4>
          {#if actif.schema}
            <MiniSchema id={actif.schema} />
          {/if}
          <ul>
            {#each actif.points as point}
              <li>{point}</li>
            {/each}
          </ul>
        </div>
      {/key}
    {/if}
  </aside>
</div>

<style>
  .lecteur {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 22px;
    align-items: start;
  }

  .page {
    position: relative;
    border-radius: var(--rayon-petit);
    overflow: hidden;
    box-shadow: var(--ombre);
    background: #fff;
    line-height: 0;
  }

  img {
    width: 100%;
    height: auto;
  }

  .surligne {
    position: absolute;
    border: 2px solid var(--vert-500);
    background: rgb(18 160 95 / 14%);
    border-radius: 4px;
    padding: 0;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }

  .surligne:hover,
  .surligne.actif {
    background: rgb(18 160 95 / 26%);
    box-shadow: 0 0 0 3px rgb(18 160 95 / 22%);
  }

  .puce {
    position: absolute;
    left: -11px;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--vert-700);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 22px;
    text-align: center;
    box-shadow: 0 2px 6px rgb(0 0 0 / 25%);
  }

  .explication {
    position: sticky;
    top: 16px;
  }

  .entete {
    margin: 0 0 10px;
  }

  .onglets {
    display: grid;
    gap: 6px;
    margin-bottom: 16px;
  }

  .onglets button {
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    background: var(--papier-doux);
    border: 1px solid transparent;
    border-radius: var(--rayon-petit);
    padding: 9px 12px;
    cursor: pointer;
    color: var(--encre-doux);
    font-size: 0.94rem;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .onglets button:hover {
    background: var(--vert-100);
  }

  .onglets button.actif {
    background: var(--vert-100);
    border-color: var(--vert-300);
    color: var(--encre);
    font-weight: 600;
  }

  .numero {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    flex: none;
    border-radius: 50%;
    background: var(--vert-700);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
  }

  .texte h4 {
    font-size: 1.06rem;
    margin-bottom: 6px;
  }

  .texte ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 6px;
  }

  .texte li {
    position: relative;
    padding-left: 18px;
    font-size: 0.96rem;
    line-height: 1.4;
  }

  .texte li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 0.55em;
    width: 6px;
    height: 6px;
    border-radius: 2px;
    background: var(--or);
  }

  @media (max-width: 760px) {
    .lecteur {
      grid-template-columns: 1fr;
    }

    .explication {
      position: static;
    }
  }
</style>
