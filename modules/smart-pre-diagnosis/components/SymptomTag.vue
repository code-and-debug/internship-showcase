<template>
  <view 
    class="symptom-tag" 
    :class="[severityClass, { 'is-selected': selected }]"
    @click="handleClick"
  >
    <text class="symptom-name">{{ name }}</text>
    <view v-if="showRemove" class="remove-icon" @click.stop="handleRemove">
      ×
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SeverityLevel } from '../types';

interface Props {
  /** 症状ID */
  id: string;
  /** 症状名称 */
  name: string;
  /** 严重程度 */
  severity?: SeverityLevel;
  /** 是否选中 */
  selected?: boolean;
  /** 是否显示移除按钮 */
  showRemove?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'mild',
  selected: false,
  showRemove: false,
});

const emit = defineEmits<{
  (e: 'click', id: string): void;
  (e: 'remove', id: string): void;
}>();

/** 严重程度样式类 */
const severityClass = computed(() => `severity-${props.severity}`);

/** 点击事件 */
const handleClick = () => {
  emit('click', props.id);
};

/** 移除事件 */
const handleRemove = () => {
  emit('remove', props.id);
};
</script>

<style lang="scss" scoped>
.symptom-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  margin: 8rpx;
  transition: all 0.2s ease;
  border: 2rpx solid transparent;
  
  &.severity-mild {
    background-color: #f6ffed;
    color: #52c41a;
    border-color: #b7eb8f;
  }
  
  &.severity-moderate {
    background-color: #fffbe6;
    color: #faad14;
    border-color: #ffe58f;
  }
  
  &.severity-severe {
    background-color: #fff2f0;
    color: #ff4d4f;
    border-color: #ffccc7;
  }
  
  &.is-selected {
    background-color: #1890ff;
    color: #ffffff;
    border-color: #1890ff;
  }
  
  .symptom-name {
    line-height: 1.4;
  }
  
  .remove-icon {
    margin-left: 8rpx;
    width: 32rpx;
    height: 32rpx;
    line-height: 28rpx;
    text-align: center;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.1);
    font-size: 24rpx;
  }
}
</style>
