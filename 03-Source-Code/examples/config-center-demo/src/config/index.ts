/**
 * Config Center 入口文件
 * 
 * 提供向后兼容的 API，同时支持新的 ConfigCenter 类
 * 
 * 重构前用法（保持不变）:
 *   import { miniProgramConfig, manifestFileDataObj } from './proConfig';
 *   const config = miniProgramConfig['1001033'];
 * 
 * 新用法（推荐）:
 *   import { configCenter } from './config';
 *   const config = configCenter.getConfig('1001033');
 */

import { ConfigCenter } from './ConfigCenter';
import * as path from 'path';

// 配置中心实例
const configPath = process.env.CONFIG_PATH || path.join(__dirname, '../../config');
const defaultEnv = (process.env.NODE_ENV as any) || 'dev';

export const configCenter = new ConfigCenter({
  basePath: configPath,
  defaultEnv,
  enableCache: true,
});

/**
 * 向后兼容: miniProgramConfig
 * 使用 Proxy 实现动态加载
 */
export const miniProgramConfig: { [key: string]: any } = new Proxy(
  {},
  {
    get(target, prop: string) {
      if (prop === '__isProxy') return true;
      
      try {
        return configCenter.getConfig(prop);
      } catch (error) {
        console.warn(`[ConfigCenter] Config not found for: ${prop}`);
        return undefined;
      }
    },
    has(target, prop: string) {
      try {
        configCenter.getConfig(prop);
        return true;
      } catch {
        return false;
      }
    },
    ownKeys(target) {
      return configCenter.getAllTenantIds();
    },
    getOwnPropertyDescriptor(target, prop: string) {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  }
);

/**
 * 向后兼容: manifestFileDataObj
 * 动态生成 manifest 配置
 */
export const manifestFileDataObj: any = new Proxy(
  {
    appid: '__UNI__DC06FC7',
    description: '',
    versionName: '1.0.0',
    versionCode: '100',
    transformPx: false,
  },
  {
    get(target, prop: string) {
      if (prop in target) {
        return (target as any)[prop];
      }

      // 动态获取当前医院配置
      const sysCode = process.env.CURRENT_SYSCODE;
      if (!sysCode) {
        return undefined;
      }

      try {
        const config = configCenter.getConfig(sysCode);
        
        // 根据属性名返回相应的 manifest 配置
        switch (prop) {
          case 'mp-weixin':
            return {
              appid: config.wxAppid,
              __usePrivacyCheck__: true,
              setting: {
                urlCheck: false,
                postcss: false,
                minified: true,
                es6: true,
              },
              optimization: {
                subPackages: true,
                treeShaking: { enable: true },
              },
              permission: {
                'scope.userLocation': {
                  desc: '你的位置信息将用于小程序位置接口的效果展示',
                },
              },
              requiredPrivateInfos: ['chooseLocation', 'getLocation', 'chooseAddress'],
              usingComponents: true,
              plugins: {},
              mergeVirtualHostAttributes: true,
              lazyCodeLoading: 'requiredComponents',
              libVersion: 'latest',
            };

          case 'mp-alipay':
            return {
              component2: true,
              usingComponents: true,
              plugins: {},
              mergeVirtualHostAttributes: true,
              appid: config.alipayAppid,
              window: {
                navigationStyle: 'custom',
                defaultTitle: '',
                titleBarColor: '#ffffff',
              },
              'mini.project.json': {
                compileOptions: {
                  codeObfuscation: {
                    enable: true,
                    type: 'strong',
                  },
                },
              },
            };

          case 'mp-harmony':
            return {
              distribute: {
                compileSdkVersion: 10,
                targetSdkVersion: 10,
                signingConfigs: config._secrets?.harmony || {},
                bundleName: config.harmonyBundleName,
              },
            };

          case 'name':
            return config.name;

          default:
            return undefined;
        }
      } catch (error) {
        console.warn(`[ConfigCenter] Failed to generate manifest for ${sysCode}:`, error);
        return undefined;
      }
    },
  }
);

// 重新导出 ConfigCenter
export { ConfigCenter } from './ConfigCenter';

// 默认导出
export default {
  configCenter,
  miniProgramConfig,
  manifestFileDataObj,
};
