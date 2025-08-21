'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TaskStatusResponse } from '@/lib/meshy/types';
import { useNFTMint } from '@/hooks/use-nft-mint';
import { useAccount } from 'wagmi';
import { ExternalLink, Wallet, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface NFTMintDialogProps {
  taskResult: TaskStatusResponse;
  trigger: React.ReactNode;
}

export function NFTMintDialog({ taskResult, trigger }: NFTMintDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [royaltyBps, setRoyaltyBps] = useState(250); // 2.5%
  const [isOpen, setIsOpen] = useState(false);

  const { isConnected } = useAccount();
  const { mintNFT, resetState, isLoading, currentStep, hash, isSuccess } = useNFTMint();

  const handleMint = async () => {
    if (!name.trim()) {
      return;
    }

    await mintNFT({
      name: name.trim(),
      description: description.trim(),
      taskResult,
      royaltyBps,
    });
  };

  const handleSuccess = () => {
    setIsOpen(false);
    setName('');
    setDescription('');
    setRoyaltyBps(250);
  };

  if (isSuccess) {
    setTimeout(handleSuccess, 2000);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>铸造 3D NFT</span>
          </DialogTitle>
        </DialogHeader>

        {!isConnected ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">请先连接钱包以铸造 NFT</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 模型信息 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">3D 模型</Label>
                <Badge variant="secondary">{taskResult.mode}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Task ID: {taskResult.id}
              </div>
              {taskResult.polycount && (
                <div className="text-sm text-muted-foreground">
                  多边形数: {taskResult.polycount.toLocaleString()}
                </div>
              )}
            </div>

            {/* NFT 信息表单 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">NFT 名称 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入 NFT 名称"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述您的 3D NFT..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="royalty">版税 (%)</Label>
                <Input
                  id="royalty"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={royaltyBps / 100}
                  onChange={(e) => setRoyaltyBps(Math.round(parseFloat(e.target.value) * 100))}
                  disabled={isLoading}
                />
                <div className="text-xs text-muted-foreground">
                  设置二次销售版税比例 (0-10%)
                </div>
              </div>
            </div>

            {/* 进度显示 */}
            {isLoading && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">铸造进度</span>
                  <span className="text-muted-foreground">{currentStep}</span>
                </div>
                
                {/* 步骤进度条 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>准备中</span>
                    <span>上传IPFS</span>
                    <span>发送交易</span>
                    <span>确认</span>
                  </div>
                  
                  {/* 动态进度条 */}
                  <Progress 
                    value={
                      currentStep.includes('准备') ? 25 :
                      currentStep.includes('IPFS') ? 50 :
                      currentStep.includes('发送交易') || currentStep.includes('等待钱包') ? 75 :
                      currentStep.includes('确认') ? 90 :
                      10
                    } 
                    className="w-full" 
                  />
                </div>
                
                {/* 提示信息 */}
                <div className="text-xs text-muted-foreground text-center">
                  {currentStep.includes('钱包') && (
                    <span className="text-orange-600">请在钱包中确认交易</span>
                  )}
                  {currentStep.includes('确认') && (
                    <span className="text-blue-600">交易正在区块链上确认，请稍候...</span>
                  )}
                  {currentStep.includes('IPFS') && (
                    <span>正在将元数据上传到IPFS...</span>
                  )}
                </div>
                
                {/* 取消铸造按钮 */}
                {isLoading && !currentStep.includes('确认') && (
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        resetState();
                        toast.info('已取消铸造');
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      取消铸造
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 成功状态 */}
            {isSuccess && hash && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">铸造成功！</span>
                </div>
                <div className="text-xs text-green-600 mb-2">
                  交易哈希: {hash.slice(0, 10)}...{hash.slice(-8)}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  查看交易详情
                </Button>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={handleMint}
                disabled={!name.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin 
  mr-2" />
                    铸造中...
                  </>
                ) : (
                  '铸造 NFT'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}