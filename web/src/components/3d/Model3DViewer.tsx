'use client';

import { Suspense, useRef, useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useFBX, Environment } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  Eye,
  RotateCcw,
  Maximize,
  Loader2,
  Box,
  Info,
  AlertTriangle
} from 'lucide-react';
import { TaskStatusResponse } from '@/lib/meshy/types';
import { useModelDownload } from '@/hooks/use-model-download';
import { toast } from 'sonner';

// GLB模型组件 - 优化版本
const GLBModel = memo(function GLBModel({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: (error: any) => void }) {
  const modelRef = useRef<any>(null);

  try {
    const { scene } = useGLTF(url);

    useEffect(() => {
      if (scene) {
        console.log('GLB model loaded successfully:', url);
        onLoad();
      }
    }, [scene, onLoad, url]);

    useFrame((state, delta) => {
      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.5; // 使用 delta 实现平滑旋转
      }
    });

    return <primitive ref={modelRef} object={scene} scale={1} />;
  } catch (error) {
    useEffect(() => {
      onError(error);
    }, [error, onError]);
    return null;
  }
});

// FBX模型组件 - 优化版本
const FBXModel = memo(function FBXModel({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: (error: any) => void }) {
  const modelRef = useRef<any>(null);

  try {
    const fbx = useFBX(url);

    useEffect(() => {
      if (fbx) {
        onLoad();
      }
    }, [fbx, onLoad]);

    useFrame((state, delta) => {
      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.5; // 使用 delta 实现平滑旋转
      }
    });

    return <primitive ref={modelRef} object={fbx} scale={0.01} />;
  } catch (error) {
    useEffect(() => {
      onError(error);
    }, [error, onError]);
    return null;
  }
});

// 后备模型 - 优化版本
const FallbackModel = memo(function FallbackModel() {
  const meshRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5; // 使用 delta 实现平滑旋转
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
});

interface Model3DViewerProps {
  taskResult: TaskStatusResponse;
  className?: string;
  autoDownload?: boolean; // 新增：控制是否自动下载
}

export function Model3DViewer({ taskResult, className, autoDownload = false }: Model3DViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'downloading' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [localModelUrl, setLocalModelUrl] = useState<string | null>(null);
  const [currentFormat, setCurrentFormat] = useState<'GLB' | 'FBX' | null>(null);

  const { downloadModel, getDownloadState } = useModelDownload();

  // 选择最佳格式：GLB > FBX（只使用兼容性好的格式）- 使用 useMemo 优化
  const getBestModelUrl = useMemo(() => {
    // 首先检查标准的model_urls字段
    if (taskResult.model_urls?.glb) {
      return { url: taskResult.model_urls.glb, format: 'GLB' as const };
    } else if (taskResult.model_urls?.fbx) {
      return { url: taskResult.model_urls.fbx, format: 'FBX' as const };
    }
    
    // 对于refine模式，可能数据在不同的字段中
    // 检查是否有texture_urls或其他可能的模型URL字段
    if (taskResult.texture_urls && taskResult.texture_urls.length > 0) {
      // texture_urls是一个对象数组，包含贴图URL，不包含模型文件
      // 跳过这个检查，因为texture_urls不包含.glb文件
    }
    
    // TaskStatusResponse类型中没有preview_url字段，跳过这个检查
    
    // 检查thumbnail_url是否意外包含模型文件
    if (taskResult.thumbnail_url && (taskResult.thumbnail_url.includes('.glb') || taskResult.thumbnail_url.includes('.fbx'))) {
      const format = taskResult.thumbnail_url.includes('.glb') ? 'GLB' : 'FBX';
      return { url: taskResult.thumbnail_url, format: format as 'GLB' | 'FBX' };
    }
    
    console.warn('No valid model URL found in task result:', {
      id: taskResult.id,
      mode: taskResult.mode,
      status: taskResult.status,
      model_urls: taskResult.model_urls,
      texture_urls: taskResult.texture_urls,
      thumbnail_url: taskResult.thumbnail_url
    });
    
    return null;
  }, [taskResult]); // 依赖于 taskResult

  const bestModel = getBestModelUrl;

  // 优化：条件性自动下载 - 只在 autoDownload 为 true 时才自动下载
  useEffect(() => {
    if (autoDownload && bestModel && !localModelUrl && loadStatus === 'idle') {
      handleDownloadAndLoad(bestModel.url, bestModel.format);
    }
  }, [autoDownload, bestModel, localModelUrl, loadStatus]);

  const handleDownloadAndLoad = useCallback(async (url: string, format: 'GLB' | 'FBX') => {
    setLoadStatus('downloading');
    setErrorMessage('');
    setCurrentFormat(format);

    console.log('Starting download and load:', { url, format, taskId: taskResult.id });

    try {
      const blobUrl = await downloadModel(url, format);
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
  }, [downloadModel]); // 添加依赖

  const handleModelLoad = useCallback(() => {
    setLoadStatus('success');
    if (currentFormat) {
      toast.success(`${currentFormat} 模型加载成功！`);
    }
  }, [currentFormat]);

  const handleModelError = useCallback((error: any) => {
    setLoadStatus('error');
    const errorMsg = error?.message || '模型加载失败';
    setErrorMessage(errorMsg);
    console.error('Model loading error details:', {
      error,
      localModelUrl,
      currentFormat,
      taskResult: taskResult.id
    });
  }, [localModelUrl, currentFormat, taskResult.id]);

  // 使用 useMemo 优化模型组件渲染
  const getModelComponent = useMemo(() => {
    if (!localModelUrl || !currentFormat) return <FallbackModel />;

    switch (currentFormat) {
      case 'GLB':
        return <GLBModel url={localModelUrl} onLoad={handleModelLoad} onError={handleModelError} />;
      case 'FBX':
        return <FBXModel url={localModelUrl} onLoad={handleModelLoad} onError={handleModelError} />;
      default:
        return <FallbackModel />;
    }
  }, [localModelUrl, currentFormat, handleModelLoad, handleModelError]);

  const downloadState = bestModel ? getDownloadState(bestModel.url, bestModel.format) : null;

  if (!bestModel) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <Box className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">暂无3D模型</p>
            <p className="text-xs text-muted-foreground">
              任务状态: {taskResult.status} | 模式: {taskResult.mode}
            </p>
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">调试信息</summary>
              <pre className="mt-2 text-left bg-muted p-2 rounded text-xs">
                {JSON.stringify({
                  id: taskResult.id,
                  status: taskResult.status,
                  mode: taskResult.mode,
                  model_urls: taskResult.model_urls,
                  texture_urls: taskResult.texture_urls?.slice(0, 3),
                  thumbnail_url: taskResult.thumbnail_url
                }, null, 2)}
              </pre>
            </details>
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
            {bestModel && (
              <Badge variant="outline">{bestModel.format}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <Eye className="h-16 w-16 text-muted-foreground" />
          <div className="text-center space-y-2">
            <p className="font-medium">点击预览 3D 模型</p>
            <p className="text-sm text-muted-foreground">
              格式: {bestModel.format} | 大小: 预计 2-10MB
            </p>
          </div>
          <Button 
            onClick={() => handleDownloadAndLoad(bestModel.url, bestModel.format)}
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
    <div className="relative h-full min-h-[400px]">
      {/* 下载状态显示 */}
      {loadStatus === 'downloading' && downloadState && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 min-w-[200px]">
            <div className="flex items-center space-x-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">下载 {currentFormat} 模型中...</span>
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

      {/* 3D Canvas - 优化性能设置 */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        className="rounded-lg"
        dpr={[1, 2]} // 限制像素比，提升性能
        performance={{ min: 0.5 }} // 自动性能调节
        gl={{ 
          antialias: false, // 禁用抗锯齿提升性能
          alpha: false,     // 禁用透明度提升性能
          powerPreference: "high-performance" // 优先使用高性能GPU
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          console.log('Canvas created successfully');
        }}
        onError={(error) => {
          console.error('Canvas error:', error);
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Suspense fallback={<FallbackModel />}>
          {getModelComponent}
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          dampingFactor={0.05}
          screenSpacePanning={false}
          maxPolarAngle={Math.PI} // 允许全方位旋转
          enableDamping={true}    // 启用阻尼，使操作更流畅
        />
      </Canvas>

      {/* 加载指示器 */}
      {loadStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">加载 {currentFormat} 模型中...</span>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="flex flex-col bg-background/80 backdrop-blur-sm rounded-lg p-2 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRotate(!autoRotate)}
            className="h-8 w-8 p-0"
            title={autoRotate ? "停止自动旋转" : "开始自动旋转"}
          >
            <RotateCcw className={`h-4 w-4 ${autoRotate ? 'animate-spin' : ''}`} />
          </Button>

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
            onClick={() => bestModel && window.open(bestModel.url, '_blank')}
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
                3D 预览 ({currentFormat || 'GLB'})
              </Badge>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>任务ID: {taskResult.id}</div>
                <div>状态: {loadStatus === 'success' ? '加载完成' : loadStatus === 'loading' ? '加载中' : loadStatus
                  === 'downloading' ? '下载中' : '准备中'}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bestModel && window.open(bestModel.url, '_blank')}
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Box className="h-5 w-5" />
          <span>3D 模型预览</span>
          {currentFormat && (
            <Badge variant="outline">{currentFormat}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ViewerContent />

        {/* 模型详细信息 */}
        <Separator />
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="font-medium">模型信息</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">模型ID</div>
              <div className="font-medium text-xs">{taskResult.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">艺术风格</div>
              <div className="font-medium">{taskResult.art_style}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">生成模式</div>
              <div className="font-medium">{taskResult.mode}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">使用格式</div>
              <div className="font-medium">{currentFormat || 'GLB'}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {taskResult.model_urls?.glb && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls?.glb, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载 GLB
              </Button>
            )}
            {taskResult.model_urls?.fbx && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls?.fbx, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载 FBX
              </Button>
            )}
            {taskResult.model_urls?.obj && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls?.obj, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载 OBJ
              </Button>
            )}
            {taskResult.model_urls?.usdz && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.model_urls?.usdz, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载 USDZ
              </Button>
            )}
            {taskResult.thumbnail_url && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.thumbnail_url, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载缩略图
              </Button>
            )}
            {taskResult.video_url && (
              <Button variant="outline" size="sm" onClick={() => window.open(taskResult.video_url, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                下载视频
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 预加载模型 Hook
useGLTF.preload = (url: string) => {
  // 预加载3D模型以提高性能
};