# Meshy AI SDK 集成指南

## 📋 概述

本文档提供了Meshy AI API的完整TypeScript SDK实现，包括所有端点、错误处理、类型定义和最佳实践。

## 🏗️ SDK 架构

### 核心客户端类

```typescript
// lib/meshy/client.ts
import { MeshyConfig, MeshyResponse, APIError } from './types';

export class MeshyClient {
  private apiKey: string;
  private baseURL = 'https://api.meshy.ai';
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(config: MeshyConfig) {
    this.apiKey = config.apiKey;
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.maxRetries) this.maxRetries = config.maxRetries;
    if (config.retryDelay) this.retryDelay = config.retryDelay;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          throw await this.handleError(response);
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        lastError = error as Error;
        
        // 不重试的错误
        if (this.shouldNotRetry(error)) {
          throw error;
        }
        
        // 等待后重试
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError!;
  }

  private async handleError(response: Response): Promise<APIError> {
    const errorData = await response.json().catch(() => ({}));
    
    return new APIError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData.code || 'UNKNOWN_ERROR',
      errorData
    );
  }

  private shouldNotRetry(error: any): boolean {
    // 不重试的HTTP状态码
    const noRetryStatuses = [400, 401, 402, 403, 404, 422];
    return error.status && noRetryStatuses.includes(error.status);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 余额查询
  async getBalance(): Promise<BalanceResponse> {
    return this.request<BalanceResponse>('/openapi/v1/balance');
  }

  // Text to 3D
  async textTo3D(params: TextTo3DParams): Promise<TaskResponse> {
    // 验证参数
    this.validateTextTo3DParams(params);
    
    return this.request<TaskResponse>('/openapi/v2/text-to-3d', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Image to 3D
  async imageTo3D(params: ImageTo3DParams): Promise<TaskResponse> {
    this.validateImageTo3DParams(params);
    
    return this.request<TaskResponse>('/openapi/v1/image-to-3d', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Retexture
  async retexture(params: RetextureParams): Promise<TaskResponse> {
    return this.request<TaskResponse>('/openapi/v1/text-to-texture', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Remesh
  async remesh(params: RemeshParams): Promise<TaskResponse> {
    return this.request<TaskResponse>('/openapi/v1/text-to-3d/{id}/remesh', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Auto-Rigging
  async autoRig(params: RiggingParams): Promise<TaskResponse> {
    return this.request<TaskResponse>('/openapi/v1/rigging', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // 任务状态查询
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    return this.request<TaskStatusResponse>(`/openapi/v2/text-to-3d/${taskId}`);
  }

  // 下载模型
  async downloadModel(
    downloadUrl: string, 
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength || '0', 10);
    let loaded = 0;

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is not readable');

    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      if (onProgress && total > 0) {
        onProgress((loaded / total) * 100);
      }
    }

    return new Blob(chunks);
  }

  // 参数验证
  private validateTextTo3DParams(params: TextTo3DParams): void {
    if (!params.prompt || params.prompt.length < 3) {
      throw new APIError('Prompt must be at least 3 characters long', 400, 'INVALID_PROMPT');
    }
    
    if (params.prompt.length > 600) {
      throw new APIError('Prompt must be less than 600 characters', 400, 'PROMPT_TOO_LONG');
    }
    
    if (!['preview', 'refine'].includes(params.mode)) {
      throw new APIError('Mode must be "preview" or "refine"', 400, 'INVALID_MODE');
    }
  }

  private validateImageTo3DParams(params: ImageTo3DParams): void {
    if (!params.image_url) {
      throw new APIError('Image URL is required', 400, 'MISSING_IMAGE_URL');
    }
    
    // 验证URL格式
    try {
      new URL(params.image_url);
    } catch {
      throw new APIError('Invalid image URL format', 400, 'INVALID_IMAGE_URL');
    }
  }
}
```

## 🎯 类型定义

```typescript
// lib/meshy/types.ts

// 配置接口
export interface MeshyConfig {
  apiKey: string;
  baseURL?: string;
  maxRetries?: number;
  retryDelay?: number;
}

// 错误类
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 基础响应接口
export interface MeshyResponse {
  success: boolean;
  message?: string;
}

// 余额响应
export interface BalanceResponse extends MeshyResponse {
  balance: number;
}

// 任务响应
export interface TaskResponse extends MeshyResponse {
  task_id: string;
  estimated_time?: number;
  credits_used?: number;
}

// 任务状态响应
export interface TaskStatusResponse {
  task_id: string;
  status: TaskStatus;
  progress: number;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  error_message?: string;
  result?: TaskResult;
}

// 任务状态枚举
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';

// 任务结果
export interface TaskResult {
  model_urls: {
    glb?: string;
    fbx?: string;
    obj?: string;
    usdz?: string;
    stl?: string;
    blend?: string;
  };
  preview_url?: string;
  thumbnail_url?: string;
  model_info?: {
    vertices: number;
    faces: number;
    file_size: number;
    dimensions: {
      x: number;
      y: number;
      z: number;
    };
  };
  pbr_maps?: {
    base_color?: string;
    metallic?: string;
    roughness?: string;
    normal?: string;
  };
}

// Text to 3D 参数
export interface TextTo3DParams {
  mode: 'preview' | 'refine';
  prompt: string;
  art_style?: 'realistic' | 'sculpture';
  negative_prompt?: string;
  seed?: number;
  ai_model?: 'meshy-4' | 'meshy-5';
  topology?: 'quad' | 'triangle';
  target_polycount?: number;
  should_remesh?: boolean;
  symmetry_mode?: 'off' | 'auto' | 'on';
}

// Image to 3D 参数
export interface ImageTo3DParams {
  image_url: string;
  should_texture?: boolean;
  ai_model?: 'meshy-4' | 'meshy-5';
  topology?: 'quad' | 'triangle';
  target_polycount?: number;
  symmetry_mode?: 'off' | 'auto' | 'on';
  enable_pbr?: boolean;
}

// Retexture 参数
export interface RetextureParams {
  input_task_id?: string;
  model_url?: string;
  text_style_prompt?: string;
  image_style_url?: string;
  ai_model?: 'meshy-4' | 'meshy-5';
  enable_original_uv?: boolean;
  enable_pbr?: boolean;
}

// Remesh 参数
export interface RemeshParams {
  input_task_id?: string;
  model_url?: string;
  target_formats?: string[];
  topology?: 'quad' | 'triangle';
  target_polycount?: number;
  resize_height?: number;
  origin_at?: 'bottom' | 'center';
}

// Rigging 参数
export interface RiggingParams {
  input_task_id?: string;
  model_url?: string;
  character_height?: number;
  texture_image_url?: string;
  animation_type?: 'walking' | 'running';
}

// 文件上传参数
export interface FileUploadParams {
  file: File;
  onProgress?: (progress: number) => void;
}

// 任务筛选参数
export interface TaskFilters {
  status?: TaskStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}
```

## 🛠️ 高级功能

### 文件上传处理

```typescript
// lib/meshy/upload.ts
export class MeshyUploadManager {
  constructor(private client: MeshyClient) {}

  async uploadImage(file: File): Promise<string> {
    // 验证文件类型
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      throw new APIError('Only JPG and PNG images are supported', 400, 'INVALID_FILE_TYPE');
    }

    // 验证文件大小 (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new APIError('Image file too large (max 10MB)', 400, 'FILE_TOO_LARGE');
    }

    // 转换为base64或上传到临时存储
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async uploadModel(file: File): Promise<string> {
    // 验证3D模型文件
    const supportedTypes = [
      'model/gltf-binary',
      'application/octet-stream',
      'model/obj',
      'model/fbx'
    ];

    if (!supportedTypes.includes(file.type) && !this.isValidModelFile(file.name)) {
      throw new APIError('Unsupported 3D model format', 400, 'INVALID_MODEL_FORMAT');
    }

    // 上传到临时存储并返回URL
    // 这里需要实现实际的文件上传逻辑
    return `https://temp-storage.example.com/${file.name}`;
  }

  private isValidModelFile(filename: string): boolean {
    const extensions = ['.glb', '.gltf', '.obj', '.fbx', '.stl'];
    return extensions.some(ext => filename.toLowerCase().endsWith(ext));
  }
}
```

### 批量操作管理

```typescript
// lib/meshy/batch.ts
export class MeshyBatchManager {
  private concurrencyLimit = 3;
  private queue: BatchOperation[] = [];
  private running: Set<Promise<any>> = new Set();

  constructor(private client: MeshyClient) {}

  async batchTextTo3D(
    prompts: string[],
    settings: Partial<TextTo3DParams> = {}
  ): Promise<BatchResult<TaskResponse>> {
    const operations = prompts.map(prompt => ({
      id: `text-to-3d-${Date.now()}-${Math.random()}`,
      operation: () => this.client.textTo3D({ ...settings, prompt, mode: 'preview' }),
      prompt,
    }));

    return this.executeBatch(operations);
  }

  async batchRemesh(
    taskIds: string[],
    settings: Partial<RemeshParams> = {}
  ): Promise<BatchResult<TaskResponse>> {
    const operations = taskIds.map(taskId => ({
      id: `remesh-${taskId}`,
      operation: () => this.client.remesh({ ...settings, input_task_id: taskId }),
      taskId,
    }));

    return this.executeBatch(operations);
  }

  private async executeBatch<T>(
    operations: BatchOperation[]
  ): Promise<BatchResult<T>> {
    const results: BatchResult<T> = {
      successful: [],
      failed: [],
      total: operations.length,
    };

    const semaphore = new Semaphore(this.concurrencyLimit);

    const promises = operations.map(async (op) => {
      await semaphore.acquire();
      
      try {
        const result = await op.operation();
        results.successful.push({
          id: op.id,
          result,
          operation: op,
        });
      } catch (error) {
        results.failed.push({
          id: op.id,
          error: error as APIError,
          operation: op,
        });
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(promises);
    return results;
  }
}

// 信号量实现
class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      resolve();
    } else {
      this.permits++;
    }
  }
}

interface BatchOperation {
  id: string;
  operation: () => Promise<any>;
  [key: string]: any;
}

interface BatchResult<T> {
  successful: Array<{
    id: string;
    result: T;
    operation: BatchOperation;
  }>;
  failed: Array<{
    id: string;
    error: APIError;
    operation: BatchOperation;
  }>;
  total: number;
}
```

### 缓存和持久化

```typescript
// lib/meshy/cache.ts
export class MeshyCacheManager {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private defaultTTL = 1000 * 60 * 10; // 10分钟

  set<T>(key: string, value: T, ttl = this.defaultTTL): void {
    // 清理过期缓存
    this.cleanup();

    // 如果缓存满了，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
      accessCount: 0,
      lastAccess: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    return entry.value as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计
  getStats(): CacheStats {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiry) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      size: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.maxSize,
    };
  }
}

interface CacheEntry {
  value: any;
  expiry: number;
  accessCount: number;
  lastAccess: number;
}

interface CacheStats {
  size: number;
  validEntries: number;
  expiredEntries: number;
  maxSize: number;
}
```

## 🔧 实用工具

### 费用计算器

```typescript
// lib/meshy/cost-calculator.ts
export class MeshyCostCalculator {
  private readonly PRICING = {
    'text-to-3d-preview': 5,
    'text-to-3d-refine': 10,
    'image-to-3d': 5,
    'image-to-3d-textured': 15,
    'retexture': 10,
    'remesh': 5,
    'auto-rigging': 5,
    'animation': 3,
  } as const;

  calculateTextTo3DCost(includeTexture: boolean = true): number {
    const previewCost = this.PRICING['text-to-3d-preview'];
    const refineCost = includeTexture ? this.PRICING['text-to-3d-refine'] : 0;
    return previewCost + refineCost;
  }

  calculateImageTo3DCost(includeTexture: boolean = false): number {
    return includeTexture 
      ? this.PRICING['image-to-3d-textured']
      : this.PRICING['image-to-3d'];
  }

  calculateBatchCost(operations: BatchCostItem[]): BatchCostBreakdown {
    const breakdown = operations.map(item => ({
      operation: item.operation,
      quantity: item.quantity,
      unitCost: this.PRICING[item.operation],
      totalCost: this.PRICING[item.operation] * item.quantity,
    }));

    const totalCost = breakdown.reduce((sum, item) => sum + item.totalCost, 0);

    return {
      breakdown,
      totalCost,
      estimatedTime: this.estimateProcessingTime(operations),
    };
  }

  private estimateProcessingTime(operations: BatchCostItem[]): number {
    const TIME_ESTIMATES = {
      'text-to-3d-preview': 60, // 1分钟
      'text-to-3d-refine': 120, // 2分钟
      'image-to-3d': 90,
      'image-to-3d-textured': 180,
      'retexture': 120,
      'remesh': 30,
      'auto-rigging': 60,
      'animation': 30,
    };

    return operations.reduce((total, item) => {
      return total + (TIME_ESTIMATES[item.operation] * item.quantity);
    }, 0);
  }
}

interface BatchCostItem {
  operation: keyof typeof MeshyCostCalculator.prototype.PRICING;
  quantity: number;
}

interface BatchCostBreakdown {
  breakdown: Array<{
    operation: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  totalCost: number;
  estimatedTime: number; // 秒
}
```

### 任务管理器

```typescript
// lib/meshy/task-manager.ts
export class MeshyTaskManager {
  private activePolls = new Map<string, NodeJS.Timeout>();
  private taskCallbacks = new Map<string, TaskCallback[]>();

  constructor(private client: MeshyClient) {}

  async startTaskPolling(
    taskId: string,
    onUpdate: TaskCallback,
    options: PollingOptions = {}
  ): Promise<void> {
    const {
      interval = 3000,
      maxAttempts = 100,
      onComplete,
      onError,
    } = options;

    // 停止现有轮询
    this.stopTaskPolling(taskId);

    // 注册回调
    if (!this.taskCallbacks.has(taskId)) {
      this.taskCallbacks.set(taskId, []);
    }
    this.taskCallbacks.get(taskId)!.push(onUpdate);

    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        const status = await this.client.getTaskStatus(taskId);
        
        // 调用所有回调
        const callbacks = this.taskCallbacks.get(taskId) || [];
        callbacks.forEach(callback => callback(status));

        // 检查是否完成
        if (status.status === 'SUCCEEDED') {
          this.stopTaskPolling(taskId);
          onComplete?.(status);
          return;
        }

        if (status.status === 'FAILED') {
          this.stopTaskPolling(taskId);
          onError?.(new APIError(
            status.error_message || 'Task failed',
            500,
            'TASK_FAILED',
            status
          ));
          return;
        }

        // 检查最大尝试次数
        if (attempts >= maxAttempts) {
          this.stopTaskPolling(taskId);
          onError?.(new APIError(
            'Task polling timeout',
            408,
            'POLLING_TIMEOUT'
          ));
          return;
        }

        // 调整轮询间隔
        const nextInterval = this.calculateNextInterval(status, interval);
        const timeoutId = setTimeout(poll, nextInterval);
        this.activePolls.set(taskId, timeoutId);

      } catch (error) {
        this.stopTaskPolling(taskId);
        onError?.(error as APIError);
      }
    };

    // 开始轮询
    const timeoutId = setTimeout(poll, 1000); // 首次立即开始
    this.activePolls.set(taskId, timeoutId);
  }

  stopTaskPolling(taskId: string): void {
    const timeoutId = this.activePolls.get(taskId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activePolls.delete(taskId);
    }
    this.taskCallbacks.delete(taskId);
  }

  stopAllPolling(): void {
    for (const taskId of this.activePolls.keys()) {
      this.stopTaskPolling(taskId);
    }
  }

  private calculateNextInterval(status: TaskStatusResponse, baseInterval: number): number {
    // 根据任务状态调整轮询间隔
    switch (status.status) {
      case 'PENDING':
        return baseInterval * 2; // 等待中，降低频率
      case 'IN_PROGRESS':
        return baseInterval; // 进行中，正常频率
      default:
        return baseInterval;
    }
  }

  // 批量任务管理
  async startBatchPolling(
    taskIds: string[],
    onUpdate: (taskId: string, status: TaskStatusResponse) => void,
    onAllComplete?: (results: Map<string, TaskStatusResponse>) => void
  ): Promise<void> {
    const results = new Map<string, TaskStatusResponse>();
    let completedCount = 0;

    const checkCompletion = () => {
      if (completedCount === taskIds.length) {
        onAllComplete?.(results);
      }
    };

    for (const taskId of taskIds) {
      this.startTaskPolling(taskId, (status) => {
        onUpdate(taskId, status);
        
        if (status.status === 'SUCCEEDED' || status.status === 'FAILED') {
          results.set(taskId, status);
          completedCount++;
          checkCompletion();
        }
      });
    }
  }
}

type TaskCallback = (status: TaskStatusResponse) => void;

interface PollingOptions {
  interval?: number;
  maxAttempts?: number;
  onComplete?: (status: TaskStatusResponse) => void;
  onError?: (error: APIError) => void;
}
```

## 🚀 使用示例

### 基础使用

```typescript
// 初始化客户端
const meshyClient = new MeshyClient({
  apiKey: process.env.MESHY_API_KEY!,
});

// 查询余额
const balance = await meshyClient.getBalance();
console.log(`Available credits: ${balance.balance}`);

// 生成3D模型
const task = await meshyClient.textTo3D({
  mode: 'preview',
  prompt: 'A cute robot with blue eyes',
  art_style: 'realistic',
  ai_model: 'meshy-5',
});

console.log(`Task created: ${task.task_id}`);
```

### 高级使用

```typescript
// 使用任务管理器
const taskManager = new MeshyTaskManager(meshyClient);

await taskManager.startTaskPolling(
  task.task_id,
  (status) => {
    console.log(`Progress: ${status.progress}%`);
  },
  {
    onComplete: (finalStatus) => {
      console.log('Generation complete!', finalStatus.result);
    },
    onError: (error) => {
      console.error('Generation failed:', error.message);
    },
  }
);

// 批量处理
const batchManager = new MeshyBatchManager(meshyClient);

const batchResult = await batchManager.batchTextTo3D([
  'A red car',
  'A blue house',
  'A green tree',
], {
  art_style: 'realistic',
  ai_model: 'meshy-5',
});

console.log(`Successful: ${batchResult.successful.length}`);
console.log(`Failed: ${batchResult.failed.length}`);
```

---

*SDK版本: v1.0*  
*更新时间: 2025-08-16*  
*兼容Meshy API: v2*