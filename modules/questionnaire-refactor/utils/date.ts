/**
 * 日期工具函数
 * @description 提供日期相关的常用工具函数
 */

/**
 * 计算两个日期之间的天数差
 * @param date1 - 第一个日期
 * @param date2 - 第二个日期
 * @returns 天数差（向上取整，最小为0）
 * 
 * @example
 * ```ts
 * const days = getDaysBetweenDates('2024-01-01', '2024-01-10');
 * console.log(days); // 9
 * ```
 */
export function getDaysBetweenDates(
  date1: string | Date | number,
  date2: string | Date | number
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // 验证日期有效性
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    console.warn('[date.ts] 无效的日期格式:', { date1, date2 });
    return 0;
  }
  
  // 设置时间为当天开始，确保只计算日期差
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param date - 日期
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    console.warn('[date.ts] 无效的日期格式:', date);
    return '';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 获取当前时间戳
 * @returns 时间戳（毫秒）
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * 延迟函数
 * @param ms - 延迟毫秒数
 * @returns Promise
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
