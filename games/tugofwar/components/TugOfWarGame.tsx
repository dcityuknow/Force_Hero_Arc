// games/tugofwar/components/TugOfWarGame.tsx
'use client';
import { useTugOfWar } from '../hooks/useTugOfWar';
import { VICTORY_LIMIT, ARROW_SYMBOLS } from '../types';
import type { Team } from '../types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

// ── Asset paths ──────────────────────────────────────────
const TUG = '/games/tugofwar';
const CHARS = `${TUG}/characters`;
const ITEMS = `${TUG}/items`;
const BG    = `${TUG}/backgrounds`;

// ── Confetti canvas ──────────────────────────────────────
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

// ── Falling Item (item.png) ──────────────────────────────
function FallingItem({ onCollect }: { onCollect: () => void }) {
  const [posY, setPosY] = useState(-80);
  const posX = useRef(Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 160 : 400) + 40);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let y = -80;
    const animate = () => {
      y += 1.2;
      setPosY(y);
      if (y <= (typeof window !== 'undefined' ? window.innerHeight : 800) + 20) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div
      onClick={onCollect}
      className="absolute z-50 cursor-pointer w-16 h-16"
      style={{
        left: posX.current,
        top: posY,
        filter: 'drop-shadow(0 0 18px #ffd700) drop-shadow(0 0 36px #ffaa00)',
      }}
    >
      <Image src={`${ITEMS}/item.png`} alt="power item" fill className="object-contain animate-bounce" />
    </div>
  );
}

// ── Map backgrounds ──────────────────────────────────────
const MAP_OPTIONS = [
  { src: `${BG}/background1.png`, label: 'Green Steppe' },
  { src: `${BG}/background2.png`, label: "Pharaoh's Desert" },
  { src: `${BG}/background3.png`, label: 'Summer Beach' },
];

// ── Team sprite helper ───────────────────────────────────
function getTeamSrc(team: 'left' | 'right', isActive: boolean, isPanic: boolean): string {
  if (team === 'left') {
    if (isPanic)   return `${CHARS}/team_left_active2.png`;
    if (isActive)  return `${CHARS}/team_left_active.png`;
    return `${CHARS}/team_left.png`;
  } else {
    if (isPanic)   return `${CHARS}/team_right_active2.png`;
    if (isActive)  return `${CHARS}/team_right_active.png`;
    return `${CHARS}/team_right.png`;
  }
}

// ── Main Game Component ──────────────────────────────────
export default function TugOfWarGame() {
  const { state, selectTeam, resetGame, backToMenu, collectPowerUp } = useTugOfWar();
  const {
    ropePosition, gamePhase, userTeam, botTeam,
    currentLevel, botLevel, arrowSequence, userProgress,
    timeLimit, timeRemaining, winner, powerUpActive, itemSpawnCooldown,
  } = state;

  const canvasRef = useConfetti(gamePhase === 'result');
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [showWrongFlash, setShowWrongFlash] = useState(false);
  const [showItem, setShowItem] = useState(false);
  const prevProgressRef = useRef(userProgress);

  // Detect sequence fail → flash đỏ
  useEffect(() => {
    if (prevProgressRef.current > 0 && userProgress === 0 && gamePhase === 'playing') {
      setShowWrongFlash(true);
      setTimeout(() => setShowWrongFlash(false), 250);
    }
    prevProgressRef.current = userProgress;
  }, [userProgress, gamePhase]);

  // Spawn item khi đạt level 9
  useEffect(() => {
    if (itemSpawnCooldown && !showItem) setTimeout(() => setShowItem(true), 600);
    if (!itemSpawnCooldown) setShowItem(false);
  }, [itemSpawnCooldown, showItem]);

  const ropePercent  = ((ropePosition + VICTORY_LIMIT) / (VICTORY_LIMIT * 2)) * 100;
  const timePercent  = Math.max(0, (timeRemaining / timeLimit) * 100);
  const timeBarStyle = powerUpActive
    ? { width: `${timePercent}%`, background: 'linear-gradient(90deg,#ffd700,#ffaa00)' }
    : { width: `${timePercent}%`, background: 'linear-gradient(90deg,#4caf50,#ffeb3b,#f44336)' };

  // Tính active/panic state để đổi sprite
  const ropeMovingLeft  = ropePosition < -50;
  const ropeMovingRight = ropePosition > 50;
  const leftPanic  = ropePosition > 150;
  const rightPanic = ropePosition < -150;

  // ── START MENU (map select) ──────────────────────────
  if (gamePhase === 'menu') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-4 gap-8 bg-[#0a0e1a] overflow-y-auto" style={{ top: 64 }}>
        <Link href="/" className="self-start text-gray-500 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        <h1 className="font-display text-6xl text-white tracking-widest">TUG OF WAR</h1>
        <p className="text-yellow-300 font-bold tracking-widest text-lg">CHOOSE MAP TO PLAY</p>

        <div className="flex gap-6 flex-wrap justify-center bg-black/60 border border-white/15 rounded-2xl p-8">
          {MAP_OPTIONS.map(({ src, label }) => (
            <div
              key={src}
              onClick={() => setSelectedMap(src)}
              className={cn(
                'flex flex-col items-center cursor-pointer transition-transform hover:scale-105',
                selectedMap === src && 'scale-105'
              )}
            >
              <div className={cn(
                'relative w-56 h-36 border-4 rounded-lg overflow-hidden shadow-lg transition-all',
                selectedMap === src ? 'border-yellow-400' : 'border-white'
              )}>
                <Image src={src} alt={label} fill className="object-cover" />
              </div>
              <span className="mt-3 text-white font-bold text-sm">{label}</span>
            </div>
          ))}
        </div>

        {selectedMap && (
          <div className="flex gap-8 mt-2">
            {(['left', 'right'] as Team[]).map(side => (
              <button
                key={side}
                onClick={() => selectTeam(side)}
                className={cn(
                  'flex flex-col items-center gap-3 px-8 py-5 rounded-2xl border-4 font-display text-2xl transition-all hover:scale-105',
                  side === 'left'
                    ? 'bg-red-800/80 border-white text-white hover:shadow-[0_0_20px_#ff1744] hover:border-yellow-400'
                    : 'bg-blue-800/80 border-white text-white hover:shadow-[0_0_20px_#2979ff] hover:border-yellow-400'
                )}
              >
                <div className="relative w-32 h-28">
                  <Image src={`${CHARS}/${side === 'left' ? 'team_left' : 'team_right'}.png`} alt={`${side} team`} fill className="object-contain" />
                </div>
                <span>{side === 'left' ? 'RED TEAM' : 'BLUE TEAM'}</span>
                <span className="text-sm font-body opacity-90">({side === 'left' ? 'LEFT' : 'RIGHT'} SIDE)</span>
              </button>
            ))}
          </div>
        )}
        {!selectedMap && (
          <p className="text-gray-500 text-sm font-body">Chọn map trước để tiếp tục</p>
        )}
      </div>
    );
  }

  // ── GAME SCREEN ──────────────────────────────────────
  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ top: 64 }}>

      {/* Background */}
      {selectedMap && (
        <div className="absolute inset-0 z-0">
          <Image src={selectedMap} alt="map" fill className="object-cover" priority />
        </div>
      )}

      {/* Confetti */}
      {gamePhase === 'result' && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />
      )}

      {/* Falling item */}
      {showItem && gamePhase === 'playing' && (
        <FallingItem onCollect={() => { setShowItem(false); collectPowerUp(); }} />
      )}

      {/* Back button */}
      <button
        onClick={backToMenu}
        className="absolute top-4 right-4 z-40 px-4 py-2 bg-black/50 border border-white/25 rounded-full text-white text-sm font-bold hover:bg-white/15 transition-colors"
      >
        🏠 LOBBY
      </button>

      {/* Level badges */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-6 items-center">
        <div className="bg-black/70 border-2 border-yellow-400 rounded-full px-4 py-1 text-yellow-400 font-bold text-sm">
          {userTeam === 'left' ? 'YOU' : 'BOT'} LV {userTeam === 'left' ? currentLevel : botLevel}
        </div>
        <div className="bg-black/70 border-2 border-yellow-400 rounded-full px-4 py-1 text-yellow-400 font-bold text-sm">
          {userTeam === 'right' ? 'YOU' : 'BOT'} LV {userTeam === 'right' ? currentLevel : botLevel}
        </div>
      </div>

      {/* Teams */}
      {/* Left team */}
      <div className={cn(
        'absolute z-10 transition-none',
        ropeMovingRight && !leftPanic && 'animate-[intenseShakeLeft_0.18s_infinite]',
        leftPanic && 'animate-[panicShake_0.15s_infinite]',
      )} style={{ left: '5%', bottom: '9vh', width: '30%', height: '50vh' }}>
        <Image
          src={getTeamSrc('left', ropeMovingRight, leftPanic)}
          alt="left team"
          fill
          className="object-contain object-bottom"
        />
      </div>

      {/* Right team */}
      <div className={cn(
        'absolute z-10 transition-none',
        ropeMovingLeft && !rightPanic && 'animate-[intenseShakeRight_0.18s_infinite]',
        rightPanic && 'animate-[panicShake_0.15s_infinite]',
      )} style={{ right: '5%', bottom: '11.5vh', width: '30%', height: '50vh' }}>
        <Image
          src={getTeamSrc('right', ropeMovingLeft, rightPanic)}
          alt="right team"
          fill
          className="object-contain object-bottom"
        />
      </div>

      {/* Character center (hanging) */}
      <div
        className="absolute z-[4] animate-[pendulumSwing_3s_ease-in-out_infinite]"
        style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: '15%', height: '55vh' }}
      >
        <Image src={`${CHARS}/character_center.png`} alt="center character" fill className="object-contain object-top" />
      </div>

      {/* Rope + flag */}
      <div
        className="absolute z-[5] transition-[left] duration-[50ms]"
        style={{
          bottom: '22vh',
          left: `calc(50% + ${ropePosition * 0.3}px - 42.5%)`,
          width: '85%',
          height: '60px',
        }}
      >
        <div className="relative w-full h-full">
          <Image src={`${ITEMS}/rope.png`} alt="rope" fill className="object-fill" style={{ top: 20 }} />
          <div className="absolute" style={{ top: 22, left: '50%', transform: 'translateX(-50%)', width: 130, height: 145 }}>
            <Image src={`${ITEMS}/flag.png`} alt="flag" fill className="object-contain" />
          </div>
        </div>
      </div>

      {/* Audition UI (bottom center) */}
      {gamePhase === 'playing' && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 min-w-[320px]">
          {/* Time bar */}
          <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden border border-[#555]">
            <div className="h-full rounded-full transition-[width] duration-100" style={timeBarStyle} />
          </div>

          {/* Arrow chain */}
          <div className="flex gap-2 flex-wrap justify-center">
            {arrowSequence.map((key, i) => (
              <div
                key={i}
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center text-2xl font-bold border-2 transition-all duration-100',
                  showWrongFlash && i >= userProgress
                    ? 'bg-red-700/90 border-red-500 text-white shadow-[0_0_10px_#ef5350]'
                    : i < userProgress
                    ? 'bg-green-800/90 border-green-500 text-white shadow-[0_0_10px_#4caf50]'
                    : i === userProgress
                    ? 'bg-[#1a1a2e]/90 border-yellow-400 text-yellow-400'
                    : 'bg-[#282828]/90 border-[#777] text-white'
                )}
              >
                {ARROW_SYMBOLS[key]}
              </div>
            ))}
          </div>

          {/* Hint */}
          <p className="text-gray-400 text-xs font-body hidden md:block">
            Nhập đúng chuỗi → bấm <kbd className="bg-black/60 border border-gray-500 px-1 rounded text-gray-300">SPACE</kbd>
          </p>
        </div>
      )}

      {/* Power-up overlay */}
      {powerUpActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center px-10 py-5 rounded-2xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c00)', boxShadow: '0 0 40px #ffd700, 0 0 80px #ff8c00', textShadow: '-2px -2px 0 #7a4100, 2px 2px 0 #7a4100' }}>
          <p className="font-bold text-white text-2xl">⭐ POWER UP! ⭐</p>
          <p className="text-white text-sm mt-1 font-body">Bấm SPACE liên tục trong 5 giây!</p>
        </div>
      )}

      {/* Result overlay */}
      {gamePhase === 'result' && (
        <div className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center">
          <div className="relative w-[550px] h-[400px] flex flex-col items-center justify-center animate-[popUp_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <Image src={`${ITEMS}/ketqua.png`} alt="result" fill className="object-contain" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h2 className="font-bold text-4xl text-white drop-shadow-[2px_2px_0_#000]">
                {winner === userTeam ? '🎉 YOU WIN!' : `${winner === 'left' ? '🔴 RED' : '🔵 BLUE'} TEAM WINS!`}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={resetGame}
                  className="px-8 py-3 rounded-full bg-green-700 text-white font-bold hover:bg-green-600 shadow-[0_4px_0_#1b5e20] active:translate-y-1 transition-all"
                >
                  Play Again
                </button>
                <button
                  onClick={backToMenu}
                  className="px-8 py-3 rounded-full bg-black/50 border border-white/30 text-white font-bold hover:bg-white/15 transition-colors"
                >
                  Change Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes intenseShakeLeft {
          0%   { margin-left:0px; margin-top:0px; transform:rotate(0deg); }
          20%  { margin-left:-5px; margin-top:2px; transform:rotate(-1deg); }
          40%  { margin-left:-2px; margin-top:-2px; transform:rotate(0.5deg); }
          60%  { margin-left:-4px; margin-top:-1px; transform:rotate(-0.5deg); }
          80%  { margin-left:-1px; margin-top:3px; transform:rotate(1deg); }
          100% { margin-left:0px; margin-top:0px; transform:rotate(0deg); }
        }
        @keyframes intenseShakeRight {
          0%   { margin-right:0px; margin-top:0px; transform:rotate(0deg); }
          20%  { margin-right:-5px; margin-top:2px; transform:rotate(1deg); }
          40%  { margin-right:-2px; margin-top:-2px; transform:rotate(-0.5deg); }
          60%  { margin-right:-4px; margin-top:-1px; transform:rotate(0.5deg); }
          80%  { margin-right:-1px; margin-top:3px; transform:rotate(-1deg); }
          100% { margin-right:0px; margin-top:0px; transform:rotate(0deg); }
        }
        @keyframes panicShake {
          0%   { transform:rotate(0deg); }
          25%  { transform:rotate(-1deg) translateX(-3px); }
          50%  { transform:rotate(1deg) translateX(3px); }
          75%  { transform:rotate(-0.5deg) translateX(-2px); }
          100% { transform:rotate(0deg); }
        }
        @keyframes pendulumSwing {
          0%   { transform:translateX(-50%) rotate(-3deg); }
          50%  { transform:translateX(-50%) rotate(3deg); }
          100% { transform:translateX(-50%) rotate(-3deg); }
        }
        @keyframes popUp {
          from { transform:scale(0.8); opacity:0; }
          to   { transform:scale(1); opacity:1; }
        }
      `}</style>
    </div>
  );
}
