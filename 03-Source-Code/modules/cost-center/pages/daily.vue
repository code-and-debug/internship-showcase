<template>
  <view class="daily-page">
    <!-- 日期选择 -->
    <view class="date-picker">
      <picker mode="date" :value="selectedDate" @change="handleDateChange">
        <view class="picker-content">
          <text class="label">选择日期</text>
          <text class="date">{{ selectedDate || '请选择' }}</text>
        </view>
      </picker>
    </view>

    <!-- 日清单列表 -->
    <scroll-view class="detail-list" scroll-y>
      <CostDetailItem
        v-for="item in detailList"
        :key="item.id"
        :item="item"
      />

      <view class="summary" v-if="detailList.length > 0">
        <text class="label">当日合计</text>
        <text class="amount">¥{{ totalAmount }}</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="detailList.length === 0 && !loading">
        <text>暂无日清单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CostDetailItem from '../components/CostDetailItem.vue';
import { useCostStore } from '../store/costStore';
import { formatAmount } from '../utils';

const store = useCostStore();

// ========== State ==========
const selectedDate = ref('');
const loading = ref(false);

// ========== Computed ==========
const detailList = computed(() => store.detailList);
const totalAmount = computed(() => {
  return formatAmount(detailList.value.reduce((sum, item) => sum + item.amount, 0));
});
const admissionNo = computed(() => store.currentCost?.admissionNo || '');

// ========== Methods ==========
const handleDateChange = async (e: any) => {
  selectedDate.value = e.detail.value;
  if (admissionNo.value && selectedDate.value) {
    loading.value = true;
    try {
      await store.fetchDailyList(admissionNo.value, selectedDate.value);
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped lang="scss">
.daily-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.date-picker {
  background-color: #fff;
  padding: 20rpx;

  .picker-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;

    .label {
      font-size: 28rpx;
      color: #666;
    }

    .date {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
  }
}

.detail-list {
  flex: 1;
}

.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  margin-top: 20rpx;

  .label {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }

  .amount {
    font-size: 32rpx;
    font-weight: bold;
    color: #ff6b6b;
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
