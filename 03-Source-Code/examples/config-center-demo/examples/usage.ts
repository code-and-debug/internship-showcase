/**
 * Config Center 使用示例
 */

import { configCenter, miniProgramConfig, manifestFileDataObj } from '../src/config';

// ============ 示例 1: 使用新的 ConfigCenter API（推荐）============

console.log('=== Example 1: Using ConfigCenter API ===\n');

// 获取开发环境配置
const devConfig = configCenter.getConfig('1001033', 'dev');
console.log('Dev Config (1001033):');
console.log(`  Name: ${devConfig.name}`);
console.log(`  wxAppid: ${devConfig.wxAppid}`);
console.log(`  Environment: ${devConfig._env}`);
console.log(`  Version: ${devConfig._version}`);
console.log();

// 获取生产环境配置
const prodConfig = configCenter.getConfig('1001033', 'prod');
console.log('Prod Config (1001033):');
console.log(`  Name: ${prodConfig.name}`);
console.log(`  wxAppid: ${prodConfig.wxAppid}`);
console.log(`  Environment: ${prodConfig._env}`);
console.log(`  Version: ${prodConfig._version}`);
console.log();

// ============ 示例 2: 向后兼容的 API（现有代码无需修改）============

console.log('=== Example 2: Backward Compatible API ===\n');

// 旧的用法仍然可用
const hospitalConfig = miniProgramConfig['1001033'];
console.log('Using miniProgramConfig["1001033"]:');
console.log(`  Name: ${hospitalConfig.name}`);
console.log(`  isSearchInHos: ${hospitalConfig.isSearchInHos}`);
console.log();

// ============ 示例 3: 列出所有医院 ============

console.log('=== Example 3: List All Hospitals ===\n');

const allHospitals = configCenter.getAllTenantIds();
console.log(`Total hospitals: ${allHospitals.length}`);
console.log('Hospital IDs:', allHospitals.join(', '));
console.log();

// ============ 示例 4: 配置校验 ============

console.log('=== Example 4: Validate Configuration ===\n');

const validation = configCenter.validate('1001033');
console.log(`Validation result: ${validation.valid ? 'PASS' : 'FAIL'}`);
if (validation.errors.length > 0) {
  console.log('Errors:', validation.errors);
}
console.log();

// ============ 示例 5: 缓存统计 ============

console.log('=== Example 5: Cache Statistics ===\n');

const cacheStats = configCenter.getCacheStats();
console.log(`Cache size: ${cacheStats.size}`);
console.log(`Cached keys: ${cacheStats.keys.join(', ')}`);
console.log();

console.log('=== All Examples Completed ===');
