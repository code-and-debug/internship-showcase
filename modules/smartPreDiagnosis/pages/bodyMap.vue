<template>
  <view class="body-map-page">
    <view class="header">
      <text class="title">请选择您不舒服的部位</text>
      <text class="tip">点击身体图上的对应部位</text>
    </view>

    <!-- 人体图 -->
    <view class="body-container">
      <view class="body-svg">
        <!-- 简化版人体图 -->
        <view class="body-head" :class="{ selected: isSelected('head') }" @click="selectPart('head', '头部')">
          <text>头</text>
        </view>
        <view class="body-neck" :class="{ selected: isSelected('neck') }" @click="selectPart('neck', '颈部')">
          <text>颈</text>
        </view>
        <view class="body-torso">
          <view class="torso-chest" :class="{ selected: isSelected('chest') }" @click="selectPart('chest', '胸部')">
            <text>胸</text>
          </view>
          <view class="torso-abdomen" :class="{ selected: isSelected('abdomen') }" @click="selectPart('abdomen', '腹部')">
            <text>腹</text>
          </view>
        </view>
        <view class="body-limbs">
          <view class="limbs-left">
            <view class="arm" :class="{ selected: isSelected('left-arm') }" @click="selectPart('left-arm', '左上肢')">
              <text>左上肢</text>
            </view>
            <view class="leg" :class="{ selected: isSelected('left-leg') }" @click="selectPart('left-leg', '左下肢')">
              <text>左下肢</text>
            </view>
          </view>
          <view class="limbs-right">
            <view class="arm" :class="{ selected: isSelected('right-arm') }" @click="selectPart('right-arm', '右上肢')">
              <text>右上肢</text>
            </view>
            <view class="leg" :class="{ selected: isSelected('right-leg') }" @click="selectPart('right-leg', '右下肢')">
              <text>右下肢</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 已选部位 -->
    <view class="selected-parts" v-if="selectedParts.length > 0">
      <text class="label">已选部位：</text>
      <view class="tags">
        <view class="tag" v-for="part in selectedParts" :key="part.id">
          <text>{{ part.name }}</text>
          <text class="remove" @click="removePart(part.id)">×</text>
        </view>
      </view>
    </view>

    <!-- 下一步按钮 -->
    <view class="footer">
      <button class="btn-next" :disabled="selectedParts.length === 0" @click="goToSymptoms">
        下一步
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDiagnosisStore } from '../store/diagnosisStore';

const store = useDiagnosisStore();

// ========== State ==========
const selectedParts = ref<{ id: string; name: string }[]>([]);

// ========== Methods ==========
const isSelected = (id: string) => {
  return selectedParts.value.some(p => p.id === id);
};

const selectPart = (id: string, name: string) => {
  if (isSelected(id)) {
    removePart(id);
  } else {
    selectedParts.value.push({ id, name });
    // 同时更新 store
    store.toggleBodyPart({ id, name, icon: '' });
  }
};

const removePart = (id: string) => {
  const index = selectedParts.value.findIndex(p => p.id === id);
  if (index > -1) {
    selectedParts.value.splice(index, 1);
  }
};

const goToSymptoms = () => {
  uni.navigateTo({
    url: '/pagesD/smartPreDiagnosis/symptoms',
  });
};
</script>

<style scoped lang="scss">
.body-map-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 30rpx;
  background-color: #fff;

  .title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }

  .tip {
    display: block;
    font-size: 26rpx;
    color: #999;
  }
}

.body-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
}

.body-svg {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.body-head {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;

  &.selected {
    background-color: #1890ff;
    color: #fff;
  }

  text {
    font-size: 28rpx;
  }
}

.body-neck {
  width: 60rpx;
  height: 40rpx;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;

  &.selected {
    background-color: #1890ff;
    color: #fff;
  }

  text {
    font-size: 24rpx;
  }
}

.body-torso {
  display: flex;
  margin-bottom: 10rpx;
}

.torso-chest,
.torso-abdomen {
  width: 120rpx;
  height: 140rpx;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10rpx;

  &.selected {
    background-color: #1890ff;
    color: #fff;
  }

  text {
    font-size: 28rpx;
  }
}

.body-limbs {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.limbs-left,
.limbs-right {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.arm,
.leg {
  width: 60rpx;
  height: 160rpx;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;

  &.selected {
    background-color: #1890ff;
    color: #fff;
  }

  text {
    font-size: 22rpx;
    writing-mode: vertical-lr;
  }
}

.selected-parts {
  padding: 30rpx;
  background-color: #fff;

  .label {
    font-size: 28rpx;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .tag {
    display: flex;
    align-items: center;
    padding: 12rpx 20rpx;
    background-color: #e6f7ff;
    border: 1rpx solid #1890ff;
    border-radius: 20rpx;

    text:first-child {
      font-size: 26rpx;
      color: #1890ff;
    }

    .remove {
      margin-left: 8rpx;
      font-size: 30rpx;
      color: #1890ff;
    }
  }
}

.footer {
  padding: 30rpx;
  background-color: #fff;

  .btn-next {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 44rpx;
    color: #fff;
    font-size: 32rpx;
    border: none;

    &[disabled] {
      opacity: 0.5;
    }
  }
}
</style>
