# V.A.R.C. 框架 - 对话原生工程治理

> **V**erifiable · **A**uditable · **R**ecoverable · **C**onversational

**版本**: 1.0.0  
**适用场景**: 长上下文AI开发、复杂Agent调试、多轮架构设计  
**核心原则**: *"对话是临时代码分支，必须像管理代码一样管理对话状态"*

---

## 快速开始

### 1. 初始化项目

```powershell
# 进入项目目录，运行初始化脚本
.\varc-init.ps1 -ProjectName "my-awesome-project"
```

这将创建:
- `.ai-sessions/` 目录结构
- `.varc-config.yml` 配置文件
- 初始会话文件

### 2. 日常开发循环

```powershell
# 查看当前状态
.\varc-status.ps1

# 开发过程中定期保存会话
.\varc-save.ps1 -Reason "完成核心功能" -Status checkpointed

# 上下文即将耗尽时，分叉新会话
.\varc-fork.ps1 -Parent "sess_20240309_01_abc123" -Reason "上下文达75%"
```

### 3. 续接会话

当上下文耗尽需要开新对话框时:

1. 运行 `varc-fork.ps1` 生成分叉提示词
2. 将生成的提示词复制到新对话框
3. 新AI会先验证环境，然后继续工作

---

## 目录结构

```text
project-root/
├── .ai-sessions/                    # 对话状态仓库
│   ├── active/                      # 当前活跃会话
│   │   ├── session-{timestamp}-{id}.md
│   │   └── current.lnk              # 指向最新会话的快捷方式
│   ├── archive/                     # 已完成/废弃会话
│   │   └── 2024-03/
│   ├── chains/                      # 会话链（跨对话追溯）
│   │   └── chain-{feature-id}.json
│   ├── recovery/                    # 灾难恢复模板
│   ├── templates/                   # 模板文件
│   │   ├── session-snapshot-template.md
│   │   ├── session-chain-template.json
│   │   └── emergency-recovery-template.md
│   ├── varc-init.ps1               # 初始化脚本
│   ├── varc-save.ps1               # 保存会话脚本
│   ├── varc-fork.ps1               # 分叉会话脚本
│   └── varc-status.ps1             # 状态查看脚本
├── src/                             # 业务代码
└── .varc-config.yml                 # V.A.R.C. 配置文件
```

---

## 核心概念

### Session Snapshot (会话快照)

每个会话对应一个 Markdown 文件，包含:
- **元数据**: 会话ID、父会话、上下文使用率
- **不可变约束**: 新会话必须继承的约束条件
- **当前状态**: 代码变更、思维状态、阻塞点
- **决策日志**: 本次会话的关键决策记录
- **资源引用**: 代码片段、失败测试、外部参考

### Session Chain (会话链)

一个功能可能跨多个会话完成，会话链用于追踪完整演进:
```json
{
  "chain_id": "chain-parser-refactor",
  "current_tip": "sess_20240309_02_xyz",
  "sessions": [...]
}
```

### 约束继承

每个新会话必须首先确认继承的约束:
- 架构约束 (如必须保持React Server Components)
- 性能约束 (如首屏加载 < 1.5s)
- 安全约束 (如输入必须经过DOMPurify)
- 依赖约束 (如禁止>100KB新依赖)

---

## 使用检查清单

### 开启新功能开发前
- [ ] 运行 `varc-init.ps1` 初始化
- [ ] 编辑首会话的 "Immutable Constraints"
- [ ] 配置 `.varc-config.yml` 的验证命令

### 每次保存会话时
- [ ] 检查上下文使用率是否>70%
- [ ] 确认 test_status 是否为 PASS
- [ ] 记录当前 Blocked 点
- [ ] 更新 Chain 索引的 current_tip

### 新开对话续接前
- [ ] 运行 `varc-fork.ps1` 生成分叉提示词
- [ ] 向新AI陈述不可变约束
- [ ] 提供代码片段和失败测试
- [ ] 要求AI先运行验证命令

### 出错排查时
- [ ] 检查 Session Snapshot 的 "Debugging Leads"
- [ ] 对比父会话代码差异
- [ ] 查看 Chain 历史是否重复已废弃方案

---

## 脚本参考

### varc-init.ps1

初始化新项目:
```powershell
.\varc-init.ps1 -ProjectName "my-project" [-Template typescript-react] [-SkipGit]
```

### varc-save.ps1

保存当前会话:
```powershell
.\varc-save.ps1 -Reason "上下文达70%" [-Status checkpointed|completed|failed] [-Priority critical|high|normal]
```

### varc-fork.ps1

分叉新会话(上下文耗尽时使用):
```powershell
.\varc-fork.ps1 -Parent "sess_20240309_01_abc123" -Reason "上下文耗尽" [-ChainId parser-refactor]
```

### varc-status.ps1

查看当前状态:
```powershell
.\varc-status.ps1
```

---

## 配置文件 (.varc-config.yml)

```yaml
version: "1.0.0"

checkpoint:
  auto_save:
    enabled: true
    context_threshold: 75%
    time_interval: 30min

verification:
  required_before_save:
    - command: "npm test"
      fail_action: "block"

audit:
  git_integration:
    auto_commit: true
    commit_template: "[VARC] {session_id} - {summary}"

recovery:
  continuity:
    context_inheritance: "strict"
    max_chain_depth: 10
```

---

## 紧急恢复

当AI出现"失忆"或偏离轨道时:

1. 查看 `.ai-sessions/recovery/emergency-restore.md`
2. 运行 `varc-fork.ps1` 生成恢复提示词
3. 新对话中粘贴恢复提示词
4. 要求AI验证环境后再继续

---

## 与标准V.A.R.框架的映射

| V.A.R.C.组件 | 对应V.A.R.维度 | 增强点 |
|-------------|---------------|--------|
| Session Snapshot元数据 | Auditable | 增加上下文占用率、模型配置 |
| Verification Command | Verifiable | 强制保存前可运行验证 |
| Session Chain | Auditable | 跨会话的决策链追溯 |
| Recovery Protocol | Recoverable | 对话级回滚(不仅是代码) |
| Constraint Inheritance | Verifiable | 防止约束在会话切换时丢失 |

---

## 许可证

MIT
