<template>
  <!--
    ============================================================================
    历史处方页
    ============================================================================
    
    页面功能：
    1. 展示用户在医院的历史处方列表
    2. 支持展开处方查看药品详情（懒加载）
    3. 支持从处方中选择药品添加到用药提醒
    
    业务流程：
    1. 页面加载时获取近5年的历史处方
    2. 按日期分组展示
    3. 用户点击展开某条处方
    4. 首次展开时懒加载药品详情
    5. 用户点击药品的"添加"按钮
    6. 将药品信息存入 store，跳转到表单页
    
    布局说明：
    - 顶部：返回按钮 + 标题
    - 中部：按日期分组的处方列表
    - 底部：无
    ============================================================================
  -->
  <view class="medication-history-page">
    <!-- 页面标题栏（如需要） -->
    <view class="page-header">
      <text class="page-title">选择处方药品</text>
    </view>

    <!-- 列表内容区（可滚动） -->
    <scroll-view class="list-container" scroll-y>
      <!--
        按日期分组展示处方
        遍历 listData 渲染日期分组
      -->
      <view
        v-for="(group, groupIndex) in listData"
        :key="group.date"
        class="date-group"
      >
        <!-- 日期标题 -->
        <view class="date-title">{{ group.date }}</view>

        <!--
          该日期下的处方列表
          遍历 prescList 渲染每条处方
        -->
        <view
          v-for="(prescription, prescIndex) in group.prescList"
          :key="prescription.prescId"
          class="prescription-item"
        >
          <MedicalCollapse
            :item="prescription"
            :open="groupIndex === 0 && prescIndex === 0"
            @change="handleCollapseChange"
            @item-click="handleDrugSelect"
          />
        </view>
      </view>

      <!--
        空状态
        没有历史处方时显示
      -->
      <view v-if="isComplete && !listData.length" class="empty-state">
        <g-empty current="1" text="你没有历史处方，请返回自定义添加药物">
          <button class="btn btn-primary back-btn" @click="goBack">
            返回添加药物
          </button>
        </g-empty>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder" />
    </scroll-view>

    <!-- 全局消息 -->
    <g-message />
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 历史处方页 - 脚本部分
 * ============================================================================
 * 
 * 页面职责：
 * 1. 获取并展示患者的历史处方列表
 * 2. 支持懒加载处方详情
 * 3. 支持选择药品跳转到表单页
 * 
 * 数据流：
 * 1. onLoad 生命周期获取处方列表
 * 2. 用户点击展开处方时懒加载详情
 * 3. 用户点击药品的"添加"按钮
 * 4. 将药品详情存入 store.addItem
 * 5. 跳转到表单页，表单页读取并预填充
 * ============================================================================
 */

import { onLoad } from '@dcloudio/uni-app';
import { useMedicationStore } from '../store/medicationStore';
import { useMedicationHistory } from '../composables/useMedicationHistory';
import MedicalCollapse from '../components/MedicalCollapse.vue';
import type { TMedicalDrugHisListItem, TDrugDetailItem } from '../types';

// 模拟组件导入（实际应从正确路径导入）
const gEmpty = { name: 'g-empty' };
const gMessage = { name: 'g-message' };

// ============================================
// Store 和 Hooks
// ============================================

/**
 * Pinia Store 实例
 */
const medicationStore = useMedicationStore();

/**
 * 历史处方逻辑 Hook
 */
const {
  listData,
  isComplete,
  getList,
  loadPrescriptionDetail,
  goBack,
} = useMedicationHistory();

// ============================================
// 生命周期
// ============================================

/**
 * 页面加载生命周期
 * 
 * 逻辑：
 * 获取历史处方列表数据
 */
onLoad(async () => {
  await getList();
});

// ============================================
// 事件处理
// ============================================

/**
 * 处理折叠面板展开/收起变化
 * 
 * 逻辑：
 * 1. 如果是展开状态且尚未加载详情，调用 API 加载
 * 2. 加载完成后调用 init 回调刷新折叠面板高度
 * 
 * @param event - { isShow, item, init }
 */
const handleCollapseChange = async (event: {
  isShow: boolean;
  item: TMedicalDrugHisListItem;
  init: () => void;
}): Promise<void> => {
  const { isShow, item, init } = event;
  
  // 仅在展开且未加载详情时请求
  if (isShow && item.drugDetailList.length === 0) {
    await loadPrescriptionDetail(item);
    // 刷新折叠面板高度
    init();
  }
};

/**
 * 处理药品选择
 * 
 * 逻辑：
 * 1. 将选中的药品详情存入 store
 * 2. 跳转到表单页
 * 
 * @param drug - 选中的药品详情
 */
const handleDrugSelect = (drug: TDrugDetailItem): void => {
  // 将药品详情存入全局状态
  medicationStore.changeAddItem(drug);
  
  // 跳转到表单页，表单页会读取 store.addItem 预填充
  uni.navigateTo({
    url: '/pagesC/medicationManagerOptimized/pages/MedicationForm',
  });
};
</script>

<style lang="scss" scoped>
/**
 * ============================================================================
 * 样式说明
 * ============================================================================
 * 
 * 布局结构：
 * - 页面使用 flex 纵向布局
 * - 列表区占据剩余空间
 * 
 * 样式细节：
 * - 日期标题使用加粗字体
 * - 处方项之间保持间距
 * - 空状态居中显示
 * ============================================================================
 */

.medication-history-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--hr-neutral-color-1);

  // 页面标题
  .page-header {
    padding: 24rpx 32rpx;
    background-color: var(--h-color-white);
    border-bottom: 1rpx solid var(--hr-neutral-color-2);

    .page-title {
      font-size: 36rpx;
      font-weight: 600;
      color: var(--hr-neutral-color-10);
    }
  }

  // 列表容器
  .list-container {
    flex: 1;
    padding: 0 32rpx;
    overflow-y: auto;

    // 日期分组
    .date-group {
      margin-bottom: 32rpx;

      // 日期标题
      .date-title {
        font-size: 32rpx;
        font-weight: 600;
        color: var(--hr-neutral-color-10);
        padding: 32rpx 0 24rpx;
      }

      // 处方项
      .prescription-item {
        margin-bottom: 16rpx;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    // 空状态
    .empty-state {
      padding-top: 200rpx;
      display: flex;
      justify-content: center;

      .back-btn {
        margin-top: 32rpx;
        width: 320rpx;
        height: 72rpx;
        line-height: 72rpx;
        border-radius: 36rpx;
        font-size: 28rpx;
        background: linear-gradient(135deg, var(--hr-brand-color-6) 0%, var(--hr-brand-color-5) 100%);
        color: var(--h-color-white);
        border: none;

        &:active {
          opacity: 0.8;
        }
      }
    }

    // 底部占位
    .bottom-placeholder {
      height: 48rpx;
    }
  }
}
</style>
