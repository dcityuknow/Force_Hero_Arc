// hooks/useGameStats.ts
'use client';
import { useState, useCallback } from 'react';
import type { PlayerStats, GameResult } from '@/types';

const STORAGE_KEY = 'force_hero_stats';

function loadStats(): PlayerStats {
  if (typeof window === 'undefined') return defaultStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultStats();
  } catch {
    return defaultStats();
  }
}

function defaultStats(): PlayerStats {
  return { wins: 0, losses: 0, draws: 0, ticketsSpent: 0, ticketsWon: 0 };
}

export function useGameStats() {
  const [stats, setStats] = useState<PlayerStats>(loadStats);

  const recordResult = useCallback((result: GameResult) => {
    setStats((prev) => {
      const next = { ...prev };
      if (result.winner === 'player') next.wins += 1;
      else if (result.winner === 'bot') next.losses += 1;
      else next.draws += 1;
      next.ticketsSpent += result.ticketsBet;
      next.ticketsWon += result.ticketsWon;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetStats = useCallback(() => {
    const fresh = defaultStats();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setStats(fresh);
  }, []);

  return { stats, recordResult, resetStats };
}
