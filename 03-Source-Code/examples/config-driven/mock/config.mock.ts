/**
 * 模拟配置数据（去敏版）
 * 用于演示配置驱动架构，不包含任何真实业务数据
 */

// ============================================
// 类型定义（简化版）
// ============================================

export type SysCode = string;
export type FeatureSwitch = '0' | '1';

export interface ISystemGlobalItem {
  /** 系统标识 */
  sysCode: SysCode;
  /** 显示名称 */
  name: string;
  
  // 平台应用ID（示例值，非真实）
  wxAppid?: string;
  alipayAppid?: string;
  h5Appid?: string;
  
  // 功能开关
  isSearchInHos?: boolean;
  isOpenOcr?: boolean;
  
  // 业务配置（sConfig）
  sConfig?: {
    // 界面配置
    homeNavTitleLogo?: string;
    homeTopBanner?: { topShow: boolean; bannerHeight?: number };
    isHideHomeLogo?: FeatureSwitch;
    
    // 功能开关
    isDrugDelivery?: FeatureSwitch;
    isOpenHelpOld?: FeatureSwitch;
    isOpenWechatSI?: boolean;
    
    // 第三方服务配置
    thirdPartyService?: {
      pluginId?: string;
      orgId?: Record<string, string>;
    };
  };
}

export type ISystemGlobalConfig = Record<SysCode, ISystemGlobalItem>;

// ============================================
// 模拟配置数据（10个示例医院，数据已脱敏）
// ============================================

export const mockMiniProgramConfig: ISystemGlobalConfig = {
  '1001001': {
    sysCode: '1001001',
    name: '演示医院A',
    wxAppid: 'wx_demo_xxxxxxxx001',
    alipayAppid: '2021xxxxxxxxx001',
    isSearchInHos: true,
    isOpenOcr: true,
    sConfig: {
      homeNavTitleLogo: 'https://demo-cdn.example.com/logo_a.png',
      homeTopBanner: { topShow: true, bannerHeight: 200 },
      isDrugDelivery: '1',
      isOpenHelpOld: '1',
      isOpenWechatSI: true,
      thirdPartyService: {
        pluginId: 'PLUGIN_A_001',
        orgId: { '10001': 'H000001' },
      },
    },
  },
  
  '1001002': {
    sysCode: '1001002',
    name: '演示医院B',
    wxAppid: 'wx_demo_xxxxxxxx002',
    alipayAppid: '2021xxxxxxxxx002',
    isSearchInHos: false,
    isOpenOcr: false,
    sConfig: {
      isHideHomeLogo: '1',
      homeNavTitleLogo: 'https://demo-cdn.example.com/logo_b.png',
      isOpenHelpOld: '1',
      thirdPartyService: {
        pluginId: 'PLUGIN_B_002',
        orgId: { '10002': 'H000002', '10003': 'H000003' },
      },
    },
  },
  
  '1001003': {
    sysCode: '1001003',
    name: '演示医院C',
    wxAppid: 'wx_demo_xxxxxxxx003',
    h5Appid: 'wx_demo_h5_xxx003',
    isSearchInHos: true,
    isOpenOcr: true,
    sConfig: {
      isDrugDelivery: '1',
      isOpenWechatSI: true,
    },
  },
  
  '1001004': {
    sysCode: '1001004',
    name: '演示医院D',
    wxAppid: 'wx_demo_xxxxxxxx004',
    alipayAppid: '2021xxxxxxxxx004',
    isSearchInHos: false,
    isOpenOcr: false,
    sConfig: {
      homeTopBanner: { topShow: true },
    },
  },
  
  '1001005': {
    sysCode: '1001005',
    name: '演示医院E',
    wxAppid: 'wx_demo_xxxxxxxx005',
    alipayAppid: '2021xxxxxxxxx005',
    h5Appid: 'wx_demo_h5_xxx005',
    isSearchInHos: true,
    isOpenOcr: true,
    sConfig: {
      isOpenHelpOld: '1',
      isOpenWechatSI: true,
      thirdPartyService: {
        pluginId: 'PLUGIN_E_005',
      },
    },
  },
  
  '1001006': {
    sysCode: '1001006',
    name: '演示医院F',
    wxAppid: 'wx_demo_xxxxxxxx006',
    isSearchInHos: true,
    isOpenOcr: false,
  },
  
  '1001007': {
    sysCode: '1001007',
    name: '演示医院G',
    wxAppid: 'wx_demo_xxxxxxxx007',
    alipayAppid: '2021xxxxxxxxx007',
    isSearchInHos: false,
    isOpenOcr: true,
    sConfig: {
      isHideHomeLogo: '1',
      isDrugDelivery: '1',
    },
  },
  
  '1001008': {
    sysCode: '1001008',
    name: '演示医院H',
    wxAppid: 'wx_demo_xxxxxxxx008',
    h5Appid: 'wx_demo_h5_xxx008',
    isSearchInHos: true,
    sConfig: {
      homeNavTitleLogo: 'https://demo-cdn.example.com/logo_h.png',
      isOpenHelpOld: '1',
    },
  },
  
  '1001009': {
    sysCode: '1001009',
    name: '演示医院I',
    wxAppid: 'wx_demo_xxxxxxxx009',
    alipayAppid: '2021xxxxxxxxx009',
    isSearchInHos: false,
    isOpenOcr: false,
    sConfig: {
      isOpenWechatSI: true,
    },
  },
  
  '1001010': {
    sysCode: '1001010',
    name: '演示医院J',
    wxAppid: 'wx_demo_xxxxxxxx010',
    alipayAppid: '2021xxxxxxxxx010',
    h5Appid: 'wx_demo_h5_xxx010',
    isSearchInHos: true,
    isOpenOcr: true,
    sConfig: {
      homeTopBanner: { topShow: true, bannerHeight: 250 },
      isDrugDelivery: '1',
      isOpenHelpOld: '1',
      isOpenWechatSI: true,
      thirdPartyService: {
        pluginId: 'PLUGIN_J_010',
        orgId: { '10010': 'H000010' },
      },
    },
  },
};

// ============================================
// Manifest 模板（简化版）
// ============================================

export const mockManifestTemplate = {
  appid: '__UNI__DEMO_APPID',
  description: '配置驱动架构演示',
  versionName: '1.0.0',
  versionCode: '100',
  name: '演示应用',
  'mp-weixin': {
    appid: 'wx_demo_default_xxx',
    setting: {
      urlCheck: false,
      es6: true,
      minified: true,
    },
    optimization: {
      subPackages: true,
      treeShaking: { enable: true },
    },
    __usePrivacyCheck__: true,
  },
  'mp-alipay': {
    appid: '2021xxxxxxxxx_default',
    usingComponents: true,
  },
  h5: {
    router: { base: './' },
  },
  vueVersion: '3',
};

// ============================================
// 模拟远程配置（演示动态更新）
// ============================================

export const mockRemoteConfig = {
  '1001001': {
    sConfig: {
      isNewFeatureEnabled: '1',  // 新功能灰度发布
      isDrugDelivery: '0',        // 功能关闭
    },
  },
};
