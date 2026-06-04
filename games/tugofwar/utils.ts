// games/tugofwar/utils.ts
import type { Direction } from './types';
import { DIRECTIONS } from './types';

export function generateSequence(level: number): Direction[] {
  const length = Math.min(3 + level, 10);
  return Array.from({ length }, () => DIRECTIONS[Math.floor(Math.random() * 4)]);
}

export function calcTimeLimit(level: number): number {
  // Starts at 8s, reduces by 0.5s per level, min 3s
  return Math.max(3000, 8000 - level * 500);
}

export function hasPowerItem(level: number): boolean {
  return level >= 9;
}
