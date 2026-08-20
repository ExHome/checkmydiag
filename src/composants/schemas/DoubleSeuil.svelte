<script lang="ts">
  /**
   * Les deux étiquettes, et celle qui l'emporte.
   *
   * C'est la question qu'on pose le plus souvent devant un DPE : « pourquoi je
   * suis F alors que je consomme peu ? » La réponse tient au mécanisme
   * introduit en 2021 — le logement reçoit deux notes, l'une sur l'énergie
   * qu'il consomme, l'autre sur le CO₂ qu'il émet, et c'est **la plus mauvaise
   * des deux** qui devient sa classe. Un logement sobre chauffé au fioul est
   * puni par son carburant, pas par ses murs.
   *
   * Le dessin reprend la grammaire du document officiel : deux échelles A→G
   * aux couleurs de l'arrêté, la position du logement marquée sur chacune, et
   * la classe retenue désignée. Le lecteur a le rapport sous les yeux ; il doit
   * retrouver ici les formes qu'il y voit.
   *
   * Aucun seuil n'est écrit : on ne montre que les valeurs du rapport et les
   * lettres qu'il donne. Les seuils, eux, dépendent de la surface depuis
   * l'arrêté du 25 mars 2024 — les afficher en dur serait faux sous 40 m².
   */
  import type { Lettre } from '../../lib/modele';

  interface Etiquette {
    lettre: Lettre;
    valeur: number;
    unite: string;
  }

  const {
    energie,
    climat,
    finale
  }: { energie: Etiquette | null; climat: Etiquette | null; finale: Lettre | null } = $props();

  /** Les couleurs de l'arrêté : elles ne se réinventent pas. */
  const TEINTES: Record<string, string> = {
    A: '#319834',
    B: '#33cc31',
    C: '#cbfc34',
    D: '#fbfe06',
    E: '#fbcc05',
    F: '#fc9935',
    G: '#fc0205'
  };

  const LETTRES: Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  /**
   * Les lettres claires demandent une encre sombre pour rester lisibles.
   *
   * Le F (#fc9935) en faisait partie sans qu'on l'ait vu : du blanc dessus ne
   * donne que 2,15 de contraste. Les couleurs A→G sont celles de l'arrêté et ne
   * bougent pas — c'est l'encre posée dessus qui s'adapte.
   */
  const claire = (l: string): boolean => l === 'C' || l === 'D' || l === 'E' || l === 'F';

  const rang = (l: Lettre | null): number => (l ? LETTRES.indexOf(l) : -1);

  /** Laquelle des deux a décidé de la classe — celle qu'on désigne. */
  const decisive = $derived.by<'energie' | 'climat' | 'les deux' | null>(() => {
    if (!energie || !climat) return energie ? 'energie' : climat ? 'climat' : null;
    if (rang(energie.lettre) === rang(climat.lettre)) return 'les deux';
    return rang(energie.lettre) > rang(climat.lettre) ? 'energie' : 'climat';
  });

  const PAS = 26;
  const HAUT = 30;
</script>

<figure class="double-seuil">
  <svg
    viewBox="0 0 300 250"
    role="img"
    aria-label={energie && climat
      ? `Étiquette énergie ${energie.lettre}, étiquette climat ${climat.lettre}. La classe retenue est ${finale}, la plus mauvaise des deux.`
      : 'Les deux étiquettes du diagnostic de performance énergétique.'}
  >
    {#each [{ x: 12, titre: 'Énergie', quoi: 'ce qu’il consomme', e: energie, cle: 'energie' }, { x: 168, titre: 'Climat', quoi: 'ce qu’il émet', e: climat, cle: 'climat' }] as col (col.cle)}
      <g transform="translate({col.x} 0)">
        <text x="60" y="12" class="titre">{col.titre}</text>
        <text x="60" y="24" class="quoi">{col.quoi}</text>

        <!-- L'échelle A→G. Les barres s'allongent vers le bas, comme sur
             l'étiquette du rapport : la longueur dit déjà la gravité. -->
        {#each LETTRES as l, i (l)}
          {@const actif = col.e?.lettre === l}
          <g transform="translate(0 {HAUT + i * PAS})">
            <rect
              x="0"
              y="0"
              width={46 + i * 8}
              height="20"
              rx="2"
              fill={TEINTES[l]}
              opacity={actif ? 1 : 0.34}
            />
            <text x="10" y="14" class="lettre" class:sombre={claire(l)} opacity={actif ? 1 : 0.55}>
              {l}
            </text>

            {#if actif && col.e}
              <!-- Le logement est ici. Le curseur porte la valeur du rapport,
                   pas un seuil : c'est son chiffre à lui. -->
              <g class="marque">
                <path d="M{50 + i * 8} 10 l10 -6 v12 Z" />
                <text x={64 + i * 8} y="14" class="valeur">{col.e.valeur}</text>
              </g>
            {/if}
          </g>
        {/each}

        {#if col.e}
          <text x="60" y="242" class="unite">{col.e.unite}</text>
        {:else}
          <text x="60" y="242" class="unite">non lisible</text>
        {/if}
      </g>
    {/each}

    <!-- Ce que la règle retient, entre les deux colonnes. -->
    {#if finale}
      <g transform="translate(150 {HAUT + rang(finale) * PAS})">
        <circle cx="0" cy="10" r="13" class="retenue" fill={TEINTES[finale]} />
        <text x="0" y="15" class="retenue-lettre" class:sombre={claire(finale)}>{finale}</text>
      </g>
    {/if}
  </svg>

  <figcaption>
    {#if energie && climat && decisive}
      <strong>La plus mauvaise des deux l’emporte.</strong>
      {#if decisive === 'les deux'}
        Les deux étiquettes donnent {finale} : la classe est {finale}.
      {:else if decisive === 'climat'}
        L’énergie note {energie.lettre}, le CO₂ note {climat.lettre} : c’est le CO₂ qui fixe la
        classe à {finale}. Ce logement ne consomme pas tant — c’est son mode de chauffage qui pèse.
      {:else}
        Le CO₂ note {climat.lettre}, l’énergie note {energie.lettre} : c’est la consommation qui
        fixe la classe à {finale}.
      {/if}
    {:else}
      <strong>Deux notes, une classe.</strong>
      Le logement est noté sur ce qu’il consomme et sur ce qu’il émet ; la plus mauvaise des deux
      devient sa classe.
    {/if}
  </figcaption>
</figure>

<style>
  .double-seuil {
    margin: 0;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .titre {
    font-family: var(--police-titre);
    font-size: 19.5px;
    font-weight: 500;
    text-anchor: middle;
    fill: var(--vert-700);
  }

  .quoi {
    font-family: var(--police);
    font-size: 12.5px;
    text-anchor: middle;
    fill: var(--gris);
  }

  .lettre {
    font-family: var(--police);
    font-size: 18px;
    font-weight: 700;
    fill: #fff;
  }

  .lettre.sombre {
    fill: var(--encre);
  }

  .unite {
    font-family: var(--police);
    font-size: 12px;
    text-anchor: middle;
    fill: var(--gris);
  }

  /* Le curseur du logement : un triangle et son chiffre. C'est le seul élément
     qui bouge d'un rapport à l'autre, il a droit à l'encre pleine. */
  .marque path {
    fill: var(--encre);
  }

  .valeur {
    font-family: var(--mono);
    font-size: 15px;
    font-weight: 700;
    fill: var(--encre);
  }

  /* La classe retenue, posée entre les deux échelles, à sa hauteur. */
  .retenue {
    stroke: var(--encre);
    stroke-width: 1.6;
  }

  .retenue-lettre {
    font-family: var(--police-titre);
    font-size: 22px;
    font-weight: 600;
    text-anchor: middle;
    fill: #fff;
  }

  .retenue-lettre.sombre {
    fill: var(--encre);
  }

  figcaption {
    margin-top: var(--e2);
    font-size: var(--t-petit);
    line-height: 1.45;
    color: var(--encre-doux);
  }

  figcaption strong {
    display: block;
    color: var(--vert-700);
  }
</style>
