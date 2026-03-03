/**
 * DRG医保结算与病案管理模块 - Pinia Store
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  TSettleItem, 
  ISettlementDetail, 
  IMedicalCopyItem,
  IPatientInfo,
} from '../types';

export const useDRGStore = defineStore('drgSettlement', () => {
  // ==================== State ====================
  
  // 患者信息
  const patientInfo = ref<IPatientInfo | null>(null);
  
  // 结算列表
  const settlementList = ref<TSettleItem[]>([]);
  
  // 当前结算详情
  const currentSettlement = ref<ISettlementDetail | null>(null);
  
  // 病案复印申请列表
  const medicalCopyList = ref<IMedicalCopyItem[]>([]);
  
  // 加载状态
  const loading = ref(false);
  
  // 错误信息
  const error = ref<string | null>(null);

  // ==================== Getters ====================
  
  // 是否有数据
  const hasData = computed(() => settlementList.value.length > 0);
  
  // 结算列表总数
  const totalCount = computed(() => settlementList.value.length);
  
  // 高风险结算数量
  const highRiskCount = computed(() => 
    settlementList.value.filter(item => item.flyCheckRisk === 'high').length
  );
  
  // 高倍率病例数量
  const highRateCount = computed(() => 
    settlementList.value.filter(item => item.caseType === 'high').length
  );

  // ==================== Actions ====================
  
  /**
   * 设置患者信息
   */
  const setPatientInfo = (info: IPatientInfo) => {
    patientInfo.value = info;
  };
  
  /**
   * 设置结算列表
   */
  const setSettlementList = (list: TSettleItem[]) => {
    settlementList.value = list;
  };
  
  /**
   * 设置当前结算详情
   */
  const setCurrentSettlement = (settlement: ISettlementDetail | null) => {
    currentSettlement.value = settlement;
  };
  
  /**
   * 设置病案复印列表
   */
  const setMedicalCopyList = (list: IMedicalCopyItem[]) => {
    medicalCopyList.value = list;
  };
  
  /**
   * 添加病案复印申请
   */
  const addMedicalCopy = (item: IMedicalCopyItem) => {
    medicalCopyList.value.unshift(item);
  };
  
  /**
   * 更新病案复印申请状态
   */
  const updateMedicalCopyStatus = (expressId: string, status: IMedicalCopyItem['status']) => {
    const index = medicalCopyList.value.findIndex(item => item.expressId === expressId);
    if (index > -1) {
      medicalCopyList.value[index].status = status;
    }
  };
  
  /**
   * 设置加载状态
   */
  const setLoading = (value: boolean) => {
    loading.value = value;
  };
  
  /**
   * 设置错误信息
   */
  const setError = (msg: string | null) => {
    error.value = msg;
  };
  
  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null;
  };
  
  /**
   * 重置状态
   */
  const reset = () => {
    patientInfo.value = null;
    settlementList.value = [];
    currentSettlement.value = null;
    medicalCopyList.value = [];
    loading.value = false;
    error.value = null;
  };

  return {
    // State
    patientInfo,
    settlementList,
    currentSettlement,
    medicalCopyList,
    loading,
    error,
    
    // Getters
    hasData,
    totalCount,
    highRiskCount,
    highRateCount,
    
    // Actions
    setPatientInfo,
    setSettlementList,
    setCurrentSettlement,
    setMedicalCopyList,
    addMedicalCopy,
    updateMedicalCopyStatus,
    setLoading,
    setError,
    clearError,
    reset,
  };
});
