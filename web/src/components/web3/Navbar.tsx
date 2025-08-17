'use client';

import { ConnectKitButton } from 'connectkit';
import { useAccount, useDisconnect } from 'wagmi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, Store, User, Home, Palette, Wallet, LogOut, Settings, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 缓存导航配置以避免重新渲染
  const navigation = useMemo(() => [
    { name: '首页', href: '/', icon: Home },
    { name: '生成', href: '/generate', icon: Sparkles },
    { name: 'NFT', href: '/nft', icon: Coins },
    { name: '市场', href: '/marketplace', icon: Store },
    { name: '我的', href: '/profile', icon: User },
  ], []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo 区域 */}
        <div className="mr-6 flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">3D NFT</span>
              <span className="text-xs text-muted-foreground -mt-1">Generator</span>
            </div>
          </Link>
        </div>

        {/* 导航菜单 */}
        <div className="flex flex-1 items-center justify-between">
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-9 px-3 text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-3">
            {/* 测试页面链接 */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/test">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  测试
                </Button>
              </Link>
              <Link href="/api-test">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  API测试
                </Button>
              </Link>
            </div>

            {/* 状态指示器 */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <div className={cn(
                  "mr-1 h-2 w-2 rounded-full",
                  isConnected ? "bg-green-500" : "bg-gray-500"
                )}></div>
                {isConnected ? "已连接" : "未连接"}
              </Badge>
            </div>

            {/* 钱包连接 */}
            {isConnected && address ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 px-4 font-medium flex items-center space-x-2">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">{formatAddress(address)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">钱包地址</p>
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
                    <Button 
                      onClick={show} 
                      disabled={isConnecting}
                      variant="outline" 
                      size="sm"
                      className="h-9 px-4 font-medium flex items-center space-x-2"
                    >
                      <Wallet className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {isConnecting ? '连接中...' : '连接钱包'}
                      </span>
                    </Button>
                  );
                }}
              </ConnectKitButton.Custom>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}