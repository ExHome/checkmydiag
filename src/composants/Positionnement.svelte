<script lang="ts">
  /**
   * Où se situe ce logement sur l'échelle, et ce que la loi en dit.
   *
   * L'étiquette du rapport donne une lettre. Elle ne dit ni ce que valent les
   * autres, ni à quelle date celle-ci devient un problème. C'est pourtant la
   * seule chose qui intéresse un vendeur ou un acquéreur : à partir de quand,
   * et pour quoi.
   *
   * Les échéances sont celles de la loi Climat et Résilience, pour la France
   * métropolitaine.
   */
  import type { Lettre } from '../lib/modele';

  const { lettre }: { lettre: Lettre } = $props();

  interface Barreau {
    l: Lettre;
    couleur: string;
    sombre?: boolean;
    /** Ce qui s'applique à cette classe, et depuis quand. */
    statut: string[];
  }

  const ECHELLE: Barreau[] = [
    {
      l: 'A',
      couleur: '#319834',
      statut: ['Logement très performant', 'Aucune contrainte', 'Rare dans l’ancien']
    },
    {
      l: 'B',
      couleur: '#33cc31',
      statut: ['Logement performant', 'Aucune contrainte', 'Neuf ou rénovation lourde']
    },
    {
      l: 'C',
      couleur: '#cbfc34',
      sombre: true,
      statut: ['Au-dessus de la moyenne du parc', 'Aucune interdiction prévue à ce jour', 'Se loue et se vend sans réserve']
    },
    {
      l: 'D',
      couleur: '#fbfe06',
      sombre: true,
      statut: ['La classe la plus courante en France', 'Aucune interdiction avant 2034', 'Audit de vente envisagé à cette échéance']
    },
    {
      l: 'E',
      couleur: '#fbcc05',
      sombre: true,
      statut: [
        'Interdit à la location au 1ᵉʳ janvier 2034',
        'Audit énergétique exigé pour vendre une maison depuis 2025',
        'Argument de négociation courant'
      ]
    },
    {
      l: 'F',
      couleur: '#fc9935',
      statut: [
        'Passoire énergétique',
        'Loyer gelé depuis août 2022',
        'Interdit à la location au 1ᵉʳ janvier 2028',
        'Audit énergétique exigé pour vendre une maison'
      ]
    },
    {
      l: 'G',
      couleur: '#fc0205',
      statut: [
        'Passoire énergétique',
        'Interdit à la location depuis le 1ᵉʳ janvier 2025',
        'Loyer gelé depuis août 2022',
        'Audit énergétique exigé pour vendre une maison'
      ]
    }
  ];

  let choisi = $state<Lettre | null>(null);
  const detail = $derived(ECHELLE.find((b) => b.l === choisi) ?? null);
</script>

<figure class="positionnement">
  <p class="invite">Touchez une lettre.</p>

  <div class="echelle">
    {#each ECHELLE as b (b.l)}
      <button
        type="button"
        class="barreau"
        class:ici={b.l === lettre}
        class:sombre={b.sombre}
        class:efface={choisi !== null && choisi !== b.l}
        style:background={b.couleur}
        onclick={() => (choisi = choisi === b.l ? null : b.l)}
        aria-label="Classe {b.l}"
      >
        {b.l}
        {#if b.l === lettre}
          <span class="ancre">votre logement</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- La frise des échéances, sous l'échelle : c'est elle qui transforme une
       lettre en calendrier. -->
  <div class="echeances">
    <span class="jalon passe">G : plus louable depuis 2025</span>
    <span class="jalon">F : 2028</span>
    <span class="jalon">E : 2034</span>
  </div>

  {#if detail}
    <div class="reponse apparait">
      <p class="nom">Classe {detail.l}</p>
      <ul>
        {#each detail.statut as ligne}
          <li>{ligne}</li>
        {/each}
      </ul>
    </div>
  {/if}
</figure>

<style>
  .positionnement {
    margin: 0;
  }

  .invite {
    margin: 0 0 8px;
    font-size: var(--t-micro);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--or-fonce);
  }

  .echelle {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .barreau {
    position: relative;
    border: none;
    border-radius: 2px;
    padding: 18px 0 16px;
    font-family: var(--police-titre);
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .barreau.sombre {
    color: #16241e;
  }

  .barreau.efface {
    opacity: 0.3;
  }

  /* La classe du logement dépasse des autres : on la trouve sans la chercher. */
  .barreau.ici {
    transform: translateY(-8px);
    box-shadow: 0 6px 16px -6px rgb(0 20 14 / 45%);
    outline: 2px solid var(--vert-700);
    outline-offset: 2px;
  }

  .ancre {
    position: absolute;
    left: 50%;
    bottom: -19px;
    transform: translateX(-50%);
    white-space: nowrap;
    font-family: var(--police);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--vert-700);
  }

  .echeances {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    margin-top: 26px;
    padding-top: 12px;
    border-top: 1px solid var(--trait-fin);
    font-size: var(--t-petit);
    color: var(--encre-doux);
  }

  .jalon::before {
    content: '→ ';
    color: var(--or-fonce);
  }

  .jalon.passe::before {
    content: '× ';
    color: var(--alerte);
  }

  .reponse {
    margin-top: 14px;
    padding: 12px 14px;
    background: var(--papier-doux);
    border-left: 3px solid var(--or);
    border-radius: var(--rayon-petit);
  }

  .nom {
    margin: 0 0 6px;
    font-weight: 700;
    font-size: var(--t-base);
    color: var(--vert-700);
  }

  .reponse ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 5px;
  }

  .reponse li {
    position: relative;
    padding-left: 17px;
    font-size: var(--t-base);
    line-height: 1.4;
    color: var(--encre);
  }

  .reponse li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 0.55em;
    width: 6px;
    height: 6px;
    border-radius: 2px;
    background: var(--or);
  }
</style>
