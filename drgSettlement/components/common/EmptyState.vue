<template>
  <view class="empty-state">
    <view class="empty-icon">{{ icon }}</view>
    <text class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-desc">{{ description }}</text>
    <slot />
  </view>
</template>

<script setup lang="ts">
/**
 * 空状态组件
 * 
 * 用途：数据为空时的占位展示
 */
interface Props {
  icon?: string;
  title?: string;
  description?: string;
}

withDefaults(defineProps<Props>(), {
  icon: '空',
  title: '暂无数据',
  description: '',
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
}
</style>
