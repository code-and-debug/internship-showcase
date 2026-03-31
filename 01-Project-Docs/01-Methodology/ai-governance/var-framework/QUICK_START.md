# V.A.R.框架 - 5分钟快速开始

## 目标

5分钟内将V.A.R.框架集成到你的项目中。

## 步骤1：安装依赖 (1分钟)

```bash
npm install --save-dev fast-check @fast-check/vitest
```

## 步骤2：创建类型契约 (2分钟)

```typescript
// types/human-only/README.md
# ⚠️ HUMAN ONLY - AI DO NOT MODIFY

本目录下的所有文件为人工编写，AI助手只能读取，禁止修改。
```

```typescript
// types/human-only/core-contracts.ts
/**
 * 核心业务契约
 * @maintainer @yourname
 */

export type VerifiedId = string & { readonly __brand: 'VerifiedId' };

export function verifyId(id: string): VerifiedId {
  if (!/^\d{8}$/.test(id)) throw new Error('Invalid ID');
  return id as VerifiedId;
}
```

## 步骤3：启用Git钩子 (1分钟)

```bash
# .git/hooks/pre-commit
#!/bin/sh
echo "[V.A.R.] Running pre-commit checks..."
npm run typecheck
npm run lint
echo "[V.A.R.] Checks passed!"
```

```bash
chmod +x .git/hooks/pre-commit
```

## 步骤4：创建第一个ADR (1分钟)

```bash
mkdir -p docs/decisions
cat > docs/decisions/ADR-001-init.md << 'EOF'
# ADR-001: 采用V.A.R.框架

- **日期**: $(date +%Y-%m-%d)
- **状态**: accepted
- **决策者**: @yourname

## 决策

采用V.A.R.（可验证/可审计/可恢复）框架治理AI代码。
EOF
```

## 验证

运行以下命令验证集成成功：

```bash
# 类型检查
npm run typecheck

# 检查ADR
cat docs/decisions/ADR-001-init.md
```

## 下一步

- [详细实施指南](./IMPLEMENTATION_GUIDE.md)
- [验证清单](./CHECKLIST.md)
