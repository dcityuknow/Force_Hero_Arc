// games/penalty/utils.ts
// Port logic helpers từ penalty.js

import { BOT_SHOT_WEIGHTS, DIR_ZONE_MAP, KEEPER_ACCURACY } from './types';
import type { CompositeDir } from './types';

/** botDecideKeeper: random trong 9 zone */
export function botDecideKeeper(): number {
  return Math.floor(Math.random() * 9);
}

/** botDecideShot: weighted random theo BOT_SHOT_WEIGHTS */
export function botDecideShot(): number {
  const total = BOT_SHOT_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < BOT_SHOT_WEIGHTS.length; i++) {
    r -= BOT_SHOT_WEIGHTS[i];
    if (r <= 0) return i;
  }
  return 8;
}

/** calcZoneFromPowerAndDir: port trực tiếp từ penalty.js */
export function calcZoneFromPowerAndDir(power: number, dir: CompositeDir | null): number {
  if (power > 85) return -1; // OUT

  if (dir && DIR_ZONE_MAP[dir] !== undefined) {
    return DIR_ZONE_MAP[dir];
  }

  // Không có hướng → thẳng, chiều cao theo power
  if (power >= 50) return 1;  // center-top
  if (power >= 30) return 4;  // center-mid
  return 7;                    // center-low
}

/** isZoneSaved: cùng zone = saved; cùng hàng/cột = 38% chance saved */
export function isZoneSaved(shotZone: number, keeperZone: number): boolean {
  if (shotZone === keeperZone) return true;
  const sameCol = (shotZone % 3) === (keeperZone % 3);
  const sameRow = Math.floor(shotZone / 3) === Math.floor(keeperZone / 3);
  if (sameCol || sameRow) return Math.random() < 0.38;
  return false;
}

/** easeInOutQuart */
export function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

/** perspectiveScale: t=0 gần (to), t=1 xa (nhỏ) */
export function perspectiveScale(t: number): number {
  const BIG = 1.0, SMALL = 0.75;
  return BIG + (SMALL - BIG) * t;
}

/** getCompositeDir từ held keys set */
export function getCompositeDir(heldKeys: Set<string>): CompositeDir | null {
  const u = heldKeys.has('up'), d = heldKeys.has('down');
  const l = heldKeys.has('left'), r = heldKeys.has('right');
  if (u && l) return 'up-left';
  if (u && r) return 'up-right';
  if (d && l) return 'down-left';
  if (d && r) return 'down-right';
  if (u) return 'up';
  if (d) return 'down';
  if (l) return 'left';
  if (r) return 'right';
  return null;
}
