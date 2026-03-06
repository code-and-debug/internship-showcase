/**
 * 费用中心 - 支付逻辑封装
 */
import { ref, computed } from 'vue';
import { useCostStore } from '../store/costStore';
import { formatAmount, validatePaymentAmount, generateQuickAmounts, getPayMethodText } from '../utils';
import type { IPaymentOrder } from '../types';

export function usePayment() {
  const store = useCostStore();
  const error = ref<string | null>(null);
  const paying = ref(false);
  const paymentResult = ref<IPaymentOrder | null>(null);

  // ========== Computed ==========
  const isPaying = computed(() => paying.value);
  const currentOrder = computed(() => paymentResult.value);
  const quickAmounts = computed(() => {
    const balance = store.currentCost?.balance || 0;
    return generateQuickAmounts(balance);
  });

  // ========== Methods ==========

  /**
   * 创建支付订单
   */
  const createOrder = async (amount: number, payMethod: 'wechat' | 'alipay') => {
    // 验证金额
    const validation = validatePaymentAmount(amount);
    if (!validation.valid) {
      error.value = validation.message || '金额验证失败';
      return null;
    }

    paying.value = true;
    error.value = null;
    paymentResult.value = null;

    try {
      const order = await store.createPayment({ amount, payMethod });
      paymentResult.value = order;
      return order;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建订单失败';
      return null;
    } finally {
      paying.value = false;
    }
  };

  /**
   * 发起支付（调用微信/支付宝）
   */
  const doPayment = async (orderNo: string) => {
    paying.value = true;
    error.value = null;

    try {
      // 根据支付方式调用对应支付API
      // 微信支付
      // #ifdef MP-WEIXIN
      await wxPayment(orderNo);
      // #endif

      // 支付宝支付
      // #ifdef MP-ALIPAY
      await aliPayment(orderNo);
      // #endif

      // 轮询支付结果
      const result = await store.pollPaymentResult(orderNo);

      // 支付成功后刷新费用信息
      await store.refreshCostInfo();

      paymentResult.value = result;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '支付失败';
      return null;
    } finally {
      paying.value = false;
    }
  };

  /**
   * 微信支付（需要根据实际API调整）
   */
  const wxPayment = async (_orderNo: string) => {
    // 实际项目中需要调用微信支付SDK
    // const res = await paymentApi.getPayParams(orderNo);
    // wx.requestPayment({ ...res.result });
    console.log('微信支付调用');
  };

  /**
   * 支付宝支付（需要根据实际API调整）
   */
  const aliPayment = async (_orderNo: string) => {
    // 实际项目中需要调用支付宝SDK
    // const res = await paymentApi.getPayParams(orderNo);
    // my.tradePay({ ...res.result });
    console.log('支付宝支付调用');
  };

  /**
   * 获取缴费记录
   */
  const loadPaymentRecords = async (patientId: string, loadMore = false) => {
    try {
      error.value = null;
      await store.fetchPaymentRecords(patientId, loadMore);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载记录失败';
    }
  };

  /**
   * 格式化支付金额
   */
  const formatPaymentAmount = (amount: number) => formatAmount(amount);

  /**
   * 获取支付方式文本
   */
  const getPayMethodLabel = (method: string) => getPayMethodText(method);

  /**
   * 重置支付状态
   */
  const reset = () => {
    error.value = null;
    paying.value = false;
    paymentResult.value = null;
  };

  return {
    // State
    error,
    paying,
    paymentResult,
    // Computed
    isPaying,
    currentOrder,
    quickAmounts,
    // Actions
    createOrder,
    doPayment,
    loadPaymentRecords,
    formatPaymentAmount,
    getPayMethodLabel,
    reset,
  };
}
