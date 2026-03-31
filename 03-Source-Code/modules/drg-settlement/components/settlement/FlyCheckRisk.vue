<template>
  <DataCard 
    :title="`飞检风险评估 - ${riskConfig.label}`" 
    :bgColor="riskConfig.bgColor"
  >
    <view class="flycheck-risk">
      <!-- 风险分数 -->
      <view class="risk-score-section">
        <view class="score-circle" :style="{ borderColor: riskConfig.color }">
          <text class="score-value" :style="{ color: riskConfig.color }">
            {{ assessment.riskScore }}
          </text>
          <text class="score-label">风险分</text>
        </view>
        <view class="score-desc">
          <text class="desc-title">评估结果</text>
          <text class="desc-text">{{ riskDescription }}</text>
        </view>
      </view>
      
      <!-- 风险因素 -->
      <view class="risk-factors">
        <text class="section-title">风险因素分析</text>
        <view class="factor-list">
          <view 
            v-for="(checked, factor) in assessment.riskFactors" 
            :key="factor"
            class="factor-item"
            :class="{ 'is-risk': checked }"
          >
            <text class="factor-icon">{{ checked ? '⚠' : '✓' }}</text>
            <text class="factor-name">{{ factorNames[factor as keyof typeof factorNames] }}</text>
            <text class="factor-status">{{ checked ? '存在风险' : '正常' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 规避建议 -->
      <view class="suggestions">
        <text class="section-title">规避建议</text>
        <view 
          v-for="(suggestion, index) in assessment.suggestions" 
          :key="index"
          class="suggestion-item"
        >
          <text class="suggestion-num">{{ index + 1 }}</text>
          <text class="suggestion-text">{{ suggestion }}</text>
        </view>
      </view>
      
      <!-- 需要准备的材料 -->
      <view class="documents">
        <text class="section-title">需要准备的材料</text>
        <view class="doc-list">
          <view 
            v-for="(doc, index) in assessment.requiredDocuments" 
            :key="index"
            class="doc-item"
          >
            <text class="doc-icon">📄</text>
            <text class="doc-name">{{ doc }}</text>
          </view>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view v-if="showApplyButton" class="action-section">
        <button class="apply-btn" @click="onApplyClick">
          申请特病单议
        </button>
      </view>
    </view>
  </DataCard>
</template>

<script setup lang="ts">
/**
 * 飞检风险评估组件
 * 
 * 用途：展示飞检风险评估结果和建议
 */
import { computed } from 'vue';
import DataCard from '../common/DataCard.vue';
import { RISK_LEVEL_CONFIG } from '../../constants';
import type { IFlyCheckRisk, RiskLevel } from '../../types';

interface Props {
  assessment: IFlyCheckRisk;
  showApplyButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showApplyButton: true,
});

const emit = defineEmits<{
  (e: 'apply'): void;
}>();

// 风险等级配置
const riskConfig = computed(() => {
  return RISK_LEVEL_CONFIG[props.assessment.riskLevel];
});

// 风险描述
const riskDescription = computed(() => {
  const descriptions: Record<RiskLevel, string> = {
    low: '该病例风险较低，正常准备诊疗记录即可',
    medium: '该病例存在一定风险，建议提前准备相关材料',
    high: '该病例为高风险病例，属于飞检重点审查对象，请务必准备充分的诊断依据',
  };
  return descriptions[props.assessment.riskLevel];
});

// 风险因素名称映射
const factorNames = {
  highRateCase: '高倍率病例',
  diagnosisMismatch: '诊断不匹配',
  excessiveDrugUse: '药品使用异常',
  repeatedExam: '重复检查',
  lackOfDocumentation: '诊断依据不足',
};

// 点击申请按钮
const onApplyClick = () => {
  emit('apply');
};
</script>

<style scoped>
.flycheck-risk {
  padding: 10rpx 0;
}

.risk-score-section {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 24rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.score-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border-width: 6rpx;
  border-style: solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.score-value {
  font-size: 40rpx;
  font-weight: 700;
}

.score-label {
  font-size: 22rpx;
  color: #999;
}

.score-desc {
  flex: 1;
}

.desc-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.desc-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.risk-factors {
  margin-bottom: 24rpx;
}

.factor-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.factor-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.factor-item.is-risk {
  background-color: #fff2f0;
}

.factor-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.factor-name {
  flex: 1;
  font-size: 26rpx;
  color: #666;
}

.factor-status {
  font-size: 24rpx;
  color: #999;
}

.factor-item.is-risk .factor-name {
  color: #333;
}

.factor-item.is-risk .factor-status {
  color: #ff4d4f;
}

.suggestions {
  margin-bottom: 24rpx;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
  padding: 16rpx 20rpx;
  background-color: #e6f7ff;
  border-radius: 8rpx;
}

.suggestion-num {
  width: 36rpx;
  height: 36rpx;
  background-color: #1890ff;
  color: #fff;
  font-size: 22rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.doc-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.doc-item {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background-color: #f6ffed;
  border: 1rpx solid #b7eb8f;
  border-radius: 8rpx;
}

.doc-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.doc-name {
  font-size: 24rpx;
  color: #52c41a;
}

.action-section {
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #e8e8e8;
}

.apply-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #1890ff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
  border: none;
}

.apply-btn:active {
  background-color: #096dd9;
}
</style>
