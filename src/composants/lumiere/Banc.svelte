<script lang="ts">
  /**
   * LE BANC DE LUMIÈRE — la planche de contrôle du mécanisme.
   *
   * Servi par `lumiere.html`, en développement seulement. Il n'entre pas dans
   * l'application : il existe pour qu'on puisse VOIR les seize scènes côte à
   * côte au lieu d'attendre 7 h du matin pour vérifier l'aube.
   *
   * Le plan dessiné ici est un exemple de calque, pas un plan de logement réel :
   * aucune donnée de rapport ne circule dans ce fichier.
   */
  import TableLumineuse from './TableLumineuse.svelte';
  import Carreau from './Carreau.svelte';
  import { MOMENTS, lumiereDe, teinteDe } from './heure';
  import { retraitDe } from './gravite';
  import type { Occlusion } from './calque';
  import type { Gravite } from '../../lib/modele';

  const GRAVITES: Gravite[] = ['bon', 'neutre', 'attention', 'alerte'];

  let heure = $state(18);
  let gravite = $state<Gravite>('neutre');

  const l = $derived(lumiereDe(heure));
  const etat = $derived(retraitDe(gravite, l.intensite));

  const OCCLUSIONS: Occlusion[] = [
    { d: 'M62 8 H92 V26 H62 Z', genre: 'anomalie', libelle: 'Chambre 2 — revêtement dégradé, classe 3.' },
    { d: 'M6 40 H30 V56 H6 Z', genre: 'nonControle', libelle: 'Cave — non visitée, accès condamné.' }
  ];
</script>

{#snippet plan()}
  <!-- Les murs : ils ARRÊTENT la lumière. Ils ne sont jamais peints. -->
  <path
    d="M4 4 H96 V58 H4 Z M4 30 H60 M60 4 V58 M60 26 H96 M28 4 V30"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
  />
  <!-- Le mobilier : plus fin, il arrête moins fort parce qu'il compte moins. -->
  <path d="M8 34 H24 V52 H8 Z M66 32 H90 V54 H66 Z" fill="none" stroke="currentColor" stroke-width="0.7" />
{/snippet}

{#snippet cotes()}
  <path d="M8 52 H92 M8 49 V55 M92 49 V55" fill="none" stroke="currentColor" stroke-width="0.6" />
  <path d="M8 8 H40 M8 5 V11 M40 5 V11" fill="none" stroke="currentColor" stroke-width="0.6" />
{/snippet}

{#snippet titre()}
  <strong>4 pièces · 78,4 m²</strong>
  <span>Deux points relevés au rapport.</span>
{/snippet}

<main>
  <h1>Banc de lumière</h1>

  <div class="reglages">
    <label>
      Heure : <strong>{Math.floor(heure)} h {String(Math.round((heure % 1) * 60)).padStart(2, '0')}</strong>
      <input type="range" min="0" max="23.75" step="0.25" bind:value={heure} />
    </label>
    <div class="raccourcis">
      {#each Object.entries(MOMENTS) as [nom, h] (nom)}
        <button type="button" onclick={() => (heure = h)}>{nom}</button>
      {/each}
    </div>
    <div class="raccourcis">
      {#each GRAVITES as g (g)}
        <button type="button" class:actif={g === gravite} onclick={() => (gravite = g)}>{g}</button>
      {/each}
    </div>
  </div>

  <pre class="mesures">inclinaison {l.inclinaison.toFixed(1)}°   azimut {l.azimut.toFixed(2)}   {Math.round(
      l.temperature
    )} K {teinteDe(l.temperature)}   intensité {l.intensite.toFixed(3)}   ombre {l.ombre.toFixed(2)}
sol {etat.sol}   lampe {etat.lampe.toFixed(3)}   encre douce {etat.encreDouce.toFixed(2)}   durée {etat.duree} ms</pre>

  <section class="scene">
    <TableLumineuse
      calque={plan}
      contenu={titre}
      occlusions={OCCLUSIONS}
      titre="Le logement, vu de dessus"
      {gravite}
      {heure}
    />

    <TableLumineuse
      calque={cotes}
      titre="Les cotes du mesurage"
      polarite="trait"
      hauteur={62}
      {gravite}
      {heure}
    />
  </section>

  <section class="carreaux">
    {#each ['DPE', 'Électricité', 'Amiante', 'Plomb', 'Gaz', 'Termites', 'Risques', 'Surface'] as nom (nom)}
      <Carreau titre={nom} {gravite} {heure} />
    {/each}
  </section>
</main>

<style>
  main {
    max-width: 980px;
    margin: 0 auto;
    padding: var(--e6) var(--e4) var(--e8);
    font-family: var(--police);
  }

  .reglages {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e4);
    align-items: center;
    margin-bottom: var(--e4);
  }

  .raccourcis {
    display: flex;
    gap: var(--e2);
  }

  .raccourcis button {
    padding: 8px 12px;
    min-height: 44px;
    border: 1px solid var(--trait);
    border-radius: var(--rayon-badge);
    background: var(--papier);
    cursor: pointer;
  }

  .raccourcis button.actif {
    background: var(--verriere-vert);
    color: var(--verriere-ivoire);
  }

  .mesures {
    padding: var(--e3);
    background: var(--surface);
    border-radius: var(--rayon);
    font-family: var(--mono);
    font-size: var(--t-micro);
    white-space: pre-wrap;
  }

  .scene {
    display: grid;
    gap: var(--e5);
    margin: var(--e5) 0;
  }

  .carreaux {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--e3);
    padding: var(--e5);
    border-radius: var(--rayon-large);
    background: var(--verriere-vert-profond);
  }

  @media (min-width: 720px) {
    .scene {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
