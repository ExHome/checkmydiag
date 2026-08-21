<script lang="ts" module>
  /* L'empreinte du code, injectée au build. Jamais le code lui-même. */
  export const EMPREINTE: string = import.meta.env['VITE_ATELIER_EMPREINTE'] ?? '';

  /** SHA-256 hexadécimal, via l'API du navigateur — aucune dépendance. */
  export async function empreinteDe(texte: string): Promise<string> {
    const octets = new TextEncoder().encode(texte);
    const brut = await crypto.subtle.digest('SHA-256', octets);
    return [...new Uint8Array(brut)].map((o) => o.toString(16).padStart(2, '0')).join('');
  }
</script>

<!--
  L'ARRIVÉE — le premier écran de Verrière, d'après la publicité de marque.

  Ce n'est pas un tableau de bord : c'est une entrée. Le logo, une phrase, le
  bien, deux chiffres, et les diagnostics. Rien d'autre.

  LES PROPORTIONS VIENNENT D'UNE MESURE, pas d'un goût. Histogramme sur 393 216
  pixels de `Verriere_Publicite_A4.pdf` (voir docs/PALETTE-MESUREE.md) :

      ivoire #faf9f8              53,6 %
      ivoires mats                 4,6 %
      vert profond #011915        14,6 %
      verts quasi noirs            6,0 %

  Soit 58 % de lumière et 21 % de verts. Le territoire est donc LUMINEUX AVEC
  UNE ZONE PROFONDE — et cette zone, c'est le widget du bien. Un seul aplat
  vert sur tout l'écran ; le reste respire.

  Deux pièges appris à nos dépens, le 20/08 :

    · un vert « chaleureux » par la TEINTE donne du kaki. Le vert de la marque
      est franchement bleu (168°) et la chaleur vient de ce qu'on POSE dessus —
      l'or, le sable, le terracotta. La chaleur ne se mélange pas dans le vert ;

    · le doré ne peut pas écrire sur l'ivoire (2,08:1). Il brille sur le vert
      (4,76 et 6,76). C'est sa place, pas une limite.
-->
<script lang="ts">
  import type { Analyse } from '../lib/modele';

  let {
    analyse = null,
    surDiagnostic,
    surZoneDeTravail
  }: {
    analyse?: Analyse | null;
    surDiagnostic?: (type: string) => void;
    surZoneDeTravail?: () => void;
  } = $props();

  /* Les deux seuls chiffres du premier écran. Ils viennent du dossier, jamais
     d'un exemple : sans dossier, ils ne s'affichent pas. */
  const combien = $derived(analyse?.diagnostics?.length ?? 0);
  const aSurveiller = $derived(
    analyse?.diagnostics?.filter((d) => d.gravite === 'alerte' || d.gravite === 'attention')
      .length ?? 0
  );

  const bien = $derived(analyse?.bien ?? null);

  /* Les huit matières. La lumière tombe à 150° sur toutes — c'est elle qui en
     fait une famille, pas leur teinte. */
  const APPS = [
    { type: 'dpe', nom: 'DPE', matiere: 'verre' },
    { type: 'electricite', nom: 'Électricité', matiere: 'laiton' },
    { type: 'gaz', nom: 'Gaz', matiere: 'laiton' },
    { type: 'amiante', nom: 'Amiante', matiere: 'pierre' },
    { type: 'plomb', nom: 'Plomb', matiere: 'terre' },
    { type: 'termites', nom: 'Termites', matiere: 'bois' },
    { type: 'erp', nom: 'ERP', matiere: 'pierre' },
    { type: 'carrez', nom: 'Mesurage', matiere: 'verre' }
  ] as const;

  function gravite(type: string): string {
    const d = analyse?.diagnostics?.find((x) => x.type === type);
    return d?.gravite ?? '';
  }
  function present(type: string): boolean {
    return !!analyse?.diagnostics?.some((x) => x.type === type);
  }

  /* L'ACCÈS À LA ZONE DE TRAVAIL.
     Le code n'est jamais comparé en clair : on compare son empreinte à celle
     que le build a reçue. Ça n'en fait pas une sécurité — sur un site statique
     rien n'en est une — mais ça évite au moins que le code se lise dans le
     source. */
  let ouvert = $state(false);
  let saisi = $state('');
  let refus = $state(false);

  async function verifier() {
    refus = false;
    if ((await empreinteDe(saisi)) === EMPREINTE) {
      saisi = '';
      surZoneDeTravail?.();
    } else {
      refus = true;
    }
  }
</script>

<div class="arrivee">
  <div class="barre">
    <img class="logo" src="./logo/prisme.svg" alt="" />
    <p class="nom">Verrière</p>
  </div>

  <!--
    LE WIDGET DU BIEN.

    Il ne touche pas les bords : c'est un objet posé sur l'ivoire. Quand aucune
    photo n'existe — et c'est le cas normal —, il montre une VERRIÈRE allumée à
    la tombée du jour. Un état vide qui ne dit pas « il manque quelque chose »,
    mais qui dit le nom de la marque.
  -->
  <section class="bien" aria-label="Votre bien">
    <svg class="edicule" viewBox="0 0 320 198" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="arr-vitre" x1=".25" y1="0" x2=".75" y2="1">
          <stop offset="0" stop-color="#ffeec4" stop-opacity=".88" />
          <stop offset=".55" stop-color="#f2c882" stop-opacity=".72" />
          <stop offset="1" stop-color="#c98f45" stop-opacity=".5" />
        </linearGradient>
        <radialGradient id="arr-halo" cx=".5" cy=".62">
          <stop offset="0" stop-color="#ffe9bd" stop-opacity=".6" />
          <stop offset="1" stop-color="#ffe9bd" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="196" cy="132" rx="150" ry="104" fill="url(#arr-halo)" />
      <g fill="#0d3529" opacity=".8">
        <ellipse cx="34" cy="120" rx="56" ry="44" />
        <ellipse cx="292" cy="108" rx="48" ry="40" />
      </g>
      <path d="M118 186 V96 L196 52 L274 96 V186 Z" fill="url(#arr-vitre)" />
      <path d="M118 186 V128 L92 142 V186 Z" fill="url(#arr-vitre)" opacity=".8" />
      <g stroke="#0a1f18" fill="none" stroke-width="2.6" stroke-linejoin="round">
        <path d="M118 186 V96 L196 52 L274 96 V186" />
        <path d="M196 52 V186" stroke-width="2" />
        <path d="M118 96 H274" />
        <path d="M118 132 H274" stroke-width="1.8" opacity=".8" />
        <path d="M144 81 V186 M170 66 V186 M222 66 V186 M248 81 V186" stroke-width="1.7" opacity=".76" />
        <path d="M118 186 V128 L92 142 V186 Z" stroke-width="2.2" />
      </g>
      <g stroke="#c99a52" stroke-width="2" fill="none" stroke-linecap="round">
        <path d="M196 52 V38" /><path d="M189 44 H203" />
      </g>
      <path d="M180 186 V140 H212 V186 Z" fill="#fff3d8" opacity=".82" />
      <path d="M180 186 V140 H212 V186" stroke="#0a1f18" stroke-width="2.2" fill="none" />
      <g fill="#0a2b21" opacity=".92">
        <path d="M132 186 q4-34 18-46 q-4 30-8 46 Z" />
        <path d="M258 186 q-6-30-20-42 q6 26 10 42 Z" />
      </g>
      <path d="M0 186 H320 V198 H0 Z" fill="#0b2c22" />
      <path d="M180 186 L212 186 L244 198 L148 198 Z" fill="#ffe9bd" opacity=".26" />
      <path d="M-6 198 q30-52 24-92 q32 44 26 92 Z" fill="#08251d" />
    </svg>
    <div class="voile"></div>

    <h1 class="salut">Bonjour,<br /><em>voici votre bien.</em></h1>
    {#if bien?.adresse || bien?.commune}
      <p class="adresse">
        {bien?.adresse ?? ''}{#if bien?.adresse && bien?.commune}&nbsp;· {/if}{bien?.commune ?? ''}
      </p>
    {/if}
  </section>

  {#if combien > 0}
    <div class="chiffres">
      <p class="c">
        <b>{combien}</b><i>diagnostic{combien > 1 ? 's' : ''} analysé{combien > 1 ? 's' : ''}</i>
      </p>
      {#if aSurveiller > 0}
        <p class="c alerte">
          <b>{aSurveiller}</b><i>point{aSurveiller > 1 ? 's' : ''} à surveiller</i>
        </p>
      {/if}
    </div>
  {/if}

  <div class="filet"></div>
  <p class="rubrique">Vos diagnostics</p>

  <ul class="grille">
    {#each APPS as app}
      <li>
        <button
          type="button"
          class="app {app.matiere}"
          disabled={!present(app.type)}
          aria-label={app.nom}
          onclick={() => surDiagnostic?.(app.type)}
        >
          <span class="grain" aria-hidden="true"></span>
          {#if gravite(app.type) === 'alerte' || gravite(app.type) === 'attention'}
            <span class="pastille" aria-hidden="true"></span>
          {/if}
          <span class="sigle">{app.nom.slice(0, 2)}</span>
        </button>
        <span class="etiquette">{app.nom}</span>
      </li>
    {/each}
  </ul>

  <!--
    L'ENCART « ZONE DE TRAVAIL ».

    Discret par construction : c'est un outil de production, pas une
    fonctionnalité du produit. Il ne s'annonce pas, il attend.

    CE QUE LE CODE PROTÈGE, ET CE QU'IL NE PROTÈGE PAS — à dire clairement :
    le site est STATIQUE et le dépôt est PUBLIC. Un code comparé côté client
    n'est donc pas une sécurité : quelqu'un qui lit le source le contourne. Il
    écarte les curieux, il n'arrête personne.

    C'est acceptable pour UNE seule raison : la zone de travail ne stocke rien
    sur un serveur et n'envoie rien. Le code protège l'accès à l'OUTIL, jamais
    des DONNÉES — puisqu'il n'y en a nulle part.

    Le code lui-même n'est PAS dans ce fichier, et ne doit jamais l'être. Il est
    comparé à une empreinte SHA-256 fournie au build par
    `VITE_ATELIER_EMPREINTE`. Sans cette variable, l'encart ne s'affiche pas.
  -->
  {#if EMPREINTE}
    <section class="atelier">
      <button type="button" class="entree" onclick={() => (ouvert = !ouvert)} aria-expanded={ouvert}>
        Atelier de travail
      </button>

      {#if ouvert}
        <form
          onsubmit={(e) => {
            e.preventDefault();
            verifier();
          }}
        >
          <label for="code-atelier">Code d’accès</label>
          <input
            id="code-atelier"
            type="password"
            autocomplete="off"
            bind:value={saisi}
            aria-describedby={refus ? 'refus-atelier' : undefined}
          />
          <button type="submit">Entrer</button>
          {#if refus}
            <p id="refus-atelier" class="refus" role="alert">Code non reconnu.</p>
          {/if}
        </form>
      {/if}
    </section>
  {/if}
</div>

<style>
  .arrivee {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    background: var(--verriere-ivoire, #faf9f8);
    color: var(--verriere-encre, #0c1a15);
    --marge: clamp(1.3rem, 5vw, 2rem);
  }

  .barre {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: clamp(1rem, 4vw, 1.4rem) var(--marge) 0;
  }
  .logo {
    width: 1.45rem;
    height: 1.45rem;
  }
  .nom {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.44em;
    text-indent: 0.44em; /* rattrape l'espace fantôme de la dernière lettre */
    text-transform: uppercase;
    color: var(--verriere-vert, #12463b);
  }

  /* ── LE WIDGET DU BIEN : la seule zone profonde ── */
  .bien {
    position: relative;
    isolation: isolate;
    margin: clamp(0.9rem, 3.6vw, 1.2rem) var(--marge) 0;
    padding: clamp(1.2rem, 4.8vw, 1.7rem);
    aspect-ratio: 1.62;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border-radius: clamp(16px, 4.4vw, 22px);
    overflow: hidden;
    background: linear-gradient(168deg, #16523f, #12463b 50%, #0c3329);
    color: var(--verriere-champagne, #f6ead8);
    box-shadow:
      0 1px 2px rgb(12 26 21 / 8%),
      0 10px 26px -14px rgb(12 26 21 / 42%),
      inset 0 0 0 0.5px rgb(232 201 143 / 22%);
  }
  .edicule {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
  }
  /* Le voile n'est pas décoratif : il garantit la lisibilité du texte
     quelle que soit l'image posée dessous. */
  .voile {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
      to top,
      rgb(5 26 20 / 90%) 0%,
      rgb(5 26 20 / 66%) 38%,
      rgb(5 26 20 / 14%) 72%,
      transparent 100%
    );
  }
  .salut,
  .adresse {
    position: relative;
    z-index: 3;
  }
  .salut {
    margin: 0;
    font-family: var(--titre, 'Iowan Old Style', Palatino, Georgia, serif);
    font-weight: 400;
    font-size: clamp(1.35rem, 5.4vw, 1.75rem);
    line-height: 1.16;
    letter-spacing: -0.015em;
    color: #fff;
  }
  .salut em {
    font-style: italic;
    color: var(--verriere-sable-clair, #e8d6b9);
  }
  .adresse {
    margin: 0.4rem 0 0;
    font-size: 0.74rem;
    color: rgb(232 214 185 / 82%);
  }

  /* ── LES DEUX CHIFFRES ── */
  .chiffres {
    display: flex;
    gap: clamp(1.2rem, 5vw, 2rem);
    padding: clamp(1.3rem, 5vw, 1.8rem) var(--marge) 0;
  }
  .c {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0;
  }
  .c b {
    font-family: var(--titre, 'Iowan Old Style', Palatino, serif);
    font-weight: 400;
    font-size: clamp(2.5rem, 10.5vw, 3.25rem);
    line-height: 0.8;
    font-variant-numeric: tabular-nums lining-nums;
    letter-spacing: -0.02em;
    color: var(--verriere-vert, #12463b);
  }
  .c.alerte b {
    color: var(--verriere-terre, #a75f42);
  }
  .c i {
    font-style: normal;
    font-size: 0.67rem;
    line-height: 1.3;
    max-width: 6.8em;
    color: var(--verriere-encre-douce, #5b6b63);
  }

  .filet {
    height: 1px;
    margin: clamp(1.2rem, 5vw, 1.7rem) var(--marge) 0;
    background: linear-gradient(90deg, var(--verriere-sable, #d8c5a9), rgb(216 197 169 / 22%) 58%, transparent);
  }
  .rubrique {
    margin: clamp(1.2rem, 4.6vw, 1.6rem) var(--marge) 0.85rem;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--verriere-sable-encre, #896c33);
  }

  /* ── LES HUIT MATIÈRES ──
     Une base en dégradé, une trame propre à chacune, et la MÊME lumière à
     150° sur les huit. Retirez cette lumière commune : il ne reste que huit
     carrés colorés. */
  .grille {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(0.5rem, 2.4vw, 0.75rem);
    margin: 0;
    padding: 0 var(--marge);
  }
  .grille li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }
  .app {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border: 0;
    border-radius: 23.7%; /* le rayon d'iOS, pas un arrondi arbitraire */
    display: grid;
    place-items: center;
    cursor: pointer;
    overflow: hidden;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 70%),
      inset 0 0 0 0.5px rgb(12 26 21 / 8%),
      0 1px 1px rgb(12 26 21 / 5%),
      0 3px 6px -3px rgb(12 26 21 / 14%),
      0 12px 22px -14px rgb(12 26 21 / 30%);
    transition:
      transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .app:active:not(:disabled) {
    transform: scale(0.955);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 60%),
      0 1px 2px rgb(12 26 21 / 8%);
  }
  .app:disabled {
    opacity: 0.34;
    cursor: default;
  }
  .grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .sigle {
    position: relative;
    z-index: 1;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--verriere-vert-profond, #0a2b23);
    filter: drop-shadow(0 1px 0 rgb(255 255 255 / 62%));
  }

  .verre {
    background: linear-gradient(150deg, #f4f8f5 0%, #e3ece6 46%, #cfdcd6 100%);
  }
  .verre .grain {
    background:
      linear-gradient(150deg, transparent 34%, rgb(255 255 255 / 70%) 42%, transparent 50%),
      linear-gradient(150deg, transparent 58%, rgb(255 255 255 / 34%) 64%, transparent 70%);
  }
  /* Le laiton s'inverse en son milieu : c'est ce retournement qui fait un
     reflet métallique. Un dégradé simple donne du carton jaune. */
  .laiton {
    background: linear-gradient(150deg, #fbf1da 0%, #e8d3a4 30%, #c9ab6e 52%, #e5d0a2 74%, #f3e6c8 100%);
  }
  .laiton .grain {
    background: repeating-linear-gradient(150deg, transparent 0 2px, rgb(255 255 255 / 22%) 2px 3px);
    opacity: 0.5;
  }
  /* La terre cuite est mate et poreuse : aucun reflet. */
  .terre {
    background: linear-gradient(150deg, #f2ddd0 0%, #e2bda7 58%, #c99a80 100%);
  }
  .terre .grain {
    background:
      radial-gradient(circle at 28% 24%, rgb(255 255 255 / 40%), transparent 46%),
      repeating-radial-gradient(circle at 62% 68%, rgb(140 84 58 / 9%) 0 1px, transparent 1px 4px);
  }
  .bois {
    background: linear-gradient(150deg, #eaddc5 0%, #d8bd97 46%, #bf9d72 100%);
  }
  .bois .grain {
    background:
      repeating-linear-gradient(
        96deg,
        rgb(120 84 46 / 12%) 0 1px,
        transparent 1px 5px,
        rgb(120 84 46 / 7%) 5px 6px,
        transparent 6px 13px
      ),
      radial-gradient(ellipse 60% 22% at 38% 62%, rgb(120 84 46 / 16%), transparent 70%);
  }
  .pierre {
    background: linear-gradient(150deg, #eef1ef 0%, #dde3e0 52%, #c8d1cd 100%);
  }
  .pierre .grain {
    background:
      repeating-radial-gradient(circle at 34% 30%, rgb(51 80 92 / 8%) 0 1px, transparent 1px 3px),
      repeating-radial-gradient(circle at 72% 74%, rgb(51 80 92 / 6%) 0 1px, transparent 1px 4px);
  }

  /* Le terracotta ne sert qu'à ça : ce qui demande attention. */
  .pastille {
    position: absolute;
    top: 7%;
    right: 7%;
    width: 21%;
    height: 21%;
    border-radius: 50%;
    background: var(--verriere-terre, #a75f42);
    box-shadow: 0 0 0 2.5px #fff;
    z-index: 2;
  }
  .etiquette {
    font-size: 0.56rem;
    text-align: center;
    color: var(--verriere-encre-douce, #5b6b63);
  }

  /* ── LA ZONE DE TRAVAIL : discrète, c'est un outil, pas une promesse ── */
  .atelier {
    margin: auto var(--marge) 0;
    padding: clamp(1.2rem, 5vw, 1.8rem) 0;
  }
  .entree {
    border: 0;
    background: none;
    padding: 0.6rem 0;
    font: inherit;
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--verriere-encre-douce, #5b6b63);
    cursor: pointer;
  }
  .atelier form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.6rem;
  }
  .atelier label {
    font-size: 0.68rem;
    color: var(--verriere-encre-douce, #5b6b63);
  }
  .atelier input {
    flex: 1 1 8rem;
    min-height: 2.75rem;
    padding: 0 0.7rem;
    border: 1px solid var(--verriere-sable, #d8c5a9);
    border-radius: 0.5rem;
    background: #fff;
    font: inherit;
    color: inherit;
  }
  .atelier button[type='submit'] {
    min-height: 2.75rem;
    padding: 0 1rem;
    border: 0;
    border-radius: 0.5rem;
    background: var(--verriere-vert, #12463b);
    color: var(--verriere-champagne, #f6ead8);
    font: inherit;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .refus {
    flex: 1 0 100%;
    margin: 0;
    font-size: 0.72rem;
    color: var(--verriere-terre, #a75f42);
  }

  @media (prefers-reduced-motion: reduce) {
    .app {
      transition: none;
    }
  }
</style>
