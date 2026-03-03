<template>
  <view class="settlement-list-page">
    <!-- 顶部筛选 -->
    <view class="filter-bar">
      <view class="filter-tabs">
        <view 
          v-for="tab in filterTabs" 
          :key="tab.value"
          class="filter-tab"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>
    </view>
    
    <!-- 列表内容 -->
    <scroll-view 
      class="list-container" 
      scroll-y
      @scrolltolower="loadMore"
    >
      <view v-if="filteredList.length > 0" class="settlement-list">
        <view 
          v-for="item in filteredList" 
          :key="item.settlementNo"
          class="settlement-card"
          @click="goToDetail(item)"
        >
          <!-- 卡片头部 -->
          <view class="card-header">
            <view class="header-left">
              <text class="hospital-name">{{ item.hosName }}</text>
              <text class="settlement-date">{{ formatDate(item.settlementDate) }}</text>
            </view>
            <view class="header-right">
              <WarningTag 
                v-if="item.warningLevel && item.warningLevel !== 'safe'"
                type="warning" 
                :level="item.warningLevel"
              />
            </view>
          </view>
          
          <!-- 卡片内容 -->
          <view class="card-body">
            <view class="info-row">
              <text class="info-label">结算类型</text>
              <text class="info-value">{{ item.projectType === '1' ? '门诊' : '住院' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">总费用</text>
              <text class="info-value amount">¥{{ formatAmount(item.totalCost) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">医保支付</text>
              <text class="info-value">¥{{ formatAmount(item.insurancePay) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">自付金额</text>
              <text class="info-value">¥{{ formatAmount(item.selfPay) }}</text>
            </view>
            
            <!-- DRG信息 -->
            <view v-if="item.drgCode" class="drg-info">
              <view class="drg-row">
                <text class="drg-code">{{ item.drgCode }}</text>
                <text class="drg-name">{{ item.drgName }}</text>
              </view>
              <view v-if="item.costRate" class="cost-rate-row">
                <text class="rate-label">费用消耗率</text>
                <view class="rate-bar">
                  <view 
                    class="rate-fill" 
                    :class="getWarningLevel(item.costRate)"
                    :style="{ width: `${Math.min(item.costRate, 100)}%` }"
                  />
                </view>
                <text class="rate-value" :class="getWarningLevel(item.costRate)">
                  {{ item.costRate.toFixed(1) }}%
                </text>
              </view>
            </view>
            
            <!-- 风险提示 -->
            <view v-if="item.flyCheckRisk && item.flyCheckRisk !== 'low'" class="risk-tip">
              <text class="tip-icon">⚠</text>
              <text class="tip-text">
                {{ item.flyCheckRisk === 'high' ? '飞检高风险' : '飞检中风险' }}
              </text>
            </view>
          </view>
          
          <!-- 卡片底部 -->
          <view class="card-footer">
            <text class="action-text">查看详情</text>
            <text class="arrow">></text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <EmptyState 
        v-else
        icon="📋"
        title="暂无结算记录"
        description="您还没有医保结算记录"
      />
      
      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
/**
 * 医保结算清单列表页面
 */
import { ref, computed, onMounted } from 'vue';
import WarningTag from '../../components/common/WarningTag.vue';
import EmptyState from '../../components/common/EmptyState.vue';
import { formatAmount, formatDate, getWarningLevel } from '../../utils';
import type { TSettleItem, WarningLevel } from '../../types';
import { mockSettlements } from '../../mock/settlements';

// 筛选标签
const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '门诊', value: '1' },
  { label: '住院', value: '2' },
];

// 当前选中标签
const currentTab = ref('all');

// 加载中
const loading = ref(false);

// 结算列表
const settlementList = ref<TSettleItem[]>([]);

// 筛选后的列表
const filteredList = computed(() => {
  if (currentTab.value === 'all') {
    return settlementList.value;
  }
  return settlementList.value.filter(item => item.projectType === currentTab.value);
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    settlementList.value = mockSettlements;
  } finally {
    loading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  // 实现分页加载逻辑
};

// 跳转到详情
const goToDetail = (item: TSettleItem) => {
  uni.navigateTo({
    url: `/pagesD/drgSettlement/pages/settlement/detail?settlementNo=${item.settlementNo}`,
  });
};

// 跳转到费用分析
const goToAnalysis = (item: TSettleItem) => {
  uni.navigateTo({
    url: `/pagesD/drgSettlement/pages/settlement/costAnalysis?settlementNo=${item.settlementNo}`,
  });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.settlement-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.filter-bar {
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.filter-tabs {
  display: flex;
  gap: 20rpx;
}

.filter-tab {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  background-color: #f5f5f5;
}

.filter-tab text {
  font-size: 28rpx;
  color: #666;
}

.filter-tab.active {
  background-color: #1890ff;
}

.filter-tab.active text {
  color: #fff;
}

.list-container {
  height: calc(100vh - 100rpx);
}

.settlement-list {
  padding: 20rpx;
}

.settlement-card {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.header-left {
  flex: 1;
}

.hospital-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.settlement-date {
  font-size: 24rpx;
  color: #999;
}

.card-body {
  padding: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.info-row:last-child {
  margin-bottom: 0;
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

.info-value.amount {
  color: #ff4d4f;
  font-size: 32rpx;
}

.drg-info {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.drg-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.drg-code {
  font-size: 26rpx;
  color: #1890ff;
  font-weight: 600;
  margin-right: 16rpx;
}

.drg-name {
  flex: 1;
  font-size: 26rpx;
  color: #666;
}

.cost-rate-row {
  display: flex;
  align-items: center;
}

.rate-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 16rpx;
}

.rate-bar {
  flex: 1;
  height: 12rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
  margin-right: 16rpx;
}

.rate-fill {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.rate-fill.safe {
  background-color: #52c41a;
}

.rate-fill.warning {
  background-color: #faad14;
}

.rate-fill.danger {
  background-color: #ff4d4f;
}

.rate-value {
  font-size: 24rpx;
  font-weight: 500;
}

.rate-value.safe {
  color: #52c41a;
}

.rate-value.warning {
  color: #faad14;
}

.rate-value.danger {
  color: #ff4d4f;
}

.risk-tip {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background-color: #fff2f0;
  border-radius: 8rpx;
}

.tip-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #ff4d4f;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #fafafa;
  border-top: 1rpx solid #f0f0f0;
}

.action-text {
  font-size: 28rpx;
  color: #1890ff;
}

.arrow {
  font-size: 28rpx;
  color: #999;
}

.loading-more {
  text-align: center;
  padding: 30rpx;
}

.loading-more text {
  font-size: 26rpx;
  color: #999;
}
</style>
