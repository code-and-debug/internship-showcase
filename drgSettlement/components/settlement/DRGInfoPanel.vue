<template>
  <DataCard title="DRG信息">
    <view class="drg-info">
      <!-- DRG编码和名称 -->
      <view class="drg-header">
        <view class="drg-code">{{ drgInfo.drgCode }}</view>
        <view class="drg-name">{{ drgInfo.drgName }}</view>
      </view>
      
      <!-- 权重 -->
      <view class="info-row">
        <text class="info-label">DRG权重</text>
        <text class="info-value highlight">{{ drgInfo.weight }}</text>
      </view>
      
      <!-- 支付标准 -->
      <view class="info-row">
        <text class="info-label">医保支付标准</text>
        <text class="info-value">¥{{ formatAmount(drgInfo.paymentStandard) }}</text>
      </view>
      
      <!-- 当前费用 -->
      <view class="info-row">
        <text class="info-label">当前费用</text>
        <text class="info-value">¥{{ formatAmount(drgInfo.currentCost) }}</text>
      </view>
      
      <!-- 费用消耗率 -->
      <view class="cost-rate-section">
        <view class="rate-header">
          <text class="rate-label">费用消耗率</text>
          <WarningTag 
            type="warning" 
            :level="drgInfo.warningLevel" 
          />
        </view>
        <ProgressBar 
          :percent="Math.round(drgInfo.costRate)" 
          :status="drgInfo.warningLevel"
          label="费用消耗"
        />
        <text class="rate-desc">{{ drgInfo.warningDescription }}</text>
      </view>
      
      <!-- 病例类型 -->
      <view class="case-type-section">
        <text class="section-label">病例类型</text>
        <WarningTag 
          type="case" 
          :level="drgInfo.caseType" 
        />
      </view>
      
      <!-- 建议 -->
      <view v-if="drgInfo.suggestions.length > 0" class="suggestions">
        <text class="suggestions-title">优化建议</text>
        <view 
          v-for="(suggestion, index) in drgInfo.suggestions" 
          :key="index"
          class="suggestion-item"
        >
          <text class="suggestion-dot">•</text>
          <text class="suggestion-text">{{ suggestion }}</text>
        </view>
      </view>
    </view>
  </DataCard>
</template>

<script setup lang="ts">
/**
 * DRG信息面板组件
 * 
 * 用途：展示DRG分组信息、费用消耗率、病例类型等
 */
import DataCard from '../common/DataCard.vue';
import ProgressBar from '../common/ProgressBar.vue';
import WarningTag from '../common/WarningTag.vue';
import { formatAmount } from '../../utils';
import type { IDRGAnalysisResult } from '../../types';

interface Props {
  drgInfo: IDRGAnalysisResult;
}

defineProps<Props>();
</script>

<style scoped>
.drg-info {
  padding: 10rpx 0;
}

.drg-header {
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.drg-code {
  font-size: 36rpx;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 8rpx;
}

.drg-name {
  font-size: 28rpx;
  color: #666;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.info-value.highlight {
  color: #1890ff;
  font-size: 32rpx;
}

.cost-rate-section {
  margin-top: 24rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
}

.rate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.rate-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.rate-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.case-type-section {
  margin-top: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-label {
  font-size: 28rpx;
  color: #666;
}

.suggestions {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.suggestions-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.suggestion-dot {
  font-size: 32rpx;
  color: #1890ff;
  margin-right: 12rpx;
  line-height: 1.2;
}

.suggestion-text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>
