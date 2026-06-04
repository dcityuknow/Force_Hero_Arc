// lib/wagmiConfig.ts
import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'Force Hero' }),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
    [baseSepolia.id]: http(),
  },
});
