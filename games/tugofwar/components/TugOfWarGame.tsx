// games/tugofwar/components/TugOfWarGame.tsx
// Port từ tug.js — giữ nguyên UX/logic, chuyển sang React
'use client';
import { useTugOfWar } from '../hooks/useTugOfWar';
import { VICTORY_LIMIT, ARROW_SYMBOLS } from '../types';
import type { Team } from '../types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ── Confetti (port ConfettiParticle + startFireworks) ── */
function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width  = canvas.parentElement?.clientWidth  ?? 800;
    canvas.height = canvas.parentElement?.clientHeight ?? 600;

    const COLORS = ['#ff0a43','#ffdd00','#22ff00','#00e1ff','#ff00b7','#ff6a00','#b700ff','#003cff'];
    type P = { x:number; y:number; w:number; h:number; color:string; sx:number; sy:number; g:number; fr:number; rot:number; rs:number };
    let particles: P[] = [];

    function mk(): P {
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + Math.random() * 100,
        w: 14 + Math.random() * 12, h: 8 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        sx: (Math.random() - 0.5) * 10,
        sy: -16 - Math.random() * 7,
        g: 0.24, fr: 0.98,
        rot: Math.random() * 360, rs: (Math.random() - 0.5) * 10,
      };
    }

    function loop() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      if (particles.length < 180) for (let i = 0; i < 6; i++) particles.push(mk());
      particles = particles.filter(p => {
        p.sx *= p.fr; p.sy += p.g; p.x += p.sx; p.y += p.sy; p.rot += p.rs;
        if (p.y > canvas!.height + 50 && p.sy > 0) return false;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
        return true;
      });
      rafRef.current = requestAnimationFrame(loop);
    }
    loop();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); ctx.clearRect(0, 0, canvas.width, canvas.height); };
  }, [active]);

  return canvasRef;
}

/* ── Falling Item component (port spawnFallingItem) ── */
function FallingItem({ onCollect }: { onCollect: () => void }) {
  const [pos, setPos] = useState({ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 160 : 400) + 40, y: -80 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let y = -80;
    const x = pos.x;
    const animate = () => {
      y += 1.2;
      setPos({ x, y });
      if (y > (typeof window !== 'undefined' ? window.innerHeight : 800) + 20) return;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={onCollect}
      className="absolute z-50 cursor-pointer w-16 h-16"
      style={{ left: pos.x, top: pos.y, filter: 'drop-shadow(0 0 18px #ffd700) drop-shadow(0 0 36px #ffaa00)' }}
    >
      {/* Sử dụng emoji thay cho item.png nếu chưa có asset */}
      <div className="w-full h-full flex items-center justify-center text-4xl animate-bounce">⭐</div>
    </div>
  );
}

/* ── Main Game Component ── */
export default function TugOfWarGame() {
  const { state, selectTeam, resetGame, backToMenu, collectPowerUp } = useTugOfWar();
  const {
    ropePosition, gamePhase, userTeam, botTeam,
    currentLevel, botLevel, arrowSequence, userProgress,
    timeLimit, timeRemaining, winner, powerUpActive, itemSpawnCooldown,
  } = state;

  const canvasRef  = useConfetti(gamePhase === 'result');
  const [showWrongFlash, setShowWrongFlash] = useState(false);
  const [showItem, setShowItem] = useState(false);
  const prevProgressRef = useRef(userProgress);

  // Detect sequence fail (userProgress reset to 0 từ >0) → flash đỏ
  useEffect(() => {
    if (prevProgressRef.current > 0 && userProgress === 0 && gamePhase === 'playing') {
      setShowWrongFlash(true);
      setTimeout(() => setShowWrongFlash(false), 250);
    }
    prevProgressRef.current = userProgress;
  }, [userProgress, gamePhase]);

  // Spawn item khi đạt level 9 lần đầu
  useEffect(() => {
    if (itemSpawnCooldown && !showItem) {
      setTimeout(() => setShowItem(true), 600);
    }
    if (!itemSpawnCooldown) setShowItem(false);
  }, [itemSpawnCooldown, showItem]);

  // Rope position % cho thanh trực quan: 0%=left wins, 100%=right wins
  const ropePercent = ((ropePosition + VICTORY_LIMIT) / (VICTORY_LIMIT * 2)) * 100;
  const timePercent = Math.max(0, (timeRemaining / timeLimit) * 100);

  // Power-up timer bar (màu vàng khi active)
  const timeBarStyle = powerUpActive
    ? { width: `${timePercent}%`, background: 'linear-gradient(90deg, #ffd700, #ffaa00)' }
    : { width: `${timePercent}%`, background: 'linear-gradient(90deg, #4caf50, #ffeb3b, #f44336)' };

  // Các tên team
  const leftLabel  = userTeam === 'left' ? 'YOU' : 'BOT';
  const rightLabel = userTeam === 'right' ? 'YOU' : 'BOT';

  /* ── MENU SCREEN ── */
  if (gamePhase === 'menu') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 gap-6">
        <Link href="/" className="self-start text-gray-500 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        <h1 className="font-display text-6xl text-white">TUG OF WAR</h1>
        <p className="text-gray-400 font-body">Choose your team</p>
        <div className="flex gap-6 mt-4">
          {(['left', 'right'] as Team[]).map(side => (
            <button
              key={side}
              onClick={() => selectTeam(side)}
              className="px-10 py-5 rounded-2xl font-display text-3xl border-2 transition-all hover:scale-105"
              style={side === 'left'
                ? { background: '#d5000020', borderColor: '#d50000', color: '#ff4444' }
                : { background: '#2962ff20', borderColor: '#2962ff', color: '#5588ff' }}
            >
              {side === 'left' ? '🔴 LEFT' : '🔵 RIGHT'}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── GAME SCREEN ── */
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-6 overflow-hidden select-none">
      {/* Confetti canvas */}
      {gamePhase === 'result' && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />
      )}

      {/* Falling item */}
      {showItem && gamePhase === 'playing' && (
        <FallingItem onCollect={() => { setShowItem(false); collectPowerUp(); }} />
      )}

      {/* Back button */}
      <button onClick={backToMenu} className="absolute top-4 left-4 text-gray-500 hover:text-white text-sm font-body transition-colors z-10">
        ← Back
      </button>

      {/* Level badges */}
      <div className="flex gap-8 mb-4">
        <div className="text-center">
          <span className="text-xs font-body text-gray-500">{leftLabel}</span>
          <p className="font-display text-2xl text-brand-red">LV {userTeam === 'left' ? currentLevel : botLevel}</p>
        </div>
        <div className="font-display text-3xl text-gray-600 self-center">VS</div>
        <div className="text-center">
          <span className="text-xs font-body text-gray-500">{rightLabel}</span>
          <p className="font-display text-2xl text-brand-blue">LV {userTeam === 'right' ? currentLevel : botLevel}</p>
        </div>
      </div>

      {/* Rope bar */}
      <div className="w-full max-w-2xl mb-2">
        <div className="relative h-10 bg-brand-surface rounded-full border border-brand-border overflow-hidden">
          {/* Center marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20" />
          {/* Zone indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-brand-red/10" />
          <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-brand-blue/10" />
          {/* Rope knot */}
          <div
            className="absolute top-1 bottom-1 w-8 rounded-full bg-brand-accent shadow-lg transition-all duration-75"
            style={{ left: `calc(${ropePercent}% - 16px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1 font-body">
          <span>🔴 {leftLabel}</span>
          <span>{rightLabel} 🔵</span>
        </div>
      </div>

      {/* Time bar */}
      {gamePhase === 'playing' && (
        <div className="w-full max-w-2xl mb-6 h-2 bg-brand-surface rounded-full overflow-hidden border border-brand-border">
          <div className="h-full rounded-full transition-all duration-100" style={timeBarStyle} />
        </div>
      )}

      {/* Audition arrow chain */}
      {gamePhase === 'playing' && (
        <div className="flex gap-3 mb-6 flex-wrap justify-center">
          {arrowSequence.map((key, i) => (
            <div
              key={i}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-display border-2 transition-all duration-150',
                showWrongFlash && i >= userProgress
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : i < userProgress
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : i === userProgress
                  ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
                  : 'bg-brand-surface border-brand-border text-gray-500'
              )}
            >
              {ARROW_SYMBOLS[key]}
            </div>
          ))}
        </div>
      )}

      {/* Power-up notice */}
      {powerUpActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center px-10 py-5 rounded-2xl font-body font-black text-white pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)', boxShadow: '0 0 40px #ffd700, 0 0 80px #ff8c00', textShadow: '-2px -2px 0 #7a4100, 2px 2px 0 #7a4100' }}>
          <p className="text-2xl">⭐ POWER UP! ⭐</p>
          <p className="text-sm mt-1">Bấm SPACE liên tục trong 5 giây!</p>
        </div>
      )}

      {/* Hint text */}
      {gamePhase === 'playing' && !powerUpActive && (
        <p className="text-gray-600 text-xs font-body">
          Nhập đúng chuỗi mũi tên → bấm <kbd className="bg-brand-surface border border-brand-border px-1 rounded text-gray-400">SPACE</kbd> để kéo
        </p>
      )}

      {/* Result overlay */}
      {gamePhase === 'result' && (
        <div className="relative z-30 text-center mt-4">
          {winner === userTeam
            ? <p className="font-display text-6xl text-brand-accent mb-2">🎉 YOU WIN!</p>
            : <p className="font-display text-6xl text-gray-400 mb-2">💀 YOU LOSE</p>
          }
          <p className="text-gray-400 font-body mb-6">
            {winner === 'left' ? '🔴 LEFT TEAM WIN!' : '🔵 RIGHT TEAM WIN!'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={resetGame} className="px-6 py-3 rounded-xl bg-brand-accent text-brand-dark font-bold font-body hover:scale-105 transition-transform">
              Play Again
            </button>
            <button onClick={backToMenu} className="px-6 py-3 rounded-xl bg-brand-surface border border-brand-border text-white font-bold font-body hover:border-white/50 transition-colors">
              Change Team
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
