import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';

interface AnimationPageProps {
  params: {
    modelId: string;
  };
}

export default function AnimationPage({ params }: AnimationPageProps) {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Play className="mr-2 h-4 w-4" />
            动画工作室
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            3D 模型动画
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            为模型 {params.modelId} 添加动画效果
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>动画功能开发中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              3D 模型动画功能正在开发中，敬请期待...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              模型 ID: {params.modelId}
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}