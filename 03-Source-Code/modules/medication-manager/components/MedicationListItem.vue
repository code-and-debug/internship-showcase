<template>
  <!--
    ============================================================================
    用药提醒列表项组件
    ============================================================================
    
    功能说明：
    展示单个用药提醒的卡片式组件，包含状态标签、药品名称、提醒时间、用法用量等信息。
    
    使用场景：
    - 用药提醒列表页 (MedicationList.vue) 中使用 v-for 渲染
    - 用户点击可进入编辑页面
    
    交互逻辑：
    1. 点击整个卡片触发 item-click 事件，跳转到编辑页
    2. 管理模式 (disabled=true) 时点击不响应
    
    样式说明：
    - 白色圆角卡片，带轻微阴影
    - 状态标签显示在标题左侧（已关闭/待执行/执行中）
    - 提醒时间以标签形式横向排列
    ============================================================================
  -->
  <view class="medication-list-item">
    <!-- 头部：状态标签 + 药品名称 + 箭头 -->
    <view class="item-header" @click="handleClick">
      <!--
        状态标签
        根据 medication.status 和 medication.isClose 显示不同样式：
        - 已关闭（isClose=1 或 status=3）：灰色标签
        - 待执行（status=2）：蓝色标签
        - 执行中（status=1）：绿色标签
      -->
      <text 
        v-if="showClosedTag" 
        class="status-tag tag-gray"
      >
        已关闭
      </text>
      <text 
        v-else-if="showPendingTag" 
        class="status-tag tag-blue"
      >
        待执行
      </text>
      <text 
        v-else-if="showRunningTag" 
        class="status-tag tag-green"
      >
        执行中
      </text>
      
      <!-- 药品/处方名称 -->
      <view class="medication-name text-ellipsis">
        {{ item.recipeName }}
      </view>
      
      <!-- 右箭头图标 -->
      <view class="iconfont icon-arrow">&#xe6b9;</view>
    </view>

    <!-- 内容区：提醒时间 + 用法用量 + 备注 -->
    <view class="item-content" @click="handleClick">
      <!-- 提醒时间列表 -->
      <view class="notify-times">
        <view 
          v-for="time in item.notifyTime" 
          :key="time"
          class="time-tag"
        >
          {{ time }}
        </view>
      </view>

      <!-- 用法用量信息 -->
      <view class="usage-info">
        {{ formatUsage }}
      </view>
      
      <!-- 备注信息（如果有） -->
      <view v-if="item.remark" class="remark-info">
        {{ item.remark }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 用药提醒列表项组件 - 脚本部分
 * ============================================================================
 * 
 * 组件职责：
 * 1. 展示用药提醒的基本信息
 * 2. 根据状态显示不同的标签样式
 * 3. 触发点击事件供父组件处理跳转
 * 
 * 使用示例：
 * ```vue
 * <template>
 *   <view v-for="medication in medicalList" :key="medication.id.join(',')">
 *     <MedicationListItem 
 *       :item="medication"
 *       :disabled="isShowCheck"
 *       @item-click="handleItemClick"
 *     />
 *   </view>
 * </template>
 * 
 * <script setup>
 * import MedicationListItem from './components/MedicationListItem.vue';
 * import { useMedicationStore } from '../store/medicationStore';
 * 
 * const medicationStore = useMedicationStore();
 * 
 * const handleItemClick = (item) => {
 *   // 将选中的数据存入 store
 *   medicationStore.updateCheckItem(item);
 *   // 跳转到编辑页
 *   uni.navigateTo({
 *     url: '/pagesC/medicationManagerOptimized/pages/MedicationForm'
 *   });
 * };
 * </script>
 * ```
 * ============================================================================
 */

import { computed } from 'vue';
import type { IMedication, IMedicationListItemProps } from '../types';
import { EMedicationStatus } from '../types';

// ============================================
// Props 定义
// ============================================

/**
 * 组件 Props
 * 
 * @property item - 用药提醒数据（必填）
 * @property disabled - 是否禁用点击（可选，默认 false）
 *                    用于管理模式时禁止点击进入编辑页
 */
interface Props extends IMedicationListItemProps {
  item: IMedication;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

// ============================================
// Emits 定义
// ============================================

/**
 * 组件事件
 * 
 * @event item-click - 点击整个卡片时触发
 * @param item - 用药提醒数据，父组件可用此数据进行跳转
 */
const emit = defineEmits<{
  (e: 'item-click', item: IMedication): void;
}>();

// ============================================
// 计算属性
// ============================================

/**
 * 是否显示"已关闭"标签
 * 
 * 逻辑：isClose === 1 或 status === 3 时显示
 */
const showClosedTag = computed(() => {
  return props.item.isClose === 1 || props.item.status === EMedicationStatus.CLOSED;
});

/**
 * 是否显示"待执行"标签
 * 
 * 逻辑：status === 2 且未关闭时显示
 */
const showPendingTag = computed(() => {
  return props.item.status === EMedicationStatus.PENDING && props.item.isClose !== 1;
});

/**
 * 是否显示"执行中"标签
 * 
 * 逻辑：status === 1 且未关闭时显示
 */
const showRunningTag = computed(() => {
  return props.item.status === EMedicationStatus.RUNNING && props.item.isClose !== 1;
});

/**
 * 格式化用法用量显示文本
 * 
 * 组合逻辑：用法 + 单次用量 + 频次
 * 示例："饭后服用 · 2片/次 · 每日三次"
 */
const formatUsage = computed(() => {
  const parts: string[] = [];
  
  // 用法（如：饭后服用）
  if (props.item.useDrugUses) {
    parts.push(props.item.useDrugUses);
  }
  
  // 单次用量（如：2片/次）
  if (props.item.useDrugAmount && props.item.useDrugUnit) {
    parts.push(`${props.item.useDrugAmount}${props.item.useDrugUnit}/次`);
  }
  
  // 频次（如：每日三次）
  if (props.item.useDrugFrequency) {
    parts.push(props.item.useDrugFrequency);
  }
  
  return parts.join(' · ');
});

// ============================================
// 方法
// ============================================

/**
 * 处理点击事件
 * 
 * 逻辑：
 * - 如果 disabled 为 true（管理模式），不响应点击
 * - 否则触发 item-click 事件，将 item 数据传递给父组件
 */
const handleClick = (): void => {
  if (props.disabled) {
    return;
  }
  emit('item-click', props.item);
};
</script>

<style lang="scss" scoped>
/**
 * ============================================================================
 * 样式说明
 * ============================================================================
 * 
 * 设计规范：
 * - 使用 CSS 变量保持与项目整体风格一致
 * - rpx 单位适配不同屏幕尺寸
 * - 组件宽度 calc(100vw - 125rpx) 考虑到了列表页复选框的宽度
 * ============================================================================
 */

.medication-list-item {
  // 白色背景圆角卡片
  background-color: var(--h-color-white);
  border-radius: 16rpx;
  padding: 32rpx;
  
  // 宽度计算：减去复选框和间距的宽度
  width: calc(100vw - 125rpx);
  
  // 阴影效果
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);

  // 头部布局：横向排列
  .item-header {
    display: flex;
    align-items: center;

    // 状态标签样式
    .status-tag {
      border-radius: 8rpx;
      padding: 4rpx 16rpx;
      margin-right: 16rpx;
      font-size: var(--hr-font-size-xs);
      flex-shrink: 0; // 不压缩
      
      // 标签颜色变体
      &.tag-gray {
        background: var(--hr-neutral-color-1);
        color: var(--hr-neutral-color-7);
      }
      
      &.tag-blue {
        background: var(--hr-brand-color-1);
        color: var(--hr-brand-color-6);
      }
      
      &.tag-green {
        background: var(--hr-success-color-1);
        color: var(--hr-success-color-6);
      }
    }

    // 药品名称
    .medication-name {
      font-weight: 600;
      font-size: 36rpx;
      color: var(--hr-neutral-color-10);
      flex: 1; // 占据剩余空间
    }

    // 箭头图标
    .icon-arrow {
      font-size: 48rpx;
      color: var(--hr-neutral-color-5);
      margin-left: 16rpx;
    }
  }

  // 内容区
  .item-content {
    margin-top: 24rpx;

    // 提醒时间标签容器
    .notify-times {
      display: flex;
      flex-wrap: wrap; // 超出换行
      gap: 16rpx;

      // 单个时间标签
      .time-tag {
        padding: 8rpx 20rpx;
        background-color: var(--hr-neutral-color-1);
        border-radius: 8rpx;
        font-size: var(--hr-font-size-xs);
        color: var(--hr-neutral-color-7);
      }
    }

    // 用法用量信息
    .usage-info {
      margin-top: 16rpx;
      font-size: var(--hr-font-size-xxs);
      color: var(--hr-neutral-color-7);
    }
    
    // 备注信息
    .remark-info {
      margin-top: 12rpx;
      font-size: var(--hr-font-size-xxs);
      color: var(--hr-neutral-color-6);
      // 最多显示两行
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}
</style>
