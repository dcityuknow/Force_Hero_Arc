// games/penalty/types.ts
export type ShotDirection = 'left' | 'center' | 'right';
export type SaveDirection = 'left' | 'center' | 'right';
export type RoundOutcome = 'goal' | 'save';

export interface PenaltyRound {
  roundNumber: number;
  playerRole: 'shooter' | 'goalkeeper';
  playerChoice: ShotDirection | null;
  botChoice: ShotDirection | null;
  outcome: RoundOutcome | null;
}
