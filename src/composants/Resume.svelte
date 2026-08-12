<script lang="ts">
  /**
   * Le coup d'œil.
   *
   * Avant tout le reste : combien de diagnostics, combien de points qui
   * fâchent, et une phrase qui répond à la seule question du lecteur.
   */
  import type { Analyse, TypeDiag } from '../lib/modele';
  import Picto from './Picto.svelte';
  import MiniEtiquette from './MiniEtiquette.svelte';
  import { libelleCourt } from '../lib/libelle';

  /** Nom court, pour écrire une phrase qui se lit à voix haute. */
  const NOMS: Record<TypeDiag, string> = {
    dpe: 'la performance énergétique',
    plomb: 'le plomb',
    amiante: 'l’amiante',
    electricite: 'l’électricité',
    gaz: 'le gaz',
    termites: 'les termites',
    erp: 'les risques du terrain',
    carrez: 'la surface',
    assainissement: 'l’assainissement'
  };

  interface Props {
    analyse: Analyse;
    nomFichier: string;
    exemple: boolean;
    recommencer: () => void;
    /** Ouvrir ce diagnostic dans le lecteur, plus bas. */
    allerVers?: (type: TypeDiag) => void;
    /**
     * L'écran se lit en deux temps : l'en-tête annonce le dossier, le bilan le
     * referme une fois qu'on a tout parcouru.
     */
    partie: 'entete' | 'bilan';
  }

  const { analyse, nomFichier, exemple, recommencer, partie, allerVers }: Props = $props();

  /** Diagnostics déjà ouverts : on explore un dossier comme on découvre une carte. */
  let vues = $state<Set<string>>(new Set());

  const importants = $derived(analyse.diagnostics.filter((d) => d.gravite === 'alerte'));
  const aRegarder = $derived(analyse.diagnostics.filter((d) => d.gravite === 'attention'));
  const tranquilles = $derived(analyse.diagnostics.filter((d) => d.gravite === 'bon'));

  const phrase = $derived.by(() => {
    if (importants.length > 0) {
      const noms = importants.map((d) => NOMS[d.type]);
      const liste =
        noms.length === 1 ? noms[0] : `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`;
      return `À regarder : ${liste}. Le reste est propre.`;
    }
    if (aRegarder.length > 0) return 'Rien de grave. Quelques points à voir avant de signer.';
    if (tranquilles.length > 0) return 'Rien à signaler dans ce dossier.';
    return 'Voici votre dossier.';
  });
</script>

<section class="resume">
  {#if partie === 'entete'}
  {#if exemple}
    <p class="bandeau-exemple">
      <strong>Exemple de démonstration.</strong> Ce logement n’existe pas. Les chiffres sont inventés,
      mais ils traversent exactement le même moteur que votre rapport.
    </p>
  {/if}

  <p class="fichier muet petit">{nomFichier} — {analyse.nbPages} pages</p>

  <h1>
    {#if importants.length}
      {importants.length} point{importants.length > 1 ? 's' : ''} important{importants.length > 1 ? 's' : ''}
      dans votre dossier
    {:else if aRegarder.length}
      Votre dossier est plutôt sain
    {:else}
      Votre dossier ne signale rien
    {/if}
  </h1>

  <p class="phrase">{phrase}</p>

  {#if analyse.bien.adresse || analyse.bien.commune}
    <p class="bien muet">
      {analyse.bien.adresse ?? ''}{analyse.bien.commune ? `, ${analyse.bien.commune}` : ''}
    </p>
  {/if}
  {:else}
  <h2 class="titre-bilan">Ce que dit votre dossier</h2>

  <!-- Le compte, sur une seule ligne. Quatre cartes côte à côte, c'était quatre
       informations à comparer avant d'avoir rien compris. -->
  <p class="compte">
    <span class="alerte"><b>{importants.length}</b> à traiter</span>
    <span class="attention"><b>{aRegarder.length}</b> à regarder</span>
    <span class="bon"><b>{tranquilles.length}</b> sans souci</span>
    {#if analyse.controles.length}
      <span class="controle"><b>{analyse.controles.length}</b> à vérifier</span>
    {/if}
  </p>

  <div class="tuiles">
    {#each analyse.diagnostics as d, i (d.type)}
      <button
        type="button"
        class="tuile {d.gravite}"
        class:vue={vues.has(d.type)}
        style:animation-delay="{i * 55}ms"
        onclick={() => {
          vues.add(d.type);
          vues = new Set(vues);
          allerVers?.(d.type);
        }}
      >
        <span class="picto" class:etiquette={d.type === 'dpe'}>
          {#if d.type === 'dpe' && d.schema?.genre === 'dpe'}
            <MiniEtiquette lettre={d.schema.finale} />
          {:else}
            <Picto type={d.type} />
          {/if}
        </span>
        <span class="dit">
          <span class="verdict-court">{libelleCourt(d)}</span>
          <span class="quoi">{d.titre}</span>
        </span>
        <span class="fleche" aria-hidden="true">→</span>
      </button>
    {/each}
  </div>

  <div class="actions">
    <button class="bouton bouton--fantome" onclick={recommencer}>Analyser un autre rapport</button>
    <!-- Une antisèche, ça s'emporte : chez le notaire, face au vendeur. -->
    <button class="bouton bouton--fantome" onclick={() => window.print()}>
      Imprimer l’antisèche
    </button>
  </div>
  {/if}
</section>

<style>
  .resume {
    margin-bottom: 26px;
  }

  .fichier {
    margin: 0 0 6px;
  }

  h1 {
    margin: 0 0 10px;
    text-wrap: balance;
  }

  .titre-bilan {
    margin-bottom: 18px;
  }

  .phrase {
    font-size: clamp(1.05rem, 2.2vw, 1.22rem);
    line-height: 1.45;
    max-width: 60ch;
    margin-bottom: 6px;
    text-wrap: pretty;
  }

  .bien {
    margin-bottom: 22px;
  }

  .compte {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 26px;
    margin: 0 0 26px;
    font-size: 0.98rem;
    color: var(--sur-fond-doux);
  }

  .compte b {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin-right: 6px;
    vertical-align: -1px;
  }

  .compte .alerte b {
    color: #fc7060;
  }
  .compte .attention b {
    color: #fcb650;
  }
  .compte .bon b {
    color: #5fd3a0;
  }
  .compte .controle b {
    color: var(--or-clair);
  }

  /* Des tuiles franches, lisibles au premier coup d'œil sur téléphone comme sur
     écran large : deux colonnes au maximum, jamais des vignettes serrées. */
  .tuiles {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    margin-bottom: 22px;
  }

  @media (max-width: 700px) {
    .tuiles {
      grid-template-columns: 1fr;
    }
  }

  /* Des tuiles pleines : la couleur de la gravité occupe toute la carte, comme
     un bouton qu'on a envie d'appuyer. */
  .tuile {
    display: grid;
    grid-template-columns: 74px 1fr 20px;
    align-items: center;
    gap: 18px;
    text-align: left;
    font: inherit;
    cursor: pointer;
    padding: 20px 22px;
    border-radius: 18px;
    border: 2px solid transparent;
    color: var(--encre);
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
  }

  /* Couleurs pleines et franches, comme des boutons de jeu : on voit la
     couleur avant de lire le mot. */
  .tuile.bon {
    background: linear-gradient(150deg, #22a06b, #17835a);
    border-color: #146f4c;
    color: #fff;
    box-shadow: 0 6px 0 #0f5e40;
  }

  .tuile.attention {
    background: linear-gradient(150deg, #f0a132, #dd8418);
    border-color: #c1720f;
    color: #fff;
    box-shadow: 0 6px 0 #a75f08;
  }

  .tuile.alerte {
    background: linear-gradient(150deg, #e0563f, #c53f2c);
    border-color: #a83422;
    color: #fff;
    box-shadow: 0 6px 0 #8d2b1b;
  }

  .tuile.neutre {
    background: linear-gradient(150deg, #7d8f86, #667a70);
    border-color: #566a60;
    color: #fff;
    box-shadow: 0 6px 0 #47584f;
  }

  /* Le bouton s'enfonce quand on appuie. */
  .tuile:active {
    transform: translateY(4px);
    box-shadow: 0 2px 0 rgb(0 0 0 / 35%);
  }

  /* Les tuiles apparaissent l'une après l'autre, et se soulèvent au survol :
     on explore son dossier, on ne remplit pas un formulaire. */
  .tuile {
    animation: surgit 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes surgit {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .tuile:hover {
    transform: translateY(-3px);
    box-shadow: var(--ombre-forte);
  }

  .tuile:hover .picto {
    transform: scale(1.06) rotate(-3deg);
  }

  .picto {
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Une pastille discrète marque ce qu'on a déjà ouvert. */
  .tuile.vue::after {
    content: '✓';
    position: absolute;
    top: 10px;
    right: 12px;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--ok);
    opacity: 0.6;
  }

  .tuile {
    position: relative;
  }

  .tuile.bon {
    border-left-color: var(--ok);
  }
  .tuile.attention {
    border-left-color: var(--attention);
  }
  .tuile.alerte {
    border-left-color: var(--alerte);
  }
  .tuile.neutre {
    border-left-color: var(--trait);
  }

  /* Le médaillon rond et doré des plaquettes DGLM : c'est lui qu'on voit avant
     de lire, et il ramène la marque sur chaque tuile. */
  .picto {
    display: grid;
    place-items: center;
    width: 74px;
    height: 74px;
    border-radius: 50%;
    font-size: 36px;
    background: radial-gradient(circle at 32% 26%, #e9d2a5, #c09048 60%, #a3762f);
    box-shadow:
      inset 0 -3px 7px rgb(0 0 0 / 22%),
      inset 0 2px 3px rgb(255 255 255 / 45%),
      0 4px 0 rgb(0 0 0 / 22%);
  }

  /* L'étiquette DPE remplit sa case : c'est un graphique, pas une icône. */
  .picto.etiquette {
    border-radius: 16px;
    padding: 8px 10px;
    background: rgb(255 255 255 / 96%);
    box-shadow: 0 3px 0 rgb(0 0 0 / 18%);
  }

  .verdict-court {
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .verdict-court {
    color: #fff;
    text-shadow: 0 1px 2px rgb(0 0 0 / 25%);
  }

  .quoi {
    font-size: 0.88rem;
    color: rgb(255 255 255 / 82%);
  }

  .fleche {
    color: rgb(255 255 255 / 75%);
  }

  .fleche {
    align-self: center;
    color: var(--encre-doux);
    font-weight: 700;
    transition: transform 0.15s ease;
  }

  .tuile:hover .fleche {
    transform: translateX(3px);
    color: var(--vert-500);
  }


  .dit {
    display: grid;
    gap: 3px;
    min-width: 0;
  }


  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .bandeau-exemple {
    background: var(--vert-100);
    border-left: 4px solid var(--vert-500);
    border-radius: var(--rayon-petit);
    padding: 12px 16px;
    margin-bottom: 18px;
    font-size: 0.94rem;
  }
</style>
