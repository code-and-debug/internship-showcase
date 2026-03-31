# 通用软件AI治理模板 - 实施指南

## 概述

本模板提供**实用型**AI治理方案，平衡代码质量与开发效率，适合大多数软件项目。

相比医疗模板的严格合规，通用模板更注重：
- **快速落地**: 配置简单，30分钟完成集成
- **适度约束**: 安全红线 + 质量建议，不阻碍开发
- **成本控制**: 内置token使用监控和模型降级策略

## 核心特性

| 特性 | 医疗模板 | 通用模板 |
|------|----------|----------|
| 合规严格度 | HIPAA/SOC 2 | 标准安全基线 |
| 圈复杂度 | ≤ 10 (强制) | ≤ 15 (建议), >20 (阻止) |
| 审查流程 | 双人+主治医师 | 单人审查 |
| 部署策略 | Shadow Mode 0% | Blue-Green/直接 |

## 快速开始

### 1. 安装OPA

```bash
brew install opa
```

### 2. 配置Git Hook

```bash
# .husky/pre-commit
opa eval --data policies/security-gates.rego \
         --input staged-code.json \
         "data.general_ai.security.allow"
```

### 3. CI/CD集成

```yaml
name: AI Code Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Security Check
        run: opa test policies/ --verbose
```

## 策略详解

### 安全门禁 (security-gates.rego)

```rego
# 严重违规 - 阻止部署
deny[msg] {
    regex.match(`\b(eval|Function\()`, input.content)
    msg := "禁止动态代码执行"
}

# 高优先级警告 - 需人工审查
warn[msg] {
    regex.match(`(get|post|put|delete)`, input.content)
    not regex.match(`(zod|joi)`, input.content)
    msg := "API缺少输入验证"
}
```

### 成本控制 (cost-guardrails.rego)

```rego
# 预算告警
deny[msg] {
    input.daily_cost > input.daily_budget
    msg := sprintf("AI成本 $%.2f 超预算", [input.daily_cost])
}
```

## 渐进式采用

### 阶段1: 基础安全 (1天)

仅启用安全门禁：

```yaml
policies:
  - security-gates.rego
mode: warn  # 不阻止，只警告
```

### 阶段2: 质量建议 (1周)

添加代码质量检查：

```yaml
policies:
  - security-gates.rego
  - cost-guardrails.rego
mode: hybrid
```

## 常见问题

### Q: 如何处理遗留代码？

```rego
exception[rule_id] {
    input.file_path == "legacy/"
    input.justification == "遗留代码，已备案"
}
```

## 资源

- [OPA文档](https://www.openpolicyagent.org/docs/latest/)
- [Rego Playground](https://play.openpolicyagent.org/)

---

**提示**: 本模板是起点，根据项目需求调整策略严格度。
