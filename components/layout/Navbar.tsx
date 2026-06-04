// components/layout/Navbar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import WalletConnect from '@/components/wallet/WalletConnect';
import TicketBalance from '@/components/wallet/TicketBalance';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-brand-border bg-brand-dark/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="font-display text-2xl text-white hover:text-brand-accent transition-colors">
          FORCE<span className="text-brand-accent">HERO</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-body font-bold">
          <Link
            href="/"
            className={cn(
              'transition-colors',
              pathname === '/' ? 'text-brand-accent' : 'text-gray-400 hover:text-white'
            )}
          >
            LOBBY
          </Link>
          <Link
            href="/games"
            className={cn(
              'transition-colors',
              pathname.startsWith('/games') ? 'text-brand-accent' : 'text-gray-400 hover:text-white'
            )}
          >
            GAMES
          </Link>
        </div>

        {/* Right: ticket balance + wallet */}
        <div className="flex items-center gap-3">
          <TicketBalance />
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}
