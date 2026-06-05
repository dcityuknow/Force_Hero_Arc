// games/tugofwar/utils.ts
import type { ArrowKey } from './types';
import { ARROW_KEYS } from './types';

/** Số mũi tên = currentLevel (tối đa 9) */
export function generateArrowSequence(level: number): ArrowKey[] {
  const count = level; // đúng như JS gốc: arrowCount = currentLevel
  return Array.from({ length: count }, () => ARROW_KEYS[Math.floor(Math.random() * 4)]);
}

/** Thời gian giảm dần theo level: Math.max(1800, 5000 - level * 350) */
export function calcTimeLimit(level: number): number {
  return Math.max(1800, 5000 - level * 350);
}

/** Bot delay: Math.max(400, 1600 - level * 120) + random ±100 */
export function calcBotDelay(level: number): number {
  return Math.max(400, 1600 - level * 120) + (Math.random() - 0.5) * 200;
}

export function hasPowerItem(level: number): boolean {
  return level >= 9;
}
