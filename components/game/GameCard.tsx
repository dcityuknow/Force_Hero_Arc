// components/game/GameCard.tsx
'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { GameCard as GameCardType } from '@/types';

interface Props {
  game: GameCardType;
  delay?: number;
}

const badgeStyles: Record<string, string> = {
  new: 'bg-brand-green/20 text-brand-green border-brand-green/40',
  hot: 'bg-brand-red/20 text-brand-red border-brand-red/40',
  multiplayer: 'bg-brand-blue/20 text-brand-blue border-brand-blue/40',
};

export default function GameCard({ game, delay = 0 }: Props) {
  return (
    <Link href={game.href}>
      <div
        className="game-card relative overflow-hidden rounded-2xl bg-brand-surface border border-brand-border p-6 cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-opacity-80 fade-up"
        style={{
          animationDelay: `${delay}ms`,
          ['--glow-color' as string]: game.glowColor,
        }}
      >
        {/* Glow layer */}
        <div
          className="card-glow rounded-2xl"
          style={{ boxShadow: `0 0 30px 6px ${game.glowColor}40`, background: `${game.glowColor}08` }}
        />

        <div className="relative z-10">
          {/* Top row */}
          <div className="flex items-start justify-between mb-4">
            <span className="text-4xl">{game.icon}</span>
            {game.badge && (
              <span className={cn(
                'px-2 py-1 rounded-md text-xs font-bold font-body border',
                badgeStyles[game.badgeVariant ?? 'new']
              )}>
                {game.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="font-display text-3xl text-white leading-tight mb-2">
            {game.title}
          </h2>

          {/* Desc */}
          <p className="text-gray-400 text-sm font-body mb-4">{game.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {game.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs font-body font-bold text-gray-400 bg-brand-dark rounded-md">
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 text-sm font-bold font-body" style={{ color: game.glowColor }}>
            PLAY NOW
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
