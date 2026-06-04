// lib/constants.ts

export const TICKET_PRICE_USDC = 1; // 1 USDC per ticket
export const TICKET_DECIMALS = 6; // USDC decimals

export const SUPPORTED_CHAINS = {
  BASE: 8453,
  BASE_SEPOLIA: 84532,
} as const;

export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? SUPPORTED_CHAINS.BASE);

export const CONTRACT_ADDRESSES = {
  [SUPPORTED_CHAINS.BASE]: {
    TICKET_SYSTEM: process.env.NEXT_PUBLIC_TICKET_SYSTEM_ADDRESS as `0x${string}`,
    USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS ?? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913') as `0x${string}`,
  },
  [SUPPORTED_CHAINS.BASE_SEPOLIA]: {
    TICKET_SYSTEM: process.env.NEXT_PUBLIC_TICKET_SYSTEM_ADDRESS as `0x${string}`,
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
  },
} as const;
