'use client';

// 禁用静态生成
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/web3/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { TMarketplacePage } from '@/components/marketplace';
import { Store, Box } from 'lucide-react';

// Original Marketplace Page Component
function OriginalMarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Store className="mr-2 h-4 w-4" />
            NFT 市场
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            3D NFT 市场
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            发现、购买和交易独特的 AI 生成 3D NFT 资产
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>市场功能开发中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              NFT 市场功能正在开发中，敬请期待...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [useNewLayout, setUseNewLayout] = useState(false);

  // Load layout preference from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('layout-preference');
    if (savedLayout) {
      setUseNewLayout(savedLayout === 'tStyle');
    }
  }, []);

  // Toggle layout and save preference
  const toggleLayout = () => {
    const newLayoutState = !useNewLayout;
    setUseNewLayout(newLayoutState);
    localStorage.setItem('layout-preference', newLayoutState ? 'tStyle' : 'original');
  };

  // T-style layout
  if (useNewLayout) {
    return (
      <LayoutWrapper defaultLayout="tStyle">
        <TMarketplacePage />
      </LayoutWrapper>
    );
  }

  // Original layout with toggle button
  return (
    <div className="relative">
      {/* Layout toggle button */}
      <div className="fixed top-20 right-4 z-[9999]">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLayout}
          className="flex items-center gap-2 bg-background/90 backdrop-blur-sm shadow-lg border-2"
        >
          <Box className="h-4 w-4" />
          T Design
        </Button>
      </div>
      
      <OriginalMarketplacePage />
    </div>
  );
}