/** Mesure : les couleurs du DPE sont-elles utilisables, et jusqu'où ? */
type RGB = [number, number, number];

function lire(hex: string): RGB {
  const n = hex.replace('#', '');
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16)
  ];
}

function luminance([r, g, b]: RGB): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (c[0] as number) + 0.7152 * (c[1] as number) + 0.0722 * (c[2] as number);
}

function contraste(a: string, b: string): number {
  const la = luminance(lire(a));
  const lb = luminance(lire(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Assombrit une teinte jusqu'à ce qu'elle atteigne le contraste voulu sur un fond. */
function encreDe(hex: string, fond: string, vise = 4.5): string {
  const [r, g, b] = lire(hex);
  for (let k = 100; k >= 0; k -= 1) {
    const f = k / 100;
    const essai =
      '#' +
      [r, g, b]
        .map((v) => Math.round(v * f).toString(16).padStart(2, '0'))
        .join('');
    if (contraste(essai, fond) >= vise) return essai;
  }
  return '#000000';
}

const DPE: Record<string, string> = {
  A: '#319834', B: '#33cc31', C: '#cbfc34', D: '#fbfe06',
  E: '#fbcc05', F: '#fc9935', G: '#fc0205'
};

const IVOIRE = '#f7f6f2';
const VERT = '#0a2b23';

console.log('classe | couleur  | sur ivoire | sur vert | encre AA sur ivoire   | contraste');
console.log('-------+----------+------------+----------+-----------------------+----------');
for (const [c, hex] of Object.entries(DPE)) {
  const e = encreDe(hex, IVOIRE);
  console.log(
    `   ${c}   | ${hex}  |   ${contraste(hex, IVOIRE).toFixed(2)}     |  ${contraste(hex, VERT).toFixed(2)}    | ${e}               |  ${contraste(e, IVOIRE).toFixed(2)}`
  );
}

console.log('\n--- les couleurs d’état actuelles de la charte ---');
for (const [nom, hex] of Object.entries({ alerte: '#a33220', attention: '#8a5a05', 'alerte-vive': '#a3231a' })) {
  console.log(`${nom.padEnd(12)} ${hex}  sur ivoire ${contraste(hex, IVOIRE).toFixed(2)}`);
}

console.log('\n--- texte NOIR sur aplat DPE (l’étiquette officielle fait ainsi) ---');
for (const [c, hex] of Object.entries(DPE)) {
  const surNoir = contraste(hex, '#0a2b23');
  const surBlanc = contraste(hex, '#ffffff');
  console.log(`${c}  encre vert profond : ${surNoir.toFixed(2)}   encre blanche : ${surBlanc.toFixed(2)}   -> ${surNoir >= 4.5 ? 'ENCRE SOMBRE' : surBlanc >= 4.5 ? 'ENCRE CLAIRE' : 'AUCUNE ENCRE NE PASSE'}`);
}
