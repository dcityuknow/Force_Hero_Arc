// app/(main)/page.tsx
import GameGrid from '@/components/game/GameGrid';

export default function LobbyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <header className="text-center mb-14 fade-up">
        <div className="text-5xl mb-3">🎮</div>
        <h1 className="font-display text-6xl md:text-8xl tracking-wider text-white leading-none">
          FORCE<span className="text-brand-accent">HERO</span>
        </h1>
        <p className="mt-3 text-lg text-gray-400 font-body">
          Choose your game and let&apos;s play!
        </p>
      </header>

      {/* Game Grid */}
      <GameGrid />

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-600 text-sm font-body">
        FORCE HERO • SMIC GAME HUB • 2025
      </footer>
    </div>
  );
}
