/**
 * 智能预问诊模块 - 工具函数导出
 * 
 * 本模块提供以下工具函数：
 * - severity: 严重程度处理
 * - date: 日期处理
 */

// 严重程度相关
export {
  severityConfigMap,
  urgencyConfigMap,
  getSeverityConfig,
  getUrgencyConfig,
  formatSeverityPercent,
  compareSeverity,
  getWorstSeverity,
} from './severity';

// 日期相关
export {
  formatDate,
  formatRelativeTime,
  getWeekFirstDay,
  getDaysBetween,
  formatAssessmentTime,
  formatDuration,
} from './date';
