<template>
  <DataCard title="诊断信息">
    <view class="diagnosis-list">
      <!-- 主要诊断 -->
      <view v-if="mainDiagnosis" class="diagnosis-section">
        <text class="section-title">主要诊断</text>
        <view class="diagnosis-item main">
          <view class="diagnosis-header">
            <text class="diagnosis-code">{{ mainDiagnosis.diagnosisCode }}</text>
            <view class="diagnosis-tags">
              <text v-if="mainDiagnosis.isMCC" class="tag mcc">MCC</text>
              <text v-else-if="mainDiagnosis.isCC" class="tag cc">CC</text>
            </view>
          </view>
          <text class="diagnosis-name">{{ mainDiagnosis.diagnosisName }}</text>
          <view v-if="mainDiagnosis.evidenceLevel" class="evidence-level">
            <text class="evidence-label">诊断依据充分性：</text>
            <text 
              class="evidence-value"
              :class="`level-${mainDiagnosis.evidenceLevel}`"
            >
              {{ evidenceLevelText[mainDiagnosis.evidenceLevel] }}
            </text>
          </view>
        </view>
      </view>
      
      <!-- 次要诊断 -->
      <view v-if="secondaryDiagnoses.length > 0" class="diagnosis-section">
        <text class="section-title">
          次要诊断
          <text class="subtitle">（共{{ secondaryDiagnoses.length }}项）</text>
        </text>
        <view 
          v-for="(item, index) in secondaryDiagnoses" 
          :key="index"
          class="diagnosis-item secondary"
        >
          <view class="diagnosis-header">
            <text class="diagnosis-code">{{ item.diagnosisCode }}</text>
            <view class="diagnosis-tags">
              <text v-if="item.isMCC" class="tag mcc">MCC</text>
              <text v-else-if="item.isCC" class="tag cc">CC</text>
            </view>
          </view>
          <text class="diagnosis-name">{{ item.diagnosisName }}</text>
        </view>
      </view>
      
      <!-- CC/MCC说明 -->
      <view class="ccmcc-info">
        <text class="info-title">CC/MCC说明</text>
        <view class="info-content">
          <view class="info-item">
            <text class="info-tag mcc">MCC</text>
            <text class="info-text">主要并发症/合并症，对DRG权重影响较大</text>
          </view>
          <view class="info-item">
            <text class="info-tag cc">CC</text>
            <text class="info-text">并发症/合并症，对DRG权重有一定影响</text>
          </view>
        </view>
      </view>
    </view>
  </DataCard>
</template>

<script setup lang="ts">
/**
 * 诊断列表组件
 * 
 * 用途：展示诊断信息，包含CC/MCC标识
 */
import { computed } from 'vue';
import DataCard from '../common/DataCard.vue';
import type { IDiagnosisItem } from '../../types';

interface Props {
  diagnoses: IDiagnosisItem[];
}

const props = defineProps<Props>();

// 主要诊断
const mainDiagnosis = computed(() => {
  return props.diagnoses.find(d => d.diagnosisType === 'main');
});

// 次要诊断
const secondaryDiagnoses = computed(() => {
  return props.diagnoses
    .filter(d => d.diagnosisType === 'secondary')
    .sort((a, b) => a.order - b.order);
});

// 诊断依据等级文本
const evidenceLevelText = {
  strong: '充分',
  medium: '一般',
  weak: '不足',
};
</script>

<style scoped>
.diagnosis-list {
  padding: 10rpx 0;
}

.diagnosis-section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
}

.diagnosis-item {
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.diagnosis-item.main {
  background-color: #e6f7ff;
  border: 1rpx solid #91d5ff;
}

.diagnosis-item.secondary {
  background-color: #f5f5f5;
  border: 1rpx solid #d9d9d9;
}

.diagnosis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.diagnosis-code {
  font-size: 26rpx;
  color: #1890ff;
  font-weight: 500;
}

.diagnosis-tags {
  display: flex;
  gap: 8rpx;
}

.tag {
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.tag.mcc {
  background-color: #ff4d4f;
  color: #fff;
}

.tag.cc {
  background-color: #faad14;
  color: #fff;
}

.diagnosis-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.evidence-level {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(0,0,0,0.06);
}

.evidence-label {
  font-size: 24rpx;
  color: #666;
}

.evidence-value {
  font-size: 24rpx;
  font-weight: 500;
}

.evidence-value.level-strong {
  color: #52c41a;
}

.evidence-value.level-medium {
  color: #faad14;
}

.evidence-value.level-weak {
  color: #ff4d4f;
}

.ccmcc-info {
  margin-top: 24rpx;
  padding: 20rpx;
  background-color: #f6ffed;
  border-radius: 12rpx;
}

.info-title {
  display: block;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-tag {
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
  font-weight: 600;
  margin-right: 16rpx;
}

.info-tag.mcc {
  background-color: #ff4d4f;
  color: #fff;
}

.info-tag.cc {
  background-color: #faad14;
  color: #fff;
}

.info-text {
  flex: 1;
  font-size: 24rpx;
  color: #666;
}
</style>
