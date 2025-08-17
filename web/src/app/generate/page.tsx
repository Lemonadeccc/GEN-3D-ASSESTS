'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextTo3DGenerator } from '@/components/generation/TextTo3DGenerator';
import { Sparkles, Image, FileText, Layers } from 'lucide-react';

export default function GeneratePage() {
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);

  const handleTaskCreated = (taskId: string) => {
    setGeneratedTasks(prev => [...prev, taskId]);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            AI 生成中心
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 生成 3D 模型
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            使用 Meshy AI 将创意转化为高质量 3D 模型
          </p>
        </div>

        {/* Generation Tabs */}
        <Tabs defaultValue="text-to-3d" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text-to-3d" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>文本生成 3D</span>
            </TabsTrigger>
            <TabsTrigger value="image-to-3d">
              <Image className="h-4 w-4 mr-2" />
              <span>图片生成 3D</span>
            </TabsTrigger>
            <TabsTrigger value="multi-image">
              <Layers className="h-4 w-4 mr-2" />
              <span>多图片生成</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text-to-3d" className="space-y-6">
            <TextTo3DGenerator onTaskCreated={handleTaskCreated} />
          </TabsContent>

          <TabsContent value="image-to-3d" className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Image className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-xl">图片生成 3D</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  从单张图片生成 3D 模型功能正在开发中...
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">无纹理模式</div>
                    <div className="text-muted-foreground">5 Credits</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">含纹理模式</div>
                    <div className="text-muted-foreground">15 Credits</div>
                  </div>
                </div>
                <Button disabled className="w-full">
                  即将推出
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multi-image" className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Layers className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-xl">多图片生成 3D</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  使用多角度图片生成更精确的 3D 模型功能正在开发中...
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">无纹理模式</div>
                    <div className="text-muted-foreground">5 Credits</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">含纹理模式</div>
                    <div className="text-muted-foreground">15 Credits</div>
                  </div>
                </div>
                <Button disabled className="w-full">
                  即将推出
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Tasks */}
        {generatedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>最近的生成任务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {generatedTasks.slice(-5).reverse().map((taskId) => (
                  <div key={taskId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm">{taskId}</code>
                    <Badge variant="secondary">进行中</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generation Tips */}
        <Card>
          <CardHeader>
            <CardTitle>生成提示</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-600">最佳实践</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <span>使用具体、详细的英文描述</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <span>先使用 Preview 模式验证几何结构</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <span>根据用途选择合适的多边形数量</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <span>对称物体建议启用对称性控制</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-purple-600">技术参数</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Preview 模式:</span>
                    <span>5 Credits, ~30-60秒</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refine 模式:</span>
                    <span>10 Credits, ~120-300秒</span>
                  </div>
                  <div className="flex justify-between">
                    <span>支持格式:</span>
                    <span>GLB, FBX, OBJ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最大多边形:</span>
                    <span>300,000</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}