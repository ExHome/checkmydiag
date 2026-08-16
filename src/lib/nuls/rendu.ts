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
import { carteQuestion, carteRubrique, carteTheme, type Mesure } from './og';
import { EDITEUR, signature } from './editeur';
import { FICHES, liees, THEMES, type Fiche } from './index';
import { html, type Question, type Source, type Theme } from './socle';

/**
 * L'adresse publique du site. Elle sert aux liens canoniques, aux données
 * structurées, au sitemap et aux cartes de partage — tous exigent une URL
 * absolue.
 *
 * Le site est en ligne depuis le 13/08/2026 à cette adresse. La valeur est
 * écrite ici plutôt que laissée à l'environnement : le workflow de déploiement
 * la fournit déjà, mais un build lancé à la main produisait sinon des liens
 * canoniques vers un domaine qui n'est pas le nôtre — ce qui est pire que pas
 * de canonique du tout.
 *
 * `CMD_SITE=https://…` reste prioritaire, pour le jour d'un domaine propre.
 */
export const SITE = (
  (typeof process !== 'undefined' ? process.env?.CMD_SITE : undefined) ??
  'https://exhome.github.io/checkmydiag'
).replace(/\/$/, '');

/** Le nom de la rubrique, et son dossier. */
export const RUBRIQUE = 'en-clair';
const NOM = 'En clair';
const MARQUE = 'Verrière';

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
  /** La carte de partage, relative à la racine du site. */
  carte: string;
}

/** L'adresse de la carte de partage d'une page — voir `og.ts`. */
export const cheminCarte = (de?: Theme | Fiche): string => {
  if (!de) return 'og/accueil.png';
  return 'question' in de ? `og/${de.theme.id}/${de.question.id}.png` : `og/${de.id}.png`;
};

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
    <meta name="robots" content="${EDITEUR_CONNU ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, nofollow'}" />
    <meta name="theme-color" content="#0f3a47" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${MARQUE}" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:title" content="${html(page.titre)}" />
    <meta property="og:description" content="${html(page.description)}" />
    <meta property="og:url" content="${html(url)}" />
    <meta property="og:image" content="${SITE}/${page.carte}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Verrière — en clair" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${SITE}/${page.carte}" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏠</text></svg>" />
    <link rel="stylesheet" href="${racine}en-clair.css" />
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
        ${
          signature()
            ? `<p class="signature">Écrit par <strong>${html(signature() as string)}</strong>.
          <a href="${racine}qui-ecrit/">Comment ces pages sont faites</a></p>`
            : ''
        }
        <p class="pied-liens">
          <a href="${racine}">Lire mon rapport</a>
          <a href="${racine}${RUBRIQUE}/">${NOM}</a>
          ${
            EDITEUR
              ? `<a href="${racine}qui-ecrit/">Qui écrit</a>
          <a href="${racine}confidentialite/">Vos données</a>
          <a href="${racine}mentions-legales/">Mentions légales</a>`
              : ''
          }
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
    carte: cheminCarte(f),
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
        // La signature est ce qui distingue une explication écrite par un
        // professionnel d'un texte compilé. Elle n'apparaît que si elle est
        // vraie : pas d'auteur déclaré tant que `editeur.ts` est vide.
        ...(EDITEUR
          ? {
              author: {
                '@type': 'Person',
                name: EDITEUR.auteur,
                jobTitle: EDITEUR.metier,
                ...(EDITEUR.siteProfessionnel ? { url: EDITEUR.siteProfessionnel } : {})
              }
            }
          : {}),
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
    carte: cheminCarte(t),
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
        <!-- Le nom de la rubrique est « En clair » ; son titre de page dit de
             quoi elle parle. Un h1 de deux mots ne rencontre personne. -->
        <h1>Les diagnostics immobiliers, en clair</h1>
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
    titre: `Les diagnostics immobiliers en clair — ${MARQUE}`,
    description:
      'DPE, amiante, plomb, électricité, gaz, termites, surfaces : toutes les questions qu’on se pose sur les diagnostics immobiliers, expliquées simplement, avec un schéma. Sans jargon et sans baratin.',
    corps,
    carte: cheminCarte(),
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

/* -------------------------------------------------------------------------- */
/*  Les pages de confiance                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Qui écrit, sous quelle responsabilité, et ce qu'on fait de vos données.
 *
 * Ces trois pages ne sont fabriquées que si l'identité de l'éditeur est
 * renseignée (`editeur.ts`). Une page de confiance à moitié remplie inspire
 * moins confiance que pas de page du tout — et des mentions légales inventées
 * engageraient quelqu'un.
 */
function pagesDeConfiance(): Page[] {
  if (!EDITEUR) return [];

  const lien = (chemin: string): string => versRacine(chemin);
  const certifs = EDITEUR.certifications?.length
    ? `<p>Certifications détenues : ${EDITEUR.certifications.map(html).join(' · ')}.</p>`
    : '';

  const qui: Page = {
    chemin: 'qui-ecrit/',
    titre: `Qui écrit ces pages — ${MARQUE}`,
    description: `Ces explications sont écrites par ${EDITEUR.auteur}, ${EDITEUR.metier}. Comment elles sont faites, ce qu’elles valent, et ce que nous ne faisons pas.`,
    carte: cheminCarte(),
    corps: `
${fil([{ nom: 'Accueil', lien: lien('qui-ecrit/') }, { nom: 'Qui écrit ces pages' }])}

      <article class="question">
        <h1>Qui écrit ces pages</h1>

        <p class="reponse-courte">
          ${html(`${EDITEUR.auteur}, ${EDITEUR.metier}${EDITEUR.depuis ? ` depuis ${EDITEUR.depuis}` : ''}.`)}
          Ces explications sont écrites par quelqu’un dont c’est le métier, pas par une
          rédaction qui compile ce qu’elle trouve ailleurs.
        </p>
        ${certifs}

        <h2>Comment ces pages sont faites</h2>
        <ul class="points">
          <li>Une question par page, telle qu’on se la pose vraiment, avec sa réponse en tête.</li>
          <li>Chaque affirmation réglementaire porte sa source et sa date de vérification.</li>
          <li>Quand un point dépend du cas ou reste discuté, c’est écrit — jamais tranché à la place du lecteur.</li>
          <li>Un schéma dès qu’il explique mieux qu’un paragraphe, dessiné pour ce site.</li>
          <li>Le vrai vocabulaire du métier est conservé, puis expliqué. On simplifie l’accès au savoir, jamais le savoir.</li>
        </ul>

        <h2>Ce que nous ne faisons pas</h2>
        <ul class="points">
          <li>Aucun devis, aucune mise en relation commerciale, aucune publicité.</li>
          <li>Aucun compte à créer, aucun formulaire avant d’accéder à une réponse.</li>
          <li>Aucun chiffre inventé : quand une valeur n’est pas lisible dans un rapport, nous l’écrivons.</li>
        </ul>

        <aside class="piege">
          <h2>La limite, dite franchement</h2>
          <p>
            Ce site explique, il ne certifie pas. Il n’a aucune valeur réglementaire, et ne
            remplace ni un rapport signé, ni l’avis de votre notaire. Pour toute décision
            engageante, c’est le document original qui fait foi.
          </p>
        </aside>
      </article>

${pont('qui-ecrit/')}`,
    donnees: [
      filBalise([
        { nom: 'Accueil', url: `${SITE}/` },
        { nom: 'Qui écrit ces pages', url: `${SITE}/qui-ecrit/` }
      ]),
      {
        '@type': 'AboutPage',
        name: 'Qui écrit ces pages',
        inLanguage: 'fr-FR',
        mainEntity: {
          '@type': 'Person',
          name: EDITEUR.auteur,
          jobTitle: EDITEUR.metier,
          ...(EDITEUR.siteProfessionnel ? { url: EDITEUR.siteProfessionnel } : {}),
          ...(EDITEUR.certifications?.length
            ? {
                hasCredential: EDITEUR.certifications.map((c) => ({
                  '@type': 'EducationalOccupationalCredential',
                  name: c
                }))
              }
            : {})
        }
      }
    ]
  };

  const legales: Page = {
    chemin: 'mentions-legales/',
    titre: `Mentions légales — ${MARQUE}`,
    description: 'Éditeur, responsable de la publication, hébergeur.',
    carte: cheminCarte(),
    corps: `
${fil([{ nom: 'Accueil', lien: lien('mentions-legales/') }, { nom: 'Mentions légales' }])}

      <article class="question">
        <h1>Mentions légales</h1>

        <h2>Éditeur</h2>
        <p>
          ${html(EDITEUR.societe ?? EDITEUR.auteur)}<br />
          ${EDITEUR.siret ? `SIRET ${html(EDITEUR.siret)}<br />` : ''}
          ${EDITEUR.adresse ? `${html(EDITEUR.adresse)}<br />` : ''}
          ${EDITEUR.courriel ? `${html(EDITEUR.courriel)}` : ''}
        </p>

        <h2>Responsable de la publication</h2>
        <p>${html(EDITEUR.responsablePublication ?? EDITEUR.auteur)}</p>

        <h2>Hébergement</h2>
        <p>${html(EDITEUR.hebergeur ?? '')}</p>

        <h2>Nature du site</h2>
        <p>
          ${MARQUE} est un outil pédagogique. Il n’a aucune valeur réglementaire et ne
          remplace ni un rapport de diagnostic signé, ni l’avis d’un professionnel. Les
          contenus sont fournis à titre d’information ; la réglementation évolue, et chaque
          page porte sa date de vérification.
        </p>
      </article>`,
    donnees: [
      filBalise([
        { nom: 'Accueil', url: `${SITE}/` },
        { nom: 'Mentions légales', url: `${SITE}/mentions-legales/` }
      ])
    ]
  };

  const vieP: Page = {
    chemin: 'confidentialite/',
    titre: `Vos données — ${MARQUE}`,
    description:
      'Votre rapport de diagnostic est lu par votre navigateur. Il ne part sur aucun serveur, il ne quitte pas votre appareil.',
    carte: cheminCarte(),
    corps: `
${fil([{ nom: 'Accueil', lien: lien('confidentialite/') }, { nom: 'Vos données' }])}

      <article class="question">
        <h1>Vos données</h1>

        <p class="reponse-courte">
          Votre rapport de diagnostic est lu par votre navigateur, sur votre appareil. Il ne
          part sur aucun serveur, il n’est envoyé nulle part, et personne ici ne peut le lire —
          nous compris.
        </p>

        <h2>Concrètement</h2>
        <ul class="points">
          <li>Le PDF que vous déposez est ouvert et analysé localement. Aucun téléversement n’a lieu.</li>
          <li>Les rapports que vous choisissez de garder restent dans la mémoire de votre navigateur, sur votre appareil. Vous pouvez les oublier d’un clic.</li>
          <li>La page fonctionne connexion coupée : c’est la démonstration la plus simple qu’il n’y a pas d’envoi.</li>
          <li>Aucun compte, aucun formulaire, aucune inscription.</li>
          <li>Aucun traqueur publicitaire, aucun bandeau de consentement — parce qu’il n’y a rien à consentir.</li>
        </ul>

        <div class="chez-moi">
          <h2>Vérifiez-le vous-même</h2>
          <p>
            Coupez votre connexion, puis déposez un rapport : tout continue de fonctionner.
            C’est la seule preuve qui vaille, et elle ne demande de croire personne.
          </p>
        </div>
      </article>

${pont('confidentialite/')}`,
    donnees: [
      filBalise([
        { nom: 'Accueil', url: `${SITE}/` },
        { nom: 'Vos données', url: `${SITE}/confidentialite/` }
      ])
    ]
  };

  return [qui, legales, vieP];
}

/**
 * La planche de contrôle des dessins — servie en développement seulement, à
 * l'adresse `/en-clair/planche/`.
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
    carte: cheminCarte(),
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
  /**
   * Une page qui ne fait que renvoyer vers une autre. Elle n'a ni description,
   * ni données structurées, ni carte de partage — et les contrôles de qualité
   * ne doivent pas la juger comme une page de contenu.
   */
  renvoi?: boolean;
}

/**
 * Les cartes de partage à rasteriser : une par page. Le SVG est produit ici, le
 * PNG par le plugin de build — seul endroit du projet où un rastériseur est
 * nécessaire.
 */
export function cartes(mesure: Mesure): { chemin: string; svg: string }[] {
  return [
    { chemin: cheminCarte(), svg: carteRubrique(FICHES.length, THEMES.length, mesure) },
    ...THEMES.map((t) => ({ chemin: cheminCarte(t), svg: carteTheme(t, mesure) })),
    ...FICHES.map((f) => ({
      chemin: cheminCarte(f),
      svg: carteQuestion(f.question.question, f.theme.titre, mesure)
    }))
  ];
}

/**
 * Tout ce qui sera dessiné sur une carte. La police est réduite à ces
 * caractères-là : ce qui n'y figure pas ne serait pas tracé.
 */
export function textesDesCartes(): string[] {
  return [
    MARQUE,
    'Les diagnostics immobiliers, en clair',
    ...THEMES.map((t) => `${t.titre}${t.titre.toUpperCase()}`),
    ...FICHES.map((f) => f.question.question)
  ];
}

/**
 * Les renvois depuis l'ancienne adresse de la rubrique.
 *
 * Elle s'est appelée « Les diags pour les nuls » et vivait sous
 * `/pour-les-nuls/`. Le nom a changé le 13/08/2026, quelques heures après la
 * mise en ligne — assez tôt pour qu'aucun moteur n'ait indexé, assez tard pour
 * qu'un lien ait pu être partagé.
 *
 * GitHub Pages ne sait pas rediriger côté serveur : on pose donc une page qui
 * renvoie, avec son `canonical` vers la nouvelle adresse et un `noindex` pour
 * qu'elle ne concurrence jamais l'originale. Ces pages n'entrent pas au plan du
 * site. Elles pourront disparaître dans quelques mois.
 */
function renvois(): Fichier[] {
  const anciennes = [
    { de: 'pour-les-nuls/', vers: cheminRubrique() },
    ...THEMES.map((t) => ({ de: `pour-les-nuls/${t.id}/`, vers: cheminTheme(t) })),
    ...FICHES.map((f) => ({
      de: `pour-les-nuls/${f.theme.id}/${f.question.id}/`,
      vers: cheminQuestion(f)
    }))
  ];

  return anciennes.map(({ de, vers }) => ({
    chemin: `${de}index.html`,
    renvoi: true,
    contenu: `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${SITE}/${vers}" />
    <meta http-equiv="refresh" content="0; url=${versRacine(de)}${vers}" />
    <title>Cette page a déménagé — ${MARQUE}</title>
  </head>
  <body>
    <p>
      « Les diags pour les nuls » s’appelle désormais « ${NOM} ».
      <a href="${versRacine(de)}${vers}">Poursuivre vers la nouvelle adresse</a>.
    </p>
  </body>
</html>
`
  }));
}

/** Toutes les pages de la rubrique, prêtes à écrire. */
export function pages(): Fichier[] {
  const toutes: Page[] = [
    pageRubrique(),
    ...THEMES.map(pageTheme),
    ...FICHES.map(pageQuestion),
    ...pagesDeConfiance()
  ];
  return [
    ...toutes.map((p) => ({ chemin: `${p.chemin}index.html`, contenu: gabarit(p) })),
    ...renvois()
  ];
}

/** Le plan du site : la rubrique, et l'application elle-même. */
export function sitemap(): string {
  const adresses = [
    { loc: `${SITE}/`, priorite: '1.0' },
    { loc: `${SITE}/${cheminRubrique()}`, priorite: '0.9' },
    ...THEMES.map((t) => ({ loc: `${SITE}/${cheminTheme(t)}`, priorite: '0.8' })),
    ...FICHES.map((f) => ({ loc: `${SITE}/${cheminQuestion(f)}`, priorite: '0.7' })),
    ...pagesDeConfiance().map((p) => ({ loc: `${SITE}/${p.chemin}`, priorite: '0.5' }))
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

/**
 * Le site est-il ouvert aux moteurs de recherche ?
 *
 * Non tant que la société qui l'édite n'est pas immatriculée. Un site qui
 * donne des informations réglementaires — plomb, monoxyde, décisions à
 * plusieurs dizaines de milliers d'euros — sans éditeur identifiable ni
 * conditions opposables ne doit pas être référencé : le gain de quelques
 * semaines de référencement ne vaut pas ce risque.
 *
 * Le site reste **entièrement accessible** : on peut l'ouvrir, le montrer,
 * l'envoyer. Seuls les robots sont écartés.
 *
 * Le jour de l'immatriculation, `EDITEUR_CONNU` passe à `true` — et
 * l'indexation reprend d'un coup, ici comme dans les pages.
 */
export const EDITEUR_CONNU = false;

export function robots(): string {
  if (!EDITEUR_CONNU) {
    return `# Le site n'est pas encore ouvert aux moteurs de recherche : la société
# qui l'édite est en cours de création. Il n'a donc ni mentions légales, ni
# conditions opposables. Cette page redeviendra « Allow » le jour de
# l'immatriculation.
User-agent: *
Disallow: /
`;
  }

  return `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
}
