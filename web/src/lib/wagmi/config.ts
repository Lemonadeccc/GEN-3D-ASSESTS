'use client';

import { createConfig } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { http } from 'viem';
import { metaMask, walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

// 获取环境变量
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA || 'https://sepolia.drpc.org';

// 动态获取应用URL
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // 服务端渲染时的默认值
  return process.env.NEXT_PUBLIC_APP_URL || 'https://gen3d.app';
};

// 构建连接器数组 - 支持MetaMask的多种连接方式
const connectors = [
  // MetaMask - 专用连接器（用于移动端和深度集成）
  metaMask({
    dappMetadata: {
      name: 'GEN-3D-ASSETS', 
      url: getAppUrl(),
      iconUrl: `${getAppUrl()}/favicon.ico`,
    },
  }),
  // 通用注入钱包连接器（用于浏览器插件）
  injected({
    shimDisconnect: true,
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
        url: getAppUrl(),
        icons: [`${getAppUrl()}/favicon.ico`],
      },
      showQrModal: true, // 启用二维码模态框
    })
  );
}

// 添加Coinbase Wallet
connectors.push(
  coinbaseWallet({
    appName: 'GEN-3D-ASSETS',
    appLogoUrl: `${getAppUrl()}/favicon.ico`,
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