// types/global.d.ts — Extend Window with EIP-1193 provider
interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeAllListeners?: (event: string) => void;
  providers?: EIP1193Provider[];
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

interface Window {
  ethereum?: EIP1193Provider;
  phantom?: { ethereum?: EIP1193Provider };
  coinbaseWalletExtension?: EIP1193Provider;
  trustwallet?: EIP1193Provider;
  okxwallet?: EIP1193Provider;
  bitkeep?: { ethereum?: EIP1193Provider };
  rabby?: EIP1193Provider;
}
