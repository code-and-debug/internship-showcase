/**
 * ============================================================================
 * 智能预问诊模块 - 身体部位选择组合式函数
 * ============================================================================
 * 
 * 本文件封装身体部位选择相关的业务逻辑。
 * 
 * 功能包括：
 * 1. 获取身体部位列表
 * 2. 管理部位选择状态
 * 3. 部位与症状的关联查询
 * ============================================================================
 */

import { ref, computed } from 'vue';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { diagnosisApi } from '../api';
import type { IBodyPart } from '../types';

/**
 * 身体部位选择组合式函数
 * 
 * 使用场景：
 * ```typescript
 * // 在身体部位选择页面中使用
 * const {
 *   bodyParts,
 *   selectedParts,
 *   isLoading,
 *   fetchBodyParts,
 *   togglePart,
 *   isSelected,
 *   clearSelection
 * } = useBodyParts();
 * ```
 */
export function useBodyParts() {
  // 依赖 Store
  const store = useDiagnosisStore();

  // ========== 计算属性 ==========
  /** 身体部位列表 */
  const bodyParts = computed(() => store.bodyParts);

  /** 已选中的部位列表 */
  const selectedParts = computed(() => store.selectedBodyParts);

  /** 加载状态 */
  const isLoading = computed(() => store.loading);

  /** 已选部位ID列表 */
  const selectedPartIds = computed(() => store.selectedBodyPartIds);

  /** 是否已选择任何部位 */
  const hasSelection = computed(() => selectedParts.value.length > 0);

  // ========== 方法 ==========

  /**
   * 获取身体部位列表
   * 
   * 使用场景：
   * - 页面加载时获取部位列表
   * - 下拉刷新时重新获取
   * 
   * 业务流程：
   * 1. 设置加载状态
   * 2. 调用API获取部位列表
   * 3. 更新Store中的部位数据
   * 
   * @param forceRefresh - 是否强制刷新（忽略缓存）
   * 
   * @example
   * onMounted(() => {
   *   fetchBodyParts();
   * });
   */
  const fetchBodyParts = async (forceRefresh = false): Promise<void> => {
    // 如果有缓存且不强制刷新，则跳过
    if (!forceRefresh && bodyParts.value.length > 0) {
      return;
    }

    try {
      const res = await diagnosisApi.getBodyParts();
      if (res.result) {
        store.bodyParts = res.result;
      }
    } catch (error) {
      console.error('获取身体部位列表失败:', error);
    }
  };

  /**
   * 切换身体部位的选择状态
   * 
   * 使用场景：
   * - 用户点击身体部位时触发
   * - 选中则取消，未选中则选中
   * 
   * @param part - 要切换的身体部位
   * 
   * @example
   * <view @click="togglePart(item)">
   *   {{ item.name }}
   * </view>
   */
  const togglePart = (part: IBodyPart): void => {
    store.toggleBodyPart(part);
  };

  /**
   * 检查部位是否已选中
   * 
   * @param partId - 部位ID
   * @returns 是否已选中
   * 
   * @example
   * const isChecked = isPartSelected('head');
   */
  const isPartSelected = (partId: string): boolean => {
    return selectedPartIds.value.includes(partId);
  };

  /**
   * 获取选中部位的数量
   * 
   * @returns 已选部位数量
   */
  const getSelectedCount = (): number => {
    return selectedParts.value.length;
  };

  /**
   * 清除所有部位选择
   * 
   * 使用场景：
   * - 用户点击"重置"按钮
   * - 进入下一步前清空选择
   */
  const clearSelection = (): void => {
    store.selectedBodyParts = [];
  };

  /**
   * 获取部位分类
   * 
   * 使用场景：
   * - 按分类展示部位
   * - 头部、胸部、腹部、四肢等
   * 
   * @returns 按分类分组的部位列表
   * 
   * @example
   * const groupedParts = getGroupedParts();
   * // { 'head': [部位1, 部位2], 'body': [部位3, 部位4] }
   */
  const getGroupedParts = (): Record<string, IBodyPart[]> => {
    const groups: Record<string, IBodyPart[]> = {};

    bodyParts.value.forEach(part => {
      // 根据部位名称首字母分组
      const firstChar = part.name.charAt(0);
      const category = isNaN(Number(firstChar)) ? firstChar : 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(part);
    });

    return groups;
  };

  /**
   * 根据部位ID获取部位名称
   * 
   * @param partId - 部位ID
   * @returns 部位名称
   */
  const getPartName = (partId: string): string => {
    const part = bodyParts.value.find(p => p.id === partId);
    return part?.name || '';
  };

  return {
    // 状态
    bodyParts,
    selectedParts,
    isLoading,
    selectedPartIds,
    hasSelection,

    // 方法
    fetchBodyParts,
    togglePart,
    isPartSelected,
    getSelectedCount,
    clearSelection,
    getGroupedParts,
    getPartName,
  };
}

export default useBodyParts;
