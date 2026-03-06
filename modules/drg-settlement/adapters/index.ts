/**
 * DRG医保结算与病案管理模块 - 适配器层
 * 
 * 本模块通过适配器层与原项目进行对接，实现平滑集成
 */

import type { IPatientInfo } from '../types';

// ==================== 用户适配器 ====================

/**
 * 用户信息适配器
 * 从原项目获取用户信息
 */
export const userAdapter = {
  /**
   * 从Pinia Store获取用户信息
   * @returns 用户信息
   */
  fromPinia: (): Partial<IPatientInfo> => {
    try {
      // 尝试从原项目的Pinia Store获取用户信息
      // 这里需要根据原项目的实际Store结构进行调整
      // 使用 typeof window 检查环境，避免在某些构建环境中报错
      if (typeof window !== 'undefined' && (window as any).useUserStore) {
        const userStore = (window as any).useUserStore();
        if (userStore) {
          return {
            patientId: userStore.patientId || userStore.memberId,
            name: userStore.name || userStore.userName,
            idCard: userStore.idCard,
            phone: userStore.phone,
          };
        }
      }
    } catch (error) {
      console.warn('[DRG Adapter] Failed to get user from Pinia:', error);
    }
    return {};
  },

  /**
   * 从本地存储获取用户信息
   * @returns 用户信息
   */
  fromStorage: (): Partial<IPatientInfo> => {
    try {
      return {
        patientId: uni.getStorageSync('patientId') || uni.getStorageSync('memberId'),
        name: uni.getStorageSync('userName') || uni.getStorageSync('name'),
        idCard: uni.getStorageSync('idCard'),
        phone: uni.getStorageSync('phone'),
      };
    } catch (error) {
      console.warn('[DRG Adapter] Failed to get user from storage:', error);
      return {};
    }
  },

  /**
   * 获取用户信息（自动选择来源）
   * @returns 用户信息
   */
  get: (): Partial<IPatientInfo> => {
    // 优先从Pinia获取，失败则从Storage获取
    const fromPinia = userAdapter.fromPinia();
    if (fromPinia.patientId) {
      return fromPinia;
    }
    return userAdapter.fromStorage();
  },
};

// ==================== 请求适配器 ====================

/**
 * 请求适配器
 * 复用原项目的请求封装
 */
export const requestAdapter = {
  /**
   * 发起请求
   * @param options 请求配置
   * @returns 响应数据
   */
  request: async <T = any>(options: {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    headers?: Record<string, string>;
  }): Promise<T> => {
    try {
      // 尝试使用原项目的API封装
      // 使用 typeof window 检查环境
      if (typeof window !== 'undefined' && (window as any).api) {
        const api = (window as any).api;
        if (typeof api.request === 'function') {
          return await api.request(options);
        }
      }
    } catch (error) {
      console.warn('[DRG Adapter] Failed to use project API:', error);
    }

    // 降级使用uni.request
    return new Promise((resolve, reject) => {
      uni.request({
        url: options.url,
        method: options.method || 'GET',
        data: options.data,
        header: options.headers,
        success: (res) => resolve(res.data as T),
        fail: reject,
      });
    });
  },

  /**
   * GET请求
   */
  get: <T = any>(url: string, data?: any): Promise<T> => {
    return requestAdapter.request<T>({ url, method: 'GET', data });
  },

  /**
   * POST请求
   */
  post: <T = any>(url: string, data?: any): Promise<T> => {
    return requestAdapter.request<T>({ url, method: 'POST', data });
  },
};

// ==================== 路由适配器 ====================

/**
 * 路由适配器
 * 复用原项目的路由功能
 */
export const routerAdapter = {
  /**
   * 导航到指定页面
   * @param url 页面路径
   */
  navigateTo: (url: string): void => {
    uni.navigateTo({ url });
  },

  /**
   * 重定向到指定页面
   * @param url 页面路径
   */
  redirectTo: (url: string): void => {
    uni.redirectTo({ url });
  },

  /**
   * 返回上一页
   * @param delta 返回层数
   */
  navigateBack: (delta = 1): void => {
    uni.navigateBack({ delta });
  },

  /**
   * 跳转到TabBar页面
   * @param url 页面路径
   */
  switchTab: (url: string): void => {
    uni.switchTab({ url });
  },
};

// ==================== 工具适配器 ====================

/**
 * 工具函数适配器
 * 复用原项目的工具函数
 */
export const utilsAdapter = {
  /**
   * 显示Toast提示
   */
  showToast: (title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none'): void => {
    uni.showToast({ title, icon });
  },

  /**
   * 显示加载中
   */
  showLoading: (title = '加载中...'): void => {
    uni.showLoading({ title, mask: true });
  },

  /**
   * 隐藏加载中
   */
  hideLoading: (): void => {
    uni.hideLoading();
  },

  /**
   * 显示确认对话框
   */
  showModal: (options: {
    title?: string;
    content: string;
    showCancel?: boolean;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      uni.showModal({
        ...options,
        success: (res) => resolve(res.confirm),
      });
    });
  },
};

// ==================== 初始化适配器 ====================

/**
 * 初始化适配器
 * 在模块启动时调用，完成与原项目的对接
 */
export const initAdapters = () => {
  console.log('[DRG Module] Initializing adapters...');
  
  const user = userAdapter.get();
  console.log('[DRG Module] User info:', user.patientId ? 'Found' : 'Not found');
  
  return {
    user,
    isReady: !!user.patientId,
  };
};
