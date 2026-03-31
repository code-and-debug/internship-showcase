<template>
  <!--
    ============================================================================
    用药选择弹窗组件
    ============================================================================
    
    功能说明：
    表单页面中用于展示选项列表的弹窗组件，支持单选。
    
    使用场景：
    - 被 MedicationSelect 组件引用
    - 用于选择用药途径、用法、单位、频次等
    
    交互逻辑：
  1. 通过 ref 调用 show 方法显示弹窗
    2. 点击选项触发 change 事件并关闭弹窗
    3. 选中项显示高亮样式
    
    样式说明：
    - 使用 g-popup 基础弹窗组件
    - 选项使用网格布局
    ============================================================================
  -->
  <view class="medication-popup">
    <!--
      基础弹窗组件
      提供标题栏、关闭按钮、蒙层等功能
    -->
    <g-popup 
      :title="title" 
      :disabled="disabled" 
      ref="popupRef"
    >
      <view class="popup-content">
        <!--
          标签容器组件
          展示所有选项，支持选中高亮
        -->
        <MedicationTagContainer
          :value="value"
          :option="option"
          :column="column"
          :multiple="multiple"
          :disabled="disabled"
          @item-click="handleItemClick"
        />
      </view>
    </g-popup>
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 用药选择弹窗组件 - 脚本部分
 * ============================================================================
 * 
 * 组件职责：
 * 1. 提供弹窗容器
 * 2. 展示选项列表
 * 3. 处理选项点击
 * 
 * 使用示例：
 * ```vue
 * <template>
 *   <MedicationPopup
 *     ref="popupRef"
 *     v-model:value="selectedValue"
 *     :option="options"
 *     title="请选择"
 *     @change="handleChange"
 *   />
 * </template>
 * 
 * <script setup>
 * import { ref } from 'vue';
 * import MedicationPopup from './MedicationPopup.vue';
 * 
 * const popupRef = ref(null);
 * const selectedValue = ref('');
 * const options = [
 *   { label: '选项1', value: '1' },
 *   { label: '选项2', value: '2' }
 * ];
 * 
 * // 显示弹窗
 * const showPopup = () => {
 *   popupRef.value?.show();
 * };
 * 
 * const handleChange = (item) => {
 *   console.log('选中:', item);
 * };
 * </script>
 * ```
 * ============================================================================
 */

import { ref } from 'vue';
import type { IHOption, IHOptionItem } from '../types';
import MedicationTagContainer from './MedicationTagContainer.vue';

// 模拟 g-popup 组件（实际应从正确路径导入）
const gPopup = {
  name: 'g-popup',
  // 实际使用时这里应该是真实的组件
};

// ============================================
// Props 定义
// ============================================

/**
 * 组件 Props
 * 
 * @property value - 当前选中的值（必填）
 * @property option - 选项列表（必填）
 * @property title - 弹窗标题（可选，默认空）
 * @property column - 列数（可选，默认 3）
 * @property multiple - 是否多选（可选，默认 false）
 * @property disabled - 是否禁用（可选，默认 false）
 */
interface Props {
  value: string | string[];
  option: IHOption;
  title?: string;
  column?: number;
  multiple?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  column: 3,
  multiple: false,
  disabled: false,
});

// ============================================
// Emits 定义
// ============================================

/**
 * 组件事件
 * 
 * @event update:value - 选中值变化时触发（支持 v-model）
 * @event change - 选项变化时触发
 */
const emit = defineEmits<{
  (e: 'update:value', value: string | string[]): void;
  (e: 'change', item: IHOptionItem): void;
}>();

// ============================================
// Refs
// ============================================

/**
 * 弹窗组件引用
 */
const popupRef = ref<any>(null);

// ============================================
// 方法
// ============================================

/**
 * 显示弹窗
 * 
 * 使用场景：
 * 父组件通过 ref 调用此方法显示弹窗
 */
const show = (): void => {
  popupRef.value?.show?.();
};

/**
 * 隐藏弹窗
 * 
 * 使用场景：
 * 父组件通过 ref 调用此方法隐藏弹窗
 */
const hide = (): void => {
  popupRef.value?.hide?.();
};

/**
 * 处理选项点击
 * 
 * 逻辑：
 * - 单选模式：更新值并关闭弹窗
 * - 多选模式：切换选中状态
 * 
 * @param item - 点击的选项
 */
const handleItemClick = (item: IHOptionItem): void => {
  if (props.multiple) {
    // 多选逻辑
    const currentValue = Array.isArray(props.value) ? props.value : [];
    const index = currentValue.indexOf(item.value);
    
    let newValue: string[];
    if (index === -1) {
      newValue = [...currentValue, item.value];
    } else {
      newValue = currentValue.filter(v => v !== item.value);
    }
    
    emit('update:value', newValue);
    emit('change', item);
  } else {
    // 单选逻辑
    emit('update:value', item.value);
    emit('change', item);
    hide();
  }
};

// 暴露方法供父组件调用
defineExpose({
  show,
  hide,
});
</script>

<style lang="scss" scoped>
/**
 * ============================================================================
 * 样式说明
 * ============================================================================
 * 
 * 设计规范：
 * - 内容区内边距 32rpx
 * - 选项使用网格布局
 * ============================================================================
 */

.medication-popup {
  .popup-content {
    padding: 32rpx;
  }
}
</style>
