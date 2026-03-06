<template>
  <view class="records-page">
    <!-- 标签栏 -->
    <view class="tabs">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'payment' }"
        @click="activeTab = 'payment'"
      >
        <text>缴费记录</text>
      </view>
    </view>

    <!-- 记录列表 -->
    <scroll-view class="record-list" scroll-y @scrolltolower="handleLoadMore">
      <view
        v-for="item in paymentRecords"
        :key="item.orderNo"
        class="record-item"
      >
        <view class="item-header">
          <text class="order-no">{{ item.orderNo }}</text>
          <text class="status" :class="item.status">{{ getOrderStatusText(item.status) }}</text>
        </view>
        <view class="item-body">
          <view class="info-row">
            <text class="label">支付金额</text>
            <text class="value amount">¥{{ formatAmount(item.amount) }}</text>
          </view>
          <view class="info-row">
            <text class="label">支付方式</text>
            <text class="value">{{ getPayMethodText(item.payMethod) }}</text>
          </view>
          <view class="info-row">
            <text class="label">创建时间</text>
            <text class="value">{{ formatDate(item.createTime) }}</text>
          </view>
          <view class="info-row" v-if="item.payTime">
            <text class="label">支付时间</text>
            <text class="value">{{ formatDate(item.payTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="paymentRecords.length === 0 && !loading">
        <text>暂无缴费记录</text>
      </view>

      <!-- 加载更多 -->
      <view class="load-more" v-if="paymentRecords.length > 0">
        <text v-if="loading">加载中...</text>
        <text v-else>没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCostStore } from '../store/costStore';
import { usePayment } from '../composables/usePayment';
import { formatAmount, formatDate, getOrderStatusText, getPayMethodText } from '../utils';

const store = useCostStore();
const { loadPaymentRecords } = usePayment();

// ========== State ==========
const activeTab = ref<'payment'>('payment');
const patientId = ref('test-patient-id'); // TODO: 从全局获取
const loading = ref(false);

// ========== Computed ==========
const paymentRecords = computed(() => store.orderList);

// ========== Lifecycle ==========
onMounted(() => {
  loadRecords();
});

// ========== Methods ==========
const loadRecords = async () => {
  loading.value = true;
  try {
    await loadPaymentRecords(patientId.value);
  } finally {
    loading.value = false;
  }
};

const handleLoadMore = () => {
  if (loading.value) return;
  loadPaymentRecords(patientId.value, true);
};
</script>

<style scoped lang="scss">
.records-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 30rpx 0;
    position: relative;

    text {
      font-size: 28rpx;
      color: #666;
    }

    &.active {
      text {
        color: #1890ff;
        font-weight: 500;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #1890ff;
        border-radius: 2rpx;
      }
    }
  }
}

.record-list {
  flex: 1;
  padding: 20rpx;
}

.record-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    margin-bottom: 20rpx;

    .order-no {
      font-size: 24rpx;
      color: #999;
    }

    .status {
      font-size: 24rpx;
      padding: 4rpx 16rpx;
      border-radius: 4rpx;

      &.pending {
        color: #faad14;
        background-color: #fffbe6;
      }
      &.paid, &.completed {
        color: #52c41a;
        background-color: #f6ffed;
      }
      &.failed, &.rejected {
        color: #ff4d4f;
        background-color: #fff1f0;
      }
      &.processing {
        color: #1890ff;
        background-color: #e6f7ff;
      }
    }
  }

  .item-body {
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12rpx;

      .label {
        font-size: 26rpx;
        color: #999;
      }

      .value {
        font-size: 26rpx;
        color: #333;

        &.amount {
          font-weight: bold;
          color: #ff6b6b;
        }
      }
    }
  }
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx;

  text {
    font-size: 28rpx;
    color: #999;
  }
}

.load-more {
  padding: 30rpx;
  text-align: center;

  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
