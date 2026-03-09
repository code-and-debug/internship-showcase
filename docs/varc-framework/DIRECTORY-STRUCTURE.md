# V.A.R.C. 框架目录结构

```
temp-repo/
├── .ai-sessions/                          # 对话状态仓库
│   ├── README.md                          # 脚本目录说明
│   ├── varc-init.ps1                      # 初始化脚本 (Windows)
│   ├── varc-init.sh                       # 初始化脚本 (Linux/Mac)
│   ├── varc-save.ps1                      # 保存会话脚本 (Windows)
│   ├── varc-save.sh                       # 保存会话脚本 (Linux/Mac)
│   ├── varc-fork.ps1                      # 分叉会话脚本 (Windows)
│   ├── varc-fork.sh                       # 分叉会话脚本 (Linux/Mac)
│   ├── varc-status.ps1                    # 状态查看脚本 (Windows)
│   ├── varc-status.sh                     # 状态查看脚本 (Linux/Mac)
│   ├── varc-QUICKREF.md                   # 快速参考卡
│   │
│   ├── active/                            # 当前活跃会话
│   │   └── session-20240309-01-example.md # 示例会话快照
│   │
│   ├── archive/                           # 已完成/废弃会话归档
│   │   └── (按月归档，如 2024-03/)
│   │
│   ├── chains/                            # 会话链索引
│   │   └── chain-parser-refactor.json     # 示例会话链
│   │
│   ├── recovery/                          # 灾难恢复模板
│   │   └── emergency-restore.md           # 紧急恢复协议
│   │
│   └── templates/                         # 模板文件
│       ├── session-snapshot-template.md   # 会话快照模板
│       ├── session-chain-template.json    # 会话链模板
│       └── emergency-recovery-template.md # 紧急恢复模板
│
├── .varc-config.yml                       # 框架配置
├── VARC-README.md                         # 完整框架文档
├── README.md                              # 项目入口
└── DIRECTORY-STRUCTURE.md                 # 本文件
```

---

## 文件清单

### 脚本文件 (8个)

| 文件 | 平台 | 说明 |
|-----|------|------|
| varc-init.ps1 | Windows | 项目初始化 |
| varc-init.sh | Linux/Mac | 项目初始化 |
| varc-save.ps1 | Windows | 保存会话 |
| varc-save.sh | Linux/Mac | 保存会话 |
| varc-fork.ps1 | Windows | 分叉会话 |
| varc-fork.sh | Linux/Mac | 分叉会话 |
| varc-status.ps1 | Windows | 查看状态 |
| varc-status.sh | Linux/Mac | 查看状态 |

### 模板文件 (4个)

| 文件 | 说明 |
|-----|------|
| session-snapshot-template.md | 会话快照模板 |
| session-chain-template.json | 会话链模板 |
| emergency-recovery-template.md | 紧急恢复模板 |
| varc-QUICKREF.md | 快速参考卡 |

### 示例文件 (2个)

| 文件 | 说明 |
|-----|------|
| session-20240309-01-example.md | 完整填写的会话示例 |
| chain-parser-refactor.json | 完整填写的会话链示例 |

### 文档文件 (4个)

| 文件 | 说明 |
|-----|------|
| README.md | 项目入口文档 |
| VARC-README.md | 完整框架文档 |
| DIRECTORY-STRUCTURE.md | 目录结构说明 |
| .ai-sessions/README.md | 脚本目录说明 |

---

## 使用流程

```
1. 初始化
   └── varc-init.ps1/sh
       ├── 创建目录结构
       ├── 复制模板文件
       └── 创建初始会话

2. 开发循环
   ├── varc-status.ps1/sh      # 查看状态
   ├── varc-save.ps1/sh        # 定期保存
   └── varc-fork.ps1/sh        # 上下文耗尽时分叉

3. 续接会话
   └── 将 varc-fork 生成的提示词复制到新对话框
```
