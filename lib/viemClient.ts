// lib/viemClient.ts
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from './constants';

const chain = DEFAULT_CHAIN_ID === SUPPORTED_CHAINS.BASE ? base : baseSepolia;

export const publicClient = createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

// Wallet client — only usable client-side (window.ethereum)
export function getWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });
}
