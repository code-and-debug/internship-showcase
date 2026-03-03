/**
 * 特病单议申请组合式函数
 * 
 * 业务背景：
 * - 当DRG费用确实超支时（如复杂并发症），医院可申请特病单议
 * - 申请通过后，该病例可按项目付费，而非DRG打包付费
 */

import { computed, type Ref, ref } from 'vue';
import type { 
  ISpecialCaseApply, 
  ISpecialCaseEligibility, 
  ISettlementDetail,
  SpecialCaseStatus,
  ExcessReasonType,
} from '../types';

/**
 * 特病单议参数
 */
export interface IUseSpecialCaseApplyOptions {
  settlement: Ref<ISettlementDetail>;
}

/**
 * 特病单议申请
 * @param options 参数
 * @returns 申请相关方法和状态
 */
export function useSpecialCaseApply(options: IUseSpecialCaseApplyOptions) {
  const { settlement } = options;

  // 申请表单数据
  const formData = ref<Partial<ISpecialCaseApply>>({
    excessReason: '',
    excessReasonType: 'complication',
    complicationDetails: '',
    supportingDocs: [],
  });

  // 检查申请资格
  const eligibility = computed((): ISpecialCaseEligibility => {
    const data = settlement.value;
    const reasons: string[] = [];
    const suggestions: string[] = [];
    
    // 条件1：费用消耗率 >= 200%
    const costRate = data.costRate || 0;
    if (costRate < 200) {
      reasons.push(`当前费用消耗率为${costRate.toFixed(1)}%，未达到200%的高倍率标准`);
      suggestions.push('费用消耗率未达到特病单议申请标准');
    }
    
    // 条件2：有CC或MCC诊断
    const hasCCOrMCC = data.diagnoses?.some(d => d.isCC || d.isMCC);
    if (!hasCCOrMCC) {
      reasons.push('缺少并发症/合并症诊断，无法说明费用超支的合理性');
      suggestions.push('请医生重新评估患者病情，补充并发症诊断');
    }
    
    // 条件3：费用确实超过支付标准
    if ((data.currentCost || 0) <= (data.paymentStandard || 0)) {
      reasons.push('当前费用未超过DRG支付标准');
    }
    
    // 准备材料清单
    const requiredDocs: string[] = [
      '特病单议申请表（医生填写）',
      '病案首页',
      '入院记录、出院小结',
    ];
    
    if (hasCCOrMCC) {
      requiredDocs.push('并发症诊断依据（检查报告、影像资料）');
      requiredDocs.push('会诊记录');
    }
    
    if (costRate >= 250) {
      requiredDocs.push('费用明细说明（解释超支原因）');
    }

    // 资格通过的建议
    if (reasons.length === 0) {
      suggestions.push('该病例符合特病单议申请条件，建议尽快提交申请');
      suggestions.push('准备充分的诊断依据材料，提高申请通过率');
    }
    
    return {
      eligible: reasons.length === 0,
      reasons,
      suggestions,
      requiredDocs,
    };
  });

  // 是否具备申请资格
  const isEligible = computed((): boolean => eligibility.value.eligible);

  // 计算超额金额
  const excessAmount = computed((): number => {
    const data = settlement.value;
    return Math.max(0, (data.currentCost || data.totalCost || 0) - (data.paymentStandard || 0));
  });

  // 创建申请草稿
  const createDraft = (): Partial<ISpecialCaseApply> => {
    const data = settlement.value;
    return {
      settlementNo: data.settlementNo,
      patientId: '', // 需要从外部传入
      drgCode: data.drgCode || '',
      drgName: data.drgName || '',
      weight: data.weight || 0,
      paymentStandard: data.paymentStandard || 0,
      currentCost: data.currentCost || data.totalCost || 0,
      excessAmount: excessAmount.value,
      costRate: data.costRate || 0,
      status: 'draft',
      supportingDocs: [],
    };
  };

  // 初始化表单
  const initForm = () => {
    const draft = createDraft();
    formData.value = {
      ...draft,
      excessReason: '',
      excessReasonType: 'complication',
      complicationDetails: '',
    };
  };

  // 更新表单字段
  const updateFormField = <K extends keyof ISpecialCaseApply>(
    field: K,
    value: ISpecialCaseApply[K]
  ) => {
    formData.value[field] = value;
  };

  // 添加支持材料
  const addSupportingDoc = (doc: ISpecialCaseApply['supportingDocs'][0]) => {
    if (!formData.value.supportingDocs) {
      formData.value.supportingDocs = [];
    }
    formData.value.supportingDocs.push(doc);
  };

  // 删除支持材料
  const removeSupportingDoc = (docId: string) => {
    if (formData.value.supportingDocs) {
      formData.value.supportingDocs = formData.value.supportingDocs.filter(
        doc => doc.docId !== docId
      );
    }
  };

  // 验证表单
  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const form = formData.value;

    if (!form.excessReason || form.excessReason.trim().length < 10) {
      errors.push('超额原因说明不能少于10个字');
    }

    if (!form.excessReasonType) {
      errors.push('请选择超额原因类型');
    }

    if (form.excessReasonType === 'complication' && 
        (!form.complicationDetails || form.complicationDetails.trim().length < 10)) {
      errors.push('并发症详情说明不能少于10个字');
    }

    if (!form.supportingDocs || form.supportingDocs.length === 0) {
      errors.push('请至少上传一项支持材料');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // 提交申请
  const submitApplication = async (): Promise<{ success: boolean; message: string; applyNo?: string }> => {
    const validation = validateForm();
    if (!validation.valid) {
      return {
        success: false,
        message: validation.errors.join('；'),
      };
    }

    if (!isEligible.value) {
      return {
        success: false,
        message: '该病例不符合特病单议申请条件',
      };
    }

    // 模拟提交
    // 实际项目中这里应该调用API
    const applyNo = `SC${Date.now()}`;
    
    return {
      success: true,
      message: '申请提交成功',
      applyNo,
    };
  };

  return {
    eligibility,
    isEligible,
    excessAmount,
    formData,
    createDraft,
    initForm,
    updateFormField,
    addSupportingDoc,
    removeSupportingDoc,
    validateForm,
    submitApplication,
  };
}

/**
 * 特病单议状态管理
 * @returns 状态管理方法
 */
export function useSpecialCaseStatus() {
  // 申请列表
  const applications = ref<ISpecialCaseApply[]>([]);

  // 加载中
  const loading = ref(false);

  // 加载申请列表
  const loadApplications = async (patientId: string) => {
    loading.value = true;
    try {
      // 实际项目中这里应该调用API
      // const response = await api.getSpecialCaseApplications(patientId);
      // applications.value = response.data;
      applications.value = []; // Mock数据
    } finally {
      loading.value = false;
    }
  };

  // 获取申请详情
  const getApplicationDetail = (applyNo: string): ISpecialCaseApply | undefined => {
    return applications.value.find(app => app.applyNo === applyNo);
  };

  // 根据结算单号获取申请
  const getApplicationBySettlement = (settlementNo: string): ISpecialCaseApply | undefined => {
    return applications.value.find(app => app.settlementNo === settlementNo);
  };

  // 撤销申请
  const cancelApplication = async (applyNo: string): Promise<boolean> => {
    // 实际项目中这里应该调用API
    const app = applications.value.find(a => a.applyNo === applyNo);
    if (app && app.status === 'draft') {
      applications.value = applications.value.filter(a => a.applyNo !== applyNo);
      return true;
    }
    return false;
  };

  return {
    applications,
    loading,
    loadApplications,
    getApplicationDetail,
    getApplicationBySettlement,
    cancelApplication,
  };
}
