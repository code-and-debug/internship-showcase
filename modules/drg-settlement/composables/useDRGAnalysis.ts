/**
 * DRG费用分析组合式函数
 * 
 * 业务背景：
 * - 计算费用消耗率，判断预警级别
 * - 识别病例类型（普通/高倍率/低倍率）
 * - 提供优化建议
 */

import { computed, type Ref, ref } from 'vue';
import type { IDRGAnalysisResult, IDRGAnalysisParams, CaseType, WarningLevel } from '../types';
import { calculateCostRate, getCaseType, getWarningLevel } from '../utils';

export interface IUseDRGAnalysisOptions {
  drgCode: Ref<string>;
  drgName: Ref<string>;
  weight: Ref<number>;
  paymentStandard: Ref<number>;
  currentCost: Ref<number>;
}

/**
 * DRG费用分析
 * @param options 分析参数
 * @returns 分析结果和方法
 */
export function useDRGAnalysis(options: IUseDRGAnalysisOptions) {
  const { drgCode, drgName, weight, paymentStandard, currentCost } = options;

  // 计算费用消耗率
  const costRate = computed((): number => {
    return calculateCostRate(currentCost.value, paymentStandard.value);
  });

  // 判断病例类型
  const caseType = computed((): CaseType => {
    return getCaseType(currentCost.value, paymentStandard.value);
  });

  // 获取预警级别
  const warningLevel = computed((): WarningLevel => {
    return getWarningLevel(costRate.value);
  });

  // 获取预警说明
  const warningDescription = computed((): string => {
    const descriptions = {
      safe: '费用消耗正常，医院可获得结余',
      warning: '费用消耗接近支付标准，建议关注费用结构',
      danger: '已超支，医院面临DRG亏损，建议调整诊疗方案或申请特病单议',
    };
    return descriptions[warningLevel.value];
  });

  // 获取优化建议
  const suggestions = computed((): string[] => {
    const result: string[] = [];
    const rate = costRate.value;
    
    if (caseType.value === 'high') {
      result.push(`该病例为高倍率病例，费用超过DRG支付标准200%（实际${rate.toFixed(1)}%）`);
      result.push('建议准备充分的诊断依据，应对可能的医保飞检');
      result.push('如确有特殊原因，可申请特病单议按项目付费');
    } else if (caseType.value === 'low') {
      result.push('该病例为低倍率病例，医院可获得更多结余');
      result.push('建议优化诊疗流程，在保证质量的前提下降低不必要费用');
    } else {
      if (rate >= 80) {
        result.push('费用消耗接近支付标准，建议关注费用结构');
        result.push('检查是否有可优化的诊疗项目');
      } else {
        result.push('费用控制良好，医院可获得结余收益');
      }
    }
    
    return result;
  });

  // 计算DRG结余
  const balance = computed((): number => {
    return paymentStandard.value - currentCost.value;
  });

  // 完整分析结果
  const analysis = computed((): IDRGAnalysisResult => {
    return {
      drgCode: drgCode.value,
      drgName: drgName.value,
      weight: weight.value,
      paymentStandard: paymentStandard.value,
      currentCost: currentCost.value,
      costRate: costRate.value,
      caseType: caseType.value,
      warningLevel: warningLevel.value,
      warningDescription: warningDescription.value,
      suggestions: suggestions.value,
    };
  });

  return {
    analysis,
    costRate,
    caseType,
    warningLevel,
    warningDescription,
    suggestions,
    balance,
  };
}

/**
 * 简化的DRG分析（传入单个对象）
 * @param params 分析参数对象
 * @returns 分析结果
 */
export function useDRGAnalysisSimple(params: Ref<IDRGAnalysisParams>) {
  const drgCode = computed(() => params.value.drgCode);
  const drgName = computed(() => params.value.drgName);
  const weight = computed(() => params.value.weight);
  const paymentStandard = computed(() => params.value.paymentStandard);
  const currentCost = computed(() => params.value.currentCost);

  return useDRGAnalysis({
    drgCode: ref(drgCode.value),
    drgName: ref(drgName.value),
    weight: ref(weight.value),
    paymentStandard: ref(paymentStandard.value),
    currentCost: ref(currentCost.value),
  });
}
