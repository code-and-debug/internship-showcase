<template>
  <view class="refund-form">
    <!-- 退费金额 -->
    <view class="form-item">
      <text class="label">退费金额</text>
      <view class="amount-display">
        <text class="currency">¥</text>
        <text class="amount">{{ formattedAmount }}</text>
      </view>
    </view>

    <!-- 退费原因 -->
    <view class="form-item">
      <text class="label">退费原因 <text class="required">*</text></text>
      <textarea
        class="reason-input"
        v-model="reason"
        placeholder="请输入退费原因（必填）"
        maxlength="200"
        @input="handleReasonInput"
      />
      <text class="word-count">{{ reason.length }}/200</text>
    </view>

    <!-- 注意事项 -->
    <view class="notice">
      <text class="notice-title">温馨提示</text>
      <text class="notice-item">1. 退费申请提交后，将在1-3个工作日内处理</text>
      <text class="notice-item">2. 退费将原路返回至您的支付账户</text>
      <text class="notice-item">3. 如有疑问，请联系医院财务部门</text>
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" :disabled="isSubmitting" @click="handleSubmit">
      {{ isSubmitting ? '提交中...' : '提交申请' }}
    </button>

    <!-- 错误提示 -->
    <view class="error-toast" v-if="errorMessage">
      <text>{{ errorMessage }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatAmount } from '../utils';

interface Props {
  /** 退费金额 */
  refundAmount: number;
  /** 是否正在提交 */
  isSubmitting?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  refundAmount: 0,
  isSubmitting: false,
});

const emit = defineEmits<{
  submit: [data: { refundAmount: number; reason: string }];
}>();

// ========== State ==========
const reason = ref('');
const errorMessage = ref('');

// ========== Computed ==========
const formattedAmount = computed(() => formatAmount(props.refundAmount));

// ========== Methods ==========
const handleReasonInput = () => {
  errorMessage.value = '';
};

const handleSubmit = () => {
  // 验证
  if (!reason.value || reason.value.trim().length === 0) {
    errorMessage.value = '请填写退费原因';
    return;
  }

  if (reason.value.length > 200) {
    errorMessage.value = '退费原因不能超过200字';
    return;
  }

  emit('submit', {
    refundAmount: props.refundAmount,
    reason: reason.value.trim(),
  });
};
</script>

<style scoped lang="scss">
.refund-form {
  padding: 30rpx;
  background-color: #fff;
}

.form-item {
  margin-bottom: 40rpx;

  .label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;

    .required {
      color: #ff4d4f;
    }
  }

  .amount-display {
    display: flex;
    align-items: baseline;
    padding: 24rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;

    .currency {
      font-size: 32rpx;
      color: #ff6b6b;
      margin-right: 8rpx;
    }

    .amount {
      font-size: 48rpx;
      font-weight: bold;
      color: #ff6b6b;
    }
  }

  .reason-input {
    width: 100%;
    height: 200rpx;
    padding: 24rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
  }

  .word-count {
    display: block;
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
  }
}

.notice {
  padding: 24rpx;
  background-color: #f0f9ff;
  border-radius: 8rpx;
  margin-bottom: 40rpx;

  .notice-title {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: #1890ff;
    margin-bottom: 16rpx;
  }

  .notice-item {
    display: block;
    font-size: 24rpx;
    color: #666;
    line-height: 1.8;
  }
}

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

.error-toast {
  margin-top: 20rpx;
  padding: 16rpx;
  background-color: #fff2f0;
  border-radius: 8rpx;
  text-align: center;

  text {
    font-size: 24rpx;
    color: #ff4d4f;
  }
}
</style>
