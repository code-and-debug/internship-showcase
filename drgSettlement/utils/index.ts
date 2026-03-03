/**
 * DRG医保结算与病案管理模块 - 工具函数
 */

import type { 
  CostCategory, 
  WarningLevel, 
  CaseType, 
  RiskLevel,
  ISettlementDetail,
  ICostDetail,
} from '../types';
import { 
  DRG_COST_THRESHOLDS, 
  FLYCHECK_RISK_LEVELS,
  WARNING_LEVEL_CONFIG,
  CASE_TYPE_CONFIG,
  RISK_LEVEL_CONFIG,
  COST_CATEGORY_CONFIG,
} from '../constants';

// ==================== 金额格式化 ====================

/**
 * 格式化金额（保留2位小数）
 * @param amount 金额
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number | undefined): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0.00';
  }
  return amount.toFixed(2);
}

/**
 * 格式化金额（带¥符号）
 * @param amount 金额
 * @returns 格式化后的金额字符串
 */
export function formatCurrency(amount: number | undefined): string {
  return `¥${formatAmount(amount)}`;
}

/**
 * 格式化金额（带千分位）
 * @param amount 金额
 * @returns 格式化后的金额字符串
 */
export function formatAmountWithComma(amount: number | undefined): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0.00';
  }
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ==================== 百分比格式化 ====================

/**
 * 格式化为百分比
 * @param value 数值（0-1之间）
 * @param decimals 小数位数，默认1
 * @returns 百分比字符串
 */
export function formatPercent(value: number | undefined, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化为进度百分比
 * @param current 当前值
 * @param total 总值
 * @returns 百分比字符串
 */
export function formatProgress(current: number, total: number): string {
  if (!total || total === 0) return '0%';
  return formatPercent(current / total);
}

// ==================== 日期格式化 ====================

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @param format 格式模板，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date | undefined, format = 'YYYY-MM-DD'): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

/**
 * 格式化日期时间
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: string | Date | undefined): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}

// ==================== DRG相关计算 ====================

/**
 * 计算费用消耗率
 * @param currentCost 当前费用
 * @param paymentStandard 支付标准
 * @returns 费用消耗率（0-100）
 */
export function calculateCostRate(currentCost: number, paymentStandard: number): number {
  if (!paymentStandard || paymentStandard === 0) return 0;
  return (currentCost / paymentStandard) * 100;
}

/**
 * 判断病例类型
 * @param currentCost 当前费用
 * @param paymentStandard 支付标准
 * @returns 病例类型
 */
export function getCaseType(currentCost: number, paymentStandard: number): CaseType {
  if (!paymentStandard || paymentStandard === 0) return 'normal';
  const rate = (currentCost / paymentStandard) * 100; // 转换为百分比
  if (rate >= 200) return 'high';  // 高倍率：超过200%
  if (rate <= 50) return 'low';    // 低倍率：低于50%
  return 'normal';
}

/**
 * 获取预警级别
 * @param costRate 费用消耗率（0-100）
 * @returns 预警级别
 */
export function getWarningLevel(costRate: number): WarningLevel {
  if (costRate >= DRG_COST_THRESHOLDS.DANGER * 100) return 'danger';
  if (costRate >= DRG_COST_THRESHOLDS.WARNING * 100) return 'warning';
  return 'safe';
}

/**
 * 计算DRG结余
 * @param paymentStandard 支付标准
 * @param currentCost 当前费用
 * @returns 结余金额（正数为盈利，负数为亏损）
 */
export function calculateDRGBalance(paymentStandard: number, currentCost: number): number {
  return paymentStandard - currentCost;
}

// ==================== 费用统计 ====================

/**
 * 计算费用类别占比
 * @param costDetails 费用明细列表
 * @returns 各类别占比
 */
export function calculateCostRatio(costDetails: ICostDetail[]): Record<CostCategory, number> {
  const total = costDetails.reduce((sum, item) => sum + item.amount, 0);
  if (total === 0) {
    return { drug: 0, exam: 0, surgery: 0, treatment: 0, material: 0, other: 0 };
  }
  
  const result: Record<string, number> = {};
  const categories: CostCategory[] = ['drug', 'exam', 'surgery', 'treatment', 'material', 'other'];
  
  categories.forEach(category => {
    const categoryTotal = costDetails
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0);
    result[category] = categoryTotal / total;
  });
  
  return result as Record<CostCategory, number>;
}

/**
 * 计算药品占比
 * @param costDetails 费用明细列表
 * @returns 药品占比（0-100）
 */
export function calculateDrugRatio(costDetails: ICostDetail[]): number {
  const total = costDetails.reduce((sum, item) => sum + item.amount, 0);
  if (total === 0) return 0;
  
  const drugTotal = costDetails
    .filter(item => item.category === 'drug')
    .reduce((sum, item) => sum + item.amount, 0);
  
  return (drugTotal / total) * 100;
}

/**
 * 计算检查占比
 * @param costDetails 费用明细列表
 * @returns 检查占比（0-100）
 */
export function calculateExamRatio(costDetails: ICostDetail[]): number {
  const total = costDetails.reduce((sum, item) => sum + item.amount, 0);
  if (total === 0) return 0;
  
  const examTotal = costDetails
    .filter(item => item.category === 'exam')
    .reduce((sum, item) => sum + item.amount, 0);
  
  return (examTotal / total) * 100;
}

// ==================== 飞检风险评分 ====================

/**
 * 计算飞检风险分
 * @param riskFactors 风险因素
 * @returns 风险分数
 */
export function calculateRiskScore(riskFactors: {
  highRateCase: boolean;
  diagnosisMismatch: boolean;
  excessiveDrugUse: boolean;
  repeatedExam: boolean;
  lackOfDocumentation: boolean;
}): number {
  let score = 0;
  if (riskFactors.highRateCase) score += 40;
  if (riskFactors.diagnosisMismatch) score += 25;
  if (riskFactors.excessiveDrugUse) score += 15;
  if (riskFactors.repeatedExam) score += 10;
  if (riskFactors.lackOfDocumentation) score += 10;
  return score;
}

/**
 * 获取风险等级
 * @param riskScore 风险分数
 * @returns 风险等级
 */
export function getRiskLevel(riskScore: number): RiskLevel {
  if (riskScore >= FLYCHECK_RISK_LEVELS.HIGH) return 'high';
  if (riskScore >= FLYCHECK_RISK_LEVELS.MEDIUM) return 'medium';
  return 'low';
}

// ==================== 样式配置获取 ====================

/**
 * 获取预警级别配置
 * @param level 预警级别
 * @returns 配置对象
 */
export function getWarningLevelConfig(level: WarningLevel) {
  return WARNING_LEVEL_CONFIG[level];
}

/**
 * 获取病例类型配置
 * @param type 病例类型
 * @returns 配置对象
 */
export function getCaseTypeConfig(type: CaseType) {
  return CASE_TYPE_CONFIG[type];
}

/**
 * 获取风险等级配置
 * @param level 风险等级
 * @returns 配置对象
 */
export function getRiskLevelConfig(level: RiskLevel) {
  return RISK_LEVEL_CONFIG[level];
}

/**
 * 获取费用类别配置
 * @param category 费用类别
 * @returns 配置对象
 */
export function getCostCategoryConfig(category: CostCategory) {
  return COST_CATEGORY_CONFIG[category];
}

// ==================== 诊断相关 ====================

/**
 * 检查是否有MCC诊断
 * @param diagnoses 诊断列表
 * @returns 是否有MCC
 */
export function hasMCCDiagnosis(diagnoses: { isMCC: boolean }[]): boolean {
  return diagnoses.some(d => d.isMCC);
}

/**
 * 检查是否有CC诊断
 * @param diagnoses 诊断列表
 * @returns 是否有CC
 */
export function hasCCDiagnosis(diagnoses: { isCC: boolean }[]): boolean {
  return diagnoses.some(d => d.isCC);
}

/**
 * 获取主要诊断
 * @param diagnoses 诊断列表
 * @returns 主要诊断
 */
export function getMainDiagnosis(diagnoses: { diagnosisType: string }[]) {
  return diagnoses.find(d => d.diagnosisType === 'main');
}

// ==================== 数据验证 ====================

/**
 * 验证身份证格式
 * @param idCard 身份证号
 * @returns 是否有效
 */
export function validateIdCard(idCard: string): boolean {
  const pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return pattern.test(idCard);
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export function validatePhone(phone: string): boolean {
  const pattern = /^1[3-9]\d{9}$/;
  return pattern.test(phone);
}

// ==================== 数据脱敏 ====================

/**
 * 脱敏身份证号
 * @param idCard 身份证号
 * @returns 脱敏后的身份证号
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 10) return idCard;
  return idCard.slice(0, 6) + '********' + idCard.slice(-4);
}

/**
 * 脱敏手机号
 * @param phone 手机号
 * @returns 脱敏后的手机号
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

/**
 * 脱敏姓名
 * @param name 姓名
 * @returns 脱敏后的姓名
 */
export function maskName(name: string): string {
  if (!name || name.length === 0) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

// ==================== 数组工具 ====================

/**
 * 按类别分组
 * @param items 项目列表
 * @param keyFn 分组函数
 * @returns 分组结果
 */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * 去重
 * @param items 项目列表
 * @param keyFn 唯一键函数
 * @returns 去重后的列表
 */
export function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ==================== 节流防抖 ====================

/**
 * 防抖函数
 * @param fn 原函数
 * @param delay 延迟时间（ms）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 原函数
 * @param interval 间隔时间（ms）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// ==================== 其他工具 ====================

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 深拷贝
 * @param obj 对象
 * @returns 深拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 等待指定时间
 * @param ms 毫秒数
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
