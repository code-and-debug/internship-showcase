<template>
  <view class="cost-analysis-page">
    <!-- 费用消耗进度 -->
    <DataCard title="费用消耗情况" :bgColor="warningBgColor">
      <view class="cost-progress">
        <view class="progress-header">
          <text class="progress-label">费用消耗率</text>
          <WarningTag type="warning" :level="drgAnalysis.warningLevel" />
        </view>
        <ProgressBar 
          :percent="Math.round(drgAnalysis.costRate)"
          :status="drgAnalysis.warningLevel"
          label="费用消耗"
        />
        <view class="progress-stats">
          <view class="stat-item">
            <text class="stat-label">支付标准</text>
            <text class="stat-value">¥{{ formatAmount(drgAnalysis.paymentStandard) }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">当前费用</text>
            <text class="stat-value">¥{{ formatAmount(drgAnalysis.currentCost) }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">预计结余</text>
            <text class="stat-value" :class="drgAnalysis.balance >= 0 ? 'positive' : 'negative'">
              {{ drgAnalysis.balance >= 0 ? '+' : '' }}¥{{ formatAmount(drgAnalysis.balance) }}
            </text>
          </view>
        </view>
      </view>
    </DataCard>
    
    <!-- 费用概览 -->
    <view class="cost-overview">
      <view class="overview-card">
        <text class="card-label">总费用</text>
        <text class="card-value">¥{{ formatAmount(settlement.totalCost) }}</text>
      </view>
      <view class="overview-card">
        <text class="card-label">医保支付</text>
        <text class="card-value">¥{{ formatAmount(settlement.insurancePay) }}</text>
      </view>
      <view class="overview-card">
        <text class="card-label">自付金额</text>
        <text class="card-value">¥{{ formatAmount(settlement.selfPay) }}</text>
      </view>
    </view>
    
    <!-- 病例类型和CMI -->
    <view class="type-cmi-row">
      <view class="type-card">
        <text class="card-label">病例类型</text>
        <WarningTag type="case" :level="drgAnalysis.caseType" />
      </view>
      <view class="cmi-card">
        <text class="card-label">CMI值</text>
        <text class="card-value">{{ cmiAnalysis.currentWeight.toFixed(2) }}</text>
      </view>
      <view class="compare-card">
        <text class="card-label">费用对比</text>
        <text class="card-value" :class="costComparison.compareWithDRG.value.percent > 0 ? 'high' : 'low'">
          {{ costComparison.compareWithDRG.value.percent > 0 ? '高于' : '低于' }}标准
        </text>
      </view>
    </view>
    
    <!-- CMI分析 -->
    <CMIPanel 
      :cmiData="cmiAnalysis.analysis.value"
      :optimizationSuggestion="optimizationSuggestion"
    />
    
    <!-- 费用构成 -->
    <CostStructure 
      :totalCost="costStructure.totalCost.value"
      :categoryStats="costStructure.categoryStats.value"
      :drugRatioWarning="costStructure.drugRatioWarning.value"
      :examRatioWarning="costStructure.examRatioWarning.value"
    />
    
    <!-- 费用对比 -->
    <DataCard title="费用对比">
      <view class="cost-comparison">
        <view class="compare-row">
          <text class="compare-label">当前费用</text>
          <text class="compare-value">¥{{ formatAmount(costComparison.analysis.value.currentCost) }}</text>
        </view>
        <view class="compare-row">
          <text class="compare-label">DRG支付标准</text>
          <text class="compare-value">¥{{ formatAmount(costComparison.analysis.value.drgPaymentStandard) }}</text>
        </view>
        <view class="compare-row">
          <text class="compare-label">同DRG组平均</text>
          <text class="compare-value">
            ¥{{ formatAmount(costComparison.analysis.value.sameDRGAvgCost) }}
            <text class="compare-diff" :class="costComparison.compareWithSameDRG.value.percent > 0 ? 'high' : 'low'">
              {{ costComparison.compareWithSameDRG.value.status }}
            </text>
          </text>
        </view>
        <view class="compare-row">
          <text class="compare-label">本院平均</text>
          <text class="compare-value">
            ¥{{ formatAmount(costComparison.analysis.value.sameHospitalAvgCost) }}
            <text class="compare-diff" :class="costComparison.compareWithHospital.value.percent > 0 ? 'high' : 'low'">
              {{ costComparison.compareWithHospital.value.status }}
            </text>
          </text>
        </view>
        <view class="percentile-section">
          <text class="percentile-label">费用百分位排名</text>
          <view class="percentile-bar">
            <view class="percentile-marker" :style="{ left: `${costComparison.analysis.value.percentile}%` }">
              <text class="marker-value">{{ costComparison.analysis.value.percentile }}%</text>
            </view>
          </view>
          <text class="percentile-desc">在同DRG组中处于中等水平</text>
        </view>
      </view>
    </DataCard>
    
    <!-- 飞检风险 -->
    <FlyCheckRisk 
      :assessment="flyCheckAssessment"
      :showApplyButton="true"
      @apply="onApplySpecialCase"
    />
  </view>
</template>

<script setup lang="ts">
/**
 * 费用分析页面
 */
import { ref, computed, onMounted } from 'vue';
import DataCard from '../../components/common/DataCard.vue';
import ProgressBar from '../../components/common/ProgressBar.vue';
import WarningTag from '../../components/common/WarningTag.vue';
import CMIPanel from '../../components/settlement/CMIPanel.vue';
import CostStructure from '../../components/settlement/CostStructure.vue';
import FlyCheckRisk from '../../components/settlement/FlyCheckRisk.vue';
import { formatAmount, WARNING_LEVEL_CONFIG } from '../../utils';
import { useDRGAnalysis } from '../../composables/useDRGAnalysis';
import { useCMICalculation } from '../../composables/useCMICalculation';
import { useFlyCheckRisk } from '../../composables/useFlyCheckRisk';
import { useCostComparison } from '../../composables/useCostComparison';
import { useCostStructure } from '../../composables/useCostStructure';
import type { ISettlementDetail } from '../../types';
import type { IUseDRGAnalysisOptions } from '../../composables/useDRGAnalysis';
import { mockSettlementDetail } from '../../mock/settlements';

// 结算详情
const settlement = ref<ISettlementDetail>(mockSettlementDetail);

// DRG分析参数
const drgParams: IUseDRGAnalysisOptions = {
  drgCode: computed(() => settlement.value.drgCode || '') as any,
  drgName: computed(() => settlement.value.drgName || '') as any,
  weight: computed(() => settlement.value.weight || 0) as any,
  paymentStandard: computed(() => settlement.value.paymentStandard || 0) as any,
  currentCost: computed(() => settlement.value.currentCost || settlement.value.totalCost) as any,
};

// DRG分析
const drgAnalysis = useDRGAnalysis(drgParams);

// CMI计算
const cmiAnalysis = useCMICalculation({
  drgWeight: computed(() => settlement.value.weight || 0),
  hospitalAvgCMI: ref(1.0),
});

// 飞检风险评估
const flyCheckAssessment = useFlyCheckRisk(settlement);

// 费用对比
const costComparison = useCostComparison({
  currentCost: computed(() => settlement.value.currentCost || settlement.value.totalCost),
  drgPaymentStandard: computed(() => settlement.value.paymentStandard || 0),
  sameDRGAvgCost: ref(7600),
  sameHospitalAvgCost: ref(7200),
});

// 费用结构
const costStructure = useCostStructure({
  costDetails: computed(() => settlement.value.costDetails || []),
});

// 预警背景色
const warningBgColor = computed(() => {
  return WARNING_LEVEL_CONFIG[drgAnalysis.warningLevel.value].bgColor;
});

// 优化建议
const optimizationSuggestion = computed(() => {
  return cmiAnalysis.optimizationSuggestion.value;
});

// 申请特病单议
const onApplySpecialCase = () => {
  uni.navigateTo({
    url: `/pagesD/drgSettlement/pages/settlement/specialCaseApply?settlementNo=${settlement.value.settlementNo}`,
  });
};

onMounted(() => {
  // 可以在这里加载实际数据
});
</script>

<style scoped>
.cost-analysis-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.cost-progress {
  padding: 10rpx 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.progress-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #e8e8e8;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.stat-value.positive {
  color: #52c41a;
}

.stat-value.negative {
  color: #ff4d4f;
}

.cost-overview {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.overview-card {
  flex: 1;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx 16rpx;
  text-align: center;
}

.overview-card .card-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.overview-card .card-value {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.type-cmi-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.type-card, .cmi-card, .compare-card {
  flex: 1;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx 16rpx;
  text-align: center;
}

.type-card .card-label,
.cmi-card .card-label,
.compare-card .card-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.cmi-card .card-value,
.compare-card .card-value {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.compare-card .card-value.high {
  color: #ff4d4f;
}

.compare-card .card-value.low {
  color: #52c41a;
}

.cost-comparison {
  padding: 10rpx 0;
}

.compare-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.compare-row:last-child {
  border-bottom: none;
}

.compare-label {
  font-size: 28rpx;
  color: #666;
}

.compare-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.compare-diff {
  font-size: 24rpx;
  margin-left: 12rpx;
}

.compare-diff.high {
  color: #ff4d4f;
}

.compare-diff.low {
  color: #52c41a;
}

.percentile-section {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.percentile-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.percentile-bar {
  height: 24rpx;
  background: linear-gradient(to right, #52c41a 0%, #52c41a 30%, #faad14 30%, #faad14 70%, #ff4d4f 70%, #ff4d4f 100%);
  border-radius: 12rpx;
  position: relative;
  margin-bottom: 16rpx;
}

.percentile-marker {
  position: absolute;
  top: -20rpx;
  transform: translateX(-50%);
}

.marker-value {
  font-size: 24rpx;
  color: #1890ff;
  font-weight: 600;
  background-color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.percentile-desc {
  font-size: 24rpx;
  color: #999;
}
</style>
