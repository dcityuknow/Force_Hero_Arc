// contracts/usdc.ts
import { publicClient } from '@/lib/viemClient';
import { USDC_CONTRACT } from './config';

export async function getUSDCBalance(address: `0x${string}`): Promise<bigint> {
  const balance = await publicClient.readContract({
    ...USDC_CONTRACT,
    functionName: 'balanceOf',
    args: [address],
  });
  return balance as bigint;
}

export async function getUSDCAllowance(
  owner: `0x${string}`,
  spender: `0x${string}`
): Promise<bigint> {
  const allowance = await publicClient.readContract({
    ...USDC_CONTRACT,
    functionName: 'allowance',
    args: [owner, spender],
  });
  return allowance as bigint;
}
