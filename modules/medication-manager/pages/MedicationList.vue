<template>
  <!--
    ============================================================================
    用药提醒列表页
    ============================================================================
    
    页面功能：
    1. 展示用户的用药提醒列表
    2. 支持进入管理模式（批量删除/关闭提醒）
    3. 支持新增用药提醒
    4. 支持编辑用药提醒
    
    业务流程：
    1. 页面加载时获取患者信息和配置
    2. 调用 API 获取用药提醒列表
    3. 渲染 MedicationListItem 组件列表
    4. 用户可进行各种操作
    
    布局说明：
    - 顶部：患者选择器 g-choose-pat
    - 中部：用药提醒列表（可滚动）
    - 底部：操作按钮区（随模式变化）
    ============================================================================
  -->
  <view class="medication-list-page">
    <!-- 顶部标识组件 -->
    <g-flag type-fg="502" is-show-fg />
    
    <!-- 患者选择器 -->
    <g-choose-pat v-show="!isShowCheck" @choose-pat="handlePatChange" />

    <!-- 全局消息组件 -->
    <g-message />

    <!-- 列表内容区（可滚动） -->
    <scroll-view class="list-container" scroll-y>
      <view 
        class="list-body"
        :class="{ 'check-mode': isShowCheck }"
      >
        <!--
          用药提醒列表项
          遍历 medicalList 渲染每项
        -->
        <view
          v-for="item in medicalList"
          :key="item.id.join(',')"
          class="list-item-wrapper"
          @click="() => handleItemClick(item)"
        >
          <!--
            复选框（仅在管理模式显示）
            使用动态类名控制显示和选中样式
          -->
          <view
            class="check-icon"
            :class="{ 
              'is-visible': isShowCheck,
              'is-checked': getIsCheck(item.id)
            }"
          >
            {{ getIsCheck(item.id) ? '&#xe6d0;' : '&#xe6ce;' }}
          </view>

          <!-- 用药提醒卡片 -->
          <view class="item-content">
            <MedicationListItem
              :item="item"
              :disabled="isShowCheck"
              @item-click="handleItemEdit"
            />
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="isComplete && !medicalList.length" class="empty-state">
          <page-state index="1" />
        </view>
      </view>
    </scroll-view>

    <!--
      底部操作区
      根据 isShowCheck 显示不同按钮组
    -->
    <view class="footer-actions">
      <!-- 管理模式：全选/取消按钮 + 操作按钮 -->
      <template v-if="isShowCheck">
        <view class="check-actions">
          <view class="check-all" @click="handleAllCheck">
            <view 
              class="check-icon"
              :class="{ 'is-checked': isAllChecked }"
            >
              {{ isAllChecked ? '&#xe6d0;' : '&#xe6ce;' }}
            </view>
            <text>全选</text>
          </view>
          <text class="cancel-btn" @click="handleCancelCheck">取消</text>
        </view>

        <view class="action-buttons">
          <button class="btn btn-plain" @click="handleDelete">删除提醒</button>
          <button class="btn btn-plain" @click="handleClose">关闭提醒</button>
        </view>
      </template>

      <!-- 普通模式：管理按钮 + 新增按钮 -->
      <template v-else>
        <view class="action-buttons">
          <button class="btn btn-plain" @click="handleManage">管理提醒</button>
          <button class="btn btn-primary" @click="handleAdd">新增提醒</button>
        </view>
      </template>
    </view>

    <!-- 确认弹窗 -->
    <xy-dialog
      title=""
      :content="dialogContent"
      :show="isShowDialog"
      @cancel-button="isShowDialog = false"
      @confirm-button="handleDialogConfirm"
    />

    <!-- 新增方式选择弹窗 -->
    <wyb-action-sheet
      ref="actionSheetRef"
      :options="medicationStore.getSelAddMedicalWay"
      title="可选择获取院内处方药品快速设置用药提醒，或自定义药品用药提醒"
      @item-click="handleActionSheetSelect"
    />
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 用药提醒列表页 - 脚本部分
 * ============================================================================
 * 
 * 页面职责：
 * 1. 展示用药提醒列表
 * 2. 提供新增、编辑、删除、关闭功能入口
 * 3. 管理列表状态和交互
 * 
 * 数据流：
 * 1. onShow 生命周期获取患者信息和配置
 * 2. 调用 useMedicationList hook 管理列表状态
 * 3. 点击编辑时将数据存入 store，跳转表单页
 * 4. 操作成功后刷新列表
 * ============================================================================
 */

import { ref, onShow } from 'vue';
import { useMedicationStore } from '../store/medicationStore';
import { useMedicationList } from '../composables/useMedicationList';
import MedicationListItem from '../components/MedicationListItem.vue';
import type { IMedication } from '../types';

// ============================================
// 依赖导入说明
// ============================================
// 以下组件和工具应从实际路径导入，这里使用注释说明
// import { GStores } from '@/utils';
// import api from '@/api/api';

// ============================================
// Store 和 Hooks
// ============================================

/**
 * Pinia Store 实例
 * 用于管理跨页面数据（checkItem, addItem, config 等）
 */
const medicationStore = useMedicationStore();

/**
 * 列表逻辑 Hook
 * 封装列表相关的状态和操作
 */
const {
  medicalList,
  isComplete,
  isShowCheck,
  checkMedicalList,
  isAllChecked,
  getList,
  manageList,
  checkItem,
  allCheck,
  cancelShowCheck,
  warningDelete,
  warningClose,
  getIsCheck,
} = useMedicationList();

// ============================================
// 页面级状态
// ============================================

/**
 * ActionSheet 组件引用
 * 用于显示新增方式选择弹窗
 */
const actionSheetRef = ref<any>(null);

/**
 * 确认弹窗显示状态
 */
const isShowDialog = ref(false);

/**
 * 确认弹窗内容
 */
const dialogContent = ref('');

/**
 * 确认弹窗回调函数
 */
const dialogConfirmCallback = ref<(() => void) | null>(null);

// ============================================
// 生命周期
// ============================================

/**
 * 页面显示生命周期
 * 
 * 逻辑：
 * 1. 清空导入数据（addItem）
 * 2. 如果是首次加载，获取配置和患者列表
 * 3. 刷新用药提醒列表
 */
onShow(async () => {
  // 清空导入数据，避免从编辑页返回时误填充
  medicationStore.changeAddItem(null);

  // 首次加载时获取配置和患者列表
  if (medicalList.value.length === 0) {
    await medicationStore.getConfig();
    // await gStores.userStore.getPatList(); // 实际项目中启用
  }

  // 刷新列表
  await getList();
});

// ============================================
// 事件处理
// ============================================

/**
 * 处理患者切换
 * 
 * 使用场景：
 * 用户在患者选择器中切换患者时触发
 * 需要重新获取该患者的用药提醒列表
 */
const handlePatChange = async (): Promise<void> => {
  await getList();
};

/**
 * 处理列表项点击
 * 
 * 逻辑：
 * - 管理模式：切换该项的选中状态
 * - 普通模式：不处理（子组件处理编辑跳转）
 * 
 * @param item - 点击的用药提醒项
 */
const handleItemClick = (item: IMedication): void => {
  if (isShowCheck.value) {
    checkItem(item);
  }
};

/**
 * 处理列表项编辑
 * 
 * 逻辑：
 * 1. 将选中的用药提醒存入 store.checkItem
 * 2. 跳转到编辑页
 * 
 * @param item - 要编辑的用药提醒
 */
const handleItemEdit = (item: IMedication): void => {
  medicationStore.updateCheckItem(item);
  uni.navigateTo({
    url: '/pagesC/medicationManagerOptimized/pages/MedicationForm',
  });
};

/**
 * 处理管理按钮点击
 * 
 * 逻辑：
 * 调用 hook 的 manageList 进入管理模式
 * 如果列表为空会提示用户
 */
const handleManage = (): void => {
  manageList();
};

/**
 * 处理全选/取消全选
 * 
 * 逻辑：
 * 根据当前全选状态决定全选或取消全选
 */
const handleAllCheck = (): void => {
  allCheck();
};

/**
 * 处理取消管理模式
 * 
 * 逻辑：
 * 退出管理模式，清空选中列表
 */
const handleCancelCheck = (): void => {
  cancelShowCheck();
};

/**
 * 处理删除提醒
 * 
 * 逻辑：
 * 1. 检查是否有选中项
 * 2. 显示确认弹窗
 * 3. 用户确认后调用 API 删除
 * 4. 成功后刷新列表并退出管理模式
 */
const handleDelete = (): void => {
  if (checkMedicalList.value.length === 0) {
    // 使用全局消息提示
    // gStores.messageStore.showMessage('请先选择要删除的提醒', 1500);
    console.log('请先选择要删除的提醒');
    return;
  }

  dialogContent.value = '删除后将不再发送删除药品的用药提醒，请确认是否删除。';
  dialogConfirmCallback.value = async () => {
    await warningDelete();
    isShowDialog.value = false;
  };
  isShowDialog.value = true;
};

/**
 * 处理关闭提醒
 * 
 * 逻辑：
 * 1. 检查是否有选中项
 * 2. 直接调用 API 关闭（不需要确认弹窗）
 * 3. 成功后刷新列表并退出管理模式
 */
const handleClose = async (): Promise<void> => {
  if (checkMedicalList.value.length === 0) {
    // gStores.messageStore.showMessage('请先选择要关闭的提醒', 1500);
    console.log('请先选择要关闭的提醒');
    return;
  }

  await warningClose();
};

/**
 * 处理确认弹窗确认
 * 
 * 逻辑：
 * 执行 dialogConfirmCallback 中存储的回调函数
 */
const handleDialogConfirm = (): void => {
  dialogConfirmCallback.value?.();
};

/**
 * 处理新增按钮点击
 * 
 * 逻辑：
 * - 如果只有一个入口开启，直接进入对应页面
 * - 如果多个入口开启，显示 ActionSheet 让用户选择
 */
const handleAdd = (): void => {
  const ways = medicationStore.getSelAddMedicalWay;
  
  if (ways.length > 1) {
    // 多个入口，显示选择弹窗
    actionSheetRef.value?.showActionSheet?.();
  } else if (ways.length === 1) {
    // 只有一个入口，直接进入
    handleAddRoute(ways[0].key);
  } else {
    // 没有可用入口
    // gStores.messageStore.showMessage('暂无可用的添加方式', 1500);
    console.log('暂无可用的添加方式');
  }
};

/**
 * 处理 ActionSheet 选择
 * 
 * @param selected - 选中的选项
 */
const handleActionSheetSelect = (selected: any): void => {
  handleAddRoute(selected.item.key);
};

/**
 * 处理新增路由跳转
 * 
 * @param key - 路由标识：custom=自定义，prescription=历史处方
 */
const handleAddRoute = (key: string): void => {
  switch (key) {
    case 'custom':
      // 自定义添加，跳转到表单页
      uni.navigateTo({
        url: '/pagesC/medicationManagerOptimized/pages/MedicationForm',
      });
      break;
      
    case 'prescription':
      // 从历史处方导入，跳转到历史处方页
      uni.navigateTo({
        url: '/pagesC/medicationManagerOptimized/pages/MedicationHistory',
      });
      break;
      
    default:
      break;
  }
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
 * - 列表区 flex: 1 占据剩余空间
 * - 底部操作区固定高度
 * 
 * 管理模式样式：
 * - 列表项左移显示复选框
 * - 复选框使用过渡动画
 * ============================================================================
 */

.medication-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--hr-neutral-color-1);

  // 列表容器
  .list-container {
    flex: 1;
    overflow-y: auto;

    .list-body {
      padding: 24rpx 32rpx;
      padding-left: 0; // 左侧留给复选框
      transition: all 0.2s linear;

      // 管理模式样式
      &.check-mode {
        padding-left: 32rpx;
      }

      // 列表项包装器
      .list-item-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;

        // 复选框
        .check-icon {
          width: 0;
          font-size: 48rpx;
          margin: 0 32rpx;
          margin-left: 0;
          transform: translateX(calc(-100% - 32rpx));
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.23s linear;
          color: var(--hr-neutral-color-5);

          // 显示状态
          &.is-visible {
            width: auto;
            margin: 0 32rpx 0 0;
            transform: translateX(0);
          }

          // 选中状态
          &.is-checked {
            color: var(--hr-brand-color-6);
          }
        }

        // 卡片内容
        .item-content {
          flex: 1;
        }
      }

      // 空状态
      .empty-state {
        padding-top: 200rpx;
        display: flex;
        justify-content: center;
      }
    }
  }

  // 底部操作区
  .footer-actions {
    padding: 24rpx 32rpx 48rpx;
    background-color: var(--h-color-white);
    border-top: 1rpx solid var(--hr-neutral-color-2);

    // 管理模式操作栏
    .check-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;

      // 全选区
      .check-all {
        display: flex;
        align-items: center;
        color: var(--hr-neutral-color-7);
        font-size: var(--hr-font-size-xs);

        .check-icon {
          font-size: 48rpx;
          margin-right: 16rpx;
          color: var(--hr-neutral-color-5);

          &.is-checked {
            color: var(--hr-brand-color-6);
          }
        }
      }

      // 取消按钮
      .cancel-btn {
        font-weight: 600;
        color: var(--hr-neutral-color-10);
      }
    }

    // 操作按钮组
    .action-buttons {
      display: flex;
      gap: 18rpx;

      .btn {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 40rpx;
        font-size: 28rpx;
        text-align: center;
        border: none;

        // 普通按钮
        &.btn-plain {
          background-color: var(--hr-neutral-color-1);
          color: var(--hr-neutral-color-10);
          border: 2rpx solid var(--hr-neutral-color-4);
        }

        // 主按钮
        &.btn-primary {
          background: linear-gradient(135deg, var(--hr-brand-color-6) 0%, var(--hr-brand-color-5) 100%);
          color: var(--h-color-white);
        }

        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
