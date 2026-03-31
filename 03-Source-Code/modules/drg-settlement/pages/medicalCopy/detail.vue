<template>
  <view class="medical-copy-detail-page">
    <!-- 申请状态卡片 -->
    <view class="status-card">
      <view class="status-icon">{{ statusConfig.icon }}</view>
      <text class="status-name">{{ statusConfig.label }}</text>
      <text class="status-desc">{{ statusConfig.description }}</text>
    </view>
    
    <!-- 进度条 -->
    <view class="progress-section">
      <view class="progress-line">
        <view 
          v-for="(step, index) in progressSteps" 
          :key="index"
          class="progress-step"
          :class="{ active: currentStepIndex >= index, current: currentStepIndex === index }"
        >
          <view class="step-dot">
            <text v-if="currentStepIndex > index" class="check-icon">✓</text>
          </view>
          <text class="step-name">{{ step }}</text>
        </view>
      </view>
    </view>
    
    <!-- 申请信息 -->
    <view class="info-card">
      <text class="card-title">申请信息</text>
      <view class="info-row">
        <text class="info-label">申请编号</text>
        <text class="info-value">{{ application.applyNo }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">申请时间</text>
        <text class="info-value">{{ formatDateTime(application.applyTime) }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">复印类型</text>
        <text class="info-value">{{ application.copyType === 'inpatient' ? '住院病案' : '门诊病历' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">复印内容</text>
        <text class="info-value">{{ formatCopyContent(application.copyContent) }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">复印份数</text>
        <text class="info-value">{{ application.copyCount }}份</text>
      </view>
      <view class="info-row">
        <text class="info-label">预估费用</text>
        <text class="info-value">¥{{ formatAmount(application.estimatedCost || 0) }}</text>
      </view>
    </view>
    
    <!-- 快递信息 -->
    <view v-if="application.expressCompany" class="info-card">
      <text class="card-title">快递信息</text>
      <view class="info-row">
        <text class="info-label">快递公司</text>
        <text class="info-value">{{ application.expressCompany }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">快递单号</text>
        <view class="express-no-row">
          <text class="info-value">{{ application.expressNo }}</text>
          <text class="copy-btn" @click="copyExpressNo">复制</text>
        </view>
      </view>
    </view>
    
    <!-- 关联结算提示 -->
    <view v-if="application.settlementInfo" class="tip-card">
      <view class="tip-header">
        <text class="tip-title">💡 关联结算提示</text>
      </view>
      <text class="tip-content">
        该病例DRG费用消耗率为{{ application.settlementInfo.costRate?.toFixed(1) }}%
        <text v-if="application.settlementInfo.caseType === 'high'">，属于高倍率病例</text>。
        建议复印完整的病案资料用于可能的医保飞检或商业保险报销。
      </text>
    </view>
    
    <!-- 操作按钮 -->
    <view class="footer-bar">
      <button v-if="canCancel" class="cancel-btn" @click="cancelApply">撤销申请</button>
      <button class="contact-btn" @click="contactHospital">联系医院</button>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 病案复印详情页面
 */
import { ref, computed, onMounted } from 'vue';
import { formatAmount, formatDateTime } from '../../utils';
import { COPY_STATUS_CONFIG, COPY_CONTENT_OPTIONS } from '../../constants';
import type { IMedicalCopyItem, CopyStatus } from '../../types';

// 申请数据（模拟）
const application = ref<IMedicalCopyItem>({
  expressId: 'MC123456',
  applyNo: 'BA20240101001',
  applyTime: '2024-01-20T10:30:00',
  copyType: 'inpatient',
  copyContent: ['homepage', 'admission', 'discharge', 'progress'],
  copyCount: 1,
  status: 'processing',
  estimatedCost: 35,
  expressCompany: '顺丰速运',
  expressNo: 'SF1234567890',
  settlementInfo: {
    settlementNo: '202401010001',
    drgCode: 'FA19A',
    totalCost: 18500,
    costRate: 92.5,
    caseType: 'normal',
    flyCheckRisk: 'low',
  },
});

// 进度步骤
const progressSteps = ['申请提交', '医院受理', '复印完成', '快递发出', '已签收'];

// 状态到步骤的映射
const statusToStep: Record<CopyStatus, number> = {
  pending: 0,
  processing: 1,
  completed: 3,
  shipped: 4,
};

// 当前步骤索引
const currentStepIndex = computed(() => {
  return statusToStep[application.value.status] || 0;
});

// 状态配置
const statusConfig = computed(() => {
  return COPY_STATUS_CONFIG[application.value.status];
});

// 是否可以撤销
const canCancel = computed(() => {
  return application.value.status === 'pending';
});

// 格式化复印内容
const formatCopyContent = (contents: string[]): string => {
  return contents
    .map(c => COPY_CONTENT_OPTIONS.find(opt => opt.value === c)?.label || c)
    .join('、');
};

// 复制快递单号
const copyExpressNo = () => {
  uni.setClipboardData({
    data: application.value.expressNo || '',
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' });
    },
  });
};

// 撤销申请
const cancelApply = () => {
  uni.showModal({
    title: '确认撤销',
    content: '确定要撤销该申请吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '已撤销', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
  });
};

// 联系医院
const contactHospital = () => {
  uni.makePhoneCall({
    phoneNumber: '0571-XXXXXXXX',
  });
};

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || currentPage.$route?.query || {};
  const expressId = options.expressId;
  console.log('ExpressId:', expressId);
});
</script>

<style scoped>
.medical-copy-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 140rpx;
}

.status-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.status-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.status-name {
  display: block;
  font-size: 36rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.status-desc {
  font-size: 26rpx;
  color: #999;
}

.progress-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.progress-line {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-line::before {
  content: '';
  position: absolute;
  top: 20rpx;
  left: 10%;
  right: 10%;
  height: 2rpx;
  background-color: #e8e8e8;
  z-index: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
}

.step-dot {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background-color: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.step-dot .check-icon {
  color: #fff;
  font-size: 24rpx;
}

.progress-step.active .step-dot {
  background-color: #52c41a;
}

.progress-step.current .step-dot {
  background-color: #1890ff;
  box-shadow: 0 0 0 6rpx rgba(24, 144, 255, 0.2);
}

.step-name {
  font-size: 22rpx;
  color: #999;
  text-align: center;
}

.progress-step.active .step-name,
.progress-step.current .step-name {
  color: #333;
}

.info-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.card-title {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
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

.express-no-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.copy-btn {
  font-size: 24rpx;
  color: #1890ff;
  padding: 4rpx 12rpx;
  background-color: #e6f7ff;
  border-radius: 8rpx;
}

.tip-card {
  background-color: #e6f7ff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.tip-header {
  margin-bottom: 12rpx;
}

.tip-title {
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
}

.tip-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #e8e8e8;
}

.cancel-btn, .contact-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  border-radius: 12rpx;
  border: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.contact-btn {
  background-color: #1890ff;
  color: #fff;
}
</style>
