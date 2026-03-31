#!/usr/bin/env ts-node
/**
 * 配置晋升工具
 * 将配置从一个环境晋升到另一个环境
 * 
 * 用法:
 *   npx ts-node promote.ts <sysCode> <fromEnv> <toEnv> <newVersion>
 *   npx ts-node promote.ts 1001033 dev test v1.2.0-test
 */

import * as path from 'path';
import { ConfigCenter } from '../../src/config/ConfigCenter';

const CONFIG_PATH = path.join(__dirname, '../../config');

/**
 * 主函数
 */
function main(): void {
  console.log('='.repeat(60));
  console.log('Config Center Promotion Tool');
  console.log('='.repeat(60));
  console.log();

  const args = process.argv.slice(2);

  if (args.length < 4 || args[0] === '--help') {
    console.log('Usage: npx ts-node promote.ts <sysCode> <fromEnv> <toEnv> <newVersion>');
    console.log();
    console.log('Arguments:');
    console.log('  sysCode      Hospital system code (e.g., 1001033)');
    console.log('  fromEnv      Source environment (dev/test/prod)');
    console.log('  toEnv        Target environment (dev/test/prod)');
    console.log('  newVersion   New version tag (e.g., v1.2.0-test)');
    console.log();
    console.log('Examples:');
    console.log('  npx ts-node promote.ts 1001033 dev test v1.2.0-test');
    console.log('  npx ts-node promote.ts 1001033 test prod v1.2.0');
    console.log();
    console.log('Note: Configuration promotion path should be: dev -> test -> prod');
    process.exit(0);
  }

  const [sysCode, fromEnv, toEnv, newVersion] = args;

  // 校验环境参数
  const validEnvs = ['dev', 'test', 'prod'];
  if (!validEnvs.includes(fromEnv)) {
    console.error(`Error: Invalid source environment '${fromEnv}'. Must be one of: ${validEnvs.join(', ')}`);
    process.exit(1);
  }
  if (!validEnvs.includes(toEnv)) {
    console.error(`Error: Invalid target environment '${toEnv}'. Must be one of: ${validEnvs.join(', ')}`);
    process.exit(1);
  }

  // 检查晋升路径
  const envOrder = ['dev', 'test', 'prod'];
  const fromIndex = envOrder.indexOf(fromEnv);
  const toIndex = envOrder.indexOf(toEnv);

  if (toIndex < fromIndex) {
    console.error('Error: Cannot promote to a lower environment!');
    console.error(`       ${fromEnv} -> ${toEnv} is not allowed.`);
    console.error('       Promotion path should be: dev -> test -> prod');
    process.exit(1);
  }

  console.log('Promotion Details:');
  console.log(`  Hospital:    ${sysCode}`);
  console.log(`  From:        ${fromEnv}`);
  console.log(`  To:          ${toEnv}`);
  console.log(`  New Version: ${newVersion}`);
  console.log();

  const center = new ConfigCenter({
    basePath: CONFIG_PATH,
    enableCache: false,
  });

  // 先校验源配置
  console.log('Validating source configuration...');
  const validation = center.validate(sysCode);
  if (!validation.valid) {
    console.error('Validation failed:');
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
  console.log('Source configuration is valid\n');

  // 执行晋升
  console.log('Executing promotion...\n');
  const success = center.promote(sysCode, fromEnv, toEnv, newVersion);

  if (success) {
    console.log();
    console.log('='.repeat(60));
    console.log('Promotion completed successfully!');
    console.log('='.repeat(60));
    console.log();
    console.log('Next steps:');
    console.log(`1. Review the generated ${toEnv} configuration`);
    console.log('2. Update production secrets if needed');
    console.log(`3. Run validation: npx ts-node validate.ts ${sysCode}`);
    
    if (toEnv === 'prod') {
      console.log();
      console.log('WARNING: You are promoting to PRODUCTION!');
      console.log('   Please ensure all secrets are properly set.');
    }
  } else {
    console.error();
    console.error('='.repeat(60));
    console.error('Promotion failed!');
    console.error('='.repeat(60));
    process.exit(1);
  }
}

main();
