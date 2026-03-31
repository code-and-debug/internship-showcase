#!/usr/bin/env ts-node
/**
 * 配置晋升脚本
 * 用法: ts-node promote.ts <sysCode> <fromEnv> <toEnv> <version>
 * 示例: ts-node promote.ts 1001033 dev prod v1.2.0
 */

import { ConfigCenter } from '../core/ConfigCenter';

async function main() {
  const [,, sysCode, fromEnv, toEnv, version] = process.argv;

  if (!sysCode || !fromEnv || !toEnv || !version) {
    console.error('❌ 参数错误');
    console.error('用法: ts-node promote.ts <sysCode> <fromEnv> <toEnv> <version>');
    console.error('示例: ts-node promote.ts 1001033 dev test v1.2.0');
    process.exit(1);
  }

  const center = new ConfigCenter({
    basePath: './config',
    defaultEnv: 'dev'
  });

  try {
    // 校验源环境配置
    const sourceValidation = await center.validate(sysCode);
    if (!sourceValidation.valid) {
      console.error('❌ 源环境配置校验失败:');
      sourceValidation.errors.forEach(e => console.error(`   - ${e}`));
      process.exit(1);
    }

    if (sourceValidation.warnings.length > 0) {
      console.warn('⚠️ 配置警告:');
      sourceValidation.warnings.forEach(w => console.warn(`   - ${w}`));
    }

    // 显示源环境配置预览
    const sourceConfig = await center.getConfig(sysCode, fromEnv);
    console.log(`\n📋 源环境配置 (${fromEnv}):`);
    console.log(`   租户: ${sourceConfig.name}`);
    console.log(`   版本: ${sourceConfig._runtime?.version}`);

    // 执行晋升
    console.log(`\n🚀 执行晋升: ${fromEnv} → ${toEnv}`);
    await center.promote(sysCode, fromEnv, toEnv, version);

    // 验证晋升结果
    const promotedConfig = await center.getConfig(sysCode, toEnv);
    console.log('\n✅ 晋升后的配置预览:');
    console.log(`   租户: ${promotedConfig.name}`);
    console.log(`   版本: ${promotedConfig._runtime?.version}`);
    console.log(`   环境: ${promotedConfig._runtime?.env}`);

  } catch (error) {
    console.error('❌ 晋升失败:', (error as Error).message);
    process.exit(1);
  }
}

main();
