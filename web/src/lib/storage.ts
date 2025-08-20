// localStorage工具函数 - 安全的SSR兼容版本
const STORAGE_KEYS = {
  CURRENT_TASK: 'meshy_current_task',
  PREVIEW_TASK_ID: 'meshy_preview_task_id',
  TEXTURE_TASK_ID: 'meshy_texture_task_id',
  LAST_SUCCESSFUL_MODEL: 'meshy_last_model',
  GENERATION_HISTORY: 'meshy_generation_history',
} as const;

// 检查是否在客户端环境
const isClient = typeof window !== 'undefined';

export const storage = {
  // 保存当前任务
  saveCurrentTask(taskId: string): void {
    if (!isClient) return;
    try {
      if (taskId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_TASK, taskId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_TASK);
      }
    } catch (e) {
      console.error('Failed to save task ID:', e);
    }
  },

  // 获取当前任务 - SSR安全
  getCurrentTask(): string | null {
    if (!isClient) return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_TASK);
    } catch (e) {
      console.error('Failed to get task ID:', e);
      return null;
    }
  },

  // 保存预览任务ID（用于refine模式）
  savePreviewTaskId(taskId: string): void {
    if (!isClient) return;
    try {
      if (taskId) {
        localStorage.setItem(STORAGE_KEYS.PREVIEW_TASK_ID, taskId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.PREVIEW_TASK_ID);
      }
    } catch (e) {
      console.error('Failed to save preview task ID:', e);
    }
  },

  // 获取预览任务ID - SSR安全
  getPreviewTaskId(): string | null {
    if (!isClient) return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.PREVIEW_TASK_ID);
    } catch (e) {
      console.error('Failed to get preview task ID:', e);
      return null;
    }
  },

  // 保存纹理任务ID
  saveTextureTaskId(taskId: string): void {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TEXTURE_TASK_ID, taskId);
    } catch (e) {
      console.error('Failed to save texture task ID:', e);
    }
  },

  // 获取纹理任务ID - SSR安全
  getTextureTaskId(): string | null {
    if (!isClient) return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.TEXTURE_TASK_ID);
    } catch (e) {
      console.error('Failed to get texture task ID:', e);
      return null;
    }
  },

  // 保存最后成功的模型数据
  saveLastSuccessfulModel(data: any): void {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SUCCESSFUL_MODEL, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save model data:', e);
    }
  },

  // 获取最后成功的模型数据 - SSR安全
  getLastSuccessfulModel(): any | null {
    if (!isClient) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_SUCCESSFUL_MODEL);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get model data:', e);
      return null;
    }
  },

  // 保存生成历史
  saveGenerationHistory(history: string[]): void {
    if (!isClient) return;
    try {
      // 只保留最近50个
      const limitedHistory = history.slice(-50);
      localStorage.setItem(STORAGE_KEYS.GENERATION_HISTORY, JSON.stringify(limitedHistory));
    } catch (e) {
      console.error('Failed to save generation history:', e);
    }
  },

  // 获取生成历史 - SSR安全
  getGenerationHistory(): string[] {
    if (!isClient) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GENERATION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to get generation history:', e);
      return [];
    }
  },

  // 清除所有存储
  clearAll(): void {
    if (!isClient) return;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  }
};