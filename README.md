# 和仁科技实习技术沉淀

> 杭州和仁科技 | 医疗信息化前端开发实习 | 患者端小程序/H5 开发

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tech](https://img.shields.io/badge/tech-Vue3%20%7C%20uniapp%20%7C%20TypeScript-green.svg)]()
[![Status](https://img.shields.io/badge/status-实习产出-success.svg)]()

---

## 👨‍💻 个人简介

**叶泽宇** | 前端开发工程师（实习）

- 📍 杭州和仁科技股份有限公司（202X.XX - 202X.XX）
- 🏥 医疗信息化领域 | 患者端互联网医院产品
- 🎯 专注：前端工程化、配置化架构、医疗业务组件设计

---

## 🏢 公司背景

**杭州和仁科技股份有限公司**（股票代码：300550）

- 国内领先的医疗信息化整体解决方案提供商
- 产品覆盖智慧医院、互联网医院、医共体等领域
- 服务全国 300+ 医院，包括多家三甲综合医院

**实习期间参与项目**：
- 患者端小程序/H5（uniapp + Vue3）
- 覆盖预约挂号、费用管理、用药管理、智能导诊等核心场景
- 一套代码支持 8 家医院部署（配置化架构）

---

## 📊 项目概览

### 技术栈

| 类别 | 技术 |
|-----|------|
| 框架 | Vue 3 + Composition API |
| 跨平台 | uniapp（小程序 + H5 + App） |
| 状态管理 | Pinia |
| 构建工具 | Vite / Webpack |
| 语言 | TypeScript |
| UI 库 | uView / Ant Design Vue |
| 工具 | ESLint + Prettier + Husky |

### 业务模块（8个核心模块）

| 模块 | 功能 | 技术亮点 |
|-----|------|---------|
| 🏥 **cost-center** | 费用中心（缴费/退款/日结） | 复杂状态机、支付安全 |
| 📋 **drg-settlement** | DRG 结算（病案/特案申请） | 大数据可视化、表单校验 |
| 💊 **medication-manager** | 用药管理（依从性追踪） | 定时提醒、服药记录 |
| 🔍 **smart-pre-diagnosis** | 智能预问诊（症状/导诊） | 树形数据转换、人体图交互 |
| 📝 **questionnaire-refactor** | 表单引擎重构 | 动态渲染、组件化设计 |
| 🤝 **mdt-inquiry** | 多学科会诊 | 复杂流程、权限控制 |
| 🏥 **hospital-butler** | 住院管家 | 状态同步、消息推送 |
| 💉 **treatment-appointment** | 治疗预约 | 日历组件、时段选择 |

---

## 🌟 核心技术沉淀

实习期间产出的 5 篇技术文档，涵盖**数据算法、异步通信、架构设计、安全防护、权限控制**五大领域：

### 📖 文档清单

| 序号 | 文档 | 核心关键词 | 难度 |
|-----|------|-----------|------|
| 01 | [预约挂号排班算法](./02-Core-Assets/tech-articles/01-预约挂号排班算法.md) | 树形转矩阵、reduce、时间复杂度 O(n²) | ⭐⭐⭐ |
| 02 | [人脸识别轮询机制](./02-Core-Assets/tech-articles/02-人脸识别轮询机制.md) | 长轮询、竞态条件、useInterval | ⭐⭐⭐ |
| 03 | [多租户配置化架构](./02-Core-Assets/tech-articles/03-多租户配置化架构.md) | SaaS、功能开关矩阵、代码复用率 90% | ⭐⭐⭐⭐⭐ |
| 04 | [安全加密通信体系](./02-Core-Assets/tech-articles/04-安全加密通信体系.md) | DES/AES 加密、防重放攻击、动态密钥 | ⭐⭐⭐⭐ |
| 05 | [灵活权限控制架构](./02-Core-Assets/tech-articles/05-灵活权限控制架构.md) | 策略模式、RBAC、Promise 异步权限 | ⭐⭐⭐⭐ |

### 📂 快速导航

```
02-Core-Assets/
├── tech-articles/          # 5篇技术沉淀（面试重点）
│   ├── README.md           # 使用指南 + 面试话术
│   └── 01~05-*.md         # 技术文档
└── 项目总结终版.md         # 完整项目总结
```

### 💡 技术亮点提炼

#### 1. 配置化架构（最具价值）

> 一套代码支持 8 家医院，通过配置矩阵控制功能开关

```javascript
// FeatureWrapper - 功能开关组件
<FeatureWrapper featureKey="isShowQueueNumber">
  <QueueNumberCard />
</FeatureWrapper>
```

**核心价值**：
- ✅ 代码复用率 90%+
- ✅ 新增医院只需修改配置，无需改代码
- ✅ 功能开关粒度精确到组件级别

#### 2. 排班算法（数据处理）

> 将后端树形数据转换为前端矩阵表格

```javascript
// 三层转换管道
树形数据 → 扁平化提取 → 按时间段分类 → 矩阵数组
```

**性能优化**：
- useMemo 缓存转换结果
- 虚拟滚动支持大数据量
- 时间复杂度 O(n²) → 可优化至 O(n)

#### 3. 安全通信（医疗合规）

> 满足等保 2.0 三级要求

```javascript
// 请求拦截器自动处理
1. 时间戳签名（防重放）
2. DES/AES 加密（生产环境）
3. Token 自动刷新
4. 统一错误处理
```

#### 4. 权限控制（策略模式）

> 支持 5 种权限判定方式

```javascript
// 使用示例
<Authorized authority="admin">           // 字符串
<Authorized authority={['admin','doctor']}>  // 数组
<Authorized authority={(role) => role.includes('admin')}>  // 函数
<Authorized authority={fetchPermission()}>   // Promise
```

---

## 📁 目录结构

```
.
├── 01-Project-Docs/              # 项目文档
│   ├── 01-Methodology/           # 方法论框架（RAC/V.A.R.C.）
│   ├── 02-Architecture/          # 架构设计文档
│   └── 03-Business/              # 业务产出分析
│
├── 02-Core-Assets/               # ⭐ 核心技术资产
│   ├── tech-articles/            # 5篇技术沉淀
│   └── 项目总结终版.md
│
├── 03-Source-Code/               # 源代码
│   ├── modules/                  # 8个业务模块
│   ├── shared/                   # 共享资源
│   └── examples/                 # 架构示例
│
├── 04-Tools/                     # 工具
│   └── interview-prep/           # 面试准备
│
├── PROJECT-README.md             # 项目导航
└── README.md                     # 本文件
```

---

## 🚀 如何浏览

### 面试准备路线

1. **快速了解**（10分钟）
   - 阅读本 README
   - 浏览 [02-Core-Assets/tech-articles/README.md](./02-Core-Assets/tech-articles/README.md)

2. **技术深挖**（30分钟）
   - 精读 [03-多租户配置化架构](./02-Core-Assets/tech-articles/03-多租户配置化架构.md)
   - 了解 [配置中心示例](./03-Source-Code/examples/config-center/)

3. **代码验证**（可选）
   - 查看 [03-Source-Code/modules/](./03-Source-Code/modules/) 中的业务模块

### 面试官关注点

| 问题类型 | 应对文档 |
|---------|---------|
| "你们怎么一套代码支持多医院？" | 03-多租户配置化架构 |
| "权限控制怎么做的？" | 05-灵活权限控制架构 |
| "数据安全怎么保障？" | 04-安全加密通信体系 |
| "遇到过什么技术难点？" | 01-预约挂号排班算法 |
| "异步场景怎么处理？" | 02-人脸识别轮询机制 |

---

## 📈 产出评估

### 量化成果

| 指标 | 数据 |
|-----|------|
| 业务模块 | 8 个完整模块 |
| 代码复用率 | 90%+（配置化架构） |
| 技术沉淀 | 5 篇核心文档 |
| 支持医院 | 8 家（同一套代码） |
| 代码规范 | ESLint + Prettier + 代码评审 |

### 能力成长

| 能力维度 | 提升 |
|---------|------|
| 业务理解 | 深入理解医疗信息化核心场景（预约/缴费/用药） |
| 架构设计 | 掌握配置化架构、策略模式等设计模式 |
| 工程化 | 熟练使用 TypeScript、代码规范、模块化开发 |
| 安全意识 | 了解医疗数据安全、加密通信、等保合规 |
| 跨平台 | 掌握 uniapp 跨端开发（小程序+H5+App） |

---

## 📝 后续规划

- [ ] 将 5 篇技术沉淀发布到掘金/CSDN
- [ ] 基于配置化架构开源一个轻量级框架
- [ ] 补充单元测试和 E2E 测试
- [ ] 升级加密算法（DES → AES-256-GCM）

---

## 📧 联系我

- 📮 邮箱：[你的邮箱]
- 💼 LinkedIn：[你的LinkedIn]
- 🐙 GitHub：[你的GitHub]

---

## 📜 声明

- 本仓库为实习期间技术沉淀，代码已脱敏处理
- 核心业务逻辑已保留，可供技术交流学习
- 未经授权不得用于商业用途

---

**更新时间**：2025-03-31  
**维护者**：叶泽宇
