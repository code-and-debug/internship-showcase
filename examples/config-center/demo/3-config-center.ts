/**
 * 阶段 2：配置中心（完整方案）
 * 
 * 引入多环境管理、版本控制、配置晋升机制。
 * 支持 dev -> test -> prod 的完整流程。
 */

import { ConfigCenter } from '../core/ConfigCenter';

async function demo() {
  console.log('🚀 阶段2 - 配置中心演示\n');

  // 初始化配置中心
  const center = new ConfigCenter({
    basePath: './config',
    defaultEnv: 'dev'
  });

  try {
    // 1. 获取不同环境的配置
    console.log('1️⃣ 多环境配置读取');
    console.log('-------------------');
    
    const devConfig = await center.getConfig('1001033', 'dev');
    console.log(`DEV 环境: ${devConfig.name}`);
    console.log(`  版本: ${devConfig._runtime?.version}`);
    console.log(`  API: ${devConfig.sConfig?.apiBaseUrl}`);
    console.log(`  调试模式: ${devConfig.sConfig?.debugMode}`);

    const prodConfig = await center.getConfig('1001033', 'prod');
    console.log(`\nPROD 环境: ${prodConfig.name}`);
    console.log(`  版本: ${prodConfig._runtime?.version}`);
    console.log(`  API: ${prodConfig.sConfig?.apiBaseUrl}`);
    console.log(`  调试模式: ${prodConfig.sConfig?.debugMode}`);

    // 2. 配置校验
    console.log('\n2️⃣ 配置校验');
    console.log('-------------------');
    const validation = await center.validate('1001033');
    console.log(`校验结果: ${validation.valid ? '✅ 通过' : '❌ 失败'}`);
    if (validation.warnings.length > 0) {
      console.log(`警告: ${validation.warnings.join(', ')}`);
    }

    // 3. 版本对比（模拟）
    console.log('\n3️⃣ 配置版本管理');
    console.log('-------------------');
    console.log('支持操作:');
    console.log('  - ts-node cli/promote.ts 1001033 dev test v1.2.0');
    console.log('  - ts-node cli/diff.ts 1001033 v1.0.0 v1.2.0');
    console.log('  - ts-node cli/validate.ts 1001033');

    // 4. 核心收益总结
    console.log('\n4️⃣ 核心收益');
    console.log('-------------------');
    console.log('✅ 多环境管理：dev/test/prod 独立配置');
    console.log('✅ 配置晋升：dev → test → prod 流程化');
    console.log('✅ 版本控制：Git 管理配置变更历史');
    console.log('✅ 配置校验：自动化检查配置完整性');
    console.log('✅ 变更对比：版本差异一目了然');
    console.log('\n💡 配置变更无需发版，5分钟生效');

  } catch (error) {
    console.error('❌ 演示失败:', (error as Error).message);
  }
}

demo();

export { demo };
