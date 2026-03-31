/**
 * ============================================================================
 * 智能预问诊模块 - 症状管理组合式函数
 * ============================================================================
 * 
 * 本文件封装症状选择和管理的业务逻辑。
 * 
 * 功能包括：
 * 1. 获取部位相关症状
 * 2. 管理症状选择状态
 * 3. 症状筛选和搜索
 * ============================================================================
 */

import { ref, computed } from 'vue';
import { useDiagnosisStore } from '../store/diagnosisStore';
import { diagnosisApi } from '../api';
import type { ISymptom, ISymptomOption } from '../types';

/**
 * 症状管理组合式函数
 * 
 * 使用场景：
 * ```typescript
 * // 在症状选择页面中使用
 * const {
 *   symptoms,
 *   selectedSymptoms,
 *   isLoading,
 *   fetchSymptoms,
 *   addSymptom,
 *   removeSymptom,
 *   isSymptomSelected,
 *   clearAll
 * } = useSymptoms();
 * ```
 */
export function useSymptoms() {
  // 依赖 Store
  const store = useDiagnosisStore();

  // ========== 内部状态 ==========
  const symptomsCache = ref<Record<string, ISymptom[]>>({}); // 症状缓存
  const loadingSymptoms = ref<Set<string>>(new Set()); // 正在加载的症状ID集合
  const searchKeyword = ref('');

  // ========== 计算属性 ==========
  /** 已选中的症状列表 */
  const selectedSymptoms = computed(() => store.selectedSymptoms);

  /** 已选症状数量 */
  const selectedCount = computed(() => selectedSymptoms.value.length);

  /** 是否已选择任何症状 */
  const hasSelection = computed(() => selectedCount.value > 0);

  // ========== 方法 ==========

  /**
   * 获取指定部位的相关症状
   * 
   * 使用场景：
   * - 用户选择身体部位后，加载该部位对应的症状列表
   * - 症状数据缓存机制，避免重复请求
   * 
   * 业务流程：
   * 1. 检查缓存，如果有则直接返回
   * 2. 检查是否正在加载，避免重复请求
   * 3. 调用API获取症状列表
   * 4. 缓存结果
   * 
   * @param bodyPartId - 身体部位ID
   * @returns 症状列表
   * 
   * @example
   * const handlePartSelect = async (partId) => {
   *   const list = await fetchSymptoms(partId);
   *   // 显示症状列表
   * };
   */
  const fetchSymptoms = async (bodyPartId: string): Promise<ISymptom[]> => {
    // 检查缓存
    if (symptomsCache.value[bodyPartId]) {
      return symptomsCache.value[bodyPartId];
    }

    // 检查是否正在加载
    if (loadingSymptoms.value.has(bodyPartId)) {
      return [];
    }

    loadingSymptoms.value.add(bodyPartId);

    try {
      const res = await diagnosisApi.getSymptomsByBodyPart(bodyPartId);
      const symptoms = res.result || [];

      // 缓存结果
      symptomsCache.value[bodyPartId] = symptoms;

      return symptoms;
    } catch (error) {
      console.error('获取症状列表失败:', error);
      return [];
    } finally {
      loadingSymptoms.value.delete(bodyPartId);
    }
  };

  /**
   * 添加症状到已选列表
   * 
   * 使用场景：
   * - 用户点击症状标签时触发
   * - 将症状添加到已选列表
   * 
   * @param symptom - 要添加的症状
   * 
   * @example
   * <view @click="addSymptom(item)">
   *   {{ item.name }}
   * </view>
   */
  const addSymptom = (symptom: ISymptom): void => {
    store.addSymptom(symptom);
  };

  /**
   * 从已选列表移除症状
   * 
   * @param symptomId - 要移除的症状ID
   */
  const removeSymptom = (symptomId: string): void => {
    store.removeSymptom(symptomId);
  };

  /**
   * 切换症状的选择状态
   * 
   * @param symptom - 要切换的症状
   */
  const toggleSymptom = (symptom: ISymptom): void => {
    store.toggleSymptom(symptom);
  };

  /**
   * 检查症状是否已选中
   * 
   * @param symptomId - 症状ID
   * @returns 是否已选中
   */
  const isSymptomSelected = (symptomId: string): boolean => {
    return selectedSymptoms.value.some(s => s.id === symptomId);
  };

  /**
   * 清除所有已选症状
   * 
   * 使用场景：
   * - 用户点击"清空"按钮
   * - 重新选择部位时
   */
  const clearAll = (): void => {
    store.selectedSymptoms = [];
    searchKeyword.value = '';
  };

  /**
   * 根据关键字筛选症状
   * 
   * 使用场景：
   * - 用户输入搜索关键字时实时筛选
   * 
   * @param keyword - 搜索关键字
   * @param symptomList - 症状列表
   * @returns 筛选后的症状列表
   * 
   * @example
   * const filteredList = filterSymptoms('头痛', allSymptoms);
   */
  const filterSymptoms = (keyword: string, symptomList: ISymptom[]): ISymptom[] => {
    if (!keyword.trim()) {
      return symptomList;
    }

    const lowerKeyword = keyword.toLowerCase();
    return symptomList.filter(s =>
      s.name.toLowerCase().includes(lowerKeyword) ||
      s.category.toLowerCase().includes(lowerKeyword)
    );
  };

  /**
   * 将症状列表转换为带选中状态的选项列表
   * 
   * 使用场景：
   * - 传递给选择器组件
   * 
   * @param symptomList - 症状列表
   * @returns 带选中状态的选项列表
   * 
   * @example
   * const options = toSymptomOptions(symptoms);
   * // [{ id: '1', name: '头痛', category: '头部', selected: true }, ...]
   */
  const toSymptomOptions = (symptomList: ISymptom[]): ISymptomOption[] => {
    return symptomList.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      selected: isSymptomSelected(s.id),
    }));
  };

  /**
   * 获取已选症状的分类统计
   * 
   * 使用场景：
   * - 显示已选症状的分类分布
   * 
   * @returns 分类统计对象
   * 
   * @example
   * const categoryStats = getCategoryStats();
   * // { '头部': 2, '胸部': 1 }
   */
  const getCategoryStats = (): Record<string, number> => {
    const stats: Record<string, number> = {};

    selectedSymptoms.value.forEach(symptom => {
      const category = symptom.category || '其他';
      stats[category] = (stats[category] || 0) + 1;
    });

    return stats;
  };

  return {
    // 内部状态
    searchKeyword,
    symptomsCache,

    // 计算属性
    selectedSymptoms,
    selectedCount,
    hasSelection,

    // 方法
    fetchSymptoms,
    addSymptom,
    removeSymptom,
    toggleSymptom,
    isSymptomSelected,
    clearAll,
    filterSymptoms,
    toSymptomOptions,
    getCategoryStats,
  };
}

export default useSymptoms;
