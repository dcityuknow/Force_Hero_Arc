// hooks/useWallet.ts
// Port wallet.js: detectProviders, multi-wallet picker, ARC Testnet auto-switch
'use client';
import { useState, useEffect, useCallback } from 'react';
import { switchToARC, getTicketBalanceOnChain } from '@/contracts/ticketSystem';
import { ARC_CHAIN_ID } from '@/lib/constants';

export type ProviderEntry = { provider: EthereumProvider; label: string };

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeAllListeners?: (event: string) => void;
  providers?: EthereumProvider[];
  isMetaMask?: boolean;
  isPhantom?: boolean;
  isCoinbaseWallet?: boolean;
  isBraveWallet?: boolean;
  isTrust?: boolean;
  isOKExWallet?: boolean;
  isOkxWallet?: boolean;
  isBitKeep?: boolean;
  isRabby?: boolean;
  isTokenPocket?: boolean;
  isImToken?: boolean;
}

function guessWalletName(p: EthereumProvider): string {
  if (p.isPhantom)          return 'Phantom';
  if (p.isMetaMask)         return 'MetaMask';
  if (p.isCoinbaseWallet)   return 'Coinbase Wallet';
  if (p.isBraveWallet)      return 'Brave Wallet';
  if (p.isTrust)            return 'Trust Wallet';
  if (p.isOKExWallet || p.isOkxWallet) return 'OKX Wallet';
  if (p.isBitKeep)          return 'Bitget Wallet';
  if (p.isRabby)            return 'Rabby';
  if (p.isTokenPocket)      return 'TokenPocket';
  if (p.isImToken)          return 'imToken';
  return 'EVM Wallet';
}

export function detectProviders(): ProviderEntry[] {
  if (typeof window === 'undefined') return [];
  const seen = new Set<EthereumProvider>();
  const list: ProviderEntry[] = [];

  function add(p: EthereumProvider | undefined | null, label?: string) {
    if (!p || seen.has(p)) return;
    seen.add(p);
    list.push({ provider: p, label: label ?? guessWalletName(p) });
  }

  const eth = (window as unknown as { ethereum?: EthereumProvider; phantom?: { ethereum?: EthereumProvider }; coinbaseWalletExtension?: EthereumProvider; trustwallet?: EthereumProvider; okxwallet?: EthereumProvider; bitkeep?: { ethereum?: EthereumProvider }; rabby?: EthereumProvider }).ethereum;
  if (eth) {
    if (Array.isArray(eth.providers) && eth.providers.length > 0) {
      eth.providers.forEach(p => add(p));
    } else {
      add(eth);
    }
  }

  const win = window as unknown as {
    phantom?: { ethereum?: EthereumProvider };
    coinbaseWalletExtension?: EthereumProvider;
    trustwallet?: EthereumProvider;
    okxwallet?: EthereumProvider;
    bitkeep?: { ethereum?: EthereumProvider };
    rabby?: EthereumProvider;
  };

  if (win.phantom?.ethereum)       add(win.phantom.ethereum, 'Phantom');
  if (win.coinbaseWalletExtension) add(win.coinbaseWalletExtension, 'Coinbase Wallet');
  if (win.trustwallet)             add(win.trustwallet, 'Trust Wallet');
  if (win.okxwallet)               add(win.okxwallet, 'OKX Wallet');
  if (win.bitkeep?.ethereum)       add(win.bitkeep.ethereum, 'Bitget Wallet');
  if (win.rabby)                   add(win.rabby, 'Rabby');

  return list;
}

export const WALLET_ICONS: Record<string, string> = {
  'MetaMask': '🦊', 'Phantom': '👻', 'Coinbase Wallet': '🔵',
  'Brave Wallet': '🦁', 'Trust Wallet': '🛡️', 'OKX Wallet': '⭕',
  'Bitget Wallet': '💎', 'Rabby': '🐇', 'TokenPocket': '📱',
  'imToken': '🔑', 'EVM Wallet': '💼',
};

export function useWallet() {
  const [address, setAddress]             = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<EthereumProvider | null>(null);
  const [ticketBalance, setTicketBalance] = useState(0);
  const [isConnecting, setIsConnecting]   = useState(false);
  const [showPicker, setShowPicker]       = useState(false);
  const [toastMsg, setToastMsg]           = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  }, []);

  const refreshTickets = useCallback(async (addr?: string) => {
    const a = addr ?? address;
    if (!a) return 0;
    const count = await getTicketBalanceOnChain(a);
    setTicketBalance(count);
    return count;
  }, [address]);

  const connectWithProvider = useCallback(async (provider: EthereumProvider) => {
    setIsConnecting(true);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      const addr = accounts[0];
      setAddress(addr);
      setActiveProvider(provider);
      // Make global for legacy calls
      (window as unknown as { ethereum: EthereumProvider }).ethereum = provider;
      await switchToARC();
      await refreshTickets(addr);

      // Attach events
      provider.on?.('accountsChanged', async (accs) => {
        const a = (accs as string[])[0] ?? null;
        setAddress(a);
        if (a) await refreshTickets(a);
        else setTicketBalance(0);
      });
      provider.on?.('chainChanged', () => window.location.reload());

      return addr;
    } catch (e: unknown) {
      if ((e as { code?: number }).code !== 4001) {
        showToast('❌ Lỗi kết nối ví: ' + ((e as Error).message ?? 'unknown'));
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [refreshTickets, showToast]);

  const connect = useCallback(() => {
    const providers = detectProviders();
    if (providers.length === 0) {
      showToast('Không tìm thấy ví EVM nào. Hãy cài MetaMask!');
      return;
    }
    if (providers.length === 1) {
      connectWithProvider(providers[0].provider);
      return;
    }
    setShowPicker(true);
  }, [connectWithProvider, showToast]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setActiveProvider(null);
    setTicketBalance(0);
    showToast('🔌 Đã ngắt kết nối ví.');
  }, [showToast]);

  // Auto-restore session on mount
  useEffect(() => {
    const providers = detectProviders();
    if (providers.length === 0) return;
    const p = providers[0].provider;
    (p.request({ method: 'eth_accounts' }) as Promise<string[]>).then(async (accounts) => {
      if (accounts.length) {
        const addr = accounts[0];
        setAddress(addr);
        setActiveProvider(p);
        (window as unknown as { ethereum: EthereumProvider }).ethereum = p;
        try { await switchToARC(); } catch { /* ignore */ }
        await refreshTickets(addr);
        p.on?.('accountsChanged', async (accs) => {
          const a = (accs as string[])[0] ?? null;
          setAddress(a);
          if (a) await refreshTickets(a);
          else setTicketBalance(0);
        });
        p.on?.('chainChanged', () => window.location.reload());
      }
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;
  const isConnected  = !!address;

  return {
    address,
    shortAddress,
    isConnected,
    isConnecting,
    ticketBalance,
    activeProvider,
    showPicker, setShowPicker,
    toastMsg,
    connect,
    connectWithProvider,
    disconnect,
    refreshTickets,
    showToast,
  };
}
