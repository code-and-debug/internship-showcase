/**
 * 配置服务类
 * 提供与业务代码兼容的配置访问接口
 */
import type { SysCode, ISystemGlobalItem, ISystemGlobalConfig } from '../mock/config.mock';
import { ConfigManager, getConfigManager } from './ConfigManager';

export class ConfigService {
  private static instance: ConfigService;
  
  private _systemConfig: ISystemGlobalConfig | null = null;
  private _currentSysCode: SysCode = '';
  
  private configManager = getConfigManager();
  
  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }
  
  /**
   * 初始化配置服务
   */
  init(systemConfig: ISystemGlobalConfig, sysCode?: SysCode): void {
    this._systemConfig = systemConfig;
    
    if (sysCode) {
      this._currentSysCode = sysCode;
    }
    
    // 预加载到缓存
    this.configManager.setConfig('system_global_config', systemConfig);
    if (sysCode) {
      this.configManager.setConfig(`current_system_${sysCode}`, systemConfig[sysCode]);
    }
  }
  
  /**
   * 兼容原有导出：miniProgramConfig
   */
  get miniProgramConfig(): ISystemGlobalConfig {
    if (!this._systemConfig) {
      throw new Error('[ConfigService] 配置未初始化');
    }
    return this._systemConfig;
  }
  
  /**
   * 获取当前系统配置
   */
  getCurrentSystem(): ISystemGlobalItem | null {
    if (!this._currentSysCode || !this._systemConfig) return null;
    return this._systemConfig[this._currentSysCode] || null;
  }
  
  /**
   * 获取指定系统配置
   */
  getSystem(sysCode: SysCode): ISystemGlobalItem | null {
    if (!this._systemConfig) return null;
    return this._systemConfig[sysCode] || null;
  }
  
  /**
   * 获取当前系统代码
   */
  getCurrentSysCode(): SysCode {
    return this._currentSysCode;
  }
  
  /**
   * 设置当前系统代码
   */
  setCurrentSysCode(sysCode: SysCode): void {
    this._currentSysCode = sysCode;
  }
  
  /**
   * 路径访问配置（支持默认值）
   */
  get<T = any>(path: string, defaultValue?: T): T | undefined {
    const current = this.getCurrentSystem();
    if (!current) return defaultValue;
    
    const keys = path.split('.');
    let value: any = current;
    
    for (const key of keys) {
      if (value == null) return defaultValue;
      value = value[key];
    }
    
    return value !== undefined ? value : defaultValue;
  }
  
  /**
   * 检查功能开关（'1' 或 true 为开启）
   */
  isFeatureEnabled(featurePath: string): boolean {
    const value = this.get(featurePath);
    return value === '1' || value === true;
  }
  
  /**
   * 获取平台 AppId
   */
  getAppId(platform: 'wx' | 'alipay' | 'h5'): string | undefined {
    const current = this.getCurrentSystem();
    if (!current) return undefined;
    
    switch (platform) {
      case 'wx': return current.wxAppid;
      case 'alipay': return current.alipayAppid;
      case 'h5': return current.h5Appid;
      default: return undefined;
    }
  }
  
  /**
   * 更新 sConfig 配置（热更新）
   */
  updateSConfig(partialSConfig: Partial<ISystemGlobalItem['sConfig']>): void {
    const current = this.getCurrentSystem();
    if (!current || !this._systemConfig) return;
    
    const updatedSystem: ISystemGlobalItem = {
      ...current,
      sConfig: { ...current.sConfig, ...partialSConfig },
    };
    
    this._systemConfig[this._currentSysCode] = updatedSystem;
    this.configManager.setConfig('system_global_config', this._systemConfig);
    this.configManager.setConfig(`current_system_${this._currentSysCode}`, updatedSystem);
  }
  
  /**
   * 获取所有系统列表
   */
  getAllSystems(): Array<{ sysCode: SysCode; name: string }> {
    if (!this._systemConfig) return [];
    
    return Object.entries(this._systemConfig).map(([sysCode, item]) => ({
      sysCode,
      name: item.name,
    }));
  }
  
  /**
   * 按功能筛选系统
   */
  filterSystemsByFeature(
    feature: keyof ISystemGlobalItem,
    value: any
  ): Array<{ sysCode: SysCode; item: ISystemGlobalItem }> {
    if (!this._systemConfig) return [];
    
    return Object.entries(this._systemConfig)
      .filter(([, item]) => (item as any)[feature] === value)
      .map(([sysCode, item]) => ({ sysCode, item }));
  }
  
  /**
   * 对比两个系统的配置差异
   */
  compareSystems(
    sysCode1: SysCode,
    sysCode2: SysCode
  ): { onlyIn1: string[]; onlyIn2: string[]; different: string[] } {
    const item1 = this._systemConfig?.[sysCode1];
    const item2 = this._systemConfig?.[sysCode2];
    
    if (!item1 || !item2) {
      return { onlyIn1: [], onlyIn2: [], different: [] };
    }
    
    const keys1 = Object.keys(item1);
    const keys2 = Object.keys(item2);
    
    const onlyIn1 = keys1.filter((k) => !keys2.includes(k));
    const onlyIn2 = keys2.filter((k) => !keys1.includes(k));
    
    const commonKeys = keys1.filter((k) => keys2.includes(k));
    const different = commonKeys.filter((k) => {
      const v1 = JSON.stringify((item1 as any)[k]);
      const v2 = JSON.stringify((item2 as any)[k]);
      return v1 !== v2;
    });
    
    return { onlyIn1, onlyIn2, different };
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    this.configManager.clearCache();
  }
}

export const getConfigService = () => ConfigService.getInstance();

/**
 * 初始化配置驱动架构
 */
export function initConfigDriven(
  systemConfig: ISystemGlobalConfig,
  sysCode?: SysCode
): void {
  getConfigService().init(systemConfig, sysCode);
}

/**
 * 便捷访问对象
 */
export const config = getConfigService();
