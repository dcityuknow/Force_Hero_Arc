// components/wallet/BuyTicketModal.tsx
// Port UI từ index.html modal + wallet.js buyTickets flow
'use client';
import { useState } from 'react';
import { useTickets } from '@/hooks/useTickets';
import { useWallet } from '@/hooks/useWallet';

interface Props { onClose: () => void }

export default function BuyTicketModal({ onClose }: Props) {
  const [qty, setQty]         = useState(1);
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(false);
  const { buyTickets }        = useTickets();
  const { showToast }         = useWallet();
  const MAX_QTY = 10;

  const changeQty = (delta: number) => setQty(q => Math.min(MAX_QTY, Math.max(1, q + delta)));

  const confirmBuy = async () => {
    setLoading(true);
    setStatus('');
    const ok = await buyTickets(qty);
    setLoading(false);
    if (ok) {
      showToast(`🎟️ Mua thành công ${qty} ticket!`);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-gradient-to-b from-[#12122a] to-[#0e1535] border border-white/10 rounded-3xl p-10 w-full max-w-sm text-center shadow-2xl animate-[slideUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <button onClick={onClose} className="absolute top-4 right-5 text-gray-500 hover:text-white text-xl leading-none">✕</button>

        <div className="text-5xl mb-2">🎟️</div>
        <h2 className="font-display text-3xl text-[#ffe066] tracking-widest mb-2">Buy Tickets</h2>
        <p className="text-gray-400 text-sm font-body mb-7 leading-relaxed">
          1 Ticket = <strong className="text-[#ffe066]">1 USDC</strong><br />
          Dùng để vào chơi mỗi game
        </p>

        {/* Qty selector */}
        <div className="flex items-center justify-center gap-5 mb-5">
          <button
            onClick={() => changeQty(-1)}
            className="w-11 h-11 rounded-full border-2 border-[#ffe066]/35 bg-[#ffe066]/8 text-[#ffe066] text-2xl font-black hover:bg-[#ffe066]/20 hover:scale-110 transition-all"
          >−</button>
          <span className="font-display text-5xl text-white min-w-[48px] tracking-widest">{qty}</span>
          <button
            onClick={() => changeQty(1)}
            className="w-11 h-11 rounded-full border-2 border-[#ffe066]/35 bg-[#ffe066]/8 text-[#ffe066] text-2xl font-black hover:bg-[#ffe066]/20 hover:scale-110 transition-all"
          >+</button>
        </div>

        <div className="text-gray-400 text-sm font-body mb-6">
          Tổng: <strong className="text-green-400 text-base">{qty} USDC</strong>
        </div>

        {status && <p className="text-yellow-400 text-xs font-body mb-3 animate-pulse">{status}</p>}

        <button
          onClick={confirmBuy}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[#ffe066] to-[#ffa825] text-[#0a0a1e] font-body font-black text-base rounded-2xl hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,168,37,0.45)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '⏳ Đang xử lý…' : '🔗 Xác nhận & Thanh toán'}
        </button>

        <p className="text-[#556] text-xs font-body mt-4 leading-relaxed">
          Mạng: ARC Testnet · USDC native<br />
          <a href="https://faucet.circle.com" target="_blank" className="text-green-400 hover:underline">
            Nhận USDC testnet miễn phí →
          </a>
        </p>
      </div>
    </div>
  );
}
