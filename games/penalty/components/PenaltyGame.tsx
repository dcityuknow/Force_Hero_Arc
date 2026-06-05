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

const PEN   = '/games/penalty';
const BG    = `${PEN}/backgrounds`;
const CHARS = `${PEN}/characters`;
const ITEMS = `${PEN}/items`;

const KEEPER_IMG: Record<DiveDir, string> = {
  'stand':      `${CHARS}/goalkeeper.png`,
  'up':         `${CHARS}/goalkeeper-up.png`,
  'down':       `${CHARS}/goalkeeper-down.png`,
  'left':       `${CHARS}/goalkeeper-left.png`,
  'right':      `${CHARS}/goalkeeper-right.png`,
  'left-up':    `${CHARS}/goalkeeper-left-up.png`,
  'left-down':  `${CHARS}/goalkeeper-left-down.png`,
  'right-up':   `${CHARS}/goalkeeper-right-up.png`,
  'right-down': `${CHARS}/goalkeeper-right-down.png`,
};

function HistoryDots({ history }: { history: ('goal' | 'miss')[] }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
        <div key={i} className={cn(
          'w-3 h-3 rounded-full border',
          !history[i]             ? 'border-gray-600 bg-transparent'
          : history[i] === 'goal' ? 'bg-green-400 border-green-400'
          : 'bg-red-500 border-red-500'
        )} />
      ))}
    </div>
  );
}

function PowerBar({ value, active }: { value: number; active: boolean }) {
  const color = value < 40 ? '#4caf50' : value < 65 ? '#ffeb3b' : value < 85 ? '#ff9800' : '#f44336';
  const label = value < 40 ? 'NHẸ' : value < 65 ? 'VỪA ⚡' : value < 85 ? 'MẠNH 🔥' : 'NGUY HIỂM ⚠️';
  return (
    <div className={cn('transition-opacity', !active && 'opacity-50')}>
      <div className="flex justify-between text-xs mb-1" style={{ color }}>
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>POWER</span>
        <span className="font-bold">{label}</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden" style={{ background: '#222', border: '1px solid #555' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color, boxShadow: `0 0 12px ${color}99`, transition: 'none' }} />
      </div>
    </div>
  );
}

function useFieldAnimation(
  fieldRef: React.RefObject<HTMLDivElement>,
  ballRef: React.RefObject<HTMLDivElement>,
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
    ball.style.filter = `drop-shadow(0 ${ss}px ${ss * 2}px rgba(0,0,0,0.7))`;
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
    if (kImg) kImg.src = KEEPER_IMG[diveDir];
    keeper.style.left   = ZONE_POS[keeperZone].l + '%';
    keeper.style.bottom = ZONE_POS[keeperZone].b + '%';

    let totalRot = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const t  = Math.min((now - startTime) / duration, 1);
      const et = easeInOutQuart(t);
      const cx = sx + (bx - sx) * et;
      const arcT = 1 - Math.pow(2 * t - 1, 2);
      const cy   = sy + (by - sy) * et - arcHeight * arcT;

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

  const fieldRef     = useRef<HTMLDivElement>(null);
  const ballRef      = useRef<HTMLDivElement>(null);
  const keeperRef    = useRef<HTMLDivElement>(null);
  const keeperImgRef = useRef<HTMLImageElement | null>(null);

  const { animateShot } = useFieldAnimation(fieldRef, ballRef, keeperImgRef, keeperRef, () => {});

  useEffect(() => {
    if (!shotAnim || shotAnim.shotZone === -1) return;
    animateShot(shotAnim.shotZone, shotAnim.keeperZone, shotAnim.power, shotAnim.saved, zoneToDiveDir(shotAnim.keeperZone));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotAnim]);

  const handleArrowDown = (dir: string) => {
    if (busy || mode !== 'shooter') return;
    setHeldKeys(new Set([...heldKeys, ...dir.split('-')]));
  };
  const handleArrowUp = (dir: string) => {
    const parts = dir.split('-');
    setHeldKeys(new Set([...heldKeys].filter(k => !parts.includes(k))));
  };

  // ── MODE SELECT ─────────────────────────────────────
  if (phase === 'mode-select') {
    return (
      <div className="fixed inset-0 overflow-hidden" style={{ top: 64 }}>
        <div className="absolute inset-0">
          <Image src={`${BG}/Background.png`} alt="bg" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <Link href="/" className="absolute top-4 left-4 z-10 text-gray-300 hover:text-white text-sm transition-colors font-bold">← LOBBY</Link>

        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-8 px-4">
          <div className="text-center">
            <p className="text-white/50 text-xs tracking-[0.4em] font-bold mb-2">SMIC GAME HUB</p>
            <h1 style={{ fontFamily: 'Bangers, cursive', fontSize: 'clamp(3rem, 8vw, 5rem)', letterSpacing: '4px', color: '#fff', lineHeight: 1 }}>
              PENALTY<br /><span style={{ color: '#4ade80' }}>SHOOTOUT</span>
            </h1>
            <p className="text-white/40 mt-3 text-sm tracking-widest">5 rounds · pick your side</p>
          </div>

          <div className="flex gap-6 flex-wrap justify-center">
            {([
              { m: 'shooter' as const, num: '01', icon: '⚽', title: 'SHOOTER',    desc: 'Chọn góc để sút' },
              { m: 'keeper'  as const, num: '02', icon: '🧤', title: 'GOALKEEPER', desc: 'Chọn góc để nhảy chặn' },
            ]).map(({ m, num, icon, title, desc }) => (
              <div
                key={m}
                onClick={() => startGame(m)}
                className="w-52 cursor-pointer text-center rounded-3xl p-7 transition-all hover:-translate-y-2 hover:bg-white/15"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <div className="text-white/25 font-bold text-lg mb-2">{num}</div>
                <div className="text-5xl mb-3">{icon}</div>
                <h2 style={{ fontFamily: 'Bangers, cursive', fontSize: '1.8rem', letterSpacing: '2px', color: '#fff' }}>{title}</h2>
                <p className="text-white/45 text-sm mt-2">{desc}</p>
                <div className="mt-4 text-white/50 font-bold text-sm tracking-widest">SELECT →</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT SCREEN ────────────────────────────────────
  if (phase === 'result') {
    const won  = playerScore > botScore;
    const drew = playerScore === botScore;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0e1a]" style={{ top: 64 }}>
        <div className="relative text-center flex flex-col items-center gap-5">
          <div className="absolute inset-0 -m-16 pointer-events-none opacity-30">
            <Image src={`${ITEMS}/ketqua.png`} alt="" fill className="object-contain" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="text-8xl">{won ? '🏆' : drew ? '🤝' : '😞'}</div>
            <h2 style={{ fontFamily: 'Bangers, cursive', fontSize: '3.5rem', color: '#fff', letterSpacing: '3px' }}>
              {won ? 'YOU WIN!' : drew ? "IT'S A DRAW!" : 'BOT WINS!'}
            </h2>
            <p style={{ fontFamily: 'Bangers, cursive', fontSize: '2.5rem', color: '#ffd700' }}>{playerScore} – {botScore}</p>
            <div className="flex gap-3 mt-2">
              <button onClick={rematch}      className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:scale-105 transition-transform">⟳ REMATCH</button>
              <button onClick={goModeSelect} className="px-6 py-3 rounded-xl text-white font-bold hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>MODE</button>
              <Link href="/"                 className="px-6 py-3 rounded-xl text-white font-bold hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}>LOBBY</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GAME SCREEN (fullscreen như bản gốc) ─────────────
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ top: 64 }}>

      {/* ── HUD bar (giống penalty.html .hud-bar) ── */}
      <div className="relative z-30 flex items-center justify-between px-6 py-2 shrink-0"
        style={{ background: 'rgba(0,0,0,0.7)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={goModeSelect} className="text-gray-400 hover:text-white text-sm font-bold transition-colors">← LOBBY</button>
        {/* Left score */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-gray-400 text-xs font-bold tracking-widest">YOU</div>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: '2.2rem', color: '#4ade80', lineHeight: 1 }}>{playerScore}</div>
            <HistoryDots history={playerHistory} />
          </div>
          <div className="text-center">
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
              {round < TOTAL_ROUNDS ? `${round + 1} / ${TOTAL_ROUNDS}` : 'FINAL'}
            </div>
            <div className="text-xs text-gray-500 mt-1">{mode === 'shooter' ? '⚽ STRIKER' : '🧤 KEEPER'}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs font-bold tracking-widest">BOT</div>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: '2.2rem', color: '#f87171', lineHeight: 1 }}>{botScore}</div>
            <HistoryDots history={botHistory} />
          </div>
        </div>
        <div className="w-16" />
      </div>

      {/* ── Stadium (chiếm hết phần còn lại) ── */}
      <div ref={fieldRef} className="relative flex-1 overflow-hidden">
        {/* Background */}
        <Image src={`${BG}/Background1.png`} alt="stadium" fill className="object-cover z-0" priority />

        {/* Goal net — vị trí giống penalty.html .goal-wrap */}
        <div
          className="goal-net absolute z-10"
          style={{
            left: '50%', transform: 'translateX(-50%)',
            top: '5%', width: '55%', height: '44%',
            border: '2px solid rgba(255,255,255,0.25)',
          }}
        >
          {/* Zone grid */}
          <div className="grid grid-cols-3 absolute inset-0" style={{ zIndex: 2 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                data-zone={i}
                onClick={() => mode === 'keeper' && !busy && keeperTurn(i)}
                className={cn(
                  'border border-white/10 transition-all',
                  mode === 'keeper' && !busy
                    ? 'cursor-pointer hover:bg-white/25 hover:border-white/50'
                    : ''
                )}
              />
            ))}
          </div>

          {/* Goal image overlay */}
          <div className="absolute inset-0 pointer-events-none z-[3]">
            <Image src={`${ITEMS}/goal.png`} alt="goal" fill className="object-fill" />
          </div>

          {/* Keeper */}
          <div
            ref={keeperRef}
            className="absolute z-[4] transition-all duration-150"
            style={{ left: '50%', bottom: '0%', transform: 'translateX(-50%)', width: '18%', height: '80%' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={keeperImgRef}
              src={KEEPER_IMG['stand']}
              alt="goalkeeper"
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }}
            />
          </div>
        </div>

        {/* Shooter sprite — bottom center */}
        {mode === 'shooter' && (
          <div className="absolute z-10"
            style={{ bottom: '2%', left: '50%', transform: 'translateX(-50%)', width: '14%', aspectRatio: '1' }}>
            <Image src={`${CHARS}/shooter.png`} alt="shooter" fill className="object-contain object-bottom" />
          </div>
        )}

        {/* Ball */}
        <div
          ref={ballRef}
          className="absolute z-10"
          style={{ left: '50%', bottom: '16%', width: 160, height: 160, transform: 'translateX(-50%)', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))' }}
        >
          <Image src={`${ITEMS}/ball.png`} alt="ball" fill className="object-contain" />
        </div>

        {/* Flash result */}
        {flash && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <span style={{ fontFamily: 'Bangers, cursive', fontSize: '3rem', color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.5)', letterSpacing: '4px' }}>
              {flash.text}
            </span>
          </div>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <div className="relative z-30 shrink-0 px-4 py-3"
        style={{ background: 'rgba(0,0,0,0.75)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>

        {mode === 'shooter' && !busy && (
          <div className="max-w-lg mx-auto flex flex-col gap-2">
            <PowerBar value={powerValue} active={powerActive} />

            {/* Direction + controls row */}
            <div className="flex items-center justify-between gap-4">
              {/* Arrow pad */}
              <div className="grid gap-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 44px)', gridTemplateRows: 'repeat(3, 44px)' }}>
                {ARROW_PAD.map(({ dir, label, col, row }) => (
                  <button
                    key={dir}
                    style={{ gridColumn: col, gridRow: row }}
                    className={cn(
                      'rounded-lg text-xl font-bold border transition-all',
                      heldKeys.has(dir.split('-')[0]) || (dir.includes('-') && dir.split('-').every(p => heldKeys.has(p)))
                        ? 'bg-yellow-400 text-black border-yellow-400'
                        : 'text-gray-400'
                    )}
                    
                    onPointerDown={() => handleArrowDown(dir)}
                    onPointerUp={() => handleArrowUp(dir)}
                    onPointerLeave={() => handleArrowUp(dir)}
                  >
                    {label}
                  </button>
                ))}
                {/* Center kick button */}
                <button
                  style={{ gridColumn: 2, gridRow: 2 }}
                  className={cn(
                    'rounded-full border-2 font-black text-xs transition-all',
                    powerActive ? 'bg-red-600 border-red-500 text-white scale-110' : 'text-gray-400'
                  )}
                  onPointerDown={startPowerBar}
                  onPointerUp={releasePowerBar}
                  onPointerLeave={releasePowerBar}
                >
                  KICK
                </button>
              </div>

              {/* Direction indicator */}
              <div className="flex-1 text-center">
                <div style={{ fontSize: '3rem', lineHeight: 1, color: '#fff' }}>
                  {compositeDir ? (DIR_ICONS[compositeDir as CompositeDir] ?? '·') : '·'}
                </div>
                <p className="text-gray-500 text-xs mt-1 hidden md:block">
                  {powerActive ? 'THẢ [D] ĐỂ SÚT!' : 'GIỮ [D] TÍCH LỰC + MŨI TÊN CHỌN HƯỚNG'}
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === 'keeper' && !busy && (
          <p className="text-center text-gray-400 text-sm py-2" style={{ fontFamily: 'Bangers, cursive', letterSpacing: '2px', fontSize: '1.1rem' }}>
            CLICK VÀO KHUNG THÀNH ĐỂ BẮT BÓNG
          </p>
        )}

        {busy && <div className="text-center text-gray-600 text-sm py-2 animate-pulse">...</div>}
      </div>
    </div>
  );
}
