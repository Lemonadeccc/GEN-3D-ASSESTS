# TanStack Query 集成架构设计

## 📋 概述

TanStack Query (React Query) 将作为我们3D NFT平台的核心数据获取和状态管理解决方案，与Meshy AI API、Web3接口和IPFS服务无缝集成。

## 🎯 集成目标

### 1. 数据获取优化
- **智能缓存**: Meshy API响应的多层缓存策略
- **后台更新**: 任务状态的自动轮询和更新
- **错误处理**: 网络错误和API限制的优雅处理
- **离线支持**: 缓存数据的离线访问

### 2. 用户体验提升
- **乐观更新**: 即时UI反馈
- **加载状态**: 细粒度的加载状态管理
- **错误恢复**: 自动重试和错误恢复机制
- **数据同步**: 实时数据同步和更新

## 🏗️ 架构设计

### Query Client 配置

```typescript
// lib/react-query/client.ts
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Meshy API 特定配置
      staleTime: 1000 * 60 * 5, // 5分钟
      cacheTime: 1000 * 60 * 30, // 30分钟
      retry: (failureCount, error) => {
        // Meshy API 特定错误处理
        if (error.status === 402) return false; // 余额不足，不重试
        if (error.status === 429) return failureCount < 2; // 限流，最多重试2次
        if (error.status === 404) return false; // 资源不存在
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // 生成任务不重试，避免重复计费
        if (error.endpoint?.includes('text-to-3d')) return false;
        return failureCount < 2;
      },
    },
  },
});

// 本地存储持久化
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'gen3d-cache',
});

// 持久化查询
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24小时
});
```

### Provider 设置

```typescript
// app/providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    // 配置同上
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

## 🔧 Meshy API 查询设计

### 查询工厂模式

```typescript
// lib/react-query/meshy-queries.ts
import { meshyClient } from '@/lib/meshy/client';

export const meshyQueries = {
  // 查询键工厂
  keys: {
    all: ['meshy'] as const,
    balance: () => [...meshyQueries.keys.all, 'balance'] as const,
    tasks: () => [...meshyQueries.keys.all, 'tasks'] as const,
    task: (id: string) => [...meshyQueries.keys.tasks(), id] as const,
    userTasks: (userId: string) => [...meshyQueries.keys.tasks(), 'user', userId] as const,
    models: () => [...meshyQueries.keys.all, 'models'] as const,
    model: (id: string) => [...meshyQueries.keys.models(), id] as const,
  },

  // 余额查询
  balance: () => ({
    queryKey: meshyQueries.keys.balance(),
    queryFn: () => meshyClient.getBalance(),
    staleTime: 1000 * 60 * 2, // 2分钟
    cacheTime: 1000 * 60 * 10, // 10分钟
  }),

  // 任务状态查询 (轮询)
  taskStatus: (taskId: string) => ({
    queryKey: meshyQueries.keys.task(taskId),
    queryFn: () => meshyClient.getTaskStatus(taskId),
    enabled: !!taskId,
    refetchInterval: (data) => {
      // 根据任务状态决定轮询间隔
      if (!data) return 3000;
      
      switch (data.status) {
        case 'SUCCEEDED':
        case 'FAILED':
          return false; // 停止轮询
        case 'PENDING':
          return 5000; // 5秒轮询
        case 'IN_PROGRESS':
          return 2000; // 2秒轮询
        default:
          return 3000;
      }
    },
    refetchIntervalInBackground: true, // 后台轮询
  }),

  // 用户任务历史
  userTasks: (userId: string, filters?: TaskFilters) => ({
    queryKey: [...meshyQueries.keys.userTasks(userId), filters],
    queryFn: () => meshyClient.getUserTasks(userId, filters),
    staleTime: 1000 * 60 * 5, // 5分钟
    keepPreviousData: true, // 分页时保持前一页数据
  }),

  // 模型详情
  modelDetails: (modelId: string) => ({
    queryKey: meshyQueries.keys.model(modelId),
    queryFn: () => meshyClient.getModelDetails(modelId),
    staleTime: 1000 * 60 * 10, // 10分钟
  }),
};
```

### 自定义Hooks

```typescript
// hooks/use-meshy-queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meshyQueries } from '@/lib/react-query/meshy-queries';
import { meshyClient } from '@/lib/meshy/client';
import { toast } from '@/components/ui/use-toast';

// 余额查询
export function useBalance() {
  return useQuery({
    ...meshyQueries.balance(),
    onError: (error) => {
      console.error('Failed to fetch balance:', error);
      toast({
        title: "余额查询失败",
        description: "无法获取账户余额，请刷新页面重试",
        variant: "destructive",
      });
    },
  });
}

// 任务状态查询
export function useTaskStatus(taskId: string) {
  return useQuery({
    ...meshyQueries.taskStatus(taskId),
    onSuccess: (data) => {
      if (data.status === 'SUCCEEDED') {
        toast({
          title: "生成完成！",
          description: "您的3D模型已成功生成",
        });
      } else if (data.status === 'FAILED') {
        toast({
          title: "生成失败",
          description: data.error_message || "模型生成过程中发生错误",
          variant: "destructive",
        });
      }
    },
  });
}

// Text to 3D 生成
export function useTextTo3D() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: TextTo3DParams) => meshyClient.textTo3D(params),
    onMutate: async (params) => {
      // 乐观更新：立即显示生成中状态
      const tempTask = {
        task_id: `temp-${Date.now()}`,
        status: 'PENDING' as const,
        prompt: params.prompt,
        created_at: new Date().toISOString(),
      };
      
      // 取消相关查询避免覆盖乐观更新
      await queryClient.cancelQueries(meshyQueries.keys.userTasks('current-user'));
      
      // 快照当前数据
      const previousTasks = queryClient.getQueryData(meshyQueries.keys.userTasks('current-user'));
      
      // 乐观更新用户任务列表
      queryClient.setQueryData(
        meshyQueries.keys.userTasks('current-user'),
        (old: any) => old ? [tempTask, ...old] : [tempTask]
      );
      
      return { previousTasks, tempTask };
    },
    onSuccess: (data, variables, context) => {
      // 移除临时任务，添加真实任务
      queryClient.setQueryData(
        meshyQueries.keys.userTasks('current-user'),
        (old: any) => {
          if (!old) return [data];
          return old.map((task: any) => 
            task.task_id === context?.tempTask.task_id ? data : task
          );
        }
      );
      
      // 开始轮询新任务状态
      queryClient.prefetchQuery(meshyQueries.taskStatus(data.task_id));
      
      // 更新余额
      queryClient.invalidateQueries(meshyQueries.keys.balance());
      
      toast({
        title: "生成任务已启动",
        description: `任务ID: ${data.task_id}`,
      });
    },
    onError: (error, variables, context) => {
      // 回滚乐观更新
      if (context?.previousTasks) {
        queryClient.setQueryData(
          meshyQueries.keys.userTasks('current-user'),
          context.previousTasks
        );
      }
      
      toast({
        title: "生成失败",
        description: error.message || "无法启动3D模型生成",
        variant: "destructive",
      });
    },
  });
}

// 图片转3D生成
export function useImageTo3D() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: ImageTo3DParams) => meshyClient.imageTo3D(params),
    onSuccess: (data) => {
      // 更新相关查询
      queryClient.invalidateQueries(meshyQueries.keys.userTasks('current-user'));
      queryClient.invalidateQueries(meshyQueries.keys.balance());
      
      // 开始轮询任务状态
      queryClient.prefetchQuery(meshyQueries.taskStatus(data.task_id));
    },
  });
}

// Retexture 操作
export function useRetexture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: RetextureParams) => meshyClient.retexture(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries(meshyQueries.keys.balance());
      queryClient.prefetchQuery(meshyQueries.taskStatus(data.task_id));
      
      toast({
        title: "重新纹理化已开始",
        description: "正在为您的模型生成新纹理",
      });
    },
  });
}

// Remesh 操作
export function useRemesh() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: RemeshParams) => meshyClient.remesh(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries(meshyQueries.keys.balance());
      queryClient.prefetchQuery(meshyQueries.taskStatus(data.task_id));
    },
  });
}

// Auto-Rigging 操作
export function useAutoRigging() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: RiggingParams) => meshyClient.autoRig(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries(meshyQueries.keys.balance());
      queryClient.prefetchQuery(meshyQueries.taskStatus(data.task_id));
      
      toast({
        title: "自动绑定已开始",
        description: "正在为您的角色创建骨骼系统",
      });
    },
  });
}
```

## 🔄 Web3 集成查询

```typescript
// hooks/use-web3-queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useBalance } from 'wagmi';

export const web3Queries = {
  keys: {
    all: ['web3'] as const,
    balance: (address: string) => [...web3Queries.keys.all, 'balance', address] as const,
    nfts: (address: string) => [...web3Queries.keys.all, 'nfts', address] as const,
    nft: (tokenId: string) => [...web3Queries.keys.all, 'nft', tokenId] as const,
  },
};

// 用户NFT收藏查询
export function useUserNFTs() {
  const { address } = useAccount();
  
  return useQuery({
    queryKey: web3Queries.keys.nfts(address || ''),
    queryFn: () => nftContract.getUserTokens(address!),
    enabled: !!address,
    staleTime: 1000 * 60 * 2, // 2分钟
  });
}

// NFT铸造
export function useMintNFT() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  
  return useMutation({
    mutationFn: async (params: MintParams) => {
      // 1. 上传模型到IPFS
      const modelHash = await ipfsClient.uploadModel(params.modelFile);
      
      // 2. 创建并上传元数据
      const metadata = createNFTMetadata(params, modelHash);
      const metadataHash = await ipfsClient.uploadMetadata(metadata);
      
      // 3. 调用智能合约铸造
      return nftContract.mint(address!, metadataHash, params.price);
    },
    onSuccess: (data) => {
      // 更新用户NFT列表
      queryClient.invalidateQueries(web3Queries.keys.nfts(address || ''));
      
      // 更新余额
      queryClient.invalidateQueries(['balance', address]);
      
      toast({
        title: "NFT铸造成功！",
        description: `Token ID: ${data.tokenId}`,
      });
    },
  });
}
```

## 📊 缓存策略

### 分层缓存设计

```typescript
// lib/react-query/cache-strategies.ts

// 1. 内存缓存 (React Query)
const memoryCache = {
  // 余额: 短时间缓存，频繁更新
  balance: { staleTime: 2 * 60 * 1000, cacheTime: 10 * 60 * 1000 },
  
  // 任务状态: 不缓存，实时轮询
  taskStatus: { staleTime: 0, cacheTime: 5 * 60 * 1000 },
  
  // 用户任务: 中等缓存时间
  userTasks: { staleTime: 5 * 60 * 1000, cacheTime: 30 * 60 * 1000 },
  
  // 模型详情: 长时间缓存
  modelDetails: { staleTime: 10 * 60 * 1000, cacheTime: 60 * 60 * 1000 },
  
  // NFT数据: 长时间缓存
  nftData: { staleTime: 10 * 60 * 1000, cacheTime: 60 * 60 * 1000 },
};

// 2. 本地存储缓存
const persistentCache = {
  // 用户偏好设置
  userPreferences: 'localStorage',
  
  // 模型预览缓存
  modelPreviews: 'indexedDB',
  
  // 任务历史
  taskHistory: 'localStorage',
};

// 3. 预取策略
export const prefetchStrategies = {
  // 用户登录时预取
  onUserLogin: async (userId: string, queryClient: QueryClient) => {
    await Promise.all([
      queryClient.prefetchQuery(meshyQueries.balance()),
      queryClient.prefetchQuery(meshyQueries.userTasks(userId)),
      queryClient.prefetchQuery(web3Queries.keys.nfts(userId)),
    ]);
  },
  
  // 任务创建时预取相关数据
  onTaskCreate: async (taskId: string, queryClient: QueryClient) => {
    // 立即开始轮询任务状态
    queryClient.prefetchQuery(meshyQueries.taskStatus(taskId));
  },
  
  // 页面切换时预取
  onRouteChange: async (route: string, queryClient: QueryClient) => {
    switch (route) {
      case '/generate':
        queryClient.prefetchQuery(meshyQueries.balance());
        break;
      case '/collection':
        queryClient.prefetchQuery(web3Queries.keys.nfts('current-user'));
        break;
    }
  },
};
```

## 🔄 实时数据同步

### WebSocket 集成

```typescript
// lib/react-query/websocket-sync.ts
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // 连接WebSocket (如果Meshy支持)
    const ws = new WebSocket(process.env.NEXT_PUBLIC_MESHY_WS_URL || '');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'TASK_STATUS_UPDATE':
          // 更新任务状态
          queryClient.setQueryData(
            meshyQueries.keys.task(data.taskId),
            data.status
          );
          break;
          
        case 'BALANCE_UPDATE':
          // 更新余额
          queryClient.setQueryData(
            meshyQueries.keys.balance(),
            data.balance
          );
          break;
          
        case 'NEW_TASK_CREATED':
          // 更新用户任务列表
          queryClient.invalidateQueries(meshyQueries.keys.userTasks('current-user'));
          break;
      }
    };
    
    return () => ws.close();
  }, [queryClient]);
}
```

## 🚀 性能优化

### 查询优化技术

```typescript
// lib/react-query/optimizations.ts

// 1. 查询去重
export const dedupedQueries = {
  balance: () => ({
    ...meshyQueries.balance(),
    // 同时多个组件请求余额时，只发送一次请求
    staleTime: 1000 * 60 * 2,
  }),
};

// 2. 选择性数据订阅
export function useTaskProgress(taskId: string) {
  return useQuery({
    ...meshyQueries.taskStatus(taskId),
    // 只订阅进度变化
    select: (data) => ({
      progress: data.progress,
      status: data.status,
    }),
  });
}

// 3. 分页优化
export function useInfiniteUserTasks(userId: string) {
  return useInfiniteQuery({
    queryKey: [...meshyQueries.keys.userTasks(userId), 'infinite'],
    queryFn: ({ pageParam = 1 }) => 
      meshyClient.getUserTasks(userId, { page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 5,
  });
}

// 4. 错误边界集成
export function withQueryErrorBoundary<T>(
  Component: React.ComponentType<T>
) {
  return function WrappedComponent(props: T) {
    return (
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset}>
            <Component {...props} />
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    );
  };
}
```

## 📱 离线支持

```typescript
// lib/react-query/offline-support.ts
import { useNetworkState } from '@/hooks/use-network-state';

export function useOfflineSync() {
  const { isOnline } = useNetworkState();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (isOnline) {
      // 网络恢复时，重新获取所有失效的查询
      queryClient.refetchQueries({
        type: 'all',
        stale: true,
      });
    }
  }, [isOnline, queryClient]);
  
  return {
    isOnline,
    // 离线时可用的缓存数据
    getCachedData: (queryKey: any[]) => queryClient.getQueryData(queryKey),
  };
}
```

---

*架构版本: v1.0*  
*更新时间: 2025-08-16*  
*TanStack Query版本: v5*