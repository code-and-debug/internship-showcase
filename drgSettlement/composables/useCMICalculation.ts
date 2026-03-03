/**
 * CMI（病例组合指数）计算组合式函数
 * 
 * 业务背景：
 * - CMI = 所有病例权重之和 / 病例数
 * - CMI是医院绩效考核核心指标，反映医院收治疑难重症能力
 * - CMI值越高，医保谈判筹码越大
 */

import { computed, type Ref } from 'vue';
import type { ICMICalculation } from '../types';
import { CMI_BENCHMARKS } from '../constants';

/**
 * CMI计算参数
 */
export interface ICMICalculationParams {
  drgWeight: Ref<number>;
  hospitalAvgCMI: Ref<number>;
  nationalAvgCMI?: Ref<number>;
}

/**
 * CMI计算
 * @param params 计算参数
 * @returns CMI分析结果
 */
export function useCMICalculation(params: ICMICalculationParams) {
  const { drgWeight, hospitalAvgCMI, nationalAvgCMI = computed(() => CMI_BENCHMARKS.NATIONAL_AVG) } = params;

  // CMI差异
  const cmiDiff = computed((): number => {
    return drgWeight.value - hospitalAvgCMI.value;
  });

  // 影响评估
  const impact = computed((): ICMICalculation['impact'] => {
    const diff = cmiDiff.value;
    if (diff > CMI_BENCHMARKS.POSITIVE_THRESHOLD) return 'positive';
    if (diff < CMI_BENCHMARKS.NEGATIVE_THRESHOLD) return 'negative';
    return 'neutral';
  });

  // 影响描述
  const impactDescription = computed((): string => {
    const currentWeight = drgWeight.value;
    const hospitalAvg = hospitalAvgCMI.value;
    
    const descriptions = {
      positive: `该病例权重(${currentWeight.toFixed(2)})高于医院平均水平(${hospitalAvg.toFixed(2)})，有助于提升医院CMI值，增强医保谈判筹码`,
      negative: `该病例权重(${currentWeight.toFixed(2)})低于医院平均水平(${hospitalAvg.toFixed(2)})，对医院CMI有轻微下拉作用`,
      neutral: `该病例权重(${currentWeight.toFixed(2)})与医院平均水平(${hospitalAvg.toFixed(2)})相当，对CMI影响中性`,
    };
    
    return descriptions[impact.value];
  });

  // 影响百分比
  const impactPercent = computed((): number => {
    const diff = cmiDiff.value;
    const hospitalAvg = hospitalAvgCMI.value;
    if (hospitalAvg === 0) return 0;
    return Math.round((diff / hospitalAvg) * 100 * 10) / 10;
  });

  // 优化建议
  const optimizationSuggestion = computed((): string => {
    const currentImpact = impact.value;
    
    if (currentImpact === 'positive') {
      return '该病例为复杂病例，建议完整记录并发症信息，确保DRG入组准确，避免"高码低编"导致CMI损失';
    } else if (currentImpact === 'neutral') {
      return '该病例为常规病例，确保诊断信息完整即可';
    } else {
      return '该病例为简单病例，如实际诊疗复杂度高于分组，请检查是否有并发症未记录';
    }
  });

  // 完整分析结果
  const analysis = computed((): ICMICalculation => {
    return {
      currentWeight: drgWeight.value,
      hospitalAvgCMI: hospitalAvgCMI.value,
      nationalAvgCMI: nationalAvgCMI.value,
      cmiDiff: cmiDiff.value,
      impact: impact.value,
      impactDescription: impactDescription.value,
      impactPercent: impactPercent.value,
    };
  });

  // 是否是复杂病例
  const isComplexCase = computed((): boolean => {
    return drgWeight.value > 1.5;
  });

  // 是否有助于提升CMI
  const isPositiveImpact = computed((): boolean => {
    return impact.value === 'positive';
  });

  return {
    analysis,
    cmiDiff,
    impact,
    impactDescription,
    impactPercent,
    optimizationSuggestion,
    isComplexCase,
    isPositiveImpact,
  };
}

/**
 * 批量CMI计算（用于计算医院整体CMI）
 * @param weights 权重列表
 * @returns CMI值
 */
export function calculateBatchCMI(weights: number[]): number {
  if (weights.length === 0) return 0;
  const sum = weights.reduce((acc, w) => acc + w, 0);
  return sum / weights.length;
}

/**
 * 预测CMI变化
 * @param currentCMI 当前CMI
 * @param caseCount 当前病例数
 * @param newWeight 新病例权重
 * @returns 预测的新CMI
 */
export function predictCMIFromNewCase(
  currentCMI: number,
  caseCount: number,
  newWeight: number
): number {
  const totalWeight = currentCMI * caseCount;
  const newTotalWeight = totalWeight + newWeight;
  return newTotalWeight / (caseCount + 1);
}
