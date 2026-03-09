# V.A.R.框架详细实施指南

## 第一部分：可验证 (Verifiable)

### 1.1 契约先行开发 (Contract-First Development)

#### 步骤1：建立Human-Only类型目录

```
types/
├── human-only/              # 🚫 AI只读，禁止修改
│   ├── core-contracts.ts    # 核心业务契约
│   ├── api-interfaces.ts    # API接口定义
│   └── domain-types.ts      # 领域类型
│
└── ai-generated/            # ✅ AI可修改
    ├── dto.ts
    ├── mappers.ts
    └── helpers.ts
```

#### 步骤2：编写核心契约

```typescript
// types/human-only/core-contracts.ts
// ⚠️ HUMAN ONLY - AI DO NOT MODIFY

export type VerifiedPatientId = string & { readonly __brand: 'VerifiedPatientId' };

export function createVerifiedPatientId(id: string): VerifiedPatientId {
  if (!/^P\d{8}$/.test(id)) {
    throw new Error(`Invalid patient ID format: ${id}`);
  }
  return id as VerifiedPatientId;
}

// 状态机定义
export const HospitalStatus = {
  REGISTERED: 1,
  ADMITTED: 2,
  IN_TREATMENT: 3,
  DISCHARGED: 4,
} as const;

export type HospitalStatus = typeof HospitalStatus[keyof typeof HospitalStatus];

// 状态流转图
export const VALID_TRANSITIONS: Record<HospitalStatus, HospitalStatus[]> = {
  [HospitalStatus.REGISTERED]: [HospitalStatus.ADMITTED],
  [HospitalStatus.ADMITTED]: [HospitalStatus.IN_TREATMENT],
  [HospitalStatus.IN_TREATMENT]: [HospitalStatus.DISCHARGED],
  [HospitalStatus.DISCHARGED]: [],
};

export interface IHospitalizationWorkflow {
  patientId: VerifiedPatientId;
  currentStatus: HospitalStatus;
  statusHistory: Array<{
    status: HospitalStatus;
    timestamp: string;
    operatorId: string;
  }>;
}
```

### 1.2 双轨验证 (Dual-Track Verification)

```typescript
// 双轨验证工具
export interface ShadowTestConfig<TInput, TOutput> {
  name: string;
  humanImplementation: (input: TInput) => TOutput;
  aiImplementation: (input: TInput) => TOutput;
  inputGenerator: fc.Arbitrary<TInput>;
  outputComparator: (a: TOutput, b: TOutput) => boolean;
}

export function createShadowTest<TInput, TOutput>(
  config: ShadowTestConfig<TInput, TOutput>
) {
  return describe(`Shadow Test: ${config.name}`, () => {
    it('AI版本应与人工版本输出一致', () => {
      fc.assert(
        fc.property(config.inputGenerator, (input) => {
          const humanResult = config.humanImplementation(input);
          const aiResult = config.aiImplementation(input);
          return config.outputComparator(humanResult, aiResult);
        }),
        { numRuns: 1000 }
      );
    });
  });
}
```

### 1.3 ESLint配置

```javascript
// configs/eslint-ai-rules.js
module.exports = {
  rules: {
    // Verifiable
    '@typescript-eslint/no-explicit-any': 'error',
    'complexity': ['error', 10],
    'no-magic-numbers': ['error', { ignore: [0, 1, -1] }],
    
    // Auditable
    'require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
      },
    }],
    
    // Recoverable
    '@typescript-eslint/no-throw-literal': 'error',
  },
};
```

## 第二部分：可审计 (Auditable)

### 2.1 AI代码头部模板

```typescript
/**
 * @file {{filename}}
 * @generator AI ({{model}})
 * @prompt-hash {{promptHash}}
 * @confidence {{confidence}} # high | medium | low
 * @reviewer {{reviewer}}
 * @generated-at {{timestamp}}
 * @business-rule {{businessRuleRef}}
 */
```

### 2.2 决策日志 (ADRs)

```markdown
# ADR-XXX: [标题]

- **日期**: YYYY-MM-DD
- **状态**: proposed | accepted | deprecated
- **决策者**: @yourname

## 决策
[明确陈述做了什么决定]

## 备选方案
| 方案 | 优点 | 缺点 | 结果 |
|------|------|------|------|
| A | ... | ... | rejected |
| B | ... | ... | accepted |

## 影响
- **技术影响**: ...
- **AI治理影响**: ...
```

## 第三部分：可恢复 (Recoverable)

### 3.1 特性开关

```typescript
// configs/feature-flags.ts
export interface FeatureFlags {
  useAIPatientQuestionnaire: boolean;
  useAICalculateScore: boolean;
  fallbackToLegacy: boolean;
}

export function selectImplementation<T>(
  flag: keyof FeatureFlags,
  aiImpl: T,
  legacyImpl: T
): T {
  const flags = getFeatureFlags();
  if (flags.fallbackToLegacy) return legacyImpl;
  return flags[flag] ? aiImpl : legacyImpl;
}
```

### 3.2 安全迁移模板

```typescript
export async function executeSafeMigration<T>(
  context: MigrationContext,
  migrationFn: () => Promise<T>
): Promise<MigrationResult> {
  // 1. 创建物理备份
  await db.execute(`CREATE TABLE ${backupTable} AS SELECT * FROM ${targetTable}`);
  
  // 2. 记录审计日志
  await auditLog.record({ type: 'MIGRATION_START', ... });
  
  // 3. 执行迁移
  const result = await db.transaction(async (trx) => {
    return await migrationFn();
  });
  
  return { success: true, backupTable, rollbackSql: `...` };
}
```

## 13天实施计划

### Week 1: Verifiable (Day 1-7)

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1 | 创建types/human-only目录 | 目录结构 |
| Day 2 | 编写核心契约接口 | core-contracts.ts |
| Day 3 | 配置ESLint规则 | eslint-ai-rules.js |
| Day 4-5 | 实现双轨验证框架 | shadow-test.ts |
| Day 6-7 | 编写Property测试 | *.spec.ts |

### Week 2: Auditable (Day 8-14)

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 8 | 创建AI代码头部模板 | ai-code-header.ts |
| Day 9 | 建立PromptDB | prompt-registry.yaml |
| Day 10 | 编写Git钩子 | pre-commit |
| Day 11-12 | 写3个ADR | DECISIONS.md |
| Day 13-14 | 集成到CI | GitHub Actions |

### Week 3: Recoverable (Day 15-21)

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 15-16 | 实现特性开关 | feature-flags.ts |
| Day 17-18 | 数据迁移方案 | migration-backup.ts |
| Day 19-20 | Dockerfile固化 | Dockerfile |
| Day 21 | 演练回滚流程 | 演练报告 |
