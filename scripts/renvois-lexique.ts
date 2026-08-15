/**
 * Combien de renvois le lexique produit-il vraiment ?
 *
 * Dicodiag propose un « voir aussi » déduit des données : deux entrées sont
 * liées quand le motif de reconnaissance de l'une trouve son mot dans la
 * définition de l'autre. Le lien vaut dans les deux sens.
 *
 * Encore faut-il que ça produise quelque chose — un dispositif qui ne renvoie
 * jamais vaut mieux retiré qu'affiché vide.
 */
import { GLOSSAIRE } from '../src/lib/analyse/glossaire';

const tries = [...GLOSSAIRE].sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));

function renvois(terme: (typeof tries)[number]): string[] {
  const texte = terme.points.join(' ');
  return tries
    .filter((autre) => {
      if (autre.titre === terme.titre) return false;
      if (autre.motif.test(texte)) return true;
      return terme.motif.test(autre.points.join(' '));
    })
    .map((autre) => autre.titre)
    .slice(0, 5);
}

let avec = 0;
let total = 0;
const exemples: string[] = [];

for (const t of tries) {
  const r = renvois(t);
  if (r.length) {
    avec++;
    total += r.length;
    if (exemples.length < 12) exemples.push(`  ${t.titre} → ${r.join(', ')}`);
  }
}

console.log(`entrées                 : ${tries.length}`);
console.log(`avec au moins un renvoi : ${avec} (${Math.round((avec / tries.length) * 100)} %)`);
console.log(`renvois au total        : ${total}`);
console.log(exemples.join('\n'));
