#!/usr/bin/env ts-node
/**
 * 配置校验工具
 * 
 * 用法:
 *   npx ts-node validate.ts --all
 *   npx ts-node validate.ts 1001033
 *   npx ts-node validate.ts --env prod
 */

import * as fs from 'fs';
import * as path from 'path';
import { ConfigCenter } from '../../src/config/ConfigCenter';

const CONFIG_PATH = path.join(__dirname, '../../config');

interface ValidationResult {
  sysCode: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 校验所有医院配置
 */
function validateAll(center: ConfigCenter): ValidationResult[] {
  const sysCodes = center.getAllTenantIds();
  console.log(`Validating ${sysCodes.length} hospital configurations...\n`);

  const results: ValidationResult[] = [];

  for (const sysCode of sysCodes) {
    const result = validateOne(center, sysCode);
    results.push(result);
  }

  return results;
}

/**
 * 校验单个医院配置
 */
function validateOne(center: ConfigCenter, sysCode: string): ValidationResult {
  const result: ValidationResult = {
    sysCode,
    valid: true,
    errors: [],
    warnings: [],
  };

  // 1. 基础校验
  const validation = center.validate(sysCode);
  if (!validation.valid) {
    result.valid = false;
    result.errors.push(...validation.errors);
  }

  // 2. 检查环境配置完整性
  for (const env of ['dev', 'test', 'prod']) {
    const envPath = path.join(CONFIG_PATH, 'environments', env, `${sysCode}.json`);
    if (!fs.existsSync(envPath)) {
      result.warnings.push(`Missing ${env} environment configuration`);
    } else {
      try {
        const envConfig = JSON.parse(fs.readFileSync(envPath, 'utf-8'));
        
        // 检查元数据
        if (!envConfig._meta?.version) {
          result.warnings.push(`${env}: Missing version in _meta`);
        }
        if (!envConfig._meta?.parent) {
          result.errors.push(`${env}: Missing parent in _meta`);
          result.valid = false;
        }

        // 检查敏感信息是否为占位符
        if (env === 'prod' && envConfig.secrets) {
          for (const [key, value] of Object.entries(envConfig.secrets)) {
            if (typeof value === 'string' && !value.startsWith('${')) {
              result.warnings.push(`${env}: Secret '${key}' should use environment variable placeholder`);
            }
          }
        }
      } catch (error) {
        result.valid = false;
        result.errors.push(`${env}: Invalid JSON - ${error}`);
      }
    }
  }

  // 3. 尝试加载配置
  try {
    const config = center.getConfig(sysCode, 'dev');
    if (!config.name) {
      result.warnings.push('Missing hospital name');
    }
    if (!config.wxAppid && !config.alipayAppid) {
      result.warnings.push('Missing both wxAppid and alipayAppid');
    }
  } catch (error: any) {
    result.valid = false;
    result.errors.push(`Failed to load config: ${error.message}`);
  }

  return result;
}

/**
 * 打印校验结果
 */
function printResults(results: ValidationResult[]): void {
  let passed = 0;
  let failed = 0;
  let warnings = 0;

  for (const result of results) {
    const icon = result.valid ? '✓' : '✗';
    const status = result.valid ? 'PASS' : 'FAIL';
    
    console.log(`${icon} [${status}] ${result.sysCode}`);

    if (result.errors.length > 0) {
      console.log('  Errors:');
      for (const error of result.errors) {
        console.log(`    • ${error}`);
      }
    }

    if (result.warnings.length > 0) {
      console.log('  Warnings:');
      for (const warning of result.warnings) {
        console.log(`    ⚠ ${warning}`);
      }
      warnings += result.warnings.length;
    }

    if (result.valid) {
      passed++;
    } else {
      failed++;
    }

    console.log();
  }

  console.log('='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  console.log('='.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

/**
 * 主函数
 */
function main(): void {
  console.log('='.repeat(60));
  console.log('Config Center Validation Tool');
  console.log('='.repeat(60));
  console.log();

  const center = new ConfigCenter({
    basePath: CONFIG_PATH,
    enableCache: false,
  });

  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage: npx ts-node validate.ts [options]');
    console.log();
    console.log('Options:');
    console.log('  --all           Validate all hospital configurations');
    console.log('  <sysCode>       Validate specific hospital');
    console.log('  --env <env>     Validate specific environment (dev/test/prod)');
    console.log('  --help          Show this help message');
    console.log();
    console.log('Examples:');
    console.log('  npx ts-node validate.ts --all');
    console.log('  npx ts-node validate.ts 1001033');
    console.log('  npx ts-node validate.ts --env prod');
    process.exit(0);
  }

  if (args[0] === '--all') {
    const results = validateAll(center);
    printResults(results);
  } else if (args[0] === '--env') {
    const env = args[1];
    console.log(`Validating ${env} environment...\n`);
    const sysCodes = center.getAllTenantIds();
    const results: ValidationResult[] = [];

    for (const sysCode of sysCodes) {
      const envPath = path.join(CONFIG_PATH, 'environments', env, `${sysCode}.json`);
      const result: ValidationResult = {
        sysCode,
        valid: fs.existsSync(envPath),
        errors: fs.existsSync(envPath) ? [] : [`Missing ${env} configuration`],
        warnings: [],
      };
      results.push(result);
    }

    printResults(results);
  } else {
    const sysCode = args[0];
    console.log(`Validating ${sysCode}...\n`);
    const result = validateOne(center, sysCode);
    printResults([result]);
  }
}

main();
