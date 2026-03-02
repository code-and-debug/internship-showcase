<template>
  <view class="cost-header">
    <!-- 患者信息 -->
    <view class="patient-info" v-if="patientName">
      <text class="name">{{ patientName }}</text>
      <text class="admission-no">住院号：{{ admissionNo }}</text>
    </view>

    <!-- 费用状态卡片 -->
    <view class="status-card" :style="{ borderLeftColor: statusColor }">
      <view class="status-label">
        <text class="label">账户余额</text>
        <view class="status-tag" :style="{ backgroundColor: statusColor }">
          <text class="tag-text">{{ statusText }}</text>
        </view>
      </view>
      <view class="balance-amount">
        <text class="currency">¥</text>
        <text class="amount">{{ formattedBalance }}</text>
      </view>
    </view>

    <!-- 费用摘要 -->
    <view class="summary-row">
      <view class="summary-item">
        <text class="label">总费用</text>
        <text class="value">{{ formattedTotalCost }}</text>
      </view>
      <view class="summary-item">
        <text class="label">已缴金额</text>
        <text class="value">{{ formattedPaidAmount }}</text>
      </view>
      <view class="summary-item">
        <text class="label">押金</text>
        <text class="value">{{ formattedDeposit }}</text>
      </view>
    </view>

    <!-- 欠费提醒 -->
    <view class="warning-tip" v-if="isArrears || isWarning">
      <text class="tip-text">
        {{ isArrears ? '您的账户已欠费，请及时缴费以免影响治疗' : '您的账户余额不足，请及时充值' }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatAmount, getStatusText, getStatusColor } from '../utils';
import type { IHospitalCost, CostStatus } from '../types';

interface Props {
  /** 住院费用信息 */
  costInfo?: IHospitalCost | null;
}

const props = withDefaults(defineProps<Props>(), {
  costInfo: null,
});

// ========== Computed ==========
const patientName = computed(() => props.costInfo?.patientName || '');
const admissionNo = computed(() => props.costInfo?.admissionNo || '');
const balance = computed(() => props.costInfo?.balance || 0);

const formattedBalance = computed(() => formatAmount(balance.value));
const formattedTotalCost = computed(() => formatAmount(props.costInfo?.totalCost || 0));
const formattedPaidAmount = computed(() => formatAmount(props.costInfo?.paidAmount || 0));
const formattedDeposit = computed(() => formatAmount(props.costInfo?.deposit || 0));

const statusText = computed(() => {
  if (!props.costInfo) return '';
  return getStatusText(props.costInfo.status);
});

const statusColor = computed(() => {
  if (!props.costInfo) return '#999';
  return getStatusColor(props.costInfo.status);
});

const isArrears = computed(() => props.costInfo?.status === '3');
const isWarning = computed(() => props.costInfo?.status === '2');
</script>

<style scoped lang="scss">
.cost-header {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
}

.patient-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;

  .name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .admission-no {
    font-size: 24rpx;
    color: #999;
  }
}

.status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 30rpx;
  border-left: 8rpx solid #fff;
  margin-bottom: 30rpx;

  .status-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .label {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.9);
    }

    .status-tag {
      padding: 6rpx 16rpx;
      border-radius: 20rpx;

      .tag-text {
        font-size: 22rpx;
        color: #fff;
      }
    }
  }

  .balance-amount {
    display: flex;
    align-items: baseline;

    .currency {
      font-size: 32rpx;
      color: #fff;
      margin-right: 8rpx;
    }

    .amount {
      font-size: 56rpx;
      font-weight: bold;
      color: #fff;
    }
  }
}

.summary-row {
  display: flex;
  justify-content: space-between;

  .summary-item {
    flex: 1;
    text-align: center;

    .label {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 10rpx;
    }

    .value {
      display: block;
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
    }
  }
}

.warning-tip {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #fff7e6;
  border-radius: 8rpx;
  border: 1rpx solid #ffd591;

  .tip-text {
    font-size: 24rpx;
    color: #fa8c16;
  }
}
</style>
