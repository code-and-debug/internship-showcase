# V.A.R.C. Framework v2.0 - 全面优化版

> **V**erifiable · **A**uditable · **R**ecoverable · **C**onversational  
> **自动化优先 · 零摩擦 · 深度集成**

v2.0 针对 v1.0 的手动负担问题进行全面重构，核心理念：**自动化一切能自动化的**。

---

## 🎯 v2.0 核心改进

| 问题域 | v1.0 现状 | v2.0 解决方案 |
|-------|----------|--------------|
| **手动保存** | 每30分钟手动运行脚本 | 自动触发（Git提交/定时/上下文阈值） |
| **模板填写** | 需手动填写大量字段 | 智能填充 + 必填项最小化 |
| **上下文恢复** | 复制粘贴到新对话框 | 一键生成分叉链接 |
| **IDE集成** | 无 | VS Code 扩展配置 + 状态栏 |
| **Git集成** | 简单commit | 分支策略关联 + PR检查 |
| **协作** | 单人设计 | 多用户 + 权限 + 冲突检测 |
| **可观测性** | 无 | 内置统计 + 健康检查 |

---

## 📁 v2.0 目录结构

```
varc-framework-v2/
├── README-v2.md                    # 本文档
├── QUICKSTART.md                   # 5分钟快速开始
├── ARCHITECTURE-v2.md              # 架构设计
│
├── scripts/                        # 自动化脚本
│   ├── varc-auto.ps1              # ⭐ 全自动守护进程
│   ├── varc-init-v2.ps1           # 初始化 v2.0
│   ├── varc-quick-save.ps1        # 一键保存（无参数）
│   ├── varc-fork-v2.ps1           # 增强分叉
│   ├── varc-doctor.ps1            # 健康检查
│   └── varc-report.ps1            # 生成统计报告
│
├── templates/                      # 精简模板
│   ├── session-v2-minimal.md      # 极简模板（必填项最少）
│   └── session-v2-smart.md        # 智能模板
│
├── integrations/                   # 集成方案
│   ├── vscode/                    # VS Code 扩展配置
│   │   ├── settings.json
│   │   └── tasks.json
│   ├── git/                       # Git 钩子
│   │   └── hooks/
│   └── ci/                        # CI/CD 集成
│       └── github-actions.yml
│
└── examples/                       # 使用示例
    └── minimal-usage-example.md
```

---

## ⚡ 5分钟快速体验

### 1. 安装（一键）

```powershell
# 复制到你的项目根目录
xcopy /E /I /Y docs\varc-framework-v2 .varc

# 初始化（全自动）
cd .varc
.\scripts\varc-init-v2.ps1 -AutoConfigure
```

### 2. 使用（全自动）

```powershell
# 一键保存（无需参数）
.\scripts\varc-quick-save.ps1

# 或者启动守护模式
.\scripts\varc-auto.ps1 -Mode daemon
```

### 3. 分叉（一键生成链接）

```powershell
# 生成分叉提示词（自动复制到剪贴板）
.\scripts\varc-fork-v2.ps1 -AutoCopy
```

---

## 🔄 v1.0 → v2.0 迁移指南

| v1.0 命令 | v2.0 命令 | 改进 |
|----------|----------|------|
| `varc-save.ps1 -Reason "..." -Status ...` | `varc-quick-save.ps1` | 智能推断原因和状态 |
| `varc-fork.ps1 -Parent ... -Reason ...` | `varc-fork-v2.ps1 -AutoCopy` | 自动推断父会话，一键复制 |
| `varc-status.ps1` | `varc-doctor.ps1` | 增加健康检查和修复建议 |
| 手动填写模板 | `session-v2-minimal.md` | 必填项从 15+ 减少到 3 项 |

---

## 🔧 v2.0 核心功能

### 1. 全自动守护模式 (varc-auto.ps1)

```powershell
.\varc-auto.ps1 -Mode daemon -Interval 10min

# 功能：
# - 监控 Git 状态，提交时自动保存
# - 定时保存（可配置间隔）
# - 自动运行验证命令
# - 上下文阈值告警
```

### 2. 智能一键保存 (varc-quick-save.ps1)

```powershell
# 无需参数，智能推断：
.\varc-quick-save.ps1

# 推断逻辑：
# Reason = Git 最近 commit message
# Status = 验证命令结果 (PASS/FAIL)
# Priority = 上下文使用率映射
```

### 3. 一键分叉 (varc-fork-v2.ps1)

```powershell
# 极简使用
.\varc-fork-v2.ps1 -AutoCopy

# 自动执行：
# 1. 找到当前会话
# 2. 生成新会话 ID
# 3. 提取约束、代码片段
# 4. 生成分叉提示词
# 5. 复制到剪贴板
```

### 4. 健康检查 (varc-doctor.ps1)

```powershell
# 检查并自动修复
.\varc-doctor.ps1 -Fix
```

---

**V.A.R.C. Framework v2.0**  
让对话状态管理从负担变成隐形的基础设施。
