// lib/wagmiConfig.ts
// ARC Testnet — chain ID 5042002
import { http, createConfig } from 'wagmi';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';
import { defineChain } from 'viem';

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'ARC Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'Force Hero' }),
  ],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
});
