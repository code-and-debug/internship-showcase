/**
 * ============================================================================
 * 用药管理模块 - 列表页组合式函数
 * ============================================================================
 * 
 * 本文件封装用药提醒列表页的业务逻辑，实现关注点分离。
 * 
 * 使用场景：
 * - MedicationList.vue 页面使用此 hook 获取列表相关的状态和方法
 * - 将 UI 渲染逻辑与业务逻辑分离，便于测试和维护
 * 
 * 功能包括：
 * 1. 获取用药提醒列表
 * 2. 管理模式状态管理
 * 3. 批量选择操作
 * 4. 删除/关闭提醒
 * ============================================================================
 */

import { ref, computed } from 'vue';
import type { IMedication } from '../types';

/**
 * 模拟 API 和全局状态（实际项目中应从相应文件导入）
 */
interface ApiType {
  getRemindMedication: (params: { patientId: string }) => Promise<{ result: IMedication[] }>;
  deleteRemindMedication: (params: { id: string[]; patientId: string }) => Promise<void>;
  closeRemindMedication: (params: { id: string[]; patientId: string }) => Promise<void>;
}

interface UserStoreType {
  patChoose: { patientId: string };
}

interface MessageStoreType {
  showMessage: (message: string, duration?: number, options?: any) => void;
}

interface GStoresType {
  userStore: UserStoreType;
  messageStore: MessageStoreType;
}

// 模拟导入（实际使用时应从 @/api/api 和 @/utils 导入）
const api: ApiType = {
  getRemindMedication: async () => ({ result: [] }),
  deleteRemindMedication: async () => {},
  closeRemindMedication: async () => {},
};

const gStores: GStoresType = {
  userStore: { patChoose: { patientId: '' } },
  messageStore: { showMessage: () => {} },
};

/**
 * 用药提醒列表 Hook
 * 
 * 使用场景：
 * ```typescript
 * // 在 MedicationList.vue 中使用
 * const {
 *   medicalList,
 *   isComplete,
 *   isShowCheck,
 *   checkMedicalList,
 *   isAllChecked,
 *   getList,
 *   manageList,
 *   checkItem,
 *   allCheck,
 *   cancelShowCheck,
 *   warningDelete,
 *   warningClose,
 *   getIsCheck,
 * } = useMedicationList();
 * ```
 * 
 * @returns 列表相关的状态和方法
 */
export function useMedicationList() {
  // ========== 状态定义 ==========
  
  /**
   * 用药提醒列表数据
   * 
   * 使用场景：
   * 模板中使用 v-for 渲染列表
   * 
   * @example
   * <view v-for="item in medicalList" :key="item.id.join(',')">
   *   <MedicationListItem :item="item" />
   * </view>
   */
  const medicalList = ref<IMedication[]>([]);
  
  /**
   * 是否加载完成
   * 
   * 使用场景：
   * - 控制空状态显示（加载完成且列表为空时显示）
   * - 控制加载动画
   */
  const isComplete = ref(false);
  
  /**
   * 是否显示管理模式（复选框）
   * 
   * 使用场景：
   * - 点击"管理提醒"按钮后设置为 true
   * - 显示左侧复选框和底部操作按钮
   * - 点击"取消"后设置为 false
   */
  const isShowCheck = ref(false);
  
  /**
   * 已选中的用药提醒列表
   * 
   * 使用场景：
   * - 管理模式中记录用户选中的项
   * - 批量删除/关闭操作时使用
   */
  const checkMedicalList = ref<IMedication[]>([]);

  // ========== 计算属性 ==========
  
  /**
   * 是否全选
   * 
   * 计算逻辑：
   * 已选中数量 === 列表总数量
   * 
   * 使用场景：
   * 控制"全选"按钮的选中状态
   */
  const isAllChecked = computed(() => {
    if (medicalList.value.length === 0) return false;
    return checkMedicalList.value.length === medicalList.value.length;
  });
  
  /**
   * 获取所有选中项的 ID 数组
   * 
   * 计算逻辑：
   * 将 checkMedicalList 中每项的 id 数组合并为一个数组
   * 
   * 使用场景：
   * 批量删除/关闭 API 调用时传递 id 参数
   * 
   * @example
   * await api.deleteRemindMedication({
   *   id: getCheckedId.value,
   *   patientId: gStores.userStore.patChoose.patientId,
   * });
   */
  const getCheckedId = computed(() => {
    return checkMedicalList.value.reduce<string[]>((prev, curr) => {
      // 注意：后端设计 id 是数组格式
      prev.push(...curr.id);
      return prev;
    }, []);
  });

  // ========== 方法 ==========
  
  /**
   * 获取用药提醒列表
   * 
   * 使用场景：
   * - 页面加载时调用
   * - 删除/关闭操作成功后调用刷新列表
   * - 切换患者时调用
   * 
   * 流程：
   * 1. 设置 isComplete = false（显示加载状态）
   * 2. 调用 API 获取数据
   * 3. 更新 medicalList
   * 4. 设置 isComplete = true
   */
  const getList = async (): Promise<void> => {
    isComplete.value = false;
    
    try {
      const { result } = await api.getRemindMedication({
        patientId: gStores.userStore.patChoose.patientId,
      });
      
      medicalList.value = result || [];
    } catch (error) {
      console.error('获取用药提醒列表失败:', error);
      medicalList.value = [];
    } finally {
      isComplete.value = true;
    }
  };

  /**
   * 进入管理模式
   * 
   * 使用场景：
   * 用户点击"管理提醒"按钮时调用
   * 
   * 逻辑：
   * - 如果列表为空，提示用户
   * - 否则进入管理模式
   */
  const manageList = (): void => {
    if (medicalList.value.length === 0) {
      gStores.messageStore.showMessage('没有需要管理的数据', 1500);
      return;
    }
    
    isShowCheck.value = true;
  };

  /**
   * 切换某项的选中状态
   * 
   * 使用场景：
   * 管理模式下点击列表项的复选框时调用
   * 
   * 逻辑：
   * - 如果不在管理模式，不处理
   * - 如果已选中，则取消选中
   * - 如果未选中，则添加选中
   * 
   * @param item - 用药提醒项
   */
  const checkItem = (item: IMedication): void => {
    // 只有在管理模式下才处理选中逻辑
    if (!isShowCheck.value) return;

    const { id } = item;
    const idx = checkMedicalList.value.findIndex((o) => o.id === id);

    if (idx === -1) {
      // 未选中，添加到选中列表
      checkMedicalList.value.push(item);
    } else {
      // 已选中，从选中列表移除
      checkMedicalList.value.splice(idx, 1);
    }
  };

  /**
   * 全选/取消全选
   * 
   * 使用场景：
   * 用户点击"全选"按钮时调用
   * 
   * 逻辑：
   * - 如果已全选，清空选中列表
   * - 如果未全选，选中所有项
   */
  const allCheck = (): void => {
    if (isAllChecked.value) {
      // 已全选，取消全选
      checkMedicalList.value = [];
    } else {
      // 未全选，全选所有
      checkMedicalList.value = [...medicalList.value];
    }
  };

  /**
   * 退出管理模式
   * 
   * 使用场景：
   * 用户点击"取消"按钮时调用
   * 
   * 逻辑：
   * - 隐藏复选框
   * - 清空选中列表
   */
  const cancelShowCheck = (): void => {
    isShowCheck.value = false;
    checkMedicalList.value = [];
  };

  /**
   * 检查某项是否已选中
   * 
   * 使用场景：
   * 列表项渲染时确定复选框的选中状态
   * 
   * @param id - 用药提醒 ID 数组
   * @returns 是否已选中
   */
  const getIsCheck = (id: string[]): boolean => {
    if (checkMedicalList.value.length === 0) {
      return false;
    }
    return checkMedicalList.value.findIndex((o) => o.id === id) !== -1;
  };

  /**
   * 删除选中的提醒
   * 
   * 使用场景：
   * 管理模式下用户点击"删除提醒"按钮时调用
   * 
   * 流程：
   * 1. 检查是否有选中项
   * 2. 显示确认弹窗（由页面组件处理）
   * 3. 用户确认后调用 API 删除
   * 4. 提示成功，刷新列表，退出管理模式
   * 
   * 注意：此方法返回 Promise，需要配合弹窗组件使用
   */
  const warningDelete = async (): Promise<void> => {
    // 前置检查：是否有选中项
    if (checkMedicalList.value.length === 0) {
      gStores.messageStore.showMessage('请先选择要删除的提醒', 1500);
      return;
    }

    try {
      await api.deleteRemindMedication({
        id: getCheckedId.value,
        patientId: gStores.userStore.patChoose.patientId,
      });

      gStores.messageStore.showMessage('删除成功', 1500, {
        closeCallBack: () => {
          // 清空选中并退出管理模式
          checkMedicalList.value = [];
          isShowCheck.value = false;
          // 刷新列表
          getList();
        },
      });
    } catch (error) {
      console.error('删除用药提醒失败:', error);
      gStores.messageStore.showMessage('删除失败，请重试', 1500);
    }
  };

  /**
   * 关闭选中的提醒
   * 
   * 使用场景：
   * 管理模式下用户点击"关闭提醒"按钮时调用
   * 
   * 流程：
   * 1. 检查是否有选中项
   * 2. 直接调用 API 关闭（不需要确认弹窗）
   * 3. 提示成功，刷新列表，退出管理模式
   */
  const warningClose = async (): Promise<void> => {
    // 前置检查：是否有选中项
    if (checkMedicalList.value.length === 0) {
      gStores.messageStore.showMessage('请先选择要关闭的提醒', 1500);
      return;
    }

    try {
      await api.closeRemindMedication({
        id: getCheckedId.value,
        patientId: gStores.userStore.patChoose.patientId,
      });

      gStores.messageStore.showMessage('关闭成功', 1500, {
        closeCallBack: () => {
          // 清空选中并退出管理模式
          checkMedicalList.value = [];
          isShowCheck.value = false;
          // 刷新列表
          getList();
        },
      });
    } catch (error) {
      console.error('关闭用药提醒失败:', error);
      gStores.messageStore.showMessage('关闭失败，请重试', 1500);
    }
  };

  // ========== 返回 ==========
  
  return {
    // 状态
    medicalList,
    isComplete,
    isShowCheck,
    checkMedicalList,
    
    // 计算属性
    isAllChecked,
    getCheckedId,
    
    // 方法
    getList,
    manageList,
    checkItem,
    allCheck,
    cancelShowCheck,
    warningDelete,
    warningClose,
    getIsCheck,
  };
}

export default useMedicationList;
