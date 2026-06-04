// components/wallet/TicketBalance.tsx
'use client';
import { useTickets } from '@/hooks/useTickets';
import { useWallet } from '@/hooks/useWallet';
import { useState } from 'react';
import BuyTicketModal from './BuyTicketModal';

export default function TicketBalance() {
  const { isConnected } = useWallet();
  const { ticketBalanceFormatted, isLoading } = useTickets();
  const [showModal, setShowModal] = useState(false);

  if (!isConnected) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-accent/50 transition-colors"
      >
        <span className="text-brand-accent font-display text-lg leading-none">🎟</span>
        <span className="text-white font-bold text-sm font-body">
          {isLoading ? '...' : ticketBalanceFormatted}
        </span>
      </button>
      {showModal && <BuyTicketModal onClose={() => setShowModal(false)} />}
    </>
  );
}
