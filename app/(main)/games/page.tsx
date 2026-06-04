// app/(main)/games/page.tsx
import GameGrid from '@/components/game/GameGrid';

export default function GamesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-5xl text-white mb-2">ALL GAMES</h1>
      <p className="text-gray-400 mb-10">Pick a game to start playing</p>
      <GameGrid />
    </div>
  );
}
