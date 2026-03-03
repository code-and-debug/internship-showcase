/**
 * ============================================================================
 * 用药管理模块 - 历史处方页组合式函数
 * ============================================================================
 * 
 * 本文件封装历史处方页的业务逻辑，包括数据获取、处方详情加载等。
 * 
 * 使用场景：
 * - MedicationHistory.vue 页面使用此 hook 管理历史处方相关的状态和操作
 * 
 * 功能包括：
 * 1. 获取历史处方列表（按日期分组）
 * 2. 懒加载处方详情
 * 3. 选择药品跳转到表单页
 * ============================================================================
 */

import { ref } from 'vue';
import type { 
  TMedicalDrugHisList, 
  TMedicalDrugHisListItem,
  TDrugDetailItem,
} from '../types';
import dayjs from 'dayjs';

/**
 * 模拟依赖导入（实际项目中应从相应文件导入）
 */
interface ApiType {
  getRemindMedicationDrugInfo: (params: {
    patientId: string;
    visitType: string;
    startTime: string;
    endTime: string;
  }) => Promise<{ result: { list: TMedicalDrugHisList } }>;
  
  getUserDrugQueryDetail: (params: {
    patientId: string;
    prescId: string;
    prescDate: string;
    dispensingType: string;
  }) => Promise<{ result: { drugDetailList: TDrugDetailItem[] } & Partial<TDrugDetailItem> }>;
}

interface UserStoreType {
  patChoose: { patientId: string };
}

interface GStoresType {
  userStore: UserStoreType;
}

// 模拟导入
const api: ApiType = {
  getRemindMedicationDrugInfo: async () => ({ result: { list: [] } }),
  getUserDrugQueryDetail: async () => ({ result: { drugDetailList: [] } }),
};

const gStores: GStoresType = {
  userStore: { patChoose: { patientId: '' } },
};

/**
 * 历史处方 Hook
 * 
 * 使用场景：
 * ```typescript
 * // 在 MedicationHistory.vue 中使用
 * const {
 *   listData,
 *   isComplete,
 *   getList,
 *   loadPrescriptionDetail,
 *   selectDrug,
 * } = useMedicationHistory();
 * ```
 * 
 * @returns 历史处方相关的状态和方法
 */
export function useMedicationHistory() {
  // ========== 状态定义 ==========
  
  /**
   * 历史处方列表数据
   * 
   * 数据结构：
   * 按日期分组，每项包含日期和该日期下的处方列表
   * 
   * 使用场景：
   * 模板中使用 v-for 渲染日期分组列表
   * 
   * @example
   * <view v-for="group in listData" :key="group.date">
   *   <text class="date-title">{{ group.date }}</text>
   *   <MedicalCollapse 
   *     v-for="item in group.prescList" 
   *     :key="item.prescId"
   *     :item="item"
   *   />
   * </view>
   */
  const listData = ref<TMedicalDrugHisList>([]);
  
  /**
   * 是否加载完成
   * 
   * 使用场景：
   * - 控制空状态显示
   * - 控制加载动画
   */
  const isComplete = ref(false);

  // ========== 方法 ==========
  
  /**
   * 获取历史处方列表
   * 
   * 使用场景：
   * - 页面加载时调用
   * - 刷新列表时调用
   * 
   * 查询范围：
   * 默认查询近5年的历史处方
   * 
   * 流程：
   * 1. 设置 isComplete = false
   * 2. 构建请求参数（患者ID、时间范围）
   * 3. 调用 API 获取数据
   * 4. 初始化每条处方的 drugDetailList 为空数组（懒加载）
   * 5. 更新 listData
   * 6. 设置 isComplete = true
   */
  const getList = async (): Promise<void> => {
    isComplete.value = false;
    
    try {
      const patientId = gStores.userStore.patChoose.patientId;
      const now = dayjs();
      
      // 构建请求参数
      const params = {
        patientId,
        visitType: '0', // 0 表示查询所有类型
        endTime: now.format('YYYY-MM-DD'),
        startTime: now.subtract(5, 'year').format('YYYY-MM-DD'),
      };

      // 调用 API
      const { result } = await api.getRemindMedicationDrugInfo(params);
      
      // 初始化 drugDetailList 为空数组（用于懒加载）
      if (result?.list && result.list.length > 0) {
        result.list.forEach((group) => {
          if (group.prescList) {
            group.prescList.forEach((prescription) => {
              // 初始化为空数组，点击展开时再加载
              prescription.drugDetailList = [];
            });
          }
        });
      }
      
      listData.value = result?.list || [];
    } catch (error) {
      console.error('获取历史处方列表失败:', error);
      listData.value = [];
    } finally {
      isComplete.value = true;
    }
  };

  /**
   * 加载处方详情
   * 
   * 使用场景：
   * 用户点击展开某条处方时调用（懒加载策略）
   * 
   * 懒加载策略说明：
   * - 首次展开时 drugDetailList 为空数组
   * - 调用此方法加载详情
   * - 已加载过则不再重复请求
   * 
   * 特殊处理 - 中药（prescTypeCode === '1'）：
   * 中药处方返回的数据结构可能不同，需要特殊处理：
   * - 中药可能包含 drugDetailList（子药品列表）
   * - 需要将详情数据包装为数组格式
   * 
   * 流程：
   * 1. 检查是否已加载（有数据则不重复请求）
   * 2. 构建请求参数
   * 3. 调用 API 获取详情
   * 4. 根据处方类型处理数据
   * 5. 更新处方数据的 drugDetailList
   * 
   * @param item - 处方数据项
   * @returns 是否加载成功
   */
  const loadPrescriptionDetail = async (
    item: TMedicalDrugHisListItem
  ): Promise<boolean> => {
    // 已加载过，不再重复请求
    if (item.drugDetailList && item.drugDetailList.length > 0) {
      return true;
    }

    try {
      const patientId = gStores.userStore.patChoose.patientId;
      
      // 构建请求参数
      const params = {
        patientId,
        prescId: item.prescId,
        prescDate: item.prescDate,
        dispensingType: item.dispensingType,
      };

      // 调用 API
      const { result } = await api.getUserDrugQueryDetail(params);
      
      if (!result) {
        item.drugDetailList = [];
        return false;
      }

      // 中药特殊处理（prescTypeCode === '1'）
      if (item.prescTypeCode === '1') {
        // 中药返回的 result 可能包含 amount, frequency 等字段
        // 需要将这些数据包装为 drugDetailList 格式
        const {
          amount,
          frequency,
          repetition,
          use,
          drugDetailList,
          itemSpec,
          unit,
        } = result;

        // 如果返回了药品详情列表，包装为第一项
        if (drugDetailList && drugDetailList.length > 0) {
          const medicalItem: TDrugDetailItem = {
            amount: amount || '',
            unit: unit || '',
            itemSpec: itemSpec || '',
            frequency: frequency || '',
            use: use || '',
            drugDetailList: drugDetailList,
            drugCode: '',
            drugName: '中药处方',
            drugUnit: '',
            units: '',
            packageUnits: '',
            quantity: '',
            road: '',
          };
          
          result.drugDetailList = [medicalItem];
        }
      }

      // 更新处方数据的药品详情列表
      item.drugDetailList = result.drugDetailList || [];
      return true;
    } catch (error) {
      console.error('加载处方详情失败:', error);
      item.drugDetailList = [];
      return false;
    }
  };

  /**
   * 选择药品并跳转到表单页
   * 
   * 使用场景：
   * 用户点击某条药品的"添加"按钮时调用
   * 
   * 流程：
   * 1. 将药品详情存入全局状态（medicationStore.addItem）
   * 2. 跳转到表单页
   * 3. 表单页读取 addItem 预填充表单
   * 
   * 注意：此方法需要传入 store 实例，因为 hook 内部无法直接访问 store
   * 
   * @param drug - 药品详情
   * @param changeAddItem - store 的 changeAddItem 方法
   */
  const selectDrug = (
    drug: TDrugDetailItem,
    changeAddItem: (data: any) => void
  ): void => {
    // 将选中的药品存入全局状态
    changeAddItem({ ...drug });
    
    // 跳转到表单页
    uni.navigateTo({
      url: '/pagesC/medicationManagerOptimized/pages/MedicationForm',
    });
  };

  /**
   * 返回用药列表页
   * 
   * 使用场景：
   * - 用户点击返回按钮
   * - 没有历史处方时提示返回
   */
  const goBack = (): void => {
    uni.navigateBack({ delta: 1 });
  };

  // ========== 返回 ==========
  
  return {
    // 状态
    listData,
    isComplete,
    
    // 方法
    getList,
    loadPrescriptionDetail,
    selectDrug,
    goBack,
  };
}

export default useMedicationHistory;
