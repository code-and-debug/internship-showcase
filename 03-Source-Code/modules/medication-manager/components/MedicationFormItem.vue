<template>
  <!--
    ============================================================================
    用药表单条目组件
    ============================================================================
    
    功能说明：
    表单页面中用于展示单个表单字段的条目组件，包含标签和输入区。
    
    使用场景：
    - 新增/编辑用药提醒页 (MedicationForm.vue)
    - 配合 MedicationFormBox 使用，构建表单布局
    
    布局模式：
    - 行内模式 (inline=true): 标签和输入区横向排列
    - 块级模式 (inline=false): 标签和输入区纵向排列
    
    样式说明：
    - 底部边框分隔
    - 标签默认宽度 160rpx（行内模式）
    ============================================================================
  -->
  <view class="medication-form-item">
    <!--
      行内模式布局
      标签和输入区在同一行
    -->
    <view v-if="inline" class="row-layout">
      <view class="item-label">{{ label }}</view>
      <view class="item-content">
        <slot />
      </view>
    </view>

    <!--
      块级模式布局
      标签在上，输入区在下
    -->
    <view v-else class="block-layout">
      <view class="item-label">{{ label }}</view>
      <view class="item-content">
        <slot />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 用药表单条目组件 - 脚本部分
 * ============================================================================
 * 
 * 组件职责：
 * 提供统一的表单条目布局，支持行内和块级两种模式。
 * 
 * 使用示例：
 * ```vue
 * <template>
 *   <!-- 行内模式：标签和输入区横向排列 -->
 *   <MedicationFormItem label="药品名称" inline>
 *     <uni-easyinput v-model="form.recipeName" />
 *   </MedicationFormItem>
 *   
 *   <!-- 块级模式：标签在上，输入区在下 -->
 *   <MedicationFormItem label="提醒时间" :inline="false">
 *     <MedicationTagContainer :option="notifyTimes" />
 *   </MedicationFormItem>
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
 * @property label - 字段标签（必填）
 *                   如"药品名称"、"使用途径"等
 * @property inline - 是否行内布局（可选，默认 true）
 *                    true: 标签和输入区横向排列
 *                    false: 标签在上，输入区在下
 */
interface Props {
  label: string;
  inline?: boolean;
}

withDefaults(defineProps<Props>(), {
  inline: true,
});
</script>

<style lang="scss" scoped>
/**
 * ============================================================================
 * 样式说明
 * ============================================================================
 * 
 * 设计规范：
 * - 外边距 26rpx 32rpx，与其他条目保持间距
 * - 底部边框分隔
 * - 标签颜色使用中性色-7
 * ============================================================================
 */

.medication-form-item {
  margin: 26rpx 32rpx;
  padding-bottom: 26rpx;
  border-bottom: 1rpx solid var(--hr-neutral-color-2);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  // 行内布局
  .row-layout {
    display: flex;
    align-items: center;

    .item-label {
      width: 160rpx;
      color: var(--hr-neutral-color-7);
      font-size: 28rpx;
      flex-shrink: 0; // 不压缩
    }

    .item-content {
      flex: 1; // 占据剩余空间
      min-width: 0; // 允许压缩
    }
  }

  // 块级布局
  .block-layout {
    display: flex;
    flex-direction: column;

    .item-label {
      width: 100%;
      color: var(--hr-neutral-color-7);
      font-size: 28rpx;
      margin-bottom: 16rpx;
    }

    .item-content {
      width: 100%;
    }
  }
}
</style>
