# DRG医保结算与病案管理模块

## 模块概述

DRG（Diagnosis-Related Groups，疾病诊断相关分组）医保结算与病案管理模块是一个完整的医疗业务模块，支持医保结算清单的DRG分析、飞检风险评估、病案复印等功能。

### 核心价值

- **费用分析**：DRG费用消耗率预警（80%黄/100%红）
- **飞检风险提示**：自动评估高倍率病例风险并给出规避建议
- **CC/MCC标识**：确保并发症信息完整，提升DRG分组准确性
- **CMI值分析**：展示病例对医院CMI的影响
- **特病单议申请**：为复杂病例提供申诉通道
- **病案复印全流程**：含DRG关联提示和保险建议

## 目录结构

```
drgSettlement/
├── README.md                    # 本文档
├── GUIDE.md                     # 开发指南
├── types/                       # TypeScript类型定义
│   └── index.ts
├── constants/                   # 常量定义
│   └── index.ts
├── utils/                       # 工具函数
│   └── index.ts
├── composables/                 # 组合式函数（业务逻辑）
│   ├── index.ts
│   ├── useDRGAnalysis.ts        # DRG分析
│   ├── useFlyCheckRisk.ts       # 飞检风险评估
│   ├── useCMICalculation.ts     # CMI计算
│   ├── useSelfPaymentCalc.ts    # 自付计算
│   ├── useCostComparison.ts     # 费用对比
│   ├── useSpecialCaseApply.ts   # 特病单议申请
│   ├── useCostStructure.ts      # 费用结构
│   ├── useMedicalCopy.ts        # 病案复印
│   └── useSecureShare.ts        # 安全分享
├── components/                  # 组件
│   ├── common/                  # 通用组件
│   │   ├── DataCard.vue
│   │   ├── ProgressBar.vue
│   │   ├── WarningTag.vue
│   │   └── EmptyState.vue
│   ├── settlement/              # 结算相关组件
│   │   ├── DRGInfoPanel.vue
│   │   ├── FlyCheckRisk.vue
│   │   ├── CostStructure.vue
│   │   ├── CMIPanel.vue
│   │   └── DiagnosisList.vue
│   └── medicalCopy/             # 病案复印组件
├── pages/                       # 页面
│   ├── settlement/              # 结算相关页面
│   │   ├── list.vue             # 结算列表
│   │   ├── detail.vue           # 结算详情
│   │   ├── costAnalysis.vue     # 费用分析
│   │   └── specialCaseApply.vue # 特病单议申请
│   └── medicalCopy/             # 病案复印页面
│       ├── list.vue             # 申请列表
│       ├── apply.vue            # 申请页面
│       └── detail.vue           # 申请详情
├── api/                         # API接口
│   └── index.ts
├── store/                       # Pinia状态管理
│   └── index.ts
├── mock/                        # Mock数据
│   └── settlements.ts
└── adapters/                    # 适配器层（与原项目对接）
    └── index.ts
```

## 快速开始

### 1. 页面配置

在 `pages.json` 的 `subPackages` 中添加：

```json
{
  "root": "pagesD",
  "pages": [
    {
      "path": "drgSettlement/pages/settlement/list",
      "style": {
        "navigationBarTitleText": "医保结算清单"
      }
    },
    {
      "path": "drgSettlement/pages/settlement/costAnalysis",
      "style": {
        "navigationBarTitleText": "费用分析"
      }
    },
    {
      "path": "drgSettlement/pages/medicalCopy/list",
      "style": {
        "navigationBarTitleText": "病案复印"
      }
    }
  ]
}
```

### 2. 使用示例

```typescript
// 引入composables
import { useDRGAnalysis } from '@/pagesD/drgSettlement/composables/useDRGAnalysis';
import { useFlyCheckRisk } from '@/pagesD/drgSettlement/composables/useFlyCheckRisk';

// 使用DRG分析
const drgParams = {
  drgCode: ref('FA19A'),
  drgName: ref('肺叶切除术'),
  weight: ref(2.856),
  paymentStandard: ref(20000),
  currentCost: ref(18500),
};

const drgAnalysis = useDRGAnalysis(drgParams);
console.log(drgAnalysis.analysis.value.warningLevel); // 'safe'

// 使用飞检风险评估
const settlement = ref(mockSettlementDetail);
const flyCheck = useFlyCheckRisk(settlement);
console.log(flyCheck.assessment.value.riskLevel); // 'low'
```

## 核心功能

### 1. DRG费用分析

- 计算费用消耗率
- 判断病例类型（普通/高倍率/低倍率）
- 预警级别判断（安全/警告/危险）
- 优化建议生成

### 2. 飞检风险评估

- 高倍率病例识别
- 诊断与费用匹配度分析
- 药品使用异常检测
- 规避建议和材料清单

### 3. CMI分析

- 病例权重计算
- 与医院平均CMI对比
- 影响评估（正向/负向/中性）
- 优化建议

### 4. 特病单议申请

- 申请资格检查
- 表单验证
- 材料清单生成
- 申请提交

### 5. 病案复印

- 住院记录选择
- 复印内容选择
- 费用估算
- 进度查询
- DRG关联提示

## 与原项目集成

本模块通过适配器层与原项目解耦：

```typescript
// 适配器使用示例
import { userAdapter, requestAdapter } from '@/pagesD/drgSettlement/adapters';

// 获取用户信息
const user = userAdapter.get();

// 发起请求
const data = await requestAdapter.get('/api/medical/settlement/list');
```

## 类型定义

完整的TypeScript类型定义位于 `types/index.ts`，包括：

- 结算相关类型
- 诊断相关类型（含CC/MCC）
- DRG分析类型
- 飞检风险类型
- CMI计算类型
- 特病单议类型
- 病案复印类型

## 开发指南

详细开发指南请参考 [GUIDE.md](./GUIDE.md)。

## 注意事项

1. 本模块为独立模块，不影响原项目正常运行
2. 通过适配器层与原项目对接，支持平滑集成
3. 包含完整的Mock数据，可独立演示
4. 所有金额单位为"元"，精确到分
5. 日期格式统一使用 ISO 8601 格式

## 更新日志

### v1.0.0
- 初始版本
- 实现DRG费用分析
- 实现飞检风险评估
- 实现CMI计算
- 实现病案复印功能
