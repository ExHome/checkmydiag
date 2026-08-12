<script lang="ts">
  /**
   * Le coup d'œil.
   *
   * Avant tout le reste : combien de diagnostics, combien de points qui
   * fâchent, et une phrase qui répond à la seule question du lecteur.
   */
  import type { Analyse, TypeDiag } from '../lib/modele';

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
    /**
     * L'écran se lit en deux temps : l'en-tête annonce le dossier, le bilan le
     * referme une fois qu'on a tout parcouru.
     */
    partie: 'entete' | 'bilan';
  }

  const { analyse, nomFichier, exemple, recommencer, partie }: Props = $props();

  const importants = $derived(analyse.diagnostics.filter((d) => d.gravite === 'alerte'));
  const aRegarder = $derived(analyse.diagnostics.filter((d) => d.gravite === 'attention'));
  const tranquilles = $derived(analyse.diagnostics.filter((d) => d.gravite === 'bon'));

  const phrase = $derived.by(() => {
    if (importants.length > 0) {
      const noms = importants.map((d) => NOMS[d.type]);
      const liste =
        noms.length === 1 ? noms[0] : `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`;
      return `Ce qui demande votre attention : ${liste}. Le reste du dossier ne pose pas de problème.`;
    }
    if (aRegarder.length > 0) {
      return 'Rien de grave dans ce dossier, mais quelques points méritent votre attention avant de signer.';
    }
    if (tranquilles.length > 0) {
      return 'Bonne nouvelle : aucun diagnostic de ce dossier ne signale de problème.';
    }
    return 'Voici ce que contient votre dossier.';
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
  <h2 class="titre-bilan">Le bilan de votre dossier</h2>

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
    {#each analyse.diagnostics as d (d.type)}
      <a class="tuile {d.gravite}" href="#{d.type}">
        <strong>{d.titre}</strong>
        <span class="petit">{d.verdict}</span>
      </a>
    {/each}
  </div>

  <button class="bouton bouton--fantome" onclick={recommencer}>Analyser un autre rapport</button>
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

  .tuiles {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    margin-bottom: 22px;
  }

  .tuile {
    display: grid;
    gap: 4px;
    padding: 14px 16px;
    border-radius: var(--rayon-petit);
    border: 1px solid var(--trait);
    border-left-width: 5px;
    background: var(--papier);
    color: inherit;
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .tuile:hover {
    transform: translateY(-2px);
    box-shadow: var(--ombre);
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

  .tuile span {
    color: var(--encre-doux);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
