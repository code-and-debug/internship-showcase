/**
 * 阶段 1：基础配置驱动（解决方案）
 * 
 * 将硬编码提取为 JSON 配置文件，使用动态导入实现按需加载。
 * 这是 Config-Driven Demo 的核心思路。
 */

// ✅ 方案1：配置文件表（阶段一）
// 配置文件：config/tenants/1001033.json
// 使用时动态导入

async function getHospitalConfigV1(sysCode: string): Promise<any> {
  try {
    // 动态导入，webpack会分包处理
    // 只有访问该医院时才加载对应配置
    const config = await import(`../config/tenants/${sysCode}.json`);
    return config.default || config;
  } catch (error) {
    throw new Error(`Config not found for: ${sysCode}`);
  }
}

// 模拟配置数据（实际项目中是独立的JSON文件）
const mockConfigTable: Record<string, any> = {
  '1001033': {
    sysCode: '1001033',
    name: '台州市第一人民医院',
    wxAppid: 'wx_demo_xxxxxxxx001',
    features: { drugDelivery: true, ocr: true }
  },
  '1001035': {
    sysCode: '1001035',
    name: '玉环市第二人民医院',
    wxAppid: 'wx_demo_xxxxxxxx002',
    features: { drugDelivery: false, ocr: true }
  }
};

// 简化版实现（不使用动态导入）
function getHospitalConfigV1Simple(sysCode: string): any {
  const config = mockConfigTable[sysCode];
  if (!config) {
    throw new Error(`Config not found for: ${sysCode}`);
  }
  return config;
}

// 收益分析：
// 1. 新增医院只需添加JSON文件 -> 无需改代码（仍需发版，但风险低）
// 2. 动态导入分包 -> vendor.js降至500KB
// 3. 配置结构清晰 -> 易于维护
// 4. TypeScript类型支持 -> 编译时检查

// 使用示例
async function demo() {
  try {
    const config = getHospitalConfigV1Simple('1001033');
    console.log('✅ 阶段1 - 基础配置驱动');
    console.log('医院名称:', config.name);
    console.log('小程序ID:', config.wxAppid);
    console.log('\n收益:');
    console.log('- 新增医院只需添加JSON文件');
    console.log('- vendor.js体积降至500KB');
    console.log('- 代码结构清晰，易于维护');
  } catch (e) {
    console.error('配置加载失败:', (e as Error).message);
  }
}

demo();

export { getHospitalConfigV1, getHospitalConfigV1Simple };
