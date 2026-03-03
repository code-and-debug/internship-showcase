/**
 * 日期工具函数
 */

import dayjs from 'dayjs';

/**
 * 日期格式
 */
export type DateFormat = 'YYYY-MM-DD' | 'HH:mm:ss' | 'YYYY-MM-DD HH:mm:ss';

/**
 * 格式化日期
 */
export const formatDate = (
  date: string | Date | number,
  format: DateFormat = 'YYYY-MM-DD'
): string => {
  return dayjs(date).format(format);
};

/**
 * 获取时间
 */
export const getTime = (date: string | Date | number): string => {
  return dayjs(date).format('HH:mm:ss');
};

/**
 * 计算日期差
 */
export const getDaysDiff = (
  date1: string | Date,
  date2: string | Date
): number => {
  return dayjs(date1).diff(dayjs(date2), 'day');
};

/**
 * 添加天数
 */
export const addDays = (date: string | Date, days: number): string => {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
};

/**
 * 是否在日期范围内
 */
export const isDateInRange = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const d = dayjs(date);
  return d.isAfter(dayjs(startDate).subtract(1, 'day')) && 
         d.isBefore(dayjs(endDate).add(1, 'day'));
};
