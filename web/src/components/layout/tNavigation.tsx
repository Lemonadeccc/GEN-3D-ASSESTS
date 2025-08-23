'use client';

import { CustomWalletConnect } from '@/components/web3/CustomWalletConnect';
import { useAccount, useDisconnect } from 'wagmi';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatedLogoCube } from '@/components/3d/AnimatedLogoCube';
import LogoErrorBoundary from '@/components/3d/LogoErrorBoundary';
import { useLogoAnimation } from '@/store/logoAnimationStore';
import { useGlobalLogoEvents } from '@/hooks/useLogoAnimation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut /*, Settings, Coins, User*/ } from 'lucide-react';
import { toast } from 'sonner';

export function TNavigation() {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const [isMounted, setIsMounted] = useState(false);
  
  // Logo动画状态
  const { setHoverState, setClickState } = useLogoAnimation();
  
  // 启用全局事件监听 - 临时禁用以排除SelectTrigger冲突
  // useGlobalLogoEvents();

  // 避免Hydration错误
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info('钱包已断开连接');
  };

  return (
    <div className="w-full flex justify-between items-center">
      {/* 左侧品牌区域 */}
      <div className="flex gap-4 items-center anim-b">
        <Link 
          href="/" 
          onMouseEnter={() => setHoverState(true)}
          onMouseLeave={() => setHoverState(false)}
          onClick={() => {
            setClickState(true);
            setTimeout(() => setClickState(false), 500);
          }}
        >
          <div className="w-20 h-20 cursor-pointer">
            {isMounted && (
              <LogoErrorBoundary>
                <Canvas 
                  camera={{ position: [0, 0, 6], fov: 50 }}
                  gl={{ alpha: true, antialias: true }}
                >
                  <ambientLight intensity={0.6} />
                  <pointLight position={[10, 10, 10]} intensity={0.3} />
                  <AnimatedLogoCube />
                </Canvas>
              </LogoErrorBoundary>
            )}
          </div>
        </Link>
        <span className="text-gray-400 text-sm">
          AI-Powered<br />
          NFT Platform
        </span>
      </div>

      {/* 右侧导航和钱包区域 */}
      <div className="flex gap-6 items-center anim-b opacity-0 ![animation-delay:100ms]">
        {/* 导航按钮组 */}
        <div className="flex gap-4 items-center">
          <Link href="/generate">
            <span className="cursor-pointer text-white hover:text-blue-400 transition-colors px-3 py-1 rounded hover:bg-gray-800/50">
              GENERATE
            </span>
          </Link>
          {/*
          <Link href="/nft">
            <span className="cursor-pointer text-white hover:text-blue-400 transition-colors px-3 py-1 rounded hover:bg-gray-800/50">
              NFT
            </span>
          </Link>
          <Link href="/marketplace">
            <span className="cursor-pointer text-white hover:text-blue-400 transition-colors px-3 py-1 rounded hover:bg-gray-800/50">
              MARKET
            </span>
          </Link>
          */}
        </div>
        
        {/* 钱包连接区域 */}
        {!isMounted ? (
          // 服务端渲染时显示加载状态，避免hydration错误
          <div className="bg-gray-800 rounded-full flex items-center gap-2 p-2 border border-gray-600">
            <span className="text-gray-400 pl-2">Loading...</span>
          </div>
        ) : isConnected && address ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="bg-gray-800 rounded-full flex items-center gap-2 p-2 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-600">
                <span className="text-white pl-2">
                  {formatAddress(address)}
                </span>
                <div className="flex p-2 rounded-full bg-blue-700 items-center justify-center size-8">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 w-full">
                  <p className="text-sm font-medium leading-none text-white">
                    {connector?.name || 'Wallet'}
                  </p>
                  {/* 地址右对齐并在到达右侧时才省略显示 */}
                  <p className="text-xs leading-none text-gray-400 w-full text-right truncate">
                    {address}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="bg-gray-600" />
              <DropdownMenuItem 
                onClick={handleDisconnect}
                className="flex items-center text-red-400 hover:bg-gray-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <CustomWalletConnect variant="new-design" />
        )}
      </div>
    </div>
  );
}
