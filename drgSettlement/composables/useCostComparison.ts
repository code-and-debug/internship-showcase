/**
 * 费用对比分析组合式函数
 * 
 * 功能：
 * - 与同DRG组平均费用对比
 * - 与医院平均费用对比
 * - 与地区平均费用对比
 * - 百分位排名分析
 */

import { computed, type Ref, ref } from 'vue';
import type { ICostComparison } from '../types';

/**
 * 费用对比参数
 */
export interface IUseCostComparisonOptions {
  currentCost: Ref<number>;
  drgPaymentStandard?: Ref<number>;
  sameDRGAvgCost?: Ref<number>;
  sameHospitalAvgCost?: Ref<number>;
  regionAvgCost?: Ref<number>;
}

/**
 * 费用对比分析
 * @param options 对比参数
 * @returns 对比结果
 */
export function useCostComparison(options: IUseCostComparisonOptions) {
  const {
    currentCost,
    drgPaymentStandard = ref(0),
    sameDRGAvgCost = ref(0),
    sameHospitalAvgCost = ref(0),
    regionAvgCost = ref(0),
  } = options;

  // 与DRG支付标准对比
  const compareWithDRG = computed((): { diff: number; percent: number; status: string } => {
    const standard = drgPaymentStandard.value;
    if (!standard || standard === 0) {
      return { diff: 0, percent: 0, status: '无法对比' };
    }
    const diff = currentCost.value - standard;
    const percent = (diff / standard) * 100;
    let status = '持平';
    if (diff > 0) status = `高于标准 ${percent.toFixed(1)}%`;
    if (diff < 0) status = `低于标准 ${Math.abs(percent).toFixed(1)}%`;
    return { diff, percent, status };
  });

  // 与同DRG组平均对比
  const compareWithSameDRG = computed((): { diff: number; percent: number; status: string } => {
    const avg = sameDRGAvgCost.value;
    if (!avg || avg === 0) {
      return { diff: 0, percent: 0, status: '暂无数据' };
    }
    const diff = currentCost.value - avg;
    const percent = (diff / avg) * 100;
    let status = '持平';
    if (diff > 0) status = `高于平均 ${percent.toFixed(1)}%`;
    if (diff < 0) status = `低于平均 ${Math.abs(percent).toFixed(1)}%`;
    return { diff, percent, status };
  });

  // 与医院平均对比
  const compareWithHospital = computed((): { diff: number; percent: number; status: string } => {
    const avg = sameHospitalAvgCost.value;
    if (!avg || avg === 0) {
      return { diff: 0, percent: 0, status: '暂无数据' };
    }
    const diff = currentCost.value - avg;
    const percent = (diff / avg) * 100;
    let status = '持平';
    if (diff > 0) status = `高于本院平均 ${percent.toFixed(1)}%`;
    if (diff < 0) status = `低于本院平均 ${Math.abs(percent).toFixed(1)}%`;
    return { diff, percent, status };
  });

  // 与地区平均对比
  const compareWithRegion = computed((): { diff: number; percent: number; status: string } => {
    const avg = regionAvgCost.value;
    if (!avg || avg === 0) {
      return { diff: 0, percent: 0, status: '暂无数据' };
    }
    const diff = currentCost.value - avg;
    const percent = (diff / avg) * 100;
    let status = '持平';
    if (diff > 0) status = `高于地区平均 ${percent.toFixed(1)}%`;
    if (diff < 0) status = `低于地区平均 ${Math.abs(percent).toFixed(1)}%`;
    return { diff, percent, status };
  });

  // 综合对比结果（文本）
  const comparisonResult = computed((): string => {
    const drgComparison = compareWithDRG.value;
    if (drgComparison.percent > 50) {
      return '费用显著高于DRG支付标准，建议优化诊疗方案或申请特病单议';
    }
    if (drgComparison.percent < -30) {
      return '费用低于DRG支付标准较多，医院可获得较好结余';
    }
    if (Math.abs(drgComparison.percent) <= 10) {
      return '费用与DRG支付标准基本持平，费用控制合理';
    }
    return '费用与DRG支付标准存在差距，建议关注费用结构';
  });

  // 百分位排名（模拟）
  const percentile = computed((): number => {
    const avg = sameDRGAvgCost.value;
    if (!avg || avg === 0) return 50;
    // 简化的百分位计算
    const ratio = currentCost.value / avg;
    // 假设费用分布符合正态分布，平均值为50百分位
    const percentileValue = Math.min(99, Math.max(1, 50 + (ratio - 1) * 50));
    return Math.round(percentileValue);
  });

  // 建议
  const suggestions = computed((): string[] => {
    const result: string[] = [];
    const drgDiff = compareWithDRG.value.diff;
    
    if (drgDiff > 0) {
      result.push('当前费用超过DRG支付标准，建议核查高价药品和材料的使用必要性');
      result.push('优化检查项目，避免重复检查');
      if (drgDiff > drgPaymentStandard.value * 0.5) {
        result.push('费用超支较多，如确有特殊原因，建议申请特病单议');
      }
    } else if (drgDiff < -drgPaymentStandard.value * 0.3) {
      result.push('费用控制良好，医院可获得较好结余收益');
      result.push('建议继续保持合理的诊疗方案');
    } else {
      result.push('费用控制基本合理，建议继续保持');
    }
    
    const sameDRGDiff = compareWithSameDRG.value.diff;
    if (sameDRGDiff > 0) {
      result.push(`费用高于同DRG组平均${compareWithSameDRG.value.percent.toFixed(1)}%，建议参考同组优秀案例`);
    }
    
    return result;
  });

  // 完整分析结果
  const analysis = computed((): ICostComparison => {
    return {
      currentCost: currentCost.value,
      drgPaymentStandard: drgPaymentStandard.value,
      sameDRGAvgCost: sameDRGAvgCost.value,
      sameHospitalAvgCost: sameHospitalAvgCost.value,
      regionAvgCost: regionAvgCost.value,
      percentile: percentile.value,
      comparisonResult: comparisonResult.value,
      suggestions: suggestions.value,
    };
  });

  return {
    analysis,
    compareWithDRG,
    compareWithSameDRG,
    compareWithHospital,
    compareWithRegion,
    comparisonResult,
    percentile,
    suggestions,
  };
}

/**
 * 计算百分位排名
 * @param value 当前值
 * @param sortedValues 已排序的所有值（升序）
 * @returns 百分位排名（0-100）
 */
export function calculatePercentile(value: number, sortedValues: number[]): number {
  if (sortedValues.length === 0) return 50;
  
  let count = 0;
  for (const v of sortedValues) {
    if (v <= value) count++;
  }
  
  return Math.round((count / sortedValues.length) * 100);
}
