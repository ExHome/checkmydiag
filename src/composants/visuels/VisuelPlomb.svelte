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
   * ── Couleurs ────────────────────────────────────────────────────────────────
   *
   * Le composant n'a pas de fond à lui : il vit dans `.dessin`, dont le
   * `--papier` vaut `--u-surface` (#f7faf7 pour cet univers). Poser une carte
   * #f7faf7 sur un fond #f7faf7 revenait à dessiner une carte invisible — c'est
   * ce que faisait le brouillon. Tous les contrastes ci-dessous sont donc
   * mesurés sur #f7faf7, et sur #fbfdfb pour l'intérieur du tube (blanc à 50 %
   * recomposé sur #f7faf7). Hors univers (galerie, impression), les replis
   * reprennent les valeurs de `univers.ts` et les fonds deviennent blancs :
   * chaque couple y monte, aucun n'y descend.
   *
   * Les quatre teintes de liquide sont des couleurs de sujet : elles portent
   * l'échelle des classes. Aucune couleur d'état du produit (--alerte, --ok…)
   * n'est employée — elles basculent avec le thème alors que la surface de
   * l'univers, elle, reste claire.
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
   */
  const DEFINITIONS: Definition[] = [
    {
      haut: '#43a047',
      bas: '#2e7d32',
      titre: 'Classe 0 — pas de plomb',
      texte:
        'Le revêtement ne contient pas de plomb, ou en contient moins que le seuil réglementaire. Rien à surveiller, rien à faire.'
    },
    {
      haut: '#6b8e23',
      bas: '#4e6b1a',
      titre: 'Classe 1 — du plomb, revêtement intact',
      texte:
        'Il y a du plomb sous la peinture, mais la peinture tient. Rien ne s’en échappe tant qu’on ne la ponce pas, qu’on ne la gratte pas et qu’elle ne se dégrade pas.'
    },
    {
      haut: '#b26a00',
      bas: '#8a5200',
      titre: 'Classe 2 — du plomb, revêtement usé',
      texte:
        'Le revêtement est éraflé, usé, entamé par endroits. C’est l’état qui précède la classe 3 : entretenu il y reste, laissé il s’y dégrade.'
    },
    {
      haut: '#c62828',
      bas: '#9e1f1f',
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
      <div class="fiche" style="--bord:{detail.pointille ? 'var(--u-texte-doux, #4a6b4d)' : detail.haut}">
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
     * Le verre. La maquette pose rgba(67,160,71,.24), soit #cfe0d1 recomposé :
     * 1,31 sur la surface. Or c'est ce trait qui donne au niveau du liquide un
     * repère — sans lui, la hauteur ne veut plus rien dire. #6f9a75 tient 3,13
     * sur l'intérieur du tube et 3,05 sur la surface.
     */
    --verre: #6f9a75;

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
    color: var(--u-texte-doux, #4a6b4d);
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
    border-bottom: 3px solid var(--u-trait, #cfe0d1);
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
    outline: 2px solid var(--u-accent, #2e7d32);
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

  .tube {
    position: relative;
    display: block;
    box-sizing: border-box;
    width: 40px;
    height: calc(var(--h-tube) - 7px);
    background: rgb(255 255 255 / 50%);
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
     mise en page animée en boucle sur cinq tubes coûte un recalcul par image. */
  .bul {
    position: absolute;
    bottom: 6px;
    width: 5px;
    height: 5px;
    background: rgb(255 255 255 / 75%);
    border-radius: 50%;
    opacity: 0;
    animation: monter 2.8s ease-in var(--retard) infinite;
  }

  @keyframes monter {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    22% {
      opacity: 0.9;
    }
    100% {
      transform: translateY(calc(-1 * var(--montee)));
      opacity: 0;
    }
  }

  /* Nom puis résultat en gras, dans l'ordre de la maquette (`.tw-l` + `<b>`). */
  .nom {
    font-size: var(--t-micro);
    font-weight: 600;
    line-height: 1.25;
    white-space: nowrap;
    color: var(--u-texte-doux, #4a6b4d);
  }

  .mesure {
    font-size: var(--t-base);
    font-weight: 800;
    line-height: 1;
    color: var(--u-texte, #1b5e20);
  }

  .tw:hover .tube,
  .tw:hover .verre::before,
  .tw.actif .tube,
  .tw.actif .verre::before {
    border-color: var(--u-accent, #2e7d32);
  }

  .tw.actif .nom {
    color: var(--u-texte, #1b5e20);
  }

  .bilan {
    margin: var(--e3) 0 0;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--u-texte-doux, #4a6b4d);
  }

  .invite {
    margin: var(--e4) 0 0;
    font-size: var(--t-petit);
    color: var(--u-texte-doux, #4a6b4d);
  }

  .fiche {
    margin-top: var(--e4);
    padding: var(--e3) var(--e4);
    background: color-mix(in srgb, var(--u-accent, #2e7d32) 8%, #ffffff);
    border-left: 4px solid var(--bord);
    border-radius: var(--rayon-petit);
    animation: paraitre 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .fiche-titre {
    margin: 0 0 var(--e2);
    font-size: var(--t-base);
    font-weight: 800;
    color: var(--u-texte, #1b5e20);
  }

  .fiche-texte {
    margin: 0;
    font-size: var(--t-petit);
    line-height: 1.6;
    color: var(--u-texte-doux, #4a6b4d);
  }

  .fermer {
    margin-top: var(--e3);
    padding: 0;
    background: none;
    border: 0;
    font: inherit;
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--u-accent, #2e7d32);
    cursor: pointer;
  }

  .fermer:focus-visible {
    outline: 2px solid var(--u-accent, #2e7d32);
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
