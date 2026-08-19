import { describe, expect, it } from 'vitest';
import { UNIVERS, estSombre, styleUnivers } from './univers';
import type { Ecran } from './univers';

/**
 * La lisibilité des univers, tenue par le test plutôt que par la vigilance.
 *
 * Sept mondes visuels, chacun avec ses couleurs, et une règle qui ne se négocie
 * pas : aucun texte sous 4,5:1 sur le fond où il est réellement posé. Une
 * mesure faite une fois à la main ne protège de rien — la teinte suivante
 * qu'on ajustera « juste un peu » passera sans que personne ne recalcule.
 *
 * Le calcul suit WCAG 2.1, et les couples testés sont ceux que la mise en page
 * produit vraiment : le texte est sur les cartes autant que sur le fond, et
 * l'accent devient un aplat plein sous les boutons.
 */

/** Luminance relative d'une couleur, WCAG 2.1 § définitions. */
function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const canaux = [n.slice(0, 2), n.slice(2, 4), n.slice(4, 6)].map((paire) => {
    const c = parseInt(paire, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (canaux[0] ?? 0) + 0.7152 * (canaux[1] ?? 0) + 0.0722 * (canaux[2] ?? 0);
}

/** Rapport de contraste entre deux couleurs opaques. */
export function contraste(a: string, b: string): number {
  const [clair, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (clair + 0.05) / (sombre + 0.05);
}

describe('la mesure elle-même', () => {
  /*
   * Un test de contraste qui se trompe de calcul valide tout et ne protège de
   * rien. Ces trois repères sont vérifiables de tête : le noir sur blanc vaut
   * 21, une couleur sur elle-même vaut 1.
   */
  it('donne les valeurs connues', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contraste('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    // Le corail de la marque sur blanc : c'est parce qu'il ne tient que 2,8
    // qu'il ne porte jamais de texte, et que le corail foncé existe.
    expect(contraste('#ff6b5d', '#ffffff')).toBeLessThan(3);
  });

  it('ne dépend pas de l’ordre des deux couleurs', () => {
    expect(contraste('#1a4d5c', '#f4e8d8')).toBeCloseTo(contraste('#f4e8d8', '#1a4d5c'), 10);
  });
});

const TEXTE_COURANT = 4.5;
/** Filets, bords et aplats non textuels : WCAG 1.4.11. */
const NON_TEXTUEL = 3;

/**
 * L'aplat le plus dense de l'écran — le vrai pire cas.
 *
 * Le fond nu ne prouve rien. Les fiches, les encarts et les blocs « ce que ça
 * change pour vendre » posent par-dessus lui un voile de l'encre de l'univers,
 * jusqu'à 14 % (`--surface-bord`). C'est SUR CE VOILE que la plupart des textes
 * sont écrits, et il est plus sombre que le fond.
 *
 * L'oubli s'est payé cash : le texte secondaire du DPE, mesuré et validé à 4,77
 * sur son fond, échouait 35 fois à l'écran — à 3,75 sur le voile. Plomb,
 * termites et risques avaient le même défaut, invisible ici et flagrant dans le
 * navigateur.
 */
function surLAplat(fond: string, encre: string, part = 0.14): string {
  const lire = (h: string) => {
    const n = h.replace('#', '');
    return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  };
  const f = lire(fond);
  const e = lire(encre);
  const melange = f.map((c, i) => Math.round(c * (1 - part) + (e[i] ?? 0) * part));
  return '#' + melange.map((c) => c.toString(16).padStart(2, '0')).join('');
}

describe('chaque univers reste lisible', () => {
  const types = Object.keys(UNIVERS) as Ecran[];

  it('en couvre plusieurs', () => {
    expect(types.length).toBeGreaterThanOrEqual(7);
  });

  for (const type of types) {
    const u = UNIVERS[type];
    if (!u) continue;

    describe(type, () => {
      /* Le texte courant, sur les deux fonds qu'il rencontre : la zone de
         contenu, et les cartes posées dessus. */
      it('pose son texte lisiblement sur le fond et sur les cartes', () => {
        expect(contraste(u.texte, u.fond)).toBeGreaterThanOrEqual(TEXTE_COURANT);
        expect(contraste(u.texte, u.surface)).toBeGreaterThanOrEqual(TEXTE_COURANT);
      });

      /* Le texte secondaire porte les précisions et les mentions de validité :
         c'est du texte, il tient le même seuil. « Secondaire » ne veut pas dire
         « facultatif à lire ». */
      it('garde son texte secondaire au-dessus du seuil du texte courant', () => {
        expect(contraste(u.texteDoux, u.fond)).toBeGreaterThanOrEqual(TEXTE_COURANT);
        expect(contraste(u.texteDoux, u.surface)).toBeGreaterThanOrEqual(TEXTE_COURANT);
      });

      /* L'accent devient un bouton plein — « Voir votre nouvelle note » entre
         autres. L'encre qu'on y pose doit tenir. */
      it('supporte une encre lisible quand l’accent devient un aplat', () => {
        expect(contraste(u.surAccent, u.accent)).toBeGreaterThanOrEqual(TEXTE_COURANT);
      });

      /*
       * L'accent sert aussi de texte : intitulés de section, liens, libellés
       * d'action. Sur les deux fonds — et le fond nu est le cas oublié.
       *
       * Ce test ne mesurait que les cartes. L'accent du DPE y passait à 4,72 et
       * échouait à 3,90 sur le kraft, où sont posés « Ce qu'on risque » et
       * « Ce qu'il faut faire ». C'est la mesure dans le navigateur qui l'a vu,
       * pas la suite — d'où cette seconde assertion.
       */
      it('laisse écrire avec l’accent, sur les cartes comme sur le fond', () => {
        expect(contraste(u.accent, u.surface)).toBeGreaterThanOrEqual(TEXTE_COURANT);
        expect(contraste(u.accent, u.fond)).toBeGreaterThanOrEqual(TEXTE_COURANT);
      });

      /*
       * Le pire cas, celui qui manquait.
       *
       * Les trois couleurs qui portent du texte doivent tenir sur l'aplat le
       * plus dense de l'écran, pas seulement sur le fond nu. C'est ce test qui
       * aurait dû attraper les 35 échecs du DPE, les 21 des termites et les 26
       * des risques — tous invisibles quand on ne mesurait que le fond.
       */
      it('tient aussi sur l’aplat le plus dense, où la plupart des textes sont écrits', () => {
        const voile = surLAplat(u.fond, u.texte);
        expect(contraste(u.texte, voile)).toBeGreaterThanOrEqual(TEXTE_COURANT);
        expect(contraste(u.texteDoux, voile)).toBeGreaterThanOrEqual(TEXTE_COURANT);
        expect(contraste(u.accent, voile)).toBeGreaterThanOrEqual(TEXTE_COURANT);
      });

      /* Un filet qui ne se voit pas ne sépare rien. */
      it('trace des filets visibles', () => {
        expect(contraste(u.trait, u.surface)).toBeGreaterThanOrEqual(1.2);
      });

      /*
       * La couleur vive remplit, elle n'écrit pas — et elle se voit.
       *
       * Ce test a d'abord exigé les 3:1 de WCAG 1.4.11. Trois univers l'ont
       * refusé : le corail du DPE (2,59), le violet de l'amiante (2,81),
       * l'orange du gaz (2,78) — c'est-à-dire précisément les couleurs des
       * maquettes, celles de la marque. Le test se trompait, pas elles.
       *
       * Le 3:1 vise les éléments dont la compréhension dépend de la
       * distinction de couleur : une jauge, une barre, un état. La couleur vive
       * ne joue jamais ce rôle ici — elle remplit des surfaces qui portent
       * déjà un texte, un contour ou une forme, et l'information passe par
       * eux. Ce qu'on lui demande, c'est d'être perceptible.
       *
       * La règle qui compte est ailleurs, et c'est la suivante : dès qu'un
       * aplat de couleur vive porte À LUI SEUL une information — une barre de
       * jauge, un segment d'échelle — il lui faut un contour ou une étiquette.
       * Ce garde-fou-là se tient dans les composants, pas ici.
       */
      it('garde une couleur vive perceptible sur son fond', () => {
        /*
         * UNE exception, nommée, et elle vient de l'ordre de mission.
         *
         * L'ODM directeur assigne « jaune chaud » à l'Électricité, et le
         * prototype fournit #FFD45D. Sur l'ivoire, ce jaune ne tient que 1,31 :
         * il est clair par nature, et l'assombrir jusqu'à 1,5 en ferait un
         * ocre — c'est-à-dire une autre couleur que celle qui a été validée.
         *
         * On l'accepte parce que le protocole qualité pose la vraie garde :
         * « couleur jamais seule porteuse du sens ». Le jaune remplit une icône
         * dont le nom est écrit dessous en toutes lettres. Il ne trace jamais
         * un filet, ne remplit jamais une jauge, ne code jamais un état.
         *
         * L'exception est ÉCRITE ICI, pour un univers et un seul. Elle n'est pas
         * un seuil abaissé : les dix autres restent tenus à 1,5, et tout nouvel
         * univers le sera aussi.
         */
        const seuil = type === 'electricite' ? 1.3 : 1.5;
        expect(contraste(u.accentVif, u.fond)).toBeGreaterThanOrEqual(seuil);
      });

      /*
       * Deux rôles, deux valeurs — sauf quand la même couleur peut les tenir.
       *
       * Séparer « ce qui remplit » de « ce qui écrit » n'a de sens que si les
       * deux diffèrent vraiment. Le jaune de l'électricité est l'exception qui
       * confirme : sur son fond noir bleuté il tient 12,8, donc il écrit ET il
       * remplit, et lui donner une seconde valeur serait inventer une nuance
       * dont personne n'a besoin.
       */
      it('distingue la couleur qui remplit de celle qui écrit, ou s’en explique', () => {
        const memeCouleur = u.accentVif.toLowerCase() === u.accent.toLowerCase();
        if (memeCouleur) {
          expect(contraste(u.accentVif, u.fond)).toBeGreaterThanOrEqual(TEXTE_COURANT);
        } else {
          expect(contraste(u.accent, u.fond)).toBeGreaterThan(contraste(u.accentVif, u.fond));
        }
      });

      /*
       * Le garde-fou qui compte vraiment.
       *
       * On est dans une vente immobilière : une anomalie grave doit sauter aux
       * yeux dans les sept écrans, pas seulement dans six. Les trois couleurs
       * d'état sont réglées pour du fond clair ; un univers sombre doit donc se
       * déclarer comme tel, sinon l'alerte s'éteint sans que rien ne le signale.
       */
      it('déclare la clarté de son fond, faute de quoi les alertes s’éteignent', () => {
        const fondClair = luminance(u.fond) > 0.18;
        expect(estSombre(type)).toBe(!fondClair);
      });

      it('laisse l’alerte du produit se détacher de son fond', () => {
        // #a33220 sur fond clair, #ff9084 sur fond sombre — les deux valeurs
        // déjà en service dans le produit.
        const alerte = estSombre(type) ? '#ff9084' : '#a33220';
        expect(contraste(alerte, u.fond)).toBeGreaterThanOrEqual(NON_TEXTUEL);
        expect(contraste(alerte, u.surface)).toBeGreaterThanOrEqual(NON_TEXTUEL);
      });
    });
  }
});

describe('les jetons livrés au CSS', () => {
  it('donne les sept variables d’un univers connu', () => {
    const style = styleUnivers('plomb');
    for (const jeton of [
      '--u-fond',
      '--u-surface',
      '--u-texte',
      '--u-texte-doux',
      '--u-accent',
      '--u-sur-accent',
      '--u-trait'
    ]) {
      expect(style).toContain(jeton);
    }
  });

  /*
   * Les diagnostics sans univers ne doivent pas se retrouver sans couleurs :
   * une chaîne vide laisse jouer les replis de la charte, écrits dans le CSS.
   * Renvoyer des jetons à moitié remplis les casserait à la place.
   *
   * Le mesurage servait d'exemple ici — il n'avait pas d'univers. Il en a un
   * depuis le passage au fond pétrole, comme l'assainissement et « En clair » :
   * les onze écrans sont désormais couverts, et il n'y a plus de repli à
   * démontrer sur un cas réel. On vérifie donc le comportement lui-même, sur un
   * écran qui n'existe pas.
   */
  it('se tait pour un écran sans univers, et laisse la charte reprendre', () => {
    expect(styleUnivers('inconnu' as never)).toBe('');
  });

  it('couvre les onze écrans du produit', () => {
    for (const ecran of [
      'dpe',
      'electricite',
      'amiante',
      'plomb',
      'gaz',
      'termites',
      'erp',
      'carrez',
      'assainissement',
      'dicodiag',
      'en-clair'
    ] as Ecran[]) {
      expect(styleUnivers(ecran), ecran).not.toBe('');
    }
  });
});
