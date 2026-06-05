// games/tugofwar/types.ts

export type ArrowKey = 'arrowup' | 'arrowdown' | 'arrowleft' | 'arrowright';
export type ArrowSymbol = '↑' | '↓' | '←' | '→';
export type Team = 'left' | 'right';

export const ARROW_KEYS: ArrowKey[] = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

export const ARROW_SYMBOLS: Record<ArrowKey, ArrowSymbol> = {
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
};

export const KEY_TO_ARROW: Record<string, ArrowKey> = {
  ArrowUp: 'arrowup',
  ArrowDown: 'arrowdown',
  ArrowLeft: 'arrowleft',
  ArrowRight: 'arrowright',
};

export interface TugGameState {
  ropePosition: number;       // px offset from center, -280..+280
  gamePhase: 'menu' | 'team-select' | 'playing' | 'result';
  userTeam: Team;
  botTeam: Team;
  currentLevel: number;       // 1–9
  botLevel: number;
  arrowSequence: ArrowKey[];
  userProgress: number;       // index trong sequence
  timeLimit: number;          // ms
  timeRemaining: number;      // ms
  winner: Team | null;
  powerUpActive: boolean;
  itemSpawnCooldown: boolean;
}

// Hằng số vật lý
export const PULL_STRENGTH = 20;
export const AUTO_FRICTION  = 0.2;
export const VICTORY_LIMIT  = 280;
