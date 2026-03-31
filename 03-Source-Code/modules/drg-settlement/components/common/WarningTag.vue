<template>
  <view 
    class="warning-tag" 
    :style="{ 
      backgroundColor: config.bgColor,
      borderColor: config.borderColor 
    }"
  >
    <text class="tag-icon">{{ icon }}</text>
    <text class="tag-text" :style="{ color: config.color }">{{ config.label }}</text>
  </view>
</template>

<script setup lang="ts">
/**
 * 警告标签组件
 * 
 * 用途：展示预警级别、风险等级等状态标签
 */
import { computed } from 'vue';
import { WARNING_LEVEL_CONFIG, RISK_LEVEL_CONFIG, CASE_TYPE_CONFIG } from '../../constants';
import type { WarningLevel, RiskLevel, CaseType } from '../../types';

interface Props {
  type: 'warning' | 'risk' | 'case';
  level: WarningLevel | RiskLevel | CaseType;
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
});

// 获取配置
const config = computed(() => {
  switch (props.type) {
    case 'warning':
      return WARNING_LEVEL_CONFIG[props.level as WarningLevel];
    case 'risk':
      return RISK_LEVEL_CONFIG[props.level as RiskLevel];
    case 'case':
      return CASE_TYPE_CONFIG[props.level as CaseType];
    default:
      return WARNING_LEVEL_CONFIG.safe;
  }
});

// 图标
const icon = computed(() => {
  if (!props.showIcon) return '';
  switch (props.level) {
    case 'safe':
    case 'low':
    case 'normal':
      return '✓';
    case 'warning':
    case 'medium':
      return '!';
    case 'danger':
    case 'high':
      return '⚠';
    default:
      return '';
  }
});
</script>

<style scoped>
.warning-tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  border-width: 1rpx;
  border-style: solid;
}

.tag-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.tag-text {
  font-size: 24rpx;
  font-weight: 500;
}
</style>
