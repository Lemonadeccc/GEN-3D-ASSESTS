'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTextTo3D, useTaskStatus } from '@/hooks/use-meshy';
import { TestModel3DViewer } from '@/components/3d/TestModel3DViewer';
import { Sparkles, Loader2, Eye } from 'lucide-react';

export default function APITestPage() {
  const [prompt, setPrompt] = useState('请生成一个黑曜石nft要求低调深沉');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const textTo3DMutation = useTextTo3D();
  const { data: taskStatus } = useTaskStatus(currentTaskId);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    try {
      const result = await textTo3DMutation.mutateAsync({
        mode: 'preview',
        prompt: prompt.trim(),
        art_style: 'realistic',
        ai_model: 'meshy-5',
        topology: 'triangle',
        target_polycount: 5000,
        symmetry_mode: 'auto',
      });
      
      console.log('API Response:', result);
      setCurrentTaskId(result.result);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Meshy API 3D模型格式测试</h1>
        <p className="text-muted-foreground mb-6">
          测试真实API返回的不同3D模型格式在React Three Fiber中的兼容性
        </p>

        {/* 生成控制 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>生成测试模型</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="输入提示词..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleGenerate}
                disabled={textTo3DMutation.isPending || !prompt.trim()}
              >
                {textTo3DMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始生成
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 任务状态 */}
        {currentTaskId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>任务状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Task ID:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{currentTaskId}</code>
                </div>
                
                {taskStatus && (
                  <>
                    <div className="flex justify-between">
                      <span>状态:</span>
                      <Badge variant={taskStatus.status === 'SUCCEEDED' ? 'default' : 'secondary'}>
                        {taskStatus.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>进度:</span>
                      <span>{taskStatus.progress}%</span>
                    </div>

                    {taskStatus.status === 'SUCCEEDED' && taskStatus.model_urls && (
                      <div className="mt-4 p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">✅ API返回的模型URLs:</h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(taskStatus.model_urls).map(([format, url]) => (
                            url && (
                              <div key={format} className="flex justify-between items-center">
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                  {format.toUpperCase()}
                                </span>
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs truncate max-w-96"
                                >
                                  {url}
                                </a>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3D模型格式测试 */}
        {currentTaskId && taskStatus && taskStatus.status === 'SUCCEEDED' && taskStatus.model_urls && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">3D模型格式兼容性测试</h2>
            
            {/* GLB 格式测试 */}
            {taskStatus.model_urls.glb && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>GLB 格式测试</span>
                    <Badge>推荐格式</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">URL:</p>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {taskStatus.model_urls.glb}
                    </code>
                  </div>
                  <TestModel3DViewer 
                    url={taskStatus.model_urls.glb} 
                    format="GLB"
                    taskResult={taskStatus}
                  />
                </CardContent>
              </Card>
            )}

            {/* FBX 格式测试 */}
            {taskStatus.model_urls.fbx && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>FBX 格式测试</span>
                    <Badge variant="outline">实验性</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">URL:</p>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {taskStatus.model_urls.fbx}
                    </code>
                  </div>
                  <TestModel3DViewer 
                    url={taskStatus.model_urls.fbx} 
                    format="FBX"
                    taskResult={taskStatus}
                  />
                </CardContent>
              </Card>
            )}

            {/* OBJ 格式测试 */}
            {taskStatus.model_urls.obj && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>OBJ 格式测试</span>
                    <Badge variant="outline">基础格式</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">URL:</p>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {taskStatus.model_urls.obj}
                    </code>
                  </div>
                  <TestModel3DViewer 
                    url={taskStatus.model_urls.obj} 
                    format="OBJ"
                    taskResult={taskStatus}
                  />
                </CardContent>
              </Card>
            )}

            {/* 缩略图和视频 */}
            <Card>
              <CardHeader>
                <CardTitle>其他资源</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {taskStatus.thumbnail_url && (
                  <div>
                    <p className="text-sm font-medium mb-2">缩略图:</p>
                    <img 
                      src={taskStatus.thumbnail_url} 
                      alt="Model thumbnail" 
                      className="max-w-sm rounded-lg border"
                    />
                  </div>
                )}
                
                {taskStatus.video_url && (
                  <div>
                    <p className="text-sm font-medium mb-2">预览视频:</p>
                    <video 
                      src={taskStatus.video_url} 
                      controls 
                      className="max-w-sm rounded-lg border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}