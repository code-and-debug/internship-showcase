<template>
  <view class="pay-page">
    <!-- 账户信息 -->
    <view class="account-info">
      <text class="label">当前账户余额</text>
      <view class="balance">
        <text class="currency">¥</text>
        <text class="amount">{{ formattedBalance }}</text>
      </view>
    </view>

    <!-- 充值金额 -->
    <view class="amount-section">
      <text class="section-title">充值金额</text>
      <view class="amount-input-wrapper">
        <text class="currency">¥</text>
        <input
          type="digit"
          v-model="inputAmount"
          placeholder="请输入充值金额"
          class="amount-input"
        />
      </view>

      <!-- 快捷金额 -->
      <view class="quick-amounts">
        <view
          v-for="amount in quickAmounts"
          :key="amount"
          class="amount-tag"
          :class="{ active: inputAmount === amount }"
          @click="selectAmount(amount)"
        >
          <text>¥{{ amount }}</text>
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="pay-method-section">
      <text class="section-title">支付方式</text>
      <view class="method-list">
        <view
          class="method-item"
          :class="{ active: payMethod === 'wechat' }"
          @click="payMethod = 'wechat'"
        >
          <text class="icon">微信</text>
          <text class="name">微信支付</text>
        </view>
        <view
          class="method-item"
          :class="{ active: payMethod === 'alipay' }"
          @click="payMethod = 'alipay'"
        >
          <text class="icon">支付宝</text>
          <text class="name">支付宝</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-btn" :disabled="!isValid || isPaying" @click="handlePay">
        {{ isPaying ? '处理中...' : '确认支付' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCostStore } from '../store/costStore';
import { usePayment } from '../composables/usePayment';
import { formatAmount, validatePaymentAmount, generateQuickAmounts } from '../utils';

const store = useCostStore();
const { isPaying, createOrder, doPayment } = usePayment();

// ========== State ==========
const inputAmount = ref<number | string>('');
const payMethod = ref<'wechat' | 'alipay'>('wechat');

// ========== Computed ==========
const balance = computed(() => store.currentCost?.balance || 0);
const formattedBalance = computed(() => formatAmount(balance.value));
const quickAmounts = computed(() => generateQuickAmounts(balance.value));

const isValid = computed(() => {
  const amount = Number(inputAmount.value);
  return validatePaymentAmount(amount).valid;
});

// ========== Methods ==========
const selectAmount = (amount: number) => {
  inputAmount.value = amount;
};

const handlePay = async () => {
  const amount = Number(inputAmount.value);
  if (!isValid.value) {
    uni.showToast({
      title: validatePaymentAmount(amount).message || '请输入有效金额',
      icon: 'none',
    });
    return;
  }

  try {
    const order = await createOrder(amount, payMethod.value);
    if (order) {
      const result = await doPayment(order.orderNo);
      if (result) {
        uni.showToast({
          title: '支付成功',
          icon: 'success',
        });
        // 刷新费用信息
        await store.refreshCostInfo();
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
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
.pay-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
}

.account-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 30rpx;

  .label {
    display: block;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 16rpx;
  }

  .balance {
    display: flex;
    justify-content: center;
    align-items: baseline;

    .currency {
      font-size: 36rpx;
      color: #fff;
      margin-right: 8rpx;
    }

    .amount {
      font-size: 64rpx;
      font-weight: bold;
      color: #fff;
    }
  }
}

.amount-section,
.pay-method-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #ddd;
  padding-bottom: 20rpx;
  margin-bottom: 30rpx;

  .currency {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-right: 16rpx;
  }

  .amount-input {
    flex: 1;
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .amount-tag {
    padding: 16rpx 32rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #666;

    &.active {
      background-color: #e6f7ff;
      color: #1890ff;
      border: 1rpx solid #1890ff;
    }
  }
}

.method-list {
  display: flex;
  gap: 20rpx;

  .method-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx;
    border: 2rpx solid #ddd;
    border-radius: 12rpx;

    &.active {
      border-color: #1890ff;
      background-color: #e6f7ff;
    }

    .icon {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
    }

    .name {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.submit-section {
  margin-top: 60rpx;

  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 44rpx;
    color: #fff;
    font-size: 32rpx;
    border: none;

    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>
