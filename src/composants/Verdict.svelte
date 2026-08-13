<script lang="ts">
  /**
   * Le voyant du dossier.
   *
   * C'est la première chose de l'écran, et la seule qui doit être comprise en
   * trois secondes : est-ce que c'est grave, et qu'est-ce que je fais ?
   *
   * Avant, la réponse était en section VI, aux trois quarts de la page : on
   * ouvrait sur une adresse et un nombre de pages. Le lecteur, lui, arrive avec
   * une seule question — on y répond d'abord, le dossier vient ensuite.
   *
   * Trois silhouettes, jamais la même : triangle quand ça bloque, rond barré
   * quand ça se chiffre, rond coché quand c'est propre. La forme suffit ; la
   * couleur ne fait que confirmer.
   */
  import type { Analyse, Diagnostic, PointDeControle } from '../lib/modele';
  import { FICHES } from '../lib/analyse/fiches';

  const { analyse }: { analyse: Analyse } = $props();

  type Ton = 'mauvais' | 'moyen' | 'bon';

  interface Ligne {
    cle: string;
    ton: Ton;
    titre: string;
    explication: string;
    quoiFaire: string;
  }

  const parGenre = (genre: PointDeControle['genre']): PointDeControle[] =>
    analyse.controles.filter((c) => c.genre === genre);

  /**
   * Ce qui empêche de signer : un rapport périmé, un rapport absent, deux
   * chiffres qui ne concordent pas. Les trois se traitent pareil — il faut
   * revenir vers le vendeur avant le rendez-vous.
   */
  const bloquants = $derived([
    ...parGenre('perime'),
    ...parGenre('manque'),
    ...parGenre('incoherence')
  ]);

  /** Ce qui ne bloque pas mais mérite une question. */
  const remarques = $derived(parGenre('attention'));

  /** Les installations de sécurité dont le rapport signale des anomalies. */
  const anomalies = $derived(
    analyse.diagnostics.filter(
      (d) => (d.type === 'electricite' || d.type === 'gaz') && d.gravite !== 'bon'
    )
  );

  /** Un matériau dangereux réellement repéré : ça n'attend pas la négociation. */
  const dangers = $derived(
    analyse.diagnostics.filter(
      (d) => (d.type === 'amiante' || d.type === 'plomb' || d.type === 'termites') && d.gravite === 'alerte'
    )
  );

  const dpe = $derived(analyse.diagnostics.find((d) => d.type === 'dpe') ?? null);
  const lettre = $derived(dpe?.schema?.genre === 'dpe' ? dpe.schema.finale : null);

  /** « installation électrique et installation de gaz » : les noms du rapport. */
  function nomsDe(liste: Diagnostic[]): string {
    const noms = liste.map((d) => d.titre.toLowerCase());
    if (noms.length <= 1) return noms[0] ?? '';
    return `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`;
  }

  /**
   * Les lignes du voyant, dans l'ordre où on s'en occupe : ce qui empêche de
   * signer, ce qui se répare, ce qui se chiffre, ce qui se sait.
   */
  const lignes = $derived.by<Ligne[]>(() => {
    const liste: Ligne[] = [];

    for (const [i, c] of bloquants.entries()) {
      liste.push({
        cle: `b${i}`,
        ton: 'mauvais',
        titre: c.titre,
        explication: c.explication,
        quoiFaire: c.quoiFaire
      });
    }

    for (const d of dangers) {
      liste.push({
        cle: `d-${d.type}`,
        ton: 'mauvais',
        titre: `${d.titre} : le rapport a trouvé quelque chose`,
        explication: d.verdict,
        quoiFaire: FICHES[d.type].quoiFaire
      });
    }

    if (anomalies.length) {
      liste.push({
        cle: 'anomalies',
        ton: 'moyen',
        titre: `Des anomalies sur ${nomsDe(anomalies)}`,
        explication:
          'Une anomalie n’est pas une panne : l’installation fonctionne, mais elle ne respecte pas un point de la norme de sécurité. Aucun texte n’oblige le vendeur à la réparer pour vendre.',
        quoiFaire:
          'Faites chiffrer les réparations par un artisan avant de faire une offre : ce devis est votre marge de discussion.'
      });
    }

    if (lettre === 'F' || lettre === 'G') {
      liste.push({
        cle: 'passoire',
        ton: 'moyen',
        titre:
          lettre === 'G'
            ? 'Classe G : ce logement ne peut plus être loué'
            : 'Classe F : ce logement ne pourra plus être loué en 2028',
        explication:
          'La loi interdit peu à peu la location des logements les plus consommateurs. Le loyer est déjà gelé : aucune révision, aucune réévaluation entre deux locataires.',
        quoiFaire:
          'Ce point pèse sur le prix, et il se discute. Faites chiffrer les travaux qui feraient remonter la classe.'
      });
    }

    for (const [i, c] of remarques.entries()) {
      liste.push({
        cle: `a${i}`,
        ton: 'moyen',
        titre: c.titre,
        explication: c.explication,
        quoiFaire: c.quoiFaire
      });
    }

    return liste;
  });

  /** Le ton du dossier entier : celui de sa ligne la plus grave. */
  const ton = $derived<Ton>(
    lignes.some((l) => l.ton === 'mauvais') ? 'mauvais' : lignes.length ? 'moyen' : 'bon'
  );

  /** Le titre en trois mots, et la phrase qui dit quoi en faire. */
  const annonce = $derived.by<{ titre: string; suite: string }>(() => {
    const n = bloquants.length + dangers.length;

    if (ton === 'mauvais') {
      return {
        titre: 'Le dossier n’est pas complet',
        suite:
          n === 1
            ? 'Un point est à régler avant de signer. Le reste du dossier se lit plus bas.'
            : `${n} points sont à régler avant de signer. Le reste du dossier se lit plus bas.`
      };
    }

    if (ton === 'moyen') {
      return {
        titre: 'Rien ne bloque la vente',
        suite:
          lignes.length === 1
            ? 'Un point se chiffre et se négocie — il ne vous empêche pas de signer.'
            : `${lignes.length} points se chiffrent et se négocient — ils ne vous empêchent pas de signer.`
      };
    }

    return {
      titre: 'Le dossier est complet',
      suite: 'Aucun rapport périmé, aucun rapport manquant, aucune anomalie signalée.'
    };
  });

  /** Une ligne ouverte à la fois : on lit une chose, pas un mur. */
  let ouverte = $state<string | null>(null);
</script>

<section class="verdict {ton}" aria-label="Ce qu’il faut retenir du dossier">
  <div class="tete">
    <span class="picto" aria-hidden="true">
      {#if ton === 'mauvais'}
        <!-- Le triangle : la seule silhouette anguleuse de l'écran. -->
        <svg viewBox="0 0 48 48">
          <path d="M24 4.5 46 42H2Z" fill="currentColor" />
          <path d="M24 18v10" stroke="var(--fond)" stroke-width="4.2" stroke-linecap="round" />
          <circle cx="24" cy="35" r="2.4" fill="var(--fond)" />
        </svg>
      {:else if ton === 'moyen'}
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="21" fill="currentColor" />
          <path d="M24 12v13" stroke="var(--fond)" stroke-width="4.2" stroke-linecap="round" />
          <circle cx="24" cy="33.5" r="2.6" fill="var(--fond)" />
        </svg>
      {:else}
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="21" fill="currentColor" />
          <path
            d="m14.5 24.5 6.5 6.5 12.5-13"
            fill="none"
            stroke="var(--fond)"
            stroke-width="4.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {/if}
    </span>

    <div class="dit">
      <h2>{annonce.titre}</h2>
      <p>{annonce.suite}</p>
    </div>
  </div>

  {#if lignes.length}
    <ul class="lignes">
      {#each lignes as ligne (ligne.cle)}
        <li class={ligne.ton}>
          <button
            type="button"
            class="entree"
            aria-expanded={ouverte === ligne.cle}
            onclick={() => (ouverte = ouverte === ligne.cle ? null : ligne.cle)}
          >
            <span class="marque" aria-hidden="true"></span>
            <span class="mot">{ligne.titre}</span>
            <span class="signe" aria-hidden="true">{ouverte === ligne.cle ? '−' : '+'}</span>
          </button>

          {#if ouverte === ligne.cle}
            <div class="detail apparait">
              <p>{ligne.explication}</p>
              <p class="faire">{ligne.quoiFaire}</p>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  /* Le voyant se pose à même le vert, comme le reste : ce qui le distingue,
     c'est le filet de gauche à la couleur de son ton, et rien d'autre. */
  .verdict {
    margin-bottom: var(--e6);
    padding-left: var(--e5);
    border-left: 3px solid var(--ton);
  }

  .verdict.mauvais {
    --ton: #d4604a;
  }
  .verdict.moyen {
    --ton: #d9a03f;
  }
  .verdict.bon {
    --ton: #5fb489;
  }

  .tete {
    display: flex;
    align-items: flex-start;
    gap: var(--e4);
  }

  /* Gros, parce que c'est lui qu'on voit avant de lire. */
  .picto {
    flex: none;
    width: 46px;
    color: var(--ton);
  }

  .picto svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .dit h2 {
    font-size: var(--t-section);
    color: var(--sur-fond);
    margin: 0 0 var(--e2);
  }

  .dit p {
    margin: 0;
    font-size: var(--t-lead);
    line-height: 1.45;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  /* Une ligne par chose à faire, dans l'ordre où on s'en occupe. */
  .lignes {
    list-style: none;
    margin: var(--e5) 0 0;
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  .entree {
    display: flex;
    align-items: center;
    gap: var(--e3);
    width: 100%;
    /* Une cible confortable au pouce : la ligne fait toute la largeur. */
    min-height: 52px;
    text-align: left;
    background: rgb(255 255 255 / 5%);
    border: none;
    border-left: 3px solid var(--marque);
    border-radius: 0;
    padding: var(--e3) var(--e4);
    color: var(--sur-fond);
    font-size: var(--t-base);
    font-weight: 600;
    line-height: 1.4;
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .entree:hover {
    background: rgb(255 255 255 / 10%);
  }

  li.mauvais .entree {
    --marque: #d4604a;
  }
  li.moyen .entree {
    --marque: #d9a03f;
  }
  li.bon .entree {
    --marque: #5fb489;
  }

  /* La pastille reprend la silhouette du voyant en miniature : carré pour ce
     qui bloque, rond pour ce qui se discute. On les distingue sans la couleur. */
  .marque {
    flex: none;
    width: 9px;
    height: 9px;
    background: var(--marque);
  }

  li.moyen .marque,
  li.bon .marque {
    border-radius: 50%;
  }

  .mot {
    flex: 1;
  }

  .signe {
    flex: none;
    font-family: var(--mono);
    font-size: var(--t-lead);
    color: var(--or-clair);
  }

  .detail {
    padding: var(--e3) var(--e4) var(--e4) calc(var(--e4) + 22px);
    background: rgb(255 255 255 / 3%);
  }

  .detail p {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.55;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  /* Ce qu'on fait, détaché de ce qu'on explique : c'est la ligne qu'on relit. */
  .faire {
    margin-top: var(--e3) !important;
    padding-top: var(--e3);
    border-top: 1px solid var(--trait-or);
    color: var(--or-clair) !important;
  }

  @media (max-width: 620px) {
    .picto {
      width: 36px;
    }

    .verdict {
      padding-left: var(--e4);
    }
  }

  /* Sur le document remis, le voyant ouvre la page et tout est déplié : on
     n'imprime pas des boutons refermés. */
  @media print {
    .verdict {
      border-left-color: #093f30;
      margin-bottom: 14mm;
    }

    .dit h2,
    .mot {
      color: #093f30 !important;
    }

    .dit p,
    .detail p {
      color: #41544c !important;
    }

    .picto {
      color: #093f30 !important;
    }

    .entree {
      background: none !important;
      border-left-color: #999 !important;
    }

    .signe {
      display: none;
    }

    .detail {
      background: none !important;
    }
  }
</style>
