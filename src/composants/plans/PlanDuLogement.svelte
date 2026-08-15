<script lang="ts">
  /**
   * Le plan du logement, aiguillé vers le dessin du diagnostic.
   *
   * Chaque diagnostic a son univers — une coupe de maison pour le DPE, un
   * tableau pour l'électricité, une paillasse pour le plomb, un circuit pour le
   * gaz, des niveaux pour l'amiante, une charpente pour les termites, des
   * strates pour les risques. Le mécanisme, lui, est le même partout : on
   * touche une zone, le rapport répond.
   *
   * Ce composant ne décide de rien sur le fond. Les zones viennent du rapport
   * (`analyse/plan.ts`), la couleur vient de l'identité de l'application, et le
   * dessin ne fait que les placer.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { planMuet, zonesDe } from '../../lib/analyse/plan';
  import { APPS } from '../../lib/apps';
  import Plan from './Plan.svelte';
  import PlanDpe from './PlanDpe.svelte';
  import PlanTableau from './PlanTableau.svelte';
  import PlanNiveaux from './PlanNiveaux.svelte';
  import PlanPaillasse from './PlanPaillasse.svelte';
  import PlanCircuit from './PlanCircuit.svelte';
  import PlanBois from './PlanBois.svelte';
  import PlanCouches from './PlanCouches.svelte';

  const { diagnostic }: { diagnostic: Diagnostic } = $props();

  const zones = $derived(zonesDe(diagnostic));
  const teinte = $derived(APPS[diagnostic.type].teinteFoncee);

  /** Le titre dit ce qu'on regarde, et d'où ça sort. */
  const TITRES: Partial<Record<Diagnostic['type'], string>> = {
    dpe: 'Ce que le rapport dit de vos parois',
    electricite: 'Les points signalés dans votre installation',
    gaz: 'Les points signalés sur votre installation',
    plomb: 'Où le plomb a été mesuré chez vous',
    amiante: 'Les zones contrôlées chez vous',
    termites: 'Le bois contrôlé chez vous',
    erp: 'Les risques recensés sur votre terrain',
    carrez: 'Ce qui a été mesuré chez vous',
    assainissement: 'Ce qui a été contrôlé chez vous'
  };
</script>

<!--
  Le plan s'affiche même quand il est vide, et il dit alors pourquoi.

  Le faire disparaître en silence laissait croire qu'il n'y avait rien à
  montrer — c'est-à-dire rien à signaler. Or ce n'est pas la même chose : le
  rapport conclut, mais on n'a pas su relier ses constats à un endroit précis.
  On l'écrit, et on renvoie à la page.
-->
<section class="plan-logement">
  {#if zones.length}
    <h4>{TITRES[diagnostic.type] ?? 'Ce que le rapport relève chez vous'}</h4>
  {/if}

  <Plan {zones} {teinte} muet={planMuet(diagnostic)}>
      {#snippet enfant({ zones: z, choisir, choisie })}
        {#if diagnostic.type === 'dpe'}
          <PlanDpe zones={z} {choisir} {choisie} />
        {:else if diagnostic.type === 'electricite'}
          <PlanTableau zones={z} {choisir} {choisie} />
        {:else if diagnostic.type === 'gaz'}
          <PlanCircuit zones={z} {choisir} {choisie} />
        {:else if diagnostic.type === 'plomb'}
          <PlanPaillasse zones={z} {choisir} {choisie} />
        {:else if diagnostic.type === 'termites'}
          <PlanBois zones={z} {choisir} {choisie} />
        {:else if diagnostic.type === 'erp'}
          <PlanCouches zones={z} {choisir} {choisie} />
        {:else}
          <PlanNiveaux zones={z} {choisir} {choisie} />
        {/if}
  {/snippet}
  </Plan>
</section>

<style>
  .plan-logement {
    margin-top: var(--e5);
  }

  h4 {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    color: var(--sur-fond-doux);
  }
</style>
