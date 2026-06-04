// games/tugofwar/types.ts
export type Direction = '←' | '→' | '↑' | '↓';

export interface TugRound {
  level: number;
  sequence: Direction[];
  timeLimit: number; // ms
}

export const DIRECTIONS: Direction[] = ['←', '→', '↑', '↓'];

export const KEY_MAP: Record<string, Direction> = {
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  ArrowDown: '↓',
};
