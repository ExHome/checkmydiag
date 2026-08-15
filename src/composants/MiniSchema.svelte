<script lang="ts">
  /**
   * Un dessin par notion, et chaque partie du dessin s'explique.
   *
   * Ce ne sont pas des illustrations : ce sont les explications elles-mêmes. On
   * touche une zone — le garage, la case cochée, le piquet de terre — et elle
   * dit ce qu'elle fait là. Tout ce qu'il faut savoir sur la notion tient sur
   * le schéma ; il n'y a rien à lire à côté.
   */
  const { id }: { id: string } = $props();

  interface Zone {
    cle: string;
    nom: string;
    points: string[];
  }

  /** Ce que dit chaque partie du dessin, en trois mots par ligne. */
  const ZONES: Record<string, Zone[]> = {
    surface: [
      {
        cle: 'chauffe',
        nom: 'Les pièces chauffées',
        points: ['Salon, chambres, couloirs, placards', 'Tout ce qui est chauffé compte', 'Y compris sous les combles aménagés']
      },
      {
        cle: 'garage',
        nom: 'Le garage',
        points: ['Non chauffé → hors surface', 'Même s’il est accolé', 'Même s’il communique avec la maison']
      },
      {
        cle: 'cave',
        nom: 'La cave',
        points: ['Non chauffée → hors surface', 'Comme le grenier et le balcon', 'Elle compte pour le plancher bas, pas pour la surface']
      }
    ],

    cout: [
      {
        cle: 'dedans',
        nom: 'Les cinq postes comptés',
        points: ['Chauffage et eau chaude', 'Refroidissement s’il y en a', 'Éclairage et ventilation']
      },
      {
        cle: 'dehors',
        nom: 'Ce qui n’est pas compté',
        points: ['Électroménager, plaques, four', 'Télé, box, ordinateurs', 'Votre facture réelle sera donc plus élevée']
      }
    ],

    co2: [
      {
        cle: 'fossile',
        nom: 'Fioul et gaz',
        points: ['On brûle du carbone', 'Beaucoup de CO₂ par kWh', 'C’est ce qui déclasse un logement pourtant économe']
      },
      {
        cle: 'propre',
        nom: 'Électricité et bois',
        points: ['Presque pas de CO₂ en France', 'Nucléaire et renouvelable', 'Sortir du fioul fait gagner plusieurs lettres']
      }
    ],

    validite: [
      {
        cle: 'valide',
        nom: 'La période valable',
        points: ['Elle court à partir de la visite', 'Pas de la date d’envoi', '10 ans pour un DPE']
      },
      {
        cle: 'perime',
        nom: 'Après',
        points: ['Le document ne vaut plus rien', 'À refaire pour vendre ou louer', 'Le notaire le réclamera']
      }
    ],

    classes: [
      {
        cle: 'saines',
        nom: 'Classes 0, 1 et 2',
        points: ['0 : pas de plomb', '1 et 2 : plomb présent, revêtement tenu', 'Rien à faire, on surveille']
      },
      {
        cle: 'trois',
        nom: 'La classe 3',
        points: ['Peinture écaillée, poussière au sol', 'Travaux obligatoires', 'Occupants et entreprises à prévenir']
      }
    ],

    case: [
      {
        cle: 'vide',
        nom: 'La case non cochée',
        points: ['Les deux phrases sont imprimées', 'Celle-ci ne s’applique pas', 'C’est la case, pas le texte, qui décide']
      },
      {
        cle: 'cochee',
        nom: 'La case cochée',
        points: ['C’est elle qui dit le résultat', 'Sur un scan, elle passe parfois inaperçue', 'En cas de doute : la synthèse du dossier']
      }
    ],

    'pont-thermique': [
      {
        cle: 'isolant',
        nom: 'L’isolant',
        points: ['Il coupe le passage du froid', 'Efficace tant qu’il est continu']
      },
      {
        cle: 'trou',
        nom: 'La rupture',
        points: ['Jonction de mur, contour de fenêtre, balcon', 'Le froid y passe comme dans un couloir', 'C’est là qu’apparaissent les taches noires']
      }
    ],

    terre: [
      {
        cle: 'tableau',
        nom: 'Le tableau',
        points: ['Le différentiel y est logé', 'Il coupe quand le courant fuit', 'En 30 millièmes de seconde']
      },
      {
        cle: 'piquet',
        nom: 'Le piquet de terre',
        points: ['Planté dans le sol, relié au tableau', 'Il donne au courant un chemin plus facile que vous', 'Sans lui, le différentiel ne peut rien']
      },
      {
        cle: 'perso',
        nom: 'Vous',
        points: ['Le courant cherche le sol', 'Sans terre, il passe par votre corps', 'Avec terre, il vous ignore']
      }
    ],

    vmc: [
      {
        cle: 'entrant',
        nom: 'L’air neuf',
        points: ['Il entre par les grilles des fenêtres', 'Les boucher = tout arrêter']
      },
      {
        cle: 'moteur',
        nom: 'Le moteur',
        points: ['Il tire en permanence', 'Souvent dans les combles', 'Un moteur mort est silencieux : on ne le remarque pas']
      },
      {
        cle: 'sortant',
        nom: 'L’air humide',
        points: ['Extrait par la cuisine et la salle de bains', 'Sans lui : condensation, moisissures', 'C’est un poste du calcul du DPE']
      }
    ],

    fibrociment: [
      {
        cle: 'intacte',
        nom: 'La plaque intacte',
        points: ['Les fibres sont prises dans le ciment', 'Aucun danger tant qu’on n’y touche pas', 'On la laisse en place et on surveille']
      },
      {
        cle: 'percee',
        nom: 'La plaque cassée',
        points: ['Percer, scier, casser libère les fibres', 'Invisibles, elles restent en l’air des heures', 'Retrait par une entreprise certifiée']
      }
    ],

    listes: [
      {
        cle: 'a',
        nom: 'Liste A',
        points: ['Flocages, calorifugeages, faux plafonds', 'Friables : ils poudrent au moindre choc', 'Les plus dangereux']
      },
      {
        cle: 'b',
        nom: 'Liste B',
        points: ['Dalles de sol, conduits, toitures', 'Non friables : stables tant qu’intacts', 'Les plus fréquents en logement']
      },
      {
        cle: 'c',
        nom: 'Liste C',
        points: ['Cherchée seulement avant démolition', 'Le repérage va alors jusque dans les murs']
      }
    ],

    identite: [
      {
        cle: 'dossier',
        nom: 'Le numéro de dossier',
        points: ['La référence du diagnostiqueur', 'La même pour tout le dossier', 'À citer pour toute réclamation']
      },
      {
        cle: 'bien',
        nom: 'Le bien',
        points: ['Adresse, étage, références cadastrales', 'C’est ce qui rattache le rapport à ce logement', 'Une erreur ici rend le document contestable']
      },
      {
        cle: 'date',
        nom: 'La date',
        points: ['Le jour de la visite', 'La validité court à partir de là']
      },
      {
        cle: 'qui',
        nom: 'Le diagnostiqueur',
        points: ['Certifié par un organisme agréé', 'Assuré pour cette mission', 'Vérifiable sur l’annuaire du ministère']
      }
    ],

    energie: [
      {
        cle: 'primaire',
        nom: 'L’énergie primaire',
        points: ['Ce qu’il a fallu produire à la source', 'Électricité : ×1,9 (×2,3 avant 2026)', 'Gaz, fioul, bois : ×1']
      },
      {
        cle: 'finale',
        nom: 'L’énergie finale',
        points: ['Ce qui arrive au compteur', 'C’est ce que vous payez', 'Toujours plus basse que la primaire']
      },
      {
        cle: 'chez',
        nom: 'Chez vous',
        points: ['Le DPE affiche la primaire', 'D’où un tout-électrique noté plus sévèrement', 'Pour vos factures, regardez la finale']
      }
    ],

    perimetre: [
      {
        cle: 'visible',
        nom: 'Ce qui a été vu',
        points: ['Contrôlé à l’œil nu', 'Sans démontage ni destruction', 'C’est là-dessus que porte la conclusion']
      },
      {
        cle: 'ferme',
        nom: 'Ce qui n’a pas été vu',
        points: ['Derrière un meuble, un mur fermé, un vide sanitaire', 'Jamais contrôlé, jamais garanti', 'C’est la limite de tous ces diagnostics']
      }
    ],

    obligation: [
      {
        cle: 'avant49',
        nom: 'Avant 1949',
        points: ['Peintures au plomb autorisées', 'Constat plomb obligatoire', 'Et amiante aussi']
      },
      {
        cle: 'entre',
        nom: 'De 1949 à 1997',
        points: ['Amiante encore autorisée', 'Repérage amiante obligatoire', 'Plus de plomb à chercher']
      },
      {
        cle: 'apres',
        nom: 'Après 1997',
        points: ['Les deux matériaux sont interdits', 'Ni plomb ni amiante à chercher']
      }
    ]
  };

  let choisi = $state<string | null>(null);
  const zones = $derived(ZONES[id] ?? []);
  const detail = $derived(zones.find((z) => z.cle === choisi) ?? null);

  function toucher(cle: string): void {
    choisi = choisi === cle ? null : cle;
  }

  function clavier(e: KeyboardEvent, cle: string): void {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    toucher(cle);
  }
</script>

{#snippet zone(cle: string, contenu: import('svelte').Snippet)}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <g
    class="zone"
    class:actif={choisi === cle}
    class:efface={choisi !== null && choisi !== cle}
    role="button"
    tabindex="0"
    onclick={() => toucher(cle)}
    onkeydown={(e) => clavier(e, cle)}
  >
    {@render contenu()}
  </g>
{/snippet}

<figure>
  {#if zones.length}
    <p class="invite">Touchez le schéma.</p>
  {/if}

  {#if id === 'surface'}
    <svg viewBox="0 0 300 96" aria-label="Le plan compte les pièces chauffées, pas le garage ni la cave.">
      {#snippet piecesChauffees()}
        <rect x="10" y="16" width="150" height="64" rx="4" class="dedans" />
        <path d="M78 16v64M10 50h68" class="cloison" />
        <text x="85" y="46" class="oui">chauffé</text>
        <text x="85" y="62" class="oui">= compté</text>
      {/snippet}
      {@render zone('chauffe', piecesChauffees)}

      {#snippet garage()}
        <rect x="176" y="16" width="52" height="64" rx="4" class="dehors" />
        <text x="202" y="52" class="non">garage</text>
      {/snippet}
      {@render zone('garage', garage)}

      {#snippet cave()}
        <rect x="238" y="16" width="52" height="64" rx="4" class="dehors" />
        <text x="264" y="52" class="non">cave</text>
      {/snippet}
      {@render zone('cave', cave)}
    </svg>
  {:else if id === 'cout'}
    <svg viewBox="0 0 300 96" aria-label="Le coût compte cinq usages, pas l’électroménager.">
      {#snippet comptes()}
        {#each ['chauffage', 'eau chaude', 'clim', 'lumière', 'VMC'] as usage, i}
          <g transform="translate({8 + i * 58} 14)">
            <rect x="0" y="0" width="50" height="34" rx="8" class="dedans" />
            <text x="25" y="21" class="mini oui">{usage}</text>
          </g>
        {/each}
      {/snippet}
      {@render zone('dedans', comptes)}

      {#snippet hors()}
        {#each ['électroménager', 'télé, box'] as h, i}
          <g transform="translate({40 + i * 130} 58)">
            <rect x="0" y="0" width="120" height="30" rx="8" class="dehors" />
            <text x="60" y="20" class="mini non">{h}</text>
          </g>
        {/each}
      {/snippet}
      {@render zone('dehors', hors)}
    </svg>
  {:else if id === 'co2'}
    <svg viewBox="0 0 300 96" aria-label="Le fioul et le gaz émettent beaucoup, l’électricité et le bois beaucoup moins.">
      {#snippet fossiles()}
        {#each [{ n: 'fioul', h: 62 }, { n: 'gaz', h: 46 }] as e, i}
          <g transform="translate({26 + i * 68} 0)">
            <rect x="0" y={74 - e.h} width="40" height={e.h} rx="5" class="barre-mal" />
            <text x="20" y="90" class="mini">{e.n}</text>
          </g>
        {/each}
      {/snippet}
      {@render zone('fossile', fossiles)}

      {#snippet propres()}
        {#each [{ n: 'élec', h: 20 }, { n: 'bois', h: 10 }] as e, i}
          <g transform="translate({162 + i * 68} 0)">
            <rect x="0" y={74 - e.h} width="40" height={e.h} rx="5" class="barre-bon" />
            <text x="20" y="90" class="mini">{e.n}</text>
          </g>
        {/each}
      {/snippet}
      {@render zone('propre', propres)}
    </svg>
  {:else if id === 'validite'}
    <svg viewBox="0 0 300 70" aria-label="Frise de validité : dix ans pour le DPE.">
      <line x1="20" y1="36" x2="280" y2="36" class="axe" />

      {#snippet valable()}
        <rect x="20" y="26" width="200" height="20" rx="10" class="valide" />
        <text x="120" y="20" class="mini oui">valable 10 ans</text>
        <circle cx="20" cy="36" r="5" class="borne" />
      {/snippet}
      {@render zone('valide', valable)}

      {#snippet apres()}
        <rect x="220" y="26" width="60" height="20" rx="10" class="perime" />
        <text x="250" y="20" class="mini non">périmé</text>
        <circle cx="220" cy="36" r="5" class="borne" />
      {/snippet}
      {@render zone('perime', apres)}
    </svg>
  {:else if id === 'classes'}
    <svg viewBox="0 0 300 80" aria-label="Échelle des classes de plomb, de 0 à 3.">
      {#snippet saines()}
        {#each [{ n: '0', t: 'pas de plomb' }, { n: '1', t: 'intacte' }, { n: '2', t: 'usée' }] as c, i}
          <g transform="translate({10 + i * 72} 12)">
            <rect x="0" y="0" width="62" height="40" rx="8" class="dedans" />
            <text x="31" y="26" class="chiffre">{c.n}</text>
            <text x="31" y="62" class="mini">{c.t}</text>
          </g>
        {/each}
      {/snippet}
      {@render zone('saines', saines)}

      {#snippet trois()}
        <g transform="translate(226 12)">
          <rect x="0" y="0" width="62" height="40" rx="8" class="dehors" />
          <text x="31" y="26" class="chiffre non">3</text>
          <text x="31" y="62" class="mini non">dégradée</text>
        </g>
      {/snippet}
      {@render zone('trois', trois)}
    </svg>
  {:else if id === 'case'}
    <svg viewBox="0 0 300 86" aria-label="Deux phrases imprimées, une seule cochée.">
      {#snippet vide()}
        <rect x="14" y="14" width="20" height="20" rx="4" class="case" />
        <line x1="46" y1="24" x2="286" y2="24" class="texte-faux" />
        <line x1="46" y1="34" x2="200" y2="34" class="texte-faux" />
      {/snippet}
      {@render zone('vide', vide)}

      {#snippet cochee()}
        <rect x="14" y="52" width="20" height="20" rx="4" class="case cochee" />
        <path d="M18 62 l5 5 9 -11" class="coche" />
        <line x1="46" y1="62" x2="286" y2="62" class="texte-vrai" />
        <line x1="46" y1="72" x2="240" y2="72" class="texte-vrai" />
      {/snippet}
      {@render zone('cochee', cochee)}
    </svg>
  {:else if id === 'pont-thermique'}
    <svg viewBox="0 0 300 96" aria-label="L’isolant s’interrompt à la jonction : le froid passe.">
      {#snippet isolant()}
        <rect x="20" y="20" width="120" height="26" class="isolant" />
        <rect x="180" y="20" width="100" height="26" class="isolant" />
      {/snippet}
      {@render zone('isolant', isolant)}

      <rect x="20" y="46" width="260" height="30" class="paroi" />

      {#snippet rupture()}
        <rect x="140" y="20" width="40" height="26" class="trou" />
        <path d="M160 14 v-8 M152 8 l8 -8 8 8" class="fleche-froid" />
        <text x="160" y="92" class="mini non">le froid passe ici</text>
      {/snippet}
      {@render zone('trou', rupture)}
    </svg>
  {:else if id === 'terre'}
    <svg viewBox="0 0 300 96" aria-label="Le courant qui fuit part dans la terre au lieu de passer par vous.">
      {#snippet tableau()}
        <rect x="30" y="18" width="60" height="44" rx="5" class="dedans" />
        <text x="60" y="44" class="mini oui">tableau</text>
      {/snippet}
      {@render zone('tableau', tableau)}

      {#snippet piquet()}
        <path d="M90 40 H150" class="fil-vert" />
        <path d="M150 40 V70" class="fil-vert" />
        <path d="M126 70h48M134 78h32M142 86h16" class="terre-trait" />
      {/snippet}
      {@render zone('piquet', piquet)}

      {#snippet personne()}
        <circle cx="215" cy="40" r="13" class="perso" />
        <path d="M215 53v18M203 84l12-13 12 13" class="perso" />
        <text x="215" y="94" class="mini oui">protégé</text>
      {/snippet}
      {@render zone('perso', personne)}
    </svg>
  {:else if id === 'vmc'}
    <svg viewBox="0 0 300 96" aria-label="La VMC extrait l’air humide et fait entrer l’air neuf.">
      <rect x="40" y="20" width="220" height="52" rx="6" class="paroi" />

      {#snippet entrant()}
        <path d="M52 60 H120" class="air-entrant" />
        <text x="86" y="52" class="mini oui">air neuf</text>
      {/snippet}
      {@render zone('entrant', entrant)}

      {#snippet moteur()}
        <circle cx="150" cy="46" r="14" class="dedans" />
        <path d="M150 36v20M140 46h20" class="helice" />
      {/snippet}
      {@render zone('moteur', moteur)}

      {#snippet sortant()}
        <path d="M180 60 H248" class="air-sortant" />
        <text x="214" y="52" class="mini non">air humide</text>
      {/snippet}
      {@render zone('sortant', sortant)}
    </svg>
  {:else if id === 'fibrociment'}
    <svg viewBox="0 0 300 96" aria-label="Plaque de fibrociment intacte, et la même percée qui libère des fibres.">
      {#snippet intacte()}
        <path d="M20 66 L76 38 L132 66 L76 94 Z" class="dedans" />
        <text x="76" y="26" class="mini oui">intacte</text>
      {/snippet}
      {@render zone('intacte', intacte)}

      {#snippet percee()}
        <path d="M168 66 L224 38 L280 66 L224 94 Z" class="dehors" />
        <path d="M224 38 L216 66 L232 80" class="fissure-mini" />
        <text x="224" y="26" class="mini non">percée</text>
      {/snippet}
      {@render zone('percee', percee)}
    </svg>
  {:else if id === 'listes'}
    <svg viewBox="0 0 300 96" aria-label="Liste A : flocages. Liste B : dalles, conduits, toiture. Liste C : avant démolition.">
      {#snippet listeA()}
        <g transform="translate(14 16)">
          <rect x="0" y="0" width="80" height="60" rx="10" class="dehors" />
          <text x="40" y="30" class="chiffre non">A</text>
          <text x="40" y="48" class="mini">flocages</text>
        </g>
      {/snippet}
      {@render zone('a', listeA)}

      {#snippet listeB()}
        <g transform="translate(110 16)">
          <rect x="0" y="0" width="80" height="60" rx="10" class="dedans" />
          <text x="40" y="30" class="chiffre">B</text>
          <text x="40" y="48" class="mini">dalles, toiture</text>
        </g>
      {/snippet}
      {@render zone('b', listeB)}

      {#snippet listeC()}
        <g transform="translate(206 16)">
          <rect x="0" y="0" width="80" height="60" rx="10" class="dedans" />
          <text x="40" y="30" class="chiffre">C</text>
          <text x="40" y="48" class="mini">démolition</text>
        </g>
      {/snippet}
      {@render zone('c', listeC)}
    </svg>
  {:else if id === 'identite'}
    <svg viewBox="0 0 300 96" aria-label="La carte d’identité du dossier : le numéro, le bien, la date, le diagnostiqueur.">
      <rect x="10" y="12" width="280" height="72" rx="8" class="carte" />
      <path d="M10 48h280M150 12v72" class="cloison" />

      {#snippet numero()}
        <rect x="10" y="12" width="140" height="36" class="quart" />
        <text x="80" y="28" class="mini oui">N° DE DOSSIER</text>
        <text x="80" y="41" class="mini">la référence</text>
      {/snippet}
      {@render zone('dossier', numero)}

      {#snippet bien()}
        <rect x="150" y="12" width="140" height="36" class="quart" />
        <text x="220" y="28" class="mini oui">LE BIEN</text>
        <text x="220" y="41" class="mini">adresse, étage</text>
      {/snippet}
      {@render zone('bien', bien)}

      {#snippet dateVisite()}
        <rect x="10" y="48" width="140" height="36" class="quart" />
        <text x="80" y="64" class="mini oui">LA DATE</text>
        <text x="80" y="77" class="mini">le jour de la visite</text>
      {/snippet}
      {@render zone('date', dateVisite)}

      {#snippet qui()}
        <rect x="150" y="48" width="140" height="36" class="quart" />
        <text x="220" y="64" class="mini oui">LE DIAGNOSTIQUEUR</text>
        <text x="220" y="77" class="mini">certifié, assuré</text>
      {/snippet}
      {@render zone('qui', qui)}
    </svg>
  {:else if id === 'energie'}
    <svg viewBox="0 0 300 96" aria-label="L’énergie primaire est prélevée à la source, l’énergie finale arrive au compteur.">
      {#snippet primaire()}
        <rect x="10" y="26" width="76" height="40" rx="8" class="dehors" />
        <text x="48" y="44" class="mini non">PRIMAIRE</text>
        <text x="48" y="58" class="mini">la source</text>
      {/snippet}
      {@render zone('primaire', primaire)}

      <path d="M92 46h34" class="fleche-mini" />
      <text x="109" y="34" class="mini">pertes</text>

      {#snippet finale()}
        <rect x="132" y="26" width="76" height="40" rx="8" class="dedans" />
        <text x="170" y="44" class="mini oui">FINALE</text>
        <text x="170" y="58" class="mini">le compteur</text>
      {/snippet}
      {@render zone('finale', finale)}

      <path d="M214 46h34" class="fleche-mini" />

      {#snippet chez()}
        <rect x="254" y="26" width="36" height="40" rx="8" class="dedans" />
        <text x="272" y="50" class="mini oui">chez vous</text>
      {/snippet}
      {@render zone('chez', chez)}
    </svg>
  {:else if id === 'perimetre'}
    <svg viewBox="0 0 300 96" aria-label="Le diagnostiqueur regarde ce qui est visible ; ce qui est fermé n’est pas contrôlé.">
      {#snippet visible()}
        <rect x="10" y="16" width="130" height="64" rx="6" class="dedans" />
        <text x="75" y="42" class="mini oui">VISIBLE</text>
        <text x="75" y="60" class="mini">contrôlé à l’œil</text>
      {/snippet}
      {@render zone('visible', visible)}

      {#snippet ferme()}
        <rect x="160" y="16" width="130" height="64" rx="6" class="dehors" />
        <text x="225" y="36" class="mini non">FERMÉ, ENCOMBRÉ</text>
        <text x="225" y="52" class="mini">non contrôlé</text>
        <text x="225" y="68" class="mini">on ne démonte rien</text>
      {/snippet}
      {@render zone('ferme', ferme)}
    </svg>
  {:else if id === 'obligation'}
    <svg viewBox="0 0 300 80" aria-label="Avant 1949 : plomb et amiante. Avant 1997 : amiante. Après : ni l’un ni l’autre.">
      <line x1="16" y1="48" x2="284" y2="48" class="axe" />

      {#snippet avant49()}
        <rect x="10" y="18" width="76" height="40" rx="6" class="dehors" />
        <text x="48" y="34" class="mini non">avant 1949</text>
        <text x="48" y="48" class="mini">plomb + amiante</text>
        <circle cx="16" cy="48" r="5" class="borne" />
      {/snippet}
      {@render zone('avant49', avant49)}

      {#snippet entre()}
        <rect x="96" y="18" width="96" height="40" rx="6" class="dehors" />
        <text x="144" y="34" class="mini non">1949 → 1997</text>
        <text x="144" y="48" class="mini">amiante</text>
      {/snippet}
      {@render zone('entre', entre)}

      {#snippet apres()}
        <rect x="202" y="18" width="88" height="40" rx="6" class="dedans" />
        <text x="246" y="34" class="mini oui">après 1997</text>
        <text x="246" y="48" class="mini">ni l’un ni l’autre</text>
      {/snippet}
      {@render zone('apres', apres)}
    </svg>
  {/if}

  {#if detail}
    <div class="reponse apparait">
      <p class="nom">{detail.nom}</p>
      <ul>
        {#each detail.points as point}
          <li>{point}</li>
        {/each}
      </ul>
    </div>
  {/if}
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 var(--e1);
    font-size: var(--t-micro);
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--or-fonce);
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
  }

  /* Chaque partie du dessin est une porte : on la survole, elle se lève ; on
     l'ouvre, les autres s'effacent. */
  .zone {
    cursor: pointer;
    transition: opacity 0.2s ease, filter 0.2s ease;
  }

  .zone.efface {
    opacity: 0.28;
  }

  .zone:hover,
  .zone.actif {
    filter: drop-shadow(0 2px 4px rgb(15 58 71 / 25%));
  }

  .zone:focus-visible {
    outline: none;
    filter: drop-shadow(0 0 3px var(--or));
  }

  .reponse {
    margin-top: var(--e3);
    padding: var(--e3) var(--e3);
    background: var(--papier-doux);
    border-left: 3px solid var(--or);
    border-radius: var(--rayon-petit);
  }

  .nom {
    margin: 0 0 var(--e1);
    font-weight: 700;
    font-size: var(--t-base);
    color: var(--vert-700);
  }

  .reponse ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  .reponse li {
    position: relative;
    padding-left: var(--e4);
    font-size: var(--t-base);
    line-height: 1.4;
    color: var(--encre);
  }

  .reponse li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 0.55em;
    width: 6px;
    height: 6px;
    border-radius: 2px;
    background: var(--or);
  }

  .dedans {
    fill: rgb(28 122 86 / 12%);
    stroke: var(--ok);
    stroke-width: 1.6;
  }

  .dehors {
    fill: rgb(176 52 34 / 10%);
    stroke: var(--alerte);
    stroke-width: 1.6;
  }

  .carte {
    fill: rgb(28 122 86 / 8%);
    stroke: var(--ok);
    stroke-width: 1.6;
  }

  /* Les quarts de la carte d'identité : invisibles, mais ils portent le clic. */
  .quart {
    fill: transparent;
  }

  .cloison {
    stroke: var(--ok);
    stroke-width: 1.4;
    opacity: 0.5;
  }

  .oui {
    fill: var(--ok);
    font-size: var(--t-micro);
    font-weight: 700;
  }

  .non {
    fill: var(--alerte);
  }

  text.non {
    font-size: var(--t-micro);
    font-weight: 700;
  }

  .mini {
    font-size: var(--t-micro);
    fill: var(--encre-doux);
    text-anchor: middle;
    font-weight: 600;
  }

  .mini.oui {
    fill: var(--ok);
  }

  .mini.non {
    fill: var(--alerte);
  }

  .chiffre {
    font-size: var(--t-lead);
    font-weight: 800;
    fill: var(--ok);
    text-anchor: middle;
  }

  .chiffre.non {
    fill: var(--alerte);
  }

  .barre-bon {
    fill: rgb(28 122 86 / 55%);
  }

  .barre-mal {
    fill: rgb(176 52 34 / 55%);
  }

  .axe {
    stroke: var(--trait);
    stroke-width: 2;
  }

  .valide {
    fill: rgb(28 122 86 / 22%);
  }

  .perime {
    fill: rgb(176 52 34 / 18%);
  }

  .fleche-mini {
    stroke: var(--encre-doux);
    stroke-width: 1.6;
  }

  .borne {
    fill: var(--encre-doux);
  }

  .case {
    fill: none;
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .case.cochee {
    stroke: var(--ok);
  }

  .coche {
    fill: none;
    stroke: var(--ok);
    stroke-width: 2.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .texte-faux {
    stroke: var(--trait);
    stroke-width: 4;
    stroke-linecap: round;
  }

  .texte-vrai {
    stroke: var(--vert-300);
    stroke-width: 4;
    stroke-linecap: round;
  }

  .isolant {
    fill: rgb(28 122 86 / 20%);
    stroke: var(--ok);
    stroke-width: 1.4;
  }

  .trou {
    fill: rgb(176 52 34 / 16%);
    stroke: var(--alerte);
    stroke-width: 1.4;
    stroke-dasharray: 4 3;
  }

  .paroi {
    fill: var(--papier-doux);
    stroke: var(--trait);
    stroke-width: 1.4;
  }

  .fleche-froid {
    stroke: var(--alerte);
    stroke-width: 2.2;
    fill: none;
    stroke-linecap: round;
  }

  .fil-vert {
    stroke: var(--ok);
    stroke-width: 2.6;
    fill: none;
  }

  .terre-trait {
    stroke: var(--ok);
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  .perso {
    fill: none;
    stroke: var(--encre-doux);
    stroke-width: 2.2;
    stroke-linecap: round;
  }

  .air-entrant {
    stroke: var(--ok);
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  .air-sortant {
    stroke: var(--alerte);
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  .helice {
    stroke: var(--ok);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .fissure-mini {
    stroke: var(--alerte);
    stroke-width: 2.2;
    fill: none;
    stroke-linecap: round;
  }
</style>
