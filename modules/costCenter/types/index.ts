/**
 * 费用中心模块 - 类型定义
 * 包含费用、订单、退费申请等相关类型
 */

// 费用状态
export enum CostStatus {
  BALANCE = '1', // 余额充足
  WARNING = '2', // 余额不足
  ARREARS = '3', // 欠费中
}

// 住院费用主数据
export interface IHospitalCost {
  patientId: string;
  patientName: string;
  admissionNo: string; // 住院号
  deptName: string; // 科室
  totalCost: number; // 总费用
  paidAmount: number; // 已缴金额
  balance: number; // 余额
  deposit: number; // 押金
  status: CostStatus;
  startDate: string; // 入院日期
}

// 费用明细项
export interface ICostDetail {
  id: string;
  date: string;
  projectName: string; // 项目名称
  specification: string; // 规格
  quantity: number; // 数量
  unitPrice: number; // 单价
  amount: number; // 金额
  category: string; // 分类（药品/检查/治疗等）
}

// 缴费订单
export interface IPaymentOrder {
  orderNo: string;
  amount: number;
  payMethod: 'wechat' | 'alipay';
  status: 'pending' | 'paid' | 'failed';
  createTime: string;
  payTime?: string;
}

// 退费申请
export interface IRefundApply {
  id: string;
  admissionNo: string;
  refundAmount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  applyTime: string;
  processTime?: string;
}

// 支付请求参数
export interface IPaymentParams {
  amount: number;
  payMethod: 'wechat' | 'alipay';
  admissionNo: string;
}

// 退费请求参数
export interface IRefundParams {
  admissionNo: string;
  refundAmount: number;
  reason: string;
}

// 费用筛选参数
export interface ICostFilterParams {
  admissionNo: string;
  date?: string;
  category?: string;
  page?: number;
  size?: number;
}

// 费用摘要信息
export interface ICostSummary {
  totalCost: number;
  paidAmount: number;
  balance: number;
  deposit: number;
  unpaidAmount: number;
}
