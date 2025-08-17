import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit3 } from 'lucide-react';

interface EditorPageProps {
  params: {
    modelId: string;
  };
}

export default function EditorPage({ params }: EditorPageProps) {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Edit3 className="mr-2 h-4 w-4" />
            3D 编辑器
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            3D 模型编辑器
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            编辑和优化模型 {params.modelId}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>编辑器功能开发中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              3D 模型编辑器功能正在开发中，敬请期待...
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