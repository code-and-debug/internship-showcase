<template>
  <view class="refund-page">
    <RefundForm
      :refund-amount="refundAmount"
      :is-submitting="isSubmitting"
      @submit="handleSubmit"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import RefundForm from '../components/RefundForm.vue';
import { useCostStore } from '../store/costStore';
import { useRefund } from '../composables/useRefund';

const store = useCostStore();
const { isSubmitting, submitRefund } = useRefund();

// ========== Computed ==========
const refundAmount = computed(() => {
  // 可退金额 = 已缴金额 - 已使用费用
  const paidAmount = store.currentCost?.paidAmount || 0;
  const totalCost = store.currentCost?.totalCost || 0;
  return Math.max(0, paidAmount - totalCost);
});

// ========== Methods ==========
const handleSubmit = async (data: { refundAmount: number; reason: string }) => {
  try {
    const result = await submitRefund(data.refundAmount, data.reason);
    if (result) {
      uni.showToast({
        title: '退费申请提交成功',
        icon: 'success',
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '提交失败',
      icon: 'none',
    });
  }
};
</script>

<style scoped lang="scss">
.refund-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
