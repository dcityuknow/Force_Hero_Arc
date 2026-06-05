// games/penalty/components/PenaltyGame.tsx
'use client';
import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { usePenalty } from '../hooks/usePenalty';
import {
  TOTAL_ROUNDS, ZONE_POS, BALL_ZONE_POS,
  DIR_ICONS, zoneToDiveDir,
} from '../types';
import type { DiveDir, CompositeDir } from '../types';
import { easeInOutQuart, perspectiveScale } from '../utils';

// ── Asset paths ──────────────────────────────────────────
const PEN   = '/games/penalty';
const BG    = `${PEN}/backgrounds`;
const CHARS = `${PEN}/characters`;
const ITEMS = `${PEN}/items`;

// Map DiveDir → goalkeeper image filename
const KEEPER_IMG: Record<DiveDir, string> = {
  'stand':       `${CHARS}/goalkeeper.png`,
  'up':          `${CHARS}/goalkeeper-up.png`,
  'down':        `${CHARS}/goalkeeper-down.png`,
  'left':        `${CHARS}/goalkeeper-left.png`,
  'right':       `${CHARS}/goalkeeper-right.png`,
  'left-up':     `${CHARS}/goalkeeper-left-up.png`,
  'left-down':   `${CHARS}/goalkeeper-left-down.png`,
  'right-up':    `${CHARS}/goalkeeper-right-up.png`,
  'right-down':  `${CHARS}/goalkeeper-right-down.png`,
};

// ── History dots ─────────────────────────────────────────
function HistoryDots({ history }: { history: ('goal' | 'miss')[] }) {
  return (
    <div className="flex gap-1 mt-1">
      {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
        <div key={i} className={cn(
          'w-3 h-3 rounded-full border',
          !history[i]            ? 'border-gray-600 bg-transparent'
          : history[i] === 'goal' ? 'bg-green-400 border-green-400'
          : 'bg-red-500 border-red-500'
        )} />
      ))}
    </div>
  );
}

// ── Power bar ────────────────────────────────────────────
function PowerBar({ value, active }: { value: number; active: boolean }) {
  const color = value < 40 ? '#4caf50' : value < 65 ? '#ffeb3b' : value < 85 ? '#ff9800' : '#f44336';
  const label = value < 40 ? 'NHẸ' : value < 65 ? 'VỪA ⚡' : value < 85 ? 'MẠNH 🔥' : 'NGUY HIỂM ⚠️';

  return (
    <div className={cn('w-full max-w-xs mx-auto', !active && 'opacity-40')}>
      <div className="flex justify-between text-xs font-body text-gray-400 mb-1">
        <span>POWER</span>
        <span className="font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="h-4 bg-[#222] rounded-full overflow-hidden border border-[#555]">
        <div className="h-full rounded-full transition-none" style={{ width: `${value}%`, background: color, boxShadow: `0 0 12px ${color}99` }} />
      </div>
    </div>
  );
}

// ── Field animation hook ─────────────────────────────────
function useFieldAnimation(
  fieldRef: React.RefObject<HTMLDivElement>,
  ballRef:  React.RefObject<HTMLDivElement>,
  keeperImgRef: React.RefObject<HTMLImageElement | null>,
  keeperRef: React.RefObject<HTMLDivElement>,
  onAnimDone: () => void,
) {
  const rafRef = useRef<number | null>(null);

  const applyBallPerspective = useCallback((ball: HTMLDivElement, t: number, extraTransform?: string) => {
    const s = perspectiveScale(t);
    const sz = Math.round(160 * s);
    ball.style.width  = sz + 'px';
    ball.style.height = sz + 'px';
    const ss = Math.round(4 + s * 8);
    ball.style.filter = `drop-shadow(0 ${ss}px ${ss*2}px rgba(0,0,0,0.7))`;
    if (extraTransform !== undefined) ball.style.transform = extraTransform;
  }, []);

  const animateShot = useCallback((
    shotZone: number, keeperZone: number, power: number, saved: boolean, diveDir: DiveDir,
  ) => {
    const field  = fieldRef.current;
    const ball   = ballRef.current;
    const keeper = keeperRef.current;
    const kImg   = keeperImgRef.current;
    if (!field || !ball || !keeper) return;

    const goalNet = field.querySelector('.goal-net') as HTMLElement;
    if (!goalNet) return;

    const fieldRect = field.getBoundingClientRect();
    const gRect     = goalNet.getBoundingClientRect();
    const target    = BALL_ZONE_POS[shotZone];
    const bx = gRect.left - fieldRect.left + gRect.width  * (target.l / 100);
    const by = gRect.top  - fieldRect.top  + gRect.height * (1 - target.b / 100);

    const speedFactor = 0.6 + (power / 100) * 0.8;
    const duration    = Math.round(480 / speedFactor);
    const sx = fieldRect.width  * 0.5;
    const sy = fieldRect.height - fieldRect.height * 0.16;
    const arcHeight = Math.max(40, (fieldRect.top + fieldRect.height - by) * 0.35);

    ball.style.transition = 'none';

    // Switch keeper image to dive pose
    if (kImg) kImg.src = KEEPER_IMG[diveDir];
    // Move keeper div
    keeper.style.left   = ZONE_POS[keeperZone].l + '%';
    keeper.style.bottom = ZONE_POS[keeperZone].b + '%';

    let totalRot = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
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
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          ball.style.transition = '';
          ball.style.left   = '50%';
          ball.style.bottom = '16%';
          ball.style.top    = 'auto';
          ball.style.width  = '160px';
          ball.style.height = '160px';
          ball.style.transform = 'translateX(-50%)';
          ball.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))';
          // Reset keeper
          if (kImg) kImg.src = KEEPER_IMG['stand'];
          keeper.style.left   = '50%';
          keeper.style.bottom = '0%';
          onAnimDone();
        }, 600);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [fieldRef, ballRef, keeperRef, keeperImgRef, applyBallPerspective, onAnimDone]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return { animateShot };
}

// ── Arrow pad ─────────────────────────────────────────────
const ARROW_PAD: { dir: string; label: string; col: number; row: number }[] = [
  { dir: 'up-left',    label: '↖', col: 1, row: 1 },
  { dir: 'up',         label: '↑', col: 2, row: 1 },
  { dir: 'up-right',   label: '↗', col: 3, row: 1 },
  { dir: 'left',       label: '←', col: 1, row: 2 },
  { dir: 'right',      label: '→', col: 3, row: 2 },
  { dir: 'down-left',  label: '↙', col: 1, row: 3 },
  { dir: 'down',       label: '↓', col: 2, row: 3 },
  { dir: 'down-right', label: '↘', col: 3, row: 3 },
];

// ── Main component ────────────────────────────────────────
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

  const fieldRef      = useRef<HTMLDivElement>(null);
  const ballRef       = useRef<HTMLDivElement>(null);
  const keeperRef     = useRef<HTMLDivElement>(null);
  const keeperImgRef = useRef<HTMLImageElement | null>(null);

  const { animateShot } = useFieldAnimation(fieldRef, ballRef, keeperImgRef, keeperRef, () => {});

  useEffect(() => {
    if (!shotAnim || shotAnim.shotZone === -1) return;
    animateShot(shotAnim.shotZone, shotAnim.keeperZone, shotAnim.power, shotAnim.saved, zoneToDiveDir(shotAnim.keeperZone));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotAnim]);

  const handleArrowDown = (dir: string) => {
    if (busy || mode !== 'shooter') return;
    const parts = dir.split('-');
    setHeldKeys(new Set([...heldKeys, ...parts]));
  };
  const handleArrowUp = (dir: string) => {
    const parts = dir.split('-');
    setHeldKeys(new Set([...heldKeys].filter(k => !parts.includes(k))));
  };

  // ── MODE SELECT ──────────────────────────────────────
  if (phase === 'mode-select') {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 z-0">
          <Image src={`${BG}/Background.png`} alt="bg" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <Link href="/" className="absolute top-4 left-4 z-10 text-gray-300 hover:text-white text-sm transition-colors">← LOBBY</Link>
        <div className="relative z-10 text-center mb-10">
          <p className="text-white/60 text-sm tracking-[0.3em] font-body mb-2">SMIC GAME HUB</p>
          <h1 className="font-display text-7xl text-white tracking-widest leading-none">PENALTY<br /><em className="not-italic text-green-400">SHOOTOUT</em></h1>
          <p className="text-white/50 mt-3 font-body tracking-widest">5 rounds · pick your side</p>
        </div>
        <div className="relative z-10 flex gap-6 flex-wrap justify-center">
          {([
            { mode: 'shooter' as const, num: '01', icon: '⚽', title: 'SHOOTER', desc: 'Chọn góc trên khung thành để sút' },
            { mode: 'keeper'  as const, num: '02', icon: '🧤', title: 'GOALKEEPER', desc: 'Chọn góc trên khung thành để nhảy chặn' },
          ]).map(({ mode: m, num, icon, title, desc }) => (
            <div
              key={m}
              onClick={() => startGame(m)}
              className="w-56 bg-white/5 border border-white/20 rounded-3xl p-7 cursor-pointer text-center hover:bg-white/10 hover:border-white/50 hover:-translate-y-2 transition-all"
            >
              <div className="text-white/30 font-bold text-xl mb-2">{num}</div>
              <div className="text-5xl mb-3">{icon}</div>
              <h2 className="font-display text-3xl text-white tracking-widest mb-2">{title}</h2>
              <p className="text-white/50 text-sm font-body">{desc}</p>
              <div className="mt-4 text-white/60 font-bold tracking-widest text-sm">SELECT →</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── RESULT SCREEN ────────────────────────────────────
  if (phase === 'result') {
    const won = playerScore > botScore;
    const drew = playerScore === botScore;
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0a0e1a]">
        <div className="relative text-center px-8 py-10 flex flex-col items-center gap-4">
          {/* ketqua image behind text */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <Image src={`${ITEMS}/ketqua.png`} alt="" fill className="object-contain" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="text-8xl">{won ? '🏆' : drew ? '🤝' : '😞'}</div>
            <h2 className="font-display text-6xl text-white">{won ? 'YOU WIN!' : drew ? "IT'S A DRAW!" : 'BOT WINS!'}</h2>
            <p className="font-display text-4xl text-yellow-400">{playerScore} – {botScore}</p>
            <div className="flex gap-3 mt-2">
              <button onClick={rematch}     className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold font-body hover:scale-105 transition-transform">⟳ REMATCH</button>
              <button onClick={goModeSelect} className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold font-body hover:bg-white/20 transition-colors">MODE</button>
              <Link href="/"                className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold font-body hover:bg-white/20 transition-colors">LOBBY</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GAME SCREEN ──────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center px-4 py-4 gap-3">
      <button onClick={goModeSelect} className="self-start text-gray-500 hover:text-white text-sm font-body transition-colors">← Back</button>

      {/* HUD */}
      <div className="w-full max-w-lg flex items-center justify-between bg-black/60 border border-white/10 rounded-2xl px-6 py-3">
        <div className="text-center">
          <p className="text-xs text-gray-400 font-body">YOU</p>
          <p className="font-display text-4xl text-green-400">{playerScore}</p>
          <HistoryDots history={playerHistory} />
        </div>
        <div className="text-center">
          <p className="font-display text-lg text-gray-500">
            {round < TOTAL_ROUNDS ? `${round + 1} / ${TOTAL_ROUNDS}` : 'FINAL'}
          </p>
          <p className="text-xs text-gray-600 font-body mt-1">{mode === 'shooter' ? '⚽ STRIKER' : '🧤 KEEPER'}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 font-body">BOT</p>
          <p className="font-display text-4xl text-red-500">{botScore}</p>
          <HistoryDots history={botHistory} />
        </div>
      </div>

      {/* Stadium */}
      <div
        ref={fieldRef}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-white/10"
        style={{ height: 340 }}
      >
        {/* BG */}
        <Image src={`${BG}/Background1.png`} alt="stadium" fill className="object-cover z-0" />

        {/* Goal net (keeper clickable zones) */}
        <div
          className="goal-net absolute left-1/2 -translate-x-1/2 border-2 border-white/30 rounded-b-none z-10"
          style={{ top: 8, width: '55%', height: '42%' }}
        >
          {/* Zone grid — only clickable in keeper mode */}
          <div className="grid grid-cols-3 h-full w-full">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                data-zone={i}
                onClick={() => mode === 'keeper' && !busy && keeperTurn(i)}
                className={cn(
                  'border border-white/10 transition-all',
                  mode === 'keeper' && !busy ? 'cursor-pointer hover:bg-white/20 hover:border-white/40' : ''
                )}
              />
            ))}
          </div>

          {/* Goal post image overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <Image src={`${ITEMS}/goal.png`} alt="goal" fill className="object-fill opacity-90" />
          </div>

          {/* Keeper */}
          <div
            ref={keeperRef}
            className="absolute -translate-x-1/2 transition-all duration-200 z-20"
            style={{ left: '50%', bottom: '0%', width: 64, height: 96 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={keeperImgRef}
              src={KEEPER_IMG['stand']}
              alt="goalkeeper"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Shooter sprite */}
        {mode === 'shooter' && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10" style={{ width: 80, height: 120 }}>
            <Image src={`${CHARS}/shooter.png`} alt="shooter" fill className="object-contain object-bottom" />
          </div>
        )}

        {/* Ball */}
        <div
          ref={ballRef}
          className="absolute -translate-x-1/2 z-10"
          style={{ left: '50%', bottom: '16%', width: 160, height: 160, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))' }}
        >
          <Image src={`${ITEMS}/ball.png`} alt="ball" fill className="object-contain" />
        </div>

        {/* Shot result flash */}
        {flash && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <span className="font-display text-4xl text-white drop-shadow-xl">{flash.text}</span>
          </div>
        )}
      </div>

      {/* Shooter controls */}
      {mode === 'shooter' && !busy && (
        <div className="w-full max-w-lg flex flex-col gap-3">
          <PowerBar value={powerValue} active={powerActive} />

          {/* Direction display */}
          <div className="text-center font-display text-4xl text-white">
            {compositeDir ? (DIR_ICONS[compositeDir as CompositeDir] ?? '·') : '·'}
          </div>

          {/* PC hint */}
          <p className="text-center text-gray-500 text-xs font-body hidden md:block">
            {powerActive ? 'THẢ [D] ĐỂ SÚT!' : 'GIỮ [D] TÍCH LỰC + MŨI TÊN CHỌN HƯỚNG'}
          </p>

          {/* Mobile controls */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-36 h-36">
              {ARROW_PAD.map(({ dir, label, col, row }) => (
                <button
                  key={dir}
                  className={cn(
                    'rounded-lg text-lg font-display border transition-all',
                    `col-start-${col} row-start-${row}`,
                    heldKeys.has(dir.split('-')[0]) || (dir.includes('-') && dir.split('-').every(p => heldKeys.has(p)))
                      ? 'bg-yellow-400 text-black border-yellow-400'
                      : 'bg-[#12121e] border-[#1e1e30] text-gray-400'
                  )}
                  onPointerDown={() => handleArrowDown(dir)}
                  onPointerUp={() => handleArrowUp(dir)}
                  onPointerLeave={() => handleArrowUp(dir)}
                >
                  {label}
                </button>
              ))}
              {/* Center shoot button */}
              <button
                className={cn(
                  'col-start-2 row-start-2 rounded-full border-2 font-body font-black text-xs transition-all',
                  powerActive ? 'bg-red-600 border-red-500 text-white scale-110' : 'bg-[#12121e] border-[#1e1e30] text-gray-400'
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
      )}

      {mode === 'keeper' && !busy && (
        <p className="text-gray-500 text-sm font-body text-center">
          Click vào khung thành để chọn hướng cản phá
        </p>
      )}

      {busy && <p className="text-gray-600 text-sm font-body animate-pulse">...</p>}
    </div>
  );
}
