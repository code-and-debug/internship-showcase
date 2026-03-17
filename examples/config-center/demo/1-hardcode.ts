/**
 * 阶段 0：硬编码（问题展示）
 * 
 * 这是重构前的代码状态，展示了硬编码配置带来的维护噩梦。
 * 实际项目中存在 100+ 医院的硬编码配置。
 */

// ❌ 反模式：硬编码配置
function getHospitalConfig(sysCode: string): any {
  // 100个 if-else，维护噩梦
  if (sysCode === '1001033') {
    return {
      name: '台州市第一人民医院',
      wxAppid: 'wxe26143481567cb97',
      features: { drugDelivery: true, ocr: true }
    };
  } else if (sysCode === '1001035') {
    return {
      name: '玉环市第二人民医院',
      wxAppid: 'wx718cec315197969f',
      features: { drugDelivery: false, ocr: true }
    };
  } else if (sysCode === '1001048') {
    return {
      name: '浙江省中医院西溪院区',
      wxAppid: 'wx2af1f9ed6e1b5fb9',
      features: { drugDelivery: true, ocr: false }
    };
  }
  // ... 还有97个类似的 else if
  
  throw new Error(`Unknown hospital: ${sysCode}`);
}

// 问题分析：
// 1. 新增医院要改代码 -> 需要重新发版
// 2. 修改配置要改代码 -> 需要重新发版  
// 3. 100个if-else打包进vendor.js -> 体积超过2MB
// 4. 代码冗余 -> 90%是重复结构
// 5. 无法热更新 -> 线上问题无法快速修复

// 使用示例
try {
  const config = getHospitalConfig('1001033');
  console.log('医院名称:', config.name);
  console.log('是否支持配送:', config.features.drugDelivery);
} catch (e) {
  console.error('配置加载失败');
}

export { getHospitalConfig };
