<template>
  <view class="records-page">
    <view class="empty" v-if="records.length === 0">
      <text>暂无问诊记录</text>
    </view>

    <view
      v-for="record in records"
      :key="record.id"
      class="record-item"
      @click="viewDetail(record)"
    >
      <view class="record-header">
        <text class="date">{{ formatDate(record.createTime) }}</text>
        <text class="status">已完成</text>
      </view>
      <view class="record-content">
        <text class="dept">{{ record.result?.recommendedDepts?.[0]?.deptName || '已评估' }}</text>
        <text class="disease">{{ record.result?.diseases?.[0]?.name || '' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDiagnosisStore } from '../store/diagnosisStore';

const store = useDiagnosisStore();
const patientId = ref('test-patient-id');

const records = computed(() => store.historyRecords);

onMounted(() => {
  store.fetchHistory(patientId.value);
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const viewDetail = (record: any) => {
  store.assessmentResult = record.result;
  uni.navigateTo({
    url: '/pagesD/smartPreDiagnosis/result',
  });
};
</script>

<style scoped lang="scss">
.records-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.record-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .date {
      font-size: 26rpx;
      color: #333;
    }

    .status {
      font-size: 24rpx;
      color: #52c41a;
    }
  }

  .record-content {
    .dept {
      display: block;
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
    }

    .disease {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx;

  text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
