# Vue3 问卷系统重构案例

> 基于 Vue 3 + TypeScript 的问卷系统重构实战案例，展示大厂前端开发最佳实践。

## 🎯 项目背景

本项目是我在实习期间对遗留问卷系统进行重构的成果，原始代码存在以下问题：

- ❌ 代码量过大，单一组件超过 600 行
- ❌ TypeScript 类型定义不完善，使用大量 `any`
- ❌ 业务逻辑与 UI 耦合严重
- ❌ 硬编码魔法数字，缺乏常量管理
- ❌ 命名不规范，存在拼音命名

## ✨ 重构亮点

### 1. 架构设计优化

```
┌─────────────────────────────────────┐
│  View Layer (页面层)                │
│  └── QuestionnairePage.vue          │
├─────────────────────────────────────┤
│  Component Layer (组件层)           │
│  ├── FormBox.vue                    │
│  ├── ImageSwiper.vue                │
│  └── FormRenderer.vue               │
├─────────────────────────────────────┤
│  Composable Layer (逻辑层)          │
│  ├── useQuestionnaire.ts            │
│  └── useFormData.ts                 │
├─────────────────────────────────────┤
│  Constants & Types                  │
│  ├── types/questionnaire.ts         │
│  └── constants/questionnaire.ts     │
└─────────────────────────────────────┘
```

### 2. 代码量优化

| 文件 | 重构前 | 重构后 | 优化率 |
|------|--------|--------|--------|
| formBox.vue | 644行 | ~200行 | **-69%** |
| questionAfterVisit1.vue | 257行 | ~180行 | **-30%** |
| **总计** | **901行** | **~380行** | **-58%** |

### 3. 类型安全

- ✅ TypeScript 严格模式
- ✅ 消除所有 `any` 类型
- ✅ 15+ 个精细化的接口定义
- ✅ 6 个语义化枚举类型

### 4. 设计模式应用

- **单一职责原则 (SRP)**：每个函数只做一件事
- **组合式函数 (Composables)**：抽离可复用逻辑
- **常量集中管理**：告别魔法数字
- **组件职责分离**：UI 与逻辑解耦

## 📊 重构成果

| 指标 | 重构前 | 重构后 | 优化率 |
|------|--------|--------|--------|
| 代码行数 | 901行 | 380行 | **-58%** |
| any 类型 | 20+处 | **0处** |
| 接口定义 | 2个 | **15+个** |
| 枚举定义 | 0个 | **6个** |

---

## 📁 项目结构

```
questionnaire-refactor/
├── types/
│   └── questionnaire.ts          # 类型定义
├── constants/
│   └── questionnaire.ts          # 常量定义
├── composables/
│   ├── useQuestionnaire.ts       # 问卷业务逻辑
│   └── useFormData.ts            # 表单数据处理
├── components/
│   └── form-box/
│       ├── FormBox.vue           # 表单主组件
│       ├── ImageSwiper.vue       # 图片轮播组件
│       └── FormRenderer.vue      # 表单渲染组件
├── pages/
│   └── questionnaire/
│       └── QuestionnairePage.vue # 问卷页面
├── utils/
│   ├── date.ts                   # 日期工具
│   └── url.ts                    # URL 工具
├── ANALYSIS.md                   # 详细分析文档
└── README.md                     # 本文件
```

## 🔧 核心技术栈

- **Vue 3** - Composition API
- **TypeScript** - 严格类型模式
- **VueUse** - 组合式工具函数
- **UniApp** - 跨端框架

## 📊 核心代码示例

### 组合式函数设计

```typescript
// composables/useQuestionnaire.ts
export function useQuestionnaire(options: UseQuestionnaireOptions) {
  const formList = ref<IFormListItem[]>([]);
  const loading = ref(false);
  
  const init = async (category: string) => {
    loading.value = true;
    // ... 业务逻辑
    loading.value = false;
  };
  
  return {
    formList,
    loading,
    init,
  };
}
```

### 常量管理

```typescript
// constants/questionnaire.ts
export const LOVE_TYPE_MAP: Record<string, LoveType> = {
  77: 'donate',
  76: 'receive',
};

export const SPECIAL_SYSTEM_CODES = {
  EASTERN_WAR_ZONE: '1001036',
  WESTERN_WAR_ZONE: '1001048',
} as const;
```

### 类型定义

```typescript
// types/questionnaire.ts
export interface IFormListItem {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  // ... 完整类型定义
}

export enum QuestionType {
  RADIO = 0,
  CHECKBOX = 1,
  TEXT = 2,
  // ...
}
```

## 📝 详细分析

详见 [ANALYSIS.md](./ANALYSIS.md)，包含：

- 原始代码问题详细分析
- 大厂技术栈优化方案
- 具体优化点详解
- 重构前后对比数据


## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/code-and-debug/something-I-make.git

# 查看重构代码
cd refactored-code

# 阅读分析文档
code ANALYSIS.md
```

> 主要成果：
> 1. 架构优化：将 900+ 行的单体组件拆分为分层架构，代码量减少 58%
> 2. 类型安全：全面使用 TypeScript 严格模式，消除所有 any 类型
> 3. 逻辑复用：抽离出 2 个组合式函数，实现业务逻辑复用
> 4. 规范建立：建立常量管理体系，规范命名，完善错误处理

---

## 📁 返回导航

[⬅️ 返回主目录](../README.md) | 
[住院管家](../modules/hospital-butler/) | 
[治疗预约](../modules/treatment-appointment/) | 
[人才专窗](../modules/talent-window/) | 
[MDT问诊](../modules/mdt-inquiry/) | 
[问卷重构](./)


