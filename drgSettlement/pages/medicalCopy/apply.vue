<template>
  <view class="medical-copy-apply-page">
    <!-- 步骤条 -->
    <view class="step-bar">
      <view 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-item"
        :class="{ active: currentStep >= index, current: currentStep === index }"
      >
        <view class="step-num">{{ index + 1 }}</view>
        <text class="step-name">{{ step }}</text>
      </view>
    </view>
    
    <!-- 步骤1: 选择住院记录 -->
    <view v-if="currentStep === 0" class="step-content">
      <view class="section-title">选择住院记录</view>
      <view class="record-list">
        <view 
          v-for="record in inpatientRecords" 
          :key="record.inpatientNo"
          class="record-card"
          :class="{ selected: selectedRecord === record.inpatientNo }"
          @click="selectRecord(record.inpatientNo)"
        >
          <view class="record-header">
            <text class="record-no">住院号：{{ record.inpatientNo }}</text>
            <text class="record-status" :class="{ discharged: record.isDischarged }">
              {{ record.isDischarged ? '已出院' : '在院' }}
            </text>
          </view>
          <view class="record-info">
            <text class="info-item">科室：{{ record.department }}</text>
            <text class="info-item">入院日期：{{ formatDate(record.admissionDate) }}</text>
            <text v-if="record.dischargeDate" class="info-item">
              出院日期：{{ formatDate(record.dischargeDate) }}
            </text>
            <text class="info-item">诊断：{{ record.diagnosis }}</text>
          </view>
        </view>
      </view>
      
      <!-- 无数据 -->
      <view v-if="inpatientRecords.length === 0" class="empty-tip">
        <text class="tip-icon">🏥</text>
        <text class="tip-text">暂无住院记录</text>
      </view>
    </view>
    
    <!-- 步骤2: 选择复印内容 -->
    <view v-if="currentStep === 1" class="step-content">
      <view class="section-title">选择复印内容</view>
      <view class="content-list">
        <view 
          v-for="option in contentOptions" 
          :key="option.value"
          class="content-item"
          :class="{ selected: selectedContents.includes(option.value) }"
          @click="toggleContent(option.value)"
        >
          <view class="checkbox">
            <text v-if="selectedContents.includes(option.value)" class="check-icon">✓</text>
          </view>
          <view class="content-info">
            <text class="content-name">{{ option.label }}</text>
            <text class="content-desc">{{ option.description }}</text>
          </view>
          <text class="content-price">¥{{ option.price }}/页</text>
        </view>
      </view>
      
      <!-- 推荐内容提示 -->
      <view v-if="showRecommendTip" class="recommend-tip">
        <text class="tip-title">💡 推荐复印内容</text>
        <text class="tip-text">根据您的结算记录，建议复印病案首页、入院记录、出院小结等核心资料</text>
      </view>
    </view>
    
    <!-- 步骤3: 填写收件信息 -->
    <view v-if="currentStep === 2" class="step-content">
      <view class="section-title">填写收件信息</view>
      <view class="form-section">
        <!-- 复印份数 -->
        <view class="form-item">
          <text class="form-label">复印份数</text>
          <view class="count-control">
            <view class="count-btn" @click="decreaseCount">-</view>
            <text class="count-value">{{ copyCount }}</text>
            <view class="count-btn" @click="increaseCount">+</view>
          </view>
        </view>
        
        <!-- 领取方式 -->
        <view class="form-item">
          <text class="form-label">领取方式</text>
          <view class="radio-group">
            <view 
              class="radio-item"
              :class="{ active: receiveType === 'express' }"
              @click="receiveType = 'express'"
            >
              <text class="radio-icon">{{ receiveType === 'express' ? '●' : '○' }}</text>
              <text>快递邮寄</text>
            </view>
            <view 
              class="radio-item"
              :class="{ active: receiveType === 'self' }"
              @click="receiveType = 'self'"
            >
              <text class="radio-icon">{{ receiveType === 'self' ? '●' : '○' }}</text>
              <text>现场自取</text>
            </view>
          </view>
        </view>
        
        <!-- 收件地址（快递方式） -->
        <view v-if="receiveType === 'express'" class="form-item">
          <text class="form-label">收件地址</text>
          <textarea 
            v-model="receiveAddress"
            class="form-textarea"
            placeholder="请输入详细收件地址"
            rows="3"
          />
        </view>
        
        <!-- 联系人 -->
        <view class="form-item">
          <text class="form-label">联系人</text>
          <input 
            v-model="contactName"
            class="form-input"
            placeholder="请输入联系人姓名"
          />
        </view>
        
        <!-- 联系电话 -->
        <view class="form-item">
          <text class="form-label">联系电话</text>
          <input 
            v-model="contactPhone"
            class="form-input"
            placeholder="请输入联系电话"
            type="number"
            maxlength="11"
          />
        </view>
      </view>
      
      <!-- 费用预估 -->
      <view class="cost-estimate">
        <view class="estimate-row">
          <text class="estimate-label">复印费用</text>
          <text class="estimate-value">¥{{ calculateCopyCost() }}</text>
        </view>
        <view class="estimate-row">
          <text class="estimate-label">快递费用</text>
          <text class="estimate-value">¥{{ receiveType === 'express' ? 15 : 0 }}</text>
        </view>
        <view class="estimate-row total">
          <text class="estimate-label">预估总费用</text>
          <text class="estimate-value total">¥{{ totalCost }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="footer-bar">
      <view class="btn-group">
        <button v-if="currentStep > 0" class="btn-prev" @click="prevStep">上一步</button>
        <button v-if="currentStep < steps.length - 1" class="btn-next" @click="nextStep">下一步</button>
        <button v-else class="btn-submit" @click="submit">提交申请</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 病案复印申请页面
 */
import { ref, computed } from 'vue';
import { formatDate } from '../../utils';
import { COPY_CONTENT_OPTIONS } from '../../constants';
import type { IInpatientRecord } from '../../types';

// 步骤
const steps = ['选择住院', '选择内容', '填写信息'];
const currentStep = ref(0);

// 住院记录
const inpatientRecords = ref<IInpatientRecord[]>([
  {
    inpatientNo: 'ZY20240101001',
    admissionDate: '2024-01-10',
    dischargeDate: '2024-01-20',
    department: '胸外科',
    departmentCode: '01',
    doctorName: '张医生',
    bedNo: 'A101',
    diagnosis: '肺恶性肿瘤',
    isDischarged: true,
  },
  {
    inpatientNo: 'ZY20230501002',
    admissionDate: '2023-05-15',
    dischargeDate: '2023-05-25',
    department: '心内科',
    departmentCode: '02',
    doctorName: '李医生',
    bedNo: 'B203',
    diagnosis: '冠心病',
    isDischarged: true,
  },
]);

// 选中记录
const selectedRecord = ref('');

// 复印内容选项
const contentOptions = COPY_CONTENT_OPTIONS;

// 选中内容
const selectedContents = ref<string[]>([]);

// 是否显示推荐提示
const showRecommendTip = ref(true);

// 复印份数
const copyCount = ref(1);

// 领取方式
const receiveType = ref<'express' | 'self'>('express');

// 收件地址
const receiveAddress = ref('');

// 联系人
const contactName = ref('');

// 联系电话
const contactPhone = ref('');

// 计算复印费用
const calculateCopyCost = () => {
  const contentCost = selectedContents.value.reduce((sum, contentValue) => {
    const option = contentOptions.find(opt => opt.value === contentValue);
    return sum + (option?.price || 0);
  }, 0);
  return contentCost * copyCount.value;
};

// 总费用
const totalCost = computed(() => {
  const expressFee = receiveType.value === 'express' ? 15 : 0;
  return calculateCopyCost() + expressFee;
});

// 选择记录
const selectRecord = (inpatientNo: string) => {
  selectedRecord.value = inpatientNo;
};

// 切换内容选择
const toggleContent = (value: string) => {
  const index = selectedContents.value.indexOf(value);
  if (index > -1) {
    selectedContents.value.splice(index, 1);
  } else {
    selectedContents.value.push(value);
  }
};

// 减少份数
const decreaseCount = () => {
  if (copyCount.value > 1) {
    copyCount.value--;
  }
};

// 增加份数
const increaseCount = () => {
  if (copyCount.value < 5) {
    copyCount.value++;
  }
};

// 下一步
const nextStep = () => {
  if (currentStep.value === 0 && !selectedRecord.value) {
    uni.showToast({ title: '请选择住院记录', icon: 'none' });
    return;
  }
  if (currentStep.value === 1 && selectedContents.value.length === 0) {
    uni.showToast({ title: '请至少选择一项复印内容', icon: 'none' });
    return;
  }
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// 提交申请
const submit = () => {
  // 验证收件地址
  if (receiveType.value === 'express') {
    if (!receiveAddress.value.trim()) {
      uni.showToast({ title: '请输入收件地址', icon: 'none' });
      return;
    }
    if (receiveAddress.value.trim().length < 5) {
      uni.showToast({ title: '收件地址不能少于5个字', icon: 'none' });
      return;
    }
  }
  
  // 验证联系人姓名
  if (!contactName.value.trim()) {
    uni.showToast({ title: '请输入联系人姓名', icon: 'none' });
    return;
  }
  if (contactName.value.trim().length < 2) {
    uni.showToast({ title: '联系人姓名不能少于2个字', icon: 'none' });
    return;
  }
  
  // 验证手机号
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!contactPhone.value.trim()) {
    uni.showToast({ title: '请输入联系电话', icon: 'none' });
    return;
  }
  if (!phoneRegex.test(contactPhone.value)) {
    uni.showToast({ title: '请输入正确的11位手机号', icon: 'none' });
    return;
  }

  // 模拟提交
  uni.showLoading({ title: '提交中...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '申请成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  }, 1000);
};
</script>

<style scoped>
.medical-copy-apply-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 140rpx;
}

.step-bar {
  display: flex;
  justify-content: space-around;
  padding: 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-num {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #d9d9d9;
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.step-item.active .step-num {
  background-color: #1890ff;
}

.step-item.current .step-num {
  background-color: #1890ff;
  box-shadow: 0 0 0 6rpx rgba(24, 144, 255, 0.2);
}

.step-name {
  font-size: 26rpx;
  color: #999;
}

.step-item.active .step-name {
  color: #1890ff;
}

.step-content {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.record-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid transparent;
}

.record-card.selected {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.record-no {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.record-status {
  font-size: 24rpx;
  color: #52c41a;
  background-color: #f6ffed;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.record-status.discharged {
  color: #999;
  background-color: #f5f5f5;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-item {
  font-size: 26rpx;
  color: #666;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.tip-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.tip-text {
  font-size: 28rpx;
  color: #999;
}

.content-list {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.content-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.content-item:last-child {
  border-bottom: none;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #d9d9d9;
  border-radius: 8rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-item.selected .checkbox {
  background-color: #1890ff;
  border-color: #1890ff;
}

.check-icon {
  color: #fff;
  font-size: 24rpx;
}

.content-info {
  flex: 1;
}

.content-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.content-desc {
  font-size: 24rpx;
  color: #999;
}

.content-price {
  font-size: 26rpx;
  color: #ff4d4f;
  font-weight: 500;
}

.recommend-tip {
  margin-top: 24rpx;
  padding: 20rpx;
  background-color: #e6f7ff;
  border-radius: 12rpx;
}

.tip-title {
  display: block;
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.form-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.form-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.count-control {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.count-btn {
  width: 56rpx;
  height: 56rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #666;
}

.count-value {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  min-width: 60rpx;
  text-align: center;
}

.radio-group {
  display: flex;
  gap: 40rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 28rpx;
  color: #666;
}

.radio-item.active {
  color: #1890ff;
}

.radio-icon {
  font-size: 32rpx;
}

.form-input {
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.form-textarea {
  height: 160rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.cost-estimate {
  margin-top: 24rpx;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.estimate-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.estimate-row.total {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid #f0f0f0;
  margin-bottom: 0;
}

.estimate-label {
  font-size: 28rpx;
  color: #666;
}

.estimate-value {
  font-size: 28rpx;
  color: #333;
}

.estimate-value.total {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: 600;
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

.btn-group {
  display: flex;
  gap: 20rpx;
}

.btn-prev, .btn-next, .btn-submit {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  border-radius: 12rpx;
  border: none;
}

.btn-prev {
  background-color: #f5f5f5;
  color: #666;
}

.btn-next, .btn-submit {
  background-color: #1890ff;
  color: #fff;
}
</style>
