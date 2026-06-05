// games/tugofwar/hooks/useTugOfWar.ts
// Port chính xác từ tug.js
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { TugGameState, Team, ArrowKey } from '../types';
import { ARROW_KEYS, KEY_TO_ARROW, PULL_STRENGTH, AUTO_FRICTION, VICTORY_LIMIT } from '../types';
import { generateArrowSequence, calcTimeLimit, calcBotDelay } from '../utils';

const INITIAL_STATE: TugGameState = {
  ropePosition: 0,
  gamePhase: 'menu',
  userTeam: 'left',
  botTeam: 'right',
  currentLevel: 1,
  botLevel: 1,
  arrowSequence: [],
  userProgress: 0,
  timeLimit: 4650,    // calcTimeLimit(1) = 5000 - 350 = 4650
  timeRemaining: 4650,
  winner: null,
  powerUpActive: false,
  itemSpawnCooldown: false,
};

export function useTugOfWar() {
  const [state, setState] = useState<TugGameState>(INITIAL_STATE);

  // Refs cho các timer / RAF (không trigger re-render)
  const botTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef          = useRef<number | null>(null);
  const lastTimeRef     = useRef<number>(0);
  const powerUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef        = useRef<TugGameState>(state); // mirror for closures

  // Giữ stateRef luôn đồng bộ với state mới nhất
  useEffect(() => { stateRef.current = state; }, [state]);

  // ── Helpers ──────────────────────────────────────────

  const newSequence = useCallback((level: number) => {
    const seq = generateArrowSequence(level);
    const tl  = calcTimeLimit(level);
    return { arrowSequence: seq, userProgress: 0, timeLimit: tl, timeRemaining: tl };
  }, []);

  // ── executePull (giống tug.js: executePull) ───────────
  const executePull = useCallback((team: Team) => {
    setState(prev => {
      if (!prev || prev.gamePhase !== 'playing') return prev;
      const delta = team === 'left' ? -PULL_STRENGTH : PULL_STRENGTH;
      const newPos = Math.max(-VICTORY_LIMIT, Math.min(VICTORY_LIMIT, prev.ropePosition + delta));
      const won = Math.abs(newPos) >= VICTORY_LIMIT;
      return {
        ...prev,
        ropePosition: newPos,
        gamePhase: won ? 'result' : 'playing',
        winner: won ? (newPos < 0 ? 'left' : 'right') : prev.winner,
      };
    });
  }, []);

  // ── Bot AI (giống startBotAI) ─────────────────────────
  const scheduleBotTick = useCallback((level: number) => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    botTimerRef.current = setTimeout(() => {
      const s = stateRef.current;
      if (s.gamePhase !== 'playing') return;
      executePull(s.botTeam);
      setState(prev => ({
        ...prev,
        botLevel: Math.min(9, prev.botLevel + 1),
      }));
      scheduleBotTick(stateRef.current.currentLevel);
    }, calcBotDelay(level));
  }, [executePull]);

  // ── updateLoop (time bar + AUTO_FRICTION) ─────────────
  const startUpdateLoop = useCallback(() => {
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const s = stateRef.current;
      if (s.gamePhase !== 'playing') return;

      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setState(prev => {
        if (prev.gamePhase !== 'playing') return prev;

        // Time bar countdown (skip khi powerUp active — hiện tại time bar vẫn chạy)
        let newTimeRemaining = prev.timeRemaining - delta;
        let patch: Partial<TugGameState> = {};

        if (newTimeRemaining <= 0) {
          // hết giờ → reset chuỗi (handleSequenceFail)
          const fresh = newSequence(prev.currentLevel);
          patch = { ...fresh, userProgress: 0 };
          newTimeRemaining = fresh.timeLimit;
        }

        // Auto friction (trôi về tâm)
        let newPos = prev.ropePosition;
        if (newPos > 0) { newPos -= AUTO_FRICTION; if (newPos < 0) newPos = 0; }
        else if (newPos < 0) { newPos += AUTO_FRICTION; if (newPos > 0) newPos = 0; }

        return { ...prev, ...patch, timeRemaining: newTimeRemaining, ropePosition: newPos };
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [newSequence]);

  // ── selectTeam → startGame ────────────────────────────
  const selectTeam = useCallback((team: Team) => {
    const botTeam: Team = team === 'left' ? 'right' : 'left';
    const seq = generateArrowSequence(1);
    const tl  = calcTimeLimit(1);

    setState({
      ...INITIAL_STATE,
      gamePhase: 'playing',
      userTeam: team,
      botTeam,
      arrowSequence: seq,
      timeLimit: tl,
      timeRemaining: tl,
    });
  }, []);

  // ── handleSequenceFail (chớp đỏ rồi reset) ───────────
  // Trả về state với chuỗi mới (component tự render hiệu ứng wrong)
  const failSequence = useCallback(() => {
    setState(prev => {
      if (prev.gamePhase !== 'playing') return prev;
      const fresh = newSequence(prev.currentLevel);
      return { ...prev, ...fresh };
    });
  }, [newSequence]);

  // ── Keyboard handler ──────────────────────────────────
  useEffect(() => {
    if (state.gamePhase !== 'playing') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (s.gamePhase !== 'playing') return;

      const key = e.key;
      const arrowKey = KEY_TO_ARROW[key];

      // Nếu đang power-up: bỏ qua mũi tên
      if (s.powerUpActive && arrowKey) {
        e.preventDefault();
        return;
      }

      if (arrowKey) {
        e.preventDefault();
        if (arrowKey === s.arrowSequence[s.userProgress]) {
          // Đúng → tiến
          setState(prev => {
            if (prev.gamePhase !== 'playing') return prev;
            return { ...prev, userProgress: prev.userProgress + 1 };
          });
        } else {
          // Sai → fail
          failSequence();
        }
      } else if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const s2 = stateRef.current;

        if (s2.userProgress === s2.arrowSequence.length) {
          // Hoàn thành chuỗi → kéo
          executePull(s2.userTeam);

          if (s2.powerUpActive) {
            // giữ powerup: chuỗi mới, tất cả xanh
            setState(prev => {
              const fresh = newSequence(prev.currentLevel);
              return { ...prev, ...fresh, userProgress: fresh.arrowSequence.length };
            });
            return;
          }

          // Lên level (1→9)
          setState(prev => {
            if (prev.gamePhase !== 'playing') return prev;
            const prevLevel = prev.currentLevel;
            const nextLevel = Math.min(9, prevLevel + 1);
            const shouldSpawnItem = prevLevel < 9 && nextLevel === 9 && !prev.itemSpawnCooldown;
            const fresh = newSequence(nextLevel);
            return {
              ...prev,
              ...fresh,
              currentLevel: nextLevel,
              // nếu đạt level 9 lần đầu → bật flag để component spawn item
              itemSpawnCooldown: shouldSpawnItem ? true : prev.itemSpawnCooldown,
            };
          });
        } else {
          failSequence();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.gamePhase, executePull, failSequence, newSequence]);

  // ── Start loops khi gamePhase chuyển sang 'playing' ──
  useEffect(() => {
    if (state.gamePhase === 'playing') {
      startUpdateLoop();
      scheduleBotTick(state.currentLevel);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gamePhase]);

  // ── collectItem → activate power-up 5 giây ───────────
  const collectPowerUp = useCallback(() => {
    setState(prev => {
      if (prev.powerUpActive) return prev;
      const fresh = newSequence(prev.currentLevel);
      return {
        ...prev,
        ...fresh,
        userProgress: fresh.arrowSequence.length, // tất cả xanh
        powerUpActive: true,
      };
    });

    if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    powerUpTimerRef.current = setTimeout(() => {
      setState(prev => {
        const fresh = newSequence(prev.currentLevel);
        return { ...prev, ...fresh, powerUpActive: false, itemSpawnCooldown: false };
      });
    }, 5000);
  }, [newSequence]);

  // ── Reset / back to menu ──────────────────────────────
  const resetGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    setState(prev => {
      const seq = generateArrowSequence(1);
      const tl  = calcTimeLimit(1);
      return {
        ...INITIAL_STATE,
        gamePhase: 'playing',
        userTeam: prev.userTeam,
        botTeam: prev.botTeam,
        arrowSequence: seq,
        timeLimit: tl,
        timeRemaining: tl,
      };
    });
  }, []);

  const backToMenu = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    if (powerUpTimerRef.current) clearTimeout(powerUpTimerRef.current);
    setState({ ...INITIAL_STATE });
  }, []);

  return {
    state,
    selectTeam,
    resetGame,
    backToMenu,
    collectPowerUp,
  };
}
