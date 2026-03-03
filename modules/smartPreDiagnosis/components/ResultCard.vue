<template>
  <view class="result-card" :class="[`severity-${resultSeverity}`]">
    <!-- 头部 -->
    <view class="card-header">
      <view class="severity-badge">
        <text class="severity-icon">{{ severityConfig.icon }}</text>
        <text class="severity-label">{{ severityConfig.label }}</text>
      </view>
      <text class="create-time">{{ createTime }}</text>
    </view>

    <!-- 疾病推荐 -->
    <view v-if="diseases.length > 0" class="section">
      <view class="section-title">可能疾病</view>
      <view class="disease-list">
        <view 
          v-for="disease in diseases" 
          :key="disease.name" 
          class="disease-item"
        >
          <view class="disease-info">
            <text class="disease-name">{{ disease.name }}</text>
            <view class="disease-tags">
              <text 
                v-for="tag in disease.tags" 
                :key="tag" 
                class="tag"
              >
                {{ tag }}
              </text>
            </view>
          </view>
          <view class="probability">
            <view class="progress-bar">
              <view 
                class="progress" 
                :style="{ width: `${disease.probability * 100}%` }"
              ></view>
            </view>
            <text class="percent">{{ Math.round(disease.probability * 100) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 建议 -->
    <view v-if="suggestions.length > 0" class="section">
      <view class="section-title">健康建议</view>
      <view class="suggestions">
        <view 
          v-for="(suggestion, index) in suggestions" 
          :key="index" 
          class="suggestion-item"
        >
          <text class="suggestion-icon">💡</text>
          <text class="suggestion-text">{{ suggestion }}</text>
        </view>
      </view>
    </view>

    <!-- 推荐科室 -->
    <view v-if="recommendedDepts.length > 0" class="section">
      <view class="section-title">推荐科室</view>
      <view class="dept-list">
        <view 
          v-for="dept in recommendedDepts" 
          :key="dept.deptId" 
          class="dept-item"
          @click="handleDeptClick(dept)"
        >
          <view class="dept-info">
            <text class="dept-name">{{ dept.deptName }}</text>
            <text class="dept-reason">{{ dept.reason }}</text>
          </view>
          <view class="dept-urgency" :class="`urgency-${dept.urgency}`">
            {{ getUrgencyLabel(dept.urgency) }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IAssessmentResult, IDiseaseRecommend, IDeptRecommend, UrgencyLevel } from '../types';
import { getSeverityConfig, getUrgencyConfig } from '../utils';

interface Props {
  /** 评估结果 */
  result: IAssessmentResult;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'deptClick', dept: IDeptRecommend): void;
}>();

/** 严重程度值 */
const resultSeverity = computed(() => props.result.severity);

/** 严重程度配置 */
const severityConfig = computed(() => getSeverityConfig(props.result.severity));

/** 创建时间 */
const createTime = computed(() => {
  if (!props.result.createTime) return '';
  const date = new Date(props.result.createTime);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
});

/** 推荐的疾病列表 */
const diseases = computed(() => props.result.diseases || []);

/** 建议列表 */
const suggestions = computed(() => props.result.suggestions || []);

/** 推荐科室列表 */
const recommendedDepts = computed(() => props.result.recommendedDepts || []);

/** 获取紧急程度标签 */
const getUrgencyLabel = (urgency: UrgencyLevel): string => {
  return getUrgencyConfig(urgency).label;
};

/** 科室点击事件 */
const handleDeptClick = (dept: IDeptRecommend) => {
  emit('deptClick', dept);
};
</script>

<style lang="scss" scoped>
.result-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  &.severity-normal {
    border-left: 8rpx solid #52c41a;
  }
  
  &.severity-urgent {
    border-left: 8rpx solid #faad14;
  }
  
  &.severity-emergency {
    border-left: 8rpx solid #ff4d4f;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .severity-badge {
      display: flex;
      align-items: center;
      padding: 8rpx 16rpx;
      border-radius: 24rpx;
      background-color: #f5f5f5;

      .severity-icon {
        margin-right: 8rpx;
      }

      .severity-label {
        font-size: 28rpx;
        font-weight: 500;
      }
    }

    .create-time {
      font-size: 24rpx;
      color: #999999;
    }
  }

  .section {
    margin-top: 24rpx;

    .section-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 16rpx;
    }
  }

  .disease-list {
    .disease-item {
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .disease-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12rpx;

        .disease-name {
          font-size: 28rpx;
          color: #333333;
        }

        .disease-tags {
          display: flex;
          gap: 8rpx;

          .tag {
            font-size: 20rpx;
            padding: 4rpx 8rpx;
            border-radius: 8rpx;
            background-color: #f0f0f0;
            color: #666666;
          }
        }
      }

      .probability {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .progress-bar {
          flex: 1;
          height: 8rpx;
          background-color: #f0f0f0;
          border-radius: 4rpx;
          overflow: hidden;

          .progress {
            height: 100%;
            background-color: #1890ff;
            border-radius: 4rpx;
          }
        }

        .percent {
          font-size: 24rpx;
          color: #1890ff;
          min-width: 60rpx;
          text-align: right;
        }
      }
    }
  }

  .suggestions {
    .suggestion-item {
      display: flex;
      align-items: flex-start;
      padding: 12rpx 0;

      .suggestion-icon {
        margin-right: 12rpx;
        flex-shrink: 0;
      }

      .suggestion-text {
        font-size: 26rpx;
        color: #666666;
        line-height: 1.6;
      }
    }
  }

  .dept-list {
    .dept-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      margin-bottom: 12rpx;
      background-color: #f9f9f9;
      border-radius: 12rpx;

      .dept-info {
        .dept-name {
          font-size: 28rpx;
          font-weight: 500;
          color: #333333;
          display: block;
        }

        .dept-reason {
          font-size: 24rpx;
          color: #999999;
          margin-top: 4rpx;
          display: block;
        }
      }

      .dept-urgency {
        font-size: 24rpx;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;

        &.urgency-normal {
          background-color: #e6f7ff;
          color: #1890ff;
        }

        &.urgency-urgent {
          background-color: #fffbe6;
          color: #faad14;
        }
      }
    }
  }
}
</style>
