<script lang="ts">
  import type { Schema } from '../lib/modele';
  import EtiquetteDpe from './EtiquetteDpe.svelte';

  const { schema }: { schema: Schema } = $props();

  const SEUILS_ENERGIE = [70, 110, 180, 250, 330, 420];
  const SEUILS_CLIMAT = [6, 11, 30, 50, 70, 100];

  const COULEURS_PLOMB = ['var(--ok)', 'var(--etq-c)', 'var(--attention)', 'var(--alerte)'];
  const LIBELLES_PLOMB = [
    'Classe 0 — pas de plomb',
    'Classe 1 — plomb, revêtement intact',
    'Classe 2 — état d’usage',
    'Classe 3 — dégradé'
  ];
</script>

{#if schema.genre === 'dpe'}
  <div class="etiquettes">
    {#if schema.energie}
      <EtiquetteDpe
        titre="Consommation d’énergie"
        sousTitre="chauffage, eau chaude, clim, éclairage, ventilation"
        etiquette={schema.energie}
        seuils={SEUILS_ENERGIE}
      />
    {/if}
    {#if schema.climat}
      <EtiquetteDpe
        titre="Émissions de CO₂"
        sousTitre="ce que le logement rejette pour se chauffer"
        etiquette={schema.climat}
        seuils={SEUILS_CLIMAT}
      />
    {/if}
  </div>

  {#if schema.postes.length}
    {@const total = schema.postes.reduce((n, p) => n + p.kwh, 0)}
    <div class="postes">
      <h4>Où part l’énergie</h4>
      {#each schema.postes as poste (poste.nom)}
        <div class="poste">
          <span class="nom">{poste.nom}</span>
          <div class="jauge"><span style:width="{(poste.kwh / total) * 100}%"></span></div>
          <span class="chiffre">{Math.round((poste.kwh / total) * 100)} %</span>
        </div>
      {/each}
      <p class="muet petit">
        Répartition des {total.toLocaleString('fr-FR')} kWh d’énergie primaire retenus par le DPE.
      </p>
    </div>
  {/if}

{:else if schema.genre === 'plomb'}
  {@const mesurees = schema.total - schema.nonMesurees}
  <div class="plomb">
    <h4>{mesurees} éléments mesurés sur {schema.total}</h4>
    <div class="bandeau">
      {#each schema.classes as nb, i}
        {#if nb > 0}
          <span
            class="part"
            style:flex-grow={nb}
            style:background={COULEURS_PLOMB[i]}
            title="{LIBELLES_PLOMB[i]} : {nb}"
          >{nb}</span>
        {/if}
      {/each}
    </div>
    <ul class="legende">
      {#each schema.classes as nb, i}
        <li class:eteint={nb === 0}>
          <span class="pastille" style:background={COULEURS_PLOMB[i]}></span>
          {LIBELLES_PLOMB[i]} — <strong>{nb}</strong>
        </li>
      {/each}
    </ul>
  </div>

{:else if schema.genre === 'pieces'}
  <div class="zones">
    {#each schema.zones as zone (zone.nom)}
      <span class="zone" class:alerte={zone.etat === 'alerte'}>
        {zone.etat === 'alerte' ? '⚠' : '✓'} {zone.nom}
      </span>
    {/each}
  </div>

{:else if schema.genre === 'risques'}
  <ul class="risques">
    {#each schema.risques as risque (risque.nom)}
      <li class={risque.niveau}>
        <span class="marque">{risque.niveau === 'bon' ? '✓' : risque.niveau === 'alerte' ? '!' : '~'}</span>
        <span>
          {risque.nom}
          {#if risque.detail}<span class="muet petit"> — {risque.detail}</span>{/if}
        </span>
      </li>
    {/each}
  </ul>

{:else if schema.genre === 'anomalies'}
  <ul class="risques">
    {#each schema.groupes as groupe (groupe.nom)}
      <li class="attention"><span class="marque">~</span><span>{groupe.nom}</span></li>
    {/each}
  </ul>
{/if}

<style>
  .etiquettes {
    display: grid;
    gap: 28px;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  h4 {
    font-family: var(--police);
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--encre-doux);
    margin: 0 0 12px;
  }

  .postes {
    margin-top: 28px;
  }

  .poste {
    display: grid;
    grid-template-columns: 8em 1fr 3em;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .poste .nom {
    font-size: 0.92rem;
  }

  .jauge {
    height: 10px;
    background: var(--trait);
    border-radius: 999px;
    overflow: hidden;
  }

  .jauge span {
    display: block;
    height: 100%;
    background: var(--vert-500);
  }

  .poste .chiffre {
    font-variant-numeric: tabular-nums;
    text-align: right;
    font-size: 0.9rem;
  }

  .bandeau {
    display: flex;
    height: 34px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 14px;
  }

  .part {
    display: grid;
    place-items: center;
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    text-shadow: 0 1px 2px rgb(0 0 0 / 35%);
    min-width: 28px;
  }

  .legende {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 6px;
    font-size: 0.92rem;
  }

  .legende .eteint {
    opacity: 0.45;
  }

  .pastille {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 3px;
    margin-right: 8px;
    vertical-align: -1px;
  }

  .zones {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .zone {
    background: var(--ok-fond);
    color: var(--ok);
    border-radius: 999px;
    padding: 5px 12px;
    font-size: 0.88rem;
  }

  .zone.alerte {
    background: var(--alerte-fond);
    color: var(--alerte);
    font-weight: 600;
  }

  .risques {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 8px;
  }

  .risques li {
    display: grid;
    grid-template-columns: 26px 1fr;
    align-items: start;
    gap: 8px;
    font-size: 0.95rem;
  }

  .marque {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.8rem;
  }

  .risques li.bon .marque {
    background: var(--ok-fond);
    color: var(--ok);
  }

  .risques li.attention .marque {
    background: var(--attention-fond);
    color: var(--attention);
  }

  .risques li.alerte .marque {
    background: var(--alerte-fond);
    color: var(--alerte);
  }
</style>
