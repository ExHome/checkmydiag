<script lang="ts">
  /**
   * Où se trouve le plomb, pièce par pièce.
   *
   * Le moteur relevait déjà ces emplacements — zone, élément, classement — et
   * les rangeait dans le schéma du diagnostic. Aucun composant ne les
   * affichait : la donnée était extraite puis jetée, et le lecteur qui
   * demandait « où ? » lisait « information non disponible » alors que son
   * rapport la donne.
   *
   * ── Ce que le classement veut dire ─────────────────────────────────────────
   *
   * Le CREP classe chaque unité mesurée de 0 à 3. Seules les classes 2 et 3
   * comptent ici — c'est le filtre posé par l'analyseur, et c'est celui de
   * l'arrêté : au-dessous, le revêtement ne relève d'aucune obligation.
   *
   *   classe 3  revêtement dégradé : travaux obligatoires, sous un an.
   *   classe 2  revêtement non dégradé mais présent : à surveiller.
   *
   * ── Ce qu'on n'écrit pas ───────────────────────────────────────────────────
   *
   * Ni conseil, ni commentaire, ni dramatisation. La pièce, l'élément, la
   * classe et ce qu'elle impose — les mots du rapport, puis l'obligation
   * qu'ils déclenchent. Le reste est déjà ailleurs dans la fiche.
   */

  interface Emplacement {
    zone: string;
    element: string;
    classe: number;
  }

  const { emplacements }: { emplacements: Emplacement[] } = $props();

  /**
   * Groupé par pièce, pas par ligne de tableau.
   *
   * Le rapport énumère une ligne par élément ; le lecteur, lui, pense par
   * pièce — « qu'est-ce qu'il y a dans la salle de bain ? ». On regroupe donc,
   * en gardant l'ordre du rapport à l'intérieur de chaque pièce.
   */
  const parPiece = $derived.by(() => {
    const pieces = new Map<string, Emplacement[]>();
    for (const e of emplacements) {
      const liste = pieces.get(e.zone) ?? [];
      liste.push(e);
      pieces.set(e.zone, liste);
    }
    /* La pièce qui porte une classe 3 passe devant : c'est celle où des
       travaux sont dus. */
    return [...pieces.entries()].sort(
      ([, a], [, b]) => Math.max(...b.map((x) => x.classe)) - Math.max(...a.map((x) => x.classe))
    );
  });
</script>

{#if parPiece.length}
  <div class="ou-plomb">
    <p class="compte">
      Du plomb a été mesuré dans <b>{parPiece.length}</b>
      {parPiece.length > 1 ? 'pièces' : 'pièce'}.
    </p>

    <ul class="pieces">
      {#each parPiece as [piece, elements] (piece)}
        {@const pire = Math.max(...elements.map((e) => e.classe))}
        <li class="piece" class:urgente={pire >= 3}>
          <p class="nom-piece">
            <span class="marque-classe" aria-hidden="true"></span>
            {piece}
          </p>
          <ul class="elements">
            <!-- La clé porte l'INDEX : « A Mur … classe 3 » et « B Mur …
                 classe 3 » dans la même pièce est un cas normal du CREP, et il
                 produisait deux clés identiques — donc une erreur Svelte. -->
            {#each elements as e, i (e.element + e.classe + i)}
              <li>
                <span class="element">{e.element}</span>
                <span class="classe classe-{e.classe}">classe {e.classe}</span>
              </li>
            {/each}
          </ul>
          <p class="suite">
            {#if pire >= 3}
              Revêtement dégradé&nbsp;: travaux obligatoires dans l’année.
            {:else}
              Revêtement non dégradé&nbsp;: à surveiller, pas de travaux imposés.
            {/if}
          </p>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .ou-plomb {
    margin-top: var(--e3);
  }

  .compte {
    margin: 0 0 var(--e3);
    font-size: var(--t-base);
    color: var(--sur-fond);
  }

  .compte b {
    font-weight: 700;
  }

  .pieces {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--e3);
  }

  /* Une pièce = un bloc. Le liseré porte l'urgence, le mot la répète : la
     couleur n'est jamais seule à dire quelque chose. */
  .piece {
    padding: var(--e3) var(--e4);
    border-left: 3px solid var(--trait);
    border-radius: 0 var(--rayon) var(--rayon) 0;
    background: var(--surface);
  }

  .piece.urgente {
    border-left-color: var(--alerte);
  }

  .nom-piece {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 var(--e2);
    font-size: var(--t-base);
    font-weight: 700;
    color: var(--sur-fond);
  }

  .marque-classe {
    width: 9px;
    height: 9px;
    flex: none;
    border-radius: 50%;
    background: var(--attention);
  }

  .piece.urgente .marque-classe {
    background: var(--alerte);
  }

  .elements {
    list-style: none;
    margin: 0 0 var(--e2);
    padding: 0;
    display: grid;
    gap: 4px;
  }

  .elements li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--e2);
    font-size: var(--t-petit);
    color: var(--sur-fond);
  }

  /* Le classement reste écrit en toutes lettres à côté de sa couleur : le
     socle interdit de remplacer un libellé réglementaire par une pastille. */
  .classe {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    color: var(--sur-fond-doux);
  }

  .suite {
    margin: 0;
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }
</style>
