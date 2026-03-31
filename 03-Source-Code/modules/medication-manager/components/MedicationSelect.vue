<template>
  <!--
    ============================================================================
    用药选择器组件（触发器）
    ============================================================================
    
    功能说明：
    表单页面中用于触发选择弹窗的组件，展示当前选中的值或占位文本。
    
    使用场景：
    - 新增/编辑用药提醒页 (MedicationForm.vue)
    - 用于选择用药途径、用法、单位、频次等
    
    交互逻辑：
  1. 点击区域触发弹窗（通过 ref 调用弹窗组件的 show 方法）
    2. 展示当前选中的 label 或占位文本
    3. 禁用状态下不响应点击
    
    样式说明：
    - 占位文本使用浅灰色
    - 右侧显示下拉箭头图标
    ============================================================================
  -->
  <view class="medication-select">
    <!--
      弹窗选择器组件
      使用 $attrs 和 $props 透传所有属性
    -->
    <MedicationPopup
      v-bind="$attrs"
      :value="value"
      :disabled="disabled"
      :multiple="false"
      @change="handleChange"
      ref="popupRef"
    />

    <!-- 触发区域 -->
    <view 
      class="select-trigger"
      :class="{ 'is-disabled': disabled }"
      @click="handleTriggerClick"
    >
      <!--
        显示文本
        - 有选中值时显示 label
        - 无选中值时显示 placeholder
        - 未找到对应选项时直接显示 value
      -->
      <view 
        class="select-label"
        :class="{ 'is-placeholder': !value }"
      >
        {{ displayLabel }}
      </view>
      
      <!-- 下拉箭头图标（禁用时不显示） -->
      <view v-if="!disabled" class="iconfont icon-arrow">&#xe6b9;</view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 用药选择器组件 - 脚本部分
 * ============================================================================
 * 
 * 组件职责：
 * 1. 展示当前选中的值
 * 2. 触发选择弹窗
 * 3. 处理选择结果
 * 
 * 使用示例：
 * ```vue
 * <template>
 *   <MedicationFormItem label="使用途径">
 *     <MedicationSelect
 *       v-model:value="form.useDrugWay"
 *       :option="medicationStore.optionsDrugWay"
 *       title="选择药品使用途径"
 *       placeholder="请选择"
 *     />
 *   </MedicationFormItem>
 * </template>
 * 
 * <script setup>
 * import { ref } from 'vue';
 * import { useMedicationStore } from '../store/medicationStore';
 * 
 * const medicationStore = useMedicationStore();
 * const form = ref({ useDrugWay: '' });
 * </script>
 * ```
 * ============================================================================
 */

import { computed, ref } from 'vue';
import type { IHOption, IHOptionItem } from '../types';
import MedicationPopup from './MedicationPopup.vue';

// ============================================
// Props 定义
// ============================================

/**
 * 组件 Props
 * 
 * @property value - 当前选中的值（必填）
 * @property option - 选项列表（必填）
 * @property placeholder - 占位提示文本（可选，默认"请选择"）
 * @property disabled - 是否禁用（可选，默认 false）
 * @property title - 弹窗标题（可选）
 */
interface Props {
  value: string;
  option: IHOption;
  placeholder?: string;
  disabled?: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  title: '',
});

// ============================================
// Emits 定义
// ============================================

/**
 * 组件事件
 * 
 * @event update:value - 选中值变化时触发（支持 v-model）
 * @param value - 选中的值
 */
const emit = defineEmits<{
  (e: 'update:value', value: string): void;
}>();

// ============================================
// Refs
// ============================================

/**
 * 弹窗组件引用
 * 用于调用弹窗的 show/hide 方法
 */
const popupRef = ref<InstanceType<typeof MedicationPopup> | null>(null);

// ============================================
// 计算属性
// ============================================

/**
 * 显示的文本
 * 
 * 逻辑：
 * - 根据 value 在 option 中查找对应的 label
 * - 找到则返回 label，否则返回 value 本身
 * - value 为空时返回空字符串（触发 placeholder 显示）
 */
const displayLabel = computed(() => {
  if (!props.value) {
    return '';
  }
  
  const item = props.option.find(o => o.value === props.value);
  return item?.label ?? props.value;
});

// ============================================
// 方法
// ============================================

/**
 * 处理触发点击
 * 
 * 逻辑：
 * - 禁用时直接返回
 * - 否则调用弹窗的 show 方法
 */
const handleTriggerClick = (): void => {
  if (props.disabled) {
    return;
  }
  popupRef.value?.show?.();
};

/**
 * 处理选择变化
 * 
 * 逻辑：
 * - 触发 update:value 事件更新父组件的值
 * 
 * @param item - 选中的选项
 */
const handleChange = (item: IHOptionItem): void => {
  emit('update:value', item.value);
};
</script>

<style lang="scss" scoped>
/**
 * ============================================================================
 * 样式说明
 * ============================================================================
 * 
 * 设计规范：
 * - 宽度 100%，占满容器
 * - 触发区域使用 flex 布局
 * - 占位文本使用浅灰色
 * ============================================================================
 */

.medication-select {
  width: 100%;

  // 触发区域
  .select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 60rpx;
    
    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    // 显示文本
    .select-label {
      flex: 1;
      font-size: 28rpx;
      color: var(--hr-neutral-color-10);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      // 占位样式
      &.is-placeholder {
        color: var(--hr-neutral-color-5);
        font-weight: 300;
      }
    }

    // 箭头图标
    .icon-arrow {
      font-size: var(--hr-font-size-xxl);
      color: var(--hr-neutral-color-5);
      margin-left: 16rpx;
    }
  }
}
</style>
