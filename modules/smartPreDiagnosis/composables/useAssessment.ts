/**
 * ============================================================================
 * 智能预问诊模块 - AI评估组合式函数
 * ============================================================================
 * 
 * 本文件封装AI预问诊评估的业务逻辑，实现关注点分离。
 * 
 * 功能包括：
 * 1. 提交症状评估请求
 * 2. 管理评估结果
 * 3. 评估结果数据转换
 * ============================================================================
 */

import { ref, computed } from 'vue';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { diagnosisApi } from '../api';
import type { IAssessmentResult, IAssessmentRequest } from '../types';

/**
 * AI评估组合式函数
 * 
 * 使用场景：
 * ```typescript
 * // 在评估页面中使用
 * const { 
 *   result, 
 *   isAssessing, 
 *   submitAssessment,
 *   getSeverityColor,
 *   getUrgencyLabel 
 * } = useAssessment();
 * ```
 */
export function useAssessment() {
  // 依赖 Store
  const store = useDiagnosisStore();

  // ========== 内部状态 ==========
  const submitting = ref(false);
  const errorMsg = ref('');

  // ========== 计算属性 ==========
  /** 当前评估结果 */
  const result = computed(() => store.assessmentResult);

  /** 是否正在评估 */
  const isAssessing = computed(() => store.assessing || submitting.value);

  /** 是否有评估结果 */
  const hasResult = computed(() => store.hasResult);

  // ========== 方法 ==========

  /**
   * 提交AI评估请求
   * 
   * 使用场景：
   * - 用户完成症状选择后点击"开始评估"按钮
   * - 携带选中的症状、部位、补充描述等信息提交给后端
   * 
   * 业务流程：
   * 1. 检查是否选择了症状
   * 2. 调用评估API
   * 3. 更新Store中的评估结果
   * 4. 返回评估结果
   * 
   * @param patientId - 患者ID
   * @returns 评估结果
   * 
   * @example
   * const handleAssess = async () => {
   *   const patientId = userStore.patChoose.patientId;
   *   const result = await submitAssessment(patientId);
   *   if (result) {
   *     uni.navigateTo({ url: '/pagesD/smartPreDiagnosis/pages/result' });
   *   }
   * };
   */
  const submitAssessment = async (patientId: string): Promise<IAssessmentResult | null> => {
    // 前置检查：是否选择了症状
    if (!store.hasSelectedSymptoms) {
      errorMsg.value = '请至少选择一个症状';
      return null;
    }

    submitting.value = true;
    errorMsg.value = '';

    try {
      const res = await diagnosisApi.submitAssessment({
        patientId,
        bodyParts: store.selectedBodyPartIds,
        symptoms: store.selectedSymptoms,
        description: store.description || undefined,
        voiceText: store.voiceText || undefined,
      });

      if (res.result) {
        store.assessmentResult = res.result;
        return res.result;
      }

      errorMsg.value = '评估服务暂不可用，请稍后重试';
      return null;
    } catch (error: any) {
      console.error('提交评估失败:', error);
      errorMsg.value = error?.message || '评估失败，请重试';
      return null;
    } finally {
      submitting.value = false;
    }
  };

  /**
   * 获取严重程度对应的颜色
   * 
   * 使用场景：
   * - 在评估结果页面显示严重程度标签
   * - 根据不同严重程度显示不同的颜色
   * 
   * @param severity - 严重程度值
   * @returns 对应的颜色值
   * 
   * @example
   * <view :style="{ color: getSeverityColor(result.severity) }">
   *   {{ result.severity }}
   * </view>
   */
  const getSeverityColor = (severity: string): string => {
    const colorMap: Record<string, string> = {
      normal: '#52c41a',   // 绿色 - 正常
      urgent: '#faad14',   // 黄色 - 紧急
      emergency: '#ff4d4f', // 红色 - 紧急情况
    };
    return colorMap[severity] || '#999999';
  };

  /**
   * 获取严重程度对应的标签文本
   * 
   * @param severity - 严重程度值
   * @returns 对应的中文标签
   */
  const getSeverityLabel = (severity: string): string => {
    const labelMap: Record<string, string> = {
      normal: '正常',
      urgent: '需注意',
      emergency: '紧急',
    };
    return labelMap[severity] || '未知';
  };

  /**
   * 获取紧急程度对应的标签
   * 
   * 使用场景：
   * - 在推荐科室列表显示紧急程度
   * 
   * @param urgency - 紧急程度值
   * @returns 对应的中文标签
   */
  const getUrgencyLabel = (urgency: string): string => {
    const labelMap: Record<string, string> = {
      normal: '普通',
      urgent: '加急',
    };
    return labelMap[urgency] || '普通';
  };

  /**
   * 格式化概率为百分比字符串
   * 
   * 使用场景：
   * - 显示疾病匹配概率
   * 
   * @param probability - 概率值 (0-1)
   * @returns 百分比字符串
   * 
   * @example
   * const percent = formatProbability(0.85);
   * // percent = '85%'
   */
  const formatProbability = (probability: number): string => {
    return `${Math.round(probability * 100)}%`;
  };

  /**
   * 清除评估结果
   * 
   * 使用场景：
   * - 用户重新开始评估时
   * - 离开评估页面时
   */
  const clearResult = () => {
    store.assessmentResult = null;
    errorMsg.value = '';
  };

  return {
    // 状态
    result,
    isAssessing,
    hasResult,
    errorMsg,

    // 方法
    submitAssessment,
    getSeverityColor,
    getSeverityLabel,
    getUrgencyLabel,
    formatProbability,
    clearResult,
  };
}

export default useAssessment;
