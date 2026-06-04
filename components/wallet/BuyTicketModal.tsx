// components/wallet/BuyTicketModal.tsx
'use client';
import { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import { buyTickets } from '@/contracts/ticketSystem';
import { cn } from '@/lib/utils';

interface Props {
  onClose: () => void;
}

const AMOUNTS = [5, 10, 20, 50];

export default function BuyTicketModal({ onClose }: Props) {
  const [selected, setSelected] = useState(10);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { usdcBalanceFormatted, refetchTickets } = useTickets();

  const handleBuy = async () => {
    setStatus('pending');
    setErrorMsg('');
    try {
      const hash = await buyTickets(selected);
      await new Promise((r) => setTimeout(r, 2000)); // wait a bit for tx
      await refetchTickets();
      setStatus('success');
    } catch (e: unknown) {
      setStatus('error');
      setErrorMsg(e instanceof Error ? e.message : 'Transaction failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-display text-3xl text-white">BUY TICKETS</h2>
            <p className="text-gray-400 text-sm mt-1">1 ticket = 1 USDC</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        <p className="text-gray-400 text-sm mb-4">Your USDC: <span className="text-white font-bold">{usdcBalanceFormatted}</span></p>

        {/* Amount selector */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setSelected(amt)}
              className={cn(
                'py-3 rounded-xl font-display text-xl transition-all',
                selected === amt
                  ? 'bg-brand-accent text-brand-dark'
                  : 'bg-brand-dark border border-brand-border text-white hover:border-brand-accent/50'
              )}
            >
              {amt}
            </button>
          ))}
        </div>

        <div className="flex justify-between text-sm text-gray-400 mb-6">
          <span>Total cost</span>
          <span className="text-white font-bold">{selected} USDC</span>
        </div>

        {status === 'error' && (
          <p className="text-brand-red text-sm mb-4">{errorMsg}</p>
        )}
        {status === 'success' && (
          <p className="text-brand-green text-sm mb-4">✓ Tickets purchased successfully!</p>
        )}

        <button
          onClick={handleBuy}
          disabled={status === 'pending'}
          className="w-full py-3 rounded-xl bg-brand-accent text-brand-dark font-bold font-body text-lg hover:bg-brand-accent/90 disabled:opacity-50 transition-colors"
        >
          {status === 'pending' ? 'Processing...' : `Buy ${selected} Tickets`}
        </button>
      </div>
    </div>
  );
}
