# 🏗️ 配置中心（Config Center）

> 轻量级配置管理方案，基于文件系统 + Git 版本控制  
> 无需后端服务，渐进式演进，适合中小团队

---

## 📋 目录

- [架构演进](#架构演进)
- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [CLI 工具](#cli-工具)
- [目录结构](#目录结构)
- [与阶段一的对比](#与阶段一的对比)

---

## 架构演进

```
阶段 0：硬编码（Hard Code）
├── 问题：100个if-else，vendor.js超过2MB
├── 痛点：新增医院改代码，每次发版2天+
└── 代码：demo/1-hardcode.ts

    ↓ 重构

阶段 1：基础配置驱动（Config-Driven）
├── 解决：提取JSON配置文件，动态导入
├── 收益：vendor.js降至500KB，无需改代码
└── 代码：demo/2-basic-config.ts + ../config-driven-demo/

    ↓ 演进

阶段 2：配置中心（Config Center）[本模块]
├── 解决：多环境管理 + 版本控制 + 配置晋升
├── 收益：配置变更无需发版，5分钟生效
└── 代码：demo/3-config-center.ts + core/
```

---

## 核心特性

| 特性 | 说明 | 收益 |
|------|------|------|
| **多环境管理** | dev / test / prod 独立配置 | 环境隔离，避免相互影响 |
| **配置分层** | 基础配置 + 环境覆盖层 | 减少重复，易于维护 |
| **版本控制** | Git 管理 + 语义化版本 | 变更可追溯，可回滚 |
| **配置晋升** | dev → test → prod 流程化 | 规范化发布流程 |
| **CLI 工具** | promote / diff / validate | 自动化操作，减少人工错误 |
| **轻量级** | 纯文件系统，无需后端 | 零部署成本，即开即用 |

---

## 快速开始

### 1. 安装依赖

```bash
cd examples/config-center
npm install typescript ts-node @types/node --save-dev
```

### 2. 运行演示

```bash
# 阶段 0：硬编码（问题展示）
npx ts-node demo/1-hardcode.ts

# 阶段 1：基础配置驱动
npx ts-node demo/2-basic-config.ts

# 阶段 2：配置中心
npx ts-node demo/3-config-center.ts
```

### 3. 使用 CLI 工具

```bash
# 配置校验
npx ts-node cli/validate.ts 1001033

# 配置晋升：dev → test
npx ts-node cli/promote.ts 1001033 dev test v1.2.0-test

# 版本对比
npx ts-node cli/diff.ts 1001033 v1.0.0 v1.2.0
```

---

## CLI 工具

### `validate.ts` - 配置校验

校验配置完整性和环境覆盖情况。

```bash
npx ts-node cli/validate.ts <sysCode>

示例：
npx ts-node cli/validate.ts 1001033

输出：
🔍 校验配置: 1001033

✅ 配置校验通过

环境配置状态:
   DEV: ✅ v1.2.0-dev
   TEST: ✅ v1.2.0-test
   PROD: ✅ v1.2.0
```

### `promote.ts` - 配置晋升

将配置从 A 环境晋升到 B 环境，自动备份当前配置。

```bash
npx ts-node cli/promote.ts <sysCode> <fromEnv> <toEnv> <version>

示例：
npx ts-node cli/promote.ts 1001033 dev test v1.2.0-test

输出：
📋 源环境配置 (dev):
   租户: 台州市第一人民医院
   版本: v1.2.0-dev

🚀 执行晋升: dev → test
📦 已备份当前配置: config/versions/1001033/v1.1.0.json
✅ 配置晋升完成: 1001033 dev → test (v1.2.0-test)
```

### `diff.ts` - 版本对比

对比两个版本的配置差异。

```bash
npx ts-node cli/diff.ts <sysCode> <versionA> <versionB>

示例：
npx ts-node cli/diff.ts 1001033 v1.0.0 v1.2.0

输出：
📊 配置对比: 1001033
v1.0.0 ←→ v1.2.0
共 3 处变更

1. ➕ [ADDED] sConfig.isDrugDelivery
   + "1"

2. ✏️ [MODIFIED] sConfig.apiBaseUrl
   - "https://dev-api.eheren.com"
   + "https://api.eheren.com"

3. ➖ [REMOVED] sConfig.debugMode
   - true
```

---

## 目录结构

```
config-center/
├── core/                       # 核心类库
│   └── ConfigCenter.ts         # 配置中心主类
├── cli/                        # 命令行工具
│   ├── promote.ts              # 配置晋升
│   ├── diff.ts                 # 版本对比
│   └── validate.ts             # 配置校验
├── config/                     # 配置数据
│   ├── tenants/                # 租户基础配置
│   │   ├── 1001033.json        # 台州市第一人民医院
│   │   └── 1001035.json        # 玉环市第二人民医院
│   ├── environments/           # 环境差异化配置
│   │   ├── dev/                # 开发环境
│   │   ├── test/               # 测试环境
│   │   └── prod/               # 生产环境
│   └── versions/               # 版本历史（自动备份）
├── demo/                       # 演进演示
│   ├── 1-hardcode.ts           # 阶段0：硬编码
│   ├── 2-basic-config.ts       # 阶段1：基础配置
│   └── 3-config-center.ts      # 阶段2：配置中心
└── README.md                   # 本文档
```

---

## 配置分层模型

```
最终配置 = 基础配置 + 环境覆盖层

示例：1001033 (台州市第一人民医院)

基础配置 (config/tenants/1001033.json)
├── sysCode: "1001033"
├── name: "台州市第一人民医院"
├── wxAppid: "wx_demo_xxxxxxxx001"
└── sConfig:
    ├── homeNavTitleLogo: "https://cdn.eheren.com/logo/1001033.png"
    └── isDrugDelivery: "1"

    + 合并

环境覆盖 (config/environments/dev/1001033.json)
└── overrides:
    ├── wxAppid: "wx_demo_xxxxxxxx001-dev"  ← 覆盖
    └── sConfig:
        ├── apiBaseUrl: "https://dev-api.eheren.com"  ← 新增
        └── debugMode: true  ← 新增

    =

最终配置 (dev 环境)
├── sysCode: "1001033"  ← 继承基础
├── name: "台州市第一人民医院"  ← 继承基础
├── wxAppid: "wx_demo_xxxxxxxx001-dev"  ← 覆盖
└── sConfig:
    ├── homeNavTitleLogo: "https://cdn.eheren.com/logo/1001033.png"  ← 继承
    ├── isDrugDelivery: "1"  ← 继承
    ├── apiBaseUrl: "https://dev-api.eheren.com"  ← 新增
    └── debugMode: true  ← 新增
```

---

## 与阶段一的对比

| 维度 | 阶段一：基础配置驱动 | 阶段二：配置中心 |
|------|---------------------|-----------------|
| **适用场景** | 单环境、简单配置 | 多环境、复杂配置 |
| **环境管理** | 手动切换 | 自动合并覆盖层 |
| **版本控制** | Git 文件历史 | 语义化版本 + 变更日志 |
| **配置晋升** | 手动复制粘贴 | CLI 一键晋升 |
| **配置校验** | 无 | 自动化校验 |
| **版本对比** | 手动 diff | CLI 自动对比 |
| **复杂度** | 低 | 中等 |
| **学习成本** | 低 | 中等 |

### 选择建议

- **小团队/单环境**：使用阶段一（基础配置驱动）
- **多环境需求**：引入阶段二（配置中心）
- **大型团队**：自建配置服务，参考本架构设计

---

## 核心收益总结

```
配置变更流程对比：

传统方式（硬编码）：
改代码 → 提交 → 代码评审 → 测试 → 发版 → 审核 → 上架
  └──────────────────────── 2天+ ─────────────────────────┘

阶段一（基础配置）：
改JSON → 提交 → 构建 → 发版
  └────────────── 2小时 ──────────────┘

阶段二（配置中心）：
改JSON → 提交 → 自动生效
  └─────────── 5分钟 ───────────┘
```

**效率提升：2天+ → 5分钟，提升 600倍**

---

## 面试讲解要点

```
"我在实习中遇到了配置管理的问题：

阶段0：100个if-else硬编码，vendor.js超过2MB，打包失败。

阶段1：提取JSON配置文件，动态导入，体积降到500KB。
  → 但还只有一个环境，修改配置仍需发版。

阶段2：设计了轻量级配置中心，支持：
  - 多环境管理（dev/test/prod）
  - 配置分层（基础+覆盖）
  - 版本控制（Git+语义化版本）
  - CLI工具（promote/diff/validate）

核心收益：配置变更从'2天发版'降到'5分钟生效'，提升600倍。

虽然是设计方案，但完整考虑了可落地性，
没有引入Redis/MySQL等不必要的复杂度，适合中小团队渐进采用。"
```

---

## License

MIT
