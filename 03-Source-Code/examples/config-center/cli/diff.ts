#!/usr/bin/env ts-node
/**
 * 配置版本对比
 * 用法: ts-node diff.ts <sysCode> <versionA> <versionB>
 * 示例: ts-node diff.ts 1001033 v1.0.0 v1.2.0
 */

import { ConfigCenter } from '../core/ConfigCenter';

async function main() {
  const [,, sysCode, versionA, versionB] = process.argv;

  if (!sysCode || !versionA || !versionB) {
    console.error('❌ 参数错误');
    console.error('用法: ts-node diff.ts <sysCode> <versionA> <versionB>');
    console.error('示例: ts-node diff.ts 1001033 v1.0.0 v1.2.0');
    process.exit(1);
  }

  const center = new ConfigCenter({
    basePath: './config',
    defaultEnv: 'prod'
  });

  try {
    const result = await center.diff(sysCode, versionA, versionB);

    console.log(`\n📊 配置对比: ${sysCode}`);
    console.log(`${versionA} ←→ ${versionB}`);
    console.log(`共 ${result.count} 处变更\n`);

    if (result.count === 0) {
      console.log('✓ 两个版本配置相同');
      return;
    }

    result.changes.forEach((change, index) => {
      const icon = change.type === 'added' ? '➕' :
                   change.type === 'removed' ? '➖' : '✏️';
      
      console.log(`${index + 1}. ${icon} [${change.type.toUpperCase()}] ${change.path}`);
      
      if (change.type === 'modified') {
        console.log(`   - ${JSON.stringify(change.oldValue)}`);
        console.log(`   + ${JSON.stringify(change.newValue)}`);
      } else if (change.type === 'added') {
        console.log(`   + ${JSON.stringify(change.newValue)}`);
      } else {
        console.log(`   - ${JSON.stringify(change.oldValue)}`);
      }
      console.log();
    });

  } catch (error) {
    console.error('❌ 对比失败:', (error as Error).message);
    process.exit(1);
  }
}

main();
