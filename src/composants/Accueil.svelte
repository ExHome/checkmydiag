<script lang="ts">
  /**
   * L'ACCUEIL — une arrivée, pas un tableau de bord.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * CE QU'ON VOIT EN TROIS SECONDES
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Une pièce claire, un bonjour, une adresse. Puis, posée dedans, UNE SEULE
   * PIÈCE SOMBRE rétroéclairée : la verrière. Son imposte est votre dossier vu
   * par la tranche — une lame de verre par page —, et ses carreaux sont les
   * diagnostics. La lumière vient de derrière et suit l'heure qu'il est.
   *
   * Le moment dont on se souvient : le grand chiffre n'est pas posé sur un fond
   * coloré, il est ÉCLAIRÉ PAR L'ARRIÈRE, juste sous les pages qu'il compte.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * POURQUOI CE N'EST PAS UNE SUITE DE CARTES
   * ═══════════════════════════════════════════════════════════════════════
   *
   * L'imposte et les carreaux ne sont pas deux blocs posés l'un sous l'autre :
   * c'est un seul objet, d'un seul tenant, dont les meneaux sont les vides de la
   * grille. Aucun carreau n'a de coin arrondi, aucun n'a d'ombre propre — un
   * carreau qui flotte est une carte. Le seul rayon de l'écran est celui de la
   * verrière entière.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * UNE SEULE HORLOGE
   * ═══════════════════════════════════════════════════════════════════════
   *
   * `TableLumineuse` et `Carreau` savent lire l'heure chacun de leur côté ; sur
   * cet écran ils ne le font pas. L'accueil tient l'horloge et la distribue. Sept
   * horloges indépendantes, c'est sept `setInterval`, et surtout le risque que
   * deux d'entre elles basculent à cinq minutes d'écart : la lumière de l'imposte
   * ne viendrait plus du même soleil que celle des carreaux.
   */
  import type { Analyse, TypeDiag } from '../lib/modele';
  import { compterLeDossier, origineDe, type Origine } from '../lib/bureau';
  import { libelleCourt } from '../lib/libelle';
  import { APPS } from '../lib/apps';
  import TableLumineuse from './lumiere/TableLumineuse.svelte';
  import Carreau from './lumiere/Carreau.svelte';
  import { heureDecimale, lumiereDe, teinteDe } from './lumiere/heure';
  import { retraitDe } from './lumiere/gravite';
  import {
    LINTEAU,
    coupeDuDossier,
    enTeteDuBien,
    laDemande,
    lectureDuLinteau,
    partDuDossier,
    salutation,
    traveesDe
  } from './accueil';

  interface Props {
    analyse: Analyse;
    /**
     * Ouvre le diagnostic. Le carré transmis est celui du CARREAU : l'écran naît
     * de la vitre qu'on vient de toucher, pas du milieu de l'écran.
     */
    surOuvrirDiagnostic?: (type: TypeDiag, origine?: Origine | null) => void;
    /** Va à l'une des vues du dossier. */
    surVue?: (cle: string) => void;
    /** Heure décimale figée. Sans elle, l'écran suit l'horloge de l'appareil. */
    heure?: number;
  }

  const { analyse, surOuvrirDiagnostic, surVue, heure }: Props = $props();

  let racine = $state<HTMLElement | null>(null);

  /* Cinq minutes : la lumière de fin d'après-midi bouge en une heure. Voir
     `TableLumineuse`, qui documente pourquoi ce n'est pas soixante fois par
     seconde. */
  let horloge = $state(heureDecimale(new Date()));
  $effect(() => {
    if (heure !== undefined) return;
    const minuterie = setInterval(() => {
      horloge = heureDecimale(new Date());
    }, 300_000);
    return () => clearInterval(minuterie);
  });
  const maintenant = $derived(heure ?? horloge);

  const compte = $derived(compterLeDossier(analyse.diagnostics));
  const demande = $derived(laDemande(compte));

  const l = $derived(lumiereDe(maintenant));
  const etat = $derived(retraitDe(demande.gravite, l.intensite));
  const teinte = $derived(teinteDe(l.temperature));

  const enTete = $derived(enTeteDuBien(analyse.bien, analyse.nature.nom));

  const nbPages = $derived(analyse.nbPages);
  const travees = $derived(traveesDe(analyse.diagnostics, nbPages));
  const coupe = $derived(coupeDuDossier(travees, nbPages));
  const verdicts = $derived(new Map(analyse.diagnostics.map((d) => [d.type, d.verdict] as const)));
  const lecture = $derived(lectureDuLinteau(travees, nbPages, verdicts));

  const nbDiag = $derived(analyse.diagnostics.length);

  /**
   * La description du dessin, pour qui ne le voit pas.
   *
   * Elle dit ce que la coupe montre et d'où viennent ses proportions. « Une
   * verrière décorative » n'apprendrait rien ; « une lame par page » se vérifie.
   */
  const titreDuPlateau = $derived(
    nbPages > 0
      ? `Votre dossier vu par la tranche : ${nbPages} pages, une lame de verre par page.`
      : 'Le nombre de pages du dossier n’a pas pu être lu : la coupe ne montre que le dormant, sans lame.'
  );

  /* De 1 à 9, en toutes lettres. L'écran ne porte que DEUX chiffres, et ce
     compte-là n'en est pas un : l'écrire en chiffres ferait un troisième
     nombre en concurrence avec les deux qui comptent. */
  const LETTRES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const enLettres = (n: number): string => LETTRES[n] ?? String(n);

  function ouvrir(type: TypeDiag): void {
    const carreau = racine?.querySelector<HTMLElement>(`[data-app="${type}"]`) ?? null;
    surOuvrirDiagnostic?.(type, origineDe(carreau));
  }
</script>

{#snippet coupeDuDocument()}
  <!-- LE DESSIN N'EST JAMAIS PEINT : il vit dans le masque, en `currentColor`,
       où il ARRÊTE la lumière. Un montant n'est pas une barre grise, c'est un
       endroit du dossier que la source ne traverse pas. -->
  <path d={coupe.montants} fill="currentColor" />
  <path d={coupe.meneaux} fill="currentColor" />
  <path
    d={coupe.cadre}
    fill="none"
    stroke="currentColor"
    stroke-width={LINTEAU.traverse}
    stroke-linejoin="miter"
  />
  <path d={coupe.petitBois} fill="none" stroke="currentColor" stroke-width={LINTEAU.petitBois} />
{/snippet}

<div
  class="accueil"
  bind:this={racine}
  style:--acc-sol={etat.sol}
  style:--acc-teinte={teinte}
  style:--acc-douce={etat.encreDouce}
  style:--acc-azimut={l.azimut.toFixed(3)}
  style:--acc-seuil="{((LINTEAU.bas / LINTEAU.hauteur) * 100).toFixed(3)}%"
  style:--acc-ratio="100 / {LINTEAU.hauteur}"
>
  <header class="marque">
    <img class="marque__prisme" src="./logo/prisme.svg" alt="" width="24" height="27" />
    <span class="marque__filet" aria-hidden="true"></span>
    <span class="marque__nom">Verrière</span>
  </header>

  <p class="nature">{analyse.nature.nom}</p>

  <h1 class="salut">{salutation(maintenant)}. Voici votre bien.</h1>

  <p class="adresse">{enTete.titre}</p>
  {#if enTete.details.length > 0}
    <p class="details">{enTete.details.join(' · ')}</p>
  {/if}

  <!-- ══ LA VERRIÈRE ══ un seul objet : l'imposte, puis ses carreaux. ══ -->
  <section class="verriere" aria-label="Votre dossier">
    <div class="linteau">
      <!-- Le premier plan vient AVANT la table dans le document : à la lecture
           d'écran, on entend le chiffre puis la description du dessin, pas
           l'inverse. Il est posé dessus par `position: absolute`. -->
      <div class="avant">
        <div class="avant__voile" aria-hidden="true"></div>
        <div class="avant__marques" aria-hidden="true">
          {#each lecture.marques as m, i (i)}
            <span
              class="marque-seuil"
              class:marque-seuil--raies={m.genre === 'nonControle'}
              style:left="{m.gauche}%"
              style:width="{m.largeur}%"
            ></span>
          {/each}
        </div>

        <div class="chiffres">
          {#if demande.chiffre > 0}
            <!-- UN FAIT NE S'ANIME JAMAIS : ce chiffre est écrit, jamais
                 déroulé. Un compteur qui monte de 0 à 2 affiche 1 en chemin —
                 une valeur que le rapport n'a jamais écrite. -->
            <p class="chiffres__grand">{demande.chiffre}</p>
          {/if}
          <div class="chiffres__dire">
            <p class="chiffres__phrase" class:chiffres__phrase--seule={demande.chiffre === 0}>
              {demande.phrase}
            </p>
            {#if demande.chiffre === 0}
              <p class="chiffres__garde">
                Chacun dit ce qu’il a cherché, et où : c’est écrit sur son carreau.
              </p>
            {/if}
            <p class="chiffres__second">
              {nbDiag} diagnostic{nbDiag > 1 ? 's' : ''} lu{nbDiag > 1 ? 's' : ''}
              {#if nbPages > 0}<span class="chiffres__sep">·</span>{nbPages} pages{/if}
            </p>
          </div>
        </div>
      </div>

      <TableLumineuse
        calque={coupeDuDocument}
        occlusions={lecture.occlusions}
        hauteur={LINTEAU.hauteur}
        titre={titreDuPlateau}
        gravite={demande.gravite}
        heure={maintenant}
      />
    </div>

    {#if nbDiag > 0}
      <ul class="panneaux">
        {#each analyse.diagnostics as d (d.type)}
          <li class="panneau" data-app={d.type} style:--pan-part={partDuDossier(d, nbPages)}>
            <Carreau
              titre={APPS[d.type].nom}
              gravite={d.gravite}
              heure={maintenant}
              onactiver={() => ouvrir(d.type)}
            >
              {#snippet enfants()}
                <span class="panneau__verdict">{libelleCourt(d)}</span>
                <span
                  class="panneau__gravure"
                  aria-hidden="true"
                  style:--pan-picto="url(./pictos/{APPS[d.type].picto ?? 'diagnostics'}.svg)"
                ></span>
                {#if nbPages > 0}
                  <span class="panneau__part" aria-hidden="true"></span>
                {/if}
              {/snippet}
            </Carreau>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if nbPages > 0}
    <!-- CE QUE LE DESSIN NE DOIT PAS LAISSER CROIRE.
         Une bande pleine dans la coupe est une bande où la lumière s'arrête, et
         rien ne distingue à l'œil « le rapport relève quelque chose » de « ces
         pages n'appartiennent à aucun diagnostic ». La phrase est donc
         obligatoire, et elle est ici plutôt que dans la légende du plateau :
         c'est du texte d'explication, il appartient à la pièce claire. -->
    <p class="coupe-dire">
      Les parties pleines de la coupe sont les pages qui n’appartiennent à aucun diagnostic —
      page de garde, attestations, annexes.
    </p>
  {/if}

  {#if !analyse.nature.pourLaVente && analyse.nature.reserve}
    <p class="reserve">{analyse.nature.reserve}</p>
  {/if}

  {#if analyse.controles.length > 0}
    <button type="button" class="dossier" onclick={() => surVue?.('alertes')}>
      <span class="dossier__dire">
        <strong
          >{analyse.controles.length === 1
            ? 'Un point porte'
            : `${enLettres(analyse.controles.length)} points portent`} sur le dossier lui-même.</strong
        >
        <span class="dossier__exemple">{analyse.controles[0]?.titre ?? ''}</span>
      </span>
      <span class="dossier__aller" aria-hidden="true">→</span>
    </button>
  {/if}

  <p class="pied">
    {#if analyse.bien.dateRepérage}Repérage du {analyse.bien.dateRepérage}. {/if}Rien de ce dossier
    n’a quitté votre téléphone.
  </p>
</div>

<style>
  /*
   * ── LES PROPORTIONS DE LA MARQUE ────────────────────────────────────────
   *
   * La publicité mesurée donne 58 % de lumière et 21 % de verts profonds. Le
   * territoire n'est pas sombre : il est LUMINEUX, AVEC DES ZONES PROFONDES.
   * L'écran suit — l'ivoire tient le haut et le bas, la verrière est la seule
   * zone sombre, et elle est percée de carreaux allumés.
   */
  .accueil {
    /*
     * LA MÊME LUMIÈRE SUR LES DEUX MATIÈRES.
     *
     * La pièce et la verrière sont éclairées par la même source : le lavage de
     * la page entre du côté que dit l'azimut, comme la lampe du plateau. C'est
     * ce qui empêche l'imposte d'avoir l'air d'une image collée sur un fond.
     *
     * 10 % au plus. Mesuré : la teinte la plus dense (#d98a3f, l'aube) posée à
     * 10 % sur l'ivoire donne #f4efe5, où l'encre #0a2b23 tient 13,17 et l'encre
     * douce #4a5a55 tient 6,31.
     */
    background:
      radial-gradient(
        140% 62% at calc(50% + var(--acc-azimut) * 38%) -8%,
        color-mix(in srgb, var(--acc-teinte) 10%, transparent) 0%,
        transparent 64%
      ),
      var(--verriere-ivoire);
    color: var(--verriere-encre);
    padding: var(--e5) var(--e4) var(--e7);
    font-family: var(--police);
    /* Mobile d'abord, et le desktop n'est qu'une colonne centrée : cet écran
       n'a rien à étaler. */
    max-width: 34rem;
    margin-inline: auto;
  }

  /* ── LE BLOC DE MARQUE ─────────────────────────────────────────────────── */

  .marque {
    display: flex;
    align-items: center;
    gap: var(--e3);
    /* 44 px de haut : c'est aussi la cible tactile minimale, au cas où il
       deviendrait un retour à l'accueil. */
    min-height: 44px;
  }

  .marque__prisme {
    display: block;
    width: 24px;
    height: 27px;
  }

  /* Le filet vertical du pack : c'est lui qui donne au prisme son échelle. */
  .marque__filet {
    width: 1px;
    height: 22px;
    background: var(--verriere-sable-filet);
  }

  .marque__nom {
    font-size: var(--t-base);
    font-weight: 600;
    letter-spacing: var(--suivi-serre);
  }

  /* ── L'IDENTITÉ DU DOSSIER ─────────────────────────────────────────────── */

  .nature {
    margin: var(--e6) 0 0;
    font-size: var(--t-micro);
    font-weight: 600;
    letter-spacing: var(--suivi);
    /* Le sable NE PEUT PAS écrire sur l'ivoire : #c8a96b y vaut 2,08. C'est
       #896c33, le sable-encre, fait pour ce seul cas — 4,56 mesuré. */
    color: var(--verriere-sable-encre);
  }

  .salut {
    margin: var(--e2) 0 0;
    /* 8vw : 31,2 px sur 390. La quinte de la charte s'arrête à 2 rem, ce qui
       est une taille de section, pas une taille d'accueil. */
    font-size: clamp(1.75rem, 8vw, 2.5rem);
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.015em;
  }

  .adresse {
    margin: var(--e5) 0 0;
    font-size: var(--t-titre);
    font-weight: 600;
    line-height: 1.25;
  }

  .details {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    color: var(--encre-doux);
  }

  /* ══ LA VERRIÈRE ═══════════════════════════════════════════════════════════
   *
   * Un seul objet. Le rayon est posé ICI et nulle part ailleurs : les carreaux
   * sont carrés, comme des vitres serties, et c'est la verrière entière qui est
   * arrondie. Une grille de rectangles arrondis est une grille de cartes.
   */
  .verriere {
    position: relative;
    margin: var(--e6) 0 0;
    border-radius: var(--rayon-large);
    overflow: hidden;
    background: var(--acc-sol);
    /*
     * L'ombre de l'objet sur la pièce suit l'heure — même azimut, même longueur
     * que celles des carreaux. Aucune transition : `box-shadow` lit des jetons
     * qui changent, et une propriété transitionnée qui lit un jeton se fige sur
     * sa valeur de premier rendu (voir la règle dans `app.css`).
     */
    box-shadow: 0 calc(2px + var(--e1)) var(--e5) rgb(10 43 35 / 14%);
  }

  .linteau {
    position: relative;
  }

  /*
   * `aspect-ratio` est posé en ligne sur la figure de `TableLumineuse`, avec
   * `overflow: hidden` : la hauteur de la figure est alors celle du seul
   * plateau, et sa légende — le titre du dessin, la clé des textures, et le
   * relevé mot pour mot de ce que chaque occlusion signale — DÉBORDE ET EST
   * ROGNÉE. Elle reste dans l'arbre d'accessibilité : annoncée, invisible.
   *
   * On la rend. `!important` est nécessaire — un style en ligne ne se bat pas
   * autrement — et il est borné à cet écran. Le rapport de forme du dessin ne
   * s'y perd pas : le `<svg>` a son `viewBox` et `height: auto`, il calcule sa
   * hauteur tout seul. C'est un défaut à corriger dans `TableLumineuse`, où
   * `aspect-ratio` a sa place sur `.table__plateau` et non sur `.table`.
   */
  .verriere .linteau :global(.table) {
    aspect-ratio: auto !important;
    /* Le bas de l'imposte n'est pas un bord : la grille commence juste après. */
    border-radius: var(--rayon-large) var(--rayon-large) 0 0;
  }

  /* ── LE PREMIER PLAN DE L'IMPOSTE ──────────────────────────────────────── */

  .avant {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    /* Exactement le plateau, jamais la légende. Le rapport vient du composant,
       donc de `LINTEAU.hauteur` : une valeur écrite en dur ici se décalerait au
       premier changement de géométrie, et les marques du seuil tomberaient à
       côté de la travée qu'elles doublent. */
    aspect-ratio: var(--acc-ratio);
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: var(--e5);
    pointer-events: none;
  }

  /*
   * LE VOILE — la borne B1 de `gravite.ts`, appliquée à la lettre.
   *
   * La lampe monte à 0,34 sur le plateau ; sous une bande de texte elle ne doit
   * pas dépasser 0,12. Le voile est fait du SOL LUI-MÊME, donc il suit le
   * retrait de gravité au lieu d'être un noir posé dessus :
   *
   *   0,34 × (1 − 0,66) = 0,1156 ≤ 0,12   ✓
   *
   * Mesuré sur les seize scènes : l'encre principale tient 9,95 au pire (bon,
   * midi) et l'encre douce 6,05.
   */
  .avant__voile {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--acc-sol) 66%, transparent) 0%,
      transparent 46%
    );
  }

  /*
   * LES MARQUES DU SEUIL — la redondance mesurée.
   *
   * Une occlusion est une différence de MATIÈRE, et sa différence de luminance
   * est faible par construction : au moment doré, sur un plateau `bon`, le verre
   * plein vaut #424c34 contre un sol à #0a2b23, soit 1,67:1. C'est la
   * conséquence directe du plafond de lampe à 0,34, qui existe pour ne pas
   * entrer dans la bande morte.
   *
   * On ne laisse donc jamais l'occlusion porter seule l'information. Ce trait
   * est PEINT, au premier plan, en sable clair : 7,36:1 au pire cas mesuré sur
   * les seize scènes. Et il ne distingue pas les deux genres par la couleur mais
   * par la TEXTURE — plein contre pointillé —, ce qui survit au daltonisme, au
   * noir et blanc et à l'impression.
   */
  .avant__marques {
    position: absolute;
    left: 0;
    right: 0;
    top: var(--acc-seuil);
    height: 2px;
  }

  .marque-seuil {
    position: absolute;
    top: 0;
    height: 2px;
    background: var(--verriere-sable-clair);
  }

  .marque-seuil--raies {
    /* Le même pas que la hachure du masque : 1,5 sur 4. Ce n'est pas un motif
       décoratif, c'est la citation d'une valeur qui porte un sens. */
    background: repeating-linear-gradient(
      to right,
      var(--verriere-sable-clair) 0 1.5px,
      transparent 1.5px 4px
    );
  }

  /* ── LES DEUX CHIFFRES ─────────────────────────────────────────────────── */

  .chiffres {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: end;
    gap: var(--e4);
    pointer-events: auto;
    color: var(--verriere-ivoire);
  }

  .chiffres__grand {
    margin: 0;
    /* 16vw : 62 px sur 390. Le chiffre vaut 0, 1, 2 ou 3 — mesuré sur
       quatre-vingt-dix dossiers —, donc un seul glyphe, jamais deux. */
    font-size: clamp(3rem, 16vw, 4.5rem);
    font-weight: 300;
    line-height: 0.8;
    letter-spacing: -0.04em;
    font-variant-numeric: lining-nums tabular-nums;
    /* L'encre principale n'est modulée par rien : ni par l'heure, ni par la
       gravité. C'est la seule protection qui ne dépend d'aucun calcul. */
    color: var(--verriere-ivoire);
  }

  .chiffres__dire {
    min-width: 0;
  }

  .chiffres__phrase {
    margin: 0;
    font-size: var(--t-petit);
    font-weight: 600;
    line-height: 1.35;
  }

  /*
   * QUAND LE GRAND CHIFFRE VAUT ZÉRO, IL N'Y A PAS DE ZÉRO.
   *
   * Un « 0 » en soixante-deux pixels se lit comme une note, et une note dit
   * « rien à signaler ». Or un rapport qui n'a rien relevé n'établit pas une
   * absence : il dit ce qu'il a cherché, et où. La phrase prend donc la place du
   * chiffre — c'est l'écran le plus lumineux du produit, puisque `bon` ne retire
   * aucune lumière, et c'est celui qu'on voit le plus souvent.
   */
  .chiffres__phrase--seule {
    font-size: var(--t-lead);
    font-weight: 400;
    line-height: 1.3;
  }

  .chiffres__garde,
  .chiffres__second {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    line-height: 1.4;
    /* L'encre douce MONTE quand la lumière baisse — voir la borne B3 de
       `gravite.ts`. Une interface qui « se calme » en baissant tout fait
       disparaître son texte secondaire ; celle-ci le compense. */
    color: rgb(250 249 248 / calc(var(--acc-douce) * 100%));
  }

  .chiffres__sep {
    margin: 0 0.4em;
    color: var(--verriere-sable-or);
  }

  /* ── LES CARREAUX ──────────────────────────────────────────────────────── */

  /*
   * LES MENEAUX SONT LES VIDES DE LA GRILLE.
   *
   * Un `gap` de 1 px sur un fond sable : la structure métallique de la verrière
   * n'est pas dessinée, c'est ce qui reste entre les vitres. Mesuré : #c8a96b
   * contre la face d'un carreau ne descend jamais sous 4,79 — bien au-delà des
   * 3:1 d'un élément graphique.
   */
  .panneaux {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    margin: 1px 0 0;
    padding: 0;
    list-style: none;
    background: var(--verriere-sable-or);
  }

  .panneau {
    position: relative;
    display: flex;
    min-height: 104px;
  }

  /* Le carreau remplit sa vitre, sans coin arrondi et sans ombre propre : ce
     n'est pas une carte posée, c'est un verre serti. Trois niveaux de sélecteur
     pour passer devant la feuille du composant sans `!important`. */
  .panneaux .panneau :global(.carreau) {
    flex: 1;
    border-radius: 0;
    padding: var(--e4);
  }

  .panneau__verdict {
    display: block;
    margin-top: var(--e1);
    font-size: var(--t-petit);
    line-height: 1.3;
    color: rgb(250 249 248 / calc(var(--acc-douce) * 100%));
  }

  /*
   * LA GRAVURE — le pictogramme dans la matière, pas une icône sur un fond.
   *
   * Pas de pastille, pas de dégradé, pas de couleur propre : le signe est
   * découpé dans l'encre de la vitre, à 12 %, débordant du coin. C'est ce que
   * l'ordre de mission demande pour le bois des termites — « pictogramme gravé
   * dans la matière » —, appliqué à toutes les mini-applications. Les huit
   * matières, elles, sont le deuxième livrable : on ne les invente pas ici.
   *
   * Décoratif et redondant avec le nom écrit juste au-dessus : `aria-hidden`, et
   * aucun seuil de contraste ne s'y applique.
   */
  .panneau__gravure {
    position: absolute;
    right: -8px;
    bottom: -10px;
    width: 76px;
    height: 76px;
    background: var(--verriere-ivoire);
    opacity: 0.12;
    mask-image: var(--pan-picto);
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
    -webkit-mask-image: var(--pan-picto);
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: contain;
    pointer-events: none;
  }

  /*
   * LA PART DU DOSSIER — le carreau et sa travée, deux vues d'une même donnée.
   *
   * La longueur du filet est `Diagnostic.pages` rapporté à `nbPages`, exactement
   * comme la largeur de la travée dans la coupe au-dessus. Rien n'est jugé : un
   * diagnostic épais n'est pas un diagnostic grave.
   */
  .panneau__part {
    position: absolute;
    left: var(--e4);
    bottom: var(--e3);
    height: 2px;
    width: calc(var(--pan-part) * (100% - 2 * var(--e4)));
    min-width: 10px;
    background: var(--verriere-sable-or);
  }

  /*
   * LA RÉVÉLATION — la lumière se concentre sur la vitre qu'on touche.
   *
   * Un voile du sol lui-même monte sur la verrière entière ; le carreau touché
   * passe au-dessus. On ne fait donc PAS varier six éléments à la fois : c'est
   * un seul pseudo-élément qui s'anime, sur une seule propriété de composition.
   *
   * `:has` et rien d'autre — aucun état à mémoriser, aucune minuterie, et donc
   * aucun écran qui resterait éteint si la navigation n'a pas lieu. L'ouverture,
   * elle, part au même instant : le voile continue sous l'écran qui arrive.
   *
   * Mesuré : sous ce voile, l'encre des carreaux voisins tient encore 11,68 au
   * pire cas des seize scènes.
   */
  .verriere::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 3;
    background: var(--acc-sol);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--t-lumiere) var(--verre);
  }

  /* `:active` remonte aux ancêtres pendant l'appui — c'est ce qui permet de
     n'écrire aucun état en JavaScript. `:has(:focus-visible)` et non
     `:focus-within` : au clavier le voile doit monter, au clic il ne doit pas
     rester allumé après le relâchement, et le focus, lui, reste. */
  .verriere:has(.panneau:active)::after,
  .verriere:has(.panneau :focus-visible)::after {
    opacity: 0.6;
  }

  .panneau:active,
  .panneau:has(:focus-visible) {
    z-index: 4;
  }

  /* ── SOUS LA VERRIÈRE ──────────────────────────────────────────────────── */

  /*
   * LA RÉSERVE DE NATURE — la ligne qui évite le pire malentendu.
   *
   * Sept repérages avant travaux sur sept étaient restitués comme un diagnostic
   * amiante de vente. Un repérage avant travaux relève du code du travail : il
   * protège les ouvriers d'un chantier, il ne dit rien de ce qu'on vend. Rare —
   * un dossier sur quatre-vingt-dix — et décisif.
   */
  .coupe-dire {
    margin: var(--e3) 0 0;
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--encre-doux);
  }

  .reserve {
    margin: var(--e5) 0 0;
    padding-left: var(--e3);
    border-left: 2px solid var(--verriere-sable-filet);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--verriere-sable-encre);
  }

  .dossier {
    display: flex;
    align-items: center;
    gap: var(--e3);
    width: 100%;
    min-height: 44px;
    margin: var(--e5) 0 0;
    padding: var(--e4) 0;
    border: 0;
    border-top: 1px solid var(--verriere-sable-filet);
    border-bottom: 1px solid var(--verriere-sable-filet);
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .dossier__dire {
    flex: 1;
    min-width: 0;
    font-size: var(--t-petit);
    line-height: 1.4;
  }

  .dossier__exemple {
    display: block;
    color: var(--encre-doux);
  }

  .dossier__aller {
    color: var(--verriere-sable-encre);
  }

  .dossier:focus-visible {
    outline: 2px solid var(--verriere-vert);
    outline-offset: 2px;
  }

  .pied {
    margin: var(--e5) 0 0;
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--encre-doux);
  }

  /*
   * ── MODE SOBRE ET MOUVEMENT RÉDUIT ────────────────────────────────────────
   *
   * `TableLumineuse` et `Carreau` traitent déjà leur propre dépense. Il ne reste
   * ici qu'un voile, et c'est le seul mouvement de l'écran : on le coupe net.
   */
  :global(html[data-rendu='sobre']) .verriere::after {
    transition: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .verriere::after {
      transition: opacity 120ms linear;
    }
  }

  @media print {
    .accueil {
      background: #fff;
    }
    .verriere {
      box-shadow: none;
    }
    .verriere::after {
      display: none;
    }
  }
</style>
