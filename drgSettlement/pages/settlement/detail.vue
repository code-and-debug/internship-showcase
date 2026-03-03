<template>
  <view class="settlement-detail-page">
    <!-- 头部信息 -->
    <view class="header-card">
      <view class="hospital-info">
        <text class="hospital-name">{{ settlement.hosName }}</text>
        <text class="settlement-date">{{ formatDate(settlement.settlementDate) }}</text>
      </view>
      <view class="amount-info">
        <view class="amount-item">
          <text class="amount-label">总费用</text>
          <text class="amount-value total">¥{{ formatAmount(settlement.totalCost) }}</text>
        </view>
        <view class="amount-row">
          <view class="amount-item">
            <text class="amount-label">医保支付</text>
            <text class="amount-value">¥{{ formatAmount(settlement.insurancePay) }}</text>
          </view>
          <view class="amount-item">
            <text class="amount-label">自付金额</text>
            <text class="amount-value">¥{{ formatAmount(settlement.selfPay) }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Tab切换 -->
    <view class="tab-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        <text>{{ tab.label }}</text>
        <view v-if="tab.badge" class="tab-badge">{{ tab.badge }}</view>
      </view>
    </view>
    
    <!-- Tab内容 -->
    <scroll-view class="tab-content" scroll-y>
      <!-- 结算清单 -->
      <view v-if="currentTab === 'bill'" class="content-section">
        <view class="pdf-placeholder">
          <text class="pdf-icon">📄</text>
          <text class="pdf-text">结算清单PDF预览</text>
          <button class="download-btn">下载PDF</button>
        </view>
      </view>
      
      <!-- 费用明细 -->
      <view v-if="currentTab === 'cost'" class="content-section">
        <CostStructure 
          :totalCost="costStructure.totalCost.value"
          :categoryStats="costStructure.categoryStats.value"
        />
        <view class="cost-list">
          <text class="list-title">费用明细</text>
          <view 
            v-for="item in costStructure.sortedCostDetails.value" 
            :key="item.itemCode"
            class="cost-item"
          >
            <view class="item-info">
              <text class="item-name">{{ item.itemName }}</text>
              <text class="item-category">{{ getCategoryLabel(item.category) }}</text>
            </view>
            <text class="item-amount">¥{{ formatAmount(item.amount) }}</text>
          </view>
        </view>
      </view>
      
      <!-- DRG信息 -->
      <view v-if="currentTab === 'drg'" class="content-section">
        <DRGInfoPanel :drgInfo="drgAnalysis.analysis.value" />
      </view>
      
      <!-- 诊断信息 -->
      <view v-if="currentTab === 'diagnosis'" class="content-section">
        <DiagnosisList :diagnoses="settlement.diagnoses" />
      </view>
      
      <!-- 飞检风险 -->
      <view v-if="currentTab === 'risk'" class="content-section">
        <FlyCheckRisk 
          :assessment="flyCheckAssessment.assessment.value"
          :showApplyButton="true"
          @apply="onApplySpecialCase"
        />
      </view>
    </scroll-view>
    
    <!-- 底部操作 -->
    <view class="footer-bar">
      <button class="analysis-btn" @click="goToAnalysis">费用分析</button>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 结算详情页面
 */
import { ref, computed, onMounted } from 'vue';
import DRGInfoPanel from '../../components/settlement/DRGInfoPanel.vue';
import DiagnosisList from '../../components/settlement/DiagnosisList.vue';
import FlyCheckRisk from '../../components/settlement/FlyCheckRisk.vue';
import CostStructure from '../../components/settlement/CostStructure.vue';
import { formatAmount, formatDate, getCostCategoryConfig } from '../../utils';
import { useDRGAnalysis } from '../../composables/useDRGAnalysis';
import { useFlyCheckRisk } from '../../composables/useFlyCheckRisk';
import { useCostStructure } from '../../composables/useCostStructure';
import type { ISettlementDetail } from '../../types';
import { mockSettlementDetail } from '../../mock/settlements';

// 获取页面参数
const settlementNo = ref('');

// 结算详情
const settlement = ref<ISettlementDetail>(mockSettlementDetail);

// Tab选项
const tabs = [
  { label: '结算清单', value: 'bill' },
  { label: '费用明细', value: 'cost' },
  { label: 'DRG信息', value: 'drg' },
  { label: '诊断信息', value: 'diagnosis' },
  { label: '飞检风险', value: 'risk', badge: settlement.value.flyCheckRisk === 'high' ? '高' : undefined },
];

// 当前Tab
const currentTab = ref('bill');

// DRG分析
const drgParams = {
  drgCode: computed(() => settlement.value.drgCode || ''),
  drgName: computed(() => settlement.value.drgName || ''),
  weight: computed(() => settlement.value.weight || 0),
  paymentStandard: computed(() => settlement.value.paymentStandard || 0),
  currentCost: computed(() => settlement.value.currentCost || settlement.value.totalCost),
};
const drgAnalysis = useDRGAnalysis(drgParams);

// 飞检风险评估
const flyCheckAssessment = useFlyCheckRisk(settlement);

// 费用结构
const costStructure = useCostStructure({
  costDetails: computed(() => settlement.value.costDetails || []),
});

// 获取类别标签
const getCategoryLabel = (category: string) => {
  return getCostCategoryConfig(category as any).label;
};

// 申请特病单议
const onApplySpecialCase = () => {
  uni.navigateTo({
    url: `/pagesD/drgSettlement/pages/settlement/specialCaseApply?settlementNo=${settlement.value.settlementNo}`,
  });
};

// 跳转到费用分析
const goToAnalysis = () => {
  uni.navigateTo({
    url: `/pagesD/drgSettlement/pages/settlement/costAnalysis?settlementNo=${settlement.value.settlementNo}`,
  });
};

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || currentPage.$route?.query || {};
  settlementNo.value = options.settlementNo || '';
});
</script>

<style scoped>
.settlement-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-card {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.hospital-info {
  margin-bottom: 24rpx;
}

.hospital-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.settlement-date {
  font-size: 26rpx;
  color: #999;
}

.amount-info {
  background-color: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
}

.amount-item {
  text-align: center;
}

.amount-item .amount-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.amount-item .amount-value {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.amount-item .amount-value.total {
  font-size: 48rpx;
  color: #ff4d4f;
}

.amount-row {
  display: flex;
  justify-content: space-around;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #e8e8e8;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1rpx solid #e8e8e8;
  overflow-x: auto;
}

.tab-item {
  flex-shrink: 0;
  padding: 24rpx 30rpx;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.tab-item text {
  font-size: 28rpx;
  color: #666;
  white-space: nowrap;
}

.tab-item.active text {
  color: #1890ff;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #1890ff;
  border-radius: 2rpx;
}

.tab-badge {
  background-color: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.tab-content {
  flex: 1;
  height: calc(100vh - 400rpx);
}

.content-section {
  padding: 20rpx;
}

.pdf-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.pdf-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.pdf-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 32rpx;
}

.download-btn {
  width: 240rpx;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #1890ff;
  color: #fff;
  font-size: 28rpx;
  border-radius: 12rpx;
  border: none;
}

.cost-list {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 20rpx;
}

.list-title {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.cost-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.item-category {
  font-size: 24rpx;
  color: #999;
}

.item-amount {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.footer-bar {
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #e8e8e8;
}

.analysis-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #1890ff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
  border: none;
}
</style>
