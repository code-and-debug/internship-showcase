# 用药管理模块 (Medication Manager) - 优化版

## 📋 模块概述

用药管理模块是一个完整的用药提醒管理系统，帮助用户管理日常用药计划，包括添加用药提醒、设置提醒时间、从医院处方导入药品等功能。

## 🏗️ 架构设计

```
medicationManagerOptimized/
├── types/                    # TypeScript 类型定义
│   └── index.ts             # 所有类型定义集中管理
├── store/                   # 状态管理 (Pinia)
│   └── medicationStore.ts   # 用药模块全局状态
├── composables/             # 组合式函数 (可复用逻辑)
│   ├── useMedicationForm.ts # 表单逻辑封装
│   ├── useMedicationList.ts # 列表逻辑封装
│   └── useMedicationHistory.ts # 历史处方逻辑
├── components/              # 组件目录
│   ├── MedicationListItem.vue    # 用药提醒列表项
│   ├── MedicalCollapse.vue       # 处方折叠面板
│   ├── MedicationFormBox.vue     # 表单容器
│   ├── MedicationFormItem.vue    # 表单条目
│   ├── MedicationSelect.vue      # 选择器组件
│   ├── MedicationPopup.vue       # 弹窗选择器
│   └── MedicationTagContainer.vue # 标签容器
├── utils/                   # 工具函数
│   └── index.ts            # 工具函数集合
├── pages/                   # 页面文件
│   ├── MedicationList.vue  # 用药提醒列表页
│   ├── MedicationForm.vue  # 新增/编辑用药提醒页
│   └── MedicationHistory.vue # 历史处方导入页
└── README.md               # 本说明文档
```

## 🔄 业务流程

### 流程1: 查看用药提醒列表
```
┌─────────────────────────────────────────────────────────────┐
│  用户打开应用                                               │
│      ↓                                                      │
│  MedicationList.vue 页面加载                               │
│      ↓                                                      │
│  1. 获取当前患者信息 (g-choose-pat 组件)                    │
│  2. 调用 medicationStore.init() 初始化配置                 │
│  3. 调用 getList() 获取用药提醒列表                        │
│      ↓                                                      │
│  渲染 MedicationListItem 组件列表                          │
│      ↓                                                      │
│  用户可以看到所有用药提醒的状态、时间等信息                │
└─────────────────────────────────────────────────────────────┘
```

### 流程2: 新增用药提醒（自定义）
```
┌─────────────────────────────────────────────────────────────┐
│  用户在列表页点击"新增提醒"按钮                             │
│      ↓                                                      │
│  系统检查配置: isOpenCustom / isOpenHistory                │
│      ↓                                                      │
│  ┌─────────────────┬─────────────────┐                     │
│  │ 仅开启自定义    │ 同时开启两者    │                     │
│  │ 直接跳转        │ 显示 ActionSheet │                     │
│  │ 到表单页        │ 让用户选择      │                     │
│  └─────────────────┴─────────────────┘                     │
│      ↓                                                      │
│  MedicationForm.vue 页面加载 (新增模式)                    │
│      ↓                                                      │
│  用户填写表单信息:                                          │
│  ├─ 药品名称 (recipeName)                                  │
│  ├─ 使用途径 (useDrugWay)                                  │
│  ├─ 用法 (useDrugUses)                                     │
│  ├─ 单次用量 (useDrugAmount)                               │
│  ├─ 单位 (useDrugUnit)                                     │
│  ├─ 用药频次 (useDrugFrequency)                            │
│  ├─ 提醒日期范围 (dateRange)                               │
│  ├─ 提醒时间 (notifyTime) - 可添加多个                     │
│  └─ 备注 (remark)                                          │
│      ↓                                                      │
│  点击保存 → 表单验证 → 提交到后端                          │
│      ↓                                                      │
│  返回列表页，刷新列表                                       │
└─────────────────────────────────────────────────────────────┘
```

### 流程3: 从医院处方导入
```
┌─────────────────────────────────────────────────────────────┐
│  用户在列表页点击"新增提醒" → 选择"本院处方"               │
│      ↓                                                      │
│  MedicationHistory.vue 页面加载                            │
│      ↓                                                      │
│  调用 getList() 获取患者近5年的历史处方                    │
│      ↓                                                      │
│  按日期分组展示处方列表                                     │
│      ↓                                                      │
│  用户点击某条处方 → MedicalCollapse 组件展开               │
│      ↓                                                      │
│  调用 getUserDrugQueryDetail 获取处方详情                  │
│      ↓                                                      │
│  显示处方中的药品列表                                       │
│      ↓                                                      │
│  用户点击"添加"按钮                                        │
│      ↓                                                      │
│  将药品信息存入 store.addItem                              │
│      ↓                                                      │
│  跳转到 MedicationForm.vue (带入预填充数据)                │
│      ↓                                                      │
│  用户确认/修改信息后保存                                    │
└─────────────────────────────────────────────────────────────┘
```

### 流程4: 编辑用药提醒
```
┌─────────────────────────────────────────────────────────────┐
│  用户在列表页点击某条用药提醒                              │
│      ↓                                                      │
│  将该项数据存入 store.checkItem                            │
│      ↓                                                      │
│  跳转到 MedicationForm.vue                                 │
│      ↓                                                      │
│  onShow 生命周期中检测到 checkItem 存在                    │
│      ↓                                                      │
│  设置页面为"编辑模式"，调用 assignValue 填充表单           │
│      ↓                                                      │
│  用户修改信息                                               │
│      ↓                                                      │
│  点击保存 → 提交到后端 (携带 id 字段表示更新)              │
│      ↓                                                      │
│  返回列表页，刷新列表                                       │
└─────────────────────────────────────────────────────────────┘
```

### 流程5: 管理提醒（删除/关闭）
```
┌─────────────────────────────────────────────────────────────┐
│  用户在列表页点击"管理提醒"按钮                            │
│      ↓                                                      │
│  isShowCheck = true，进入管理模式                          │
│      ↓                                                      │
│  列表项左侧显示复选框                                       │
│      ↓                                                      │
│  用户选择要管理的项目                                       │
│      ↓                                                      │
│  ┌──────────────────────────┬──────────────────────────┐   │
│  │  点击"删除提醒"          │  点击"关闭提醒"          │   │
│  │      ↓                   │      ↓                   │   │
│  │  显示确认弹窗            │  直接执行关闭            │   │
│  │  调用 delete API         │  调用 close API          │   │
│  └──────────────────────────┴──────────────────────────┘   │
│      ↓                                                      │
│  操作成功 → 刷新列表 → 退出管理模式                        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 文件功能详解

### 1. types/index.ts
集中定义所有 TypeScript 类型，包括：
- 用药提醒数据结构 `IMedication`
- 历史处方数据结构 `TMedicalDrugHisListItem`
- 药品详情数据结构 `TDrugDetailItem`
- 表单数据结构 `IMedicationFormData`
- 组件 Props 类型定义

### 2. store/medicationStore.ts
Pinia Store 管理全局状态：
- `optionsDrugWay` / `optionsDrugUse` / `optionsDrugUnit` / `optionsFrequency`: 表单选项
- `checkItem`: 当前编辑的用药提醒
- `addItem`: 从历史处方导入的药品数据
- `config`: 系统配置（是否开启自定义/历史处方功能）

### 3. composables/*
将业务逻辑从组件中抽离，实现关注点分离：
- `useMedicationForm.ts`: 处理表单验证、提交、数据转换
- `useMedicationList.ts`: 处理列表加载、批量操作
- `useMedicationHistory.ts`: 处理历史处方数据获取和转换

### 4. components/*
- **MedicationListItem.vue**: 展示单个用药提醒的卡片，包含状态标签、提醒时间、用法用量
- **MedicalCollapse.vue**: 可折叠的处方卡片，懒加载处方详情
- **MedicationFormBox.vue / MedicationFormItem.vue**: 表单布局组件
- **MedicationSelect.vue / MedicationPopup.vue / MedicationTagContainer.vue**: 选择器组件族

### 5. pages/*
- **MedicationList.vue**: 主页面，列表展示 + 管理功能入口
- **MedicationForm.vue**: 表单页面，新增/编辑共用
- **MedicationHistory.vue**: 历史处方浏览和导入页面

## 🎯 优化点说明

相比原版本，优化版做了以下改进：

1. **类型安全**: 完整的 TypeScript 类型定义
2. **代码组织**: 按功能分层（types/store/composables/components/pages）
3. **逻辑复用**: 使用 Composables 抽离可复用逻辑
4. **组件化**: 更细粒度的组件拆分
5. **命名规范**: 统一使用 PascalCase 命名组件
6. **注释完善**: 每个函数、类型都有详细注释
7. **使用场景**: 每个关键代码块都配有使用场景说明

## 🚀 使用方式

```typescript
// 在需要使用用药管理的页面引入
import { useMedicationStore } from '@/pagesC/medicationManagerOptimized/store/medicationStore';

// 获取 store 实例
const medicationStore = useMedicationStore();

// 初始化配置
await medicationStore.init();

// 跳转到用药管理页面
uni.navigateTo({
  url: '/pagesC/medicationManagerOptimized/pages/MedicationList'
});
```
