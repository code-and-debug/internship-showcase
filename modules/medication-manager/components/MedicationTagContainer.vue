<template>
  <!--
    ============================================================================
    用药标签容器组件
    ============================================================================
    
    功能说明：
    以标签形式展示选项列表的容器组件，支持选中高亮、删除操作。
    
    使用场景：
    - 用药提醒时间的展示和管理（添加/删除）
    - 弹窗中的选项列表展示
    - 任何需要标签化展示选项的场景
    
    交互逻辑：
  1. 点击标签触发选中/取消选中
    2. 显示删除图标时，点击删除图标触发删除事件
    3. 默认插槽用于添加自定义内容（如"添加"按钮）
    
    样式说明：
    - 使用 CSS Grid 布局
    - 选中项显示主题色背景和高亮边框
    ============================================================================
  -->
  <view 
    class="medication-tag-container"
    :style="gridStyle"
  >
    <!--
      选项标签列表
      遍历 option 渲染每个标签
    -->
    <view
      v-for="item in option"
      :key="item.value"
      class="tag-item"
      :class="{ 
        'is-active': isItemActive(item.value),
        'is-all-active': isAllActive 
      }"
      @click="handleItemClick(item)"
    >
      <!--
        删除图标
        仅在 showDelIcon 为 true 且非禁用时显示
        点击时阻止冒泡，避免触发标签点击
      -->
      <view
        v-if="showDelIcon && !disabled"
        class="iconfont del-icon"
        @click.stop="handleDeleteClick(item)"
      >
        &#xe6fa;
      </view>
      
      <!-- 标签文本 -->
      <text class="tag-text">{{ item.label }}</text>
    </view>

    <!--
      默认插槽
      用于放置"添加"按钮等自定义内容
    -->
    <view
      v-if="$slots.default && !disabled"
      class="tag-item slot-item"
    >
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 用药标签容器组件 - 脚本部分
 * ============================================================================
 * 
 * 组件职责：
 * 1. 以标签形式展示选项
 * 2. 支持选中状态管理
 * 3. 支持删除操作
 * 
 * 使用示例：
 * ```vue
 * <template>
 *   <!-- 提醒时间展示（可删除） -->
 *   <MedicationTagContainer
 *     :option="notifyTimeOptions"
 *     :value="selectedTimes"
 *     :column="4"
 *     show-del-icon
 *     is-all-active
 *     @item-click="handleTimeClick"
 *     @item-delete="handleTimeDelete"
 *   >
 *     <view @click="showTimePicker" class="add-btn">+ 添加</view>
 *   </MedicationTagContainer>
 * </template>
 * 
 * <script setup>
 * import { ref } from 'vue';
 * import MedicationTagContainer from './MedicationTagContainer.vue';
 * 
 * const notifyTimeOptions = ref([
 *   { label: '08:00', value: '08:00' },
 *   { label: '12:00', value: '12:00' }
 * ]);
 * const selectedTimes = ref(['08:00']);
 * 
 * const handleTimeDelete = (item) => {
 *   console.log('删除时间:', item);
 * };
 * </script>
 * ```
 * ============================================================================
 */

import { computed } from 'vue';
import type { IHOption, IHOptionItem } from '../types';

// ============================================
// Props 定义
// ============================================

/**
 * 组件 Props
 * 
 * @property value - 当前选中的值（必填）
 * @property option - 选项列表（必填）
 * @property column - 列数（可选，默认 3）
 * @property multiple - 是否多选（可选，默认 false）
 * @property disabled - 是否禁用（可选，默认 false）
 * @property showDelIcon - 是否显示删除图标（可选，默认 false）
 * @property isAllActive - 是否全部高亮（可选，默认 false）
 *                    用于提醒时间展示，所有时间都显示选中样式
 */
interface Props {
  value: string | string[];
  option: IHOption;
  column?: number;
  multiple?: boolean;
  disabled?: boolean;
  showDelIcon?: boolean;
  isAllActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  column: 3,
  multiple: false,
  disabled: false,
  showDelIcon: false,
  isAllActive: false,
});

// ============================================
// Emits 定义
// ============================================

/**
 * 组件事件
 * 
 * @event item-click - 点击标签时触发
 * @event item-delete - 点击删除图标时触发
 */
const emit = defineEmits<{
  (e: 'item-click', item: IHOptionItem): void;
  (e: 'item-delete', item: IHOptionItem): void;
}>();

// ============================================
// 计算属性
// ============================================

/**
 * 网格布局样式
 * 
 * 使用 CSS Grid 实现列布局
 * 根据 column 属性动态设置 grid-template-columns
 */
const gridStyle = computed(() => ({
  'grid-template-columns': `repeat(${props.column}, 1fr)`,
}));

// ============================================
// 方法
// ============================================

/**
 * 检查某项是否处于激活状态
 * 
 * 逻辑：
 * - 如果 isAllActive 为 true，全部激活
 * - 多选模式：检查 value 数组中是否包含该值
 * - 单选模式：检查 value 是否等于该值
 * 
 * @param itemValue - 选项值
 * @returns 是否激活
 */
const isItemActive = (itemValue: string): boolean => {
  if (props.isAllActive) {
    return true;
  }
  
  if (props.multiple) {
    const values = Array.isArray(props.value) ? props.value : [];
    return values.includes(itemValue);
  }
  
  return props.value === itemValue;
};

/**
 * 处理标签点击
 * 
 * 逻辑：
 * - 禁用时直接返回
 * - 触发 item-click 事件
 * 
 * @param item - 点击的选项
 */
const handleItemClick = (item: IHOptionItem): void => {
  if (props.disabled) {
    return;
  }
  emit('item-click', item);
};

/**
 * 处理删除点击
 * 
 * 逻辑：
 * 触发 item-delete 事件
 * 
 * @param item - 要删除的选项
 */
const handleDeleteClick = (item: IHOptionItem): void => {
  emit('item-delete', item);
};
</script>

<style lang="scss" scoped>
/**
 * ============================================================================
 * 样式说明
 * ============================================================================
 * 
 * 设计规范：
 * - 使用 CSS Grid 布局
 * - 间距 16rpx
 * - 标签最小高度 80rpx
 * - 选中状态使用主题色
 * ============================================================================
 */

.medication-tag-container {
  display: grid;
  gap: 16rpx;

  // 标签项
  .tag-item {
    position: relative;
    background-color: var(--hr-neutral-color-1);
    min-height: 80rpx;
    border-radius: 16rpx;
    font-size: var(--hr-font-size-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16rpx;
    transition: all 0.2s ease;

    // 删除图标
    .del-icon {
      position: absolute;
      right: -4rpx;
      top: -8rpx;
      color: var(--hr-neutral-color-9);
      font-size: 40rpx;
      z-index: 2;
      
      &:active {
        transform: scale(0.9);
      }
    }

    // 标签文本
    .tag-text {
      text-align: center;
      word-break: break-all;
    }

    // 选中状态
    &.is-active,
    &.is-all-active {
      color: var(--hr-brand-color-6);
      background: var(--hr-brand-color-6-light, rgba(24, 144, 255, 0.1));
      
      // 高亮边框
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2rpx solid var(--hr-brand-color-6);
        border-radius: 16rpx;
        pointer-events: none;
      }
    }

    // 插槽项
    &.slot-item {
      background-color: transparent;
      padding: 0;
    }

    // 点击反馈
    &:active:not(.is-active):not(.slot-item) {
      opacity: 0.8;
    }
  }
}
</style>
