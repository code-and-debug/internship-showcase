<template>
  <view class="cost-detail-item">
    <view class="item-header">
      <text class="project-name">{{ item.projectName }}</text>
      <text class="amount">¥{{ formattedAmount }}</text>
    </view>
    <view class="item-info">
      <text class="date">{{ formatDate(item.date) }}</text>
      <text class="category" v-if="item.category">{{ item.category }}</text>
    </view>
    <view class="item-spec" v-if="item.specification || item.quantity">
      <text class="spec" v-if="item.specification">{{ item.specification }}</text>
      <text class="quantity" v-if="item.quantity">×{{ item.quantity }}</text>
      <text class="unit-price" v-if="item.unitPrice">¥{{ item.unitPrice }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatAmount, formatDate } from '../utils';
import type { ICostDetail } from '../types';

interface Props {
  /** 费用明细项 */
  item: ICostDetail;
}

const props = defineProps<Props>();

const formattedAmount = computed(() => formatAmount(props.item.amount));

const formatDateStr = (dateStr: string) => {
  if (!dateStr) return '';
  return formatDate(dateStr, 'date');
};
</script>

<style scoped lang="scss">
.cost-detail-item {
  background-color: #fff;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;

    .project-name {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }

    .amount {
      font-size: 30rpx;
      font-weight: bold;
      color: #ff6b6b;
    }
  }

  .item-info {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;

    .date {
      font-size: 24rpx;
      color: #999;
      margin-right: 16rpx;
    }

    .category {
      font-size: 22rpx;
      color: #666;
      background-color: #f5f5f5;
      padding: 4rpx 12rpx;
      border-radius: 4rpx;
    }
  }

  .item-spec {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #999;

    .spec {
      margin-right: 16rpx;
    }

    .quantity {
      margin-right: 16rpx;
    }

    .unit-price {
      color: #666;
    }
  }
}
</style>
