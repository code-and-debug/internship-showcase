/**
 * 费用中心 - Pinia 状态管理（Setup 模式）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  IHospitalCost,
  ICostDetail,
  IPaymentOrder,
  IRefundApply,
  ICostSummary,
} from '../types';
import { costApi, paymentApi } from '../api';
import { calculateSummary } from '../utils';

export const useCostStore = defineStore('costCenter', () => {
  // ========== State ==========
  /** 当前住院费用信息 */
  const currentCost = ref<IHospitalCost | null>(null);
  /** 费用明细列表 */
  const detailList = ref<ICostDetail[]>([]);
  /** 缴费订单列表 */
  const orderList = ref<IPaymentOrder[]>([]);
  /** 退费申请列表 */
  const refundList = ref<IRefundApply[]>([]);
  /** 加载状态 */
  const loading = ref(false);
  /** 明细分页加载状态 */
  const detailLoading = ref(false);
  /** 订单分页信息 */
  const pagination = ref({
    page: 1,
    size: 10,
    total: 0,
  });

  // ========== Getters ==========
  /** 是否有余额 */
  const hasBalance = computed(() => (currentCost.value?.balance || 0) > 0);
  /** 是否欠费 */
  const isArrears = computed(() => currentCost.value?.status === '3');
  /** 是否余额不足 */
  const isWarning = computed(() => currentCost.value?.status === '2');
  /** 已缴总额 */
  const totalPaid = computed(() => currentCost.value?.paidAmount || 0);
  /** 费用摘要 */
  const summary = computed<ICostSummary | null>(() => {
    if (!currentCost.value) return null;
    return calculateSummary(currentCost.value);
  });
  /** 是否有更多明细 */
  const hasMoreDetails = computed(() => {
    return detailList.value.length < (pagination.value.total || 0);
  });

  // ========== Actions ==========

  /**
   * 获取住院费用信息
   */
  const fetchCostInfo = async (patientId: string) => {
    loading.value = true;
    try {
      const res = await costApi.getHospitalCost({ patientId });
      if (res.result) {
        currentCost.value = res.result;
      }
      return res;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取费用明细列表
   */
  const fetchDetailList = async (
    params: { admissionNo: string; date?: string; category?: string },
    loadMore = false
  ) => {
    if (loadMore) {
      if (detailLoading.value || !hasMoreDetails.value) return;
      pagination.value.page++;
    } else {
      pagination.value.page = 1;
      detailList.value = [];
    }

    detailLoading.value = true;
    try {
      const res = await costApi.getCostDetail({
        ...params,
        page: pagination.value.page,
        size: pagination.value.size,
      });
      if (res.result) {
        detailList.value = [...detailList.value, ...res.result];
      }
      return res;
    } finally {
      detailLoading.value = false;
    }
  };

  /**
   * 获取日清单
   */
  const fetchDailyList = async (admissionNo: string, date: string) => {
    loading.value = true;
    try {
      const res = await costApi.getDailyList({ admissionNo, date });
      if (res.result) {
        detailList.value = res.result;
      }
      return res;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 创建支付订单
   */
  const createPayment = async (data: {
    amount: number;
    payMethod: 'wechat' | 'alipay';
  }) => {
    if (!currentCost.value?.admissionNo) {
      throw new Error('住院号不存在');
    }
    const res = await paymentApi.createOrder({
      ...data,
      admissionNo: currentCost.value.admissionNo,
    });
    return res.result;
  };

  /**
   * 支付结果查询（轮询）
   */
  const pollPaymentResult = async (
    orderNo: string,
    maxAttempts = 10,
    interval = 2000
  ): Promise<IPaymentOrder> => {
    for (let i = 0; i < maxAttempts; i++) {
      const res = await paymentApi.queryOrder(orderNo);
      const order = res.result;
      if (order.status === 'paid') {
        return order;
      }
      if (order.status === 'failed') {
        throw new Error('支付失败');
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error('支付超时，请稍后查看支付结果');
  };

  /**
   * 获取缴费记录
   */
  const fetchPaymentRecords = async (patientId: string, loadMore = false) => {
    if (loadMore) {
      pagination.value.page++;
    } else {
      pagination.value.page = 1;
      orderList.value = [];
    }

    loading.value = true;
    try {
      const res = await paymentApi.getPaymentRecords({
        patientId,
        page: pagination.value.page,
        size: pagination.value.size,
      });
      if (res.result) {
        orderList.value = [...orderList.value, ...res.result];
      }
      return res;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 提交退费申请
   */
  const submitRefund = async (data: { refundAmount: number; reason: string }) => {
    if (!currentCost.value?.admissionNo) {
      throw new Error('住院号不存在');
    }
    const res = await paymentApi.applyRefund({
      ...data,
      admissionNo: currentCost.value.admissionNo,
    });
    return res.result;
  };

  /**
   * 获取退费记录
   */
  const fetchRefundRecords = async (patientId: string) => {
    loading.value = true;
    try {
      const res = await paymentApi.getRefundRecords({ patientId });
      if (res.result) {
        refundList.value = res.result;
      }
      return res;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 刷新费用信息（支付后）
   */
  const refreshCostInfo = async () => {
    if (currentCost.value?.patientId) {
      await fetchCostInfo(currentCost.value.patientId);
    }
  };

  /**
   * 重置状态
   */
  const reset = () => {
    currentCost.value = null;
    detailList.value = [];
    orderList.value = [];
    refundList.value = [];
    pagination.value = { page: 1, size: 10, total: 0 };
  };

  return {
    // State
    currentCost,
    detailList,
    orderList,
    refundList,
    loading,
    detailLoading,
    pagination,
    // Getters
    hasBalance,
    isArrears,
    isWarning,
    totalPaid,
    summary,
    hasMoreDetails,
    // Actions
    fetchCostInfo,
    fetchDetailList,
    fetchDailyList,
    createPayment,
    pollPaymentResult,
    fetchPaymentRecords,
    submitRefund,
    fetchRefundRecords,
    refreshCostInfo,
    reset,
  };
});
