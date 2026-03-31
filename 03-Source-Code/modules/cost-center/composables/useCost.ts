/**
 * 费用中心 - 费用相关逻辑封装
 */
import { ref, computed } from 'vue';
import { useCostStore } from '../store/costStore';
import { formatAmount, getStatusText, getStatusColor } from '../utils';

export function useCost() {
  const store = useCostStore();
  const error = ref<string | null>(null);

  // ========== Computed ==========
  const loading = computed(() => store.loading);
  const costInfo = computed(() => store.currentCost);
  const summary = computed(() => store.summary);

  const formattedBalance = computed(() => formatAmount(store.currentCost?.balance || 0));
  const formattedTotalCost = computed(() => formatAmount(store.currentCost?.totalCost || 0));
  const formattedPaidAmount = computed(() => formatAmount(store.currentCost?.paidAmount || 0));
  const formattedDeposit = computed(() => formatAmount(store.currentCost?.deposit || 0));

  const statusText = computed(() => {
    if (!store.currentCost) return '';
    return getStatusText(store.currentCost.status);
  });

  const statusColor = computed(() => {
    if (!store.currentCost) return '#999';
    return getStatusColor(store.currentCost.status);
  });

  const hasBalance = computed(() => store.hasBalance);
  const isArrears = computed(() => store.isArrears);
  const isWarning = computed(() => store.isWarning);

  // ========== Methods ==========

  /**
   * 加载费用信息
   */
  const loadCostInfo = async (patientId: string) => {
    try {
      error.value = null;
      await store.fetchCostInfo(patientId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载失败，请稍后重试';
      throw err;
    }
  };

  /**
   * 加载费用明细
   */
  const loadDetailList = async (params: { admissionNo: string; date?: string; category?: string }, loadMore = false) => {
    try {
      error.value = null;
      await store.fetchDetailList(params, loadMore);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载明细失败';
      throw err;
    }
  };

  /**
   * 加载日清单
   */
  const loadDailyList = async (date: string) => {
    if (!store.currentCost?.admissionNo) {
      error.value = '住院号不存在';
      return;
    }
    try {
      error.value = null;
      await store.fetchDailyList(store.currentCost.admissionNo, date);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载日清单失败';
      throw err;
    }
  };

  /**
   * 刷新费用信息
   */
  const refresh = async () => {
    if (store.currentCost?.patientId) {
      await loadCostInfo(store.currentCost.patientId);
    }
  };

  return {
    // State
    loading,
    error,
    costInfo,
    summary,
    // Computed
    formattedBalance,
    formattedTotalCost,
    formattedPaidAmount,
    formattedDeposit,
    statusText,
    statusColor,
    hasBalance,
    isArrears,
    isWarning,
    // Actions
    loadCostInfo,
    loadDetailList,
    loadDailyList,
    refresh,
  };
}
