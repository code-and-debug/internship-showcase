#!/usr/bin/env ts-node
/**
 * 配置校验脚本
 * 用法: ts-node validate.ts <sysCode>
 * 示例: ts-node validate.ts 1001033
 */

import { ConfigCenter } from '../core/ConfigCenter';

async function main() {
  const [,, sysCode] = process.argv;

  if (!sysCode) {
    console.error('❌ 参数错误');
    console.error('用法: ts-node validate.ts <sysCode>');
    console.error('示例: ts-node validate.ts 1001033');
    process.exit(1);
  }

  const center = new ConfigCenter({
    basePath: './config',
    defaultEnv: 'dev'
  });

  try {
    console.log(`\n🔍 校验配置: ${sysCode}\n`);
    
    const result = await center.validate(sysCode);

    if (result.valid) {
      console.log('✅ 配置校验通过');
    } else {
      console.log('❌ 配置校验失败');
    }

    if (result.errors.length > 0) {
      console.log('\n错误:');
      result.errors.forEach(e => console.log(`   ❌ ${e}`));
    }

    if (result.warnings.length > 0) {
      console.log('\n警告:');
      result.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
    }

    // 显示各环境配置状态
    console.log('\n环境配置状态:');
    const envs = ['dev', 'test', 'prod'];
    for (const env of envs) {
      try {
        const config = await center.getConfig(sysCode, env);
        console.log(`   ${env.toUpperCase()}: ✅ ${config._runtime?.version || 'unknown'}`);
      } catch (e) {
        console.log(`   ${env.toUpperCase()}: ❌ 无法加载`);
      }
    }

    console.log();
    process.exit(result.valid ? 0 : 1);

  } catch (error) {
    console.error('❌ 校验失败:', (error as Error).message);
    process.exit(1);
  }
}

main();
