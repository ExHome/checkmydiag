<script lang="ts">
  /**
   * L'ÉCRAN TERMITES — la matrice de l'ordre du 22/08/2026.
   *
   * Référence : l'écran de DROITE du visuel `VISUEL_REFERENCE_TERMITES.png`.
   * Les sept blocs, dans l'ordre imposé :
   *
   *   Points clés → Résultat global → Constatations diverses →
   *   Ce qui n'a pas été contrôlé → Complétude → Conseil Verrière →
   *   Rapport complet
   *
   * ⚠️ CE QUE LE VISUEL MONTRE ET QUI N'EST PAS ICI, PARCE QUE C'EST FICTIF :
   *
   *   — le « 90 % » de confiance (§ E l'interdit nommément) ;
   *   — le « NIVEAU DE RISQUE : TRÈS FAIBLE » (§ B : calculable ou rien) ;
   *   — les trois points clés décomposés (« aucun termite vivant », « aucun
   *     dégât », « pas d'activité récente ») : les rapports ne répondent pas
   *     indice par indice, ils concluent globalement.
   *
   * Le visuel se contredit d'ailleurs : il annonce « inspection complète » en
   * affichant quatre zones non contrôlées.
   *
   * ⚠️ AUCUN STATUT N'EST PORTÉ PAR LA COULEUR SEULE (§ 4 de l'ordre) : chaque
   * ton s'accompagne d'un pictogramme ET d'un libellé.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { syntheseTermites } from './synthese';

  interface Props {
    diagnostic: Diagnostic;
    /** Ouvrir le rapport source à la page voulue. */
    surVoirDansLeRapport?: (page: number) => void;
  }

  const { diagnostic, surVoirDansLeRapport }: Props = $props();
  const s = $derived(syntheseTermites(diagnostic));

  /** Le pictogramme du ton — jamais la couleur seule. */
  const signe = (ton: string): string => (ton === 'alerte' ? '!' : ton === 'attention' ? '?' : '✓');
  const mot = (ton: string): string =>
    ton === 'alerte' ? 'Point d’alerte' : ton === 'attention' ? 'À regarder' : 'Rien à signaler';
</script>

<article class="termites" aria-labelledby="termites-titre">
  <header class="chapeau">
    <p class="surtitre">Synthèse du diagnostic</p>
    <h2 id="termites-titre">Termites</h2>
  </header>

  <!-- 1 · POINTS CLÉS — la lecture immédiate, avant toute explication. -->
  {#if s.pointsCles.length}
    <section class="bloc" aria-labelledby="tk-cles">
      <h3 id="tk-cles" class="titre-bloc">Points clés</h3>
      <ul class="cles">
        {#each s.pointsCles as p (p.titre)}
          <li class="cle ton-{p.ton}">
            <span class="pastille" aria-hidden="true">{signe(p.ton)}</span>
            <span class="corps-cle">
              <b>{p.titre}</b>
              <span class="etiquette-ton">{mot(p.ton)}</span>
              <span class="detail-cle">{p.detail}</span>
            </span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <!--
    2 · RÉSULTAT GLOBAL — la conclusion du rapport, dans ses mots.

    Pas de niveau de risque : le rapport n'en qualifie aucun. Il constate des
    indices, ou leur absence sur les éléments examinés.
  -->
  <section class="bloc resultat ton-{s.gravite}" aria-labelledby="tk-resultat">
    <h3 id="tk-resultat" class="surtitre-resultat">Résultat global</h3>
    <p class="phrase-resultat">{s.resultat}</p>
    <p class="portee">
      Cette conclusion porte sur les éléments que l’opérateur a examinés — pas au-delà.
    </p>
  </section>

  <!-- 3 · CONSTATATIONS DIVERSES — les mots du rapport, entiers. -->
  {#if s.constatations.montrer}
    <section class="bloc" aria-labelledby="tk-constat">
      <h3 id="tk-constat" class="titre-bloc">Constatations diverses</h3>
      {#if s.constatations.entrees.length}
        <ul class="citations">
          {#each s.constatations.entrees as c (c.terme)}
            <li>
              <p class="citation">« {c.terme} »</p>
              {#if c.ou}<p class="source-ligne">Localisation portée au rapport&nbsp;: {c.ou}</p>{/if}
            </li>
          {/each}
        </ul>
      {:else if s.constatations.mention}
        <p class="mention">{s.constatations.mention}</p>
      {/if}
    </section>
  {/if}

  <!--
    4 · CE QUI N'A PAS ÉTÉ CONTRÔLÉ — bloc obligatoire, impossible à confondre
    avec les zones contrôlées (§ D de l'ordre).

    « EXAMINÉ + ABSENCE D'INDICE » n'est pas « NON EXAMINÉ » (§ 15).
  -->
  {#if s.nonVisitees.montrer || s.nonExamines.montrer}
    <section class="bloc limites" aria-labelledby="tk-limites">
      <h3 id="tk-limites" class="titre-bloc">
        <span class="pastille attention" aria-hidden="true">?</span>
        Ce qui n’a pas été contrôlé
      </h3>

      {#if s.charpente}
        <p class="avertissement">
          Les combles ou la charpente n’ont pas pu être contrôlés. C’est là que les termites se
          voient&nbsp;: la conclusion du rapport ne porte pas sur eux.
        </p>
      {/if}

      {#if s.nonVisitees.entrees.length}
        <p class="sous-titre-bloc">Pièces non visitées</p>
        <ul class="limites-liste">
          {#each s.nonVisitees.entrees as l (l.quoi)}
            <li>
              <span class="quoi">{l.quoi}</span>
              <span class="statut">Non visitée</span>
              {#if l.pourquoi}<span class="pourquoi">{l.pourquoi}</span>{/if}
            </li>
          {/each}
        </ul>
      {:else if s.nonVisitees.mention}
        <p class="mention">{s.nonVisitees.mention}</p>
      {/if}

      {#if s.nonExamines.entrees.length}
        <p class="sous-titre-bloc">Ouvrages non examinés dans les pièces visitées</p>
        <ul class="limites-liste">
          {#each s.nonExamines.entrees as l (l.quoi)}
            <li>
              {#if l.separe}
                <span class="quoi">{l.quoi}</span>
                <span class="statut">Non examiné</span>
                {#if l.pourquoi}<span class="pourquoi">{l.pourquoi}</span>{/if}
              {:else}
                <!--
                  Les colonnes du rapport n'ont pas pu être démêlées : on CITE
                  plutôt que d'inventer un appariement.
                -->
                <span class="quoi citation">« {l.quoi} »</span>
                <span class="statut">Non examiné</span>
                <span class="pourquoi">
                  Texte du rapport, colonnes non séparées — voir la rubrique&nbsp;G.
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      {:else if s.nonExamines.mention}
        <p class="mention">{s.nonExamines.mention}</p>
      {/if}

      <p class="portee">
        Sur ces zones, le rapport ne conclut rien — ni présence, ni absence.
      </p>
    </section>
  {/if}

  <!--
    5 · COMPLÉTUDE — des FAITS, jamais un score.

    § E : « Ne pas afficher arbitrairement un pourcentage tel que 90 %. »
  -->
  {#if s.completude.length}
    <section class="bloc completude" aria-labelledby="tk-completude">
      <h3 id="tk-completude" class="titre-bloc">Complétude du contrôle</h3>
      {#each s.completude as ligne (ligne)}
        <p class="ligne-completude">{ligne}</p>
      {/each}
    </section>
  {/if}

  <!-- 6 · CONSEIL VERRIÈRE — après les faits, jamais à leur place. -->
  {#if s.conseil.length}
    <section class="bloc conseil" aria-labelledby="tk-conseil">
      <h3 id="tk-conseil" class="titre-bloc">Conseil Verrière</h3>
      {#each s.conseil as ligne (ligne)}
        <p>{ligne}</p>
      {/each}
    </section>
  {/if}

  <!-- 7 · LE RAPPORT SOURCE — toujours accessible (§ 21). -->
  {#if surVoirDansLeRapport}
    <button class="vers-rapport" type="button" onclick={() => surVoirDansLeRapport(s.pages[0])}>
      Voir le rapport complet
      <span class="pages">pages {s.pages[0]} à {s.pages[1]}</span>
    </button>
  {/if}
</article>

<style>
  /*
   * LA CHARTE : ivoire chaud, vert profond, sable en accent DISCRET.
   *
   * « Fond : ivoire chaud, jamais blanc clinique. Vert : profond et
   * architectural. Accent : sable/laiton très discret ; éviter l'effet doré
   * luxueux. Densité : conserver de l'air. »  (§ 6 de l'ordre)
   */
  .termites {
    display: grid;
    gap: var(--pas-4, 1.25rem);
    background: var(--verriere-ivoire, #f7f6f2);
    color: var(--verriere-encre, #0a2b23);
    padding: var(--pas-4, 1.25rem);
    border-radius: 18px;
  }

  .chapeau {
    text-align: center;
    padding-block: var(--pas-3, 1rem) var(--pas-2, 0.5rem);
  }
  .surtitre {
    margin: 0;
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--verriere-sable-encre, #896c33);
  }
  .chapeau h2 {
    margin: var(--pas-1, 0.25rem) 0 0;
    font-size: clamp(1.75rem, 6vw, 2.25rem);
    letter-spacing: 0.04em;
    font-weight: 500;
  }

  .bloc {
    background: #fff;
    border: 1px solid var(--verriere-sable-voile, rgb(200 169 107 / 16%));
    border-radius: 16px;
    padding: var(--pas-4, 1.25rem);
  }
  .titre-bloc {
    margin: 0 0 var(--pas-3, 1rem);
    font-size: 0.8125rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* ── Points clés ─────────────────────────────────────────────────────── */
  .cles {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--pas-3, 1rem);
  }
  .cle {
    display: grid;
    grid-template-columns: 2rem 1fr;
    gap: 0.75rem;
    align-items: start;
  }
  .pastille {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-weight: 700;
    background: var(--vert-300, #a6c39a);
    color: var(--verriere-encre, #0a2b23);
  }
  .ton-attention .pastille,
  .pastille.attention {
    background: var(--verriere-sable-clair, #e4d4b2);
  }
  .ton-alerte .pastille {
    background: #e8b4a8;
  }
  .corps-cle {
    display: grid;
    gap: 0.15rem;
  }
  /* Le statut se lit AUSSI en toutes lettres : jamais la couleur seule. */
  .etiquette-ton {
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--verriere-sable-encre, #896c33);
  }
  .detail-cle {
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  /* ── Résultat global ─────────────────────────────────────────────────── */
  .resultat {
    background: var(--vert-800, #12463b);
    color: #fff;
    border-color: transparent;
  }
  .surtitre-resultat {
    margin: 0 0 var(--pas-2, 0.5rem);
    font-size: 0.75rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 600;
    opacity: 0.8;
  }
  .phrase-resultat {
    margin: 0;
    font-size: clamp(1.125rem, 4.5vw, 1.5rem);
    line-height: 1.35;
    text-wrap: pretty;
  }
  .resultat .portee {
    color: rgb(255 255 255 / 78%);
  }

  /* ── Citations et limites ────────────────────────────────────────────── */
  .citations {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--pas-3, 1rem);
  }
  .citations > li {
    border-left: 3px solid var(--verriere-sable-filet, #d8c199);
    padding-left: var(--pas-3, 1rem);
  }
  .citation {
    margin: 0;
    line-height: 1.55;
    text-wrap: pretty;
  }
  .source-ligne,
  .pourquoi {
    font-size: 0.875rem;
    opacity: 0.75;
  }
  .mention,
  .portee {
    font-size: 0.875rem;
    line-height: 1.5;
    opacity: 0.8;
    margin: var(--pas-2, 0.5rem) 0 0;
  }

  .limites {
    border-color: var(--verriere-sable-filet, #d8c199);
    background: var(--verriere-champagne, #fdfbf6);
  }
  .avertissement {
    margin: 0 0 var(--pas-3, 1rem);
    font-weight: 600;
    line-height: 1.5;
  }
  .sous-titre-bloc {
    margin: var(--pas-3, 1rem) 0 var(--pas-2, 0.5rem);
    font-size: 0.875rem;
    font-weight: 600;
  }
  .limites-liste {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--pas-3, 1rem);
  }
  .limites-liste > li {
    display: grid;
    gap: 0.15rem;
  }
  .quoi {
    font-weight: 600;
    line-height: 1.45;
  }
  /* Le statut est un MOT, pas une couleur. */
  .statut {
    justify-self: start;
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: var(--verriere-sable-clair, #e4d4b2);
    color: var(--verriere-sable-encre, #896c33);
  }

  .completude .ligne-completude {
    margin: 0 0 0.35rem;
    line-height: 1.5;
  }
  .conseil {
    background: var(--verriere-champagne, #fdfbf6);
  }
  .conseil p {
    margin: 0 0 0.6rem;
    line-height: 1.6;
    text-wrap: pretty;
  }

  .vers-rapport {
    display: grid;
    gap: 0.15rem;
    width: 100%;
    padding: var(--pas-4, 1.25rem);
    border: 0;
    border-radius: 16px;
    background: var(--vert-800, #12463b);
    color: #fff;
    font: inherit;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }
  .pages {
    font-weight: 400;
    font-size: 0.8125rem;
    opacity: 0.75;
  }

  /* Mobile : rien d'important au survol, et aucune troncature. */
  @media (max-width: 480px) {
    .termites {
      padding: var(--pas-3, 1rem);
    }
    .bloc {
      padding: var(--pas-3, 1rem);
    }
  }
</style>
