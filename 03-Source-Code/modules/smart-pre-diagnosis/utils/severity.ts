/**
 * ============================================================================
 * 智能预问诊模块 - 严重程度处理工具函数
 * ============================================================================
 * 
 * 本文件提供严重程度相关的工具函数。
 * ============================================================================
 */

import type { SeverityLevel, UrgencyLevel } from '../types';

/**
 * 严重程度配置
 */
export interface SeverityConfig {
  label: string;      // 显示文本
  color: string;      // 颜色值
  bgColor: string;    // 背景色
  icon: string;       // 图标
  priority: number;   // 优先级（数字越大越严重）
}

/**
 * 严重程度配置映射
 */
export const severityConfigMap: Record<SeverityLevel, SeverityConfig> = {
  mild: {
    label: '轻微',
    color: '#52c41a',
    bgColor: '#f6ffed',
    icon: '😊',
    priority: 1,
  },
  moderate: {
    label: '中等',
    color: '#faad14',
    bgColor: '#fffbe6',
    icon: '😐',
    priority: 2,
  },
  severe: {
    label: '严重',
    color: '#ff4d4f',
    bgColor: '#fff2f0',
    icon: '😔',
    priority: 3,
  },
};

/**
 * 紧急程度配置映射
 */
export const urgencyConfigMap: Record<UrgencyLevel, SeverityConfig> = {
  normal: {
    label: '普通',
    color: '#1890ff',
    bgColor: '#e6f7ff',
    icon: 'ℹ️',
    priority: 1,
  },
  urgent: {
    label: '加急',
    color: '#faad14',
    bgColor: '#fffbe6',
    icon: '⚠️',
    priority: 2,
  },
  emergency: {
    label: '紧急',
    color: '#ff4d4f',
    bgColor: '#fff2f0',
    icon: '🚨',
    priority: 3,
  },
};

/**
 * 获取严重程度配置
 * 
 * @param severity - 严重程度值
 * @returns 严重程度配置
 * 
 * @example
 * const config = getSeverityConfig('moderate');
 * // { label: '中等', color: '#faad14', ... }
 */
export const getSeverityConfig = (severity: string): SeverityConfig => {
  return severityConfigMap[severity as SeverityLevel] || {
    label: '未知',
    color: '#999999',
    bgColor: '#f5f5f5',
    icon: '❓',
    priority: 0,
  };
};

/**
 * 获取紧急程度配置
 * 
 * @param urgency - 紧急程度值
 * @returns 紧急程度配置
 */
export const getUrgencyConfig = (urgency: string): SeverityConfig => {
  return urgencyConfigMap[urgency as UrgencyLevel] || {
    label: '未知',
    color: '#999999',
    bgColor: '#f5f5f5',
    icon: '❓',
    priority: 0,
  };
};

/**
 * 格式化严重程度为百分比
 * 
 * @param severity - 严重程度
 * @returns 百分比数值 (0-100)
 * 
 * @example
 * const percent = formatSeverityPercent('moderate');
 * // 66
 */
export const formatSeverityPercent = (severity: SeverityLevel): number => {
  const percentMap: Record<SeverityLevel, number> = {
    mild: 33,
    moderate: 66,
    severe: 100,
  };
  return percentMap[severity] || 0;
};

/**
 * 比较两个严重程度
 * 
 * @param severity1 - 严重程度1
 * @param severity2 - 严重程度2
 * @returns 比较结果 (1: 1更严重, -1: 2更严重, 0: 相同)
 * 
 * @example
 * const result = compareSeverity('severe', 'mild');
 * // 1
 */
export const compareSeverity = (severity1: string, severity2: string): number => {
  const config1 = getSeverityConfig(severity1);
  const config2 = getSeverityConfig(severity2);

  if (config1.priority > config2.priority) return 1;
  if (config1.priority < config2.priority) return -1;
  return 0;
};

/**
 * 获取最严重的程度
 * 
 * @param severities - 严重程度数组
 * @returns 最严重的程度值
 * 
 * @example
 * const worst = getWorstSeverity(['mild', 'moderate', 'severe']);
 * // 'severe'
 */
export const getWorstSeverity = (severities: string[]): string => {
  if (severities.length === 0) return 'mild';

  let worst = severities[0];
  for (let i = 1; i < severities.length; i++) {
    if (compareSeverity(severities[i], worst) > 0) {
      worst = severities[i];
    }
  }
  return worst;
};

export default {
  severityConfigMap,
  urgencyConfigMap,
  getSeverityConfig,
  getUrgencyConfig,
  formatSeverityPercent,
  compareSeverity,
  getWorstSeverity,
};
