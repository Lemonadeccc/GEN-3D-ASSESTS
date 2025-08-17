'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { config } from '@/lib/wagmi/config';

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="auto"
          mode="light"
          options={{
            initialChainId: 0,
            walletConnectName: 'WalletConnect',
            hideQuestionMarkCTA: true,
            hideTooltips: true,
            hideRecentBadge: true,
            enforceSupportedChains: true,
            embedGoogleFonts: true,
            // 强制显示浏览器钱包优先
            walletConnectCTA: 'link',
            avoidLayoutShift: true,
            truncateLongENSAddress: true,
            // 禁用某些选项以简化UI
            hideNoWalletCTA: false,
            hideRecentBadge: true,
            disclaimer: (
              <div className="text-xs text-muted-foreground text-center">
                连接钱包即表示您同意服务条款
              </div>
            ),
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}