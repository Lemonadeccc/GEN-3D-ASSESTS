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

// 构建连接器数组 - 只支持MetaMask，优化连接方式
const connectors = [
  // MetaMask - 专用连接器（优先使用，支持移动端和深度链接）
  metaMask({
    dappMetadata: {
      name: 'GEN-3D-ASSETS', 
      url: getAppUrl(),
      iconUrl: `${getAppUrl()}/favicon.ico`,
    },
  }),
  // 通用注入钱包连接器（作为备选，只在确认是MetaMask时使用）
  injected({
    shimDisconnect: true,
  }),
];

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