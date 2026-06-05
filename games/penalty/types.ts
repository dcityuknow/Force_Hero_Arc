// games/penalty/types.ts
// Port chính xác từ penalty.js

export type Mode = 'shooter' | 'keeper';
export type DiveDir = 'stand' | 'up' | 'down' | 'left' | 'right' | 'left-up' | 'left-down' | 'right-up' | 'right-down';
export type CompositeDir = 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
export type HistoryEntry = 'goal' | 'miss';

// 9 zones: 0(↖) 1(↑) 2(↗) / 3(←) 4(·) 5(→) / 6(↙) 7(↓) 8(↘)
export interface ZonePos {
  l: number; // left %
  b: number; // bottom %
}

export const TOTAL_ROUNDS = 5;

// Xác suất thủ môn đỡ được theo round (0-indexed)
export const KEEPER_ACCURACY = [0.30, 0.35, 0.40, 0.42, 0.48];

// Trọng số hướng sút của bot (9 zone)
export const BOT_SHOT_WEIGHTS = [2, 1, 2, 1, 0, 1, 3, 1, 3];

// Vị trí thủ môn lúc nhảy
export const ZONE_POS: ZonePos[] = [
  { l: 17, b: 30 }, { l: 50, b: 42 }, { l: 83, b: 35 },
  { l: 6,  b: 18 }, { l: 50, b: 10 }, { l: 84, b: 16 },
  { l: 16, b: -10 }, { l: 50, b: 1 }, { l: 84, b: -10 },
];

// Vị trí bóng (riêng biệt)
export const BALL_ZONE_POS: ZonePos[] = [
  { l: 17, b: 55 }, { l: 50, b: 55 }, { l: 83, b: 55 },
  { l: 10, b: 18 }, { l: 50, b: 10 }, { l: 100, b: 16 },
  { l: 16, b: 10 }, { l: 50, b: 1 },  { l: 84, b: 10 },
];

export const DIR_ICONS: Record<CompositeDir, string> = {
  'up': '↑', 'down': '↓', 'left': '←', 'right': '→',
  'up-left': '↖', 'up-right': '↗', 'down-left': '↙', 'down-right': '↘',
};

// Map composite direction → zone
export const DIR_ZONE_MAP: Record<CompositeDir, number> = {
  'up-left': 0, 'up': 1, 'up-right': 2,
  'left': 3,              'right': 5,
  'down-left': 6, 'down': 7, 'down-right': 8,
};

export function zoneToDiveDir(zone: number): DiveDir {
  const dirs: DiveDir[] = ['left-up', 'up', 'right-up', 'left', 'stand', 'right', 'left-down', 'down', 'right-down'];
  return dirs[zone] ?? 'stand';
}

export interface PenaltyGameState {
  mode: Mode;
  round: number;
  playerScore: number;
  botScore: number;
  playerHistory: HistoryEntry[];
  botHistory: HistoryEntry[];
  phase: 'mode-select' | 'playing' | 'result';
  busy: boolean;
}

export interface ShotResult {
  shotZone: number;
  keeperZone: number;
  saved: boolean;
  power: number;
}
