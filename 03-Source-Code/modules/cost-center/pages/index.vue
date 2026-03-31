<template>
  <view class="cost-center-page">
    <!-- 顶部费用信息 -->
    <CostHeader :cost-info="costInfo" />

    <!-- 功能入口 -->
    <view class="function-section">
      <view class="section-title">
        <text>功能服务</text>
      </view>

      <view class="function-grid">
        <CostCard
          title="费用明细"
          desc="查看每日费用清单"
          icon="📋"
          @click="navigateToDetail"
        />
        <CostCard
          title="在线缴费"
          desc="预交金缴纳"
          icon="💳"
          @click="navigateToPay"
        />
        <CostCard
          title="退费申请"
          desc="原路退回"
          icon="↩️"
          @click="navigateToRefund"
        />
        <CostCard
          title="缴费记录"
          desc="历史订单查询"
          icon="📜"
          @click="navigateToRecords"
        />
      </view>
    </view>

    <!-- 支付弹窗 -->
    <PaymentDialog
      :visible="showPaymentDialog"
      :balance="costInfo?.balance || 0"
      :quick-amounts="quickAmounts"
      @close="showPaymentDialog = false"
      @confirm="handlePaymentConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CostHeader from '../components/CostHeader.vue';
import CostCard from '../components/CostCard.vue';
import PaymentDialog from '../components/PaymentDialog.vue';
import { useCost } from '../composables/useCost';
import { usePayment } from '../composables/usePayment';
import { generateQuickAmounts } from '../utils';

// ========== Composables ==========
const { loading, costInfo, loadCostInfo } = useCost();
const { quickAmounts, createOrder, doPayment } = usePayment();

// ========== State ==========
const showPaymentDialog = ref(false);
const patientId = ref(''); // 从全局获取

// ========== Computed ==========
const quickAmountsList = computed(() => {
  return generateQuickAmounts(costInfo.value?.balance || 0);
});

// ========== Lifecycle ==========
onMounted(() => {
  // TODO: 从全局获取患者ID
  // const gStores = new GStores();
  // patientId.value = gStores.userStore.patientId;
  patientId.value = 'test-patient-id';

  if (patientId.value) {
    loadCostInfo(patientId.value);
  }
});

// ========== Methods ==========
const navigateToDetail = () => {
  uni.navigateTo({
    url: '/pagesD/costCenter/detail',
  });
};

const navigateToPay = () => {
  showPaymentDialog.value = true;
};

const navigateToRefund = () => {
  uni.navigateTo({
    url: '/pagesD/costCenter/refund',
  });
};

const navigateToRecords = () => {
  uni.navigateTo({
    url: '/pagesD/costCenter/records',
  });
};

const handlePaymentConfirm = async (data: { amount: number; payMethod: 'wechat' | 'alipay' }) => {
  try {
    // 创建订单
    const order = await createOrder(data.amount, data.payMethod);
    if (order) {
      // 发起支付
      const result = await doPayment(order.orderNo);
      if (result) {
        uni.showToast({
          title: '支付成功',
          icon: 'success',
        });
        showPaymentDialog.value = false;
        // 刷新费用信息
        loadCostInfo(patientId.value);
      }
    }
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '支付失败',
      icon: 'none',
    });
  }
};
</script>

<style scoped lang="scss">
.cost-center-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.function-section {
  margin-top: 30rpx;

  .section-title {
    padding: 20rpx 0;

    text {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .function-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
}
</style>
