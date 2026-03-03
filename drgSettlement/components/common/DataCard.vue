<template>
  <view class="data-card" :style="{ backgroundColor: bgColor }">
    <view class="card-header">
      <text class="card-title">{{ title }}</text>
      <text v-if="subtitle" class="card-subtitle">{{ subtitle }}</text>
    </view>
    <view class="card-content">
      <slot />
    </view>
    <view v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 数据卡片组件
 * 
 * 用途：展示数据的通用卡片容器
 */
interface Props {
  title: string;
  subtitle?: string;
  bgColor?: string;
}

withDefaults(defineProps<Props>(), {
  bgColor: '#ffffff',
});
</script>

<style scoped>
.data-card {
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.card-subtitle {
  font-size: 24rpx;
  color: #999;
}

.card-content {
  position: relative;
}

.card-footer {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}
</style>
