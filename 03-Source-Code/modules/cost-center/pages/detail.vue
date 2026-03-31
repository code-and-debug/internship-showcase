<template>
  <view class="cost-detail-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <picker mode="date" @change="handleDateChange">
        <view class="picker">
          <text>{{ selectedDate || '选择日期' }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
      <picker mode="selector" :range="categoryList" @change="handleCategoryChange">
        <view class="picker">
          <text>{{ selectedCategory || '全部类型' }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- 费用明细列表 -->
    <scroll-view
      class="detail-list"
      scroll-y
      @scrolltolower="handleLoadMore"
    >
      <CostDetailItem
        v-for="item in detailList"
        :key="item.id"
        :item="item"
      />

      <!-- 加载状态 -->
      <view class="load-more" v-if="detailList.length > 0">
        <text v-if="isLoading">加载中...</text>
        <text v-else-if="!hasMore">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="detailList.length === 0 && !isLoading">
        <text>暂无费用明细</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import CostDetailItem from '../components/CostDetailItem.vue';
import { useCostStore } from '../store/costStore';

const store = useCostStore();

// ========== State ==========
const selectedDate = ref('');
const selectedCategory = ref('');
const categoryList = ['全部类型', '药品', '检查', '治疗', '手术', '化验', '其他'];

// ========== Computed ==========
const detailList = computed(() => store.detailList);
const isLoading = computed(() => store.detailLoading);
const hasMore = computed(() => store.hasMoreDetails);
const admissionNo = computed(() => store.currentCost?.admissionNo || '');

// ========== Lifecycle ==========
onMounted(() => {
  loadDetails();
});

// ========== Methods ==========
const loadDetails = async () => {
  if (!admissionNo.value) return;
  await store.fetchDetailList({
    admissionNo: admissionNo.value,
    date: selectedDate.value || undefined,
    category: selectedCategory.value || undefined,
  });
};

const handleLoadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadDetails();
  }
};

const handleDateChange = (e: any) => {
  selectedDate.value = e.detail.value;
  loadDetails();
};

const handleCategoryChange = (e: any) => {
  const index = e.detail.value;
  selectedCategory.value = categoryList[index] === '全部类型' ? '' : categoryList[index];
  loadDetails();
};
</script>

<style scoped lang="scss">
.cost-detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.filter-bar {
  display: flex;
  padding: 20rpx;
  background-color: #fff;

  .picker {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    margin: 0 10rpx;

    text {
      font-size: 26rpx;
      color: #333;
    }

    .arrow {
      margin-left: 8rpx;
      font-size: 20rpx;
      color: #999;
    }
  }
}

.detail-list {
  flex: 1;
}

.load-more {
  padding: 30rpx;
  text-align: center;

  text {
    font-size: 24rpx;
    color: #999;
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
