// games/penalty/hooks/usePenalty.ts
'use client';
import { useState, useCallback } from 'react';
import type { PenaltyState } from '@/types';
import type { ShotDirection } from '../types';

const MAX_ROUNDS = 5;

function randomDir(): ShotDirection {
  const dirs: ShotDirection[] = ['left', 'center', 'right'];
  return dirs[Math.floor(Math.random() * 3)];
}

const INITIAL_STATE: PenaltyState = {
  round: 0,
  maxRounds: MAX_ROUNDS,
  score: { player: 0, bot: 0 },
  phase: 'idle',
  playerRole: 'shooter',
  winner: null,
};

export function usePenalty() {
  const [state, setState] = useState<PenaltyState>(INITIAL_STATE);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const startGame = useCallback(() => {
    setState({ ...INITIAL_STATE, round: 1, phase: 'shooting', playerRole: 'shooter' });
    setLastResult(null);
  }, []);

  const playerChoose = useCallback((dir: ShotDirection) => {
    setState((prev) => {
      if (prev.phase !== 'shooting' && prev.phase !== 'saving') return prev;
      const botDir = randomDir();
      const isGoal = prev.phase === 'shooting' ? dir !== botDir : dir !== botDir;
      const outcome = isGoal ? 'goal' : 'save';
      const newScore = { ...prev.score };

      if (prev.phase === 'shooting') {
        setLastResult(isGoal ? `⚽ GOAL! You shot ${dir}, bot saved ${botDir}` : `🧤 Saved! Both chose ${dir}`);
        if (isGoal) newScore.player += 1;
      } else {
        setLastResult(isGoal ? `🧤 Great save! Both chose ${dir}` : `⚽ Bot scored! Shot ${botDir}, you saved ${dir}`);
        if (!isGoal) newScore.bot += 1;
      }

      const nextRound = prev.round + 1;
      if (nextRound > MAX_ROUNDS) {
        const winner = newScore.player > newScore.bot ? 'player' : newScore.bot > newScore.player ? 'bot' : 'draw';
        return { ...prev, score: newScore, phase: 'result', winner };
      }

      const nextRole = prev.playerRole === 'shooter' ? 'goalkeeper' : 'shooter';
      return { ...prev, score: newScore, round: nextRound, phase: nextRole === 'shooter' ? 'shooting' : 'saving', playerRole: nextRole };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(INITIAL_STATE);
    setLastResult(null);
  }, []);

  return { state, lastResult, startGame, playerChoose, resetGame };
}
