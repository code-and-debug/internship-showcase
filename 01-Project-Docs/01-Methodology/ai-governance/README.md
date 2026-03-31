# AI-Native软件工程治理框架

本目录包含完整的AI-Native工程治理体系，涵盖方法论、策略模板和实施工具。

## 目录结构

```
docs/ai-governance/
├── README.md                          # 本文件
├── var-framework/                     # V.A.R.三角模型框架
│   ├── README.md                      # 框架概述
│   ├── IMPLEMENTATION_GUIDE.md        # 详细实施指南
│   ├── QUICK_START.md                 # 5分钟快速开始
│   ├── CHECKLIST.md                   # 验证清单
│   ├── configs/                       # 配置文件
│   │   ├── eslint-ai-rules.js         # AI专用ESLint规则
│   │   └── feature-flags.ts           # 特性开关模板
│   ├── templates/                     # 代码模板
│   │   ├── ai-code-header.ts          # AI代码头部模板
│   │   └── contract-interface.ts      # 契约接口模板
│   ├── scripts/                       # 自动化脚本
│   │   ├── pre-commit                 # Git钩子
│   │   └── check-ai-headers.sh        # AI头部检查
│   └── examples/                      # 完整示例
│       ├── DECISIONS.md               # 决策日志示例
│       └── hospital-workflow/         # 住院流程示例
│
└── ai-governance-templates/           # 场景化模板
    ├── README.md                      # 模板选择指南
    ├── medical-domain-template/       # 医疗域模板
    │   ├── policies/                  # OPA策略
    │   ├── prompts/                   # Prompt Registry
    │   ├── shadow-mode/               # 影子模式配置
    │   └── docs/                      # 实施指南
    └── general-software-template/     # 通用软件模板
        ├── policies/                  # 安全门禁策略
        ├── prompts/                   # 提示词注册表
        └── docs/                      # 实施指南
```

## 快速导航

### 如果你是第一次接触

1. **了解V.A.R.框架** → [var-framework/README.md](./var-framework/README.md)
2. **5分钟快速开始** → [var-framework/QUICK_START.md](./var-framework/QUICK_START.md)
3. **选择场景模板** → [ai-governance-templates/README.md](./ai-governance-templates/README.md)

### 如果你要实施到项目

1. **详细实施指南** → [var-framework/IMPLEMENTATION_GUIDE.md](./var-framework/IMPLEMENTATION_GUIDE.md)
2. **13天实施计划** → IMPLEMENTATION_GUIDE.md 第3部分
3. **验证清单** → [var-framework/CHECKLIST.md](./var-framework/CHECKLIST.md)

### 如果你要写技术文档

1. **工程演进历程** → [../engineering-evolution.md](../engineering-evolution.md)
2. **框架架构图** → var-framework/README.md (Mermaid图)
3. **量化成果** → CHECKLIST.md 中的验证标准

## 核心概念

### V.A.R.三角模型

| 维度 | 核心问题 | 关键实践 | 产出物 |
|------|----------|----------|--------|
| **Verifiable** | 代码正确吗？ | 契约先行、双轨验证、Property测试 | 类型契约、测试套件 |
| **Auditable** | 为什么这样写？ | 元数据嵌入、PromptDB、ADR | 审计日志、决策记录 |
| **Recoverable** | 出事了怎么办？ | 特性开关、数据备份、环境固化 | 回滚方案、部署配置 |

### 模板选择矩阵

| 项目类型 | 推荐模板 | 关键差异 |
|----------|----------|----------|
| 医疗/金融/政务 | medical-domain-template | HIPAA合规、Shadow Mode |
| 通用SaaS/内部工具 | general-software-template | 成本优化、快速落地 |
| 个人学习项目 | var-framework基础版 | 核心概念、渐进采用 |

## 实施成果示例

### 量化指标

```markdown
- 类型覆盖率: 100% (零any类型)
- 测试覆盖率: 核心逻辑100%
- 圈复杂度: 平均 < 10
- 代码审查: 100% AI代码带元数据
- 回滚时间: < 5分钟
- 生产事故: 0 (影子模式验证期间)
```

## 相关资源

- [OPA文档](https://www.openpolicyagent.org/docs/latest/)
- [fast-check文档](https://github.com/dubzzz/fast-check)
- [ADR模板](https://adr.github.io/)

---

**维护者**: @yourname  
**最后更新**: 2025-01-20  
**版本**: v2.0
