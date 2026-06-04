// games/penalty/utils.ts
import type { ShotDirection } from './types';

export function randomDirection(): ShotDirection {
  const dirs: ShotDirection[] = ['left', 'center', 'right'];
  return dirs[Math.floor(Math.random() * 3)];
}

export function isGoal(shotDir: ShotDirection, saveDir: ShotDirection): boolean {
  return shotDir !== saveDir;
}
