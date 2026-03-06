/**
 * 配置管理器核心类（去敏演示版）
 * 
 * 设计目标：
 * 1. 三级缓存架构（内存 → 本地存储 → 远程/本地配置）
 * 2. 支持运行时配置热更新
 * 3. 向后兼容，支持渐进式迁移
 */

export interface IConfigLoadOptions {
  forceRefresh?: boolean;
  timeout?: number;
  fallback?: any;
}

export interface IMemoryCacheItem<T> {
  data: T;
  timestamp: number;
  version: number;
}

/**
 * 配置管理器
 * 采用单例模式，确保全局配置一致性
 */
export class ConfigManager {
  private static instance: ConfigManager;
  
  // 内存缓存（WeakMap 防止内存泄漏）
  private memoryCache = new Map<string, IMemoryCacheItem<any>>();
  
  // 配置变更监听器
  private listeners = new Map<string, Set<(newData: any, oldData?: any) => void>>();
  
  // 缓存版本号（用于缓存失效）
  private cacheVersion = 1;
  
  // 常量定义
  private static readonly STORAGE_KEY = 'config_driven_cache';
  private static readonly CACHE_VERSION_KEY = 'config_driven_version';
  private static readonly CACHE_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000; // 7天
  
  /** 获取单例 */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
  
  /**
   * 获取配置（带多级缓存）
   * 
   * 读取优先级：
   * 1. 内存缓存（最快，会话级）
   * 2. 本地存储（较快，持久化）
   * 3. 数据源（兜底）
   */
  async getConfig<T>(
    key: string,
    loader: () => Promise<T>,
    options: IConfigLoadOptions = {}
  ): Promise<{ data: T; fromCache: boolean; source: string }> {
    const { forceRefresh = false, fallback } = options;
    
    try {
      // L1: 内存缓存
      if (!forceRefresh) {
        const memoryResult = this.getFromMemory<T>(key);
        if (memoryResult) {
          this.backgroundRefresh(key, loader);
          return {
            data: memoryResult.data,
            fromCache: true,
            source: 'memory',
          };
        }
      }
      
      // L2: 本地存储
      if (!forceRefresh) {
        const storageResult = this.getFromStorage<T>(key);
        if (storageResult) {
          this.setMemoryCache(key, storageResult.data);
          this.backgroundRefresh(key, loader);
          return {
            data: storageResult.data,
            fromCache: true,
            source: 'storage',
          };
        }
      }
      
      // L3: 加载新配置
      const data = await loader();
      this.setConfig(key, data);
      return {
        data,
        fromCache: false,
        source: 'loader',
      };
    } catch (error) {
      console.error(`[ConfigManager] 加载配置失败: ${key}`, error);
      
      // 容错：使用过期缓存
      const staleData = this.getFromStorage<T>(key, true);
      if (staleData) {
        return {
          data: staleData.data,
          fromCache: true,
          source: 'stale',
        };
      }
      
      // 使用 fallback
      if (fallback !== undefined) {
        return {
          data: fallback,
          fromCache: false,
          source: 'fallback',
        };
      }
      
      throw error;
    }
  }
  
  /**
   * 设置配置（更新内存 + 本地存储）
   */
  setConfig<T>(key: string, data: T): void {
    const oldData = this.memoryCache.get(key)?.data;
    this.setMemoryCache(key, data);
    this.setStorageCache(key, data);
    this.notifyChange(key, data, oldData);
  }
  
  /**
   * 从内存缓存获取
   */
  private getFromMemory<T>(key: string): IMemoryCacheItem<T> | null {
    return this.memoryCache.get(key) || null;
  }
  
  /**
   * 从本地存储获取
   */
  private getFromStorage<T>(key: string, ignoreExpire = false): IMemoryCacheItem<T> | null {
    try {
      // 检查版本
      const storedVersion = uni.getStorageSync(ConfigManager.CACHE_VERSION_KEY);
      if (storedVersion !== this.cacheVersion) {
        this.clearStorageCache();
        return null;
      }
      
      const storageKey = `${ConfigManager.STORAGE_KEY}_${key}`;
      const stored = uni.getStorageSync(storageKey);
      if (!stored) return null;
      
      const item: IMemoryCacheItem<T> = JSON.parse(stored);
      
      // 检查过期
      if (!ignoreExpire) {
        const age = Date.now() - item.timestamp;
        if (age > ConfigManager.CACHE_EXPIRE_TIME) {
          return null;
        }
      }
      
      return item;
    } catch (error) {
      console.error(`[ConfigManager] 读取本地缓存失败: ${key}`, error);
      return null;
    }
  }
  
  /**
   * 设置内存缓存
   */
  private setMemoryCache<T>(key: string, data: T): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      version: this.cacheVersion,
    });
  }
  
  /**
   * 设置本地存储缓存
   */
  private setStorageCache<T>(key: string, data: T): void {
    try {
      const storageKey = `${ConfigManager.STORAGE_KEY}_${key}`;
      const item: IMemoryCacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: this.cacheVersion,
      };
      uni.setStorageSync(storageKey, JSON.stringify(item));
      uni.setStorageSync(ConfigManager.CACHE_VERSION_KEY, this.cacheVersion);
    } catch (error) {
      console.error(`[ConfigManager] 写入本地缓存失败: ${key}`, error);
    }
  }
  
  /**
   * 后台静默刷新
   */
  private async backgroundRefresh<T>(key: string, loader: () => Promise<T>): Promise<void> {
    try {
      const refreshingKey = `_refreshing_${key}`;
      if (this.memoryCache.has(refreshingKey)) return;
      
      this.memoryCache.set(refreshingKey, { data: true, timestamp: Date.now(), version: 0 });
      
      const data = await loader();
      this.setConfig(key, data);
      
      this.memoryCache.delete(refreshingKey);
    } catch (error) {
      console.warn(`[ConfigManager] 后台刷新失败: ${key}`, error);
    }
  }
  
  /**
   * 订阅配置变更
   */
  subscribe<T>(key: string, listener: (newData: T, oldData?: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
    
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }
  
  /**
   * 通知配置变更
   */
  private notifyChange<T>(key: string, newData: T, oldData?: T): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((listener) => {
        try {
          listener(newData, oldData);
        } catch (error) {
          console.error(`[ConfigManager] 监听器执行失败: ${key}`, error);
        }
      });
    }
  }
  
  /**
   * 清除缓存
   */
  clearCache(key?: string): void {
    if (key) {
      this.memoryCache.delete(key);
      try {
        uni.removeStorageSync(`${ConfigManager.STORAGE_KEY}_${key}`);
      } catch (error) {
        console.error(error);
      }
    } else {
      this.memoryCache.clear();
      this.clearStorageCache();
    }
  }
  
  /**
   * 清除本地存储缓存
   */
  private clearStorageCache(): void {
    try {
      const keys = uni.getStorageInfoSync().keys;
      keys.forEach((key: string) => {
        if (key.startsWith(ConfigManager.STORAGE_KEY)) {
          uni.removeStorageSync(key);
        }
      });
    } catch (error) {
      console.error('[ConfigManager] 清除缓存失败', error);
    }
  }
}

export const getConfigManager = () => ConfigManager.getInstance();
