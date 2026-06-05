// config/site.ts
import type { GameCard } from '@/types';

export const siteConfig = {
  name: 'Force Hero',
  title: 'SMIC GAME HUB',
  description: 'Play blockchain-powered mini-games. Win tickets, climb the leaderboard.',
  url: 'https://force-hero.vercel.app',
  ogImage: '/images/og.png',
  links: {
    twitter: 'https://twitter.com/forcehero',
    github: 'https://github.com/dcityuknow/Force_Hero',
    faucet: 'https://faucet.circle.com',
  },
};

export const GAMES: GameCard[] = [
  {
    id: 'tugofwar',
    title: 'TUG OF WAR',
    description: 'Type arrow sequences to pull the rope.\nReach Level 9 for power items!',
    icon: '🪢',
    badge: 'MULTIPLAYER',
    badgeVariant: 'multiplayer',
    tags: ['Keyboard', 'VS Bot', 'Level 1–9'],
    href: '/games/tugofwar',
    glowColor: '#dc3232',  // glow-red từ style.css
    available: true,
  },
  {
    id: 'penalty',
    title: 'PENALTY SHOOTOUT',
    description: 'Choose to shoot or save.\n5 rounds — who wins the cup?',
    icon: '⚽',
    badge: 'NEW',
    badgeVariant: 'new',
    tags: ['Shooter', 'Goalkeeper', 'VS Bot'],
    href: '/games/penalty',
    glowColor: '#28c864',  // glow-green từ style.css
    available: true,
  },
];
