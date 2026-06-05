// components/wallet/WalletConnect.tsx
// Port UI từ index.html + wallet.js: multi-wallet picker modal
'use client';
import { useWallet, detectProviders, WALLET_ICONS } from '@/hooks/useWallet';
import { useState } from 'react';

export default function WalletConnect() {
  const { isConnected, shortAddress, connect, connectWithProvider, disconnect, showPicker, setShowPicker } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  const providers = showPicker ? detectProviders() : [];

  return (
    <>
      {/* Main button */}
      {isConnected ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(v => !v)}
            className="px-4 py-2 rounded-full border border-green-500/40 bg-green-500/10 text-green-400 text-sm font-bold font-body hover:bg-green-500/20 transition-colors whitespace-nowrap"
          >
            ✅ {shortAddress}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-[#12121e] border border-white/10 rounded-xl py-1 shadow-xl z-50">
              <button
                onClick={() => { disconnect(); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
              >
                🔌 Ngắt kết nối
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={connect}
          className="px-4 py-2 rounded-full border border-white/20 bg-white/7 text-white text-sm font-bold font-body hover:bg-white/13 transition-colors whitespace-nowrap"
        >
          🔗 Connect Wallet
        </button>
      )}

      {/* Multi-wallet picker modal */}
      {showPicker && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowPicker(false); }}
        >
          <div className="bg-[#1a1a2e] border border-white/20 rounded-2xl p-6 min-w-[320px] max-w-[90vw] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white text-lg font-bold font-body">Chọn ví của bạn</span>
              <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="flex flex-col gap-2">
              {providers.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-2">
                  Không tìm thấy ví EVM.{' '}
                  <a href="https://metamask.io" target="_blank" className="text-purple-400 hover:underline">Cài MetaMask</a>
                </div>
              ) : providers.map(({ provider, label }) => (
                <button
                  key={label}
                  onClick={() => { setShowPicker(false); connectWithProvider(provider); }}
                  className="flex items-center gap-3 bg-[#252547] border border-white/20 rounded-xl px-4 py-3 text-white text-sm font-medium hover:bg-[#2e2e60] hover:border-purple-400/60 transition-all text-left"
                >
                  <span className="text-2xl">{WALLET_ICONS[label] ?? '💼'}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
