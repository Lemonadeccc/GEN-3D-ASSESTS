'use client';

import { createConfig } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { http } from 'viem';
import { metaMask, walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

// 获取环境变量
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA || 'https://sepolia.drpc.org';

// 构建连接器数组
const connectors = [
  // 首先添加injected connector作为MetaMask的首选方式
  injected({
    target: 'metaMask',
  }),
  // 保留metaMask connector作为备选
  metaMask({
    dappMetadata: {
      name: 'GEN-3D-ASSETS',
      url: 'http://localhost:3000',
    },
  }),
];

// 只有在有效的ProjectId时才添加WalletConnect
if (projectId && projectId !== 'development_project_id_placeholder') {
  connectors.push(
    walletConnect({ 
      projectId,
      metadata: {
        name: 'GEN-3D-ASSETS',
        description: 'AI-powered 3D NFT Platform',
        url: 'http://localhost:3000',
        icons: ['http://localhost:3000/favicon.ico'],
      },
    })
  );
}

// 添加Coinbase Wallet
connectors.push(
  coinbaseWallet({
    appName: 'GEN-3D-ASSETS',
    appLogoUrl: 'http://localhost:3000/favicon.ico',
  })
);

export const config = createConfig({
  chains: [sepolia, hardhat],
  connectors,
  transports: {
    [sepolia.id]: http(sepoliaRpcUrl),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}