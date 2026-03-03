# DRG医保结算与病案管理模块 - 开发指南

## 模块架构

### 设计理念

本模块采用**模块化、可插拔**的设计理念：

1. **独立运行**：模块可独立运行，包含完整的Mock数据
2. **适配器模式**：通过适配器层与原项目对接
3. **组合式API**：使用Vue3 Composition API封装业务逻辑
4. **类型安全**：完整的TypeScript类型定义

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        页面层 (Pages)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ 结算列表    │ │ 费用分析    │ │ 病案复印列表        │   │
│  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘   │
└─────────┼───────────────┼───────────────────┼──────────────┘
          │               │                   │
          └───────────────┼───────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    组件层 (Components)                       │
│  ┌─────────────┐ ┌──────┴──────┐ ┌─────────────────────┐   │
│  │ 通用组件    │ │ 结算组件    │ │ 病案复印组件        │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                 业务逻辑层 (Composables)                     │
│  ┌─────────────┐ ┌──────┴──────┐ ┌─────────────────────┐   │
│  │ DRG分析     │ │ 飞检风险    │ │ CMI计算             │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    数据层 (API/Store)                        │
│  ┌─────────────┐ ┌──────┴──────┐ ┌─────────────────────┐   │
│  │ API接口     │ │ Pinia Store │ │ Mock数据            │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 业务逻辑详解

### 1. DRG费用分析

```typescript
import { useDRGAnalysis } from './composables/useDRGAnalysis';

// 核心计算
const drgAnalysis = useDRGAnalysis({
  drgCode: ref('FA19A'),
  drgName: ref('肺叶切除术'),
  weight: ref(2.856),
  paymentStandard: ref(20000),
  currentCost: ref(18500),
});

// 获取分析结果
const {
  analysis,        // 完整分析结果
  costRate,        // 费用消耗率 (92.5%)
  caseType,        // 病例类型 ('normal')
  warningLevel,    // 预警级别 ('safe')
  balance,         // DRG结余 (1500)
} = drgAnalysis;
```

**业务规则：**
- 费用消耗率 < 80%：安全（绿色）
- 费用消耗率 80%-100%：警告（黄色）
- 费用消耗率 > 100%：危险（红色）
- 费用消耗率 > 200%：高倍率病例
- 费用消耗率 < 50%：低倍率病例

### 2. 飞检风险评估

```typescript
import { useFlyCheckRisk } from './composables/useFlyCheckRisk';

const flyCheck = useFlyCheckRisk(settlement);

// 获取评估结果
const {
  assessment,      // 完整评估结果
  riskLevel,       // 风险等级
  riskScore,       // 风险分数 (0-100)
  riskFactors,     // 风险因素详情
  suggestions,     // 规避建议
  requiredDocuments, // 需要准备的材料
} = flyCheck;
```

**风险评分规则：**
| 风险因素 | 分值 |
|---------|-----|
| 高倍率病例 | 40分 |
| 诊断不匹配 | 25分 |
| 药品使用异常 | 15分 |
| 重复检查 | 10分 |
| 诊断依据不足 | 10分 |

**风险等级：**
- 低风险：< 30分
- 中风险：30-60分
- 高风险：≥ 60分

### 3. CMI计算

```typescript
import { useCMICalculation } from './composables/useCMICalculation';

const cmi = useCMICalculation({
  drgWeight: ref(2.856),
  hospitalAvgCMI: ref(1.2),
});

// 获取计算结果
const {
  analysis,           // 完整分析结果
  cmiDiff,            // CMI差异
  impact,             // 影响评估 ('positive' | 'negative' | 'neutral')
  impactDescription,  // 影响描述
  impactPercent,      // 影响百分比
} = cmi;
```

**影响评估规则：**
- 权重差异 > 0.2：正向影响
- 权重差异 < -0.2：负向影响
- 其他：中性影响

## 组件使用指南

### DataCard 数据卡片

```vue
<template>
  <DataCard title="卡片标题" subtitle="副标题">
    <!-- 内容 -->
    <view>卡片内容</view>
    
    <!-- 底部 -->
    <template #footer>
      <view>底部内容</view>
    </template>
  </DataCard>
</template>
```

### ProgressBar 进度条

```vue
<template>
  <ProgressBar 
    :percent="75" 
    label="费用消耗"
    :status="'warning'"
    showInfo
    infoText="预计结余：¥2,000"
  />
</template>
```

### WarningTag 警告标签

```vue
<template>
  <!-- 预警级别 -->
  <WarningTag type="warning" level="safe" />
  
  <!-- 风险等级 -->
  <WarningTag type="risk" level="high" />
  
  <!-- 病例类型 -->
  <WarningTag type="case" level="normal" />
</template>
```

### DRGInfoPanel DRG信息面板

```vue
<template>
  <DRGInfoPanel :drgInfo="drgAnalysisResult" />
</template>
```

### FlyCheckRisk 飞检风险评估

```vue
<template>
  <FlyCheckRisk 
    :assessment="flyCheckAssessment"
    :showApplyButton="true"
    @apply="onApplySpecialCase"
  />
</template>
```

## 状态管理

使用Pinia进行状态管理：

```typescript
import { useDRGStore } from './store';

const store = useDRGStore();

// State
store.patientInfo;
store.settlementList;
store.currentSettlement;
store.medicalCopyList;

// Getters
store.hasData;
store.totalCount;
store.highRiskCount;
store.highRateCount;

// Actions
store.setPatientInfo(info);
store.setSettlementList(list);
store.addMedicalCopy(item);
store.reset();
```

## API接口

### 结算相关

```typescript
import { 
  getSettlementList, 
  getSettlementDetail,
  getDRGInfo,
  getFlyCheckRisk,
} from './api';

// 获取结算列表
const { data } = await getSettlementList({
  patientId: 'P001',
  projectType: '2',
  page: 1,
  pageSize: 10,
});

// 获取结算详情
const { data: detail } = await getSettlementDetail('202401010001');
```

### 特病单议

```typescript
import { submitSpecialCaseApply, getSpecialCaseList } from './api';

// 提交申请
const { data } = await submitSpecialCaseApply({
  settlementNo: '202401010001',
  excessReason: '严重并发症',
  excessReasonType: 'complication',
  supportingDocs: [],
});
```

### 病案复印

```typescript
import { 
  getMedicalCopyList, 
  submitMedicalCopyApply,
  getInpatientRecords,
} from './api';

// 获取申请列表
const { data } = await getMedicalCopyList('P001');

// 提交申请
const { data } = await submitMedicalCopyApply({
  copyType: 'inpatient',
  copyContent: ['homepage', 'admission', 'discharge'],
  copyCount: 1,
});
```

## 适配器使用

### 获取用户信息

```typescript
import { userAdapter } from './adapters';

// 自动选择来源（Pinia优先）
const user = userAdapter.get();

// 从Pinia获取
const userFromPinia = userAdapter.fromPinia();

// 从Storage获取
const userFromStorage = userAdapter.fromStorage();
```

### 发起请求

```typescript
import { requestAdapter } from './adapters';

// GET请求
const data = await requestAdapter.get('/api/list');

// POST请求
const result = await requestAdapter.post('/api/submit', { ... });

// 通用请求
const response = await requestAdapter.request({
  url: '/api/custom',
  method: 'POST',
  data: { ... },
});
```

### 路由导航

```typescript
import { routerAdapter } from './adapters';

// 导航到新页面
routerAdapter.navigateTo('/pages/detail');

// 返回上一页
routerAdapter.navigateBack();

// 重定向
routerAdapter.redirectTo('/pages/home');
```

## 工具函数

### 金额格式化

```typescript
import { formatAmount, formatCurrency, formatAmountWithComma } from './utils';

formatAmount(12345.67);        // "12345.67"
formatCurrency(12345.67);      // "¥12345.67"
formatAmountWithComma(12345.67); // "12,345.67"
```

### 百分比格式化

```typescript
import { formatPercent, formatProgress } from './utils';

formatPercent(0.7534);         // "75.3%"
formatProgress(7500, 10000);   // "75.0%"
```

### DRG相关计算

```typescript
import { 
  calculateCostRate, 
  getCaseType, 
  getWarningLevel,
  calculateDRGBalance,
} from './utils';

calculateCostRate(18500, 20000);  // 92.5
getCaseType(52000, 25000);        // 'high'
getWarningLevel(92.5);            // 'safe'
calculateDRGBalance(20000, 18500); // 1500
```

### 数据脱敏

```typescript
import { maskIdCard, maskPhone, maskName } from './utils';

maskIdCard('330102199001011234');  // "330102********1234"
maskPhone('13800138000');          // "138****8000"
maskName('张三');                   // "张*"
```

## 最佳实践

### 1. 组件开发

- 组件文件使用 PascalCase 命名
- 组件props需要定义类型和默认值
- 使用 scoped 样式避免污染
- 复杂组件拆分为更小的子组件

### 2. 业务逻辑

- 使用 composables 封装可复用逻辑
- 保持 composables 的单一职责
- 使用 ref 和 computed 管理状态
- 复杂的计算逻辑使用 computed

### 3. 类型定义

- 为所有props定义类型
- 为函数参数和返回值定义类型
- 使用 interface 定义对象类型
- 使用 type 定义联合类型

### 4. 错误处理

```typescript
try {
  const data = await api.getData();
} catch (error) {
  console.error('[DRG Module] Failed to get data:', error);
  uni.showToast({ title: '数据加载失败', icon: 'none' });
}
```

### 5. 性能优化

- 使用 v-show 替代 v-if 控制频繁切换的元素
- 大数据列表使用虚拟滚动
- 使用 computed 缓存计算结果
- 防抖处理频繁触发的事件

## 调试技巧

### 启用Vue DevTools

在开发环境中启用Vue DevTools可以更好地调试组件状态。

### 查看Mock数据

Mock数据位于 `mock/settlements.ts`，可以修改数据来测试不同场景。

### 日志输出

模块内部使用统一的日志前缀 `[DRG Module]`，方便过滤和查找。

## 常见问题

### Q: 如何添加新的费用类别？

A: 在 `constants/index.ts` 的 `COST_CATEGORY_CONFIG` 中添加新的类别配置。

### Q: 如何修改风险评分规则？

A: 在 `constants/index.ts` 的 `FLYCHECK_RISK_SCORES` 中修改分值。

### Q: 如何添加新的API接口？

A: 在 `api/index.ts` 中添加新的接口函数，并在 `types/index.ts` 中添加对应的类型定义。

### Q: 如何与原项目集成？

A: 参考适配器层的实现，根据原项目的实际情况调整 `adapters/index.ts`。
