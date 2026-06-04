// games/penalty/components/PenaltyGame.tsx
'use client';
import { usePenalty } from '../hooks/usePenalty';
import type { ShotDirection } from '../types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const DIR_LABELS: Record<ShotDirection, string> = {
  left: '← Left',
  center: '● Center',
  right: 'Right →',
};

const DIR_EMOJI: Record<ShotDirection, string> = {
  left: '👈',
  center: '⬆️',
  right: '👉',
};

export default function PenaltyGame() {
  const { state, lastResult, startGame, playerChoose, resetGame } = usePenalty();
  const { phase, round, maxRounds, score, playerRole, winner } = state;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Back */}
      <Link href="/" className="self-start mb-6 text-gray-500 hover:text-white text-sm font-body transition-colors">
        ← Back to Lobby
      </Link>

      <h1 className="font-display text-5xl text-white mb-1">PENALTY SHOOTOUT</h1>
      <p className="text-gray-400 text-sm mb-8 font-body">
        {phase !== 'idle' && phase !== 'result' ? `Round ${round} / ${maxRounds}` : '5 rounds – who wins the cup?'}
      </p>

      {/* Scoreboard */}
      {phase !== 'idle' && (
        <div className="flex items-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-gray-400 text-xs font-body mb-1">YOU</p>
            <p className="font-display text-5xl text-brand-green">{score.player}</p>
          </div>
          <div className="font-display text-3xl text-gray-600">–</div>
          <div className="text-center">
            <p className="text-gray-400 text-xs font-body mb-1">BOT</p>
            <p className="font-display text-5xl text-brand-red">{score.bot}</p>
          </div>
        </div>
      )}

      {/* Goal visualization */}
      {(phase === 'shooting' || phase === 'saving') && (
        <div className="w-64 h-32 mb-6 relative border-4 border-white/30 rounded-b-none rounded-t-lg overflow-hidden bg-brand-surface/50">
          {/* Goal post lines */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />
          <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/10" />
          <div className="absolute top-0 bottom-0 right-1/3 w-px bg-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-30">{phase === 'shooting' ? '⚽' : '🧤'}</span>
          </div>
        </div>
      )}

      {/* Role indicator */}
      {(phase === 'shooting' || phase === 'saving') && (
        <p className="text-brand-accent font-display text-2xl mb-6">
          {phase === 'shooting' ? '⚽ YOU SHOOT' : '🧤 YOU SAVE'}
        </p>
      )}

      {/* Last result */}
      {lastResult && phase !== 'idle' && (
        <div className="mb-6 px-4 py-2 rounded-lg bg-brand-surface border border-brand-border text-sm font-body text-gray-300">
          {lastResult}
        </div>
      )}

      {/* Direction buttons */}
      {(phase === 'shooting' || phase === 'saving') && (
        <div className="flex gap-4">
          {(['left', 'center', 'right'] as ShotDirection[]).map((dir) => (
            <button
              key={dir}
              onClick={() => playerChoose(dir)}
              className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-brand-surface border-2 border-brand-border hover:border-brand-accent text-white font-body font-bold transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-2xl">{DIR_EMOJI[dir]}</span>
              <span className="text-xs">{DIR_LABELS[dir]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Idle start */}
      {phase === 'idle' && (
        <button
          onClick={startGame}
          className="mt-4 px-8 py-4 rounded-xl bg-brand-green text-brand-dark font-bold text-lg font-body hover:scale-105 transition-transform"
        >
          ⚽ KICK OFF
        </button>
      )}

      {/* Result */}
      {phase === 'result' && (
        <div className="text-center mt-2">
          <p className="font-display text-5xl text-white mb-2">
            {winner === 'player' ? '🏆 YOU WIN!' : winner === 'bot' ? '💀 BOT WINS' : '🤝 DRAW'}
          </p>
          <p className="text-gray-400 font-body text-sm mb-6">
            Final score: {score.player} – {score.bot}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl bg-brand-green text-brand-dark font-bold font-body hover:scale-105 transition-transform"
            >
              Play Again
            </button>
            <button
              onClick={resetGame}
              className="px-6 py-3 rounded-xl bg-brand-surface border border-brand-border text-white font-bold font-body hover:border-white/50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
