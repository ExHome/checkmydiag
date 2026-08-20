<script lang="ts">
  /**
   * L'EMPTY STATE D'UN DIAGNOSTIC QUI N'EST PAS AU DOSSIER.
   *
   * La tuile d'un diagnostic absent était `disabled` : on la voyait, on la
   * touchait, il ne se passait rien. Un cul-de-sac muet — et le seul mot
   * d'explication vivait dans un attribut `title`, c'est-à-dire un tooltip
   * natif, qui ne s'affiche JAMAIS au toucher. Sur téléphone, l'information
   * n'existait pas.
   *
   * Or il y a beaucoup à dire à quelqu'un qui se demande « et le gaz, alors ? » :
   * à quoi sert ce contrôle, dans quel cas il est exigé, et quoi faire s'il
   * manque. Tout cela est déjà écrit — dans `FICHES` pour le rôle et le cadre
   * de vente, dans le point de contrôle du moteur pour le manque lui-même.
   *
   * ── Ce que cet écran n'affirme pas ────────────────────────────────────────
   *
   * Que ce diagnostic VOUS manque. Nous ne connaissons ni l'âge de
   * l'installation, ni la commune, ni la nature du lot — donc pas les
   * conditions qui rendent un contrôle obligatoire. On énonce la règle, et on
   * laisse le lecteur la confronter à son bien.
   *
   * La nuance est celle du moteur lui-même : « manquant » quand il a de quoi
   * l'affirmer, « pas au dossier » sinon. Les deux ne se disent pas pareil.
   */
  import type { PointDeControle, TypeDiag } from '../lib/modele';
  import { FICHES } from '../lib/analyse/fiches';
  import { APPS } from '../lib/apps';
  import { espacesFrancaises } from '../lib/typographie';

  const {
    type,
    manque = null,
    fermer
  }: { type: TypeDiag; manque?: PointDeControle | null; fermer: () => void } = $props();

  const app = $derived(APPS[type]);
  const fiche = $derived(FICHES[type]);
</script>

<div class="absent">
  <header>
    <span class="icone" style="background: {app?.degrade ?? 'var(--surface)'}" aria-hidden="true"
    ></span>
    <div>
      <h2>{app?.nom ?? 'Ce diagnostic'}</h2>
      <p class="etat" class:manquant={!!manque}>
        {manque ? 'Manquant au dossier' : 'Pas dans le dossier déposé'}
      </p>
    </div>
  </header>

  {#if manque}
    <!-- Le moteur a de quoi affirmer le manque : on le dit avec ses mots, et on
         garde son « que faire » plutôt que d'en écrire un autre. -->
    <p class="constat">{espacesFrancaises(manque.explication)}</p>
    <p class="action"><b>Que faire&nbsp;:</b> {espacesFrancaises(manque.quoiFaire)}</p>
  {:else}
    <p class="constat">
      Ce diagnostic ne figure pas dans le document que vous avez déposé. Cela ne
      veut pas dire qu’il n’existe pas&nbsp;: il peut être dans un autre fichier,
      ou ne pas être exigé pour ce bien.
    </p>
  {/if}

  {#if fiche}
    <dl class="a-quoi">
      <div>
        <dt>À quoi il sert</dt>
        <dd>{espacesFrancaises(fiche.pourquoi)}</dd>
      </div>
      {#if fiche.vente}
        <div>
          <dt>Quand il est exigé</dt>
          <dd>{espacesFrancaises(fiche.vente)}</dd>
        </div>
      {/if}
    </dl>
  {/if}

  <button type="button" class="fermer" onclick={fermer}>Revenir à mes diagnostics</button>
</div>

<style>
  .absent {
    display: grid;
    gap: var(--e4);
    padding: var(--e5) var(--e4) var(--e4);
  }

  header {
    display: flex;
    align-items: center;
    gap: var(--e3);
  }

  /* L'icône reste celle de la tuile, mais délavée : c'est la même application,
     et elle n'est pas là. La reconnaissance passe avant l'effet. */
  .icone {
    width: 46px;
    height: 46px;
    flex: none;
    border-radius: 28%;
    filter: grayscale(0.7);
    opacity: 0.65;
  }

  h2 {
    margin: 0;
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    line-height: 1.2;
    color: var(--sur-fond);
  }

  .etat {
    margin: 2px 0 0;
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  /* Manquant alors qu'il est dû : ce n'est pas une case vide, c'est un point à
     régler avant de signer. Le mot le dit, la couleur le répète. */
  .etat.manquant {
    color: var(--alerte);
  }

  .constat {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond);
    max-width: var(--mesure);
  }

  .action {
    margin: 0;
    padding: var(--e3) var(--e4);
    border-left: 3px solid var(--alerte);
    border-radius: 0 var(--rayon) var(--rayon) 0;
    background: var(--surface);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond);
    max-width: var(--mesure);
  }

  .a-quoi {
    display: grid;
    gap: var(--e3);
    margin: 0;
  }

  dt {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  dd {
    margin: 4px 0 0;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond);
    max-width: var(--mesure);
  }

  .fermer {
    justify-self: start;
    min-height: 44px;
    padding: 0 var(--e4);
    background: var(--action-forte);
    border: none;
    border-radius: var(--rayon-badge);
    color: var(--sur-accent, #fff);
    font-size: var(--t-petit);
    font-weight: 700;
    cursor: pointer;
  }
</style>
