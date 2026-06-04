// hooks/useWallet.ts
'use client';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { DEFAULT_CHAIN_ID } from '@/lib/constants';
import { formatAddress } from '@/lib/utils';

export function useWallet() {
  const { address, isConnected, status } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== DEFAULT_CHAIN_ID;

  const handleSwitchNetwork = () => {
    switchChain({ chainId: DEFAULT_CHAIN_ID });
  };

  return {
    address,
    isConnected,
    isConnecting,
    status,
    connectors,
    connect,
    disconnect,
    isWrongNetwork,
    switchNetwork: handleSwitchNetwork,
    shortAddress: address ? formatAddress(address) : null,
  };
}
