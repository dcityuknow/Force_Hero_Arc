// hooks/useTickets.ts
'use client';
import { useWallet } from './useWallet';
import { buyTicketsOnChain, useTicketOnChain, getTicketBalanceOnChain } from '@/contracts/ticketSystem';
import { useCallback } from 'react';

export function useTickets() {
  const { address, ticketBalance, refreshTickets, showToast } = useWallet();

  const buyTickets = useCallback(async (quantity: number): Promise<boolean> => {
    if (!address) return false;
    const ok = await buyTicketsOnChain(address, quantity, showToast);
    if (ok) await refreshTickets();
    return ok;
  }, [address, showToast, refreshTickets]);

  const useTicket = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    const count = await getTicketBalanceOnChain(address);
    if (count < 1) return false;
    const ok = await useTicketOnChain(address);
    if (ok) await refreshTickets();
    return ok;
  }, [address, refreshTickets]);

  return {
    ticketBalance,
    buyTickets,
    useTicket,
    refreshTickets,
  };
}
