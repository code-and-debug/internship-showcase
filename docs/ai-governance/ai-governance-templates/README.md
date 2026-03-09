# AI-Native 软件工程治理模板库

## 概述

本模板库提供**生产级**AI代码治理方案，包含两种严格度等级：

| 模板 | 严格度 | 适用场景 | 核心价值 |
|------|--------|----------|----------|
| **medical-domain-template** | 🔴 最高 | 医疗、金融、政务 | 合规审计通过 + 零事故 |
| **general-software-template** | 🟡 中等 | 通用SaaS、内部工具 | 快速落地 + 成本优化 |

## 模板对比

| 特性 | 医疗模板 | 通用模板 |
|------|----------|----------|
| 合规要求 | HIPAA/SOC 2 | 标准安全基线 |
| 类型安全 | 100% 强制 | 95% 建议 |
| 审查流程 | 双人+主治医师 | 单人审查 |
| 部署策略 | Shadow Mode 0% | Blue-Green |
| 上手时间 | 1-2周 | 30分钟 |

## 快速选择

### 选择医疗模板，如果你：
- 🏥 开发医疗/健康相关软件
- 💰 需要SOC 2/ISO 27001认证
- ⚖️ 面临严格监管要求

### 选择通用模板，如果你：
- 🚀 快速迭代MVP或内部工具
- 💸 需要控制AI使用成本
- 🔄 希望渐进式采用AI治理

## 相关文档

- [医疗模板实施指南](./medical-domain-template/docs/IMPLEMENTATION_GUIDE.md)
- [通用模板实施指南](./general-software-template/docs/IMPLEMENTATION_GUIDE.md)
- [V.A.R.框架详解](../var-framework/README.md)
