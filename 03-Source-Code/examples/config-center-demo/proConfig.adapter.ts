/**
 * proConfig.ts 适配层
 * 
 * 这个文件是原 proConfig.ts 的完全兼容替代品
 * 业务代码无需任何修改即可使用 Config Center
 * 
 * 使用方式:
 *   将原来的: import { miniProgramConfig, manifestFileDataObj } from './proConfig'
 *   替换为:   import { miniProgramConfig, manifestFileDataObj } from './proConfig.adapter'
 */

import { miniProgramConfig, manifestFileDataObj } from './src/config';

export { miniProgramConfig, manifestFileDataObj };

// 默认导出
export default {
  miniProgramConfig,
  manifestFileDataObj,
};
