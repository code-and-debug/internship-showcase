#!/usr/bin/env ts-node
/**
 * 配置对比工具
 * 
 * 用法:
 *   npx ts-node diff.ts <sysCode> <env1> <env2>
 *   npx ts-node diff.ts 1001033 dev prod
 */

import * as fs from 'fs';
import * as path from 'path';
import { ConfigCenter } from '../../src/config/ConfigCenter';

const CONFIG_PATH = path.join(__dirname, '../../config');

interface DiffResult {
  path: string;
  env1Value: any;
  env2Value: any;
  type: 'added' | 'removed' | 'modified';
}

/**
 * 深度对比两个对象
 */
function deepDiff(obj1: any, obj2: any, path: string = ''): DiffResult[] {
  const diffs: DiffResult[] = [];

  // 获取所有键
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const allKeys = new Set([...keys1, ...keys2]);

  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (!(key in obj1)) {
      // 在 obj1 中不存在
      diffs.push({
        path: currentPath,
        env1Value: undefined,
        env2Value: val2,
        type: 'added',
      });
    } else if (!(key in obj2)) {
      // 在 obj2 中不存在
      diffs.push({
        path: currentPath,
        env1Value: val1,
        env2Value: undefined,
        type: 'removed',
      });
    } else if (typeof val1 === 'object' && typeof val2 === 'object' && val1 && val2) {
      // 递归比较对象
      diffs.push(...deepDiff(val1, val2, currentPath));
    } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      // 值不同
      diffs.push({
        path: currentPath,
        env1Value: val1,
        env2Value: val2,
        type: 'modified',
      });
    }
  }

  return diffs;
}

/**
 * 格式化值显示
 */
function formatValue(value: any): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * 主函数
 */
function main(): void {
  console.log('='.repeat(70));
  console.log('Config Center Diff Tool');
  console.log('='.repeat(70));
  console.log();

  const args = process.argv.slice(2);

  if (args.length < 3 || args[0] === '--help') {
    console.log('Usage: npx ts-node diff.ts <sysCode> <env1> <env2>');
    console.log();
    console.log('Arguments:');
    console.log('  sysCode   Hospital system code (e.g., 1001033)');
    console.log('  env1      First environment (dev/test/prod)');
    console.log('  env2      Second environment (dev/test/prod)');
    console.log();
    console.log('Examples:');
    console.log('  npx ts-node diff.ts 1001033 dev test');
    console.log('  npx ts-node diff.ts 1001033 dev prod');
    console.log('  npx ts-node diff.ts 1001035 test prod');
    process.exit(0);
  }

  const [sysCode, env1, env2] = args;

  console.log(`Comparing configurations for ${sysCode}:`);
  console.log(`  ${env1} ←→ ${env2}`);
  console.log();

  const center = new ConfigCenter({
    basePath: CONFIG_PATH,
    enableCache: false,
  });

  try {
    const config1 = center.getConfig(sysCode, env1);
    const config2 = center.getConfig(sysCode, env2);

    // 移除内部字段
    delete (config1 as any)._secrets;
    delete (config2 as any)._secrets;

    const diffs = deepDiff(config1, config2);

    if (diffs.length === 0) {
      console.log('✓ Configurations are identical (excluding secrets)');
      process.exit(0);
    }

    console.log(`Found ${diffs.length} differences:\n`);

    // 分组显示
    const added = diffs.filter((d) => d.type === 'added');
    const removed = diffs.filter((d) => d.type === 'removed');
    const modified = diffs.filter((d) => d.type === 'modified');

    if (added.length > 0) {
      console.log(`Added in ${env2} (${added.length}):`);
      for (const diff of added) {
        console.log(`  + ${diff.path}: ${formatValue(diff.env2Value)}`);
      }
      console.log();
    }

    if (removed.length > 0) {
      console.log(`Removed from ${env1} (${removed.length}):`);
      for (const diff of removed) {
        console.log(`  - ${diff.path}: ${formatValue(diff.env1Value)}`);
      }
      console.log();
    }

    if (modified.length > 0) {
      console.log(`Modified (${modified.length}):`);
      for (const diff of modified) {
        console.log(`  ~ ${diff.path}:`);
        console.log(`    ${env1}: ${formatValue(diff.env1Value)}`);
        console.log(`    ${env2}: ${formatValue(diff.env2Value)}`);
      }
      console.log();
    }

    console.log('='.repeat(70));
    console.log('Summary:');
    console.log(`  Added:    ${added.length}`);
    console.log(`  Removed:  ${removed.length}`);
    console.log(`  Modified: ${modified.length}`);
    console.log(`  Total:    ${diffs.length}`);
    console.log('='.repeat(70));

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
