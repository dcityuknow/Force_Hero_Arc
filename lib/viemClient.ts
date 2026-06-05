// lib/viemClient.ts
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { arcTestnet } from './wagmiConfig';

export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
});

export function getWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return createWalletClient({
    chain: arcTestnet,
    transport: custom(window.ethereum as Parameters<typeof custom>[0]),
  });
}
