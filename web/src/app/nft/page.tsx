'use client';

import { Navbar } from '@/components/web3/Navbar';
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
  Package
} from 'lucide-react';
import Link from 'next/link';

function NFTCard({ nft }: { nft: any }) {
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
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        {nft.metadata.thumbnailUrl ? (
          <img
            src={nft.metadata.thumbnailUrl}
            alt={nft.metadata.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            #{nft.tokenId}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1">{nft.metadata.name}</CardTitle>
        {nft.metadata.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {nft.metadata.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* 属性标签 */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {nft.metadata.artStyle}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {nft.metadata.mode === 1 ? 'Refine' : 'Preview'}
          </Badge>
          {nft.metadata.hasTexture && (
            <Badge variant="outline" className="text-xs">
              有纹理
            </Badge>
          )}
        </div>

        {/* 统计信息 */}
        {nft.metadata.polycount > 0 && (
          <div className="text-xs text-muted-foreground">
            多边形数: {Number(nft.metadata.polycount).toLocaleString()}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-1" />
            下载
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-1" />
            分享
          </Button>
        </div>

        {/* Etherscan 链接 */}
        <Button
          size="sm"
          variant="ghost"
          className="w-full text-xs"
          onClick={() => {
            const url = `https://sepolia.etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`;
            window.open(url, '_blank');
          }}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          在 Etherscan 查看
        </Button>
      </CardContent>
    </Card>
  );
}

export default function NFTPage() {
  const { isConnected, address } = useAccount();
  const { userNFTs, balance, totalSupply, isLoading } = useNFTQuery();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {!isConnected ? (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <Wallet className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">连接钱包</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                连接您的钱包以查看和管理您的 3D NFT 收藏
              </p>
            </div>
            <div className="text-muted-foreground text-sm">
              请使用右上角的&ldquo;连接钱包&rdquo;按钮
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* 页面标题 */}
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="text-sm">
              <Coins className="mr-2 h-4 w-4" />
              我的 NFT 收藏
            </Badge>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              3D NFT 资产管理
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              查看和管理您创作的 3D NFT 作品集
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">我的 NFT</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance}</div>
                <p className="text-xs text-muted-foreground">
                  个人拥有的 NFT 数量
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">我的创作</CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userNFTs.length}</div>
                <p className="text-xs text-muted-foreground">
                  创作的 3D 模型数量
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总发行量</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSupply}</div>
                <p className="text-xs text-muted-foreground">
                  平台总 NFT 数量
                </p>
              </CardContent>
            </Card>
          </div>

          {/* NFT 网格 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">我的作品</h2>
              <Button asChild>
                <Link href="/generate">
                  <Palette className="mr-2 h-4 w-4" />
                  创作新作品
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">加载中...</span>
              </div>
            ) : userNFTs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userNFTs.map((nft) => (
                  <NFTCard key={nft.tokenId} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">还没有 NFT</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    开始创作您的第一个 3D NFT 作品
                  </p>
                </div>
                <Button asChild>
                  <Link href="/generate">
                    <Palette className="mr-2 h-4 w-4" />
                    开始创作
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}