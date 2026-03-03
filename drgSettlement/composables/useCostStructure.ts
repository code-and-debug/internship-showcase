/**
 * 费用结构分析组合式函数
 * 
 * 功能：
 * - 费用类别占比分析
 * - 费用趋势分析
 * - 费用异常检测
 */

import { computed, type Ref, ref } from 'vue';
import type { ICostDetail, CostCategory } from '../types';
import { calculateCostRatio, calculateDrugRatio, calculateExamRatio } from '../utils';

/**
 * 费用类别统计
 */
export interface ICostCategoryStat {
  category: CostCategory;
  label: string;
  amount: number;
  ratio: number;
  color: string;
}

/**
 * 费用结构分析参数
 */
export interface IUseCostStructureOptions {
  costDetails: Ref<ICostDetail[]>;
}

/**
 * 费用结构分析
 * @param options 参数
 * @returns 分析结果
 */
export function useCostStructure(options: IUseCostStructureOptions) {
  const { costDetails } = options;

  // 总费用
  const totalCost = computed((): number => {
    return costDetails.value.reduce((sum, item) => sum + item.amount, 0);
  });

  // 各费用类别统计
  const categoryStats = computed((): ICostCategoryStat[] => {
    const total = totalCost.value;
    if (total === 0) return [];

    const categories: CostCategory[] = ['drug', 'exam', 'surgery', 'treatment', 'material', 'other'];
    const categoryLabels: Record<CostCategory, string> = {
      drug: '药品费',
      exam: '检查费',
      surgery: '手术费',
      treatment: '治疗费',
      material: '材料费',
      other: '其他',
    };
    const categoryColors: Record<CostCategory, string> = {
      drug: '#722ed1',
      exam: '#13c2c2',
      surgery: '#eb2f96',
      treatment: '#1890ff',
      material: '#fa8c16',
      other: '#8c8c8c',
    };

    return categories.map(category => {
      const amount = costDetails.value
        .filter(item => item.category === category)
        .reduce((sum, item) => sum + item.amount, 0);
      
      return {
        category,
        label: categoryLabels[category],
        amount,
        ratio: total > 0 ? amount / total : 0,
        color: categoryColors[category],
      };
    }).sort((a, b) => b.amount - a.amount); // 按金额降序
  });

  // 药品占比
  const drugRatio = computed((): number => {
    return calculateDrugRatio(costDetails.value) / 100;
  });

  // 检查占比
  const examRatio = computed((): number => {
    return calculateExamRatio(costDetails.value) / 100;
  });

  // 药占比警告
  const drugRatioWarning = computed((): boolean => {
    return drugRatio.value > 0.5; // 药占比超过50%警告
  });

  // 检查占比警告
  const examRatioWarning = computed((): boolean => {
    return examRatio.value > 0.4; // 检查占比超过40%警告
  });

  // 费用异常检测
  const anomalies = computed((): { item: ICostDetail; reason: string }[] => {
    const result: { item: ICostDetail; reason: string }[] = [];
    
    // 检测单价异常高的项目
    const avgUnitPrice = costDetails.value.reduce((sum, item) => sum + item.unitPrice, 0) 
      / (costDetails.value.length || 1);
    
    costDetails.value.forEach(item => {
      if (item.unitPrice > avgUnitPrice * 10) {
        result.push({
          item,
          reason: '单价显著高于平均',
        });
      }
    });
    
    return result;
  });

  // 费用明细（按金额降序）
  const sortedCostDetails = computed((): ICostDetail[] => {
    return [...costDetails.value].sort((a, b) => b.amount - a.amount);
  });

  // 前N项费用
  const topNCostItems = (n: number): ICostDetail[] => {
    return sortedCostDetails.value.slice(0, n);
  };

  // 获取某类别的费用明细
  const getCategoryDetails = (category: CostCategory): ICostDetail[] => {
    return costDetails.value.filter(item => item.category === category);
  };

  return {
    totalCost,
    categoryStats,
    drugRatio,
    examRatio,
    drugRatioWarning,
    examRatioWarning,
    anomalies,
    sortedCostDetails,
    topNCostItems,
    getCategoryDetails,
  };
}

/**
 * 费用趋势分析
 * @param dailyCosts 每日费用列表
 * @returns 趋势分析结果
 */
export function useCostTrend(dailyCosts: Ref<{ date: string; amount: number }[]>) {
  // 总天数
  const totalDays = computed((): number => dailyCosts.value.length);

  // 日均费用
  const avgDailyCost = computed((): number => {
    if (totalDays.value === 0) return 0;
    const total = dailyCosts.value.reduce((sum, item) => sum + item.amount, 0);
    return total / totalDays.value;
  });

  // 最高日费用
  const maxDailyCost = computed((): { date: string; amount: number } | null => {
    if (dailyCosts.value.length === 0) return null;
    return dailyCosts.value.reduce((max, item) => 
      item.amount > max.amount ? item : max
    );
  });

  // 最低日费用
  const minDailyCost = computed((): { date: string; amount: number } | null => {
    if (dailyCosts.value.length === 0) return null;
    return dailyCosts.value.reduce((min, item) => 
      item.amount < min.amount ? item : min
    );
  });

  // 费用趋势（上升/下降/平稳）
  const trend = computed((): 'up' | 'down' | 'stable' => {
    if (dailyCosts.value.length < 3) return 'stable';
    
    const first = dailyCosts.value[0].amount;
    const last = dailyCosts.value[dailyCosts.value.length - 1].amount;
    const diff = last - first;
    const avg = avgDailyCost.value;
    
    if (Math.abs(diff) < avg * 0.2) return 'stable';
    return diff > 0 ? 'up' : 'down';
  });

  return {
    totalDays,
    avgDailyCost,
    maxDailyCost,
    minDailyCost,
    trend,
  };
}
