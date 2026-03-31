/**
 * ConfigCenter - 配置中心核心类
 * 
 * 功能：
 * 1. 读取并合并基础配置 + 环境覆盖层
 * 2. 配置晋升（dev→test→prod）
 * 3. 配置校验
 * 4. 版本对比
 * 5. 内存缓存机制
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ConfigCenterOptions {
  /** 配置根目录 */
  basePath: string;
  /** 默认环境 */
  defaultEnv?: 'dev' | 'test' | 'prod';
  /** 是否启用缓存 */
  enableCache?: boolean;
}

export interface TenantConfig {
  sysCode: string;
  name: string;
  [key: string]: any;
}

export interface EnvironmentConfig {
  _meta: {
    env: string;
    parent: string;
    version: string;
    description?: string;
    updatedAt?: string;
  };
  overrides: Record<string, any>;
  secrets?: Record<string, any>;
}

export interface MergedConfig extends TenantConfig {
  _env: string;
  _version: string;
  _secrets?: Record<string, any>;
}

export class ConfigCenter {
  private basePath: string;
  private defaultEnv: string;
  private enableCache: boolean;
  private cache: Map<string, MergedConfig> = new Map();

  constructor(options: ConfigCenterOptions) {
    this.basePath = options.basePath;
    this.defaultEnv = options.defaultEnv || 'dev';
    this.enableCache = options.enableCache !== false;
  }

  /**
   * 获取合并后的配置
   * @param sysCode 医院系统编码
   * @param env 环境（dev/test/prod）
   */
  getConfig(sysCode: string, env?: string): MergedConfig {
    const targetEnv = env || this.defaultEnv;
    const cacheKey = `${sysCode}:${targetEnv}`;

    // 检查缓存
    if (this.enableCache && this.cache.has(cacheKey)) {
      console.log(`[ConfigCenter] Cache hit: ${cacheKey}`);
      return this.cache.get(cacheKey)!;
    }

    // 1. 读取基础配置
    const tenantConfig = this.loadTenantConfig(sysCode);
    if (!tenantConfig) {
      throw new Error(`Tenant config not found: ${sysCode}`);
    }

    // 2. 读取环境覆盖配置
    const envConfig = this.loadEnvironmentConfig(sysCode, targetEnv);

    // 3. 合并配置
    const mergedConfig = this.mergeConfigs(tenantConfig, envConfig, targetEnv);

    // 4. 写入缓存
    if (this.enableCache) {
      this.cache.set(cacheKey, mergedConfig);
    }

    return mergedConfig;
  }

  /**
   * 加载基础配置
   */
  private loadTenantConfig(sysCode: string): TenantConfig | null {
    const filePath = path.join(this.basePath, 'tenants', `${sysCode}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`[ConfigCenter] Failed to load tenant config: ${sysCode}`, error);
      return null;
    }
  }

  /**
   * 加载环境覆盖配置
   */
  private loadEnvironmentConfig(sysCode: string, env: string): EnvironmentConfig | null {
    const filePath = path.join(this.basePath, 'environments', env, `${sysCode}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`[ConfigCenter] No env override for ${sysCode} in ${env}`);
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`[ConfigCenter] Failed to load env config: ${sysCode}/${env}`, error);
      return null;
    }
  }

  /**
   * 深度合并配置
   */
  private mergeConfigs(
    tenant: TenantConfig,
    env: EnvironmentConfig | null,
    envName: string
  ): MergedConfig {
    // 基础配置
    const base = { ...tenant };
    delete (base as any)._meta; // 移除内部元数据

    // 应用环境覆盖
    if (env && env.overrides) {
      this.deepMerge(base, env.overrides);
    }

    return {
      ...base,
      _env: envName,
      _version: env?._meta?.version || tenant._meta?.version || 'unknown',
      _secrets: env?.secrets,
    };
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  /**
   * 配置晋升（dev→test→prod）
   */
  promote(sysCode: string, fromEnv: string, toEnv: string, newVersion: string): boolean {
    console.log(`[ConfigCenter] Promoting ${sysCode} from ${fromEnv} to ${toEnv} (v${newVersion})`);

    const sourcePath = path.join(this.basePath, 'environments', fromEnv, `${sysCode}.json`);
    const targetPath = path.join(this.basePath, 'environments', toEnv, `${sysCode}.json`);

    if (!fs.existsSync(sourcePath)) {
      console.error(`[ConfigCenter] Source config not found: ${sourcePath}`);
      return false;
    }

    try {
      // 读取源配置
      const sourceConfig: EnvironmentConfig = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

      // 创建新配置
      const newConfig: EnvironmentConfig = {
        _meta: {
          env: toEnv,
          parent: sysCode,
          version: newVersion,
          description: `Promoted from ${fromEnv}`,
          updatedAt: new Date().toISOString(),
        },
        overrides: { ...sourceConfig.overrides },
        secrets: sourceConfig.secrets ? this.maskSecrets(sourceConfig.secrets) : undefined,
      };

      // 确保目标目录存在
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // 备份旧配置（如果存在）
      if (fs.existsSync(targetPath)) {
        this.backupConfig(sysCode, toEnv, targetPath);
      }

      // 写入新配置
      fs.writeFileSync(targetPath, JSON.stringify(newConfig, null, 2), 'utf-8');

      // 清除缓存
      this.cache.delete(`${sysCode}:${toEnv}`);

      console.log(`[ConfigCenter] Promotion successful: ${sysCode} → ${toEnv}`);
      return true;
    } catch (error) {
      console.error(`[ConfigCenter] Promotion failed:`, error);
      return false;
    }
  }

  /**
   * 备份配置到版本历史
   */
  private backupConfig(sysCode: string, env: string, filePath: string): void {
    const backupDir = path.join(this.basePath, 'versions', sysCode);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${env}-${timestamp}.json`);

    fs.copyFileSync(filePath, backupPath);
    console.log(`[ConfigCenter] Backup created: ${backupPath}`);
  }

  /**
   * 敏感信息脱敏（用于晋升时）
   */
  private maskSecrets(secrets: Record<string, any>): Record<string, any> {
    const masked: Record<string, any> = {};
    for (const [key, value] of Object.entries(secrets)) {
      if (typeof value === 'string') {
        masked[key] = value.length > 8 
          ? '${' + key.toUpperCase() + '}' 
          : '***';
      } else if (typeof value === 'object') {
        masked[key] = this.maskSecrets(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  /**
   * 校验配置完整性
   */
  validate(sysCode: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. 检查基础配置
    const tenantConfig = this.loadTenantConfig(sysCode);
    if (!tenantConfig) {
      errors.push(`Tenant config not found: ${sysCode}`);
      return { valid: false, errors };
    }

    // 2. 检查必填字段
    if (!tenantConfig.sysCode) errors.push('Missing required field: sysCode');
    if (!tenantConfig.name) errors.push('Missing required field: name');
    if (!tenantConfig.wxAppid && !tenantConfig.alipayAppid) {
      errors.push('Missing appid: at least one of wxAppid or alipayAppid is required');
    }

    // 3. 检查环境配置
    for (const env of ['dev', 'test', 'prod']) {
      const envPath = path.join(this.basePath, 'environments', env, `${sysCode}.json`);
      if (!fs.existsSync(envPath)) {
        console.warn(`[ConfigCenter] Missing ${env} config for ${sysCode}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 对比两个版本的配置差异
   */
  diff(sysCode: string, v1: string, v2: string): Record<string, { old: any; new: any }> {
    const versionsDir = path.join(this.basePath, 'versions', sysCode);
    const changes: Record<string, { old: any; new: any }> = {};

    if (!fs.existsSync(versionsDir)) {
      console.warn(`[ConfigCenter] No version history for ${sysCode}`);
      return changes;
    }

    // 这里简化实现，实际应该读取具体版本文件进行对比
    console.log(`[ConfigCenter] Diff ${sysCode}: ${v1} → ${v2}`);
    
    return changes;
  }

  /**
   * 获取所有医院编码列表
   */
  getAllTenantIds(): string[] {
    const tenantsDir = path.join(this.basePath, 'tenants');
    if (!fs.existsSync(tenantsDir)) return [];

    return fs
      .readdirSync(tenantsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''));
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[ConfigCenter] Cache cleared');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export default ConfigCenter;
