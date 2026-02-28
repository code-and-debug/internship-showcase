<template>
  <!--
    ============================================================================
    用药表单容器组件
    ============================================================================
    
    功能说明：
    表单页面中用于分组展示表单字段的容器组件，带有标题栏。
    
    使用场景：
    - 新增/编辑用药提醒页 (MedicationForm.vue)
    - 将表单字段按功能分组（如"用什么药"、"用药时间"等）
    
    插槽说明：
    - default: 表单内容区域
    - header-suffix: 标题栏右侧额外内容（如"导入历史处方"按钮）
    
    样式说明：
    - 白色圆角卡片
    - 标题栏带底部边框
    ============================================================================
  -->
  <view class="medication-form-box">
    <!-- 标题栏（仅在传入 title 时显示） -->
    <view v-if="title" class="form-header">
      <view class="header-left">
        <text class="header-title">{{ title }}</text>
      </view>
      
      <!-- 标题栏右侧插槽：用于放置"导入历史处方"等按钮 -->
      <view class="header-right">
        <slot name="header-suffix" />
      </view>
    </view>

    <!-- 内容区域：放置表单字段 -->
    <view class="form-body">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 用药表单容器组件 - 脚本部分
 * ============================================================================
 * 
 * 组件职责：
 * 提供统一的表单分组容器，保持页面布局一致性。
 * 
 * 使用示例：
 * ```vue
 * <template>
 *   <MedicationFormBox title="用什么药">
 *     <template #header-suffix>
 *       <view @click="goToHistory" class="link-btn">导入历史处方</view>
 *     </template>
 *     
 *     <MedicationFormItem label="药品名称">
 *       <uni-easyinput v-model="form.recipeName" placeholder="请输入" />
 *     </MedicationFormItem>
 *     
 *     <MedicationFormItem label="使用途径">
 *       <MedicationSelect v-model:value="form.useDrugWay" :options="drugWays" />
 *     </MedicationFormItem>
 *   </MedicationFormBox>
 * </template>
 * ```
 * ============================================================================
 */

// ============================================
// Props 定义
// ============================================

/**
 * 组件 Props
 * 
 * @property title - 分组标题（可选）
 *                  如"用什么药"、"用药时间"等
 */
interface Props {
  title?: string;
}

withDefaults(defineProps<Props>(), {
  title: '',
});
</script>

<style lang="scss" scoped>
/**
 * ============================================================================
 * 样式说明
 * ============================================================================
 * 
 * 设计规范：
 * - 白色背景圆角卡片
 * - 标题栏 88rpx 高度，带底部边框
 * - 标题加粗显示
 * ============================================================================
 */

.medication-form-box {
  background-color: var(--h-color-white);
  border-radius: 16rpx;
  margin-bottom: 24rpx;

  // 标题栏
  .form-header {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx;
    border-bottom: 1rpx solid var(--hr-neutral-color-2);

    .header-left {
      .header-title {
        font-weight: 600;
        font-size: 32rpx;
        color: var(--hr-neutral-color-10);
      }
    }

    .header-right {
      // 插槽内容样式由使用者自定义
    }
  }

  // 内容区域
  .form-body {
    padding: 8rpx 0;
  }
}
</style>
