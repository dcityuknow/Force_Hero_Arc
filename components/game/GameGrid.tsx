// components/game/GameGrid.tsx
import GameCard from './GameCard';
import { GAMES } from '@/config/site';

export default function GameGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
      {GAMES.map((game, i) => (
        <GameCard key={game.id} game={game} delay={i * 100} />
      ))}
    </div>
  );
}
