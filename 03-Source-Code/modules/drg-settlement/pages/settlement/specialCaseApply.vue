<template>
  <view class="special-case-apply-page">
    <!-- 资格检查 -->
    <view v-if="!eligibility.eligible" class="eligibility-section">
      <view class="ineligible-card">
        <text class="warning-icon">⚠️</text>
        <text class="ineligible-title">暂不符合申请条件</text>
        <view class="reason-list">
          <view 
            v-for="(reason, index) in eligibility.reasons" 
            :key="index"
            class="reason-item"
          >
            <text class="reason-dot">•</text>
            <text class="reason-text">{{ reason }}</text>
          </view>
        </view>
        <view class="suggestion-list">
          <text class="suggestion-title">建议：</text>
          <view 
            v-for="(suggestion, index) in eligibility.suggestions" 
            :key="index"
            class="suggestion-item"
          >
            <text class="suggestion-num">{{ index + 1 }}</text>
            <text class="suggestion-text">{{ suggestion }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 申请表单 -->
    <view v-else class="form-section">
      <!-- 结算信息 -->
      <view class="info-card">
        <text class="card-title">结算信息</text>
        <view class="info-row">
          <text class="info-label">结算单号</text>
          <text class="info-value">{{ settlement.settlementNo }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">DRG分组</text>
          <text class="info-value">{{ settlement.drgCode }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">当前费用</text>
          <text class="info-value">¥{{ formatAmount(settlement.currentCost || settlement.totalCost) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">支付标准</text>
          <text class="info-value">¥{{ formatAmount(settlement.paymentStandard) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">超额金额</text>
          <text class="info-value excess">¥{{ formatAmount(excessAmount) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">费用消耗率</text>
          <text class="info-value excess">{{ settlement.costRate?.toFixed(1) }}%</text>
        </view>
      </view>
      
      <!-- 申请原因 -->
      <view class="form-card">
        <text class="card-title">申请原因</text>
        <view class="form-item">
          <text class="form-label">超额原因类型 <text class="required">*</text></text>
          <view class="type-list">
            <view 
              v-for="type in excessTypes" 
              :key="type.value"
              class="type-item"
              :class="{ active: formData.excessReasonType === type.value }"
              @click="formData.excessReasonType = type.value"
            >
              <text class="type-name">{{ type.label }}</text>
              <text class="type-desc">{{ type.description }}</text>
            </view>
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">超额原因说明 <text class="required">*</text></text>
          <textarea 
            v-model="formData.excessReason"
            class="form-textarea"
            placeholder="请详细说明费用超额的原因，不少于10个字"
            rows="4"
          />
        </view>
        <view v-if="formData.excessReasonType === 'complication'" class="form-item">
          <text class="form-label">并发症详情 <text class="required">*</text></text>
          <textarea 
            v-model="formData.complicationDetails"
            class="form-textarea"
            placeholder="请详细描述并发症情况，不少于10个字"
            rows="4"
          />
        </view>
      </view>
      
      <!-- 支持材料 -->
      <view class="form-card">
        <view class="upload-header">
          <text class="card-title">支持材料 <text class="required">*</text></text>
          <text class="upload-tip">请上传{{ eligibility.requiredDocs.length }}项材料</text>
        </view>
        <view class="doc-list">
          <view 
            v-for="doc in eligibility.requiredDocs" 
            :key="doc"
            class="doc-item"
          >
            <text class="doc-icon">📄</text>
            <text class="doc-name">{{ doc }}</text>
          </view>
        </view>
        <view class="upload-area" @click="uploadDoc">
          <text class="upload-icon">+</text>
          <text class="upload-text">点击上传材料</text>
        </view>
        <view v-if="uploadedDocs.length > 0" class="uploaded-list">
          <view 
            v-for="(doc, index) in uploadedDocs" 
            :key="index"
            class="uploaded-item"
          >
            <text class="uploaded-name">{{ doc.name }}</text>
            <text class="uploaded-remove" @click="removeDoc(index)">×</text>
          </view>
        </view>
      </view>
      
      <!-- 注意事项 -->
      <view class="notice-section">
        <text class="notice-title">注意事项</text>
        <view class="notice-list">
          <text class="notice-item">1. 请确保申请材料真实有效</text>
          <text class="notice-item">2. 申请审核周期一般为3-5个工作日</text>
          <text class="notice-item">3. 审核结果将通过短信通知</text>
          <text class="notice-item">4. 如有疑问请联系医保办</text>
        </view>
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view v-if="eligibility.eligible" class="footer-bar">
      <button class="submit-btn" @click="submit">提交申请</button>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 特病单议申请页面
 */
import { ref, computed, onMounted } from 'vue';
import { formatAmount } from '../../utils';
import { useSpecialCaseApply } from '../../composables/useSpecialCaseApply';
import type { ISettlementDetail } from '../../types';
import { mockHighRateSettlementDetail } from '../../mock/settlements';

// 结算详情（使用高倍率病例作为示例）
const settlement = ref<ISettlementDetail>(mockHighRateSettlementDetail);

// 特病单议申请
const specialCase = useSpecialCaseApply({ settlement });

// 资格信息
const eligibility = computed(() => specialCase.eligibility.value);

// 超额金额
const excessAmount = computed(() => specialCase.excessAmount.value);

// 表单数据
const formData = ref({
  excessReasonType: 'complication' as const,
  excessReason: '',
  complicationDetails: '',
});

// 超额原因类型
const excessTypes = [
  { value: 'complication', label: '严重并发症', description: '患者出现严重并发症，需要额外治疗' },
  { value: 'severity', label: '病情严重', description: '患者病情严重程度超出预期' },
  { value: 'comorbidity', label: '合并症复杂', description: '患者合并多种疾病，治疗复杂' },
  { value: 'other', label: '其他原因', description: '其他特殊原因' },
];

// 已上传文档
const uploadedDocs = ref<{ name: string; url: string }[]>([]);

// 上传文档
const uploadDoc = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      uploadedDocs.value.push({
        name: `材料${uploadedDocs.value.length + 1}`,
        url: res.tempFilePaths[0],
      });
    },
  });
};

// 删除文档
const removeDoc = (index: number) => {
  uploadedDocs.value.splice(index, 1);
};

// 提交申请
const submit = async () => {
  // 验证
  if (!formData.value.excessReason || formData.value.excessReason.length < 10) {
    uni.showToast({ title: '请详细填写超额原因', icon: 'none' });
    return;
  }
  if (formData.value.excessReasonType === 'complication' && 
      (!formData.value.complicationDetails || formData.value.complicationDetails.length < 10)) {
    uni.showToast({ title: '请详细描述并发症情况', icon: 'none' });
    return;
  }
  if (uploadedDocs.value.length === 0) {
    uni.showToast({ title: '请至少上传一项支持材料', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '提交中...' });
  
  // 模拟提交
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 1500);
};

onMounted(() => {
  // 初始化表单
  specialCase.initForm();
});
</script>

<style scoped>
.special-case-apply-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 140rpx;
}

.eligibility-section {
  padding: 20rpx;
}

.ineligible-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
}

.warning-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.ineligible-title {
  display: block;
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: 600;
  margin-bottom: 30rpx;
}

.reason-list {
  text-align: left;
  margin-bottom: 30rpx;
}

.reason-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.reason-dot {
  font-size: 32rpx;
  color: #ff4d4f;
  margin-right: 12rpx;
}

.reason-text {
  flex: 1;
  font-size: 28rpx;
  color: #666;
  text-align: left;
}

.suggestion-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  text-align: left;
  margin-bottom: 16rpx;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
  text-align: left;
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
  margin-right: 12rpx;
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
  text-align: left;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-card, .form-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
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

.info-value.excess {
  color: #ff4d4f;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.required {
  color: #ff4d4f;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.type-item {
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
}

.type-item.active {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.type-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.type-item.active .type-name {
  color: #1890ff;
}

.type-desc {
  font-size: 24rpx;
  color: #999;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #1890ff;
}

.doc-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
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

.upload-area {
  height: 160rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.upload-text {
  font-size: 26rpx;
  color: #999;
}

.uploaded-list {
  margin-top: 20rpx;
}

.uploaded-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}

.uploaded-name {
  font-size: 26rpx;
  color: #333;
}

.uploaded-remove {
  font-size: 32rpx;
  color: #999;
  padding: 0 12rpx;
}

.notice-section {
  padding: 24rpx;
  background-color: #fffbe6;
  border-radius: 16rpx;
}

.notice-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.notice-item {
  font-size: 26rpx;
  color: #666;
}

.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #e8e8e8;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #1890ff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
  border: none;
}

.submit-btn:active {
  background-color: #096dd9;
}
</style>
