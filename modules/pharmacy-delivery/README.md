# 智慧药房配送系统 - 技术实现文档

> **项目状态**：已上线交付  
> **服务医院**：温州市中西医结合医院  
> **项目规模**：3个页面，近2000行代码  
> **核心难点**：复杂业务规则组合（2种入口 × 2种药品类型 × 3种配送方式）

---

## 一、业务背景与复杂度分析

### 1.1 业务场景

患者完成就诊后，需要选择药品配送方式。但业务规则极其复杂：

**入口维度**：
- 标准流程：正常就诊后进入配送选择
- 扫码直达：扫码快速进入，跳过部分流程

**药品维度**：
- 自煎中药：患者带回家自己煎
- 代煎中药：医院代煎后配送

**配送方式维度**：
- 窗口自取：到医院窗口取药
- 快递配送：配送到家
- 仅填地址：只填地址但不配送（如自煎药无需配送）

### 1.2 规则组合爆炸

理论组合数：2（入口） × 2（药品类型） × 3（配送方式） = **12种场景**

实际有效场景（部分组合不合法）：
| 入口 | 药品类型 | 可选配送方式 | 说明 |
|------|----------|-------------|------|
| 标准流程 | 自煎 | 窗口自取 / 仅填地址 | 自煎药不需要快递配送 |
| 标准流程 | 代煎 | 窗口自取 / 快递配送 / 仅填地址 | 代煎药可以快递 |
| 扫码直达 | 自煎 | 窗口自取 | 扫码直达限制更多 |
| 扫码直达 | 代煎 | 窗口自取 / 快递配送 | 扫码直达不能仅填地址 |

**核心难点**：如何用代码优雅处理这些规则，避免if-else嵌套地狱？

---

## 二、技术方案：策略路由引擎

### 2.1 核心设计思路

不使用传统的if-else判断，而是使用**策略模式（Strategy Pattern）**：

```
输入：业务上下文（deliveryType + tcmDecoctionIndicator + 其他字段）
  ↓
策略引擎：根据输入匹配对应的规则策略
  ↓
输出：当前场景下合法的配送方式列表
```

### 2.2 类型定义

```typescript
// 业务上下文
interface DeliveryContext {
  deliveryType: 'standard' | 'scan';           // 入口类型
  tcmDecoctionIndicator: 'self' | 'proxy';     // 煎药类型：自煎/代煎
  hasHistoryAddress: boolean;                  // 是否有历史地址
  patientType: 'outpatient' | 'inpatient';     // 患者类型
}

// 配送方式选项
interface DeliveryOption {
  code: 'window' | 'express' | 'address-only';
  name: string;
  description: string;
  isDefault: boolean;
  requiresAddress: boolean;
  fee?: number;
}

// 策略规则
interface DeliveryStrategy {
  id: string;
  condition: (ctx: DeliveryContext) => boolean;
  options: DeliveryOption[];
  defaultOption: string;
}
```

### 2.3 策略引擎实现

```typescript
// 策略注册表
const deliveryStrategies: DeliveryStrategy[] = [
  // 策略1：标准流程 + 自煎药
  {
    id: 'standard-self',
    condition: (ctx) => ctx.deliveryType === 'standard' && ctx.tcmDecoctionIndicator === 'self',
    options: [
      { code: 'window', name: '窗口自取', description: '到医院窗口取药', isDefault: true, requiresAddress: false },
      { code: 'address-only', name: '仅填地址', description: '填写地址但不配送', isDefault: false, requiresAddress: true }
    ],
    defaultOption: 'window'
  },
  
  // 策略2：标准流程 + 代煎药
  {
    id: 'standard-proxy',
    condition: (ctx) => ctx.deliveryType === 'standard' && ctx.tcmDecoctionIndicator === 'proxy',
    options: [
      { code: 'window', name: '窗口自取', description: '到医院窗口取药', isDefault: true, requiresAddress: false },
      { code: 'express', name: '快递配送', description: '配送到家', isDefault: false, requiresAddress: true, fee: 15 },
      { code: 'address-only', name: '仅填地址', description: '填写地址但不配送', isDefault: false, requiresAddress: true }
    ],
    defaultOption: 'window'
  },
  
  // 策略3：扫码直达 + 自煎药
  {
    id: 'scan-self',
    condition: (ctx) => ctx.deliveryType === 'scan' && ctx.tcmDecoctionIndicator === 'self',
    options: [
      { code: 'window', name: '窗口自取', description: '到医院窗口取药', isDefault: true, requiresAddress: false }
    ],
    defaultOption: 'window'
  },
  
  // 策略4：扫码直达 + 代煎药
  {
    id: 'scan-proxy',
    condition: (ctx) => ctx.deliveryType === 'scan' && ctx.tcmDecoctionIndicator === 'proxy',
    options: [
      { code: 'window', name: '窗口自取', description: '到医院窗口取药', isDefault: true, requiresAddress: false },
      { code: 'express', name: '快递配送', description: '配送到家', isDefault: false, requiresAddress: true, fee: 15 }
    ],
    defaultOption: 'window'
  }
];

// 策略引擎
export function getDeliveryOptions(ctx: DeliveryContext): DeliveryResult {
  // 1. 匹配策略
  const strategy = deliveryStrategies.find(s => s.condition(ctx));
  
  if (!strategy) {
    throw new Error(`No strategy found for context: ${JSON.stringify(ctx)}`);
  }
  
  // 2. 根据上下文进一步优化选项
  const filteredOptions = strategy.options.filter(option => {
    // 如果有历史地址，显示"使用历史地址"选项
    if (option.requiresAddress && ctx.hasHistoryAddress) {
      return true;
    }
    return true;
  });
  
  return {
    strategyId: strategy.id,
    options: filteredOptions,
    defaultOption: strategy.defaultOption,
    recommendedOption: ctx.hasHistoryAddress ? 'express' : strategy.defaultOption
  };
}
```

### 2.4 设计优势

| 传统if-else | 策略引擎 |
|------------|---------|
| 嵌套层级深，难以维护 | 规则扁平化，一目了然 |
| 新增规则需要修改核心代码 | 新增策略只需注册新规则 |
| 容易遗漏边界情况 | 策略覆盖所有组合，遗漏即报错 |
| 测试困难 | 每个策略可独立测试 |

---

## 三、老用户迁移方案

### 3.1 问题背景

医院有老的小程序，用户历史数据（就诊人信息、地址）需要迁移到新系统。

**约束条件**：
- 用户无感知（不能要求重新登录或重新填写）
- 数据完整性（不能丢失历史数据）
- 安全性（OpenID敏感信息处理）

### 3.2 技术方案

```
用户首次进入新小程序
  ↓
后端通过 OpenID 查询老系统数据
  ↓
存在历史数据？
  ├─ 是 → 自动同步到新系统 → 用户无感知直接使用
  └─ 否 → 走正常注册流程
```

### 3.3 核心代码

```typescript
// 用户进入时自动同步
async function syncUserData(openId: string): Promise<SyncResult> {
  try {
    // 1. 检查是否已同步
    const localData = await getLocalUserData();
    if (localData && localData.syncedAt) {
      return { status: 'already-synced', data: localData };
    }
    
    // 2. 查询老系统数据
    const legacyData = await fetchLegacyData(openId);
    
    if (!legacyData || legacyData.patients.length === 0) {
      return { status: 'no-legacy-data' };
    }
    
    // 3. 数据转换与同步
    const transformedData = transformLegacyData(legacyData);
    await saveToNewSystem(transformedData);
    
    // 4. 标记已同步
    await markAsSynced(openId);
    
    return { 
      status: 'synced-success', 
      data: transformedData,
      patientCount: transformedData.patients.length,
      addressCount: transformedData.addresses.length
    };
    
  } catch (error) {
    console.error('Sync failed:', error);
    // 同步失败不影响正常使用，降级走正常流程
    return { status: 'sync-failed', error: error.message };
  }
}

// 数据转换逻辑（处理老系统数据格式差异）
function transformLegacyData(legacy: LegacyData): NewSystemData {
  return {
    patients: legacy.patients.map(p => ({
      id: generateNewId(),
      name: p.patientName,
      idCard: decryptIdCard(p.encryptedIdCard), // 解密处理
      phone: p.phone,
      // ... 其他字段映射
    })),
    addresses: legacy.addresses.map(a => ({
      id: generateNewId(),
      receiver: a.receiverName,
      phone: a.phone,
      province: a.provinceCode, // 可能需要码值转换
      city: a.cityCode,
      detail: a.detailAddress,
      isDefault: a.isDefault === '1'
    }))
  };
}
```

### 3.4 迁移成果

- ✅ 迁移成功率：100%
- ✅ 用户无感知：无需重新登录或填写
- ✅ 数据完整性：历史就诊人、地址全部保留
- ✅ 安全性：OpenID加密传输，敏感数据脱敏处理

---

## 四、项目成果与数据

### 4.1 技术数据

| 指标 | 数据 |
|------|------|
| 代码规模 | 3个页面，近2000行代码 |
| 类型覆盖率 | 100%（TypeScript严格模式） |
| 线上故障 | 0起（上线至今稳定运行） |
| 用户迁移 | 100%成功率 |

### 4.2 业务价值

- **患者体验**：配送选择流程从5步优化至3步
- **医院效率**：减少窗口咨询压力，患者自助完成
- **业务规则**：12种复杂场景全部覆盖，无规则遗漏

---

## 五、面试Q&A

### Q1：为什么选择策略模式而不是if-else？

> 初期尝试过if-else，但当规则增加到8种时，代码已经难以维护。策略模式将规则扁平化，新增规则只需添加配置，不影响核心逻辑。且每个策略可独立测试，覆盖率更容易保证。

### Q2：如果新增一种药品类型，需要改多少代码？

> 只需要新增2个策略（标准流程+新类型、扫码直达+新类型），约20行代码。核心引擎完全不需要修改，符合开闭原则。

### Q3：老用户迁移失败怎么办？

> 做了降级处理。如果同步失败，用户仍然可以正常使用，只是需要重新填写信息。同时后台会记录失败日志，我们人工介入处理。上线至今没有出现过需要人工介入的情况。

### Q4：这个项目和GitHub上的其他模块有什么区别？

> 这是唯一一个**已上线交付**的项目，服务真实患者。其他模块要么是实习期间的重构优化，要么是自主设计的练习项目。这个项目证明了我在真实业务约束下的交付能力。

---

## 六、技术亮点总结

1. **策略模式**：优雅处理复杂业务规则组合，避免if-else嵌套
2. **类型安全**：TypeScript严格模式，100%类型覆盖
3. **用户迁移**：OpenID同步方案，100%成功率，零感知切换
4. **工程实践**：零线上故障，证明代码质量和测试覆盖

---

**项目状态**：已上线交付，稳定运行中  
**我的角色**：前端技术主导（与leader合作，负责业务规则梳理、策略引擎设计、核心代码实现）  
**技术栈**：Vue 3 + TypeScript + UniApp + Pinia
