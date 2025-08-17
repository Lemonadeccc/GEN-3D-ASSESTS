'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { APIStatusPanel } from '@/components/common/APIStatusPanel';
import { useBalance, useTextTo3D, useTaskStatus } from '@/hooks/use-meshy';
import { TextTo3DParams } from '@/lib/meshy/types';
import { calculateCost, estimateGenerationTime } from '@/lib/meshy/config';
import { Sparkles, Clock, DollarSign, Zap } from 'lucide-react';

export default function MeshyTestPage() {
  const [prompt, setPrompt] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  // Hooks
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const textTo3DMutation = useTextTo3D();
  const { data: taskStatus } = useTaskStatus(currentTaskId);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const params: TextTo3DParams = {
      mode: 'preview',
      prompt: prompt.trim(),
      art_style: 'realistic',
      ai_model: 'meshy-5',
      topology: 'triangle',
      target_polycount: 5000,
      symmetry_mode: 'auto',
    };

    try {
      const result = await textTo3DMutation.mutateAsync(params);
      setCurrentTaskId(result.result);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const cost = calculateCost('preview');
  const estimatedTime = estimateGenerationTime('preview', 5000);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Meshy AI SDK 测试
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SDK 集成测试
          </h1>
          <p className="text-xl text-muted-foreground">
            测试 Meshy AI SDK 的所有功能
          </p>
        </div>

        {/* API状态面板 */}
        <APIStatusPanel />

        {/* 余额显示 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>账户余额</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>加载中...</span>
              </div>
            ) : (
              <div className="text-3xl font-bold text-green-600">
                {balance?.balance || 0} Credits
              </div>
            )}
          </CardContent>
        </Card>

        {/* 生成测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>文本生成 3D 测试</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                描述你想生成的 3D 模型:
              </label>
              <Input
                placeholder="例如: A cute robot with blue eyes"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={600}
              />
              <div className="text-xs text-muted-foreground">
                {prompt.length}/600 字符
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm">费用: {cost} Credits</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">预计: {estimatedTime}秒</span>
              </div>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || textTo3DMutation.isPending}
              className="w-full"
              size="lg"
            >
              {textTo3DMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  生成中...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  开始生成
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 任务状态显示 */}
        {currentTaskId && (
          <Card>
            <CardHeader>
              <CardTitle>任务状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>任务 ID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {currentTaskId}
                  </code>
                </div>
                
                {taskStatus && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>状态:</span>
                      <Badge 
                        variant={
                          taskStatus.status === 'SUCCEEDED' ? 'default' :
                          taskStatus.status === 'FAILED' ? 'destructive' :
                          taskStatus.status === 'IN_PROGRESS' ? 'secondary' :
                          'outline'
                        }
                      >
                        {taskStatus.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>进度:</span>
                        <span>{taskStatus.progress}%</span>
                      </div>
                      <Progress value={taskStatus.progress} className="w-full" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>创建时间:</span>
                      <span>{new Date(taskStatus.created_at).toLocaleString()}</span>
                    </div>

                    {taskStatus.status === 'SUCCEEDED' && taskStatus.model_urls && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">✅ 生成成功！</h4>
                        <div className="space-y-2 text-sm">
                          {taskStatus.model_urls.glb && (
                            <div>
                              <strong>GLB 模型:</strong>
                              <a 
                                href={taskStatus.model_urls.glb} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block text-blue-600 hover:underline break-all"
                              >
                                {taskStatus.model_urls.glb}
                              </a>
                            </div>
                          )}
                          
                          {/* Model info would come from the task metadata */}
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>任务ID: {taskStatus.id}</div>
                            <div>模式: {taskStatus.mode}</div>
                            <div>创建时间: {new Date(taskStatus.created_at).toLocaleString()}</div>
                            {taskStatus.finished_at && (
                              <div>完成时间: {new Date(taskStatus.finished_at).toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {taskStatus.status === 'FAILED' && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-medium text-red-800 mb-2">❌ 生成失败</h4>
                        <p className="text-red-700 text-sm">
                          {taskStatus.task_error || '未知错误'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SDK 状态信息 */}
        <Card>
          <CardHeader>
            <CardTitle>SDK 状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>环境:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>API 模式:</strong> {process.env.NODE_ENV === 'development' ? '模拟模式' : '生产模式'}
              </div>
              <div>
                <strong>余额查询:</strong> {balanceLoading ? '加载中' : '✅ 正常'}
              </div>
              <div>
                <strong>任务创建:</strong> {textTo3DMutation.isError ? '❌ 错误' : '✅ 正常'}
              </div>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  💡 <strong>开发模式:</strong> 当前使用模拟 API 数据，不会消耗真实 Credits。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}