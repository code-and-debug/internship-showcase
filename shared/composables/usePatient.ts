/**
 * 患者信息 Composable
 */

import { ref, computed } from 'vue';
import type { IPatientInfo } from '../types/common';

/**
 * 患者信息管理
 */
export function usePatient() {
  // ==================== 状态 ====================
  
  const patientList = ref<IPatientInfo[]>([]);
  const currentPatient = ref<IPatientInfo | null>(null);
  const loading = ref(false);
  
  // ==================== 计算属性 ====================
  
  const hasPatient = computed(() => patientList.value.length > 0);
  
  const isPatientSelected = computed(() => !!currentPatient.value);
  
  // ==================== 方法 ====================
  
  /**
   * 加载患者列表
   */
  const loadPatientList = async () => {
    loading.value = true;
    try {
      // 调用 API 获取患者列表
      // const { result } = await api.getPatientList();
      // patientList.value = result;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * 选择患者
   */
  const selectPatient = (patient: IPatientInfo) => {
    currentPatient.value = patient;
  };
  
  /**
   * 切换患者
   */
  const switchPatient = async (patient: IPatientInfo) => {
    selectPatient(patient);
    // 触发患者切换后的回调
    await onPatientChange?.(patient);
  };
  
  /**
   * 患者切换回调（由外部传入）
   */
  let onPatientChange: ((patient: IPatientInfo) => Promise<void>) | null = null;
  
  const setOnPatientChange = (callback: typeof onPatientChange) => {
    onPatientChange = callback;
  };
  
  return {
    patientList,
    currentPatient,
    loading,
    hasPatient,
    isPatientSelected,
    loadPatientList,
    selectPatient,
    switchPatient,
    setOnPatientChange,
  };
}
