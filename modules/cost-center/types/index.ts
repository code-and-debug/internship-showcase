/**
 * ============================================================================
 * 费用中心模块 - 类型定义文件
 * ============================================================================
 * 
 * 本文件集中定义了费用中心模块涉及的所有 TypeScript 类型，包括：
 * - 住院费用数据结构
 * - 费用明细和订单结构
 * - 退费申请结构
 * - 组件 Props 类型
 * - API 请求/响应类型
 * 
 * 使用场景：
 * 当需要了解某个数据结构的字段含义时，查看此文件
 * 当需要为变量/参数添加类型时，从此文件导入对应类型
 * ============================================================================
 */

// ============================================
// 费用状态枚举
// ============================================

/**
 * 费用状态枚举
 * 
 * 使用场景：
 * - 在费用首页显示余额状态标签
 * - 在详情页显示费用状态
 * - 用于费用筛选
 */
export enum CostStatus {
  /** 余额充足 */
  BALANCE = '1',
  /** 余额不足 */
  WARNING = '2',
  /** 欠费中 */
  ARREARS = '3',
}

// ============================================
// 费用主数据
// ============================================

/**
 * 住院费用主数据
 * 
 * 使用场景：
 * - 费用首页展示住院费用概览
 * - 获取住院费用信息 API 返回
 * 
 * 业务流程关联：
 * 1. 页面加载时调用 getHospitalCost API
 * 2. 获取患者当前住院费用信息
 * 3. 展示总费用、已缴金额、余额等
 * 4. 根据 status 显示不同状态标签
 */
export interface IHospitalCost {
  /** 患者ID */
  patientId: string;
  /** 患者姓名 */
  patientName: string;
  /** 住院号 */
  admissionNo: string;
  /** 科室名称 */
  deptName: string;
  /** 总费用 */
  totalCost: number;
  /** 已缴金额 */
  paidAmount: number;
  /** 余额 */
  balance: number;
  /** 押金 */
  deposit: number;
  /** 费用状态 */
  status: CostStatus;
  /** 入院日期 */
  startDate: string;
}

// ============================================
// 费用明细
// ============================================

/**
 * 费用明细项
 * 
 * 使用场景：
 * - 费用明细列表页展示
 * - 日清单详情展示
 * 
 * 业务流程关联：
 * 1. 调用 getCostDetail API 获取明细列表
 * 2. 展示每条费用的项目名称、规格、数量、金额
 * 3. 支持按日期、分类筛选
 */
export interface ICostDetail {
  /** 明细ID */
  id: string;
  /** 费用日期 */
  date: string;
  /** 项目名称 */
  projectName: string;
  /** 规格 */
  specification: string;
  /** 数量 */
  quantity: number;
  /** 单价 */
  unitPrice: number;
  /** 金额 */
  amount: number;
  /** 分类（药品/检查/治疗/手术/其他） */
  category: string;
}

// ============================================
// 订单相关
// ============================================

/**
 * 缴费订单
 * 
 * 使用场景：
 * - 在线支付页面使用
 * - 缴费记录列表展示
 * 
 * 业务流程关联：
 * 1. 用户点击"充值"创建订单
 * 2. 调用 createOrder API 创建支付订单
 * 3. 订单状态：pending → paid/failed
 * 4. 可查询订单状态
 */
export interface IPaymentOrder {
  /** 订单号 */
  orderNo: string;
  /** 订单金额 */
  amount: number;
  /** 支付方式 */
  payMethod: 'wechat' | 'alipay';
  /** 订单状态 */
  status: 'pending' | 'paid' | 'failed';
  /** 创建时间 */
  createTime: string;
  /** 支付时间（可选） */
  payTime?: string;
}

/**
 * 退费申请
 * 
 * 使用场景：
 * - 退费申请页面使用
 * - 退费记录列表展示
 * 
 * 业务流程关联：
 * 1. 用户点击"退费"发起申请
 * 2. 填写退费金额和原因
 * 3. 调用 applyRefund API 提交申请
 * 4. 状态：pending → processing → completed/rejected
 */
export interface IRefundApply {
  /** 申请ID */
  id: string;
  /** 住院号 */
  admissionNo: string;
  /** 退费金额 */
  refundAmount: number;
  /** 退费原因 */
  reason: string;
  /** 申请状态 */
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  /** 申请时间 */
  applyTime: string;
  /** 处理时间（可选） */
  processTime?: string;
}

// ============================================
// 请求参数类型
// ============================================

/**
 * 支付请求参数
 * 
 * 使用场景：
 * - 创建支付订单时传递
 * 
 * @example
 * const params: IPaymentParams = {
 *   amount: 5000,
 *   payMethod: 'wechat',
 *   admissionNo: 'ZY202401010001'
 * };
 */
export interface IPaymentParams {
  /** 充值金额 */
  amount: number;
  /** 支付方式 */
  payMethod: 'wechat' | 'alipay';
  /** 住院号 */
  admissionNo: string;
}

/**
 * 退费请求参数
 * 
 * 使用场景：
 * - 提交退费申请时传递
 */
export interface IRefundParams {
  /** 住院号 */
  admissionNo: string;
  /** 退费金额 */
  refundAmount: number;
  /** 退费原因 */
  reason: string;
}

/**
 * 费用筛选参数
 * 
 * 使用场景：
 * - 获取费用明细列表时传递
 * - 支持按日期、分类筛选
 */
export interface ICostFilterParams {
  /** 住院号 */
  admissionNo: string;
  /** 费用日期（可选） */
  date?: string;
  /** 费用分类（可选） */
  category?: string;
  /** 页码（可选） */
  page?: number;
  /** 每页条数（可选） */
  size?: number;
}

// ============================================
// 数据统计类型
// ============================================

/**
 * 费用摘要信息
 * 
 * 使用场景：
 * - 费用首页展示费用概览
 * - 页面顶部汇总展示
 * 
 * 业务流程关联：
 * 1. 根据 currentCost 计算
 * 2. 计算未缴金额 = 总费用 - 已缴金额
 * 3. 展示总费用、已缴、余额、押金、未缴
 */
export interface ICostSummary {
  /** 总费用 */
  totalCost: number;
  /** 已缴金额 */
  paidAmount: number;
  /** 余额 */
  balance: number;
  /** 押金 */
  deposit: number;
  /** 未缴金额 */
  unpaidAmount: number;
}
