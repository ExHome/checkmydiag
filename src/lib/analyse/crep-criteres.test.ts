/**
 * Les deux seuils de l'arrêté, et le refus de corriger le rapport en silence.
 */
import { describe, expect, it } from 'vitest';
import { criteresDuCrep } from './crep-criteres';

const chiffres = (total: number, nm: number, c: [number, number, number, number]) => ({
  total,
  nonMesurees: nm,
  classes: c
});

const local = (nom: string, unites: number, classe3: number, pourcentage: number) => ({
  local: nom,
  unites,
  classe3,
  pourcentage,
  terme: ''
});

describe('le critère des 50 % par local', () => {
  it('se calcule local par local, pas sur le global', () => {
    /*
     * ⚠️ LE piège du § 26. Une seule pièce entièrement en classe 3 déclenche le
     * critère, alors que la part globale reste très basse. Appliquer le
     * pourcentage du bâtiment à chaque local manquerait la situation.
     */
    const r = criteresDuCrep(chiffres(40, 0, [37, 0, 0, 3]), [
      local('Séjour', 37, 0, 0),
      local('Cagibi', 3, 3, 100)
    ]);
    expect(r.critereLocal).toBe(true);
    expect(r.partGlobale).toBe(7.5);
    expect(r.critereGlobal).toBe(false);
  });

  it('retient l’égalité : « au moins 50 % »', () => {
    const r = criteresDuCrep(chiffres(4, 0, [2, 0, 0, 2]), [local('Chambre', 4, 2, 50)]);
    expect(r.locaux[0]?.part).toBe(50);
    expect(r.critereLocal).toBe(true);
  });

  it('ne déclenche pas à 49 %', () => {
    const r = criteresDuCrep(chiffres(100, 0, [51, 0, 0, 49]), [local('Séjour', 100, 49, 49)]);
    expect(r.critereLocal).toBe(false);
    /* En revanche le critère global, lui, est atteint : les deux sont distincts. */
    expect(r.critereGlobal).toBe(true);
  });
});

describe('le critère global des 20 %', () => {
  it('retient l’égalité', () => {
    const r = criteresDuCrep(chiffres(10, 0, [8, 0, 0, 2]), []);
    expect(r.partGlobale).toBe(20);
    expect(r.critereGlobal).toBe(true);
  });

  it('ne conclut rien sans tableau de synthèse', () => {
    const r = criteresDuCrep(null, [local('Séjour', 4, 1, 25)]);
    expect(r.partGlobale).toBeNull();
    expect(r.critereGlobal).toBe(false);
  });
});

describe('le contrôle des pourcentages', () => {
  it('signale un pourcentage imprimé qui ne suit pas les effectifs', () => {
    /*
     * ⚠️ Le récapitulatif par local ne porte QUE la classe 3 — « Nombre d'unités
     * de diagnostic : X - … de classe 3 repéré : Y soit Z % ». Le pourcentage
     * contrôlé ici est donc celui de la classe 3, pas celui du tableau de
     * synthèse. Mon premier cas de test confondait les deux endroits, et le
     * contrôle de cohérence l'a attrapé : c'est ce qu'on lui demande.
     */
    const r = criteresDuCrep(chiffres(12, 0, [9, 0, 0, 3]), [local('Plateau', 12, 3, 20)]);
    expect(r.ecarts).toHaveLength(1);
    expect(r.ecarts[0]).toMatch(/20 %.*25 %/);
    /* La part retenue est celle des effectifs, jamais celle du rapport. */
    expect(r.locaux[0]?.part).toBe(25);
  });

  it('tolère l’arrondi au dixième', () => {
    /* 5 sur 12 = 41,666… → 41,7 : le rapport imprime la même chose. */
    const r = criteresDuCrep(chiffres(12, 2, [5, 0, 0, 5]), [local('Plateau', 12, 5, 41.7)]);
    expect(r.ecarts).toEqual([]);
  });

  it('signale un tableau qui ne se referme pas sur lui-même', () => {
    /* § 41 : total = non mesurées + classes. Ici il manque une unité. */
    const r = criteresDuCrep(chiffres(12, 2, [5, 0, 4, 0]), []);
    expect(r.ecarts[0]).toMatch(/12 unités annoncées, 11 en additionnant/);
  });

  it('signale des locaux qui ne totalisent pas le bâtiment', () => {
    const r = criteresDuCrep(chiffres(12, 0, [12, 0, 0, 0]), [local('Séjour', 8, 0, 0)]);
    expect(r.ecarts.some((e) => /les locaux totalisent 8 unités/.test(e))).toBe(true);
  });

  it('signale un désaccord sur le nombre de classes 3', () => {
    const r = criteresDuCrep(chiffres(10, 0, [7, 0, 0, 3]), [local('Séjour', 10, 2, 20)]);
    expect(r.ecarts.some((e) => /2 unités de classe 3.*en annonce 3/.test(e))).toBe(true);
  });
});
