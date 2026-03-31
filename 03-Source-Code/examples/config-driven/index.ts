/**
 * Config-Driven Architecture Demo
 * 配置驱动架构演示模块
 * 
 * 本模块演示了如何将硬编码配置重构为配置驱动架构
 * 所有数据已脱敏，仅用于架构设计展示
 */

// 类型导出
export type {
  SysCode,
  FeatureSwitch,
  ISystemGlobalItem,
  ISystemGlobalConfig,
} from './mock/config.mock';

// 模拟数据导出
export {
  mockMiniProgramConfig,
  mockManifestTemplate,
  mockRemoteConfig,
} from './mock/config.mock';

// 核心类导出
export {
  ConfigManager,
  getConfigManager,
  type IConfigLoadOptions,
} from './core/ConfigManager';

export {
  ConfigService,
  getConfigService,
  initConfigDriven,
  config,
} from './core/ConfigService';

// 组合式函数导出
export {
  useSystemConfig,
  useThirdPartyConfig,
  usePlatformConfig,
} from './composables/useConfig';
