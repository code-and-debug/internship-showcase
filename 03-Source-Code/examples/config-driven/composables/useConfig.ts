/**
 * 配置驱动组合式函数
 * 在 Vue 组件中响应式地使用配置
 */
import { ref, computed, readonly, onMounted } from 'vue';
import type { SysCode, ISystemGlobalItem } from '../mock/config.mock';
import { getConfigService } from '../core/ConfigService';

/**
 * 使用系统配置
 */
export function useSystemConfig() {
  const configService = getConfigService();
  
  // 响应式状态
  const sysCode = ref<SysCode>(configService.getCurrentSysCode());
  const systemConfig = ref<ISystemGlobalItem | null>(configService.getCurrentSystem());
  
  // 计算属性
  const sConfig = computed(() => systemConfig.value?.sConfig);
  const name = computed(() => systemConfig.value?.name);
  const isInitialized = computed(() => !!systemConfig.value);
  
  /**
   * 切换系统
   */
  const switchSystem = (newSysCode: SysCode) => {
    sysCode.value = newSysCode;
    configService.setCurrentSysCode(newSysCode);
    systemConfig.value = configService.getCurrentSystem();
  };
  
  /**
   * 刷新配置
   */
  const refreshConfig = () => {
    systemConfig.value = configService.getCurrentSystem();
  };
  
  /**
   * 获取配置（带默认值）
   */
  const getConfig = <T = any>(path: string, defaultValue?: T): T | undefined => {
    return configService.get(path, defaultValue);
  };
  
  /**
   * 检查功能是否开启
   */
  const isEnabled = (featurePath: string): boolean => {
    return configService.isFeatureEnabled(featurePath);
  };
  
  onMounted(() => {
    refreshConfig();
  });
  
  return {
    // 状态
    sysCode: readonly(sysCode),
    systemConfig: readonly(systemConfig),
    sConfig,
    name,
    isInitialized,
    
    // 方法
    switchSystem,
    refreshConfig,
    getConfig,
    isEnabled,
    
    // 便捷访问
    wxAppid: computed(() => systemConfig.value?.wxAppid),
    alipayAppid: computed(() => systemConfig.value?.alipayAppid),
    h5Appid: computed(() => systemConfig.value?.h5Appid),
  };
}

/**
 * 使用第三方服务配置
 */
export function useThirdPartyConfig() {
  const { sConfig } = useSystemConfig();
  
  const thirdPartyConfig = computed(() => sConfig.value?.thirdPartyService);
  
  /**
   * 获取插件ID
   */
  const pluginId = computed(() => thirdPartyConfig.value?.pluginId);
  
  /**
   * 获取机构ID
   */
  const getOrgId = (key: string): string | undefined => {
    return thirdPartyConfig.value?.orgId?.[key];
  };
  
  return {
    thirdPartyConfig,
    pluginId,
    getOrgId,
  };
}

/**
 * 使用平台配置
 */
export function usePlatformConfig(platform?: 'wx' | 'alipay' | 'h5') {
  const configService = getConfigService();
  const { sysCode } = useSystemConfig();
  
  const currentPlatform = computed(() => platform);
  
  const appId = computed(() => {
    if (!currentPlatform.value) return undefined;
    return configService.getAppId(currentPlatform.value);
  });
  
  const isSupported = computed(() => !!appId.value);
  
  return {
    appId,
    isSupported,
    sysCode: readonly(sysCode),
  };
}
