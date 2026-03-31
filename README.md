# 和仁科技患者端项目技术沉淀

> 医疗信息化前端开发实践 | 患者端全流程业务 | 多租户 SaaS 架构

## 📋 项目简介

杭州和仁科技股份有限公司患者端互联网医院产品，覆盖患者从**挂号→就诊→支付→取药→住院**全流程的线上服务。

**核心挑战**：
- 一套代码支持 8 家医院，各医院功能差异大（配置化架构）
- 医疗数据安全合规（等保三级、数据加密）
- 复杂业务流程的模块化设计

---

## 🏥 患者端业务流程

### 完整就诊流程

```mermaid
flowchart LR
    A[预约挂号] --> B[到院签到]
    B --> C[候诊排队]
    C --> D[医生问诊]
    D --> E[处方开立]
    E --> F[在线支付]
    F --> G[药房取药/检查]
    G --> H[离院]
    
    style A fill:#e1f5fe
    style F fill:#fff3e0
    style H fill:#e8f5e9
```

### 核心业务模块关系

```mermaid
flowchart TB
    subgraph 入口层
        A[智能导诊] --> B[预约挂号]
        C[急诊绿色通道] --> D[快速挂号]
    end
    
    subgraph 就诊中
        B --> E[门诊缴费]
        D --> E
        E --> F[报告查询]
        E --> G[用药指导]
    end
    
    subgraph 增值服务
        H[住院服务] --> I[住院预缴]
        J[病案服务] --> K[DRG结算]
    end
    
    F --> L[复诊预约]
    G --> L
    
    style A fill:#e3f2fd
    style E fill:#fff3e0
    style H fill:#fce4ec
```

---

## 🏗️ 系统架构

### 整体架构

```mermaid
flowchart TB
    subgraph 患者端["患者端 (uniapp)"]
        direction TB
        A1[小程序] 
        A2[H5]
        A3[App]
    end
    
    subgraph 网关层
        B[API Gateway<br/>请求鉴权/限流/路由]
    end
    
    subgraph 业务服务层
        C1[挂号服务]
        C2[支付服务]
        C3[处方服务]
        C4[消息服务]
    end
    
    subgraph 数据层
        D1[(MySQL)]
        D2[(Redis)]
        D3[OSS存储]
    end
    
    subgraph 外部系统
        E1[HIS系统]
        E2[支付平台]
        E3[医保平台]
    end
    
    A1 --> B
    A2 --> B
    A3 --> B
    B --> C1 & C2 & C3 & C4
    C1 & C2 & C3 & C4 --> D1 & D2 & D3
    C1 --> E1
    C2 --> E2
    C3 --> E3
```

### 前端模块架构

```mermaid
flowchart TB
    subgraph 统一代码基座
        direction TB
        
        subgraph 核心层
            A[配置中心<br/>ConfigCenter]
            B[权限控制<br/>Authorized]
            C[请求封装<br/>Request]
            D[状态管理<br/>Pinia Store]
        end
        
        subgraph 业务模块层
            E[cost-center<br/>费用中心]
            F[medication-manager<br/>用药管理]
            G[smart-pre-diagnosis<br/>智能导诊]
            H[drg-settlement<br/>DRG结算]
            I[questionnaire-refactor<br/>表单引擎]
        end
        
        subgraph 共享资源
            J[components<br/>公共组件]
            K[composables<br/>组合式函数]
            L[utils<br/>工具函数]
        end
    end
    
    A --> E & F & G & H & I
    K --> E & F & G & H & I
    L --> E & F & G & H & I
    J --> E & F & G & H & I
```

---

## 📦 核心业务模块

### 1. 预约挂号模块

**业务流程**：

```mermaid
sequenceDiagram
    actor 患者
    participant 前端 as 预约挂号页
    participant API as 后端API
    participant HIS as 医院HIS
    
    患者->>前端: 选择科室/日期
    前端->>API: 获取排班数据
    API->>HIS: 查询号源
    HIS-->>API: 返回排班树
    API-->>前端: 返回排班数据
    
    前端->>前端: 树形转矩阵算法
    Note over 前端: 将科室→日期→时段→号源<br/>转为 日期×时段 矩阵
    
    患者->>前端: 选择医生/时段
    前端->>API: 锁号请求
    API-->>前端: 返回锁号结果
    
    alt 需要人脸识别
        患者->>前端: 扫码认证
        前端->>API: 轮询认证结果
        API-->>前端: 认证成功
    end
    
    患者->>前端: 确认预约
    前端->>API: 提交预约
    API-->>前端: 返回预约成功
```

**技术实现**：
- **数据转换**：后端返回树形结构（科室→日期→时段→号源），前端通过 `reduce` 转为矩阵表格
- **双模式展示**：支持"按日期选医生"和"按医生选日期"两种交互模式
- **号源锁定**：预约前锁号 15 分钟，超时释放

---

### 2. 费用中心模块

**支付流程**：

```mermaid
flowchart TD
    A[医生开立处方/检查单] --> B[HIS生成待缴费记录]
    B --> C[前端查询待缴费列表]
    C --> D{选择支付方式}
    
    D -->|自费| E[唤起微信支付/支付宝]
    D -->|医保| F[医保电子凭证授权]
    D -->|混合支付| G[医保+自费组合支付]
    
    E --> H[支付成功回调]
    F --> H
    G --> H
    
    H --> I[更新订单状态]
    I --> J[推送支付成功通知]
    J --> K[显示取药/检查指引]
    
    style A fill:#e3f2fd
    style H fill:#fff3e0
    style K fill:#e8f5e9
```

**状态机设计**：

```mermaid
stateDiagram-v2
    [*] --> 待支付: 医生开立
    待支付 --> 已锁定: 提交支付
    已锁定 --> 支付成功: 支付回调成功
    已锁定 --> 待支付: 支付超时/取消
    支付成功 --> 已退费: 申请退费
    已退费 --> [*]
    支付成功 --> [*]
    
    note right of 已锁定
        支付中状态防止重复提交
        锁定时间: 15分钟
    end note
```

---

### 3. 智能预问诊模块

**导诊流程**：

```mermaid
flowchart LR
    A[选择人体部位] --> B[选择症状]
    B --> C[症状详情补充]
    C --> D[智能评估]
    D --> E[推荐科室]
    E --> F[一键挂号]
    
    style A fill:#e3f2fd
    style D fill:#fff3e0
    style F fill:#e8f5e9
```

**人体图交互架构**：

```mermaid
flowchart TB
    subgraph Canvas层
        A[人体轮廓绘制]
        B[热区点击检测]
        C[选中状态渲染]
    end
    
    subgraph 数据层
        D[部位-症状映射表]
        E[症状权重算法]
    end
    
    subgraph 业务逻辑
        F[症状选择收集]
        G[科室匹配计算]
    end
    
    A --> B --> C
    B --> D
    D --> E --> G
    F --> G
    C --> F
```

---

### 4. DRG 结算模块

**病案分组流程**：

```mermaid
flowchart TD
    A[出院结算申请] --> B[获取病案信息]
    B --> C[DRG分组计算]
    C --> D{分组结果}
    
    D -->|正常组| E[显示DRG分组及费用]
    D -->|高倍率| F[提示高倍率病例]
    D -->|低倍率| G[提示低倍率病例]
    D -->|歧义组| H[进入特案申请流程]
    
    E --> I[费用结构分析]
    F --> J[医生确认/特案申请]
    G --> J
    H --> K[上传补充材料]
    K --> L[医保审核]
    
    style C fill:#fff3e0
    style E fill:#e8f5e9
    style H fill:#ffebee
```

---

## 🎯 核心技术方案

### 配置化架构（多租户支持）

```mermaid
flowchart TB
    subgraph 配置中心
        A[医院配置表<br/>hosCode: 001~008]
        B[功能开关矩阵<br/>isShowQueueNumber<br/>isShowNetWork<br/>...]
        C[业务流程配置<br/>isOrderPay<br/>NumberSourceType]
    end
    
    subgraph 运行时
        D[FeatureWrapper<br/>组件级控制]
        E[路由守卫<br/>页面级控制]
        F[请求拦截器<br/>API级控制]
    end
    
    subgraph 渲染结果
        G[医院A界面<br/>有排队叫号]
        H[医院B界面<br/>无排队叫号]
    end
    
    A & B & C --> D & E & F
    D & E & F --> G
    D & E & F --> H
```

**核心代码**：

```typescript
// 功能开关组件
<template>
  <slot v-if="isEnabled" />
  <slot v-else name="fallback" />
</template>

// 使用示例
<FeatureWrapper featureKey="isShowQueueNumber">
  <QueueNumberCard />
</FeatureWrapper>
```

---

### 数据安全架构

```mermaid
flowchart LR
    subgraph 客户端
        A[请求拦截器] --> B[参数加密<br/>AES/DES]
        B --> C[签名生成<br/>防重放]
    end
    
    subgraph 传输层
        D[HTTPS/TLS]
    end
    
    subgraph 服务端
        E[签名验证] --> F[解密请求]
        F --> G[业务处理]
        G --> H[加密响应]
    end
    
    C --> D --> E
    H --> I[客户端解密]
```

---

## 📂 项目结构

```
temp-repo/
├── 01-Project-Docs/              # 项目文档
│   ├── 01-Methodology/           # 方法论框架
│   ├── 02-Architecture/          # 架构设计
│   └── 03-Business/              # 业务分析
│
├── 02-Core-Assets/               # 核心技术资产
│   ├── tech-articles/            # 5篇技术沉淀
│   │   ├── 01-预约挂号排班算法.md
│   │   ├── 02-人脸识别轮询机制.md
│   │   ├── 03-多租户配置化架构.md
│   │   ├── 04-安全加密通信体系.md
│   │   └── 05-灵活权限控制架构.md
│   └── 项目总结终版.md
│
├── 03-Source-Code/               # 源代码
│   ├── modules/                  # 8个业务模块
│   │   ├── cost-center/          # 费用中心
│   │   ├── medication-manager/   # 用药管理
│   │   ├── smart-pre-diagnosis/  # 智能导诊
│   │   ├── drg-settlement/       # DRG结算
│   │   └── ...
│   ├── shared/                   # 共享资源
│   └── examples/                 # 架构示例
│
└── 04-Tools/                     # 工具脚本
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装运行

```bash
# 安装依赖
npm install

# H5 开发
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin
```

### 查看示例

```bash
# 配置中心示例
cd 03-Source-Code/examples/config-center
npm run demo
```

---

## 📊 项目数据

| 指标 | 数值 |
|-----|------|
| 业务模块 | 8 个完整模块 |
| 覆盖医院 | 8 家（同一套代码部署）|
| 核心流程 | 挂号→就诊→支付→取药→住院全流程 |
| 技术沉淀 | 5 篇架构文档 |

---

**维护者**：叶泽宇 | 浙江中医药大学 · 医学信息工程  
**更新时间**：2025-03-31
