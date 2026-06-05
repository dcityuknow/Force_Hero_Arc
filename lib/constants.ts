// lib/constants.ts
// Chain: ARC Testnet (Chain ID 5042002 = 0x4cef52)

export const ARC_CHAIN_ID      = 5042002;
export const ARC_CHAIN_ID_HEX  = '0x4cef52' as const;
export const ARC_RPC_URL       = 'https://rpc.testnet.arc.network';
export const ARC_EXPLORER_URL  = 'https://testnet.arcscan.app';

export const USDC_ADDRESS         = '0x3600000000000000000000000000000000000000' as `0x${string}`;
export const TREASURY_ADDRESS     = '0x4cd1d1b157f943feb2bebf2d36770ac3346e1128' as `0x${string}`;
export const TICKET_CONTRACT_ADDR = '0x4698fa79738754B360E9a203E3e416CC8F680c92' as `0x${string}`;

export const USDC_DECIMALS    = 6;
export const TICKET_PRICE_USDC = 1; // 1 USDC per ticket

// Function selectors (ABI-encoded, from wallet.js)
export const SELECTORS = {
  approve:      '0x095ea7b3',
  buyTickets:   '0x8f7a3d79',
  useTickets:   '0x8f3b9b1c',
  userTickets:  '0x83a26201',
} as const;
