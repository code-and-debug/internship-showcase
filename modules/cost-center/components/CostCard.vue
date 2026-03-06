<template>
  <view class="cost-card" @click="handleClick">
    <view class="card-icon">
      <text class="iconfont">{{ icon }}</text>
    </view>
    <view class="card-content">
      <text class="card-title">{{ title }}</text>
      <text class="card-desc" v-if="desc">{{ desc }}</text>
    </view>
    <view class="card-arrow">
      <text class="arrow">›</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 图标 */
  icon?: string;
  /** 标题 */
  title: string;
  /** 描述 */
  desc?: string;
}

withDefaults(defineProps<Props>(), {
  icon: '💰',
  title: '',
  desc: '',
});

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit('click');
};
</script>

<style scoped lang="scss">
.cost-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .card-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;

    .iconfont {
      font-size: 40rpx;
    }
  }

  .card-content {
    flex: 1;

    .card-title {
      display: block;
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
    }

    .card-desc {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }

  .card-arrow {
    .arrow {
      font-size: 40rpx;
      color: #ccc;
    }
  }
}
</style>
