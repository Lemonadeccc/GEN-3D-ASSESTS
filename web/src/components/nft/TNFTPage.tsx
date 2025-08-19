'use client';

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
  ArrowRight
} from 'lucide-react';
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
        <Button
          size="sm"
          variant="ghost"
          className="w-full text-xs hover:bg-neutral-50"
          onClick={() => {
            const url = `https://sepolia.etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`;
            window.open(url, '_blank');
          }}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on Etherscan
        </Button>
      </CardContent>
    </Card>
  );
}

export function TNFTPage() {
  const { isConnected, address } = useAccount();
  const { userNFTs, balance, totalSupply, isLoading } = useNFTQuery();

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
            Please use the "Connect Wallet" button in the top navigation
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
        </div>

        {/* 右侧 67% - 我的作品 */}
        <div className="w-2/3 space-y-6 anim-b opacity-0 ![animation-delay:500ms]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">My Works</h2>
            <Badge variant="outline" className="border-neutral-300">
              {userNFTs.length} items
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[500px]">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2">
              {userNFTs.map((nft) => (
                <TNFTCard key={nft.tokenId} nft={nft} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-neutral-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-neutral-900">No NFTs Yet</h3>
                  <p className="text-neutral-600 max-w-md mx-auto">
                    Start creating your first 3D NFT artwork
                  </p>
                </div>
                <Button asChild className="bg-neutral-900 hover:bg-neutral-800">
                  <Link href="/generate">
                    <Palette className="mr-2 h-4 w-4" />
                    Start Creating
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}