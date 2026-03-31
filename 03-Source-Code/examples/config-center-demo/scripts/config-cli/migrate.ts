#!/usr/bin/env ts-node
/**
 * 数据迁移工具
 * 从 proConfig.ts 导出配置到 Config Center 格式
 * 
 * 用法: npx ts-node migrate.ts --source proConfig.ts --output config/
 */

import * as fs from 'fs';
import * as path from 'path';

interface MiniProgramConfig {
  [key: string]: any;
}

interface MigrationOptions {
  source: string;
  output: string;
  env?: string;
}

/**
 * 解析 TypeScript 配置对象（简化版）
 */
function parseProConfig(sourcePath: string): MiniProgramConfig | null {
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    return null;
  }

  const content = fs.readFileSync(sourcePath, 'utf-8');
  
  // 提取 miniProgramConfig 对象（简化解析）
  const match = content.match(/export const miniProgramConfig:[\s\S]*?=\s*\{(\s*[\s\S]*?)\n\};/);
  if (!match) {
    console.error('Could not find miniProgramConfig in source file');
    return null;
  }

  // 这里简化处理，实际应该使用 TypeScript 编译器 API
  console.log('Note: This is a demonstration. In production, use TypeScript compiler API.');
  
  return {};
}

/**
 * 创建租户基础配置
 */
function createTenantConfig(sysCode: string, config: any): object {
  const now = new Date().toISOString();
  
  return {
    _meta: {
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      description: `${config.name} - 基础配置`,
    },
    sysCode,
    name: config.name,
    wxAppid: config.wxAppid,
    alipayAppid: config.alipayAppid,
    isvAlipayAppid: config.isvAlipayAppid,
    h5Appid: config.h5Appid,
    h5Appid1: config.h5Appid1,
    toutiaoAppid: config.toutiaoAppid,
    harmonyBundleName: config.harmonyBundleName,
    isSearchInHos: config.isSearchInHos ?? false,
    isOpenOcr: config.isOpenOcr ?? false,
    isOpenHealthCard: config.isOpenHealthCard,
    sConfig: config.sConfig,
    _des: config._des,
  };
}

/**
 * 创建环境覆盖配置
 */
function createEnvironmentConfig(
  sysCode: string,
  config: any,
  env: string
): object {
  const now = new Date().toISOString();
  
  // 提取环境相关字段
  const overrides: any = {};
  
  if (config.isStartComeTest !== undefined) {
    overrides.isStartComeTest = config.isStartComeTest;
  }
  
  if (config.h5AppidDisabledInTest !== undefined) {
    overrides.h5AppidDisabledInTest = config.h5AppidDisabledInTest;
  }

  // 环境特定的 API 地址
  const apiUrls: Record<string, string> = {
    dev: 'https://dev-api.eheren.com',
    test: 'https://test-api.eheren.com',
    prod: 'https://api.eheren.com',
  };

  overrides.sConfig = {
    apiBaseUrl: apiUrls[env],
    debugMode: env === 'dev',
    logLevel: env === 'dev' ? 'debug' : env === 'test' ? 'info' : 'error',
  };

  return {
    _meta: {
      env,
      parent: sysCode,
      version: `1.0.0-${env}`,
      description: `${config.name} - ${env} 环境配置`,
      updatedAt: now,
    },
    overrides,
    secrets: {
      // 敏感信息占位符
      apiKey: env === 'prod' ? '${API_KEY}' : `${env}_api_key_xxx`,
      wxSecret: env === 'prod' ? '${WX_SECRET}' : `${env}_wx_secret_xxx`,
    },
  };
}

/**
 * 执行迁移
 */
function migrate(options: MigrationOptions): void {
  console.log('='.repeat(60));
  console.log('Config Center Migration Tool');
  console.log('='.repeat(60));
  console.log(`Source: ${options.source}`);
  console.log(`Output: ${options.output}`);
  console.log(`Environment: ${options.env || 'all'}`);
  console.log();

  // 检查源文件
  if (!fs.existsSync(options.source)) {
    console.error(`Error: Source file not found: ${options.source}`);
    process.exit(1);
  }

  // 创建输出目录
  const tenantsDir = path.join(options.output, 'tenants');
  const envsDir = path.join(options.output, 'environments');
  
  fs.mkdirSync(tenantsDir, { recursive: true });
  ['dev', 'test', 'prod'].forEach((env) => {
    fs.mkdirSync(path.join(envsDir, env), { recursive: true });
  });

  console.log('Directory structure created.');
  console.log();

  // 读取并解析配置
  const content = fs.readFileSync(options.source, 'utf-8');
  
  // 提取各个医院配置（简化正则）
  const hospitalMatches = content.match(/'\d+':\s*\{[\s\S]*?\n\s*\},?/g);
  
  if (!hospitalMatches) {
    console.error('No hospital configurations found.');
    process.exit(1);
  }

  console.log(`Found ${hospitalMatches.length} hospital configurations.`);
  console.log();

  let migrated = 0;
  const envs = options.env ? [options.env] : ['dev', 'test', 'prod'];

  for (const match of hospitalMatches.slice(0, 5)) { // 演示只处理前5个
    const sysCodeMatch = match.match(/'(\d+)'/);
    if (!sysCodeMatch) continue;

    const sysCode = sysCodeMatch[1];
    
    console.log(`Migrating ${sysCode}...`);

    // 这里简化处理，实际应该正确解析配置对象
    // 创建基础配置
    const tenantConfig = {
      _meta: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: `Hospital ${sysCode} - migrated from proConfig.ts`,
      },
      sysCode,
      name: `Hospital ${sysCode}`,
      wxAppid: `wx_${sysCode}`,
    };

    // 保存基础配置
    fs.writeFileSync(
      path.join(tenantsDir, `${sysCode}.json`),
      JSON.stringify(tenantConfig, null, 2)
    );

    // 创建环境配置
    for (const env of envs) {
      const envConfig = {
        _meta: {
          env,
          parent: sysCode,
          version: `1.0.0-${env}`,
          updatedAt: new Date().toISOString(),
        },
        overrides: {
          isStartComeTest: env === 'dev',
          sConfig: {
            apiBaseUrl: `https://${env}-api.eheren.com`,
            debugMode: env === 'dev',
          },
        },
        secrets: {
          apiKey: env === 'prod' ? '${API_KEY}' : `${env}_key`,
        },
      };

      fs.writeFileSync(
        path.join(envsDir, env, `${sysCode}.json`),
        JSON.stringify(envConfig, null, 2)
      );
    }

    migrated++;
  }

  console.log();
  console.log('='.repeat(60));
  console.log(`Migration complete! Migrated ${migrated} hospitals.`);
  console.log('='.repeat(60));
  console.log();
  console.log('Next steps:');
  console.log('1. Review the generated configurations');
  console.log('2. Fill in the actual values for each hospital');
  console.log('3. Update secrets with actual values or environment variables');
  console.log('4. Run validation: npx ts-node validate.ts --all');
}

// 解析命令行参数
const args = process.argv.slice(2);
const options: MigrationOptions = {
  source: './proConfig.ts',
  output: './config',
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--source':
      options.source = args[++i];
      break;
    case '--output':
      options.output = args[++i];
      break;
    case '--env':
      options.env = args[++i];
      break;
    case '--help':
      console.log('Usage: npx ts-node migrate.ts [options]');
      console.log();
      console.log('Options:');
      console.log('  --source <path>   Source proConfig.ts file (default: ./proConfig.ts)');
      console.log('  --output <path>   Output directory (default: ./config)');
      console.log('  --env <env>       Target environment: dev|test|prod (default: all)');
      console.log('  --help            Show this help message');
      process.exit(0);
  }
}

migrate(options);
