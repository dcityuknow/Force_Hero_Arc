// contracts/config.ts
import { USDC_ADDRESS, TICKET_CONTRACT_ADDR } from '@/lib/constants';
import TicketSystemABI from './abi/TicketSystem.json';
import USDCABI from './abi/USDC.json';

export const TICKET_SYSTEM_CONTRACT = {
  address: TICKET_CONTRACT_ADDR,
  abi: TicketSystemABI,
} as const;

export const USDC_CONTRACT = {
  address: USDC_ADDRESS,
  abi: USDCABI,
} as const;
