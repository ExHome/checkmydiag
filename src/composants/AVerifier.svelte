<script lang="ts">
  /**
   * Ce que l'État vous dit de vérifier.
   *
   * Le ministère publie « Comprendre mon DPE », qui énumère cinq points à
   * contrôler soi-même. Personne ne lit ce document ; tout le monde reçoit le
   * DPE. On le remet donc à sa place — à côté du rapport, avec pour chaque point
   * ce que le rapport en dit.
   *
   * Le premier est le plus utile et le moins connu : un DPE valable est
   * enregistré à l'Observatoire de l'ADEME, et n'importe qui peut le vérifier en
   * saisissant son numéro. Un document absent de cette base ne vaut rien. C'est
   * le lecteur qui s'y rend : l'application n'interroge aucun serveur, son
   * fichier ne quitte pas son appareil.
   */
  import type { Diagnostic } from '../lib/modele';
  import { RECOURS, verificationsDpe } from '../lib/reglement/verifications';

  const { dpe }: { dpe: Diagnostic } = $props();

  const points = $derived(verificationsDpe(dpe));

  /** Les recours ne s'ouvrent que si on les cherche : c'est la suite, pas le sujet. */
  let recoursOuvert = $state(false);
</script>

<section class="a-verifier">
  <p class="quoi-bloc">Ce que l’État vous dit de vérifier</p>
  <p class="chapeau-officiel">
    Le ministère publie une liste de cinq points à contrôler soi-même sur son DPE. La voici, avec ce
    que votre rapport en dit.
  </p>

  <ol class="points">
    {#each points as p, i (p.point)}
      <li>
        <span class="rang">{String(i + 1).padStart(2, '0')}</span>
        <div class="dit">
          <p class="titre-point">{p.point}</p>

          {#if p.releve}
            <!-- Ce que le rapport écrit. C'est la valeur à confronter, et elle
                 se lit d'un coup d'œil : c'est tout l'intérêt de la mettre là. -->
            <p class="releve">{p.releve}</p>
          {:else}
            <p class="absent">Non lu dans le document</p>
          {/if}

          <p class="pourquoi">{p.pourquoi}</p>
          <p class="faire">{p.quoiFaire}</p>

          {#if p.lien}
            <!-- Lien externe : c'est le lecteur qui part vérifier, jamais nous. -->
            <p class="vers">
              <a href={p.lien.url} target="_blank" rel="noopener noreferrer">
                {p.lien.texte} <span aria-hidden="true">↗</span>
              </a>
            </p>
          {/if}
        </div>
      </li>
    {/each}
  </ol>

  <!-- Constater une erreur sans savoir à qui s'adresser ne mène à rien. -->
  <button
    type="button"
    class="ouvrir-recours"
    aria-expanded={recoursOuvert}
    onclick={() => (recoursOuvert = !recoursOuvert)}
  >
    {recoursOuvert ? 'Fermer' : 'Et si quelque chose ne va pas ?'}
  </button>

  {#if recoursOuvert}
    <ol class="recours apparait">
      {#each RECOURS as r (r.etape)}
        <li>
          <p class="etape">{r.etape}</p>
          <p class="quoi-recours">{r.quoi}</p>
        </li>
      {/each}
    </ol>
  {/if}

  <p class="source-officielle">
    D’après « Comprendre mon DPE », ministère de la Transition écologique.
  </p>
</section>

<style>
  .a-verifier {
    margin-top: var(--e5);
    padding-top: var(--e4);
    border-top: 1px solid var(--trait-or);
  }

  .quoi-bloc {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--or-fonce);
  }

  .chapeau-officiel {
    margin: 0 0 var(--e4);
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  .points {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .points li {
    display: grid;
    grid-template-columns: 2.4rem minmax(0, 1fr);
    gap: var(--e3);
    padding: var(--e4) 0;
    border-top: 1px solid var(--trait-fin);
  }

  .points li:first-child {
    border-top: none;
  }

  .rang {
    font-family: var(--mono);
    font-size: var(--t-petit);
    color: var(--or-fonce);
    font-variant-numeric: tabular-nums;
  }

  .dit {
    min-width: 0;
  }

  .dit p {
    margin: 0;
    max-width: var(--mesure);
  }

  .titre-point {
    font-size: var(--t-base);
    font-weight: 650;
    color: var(--sur-fond);
  }

  /* La valeur du rapport : c'est elle qu'on vient confronter, elle a droit à la
     taille et à l'or. */
  .releve {
    margin-top: var(--e2) !important;
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    letter-spacing: -0.022em;
    color: var(--or-clair);
  }

  .absent {
    margin-top: var(--e2) !important;
    font-size: var(--t-petit);
    font-style: italic;
    color: var(--sur-fond-doux);
  }

  .pourquoi {
    margin-top: var(--e2) !important;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  .faire {
    margin-top: var(--e2) !important;
    padding-left: var(--e3);
    border-left: 2px solid var(--trait-or);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond);
  }

  .vers {
    margin-top: var(--e3) !important;
  }

  .vers a {
    color: var(--or-clair);
    font-size: var(--t-petit);
    font-weight: 600;
  }

  .ouvrir-recours {
    margin-top: var(--e4);
    min-height: 44px;
    padding: var(--e2) var(--e4);
    background: none;
    border: 1px solid var(--trait-or);
    border-radius: 999px;
    color: var(--sur-fond);
    font-size: var(--t-petit);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
  }

  .ouvrir-recours:hover {
    background: var(--or);
    color: var(--vert-900);
  }

  .recours {
    margin: var(--e4) 0 0;
    padding-left: var(--e5);
    display: grid;
    gap: var(--e3);
  }

  .recours li {
    color: var(--sur-fond-doux);
  }

  .recours p {
    margin: 0;
    max-width: var(--mesure);
  }

  .etape {
    font-size: var(--t-base);
    font-weight: 650;
    color: var(--sur-fond);
  }

  .quoi-recours {
    margin-top: 2px !important;
    font-size: var(--t-petit);
    line-height: 1.5;
  }

  .source-officielle {
    margin: var(--e4) 0 0;
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
    opacity: 0.85;
  }
</style>
