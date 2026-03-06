/**
 * 费用中心 - 工具函数
 */
import type { CostStatus, ICostSummary, IHospitalCost } from '../types';

/**
 * 格式化金额（千分位）
 * @param amount 金额
 * @param precision 精度（默认2位小数）
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number | string, precision: number = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toFixed(precision).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化日期
 * @param dateStr 日期字符串
 * @param format 格式类型
 * @returns 格式化后的日期
 */
export function formatDate(dateStr: string, format: 'full' | 'date' | 'time' = 'date'): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'full':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case 'time':
      return `${hours}:${minutes}:${seconds}`;
    case 'date':
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * 获取费用状态文本
 * @param status 费用状态
 * @returns 状态文本
 */
export function getStatusText(status: CostStatus | string): string {
  const statusMap: Record<string, string> = {
    '1': '余额充足',
    '2': '余额不足',
    '3': '已欠费',
  };
  return statusMap[status] || '未知';
}

/**
 * 获取费用状态颜色
 * @param status 费用状态
 * @returns 颜色值
 */
export function getStatusColor(status: CostStatus | string): string {
  const colorMap: Record<string, string> = {
    '1': '#52c41a', // 绿色
    '2': '#faad14', // 橙色
    '3': '#ff4d4f', // 红色
  };
  return colorMap[status] || '#999999';
}

/**
 * 计算费用摘要
 * @param cost 住院费用数据
 * @returns 费用摘要
 */
export function calculateSummary(cost: IHospitalCost): ICostSummary {
  const totalCost = cost.totalCost || 0;
  const paidAmount = cost.paidAmount || 0;
  const deposit = cost.deposit || 0;
  const balance = cost.balance || 0;

  return {
    totalCost,
    paidAmount,
    deposit,
    balance,
    unpaidAmount: totalCost - paidAmount - deposit,
  };
}

/**
 * 验证支付金额
 * @param amount 支付金额
 * @param maxAmount 最大金额
 * @returns 是否有效
 */
export function validatePaymentAmount(amount: number, maxAmount?: number): { valid: boolean; message?: string } {
  if (!amount || amount <= 0) {
    return { valid: false, message: '请输入有效的支付金额' };
  }
  if (maxAmount !== undefined && amount > maxAmount) {
    return { valid: false, message: `支付金额不能超过${formatAmount(maxAmount)}元` };
  }
  // 金额最多支持2位小数
  const decimal = amount.toString().split('.')[1];
  if (decimal && decimal.length > 2) {
    return { valid: false, message: '金额最多支持2位小数' };
  }
  return { valid: true };
}

/**
 * 生成金额选项（快捷充值）
 * @param balance 当前余额
 * @returns 金额选项数组
 */
export function generateQuickAmounts(balance: number): number[] {
  const baseAmounts = [100, 500, 1000, 2000, 5000];
  // 加上一个"补足差额"的选项
  if (balance < 0) {
    return [...baseAmounts, Math.abs(balance)];
  }
  return baseAmounts;
}

/**
 * 获取支付方式文本
 * @param method 支付方式
 * @returns 支付方式文本
 */
export function getPayMethodText(method: string): string {
  const methodMap: Record<string, string> = {
    'wechat': '微信支付',
    'alipay': '支付宝',
  };
  return methodMap[method] || method;
}

/**
 * 获取订单状态文本
 * @param status 订单状态
 * @returns 状态文本
 */
export function getOrderStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '待支付',
    'paid': '已支付',
    'failed': '支付失败',
  };
  return statusMap[status] || status;
}

/**
 * 获取退费状态文本
 * @param status 退费状态
 * @returns 状态文本
 */
export function getRefundStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'rejected': '已拒绝',
  };
  return statusMap[status] || status;
}
