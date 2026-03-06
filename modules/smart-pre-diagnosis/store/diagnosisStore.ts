/**
 * 智能预问诊 - Pinia 状态管理（Setup 模式）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  IBodyPart,
  ISymptom,
  IAssessmentResult,
  IPreDiagnosisRecord,
} from '../types';
import { diagnosisApi } from '../api/index';

export const useDiagnosisStore = defineStore('smartPreDiagnosis', () => {
  // ========== State ==========
  /** 身体部位列表 */
  const bodyParts = ref<IBodyPart[]>([]);
  /** 选中的身体部位 */
  const selectedBodyParts = ref<IBodyPart[]>([]);
  /** 选中的症状 */
  const selectedSymptoms = ref<ISymptom[]>([]);
  /** AI评估结果 */
  const assessmentResult = ref<IAssessmentResult | null>(null);
  /** 补充描述 */
  const description = ref('');
  /** 语音转文字内容 */
  const voiceText = ref('');
  /** 预问诊历史记录 */
  const historyRecords = ref<IPreDiagnosisRecord[]>([]);
  /** 加载状态 */
  const loading = ref(false);
  /** 评估中状态 */
  const assessing = ref(false);

  // ========== Getters ==========
  /** 是否已选择症状 */
  const hasSelectedSymptoms = computed(() => selectedSymptoms.value.length > 0);
  /** 已选部位ID列表 */
  const selectedBodyPartIds = computed(() => selectedBodyParts.value.map(p => p.id));
  /** 是否有评估结果 */
  const hasResult = computed(() => !!assessmentResult.value);
  /** 推荐科室列表 */
  const recommendedDepts = computed(() => assessmentResult.value?.recommendedDepts || []);
  /** 推荐的疾病列表 */
  const recommendedDiseases = computed(() => assessmentResult.value?.diseases || []);

  // ========== Actions ==========

  /**
   * 获取身体部位列表
   */
  const fetchBodyParts = async () => {
    loading.value = true;
    try {
      const res = await diagnosisApi.getBodyParts();
      if (res.result) {
        bodyParts.value = res.result;
      }
      return res;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取部位相关症状
   */
  const fetchSymptomsByBodyPart = async (bodyPartId: string) => {
    const res = await diagnosisApi.getSymptomsByBodyPart(bodyPartId);
    return res.result || [];
  };

  /**
   * 切换身体部位选择
   */
  const toggleBodyPart = (part: IBodyPart) => {
    const index = selectedBodyParts.value.findIndex(p => p.id === part.id);
    if (index > -1) {
      selectedBodyParts.value.splice(index, 1);
    } else {
      selectedBodyParts.value.push(part);
    }
  };

  /**
   * 添加症状
   */
  const addSymptom = (symptom: ISymptom) => {
    if (!selectedSymptoms.value.find(s => s.id === symptom.id)) {
      selectedSymptoms.value.push(symptom);
    }
  };

  /**
   * 移除症状
   */
  const removeSymptom = (symptomId: string) => {
    const index = selectedSymptoms.value.findIndex(s => s.id === symptomId);
    if (index > -1) {
      selectedSymptoms.value.splice(index, 1);
    }
  };

  /**
   * 切换症状选择
   */
  const toggleSymptom = (symptom: ISymptom) => {
    const exists = selectedSymptoms.value.find(s => s.id === symptom.id);
    if (exists) {
      removeSymptom(symptom.id);
    } else {
      addSymptom(symptom);
    }
  };

  /**
   * 提交AI评估
   */
  const submitAssessment = async (patientId: string) => {
    if (!hasSelectedSymptoms.value) {
      throw new Error('请至少选择一个症状');
    }

    assessing.value = true;
    try {
      const res = await diagnosisApi.submitAssessment({
        patientId,
        bodyParts: selectedBodyPartIds.value,
        symptoms: selectedSymptoms.value,
        description: description.value || undefined,
        voiceText: voiceText.value || undefined,
      });
      if (res.result) {
        assessmentResult.value = res.result;
      }
      return res.result;
    } finally {
      assessing.value = false;
    }
  };

  /**
   * 获取评估历史
   */
  const fetchHistory = async (patientId: string) => {
    loading.value = true;
    try {
      const res = await diagnosisApi.getAssessmentHistory(patientId);
      if (res.result) {
        historyRecords.value = res.result;
      }
      return res;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 清除选择
   */
  const clearSelection = () => {
    selectedBodyParts.value = [];
    selectedSymptoms.value = [];
    description.value = '';
    voiceText.value = '';
  };

  /**
   * 清除所有状态
   */
  const reset = () => {
    bodyParts.value = [];
    selectedBodyParts.value = [];
    selectedSymptoms.value = [];
    assessmentResult.value = null;
    description.value = '';
    voiceText.value = '';
    historyRecords.value = [];
  };

  return {
    // State
    bodyParts,
    selectedBodyParts,
    selectedSymptoms,
    assessmentResult,
    description,
    voiceText,
    historyRecords,
    loading,
    assessing,
    // Getters
    hasSelectedSymptoms,
    selectedBodyPartIds,
    hasResult,
    recommendedDepts,
    recommendedDiseases,
    // Actions
    fetchBodyParts,
    fetchSymptomsByBodyPart,
    toggleBodyPart,
    addSymptom,
    removeSymptom,
    toggleSymptom,
    submitAssessment,
    fetchHistory,
    clearSelection,
    reset,
  };
});
