<script lang="ts">
  /**
   * Un texte dont les mots du métier s'expliquent sur place.
   *
   * Le retour du notaire emploie forcément des termes de la profession —
   * passoire, audit, DGI, opposable. Les éviter appauvrirait le propos ; les
   * laisser sans explication trahirait le devoir de conseil. On les souligne
   * donc, et un clic donne la définition, à l'endroit exact où le mot est lu.
   */
  const { texte }: { texte: string } = $props();

  import { LEXIQUE } from '../lib/lexique';
  import { espacesFrancaises } from '../lib/typographie';

  interface Bout {
    texte: string;
    definition?: string;
  }

  /**
   * Découpe le texte en morceaux, en isolant les termes reconnus.
   *
   * On avance de gauche à droite en prenant à chaque fois la première
   * occurrence, quel que soit le mot : sans ça, l'ordre du dictionnaire
   * dicterait le découpage et les termes se chevaucheraient.
   */
  const bouts = $derived.by<Bout[]>(() => {
    const morceaux: Bout[] = [];
    let reste = texte;

    while (reste) {
      let debut = -1;
      let trouve: { mot: (typeof LEXIQUE)[number]; texte: string } | null = null;

      for (const mot of LEXIQUE) {
        const m = reste.match(mot.motif);
        if (!m || m.index === undefined) continue;
        if (debut === -1 || m.index < debut) {
          debut = m.index;
          trouve = { mot, texte: m[0] };
        }
      }

      if (!trouve || debut === -1) {
        morceaux.push({ texte: reste });
        break;
      }

      if (debut > 0) morceaux.push({ texte: reste.slice(0, debut) });
      morceaux.push({ texte: trouve.texte, definition: trouve.mot.definition });
      reste = reste.slice(debut + trouve.texte.length);
    }

    return morceaux;
  });

  let ouvert = $state<string | null>(null);
</script>

{#each bouts as bout, i (i)}
  {#if bout.definition}
    <button
      type="button"
      class="terme"
      class:ouvert={ouvert === bout.texte}
      onclick={() => (ouvert = ouvert === bout.texte ? null : bout.texte)}
    >
      {espacesFrancaises(bout.texte)}
    </button>
  {:else}
    <!--
      Les espaces françaises se posent ICI, au dernier moment.

      Le texte a déjà été découpé et ses termes reconnus : y glisser des
      insécables plus tôt ferait échouer des correspondances qui, elles,
      travaillent sur des espaces ordinaires. Le morceau qui part à l'écran est
      le seul endroit sûr.

      Sans cela, le navigateur coupe où il veut, et la fiche du DPE affichait
      « … une « passoire thermique / ». La loi limite… », guillemet fermant
      seul en tête de ligne.
    -->
    {espacesFrancaises(bout.texte)}
  {/if}
{/each}

{#if ouvert}
  {@const def = bouts.find((b) => b.texte === ouvert)?.definition}
  {#if def}
    <!--
      UNE AIDE SUR LE CÔTÉ, PAS AU MILIEU DE LA PHRASE.

      La définition s'insérait dans le fil du texte : la phrase se coupait en
      deux, tout ce qui suivait descendait, et le lecteur perdait la ligne qu'il
      était en train de lire — pour un mot dont il voulait seulement le sens.

      Elle devient une note de marge. Sur un écran large, elle sort dans la
      marge de droite, en face du passage. Sur un téléphone, où il n'y a pas de
      marge, elle se pose sous la ligne, décalée et tenue par un filet : la
      forme d'une annotation, pas d'un paragraphe de plus.

      Le mot est repris en tête : une note qui ne dit pas de quoi elle parle
      oblige à revenir en arrière pour le retrouver.
    -->
    <span class="aide apparait" role="note">
      <span class="aide-mot">{ouvert}</span>
      <span class="aide-texte">{def}</span>
    </span>
  {/if}
{/if}

<style>
  /* Le mot reste dans la phrase : on ne le sort pas, on le souligne.

     Le rembourrage vertical, compensé par une marge négative, agrandit la zone
     touchable sans toucher à l'interligne : sur un téléphone, ces mots faisaient
     23 px de haut, soit la moitié de ce qu'un pouce vise. La ligne du texte ne
     bouge pas d'un pixel — un rembourrage vertical sur une boîte en ligne ne
     compte pas dans la hauteur de ligne. */
  .terme {
    display: inline;
    background: none;
    border: none;
    padding: var(--e3) 0;
    margin: -var(--e3) 0;
    font: inherit;
    color: inherit;
    cursor: help;
    text-decoration: underline dotted;
    text-decoration-color: var(--verriere-sable-or);
    text-underline-offset: 3px;
  }

  .terme:hover,
  .terme.ouvert {
    color: var(--verriere-vert);
    text-decoration-style: solid;
  }

  /*
   * L'AIDE, EN MARGE.
   *
   * Elle tient par son filet et son retrait, pas par un cadre : une note
   * annotée à la main sur un rapport imprimé ne porte pas de boîte.
   *
   * Le filet reprend la teinte de l'écran courant (`--u-accent`), pour que
   * l'aide appartienne visiblement au diagnostic qu'on lit — et retombe sur le
   * vert de la marque partout ailleurs.
   */
  /*
   * L'AIDE PARLE AVEC LA VOIX DE VERRIÈRE, DONC EN ITALIQUE.
   *
   * C'est le partage le plus utile du produit : ce qui vient du rapport reste
   * en linéale, ce que Verrière ajoute s'écrit en Fraunces italique. Le
   * lecteur sait d'un coup d'œil qui parle, sans qu'on ait besoin de le lui
   * écrire.
   *
   * Une vraie italique dessinée, pas une oblique calculée : à ce corps, la
   * différence se voit.
   */
  .aide {
    display: block;
    margin: var(--e2) 0 var(--e3) var(--e3);
    padding: var(--e2) 0 var(--e2) var(--e3);
    border-left: 3px solid var(--u-accent, var(--verriere-vert));
    font-family: var(--police-voix);
    font-style: italic;
    font-optical-sizing: auto;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--encre-doux, var(--sur-fond-doux));
  }

  /* Le mot dont il s'agit, repris en tête de la note. */
  /* Le mot, lui, vient du rapport : il garde la linéale et ne s'incline pas. */
  .aide-mot {
    display: block;
    font-family: var(--police);
    font-style: normal;
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--u-accent, var(--verriere-vert));
  }

  .aide-texte {
    display: block;
    margin-top: 2px;
  }

  /*
   * DANS LA MARGE, DÈS QU'IL Y A UNE MARGE.
   *
   * Au-delà de 1100 px, la colonne de lecture n'occupe plus toute la largeur :
   * l'aide sort à droite, en face du passage, et le texte ne bouge pas d'un
   * pixel. C'est la disposition d'un ouvrage annoté — et c'est le seul cas où
   * « sur le côté » peut être pris au pied de la lettre.
   *
   * En dessous, la marge n'existe pas : l'aide reste sous la ligne, tenue par
   * son filet. Sortir une note dans une marge de zéro pixel la ferait
   * disparaître hors de l'écran.
   */
  @media (min-width: 1100px) {
    .aide {
      position: absolute;
      right: var(--e4);
      width: 232px;
      margin: 0;
      padding-left: var(--e3);
    }
  }
</style>
