<script lang="ts">
  /**
   * Une bribe d'explication, dont les mots peuvent ouvrir d'autres notions.
   *
   * « Chaque réponse est une nouvelle porte » (§ 6). Quand le terme d'une notion
   * apparaît dans la phrase, c'est ce mot-là qui devient le clip — on ne sort
   * pas le mot de son contexte pour en faire un lien à part. S'il n'y figure
   * pas, le clip se pose en fin de bribe.
   */
  import type { Bribe } from '../../lib/savoir/notions';
  import { notion } from '../../lib/savoir/notions';
  import Clip from './Clip.svelte';

  const { bribe }: { bribe: Bribe } = $props();

  interface Morceau {
    texte: string;
    clip?: string;
  }

  /** Découpe la phrase en isolant les termes reconnus, de gauche à droite. */
  const morceaux = $derived.by<Morceau[]>(() => {
    const ids = bribe.clips ?? [];
    const sortie: Morceau[] = [];
    let reste = bribe.texte;

    while (reste) {
      let debut = -1;
      let trouve: { id: string; texte: string } | null = null;

      for (const id of ids) {
        const terme = notion(id)?.terme;
        if (!terme) continue;
        const i = reste.toLowerCase().indexOf(terme.toLowerCase());
        if (i === -1) continue;
        if (debut === -1 || i < debut) {
          debut = i;
          trouve = { id, texte: reste.slice(i, i + terme.length) };
        }
      }

      if (!trouve || debut === -1) {
        sortie.push({ texte: reste });
        break;
      }

      if (debut > 0) sortie.push({ texte: reste.slice(0, debut) });
      sortie.push({ texte: trouve.texte, clip: trouve.id });
      reste = reste.slice(debut + trouve.texte.length);
    }

    return sortie;
  });

  /** Les notions annoncées qui ne sont pas dans la phrase : elles se posent après. */
  const enSuite = $derived(
    (bribe.clips ?? []).filter((id) => !morceaux.some((m) => m.clip === id))
  );
</script>

<li>
  {#each morceaux as morceau, i (i)}
    {#if morceau.clip}
      <Clip id={morceau.clip} libelle={morceau.texte} />
    {:else}
      {morceau.texte}
    {/if}
  {/each}

  {#if enSuite.length}
    <span class="suites">
      {#each enSuite as id (id)}
        <Clip {id} />
      {/each}
    </span>
  {/if}
</li>

<style>
  li {
    margin: 0 0 9px;
    line-height: 1.5;
  }

  .suites {
    display: block;
    margin-top: 5px;
    font-size: 0.9rem;
  }
</style>
