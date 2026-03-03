/**
 * ============================================================================
 * 智能预问诊模块 - 历史记录组合式函数
 * ============================================================================
 * 
 * 本文件封装预问诊历史记录相关的业务逻辑。
 * 
 * 功能包括：
 * 1. 获取评估历史记录
 * 2. 历史记录分页管理
 * 3. 记录详情查看
 * ============================================================================
 */

import { ref, computed } from 'vue';
import { useDiagnosisStore } from '../store/diagnosisStore';
import type { IPreDiagnosisRecord } from '../types';

/**
 * 历史记录组合式函数
 * 
 * 使用场景：
 * ```typescript
 * // 在历史记录页面中使用
 * const {
 *   records,
 *   isLoading,
 *   isEmpty,
 *   fetchHistory,
 *   loadMore,
 *   getRecordDetail,
 *   deleteRecord
 * } = useHistory();
 * ```
 */
export function useHistory() {
  // 依赖 Store
  const store = useDiagnosisStore();

  // ========== 内部状态 ==========
  const currentPage = ref(1);
  const pageSize = ref(10);
  const hasMore = ref(true);
  const loadingMore = ref(false);

  // ========== 计算属性 ==========
  /** 历史记录列表 */
  const records = computed(() => store.historyRecords);

  /** 加载状态 */
  const isLoading = computed(() => store.loading);

  /** 是否为空 */
  const isEmpty = computed(() => records.value.length === 0 && !isLoading.value);

  /** 记录总数 */
  const totalCount = ref(0);

  // ========== 方法 ==========

  /**
   * 获取评估历史记录
   * 
   * 使用场景：
   * - 页面加载时获取历史记录
   * - 下拉刷新时重新获取
   * 
   * 业务流程：
   * 1. 设置加载状态
   * 2. 重置分页
   * 3. 调用Store的方法获取数据
   * 4. 更新总数和是否有更多
   * 
   * @param patientId - 患者ID
   * @param refresh - 是否刷新（重置列表）
   * 
   * @example
   * onMounted(() => {
   *   fetchHistory(patientId);
   * });
   * 
   * // 下拉刷新
   * const onRefresh = async () => {
   *   await fetchHistory(patientId, true);
   * };
   */
  const fetchHistory = async (patientId: string, refresh = true): Promise<void> => {
    if (refresh) {
      currentPage.value = 1;
      hasMore.value = true;
    }

    try {
      await store.fetchHistory(patientId);
      // 假设API返回总数（这里根据实际情况可能需要调整）
      totalCount.value = records.value.length;
      hasMore.value = records.value.length >= pageSize.value;
    } catch (error) {
      console.error('获取历史记录失败:', error);
    }
  };

  /**
   * 加载更多历史记录
   * 
   * 使用场景：
   * - 上拉加载更多时调用
   * 
   * @param patientId - 患者ID
   * 
   * @example
   * const onReachBottom = async () => {
   *   if (hasMore.value && !loadingMore.value) {
   *     await loadMore(patientId);
   *   }
   * };
   */
  const loadMore = async (patientId: string): Promise<void> => {
    if (!hasMore.value || loadingMore.value) {
      return;
    }

    loadingMore.value = true;
    currentPage.value++;

    try {
      await store.fetchHistory(patientId);
      hasMore.value = records.value.length < totalCount.value;
    } catch (error) {
      console.error('加载更多历史记录失败:', error);
      currentPage.value--;
    } finally {
      loadingMore.value = false;
    }
  };

  /**
   * 获取单条记录的详情
   * 
   * 使用场景：
   * - 用户点击历史记录项时
   * - 查看完整的评估结果
   * 
   * @param recordId - 记录ID
   * @returns 记录详情
   * 
   * @example
   * const handleRecordClick = (record) => {
   *   const detail = getRecordDetail(record.id);
   *   // 跳转到详情页或弹窗展示
   * };
   */
  const getRecordDetail = (recordId: string): IPreDiagnosisRecord | undefined => {
    return records.value.find(r => r.id === recordId);
  };

  /**
   * 按日期分组历史记录
   * 
   * 使用场景：
   * - 按日期展示历史记录
   * - 类似"今天"、"昨天"、"更早"的分组
   * 
   * @returns 分组后的记录
   * 
   * @example
   * const groupedRecords = getGroupedRecords();
   * // { '今天': [记录1, 记录2], '昨天': [记录3], '更早': [...] }
   */
  const getGroupedRecords = (): Record<string, IPreDiagnosisRecord[]> => {
    const groups: Record<string, IPreDiagnosisRecord[]> = {
      '今天': [],
      '昨天': [],
      '近7天': [],
      '更早': [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 24 * 60 * 60 * 1000;
    const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

    records.value.forEach(record => {
      const recordTime = new Date(record.createTime).getTime();

      if (recordTime >= today) {
        groups['今天'].push(record);
      } else if (recordTime >= yesterday) {
        groups['昨天'].push(record);
      } else if (recordTime >= weekAgo) {
        groups['近7天'].push(record);
      } else {
        groups['更早'].push(record);
      }
    });

    // 清理空分组
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  };

  /**
   * 格式化记录时间为友好显示
   * 
   * @param dateStr - 时间字符串
   * @returns 格式化后的时间
   * 
   * @example
   * const timeStr = formatRecordTime('2024-01-15 10:30:00');
   * // '1月15日 10:30'
   */
  const formatRecordTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');

    return `${month}月${day}日 ${hour}:${minute}`;
  };

  /**
   * 删除历史记录（如果后端支持）
   * 
   * 注意：当前可能需要后端API支持
   * 
   * @param recordId - 记录ID
   */
  const deleteRecord = async (recordId: string): Promise<boolean> => {
    // TODO: 如果后端提供删除API，在这里实现
    // 暂时使用 store.reset() 清空（仅演示）
    store.reset();
    return true;
  };

  /**
   * 清空历史记录（如果后端支持）
   * 
   * 注意：当前可能需要后端API支持
   */
  const clearAll = async (): Promise<void> => {
    // TODO: 如果后端提供清空API，在这里实现
    // 使用 store.reset() 清空
    store.reset();
  };

  return {
    // 内部状态
    currentPage,
    pageSize,
    hasMore,
    loadingMore,
    totalCount,

    // 计算属性
    records,
    isLoading,
    isEmpty,

    // 方法
    fetchHistory,
    loadMore,
    getRecordDetail,
    getGroupedRecords,
    formatRecordTime,
    deleteRecord,
    clearAll,
  };
}

export default useHistory;
