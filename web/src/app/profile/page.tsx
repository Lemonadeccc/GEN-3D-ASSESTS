// 禁用静态生成
export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/web3/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <User className="mr-2 h-4 w-4" />
            用户中心
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            个人资料
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            管理您的 3D NFT 资产和个人设置
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>用户中心功能开发中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              用户中心功能正在开发中，敬请期待...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}