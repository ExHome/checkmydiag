/**
 * La fabrique des pages de la rubrique.
 *
 * Ces pages sont du HTML complet, écrit une fois pour toutes au moment du
 * build : pas de JavaScript, pas d'hydratation, pas d'appel réseau. C'est une
 * décision de référencement autant que d'accessibilité — une réponse qui
 * n'existe qu'après exécution d'un bundle n'existe ni pour un robot
 * d'indexation, ni pour un téléphone en bord de réseau.
 *
 * Chaque page porte donc, dans son HTML servi : sa réponse en clair, son
 * dessin en SVG, son fil d'Ariane, ses données structurées et ses liens.
 */
import { DESSINS, dessin } from './dessins';
import { FICHES, liees, THEMES, type Fiche } from './index';
import { html, type Question, type Source, type Theme } from './socle';

/**
 * L'adresse publique du site. Elle sert aux liens canoniques, aux données
 * structurées et au sitemap — tous exigent une URL absolue.
 *
 * ⚠️ À régler avant la première mise en ligne : `CMD_SITE=https://…` à
 * l'environnement de build, ou cette valeur par défaut. Un canonique qui pointe
 * vers un domaine qui n'est pas le vôtre est pire que pas de canonique.
 */
export const SITE = (
  (typeof process !== 'undefined' ? process.env?.CMD_SITE : undefined) ?? 'https://www.checkmydiag.fr'
).replace(/\/$/, '');

/** Le nom de la rubrique, et son dossier. */
export const RUBRIQUE = 'pour-les-nuls';
const NOM = 'Les diags pour les nuls';
const MARQUE = 'Check My Diag';

/* -------------------------------------------------------------------------- */
/*  Adresses                                                                   */
/* -------------------------------------------------------------------------- */

export const cheminRubrique = (): string => `${RUBRIQUE}/`;
export const cheminTheme = (t: Theme): string => `${RUBRIQUE}/${t.id}/`;
export const cheminQuestion = (f: Fiche): string => `${RUBRIQUE}/${f.theme.id}/${f.question.id}/`;

/** Le chemin de retour vers la racine du site, depuis une page donnée. */
const versRacine = (chemin: string): string =>
  '../'.repeat(chemin.split('/').filter(Boolean).length) || './';

/* -------------------------------------------------------------------------- */
/*  Briques                                                                    */
/* -------------------------------------------------------------------------- */

/** La description d'une page : la réponse courte, ramenée à une longueur lisible. */
function description(texte: string): string {
  const propre = texte.replace(/\s+/g, ' ').trim();
  if (propre.length <= 158) return propre;
  const coupe = propre.slice(0, 158);
  return `${coupe.slice(0, coupe.lastIndexOf(' '))}…`;
}

/** Le texte sans balises, pour les données structurées. */
const brut = (texte: string): string => texte.replace(/\s+/g, ' ').trim();

function figure(id: string | undefined): string {
  const d = dessin(id);
  if (!d) return '';
  return `
      <figure class="dessin">
        <div class="dessin-cadre" role="img" aria-label="${html(d.legende)}">${d.svg}</div>
        <figcaption>${html(d.legende)}</figcaption>
      </figure>`;
}

function tableau(q: Question): string {
  if (!q.tableau) return '';
  const { colonnes, lignes, reserve } = q.tableau;
  return `
      <div class="tableau-cadre">
        <table class="tableau">
          <thead>
            <tr>${colonnes.map((c) => `<th scope="col">${html(c)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${lignes
              .map(
                (ligne) =>
                  `<tr>${ligne
                    .map((cellule, i) =>
                      i === 0
                        ? `<th scope="row">${html(cellule)}</th>`
                        : `<td>${html(cellule)}</td>`
                    )
                    .join('')}</tr>`
              )
              .join('\n            ')}
          </tbody>
        </table>
      </div>
      ${reserve ? `<p class="reserve">${html(reserve)}</p>` : ''}`;
}

function sources(liste: Source[] | undefined, verifie: string | undefined): string {
  if (!liste?.length && !verifie) return '';
  const date = verifie
    ? new Date(verifie).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return `
      <aside class="sources">
        <h2>D’où vient cette réponse</h2>
        ${
          liste?.length
            ? `<ul>${liste
                .map(
                  (s) =>
                    `<li>${
                      s.url
                        ? `<a href="${html(s.url)}" rel="noopener nofollow">${html(s.titre)}</a>`
                        : html(s.titre)
                    }</li>`
                )
                .join('')}</ul>`
            : ''
        }
        ${
          date
            ? `<p class="verifie">Contenu réglementaire vérifié le ${date}. Les règles changent : avant de vous engager, confirmez le point qui vous concerne auprès de votre notaire ou de votre diagnostiqueur.</p>`
            : ''
        }
      </aside>`;
}

/** L'appel au produit. Il ferme chaque page, sans jamais promettre autre chose. */
function pont(chemin: string, phrase?: string): string {
  const racine = versRacine(chemin);
  return `
      <aside class="pont">
        <h2>Et sur votre rapport à vous ?</h2>
        <p>${html(
          phrase ??
            'Déposez votre dossier de diagnostic : chaque rapport est découpé, expliqué ligne par ligne, et ce qui cloche vous est signalé.'
        )}</p>
        <p class="promesse">Votre PDF est lu par votre navigateur. Il ne part sur aucun serveur, il ne quitte pas votre appareil.</p>
        <a class="bouton" href="${racine}">Ouvrir mon rapport</a>
      </aside>`;
}

/** Le fil d'Ariane visible. Sa version balisée est produite à côté. */
function fil(etapes: { nom: string; lien?: string }[]): string {
  return `
      <nav class="fil" aria-label="Fil d’Ariane">
        <ol>
          ${etapes
            .map(
              (e) =>
                `<li>${
                  e.lien ? `<a href="${html(e.lien)}">${html(e.nom)}</a>` : `<span aria-current="page">${html(e.nom)}</span>`
                }</li>`
            )
            .join('\n          ')}
        </ol>
      </nav>`;
}

function filBalise(etapes: { nom: string; url: string }[]): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: etapes.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.nom,
      item: e.url
    }))
  };
}

/* -------------------------------------------------------------------------- */
/*  Le gabarit                                                                 */
/* -------------------------------------------------------------------------- */

interface Page {
  chemin: string;
  titre: string;
  description: string;
  corps: string;
  /** Les blocs JSON-LD, réunis dans un seul graphe. */
  donnees: object[];
}

function gabarit(page: Page): string {
  const racine = versRacine(page.chemin);
  const url = `${SITE}/${page.chemin}`;

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${html(page.titre)}</title>
    <meta name="description" content="${html(page.description)}" />
    <link rel="canonical" href="${html(url)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <meta name="theme-color" content="#093f30" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${MARQUE}" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:title" content="${html(page.titre)}" />
    <meta property="og:description" content="${html(page.description)}" />
    <meta property="og:url" content="${html(url)}" />
    <meta name="twitter:card" content="summary" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏠</text></svg>" />
    <link rel="stylesheet" href="${racine}pour-les-nuls.css" />
    <script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': page.donnees }, null, 2)}
    </script>
  </head>
  <body>
    <header class="entete">
      <div class="enveloppe entete-ligne">
        <a class="marque" href="${racine}">Check<span>My</span>Diag</a>
        <a class="retour-rubrique" href="${racine}${RUBRIQUE}/">${NOM}</a>
      </div>
    </header>

    <main class="enveloppe">
${page.corps}
    </main>

    <footer class="pied">
      <div class="enveloppe">
        <p>
          <strong>${MARQUE}</strong> explique les diagnostics immobiliers. Ces pages sont
          pédagogiques : elles n’ont aucune valeur réglementaire, et ne remplacent ni un
          rapport signé, ni l’avis de votre notaire.
        </p>
        <p class="pied-liens">
          <a href="${racine}">Lire mon rapport</a>
          <a href="${racine}${RUBRIQUE}/">${NOM}</a>
        </p>
      </div>
    </footer>
  </body>
</html>
`;
}

/* -------------------------------------------------------------------------- */
/*  Les trois sortes de pages                                                  */
/* -------------------------------------------------------------------------- */

/** La page d'une question : le cœur de la rubrique. */
export function pageQuestion(f: Fiche): Page {
  const { question: q, theme: t } = f;
  const chemin = cheminQuestion(f);
  const racine = versRacine(chemin);
  const voisines = liees(f);

  const corps = `
${fil([
  { nom: 'Accueil', lien: racine },
  { nom: NOM, lien: `${racine}${RUBRIQUE}/` },
  { nom: t.titre, lien: `${racine}${cheminTheme(t)}` },
  { nom: q.question }
])}

      <article class="question">
        <h1>${html(q.question)}</h1>

        <p class="reponse-courte">${html(q.court)}</p>
${figure(q.dessin)}
${
  q.points?.length
    ? `
        <h2>Ce qu’il faut savoir</h2>
        <ul class="points">
          ${q.points.map((p) => `<li>${html(p)}</li>`).join('\n          ')}
        </ul>`
    : ''
}
${tableau(q)}
${
  q.piege
    ? `
        <aside class="piege">
          <h2>Le piège</h2>
          <p>${html(q.piege)}</p>
        </aside>`
    : ''
}
${
  q.chezMoi
    ? `
        <div class="chez-moi">
          <h2>Sur votre rapport</h2>
          <p>${html(q.chezMoi)}</p>
        </div>`
    : ''
}
${
  q.variantes?.length
    ? `
        <p class="variantes">On pose aussi la question comme ça : ${q.variantes
          .map((v) => `<em>${html(v)}</em>`)
          .join(' · ')}</p>`
    : ''
}
      </article>

${sources(q.sources, q.verifie)}

${pont(chemin)}

      <nav class="suite" aria-label="Questions liées">
        <h2>À lire juste après</h2>
        <ul>
          ${voisines
            .map(
              (v) => `<li>
            <a href="${racine}${cheminQuestion(v)}">
              <span class="suite-q">${html(v.question.question)}</span>
              <span class="suite-r">${html(description(v.question.court))}</span>
            </a>
          </li>`
            )
            .join('\n          ')}
        </ul>
        <p class="remonter"><a href="${racine}${cheminTheme(t)}">Toutes les questions sur « ${html(t.titre)} »</a></p>
      </nav>`;

  return {
    chemin,
    titre: `${q.question} — ${NOM} | ${MARQUE}`,
    description: description(q.court),
    corps,
    donnees: [
      filBalise([
        { nom: 'Accueil', url: `${SITE}/` },
        { nom: NOM, url: `${SITE}/${cheminRubrique()}` },
        { nom: t.titre, url: `${SITE}/${cheminTheme(t)}` },
        { nom: q.question, url: `${SITE}/${chemin}` }
      ]),
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: brut(q.question),
            acceptedAnswer: {
              '@type': 'Answer',
              text: brut([q.court, ...(q.points ?? [])].join(' '))
            }
          }
        ]
      },
      {
        '@type': 'Article',
        headline: brut(q.question),
        description: description(q.court),
        inLanguage: 'fr-FR',
        isPartOf: { '@type': 'WebSite', name: MARQUE, url: `${SITE}/` },
        publisher: { '@type': 'Organization', name: MARQUE, url: `${SITE}/` },
        ...(q.verifie ? { dateModified: q.verifie } : {})
      }
    ]
  };
}

/** La page d'un thème : elle réunit ses questions et leurs réponses courtes. */
export function pageTheme(t: Theme): Page {
  const chemin = cheminTheme(t);
  const racine = versRacine(chemin);
  const autres = THEMES.filter((a) => a.id !== t.id);

  const corps = `
${fil([
  { nom: 'Accueil', lien: racine },
  { nom: NOM, lien: `${racine}${RUBRIQUE}/` },
  { nom: t.titre }
])}

      <article class="theme">
        <h1>${html(t.h1)}</h1>
        <p class="chapeau">${html(t.resume)}</p>
${figure(t.dessin)}

        <ol class="sommaire">
          ${t.questions
            .map(
              (q) => `<li>
            <a href="${racine}${cheminQuestion({ theme: t, question: q })}">
              <span class="sommaire-q">${html(q.question)}</span>
              <span class="sommaire-r">${html(q.court)}</span>
            </a>
          </li>`
            )
            .join('\n          ')}
        </ol>
      </article>

${pont(chemin)}

      <nav class="autres" aria-label="Autres thèmes">
        <h2>Les autres thèmes</h2>
        <ul>
          ${autres
            .map(
              (a) =>
                `<li><a href="${racine}${cheminTheme(a)}"><span class="autre-t">${html(a.titre)}</span><span class="autre-r">${html(description(a.resume))}</span></a></li>`
            )
            .join('\n          ')}
        </ul>
      </nav>`;

  return {
    chemin,
    titre: `${t.h1} — ${NOM} | ${MARQUE}`,
    description: description(t.resume),
    corps,
    donnees: [
      filBalise([
        { nom: 'Accueil', url: `${SITE}/` },
        { nom: NOM, url: `${SITE}/${cheminRubrique()}` },
        { nom: t.titre, url: `${SITE}/${chemin}` }
      ]),
      {
        '@type': 'FAQPage',
        name: brut(t.h1),
        mainEntity: t.questions.map((q) => ({
          '@type': 'Question',
          name: brut(q.question),
          acceptedAnswer: { '@type': 'Answer', text: brut(q.court) }
        }))
      }
    ]
  };
}

/** L'accueil de la rubrique : tous les thèmes, toutes les questions. */
export function pageRubrique(): Page {
  const chemin = cheminRubrique();
  const racine = versRacine(chemin);

  const corps = `
${fil([{ nom: 'Accueil', lien: racine }, { nom: NOM }])}

      <article class="rubrique">
        <h1>Les diags pour les nuls</h1>
        <p class="chapeau">
          Vous avez reçu soixante pages de PDF technique et vous n’avez qu’une question :
          est-ce que c’est grave ? Ici, chaque question qu’on se pose vraiment sur les
          diagnostics immobiliers a sa réponse — courte d’abord, avec un dessin, sans jargon
          inutile et sans jargon caché.
        </p>

        <p class="compte">
          <strong>${FICHES.length}</strong> questions · <strong>${THEMES.length}</strong> thèmes ·
          des réponses écrites par des gens dont c’est le métier.
        </p>

        <div class="grille-themes">
          ${THEMES.map(
            (t) => `<section class="carte-theme">
            <h2><a href="${racine}${cheminTheme(t)}">${html(t.titre)}</a></h2>
            <p>${html(t.resume)}</p>
            <ul>
              ${t.questions
                .slice(0, 4)
                .map(
                  (q) =>
                    `<li><a href="${racine}${cheminQuestion({ theme: t, question: q })}">${html(q.question)}</a></li>`
                )
                .join('\n              ')}
            </ul>
            <p class="tout"><a href="${racine}${cheminTheme(t)}">Les ${t.questions.length} questions →</a></p>
          </section>`
          ).join('\n          ')}
        </div>
      </article>

${pont(chemin, 'Vous avez le rapport sous la main ? Ne le lisez pas : déposez-le. Chaque ligne qui compte vous est expliquée, et ce qui cloche vous est signalé.')}

      <nav class="index-complet" aria-label="Toutes les questions">
        <h2>Toutes les questions</h2>
        ${THEMES.map(
          (t) => `<section>
          <h3><a href="${racine}${cheminTheme(t)}">${html(t.titre)}</a></h3>
          <ul>
            ${t.questions
              .map(
                (q) =>
                  `<li><a href="${racine}${cheminQuestion({ theme: t, question: q })}">${html(q.question)}</a></li>`
              )
              .join('\n            ')}
          </ul>
        </section>`
        ).join('\n        ')}
      </nav>`;

  return {
    chemin,
    titre: `${NOM} — comprendre son diagnostic immobilier sans jargon | ${MARQUE}`,
    description:
      'DPE, amiante, plomb, électricité, gaz, termites, surfaces : toutes les questions qu’on se pose sur les diagnostics immobiliers, expliquées simplement, avec un schéma. Sans jargon et sans baratin.',
    corps,
    donnees: [
      filBalise([
        { nom: 'Accueil', url: `${SITE}/` },
        { nom: NOM, url: `${SITE}/${chemin}` }
      ]),
      {
        '@type': 'CollectionPage',
        name: NOM,
        inLanguage: 'fr-FR',
        isPartOf: { '@type': 'WebSite', name: MARQUE, url: `${SITE}/` },
        hasPart: THEMES.map((t) => ({
          '@type': 'CreativeWork',
          name: t.h1,
          url: `${SITE}/${cheminTheme(t)}`
        }))
      }
    ]
  };
}

/**
 * La planche de contrôle des dessins — servie en développement seulement, à
 * l'adresse `/pour-les-nuls/planche/`.
 *
 * Elle n'est jamais écrite dans `dist/` : ce n'est pas une page du site, c'est
 * l'outil qui permet de voir les vingt-cinq dessins côte à côte et de repérer
 * d'un coup celui qui déborde de son cadre ou dont le texte se chevauche. Le
 * projet a déjà la même chose pour les schémas de l'application (`galerie.html`).
 */
export function planche(): string {
  const entrees = Object.entries(DESSINS);
  return gabarit({
    chemin: `${RUBRIQUE}/planche/`,
    titre: `Planche de contrôle — ${entrees.length} dessins`,
    description: 'Outil de développement.',
    donnees: [],
    corps: `
      <article class="rubrique">
        <h1>Planche de contrôle</h1>
        <p class="chapeau">Les ${entrees.length} dessins de la rubrique, à la même échelle. Cette page n’est pas publiée.</p>
        <div class="grille-themes">
          ${entrees
            .map(
              ([id, d]) => `<section class="carte-theme">
            <h2>${html(id)}</h2>
            <figure class="dessin">
              <div class="dessin-cadre" data-dessin="${html(id)}">${d.svg}</div>
              <figcaption>${html(d.legende)}</figcaption>
            </figure>
          </section>`
            )
            .join('\n          ')}
        </div>
      </article>`
  });
}

/* -------------------------------------------------------------------------- */
/*  Le site                                                                    */
/* -------------------------------------------------------------------------- */

export interface Fichier {
  /** Chemin relatif à la racine du site, avec son nom de fichier. */
  chemin: string;
  contenu: string;
}

/** Toutes les pages de la rubrique, prêtes à écrire. */
export function pages(): Fichier[] {
  const toutes: Page[] = [pageRubrique(), ...THEMES.map(pageTheme), ...FICHES.map(pageQuestion)];
  return toutes.map((p) => ({ chemin: `${p.chemin}index.html`, contenu: gabarit(p) }));
}

/** Le plan du site : la rubrique, et l'application elle-même. */
export function sitemap(): string {
  const adresses = [
    { loc: `${SITE}/`, priorite: '1.0' },
    { loc: `${SITE}/${cheminRubrique()}`, priorite: '0.9' },
    ...THEMES.map((t) => ({ loc: `${SITE}/${cheminTheme(t)}`, priorite: '0.8' })),
    ...FICHES.map((f) => ({ loc: `${SITE}/${cheminQuestion(f)}`, priorite: '0.7' }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${adresses
  .map(
    (a) => `  <url>
    <loc>${a.loc}</loc>
    <priority>${a.priorite}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
}

export function robots(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
}
