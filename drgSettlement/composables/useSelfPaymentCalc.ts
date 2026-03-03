/**
 * 自付金额计算组合式函数
 * 
 * 计算公式：
 * 1. 乙类项目自付 = 乙类费用 × 乙类自付比例
 * 2. 可报销费用 = 总费用 - 起付线 - 丙类费用 - 乙类自付
 * 3. 报销金额 = min(可报销费用 × 报销比例, 封顶线 - 已用额度)
 * 4. 自付金额 = 总费用 - 报销金额
 */

import { computed, type Ref, ref } from 'vue';
import type { ISelfPaymentResult, ISelfPaymentParams } from '../types';
import { DEFAULT_INSURANCE_PARAMS } from '../constants';

/**
 * 自付金额计算参数
 */
export interface IUseSelfPaymentCalcOptions {
  totalCost: Ref<number>;
  deductible?: Ref<number>;
  reimbursementRate?: Ref<number>;
  personalCap?: Ref<number>;
  usedCap?: Ref<number>;
  classBCost?: Ref<number>;
  classBRate?: Ref<number>;
  classCCost?: Ref<number>;
}

/**
 * 自付金额计算
 * @param options 计算参数
 * @returns 计算结果
 */
export function useSelfPaymentCalc(options: IUseSelfPaymentCalcOptions) {
  const {
    totalCost,
    deductible = ref(DEFAULT_INSURANCE_PARAMS.DEDUCTIBLE),
    reimbursementRate = ref(DEFAULT_INSURANCE_PARAMS.REIMBURSEMENT_RATE),
    personalCap = ref(DEFAULT_INSURANCE_PARAMS.PERSONAL_CAP),
    usedCap = ref(0),
    classBCost = ref(0),
    classBRate = ref(DEFAULT_INSURANCE_PARAMS.CLASS_B_RATE),
    classCCost = ref(0),
  } = options;

  // 乙类项目自付部分
  const classBSelfPay = computed((): number => {
    return classBCost.value * classBRate.value;
  });

  // 可报销费用基数
  const reimbursableCost = computed((): number => {
    return Math.max(0, 
      totalCost.value - deductible.value - classCCost.value - classBSelfPay.value
    );
  });

  // 年度剩余限额
  const personalCapRemaining = computed((): number => {
    return Math.max(0, personalCap.value - usedCap.value);
  });

  // 报销金额
  const reimbursementAmount = computed((): number => {
    return Math.min(
      reimbursableCost.value * reimbursementRate.value,
      personalCapRemaining.value
    );
  });

  // 自付金额
  const selfPayAmount = computed((): number => {
    return totalCost.value - reimbursementAmount.value;
  });

  // 起付线金额（不能超过总费用）
  const deductibleAmount = computed((): number => {
    return Math.min(deductible.value, totalCost.value);
  });

  // 报销后年度剩余额度
  const remainingCapAfterReimbursement = computed((): number => {
    return personalCapRemaining.value - reimbursementAmount.value;
  });

  // 报销比例（实际）
  const actualReimbursementRate = computed((): number => {
    if (totalCost.value === 0) return 0;
    return reimbursementAmount.value / totalCost.value;
  });

  // 计算结果
  const result = computed((): ISelfPaymentResult => {
    return {
      deductibleAmount: deductibleAmount.value,
      classCCost: classCCost.value,
      classBSelfPay: classBSelfPay.value,
      reimbursableCost: reimbursableCost.value,
      reimbursementAmount: reimbursementAmount.value,
      selfPayAmount: selfPayAmount.value,
      personalCapRemaining: remainingCapAfterReimbursement.value,
      note: '以上为参考计算，实际报销金额以医保局结算为准。',
    };
  });

  return {
    result,
    classBSelfPay,
    reimbursableCost,
    personalCapRemaining,
    reimbursementAmount,
    selfPayAmount,
    actualReimbursementRate,
    remainingCap: remainingCapAfterReimbursement,
  };
}

/**
 * 简化的自付计算（一次性传入参数）
 * @param params 计算参数
 * @returns 计算结果
 */
export function calculateSelfPayment(params: ISelfPaymentParams): ISelfPaymentResult {
  const {
    totalCost,
    deductible,
    reimbursementRate,
    personalCap,
    usedCap = 0,
    classBCost = 0,
    classBRate = DEFAULT_INSURANCE_PARAMS.CLASS_B_RATE,
    classCCost = 0,
  } = params;

  // 1. 计算乙类项目自付部分
  const classBSelfPay = classBCost * classBRate;
  
  // 2. 计算可报销费用基数
  const reimbursableCost = Math.max(0, 
    totalCost - deductible - classCCost - classBSelfPay
  );
  
  // 3. 计算年度剩余限额
  const personalCapRemaining = Math.max(0, personalCap - usedCap);
  
  // 4. 计算报销金额
  const reimbursementAmount = Math.min(
    reimbursableCost * reimbursementRate,
    personalCapRemaining
  );
  
  // 5. 自付金额
  const selfPayAmount = totalCost - reimbursementAmount;

  return {
    deductibleAmount: Math.min(deductible, totalCost),
    classCCost,
    classBSelfPay,
    reimbursableCost,
    reimbursementAmount,
    selfPayAmount,
    personalCapRemaining: personalCapRemaining - reimbursementAmount,
    note: '以上为参考计算，实际报销金额以医保局结算为准。',
  };
}
