// games/penalty/components/PenaltyGame.tsx
// Port từ penalty.js — giữ nguyên UX/logic, chuyển sang React + Canvas animation
'use client';
import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePenalty } from '../hooks/usePenalty';
import {
  TOTAL_ROUNDS, ZONE_POS, BALL_ZONE_POS, DIR_ICONS,
  zoneToDiveDir,
} from '../types';
import type { DiveDir, CompositeDir } from '../types';
import {
  easeInOutQuart, perspectiveScale,
} from '../utils';

// ── Zone grid labels ─────────────────────────────────────
const ZONE_LABELS = ['↖', '↑', '↗', '←', '·', '→', '↙', '↓', '↘'];

// ── Dots component ───────────────────────────────────────
function HistoryDots({ history }: { history: ('goal' | 'miss')[] }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-3 h-3 rounded-full border',
            !history[i]       ? 'border-gray-600 bg-transparent'
            : history[i] === 'goal' ? 'bg-brand-green border-brand-green'
            : 'bg-brand-red border-brand-red'
          )}
        />
      ))}
    </div>
  );
}

// ── Power bar ────────────────────────────────────────────
function PowerBar({ value, active }: { value: number; active: boolean }) {
  let color = `hsl(${120 - value * 0.4}, 90%, 52%)`;
  if (value >= 50) color = `hsl(${100 - (value - 50) * 2.8}, 90%, 52%)`;
  if (value >= 75) color = `hsl(${30  - (value - 75) * 1.2}, 92%, 52%)`;

  const label =
    value < 40 ? 'NHẸ' :
    value < 65 ? 'VỪA ⚡' :
    value < 85 ? 'MẠNH 🔥' : 'NGUY HIỂM ⚠️';

  return (
    <div className={cn('w-full max-w-xs mx-auto transition-opacity', active ? 'opacity-100' : 'opacity-40')}>
      <div className="flex justify-between text-xs font-body text-gray-400 mb-1">
        <span>POWER</span>
        <span className="font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="h-4 bg-brand-surface rounded-full overflow-hidden border border-brand-border">
        <div
          className="h-full rounded-full transition-none"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 12px ${color}99` }}
        />
      </div>
    </div>
  );
}

// ── Canvas animation hook (port animateShotToGoal, rebound, rollInNet) ──
function useFieldAnimation(
  fieldRef: React.RefObject<HTMLDivElement>,
  ballRef:  React.RefObject<HTMLDivElement>,
  keeperRef: React.RefObject<HTMLDivElement>,
  onAnimDone: () => void,
) {
  const rafRef = useRef<number | null>(null);

  const applyBallPerspective = useCallback((ball: HTMLDivElement, t: number, extraTransform?: string) => {
    const BASE = 160;
    const s  = perspectiveScale(t);
    const sz = Math.round(BASE * s);
    ball.style.width  = sz + 'px';
    ball.style.height = sz + 'px';
    const shadowSize = Math.round(4 + s * 8);
    ball.style.filter = `drop-shadow(0 ${shadowSize}px ${shadowSize * 2}px rgba(0,0,0,0.7))`;
    if (extraTransform !== undefined) ball.style.transform = extraTransform;
  }, []);

  const animateShot = useCallback((
    shotZone: number, keeperZone: number, power: number, saved: boolean,
    onKick: () => void,
  ) => {
    const field  = fieldRef.current;
    const ball   = ballRef.current;
    const keeper = keeperRef.current;
    if (!field || !ball || !keeper) return;

    const fieldRect = field.getBoundingClientRect();
    const goalNet   = field.querySelector('.goal-net') as HTMLElement;
    if (!goalNet) return;
    const gRect = goalNet.getBoundingClientRect();

    const target = BALL_ZONE_POS[shotZone];
    const bx = gRect.left - fieldRect.left + gRect.width  * (target.l / 100);
    const by = gRect.top  - fieldRect.top  + gRect.height * (1 - target.b / 100);

    const speedFactor = 0.6 + (power / 100) * 0.8;
    const duration    = Math.round(480 / speedFactor);

    const sx = fieldRect.width  * 0.5;
    const sy = fieldRect.height - fieldRect.height * 0.16;
    const arcHeight = Math.max(40, (fieldRect.top + fieldRect.height - by) * 0.35);

    ball.style.transition = 'none';
    ball.classList.add('flying');

    // Move keeper
    keeper.style.left   = ZONE_POS[keeperZone].l + '%';
    keeper.style.bottom = ZONE_POS[keeperZone].b + '%';
    keeper.classList.add('diving');
    const diveDir = zoneToDiveDir(keeperZone);
    keeper.setAttribute('data-pose', diveDir);

    let totalRot = 0;
    const startTime = performance.now();

    const animFrame = (now: number) => {
      const t  = Math.min((now - startTime) / duration, 1);
      const et = easeInOutQuart(t);
      const cx = sx + (bx - sx) * et;
      const arcT = 1 - Math.pow(2 * t - 1, 2);
      const cy = sy + (by - sy) * et - arcHeight * arcT;
      ball.style.left   = cx + 'px';
      ball.style.top    = cy + 'px';
      ball.style.bottom = 'auto';
      totalRot = t * 360 * (1.5 + speedFactor * 0.5);
      applyBallPerspective(ball, t, `translateX(-50%) rotate(${totalRot}deg)`);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animFrame);
      } else {
        onKick();
        // After result, simple roll/rebound then done
        setTimeout(() => {
          ball.classList.remove('flying');
          ball.style.transition = '';
          ball.style.left   = '50%';
          ball.style.bottom = '16%';
          ball.style.top    = 'auto';
          ball.style.width  = '160px';
          ball.style.height = '160px';
          ball.style.transform = 'translateX(-50%)';
          ball.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))';
          keeper.classList.remove('diving');
          keeper.style.left   = '50%';
          keeper.style.bottom = '0%';
          keeper.style.transform = 'translateX(-50%)';
          keeper.setAttribute('data-pose', 'stand');
          onAnimDone();
        }, 700);
      }
    };
    rafRef.current = requestAnimationFrame(animFrame);
  }, [fieldRef, ballRef, keeperRef, applyBallPerspective, onAnimDone]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return { animateShot };
}

// ── Arrow direction pad (mobile) ─────────────────────────
const ARROW_BTN_DIRS: { dir: string; label: string; pos: string }[] = [
  { dir: 'up-left',    label: '↖', pos: 'col-start-1 row-start-1' },
  { dir: 'up',         label: '↑', pos: 'col-start-2 row-start-1' },
  { dir: 'up-right',   label: '↗', pos: 'col-start-3 row-start-1' },
  { dir: 'left',       label: '←', pos: 'col-start-1 row-start-2' },
  { dir: 'right',      label: '→', pos: 'col-start-3 row-start-2' },
  { dir: 'down-left',  label: '↙', pos: 'col-start-1 row-start-3' },
  { dir: 'down',       label: '↓', pos: 'col-start-2 row-start-3' },
  { dir: 'down-right', label: '↘', pos: 'col-start-3 row-start-3' },
];

// ── Main component ───────────────────────────────────────
export default function PenaltyGame() {
  const {
    gameState, flash, shotAnim, powerValue, powerActive,
    heldKeys, compositeDir,
    startGame, keeperTurn,
    startPowerBar, releasePowerBar,
    rematch, goModeSelect,
    setHeldKeys,
  } = usePenalty();

  const { mode, round, playerScore, botScore, playerHistory, botHistory, phase, busy } = gameState;

  const fieldRef  = useRef<HTMLDivElement>(null);
  const ballRef   = useRef<HTMLDivElement>(null);
  const keeperRef = useRef<HTMLDivElement>(null);

  // Trigger animation when shotAnim changes
  const { animateShot } = useFieldAnimation(fieldRef, ballRef, keeperRef, () => {});

  useEffect(() => {
    if (!shotAnim || shotAnim.shotZone === -1) return;
    animateShot(
      shotAnim.shotZone,
      shotAnim.keeperZone,
      shotAnim.power,
      shotAnim.saved,
      () => {},
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotAnim]);

  // Mobile arrow button handlers
  const handleArrowDown = (dir: string) => {
    if (busy || mode !== 'shooter') return;
    const parts = dir.includes('-') ? dir.split('-') : [dir];
    const next = new Set([...heldKeys, ...parts]);
    setHeldKeys(next);
  };
  const handleArrowUp = (dir: string) => {
    const parts = dir.includes('-') ? dir.split('-') : [dir];
    const next = new Set([...heldKeys].filter(k => !parts.includes(k)));
    setHeldKeys(next);
  };

  // ── MODE SELECT ───────────────────────────────────────
  if (phase === 'mode-select') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 gap-8">
        <Link href="/" className="self-start text-gray-500 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        <div className="text-6xl">⚽</div>
        <h1 className="font-display text-6xl text-white">PENALTY SHOOTOUT</h1>
        <p className="text-gray-400 font-body">Chọn vai của bạn</p>
        <div className="flex gap-6 mt-2">
          <button
            onClick={() => startGame('shooter')}
            className="px-10 py-6 rounded-2xl font-display text-3xl bg-brand-green/10 border-2 border-brand-green text-brand-green hover:scale-105 hover:bg-brand-green/20 transition-all"
          >
            ⚽ STRIKER
          </button>
          <button
            onClick={() => startGame('keeper')}
            className="px-10 py-6 rounded-2xl font-display text-3xl bg-brand-blue/10 border-2 border-brand-blue text-brand-blue hover:scale-105 hover:bg-brand-blue/20 transition-all"
          >
            🧤 KEEPER
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT SCREEN ─────────────────────────────────────
  if (phase === 'result') {
    const trophy = playerScore > botScore ? '🏆' : playerScore < botScore ? '😞' : '🤝';
    const title  = playerScore > botScore ? 'YOU WIN!' : playerScore < botScore ? 'BOT WINS!' : "IT'S A DRAW!";
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 gap-6">
        <div className="text-8xl">{trophy}</div>
        <h1 className="font-display text-6xl text-white">{title}</h1>
        <p className="font-display text-4xl text-brand-accent">{playerScore} – {botScore}</p>
        <div className="flex gap-4 mt-4">
          <button onClick={rematch}     className="px-8 py-3 rounded-xl bg-brand-accent text-brand-dark font-bold font-body hover:scale-105 transition-transform">Rematch</button>
          <button onClick={goModeSelect} className="px-8 py-3 rounded-xl bg-brand-surface border border-brand-border text-white font-bold font-body hover:border-white/40 transition-colors">Change Mode</button>
          <Link href="/" className="px-8 py-3 rounded-xl bg-brand-surface border border-brand-border text-white font-bold font-body hover:border-white/40 transition-colors">Lobby</Link>
        </div>
      </div>
    );
  }

  // ── GAME SCREEN ───────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center px-4 py-4 gap-4">
      {/* Back */}
      <button onClick={goModeSelect} className="self-start text-gray-500 hover:text-white text-sm font-body transition-colors">← Back</button>

      {/* Scoreboard */}
      <div className="w-full max-w-lg flex items-center justify-between bg-brand-surface border border-brand-border rounded-2xl px-6 py-3">
        <div className="text-center">
          <p className="text-xs text-gray-500 font-body">YOU</p>
          <p className="font-display text-4xl text-brand-green">{playerScore}</p>
          <HistoryDots history={playerHistory} />
        </div>
        <div className="text-center">
          <p className="font-display text-lg text-gray-500">
            {round < TOTAL_ROUNDS ? `ROUND ${round + 1}/${TOTAL_ROUNDS}` : 'FINAL'}
          </p>
          <p className="text-xs text-gray-600 font-body mt-1">{mode === 'shooter' ? '⚽ STRIKER' : '🧤 KEEPER'}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 font-body">BOT</p>
          <p className="font-display text-4xl text-brand-red">{botScore}</p>
          <HistoryDots history={botHistory} />
        </div>
      </div>

      {/* Field */}
      <div
        ref={fieldRef}
        className="relative w-full max-w-lg bg-green-900 rounded-2xl overflow-hidden border border-brand-border"
        style={{ height: 340, background: 'linear-gradient(180deg, #1a3a1a 0%, #1e4a1e 40%, #2d6a2d 100%)' }}
      >
        {/* Field lines */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />

        {/* Goal net */}
        <div
          className="goal-net absolute left-1/2 -translate-x-1/2 border-2 border-white/40 rounded-b-none"
          style={{ top: 8, width: '55%', height: '42%', background: 'rgba(255,255,255,0.04)' }}
        />

        {/* Zone buttons (keeper mode: clickable grid) */}
        {mode === 'keeper' && !busy && (
          <div
            className="absolute left-1/2 -translate-x-1/2 grid grid-cols-3 gap-1"
            style={{ top: 10, width: '53%', height: '40%' }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <button
                key={i}
                data-zone={i}
                onClick={() => keeperTurn(i)}
                className="rounded border border-white/10 hover:bg-white/20 hover:border-white/40 transition-all flex items-center justify-center text-white/40 hover:text-white text-lg font-display"
              >
                {ZONE_LABELS[i]}
              </button>
            ))}
          </div>
        )}

        {/* Shot target highlight */}
        {shotAnim && shotAnim.shotZone >= 0 && (
          <div
            className={cn(
              'absolute w-6 h-6 rounded-full border-2 -translate-x-1/2 transition-none pointer-events-none',
              shotAnim.saved ? 'border-brand-red bg-brand-red/30' : 'border-brand-green bg-brand-green/30'
            )}
            style={{
              left: `calc(23.5% + ${BALL_ZONE_POS[shotAnim.shotZone].l}% * 0.53)`,
              bottom: `calc(${BALL_ZONE_POS[shotAnim.shotZone].b}% * 0.4 + 8px)`,
            }}
          />
        )}

        {/* Keeper */}
        <div
          ref={keeperRef}
          className="absolute -translate-x-1/2 transition-all duration-200"
          style={{ left: '50%', bottom: '0%', width: 64, height: 96 }}
          data-pose="stand"
        >
          {/* Keeper visual — emoji until real sprites added */}
          <div className="w-full h-full flex items-end justify-center text-5xl pb-1">🧤</div>
        </div>

        {/* Ball */}
        <div
          ref={ballRef}
          className="absolute -translate-x-1/2"
          style={{ left: '50%', bottom: '16%', width: 160, height: 160, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))' }}
        >
          <div className="w-full h-full flex items-center justify-center text-7xl">⚽</div>
        </div>

        {/* Result flash */}
        {flash && (
          <div className={cn(
            'absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20',
            'font-display text-4xl text-white drop-shadow-xl',
          )}>
            {flash.text}
          </div>
        )}
      </div>

      {/* Shooter controls */}
      {mode === 'shooter' && !busy && (
        <div className="w-full max-w-lg flex flex-col gap-3">
          {/* Power bar */}
          <PowerBar value={powerValue} active={powerActive} />

          {/* Direction display */}
          <div className="flex items-center justify-center gap-3">
            <span className="font-display text-4xl text-white">
              {compositeDir ? (DIR_ICONS[compositeDir as CompositeDir] ?? '·') : '·'}
            </span>
          </div>

          {/* Action hint */}
          <p className="text-center text-gray-500 text-xs font-body">
            {powerActive
              ? 'THẢ [D] ĐỂ SÚT!'
              : 'GIỮ [D] TÍCH LỰC + MŨI TÊN CHỌN HƯỚNG'}
          </p>

          {/* Mobile controls */}
          <div className="flex gap-4 justify-center items-center">
            {/* Direction pad */}
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-32 h-32">
              {ARROW_BTN_DIRS.map(({ dir, label, pos }) => (
                <button
                  key={dir}
                  className={cn(
                    'rounded-lg text-lg font-display border transition-all',
                    pos,
                    heldKeys.has(dir.split('-')[0]) || (dir.includes('-') && dir.split('-').some(p => heldKeys.has(p)))
                      ? 'bg-brand-accent text-brand-dark border-brand-accent'
                      : 'bg-brand-surface border-brand-border text-gray-400'
                  )}
                  onPointerDown={() => handleArrowDown(dir)}
                  onPointerUp={() => handleArrowUp(dir)}
                  onPointerLeave={() => handleArrowUp(dir)}
                >
                  {label}
                </button>
              ))}
              {/* Center: shoot button */}
              <div className="col-start-2 row-start-2 flex items-center justify-center">
                <button
                  className={cn(
                    'w-10 h-10 rounded-full border-2 font-body font-black text-xs transition-all',
                    powerActive
                      ? 'bg-brand-red border-brand-red text-white scale-110'
                      : 'bg-brand-surface border-brand-border text-gray-400'
                  )}
                  onPointerDown={startPowerBar}
                  onPointerUp={releasePowerBar}
                  onPointerLeave={releasePowerBar}
                >
                  KICK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keeper mode hint */}
      {mode === 'keeper' && !busy && (
        <p className="text-gray-500 text-sm font-body text-center">
          Click vào khung thành để chọn hướng cản phá
        </p>
      )}

      {/* Busy state */}
      {busy && (
        <p className="text-gray-600 text-sm font-body animate-pulse">...</p>
      )}
    </div>
  );
}
