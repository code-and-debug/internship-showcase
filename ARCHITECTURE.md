# 架构设计文档

> 实习产出项目架构设计说明

## 📐 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         项目架构                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    业务模块层 (Modules)                   │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │   │
│  │  │ 住院管家     │ │ 治疗预约     │ │ 人才专窗     │       │   │
│  │  │ - types     │ │ - types     │ │ - types     │       │   │
│  │  │ - composables│ │ - composables│ │ - composables│       │   │
│  │  │ - components│ │ - components│ │ - components│       │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │              省中 MDT 问诊                       │    │   │
│  │  │  - types                                        │    │   │
│  │  │  - composables (useMDTInquiry, useFileUpload)   │    │   │
│  │  │  - components                                   │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    共享层 (Shared)                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ types    │  │composables│  │ utils    │              │   │
│  │  │ - common │  │ - usePatient│  │ - date   │              │   │
│  │  │          │  │          │  │ - url    │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 设计原则

### 1. 单一职责原则 (Single Responsibility Principle)

```typescript
// ❌ 不好的做法
const useHospitalModule = () => {
  // 状态管理
  // 数据获取
  // UI 交互
  // 数据处理
  // ... 所有逻辑混在一起
};

// ✅ 好的做法
const useHospitalStatus = () => {
  // 只负责状态管理
};

const useHospitalData = () => {
  // 只负责数据获取
};

const useGuideList = () => {
  // 只负责检查列表逻辑
};
```

### 2. 组合式函数 (Composables)

```typescript
// 将可复用逻辑抽离为 Composable
export function usePatient() { ... }
export function useLoading() { ... }
export function useFormValidation<T>() { ... }

// 在组件中使用
const { currentPatient, switchPatient } = usePatient();
const { loading, error, execute } = useLoading();
```

### 3. 类型驱动开发

```typescript
// 先定义类型
interface ITreatmentRecord {
  orderId: string;
  status: AppointmentStatus;
  timeSlot: ITimeSlot;
}

// 再实现逻辑
const useTreatmentAppointment = () => {
  const recordList = ref<ITreatmentRecord[]>([]);
  // 类型约束确保代码正确性
};
```

## 📁 目录结构规范

```
internship-showcase/
├── modules/                     # 业务模块目录
│   ├── module-name/
│   │   ├── types/
│   │   │   └── index.ts        # 类型定义
│   │   ├── constants/
│   │   │   └── index.ts        # 常量配置
│   │   ├── composables/
│   │   │   ├── useFeatureA.ts  # 功能 A 逻辑
│   │   │   └── useFeatureB.ts  # 功能 B 逻辑
│   │   ├── components/
│   │   │   ├── FeatureA.vue
│   │   │   └── FeatureB.vue
│   │   ├── pages/
│   │   │   └── index.vue       # 页面组件
│   │   ├── README.md           # 模块说明
│   │   └── GUIDE.md            # 开发指南(可选)
│   └── ...
├── examples/                    # 示例代码
│   └── config-driven-demo/
├── shared/                      # 共享资源
│   ├── types/
│   ├── composables/
│   └── utils/
├── README.md
└── ARCHITECTURE.md
```

### 命名规范

- **目录名**: 使用 `kebab-case`（短横线连接的小写字母）
  - ✅ `cost-center/`, `smart-pre-diagnosis/`, `drg-settlement/`
  - ❌ `costCenter/`, `smartPreDiagnosis/`, `drgSettlement/`

- **组件文件**: 使用 `PascalCase`
  - ✅ `DataCard.vue`, `CostStructure.vue`

- **组合式函数**: 使用 `camelCase`，以 `use` 开头
  - ✅ `useDRGAnalysis.ts`, `useCostComparison.ts`

## 🔗 模块依赖关系

```
住院管家
├── useHospitalStatus (独立)
├── useHospitalData (依赖: api)
└── useGuideList (依赖: api)

治疗预约
├── useTreatmentAppointment
│   ├── useDateFormat (shared)
│   └── 依赖: MEDICAL_CATEGORY_CONFIG (constants)
└── 依赖: api

人才专窗
├── useTalentForm (独立)
├── useScheduleData (依赖: api)
└── useTimeSelection (依赖: dayjs)

MDT 问诊
├── useMDTInquiry (核心逻辑)
├── useFileUpload (可复用)
└── useVoiceInput (可复用)
```

## 📊 代码量统计

| 模块 | 重构前 | 重构后 | 优化率 |
|------|--------|--------|--------|
| 住院管家 | 316行 | 140行 | -56% |
| 治疗预约 | 304行 | 120行 | -61% |
| 人才专窗 | 618行 | 200行 | -68% |
| MDT 问诊 | 1000+行 | 350行 | -65% |
| **总计** | **2238行** | **810行** | **-64%** |


