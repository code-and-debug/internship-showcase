# 智能预问诊业务使用指南

## 业务流程

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   选择身体部位    │ ──► │   选择相关症状    │ ──► │   补充描述信息   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               ▼
         │                                    ┌─────────────────┐
         │                                    │   提交AI评估    │
         │                                    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                           ┌─────────────────┐
│  查看评估结果    │ ◄────────────────────────  │  获取推荐科室   │
└─────────────────┘                           └─────────────────┘
         │
         ▼
┌─────────────────┐
│  前往就诊/复诊   │
└─────────────────┘
```

## 功能模块详解

### 1. 预问诊首页

入口页面，提供开始预问诊和查看历史记录的入口。

**功能**:
- 开始新的预问诊
- 查看评估历史记录
- 快速入口提示

### 2. 人体部位选择

通过可视化的人体模型，让用户选择不适部位。

**交互流程**:
1. 展示人体部位图
2. 用户点击选择部位
3. 支持多部位选择
4. 点击"下一步"进入症状选择

**数据处理**:
- 使用 `useBodyParts` composable 管理部位数据
- 部位选择状态保存在 Store 中

### 3. 症状选择

根据选择的部位，显示相关的症状供用户选择。

**交互流程**:
1. 加载选中部位关联的症状列表
2. 用户选择症状（可多选）
3. 支持搜索筛选症状
4. 可添加补充描述

**重要提示**:
- 至少选择一个症状才能提交评估
- 可选择症状的严重程度

### 4. AI 评估

提交症状信息，获取AI评估结果。

**评估结果包含**:
- 🔴 严重程度评估（正常/需注意/紧急）
- 🏥 推荐科室列表（带紧急程度）
- 📋 可能疾病列表（带概率）
- 💡 健康建议

### 5. 历史记录

保存用户的评估历史，支持查看详情。

**功能**:
- 按时间分组展示
- 支持上拉加载更多
- 可查看历史评估详情

## 数据流

### 状态管理 (Pinia Store)

```
diagnosisStore
├── bodyParts: IBodyPart[]           # 身体部位列表
├── selectedBodyParts: IBodyPart[]   # 选中的部位
├── selectedSymptoms: ISymptom[]     # 选中的症状
├── assessmentResult: IAssessmentResult  # 评估结果
├── description: string              # 补充描述
├── voiceText: string               # 语音转文字
└── historyRecords: IPreDiagnosisRecord[]  # 历史记录
```

### API 调用流程

```typescript
// 1. 获取身体部位
const bodyParts = await diagnosisApi.getBodyParts();

// 2. 获取部位相关症状
const symptoms = await diagnosisApi.getSymptomsByBodyPart(partId);

// 3. 提交评估
const result = await diagnosisApi.submitAssessment({
  patientId: 'xxx',
  bodyParts: ['head', 'chest'],
  symptoms: [{ id: '1', name: '头痛' }],
  description: '持续3天'
});

// 4. 获取历史
const history = await diagnosisApi.getAssessmentHistory(patientId);
```

## 页面跳转

### pages.json 配置

```json
{
  "subPackages": [
    {
      "root": "pagesD/smartPreDiagnosis",
      "pages": [
        {
          "path": "pages/index",
          "style": { "navigationBarTitleText": "智能预问诊" }
        },
        {
          "path": "pages/bodyMap",
          "style": { "navigationBarTitleText": "选择部位" }
        },
        {
          "path": "pages/symptoms",
          "style": { "navigationBarTitleText": "选择症状" }
        },
        {
          "path": "pages/result",
          "style": { "navigationBarTitleText": "评估结果" }
        },
        {
          "path": "pages/records",
          "style": { "navigationBarTitleText": "评估记录" }
        }
      ]
    }
  ]
}
```

### 路由跳转示例

```typescript
// 首页 → 部位选择
uni.navigateTo({
  url: '/pagesD/smartPreDiagnosis/pages/bodyMap'
});

// 部位选择 → 症状选择
uni.navigateTo({
  url: '/pagesD/smartPreDiagnosis/pages/symptoms'
});

// 症状选择 → 评估结果
uni.navigateTo({
  url: '/pagesD/smartPreDiagnosis/pages/result'
});

// 首页 → 历史记录
uni.navigateTo({
  url: '/pagesD/smartPreDiagnosis/pages/records'
});
```

## 业务规则

### 评估规则

1. **症状选择**: 至少选择1个症状才能提交
2. **部位选择**: 可选择1个或多个部位
3. **补充描述**: 可选填，提供更准确的评估
4. **语音输入**: 支持语音转文字（需开通语音功能）

### 科室推荐规则

- 根据症状和部位综合分析
- 考虑症状紧急程度
- 结合科室擅长领域

### 结果展示规则

- 按概率从高到低排序疾病列表
- 紧急情况显示明显提示
- 提供就诊建议

## 错误处理

### 常见错误

| 错误码 | 说明 | 处理方式 |
|--------|------|----------|
| 1001 | 未选择症状 | 提示用户至少选择一个症状 |
| 1002 | 评估服务暂不可用 | 提示稍后重试 |
| 1003 | 网络错误 | 显示重试按钮 |
| 1004 | 会话超时 | 跳转登录 |

### 示例代码

```typescript
const { submitAssessment, errorMsg } = useAssessment();

const handleSubmit = async () => {
  if (!hasSelectedSymptoms.value) {
    uni.showToast({
      title: '请至少选择一个症状',
      icon: 'none'
    });
    return;
  }
  
  const result = await submitAssessment(patientId);
  if (result) {
    uni.navigateTo({ url: './result' });
  } else if (errorMsg.value) {
    uni.showToast({
      title: errorMsg.value,
      icon: 'none'
    });
  }
};
```

## 性能优化

### 1. 数据缓存

- 身体部位数据变化少，可缓存
- 使用 `symptomsCache` 缓存已加载的症状

### 2. 按需加载

- 症状列表按部位按需加载
- 历史记录使用分页加载

### 3. 减少请求

- 避免重复请求相同数据
- 使用持久化存储配置数据

## 注意事项

⚠️ **重要提示**:

1. 评估结果仅供参考，不能替代医生诊断
2. 紧急情况请立即前往医院就诊
3. 确保用户知情同意后再进行评估
4. 保护用户隐私数据
