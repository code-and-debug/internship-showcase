<template>
  <view class="smart-diagnosis-page">
    <!-- 顶部说明 -->
    <view class="header">
      <text class="title">智能预问诊</text>
      <text class="desc">AI智能分诊，推荐合适科室</text>
    </view>

    <!-- 功能入口 -->
    <view class="function-section">
      <view class="function-card" @click="navigateToBodyMap">
        <view class="card-icon">🧑</view>
        <view class="card-content">
          <text class="card-title">人体图选择</text>
          <text class="card-desc">点击身体部位选择不适位置</text>
        </view>
      </view>

      <view class="function-card" @click="navigateToSymptoms">
        <view class="card-icon">🤒</view>
        <view class="card-content">
          <text class="card-title">症状录入</text>
          <text class="card-desc">描述您的症状和持续时间</text>
        </view>
      </view>

      <view class="function-card" @click="navigateToRecords">
        <view class="card-icon">📋</view>
        <view class="card-content">
          <text class="card-title">问诊记录</text>
          <text class="card-desc">查看历史预问诊记录</text>
        </view>
      </view>
    </view>

    <!-- 快速开始 -->
    <view class="quick-start" v-if="hasHistory">
      <text class="section-title">最近问诊</text>
      <view class="history-item" v-for="item in historyRecords.slice(0, 3)" :key="item.id" @click="viewResult(item)">
        <view class="history-info">
          <text class="history-date">{{ formatDate(item.createTime) }}</text>
          <text class="history-dept">{{ item.result?.recommendedDepts?.[0]?.deptName || '已评估' }}</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDiagnosisStore } from '../store/diagnosisStore';

const store = useDiagnosisStore();

// ========== State ==========
const patientId = ref('test-patient-id'); // TODO: 从全局获取

// ========== Computed ==========
const hasHistory = computed(() => store.historyRecords.length > 0);
const historyRecords = computed(() => store.historyRecords);

// ========== Lifecycle ==========
onMounted(() => {
  store.fetchHistory(patientId.value);
});

// ========== Methods ==========
const navigateToBodyMap = () => {
  uni.navigateTo({
    url: '/pagesD/smartPreDiagnosis/bodyMap',
  });
};

const navigateToSymptoms = () => {
  uni.navigateTo({
    url: '/pagesD/smartPreDiagnosis/symptoms',
  });
};

const navigateToRecords = () => {
  uni.navigateTo({
    url: '/pagesD/smartPreDiagnosis/records',
  });
};

const viewResult = (item: any) => {
  store.assessmentResult = item.result;
  uni.navigateTo({
    url: '/pagesD/smartPreDiagnosis/result',
  });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};
</script>

<style scoped lang="scss">
.smart-diagnosis-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;

  .title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10rpx;
  }

  .desc {
    display: block;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.function-section {
  margin-bottom: 30rpx;
}

.function-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .card-icon {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 50rpx;
    margin-right: 24rpx;
  }

  .card-content {
    flex: 1;

    .card-title {
      display: block;
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
    }

    .card-desc {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }
}

.quick-start {
  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 10rpx;
  }
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 24rpx 30rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;

  .history-info {
    .history-date {
      display: block;
      font-size: 26rpx;
      color: #333;
      margin-bottom: 6rpx;
    }

    .history-dept {
      display: block;
      font-size: 24rpx;
      color: #1890ff;
    }
  }

  .arrow {
    font-size: 36rpx;
    color: #ccc;
  }
}
</style>
