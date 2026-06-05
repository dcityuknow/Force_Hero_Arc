// contracts/ticketSystem.ts
// Port chính xác từ wallet.js — raw eth_call / eth_sendTransaction
// Dùng function selectors thủ công giống wallet.js gốc (không qua ABI decode)

import {
  TICKET_CONTRACT_ADDR, USDC_ADDRESS,
  SELECTORS, USDC_DECIMALS, ARC_CHAIN_ID,
  ARC_CHAIN_ID_HEX, ARC_RPC_URL, ARC_EXPLORER_URL,
} from '@/lib/constants';

// ── ABI encoders (port từ wallet.js) ────────────────────────

function padAddress(addr: string): string {
  return addr.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}
function padUint256(val: bigint): string {
  return val.toString(16).padStart(64, '0');
}

export function encodeApprove(spender: string, amountWei: bigint): string {
  return SELECTORS.approve + padAddress(spender) + padUint256(amountWei);
}
export function encodeBuyTickets(quantity: number): string {
  return SELECTORS.buyTickets + padUint256(BigInt(quantity));
}
export function encodeUseTickets(quantity: number): string {
  return SELECTORS.useTickets + padUint256(BigInt(quantity));
}
export function encodeUserTickets(account: string): string {
  return SELECTORS.userTickets + padAddress(account);
}

// ── Low-level provider call ──────────────────────────────────

function getProvider(): (typeof window)['ethereum'] | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

async function waitForReceipt(txHash: string, maxAttempts = 30): Promise<void> {
  const provider = getProvider();
  if (!provider) throw new Error('No provider');
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      const receipt = await (provider as { request: (args: { method: string; params?: unknown[] }) => Promise<{ status: string | number } | null> }).request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      if (receipt) {
        if (receipt.status === '0x1' || receipt.status === 1) return;
        throw new Error('Transaction reverted on-chain');
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('reverted')) throw e;
    }
  }
  throw new Error(`Transaction timeout — explorer: ${ARC_EXPLORER_URL}`);
}

// ── Switch to ARC Testnet (port từ wallet.js switchToARC) ────

export async function switchToARC(): Promise<void> {
  const provider = getProvider();
  if (!provider) return;
  try {
    await (provider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_CHAIN_ID_HEX }],
    });
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 4902) {
      await (provider as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: ARC_CHAIN_ID_HEX,
          chainName: 'ARC Testnet',
          nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
          rpcUrls: [ARC_RPC_URL],
          blockExplorerUrls: [ARC_EXPLORER_URL],
        }],
      });
    } else {
      throw e;
    }
  }
}

// ── Read ticket balance on-chain (port getTicketsOnChain) ────

export async function getTicketBalanceOnChain(address: string): Promise<number> {
  const provider = getProvider();
  if (!provider || !address) return 0;
  try {
    const result = await (provider as { request: (args: { method: string; params?: unknown[] }) => Promise<string> }).request({
      method: 'eth_call',
      params: [{ to: TICKET_CONTRACT_ADDR, data: encodeUserTickets(address) }, 'latest'],
    });
    return Number(BigInt(result));
  } catch {
    return 0;
  }
}

// ── Buy tickets: approve → buyTickets (port buyTickets) ──────

export async function buyTicketsOnChain(
  address: string,
  quantity: number,
  onStatus?: (msg: string) => void,
): Promise<boolean> {
  const provider = getProvider();
  if (!provider || !address) return false;

  const totalCost = BigInt(quantity) * BigInt(10 ** USDC_DECIMALS);

  const send = (to: string, data: string, gas?: string) =>
    (provider as { request: (args: { method: string; params?: unknown[] }) => Promise<string> }).request({
      method: 'eth_sendTransaction',
      params: [{ from: address, to, data, ...(gas ? { gas } : {}) }],
    });

  try {
    onStatus?.('🔐 Bước 1/2: Phê duyệt USDC…');
    const approveTx = await send(USDC_ADDRESS, encodeApprove(TICKET_CONTRACT_ADDR, totalCost));
    onStatus?.('⏳ Đang chờ xác nhận approve…');
    await waitForReceipt(approveTx);
    onStatus?.('✅ Approve thành công!');

    onStatus?.('🎟️ Bước 2/2: Mua vé on-chain…');
    const buyTx = await send(TICKET_CONTRACT_ADDR, encodeBuyTickets(quantity), '0xC3500');
    onStatus?.('⏳ Đang chờ xác nhận mua vé…');
    await waitForReceipt(buyTx);
    onStatus?.(`🎟️ Mua thành công ${quantity} ticket!`);
    return true;
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 4001) {
      onStatus?.('❌ Giao dịch bị huỷ.');
    } else {
      onStatus?.('❌ Lỗi: ' + ((e as Error).message ?? 'unknown'));
    }
    return false;
  }
}

// ── Use 1 ticket on-chain (port useTicket) ───────────────────

export async function useTicketOnChain(address: string): Promise<boolean> {
  const provider = getProvider();
  if (!provider || !address) return false;
  try {
    const txHash = await (provider as { request: (args: { method: string; params?: unknown[] }) => Promise<string> }).request({
      method: 'eth_sendTransaction',
      params: [{ from: address, to: TICKET_CONTRACT_ADDR, data: encodeUseTickets(1), gas: '0x186A0' }],
    });
    await waitForReceipt(txHash);
    return true;
  } catch {
    return false;
  }
}

export { ARC_CHAIN_ID };
