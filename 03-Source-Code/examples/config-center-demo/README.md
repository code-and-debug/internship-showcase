# Config Center - 配置中心

> 用于面试展示的 proConfig.ts 重构方案

## 项目概述

本项目演示了如何将一个包含 **50+ 医院配置、约 1280 行 TypeScript 硬编码** 的 `proConfig.ts` 重构为现代化的 Config Center 架构。

## 重构收益

| 维度 | 重构前 | 重构后 |
|------|--------|--------|
| **配置变更时间** | 2天+（发版流程） | 5分钟（Git 提交自动生效） |
| **环境切换** | 改代码注释 | 切换环境变量 |
| **敏感信息** | 硬编码在源码 | 分离到环境配置，CI 注入 |
| **新增医院** | 修改 proConfig.ts | 新增 JSON 文件 |
| **配置错误发现** | 运行时崩溃 | validate CLI 提前拦截 |
| **配置回滚** | 发版回退 | 版本快照一键恢复 |

## 目录结构

```
config-center-demo/
├── config/                          # 配置存储
│   ├── tenants/                     # 医院基础配置（按医院分文件）
│   │   ├── 1001033.json            # 台州市第一人民医院
│   │   ├── 1001035.json            # 江苏省中医院
│   │   ├── 1001046.json            # 绍兴市人民医院
│   │   └── 1001093.json            # 浙江省肿瘤医院
│   ├── environments/                # 环境差异化配置
│   │   ├── dev/                    # 开发环境覆盖
│   │   ├── test/                   # 测试环境覆盖
│   │   └── prod/                   # 生产环境覆盖
│   ├── versions/                    # 版本历史（自动备份）
│   └── schemas/                     # 配置校验 Schema
│       ├── tenant.schema.json
│       └── environment.schema.json
├── src/
│   └── config/
│       ├── ConfigCenter.ts         # 配置中心核心类
│       └── index.ts                # 入口文件（兼容层）
├── scripts/config-cli/              # CLI 工具集
│   ├── migrate.ts                  # 数据迁移工具
│   ├── validate.ts                 # 配置校验工具
│   ├── promote.ts                  # 配置晋升工具
│   └── diff.ts                     # 版本对比工具
├── examples/                        # 使用示例
│   ├── usage.ts                    # API 使用示例
│   └── comparison.md               # 重构前后对比
├── proConfig.adapter.ts            # 向后兼容适配器
└── README.md                       # 本文件
```

## 核心设计

### 1. 配置分层模型

```
最终配置 = 基础配置(Tenants) + 环境覆盖层(Environment)
```

- **Tenants**: 存储医院稳定的业务配置（名称、AppID、功能开关）
- **Environments**: 仅存储环境差异（API 地址、调试标志、密钥）

### 2. 敏感信息安全

```json
// 生产环境配置示例
{
  "_meta": { "env": "prod", "version": "1.0.0" },
  "secrets": {
    "apiKey": "${PROD_API_KEY}",
    "harmony": {
      "keyPassword": "${HARMONY_KEY_PASSWORD}"
    }
  }
}
```

敏感信息使用占位符，通过 CI/CD 环境变量注入，代码库中不存储真实密钥。

### 3. 向后兼容

```typescript
// 原有代码完全兼容
import { miniProgramConfig, manifestFileDataObj } from './proConfig.adapter';

// 旧的用法保持不变
const config = miniProgramConfig['1001033'];
```

通过 ES6 Proxy 实现动态加载，业务代码无需修改即可使用新架构。

## CLI 工具使用

### 1. 校验配置

```bash
# 校验所有医院配置
npx ts-node scripts/config-cli/validate.ts --all

# 校验指定医院
npx ts-node scripts/config-cli/validate.ts 1001033

# 校验指定环境
npx ts-node scripts/config-cli/validate.ts --env prod
```

### 2. 配置晋升

```bash
# 开发环境 -> 测试环境
npx ts-node scripts/config-cli/promote.ts 1001033 dev test v1.2.0-test

# 测试环境 -> 生产环境
npx ts-node scripts/config-cli/promote.ts 1001033 test prod v1.2.0
```

### 3. 配置对比

```bash
# 对比不同环境配置差异
npx ts-node scripts/config-cli/diff.ts 1001033 dev prod
```

### 4. 数据迁移

```bash
# 从 proConfig.ts 迁移配置
npx ts-node scripts/config-cli/migrate.ts --source ../proConfig.ts --output ./config
```

## API 使用示例

### 新的 ConfigCenter API（推荐）

```typescript
import { configCenter } from './src/config';

// 获取开发环境配置
const devConfig = configCenter.getConfig('1001033', 'dev');
console.log(devConfig.name);     // 台州市第一人民医院
console.log(devConfig._env);     // dev
console.log(devConfig._version); // 1.0.0-dev

// 获取生产环境配置
const prodConfig = configCenter.getConfig('1001033', 'prod');

// 校验配置
const result = configCenter.validate('1001033');
console.log(result.valid);   // true/false
console.log(result.errors);  // 错误列表

// 列出所有医院
const hospitals = configCenter.getAllTenantIds();
```

### 向后兼容 API（现有代码）

```typescript
import { miniProgramConfig } from './src/config';

// 原有代码无需修改
const config = miniProgramConfig['1001033'];
console.log(config.name);
```

## 关键设计决策

1. **JSON 而非 TypeScript**: 配置与代码分离，非开发人员可参与维护
2. **文件系统而非数据库**: 零部署成本，利用 Git 原生版本控制
3. **分层合并而非复制**: 避免 50+ 医院 × 3 环境 = 150 个重复文件
4. **兼容层保持平滑过渡**: 不破坏现有业务代码，降低重构风险

## 面试要点

### 问题 1: 为什么要重构 proConfig.ts？

**答**: 
- **规模问题**: 1280 行硬编码，50+ 医院配置混在一起
- **安全问题**: AppID、密钥等敏感信息直接写在代码中
- **环境问题**: 通过注释切换环境，容易出错且无法并行测试
- **变更成本高**: 任何配置变更都需要发版审核，2天+

### 问题 2: Config Center 如何解决这些问题？

**答**:
- **物理隔离**: 医院配置分文件存储，环境配置独立管理
- **敏感信息分离**: 生产密钥通过 CI/CD 注入，代码库只有占位符
- **环境变量驱动**: 切换 `NODE_ENV` 即可切换环境
- **CLI 工具**: 校验、晋升、对比等操作命令行完成

### 问题 3: 如何保证向后兼容？

**答**:
- 使用 ES6 Proxy 拦截属性访问
- `miniProgramConfig['1001033']` 调用时动态加载并合并配置
- 提供 `proConfig.adapter.ts` 作为直接替代品
- 业务代码导入路径只需修改一次

### 问题 4: 配置分层合并的策略是什么？

**答**:
- **深度合并**: 使用 `deepMerge` 递归合并嵌套对象
- **环境优先**: 环境配置的字段覆盖基础配置
- **不可变**: 合并后的配置是新的对象，不修改原配置

### 问题 5: 如何确保配置的正确性？

**答**:
- **JSON Schema 校验**: 定义配置结构，确保字段完整
- **CLI 校验工具**: 提交前自动检查配置合法性
- **运行时检查**: ConfigCenter 加载时验证必填字段
- **版本备份**: 每次晋升自动备份，支持快速回滚

## 运行演示

```bash
# 进入演示目录
cd config-center-demo

# 安装依赖（需要 TypeScript）
npm install typescript @types/node

# 运行使用示例
npx ts-node examples/usage.ts

# 校验配置
npx ts-node scripts/config-cli/validate.ts --all

# 对比配置差异
npx ts-node scripts/config-cli/diff.ts 1001033 dev prod

# 配置晋升演示
npx ts-node scripts/config-cli/promote.ts 1001033 dev test v1.0.1-test
```

## 技术栈

- **TypeScript**: 类型安全
- **Node.js**: 运行时环境
- **JSON Schema**: 配置校验
- **ES6 Proxy**: 向后兼容实现

---

> 此项目仅供面试展示，演示了如何将硬编码配置重构为现代化的 Config Center 架构。
