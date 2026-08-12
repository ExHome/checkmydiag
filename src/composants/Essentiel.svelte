<script lang="ts">
  /**
   * Ce que l'analyse a trouvé dans le dossier, classé par ce que ça change.
   *
   * Pas un sommaire — un sommaire recopie l'ordre du rapport et met le numéro
   * de dossier au même niveau qu'une classe G. Ici on trie : ce qui coûte
   * d'abord, ce qui reste à vérifier ensuite, les chiffres du logement, et
   * seulement à la fin ce qui ne demande rien.
   *
   * Chaque ligne vient du rapport et renvoie à la page où c'est écrit.
   */
  import type { Analyse, Diagnostic, TypeDiag } from '../lib/modele';
  import { libelleCourt } from '../lib/libelle';
  import { enPratique, FICHES } from '../lib/analyse/fiches';

  interface Props {
    analyse: Analyse;
    /** Ouvre le passage du rapport où l'élément est écrit. */
    allerA: (type: TypeDiag) => void;
  }

  const { analyse, allerA }: Props = $props();

  interface Element {
    /** Le fait, tel que le rapport le dit. */
    quoi: string;
    /** De quel diagnostic ça vient. « Anomalies » tout seul ne dit rien. */
    source?: string;
    /** Ce que ça change. Des points, jamais un paragraphe. */
    donc?: string[];
    type?: TypeDiag;
  }

  function elementDe(d: Diagnostic): Element {
    return {
      quoi: libelleCourt(d),
      source: d.titre,
      donc: (enPratique(d.type, d.gravite) ?? FICHES[d.type].vente)
        .split(/(?<=\.)\s+/)
        .filter(Boolean),
      type: d.type
    };
  }

  /* Ce qui coûte : les diagnostics en alerte, et les pièces qui manquent ou
     qui ont expiré — un dossier incomplet bloque la signature. */
  const bloque = $derived.by<Element[]>(() => [
    ...analyse.diagnostics.filter((d) => d.gravite === 'alerte').map(elementDe),
    ...analyse.controles
      .filter((c) => c.genre === 'perime' || c.genre === 'manque')
      .map((c) => ({
        quoi: c.titre,
        donc: c.quoiFaire.split(/(?<=\.)\s+/).filter(Boolean),
        ...(c.type ? { type: c.type } : {})
      }))
  ]);

  /* À regarder : les anomalies qui ne bloquent rien mais se négocient, et les
     écarts que le dossier n'explique pas. */
  const aVoir = $derived.by<Element[]>(() => [
    ...analyse.diagnostics.filter((d) => d.gravite === 'attention').map(elementDe),
    ...analyse.controles
      .filter((c) => c.genre === 'incoherence' || c.genre === 'attention')
      .map((c) => ({
        quoi: c.titre,
        donc: c.quoiFaire.split(/(?<=\.)\s+/).filter(Boolean),
        ...(c.type ? { type: c.type } : {})
      }))
  ]);

  /**
   * Les chiffres du logement.
   *
   * On écarte les dates et les références : ce sont des données de dossier, pas
   * des chiffres qui décrivent le bien. Ne restent que ceux qui reviennent dans
   * l'annonce, dans l'acte, et dans les discussions de prix.
   */
  const REFERENCE = /date|dossier|num[ée]ro|ademe|arr[êe]t[ée]|[ée]tabli|certifi|norme/i;
  const CHIFFRE = /\d/;

  const chiffres = $derived.by<Element[]>(() => {
    const liste: Element[] = [];
    const dpe = analyse.diagnostics.find((d) => d.type === 'dpe');

    if (dpe?.schema?.genre === 'dpe' && dpe.schema.finale) {
      liste.push({
        quoi: `Classe ${dpe.schema.finale}`,
        source: 'Performance énergétique',
        donc: explicationClasse(dpe),
        type: 'dpe'
      });
    }

    const vus = new Set<string>();
    for (const d of analyse.diagnostics) {
      for (const fait of d.faits.slice(0, 2)) {
        if (REFERENCE.test(fait.libelle) || !CHIFFRE.test(fait.valeur)) continue;
        const quoi = `${fait.valeur} — ${fait.libelle.toLowerCase()}`;
        if (vus.has(quoi)) continue;
        vus.add(quoi);
        liste.push({
          quoi,
          source: d.titre,
          ...(fait.precision ? { donc: [fait.precision] } : {}),
          type: d.type
        });
      }
    }
    return liste;
  });

  /**
   * D'où sort la lettre.
   *
   * C'est la question que tout le monde se pose et à laquelle le rapport ne
   * répond jamais : on a mesuré une consommation, on l'a divisée par la surface
   * chauffée, et on a regardé dans quelle tranche ça tombe. Le reste — les
   * parois nues — explique pourquoi la consommation est là où elle est.
   */
  function explicationClasse(d: Diagnostic): string[] {
    if (d.schema?.genre !== 'dpe') return ['Obligatoire dans l’annonce.'];

    const morceaux: string[] = [];
    const surface = d.faits.find((f) => /surface/i.test(f.libelle))?.valeur;
    const conso = d.schema.energie;
    const climat = d.schema.climat;

    // Le calcul, en clair : une consommation, une division, une tranche.
    if (conso) {
      const t = TRANCHE[conso.lettre];
      morceaux.push(
        `${conso.valeur} ${conso.unite}${surface ? ` — la consommation calculée du logement divisée par ${surface}` : ''}. Ça tombe dans la tranche ${conso.lettre}${t ? ` (${t})` : ''}.`
      );
    }

    // La deuxième note, quand elle est la plus mauvaise des deux.
    if (climat && conso && climat.lettre > conso.lettre) {
      morceaux.push(
        `Le CO₂ note ${climat.lettre} : c’est lui qui tire la lettre vers le bas, pas la consommation.`
      );
    }

    // Et l'enveloppe : d'où vient cette consommation.
    const nues = Object.entries(d.schema.isolation)
      .filter(([, etat]) => etat === 'nonIsole')
      .map(([paroi]) => PAROI[paroi] ?? paroi);
    const faites = Object.entries(d.schema.isolation)
      .filter(([, etat]) => etat === 'isole')
      .map(([paroi]) => PAROI[paroi] ?? paroi);

    // Deux points séparés plutôt qu'une phrase à accorder : « les fenêtres » est
    // pluriel même seul, et toute tournure conjuguée finit par sonner faux.
    if (nues.length) {
      morceaux.push(`Sans isolant, d’après le rapport : ${nues.join(', ')}.`);
    }
    if (faites.length) {
      morceaux.push(`Isolé, en revanche : ${faites.join(', ')}.`);
    }

    // Poste par poste : où passent ces kilowattheures. C'est la ligne qui dit
    // sur quoi agir en premier.
    for (const poste of d.schema.postes.slice(0, 5)) {
      morceaux.push(
        `${poste.nom} : ${Math.round(poste.kwh)} kWh${poste.cout ? ` — ${poste.cout}` : ''}.`
      );
    }

    return morceaux;
  }

  /** Les bornes de l'arrêté du 31 mars 2021, en kWh/m²/an. */
  const TRANCHE: Record<string, string> = {
    A: 'moins de 70',
    B: 'de 70 à 110',
    C: 'de 110 à 180',
    D: 'de 180 à 250',
    E: 'de 250 à 330',
    F: 'de 330 à 420',
    G: 'plus de 420'
  };

  const PAROI: Record<string, string> = {
    murs: 'les murs',
    toit: 'le toit',
    plancher: 'le plancher',
    fenetres: 'les fenêtres'
  };

  /* Ce qui ne demande rien. On en retire ce qui figure déjà plus haut : un
     termites périmé ne peut pas être « rien à signaler ». */
  const cites = $derived(new Set([...bloque, ...aVoir].map((e) => e.type)));
  const tranquilles = $derived(
    analyse.diagnostics.filter((d) => d.gravite === 'bon' && !cites.has(d.type))
  );

  const GROUPES = $derived([
    { cle: 'bloque', titre: 'Ce qui coûte', elements: bloque },
    { cle: 'voir', titre: 'À regarder avant de signer', elements: aVoir },
    { cle: 'chiffres', titre: 'Les chiffres du logement', elements: chiffres }
  ]);
</script>

<section class="essentiel">
  {#each GROUPES as groupe (groupe.cle)}
    {#if groupe.elements.length}
      <div class="groupe {groupe.cle}">
        <p class="eyebrow">{groupe.titre}</p>

        <ul>
          {#each groupe.elements as e, i (groupe.cle + i)}
            <li>
              <button type="button" onclick={() => e.type && allerA(e.type)}>
                {#if e.source}
                  <span class="source">{e.source}</span>
                {/if}
                <span class="quoi">{e.quoi}</span>
                {#if e.donc?.length}
                  <ul class="donc">
                    {#each e.donc as point}
                      <li>{point}</li>
                    {/each}
                  </ul>
                {/if}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/each}

  {#if tranquilles.length}
    <p class="rien">
      <span class="eyebrow-inline">Rien à signaler</span>
      {#each tranquilles as d, i (d.type)}<button
          type="button"
          class="calme"
          onclick={() => allerA(d.type)}>{d.titre}</button
        >{i < tranquilles.length - 1 ? ' · ' : ''}{/each}
    </p>
  {/if}
</section>

<style>
  .essentiel {
    margin-bottom: 34px;
    display: grid;
    gap: 26px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1px;
  }

  button {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    border-left: 3px solid var(--gravite, var(--gris));
    padding: 12px 0 12px 16px;
    cursor: pointer;
    color: var(--sur-fond);
    transition: background 0.18s ease, padding-left 0.18s ease;
  }

  button:hover {
    background: rgb(255 255 255 / 7%);
    padding-left: 20px;
  }

  /* Ce qui coûte se voit au liseré rouge ; ce qui se regarde à l'ambre ; les
     chiffres restent dorés — ils ne sont ni bons ni mauvais. */
  .bloque {
    --gravite: #c0503c;
  }
  .voir {
    --gravite: #c98a2e;
  }
  .chiffres {
    --gravite: var(--or);
  }

  /* De quel diagnostic vient la ligne. « Anomalies » tout seul ne dit rien. */
  .source {
    display: block;
    margin-bottom: 3px;
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gris);
  }

  .quoi {
    display: block;
    font-family: var(--police-titre);
    font-weight: 500;
    font-size: 1.12rem;
    letter-spacing: -0.022em;
    line-height: 1.2;
  }

  /* Des points, jamais un paragraphe. */
  .donc {
    list-style: none;
    margin: 6px 0 0;
    padding: 0;
    display: grid;
    gap: 3px;
  }

  .donc li {
    position: relative;
    padding-left: 15px;
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--sur-fond-doux);
  }

  .donc li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.6em;
    width: 5px;
    height: 5px;
    border-radius: 1px;
    background: var(--gravite, var(--gris));
  }

  /* Le reste du dossier, en une ligne : c'est fait, on passe. */
  .rien {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 8px;
    margin: 0;
    padding-top: 18px;
    border-top: 1px solid rgb(255 255 255 / 10%);
    font-size: 0.88rem;
    color: var(--sur-fond-doux);
  }

  .eyebrow-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 6px;
    font-size: 0.74rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gris);
  }

  .eyebrow-inline::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4c9c72;
  }

  .calme {
    display: inline;
    width: auto;
    border: none;
    padding: 0;
    color: var(--sur-fond-doux);
    font-size: 0.88rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: rgb(255 255 255 / 25%);
  }

  .calme:hover {
    background: none;
    padding-left: 0;
    color: var(--sur-fond);
  }
</style>
