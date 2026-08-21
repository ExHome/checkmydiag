/**
 * LES ENDROITS — ce que le moteur a su borner, et ce qu'il n'a pas vu.
 *
 * Règle maîtresse d'Aude : **on ne cherche jamais une information, on cherche
 * l'ENDROIT qui la porte.** Un rapport est un formulaire ; ses informations
 * occupent des rubriques nommées, aux bornes précises. Tout ce que le moteur
 * lit de travers vient d'une rubrique mal bornée — ou pas trouvée du tout.
 *
 * Cet écran met le découpage à plat pour qu'Aude puisse agir dessus :
 *
 *   — les VOLETS reconnus, avec leurs pages ;
 *   — dans chacun, les RUBRIQUES trouvées, avec leur repère et leur taille ;
 *   — les rubriques ATTENDUES QUI MANQUENT — le silence, la partie qui compte ;
 *   — les pages rattachées à AUCUN volet, qui disparaissent du dossier.
 *
 * Ce module LIT `src/lib/analyse/` et ne le modifie jamais : le moteur est le
 * périmètre d'une autre session. Ce qu'Aude corrige ici ressort sous forme de
 * ligne exacte, prête à devenir une forme et un test.
 */
import { decouper } from '../analyse/decoupe';
import { INTITULES, rubriquesDe } from '../analyse/rubriques';
import type { PageTexte } from '../lignes';
import type { TypeDiag } from '../modele';

export interface RubriqueVue {
  /** La lettre ou le numéro, tel qu'écrit : « E », « 3.2 ». */
  repere: string;
  titre: string;
  /** Combien de lignes elle porte : une rubrique à zéro ligne est mal bornée. */
  lignes: number;
  /** Sa position dans le volet, pour la retrouver dans le texte. */
  debut: number;
}

/**
 * Une ligne du rapport, telle qu'elle s'affiche dans la fenêtre de lecture.
 *
 * C'est la surface de travail : on ne recopie pas une ligne à la main, on la
 * DÉSIGNE dans le texte. Recopier, c'est risquer une faute de frappe qui rendra
 * la forme inopérante — et c'est justement ce qu'on veut éviter.
 */
export interface LigneVue {
  /** Sa position dans le volet, telle que le moteur la voit. */
  index: number;
  texte: string;
  /** Renseigné quand le moteur y a reconnu l'ouverture d'une rubrique. */
  repere?: string;
}

export interface VoletVu {
  type: TypeDiag;
  /** Première et dernière page du volet dans le rapport. */
  pages: [number, number];
  lignes: number;
  rubriques: RubriqueVue[];
  /** Le texte du volet, ligne à ligne, avec les repères déjà reconnus. */
  texte: LigneVue[];
  /**
   * Les rubriques que le moteur SAIT nommer pour ce volet et qu'il n'a pas
   * trouvées ici. C'est le silence : soit elles sont absentes du rapport (une
   * réponse en soi), soit cet éditeur les écrit autrement — et c'est là qu'il
   * faut agir.
   */
  attenduesManquantes: string[];
}

/**
 * Une page du rapport, telle qu'on la lit dans l'atelier.
 *
 * Le rapport se lit ENTIER — y compris les pages que le moteur n'a rattachées
 * à aucun volet. Ce sont souvent les plus intéressantes : ce qu'on ne voit pas
 * ne se corrige pas, et une page invisible sort du dossier sans bruit.
 */
export interface PageVue {
  numero: number;
  /** Le volet auquel la page a été rattachée, ou `null` si aucun. */
  volet: TypeDiag | null;
  lignes: LigneVue[];
}

export interface Endroits {
  volets: VoletVu[];
  /** Le rapport entier, page par page — la surface de lecture. */
  pages: PageVue[];
  /** Pages qui n'ont été rattachées à aucun volet : elles sortent du dossier. */
  horsSection: number;
  /** La page de synthèse, quand le rapport en porte une. */
  synthese: [number, number] | null;
}

/**
 * Les clés d'intitulés connues pour un volet — celles que le moteur sait
 * chercher. Vide quand aucun intitulé n'est encore décrit pour ce type.
 */
export function clesAttendues(type: TypeDiag): string[] {
  return Object.keys(INTITULES[type] ?? {});
}

/** Le découpage d'un rapport, mis à plat. */
export function endroitsDe(pages: PageTexte[]): Endroits {
  const decoupe = decouper(pages);

  const volets: VoletVu[] = decoupe.sections.map((section) => {
    const trouvees = rubriquesDe(section.lignes);
    const intitules = INTITULES[section.type] ?? {};

    /*
     * Une rubrique attendue est « trouvée » si son motif accroche l'un des
     * titres relevés. On compare au TITRE, jamais au corps : un motif lâché sur
     * le volet entier ramènerait ce qui lui ressemble, pas ce qu'on cherche.
     */
    const manquantes = Object.entries(intitules)
      .filter(([, motif]) => !trouvees.some((r) => motif.test(r.titre)))
      .map(([cle]) => cle);

    /* Les débuts de rubrique, pour marquer les lignes correspondantes. */
    const reperes = new Map(trouvees.map((r) => [r.debut, r.repere]));

    return {
      type: section.type,
      pages: section.plage,
      lignes: section.lignes.length,
      texte: section.lignes.map((texte, index) => {
        const repere = reperes.get(index);
        return repere ? { index, texte, repere } : { index, texte };
      }),
      rubriques: trouvees.map((r) => ({
        repere: r.repere,
        titre: r.titre,
        lignes: r.lignes.length,
        debut: r.debut
      })),
      attenduesManquantes: manquantes
    };
  });

  /*
   * Le rapport entier, page par page. Le volet de rattachement vient des
   * plages de sections ; une page qu'aucune plage ne couvre est orpheline, et
   * c'est dit franchement plutôt que passé sous silence.
   */
  const voletDeLaPage = (numero: number): TypeDiag | null =>
    decoupe.sections.find((s) => numero >= s.plage[0] && numero <= s.plage[1])?.type ?? null;

  /* Les lignes déjà reconnues comme ouvrant une rubrique, pour les marquer
     aussi dans la lecture page à page. */
  const titresReperes = new Map<string, string>();
  for (const volet of volets) {
    for (const l of volet.texte) {
      if (l.repere) titresReperes.set(l.texte, l.repere);
    }
  }

  const pagesVues: PageVue[] = pages.map((p) => ({
    numero: p.numero,
    volet: voletDeLaPage(p.numero),
    lignes: p.lignes.map((texte, index) => {
      const repere = titresReperes.get(texte);
      return repere ? { index, texte, repere } : { index, texte };
    })
  }));

  return {
    volets,
    pages: pagesVues,
    horsSection: decoupe.horsSection.length,
    synthese: decoupe.plageSynthese
  };
}

/**
 * Une correction d'endroit, telle qu'Aude la formule.
 *
 * C'est la sortie utile de l'atelier : pas une impression, mais la LIGNE EXACTE
 * du rapport qui ouvre une rubrique que le moteur n'a pas su voir, rattachée à
 * son volet, à sa clé, et à l'éditeur chez qui elle s'écrit ainsi. Il n'en faut
 * pas plus pour ajouter une forme et le test qui la tient.
 */
export interface CorrectionEndroit {
  editeur: string | null;
  volet: TypeDiag;
  /** La clé d'intitulé visée — « anomalies », « conclusion »… */
  cle: string;
  /** La ligne du rapport, désignée dans le texte — jamais retapée. */
  ligne: string;
  /**
   * Pourquoi cet endroit compte plus qu'un autre.
   *
   * C'est ce qu'Aude seule peut dire : quelle rubrique engage l'acquéreur,
   * laquelle est décorative. Sans cette phrase, on corrigerait dans l'ordre où
   * les manques se présentent, ce qui n'est l'ordre de personne.
   */
  pourquoi?: string;
}

/** La correction, écrite comme une ligne de carnet — lisible et vérifiable. */
export function formulerCorrection(c: CorrectionEndroit): string {
  const base = `ENDROIT · ${c.volet} · ${c.cle} · chez ${c.editeur ?? 'éditeur inconnu'} — la rubrique s'ouvre par : « ${c.ligne.trim()} »`;
  return c.pourquoi?.trim() ? `${base}
  PRIORITÉ : ${c.pourquoi.trim()}` : base;
}
