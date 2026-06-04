// hooks/useTickets.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getTicketBalance } from '@/contracts/ticketSystem';
import { getUSDCBalance } from '@/contracts/usdc';
import { formatUnits } from 'viem';
import { TICKET_DECIMALS } from '@/lib/constants';

export function useTickets() {
  const { address, isConnected } = useAccount();

  const {
    data: ticketBalance,
    isLoading: isLoadingTickets,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ['tickets', address],
    queryFn: () => getTicketBalance(address!),
    enabled: !!address && isConnected,
    refetchInterval: 15_000,
  });

  const {
    data: usdcBalance,
    isLoading: isLoadingUSDC,
  } = useQuery({
    queryKey: ['usdc', address],
    queryFn: () => getUSDCBalance(address!),
    enabled: !!address && isConnected,
    refetchInterval: 30_000,
  });

  return {
    ticketBalance: ticketBalance ?? 0n,
    ticketBalanceFormatted: ticketBalance?.toString() ?? '0',
    usdcBalance: usdcBalance ?? 0n,
    usdcBalanceFormatted: usdcBalance
      ? formatUnits(usdcBalance, TICKET_DECIMALS)
      : '0',
    isLoading: isLoadingTickets || isLoadingUSDC,
    refetchTickets,
  };
}
