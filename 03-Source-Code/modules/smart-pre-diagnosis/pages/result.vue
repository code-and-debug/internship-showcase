<template>
  <view class="result-page">
    <!-- AI评估结果 -->
    <view class="result-header" v-if="result">
      <text class="title">评估结果</text>
      <view class="severity-tag" :class="result.severity">
        <text>{{ getSeverityText(result.severity) }}</text>
      </view>
    </view>

    <!-- 推荐科室 -->
    <view class="section" v-if="result">
      <text class="section-title">推荐科室</text>
      <view
        v-for="dept in result.recommendedDepts"
        :key="dept.deptId"
        class="dept-card"
        @click="goToRegister(dept.deptId)"
      >
        <view class="dept-info">
          <text class="dept-name">{{ dept.deptName }}</text>
          <text class="dept-reason">{{ dept.reason }}</text>
        </view>
        <view class="dept-action">
          <text class="urgency" :class="dept.urgency">{{ getUrgencyText(dept.urgency) }}</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 可能疾病 -->
    <view class="section" v-if="result">
      <text class="section-title">可能疾病</text>
      <view v-for="disease in result.diseases" :key="disease.name" class="disease-card">
        <view class="disease-header">
          <text class="disease-name">{{ disease.name }}</text>
          <text class="probability">{{ Math.round(disease.probability * 100) }}%</text>
        </view>
        <text class="disease-desc">{{ disease.description }}</text>
        <view class="disease-tags" v-if="disease.tags?.length">
          <text v-for="tag in disease.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>
    </view>

    <!-- 建议 -->
    <view class="section" v-if="result">
      <text class="section-title">健康建议</text>
      <view class="suggestions">
        <view v-for="suggestion in result.suggestions" :key="suggestion" class="suggestion-item">
          <text class="icon">✓</text>
          <text class="text">{{ suggestion }}</text>
        </view>
      </view>
    </view>

    <!-- 一键挂号按钮 -->
    <view class="footer">
      <button class="btn-register" @click="goToRegister(result?.recommendedDepts?.[0]?.deptId || '')">
        一键挂号
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useDiagnosisStore } from '../store/diagnosisStore';

const store = useDiagnosisStore();

// ========== Computed ==========
const result = computed(() => store.assessmentResult);

// ========== Methods ==========
const getSeverityText = (severity: string) => {
  const map: Record<string, string> = {
    'normal': '一般',
    'urgent': '紧急',
    'emergency': '危急',
  };
  return map[severity] || severity;
};

const getUrgencyText = (urgency: string) => {
  const map: Record<string, string> = {
    'normal': '普通',
    'urgent': '加急',
  };
  return map[urgency] || urgency;
};

const goToRegister = (deptId: string) => {
  // TODO: 跳转到挂号页面
  uni.showToast({
    title: '即将跳转到挂号页面',
    icon: 'none',
  });
};
</script>

<style scoped lang="scss">
.result-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
  padding-bottom: 200rpx;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  margin-bottom: 30rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
  }

  .severity-tag {
    padding: 10rpx 20rpx;
    border-radius: 20rpx;

    text {
      font-size: 24rpx;
      color: #fff;
    }

    &.normal {
      background-color: #52c41a;
    }
    &.urgent {
      background-color: #faad14;
    }
    &.emergency {
      background-color: #ff4d4f;
    }
  }
}

.section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;

  .section-title {
    display: block;
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.dept-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 16rpx;

  .dept-info {
    .dept-name {
      display: block;
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
    }

    .dept-reason {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }

  .dept-action {
    display: flex;
    align-items: center;

    .urgency {
      font-size: 22rpx;
      padding: 4rpx 12rpx;
      border-radius: 4rpx;
      margin-right: 16rpx;

      &.normal {
        color: #52c41a;
        background-color: #f6ffed;
      }
      &.urgent {
        color: #faad14;
        background-color: #fffbe6;
      }
    }

    .arrow {
      font-size: 36rpx;
      color: #ccc;
    }
  }
}

.disease-card {
  padding: 24rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 16rpx;

  .disease-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;

    .disease-name {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
    }

    .probability {
      font-size: 28rpx;
      font-weight: bold;
      color: #ff6b6b;
    }
  }

  .disease-desc {
    display: block;
    font-size: 24rpx;
    color: #666;
    margin-bottom: 12rpx;
  }

  .disease-tags {
    display: flex;
    gap: 12rpx;

    .tag {
      font-size: 22rpx;
      padding: 4rpx 12rpx;
      background-color: #e6f7ff;
      color: #1890ff;
      border-radius: 4rpx;
    }
  }
}

.suggestions {
  .suggestion-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .icon {
      color: #52c41a;
      margin-right: 16rpx;
      font-size: 28rpx;
    }

    .text {
      font-size: 26rpx;
      color: #333;
    }
  }
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .btn-register {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 44rpx;
    color: #fff;
    font-size: 32rpx;
    border: none;
  }
}
</style>
