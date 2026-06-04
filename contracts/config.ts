// contracts/config.ts
import { CONTRACT_ADDRESSES, DEFAULT_CHAIN_ID } from '@/lib/constants';
import TicketSystemABI from './abi/TicketSystem.json';
import USDCABI from './abi/USDC.json';

const addresses = CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID as keyof typeof CONTRACT_ADDRESSES];

export const TICKET_SYSTEM_CONTRACT = {
  address: addresses.TICKET_SYSTEM,
  abi: TicketSystemABI,
} as const;

export const USDC_CONTRACT = {
  address: addresses.USDC,
  abi: USDCABI,
} as const;
