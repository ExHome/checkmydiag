/**
 * LE PONT — Claude dans la zone de travail, sans que rien ne sorte du dépôt.
 *
 * POURQUOI UN PONT, ET PAS UN APPEL DIRECT. Le site est statique et le dépôt
 * est PUBLIC. Une clé d'API posée dans le JavaScript de la page serait lisible
 * par n'importe qui et facturée sur le compte d'Aude — ce n'est pas une option.
 * Ce petit service tourne SUR LE POSTE : il garde la clé, la page ne la voit
 * jamais, et rien ne fonctionne depuis un autre ordinateur. C'est exactement ce
 * qu'on veut d'un outil privé.
 *
 * ⚠️ CE QUI SORT DU POSTE. Ce pont envoie à l'API d'Anthropic le texte
 * qu'Aude choisit de lui donner. Un rapport de diagnostic porte le nom et
 * l'adresse de vrais clients : rien ne part automatiquement, jamais, et chaque
 * envoi est déclenché à la main depuis la zone de travail, qui affiche d'abord
 * ce qui va partir. La promesse publique de Verrière — « tout est lu sur votre
 * appareil, rien n'est envoyé » — porte sur l'application du visiteur, et elle
 * reste vraie : ce pont ne tourne que chez Aude, et jamais chez un visiteur.
 *
 *   set ANTHROPIC_API_KEY=...        (une fois, dans le terminal)
 *   node scripts/pont-claude.mjs
 *
 * Il écoute sur 127.0.0.1 — la boucle locale, jamais le réseau : même sur un
 * wifi partagé, aucune autre machine ne peut l'atteindre.
 */
import { createServer } from 'node:http';
import Anthropic from '@anthropic-ai/sdk';

const PORT = Number(process.env.PONT_PORT ?? 8787);

/* Les origines autorisées à parler au pont : l'atelier en ligne, et n'importe
   quel serveur de développement de CE poste — le port de Vite change d'une
   session à l'autre, et énumérer les ports ne protégerait de rien de plus (le
   pont n'écoute déjà que sur la boucle locale).

   L'atelier vivant derrière un portail privé, son adresse n'est pas celle du
   site public : elle se donne au lancement, et peut en lister plusieurs.

     set PONT_ATELIER=https://atelier-verriere.pages.dev
     node scripts/pont-claude.mjs */
const SITE = new Set(
  (process.env.PONT_ATELIER ?? 'https://verriere-diag.fr,https://www.verriere-diag.fr')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
);
const LOCALE = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const autorisee = (origine) => SITE.has(origine) || LOCALE.test(origine);

/* Un garde-fou sur ce qui peut partir en une fois. Un DDT fait 40 à 130 pages :
   l'envoyer en entier serait à la fois coûteux et contraire à l'idée — on
   envoie un passage, pas un dossier. */
const PLAFOND_CARACTERES = 60_000;

const cle = process.env.ANTHROPIC_API_KEY;
if (!cle) {
  console.error(
    'ANTHROPIC_API_KEY absente. Le pont ne démarre pas : sans clé il ne peut rien faire,\n' +
      'et une clé écrite en dur dans un fichier finirait par partir dans le dépôt public.'
  );
  process.exit(1);
}

const claude = new Anthropic({ apiKey: cle });

/** L'en-tête qui autorise la page à lire la réponse — sinon le navigateur la jette. */
function entetes(origine) {
  return {
    'Access-Control-Allow-Origin': origine,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Private-Network': 'true',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

const serveur = createServer(async (requete, reponse) => {
  const origine = requete.headers.origin ?? '';
  if (!autorisee(origine)) {
    reponse.writeHead(403).end('origine non autorisée');
    return;
  }

  /* Le navigateur demande d'abord la permission (préflight) avant d'appeler un
     service local depuis une page en HTTPS. */
  if (requete.method === 'OPTIONS') {
    reponse.writeHead(204, entetes(origine)).end();
    return;
  }

  /* La page appelle ceci au chargement pour savoir si Claude est là. */
  if (requete.method === 'GET' && requete.url === '/present') {
    reponse.writeHead(200, entetes(origine)).end(JSON.stringify({ present: true }));
    return;
  }

  if (requete.method !== 'POST' || requete.url !== '/demander') {
    reponse.writeHead(404, entetes(origine)).end(JSON.stringify({ erreur: 'route inconnue' }));
    return;
  }

  let brut = '';
  for await (const morceau of requete) brut += morceau;

  try {
    /*
     * LE FIL. La zone de travail est un lieu de travail : l'échange s'y
     * poursuit d'un message à l'autre, sur le rapport ouvert. Le pont reçoit
     * donc l'historique entier — c'est l'appelant qui le tient, l'API des
     * messages étant sans mémoire.
     */
    const { systeme, question, extrait, fil } = JSON.parse(brut);
    if (typeof question !== 'string' || !question.trim()) {
      reponse.writeHead(400, entetes(origine)).end(JSON.stringify({ erreur: 'question vide' }));
      return;
    }
    const anterieurs = Array.isArray(fil) ? fil : [];

    const envoi = `${systeme ?? ''}${question}${extrait ?? ''}${anterieurs
      .map((t) => t.content ?? '')
      .join('')}`;
    if (envoi.length > PLAFOND_CARACTERES) {
      reponse
        .writeHead(413, entetes(origine))
        .end(
          JSON.stringify({
            erreur: `${envoi.length} caractères : au-delà de ${PLAFOND_CARACTERES}, on envoie un dossier et non un passage.`
          })
        );
      return;
    }

    /* Ce qui part est écrit dans le terminal, en clair et en volume : Aude voit
       ce qui sort de son poste sans avoir à me croire sur parole. */
    console.log(
      `→ ${envoi.length} caractères envoyés` +
        (anterieurs.length ? ` (fil de ${anterieurs.length} messages)` : '') +
        ` · « ${question.slice(0, 70)} »`
    );

    const message = await claude.messages.create({
      model: 'claude-opus-5',
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      ...(systeme ? { system: systeme } : {}),
      messages: [
        {
          role: 'user',
          content: extrait ? `${question}\n\n--- passage du rapport ---\n${extrait}` : question
        }
      ]
    });

    /* Une décision de sécurité côté Anthropic n'est pas une panne : on la dit. */
    if (message.stop_reason === 'refusal') {
      reponse
        .writeHead(200, entetes(origine))
        .end(JSON.stringify({ refus: true, texte: 'Demande déclinée par le modèle.' }));
      return;
    }

    const texte = message.content
      .filter((bloc) => bloc.type === 'text')
      .map((bloc) => bloc.text)
      .join('\n');

    reponse.writeHead(200, entetes(origine)).end(JSON.stringify({ texte }));
    console.log(`← ${texte.length} caractères reçus`);
  } catch (erreur) {
    console.error('échec :', erreur);
    reponse
      .writeHead(500, entetes(origine))
      .end(JSON.stringify({ erreur: String(erreur).slice(0, 200) }));
  }
});

serveur.listen(PORT, '127.0.0.1', () => {
  console.log(`Le pont écoute sur http://127.0.0.1:${PORT} — ce poste uniquement.`);
  console.log('Ouvrez la zone de travail : Claude y apparaît comme disponible.');
});
