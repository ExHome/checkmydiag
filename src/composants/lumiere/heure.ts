/**
 * LA LUMIÈRE QUI SUIT L'HEURE.
 *
 * L'accueil de Verrière n'est pas éclairé de la même façon à 7 h et à 19 h. La
 * lumière de fin d'après-midi de la publicité de marque n'est pas un décor
 * figé : c'est un MOMENT, et un moment se déplace. On ne voit donc jamais deux
 * fois le même écran.
 *
 * ── Pourquoi une fonction pure ──────────────────────────────────────────────
 *
 * L'heure ENTRE en paramètre. Elle n'est lue nulle part ici. C'est ce qui rend
 * les quatre moments de référence vérifiables par un test plutôt que par une
 * capture d'écran prise à la bonne heure — et c'est ce qui permet de figer la
 * lumière pour une démonstration ou une impression.
 *
 * ── Ce que la fonction NE fait pas ──────────────────────────────────────────
 *
 * Elle ne calcule pas la position réelle du soleil : cela demanderait la date,
 * la latitude et la longitude, donc une donnée de localisation qu'on ne
 * demande pas et qu'on n'a aucune raison d'avoir. C'est une lumière
 * D'INTÉRIEUR, plausible, celle d'une maison sous une verrière — pas un
 * éphéméride.
 */

/** L'état de la lumière à un instant donné. Quatre grandeurs, plus le régime. */
export interface Lumiere {
  /** Élévation apparente de la source, 0° (rasante) à 90° (zénith). */
  inclinaison: number;
  /**
   * D'où elle vient : −1 le matin (par la gauche), +1 le soir (par la droite).
   *
   * Une longueur d'ombre sans direction serait un mensonge sur l'heure : à 8 h
   * et à 19 h les ombres ont la même longueur et tombent du côté opposé. C'est
   * la direction qui fait reconnaître le moment, pas la longueur.
   */
  azimut: number;
  /** Température de la lumière, en kelvins, de 2000 (braise) à 6300 (zénith). */
  temperature: number;
  /** Intensité de la source, de 0,12 (nuit) à 1 (plein midi). */
  intensite: number;
  /** Longueur des ombres, en multiples de la hauteur de l'objet. */
  ombre: number;
  /** Vrai quand ce sont les carreaux eux-mêmes qui éclairent la pièce. */
  nuit: boolean;
}

/** Le jour utile de la maison. Ce ne sont pas les éphémérides, c'est un décor. */
const LEVER = 6.5;
const COUCHER = 21;
const AMPLITUDE = COUCHER - LEVER;

/**
 * L'état de la lumière pour une heure décimale (13,75 = 13 h 45).
 *
 * Toutes les grandeurs sont bornées : `intensite` dans [0,12 ; 1], `ombre`
 * dans [0,18 ; 4,7], `temperature` dans [2000 ; 6300]. Aucune ne peut sortir
 * de son domaine, quelle que soit l'entrée — heure négative ou supérieure à
 * 24 comprise.
 */
export function lumiereDe(heure: number): Lumiere {
  const h = ((heure % 24) + 24) % 24;
  const jour = h > LEVER && h < COUCHER;
  /* L'arc du jour : 0 au lever et au coucher, 1 au milieu. */
  const arc = jour ? Math.sin((Math.PI * (h - LEVER)) / AMPLITUDE) : 0;
  /* L'exposant 1,9 est ce qui donne à Verrière sa fin d'après-midi : il garde
     la source basse longtemps et ne monte au zénith qu'au milieu exact. Avec
     un arc brut (exposant 1), 18 h culminerait à 54° — un plein après-midi
     de bureau, pas la lumière rasante de la publicité. */
  const inclinaison = 90 * Math.pow(arc, 1.9);
  const t = inclinaison / 90;
  return {
    inclinaison,
    azimut: jour ? Math.max(-1, Math.min(1, (h - (LEVER + AMPLITUDE / 2)) / (AMPLITUDE / 2))) : 0,
    /* La chaleur SE POSE sur le vert, elle ne s'y mélange pas : elle est ici,
       dans la source, et nulle part dans la teinte du fond. */
    temperature: jour ? 2000 + 4300 * Math.pow(t, 1.6) : 2700,
    intensite: jour ? 0.12 + 0.88 * Math.pow(arc, 0.7) : 0.12,
    /* cot(élévation), plancher à 12° pour ne pas diverger, plafond à 4,7 —
       au-delà l'ombre sort de l'écran et ne dit plus rien. */
    ombre: jour
      ? Math.max(0.18, Math.min(4.7, 1 / Math.tan((Math.max(inclinaison, 12) * Math.PI) / 180)))
      : 1.1,
    nuit: !jour
  };
}

/**
 * LES QUATRE MOMENTS DE RÉFÉRENCE.
 *
 * Ce sont les heures que le test vérifie et celles qu'on fige pour une
 * démonstration. Ils ne sont pas décoratifs : `dore` est le moment de marque,
 * celui de la publicité, et c'est lui qui doit être le plus beau des quatre.
 */
export const MOMENTS = {
  aube: 7,
  midi: 13.75,
  dore: 18,
  nuit: 23
} as const;

/*
 * LA RAMPE DE TEMPÉRATURE, et pourquoi elle n'est pas un corps noir.
 *
 * Un vrai corps noir à 2000 K sort à #ff8b14 : saturé, orange pur, il
 * arracherait l'écran. Ces cinq ancrages sont la lumière de la publicité de
 * marque, relevée dans `PALETTE-MESUREE.md` — champagne #f6ead8, sable
 * #e8d6b9, sable plein #c8b599 — remontées en saturation juste ce qu'il faut
 * pour rester une SOURCE et non un aplat.
 *
 * Leurs teintes : 29,2° · 33,3° · 34,4° · 38,1° · 40,0°.
 *
 * Toutes entre le terracotta (18°) et le sable (40°), aucune dans l'intervalle
 * interdit 60°–140° des jaunes-verts. C'est vérifié par le test : c'est
 * exactement l'erreur du citron, et elle ne peut pas revenir par la lumière.
 */
const RAMPE: readonly (readonly [number, readonly [number, number, number]])[] = [
  [2000, [217, 138, 63]], // #d98a3f  la braise
  [3000, [232, 176, 106]], // #e8b06a  la lampe
  [3400, [238, 194, 135]], // #eec287  la fin d'après-midi
  [4500, [243, 220, 180]], // #f3dcb4  le plein jour
  [6300, [250, 246, 238]] // #faf6ee  le zénith
] as const;

/** La couleur d'une lumière à `kelvin`, dans la famille chaude de la marque. */
export function teinteDe(kelvin: number): string {
  const K = Math.max(2000, Math.min(6300, kelvin));
  for (let i = 1; i < RAMPE.length; i++) {
    const bas = RAMPE[i - 1];
    const haut = RAMPE[i];
    if (!bas || !haut) break;
    if (K <= haut[0]) {
      const t = (K - bas[0]) / (haut[0] - bas[0]);
      const octet = (a: number, b: number) =>
        Math.round(a + (b - a) * t)
          .toString(16)
          .padStart(2, '0');
      return `#${octet(bas[1][0], haut[1][0])}${octet(bas[1][1], haut[1][1])}${octet(bas[1][2], haut[1][2])}`;
    }
  }
  return '#faf6ee';
}

/**
 * LA BRIDE DU CARREAU — 3400 K.
 *
 * Un carreau rétroéclairé n'est pas éclairé par le soleil : il a son propre
 * tube, derrière la vitre. Sa teinte ne suit donc PAS la température du jour
 * au-delà de 3400 K.
 *
 * Ce n'est pas une préférence esthétique, c'est une borne de lisibilité, et
 * elle se démontre. À midi, la lumière vaut #faf6ee ; posée à 46 % derrière
 * une vitre sur le vert profond, elle produit une face à L = 0,232 — au milieu
 * de la bande morte, où plus aucune encre ne tient 4,5. Bridée à 3400 K, la
 * même face vaut L = 0,158 et l'ivoire y tient 4,79.
 *
 * Un carreau bleuâtre à midi serait, en plus, la seule couleur froide de
 * l'écran : la bride sert deux fois.
 */
export function teinteDuCarreau(l: Lumiere): string {
  return teinteDe(Math.min(l.temperature, 3400));
}

/** L'heure décimale d'une date. Le seul endroit du mécanisme qui lit l'horloge. */
export function heureDecimale(d: Date): number {
  return d.getHours() + d.getMinutes() / 60;
}
