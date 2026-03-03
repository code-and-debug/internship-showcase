<template>
  <view class="progress-container">
    <view v-if="showLabel" class="progress-label">
      <text class="label-text">{{ label }}</text>
      <text class="percent-text" :style="{ color: statusColor }">{{ percent }}%</text>
    </view>
    <view class="progress-bg">
      <view 
        class="progress-fill" 
        :style="{ 
          width: `${Math.min(percent, 100)}%`,
          backgroundColor: statusColor 
        }"
      />
    </view>
    <view v-if="showInfo" class="progress-info">
      <text class="info-text">{{ infoText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 进度条组件
 * 
 * 用途：展示费用消耗率等百分比数据
 */
import { computed } from 'vue';
import { WARNING_LEVEL_CONFIG } from '../../constants';
import type { WarningLevel } from '../../types';

interface Props {
  percent: number;
  label?: string;
  showLabel?: boolean;
  showInfo?: boolean;
  infoText?: string;
  status?: WarningLevel;
}

const props = withDefaults(defineProps<Props>(), {
  label: '进度',
  showLabel: true,
  showInfo: false,
  infoText: '',
  status: 'safe',
});

// 根据状态获取颜色
const statusColor = computed(() => {
  return WARNING_LEVEL_CONFIG[props.status].progressColor;
});
</script>

<style scoped>
.progress-container {
  width: 100%;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.label-text {
  font-size: 26rpx;
  color: #666;
}

.percent-text {
  font-size: 28rpx;
  font-weight: 600;
}

.progress-bg {
  height: 16rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-info {
  margin-top: 12rpx;
}

.info-text {
  font-size: 24rpx;
  color: #999;
}
</style>
