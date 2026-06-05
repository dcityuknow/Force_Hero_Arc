// components/wallet/TicketBalance.tsx
'use client';
import { useWallet } from '@/hooks/useWallet';
import { useState } from 'react';
import BuyTicketModal from './BuyTicketModal';

export default function TicketBalance() {
  const { isConnected, ticketBalance } = useWallet();
  const [showModal, setShowModal] = useState(false);

  if (!isConnected) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#ffe066]/12 border border-[#ffe066]/30 hover:bg-[#ffe066]/20 transition-colors"
      >
        <span className="text-[#ffe066] font-body font-black text-sm">🎟️ {ticketBalance}</span>
      </button>
      {showModal && <BuyTicketModal onClose={() => setShowModal(false)} />}
    </>
  );
}
