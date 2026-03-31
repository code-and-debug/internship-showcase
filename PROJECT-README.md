# 医疗数字化项目 - 技术资产库

> 个人技术沉淀与项目展示仓库

---

## 📁 目录结构

```
temp-repo/
├── 01-Project-Docs/              # 项目文档
│   ├── 01-Methodology/           # 方法论框架
│   │   ├── rac-framework/        # RAC 认知协议
│   │   ├── varc-framework/       # V.A.R.C. 会话管理
│   │   └── ai-governance/        # AI 治理框架
│   ├── 02-Architecture/          # 架构设计
│   │   ├── 00-ARCHITECTURE.md    # 项目架构总览
│   │   └── drg-his-integration.md# DRG集成方案
│   └── 03-Business/              # 业务产出
│       ├── business-analysis/    # 业务价值分析
│       ├── business-cases/       # 业务案例
│       └── ...
│
├── 02-Core-Assets/               # ⭐ 核心技术资产
│   ├── tech-articles/            # 5篇技术沉淀
│   │   ├── 01-预约挂号排班算法.md
│   │   ├── 02-人脸识别轮询机制.md
│   │   ├── 03-多租户配置化架构.md
│   │   ├── 04-安全加密通信体系.md
│   │   ├── 05-灵活权限控制架构.md
│   │   └── README.md             # 使用指南
│   └── 项目总结终版.md
│
├── 03-Source-Code/               # 源代码
│   ├── modules/                  # 业务模块
│   │   ├── cost-center/          # 费用中心
│   │   ├── drg-settlement/       # DRG结算
│   │   ├── medication-manager/   # 用药管理
│   │   ├── smart-pre-diagnosis/  # 智能预问诊
│   │   └── ...
│   ├── shared/                   # 共享资源
│   └── examples/                 # 架构示例
│       ├── config-center/        # 配置中心
│       └── config-driven/        # 配置驱动
│
├── 04-Tools/                     # 工具与资源
│   └── interview-prep/           # 面试准备
│
└── [根目录文件]
    ├── README.md                 # 项目入口
    ├── LICENSE
    └── AGENTS.md                 # AI 协作指南
```

---

## 🎯 快速导航

| 我想... | 去哪里 |
|--------|--------|
| 看核心技术方案 | `02-Core-Assets/tech-articles/` |
| 看业务模块代码 | `03-Source-Code/modules/` |
| 看架构设计文档 | `01-Project-Docs/02-Architecture/` |
| 看方法论框架 | `01-Project-Docs/01-Methodology/` |
| 准备面试 | `02-Core-Assets/tech-articles/README.md` |

---

## 📊 核心资产清单

### 5篇技术沉淀（面试必备）

| 序号 | 文档 | 关键词 | 复杂度 |
|-----|------|--------|-------|
| 01 | 预约挂号排班算法 | 树形转矩阵、reduce、O(n²) | ⭐⭐⭐ |
| 02 | 人脸识别轮询机制 | 长轮询、竞态条件、useInterval | ⭐⭐⭐ |
| 03 | 多租户配置化架构 | 配置驱动、SaaS、复用率90% | ⭐⭐⭐⭐⭐ |
| 04 | 安全加密通信体系 | DES加密、防重放、动态密钥 | ⭐⭐⭐⭐ |
| 05 | 灵活权限控制架构 | 策略模式、RBAC、Promise权限 | ⭐⭐⭐⭐ |

### 业务模块清单

| 模块 | 说明 | 状态 |
|-----|------|-----|
| cost-center | 费用中心（缴费/退款/日结） | ✅ 完整 |
| drg-settlement | DRG结算（病案/特案申请） | ✅ 完整 |
| medication-manager | 用药管理（依从性） | ✅ 完整 |
| smart-pre-diagnosis | 智能预问诊（症状/导诊） | ✅ 完整 |
| questionnaire-refactor | 表单引擎重构 | ✅ 完整 |

---

## 🚀 使用建议

### 面试准备
1. 重点阅读 `02-Core-Assets/tech-articles/`
2. 查看 `02-Core-Assets/tech-articles/README.md` 中的面试话术
3. 浏览 `03-Source-Code/modules/` 了解代码结构

### 方案复用
1. **配置化架构**：参考 `03-Source-Code/examples/config-center/`
2. **权限控制**：参考 `02-Core-Assets/tech-articles/05-灵活权限控制架构.md`
3. **加密通信**：参考 `02-Core-Assets/tech-articles/04-安全加密通信体系.md`

### 内容产出
- 技术博客：基于5篇技术沉淀改写
- 开源项目：基于 `examples/` 中的示例
- 演讲分享：结合 `01-Project-Docs/03-Business/` 中的业务分析

---

## 📝 维护记录

| 日期 | 操作 | 说明 |
|-----|------|------|
| 2025-03-31 | 目录重组 | 按功能重新划分目录结构 |

---

**维护者**：叶泽宇  
**更新时间**：2025-03-31
