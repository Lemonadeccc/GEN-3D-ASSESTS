'use client';

import { Button } from '@/components/ui/button';
import { Wallet, Settings } from 'lucide-react';

export function HeaderActions() {
  const handleWalletConnect = () => {
    // TODO: 实现钱包连接逻辑
    console.log('Connect wallet clicked');
  };

  const handleSettings = () => {
    // TODO: 实现设置功能
    console.log('Settings clicked');
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleWalletConnect}
      >
        <Wallet className="h-4 w-4 mr-2" />
        连接钱包
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleSettings}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}