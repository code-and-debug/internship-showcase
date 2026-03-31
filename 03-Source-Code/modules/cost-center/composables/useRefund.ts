/**
 * 费用中心 - 退费逻辑封装
 */
import { ref, computed } from 'vue';
import { useCostStore } from '../store/costStore';
import { formatAmount, validatePaymentAmount, getRefundStatusText } from '../utils';
import type { IRefundApply } from '../types';

export function useRefund() {
  const store = useCostStore();
  const error = ref<string | null>(null);
  const submitting = ref(false);
  const refundResult = ref<IRefundApply | null>(null);

  // ========== Computed ==========
  const isSubmitting = computed(() => submitting.value);
  const currentRefund = computed(() => refundResult.value);
  const refundRecords = computed(() => store.refundList);

  // ========== Methods ==========

  /**
   * 提交退费申请
   */
  const submitRefund = async (refundAmount: number, reason: string) => {
    // 验证退费金额
    if (!refundAmount || refundAmount <= 0) {
      error.value = '请输入有效的退费金额';
      return null;
    }

    if (!reason || reason.trim().length === 0) {
      error.value = '请填写退费原因';
      return null;
    }

    if (reason.length > 200) {
      error.value = '退费原因不能超过200字';
      return null;
    }

    submitting.value = true;
    error.value = null;
    refundResult.value = null;

    try {
      const result = await store.submitRefund({ refundAmount, reason });
      refundResult.value = result;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '提交退费申请失败';
      return null;
    } finally {
      submitting.value = false;
    }
  };

  /**
   * 获取退费记录
   */
  const loadRefundRecords = async (patientId: string) => {
    try {
      error.value = null;
      await store.fetchRefundRecords(patientId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载退费记录失败';
    }
  };

  /**
   * 格式化退费金额
   */
  const formatRefundAmount = (amount: number) => formatAmount(amount);

  /**
   * 获取退费状态文本
   */
  const getRefundStatusLabel = (status: string) => getRefundStatusText(status);

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'pending': '#faad14',   // 待处理 - 橙色
      'processing': '#1890ff', // 处理中 - 蓝色
      'completed': '#52c41a', // 已完成 - 绿色
      'rejected': '#ff4d4f',  // 已拒绝 - 红色
    };
    return colorMap[status] || '#999999';
  };

  /**
   * 重置状态
   */
  const reset = () => {
    error.value = null;
    submitting.value = false;
    refundResult.value = null;
  };

  return {
    // State
    error,
    submitting,
    refundResult,
    // Computed
    isSubmitting,
    currentRefund,
    refundRecords,
    // Actions
    submitRefund,
    loadRefundRecords,
    formatRefundAmount,
    getRefundStatusLabel,
    getStatusColor,
    reset,
  };
}
