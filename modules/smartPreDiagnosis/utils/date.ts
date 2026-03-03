/**
 * ============================================================================
 * 智能预问诊模块 - 日期处理工具函数
 * ============================================================================
 * 
 * 本文件提供日期相关的工具函数。
 * ============================================================================
 */

/**
 * 格式化日期为友好显示
 * 
 * @param date - 日期字符串或Date对象
 * @param format - 格式化模板
 * @returns 格式化后的日期字符串
 * 
 * @example
 * formatDate('2024-01-15 10:30:00', 'YYYY-MM-DD');
 * // '2024-01-15'
 * 
 * formatDate('2024-01-15 10:30:00', 'MM月DD日 HH:mm');
 * // '1月15日 10:30'
 */
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();

  const formatMap: Record<string, string | number> = {
    'YYYY': year,
    'MM': month.toString().padStart(2, '0'),
    'M': month,
    'DD': day.toString().padStart(2, '0'),
    'D': day,
    'HH': hour.toString().padStart(2, '0'),
    'H': hour,
    'mm': minute.toString().padStart(2, '0'),
    'm': minute,
    'ss': second.toString().padStart(2, '0'),
    's': second,
  };

  return format.replace(/(YYYY|MM|M|DD|D|HH|H|mm|m|ss|s)/g, (match) =>
    String(formatMap[match])
  );
};

/**
 * 格式化时间为"今天"、"昨天"等友好显示
 * 
 * @param date - 日期字符串或Date对象
 * @returns 友好时间显示
 * 
 * @example
 * formatRelativeTime('2024-01-15 10:30:00');
 * // '1月15日 10:30'
 * 
 * formatRelativeTime(new Date());
 * // '刚刚'
 */
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  // 刚刚（1分钟内）
  if (diff < minute) {
    return '刚刚';
  }

  // 几分钟前
  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}分钟前`;
  }

  // 几小时前
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}小时前`;
  }

  // 今天
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (targetDay.getTime() === today.getTime()) {
    return `今天 ${formatDate(d, 'HH:mm')}`;
  }

  // 昨天
  const yesterday = new Date(today.getTime() - day);
  if (targetDay.getTime() === yesterday.getTime()) {
    return `昨天 ${formatDate(d, 'HH:mm')}`;
  }

  // 7天内
  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days}天前`;
  }

  // 更早
  return formatDate(d, 'MM月DD日 HH:mm');
};

/**
 * 获取日期所在周的第一天（周一）
 * 
 * @param date - 日期对象
 * @returns 周一日期
 * 
 * @example
 * const monday = getWeekFirstDay(new Date('2024-01-15'));
 * // 2024-01-15 是周一，返回当天的日期
 */
export const getWeekFirstDay = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 周一为第一天
  d.setDate(d.getDate() + diff);
  return d;
};

/**
 * 获取日期区间的天数
 * 
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @returns 天数
 * 
 * @example
 * const days = getDaysBetween('2024-01-01', '2024-01-15');
 * // 15
 */
export const getDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
};

/**
 * 格式化评估时间
 * 
 * @param dateStr - 日期字符串
 * @returns 格式化后的评估时间
 * 
 * @example
 * formatAssessmentTime('2024-01-15 10:30:00');
 * // '2024年1月15日 10:30'
 */
export const formatAssessmentTime = (dateStr: string): string => {
  return formatDate(dateStr, 'YYYY年MM月DD日 HH:mm');
};

/**
 * 格式化时长
 * 
 * @param duration - 时长（秒）
 * @returns 格式化后的时长
 * 
 * @example
 * formatDuration(125);
 * // '2分5秒'
 */
export const formatDuration = (duration: number): string => {
  if (duration < 60) {
    return `${duration}秒`;
  }

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  if (minutes < 60) {
    return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}小时${remainingMinutes}分钟`
    : `${hours}小时`;
};

export default {
  formatDate,
  formatRelativeTime,
  getWeekFirstDay,
  getDaysBetween,
  formatAssessmentTime,
  formatDuration,
};
