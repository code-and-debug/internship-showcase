# V.A.R.C. 快速参考卡

## 🚀 常用命令速查

```powershell
# 初始化
.\varc-init.ps1 -ProjectName "my-project"

# 开发循环
.\varc-status.ps1                    # 查看状态
.\varc-save.ps1 -Reason "描述"       # 保存会话
.\varc-fork.ps1 -Parent [ID] -Reason "上下文耗尽"  # 分叉新会话
```

## 📝 Session Snapshot 关键字段

| 字段 | 说明 | 示例 |
|-----|------|------|
| `session_id` | 唯一标识 | `sess_20240309_01_a7b3d9` |
| `parent_session` | 父会话ID | `null` 或 `sess_...` |
| `status` | 会话状态 | `active/checkpointed/completed/failed` |
| `context_usage` | 上下文使用率 | `78%` |
| `code_hash` | 代码版本 | `git:abc1234` |
| `test_status` | 测试状态 | `PASS/FAIL/PENDING` |

## 🔄 会话状态流转

```
[初始化] → active → checkpointed → completed → archive
              ↓
           failed → recovery → active
              ↓
           migrated (分叉)
```

## ⚠️ 紧急恢复检查清单

当AI出现问题时:

1. ☐ 检查是否重复废弃方案 → 查看 Blocked 章节
2. ☐ 检查约束是否被违反 → 查看 Immutable Constraints
3. ☐ 检查文件是否存在 → 运行 `ls src/...`
4. ☐ 重新注入约束 → 粘贴恢复提示词
5. ☐ 要求验证环境 → 运行验证命令

## 📂 文件命名规范

- 会话: `session-{YYYYMMDD}-{NN}-{hash}.md`
- 会话链: `chain-{feature-id}.json`
- 归档: `archive/{YYYY-MM}/session-...`

## 🔗 与 V.A.R. 框架对应

| V.A.R.C. | V.A.R. 维度 | 关键文件 |
|---------|------------|---------|
| Verifiable | 完整性校验 | `verification_command` |
| Auditable | 审计线索 | `session_id`, `decision_log` |
| Recoverable | 恢复标记 | `rollback_target`, `recovery/` |
| Conversational | 续接指南 | `continuation_protocol` |

## 💡 最佳实践

1. **每30分钟保存一次** - 防止意外丢失
2. **上下文达70%时分叉** - 避免强制压缩
3. **明确废弃的方案要记录** - 防止重复
4. **新会话先验证** - 确保状态无损
5. **约束必须继承** - 防止偏离轨道

---

**保存此文件为书签，随时查阅!**
