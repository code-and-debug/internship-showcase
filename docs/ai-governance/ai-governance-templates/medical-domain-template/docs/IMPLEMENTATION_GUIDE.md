# 医疗域AI治理模板 - 实施指南

## 概述

本模板提供**生产级**医疗软件AI治理方案，确保AI生成的代码符合HIPAA、SOC 2等医疗行业标准。

## 核心特性

| 特性 | 说明 | 合规价值 |
|------|------|----------|
| **Guardrails-as-Code** | OPA策略阻止违规代码进入生产 | HIPAA审计通过 |
| **Prompt Registry** | 版本化提示词管理，确保可复现 | SOC 2 Type II |
| **Shadow Mode** | 0%流量开始，渐进式部署 | 零生产事故 |
| **幻觉检测** | 检测AI生成的虚假API/逻辑 | 数据完整性保障 |

## 快速开始

### 1. 安装OPA

```bash
brew install opa
opa version
```

### 2. 运行合规检查

```bash
opa eval --data policies/hipaa-compliance.rego \
         --input '{"file_type": "typescript", "content": "const patient_id = 12345"}' \
         "data.medical_ai.hipaa.violation"
```

### 3. 集成到CI/CD

```yaml
name: AI Governance Check
on: [pull_request]
jobs:
  govern:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: open-policy-agent/setup-opa@v2
      - name: Run HIPAA Compliance Check
        run: opa test policies/ --verbose
```

## 策略详解

### HIPAA合规策略 (hipaa-compliance.rego)

```rego
# 关键规则示例
deny[msg] {
    input.file_type == "typescript"
    contains(input.content, "patient_id = 12345")
    msg := "HIPAA违规: 硬编码患者ID"
}
```

### 代码质量策略 (code-quality.rego)

- 圈复杂度 ≤ 10
- 嵌套层级 ≤ 3
- 零 `any` 类型
- 强制单元测试

## 影子模式部署

### 阶段1: 观察模式 (0%流量)

```yaml
shadowTraffic:
  initialPercentage: 0
```

### 阶段2: 验证模式 (1%流量)

```yaml
exitCriteria:
  - metric: accuracy
    threshold: ">= 0.99"
  - metric: hallucination_rate
    threshold: "< 0.001"
```

## 最佳实践

### 代码标记

```typescript
/**
 * @MEDICAL_REVIEW_REQUIRED 关键医疗算法
 * @HIPAA_SENSITIVE 处理PHI数据
 * @AUDIT_REQUIRED 需要审计日志
 */
export function calculateDRG(input: DRGInput): DRGResult {
  // ...
}
```

## 联系与支持

- 紧急事件: #ai-governance-alerts
