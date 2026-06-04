// types/index.ts

export interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  badgeVariant?: 'new' | 'hot' | 'multiplayer';
  tags: string[];
  href: string;
  glowColor: string;
  available: boolean;
}

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  ticketsSpent: number;
  ticketsWon: number;
}

export interface TicketBalance {
  balance: bigint;
  formatted: string;
}

export interface GameResult {
  gameId: string;
  winner: 'player' | 'bot' | 'draw';
  timestamp: number;
  ticketsBet: number;
  ticketsWon: number;
}

// TugOfWar types
export interface TugOfWarState {
  ropePosition: number; // -100 to 100, 0 = center
  level: number;
  sequence: string[];
  playerInput: string[];
  gamePhase: 'idle' | 'playing' | 'result';
  winner: 'player' | 'bot' | null;
  score: { player: number; bot: number };
  powerItemActive: boolean;
}

// Penalty types
export interface PenaltyState {
  round: number;
  maxRounds: number;
  score: { player: number; bot: number };
  phase: 'shooting' | 'saving' | 'result' | 'idle';
  playerRole: 'shooter' | 'goalkeeper';
  winner: 'player' | 'bot' | 'draw' | null;
}
