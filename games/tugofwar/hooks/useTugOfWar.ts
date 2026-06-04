// games/tugofwar/hooks/useTugOfWar.ts
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { TugOfWarState } from '@/types';
import type { Direction } from '../types';
import { KEY_MAP } from '../types';
import { generateSequence, calcTimeLimit, hasPowerItem } from '../utils';

const INITIAL_STATE: TugOfWarState = {
  ropePosition: 0,
  level: 1,
  sequence: [],
  playerInput: [],
  gamePhase: 'idle',
  winner: null,
  score: { player: 0, bot: 0 },
  powerItemActive: false,
};

export function useTugOfWar() {
  const [state, setState] = useState<TugOfWarState>(INITIAL_STATE);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = useCallback(() => {
    const sequence = generateSequence(1);
    setState({ ...INITIAL_STATE, sequence, gamePhase: 'playing', level: 1 });
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState(INITIAL_STATE);
  }, []);

  const handleInput = useCallback((direction: Direction) => {
    setState((prev) => {
      if (prev.gamePhase !== 'playing') return prev;
      const newInput = [...prev.playerInput, direction];
      const isCorrect = prev.sequence[newInput.length - 1] === direction;

      if (!isCorrect) {
        // Wrong key — bot gains ground
        const newPos = Math.min(100, prev.ropePosition + 15);
        if (newPos >= 100) {
          return { ...prev, playerInput: [], ropePosition: 100, gamePhase: 'result', winner: 'bot' };
        }
        return { ...prev, playerInput: [], ropePosition: newPos };
      }

      if (newInput.length === prev.sequence.length) {
        // Full sequence complete — player gains ground
        const pull = prev.powerItemActive ? 30 : 20;
        const newPos = Math.max(-100, prev.ropePosition - pull);
        if (newPos <= -100) {
          return { ...prev, playerInput: [], ropePosition: -100, gamePhase: 'result', winner: 'player' };
        }
        const nextLevel = prev.level + 1;
        const nextSequence = generateSequence(nextLevel);
        return {
          ...prev,
          playerInput: [],
          ropePosition: newPos,
          level: nextLevel,
          sequence: nextSequence,
          powerItemActive: hasPowerItem(nextLevel),
        };
      }

      return { ...prev, playerInput: newInput };
    });
  }, []);

  // Keyboard listener
  useEffect(() => {
    if (state.gamePhase !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key];
      if (dir) { e.preventDefault(); handleInput(dir); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.gamePhase, handleInput]);

  // Bot tick
  useEffect(() => {
    if (state.gamePhase !== 'playing') return;
    const botInterval = setInterval(() => {
      setState((prev) => {
        if (prev.gamePhase !== 'playing') return prev;
        const newPos = Math.min(100, prev.ropePosition + 5);
        if (newPos >= 100) {
          return { ...prev, ropePosition: 100, gamePhase: 'result', winner: 'bot' };
        }
        return { ...prev, ropePosition: newPos };
      });
    }, 2000);
    return () => clearInterval(botInterval);
  }, [state.gamePhase]);

  return { state, startGame, resetGame, handleInput };
}
