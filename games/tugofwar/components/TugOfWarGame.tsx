// games/tugofwar/components/TugOfWarGame.tsx
'use client';
import { useTugOfWar } from '../hooks/useTugOfWar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TugOfWarGame() {
  const { state, startGame, resetGame, handleInput } = useTugOfWar();
  const { gamePhase, sequence, playerInput, ropePosition, level, winner, powerItemActive } = state;

  const ropePercent = ((ropePosition + 100) / 200) * 100; // 0%=player wins, 100%=bot wins

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Back */}
      <Link href="/" className="self-start mb-6 text-gray-500 hover:text-white text-sm font-body transition-colors">
        ← Back to Lobby
      </Link>

      <h1 className="font-display text-5xl text-white mb-2">TUG OF WAR</h1>
      <p className="text-gray-400 text-sm mb-8 font-body">Level {level} {powerItemActive ? '⚡ POWER ACTIVE' : ''}</p>

      {/* Rope visualization */}
      <div className="w-full max-w-xl mb-8">
        <div className="relative h-8 bg-brand-surface rounded-full border border-brand-border overflow-hidden">
          {/* Zone markers */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-border" />
          {/* Rope position indicator */}
          <div
            className="absolute top-1 bottom-1 w-6 rounded-full bg-brand-accent transition-all duration-300 shadow-lg"
            style={{ left: `calc(${ropePercent}% - 12px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1 font-body">
          <span>👤 You</span>
          <span>🤖 Bot</span>
        </div>
      </div>

      {/* Sequence display */}
      {gamePhase === 'playing' && (
        <div className="flex gap-3 mb-6">
          {sequence.map((dir, i) => (
            <div
              key={i}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-display border-2 transition-all',
                i < playerInput.length
                  ? 'bg-brand-green/20 border-brand-green text-brand-green'
                  : i === playerInput.length
                  ? 'bg-brand-accent/20 border-brand-accent text-brand-accent animate-pulse'
                  : 'bg-brand-surface border-brand-border text-gray-500'
              )}
            >
              {dir}
            </div>
          ))}
        </div>
      )}

      {/* Mobile buttons */}
      {gamePhase === 'playing' && (
        <div className="grid grid-cols-3 gap-2 mt-2 md:hidden">
          <div />
          <button onClick={() => handleInput('↑')} className="btn-dir">↑</button>
          <div />
          <button onClick={() => handleInput('←')} className="btn-dir">←</button>
          <button onClick={() => handleInput('↓')} className="btn-dir">↓</button>
          <button onClick={() => handleInput('→')} className="btn-dir">→</button>
        </div>
      )}

      {/* CTA */}
      {gamePhase === 'idle' && (
        <button
          onClick={startGame}
          className="mt-4 px-8 py-4 rounded-xl bg-brand-accent text-brand-dark font-bold text-lg font-body hover:scale-105 transition-transform"
        >
          START GAME
        </button>
      )}

      {gamePhase === 'result' && (
        <div className="text-center mt-4">
          <p className="font-display text-4xl text-white mb-2">
            {winner === 'player' ? '🏆 YOU WIN!' : '💀 BOT WINS'}
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={startGame} className="px-6 py-3 rounded-xl bg-brand-accent text-brand-dark font-bold font-body">
              Play Again
            </button>
            <button onClick={resetGame} className="px-6 py-3 rounded-xl bg-brand-surface border border-brand-border text-white font-bold font-body">
              Reset
            </button>
          </div>
        </div>
      )}

      <p className="mt-8 text-gray-600 text-xs font-body hidden md:block">
        Use arrow keys to match the sequence
      </p>

      <style jsx>{`
        .btn-dir {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: #12121e;
          border: 1px solid #1e1e30;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-dir:active { background: #1e1e30; }
      `}</style>
    </div>
  );
}
