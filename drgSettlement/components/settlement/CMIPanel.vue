<template>
  <DataCard title="CMI分析">
    <view class="cmi-panel">
      <!-- CMI值展示 -->
      <view class="cmi-values">
        <view class="cmi-main">
          <text class="cmi-label">当前病例权重</text>
          <text class="cmi-value">{{ cmiData.currentWeight.toFixed(2) }}</text>
        </view>
        <view class="cmi-compare">
          <view class="compare-item">
            <text class="compare-label">医院平均</text>
            <text class="compare-value">{{ cmiData.hospitalAvgCMI.toFixed(2) }}</text>
          </view>
          <view class="compare-item">
            <text class="compare-label">全国平均</text>
            <text class="compare-value">{{ cmiData.nationalAvgCMI.toFixed(2) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 影响评估 -->
      <view 
        class="impact-section"
        :class="`impact-${cmiData.impact}`"
      >
        <view class="impact-header">
          <text class="impact-title">CMI影响评估</text>
          <view class="impact-badge" :class="`badge-${cmiData.impact}`">
            <text class="badge-text">{{ impactText }}</text>
          </view>
        </view>
        <text class="impact-desc">{{ cmiData.impactDescription }}</text>
        <view class="impact-percent">
          <text class="percent-label">差异</text>
          <text 
            class="percent-value"
            :class="cmiData.cmiDiff > 0 ? 'positive' : 'negative'"
          >
            {{ cmiData.cmiDiff > 0 ? '+' : '' }}{{ cmiData.impactPercent }}%
          </text>
        </view>
      </view>
      
      <!-- 优化建议 -->
      <view class="optimization">
        <text class="section-title">优化建议</text>
        <view class="optimization-card">
          <text class="optimization-icon">💡</text>
          <text class="optimization-text">{{ optimizationSuggestion }}</text>
        </view>
      </view>
    </view>
  </DataCard>
</template>

<script setup lang="ts">
/**
 * CMI分析面板组件
 * 
 * 用途：展示病例组合指数分析和影响评估
 */
import { computed } from 'vue';
import DataCard from '../common/DataCard.vue';
import type { ICMICalculation } from '../../types';

interface Props {
  cmiData: ICMICalculation;
  optimizationSuggestion: string;
}

const props = defineProps<Props>();

// 影响文本
const impactText = computed(() => {
  const texts = {
    positive: '正向影响',
    negative: '负向影响',
    neutral: '中性影响',
  };
  return texts[props.cmiData.impact];
});
</script>

<style scoped>
.cmi-panel {
  padding: 10rpx 0;
}

.cmi-values {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.cmi-main {
  flex: 1;
}

.cmi-label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.cmi-value {
  font-size: 56rpx;
  font-weight: 700;
  color: #1890ff;
}

.cmi-compare {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.compare-item {
  text-align: right;
}

.compare-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.compare-value {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.impact-section {
  padding: 24rpx;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}

.impact-positive {
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
}

.impact-negative {
  background-color: #fff2f0;
  border: 1rpx solid #ffccc7;
}

.impact-neutral {
  background-color: #f5f5f5;
  border: 1rpx solid #d9d9d9;
}

.impact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.impact-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.impact-badge {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.badge-positive {
  background-color: #52c41a;
}

.badge-negative {
  background-color: #ff4d4f;
}

.badge-neutral {
  background-color: #8c8c8c;
}

.badge-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.impact-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.impact-percent {
  display: flex;
  align-items: center;
}

.percent-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 12rpx;
}

.percent-value {
  font-size: 32rpx;
  font-weight: 600;
}

.percent-value.positive {
  color: #52c41a;
}

.percent-value.negative {
  color: #ff4d4f;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.optimization-card {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  background-color: #e6f7ff;
  border-radius: 12rpx;
}

.optimization-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.optimization-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}
</style>
