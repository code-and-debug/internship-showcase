/**
 * 病案复印管理组合式函数
 * 
 * 功能：
 * - 病案复印申请
 * - 进度查询
 * - 与医保结算关联
 */

import { computed, type Ref, ref } from 'vue';
import type { 
  IMedicalCopyItem, 
  IInpatientRecord,
  ICopyContentOption,
  CopyType,
  CopyStatus,
  ICopySettlementInfo,
} from '../types';
import { COPY_CONTENT_OPTIONS, COPY_STATUS_CONFIG } from '../constants';

/**
 * 病案复印参数
 */
export interface IUseMedicalCopyOptions {
  patientId: Ref<string>;
}

/**
 * 病案复印申请
 * @param options 参数
 * @returns 申请相关方法和状态
 */
export function useMedicalCopy(options: IUseMedicalCopyOptions) {
  const { patientId } = options;

  // 申请列表
  const applications = ref<IMedicalCopyItem[]>([]);
  
  // 加载中
  const loading = ref(false);

  // 申请表单
  const formData = ref({
    copyType: 'inpatient' as CopyType,
    selectedContents: [] as string[],
    inpatientNo: '',
    copyCount: 1,
    receiveType: 'express' as 'express' | 'self',
    receiveAddress: '',
    contactName: '',
    contactPhone: '',
  });

  // 复印内容选项
  const contentOptions = computed((): ICopyContentOption[] => COPY_CONTENT_OPTIONS);

  // 计算预估费用
  const estimatedCost = computed((): number => {
    const contentCost = formData.value.selectedContents.reduce((sum, contentValue) => {
      const option = COPY_CONTENT_OPTIONS.find(opt => opt.value === contentValue);
      return sum + (option?.price || 0);
    }, 0);
    const expressFee = formData.value.receiveType === 'express' ? 15 : 0;
    return (contentCost + expressFee) * formData.value.copyCount;
  });

  // 加载申请列表
  const loadApplications = async () => {
    loading.value = true;
    try {
      // 实际项目中这里应该调用API
      // const response = await api.getMedicalCopyApplications(patientId.value);
      // applications.value = response.data;
      applications.value = []; // Mock数据
    } finally {
      loading.value = false;
    }
  };

  // 根据ID获取申请
  const getApplicationById = (expressId: string): IMedicalCopyItem | undefined => {
    return applications.value.find(app => app.expressId === expressId);
  };

  // 选择/取消选择复印内容
  const toggleContent = (contentValue: string) => {
    const index = formData.value.selectedContents.indexOf(contentValue);
    if (index > -1) {
      formData.value.selectedContents.splice(index, 1);
    } else {
      formData.value.selectedContents.push(contentValue);
    }
  };

  // 设置住院记录
  const setInpatientRecord = (inpatientNo: string) => {
    formData.value.inpatientNo = inpatientNo;
  };

  // 验证表单
  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const form = formData.value;

    if (!form.inpatientNo) {
      errors.push('请选择住院记录');
    }

    if (form.selectedContents.length === 0) {
      errors.push('请至少选择一项复印内容');
    }

    if (form.copyCount < 1 || form.copyCount > 5) {
      errors.push('复印份数应在1-5份之间');
    }

    if (form.receiveType === 'express') {
      if (!form.receiveAddress || form.receiveAddress.trim().length < 5) {
        errors.push('请填写完整的收件地址');
      }
    }

    if (!form.contactName || form.contactName.trim().length < 2) {
      errors.push('请填写联系人姓名');
    }

    if (!form.contactPhone || !/^1[3-9]\d{9}$/.test(form.contactPhone)) {
      errors.push('请填写正确的联系电话');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // 提交申请
  const submitApplication = async (): Promise<{ success: boolean; message: string; expressId?: string }> => {
    const validation = validateForm();
    if (!validation.valid) {
      return {
        success: false,
        message: validation.errors.join('；'),
      };
    }

    // 模拟提交
    const expressId = `MC${Date.now()}`;
    const newApplication: IMedicalCopyItem = {
      expressId,
      applyNo: `BA${Date.now()}`,
      applyTime: new Date().toISOString(),
      copyType: formData.value.copyType,
      copyContent: formData.value.selectedContents,
      copyCount: formData.value.copyCount,
      status: 'pending',
      estimatedCost: estimatedCost.value,
    };

    applications.value.unshift(newApplication);
    
    return {
      success: true,
      message: '申请提交成功',
      expressId,
    };
  };

  // 重置表单
  const resetForm = () => {
    formData.value = {
      copyType: 'inpatient',
      selectedContents: [],
      inpatientNo: '',
      copyCount: 1,
      receiveType: 'express',
      receiveAddress: '',
      contactName: '',
      contactPhone: '',
    };
  };

  // 获取状态配置
  const getStatusConfig = (status: CopyStatus) => {
    return COPY_STATUS_CONFIG[status];
  };

  return {
    applications,
    loading,
    formData,
    contentOptions,
    estimatedCost,
    loadApplications,
    getApplicationById,
    toggleContent,
    setInpatientRecord,
    validateForm,
    submitApplication,
    resetForm,
    getStatusConfig,
  };
}

/**
 * 住院记录管理
 * @param patientId 患者ID
 * @returns 住院记录管理方法
 */
export function useInpatientRecords(patientId: Ref<string>) {
  // 住院记录列表
  const records = ref<IInpatientRecord[]>([]);
  
  // 加载中
  const loading = ref(false);

  // 加载住院记录
  const loadRecords = async () => {
    loading.value = true;
    try {
      // 实际项目中这里应该调用API
      // const response = await api.getInpatientRecords(patientId.value);
      // records.value = response.data;
      records.value = []; // Mock数据
    } finally {
      loading.value = false;
    }
  };

  // 获取未出院的记录
  const activeRecords = computed((): IInpatientRecord[] => {
    return records.value.filter(r => !r.isDischarged);
  });

  // 获取已出院的记录
  const dischargedRecords = computed((): IInpatientRecord[] => {
    return records.value.filter(r => r.isDischarged);
  });

  // 根据住院号获取记录
  const getRecordByNo = (inpatientNo: string): IInpatientRecord | undefined => {
    return records.value.find(r => r.inpatientNo === inpatientNo);
  };

  return {
    records,
    loading,
    activeRecords,
    dischargedRecords,
    loadRecords,
    getRecordByNo,
  };
}

/**
 * 病案复印与结算关联
 * @param settlementInfo 结算信息
 * @returns 关联提示
 */
export function useMedicalCopySettlementTips(settlementInfo?: Ref<ICopySettlementInfo | undefined>) {
  // 是否需要提示
  const showTips = computed((): boolean => {
    if (!settlementInfo?.value) return false;
    const info = settlementInfo.value;
    // 高倍率病例或存在飞检风险时提示
    return info.caseType === 'high' || info.flyCheckRisk === 'high' || info.flyCheckRisk === 'medium';
  });

  // 提示类型
  const tipType = computed((): 'flycheck' | 'insurance' | 'privacy' | 'documentation' | null => {
    if (!settlementInfo?.value) return null;
    const info = settlementInfo.value;
    
    if (info.flyCheckRisk === 'high' || info.flyCheckRisk === 'medium') {
      return 'flycheck';
    }
    if (info.caseType === 'high') {
      return 'insurance';
    }
    return 'documentation';
  });

  // 提示内容
  const tipContent = computed((): { title: string; content: string; severity: 'info' | 'warning' | 'danger' } => {
    const type = tipType.value;
    
    switch (type) {
      case 'flycheck':
        return {
          title: '飞检风险提示',
          content: '该病例为高倍率病例，复印病案时建议准备完整的诊断依据材料，以应对可能的医保飞检。',
          severity: 'warning',
        };
      case 'insurance':
        return {
          title: '商业保险报销建议',
          content: '该病例费用较高，建议复印完整的病案资料用于商业保险报销。',
          severity: 'info',
        };
      case 'documentation':
        return {
          title: '材料准备建议',
          content: '建议复印病案首页、入院记录、出院小结等核心资料。',
          severity: 'info',
        };
      default:
        return {
          title: '',
          content: '',
          severity: 'info',
        };
    }
  });

  // 推荐复印内容
  const recommendedContents = computed((): string[] => {
    const base = ['homepage', 'admission', 'discharge'];
    
    if (!settlementInfo?.value) return base;
    const info = settlementInfo.value;
    
    if (info.flyCheckRisk === 'high' || info.caseType === 'high') {
      return [...base, 'progress', 'operation', 'pathology', 'exam'];
    }
    
    if (info.flyCheckRisk === 'medium') {
      return [...base, 'progress', 'exam'];
    }
    
    return base;
  });

  return {
    showTips,
    tipType,
    tipContent,
    recommendedContents,
  };
}
