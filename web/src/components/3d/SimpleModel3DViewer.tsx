'use client';

import { Suspense, useRef, useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Download,
  Eye,
  RotateCcw,
  Maximize,
  Loader2,
  Box,
  Info,
  AlertTriangle,
  Palette
} from 'lucide-react';
import { TaskStatusResponse } from '@/lib/meshy/types';
import { useModelDownload } from '@/hooks/use-model-download';
import { useTextToTexture, useTextureTaskStatus } from '@/hooks/use-meshy';
import { storage } from '@/lib/storage';

// 使用memo包装3D模型组件避免重渲染
const SimpleGLBModel = memo(function SimpleGLBModel({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: (error: any) => void }) {
  const modelRef = useRef<any>(null);
  const gltf = useGLTF(url);

  useEffect(() => {
    if (gltf && gltf.scene) {
      console.log('GLB loaded successfully with useGLTF hook:', url);
      onLoad();
    }
  }, [gltf, onLoad, url]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
    }
  });

  if (!gltf || !gltf.scene) {
    return null;
  }

  return <primitive ref={modelRef} object={gltf.scene} scale={1} />;
});

// 纹理对话框组件 - 独立渲染避免影响Canvas
const TextureDialog = memo(function TextureDialog({ 
  open, 
  onOpenChange,
  texturePrompt,
  onTexturePromptChange,
  negativePrompt,
  onNegativePromptChange,
  enablePbr,
  onEnablePbrChange,
  onSubmit,
  isPending
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  texturePrompt: string;
  onTexturePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  negativePrompt: string;
  onNegativePromptChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  enablePbr: boolean;
  onEnablePbrChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>重新生成纹理</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="texture-prompt">纹理描述</Label>
            <Textarea
              id="texture-prompt"
              placeholder="例如: 金属质感、木纹理、彩虹色彩..."
              value={texturePrompt}
              onChange={onTexturePromptChange}
              maxLength={600}
              className="min-h-[80px]"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <div className="text-xs text-muted-foreground text-right">
              {texturePrompt.length}/600 字符
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="style-prompt">样式提示 (可选)</Label>
            <Input
              id="style-prompt"
              placeholder="例如: 红色獠牙、武士装束..."
              value={negativePrompt}
              onChange={onNegativePromptChange}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enable-pbr"
              checked={enablePbr}
              onChange={onEnablePbrChange}
              className="rounded"
            />
            <Label htmlFor="enable-pbr" className="text-sm">
              生成PBR材质贴图 (高质量)
            </Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button 
            type="button"
            onClick={onSubmit}
            disabled={!texturePrompt.trim() || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                启动中...
              </>
            ) : (
              '开始生成'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// 后备模型
function FallbackModel() {
  const meshRef = useRef<any>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
}

// Canvas包装组件 - 防止不必要的重渲染
const Model3DCanvas = memo(function Model3DCanvas({ 
  localModelUrl, 
  onModelLoad, 
  onModelError 
}: { 
  localModelUrl: string | null; 
  onModelLoad: () => void; 
  onModelError: (error: any) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      className="rounded-lg"
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        console.log('Simple Canvas created successfully');
      }}
      onError={(error) => {
        console.error('Simple Canvas error:', error);
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      <Suspense fallback={<FallbackModel />}>
        {localModelUrl ? (
          <SimpleGLBModel url={localModelUrl} onLoad={onModelLoad} onError={onModelError} />
        ) : (
          <FallbackModel />
        )}
        <Environment preset="city" />
      </Suspense>
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
      />
    </Canvas>
  );
});

interface SimpleModel3DViewerProps {
  taskResult: TaskStatusResponse;
  className?: string;
  hideBottomInfo?: boolean;
  textureTaskId?: string | null;
}

export function SimpleModel3DViewer({ taskResult, className, hideBottomInfo = false, textureTaskId: propTextureTaskId }: SimpleModel3DViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'downloading' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [localModelUrl, setLocalModelUrl] = useState<string | null>(null);
  const [currentLoadedUrl, setCurrentLoadedUrl] = useState<string | null>(null); // 记录当前已加载的模型URL
  
  // 使用ref存储不需要触发重渲染的值
  const modelInfoRef = useRef({ localModelUrl: null as string | null, taskId: taskResult.id });
  
  // 更新ref的值
  useEffect(() => {
    modelInfoRef.current = { localModelUrl, taskId: taskResult.id };
  }, [localModelUrl, taskResult.id]);
  
  // 纹理重生成相关状态 - 使用useRef避免重渲染
  const [showRetextureDialog, setShowRetextureDialog] = useState(false);
  const [texturePrompt, setTexturePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [enablePbr, setEnablePbr] = useState(true);
  const [textureTaskId, setTextureTaskId] = useState<string | null>(propTextureTaskId || null);
  
  // 同步外部传入的textureTaskId
  useEffect(() => {
    if (propTextureTaskId !== undefined) {
      setTextureTaskId(propTextureTaskId);
      console.log('📍 Texture task ID updated from props:', propTextureTaskId);
      
      // 如果有纹理任务ID，保存到localStorage
      if (propTextureTaskId) {
        storage.saveTextureTaskId(propTextureTaskId);
      }
    }
  }, [propTextureTaskId]);
  
  // 从localStorage恢复纹理任务ID - 只在没有传入props时使用
  useEffect(() => {
    if (typeof window !== 'undefined' && !propTextureTaskId) {
      const savedTextureTaskId = storage.getTextureTaskId();
      if (savedTextureTaskId && !textureTaskId) {
        setTextureTaskId(savedTextureTaskId);
        console.log('🔄 Restored texture task ID from storage:', savedTextureTaskId);
      }
    }
  }, [propTextureTaskId]);

  // 🔥 当新任务开始时，清除旧的纹理任务 - 但不要清除通过props传入的纹理任务
  useEffect(() => {
    // 如果有通过props传入的纹理任务ID，不要清除它
    if (propTextureTaskId) {
      return;
    }
    
    // 如果当前显示的是新任务，清除可能存在的旧纹理任务
    const savedTextureTaskId = storage.getTextureTaskId();
    if (savedTextureTaskId && taskResult.mode === 'preview') {
      console.log('🧹 New task detected, clearing old texture task:', savedTextureTaskId);
      setTextureTaskId(null);
      storage.saveTextureTaskId(''); // 清空
    }
  }, [taskResult.id, taskResult.mode, propTextureTaskId]);

  // 🔥 检测任务ID变化，重置所有相关状态
  const [lastTaskId, setLastTaskId] = useState<string | null>(null);
  useEffect(() => {
    if (taskResult.id !== lastTaskId) {
      console.log('🔄 Task ID changed from', lastTaskId, 'to', taskResult.id);
      
      // 清理旧模型数据
      if (localModelUrl) {
        URL.revokeObjectURL(localModelUrl);
        setLocalModelUrl(null);
      }
      
      // 重置所有状态
      setLoadStatus('idle');
      setCurrentLoadedUrl(null);
      setErrorMessage('');
      
      // 如果是新的preview任务，清除纹理任务 - 但不要清除通过props传入的纹理任务
      if (taskResult.mode === 'preview' && !propTextureTaskId) {
        setTextureTaskId(null);
        storage.saveTextureTaskId('');
      }
      
      setLastTaskId(taskResult.id);
    }
  }, [taskResult.id, taskResult.mode, lastTaskId, localModelUrl, propTextureTaskId]);
  
  // 使用回调函数避免重渲染
  const handleTexturePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTexturePrompt(e.target.value);
  }, []);
  
  const handleStylePromptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNegativePrompt(e.target.value);
  }, []);
  
  const handlePbrChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEnablePbr(e.target.checked);
  }, []);
  
  // 纹理生成 hooks
  const textToTextureMutation = useTextToTexture();
  const { data: textureTaskStatus } = useTextureTaskStatus(textureTaskId);
  
  // 调试日志
  useEffect(() => {
    console.log('🔍 Texture loading state:', {
      textureTaskId,
      textureTaskStatus: textureTaskStatus?.status,
      hasTextureUrls: !!textureTaskStatus?.model_urls?.glb
    });
  }, [textureTaskId, textureTaskStatus]);
  
  // 记忆化纹理任务状态，只有关键字段变化时才重新计算
  const memoizedTextureStatus = useMemo(() => {
    if (!textureTaskStatus) return null;
    
    return {
      id: textureTaskStatus.id,
      status: textureTaskStatus.status,
      progress: textureTaskStatus.progress,
      model_urls: textureTaskStatus.model_urls,
      texture_urls: textureTaskStatus.texture_urls,
    };
  }, [
    textureTaskStatus?.id,
    textureTaskStatus?.status,
    textureTaskStatus?.progress,
    textureTaskStatus?.model_urls?.glb,
    textureTaskStatus?.texture_urls
  ]);
  
  const { downloadModel, getDownloadState } = useModelDownload();

  // 选择GLB格式
  const getBestModelUrl = () => {
    if (taskResult.model_urls?.glb) {
      return { url: taskResult.model_urls.glb, format: 'GLB' as const };
    }
    return null;
  };

  const bestModel = getBestModelUrl();

  // 监听纹理任务状态变化，更新模型
  useEffect(() => {
    if (memoizedTextureStatus && memoizedTextureStatus.status === 'SUCCEEDED' && memoizedTextureStatus.model_urls?.glb) {
      const newModelUrl = memoizedTextureStatus.model_urls.glb;
      
      // 只有当URL真正改变时才重新加载
      if (newModelUrl !== currentLoadedUrl) {
        console.log('✅ 纹理生成完成，新模型URL:', newModelUrl);
        
        // 清理当前模型
        if (localModelUrl) {
          URL.revokeObjectURL(localModelUrl);
        }
        
        // 下载新的纹理模型
        setLocalModelUrl(null);
        setLoadStatus('idle');
        setCurrentLoadedUrl(newModelUrl); // 记录新的URL
        handleDownloadAndLoad(newModelUrl);
      } else {
        console.log('模型URL未改变，跳过重新加载');
      }
    } else if (!textureTaskId && currentLoadedUrl !== bestModel?.url) {
      // 当清除纹理ID时，加载原始模型
      console.log('🔄 No texture ID, loading original model');
      if (bestModel?.url) {
        if (localModelUrl) {
          URL.revokeObjectURL(localModelUrl);
        }
        setLocalModelUrl(null);
        setLoadStatus('idle');
        setCurrentLoadedUrl(bestModel.url);
        handleDownloadAndLoad(bestModel.url);
      }
    }
  }, [
    // 监听所有相关变化
    memoizedTextureStatus?.status,
    memoizedTextureStatus?.model_urls?.glb,
    currentLoadedUrl,
    textureTaskId,
    bestModel?.url
  ]);
  
  // 🔥 新增：当textureTaskId变化且纹理任务已完成时，立即加载纹理模型
  useEffect(() => {
    if (textureTaskId && memoizedTextureStatus?.status === 'SUCCEEDED' && memoizedTextureStatus?.model_urls?.glb) {
      const textureModelUrl = memoizedTextureStatus.model_urls.glb;
      
      // 如果纹理模型URL与当前加载的URL不同，重新加载
      if (textureModelUrl !== currentLoadedUrl) {
        console.log('🎨 Loading historical texture model:', textureModelUrl);
        
        // 清理当前模型
        if (localModelUrl) {
          URL.revokeObjectURL(localModelUrl);
        }
        
        // 加载纹理模型
        setLocalModelUrl(null);
        setLoadStatus('idle');
        setCurrentLoadedUrl(textureModelUrl);
        handleDownloadAndLoad(textureModelUrl);
      }
    }
  }, [textureTaskId, memoizedTextureStatus?.status, memoizedTextureStatus?.model_urls?.glb, currentLoadedUrl]);

  // 自动下载GLB模型
  useEffect(() => {
    if (bestModel && !localModelUrl && loadStatus === 'idle' && !memoizedTextureStatus && !currentLoadedUrl) {
      setCurrentLoadedUrl(bestModel.url); // 记录初始URL
      handleDownloadAndLoad(bestModel.url);
    }
  }, [bestModel, localModelUrl, loadStatus, memoizedTextureStatus, currentLoadedUrl]);

  const handleDownloadAndLoad = async (url: string) => {
    setLoadStatus('downloading');
    setErrorMessage('');
    
    console.log('Starting download for GLB model:', { url, taskId: taskResult.id });
    
    try {
      const blobUrl = await downloadModel(url, 'GLB');
      if (blobUrl) {
        console.log('Download successful, blob URL created:', blobUrl);
        setLocalModelUrl(blobUrl);
        setLoadStatus('loading');
      } else {
        console.error('Download failed: no blob URL returned');
        setLoadStatus('error');
        setErrorMessage('下载失败');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      setLoadStatus('error');
      setErrorMessage(error.message || '下载失败');
    }
  };

  const handleModelLoad = useCallback(() => {
    setLoadStatus('success');
  }, []);

  const handleModelError = useCallback((error: any) => {
    setLoadStatus('error');
    const errorMsg = error?.message || '模型加载失败';
    setErrorMessage(errorMsg);
    console.error('Model loading error details:', {
      error,
      localModelUrl: modelInfoRef.current.localModelUrl,
      taskResult: modelInfoRef.current.taskId
    });
  }, []); // 移除所有依赖，使用ref中的值

  // 获取当前应该使用的模型URL（优先使用纹理生成的新模型）
  const getCurrentModelUrl = () => {
    if (memoizedTextureStatus && memoizedTextureStatus.status === 'SUCCEEDED' && memoizedTextureStatus.model_urls?.glb) {
      return memoizedTextureStatus.model_urls.glb;
    }
    return bestModel?.url;
  };

  const currentModelUrl = getCurrentModelUrl();
  const downloadState = bestModel ? getDownloadState(bestModel.url, 'GLB') : null;
  
  // 纹理生成提交处理
  const handleTextureSubmit = useCallback(async () => {
    if (!currentModelUrl || !texturePrompt.trim()) return;
    
    try {
      const result = await textToTextureMutation.mutateAsync({
        model_url: currentModelUrl,
        prompt: texturePrompt.trim(),
        text_style_prompt: negativePrompt.trim() || undefined, // 使用正确的字段名
        enable_pbr: enablePbr,
        ai_model: 'meshy-5'
      });
      
      if (result.result) {
        setTextureTaskId(result.result);
        storage.saveTextureTaskId(result.result); // 保存到localStorage
        console.log('纹理生成任务启动:', result.result);
      }
      
      setShowRetextureDialog(false);
    } catch (error) {
      console.error('纹理生成启动失败:', error);
    }
  }, [currentModelUrl, texturePrompt, negativePrompt, enablePbr, textToTextureMutation]);

  if (!bestModel) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Box className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">暂无3D模型</p>
            <p className="text-xs text-muted-foreground">需要GLB格式</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const ViewerContent = () => (
    <div className="relative h-full">
      {/* 下载状态显示 */}
      {loadStatus === 'downloading' && downloadState && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
            <div className="flex items-center space-x-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                {memoizedTextureStatus?.status === 'IN_PROGRESS' ? 'Loading textured model...' : 'Loading 3D model...'}
              </span>
            </div>
            <Progress value={downloadState.progress} className="w-full" />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round(downloadState.progress)}%
            </div>
          </div>
        </div>
      )}

      {/* 错误状态显示 */}
      {loadStatus === 'error' && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">加载失败</span>
            </div>
            <p className="text-red-700 text-xs mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 3D Canvas - 添加高度限制 */}
      <div className="w-full h-full">
        <Model3DCanvas 
          localModelUrl={localModelUrl}
          onModelLoad={handleModelLoad}
          onModelError={handleModelError}
        />
      </div>

      {/* 加载指示器 */}
      {loadStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {memoizedTextureStatus?.status === 'IN_PROGRESS' ? 'Loading textured model...' : 'Loading 3D model...'}
            </span>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="flex flex-col bg-background/80 backdrop-blur-sm rounded-lg p-2 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="h-8 w-8 p-0"
            title={isFullscreen ? "退出全屏" : "全屏查看"}
          >
            <Maximize className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="重新生成纹理"
            onClick={() => setShowRetextureDialog(true)}
          >
            <Palette className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              console.log('🔽 智能下载开始');
              
              // 如果有纹理任务且成功，下载纹理版本
              if (memoizedTextureStatus?.status === 'SUCCEEDED' && memoizedTextureStatus.model_urls?.glb) {
                console.log('📦 下载带纹理的GLB模型:', memoizedTextureStatus.model_urls.glb);
                window.open(memoizedTextureStatus.model_urls.glb, '_blank');
                
                // 同时下载纹理贴图
                if (memoizedTextureStatus.texture_urls?.[0]) {
                  const textures = memoizedTextureStatus.texture_urls[0];
                  setTimeout(() => {
                    if (textures.base_color) {
                      console.log('🖼️ 下载基础色贴图');
                      window.open(textures.base_color, '_blank');
                    }
                  }, 1000);
                  
                  setTimeout(() => {
                    if (textures.normal) {
                      console.log('🖼️ 下载法线贴图');
                      window.open(textures.normal, '_blank');
                    }
                  }, 2000);
                  
                  setTimeout(() => {
                    if (textures.roughness) {
                      console.log('🖼️ 下载粗糙度贴图');
                      window.open(textures.roughness, '_blank');
                    }
                  }, 3000);
                  
                  setTimeout(() => {
                    if (textures.metallic) {
                      console.log('🖼️ 下载金属度贴图');
                      window.open(textures.metallic, '_blank');
                    }
                  }, 4000);
                }
              } 
              // 否则下载原始模型
              else if (taskResult.model_urls?.glb) {
                console.log('📦 下载原始GLB模型（白模）:', taskResult.model_urls.glb);
                window.open(taskResult.model_urls.glb, '_blank');
              }
            }}
            className="h-8 w-8 p-0"
            title={memoizedTextureStatus?.status === 'SUCCEEDED' ? "下载模型和纹理" : "下载模型"}
            disabled={!taskResult.model_urls?.glb}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 模型信息覆盖层 - 根据hideBottomInfo条件渲染 */}
      {!hideBottomInfo && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">
                  <Eye className="h-3 w-3 mr-1" />
                  3D 预览 (GLB)
                </Badge>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>任务ID: {taskResult.id}</div>
                  <div>状态: {loadStatus === 'success' ? '加载完成' : loadStatus === 'loading' ? '加载中' : loadStatus === 'downloading' ? '下载中' : '准备中'}</div>
                  {memoizedTextureStatus && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Palette className="h-3 w-3" />
                        <span className="text-xs font-medium">纹理生成: {memoizedTextureStatus.status}</span>
                      </div>
                      {memoizedTextureStatus.status === 'IN_PROGRESS' && (
                        <div className="mt-1">
                          <Progress value={memoizedTextureStatus.progress} className="h-1" />
                          <div className="text-xs text-blue-600 mt-1">{memoizedTextureStatus.progress}%</div>
                        </div>
                      )}
                      {memoizedTextureStatus && memoizedTextureStatus.status === 'SUCCEEDED' && (
                        <div className="text-xs text-green-700 mt-1 flex items-center justify-between">
                          <span>✅ 纹理生成完成</span>
                          <button
                            className="text-blue-600 hover:text-blue-700 text-xs underline cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🔄 Regenerating texture, clearing all texture data');
                              
                              // 清除所有纹理状态
                              setTextureTaskId(null);
                              setTexturePrompt('');
                              setNegativePrompt('');
                              
                              // 清除localStorage中的纹理任务ID  
                              storage.saveTextureTaskId('');
                              
                              // 关闭纹理对话框如果打开着
                              setShowRetextureDialog(false);
                              
                              // 重置模型URL到原始版本
                              setCurrentLoadedUrl(taskResult.model_urls?.glb || null);
                              
                              // 重新加载原始模型
                              if (taskResult.model_urls?.glb) {
                                handleDownloadAndLoad(taskResult.model_urls.glb);
                              }
                            }}
                          >
                            重新生成
                          </button>
                        </div>
                      )}
                      {memoizedTextureStatus && memoizedTextureStatus.status === 'FAILED' && (
                        <div className="text-xs text-red-700 mt-1">❌ 纹理生成失败</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => currentModelUrl && window.open(currentModelUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full">
          <ViewerContent />
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Box className="h-5 w-5" />
          <span>3D 模型预览 (简化版)</span>
          <Badge variant="outline">GLB</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[500px]">
        <ViewerContent />
      </CardContent>
    </Card>
    
    {/* 纹理对话框 - 独立渲染避免影响Canvas */}
    <TextureDialog
      open={showRetextureDialog}
      onOpenChange={setShowRetextureDialog}
      texturePrompt={texturePrompt}
      onTexturePromptChange={handleTexturePromptChange}
      negativePrompt={negativePrompt}
      onNegativePromptChange={handleStylePromptChange}
      enablePbr={enablePbr}
      onEnablePbrChange={handlePbrChange}
      onSubmit={handleTextureSubmit}
      isPending={textToTextureMutation.isPending}
    />
    </>
  );
}