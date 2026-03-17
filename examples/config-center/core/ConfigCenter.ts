/**
 * 轻量级配置中心
 * 基于文件系统 + Git 版本管理
 * 无需后端服务，适合中小团队
 */

import { promises as fs } from 'fs';
import * as path from 'path';

interface ConfigCenterOptions {
  basePath: string;           // 配置根目录
  defaultEnv: string;         // 默认环境
}

interface TenantConfig {
  sysCode: string;
  name: string;
  [key: string]: any;
}

interface EnvironmentConfig {
  _meta: {
    env: string;
    version: string;
    parent: string;
    updatedAt: string;
    promotedFrom?: string;
  };
  overrides: Record<string, any>;
}

interface ConfigDiffResult {
  changes: ConfigChange[];
  count: number;
}

interface ConfigChange {
  path: string;
  type: 'added' | 'modified' | 'removed';
  oldValue?: any;
  newValue?: any;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigCenter {
  private basePath: string;
  private defaultEnv: string;
  private cache: Map<string, any> = new Map();

  constructor(options: ConfigCenterOptions) {
    this.basePath = options.basePath;
    this.defaultEnv = options.defaultEnv;
  }

  /**
   * 获取合并后的配置
   * 优先级：环境配置 > 基础配置
   */
  async getConfig(sysCode: string, env?: string): Promise<TenantConfig> {
    const targetEnv = env || this.defaultEnv;
    const cacheKey = `${sysCode}:${targetEnv}`;

    // 1. 检查内存缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 2. 读取基础配置
    const baseConfig = await this.loadBaseConfig(sysCode);

    // 3. 读取环境配置
    const envConfig = await this.loadEnvConfig(sysCode, targetEnv);

    // 4. 深度合并
    const merged = this.deepMerge(baseConfig, envConfig.overrides || {});

    // 5. 添加元信息
    const result = {
      ...merged,
      _runtime: {
        sysCode,
        env: targetEnv,
        version: envConfig._meta?.version || baseConfig._meta?.version || '1.0.0',
        fetchedAt: new Date().toISOString()
      }
    };

    // 6. 缓存
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * 环境晋升：将配置从 A 环境晋升到 B 环境
   */
  async promote(
    sysCode: string, 
    fromEnv: string, 
    toEnv: string, 
    newVersion: string
  ): Promise<void> {
    // 1. 读取源环境配置
    const sourceConfig = await this.loadEnvConfig(sysCode, fromEnv);
    
    // 2. 备份目标环境当前配置
    await this.backupCurrentConfig(sysCode, toEnv);

    // 3. 创建新的目标环境配置
    const targetConfig: EnvironmentConfig = {
      _meta: {
        env: toEnv,
        version: newVersion,
        parent: sysCode,
        updatedAt: new Date().toISOString(),
        promotedFrom: fromEnv
      },
      overrides: sourceConfig.overrides
    };

    // 4. 写入目标环境
    const targetPath = path.join(
      this.basePath, 
      'environments', 
      toEnv, 
      `${sysCode}.json`
    );
    
    await fs.writeFile(
      targetPath, 
      JSON.stringify(targetConfig, null, 2)
    );

    // 5. 清除缓存
    this.cache.delete(`${sysCode}:${toEnv}`);

    console.log(`✅ 配置晋升完成: ${sysCode} ${fromEnv} → ${toEnv} (v${newVersion})`);
  }

  /**
   * 版本对比
   */
  async diff(
    sysCode: string, 
    versionA: string, 
    versionB: string
  ): Promise<ConfigDiffResult> {
    const configA = await this.loadVersion(sysCode, versionA);
    const configB = await this.loadVersion(sysCode, versionB);

    return this.calculateDiff(configA, configB);
  }

  /**
   * 配置校验
   */
  async validate(sysCode: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. 检查基础配置
      const baseConfig = await this.loadBaseConfig(sysCode);
      
      // 2. 校验必填字段
      if (!baseConfig.sysCode) errors.push('缺少 sysCode');
      if (!baseConfig.name) errors.push('缺少 name');
      if (!baseConfig.wxAppid) warnings.push('缺少 wxAppid');

      // 3. 检查环境配置
      const envs = ['dev', 'test', 'prod'];
      for (const env of envs) {
        try {
          const envConfig = await this.loadEnvConfig(sysCode, env);
          if (!envConfig._meta?.version) {
            warnings.push(`${env} 环境缺少版本号`);
          }
        } catch (e) {
          warnings.push(`${env} 环境配置不存在`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (e) {
      return {
        valid: false,
        errors: [`基础配置加载失败: ${(e as Error).message}`],
        warnings: []
      };
    }
  }

  /**
   * 清除缓存
   */
  clearCache(sysCode?: string, env?: string): void {
    if (sysCode && env) {
      this.cache.delete(`${sysCode}:${env}`);
    } else if (sysCode) {
      // 清除该租户所有环境的缓存
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${sysCode}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // ===== 私有方法 =====

  private async loadBaseConfig(sysCode: string): Promise<TenantConfig> {
    const filePath = path.join(this.basePath, 'tenants', `${sysCode}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async loadEnvConfig(
    sysCode: string, 
    env: string
  ): Promise<EnvironmentConfig> {
    const filePath = path.join(
      this.basePath, 
      'environments', 
      env, 
      `${sysCode}.json`
    );
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      // 环境配置不存在，返回空配置
      return {
        _meta: { env, version: '0.0.0', parent: sysCode, updatedAt: '' },
        overrides: {}
      };
    }
  }

  private async loadVersion(
    sysCode: string, 
    version: string
  ): Promise<any> {
    const filePath = path.join(
      this.basePath,
      'versions',
      sysCode,
      `${version}.json`
    );
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async backupCurrentConfig(
    sysCode: string, 
    env: string
  ): Promise<void> {
    const sourcePath = path.join(
      this.basePath,
      'environments',
      env,
      `${sysCode}.json`
    );

    const backupDir = path.join(this.basePath, 'versions', sysCode);
    await fs.mkdir(backupDir, { recursive: true });

    try {
      const content = await fs.readFile(sourcePath, 'utf-8');
      const config = JSON.parse(content);
      const version = config._meta?.version || 'unknown';
      const backupPath = path.join(backupDir, `${version}.json`);
      
      await fs.writeFile(backupPath, content);
      console.log(`📦 已备份当前配置: ${backupPath}`);
    } catch (e) {
      // 当前配置不存在，无需备份
    }
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(output[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
    
    return output;
  }

  private calculateDiff(a: any, b: any): ConfigDiffResult {
    const changes: ConfigChange[] = [];

    const compare = (objA: any, objB: any, path: string = '') => {
      // 检查 B 中新增或修改的
      for (const key in objB) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in objA)) {
          changes.push({ path: currentPath, type: 'added', newValue: objB[key] });
        } else if (JSON.stringify(objA[key]) !== JSON.stringify(objB[key])) {
          if (typeof objA[key] === 'object' && typeof objB[key] === 'object') {
            compare(objA[key], objB[key], currentPath);
          } else {
            changes.push({
              path: currentPath,
              type: 'modified',
              oldValue: objA[key],
              newValue: objB[key]
            });
          }
        }
      }

      // 检查 A 中删除的
      for (const key in objA) {
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in objB)) {
          changes.push({ path: currentPath, type: 'removed', oldValue: objA[key] });
        }
      }
    };

    compare(a, b);
    return { changes, count: changes.length };
  }
}

export { ConfigCenterOptions, TenantConfig, EnvironmentConfig, ConfigDiffResult, ConfigChange, ValidationResult };
