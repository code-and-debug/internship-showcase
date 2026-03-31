<template>
  <view 
    class="body-part-card" 
    :class="{ 'is-selected': selected }"
    @click="handleClick"
  >
    <image 
      v-if="icon" 
      class="part-icon" 
      :src="icon" 
      mode="aspectFit"
    />
    <text v-else class="part-icon-text">{{ name.charAt(0) }}</text>
    <text class="part-name">{{ name }}</text>
    <view v-if="selected" class="check-badge">✓</view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 部位ID */
  id: string;
  /** 部位名称 */
  name: string;
  /** 图标 */
  icon?: string;
  /** 是否选中 */
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
});

const emit = defineEmits<{
  (e: 'click', id: string): void;
}>();

/** 点击事件 */
const handleClick = () => {
  emit('click', props.id);
};
</script>

<style lang="scss" scoped>
.body-part-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 160rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;
  margin: 12rpx;

  &.is-selected {
    background-color: #e6f7ff;
    border-color: #1890ff;
  }

  .part-icon {
    width: 64rpx;
    height: 64rpx;
    margin-bottom: 8rpx;
  }

  .part-icon-text {
    font-size: 40rpx;
    font-weight: bold;
    color: #666666;
    margin-bottom: 8rpx;
  }

  .part-name {
    font-size: 24rpx;
    color: #333333;
    text-align: center;
  }

  .check-badge {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 32rpx;
    height: 32rpx;
    line-height: 30rpx;
    text-align: center;
    background-color: #1890ff;
    color: #ffffff;
    border-radius: 50%;
    font-size: 20rpx;
  }
}
</style>
