// config/site.ts

export const siteConfig = {
  name: 'Force Hero',
  title: 'FORCE HERO – SMIC GAME HUB',
  description: 'Play blockchain-powered mini-games. Win tickets, climb the leaderboard.',
  url: 'https://force-hero.vercel.app',
  ogImage: '/images/og.png',
  links: {
    twitter: 'https://twitter.com/forcehero',
    github: 'https://github.com/dcityuknow/Force_Hero',
  },
};

export const GAMES = [
  {
    id: 'tugofwar',
    title: 'TUG OF WAR',
    description: 'Type arrow sequences to pull the rope. Reach Level 9 for power items!',
    icon: '🪢',
    badge: 'MULTIPLAYER',
    badgeVariant: 'multiplayer' as const,
    tags: ['Keyboard', 'VS Bot', 'Level 1–9'],
    href: '/games/tugofwar',
    glowColor: '#e63946',
    available: true,
  },
  {
    id: 'penalty',
    title: 'PENALTY SHOOTOUT',
    description: 'Choose to shoot or save. 5 rounds — who wins the cup?',
    icon: '⚽',
    badge: 'NEW',
    badgeVariant: 'new' as const,
    tags: ['Shooter', 'Goalkeeper', 'VS Bot'],
    href: '/games/penalty',
    glowColor: '#2ec4b6',
    available: true,
  },
];
