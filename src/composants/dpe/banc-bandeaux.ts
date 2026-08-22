/**
 * Banc de vérification des bandeaux — développement seulement.
 *
 * Le contrôle par le texte prouve qu'une bande contient la bonne rubrique. Il ne
 * prouve pas qu'elle est BELLE : qu'aucun titre n'est coupé en deux, qu'il n'y a
 * ni bande blanche ni moitié de tableau. Cela se voit, et cela se regarde.
 *
 * Ce banc découpe les bandeaux d'un rapport local et les pose sur `window` pour
 * qu'on puisse les sortir et les regarder. Le PDF vit dans `.tmp/`, hors du
 * dépôt : il porte le nom de vraies personnes.
 */
import '../../app.css';
import { analyser } from '../../lib/analyse';
import { ouvrirPdf } from '../../lib/pdf';

const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');

const journal: string[] = [];
function etape(mot: string) {
  journal.push(`${new Date().toISOString().slice(11, 19)} ${mot}`);
  (window as unknown as { ETAPES: string[] }).ETAPES = journal;
  cible!.innerHTML = `<pre style="font:12px ui-monospace;padding:1rem">${journal.join('\n')}</pre>`;
}

try {
  etape('fetch du PDF');
  const reponse = await fetch('/.tmp/essai.pdf');
  const fichier = new File([await reponse.blob()], 'essai.pdf', { type: 'application/pdf' });
  etape(`fichier ${Math.round(fichier.size / 1024)} Ko`);

  const doc = await ouvrirPdf(fichier);
  etape(`ouvert, ${doc.pages.length} pages`);

  const analyse = analyser(doc.pages, doc.metadonnees);
  const volet = analyse.diagnostics.find((d) => d.type === 'dpe');
  etape(volet ? `volet DPE p.${volet.pages[0]}-${volet.pages[1]}` : 'PAS DE VOLET DPE');
  if (!volet) throw new Error('pas de volet DPE');

  etape('découpage des bandeaux…');
  const bandeaux = await doc.bandeaux(volet.pages);
  etape(`${bandeaux.length} bandeaux découpés`);
  (window as unknown as { BANDEAUX: unknown }).BANDEAUX = bandeaux;

  cible.innerHTML =
    `<p style="font:14px system-ui;padding:1rem">volet DPE p.${volet.pages[0]}–${volet.pages[1]} · ` +
    `${bandeaux.length} bandeaux</p>` +
    bandeaux
      .map(
        (b) =>
          `<figure style="margin:0 0 1.5rem;font:13px system-ui"><figcaption style="padding:.4rem 1rem">` +
          `<b>${b.nom}</b> — page ${b.page} — ${b.photo.largeur}×${b.photo.hauteur}</figcaption>` +
          `<img src="${b.photo.image}" style="width:100%;display:block;border-top:1px solid #ddd" /></figure>`
      )
      .join('');
} catch (e) {
  etape('ÉCHEC : ' + (e instanceof Error ? e.message : String(e)));
}
