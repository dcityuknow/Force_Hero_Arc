// components/wallet/WalletConnect.tsx
'use client';
import { useWallet } from '@/hooks/useWallet';
import { useState } from 'react';

export default function WalletConnect() {
  const { isConnected, shortAddress, connectors, connect, disconnect, isWrongNetwork, switchNetwork } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isWrongNetwork) {
    return (
      <button
        onClick={switchNetwork}
        className="px-4 py-2 rounded-lg bg-brand-red/20 border border-brand-red/50 text-brand-red text-sm font-bold font-body hover:bg-brand-red/30 transition-colors"
      >
        Wrong Network
      </button>
    );
  }

  if (isConnected && shortAddress) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="px-4 py-2 rounded-lg bg-brand-surface border border-brand-border text-white text-sm font-bold font-body hover:border-brand-accent/50 transition-colors"
        >
          {shortAddress}
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-36 bg-brand-surface border border-brand-border rounded-lg py-1 shadow-xl z-50">
            <button
              onClick={() => { disconnect(); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-brand-border transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown((v) => !v)}
        className="px-4 py-2 rounded-lg bg-brand-accent text-brand-dark text-sm font-bold font-body hover:bg-brand-accent/90 transition-colors"
      >
        Connect Wallet
      </button>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-border rounded-lg py-1 shadow-xl z-50">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => { connect({ connector }); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-brand-border transition-colors"
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
