<script lang="ts">
  /**
   * Toutes les surfaces, pièce par pièce.
   *
   * « Tu dois mettre les détails du rapport qui ont une importance pour la
   * Carrez, on veut connaître toutes les surfaces. »
   *
   * Le tableau existait dans le rapport et dans le moteur — `piecesMesurees()`
   * le relevait ligne par ligne — mais l'écran n'en montrait qu'un total. Le
   * lecteur voyait « 42 m² » sans savoir d'où venaient ces mètres, ni pourquoi
   * son logement paraît plus petit sur le papier que dans la réalité.
   *
   * ── Les deux colonnes, et pourquoi elles diffèrent ────────────────────────
   *
   * `privative` est ce qui compte au sens de la loi ; `auSol` est ce que la
   * pièce fait réellement. L'écart n'est pas une subtilité de calcul : sous
   * 1,80 m de hauteur, la surface ne compte pas, et certaines pièces entières
   * — cave, terrasse, garage — ne comptent pas du tout.
   *
   * C'est exactement ce que la ligne à 0 m² raconte, et c'est la ligne la plus
   * utile du tableau : elle nomme ce qui existe et qui ne se vend pas.
   *
   * ── Ce qu'on n'écrit pas ──────────────────────────────────────────────────
   *
   * Aucune somme de notre fabrication. Les totaux affichés sont ceux que le
   * rapport imprime ; s'ils manquent, la ligne de total disparaît plutôt que
   * d'additionner nous-mêmes des chiffres que le certificat n'a pas validés.
   */

  interface Piece {
    nom: string;
    privative: number;
    auSol: number;
  }

  const {
    pieces,
    totalPrivative,
    totalAuSol
  }: { pieces: Piece[]; totalPrivative: number | null; totalAuSol: number | null } = $props();

  const fr = (n: number): string =>
    n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

  /**
   * Le niveau et la pièce, séparés.
   *
   * Le certificat écrit « Rez de chaussée - Séjour », « 1er étage - Chambre
   * 01 » : le niveau est une vraie information — savoir qu'une chambre est en
   * sous-sol change ce qu'on en pense — mais répété à chaque ligne, il devient
   * du bruit et pousse le nom de la pièce hors de vue.
   *
   * On le sort donc en tête de groupe, une fois. Quand le rapport n'écrit pas
   * de niveau, il n'y a qu'un groupe et pas d'intitulé : on n'invente pas un
   * étage.
   */
  const decouper = (nom: string): { niveau: string | null; piece: string } => {
    /* Le separateur porte des ESPACES : « Rez de jardin - Cave ». Sans cette
       exigence, « Sous-sol - Cave » se coupait sur le tiret du mot compose et
       donnait le niveau « Sous » pour la piece « sol - Cave ». */
    const m = /^(.{2,32}?)\s+[-–—]\s+(.+)$/.exec(nom.trim());
    return m?.[1] && m[2] ? { niveau: m[1].trim(), piece: m[2].trim() } : { niveau: null, piece: nom.trim() };
  };

  const propre = (nom: string): string => decouper(nom).piece;

  /** Les pièces, groupées par niveau, dans l'ordre du rapport. */
  const parNiveau = $derived.by(() => {
    const groupes = new Map<string, { nom: string; piece: string; privative: number; auSol: number }[]>();
    for (const p of pieces) {
      const { niveau, piece } = decouper(p.nom);
      const cle = niveau ?? '';
      const liste = groupes.get(cle) ?? [];
      liste.push({ nom: p.nom, piece, privative: p.privative, auSol: p.auSol });
      groupes.set(cle, liste);
    }
    return [...groupes.entries()];
  });

  const horsCompte = $derived(pieces.filter((p) => p.privative === 0));

  /**
   * LA SOMME DOIT TOMBER SUR LE TOTAL DU RAPPORT.
   *
   * Mesuré sur 60 dossiers du corpus : les 33 certificats trouvés portent tous
   * ce tableau — mais sur 32 dont le total est lisible, 5 ne s'additionnent
   * pas. Un dossier donne 1 457,93 m² de lignes pour 22,93 m² annoncés (des
   * nombres d'un autre tableau ramassés au passage), un autre 0 m² de lignes
   * pour 19,2 m² annoncés (aucune ligne reconnue).
   *
   * Un tableau qu'on additionne et qui ne donne pas le total imprimé juste en
   * dessous est pire que pas de tableau : le lecteur croit que le certificat se
   * contredit, alors que c'est notre lecture qui a fauté. On se tait donc, et
   * on dit pourquoi — le total, lui, reste affiché ailleurs dans la fiche.
   *
   * La tolérance couvre les arrondis au centième, ligne par ligne : quinze
   * centièmes, ou un demi pour cent du total sur les grands biens.
   */
  const sommeFiable = $derived.by(() => {
    if (totalPrivative === null) return true;
    const somme = pieces.reduce((n, p) => n + p.privative, 0);
    const marge = Math.max(0.15, totalPrivative * 0.005);
    return Math.abs(somme - totalPrivative) <= marge;
  });
</script>

{#if pieces.length && !sommeFiable}
  <!-- Le tableau a été lu, mais il ne s'additionne pas : on ne le montre pas.
       Voir `sommeFiable` — 5 dossiers sur 32 dans le corpus mesuré. -->
  <p class="lecture-douteuse">
    Ce certificat détaille les surfaces pièce par pièce, mais leur relevé ne
    retombe pas sur le total du rapport&nbsp;: le détail n’est pas affiché
    plutôt que de vous en montrer un faux. Le tableau figure dans votre
    rapport.
  </p>
{:else if pieces.length}
  <div class="surfaces">
    <p class="compte">
      Le certificat détaille <b>{pieces.length}</b>
      {pieces.length > 1 ? 'pièces' : 'pièce'}.
    </p>

    <!-- Un vrai tableau : deux nombres par ligne qui doivent s'aligner en
         colonnes pour être comparés. Une liste de cartes empêcherait justement
         la lecture verticale qui fait comprendre l'écart. -->
    <div class="cadre">
      <table>
        <thead>
          <tr>
            <th scope="col">Pièce</th>
            <th scope="col" class="nombre">Compté</th>
            <th scope="col" class="nombre">Au sol</th>
          </tr>
        </thead>
        {#each parNiveau as [niveau, lignes] (niveau)}
          <tbody>
            {#if niveau}
              <tr class="niveau">
                <th scope="colgroup" colspan="3">{niveau}</th>
              </tr>
            {/if}
            {#each lignes as p (p.nom)}
              <tr class:nulle={p.privative === 0}>
                <th scope="row">{p.piece}</th>
                <td class="nombre">
                  {#if p.privative === 0}
                    <span class="zero">ne compte pas</span>
                  {:else}
                    {fr(p.privative)}&nbsp;m²
                  {/if}
                </td>
                <td class="nombre">{fr(p.auSol)}&nbsp;m²</td>
              </tr>
            {/each}
          </tbody>
        {/each}
        {#if totalPrivative !== null || totalAuSol !== null}
          <tfoot>
            <tr>
              <th scope="row">Total du rapport</th>
              <td class="nombre">{totalPrivative !== null ? `${fr(totalPrivative)} m²` : '—'}</td>
              <td class="nombre">{totalAuSol !== null ? `${fr(totalAuSol)} m²` : '—'}</td>
            </tr>
          </tfoot>
        {/if}
      </table>
    </div>

    {#if horsCompte.length}
      <p class="note">
        {horsCompte.length > 1 ? 'Ces pièces existent' : 'Cette pièce existe'} et
        {horsCompte.length > 1 ? 'se visitent' : 'se visite'}, mais
        {horsCompte.length > 1 ? 'ne comptent' : 'ne compte'} pas dans la surface
        vendue&nbsp;: {horsCompte.map((p) => propre(p.nom)).join(', ')}.
      </p>
    {/if}
  </div>
{/if}

<style>
  .surfaces {
    margin-top: var(--e3);
  }

  /* On dit qu'on ne montre pas, et pourquoi. Le ton reste celui d'une réserve,
     pas d'une alerte : le rapport n'a rien fait de mal. */
  .lecture-douteuse {
    margin: var(--e3) 0 0;
    padding: var(--e3) var(--e4);
    border-left: 3px solid var(--trait);
    border-radius: 0 var(--rayon) var(--rayon) 0;
    background: var(--surface);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  .compte {
    margin: 0 0 var(--e3);
    font-size: var(--t-base);
    color: var(--sur-fond);
  }

  .compte b {
    font-weight: 700;
  }

  /* Le tableau défile dans son propre cadre : sur un téléphone, trois colonnes
     de chiffres n'entrent pas, et c'est le tableau qui doit glisser — jamais la
     page entière. */
  .cadre {
    overflow-x: auto;
    border-radius: var(--rayon-petit);
    background: var(--surface);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--t-petit);
    color: var(--sur-fond);
  }

  th,
  td {
    padding: 9px var(--e3);
    text-align: left;
    white-space: nowrap;
  }

  thead th {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
    border-bottom: 1px solid var(--trait);
  }

  tbody th {
    font-weight: 500;
    white-space: normal;
  }

  tbody tr + tr th,
  tbody tr + tr td {
    border-top: 1px solid color-mix(in srgb, var(--trait) 55%, transparent);
  }

  /* Le niveau, une fois par groupe. Il se lit comme un intertitre, pas comme
     une pièce : petites capitales, pas de filet au-dessus du premier. */
  .niveau th {
    padding-top: var(--e3);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  tbody + tbody .niveau th {
    border-top: 1px solid var(--trait);
  }

  /* Les nombres s'alignent à droite et sur la même chasse : c'est la seule
     façon de comparer deux colonnes de mètres d'un coup d'œil. */
  .nombre {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* La ligne qui ne compte pas s'écrit en toutes lettres. Un « 0 m² » se lirait
     comme une mesure ratée ; ce n'en est pas une, c'est une règle. */
  .nulle th {
    color: var(--sur-fond-doux);
  }

  .zero {
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    color: var(--sur-fond-doux);
  }

  tfoot th,
  tfoot td {
    border-top: 2px solid var(--trait);
    font-weight: 700;
  }

  .note {
    margin: var(--e3) 0 0;
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }
</style>
