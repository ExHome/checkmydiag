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

  <div class="compteurs">
    <div class="compteur alerte">
      <span class="nombre">{importants.length}</span>
      <span class="libelle">à traiter</span>
    </div>
    <div class="compteur attention">
      <span class="nombre">{aRegarder.length}</span>
      <span class="libelle">à regarder</span>
    </div>
    <div class="compteur bon">
      <span class="nombre">{tranquilles.length}</span>
      <span class="libelle">sans souci</span>
    </div>
    {#if analyse.controles.length}
      <div class="compteur controle">
        <span class="nombre">{analyse.controles.length}</span>
        <span class="libelle">à vérifier</span>
      </div>
    {/if}
  </div>

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

  .compteurs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 22px;
  }

  .compteur {
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon);
    padding: 16px 18px;
    display: grid;
    gap: 2px;
    box-shadow: var(--ombre);
  }

  .nombre {
    font-size: 2.1rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .libelle {
    font-size: 0.86rem;
    color: var(--encre-doux);
    font-weight: 600;
  }

  .compteur.alerte .nombre {
    color: var(--alerte);
  }
  .compteur.attention .nombre {
    color: var(--attention);
  }
  .compteur.bon .nombre {
    color: var(--ok);
  }
  .compteur.controle .nombre {
    color: var(--or);
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

  .tuile.bon {
    background: linear-gradient(150deg, #e8f6ee, #d5ecdf);
    border-color: #b9dfc9;
  }

  .tuile.attention {
    background: linear-gradient(150deg, #fdf3e0, #f8e6c6);
    border-color: #eed4a4;
  }

  .tuile.alerte {
    background: linear-gradient(150deg, #fceeea, #f7dcd4);
    border-color: #f0c3b6;
  }

  .tuile.neutre {
    background: linear-gradient(150deg, var(--papier), var(--papier-doux));
    border-color: var(--trait);
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

  /* Le picto est gros : c'est lui qu'on voit avant de lire. */
  .picto {
    display: grid;
    place-items: center;
    width: 74px;
    height: 74px;
    border-radius: 20px;
    padding: 13px;
    background: rgb(255 255 255 / 72%);
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 60%);
  }

  /* L'étiquette DPE remplit sa case : c'est un graphique, pas une icône. */
  .picto.etiquette {
    padding: 8px 10px;
  }

  .verdict-court {
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .tuile.bon .verdict-court {
    color: var(--ok);
  }
  .tuile.attention .verdict-court {
    color: var(--attention);
  }
  .tuile.alerte .verdict-court {
    color: var(--alerte);
  }

  .quoi {
    font-size: 0.88rem;
    color: var(--encre-doux);
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


  .tuile.bon .picto {
    color: var(--ok);
  }
  .tuile.attention .picto {
    color: var(--attention);
  }
  .tuile.alerte .picto {
    color: var(--alerte);
  }
  .tuile.neutre .picto {
    color: var(--encre-doux);
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
