/**
 * La pile d'exploration.
 *
 * Le lecteur ne quitte jamais son contexte (§ 14) : ouvrir une notion ne change
 * pas de page, ça empile. Le fil d'Ariane montre d'où il vient, et le retour est
 * toujours à un geste. Une pile, pas un historique de navigation : quand il
 * ferme, il retrouve exactement son schéma.
 */
import type { Diagnostic } from '../modele';
import { notion, type Notion } from './notions';

class Exploration {
  /** Les notions ouvertes, de la première à la dernière. */
  chemin = $state<Notion[]>([]);
  /** Le dossier déposé, s'il y en a un — c'est lui qui alimente « Et chez moi ? ». */
  dossier = $state<Diagnostic[]>([]);

  get courante(): Notion | null {
    return this.chemin[this.chemin.length - 1] ?? null;
  }

  get ouverte(): boolean {
    return this.chemin.length > 0;
  }

  /** Le mode change tout seul selon qu'un rapport a été déposé (§ 12). */
  get personnalise(): boolean {
    return this.dossier.length > 0;
  }

  ouvrir(id: string): void {
    const n = notion(id);
    if (!n) {
      // Un clip qui pointe vers une notion inexistante ne rend rien : sans ça,
      // le trou serait silencieux jusque chez le lecteur.
      if (import.meta.env.DEV) console.warn(`[savoir] notion inconnue : « ${id} »`);
      return;
    }
    // Rouvrir une notion déjà dans le chemin y revient au lieu de boucler.
    const dejaLa = this.chemin.findIndex((c) => c.id === n.id);
    if (dejaLa !== -1) {
      this.chemin = this.chemin.slice(0, dejaLa + 1);
      return;
    }
    this.chemin = [...this.chemin, n];
  }

  /** Revenir à une étape précise du fil d'Ariane. */
  revenirA(index: number): void {
    this.chemin = this.chemin.slice(0, index + 1);
  }

  revenir(): void {
    this.chemin = this.chemin.slice(0, -1);
  }

  fermer(): void {
    this.chemin = [];
  }
}

export const exploration = new Exploration();
