# 费用中心模块 (Cost Center)

## 模块概述

费用中心模块是一个完整的住院费用管理系统，帮助用户管理住院期间的各项费用，包括费用查询、在线缴费、退费申请等功能。

## 核心功能

- **住院费用总览**: 实时查看账户余额、已缴金额、押金状态
- **费用明细**: 按日期/分类查看详细费用清单
- **日清单**: 查看每日住院费用明细
- **在线缴费**: 支持微信/支付宝预交金缴纳
- **退费申请**: 提交退费申请，原路退回
- **缴费记录**: 查询历史缴费/退费记录

## 目录结构

```
costCenter/
├── types/                    # TypeScript 类型定义
│   └── index.ts             # 所有类型定义
├── store/                   # Pinia 状态管理
│   └── costStore.ts        # 费用模块状态
├── api/                    # API 接口封装
│   ├── index.ts            # 统一导出
│   ├── costApi.ts          # 费用相关接口
│   └── paymentApi.ts       # 支付相关接口
├── composables/            # 组合式函数
│   ├── useCost.ts          # 费用逻辑
│   ├── usePayment.ts       # 支付逻辑
│   └── useRefund.ts        # 退费逻辑
├── components/             # 组件
│   ├── CostHeader.vue      # 费用顶部展示
│   ├── CostCard.vue        # 功能卡片
│   ├── CostDetailItem.vue  # 费用明细项
│   ├── PaymentDialog.vue   # 支付弹窗
│   └── RefundForm.vue     # 退费表单
├── utils/                  # 工具函数
│   └── index.ts            # 工具函数集合
├── pages/                  # 页面
│   ├── index.vue           # 费用首页
│   ├── detail.vue          # 费用明细
│   ├── daily.vue           # 日清单
│   ├── pay.vue             # 在线缴费
│   ├── refund.vue          # 退费申请
│   └── records.vue         # 缴费记录
└── README.md              # 本文档
```

## 快速开始

### 1. 安装依赖

本模块依赖项目已有的 Pinia 和 HTTP 请求库，无需额外安装。

### 2. 页面配置

在 `pages.json` 的 `subPackages` 中添加：

```json
{
  "root": "pagesD",
  "pages": [
    {
      "path": "costCenter/index",
      "style": {
        "navigationBarTitleText": "住院费用"
      }
    }
  ]
}
```

### 3. 使用示例

```typescript
// 引入 composables
import { useCost } from '@/pagesD/costCenter/composables/useCost';

const { costInfo, loadCostInfo } = useCost();

// 加载费用信息
onMounted(() => {
  loadCostInfo('patient-id');
});
```

## 页面路由

| 页面 | 路由 | 功能 |
|------|------|------|
| 费用首页 | `/pagesD/costCenter/index` | 费用总览、快速入口 |
| 费用明细 | `/pagesD/costCenter/detail` | 费用清单查询 |
| 日清单 | `/pagesD/costCenter/daily` | 每日明细 |
| 在线缴费 | `/pagesD/costCenter/pay` | 预交金缴纳 |
| 退费申请 | `/pagesD/costCenter/refund` | 退费申请 |
| 缴费记录 | `/pagesD/costCenter/records` | 历史记录 |

## API 接口

### 费用相关

- `costApi.getHospitalCost` - 获取住院费用信息
- `costApi.getCostDetail` - 获取费用明细
- `costApi.getDailyList` - 获取日清单

### 支付相关

- `paymentApi.createOrder` - 创建支付订单
- `paymentApi.queryOrder` - 查询订单状态
- `paymentApi.getPaymentRecords` - 获取缴费记录
- `paymentApi.applyRefund` - 申请退费
- `paymentApi.getRefundRecords` - 获取退费记录

## 类型定义

主要类型：

- `IHospitalCost` - 住院费用
- `ICostDetail` - 费用明细
- `IPaymentOrder` - 支付订单
- `IRefundApply` - 退费申请
- `CostStatus` - 费用状态枚举

## 注意事项

1. 所有金额单位为"元"，精确到分
2. 日期格式统一使用 ISO 8601 格式
3. 支付结果需要轮询确认
4. 退费申请提交后不可撤回
