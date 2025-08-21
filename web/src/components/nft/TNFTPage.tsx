'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNFTQuery } from '@/hooks/use-nft-query';
import { useAccount } from 'wagmi';
import {
  Coins,
  ExternalLink,
  Download,
  Share2,
  Palette,
  Wallet,
  Loader2,
  Package,
  ArrowRight,
  Upload,
  Sparkles
} from 'lucide-react';
import { NFTMintDialog } from '@/components/web3/NFTMintDialog';
import { NFTDebugTools } from '@/components/web3/NFTDebugTools';
import { storage } from '@/lib/storage';
import Link from 'next/link';

function TNFTCard({ nft }: { nft: any }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: nft.metadata.name,
        text: nft.metadata.description,
        url: window.location.href,
      });
    }
  };

  const handleDownload = () => {
    if (nft.metadata.modelUrl) {
      window.open(nft.metadata.modelUrl, '_blank');
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden bg-white/50 backdrop-blur-sm border-neutral-200">
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
        {nft.metadata.thumbnailUrl ? (
          <img
            src={nft.metadata.thumbnailUrl}
            alt={nft.metadata.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-neutral-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs bg-white/80 backdrop-blur-sm">
            #{nft.tokenId}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1 text-neutral-900">{nft.metadata.name}</CardTitle>
        {nft.metadata.description && (
          <p className="text-sm text-neutral-600 line-clamp-2">
            {nft.metadata.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* 属性标签 */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs border-neutral-300">
            {nft.metadata.artStyle}
          </Badge>
          <Badge variant="outline" className="text-xs border-neutral-300">
            {nft.metadata.mode === 1 ? 'Refine' : 'Preview'}
          </Badge>
          {nft.metadata.hasTexture && (
            <Badge variant="outline" className="text-xs border-neutral-300">
              Textured
            </Badge>
          )}
        </div>

        {/* 统计信息 */}
        {nft.metadata.polycount > 0 && (
          <div className="text-xs text-neutral-500">
            Polygons: {Number(nft.metadata.polycount).toLocaleString()}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="flex-1 border-neutral-300 hover:bg-neutral-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="flex-1 border-neutral-300 hover:bg-neutral-50"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Etherscan 链接 */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-xs hover:bg-neutral-50"
            onClick={() => {
              const url = `https://sepolia.etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`;
              window.open(url, '_blank');
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View on Etherscan
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-xs hover:bg-neutral-50"
            onClick={() => {
              // 添加到MetaMask的逻辑
              if (typeof window !== 'undefined' && window.ethereum) {
                window.ethereum.request({
                  method: 'wallet_watchAsset',
                  params: {
                    type: 'ERC721',
                    options: {
                      address: nft.contractAddress,
                      tokenId: nft.tokenId.toString(),
                    },
                  },
                });
              }
            }}
          >
            Add to MetaMask
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 显示可铸造的3D模型卡片
function MintableModelCard({ taskResult }: { taskResult: any }) {
  const handleDownload = () => {
    if (taskResult.model_urls?.obj) {
      window.open(taskResult.model_urls.obj, '_blank');
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden bg-white/50 backdrop-blur-sm border-neutral-200">
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
        {taskResult.thumbnail_url ? (
          <img
            src={taskResult.thumbnail_url}
            alt={`3D Model ${taskResult.id}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="h-16 w-16 text-neutral-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs bg-white/80 backdrop-blur-sm">
            Ready to Mint
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="text-xs bg-white/80 backdrop-blur-sm border-neutral-300">
            {taskResult.mode}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1 text-neutral-900">
          3D Model #{taskResult.id?.slice(-8)}
        </CardTitle>
        <p className="text-sm text-neutral-600 line-clamp-2">
          Generated 3D model ready for NFT minting
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* 模型信息 */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs border-neutral-300">
            {taskResult.art_style || 'Realistic'}
          </Badge>
          {taskResult.polycount && (
            <Badge variant="outline" className="text-xs border-neutral-300">
              {taskResult.polycount.toLocaleString()} poly
            </Badge>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          {/* 主要铸造按钮 */}
          <NFTMintDialog
            taskResult={taskResult}
            trigger={
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Mint as NFT
              </Button>
            }
          />
          
          {/* 辅助按钮 */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="flex-1 border-neutral-300 hover:bg-neutral-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-neutral-300 hover:bg-neutral-50"
              onClick={() => {
                if (navigator.share && taskResult.thumbnail_url) {
                  navigator.share({
                    title: `3D Model ${taskResult.id?.slice(-8)}`,
                    text: 'Check out this AI-generated 3D model!',
                    url: taskResult.thumbnail_url,
                  });
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TNFTPage() {
  const { isConnected, address } = useAccount();
  const { userNFTs, balance, totalSupply, isLoading } = useNFTQuery();
  const [mintableModels, setMintableModels] = useState<any[]>([]);

  // 从localStorage获取可铸造的模型
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastModel = storage.getLastSuccessfulModel();
      if (lastModel && lastModel.status === 'SUCCEEDED') {
        // 检查这个模型是否已经被铸造过NFT
        // 这里可以添加更复杂的逻辑来检查哪些模型已经铸造
        setMintableModels([lastModel]);
      }
    }
  }, []);

  // 清除已铸造的模型
  const removeMintableModel = (taskId: string) => {
    setMintableModels(prev => prev.filter(model => model.id !== taskId));
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center space-y-6 anim-b opacity-0">
          <div className="mx-auto w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center">
            <Wallet className="h-12 w-12 text-neutral-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-neutral-900">Connect Wallet</h1>
            <p className="text-neutral-600 max-w-md mx-auto">
              Connect your wallet to view and manage your 3D NFT collection
            </p>
          </div>
          <div className="text-neutral-500 text-sm">
            Please use the &quot;Connect Wallet&quot; button in the top navigation
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* 主标题区域 - 与首页风格一致 */}
      <div className="text-center space-y-4">
        <h1 className="text-[4rem] leading-[4rem] anim-r opacity-0 ![animation-delay:200ms] font-bold text-neutral-900">
          MY NFT COLLECTION
        </h1>
        <h2 className="text-[2rem] leading-[2rem] anim-r opacity-0 ![animation-delay:300ms] text-neutral-600">
          3D Digital Assets Portfolio
        </h2>
      </div>

      {/* 主要内容区域 */}
      <div className="flex gap-8 flex-1">
        {/* 左侧 33% - 统计信息 */}
        <div className="w-1/3 space-y-6 anim-b opacity-0 ![animation-delay:400ms]">
          {/* 我的 NFT */}
          <Card className="bg-white/50 backdrop-blur-sm border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">My NFTs</CardTitle>
              <Coins className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900">{balance}</div>
              <p className="text-xs text-neutral-500 mt-1">
                Total NFTs owned
              </p>
            </CardContent>
          </Card>

          {/* 可铸造模型 */}
          <Card className="bg-white/50 backdrop-blur-sm border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">Ready to Mint</CardTitle>
              <Upload className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900">{mintableModels.length}</div>
              <p className="text-xs text-neutral-500 mt-1">
                3D models ready for minting
              </p>
            </CardContent>
          </Card>

          {/* 我的创作 */}
          <Card className="bg-white/50 backdrop-blur-sm border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">My Creations</CardTitle>
              <Palette className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900">{userNFTs.length}</div>
              <p className="text-xs text-neutral-500 mt-1">
                3D models created
              </p>
            </CardContent>
          </Card>

          {/* 总发行量 */}
          <Card className="bg-white/50 backdrop-blur-sm border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-700">Total Supply</CardTitle>
              <Package className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900">{totalSupply}</div>
              <p className="text-xs text-neutral-500 mt-1">
                Platform total NFTs
              </p>
            </CardContent>
          </Card>

          {/* 创作新作品按钮 */}
          <Button asChild className="w-full bg-neutral-900 hover:bg-neutral-800">
            <Link href="/generate">
              <Palette className="mr-2 h-4 w-4" />
              Create New Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {/* NFT调试工具 */}
          <NFTDebugTools />
        </div>

        {/* 右侧 67% - 分为两个区域 */}
        <div className="w-2/3 space-y-6 anim-b opacity-0 ![animation-delay:500ms]">
          {/* 可铸造模型区域 */}
          {mintableModels.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">Ready to Mint</h2>
                <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                  {mintableModels.length} models
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mintableModels.map((model) => (
                  <MintableModelCard 
                    key={model.id} 
                    taskResult={model} 
                  />
                ))}
              </div>
              
              <div className="h-px bg-neutral-200"></div>
            </div>
          )}

          {/* 我的NFT作品区域 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">My NFT Collection</h2>
              <Badge variant="outline" className="border-neutral-300">
                {userNFTs.length} items
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-neutral-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-neutral-900">Loading...</h3>
                    <p className="text-neutral-600 max-w-md mx-auto">
                      Fetching your NFT collection
                    </p>
                  </div>
                </div>
              </div>
            ) : userNFTs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {userNFTs.map((nft) => (
                  <TNFTCard key={nft.tokenId} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-neutral-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-neutral-900">No NFTs Yet</h3>
                    <p className="text-neutral-600 max-w-md mx-auto">
                      {mintableModels.length > 0 
                        ? "Mint your generated 3D models above to create your first NFT"
                        : "Start creating your first 3D NFT artwork"
                      }
                    </p>
                  </div>
                  {mintableModels.length === 0 && (
                    <Button asChild className="bg-neutral-900 hover:bg-neutral-800">
                      <Link href="/generate">
                        <Palette className="mr-2 h-4 w-4" />
                        Start Creating
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}