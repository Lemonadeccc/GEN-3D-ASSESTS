import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface DownloadState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  blobUrl: string | null;
  downloadMethod?: 'direct' | 'proxy';
}

export function useModelDownload() {
  const [downloadStates, setDownloadStates] = useState<
    Record<string, DownloadState>
  >({});

  // 客户端直接下载方法（优先尝试）
  const attemptDirectDownload = async (url: string, format: string, key: string): Promise<string | null> => {
    console.log('🚀 Attempting direct client download...');
    
    try {
      // 创建 ReadableStream 读取器用于进度追踪
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/octet-stream, */*',
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Direct download failed: ${response.status} ${response.statusText}`);
      }
      
      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      
      console.log('✅ Direct download started, content-length:', totalBytes ? `${(totalBytes / 1024 / 1024).toFixed(2)}MB` : 'unknown');
      
      if (!response.body) {
        throw new Error('Response body is not available for direct download');
      }
      
      // 使用 ReadableStream 追踪进度
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedBytes += value.length;
        
        // 更新进度（如果知道总大小）
        if (totalBytes > 0) {
          const progress = Math.round((receivedBytes / totalBytes) * 100);
          setDownloadStates((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              progress,
            },
          }));
          
          // 每10%记录一次进度
          if (progress % 10 === 0) {
            console.log(`📊 Direct download progress: ${progress}%`);
          }
        }
      }
      
      // 合并所有数据块
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combinedArray = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        combinedArray.set(chunk, offset);
        offset += chunk.length;
      }
      
      const blob = new Blob([combinedArray], { 
        type: format === 'GLB' ? 'model/gltf-binary' : 'application/octet-stream' 
      });
      
      // 快速验证GLB文件
      if (format === 'GLB' && blob.size > 12) {
        const arrayBuffer = await blob.slice(0, 12).arrayBuffer();
        const view = new DataView(arrayBuffer);
        const magic = view.getUint32(0, true);
        const expectedMagic = 0x46546C67; // "glTF"
        
        if (magic !== expectedMagic) {
          throw new Error('GLB文件格式无效 - 文件头部不正确');
        }
        
        console.log('✅ GLB validation passed (direct download)');
      }
      
      const blobUrl = URL.createObjectURL(blob);
      
      setDownloadStates((prev) => ({
        ...prev,
        [key]: {
          isLoading: false,
          progress: 100,
          error: null,
          blobUrl,
          downloadMethod: 'direct',
        },
      }));
      
      console.log('✅ Direct download completed successfully');
      toast.success(`${format.toUpperCase()} 模型下载完成（直接下载），正在加载...`);
      return blobUrl;
      
    } catch (directError) {
      console.error('❌ Direct download failed:', directError);
      throw directError;
    }
  };

  // API代理下载方法（备用）
  const attemptProxyDownload = async (url: string, format: string, key: string): Promise<string | null> => {
    console.log('🔄 Attempting proxy download fallback...');
    
    try {
      // 使用API代理下载
      console.log('📡 Fetching from API route:', `/api/download-model?url=${encodeURIComponent(url)}`);
      console.log('🕰️ Proxy - Starting fetch at:', new Date().toISOString());
      
      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Proxy timeout after 320 seconds');
        controller.abort();
      }, 320000); // 320秒超时（比服务端稍长）
      
      const response = await fetch(
        `/api/download-model?url=${encodeURIComponent(url)}`,
        {
          signal: controller.signal,
        }
      );
      
      // 清除超时定时器
      clearTimeout(timeoutId);
      console.log('🕰️ Proxy - Fetch response received at:', new Date().toISOString());

      console.log('📡 API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API response error:', errorText);
        throw new Error(`代理下载失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // 创建blob和URL - 简化流程
      console.log('📦 Creating blob from response at:', new Date().toISOString());
      const blob = await response.blob();
      console.log('📦 Blob created - Size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
      
      // 快速创建blobURL，跳过复杂验证
      console.log('🔗 Creating blob URL at:', new Date().toISOString());
      const blobUrl = URL.createObjectURL(blob);
      console.log('🔗 Blob URL ready:', blobUrl.substring(0, 50) + '...');

      // 下载成功
      setDownloadStates((prev) => ({
        ...prev,
        [key]: {
          isLoading: false,
          progress: 100,
          error: null,
          blobUrl,
          downloadMethod: 'proxy',
        },
      }));

      console.log('✅ Proxy download completed successfully at:', new Date().toISOString());
      toast.success(`${format.toUpperCase()} 模型下载完成（代理下载），正在加载...`);
      return blobUrl;
      
    } catch (proxyError) {
      console.error('❌ Proxy download also failed:', proxyError);
      throw new Error('所有下载方法都失败，请稍后重试');
    }
  };

  const downloadModel = useCallback(
    async (url: string, format: string): Promise<string | null> => {
      const key = `${format}-${url}`;
      
      console.log('🔽 Starting download for:', { url, format, key });

      // 如果已经下载过，直接返回blob URL
      if (downloadStates[key]?.blobUrl) {
        console.log('✅ Using cached blob URL:', downloadStates[key].blobUrl);
        return downloadStates[key].blobUrl;
      }

      // 初始化下载状态
      setDownloadStates((prev) => ({
        ...prev,
        [key]: {
          isLoading: true,
          progress: 0,
          error: null,
          blobUrl: null,
        },
      }));

      try {
        // 优先尝试客户端直接下载
        console.log('🚀 Trying direct download first...');
        return await attemptDirectDownload(url, format, key);
        
      } catch (directError) {
        console.warn('❌ Direct download failed, trying proxy fallback:', directError.message);
        
        // 重置进度为代理下载模式
        setDownloadStates((prev) => ({
          ...prev,
          [key]: {
            isLoading: true,
            progress: 0,
            error: null,
            blobUrl: null,
          },
        }));
        
        try {
          // 备用：使用API代理下载
          return await attemptProxyDownload(url, format, key);
          
        } catch (proxyError) {
          console.error('❌ All download methods failed:', { directError, proxyError });
          
          // 所有方法都失败
          setDownloadStates((prev) => ({
            ...prev,
            [key]: {
              isLoading: false,
              progress: 0,
              error: '下载失败：直接下载和代理下载都无法完成',
              blobUrl: null,
            },
          }));

          toast.error(`${format.toUpperCase()} 模型下载失败: 所有下载方法都无法完成`);
          return null;
        }
      }
    },
    [downloadStates]
  );

  const getDownloadState = useCallback(
    (url: string, format: string): DownloadState => {
      const key = `${format}-${url}`;
      return (
        downloadStates[key] || {
          isLoading: false,
          progress: 0,
          error: null,
          blobUrl: null,
        }
      );
    },
    [downloadStates]
  );

  const clearDownloads = useCallback(() => {
    // 清理所有blob URLs
    Object.values(downloadStates).forEach((state) => {
      if (state.blobUrl) {
        URL.revokeObjectURL(state.blobUrl);
      }
    });
    setDownloadStates({});
  }, [downloadStates]);

  return {
    downloadModel,
    getDownloadState,
    clearDownloads,
  };
}
