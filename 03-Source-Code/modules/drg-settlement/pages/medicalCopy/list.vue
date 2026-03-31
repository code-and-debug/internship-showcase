<template>
  <view class="medical-copy-page">
    <!-- 顶部Tab -->
    <view class="tab-bar">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>
    
    <!-- 列表内容 -->
    <scroll-view class="list-container" scroll-y>
      <!-- 申请列表 -->
      <view v-if="filteredApplications.length > 0" class="application-list">
        <view 
          v-for="item in filteredApplications" 
          :key="item.expressId"
          class="application-card"
          @click="goToDetail(item)"
        >
          <!-- 卡片头部 -->
          <view class="card-header">
            <view class="header-left">
              <text class="apply-no">申请编号：{{ item.applyNo }}</text>
              <text class="apply-time">{{ formatDateTime(item.applyTime) }}</text>
            </view>
            <view class="status-tag" :style="getStatusStyle(item.status)">
              {{ getStatusLabel(item.status) }}
            </view>
          </view>
          
          <!-- 卡片内容 -->
          <view class="card-body">
            <view class="info-row">
              <text class="info-label">复印类型</text>
              <text class="info-value">{{ item.copyType === 'inpatient' ? '住院病案' : '门诊病历' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">复印内容</text>
              <text class="info-value">{{ formatCopyContent(item.copyContent) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">复印份数</text>
              <text class="info-value">{{ item.copyCount }}份</text>
            </view>
            <view v-if="item.estimatedCost" class="info-row">
              <text class="info-label">预估费用</text>
              <text class="info-value amount">¥{{ formatAmount(item.estimatedCost) }}</text>
            </view>
          </view>
          
          <!-- 快递信息 -->
          <view v-if="item.expressCompany" class="express-info">
            <text class="express-label">{{ item.expressCompany }}</text>
            <text class="express-no">{{ item.expressNo }}</text>
          </view>
          
          <!-- 关联结算提示 -->
          <view v-if="item.settlementInfo" class="settlement-tip">
            <view class="tip-header">
              <text class="tip-title">关联结算信息</text>
              <WarningTag 
                v-if="item.settlementInfo.flyCheckRisk && item.settlementInfo.flyCheckRisk !== 'low'"
                type="risk"
                :level="item.settlementInfo.flyCheckRisk"
              />
            </view>
            <text class="tip-text">
              该病例费用消耗率为{{ item.settlementInfo.costRate?.toFixed(1) }}%
              {{ item.settlementInfo.caseType === 'high' ? '，属于高倍率病例' : '' }}
            </text>
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
        title="暂无申请记录"
        description="您还没有病案复印申请记录"
      >
        <button class="apply-btn" @click="goToApply">立即申请</button>
      </EmptyState>
    </scroll-view>
    
    <!-- 底部申请按钮 -->
    <view v-if="filteredApplications.length > 0" class="bottom-bar">
      <button class="apply-btn" @click="goToApply">申请病案复印</button>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 病案复印列表页面
 */
import { ref, computed, onMounted } from 'vue';
import EmptyState from '../../components/common/EmptyState.vue';
import WarningTag from '../../components/common/WarningTag.vue';
import { formatAmount, formatDateTime } from '../../utils';
import { COPY_STATUS_CONFIG, COPY_CONTENT_OPTIONS } from '../../constants';
import type { IMedicalCopyItem, CopyStatus } from '../../types';

// Tab选项
const tabs = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed,shipped' },
];

// 当前Tab
const currentTab = ref('all');

// 申请列表
const applications = ref<IMedicalCopyItem[]>([]);

// 筛选后的列表
const filteredApplications = computed(() => {
  if (currentTab.value === 'all') {
    return applications.value;
  }
  const statuses = currentTab.value.split(',');
  return applications.value.filter(item => statuses.includes(item.status));
});

// 获取状态标签
const getStatusLabel = (status: CopyStatus): string => {
  return COPY_STATUS_CONFIG[status].label;
};

// 获取状态样式
const getStatusStyle = (status: CopyStatus) => {
  const config = COPY_STATUS_CONFIG[status];
  return {
    backgroundColor: config.bgColor || '#f5f5f5',
    color: config.color || '#666',
  };
};

// 格式化复印内容
const formatCopyContent = (contents: string[]): string => {
  if (contents.length === 0) return '-';
  if (contents.length <= 2) {
    return contents
      .map(c => COPY_CONTENT_OPTIONS.find(opt => opt.value === c)?.label || c)
      .join('、');
  }
  const firstTwo = contents.slice(0, 2);
  const labels = firstTwo
    .map(c => COPY_CONTENT_OPTIONS.find(opt => opt.value === c)?.label || c)
    .join('、');
  return `${labels}等${contents.length}项`;
};

// 加载数据
const loadData = async () => {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 500));
  applications.value = []; // 使用Mock数据或空数组
};

// 跳转到详情
const goToDetail = (item: IMedicalCopyItem) => {
  uni.navigateTo({
    url: `/pagesD/drgSettlement/pages/medicalCopy/detail?expressId=${item.expressId}`,
  });
};

// 跳转到申请页面
const goToApply = () => {
  uni.navigateTo({
    url: '/pagesD/drgSettlement/pages/medicalCopy/apply',
  });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.medical-copy-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  display: flex;
  background-color: #fff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.tab-item {
  flex: 1;
  padding: 24rpx 0;
  text-align: center;
  position: relative;
}

.tab-item text {
  font-size: 28rpx;
  color: #666;
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

.list-container {
  flex: 1;
  height: calc(100vh - 200rpx);
}

.application-list {
  padding: 20rpx;
}

.application-card {
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

.apply-no {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.apply-time {
  font-size: 24rpx;
  color: #999;
}

.status-tag {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
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
}

.express-info {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #e6f7ff;
  margin: 0 24rpx 20rpx;
  border-radius: 8rpx;
}

.express-label {
  font-size: 26rpx;
  color: #1890ff;
  font-weight: 500;
  margin-right: 16rpx;
}

.express-no {
  font-size: 26rpx;
  color: #666;
}

.settlement-tip {
  margin: 0 24rpx 20rpx;
  padding: 20rpx;
  background-color: #fffbe6;
  border: 1rpx solid #ffe58f;
  border-radius: 8rpx;
}

.tip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.tip-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.tip-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
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

.bottom-bar {
  padding: 20rpx 30rpx;
  background-color: #fff;
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
