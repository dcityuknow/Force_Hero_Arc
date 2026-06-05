// games/penalty/hooks/usePenalty.ts
// Port state management từ penalty.js
'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import type { PenaltyGameState, Mode, HistoryEntry } from '../types';
import { TOTAL_ROUNDS } from '../types';
import { botDecideKeeper, botDecideShot, calcZoneFromPowerAndDir, isZoneSaved, getCompositeDir } from '../utils';
import type { CompositeDir } from '../types';

export interface FlashMsg { text: string; cls: 'goal-flash' | 'miss-flash' | 'save-flash'; }
export interface ShotAnimData {
  shotZone: number;
  keeperZone: number;
  power: number;
  saved: boolean;
  mode: 'shooter' | 'keeper';
}

const INITIAL: PenaltyGameState = {
  mode: 'shooter',
  round: 0,
  playerScore: 0,
  botScore: 0,
  playerHistory: [],
  botHistory: [],
  phase: 'mode-select',
  busy: false,
};

// Power bar speed — port POWER_SPEED = 0.18 (per ms)
const POWER_SPEED = 0.18;

export function usePenalty() {
  const [gameState, setGameState] = useState<PenaltyGameState>(INITIAL);
  const [flash, setFlash]         = useState<FlashMsg | null>(null);
  const [shotAnim, setShotAnim]   = useState<ShotAnimData | null>(null);

  // Power bar state (refs không trigger re-render, chỉ UI nội bộ)
  const [powerValue, setPowerValue]     = useState(0);
  const [powerActive, setPowerActive]   = useState(false);
  const [heldKeys, setHeldKeys]         = useState<Set<string>>(new Set());
  const [compositeDir, setCompositeDir] = useState<CompositeDir | null>(null);

  const powerActiveRef    = useRef(false);
  const powerValueRef     = useRef(0);
  const powerDirectionRef = useRef(1);
  const powerRAFRef       = useRef<number | null>(null);
  const shootTriggeredRef = useRef(false);
  const heldKeysRef       = useRef<Set<string>>(new Set());
  const busyRef           = useRef(false);
  const gameModeRef       = useRef<Mode>('shooter');

  // Sync refs
  useEffect(() => { gameModeRef.current = gameState.mode; }, [gameState.mode]);
  useEffect(() => { busyRef.current = gameState.busy; }, [gameState.busy]);

  const showFlash = useCallback((text: string, cls: FlashMsg['cls']) => {
    setFlash({ text, cls });
    setTimeout(() => setFlash(null), 950);
  }, []);

  // ── startGame ──────────────────────────────────────────
  const startGame = useCallback((mode: Mode) => {
    setGameState({ ...INITIAL, mode, phase: 'playing' });
    setPowerValue(0);
    setPowerActive(false);
    setHeldKeys(new Set());
    setCompositeDir(null);
    powerActiveRef.current    = false;
    powerValueRef.current     = 0;
    powerDirectionRef.current = 1;
    shootTriggeredRef.current = false;
    heldKeysRef.current       = new Set();
    busyRef.current           = false;
    gameModeRef.current       = mode;
    setShotAnim(null);
    setFlash(null);
  }, []);

  // ── beginRound ─────────────────────────────────────────
  const beginRound = useCallback((gs: PenaltyGameState) => {
    if (gs.round >= TOTAL_ROUNDS) {
      // endGame
      setTimeout(() => {
        setGameState(prev => ({ ...prev, phase: 'result', busy: false }));
      }, 700);
      return;
    }
    shootTriggeredRef.current = false;
    powerActiveRef.current    = false;
    powerValueRef.current     = 0;
    powerDirectionRef.current = 1;
    if (powerRAFRef.current) cancelAnimationFrame(powerRAFRef.current);
    heldKeysRef.current = new Set();
    setHeldKeys(new Set());
    setCompositeDir(null);
    setPowerActive(false);
    setPowerValue(0);
    setShotAnim(null);
    setGameState(prev => ({ ...prev, busy: false }));
  }, []);

  // ── shooterTurn ────────────────────────────────────────
  const shooterTurn = useCallback((shotZone: number, power: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setGameState(prev => ({ ...prev, busy: true }));

    if (shotZone === -1) {
      // OUT
      showFlash('OUT! ❌', 'miss-flash');
      setShotAnim({ shotZone: -1, keeperZone: -1, power, saved: true, mode: 'shooter' });
      setTimeout(() => {
        setGameState(prev => {
          const ph: HistoryEntry[] = [...prev.playerHistory, 'miss'];
          const next = { ...prev, playerHistory: ph, round: prev.round + 1, busy: false };
          busyRef.current = false;
          beginRound(next);
          return next;
        });
      }, 1300);
      return;
    }

    const keeperZone = botDecideKeeper();
    const saved      = isZoneSaved(shotZone, keeperZone);

    setShotAnim({ shotZone, keeperZone, power, saved, mode: 'shooter' });

    setTimeout(() => {
      if (saved) {
        showFlash('SAVED! 🧤', 'miss-flash');
      } else {
        showFlash('GOAL! ⚽', 'goal-flash');
      }

      setTimeout(() => {
        setGameState(prev => {
          const ph: HistoryEntry[] = [...prev.playerHistory, saved ? 'miss' : 'goal'];
          const ps = saved ? prev.playerScore : prev.playerScore + 1;
          const next = { ...prev, playerHistory: ph, playerScore: ps, round: prev.round + 1, busy: false };
          busyRef.current = false;
          beginRound(next);
          return next;
        });
      }, 900);
    }, 900);
  }, [beginRound, showFlash]);

  // ── keeperTurn ─────────────────────────────────────────
  const keeperTurn = useCallback((keeperZone: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setGameState(prev => ({ ...prev, busy: true }));

    const botZone = botDecideShot();
    const saved   = isZoneSaved(botZone, keeperZone);

    setShotAnim({ shotZone: botZone, keeperZone, power: 65, saved, mode: 'keeper' });

    setTimeout(() => {
      if (saved) {
        showFlash('GREAT SAVE! 🧤', 'save-flash');
      } else {
        showFlash('BOT SCORES! ⚽', 'miss-flash');
      }

      setTimeout(() => {
        setGameState(prev => {
          const botScored = !saved;
          const bh: HistoryEntry[] = [...prev.botHistory,    botScored ? 'goal' : 'miss'];
          const ph: HistoryEntry[] = [...prev.playerHistory, botScored ? 'miss' : 'goal'];
          const bs = botScored ? prev.botScore + 1 : prev.botScore;
          const ps = botScored ? prev.playerScore  : prev.playerScore + 1;
          const next = { ...prev, botHistory: bh, playerHistory: ph, botScore: bs, playerScore: ps, round: prev.round + 1, busy: false };
          busyRef.current = false;
          beginRound(next);
          return next;
        });
      }, 900);
    }, 900);
  }, [beginRound, showFlash]);

  // ── Power bar ──────────────────────────────────────────
  const startPowerBar = useCallback(() => {
    if (powerActiveRef.current || busyRef.current || shootTriggeredRef.current) return;
    if (gameModeRef.current !== 'shooter') return;
    powerActiveRef.current    = true;
    powerValueRef.current     = 0;
    powerDirectionRef.current = 1;
    shootTriggeredRef.current = false;
    setPowerActive(true);

    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      powerValueRef.current += POWER_SPEED * dt * powerDirectionRef.current;
      if (powerValueRef.current >= 100) { powerValueRef.current = 100; powerDirectionRef.current = -1; }
      if (powerValueRef.current <= 0 && powerDirectionRef.current === -1) { powerValueRef.current = 0; powerDirectionRef.current = 1; }
      setPowerValue(powerValueRef.current);
      powerRAFRef.current = requestAnimationFrame(tick);
    };
    powerRAFRef.current = requestAnimationFrame(tick);
  }, []);

  const releasePowerBar = useCallback(() => {
    if (!powerActiveRef.current) return;
    if (powerRAFRef.current) cancelAnimationFrame(powerRAFRef.current);
    powerActiveRef.current    = false;
    shootTriggeredRef.current = true;
    setPowerActive(false);

    const finalPower = powerValueRef.current;
    const finalDir   = getCompositeDir(heldKeysRef.current);

    heldKeysRef.current = new Set();
    setHeldKeys(new Set());
    setCompositeDir(null);
    setPowerValue(0);
    powerValueRef.current = 0;

    const zone = calcZoneFromPowerAndDir(finalPower, finalDir);
    shooterTurn(zone, finalPower);
  }, [shooterTurn]);

  // ── Key controls ───────────────────────────────────────
  useEffect(() => {
    if (gameState.phase !== 'playing' || gameState.mode !== 'shooter') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (busyRef.current) return;
      const arrowMap: Record<string, string> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      };
      if (arrowMap[e.code]) {
        e.preventDefault();
        heldKeysRef.current = new Set([...heldKeysRef.current, arrowMap[e.code]]);
        setHeldKeys(new Set(heldKeysRef.current));
        setCompositeDir(getCompositeDir(heldKeysRef.current));
      }
      if (e.code === 'KeyD' && !powerActiveRef.current && !shootTriggeredRef.current) {
        e.preventDefault();
        startPowerBar();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const arrowMap: Record<string, string> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      };
      if (arrowMap[e.code]) {
        heldKeysRef.current.delete(arrowMap[e.code]);
        heldKeysRef.current = new Set(heldKeysRef.current);
        setHeldKeys(new Set(heldKeysRef.current));
        setCompositeDir(getCompositeDir(heldKeysRef.current));
      }
      if (e.code === 'KeyD' && powerActiveRef.current && !shootTriggeredRef.current) {
        e.preventDefault();
        releasePowerBar();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup',   onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup',   onKeyUp);
    };
  }, [gameState.phase, gameState.mode, startPowerBar, releasePowerBar]);

  const rematch = useCallback(() => {
    startGame(gameState.mode);
  }, [startGame, gameState.mode]);

  const goModeSelect = useCallback(() => {
    setGameState({ ...INITIAL });
    setShotAnim(null);
    setFlash(null);
  }, []);

  return {
    gameState,
    flash,
    shotAnim,
    powerValue,
    powerActive,
    heldKeys,
    compositeDir,
    startGame,
    keeperTurn,
    startPowerBar,
    releasePowerBar,
    rematch,
    goModeSelect,
    setHeldKeys: (keys: Set<string>) => {
      heldKeysRef.current = keys;
      setHeldKeys(keys);
      setCompositeDir(getCompositeDir(keys));
    },
  };
}
