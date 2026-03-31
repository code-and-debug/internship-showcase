---
# === 元数据区块 (Machine Readable) ===
session_id: "sess_YYYYMMDD_NN_hash"
parent_session: null  # 父会话ID，null表示根会话
context_engine: "Claude-3.5-Sonnet"
context_usage: 
  current: 0%           # 触发保存时的上下文占用率
  limit: 200000         # 模型上下文上限
  remaining_tokens: 200000
status: "checkpointed"  # checkpointed | completed | failed | migrated
checkpoint_reason: "手动保存/上下文阈值触发/时间间隔触发"  # 为什么在这里保存

# === 完整性校验 (Verifiable) ===
code_hash: "sha256:..."              # 当前代码仓库commit hash
test_status: "PENDING"               # 快照时刻测试状态：PASS/FAIL/PENDING
verification_command: "npm test"
last_verified_output: ""

# === 审计线索 (Auditable) ===
prompt_version: "prompts/v1/system.md@commit"
model_config: 
  temperature: 0.2
  top_p: 0.9
  system_prompt_hash: "sha256:..."
tool_calls_count: 0                  # 本会话工具调用次数

# === 恢复标记 (Recoverable) ===
recovery_priority: "normal"          # critical | high | normal
rollback_target: "git:HEAD"          # 代码回滚点
data_migration_id: null              # 关联的数据迁移脚本
---

# === 会话上下文摘要 (Context Digest) ===

## 1. 不可变约束 (Immutable Constraints)
> **⚠️ 新会话必须继承以下约束，不得违反**

- [ ] **架构约束**: [填写架构约束，如必须保持的架构模式]
- [ ] **性能约束**: [填写性能指标约束]
- [ ] **安全约束**: [填写安全相关的约束]
- [ ] **依赖约束**: [填写依赖相关的限制]

## 2. 当前状态 (Current State)

### 2.1 代码状态
```diff
# 当前工作区关键变更（相对于父会话）
+ src/new-file.ts      (新增：说明)
~ src/modified-file.ts (修改：说明)
- src/deleted-file.ts  (删除：说明)
```

### 2.2 思维状态 (Cognitive State)
- **已完成**: 
  - [ ] 
- **进行中**: 
  - [ ] 
- **待探索**: 
  - [ ] 

### 2.3 阻塞点 (Blocked)
```json
{
  "issue": "",
  "reproduction": "",
  "attempted_solutions": [],
  "next_hypothesis": ""
}
```

## 3. 关键决策日志 (Session ADRs)

| 时间 | 决策 | 理由 | 替代方案 | 决策者 |
|------|------|------|----------|--------|
| | | | | |

## 4. 资源引用 (Resources)

### 4.1 代码片段（新会话必需）
```typescript
// 关键接口定义（用于新会话类型检查）
interface Example {
  // TODO: 填写关键接口
}
```

### 4.2 测试用例（当前失败的）
```typescript
// 这是当前失败的测试，新会话需优先处理
it('should ...', () => {
  // TODO: 填写失败测试
});
```

### 4.3 外部参考
- [文档链接]()
- 父会话完整记录：`../archive/session-...`

---

## 5. 续接指南 (Continuation Protocol)

**对于新会话，按以下顺序恢复上下文：**

### Step 1: 约束注入（必须）
首先向AI陈述不可变约束（上方第1节），要求确认理解。

### Step 2: 状态加载（必须）
提供代码片段（第4.1节）和当前失败测试（第4.2节）。

### Step 3: 认知恢复（建议）
简要说明当前工作状态和阻塞点。

### Step 4: 验证检查点（必须）
要求新会话首先运行验证命令（见元数据`verification_command`），确认基础状态无损。

---

## 6. 排错线索 (Debugging Leads)

**如果后续出现以下症状，检查本会话的这些位置：**

| 症状 | 可能原因 | 检查点 |
|------|---------|--------|
| | | |

---

**保存时间**: YYYY-MM-DD HH:mm TZ  
**保存者**: developer@company.com  
**签名**: `sha256:...`
