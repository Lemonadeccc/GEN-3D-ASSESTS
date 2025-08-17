import { Navbar } from '@/components/web3/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface PreviewPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { taskId } = await params;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Eye className="mr-2 h-4 w-4" />
            模型预览
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            3D 模型预览
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            预览任务 {taskId} 生成的 3D 模型
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>预览功能开发中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              模型预览功能正在开发中，敬请期待...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              任务 ID: {taskId}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}