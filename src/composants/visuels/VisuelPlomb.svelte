<script lang="ts">
  /**
   * La paillasse du plomb : une éprouvette par classe du constat.
   *
   * ── Ce que la maquette pose, et qu'on garde ─────────────────────────────────
   *
   * CHECKMYDIAG_APP.html, entrée `plomb` de l'objet `D`, `visual:'plomb'` : une
   * `.bench` — flex, align-items flex-end, gap 24, border-bottom 3px — sur
   * laquelle sont posés des tubes de 40 × 126 px, verre à lèvre ronde, fond
   * blanc à 50 %, rayon bas 20. Dedans un liquide en dégradé vert qui monte,
   * deux bulles de 5 px qui remontent. Sous chaque tube, le nom en petit puis le
   * résultat en gras. C'est la signature de cet écran : elle dit « analyse »
   * avant qu'on ait lu un mot. Tout cela est conservé, y compris l'ordre
   * nom-puis-résultat, que le brouillon avait inversé.
   *
   * ── Ce que les tubes contiennent ────────────────────────────────────────────
   *
   * La maquette montrait trois tubes « Peintures / Encadrements / Extérieur »,
   * tous marqués NÉGATIF. Du remplissage, et une nomenclature que le CREP
   * n'emploie pas : le constat ne range pas ses mesures par famille de support,
   * il classe chaque unité de diagnostic de 0 à 3. C'est aussi le seul chiffre
   * que le moteur sait lire (analyse/plomb.ts, fonction `compter`, ligne de six
   * nombres validée par sa somme). Une éprouvette par classe, donc : le niveau
   * du liquide est la part des unités, la couleur monte du vert au rouge dans
   * l'ordre des classes.
   *
   * ── Ce qu'on n'invente pas ──────────────────────────────────────────────────
   *
   * `classes === null` : le tableau de conclusion n'a pas été lu. Les quatre
   * éprouvettes restent en pointillés, vides, le compteur affiche « ? » et la
   * ligne du dessous le dit. Aucune valeur d'exemple, jamais.
   *
   * Les unités non mesurées ont leur propre éprouvette, vide et en pointillés.
   * Une unité non mesurée n'est pas réputée saine, elle est inconnue ; la
   * montrer verte serait un mensonge par mise en page.
   *
   * ── Ce que ce composant ne dit pas, parce qu'un autre le dit déjà ───────────
   *
   * Pas de verdict, pas de liste d'emplacements, pas de rappel sur les travaux
   * obligatoires, l'agence régionale de santé ou les enfants de moins de six
   * ans. Diagnostics.svelte imprime déjà, dans la colonne d'à côté, le verdict,
   * les faits, `explication` et `aFaire` — où ces phrases existent mot pour mot
   * (analyse/plomb.ts). Et `PlanDuLogement` → `PlanPaillasse` dessine déjà, juste
   * en dessous, un tube par emplacement mesuré. Redire ici, c'est se contredire
   * un jour. Le visuel montre combien, par classe. Rien d'autre.
   *
   * ── Couleurs, depuis le passage au pétrole ──────────────────────────────────
   *
   * Le composant n'a pas de fond à lui : il vit dans `.dessin`, dont le
   * `--papier` vaut `--u-surface` — #255054 pour le plomb depuis que tous les
   * univers reposent sur le pétrole. La paillasse était dessinée pour un fond
   * clair : encre verte foncée, verre pâle, liquides sombres. Tout cela est
   * retourné ici, et passe par les jetons `--u-*` pour suivre la prochaine
   * charte sans réécriture.
   *
   * Un point demandait un arbitrage. L'intérieur du tube était « blanc à 50 % » :
   * traduit en voile crème sur le pétrole, il donnait un fond à ~#3e6366, sur
   * lequel le vert vif de l'univers ne tient que 2,00 — la classe 0 devenait
   * illisible, et il aurait fallu éclaircir #43a047, c'est-à-dire abandonner la
   * couleur vive de l'univers. Le verre montre donc le fond profond
   * (`--u-fond`, #134247) : une éprouvette vide est un creux dans la carte, et
   * c'est la lèvre claire qui la dessine. Le vif reste le vif — 3,35 sur ce
   * fond — et toute l'échelle des classes respire au-dessus de 3.
   *
   * Contrastes mesurés (WCAG 2.1, luminance relative avec correction gamma ;
   * les voiles translucides recomposés sur leur fond réel avant mesure) :
   *
   *   sur la surface #255054   texte #f5f1e8 7,91 · doux #cbd8dd 6,12 ·
   *                            accent #acd5ae 5,47
   *   sur le tube #134247      verre #acd5ae 6,79 · verre actif #f5f1e8 9,82 ·
   *                            liquides 3,35 → 6,39
   *   sur la fiche #315a5d     titre 6,77 · texte 5,24 · lien #acd5ae 4,68 ·
   *   (voile crème 6 %)        filet de classe 3,23 → 4,41
   *
   * Les quatre teintes de liquide restent des couleurs de sujet : elles portent
   * l'échelle des classes, du vert au rouge, et gardent leur teinte — seule leur
   * clarté monte, parce que le fond a baissé. Aucune couleur d'état du produit
   * (--alerte, --ok…) n'est employée : elles répondent au thème, pas à l'univers.
   */

  interface Props {
    /** Unités de diagnostic par classe 0 → 3. `null` = tableau non lu. */
    classes?: [number, number, number, number] | null;
    /** Unités que le diagnostiqueur n'a pas pu mesurer. `null` = non lu. */
    nonMesurees?: number | null;
    /** Total annoncé par le constat, non mesurées comprises. `null` = non lu. */
    total?: number | null;
  }

  const { classes = null, nonMesurees = null, total = null }: Props = $props();

  interface Definition {
    haut: string;
    bas: string;
    titre: string;
    texte: string;
  }

  /*
   * Les quatre classes du CREP. Le texte de chacune est celui qu'on donnerait de
   * vive voix : ce que le diagnostiqueur a vu, et ce que ça oblige.
   *
   * L'échelle de couleur est la même qu'avant — vert, olive, orange, rouge —
   * mais relevée d'un cran de clarté : le liquide se lit désormais sur le
   * pétrole du tube (#134247) et non plus sur un verre blanc. `haut` est la
   * surface du liquide, celle qui prend la lumière ; `bas` est le corps. Pour la
   * classe 0, ce corps est exactement `--u-accent-vif` (#43a047), le vert du
   * réactif : la couleur vive de l'univers reste la couleur vive de l'univers.
   * Chaque teinte tient au moins 3 sur le fond du tube — mesuré, pas estimé.
   */
  const DEFINITIONS: Definition[] = [
    {
      haut: '#66bb6a',
      bas: '#43a047',
      titre: 'Classe 0 — pas de plomb',
      texte:
        'Le revêtement ne contient pas de plomb, ou en contient moins que le seuil réglementaire. Rien à surveiller, rien à faire.'
    },
    {
      haut: '#b0cc55',
      bas: '#8ea62e',
      titre: 'Classe 1 — du plomb, revêtement intact',
      texte:
        'Il y a du plomb sous la peinture, mais la peinture tient. Rien ne s’en échappe tant qu’on ne la ponce pas, qu’on ne la gratte pas et qu’elle ne se dégrade pas.'
    },
    {
      haut: '#ffb74d',
      bas: '#ef8a1a',
      titre: 'Classe 2 — du plomb, revêtement usé',
      texte:
        'Le revêtement est éraflé, usé, entamé par endroits. C’est l’état qui précède la classe 3 : entretenu il y reste, laissé il s’y dégrade.'
    },
    {
      haut: '#ff8a80',
      bas: '#f4675f',
      titre: 'Classe 3 — du plomb, revêtement dégradé',
      texte:
        'La peinture s’écaille, se pulvérise, tombe. C’est la classe qui contamine par la poussière, et la seule qui oblige le propriétaire à faire supprimer l’exposition.'
    }
  ];

  const NON_MESUREES = {
    titre: 'Unités non mesurées',
    texte:
      'Le diagnostiqueur n’a pas pu mesurer ces unités : un meuble devant le mur, une pièce fermée, un élément inaccessible. Elles ne sont pas réputées saines — on ne sait pas.'
  };

  /* Hauteur intérieure du tube, en pixels : 126 de verre moins la lèvre de 7. */
  const HAUTEUR_TUBE = 119;
  /* Le tube plein s'arrête sous la lèvre : un liquide qui déborde ne se lit pas. */
  const ECHELLE = 0.88;
  /*
   * Une unité sur soixante-dix ne ferait pas un pixel. Le plancher rend visible
   * ce qui existe — le chiffre exact est écrit sous chaque tube, il n'y a donc
   * rien à mal lire.
   */
  const PLANCHER = 0.07;

  interface Tube {
    id: string;
    nom: string;
    /** `null` quand le rapport n'a pas livré le chiffre. */
    nombre: number | null;
    /** Hauteur du liquide, de 0 à 1. 0 = pas de liquide dessiné. */
    part: number;
    /** Montée des bulles, en pixels, tenue à l'intérieur du liquide. */
    montee: number;
    haut: string;
    bas: string;
    /** Verre en pointillés : on ne sait pas, ou on n'a pas mesuré. */
    pointille: boolean;
    titre: string;
    texte: string;
    /** Le tube est décoratif : tout ce qu'il montre se dit ici, en toutes lettres. */
    apercu: string;
  }

  const mesurees = $derived(
    classes ? classes[0] + classes[1] + classes[2] + classes[3] : null
  );

  function hauteur(n: number, base: number): number {
    if (base <= 0 || n <= 0) return 0;
    return Math.max(PLANCHER, Math.min(1, n / base) * ECHELLE);
  }

  const tubes = $derived.by((): Tube[] => {
    const base = mesurees ?? 0;

    const liste: Tube[] = DEFINITIONS.map((d, i) => {
      const nombre = classes ? (classes[i] ?? 0) : null;
      const part = nombre === null ? 0 : hauteur(nombre, base);
      return {
        id: `classe-${i}`,
        nom: `Classe ${i}`,
        nombre,
        part,
        montee: Math.round(part * HAUTEUR_TUBE * 0.55),
        haut: d.haut,
        bas: d.bas,
        pointille: nombre === null,
        titre: d.titre,
        texte: d.texte,
        apercu:
          nombre === null
            ? `Classe ${i} : nombre non lu dans le rapport`
            : `Classe ${i} : ${nombre} unité${nombre > 1 ? 's' : ''} sur ${base} mesurée${base > 1 ? 's' : ''}`
      };
    });

    if (nonMesurees !== null && nonMesurees > 0) {
      liste.push({
        id: 'non-mesurees',
        nom: 'Non mesurées',
        nombre: nonMesurees,
        part: 0,
        montee: 0,
        haut: 'transparent',
        bas: 'transparent',
        pointille: true,
        titre: NON_MESUREES.titre,
        texte: NON_MESUREES.texte,
        apercu: `${nonMesurees} unité${nonMesurees > 1 ? 's' : ''} non mesurée${nonMesurees > 1 ? 's' : ''}`
      });
    }

    return liste;
  });

  let choisi = $state<string | null>(null);
  const detail = $derived(tubes.find((t) => t.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }
</script>

<figure class="labo">
  <p class="etiquette">Unités de diagnostic, classe par classe</p>

  <div
    class="paillasse"
    role="group"
    aria-label="Répartition des unités de diagnostic par classe"
  >
    {#each tubes as t, i (t.id)}
      <button
        type="button"
        class="tw"
        class:actif={choisi === t.id}
        aria-pressed={choisi === t.id}
        aria-label={t.apercu}
        onclick={() => basculer(t.id)}
      >
        <span class="verre" class:pointille={t.pointille} aria-hidden="true">
          <span class="tube">
            {#if t.part > 0}
              <span
                class="liq"
                style="--part:{t.part};--retard:{i * 110}ms;--haut:{t.haut};--bas:{t.bas}"
              ></span>
              {#if t.part >= 0.3}
                <span
                  class="bul"
                  style="left:9px;--retard:{0.4 + i * 0.2}s;--montee:{t.montee}px"
                ></span>
                <span
                  class="bul"
                  style="left:24px;--retard:{1.2 + i * 0.2}s;--montee:{t.montee}px"
                ></span>
              {/if}
            {/if}
          </span>
        </span>
        <span class="nom">{t.nom}</span>
        <span class="mesure">{t.nombre === null ? '?' : t.nombre}</span>
      </button>
    {/each}
  </div>

  <p class="bilan">
    {#if mesurees === null}
      Le tableau de conclusion du constat n’a pas pu être lu : rien n’est chiffré ici.
    {:else if total !== null && total > mesurees}
      {mesurees} unité{mesurees > 1 ? 's' : ''} mesurée{mesurees > 1 ? 's' : ''} sur {total} au
      total.
    {:else}
      {mesurees} unité{mesurees > 1 ? 's' : ''} mesurée{mesurees > 1 ? 's' : ''}.
    {/if}
  </p>

  <!-- Une seule région vivante, présente en permanence : un aria-live inséré
       en même temps que son contenu n'est pas annoncé de façon fiable. -->
  <div class="sortie" aria-live="polite">
    {#if detail}
      <div class="fiche" style="--bord:{detail.pointille ? 'var(--u-texte-doux, #cbd8dd)' : detail.haut}">
        <p class="fiche-titre">{detail.titre}</p>
        <p class="fiche-texte">{detail.texte}</p>
        <button type="button" class="fermer" onclick={() => (choisi = null)}>
          ← Revenir aux éprouvettes
        </button>
      </div>
    {:else}
      <p class="invite">Touchez une éprouvette : elle dit ce que sa classe veut dire.</p>
    {/if}
  </div>
</figure>

<style>
  /*
   * Pas de fond, pas de bordure de carte : `.dessin` est déjà la carte, et son
   * `--papier` vaut `--u-surface`. Une carte de la même couleur sur elle-même
   * ne se voit pas — elle ajoute juste un cadre à 1,33 de contraste.
   */
  .labo {
    /* La paillasse de la maquette : tube de 40 × 126, lèvre de 7 px. */
    --h-tube: 126px;
    /*
     * Le verre. La maquette pose rgba(67,160,71,.24), soit un liséré pâle :
     * invisible sur le pétrole. Or c'est ce trait qui donne au niveau du liquide
     * un repère — sans lui, la hauteur ne veut plus rien dire. On prend donc le
     * jeton qui écrit : 5,47 sur la surface, 6,79 sur l'intérieur du tube.
     */
    --verre: var(--u-accent, #acd5ae);

    margin: var(--e5) 0 0;
    padding: 0;
    animation: paraitre 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes paraitre {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  .etiquette {
    margin: 0 0 var(--e4);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--u-texte-doux, #cbd8dd);
  }

  /*
   * La `.bench` de la maquette. Les libellés restent au-dessus du filet, comme
   * chez elle : la ligne ferme le plan de travail, elle ne souligne pas les
   * tubes. Le filet est décoratif — il ne porte aucune information — donc il
   * garde la teinte douce de l'univers.
   */
  .paillasse {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-end;
    justify-content: center;
    gap: clamp(4px, 2.5vw, 24px);
    padding-bottom: var(--e3);
    border-bottom: 3px solid var(--u-trait, #849a98);
  }

  /* Cinq éprouvettes au maximum : 48 px de cible chacune, gouttière élastique. */
  .tw {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--e2);
    min-width: 48px;
    padding: var(--e1) 0 0;
    background: none;
    border: 0;
    border-radius: var(--rayon-petit);
    font: inherit;
    color: inherit;
    cursor: pointer;
  }

  .tw:focus-visible {
    outline: 2px solid var(--u-accent, #acd5ae);
    outline-offset: 2px;
  }

  .verre {
    position: relative;
    display: block;
    box-sizing: border-box;
    width: 40px;
    height: var(--h-tube);
    padding-top: 7px;
  }

  /*
   * La lèvre du tube, dessinée hors du corps. Dans la maquette le ::before est
   * un enfant de .tube, lui-même en overflow:hidden : la lèvre y est découpée
   * et n'apparaît jamais. On garde l'intention — une éprouvette a un col —
   * plutôt que l'accident.
   */
  .verre::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: 40px;
    height: 9px;
    border: 2.5px solid var(--verre);
    border-bottom: none;
    border-radius: 5px 5px 0 0;
  }

  /*
   * L'intérieur du tube. La maquette y mettait du blanc à 50 % ; sur le pétrole
   * ce serait un voile clair, et l'échelle des classes n'aurait plus de place
   * pour vivre au-dessus (voir l'en-tête). Le verre montre donc le fond profond
   * de l'univers : l'éprouvette vide est un creux, la lèvre claire la dessine.
   */
  .tube {
    position: relative;
    display: block;
    box-sizing: border-box;
    width: 40px;
    height: calc(var(--h-tube) - 7px);
    background: var(--u-fond, #134247);
    border: 2.5px solid var(--verre);
    border-top: none;
    border-radius: 0 0 20px 20px;
    overflow: hidden;
  }

  /* Pointillés : rien n'a été mesuré, ou rien n'a été lu. Le chiffre en dessous
     dit lequel des deux — « ? » quand on ne sait pas, le compte quand on sait. */
  .verre.pointille::before,
  .verre.pointille .tube {
    border-style: dashed;
  }

  /*
   * Le liquide monte par `scaleY` — jamais par `height` comme dans la maquette :
   * c'est ce qui tient les 60 images/s sur un téléphone.
   */
  .liq {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, var(--haut), var(--bas));
    border-radius: 0 0 17px 17px;
    transform-origin: bottom center;
    transform: scaleY(var(--part));
    animation: remplir 1s cubic-bezier(0.4, 0, 0.2, 1) var(--retard) both;
  }

  @keyframes remplir {
    from {
      transform: scaleY(0);
    }
    to {
      transform: scaleY(var(--part));
    }
  }

  /* Les bulles remontent en translateY, et non en `bottom` : une propriété de
     mise en page animée en boucle sur cinq tubes coûte un recalcul par image.

     Elles étaient blanches sur des liquides sombres. Les liquides sont
     maintenant clairs — du blanc à 75 % y descendrait à 1,38 sur l'orange de la
     classe 2, c'est-à-dire disparaîtrait. La bulle prend donc le pétrole du
     tube : un creux dans le liquide plutôt qu'un reflet, visible sur les huit
     teintes de la rampe (2,98 au pire, sur le vert vif). C'est un ornement — il
     ne porte aucun chiffre, le compte est écrit sous chaque tube. */
  .bul {
    position: absolute;
    bottom: 6px;
    width: 5px;
    height: 5px;
    background: var(--u-fond, #134247);
    border-radius: 50%;
    opacity: 0;
    /* Animation retiree : des bulles qui montent en boucle dans un tube ne
       demontrent rien -- elles attirent l'oeil sans rien apprendre. */
  }


  /* Nom puis résultat en gras, dans l'ordre de la maquette (`.tw-l` + `<b>`). */
  .nom {
    font-size: var(--t-micro);
    font-weight: 600;
    line-height: 1.25;
    white-space: nowrap;
    color: var(--u-texte-doux, #cbd8dd);
  }

  .mesure {
    font-size: var(--t-base);
    font-weight: 800;
    line-height: 1;
    color: var(--u-texte, #f5f1e8);
  }

  /* Au repos le verre écrit en accent ; touché, il monte à l'encre pleine. Sur
     un fond clair on assombrissait pour marquer l'état actif — sur le pétrole
     c'est l'inverse, on éclaircit. 5,47 → 7,91 sur la surface. */
  .tw:hover .tube,
  .tw:hover .verre::before,
  .tw.actif .tube,
  .tw.actif .verre::before {
    border-color: var(--u-texte, #f5f1e8);
  }

  .tw.actif .nom {
    color: var(--u-texte, #f5f1e8);
  }

  .bilan {
    margin: var(--e3) 0 0;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--u-texte-doux, #cbd8dd);
  }

  .invite {
    margin: var(--e4) 0 0;
    font-size: var(--t-petit);
    color: var(--u-texte-doux, #cbd8dd);
  }

  /*
   * La fiche était une carte blanche teintée d'accent. Sur le pétrole elle
   * devient un voile crème à 6 % — l'encart clair que la charte autorise, sans
   * l'aplat sable qui a été refusé. Recomposé sur la surface : #315a5d, où le
   * lien du bas tient encore 4,68. Au-delà de 6 % il tomberait sous 4,5.
   */
  .fiche {
    margin-top: var(--e4);
    padding: var(--e3) var(--e4);
    background: rgb(245 241 232 / 6%);
    border-left: 4px solid var(--bord);
    border-radius: var(--rayon-petit);
    animation: paraitre 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .fiche-titre {
    margin: 0 0 var(--e2);
    font-size: var(--t-base);
    font-weight: 800;
    color: var(--u-texte, #f5f1e8);
  }

  .fiche-texte {
    margin: 0;
    font-size: var(--t-petit);
    line-height: 1.6;
    color: var(--u-texte-doux, #cbd8dd);
  }

  .fermer {
    margin-top: var(--e3);
    padding: 0;
    background: none;
    border: 0;
    font: inherit;
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--u-accent, #acd5ae);
    cursor: pointer;
  }

  .fermer:focus-visible {
    outline: 2px solid var(--u-accent, #acd5ae);
    outline-offset: 2px;
  }

  /*
   * Svelte n'applique rien de tout ça, et app.css ne coupe pas les animations
   * globalement : chaque animation écrite à la main doit être éteinte ici, une
   * par une. Le liquide garde sa hauteur — c'est une donnée, pas un effet.
   */
  @media (prefers-reduced-motion: reduce) {
    .labo,
    .fiche {
      animation: none;
    }

    .liq {
      animation: none;
      transform: scaleY(var(--part));
    }

    .bul {
      display: none;
    }
  }
</style>
