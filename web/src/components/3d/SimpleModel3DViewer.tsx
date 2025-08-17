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
  Palette,
  Coins
} from 'lucide-react';
import { TaskStatusResponse } from '@/lib/meshy/types';
import { useModelDownload } from '@/hooks/use-model-download';
import { useTextToTexture, useTextureTaskStatus } from '@/hooks/use-meshy';
import { storage } from '@/lib/storage';
import { logger } from '@/lib/logger';
import { NFTMintDialog } from '@/components/web3/NFTMintDialog';

// GLB模型组件，接口返回后直接下载和展示
const SimpleGLBModel = memo(function SimpleGLBModel({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: (error: any) => void }) {
  const modelRef = useRef<any>(null);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  // 稳定的URL作为useGLTF的参数
  const stableUrl = useMemo(() => url, [url]);
  
  // 使用useGLTF hook - 在组件顶层调用的更安全方式
  let gltf: any = null;
  let hookError: any = null;
  
  try {
    if (stableUrl) {
      // useGLTF可能抛出Promise错误，我们需要捕获它
      gltf = useGLTF(stableUrl);
    }
  } catch (error) {
    hookError = error;
    
    // 检查是否是Promise错误（Three.js加载失败时会抛出Promise）
    if (error && typeof (error as any)?.then === 'function') {
      // 这是一个Promise错误，等待Promise解决以获取真实错误
      (error as Promise<any>).catch((promiseError) => {
        const errorInfo = {
          url: stableUrl,
          errorType: typeof promiseError,
          errorMessage: promiseError instanceof Error ? promiseError.message : String(promiseError),
          originalError: promiseError,
          promiseResolved: true
        };
        logger.error('GLB模型Promise加载失败:', errorInfo);
        onError(new Error(`GLB文件加载失败: ${promiseError instanceof Error ? promiseError.message : '文件可能损坏或不兼容'}`));
      });
    } else {
      // 常规错误处理
      const errorInfo = {
        url: stableUrl,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        isPromiseError: error && typeof (error as any)?.then === 'function',
        stack: error instanceof Error ? error.stack?.substring(0, 200) : undefined
      };
      logger.error('useGLTF hook调用失败:', errorInfo);
      onError(new Error(`GLB加载失败: ${error instanceof Error ? error.message : '未知错误'}`));
    }
  }
  
  // 处理加载成功
  useEffect(() => {
    if (gltf && gltf.scene && !hookError && loadingState !== 'loaded') {
      setLoadingState('loaded');
      logger.info('GLB模型加载成功:', { url: stableUrl, sceneChildren: gltf.scene.children?.length || 0 });
      onLoad();
    }
  }, [gltf, gltf?.scene, hookError, onLoad, stableUrl, loadingState]);
  
  // 处理加载错误
  useEffect(() => {
    if (hookError && loadingState !== 'error') {
      setLoadingState('error');
      
      // 如果是Promise错误，我们已经在catch中处理了，这里不需要重复处理
      if (hookError && typeof (hookError as any)?.then === 'function') {
        return; // Promise错误已在上面的catch中处理
      }
      
      // 处理非Promise错误
      let errorMessage = '模型加载失败';
      let errorCode = 'UNKNOWN_ERROR';
      
      if (hookError) {
        if (typeof hookError === 'string') {
          errorMessage = hookError;
          errorCode = 'STRING_ERROR';
        } else if (hookError instanceof Error) {
          errorMessage = hookError.message || hookError.name || '未知GLTF加载错误';
          errorCode = hookError.name || 'ERROR_INSTANCE';
        } else if (hookError.message && hookError.message !== '{}') {
          errorMessage = hookError.message;
          errorCode = 'MESSAGE_PROPERTY';
        } else if (hookError.type) {
          errorMessage = `网络错误: ${hookError.type}`;
          errorCode = 'NETWORK_ERROR';
        } else if (hookError.status) {
          errorMessage = `HTTP错误: ${hookError.status}`;
          errorCode = 'HTTP_ERROR';
        } else {
          errorMessage = `模型加载失败 - URL: ${stableUrl?.substring(0, 100)}${stableUrl?.length > 100 ? '...' : ''}`;
          errorCode = 'FORMAT_ERROR';
        }
      }
      
      const errorDetails = {
        url: stableUrl,
        errorMessage,
        errorCode,
        errorType: typeof hookError,
        isErrorInstance: hookError instanceof Error,
        hasValidUrl: !!(stableUrl && stableUrl.length > 0),
        urlValid: stableUrl ? stableUrl.startsWith('http') || stableUrl.startsWith('blob:') : false
      };
      
      logger.error('GLB模型加载失败:', errorDetails);
      onError(new Error(errorMessage));
    }
  }, [hookError, onError, stableUrl, loadingState]);

  // 自动旋转
  useFrame(() => {
    if (modelRef.current && loadingState === 'loaded') {
      modelRef.current.rotation.y += 0.01;
    }
  });

  // 只有加载成功才渲染模型
  if (loadingState !== 'loaded' || !gltf?.scene) {
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
  // 稳定化回调避免重渲染
  const stableOnLoad = useCallback(onModelLoad, []);
  const stableOnError = useCallback(onModelError, []);
  
  // 稳定化相机配置
  const cameraConfig = useMemo(() => ({ 
    position: [0, 0, 5] as [number, number, number], 
    fov: 45 
  }), []);
  
  // 稳定化光照配置
  const lightingSetup = useMemo(() => ({
    ambient: { intensity: 0.6 },
    directional: { position: [10, 10, 5] as [number, number, number], intensity: 1 },
    point: { position: [-10, -10, -5] as [number, number, number], intensity: 0.5 }
  }), []);
  
  return (
    <Canvas
      camera={cameraConfig}
      className="rounded-lg"
      gl={{ 
        antialias: true
      }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = (gl as any).PCFSoftShadowMap;
        logger.debug('3D Canvas创建成功');
      }}
      onError={(error) => {
        logger.error('Canvas渲染错误:', error);
      }}
    >
      <ambientLight intensity={lightingSetup.ambient.intensity} />
      <directionalLight 
        position={lightingSetup.directional.position} 
        intensity={lightingSetup.directional.intensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight 
        position={lightingSetup.point.position} 
        intensity={lightingSetup.point.intensity} 
      />
      
      <Suspense fallback={<FallbackModel />}>
        {localModelUrl ? (
          <SimpleGLBModel 
            url={localModelUrl} 
            onLoad={stableOnLoad} 
            onError={stableOnError} 
          />
        ) : (
          <FallbackModel />
        )}
        <Environment preset="city" background={false} />
      </Suspense>
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
        maxDistance={10}
        minDistance={2}
      />
    </Canvas>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只有URL真正改变时才重新渲染Canvas
  return prevProps.localModelUrl === nextProps.localModelUrl;
});

interface SimpleModel3DViewerProps {
  taskResult: TaskStatusResponse;
  className?: string;
  autoDownload?: boolean; // 新增：控制是否自动下载
}

export function SimpleModel3DViewer({ taskResult, className, autoDownload = true }: SimpleModel3DViewerProps) {
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
  const [textureTaskId, setTextureTaskId] = useState<string | null>(null);
  
  // 从localStorage恢复纹理任务ID - 在useEffect中处理避免hydration问题
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTextureTaskId = storage.getTextureTaskId();
      if (savedTextureTaskId) {
        setTextureTaskId(savedTextureTaskId);
      }
    }
  }, []);

  // 🔥 当新任务开始时，清除旧的纹理任务
  useEffect(() => {
    // 如果当前显示的是新任务，清除可能存在的旧纹理任务
    const savedTextureTaskId = storage.getTextureTaskId();
    if (savedTextureTaskId && taskResult.mode === 'preview') {
      console.log('🧹 New task detected, clearing old texture task:', savedTextureTaskId);
      setTextureTaskId(null);
      storage.saveTextureTaskId(''); // 清空
    }
  }, [taskResult.id, taskResult.mode]);

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
      
      // 如果是新的preview任务，清除纹理任务
      if (taskResult.mode === 'preview') {
        setTextureTaskId(null);
        storage.saveTextureTaskId('');
      }
      
      setLastTaskId(taskResult.id);
    }
  }, [taskResult.id, taskResult.mode, lastTaskId, localModelUrl]);
  
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
  const { data: textureTaskStatus } = useTextureTaskStatus(textureTaskId) as { data: TaskStatusResponse | undefined };
  
  // 记忆化纹理任务状态，只有关键字段变化时才重新计算 - 增加防抖
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
      
      // 🚫 不要保存纹理任务数据到 lastSuccessfulModel，避免覆盖主任务
      // storage.saveLastSuccessfulModel(memoizedTextureStatus); // 删除这行
      
      // 只有当URL真正改变且不在下载中时才重新加载
      if (newModelUrl !== currentLoadedUrl && loadStatus !== 'downloading') {
        logger.info('✅ 纹理生成完成，准备加载新模型:', newModelUrl);
        
        // 🎯 设置一个小延迟避免与纹理请求冲突导致的闪烁
        setTimeout(() => {
          // 再次检查状态，防止在延迟期间开始了其他下载
          if (loadStatus !== 'downloading') {
            // 清理当前模型
            if (localModelUrl) {
              URL.revokeObjectURL(localModelUrl);
            }
            
            // 下载新的纹理模型
            setLocalModelUrl(null);
            setLoadStatus('idle');
            setCurrentLoadedUrl(newModelUrl); // 记录新的URL
            handleDownloadAndLoad(newModelUrl);
          }
        }, 300); // 300ms延迟避免闪烁
      } else {
        logger.debug('模型URL未改变，跳过重新加载');
      }
    }
  }, [
    // 只监听真正影响模型加载的字段
    memoizedTextureStatus?.status, 
    memoizedTextureStatus?.model_urls?.glb, 
    currentLoadedUrl
  ]);

  // 条件性自动下载GLB模型（仅在autoDownload为true且初始化时触发）
  useEffect(() => {
    if (autoDownload && bestModel && !localModelUrl && loadStatus === 'idle' && !memoizedTextureStatus && !currentLoadedUrl) {
      console.log('🚀 Initial model download triggered for:', bestModel.url);
      setCurrentLoadedUrl(bestModel.url); // 记录初始URL
      handleDownloadAndLoad(bestModel.url);
    }
  }, [autoDownload, bestModel, localModelUrl, loadStatus, memoizedTextureStatus, currentLoadedUrl]);

  const handleDownloadAndLoad = async (url: string) => {
    // 防止重复下载
    if (loadStatus === 'downloading') {
      console.log('🚫 Download already in progress for URL:', url);
      return;
    }
    
    setLoadStatus('downloading');
    setErrorMessage('');
    
    console.log('📡 Starting direct download for GLB model:', { url, taskId: taskResult.id });
    
    try {
      const blobUrl = await downloadModel(url, 'GLB');
      if (blobUrl) {
        console.log('✅ Download completed, setting model URL:', blobUrl);
        setLocalModelUrl(blobUrl);
        setLoadStatus('loading');
      } else {
        console.error('❌ Download failed: no blob URL returned');
        setLoadStatus('error');
        setErrorMessage('下载失败');
      }
    } catch (error: any) {
      console.error('❌ Download error:', error);
      setLoadStatus('error');
      setErrorMessage(error.message || '下载失败');
    }
  };

  const handleModelLoad = useCallback(() => {
    setLoadStatus('success');
  }, []);

  const handleModelError = useCallback((error: any) => {
    setLoadStatus('error');
    
    // 增强的错误信息提取
    let errorMsg = '模型加载失败';
    let errorCode = 'UNKNOWN';
    let diagnosticInfo = {};
    
    if (error) {
      if (typeof error === 'string') {
        errorMsg = error;
        errorCode = 'STRING_ERROR';
      } else if (error instanceof Error) {
        errorMsg = error.message || error.name || '未知Error对象';
        errorCode = error.name || 'ERROR_OBJECT';
        diagnosticInfo = {
          stack: error.stack?.substring(0, 300),
          cause: error.cause
        };
      } else if (error.message && error.message !== '{}') {
        errorMsg = error.message;
        errorCode = 'MESSAGE_PROPERTY';
      } else if (error.status || error.statusText) {
        errorMsg = `网络错误: ${error.status} ${error.statusText}`;
        errorCode = 'NETWORK_ERROR';
        diagnosticInfo = { status: error.status, statusText: error.statusText };
      } else if (error.type) {
        errorMsg = `加载错误: ${error.type}`;
        errorCode = 'TYPE_ERROR';
        diagnosticInfo = { type: error.type };
      } else if (typeof error.toString === 'function') {
        const strError = error.toString();
        if (strError !== '[object Object]' && strError !== '{}') {
          errorMsg = strError;
          errorCode = 'TOSTRING_METHOD';
        } else {
          // 针对空对象的特殊处理
          errorMsg = '模型加载失败：未知错误（空对象）';
          errorCode = 'EMPTY_OBJECT_ERROR';
          diagnosticInfo = {
            objectKeys: Object.keys(error || {}),
            objectType: Object.prototype.toString.call(error),
            hasOwnProperties: Object.getOwnPropertyNames(error || {})
          };
        }
      }
    }
    
    setErrorMessage(errorMsg);
    
    // 结构化错误日志，避免空对象
    const errorDetails = {
      errorMessage: errorMsg,
      errorCode,
      errorType: typeof error,
      isErrorInstance: error instanceof Error,
      hasMessage: !!(error?.message),
      hasName: !!(error?.name),
      hasStack: !!(error?.stack),
      localModelUrl: modelInfoRef.current.localModelUrl,
      taskId: modelInfoRef.current.taskId,
      timestamp: new Date().toISOString(),
      diagnosticInfo
    };
    
    logger.error('3D模型加载错误详情:', errorDetails);
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
        logger.info('纹理生成任务启动:', result.result);
      }
      
      setShowRetextureDialog(false);
    } catch (error) {
      logger.error('纹理生成启动失败:', error);
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

  // 如果没有开启自动下载且没有本地模型，显示预览按钮
  if (!autoDownload && !localModelUrl && loadStatus === 'idle') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Box className="h-5 w-5" />
            <span>3D 模型预览</span>
            <Badge variant="outline">GLB</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <Eye className="h-16 w-16 text-muted-foreground" />
          <div className="text-center space-y-2">
            <p className="font-medium">点击预览 3D 模型</p>
            <p className="text-sm text-muted-foreground">
              格式: GLB | 大小: 预计 2-10MB
            </p>
          </div>
          <Button 
            onClick={() => handleDownloadAndLoad(bestModel.url)}
            disabled={loadStatus !== 'idle'}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>开始预览</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const ViewerContent = () => (
    <div className="relative h-full min-h-[600px]">
      {/* 下载状态显示 */}
      {loadStatus === 'downloading' && downloadState && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
            <div className="flex items-center space-x-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">下载 GLB 模型中...</span>
            </div>
            <div className="text-xs text-muted-foreground">
              正在从 Meshy 服务器下载模型文件，请耐心等待...
            </div>
            {downloadState.progress > 0 && (
              <>
                <Progress value={downloadState.progress} className="w-full mt-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(downloadState.progress)}%
                </div>
              </>
            )}
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

      {/* 3D Canvas - 使用key属性防止不必要的重新挂载 */}
      <Model3DCanvas 
        key={`canvas-${taskResult.id}-${currentLoadedUrl}`}
        localModelUrl={localModelUrl}
        onModelLoad={handleModelLoad}
        onModelError={handleModelError}
      />

      {/* 加载指示器 */}
      {loadStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">加载 GLB 模型中...</span>
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
          
          <NFTMintDialog
            taskResult={taskResult}
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="铸造NFT"
                disabled={!taskResult.model_urls?.glb}
              >
                <Coins className="h-4 w-4" />
              </Button>
            }
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => currentModelUrl && window.open(currentModelUrl, '_blank')}
            className="h-8 w-8 p-0"
            title="下载模型"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 模型信息覆盖层 */}
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
      <CardContent className="p-0 h-[900px] flex flex-col">
        <div className="flex-1 min-h-[600px]">
          <ViewerContent />
        </div>
        
        {/* 模型详细信息 */}
        <div className="flex-shrink-0 border-t bg-muted/30">
          <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">{/* 增加高度限制 */}
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">模型信息</span>
            </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">模型ID</div>
              <div className="font-medium text-xs break-all">{taskResult.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">艺术风格</div>
              <div className="font-medium text-xs">{taskResult.art_style}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">生成模式</div>
              <div className="font-medium text-xs">
                {taskResult.mode}
                {memoizedTextureStatus?.status === 'SUCCEEDED' && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1">已加纹理</Badge>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">当前状态</div>
              <div className="font-medium text-xs">
                {memoizedTextureStatus?.status === 'SUCCEEDED' ? 
                  '带纹理模型' : 
                  taskResult.mode === 'refine' ? '精细模型' : '预览模型'
                }
              </div>
            </div>
          </div>

          {/* 下载按钮区域 */}
          <div className="space-y-2">
            {/* 智能下载按钮 - 自动下载最合适的文件 */}
            <div className="flex gap-2">
              <Button 
                variant="default"
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
                disabled={!taskResult.model_urls?.glb}
                className="flex-1"
                title="智能下载：自动下载模型和纹理文件"
              >
                <Download className="h-3 w-3 mr-1" />
                智能下载
                {memoizedTextureStatus?.status === 'SUCCEEDED' ? 
                  <Badge variant="secondary" className="ml-1 text-xs px-1">模型+纹理</Badge> :
                  <Badge variant="outline" className="ml-1 text-xs px-1">白模</Badge>
                }
              </Button>
            </div>
            
            {/* 
            注释掉的其他下载选项
            <div className="flex flex-wrap gap-1">
              {taskResult.model_urls?.fbx && (
                <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls.fbx, '_blank')}>
                  <Download className="h-3 w-3 mr-1" />
                  FBX
                </Button>
              )}
              {taskResult.model_urls?.obj && (
                <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls.obj, '_blank')}>
                  <Download className="h-3 w-3 mr-1" />
                  OBJ
                </Button>
              )}
              {taskResult.model_urls?.usdz && (
                <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls.usdz, '_blank')}>
                  <Download className="h-3 w-3 mr-1" />
                  USDZ
                </Button>
              )}
              {taskResult.thumbnail_url && (
                <Button variant="outline" size="sm" onClick={() => window.open(taskResult.thumbnail_url, '_blank')}>
                  <Download className="h-3 w-3 mr-1" />
                  缩略图
                </Button>
              )}
              {taskResult.video_url && (
                <Button variant="outline" size="sm" onClick={() => window.open(taskResult.video_url, '_blank')}>
                  <Download className="h-3 w-3 mr-1" />
                  视频
                </Button>
              )}
            </div>
            
            
            {(textureTaskStatus?.texture_urls || taskResult.texture_urls) && (
              <div className="mt-2 p-2 bg-blue-50 rounded border">
                <div className="text-xs font-medium text-blue-800 mb-1 flex items-center">
                  <Palette className="h-3 w-3 mr-1" />
                  纹理贴图下载
                </div>
                <div className="flex flex-wrap gap-1">
                  {(textureTaskStatus?.texture_urls?.[0] || taskResult.texture_urls?.[0]) && (
                    <>
                      {(textureTaskStatus?.texture_urls?.[0]?.base_color || taskResult.texture_urls?.[0]?.base_color) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(
                            textureTaskStatus?.texture_urls?.[0]?.base_color || taskResult.texture_urls?.[0]?.base_color!, 
                            '_blank'
                          )}
                          className="text-xs px-2 py-1"
                        >
                          基础色
                        </Button>
                      )}
                      {(textureTaskStatus?.texture_urls?.[0]?.normal || taskResult.texture_urls?.[0]?.normal) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(
                            textureTaskStatus?.texture_urls?.[0]?.normal || taskResult.texture_urls?.[0]?.normal!, 
                            '_blank'
                          )}
                          className="text-xs px-2 py-1"
                        >
                          法线贴图
                        </Button>
                      )}
                      {(textureTaskStatus?.texture_urls?.[0]?.roughness || taskResult.texture_urls?.[0]?.roughness) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(
                            textureTaskStatus?.texture_urls?.[0]?.roughness || taskResult.texture_urls?.[0]?.roughness!, 
                            '_blank'
                          )}
                          className="text-xs px-2 py-1"
                        >
                          粗糙度
                        </Button>
                      )}
                      {(textureTaskStatus?.texture_urls?.[0]?.metallic || taskResult.texture_urls?.[0]?.metallic) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(
                            textureTaskStatus?.texture_urls?.[0]?.metallic || taskResult.texture_urls?.[0]?.metallic!, 
                            '_blank'
                          )}
                          className="text-xs px-2 py-1"
                        >
                          金属度
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            */}
            
            {/* 下载状态提示 */}
            {memoizedTextureStatus?.status === 'SUCCEEDED' && (
              <div className="text-xs text-green-700 p-2 bg-green-50 rounded border">
                <div className="flex items-center">
                  <Download className="h-3 w-3 mr-1" />
                  <span>点击智能下载将获得：GLB模型文件 + 所有纹理贴图</span>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
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