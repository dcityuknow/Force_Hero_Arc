// contracts/ticketSystem.ts
import { publicClient, getWalletClient } from '@/lib/viemClient';
import { TICKET_SYSTEM_CONTRACT, USDC_CONTRACT } from './config';
import { parseUnits } from 'viem';
import { TICKET_PRICE_USDC, TICKET_DECIMALS } from '@/lib/constants';

export async function getTicketBalance(address: `0x${string}`): Promise<bigint> {
  const balance = await publicClient.readContract({
    ...TICKET_SYSTEM_CONTRACT,
    functionName: 'getTicketBalance',
    args: [address],
  });
  return balance as bigint;
}

export async function approveUSDC(amount: bigint): Promise<`0x${string}`> {
  const walletClient = getWalletClient();
  if (!walletClient) throw new Error('No wallet connected');
  const [account] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    ...USDC_CONTRACT,
    functionName: 'approve',
    args: [TICKET_SYSTEM_CONTRACT.address, amount],
    account,
  });
  return hash;
}

export async function buyTickets(ticketAmount: number): Promise<`0x${string}`> {
  const walletClient = getWalletClient();
  if (!walletClient) throw new Error('No wallet connected');
  const [account] = await walletClient.getAddresses();

  const usdcAmount = parseUnits(
    (ticketAmount * TICKET_PRICE_USDC).toString(),
    TICKET_DECIMALS
  );

  // First approve USDC spend
  await approveUSDC(usdcAmount);
  await publicClient.waitForTransactionReceipt({ hash: await approveUSDC(usdcAmount) });

  const hash = await walletClient.writeContract({
    ...TICKET_SYSTEM_CONTRACT,
    functionName: 'buyTickets',
    args: [BigInt(ticketAmount)],
    account,
  });
  return hash;
}
