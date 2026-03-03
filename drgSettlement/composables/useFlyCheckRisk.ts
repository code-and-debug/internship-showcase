/**
 * 飞检风险评估组合式函数
 * 
 * 业务背景：
 * - DRG付费下，医保局会定期对医院进行飞检
 * - 高倍率病例（>200%）是飞检的重点审查对象
 * - 需要提前识别风险并准备应对材料
 */

import { computed, type Ref } from 'vue';
import type { IFlyCheckRisk, RiskLevel, ISettlementDetail, IRiskFactors } from '../types';
import { calculateRiskScore, getRiskLevel, calculateDrugRatio } from '../utils';

/**
 * 飞检风险评估
 * @param settlement 结算详情
 * @returns 评估结果
 */
export function useFlyCheckRisk(settlement: Ref<ISettlementDetail>) {
  // 检查诊断与费用不匹配
  const checkDiagnosisMismatch = (data: ISettlementDetail): boolean => {
    return (data.costRate || 0) > 150 && !data.diagnoses?.some(d => d.isMCC);
  };

  // 检查重复检查
  const checkRepeatedExam = (data: ISettlementDetail): boolean => {
    const examItems = data.costDetails?.filter(item => item.category === 'exam') || [];
    const examNames = examItems.map(item => item.itemName);
    const uniqueExams = new Set(examNames);
    return examNames.length > uniqueExams.size * 1.5;
  };

  // 检查是否有关键诊断依据
  const hasKeyDocumentation = (data: ISettlementDetail): boolean => {
    const keyExams = ['CT', 'MRI', '病理', '核磁共振'];
    return data.costDetails?.some(item => 
      keyExams.some(exam => item.itemName.includes(exam))
    ) || false;
  };

  // 风险因素
  const riskFactors = computed((): IRiskFactors => {
    const data = settlement.value;
    
    return {
      // 高倍率病例：费用超过DRG支付标准200%
      highRateCase: (data.costRate || 0) >= 200,
      
      // 诊断与费用不匹配：费用消耗率高但没有MCC诊断
      diagnosisMismatch: checkDiagnosisMismatch(data),
      
      // 药品使用异常：药占比超过50%
      excessiveDrugUse: calculateDrugRatio(data.costDetails || []) > 50,
      
      // 重复检查
      repeatedExam: checkRepeatedExam(data),
      
      // 诊断依据不足
      lackOfDocumentation: !hasKeyDocumentation(data),
    };
  });

  // 风险分数
  const riskScore = computed((): number => {
    return calculateRiskScore(riskFactors.value);
  });

  // 风险等级
  const riskLevel = computed((): RiskLevel => {
    return getRiskLevel(riskScore.value);
  });

  // 生成规避建议
  const suggestions = computed((): string[] => {
    const factors = riskFactors.value;
    const result: string[] = [];
    
    if (factors.highRateCase) {
      result.push('该病例为高倍率病例，费用超过DRG支付标准200%，属于飞检重点审查对象');
      result.push('建议提前准备充分的诊断依据，包括检查报告、会诊记录等');
      result.push('如确有特殊原因导致费用超支，可申请特病单议');
    }
    
    if (factors.diagnosisMismatch) {
      result.push('诊断与费用存在不匹配，建议检查是否有并发症未记录');
      result.push('请医生重新评估患者病情，确保诊断信息完整');
    }
    
    if (factors.excessiveDrugUse) {
      result.push('药品占比较高，需确保所有药品使用均有明确医嘱和病程记录');
      result.push('建议核查高价药品的使用指征和疗程记录');
    }
    
    if (factors.lackOfDocumentation) {
      result.push('诊断依据材料不完整，建议补充相关检查报告');
      result.push('确保关键诊断有影像学或实验室检查支持');
    }
    
    if (factors.repeatedExam) {
      result.push('存在重复检查情况，需说明临床必要性');
    }
    
    if (result.length === 0) {
      result.push('该病例风险较低，建议继续保持规范的诊疗记录');
    }
    
    return result;
  });

  // 需要准备的材料
  const requiredDocuments = computed((): string[] => {
    const data = settlement.value;
    const documents: string[] = [
      '病案首页',
      '入院记录',
      '出院小结',
    ];
    
    if (data.diagnoses?.some(d => d.isMCC || d.isCC)) {
      documents.push('并发症诊断依据（检查报告、影像资料）');
      documents.push('会诊记录');
    }
    
    if (calculateDrugRatio(data.costDetails || []) > 40) {
      documents.push('药品使用病程记录');
      documents.push('药品医嘱单');
    }
    
    if (data.costRate && data.costRate >= 200) {
      documents.push('特病单议申请表（如需申请）');
    }
    
    return documents;
  });

  // 完整评估结果
  const assessment = computed((): IFlyCheckRisk => {
    return {
      riskLevel: riskLevel.value,
      riskScore: riskScore.value,
      riskFactors: riskFactors.value,
      suggestions: suggestions.value,
      requiredDocuments: requiredDocuments.value,
    };
  });

  return {
    assessment,
    riskLevel,
    riskScore,
    riskFactors,
    suggestions,
    requiredDocuments,
    isHighRisk: computed(() => riskLevel.value === 'high'),
    isMediumRisk: computed(() => riskLevel.value === 'medium'),
    isLowRisk: computed(() => riskLevel.value === 'low'),
  };
}
