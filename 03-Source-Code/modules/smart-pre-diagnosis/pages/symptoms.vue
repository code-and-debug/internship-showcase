<template>
  <view class="symptoms-page">
    <!-- 症状选择 -->
    <view class="section">
      <text class="section-title">请选择您的症状</text>
      <view class="symptom-list">
        <view
          v-for="symptom in symptomOptions"
          :key="symptom.id"
          class="symptom-item"
          :class="{ selected: symptom.selected }"
          @click="toggleSymptom(symptom)"
        >
          <text>{{ symptom.name }}</text>
        </view>
      </view>
    </view>

    <!-- 补充描述 -->
    <view class="section">
      <text class="section-title">补充描述（选填）</text>
      <textarea
        class="description-input"
        v-model="description"
        placeholder="请描述您的症状持续时间、具体情况等"
        maxlength="200"
      />
    </view>

    <!-- 下一步按钮 -->
    <view class="footer">
      <button class="btn-assess" :disabled="selectedSymptoms.length === 0 || isAssessing" @click="startAssessment">
        {{ isAssessing ? '评估中...' : '开始评估' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDiagnosisStore } from '../store/diagnosisStore';

const store = useDiagnosisStore();

// ========== State ==========
const description = ref('');
const symptomOptions = ref<{ id: string; name: string; category: string; selected: boolean }[]>([
  { id: '1', name: '头痛', category: '头部', selected: false },
  { id: '2', name: '头晕', category: '头部', selected: false },
  { id: '3', name: '发热', category: '全身', selected: false },
  { id: '4', name: '咳嗽', category: '胸部', selected: false },
  { id: '5', name: '胸痛', category: '胸部', selected: false },
  { id: '6', name: '腹痛', category: '腹部', selected: false },
  { id: '7', name: '腹泻', category: '腹部', selected: false },
  { id: '8', name: '呕吐', category: '腹部', selected: false },
  { id: '9', name: '腰痛', category: '背部', selected: false },
  { id: '10', name: '关节痛', category: '四肢', selected: false },
  { id: '11', name: '乏力', category: '全身', selected: false },
  { id: '12', name: '失眠', category: '全身', selected: false },
]);

// ========== Computed ==========
const selectedSymptoms = computed(() => symptomOptions.value.filter(s => s.selected));
const isAssessing = computed(() => store.assessing);

// ========== Methods ==========
const toggleSymptom = (symptom: any) => {
  symptom.selected = !symptom.selected;
};

const startAssessment = async () => {
  // 更新 store 中的描述
  store.description = description.value;

  // 更新选中的症状到 store
  store.selectedSymptoms = selectedSymptoms.value.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category,
  }));

  // 跳转到结果页面（模拟评估结果）
  // 实际项目中这里应该调用 AI 评估 API
  uni.showLoading({ title: 'AI评估中...' });

  setTimeout(() => {
    // 模拟评估结果
    store.assessmentResult = {
      id: 'result-001',
      diseases: [
        { name: '上呼吸道感染', probability: 0.85, description: '常见感冒类型', tags: ['常见', '轻微'] },
        { name: '普通感冒', probability: 0.72, description: '病毒性感冒', tags: ['常见'] },
      ],
      severity: 'normal',
      suggestions: ['多休息', '多喝水', '注意保暖'],
      recommendedDepts: [
        { deptId: 'dept-001', deptName: '呼吸内科', reason: '根据您的症状推荐', urgency: 'normal' },
        { deptId: 'dept-002', deptName: '急诊内科', reason: '如症状加重可就诊', urgency: 'urgent' },
      ],
      createTime: new Date().toISOString(),
    };

    uni.hideLoading();
    uni.navigateTo({
      url: '/pagesD/smartPreDiagnosis/result',
    });
  }, 2000);
};
</script>

<style scoped lang="scss">
.symptoms-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
  padding-bottom: 200rpx;
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

.symptom-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.symptom-item {
  padding: 16rpx 28rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  border: 2rpx solid transparent;

  text {
    font-size: 26rpx;
    color: #666;
  }

  &.selected {
    background-color: #e6f7ff;
    border-color: #1890ff;

    text {
      color: #1890ff;
    }
  }
}

.description-input {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .btn-assess {
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
