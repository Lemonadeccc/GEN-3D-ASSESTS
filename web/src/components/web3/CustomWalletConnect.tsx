'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Wallet, 
  Chrome, 
  Smartphone, 
  ArrowRight, 
  ExternalLink,
  Coins,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomWalletConnectProps {
  variant?: 'default' | 'new-design';
  className?: string;
}

export function CustomWalletConnect({ 
  variant = 'default', 
  className = '' 
}: CustomWalletConnectProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showOtherWallets, setShowOtherWallets] = useState(false);
  const [prevConnected, setPrevConnected] = useState(false);
  
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending, error } = useConnect();

  // 监听连接状态变化
  useEffect(() => {
    if (isConnected && !prevConnected && address) {
      const walletName = connector?.name || '钱包';
      toast.success(`${walletName} 连接成功！`, {
        description: `地址: ${formatAddress(address)}`,
        duration: 3000,
      });
      setShowConnectDialog(false);
      setShowOtherWallets(false);
    }
    setPrevConnected(isConnected);
  }, [isConnected, prevConnected, address, connector?.name]);

  // 监听连接错误
  useEffect(() => {
    if (error) {
      toast.error('连接失败', {
        description: error.message,
        duration: 4000,
      });
    }
  }, [error]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = async (connectorToUse: any) => {
    try {
      await connect({ connector: connectorToUse });
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info('钱包已断开连接');
  };

  // 获取连接器
  const metaMaskConnector = connectors.find(c => c.name === 'MetaMask');
  const injectedConnector = connectors.find(c => c.name === 'Injected');
  const walletConnectConnector = connectors.find(c => c.name === 'WalletConnect');
  const coinbaseConnector = connectors.find(c => c.name === 'Coinbase Wallet');
  
  // 其他钱包连接器
  const otherConnectors = connectors.filter(c => 
    !['MetaMask', 'Injected', 'WalletConnect'].includes(c.name)
  );

  // 已连接状态
  if (isConnected && address) {
    if (variant === 'new-design') {
      return (
        <div className="bg-neutral-900 rounded-full flex items-center gap-2 p-2 hover:bg-neutral-800 transition-colors cursor-pointer">
          <span className="text-neutral-100 pl-2">
            {formatAddress(address)}
          </span>
          <div className="flex p-2 rounded-full bg-green-100 items-center justify-center size-8">
            <Wallet className="h-4 w-4 text-green-600" />
          </div>
        </div>
      );
    }

    return (
      <Button variant="outline" size="sm" className="font-medium flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
        <span>{formatAddress(address)}</span>
      </Button>
    );
  }

  // 未连接状态
  return (
    <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
      <DialogTrigger asChild>
        {variant === 'new-design' ? (
          <div className="bg-neutral-900 rounded-full flex items-center gap-2 p-2 hover:bg-neutral-800 transition-colors cursor-pointer">
            <span className="text-neutral-100 pl-2 hover:text-white transition-colors">
              {isPending ? '连接中...' : '连接钱包'}
            </span>
            <div className="flex p-2 rounded-full bg-neutral-100 items-center justify-center size-8 hover:bg-neutral-200 transition-colors">
              {isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent"></div>
              ) : (
                <Wallet className="h-4 w-4 text-neutral-900" />
              )}
            </div>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            disabled={isPending}
            className={`h-9 px-4 font-medium flex items-center space-x-2 ${className}`}
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isPending ? '连接中...' : '连接钱包'}
            </span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        {!showOtherWallets ? (
          <>
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-2xl font-bold">连接钱包</DialogTitle>
              <DialogDescription className="text-base">
                选择您的首选钱包连接方式
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* MetaMask 选项 */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  推荐钱包
                </h3>
                
                {/* MetaMask 浏览器插件 */}
                {injectedConnector && (
                  <button
                    onClick={() => handleConnect(injectedConnector)}
                    disabled={isPending}
                    className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <Chrome className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">MetaMask</div>
                          <div className="text-sm text-muted-foreground">浏览器扩展</div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                )}

                {/* MetaMask 移动端 */}
                {metaMaskConnector && (
                  <button
                    onClick={() => handleConnect(metaMaskConnector)}
                    disabled={isPending}
                    className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">MetaMask</div>
                          <div className="text-sm text-muted-foreground">移动端 & WalletConnect</div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                )}

                {/* WalletConnect */}
                {walletConnectConnector && (
                  <button
                    onClick={() => handleConnect(walletConnectConnector)}
                    disabled={isPending}
                    className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <Coins className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">WalletConnect</div>
                          <div className="text-sm text-muted-foreground">扫码连接多种钱包</div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                )}
              </div>

              {/* 其他钱包选项 */}
              {otherConnectors.length > 0 && (
                <div className="pt-4 border-t">
                  <button
                    onClick={() => setShowOtherWallets(true)}
                    className="w-full p-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    查看其他钱包选项
                    <ExternalLink className="h-4 w-4 ml-2 inline" />
                  </button>
                </div>
              )}

              {/* 安全提示 */}
              <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground mb-1">安全提示</div>
                    <div className="text-muted-foreground">
                      连接钱包即表示您同意我们的服务条款。请确保使用官方钱包应用，保护您的资产安全。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-2xl font-bold">其他钱包</DialogTitle>
              <DialogDescription className="text-base">
                选择您的钱包
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3">
              {otherConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{connector.name}</div>
                        <div className="text-sm text-muted-foreground">连接 {connector.name}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => setShowOtherWallets(false)}
                className="w-full p-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← 返回主要选项
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}