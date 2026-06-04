// components/layout/Footer.tsx
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-brand-border py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display text-xl text-white">
          FORCE<span className="text-brand-accent">HERO</span>
        </p>
        <p className="text-gray-600 text-sm font-body">
          SMIC GAME HUB • 2025 • Built on Base
        </p>
        <div className="flex gap-4 text-sm font-body text-gray-500">
          <Link href={siteConfig.links.github} target="_blank" className="hover:text-white transition-colors">
            GitHub
          </Link>
          <Link href={siteConfig.links.twitter} target="_blank" className="hover:text-white transition-colors">
            Twitter
          </Link>
        </div>
      </div>
    </footer>
  );
}
