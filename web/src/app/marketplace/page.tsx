// 禁用静态生成
export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/web3/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store } from 'lucide-react';

export default function MarketplacePage() {
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