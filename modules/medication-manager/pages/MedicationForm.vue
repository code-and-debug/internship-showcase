<template>
  <!--
    ============================================================================
    用药提醒表单页
    ============================================================================
    
    页面功能：
    1. 新增用药提醒
    2. 编辑用药提醒
    3. 从历史处方导入数据预填充
    
    业务流程：
    1. 新增模式：显示空白表单，用户填写后保存
    2. 编辑模式：从 store.checkItem 读取数据填充表单
    3. 导入模式：从 store.addItem 读取数据预填充部分字段
    
    表单分组：
    - 用什么药：药品名称、途径、用法、单次用量、单位
    - 用药时间：频次、日期范围、提醒时间
    - 备注：备注信息
    
    布局说明：
    - 顶部：g-flag 标识
    - 中部：表单内容（可滚动）
    - 底部：保存按钮 + 删除按钮（编辑模式）
    ============================================================================
  -->
  <view class="medication-form-page">
    <!-- 顶部标识 -->
    <g-flag type-fg="501" is-show-fg />

    <!-- 表单内容区（可滚动） -->
    <scroll-view class="form-container" scroll-y>
      <!--
        分组1：用什么药
        包含药品名称、使用途径、用法、单次用量、单位
      -->
      <MedicationFormBox title="用什么药">
        <!-- 标题右侧：导入历史处方按钮（仅在新增且开启该功能时显示） -->
        <template #header-suffix>
          <view
            v-if="showHistoryImportBtn"
            class="history-import-btn"
            @click="goToHistory"
          >
            导入历史处方
          </view>
        </template>

        <!-- 药品名称 -->
        <MedicationFormItem label="药品名称">
          <uni-easyinput
            v-model="form.recipeName"
            v-bind="inputAttribute"
            placeholder="请输入药品名称"
          />
        </MedicationFormItem>

        <!-- 使用途径 -->
        <MedicationFormItem label="途径">
          <MedicationSelect
            v-model:value="form.useDrugWay"
            :option="medicationStore.optionsDrugWay"
            title="选择药品使用途径"
            placeholder="请选择"
          />
        </MedicationFormItem>

        <!-- 用法 -->
        <MedicationFormItem label="用法">
          <MedicationSelect
            v-model:value="form.useDrugUses"
            :option="medicationStore.optionsDrugUse"
            title="选择药品用法"
            placeholder="请选择"
          />
        </MedicationFormItem>

        <!-- 单次用量 -->
        <MedicationFormItem label="单次用量">
          <uni-number-box
            v-model="form.useDrugAmount"
            :min="1"
            :max="9999"
          />
        </MedicationFormItem>

        <!-- 单位 -->
        <MedicationFormItem label="单位">
          <MedicationSelect
            v-model:value="form.useDrugUnit"
            :option="medicationStore.optionsDrugUnit"
            title="选择药品单位"
            placeholder="请选择"
          />
        </MedicationFormItem>
      </MedicationFormBox>

      <!--
        分组2：用药时间
        包含用药频次、提醒日期、提醒时间
      -->
      <MedicationFormBox title="用药时间">
        <!-- 用药频次 -->
        <MedicationFormItem label="用药频次">
          <MedicationSelect
            v-model:value="form.useDrugFrequency"
            :option="medicationStore.optionsFrequency"
            title="选择药品使用频次"
            placeholder="请选择"
          />
        </MedicationFormItem>

        <!-- 提醒日期 -->
        <MedicationFormItem label="提醒日期">
          <view @click="showDatePicker">
            <MedicationSelect
              v-model:value="dateRangeLabel"
              :option="[]"
              disabled
              placeholder="请选择提醒日期"
            />
          </view>
        </MedicationFormItem>

        <!-- 提醒时间 -->
        <MedicationFormItem label="提醒时间" :inline="false">
          <MedicationTagContainer
            :column="4"
            :option="form.notifyTime"
            show-del-icon
            is-all-active
            @item-delete="handleDeleteTime"
          >
            <!-- 添加按钮 -->
            <view class="add-time-btn" @click="showTimePicker">
              <text class="iconfont">&#xe6c3;</text>
              <text>添加</text>
            </view>
          </MedicationTagContainer>
        </MedicationFormItem>
      </MedicationFormBox>

      <!--
        分组3：备注
      -->
      <MedicationFormBox>
        <MedicationFormItem label="备注">
          <uni-easyinput
            v-model="form.remark"
            v-bind="inputAttribute"
            placeholder="请输入备注（选填）"
          />
        </MedicationFormItem>
      </MedicationFormBox>
    </scroll-view>

    <!-- 底部操作区 -->
    <view class="footer-actions">
      <button class="btn btn-primary" @click="handleSubmit">保存</button>
      <button
        v-if="isEditing"
        class="btn btn-plain btn-delete"
        @click="handleDelete"
      >
        删除
      </button>
    </view>

    <!-- 时间选择器 -->
    <TimePicker
      ref="timePickerRef"
      type="time"
      :border="false"
      hide-second
      hide-clear-btn
      @change="handleTimeChange"
    >
      <view />
    </TimePicker>

    <!-- 日期范围选择器 -->
    <uni-datetime-picker
      ref="datePickerRef"
      v-model="form.dateRange"
      type="daterange"
      :start="new Date()"
    >
      <view />
    </uni-datetime-picker>

    <!-- 确认删除弹窗 -->
    <xy-dialog
      title=""
      content="确认删除该用药提醒？删除后将不再发送提醒。"
      :show="isShowDeleteDialog"
      @cancel-button="isShowDeleteDialog = false"
      @confirm-button="confirmDelete"
    />

    <!-- 全局消息 -->
    <g-message />
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 用药提醒表单页 - 脚本部分
 * ============================================================================
 * 
 * 页面职责：
 * 1. 收集用户输入的用药提醒信息
 * 2. 验证表单数据完整性
 * 3. 提交数据到后端保存
 * 4. 支持编辑模式和导入模式的数据预填充
 * 
 * 数据流：
 * 1. onMounted 初始化表单选项
 * 2. onShow 检测 store.checkItem（编辑）或 store.addItem（导入）
 * 3. 如果有数据，填充表单
 * 4. 用户修改后点击保存
 * 5. 验证通过提交到后端
 * 6. 成功后返回列表页
 * ============================================================================
 */

import { ref, onMounted, onShow } from 'vue';
import { useMedicationStore } from '../store/medicationStore';
import { useMedicationForm } from '../composables/useMedicationForm';
import MedicationFormBox from '../components/MedicationFormBox.vue';
import MedicationFormItem from '../components/MedicationFormItem.vue';
import MedicationSelect from '../components/MedicationSelect.vue';
import MedicationTagContainer from '../components/MedicationTagContainer.vue';

// 模拟组件导入（实际应从正确路径导入）
const uniEasyinput = { name: 'uni-easyinput' };
const uniNumberBox = { name: 'uni-number-box' };
const TimePicker = { name: 'TimePicker' };
const uniDatetimePicker = { name: 'uni-datetime-picker' };
const xyDialog = { name: 'xy-dialog' };
const gFlag = { name: 'g-flag' };
const gMessage = { name: 'g-message' };

// ============================================
// Store 和 Hooks
// ============================================

/**
 * Pinia Store 实例
 */
const medicationStore = useMedicationStore();

/**
 * 表单逻辑 Hook
 */
const {
  form,
  pageType,
  pageTitle,
  isEditing,
  dateRangeLabel,
  inputAttribute,
  initForm,
  assignFromMedication,
  assignFromDrugDetail,
  addNotifyTime,
  deleteNotifyTime,
  submit,
  deleteMedication,
} = useMedicationForm();

// ============================================
// Refs
// ============================================

/**
 * 时间选择器引用
 */
const timePickerRef = ref<any>(null);

/**
 * 日期选择器引用
 */
const datePickerRef = ref<any>(null);

/**
 * 是否显示删除确认弹窗
 */
const isShowDeleteDialog = ref(false);

// ============================================
// 计算属性
// ============================================

/**
 * 是否显示导入历史处方按钮
 * 
 * 逻辑：
 * - 新增模式（不是编辑）
 * - 系统配置开启了历史处方功能
 */
const showHistoryImportBtn = computed(() => {
  return !isEditing.value && medicationStore.config.isOpenHistory === '1';
});

// ============================================
// 生命周期
// ============================================

/**
 * 挂载生命周期
 * 
 * 逻辑：
 * 1. 初始化表单选项（用药途径、用法等单位）
 * 2. 初始化表单为空白状态
 */
onMounted(async () => {
  await medicationStore.init();
  initForm();
});

/**
 * 显示生命周期
 * 
 * 逻辑：
 * 延迟执行，确保 store 数据已更新
 * 检测是否有编辑数据或导入数据，填充表单
 */
onShow(() => {
  setTimeout(() => {
    // 检测编辑模式
    if (medicationStore.checkItem) {
      // 设置页面为编辑模式
      pageType.value = 'edit';
      uni.setNavigationBarTitle({ title: '编辑提醒' });
      
      // 填充表单数据
      assignFromMedication(medicationStore.checkItem);
      
      // 清空 store 数据，避免重复填充
      medicationStore.updateCheckItem(null);
    }
    // 检测导入模式（从历史处方导入）
    else if (medicationStore.addItem) {
      // 从新初始化表单
      initForm();
      
      // 预填充导入的数据
      assignFromDrugDetail(medicationStore.addItem);
      
      // 清空 store 数据
      medicationStore.changeAddItem(null);
    }
  }, 80);
});

// ============================================
// 事件处理
// ============================================

/**
 * 处理跳转到历史处方页
 * 
 * 使用场景：
 * 用户点击"导入历史处方"按钮
 */
const goToHistory = (): void => {
  uni.navigateTo({
    url: '/pagesC/medicationManagerOptimized/pages/MedicationHistory',
  });
};

/**
 * 显示时间选择器
 * 
 * 使用场景：
 * 用户点击"添加"提醒时间按钮
 */
const showTimePicker = (): void => {
  timePickerRef.value?.initTimePicker?.();
};

/**
 * 处理时间选择变化
 * 
 * @param time - 选择的时间，如 "08:00"
 */
const handleTimeChange = (time: string): void => {
  addNotifyTime(time);
};

/**
 * 处理删除提醒时间
 * 
 * @param item - 要删除的时间选项
 */
const handleDeleteTime = (item: any): void => {
  deleteNotifyTime(item);
};

/**
 * 显示日期选择器
 * 
 * 使用场景：
 * 用户点击日期范围选择区域
 */
const showDatePicker = (): void => {
  datePickerRef.value?.show?.();
};

/**
 * 处理表单提交
 * 
 * 逻辑：
 * 1. 验证表单数据
 * 2. 调用 API 保存
 * 3. 成功后返回列表页
 */
const handleSubmit = async (): Promise<void> => {
  await submit();
};

/**
 * 处理删除按钮点击
 * 
 * 逻辑：
 * 显示确认删除弹窗
 */
const handleDelete = (): void => {
  isShowDeleteDialog.value = true;
};

/**
 * 确认删除
 * 
 * 逻辑：
 * 1. 调用删除 API
 * 2. 成功后返回列表页
 */
const confirmDelete = async (): Promise<void> => {
  if (!form.value.id) return;
  
  await deleteMedication(form.value.id);
  isShowDeleteDialog.value = false;
};
</script>

<style lang="scss" scoped>
/**
 * ============================================================================
 * 样式说明
 * ============================================================================
 * 
 * 布局结构：
 * - 页面高度 100vh，纵向 flex 布局
 * - 表单区 flex: 1 可滚动
 * - 底部操作区固定
 * 
 * 样式细节：
 * - 表单容器内边距 16rpx 32rpx
 * - 历史导入按钮使用主题色背景
 * - 添加时间按钮使用边框样式
 * ============================================================================
 */

.medication-form-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--hr-neutral-color-1);

  // 表单内容区
  .form-container {
    flex: 1;
    padding: 16rpx 32rpx;
    overflow-y: auto;

    // 历史导入按钮
    .history-import-btn {
      padding: 8rpx 24rpx;
      background-color: var(--hr-brand-color-3-light, rgba(24, 144, 255, 0.1));
      border-radius: 28rpx;
      font-size: 26rpx;
      color: var(--hr-brand-color-6);
      font-weight: 600;

      &:active {
        opacity: 0.8;
      }
    }

    // 添加时间按钮
    .add-time-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: var(--hr-neutral-color-10);
      font-weight: 600;
      font-size: 24rpx;

      .iconfont {
        font-size: 32rpx;
        margin-bottom: 4rpx;
      }

      &:active {
        opacity: 0.8;
      }
    }
  }

  // 底部操作区
  .footer-actions {
    padding: 24rpx 32rpx 48rpx;
    background-color: var(--h-color-white);
    border-top: 1rpx solid var(--hr-neutral-color-2);

    .btn {
      width: 100%;
      height: 88rpx;
      line-height: 88rpx;
      border-radius: 44rpx;
      font-size: 32rpx;
      text-align: center;
      border: none;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      // 主按钮
      &.btn-primary {
        background: linear-gradient(135deg, var(--hr-brand-color-6) 0%, var(--hr-brand-color-5) 100%);
        color: var(--h-color-white);
      }

      // 普通按钮
      &.btn-plain {
        background-color: var(--hr-neutral-color-1);
        color: var(--hr-neutral-color-10);
        border: 2rpx solid var(--hr-neutral-color-4);

        // 删除按钮
        &.btn-delete {
          color: var(--hr-error-color-6);
          border-color: var(--hr-error-color-6);
        }
      }

      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style>
