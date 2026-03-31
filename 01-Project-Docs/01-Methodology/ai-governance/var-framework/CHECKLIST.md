# V.A.R.框架验证清单

## 提交前检查

```markdown
### ✅ Verifiable（可验证）
- [ ] 核心接口是否定义在 `types/human-only/`？
- [ ] 运行 `npm run typecheck` 是否零错误零警告？
- [ ] AI生成代码是否有单元测试？
- [ ] 测试是否覆盖了边界条件？
- [ ] 函数圈复杂度是否 ≤ 10？

### ✅ Auditable（可审计）
- [ ] AI生成文件是否包含 `@generator` 标签？
- [ ] 是否有 `@prompt-hash` 和 `@confidence` 标签？
- [ ] 关键架构决策是否记录在 `DECISIONS.md`？
- [ ] Git提交是否包含 `[AI-assisted]` 标签？

### ✅ Recoverable（可恢复）
- [ ] 新功能是否通过 `feature-flags.ts` 控制？
- [ ] 是否能在5分钟内回滚到上一个稳定版本？
- [ ] 数据迁移是否创建了物理备份表？
- [ ] AI功能失败时是否有降级逻辑？
```

## CI/CD集成

```yaml
# .github/workflows/var-check.yml
name: V.A.R. Compliance Check

on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Verifiable - Type Check
        run: npm run typecheck
      
      - name: Verifiable - Test
        run: npm run test:unit -- --run
      
      - name: Auditable - Check AI Headers
        run: ./scripts/check-ai-headers.sh
```

## 不同阶段的检查重点

### MVP阶段（1-3人团队）
- ✅ Verifiable: 类型检查 + 基础测试
- ⚠️ Auditable: AI头部注释
- ⚠️ Recoverable: 手动回滚流程

### 成长阶段（5-10人团队）
- ✅ Verifiable: 契约先行 + Property测试
- ✅ Auditable: PromptDB + ADR
- ✅ Recoverable: 特性开关 + 自动备份
