# 智能预问诊模块

## 概述

智能预问诊模块是一个基于AI的预问诊系统，帮助患者在就诊前通过选择症状、身体部位等信息，获得AI评估结果和科室推荐。

## 功能特性

- 🤖 **AI智能评估**: 基于选择症状智能分析健康状况
- 🗺️ **人体部位图**: 可视化选择不适部位
- 🏥 **科室推荐**: 根据症状推荐就诊科室
- 📋 **历史记录**: 保存评估历史，随时查看

## 目录结构

```
smartPreDiagnosis/
├── api/                    # API 接口封装
│   ├── diagnosisApi.ts     # 诊断相关接口
│   └── index.ts            # 接口导出
├── components/             # 可复用组件
│   ├── BodyPartCard.vue    # 身体部位卡片
│   ├── SymptomTag.vue      # 症状标签
│   └── ResultCard.vue      # 评估结果卡片
├── composables/            # 组合式函数
│   ├── useAssessment.ts    # AI评估逻辑
│   ├── useBodyParts.ts     # 部位选择逻辑
│   ├── useSymptoms.ts      # 症状管理逻辑
│   ├── useHistory.ts       # 历史记录逻辑
│   └── index.ts            # 导出
├── pages/                  # 页面
│   ├── index.vue           # 预问诊首页
│   ├── bodyMap.vue         # 人体部位选择
│   ├── symptoms.vue        # 症状选择
│   ├── result.vue          # 评估结果
│   └── records.vue         # 历史记录
├── store/                  # Pinia 状态管理
│   └── diagnosisStore.ts   # 诊断 Store
├── types/                  # TypeScript 类型定义
│   └── index.ts            # 类型导出
├── utils/                  # 工具函数
│   ├── severity.ts         # 严重程度处理
│   ├── date.ts             # 日期处理
│   └── index.ts            # 导出
├── README.md               # 模块说明
└── GUIDE.md                # 业务使用指南
```

## 快速开始

### 1. 页面跳转

```typescript
// 跳转到预问诊首页
uni.navigateTo({
  url: '/pagesD/smartPreDiagnosis/pages/index'
});

// 跳转到人体部位选择
uni.navigateTo({
  url: '/pagesD/smartPreDiagnosis/pages/bodyMap'
});

// 跳转到评估结果
uni.navigateTo({
  url: '/pagesD/smartPreDiagnosis/pages/result'
});
```

### 2. 使用 Store

```typescript
import { useDiagnosisStore } from '@/pagesD/smartPreDiagnosis/store/diagnosisStore';

const store = useDiagnosisStore();

// 获取评估结果
const result = store.assessmentResult;

// 清除选择
store.clearSelection();
```

### 3. 使用 Composables

```typescript
// 在页面中使用组合式函数
import { useAssessment } from '@/pagesD/smartPreDiagnosis/composables';

export default {
  setup() {
    const { submitAssessment, isAssessing } = useAssessment();
    
    const handleAssess = async () => {
      const result = await submitAssessment('patientId');
      if (result) {
        uni.navigateTo({ url: './result' });
      }
    };
    
    return { handleAssess, isAssessing };
  }
};
```

### 4. 使用组件

```vue
<template>
  <!-- 症状标签 -->
  <SymptomTag 
    id="1" 
    name="头痛" 
    severity="mild"
    :selected="true"
    @click="handleClick"
  />
  
  <!-- 评估结果卡片 -->
  <ResultCard 
    :result="assessmentResult"
    @deptClick="handleDeptClick"
  />
</template>

<script setup>
import SymptomTag from '@/pagesD/smartPreDiagnosis/components/SymptomTag.vue';
import ResultCard from '@/pagesD/smartPreDiagnosis/components/ResultCard.vue';
</script>
```

## API 接口

| 接口 | 说明 | 参数 |
|------|------|------|
| `getBodyParts` | 获取身体部位列表 | - |
| `getSymptomsByBodyPart` | 获取部位相关症状 | `bodyPartId` |
| `submitAssessment` | 提交AI评估 | `IAssessmentRequest` |
| `getAssessmentHistory` | 获取评估历史 | `patientId` |

## 类型定义

主要类型包括：

- `IBodyPart`: 身体部位
- `ISymptom`: 症状
- `IAssessmentRequest`: 评估请求
- `IAssessmentResult`: 评估结果
- `IDiseaseRecommend`: 疾病推荐
- `IDeptRecommend`: 科室推荐
- `IPreDiagnosisRecord`: 预问诊记录

详细类型定义请查看 [`types/index.ts`](types/index.ts)

## 依赖

- Vue 3
- TypeScript
- Pinia (状态管理)
- uni-app (跨端框架)

## 注意事项

1. 模块位于 `src/pagesD/` 目录，不影响原项目运行
2. 使用 subpackages 方式进行页面路由配置
3. API 请求需要携带 token 认证
4. 评估结果仅供参考，不作为医疗诊断依据
