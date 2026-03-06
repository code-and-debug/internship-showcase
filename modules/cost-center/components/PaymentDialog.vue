<template>
  <view class="payment-dialog" v-if="visible">
    <view class="dialog-mask" @click="handleClose"></view>
    <view class="dialog-content">
      <view class="dialog-header">
        <text class="title">{{ title }}</text>
        <text class="close" @click="handleClose">×</text>
      </view>

      <view class="dialog-body">
        <!-- 金额输入 -->
        <view class="amount-section">
          <text class="label">充值金额</text>
          <view class="amount-input">
            <text class="currency">¥</text>
            <input
              type="digit"
              v-model="inputAmount"
              placeholder="请输入充值金额"
              @input="handleAmountInput"
            />
          </view>
        </view>

        <!-- 快捷金额选项 -->
        <view class="quick-amounts" v-if="quickAmounts.length > 0">
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

        <!-- 支付方式选择 -->
        <view class="pay-method-section">
          <text class="label">支付方式</text>
          <view class="method-list">
            <view
              class="method-item"
              :class="{ active: payMethod === 'wechat' }"
              @click="selectMethod('wechat')"
            >
              <text class="method-icon">微信</text>
              <text class="method-name">微信支付</text>
            </view>
            <view
              class="method-item"
              :class="{ active: payMethod === 'alipay' }"
              @click="selectMethod('alipay')"
            >
              <text class="method-icon">支付宝</text>
              <text class="method-name">支付宝</text>
            </view>
          </view>
        </view>

        <!-- 错误提示 -->
        <view class="error-tip" v-if="errorMessage">
          <text>{{ errorMessage }}</text>
        </view>
      </view>

      <view class="dialog-footer">
        <button class="btn-confirm" :disabled="isLoading" @click="handleConfirm">
          {{ isLoading ? '处理中...' : '确认支付' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { validatePaymentAmount, formatAmount } from '../utils';

interface Props {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 弹窗标题 */
  title?: string;
  /** 当前余额 */
  balance?: number;
  /** 快捷金额选项 */
  quickAmounts?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  title: '在线充值',
  balance: 0,
  quickAmounts: () => [100, 500, 1000, 2000, 5000],
});

const emit = defineEmits<{
  close: [];
  confirm: [data: { amount: number; payMethod: 'wechat' | 'alipay' }];
}>();

// ========== State ==========
const inputAmount = ref<number | string>('');
const payMethod = ref<'wechat' | 'alipay'>('wechat');
const errorMessage = ref('');
const isLoading = ref(false);

// ========== Watch ==========
watch(() => props.visible, (val) => {
  if (!val) {
    // 关闭时重置
    inputAmount.value = '';
    errorMessage.value = '';
    isLoading.value = false;
  }
});

// ========== Methods ==========
const handleClose = () => {
  emit('close');
};

const handleAmountInput = () => {
  errorMessage.value = '';
};

const selectAmount = (amount: number) => {
  inputAmount.value = amount;
  errorMessage.value = '';
};

const selectMethod = (method: 'wechat' | 'alipay') => {
  payMethod.value = method;
};

const handleConfirm = async () => {
  const amount = Number(inputAmount.value);
  const validation = validatePaymentAmount(amount);

  if (!validation.valid) {
    errorMessage.value = validation.message || '请输入有效金额';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    emit('confirm', { amount, payMethod: payMethod.value });
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '支付失败';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.payment-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;

  .dialog-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .dialog-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border-radius: 32rpx 32rpx 0 0;
    max-height: 80vh;
    overflow-y: auto;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .close {
      font-size: 48rpx;
      color: #999;
      line-height: 1;
    }
  }

  .dialog-body {
    padding: 30rpx;
  }

  .amount-section {
    margin-bottom: 30rpx;

    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
    }

    .amount-input {
      display: flex;
      align-items: center;
      border-bottom: 2rpx solid #ddd;
      padding-bottom: 20rpx;

      .currency {
        font-size: 48rpx;
        font-weight: bold;
        color: #333;
        margin-right: 16rpx;
      }

      input {
        flex: 1;
        font-size: 48rpx;
        font-weight: bold;
        color: #333;
      }
    }
  }

  .quick-amounts {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 30rpx;

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

  .pay-method-section {
    margin-bottom: 30rpx;

    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
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

        .method-icon {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 8rpx;
        }

        .method-name {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
  }

  .error-tip {
    padding: 16rpx;
    background-color: #fff2f0;
    border-radius: 8rpx;
    margin-bottom: 20rpx;

    text {
      font-size: 24rpx;
      color: #ff4d4f;
    }
  }

  .dialog-footer {
    padding: 30rpx;
    border-top: 1rpx solid #f0f0f0;

    .btn-confirm {
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
}
</style>
