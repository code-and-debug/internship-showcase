<template>
  <DataCard title="费用构成">
    <view class="cost-structure">
      <!-- 饼图区域 -->
      <view class="pie-chart">
        <view class="pie-placeholder">
          <view class="pie-center">
            <text class="pie-total-label">总费用</text>
            <text class="pie-total-value">¥{{ formatAmount(totalCost) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 图例列表 -->
      <view class="legend-list">
        <view 
          v-for="item in categoryStats" 
          :key="item.category"
          class="legend-item"
        >
          <view class="legend-header">
            <view class="legend-left">
              <view 
                class="legend-color" 
                :style="{ backgroundColor: item.color }"
              />
              <text class="legend-name">{{ item.label }}</text>
            </view>
            <text class="legend-amount">¥{{ formatAmount(item.amount) }}</text>
          </view>
          <view class="legend-bar">
            <view 
              class="legend-fill" 
              :style="{ 
                width: `${item.ratio * 100}%`,
                backgroundColor: item.color 
              }"
            />
          </view>
          <text class="legend-percent">{{ formatPercent(item.ratio) }}</text>
        </view>
      </view>
      
      <!-- 警告提示 -->
      <view v-if="drugRatioWarning" class="warning-tip">
        <text class="tip-icon">⚠</text>
        <text class="tip-text">药品占比超过50%，请关注药品使用合理性</text>
      </view>
      <view v-if="examRatioWarning" class="warning-tip">
        <text class="tip-icon">⚠</text>
        <text class="tip-text">检查占比超过40%，请关注检查项目合理性</text>
      </view>
    </view>
  </DataCard>
</template>

<script setup lang="ts">
/**
 * 费用构成组件
 * 
 * 用途：展示费用类别占比分析
 */
import DataCard from '../common/DataCard.vue';
import { formatAmount, formatPercent } from '../../utils';
import type { ICostCategoryStat } from '../../composables/useCostStructure';

interface Props {
  totalCost: number;
  categoryStats: ICostCategoryStat[];
  drugRatioWarning?: boolean;
  examRatioWarning?: boolean;
}

withDefaults(defineProps<Props>(), {
  drugRatioWarning: false,
  examRatioWarning: false,
});
</script>

<style scoped>
.cost-structure {
  padding: 10rpx 0;
}

.pie-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300rpx;
  margin-bottom: 32rpx;
}

.pie-placeholder {
  width: 260rpx;
  height: 260rpx;
  border-radius: 50%;
  background: conic-gradient(
    #722ed1 0% 25%,
    #13c2c2 25% 50%,
    #eb2f96 50% 70%,
    #1890ff 70% 85%,
    #fa8c16 85% 95%,
    #8c8c8c 95% 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pie-center {
  width: 160rpx;
  height: 160rpx;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pie-total-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.pie-total-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.legend-item {
  position: relative;
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.legend-left {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;
  margin-right: 12rpx;
}

.legend-name {
  font-size: 28rpx;
  color: #333;
}

.legend-amount {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.legend-bar {
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.legend-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.legend-percent {
  font-size: 24rpx;
  color: #999;
}

.warning-tip {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background-color: #fffbe6;
  border: 1rpx solid #ffe58f;
  border-radius: 8rpx;
  margin-top: 24rpx;
}

.tip-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.tip-text {
  flex: 1;
  font-size: 26rpx;
  color: #d48806;
}
</style>
