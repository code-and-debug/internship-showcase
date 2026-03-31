# V.A.R.C. 框架 - 工具脚本目录

本目录包含 V.A.R.C. (Verifiable · Auditable · Recoverable · Conversational) 框架的所有工具脚本和模板。

---

## 📁 目录结构

```
.ai-sessions/
├── active/                    # 当前活跃会话
│   ├── session-*.md          # 会话快照文件
│   └── current.lnk           # 指向当前会话的快捷方式(Windows)
├── archive/                   # 已完成/废弃会话归档
│   └── YYYY-MM/              # 按月归档
├── chains/                    # 会话链索引
│   └── chain-*.json          # 功能级会话链
├── recovery/                  # 灾难恢复模板
│   └── emergency-restore.md  # 紧急恢复协议
├── templates/                 # 模板文件
│   ├── session-snapshot-template.md
│   ├── session-chain-template.json
│   └── emergency-recovery-template.md
├── varc-init.ps1/sh          # 初始化脚本
├── varc-save.ps1/sh          # 保存会话脚本
├── varc-fork.ps1/sh          # 分叉会话脚本
├── varc-status.ps1/sh        # 状态查看脚本
├── varc-QUICKREF.md          # 快速参考卡
└── README.md                 # 本文件
```

---

## 🚀 快速开始

### Windows (PowerShell)

```powershell
# 初始化项目
.\varc-init.ps1 -ProjectName "my-project"

# 日常开发
.\varc-status.ps1
.\varc-save.ps1 -Reason "完成核心功能"
.\varc-fork.ps1 -Parent "sess_..." -Reason "上下文耗尽"
```

### Linux/Mac (Bash)

```bash
# 初始化项目
./varc-init.sh -p "my-project"

# 日常开发
./varc-status.sh
./varc-save.sh -r "完成核心功能"
./varc-fork.sh -p "sess_..." -r "上下文耗尽"
```

---

## 📜 脚本说明

### varc-init (初始化)

创建 V.A.R.C. 框架所需的目录结构和初始文件。

**参数:**
- `-ProjectName` / `-p`: 项目名称 (必需)
- `-Template` / `-t`: 项目模板 (可选，默认: default)
- `-SkipGit`: 跳过 Git 集成 (可选)

### varc-save (保存会话)

保存当前会话状态到文件。

**参数:**
- `-Reason` / `-r`: 保存原因 (必需)
- `-Status` / `-s`: 会话状态 (可选，默认: checkpointed)
- `-Priority`: 恢复优先级 (可选，默认: normal)

### varc-fork (分叉会话)

当上下文耗尽时，基于父会话创建新会话。

**参数:**
- `-Parent` / `-p`: 父会话ID (必需)
- `-Reason` / `-r`: 分叉原因 (必需)
- `-ChainId` / `-c`: 会话链ID (可选)

### varc-status (查看状态)

显示当前 V.A.R.C. 框架的状态概览。

---

## 📋 模板说明

### session-snapshot-template.md

会话快照模板，包含:
- 元数据区块 (YAML Frontmatter)
- 不可变约束
- 当前状态 (代码/思维/阻塞点)
- 决策日志
- 资源引用
- 续接指南

### session-chain-template.json

会话链索引模板，用于追踪功能跨多个会话的演进。

### emergency-recovery-template.md

紧急恢复协议模板，当AI"失忆"或偏离轨道时使用。

---

## 🔗 相关文件

- 项目级配置: `../.varc-config.yml`
- 框架文档: `../VARC-README.md`
- 快速参考: `./varc-QUICKREF.md`

---

**V.A.R.C. Framework v1.0.0**
