'use client';

import { ConnectKitButton } from 'connectkit';
import { useAccount, useDisconnect } from 'wagmi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, Settings, Coins, User, ToggleLeft, ToggleRight } from 'lucide-react';

interface TNavigationProps {
  onToggleLayout?: () => void;
  useNewLayout?: boolean;
}

export function TNavigation({ onToggleLayout, useNewLayout = false }: TNavigationProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="w-full flex justify-between items-center">
      {/* 左侧品牌区域 */}
      <div className="flex gap-16 items-center anim-b">
        <h1 className="text-4xl font-bold">3D NFT GENERATOR</h1>
        <span className="text-neutral-700 text-sm">
          AI-Powered<br />
          NFT Platform
        </span>
      </div>

      {/* 右侧导航和钱包区域 */}
      <div className="flex gap-6 items-center anim-b opacity-0 ![animation-delay:100ms]">
        {/* 布局切换按钮 */}
        {onToggleLayout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLayout}
            className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            {useNewLayout ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {useNewLayout ? '原版' : 'T设计'}
          </Button>
        )}

        {/* 导航按钮组 */}
        <div className="flex gap-4 items-center">
          <Link href="/generate">
            <span className="cursor-pointer hover:text-gray-600 transition-colors px-3 py-1 rounded hover:bg-white/20">
              GENERATE
            </span>
          </Link>
          <Link href="/nft">
            <span className="cursor-pointer hover:text-gray-600 transition-colors px-3 py-1 rounded hover:bg-white/20">
              NFT
            </span>
          </Link>
          <Link href="/marketplace">
            <span className="cursor-pointer hover:text-gray-600 transition-colors px-3 py-1 rounded hover:bg-white/20">
              MARKET
            </span>
          </Link>
        </div>
        
        {/* 钱包连接区域 */}
        {isConnected && address ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="font-medium flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>{formatAddress(address)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">我的钱包</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {formatAddress(address)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/nft" className="flex items-center">
                  <Coins className="mr-2 h-4 w-4" />
                  <span>我的 NFT</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>个人中心</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>设置</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => disconnect()}
                className="flex items-center text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>断开连接</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ConnectKitButton.Custom>
            {({ isConnected, isConnecting, show, truncatedAddress, ensName }) => {
              return (
                <div className="bg-neutral-900 rounded-full flex items-center gap-2 p-2">
                  <span className="text-neutral-100 pl-2 cursor-pointer" onClick={show}>
                    {isConnecting ? '连接中...' : '连接钱包'}
                  </span>
                  <div 
                    className="flex p-2 rounded-full bg-neutral-100 items-center justify-center size-8 cursor-pointer hover:bg-neutral-200 transition-colors"
                    onClick={show}
                  >
                    <Wallet className="h-4 w-4 text-neutral-900" />
                  </div>
                </div>
              );
            }}
          </ConnectKitButton.Custom>
        )}
      </div>
    </div>
  );
}