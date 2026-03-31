/**
 * ============================================================================
 * 用药管理模块 - Pinia Store
 * ============================================================================
 * 
 * 本文件定义用药管理模块的全局状态管理，使用 Pinia 实现。
 * 
 * 核心职责：
 * 1. 管理表单选项数据（用药途径、用法、单位、频次）
 * 2. 管理跨页面传递的数据（checkItem, addItem）
 * 3. 管理系统配置（功能开关）
 * 4. 提供数据转换工具方法（getLabel）
 * 
 * 使用场景：
 * - 页面间需要传递复杂数据时（如编辑用药提醒）
 * - 多个组件需要共享配置数据时
 * - 需要持久化保存某些状态时
 * 
 * 注意：本 Store 使用了 persist 插件，配置数据会保存到本地存储
 * ============================================================================
 */

import { defineStore } from 'pinia';
import type {
  IMedication,
  IHOption,
  IMedicationConfig,
  IAddMedicalWayItem,
} from '../types';

/**
 * 模拟 API 导入（实际项目中应从 @/api/api 导入）
 * 这里使用类型断言避免实际依赖
 */
const api = {
  getParamsMoreBySysCode3: (_params: { paramCode: string }) => 
    Promise.resolve({ result: null }),
};

/**
 * 模拟 ServerStaticData 导入
 * 用于获取表单选项的静态配置数据
 */
const ServerStaticData = {
  getAddMedicalData: (): Promise<{
    USE_DRUG_WAY: IHOption;
    USE_DRUG_USES: IHOption;
    USE_DRUG_UNIT: IHOption;
    USE_DRUG_FREQUENCY: IHOption;
  }> => Promise.resolve({
    USE_DRUG_WAY: [],
    USE_DRUG_USES: [],
    USE_DRUG_UNIT: [],
    USE_DRUG_FREQUENCY: [],
  }),
};

/**
 * Store 定义
 * 
 * 使用场景示例：
 * ```typescript
 * // 在 Vue 组件中使用
 * import { useMedicationStore } from '@/pagesC/medicationManagerOptimized/store/medicationStore';
 * 
 * const medicationStore = useMedicationStore();
 * 
 * // 初始化配置
 * await medicationStore.init();
 * 
 * // 读取表单选项
 * console.log(medicationStore.optionsDrugWay);
 * 
 * // 设置要编辑的数据
 * medicationStore.updateCheckItem(medicationItem);
 * 
 * // 跳转到编辑页
 * uni.navigateTo({ url: '/pagesC/medicationManagerOptimized/pages/MedicationForm' });
 * ```
 */
export const useMedicationStore = defineStore('medicationOptimized', {
  /**
   * 启用持久化配置
   * 使用场景：用户关闭应用后重新打开，表单选项等配置仍然保留
   */
  persist: {
    enabled: true,
    // 只持久化配置数据，不持久化临时数据
    strategies: [
      {
        storage: localStorage,
        paths: ['optionsDrugWay', 'optionsDrugUse', 'optionsDrugUnit', 'optionsFrequency', 'config'],
      },
    ],
  },

  /**
   * 状态定义
   * 
   * 使用场景：
   * - 在组件中使用 storeToRefs 解构获取响应式状态
   * - 直接在模板中使用 $store.xxx 访问
   */
  state: () => ({
    // ========== 表单选项数据 ==========
    // 这些选项从后端静态配置获取，用于表单页面的选择器
    
    /** 用药途径选项（如：口服、静脉注射、外用等） */
    optionsDrugWay: [] as IHOption,
    
    /** 药品用法选项（如：饭前服用、饭后服用、睡前服用等） */
    optionsDrugUse: [] as IHOption,
    
    /** 药品单位选项（如：片、粒、毫升、克等） */
    optionsDrugUnit: [] as IHOption,
    
    /** 用药频次选项（如：每日一次、每日两次、每周三次等） */
    optionsFrequency: [] as IHOption,

    // ========== 跨页面传递的数据 ==========
    
    /**
     * 当前选中的用药提醒（用于编辑）
     * 
     * 使用场景：
     * 1. 用户在列表页点击某条用药提醒
     * 2. 将该条数据存入 checkItem
     * 3. 跳转到表单页
     * 4. 表单页 onShow 生命周期读取 checkItem 并填充表单
     * 5. 填充完成后清空 checkItem，避免重复填充
     * 
     * 为什么不用 URL 参数传递：
     * - 数据结构复杂，URL 参数长度有限
     * - 需要保持对象的完整性和类型安全
     */
    checkItem: null as IMedication | null,
    
    /**
     * 从历史处方导入的药品数据（用于新增时预填充）
     * 
     * 使用场景：
     * 1. 用户在历史处方页点击"添加"按钮
     * 2. 将药品详情存入 addItem
     * 3. 跳转到表单页
     * 4. 表单页读取 addItem 预填充部分字段
     * 5. 用户可在此基础上修改后保存
     */
    addItem: null as any,

    // ========== 系统配置 ==========
    
    /**
     * 系统配置
     * 
     * 使用场景：
     * - 控制功能入口是否显示
     * - 决定是否显示 ActionSheet 选择
     * 
     * 配置来源：
     * 后端参数配置表，通过 getConfig action 获取
     */
    config: {
      /** 是否开启自定义提醒：1=开启，0=关闭 */
      isOpenCustom: '1' as '0' | '1',
      /** 是否开启历史处方：1=开启，0=关闭 */
      isOpenHistory: '0' as '0' | '1',
    } as IMedicationConfig,
  }),

  /**
   * Getter 计算属性
   * 
   * 使用场景：
   * - 需要对 state 进行派生计算时
   * - 多个组件需要相同的计算逻辑时
   */
  getters: {
    /**
     * 获取新增用药提醒的入口选项列表
     * 
     * 使用场景：
     * 当用户点击"新增提醒"按钮时，根据配置决定：
     * - 如果只有一个入口开启，直接进入对应页面
     * - 如果两个入口都开启，显示 ActionSheet 让用户选择
     * 
     * 返回格式符合 ActionSheet 组件的 options 要求
     * 
     * @example
     * // 在组件中使用
     * const ways = medicationStore.getSelAddMedicalWay;
     * if (ways.length === 1) {
     *   // 直接进入
     * } else {
     *   // 显示 ActionSheet
     * }
     */
    getSelAddMedicalWay(): IAddMedicalWayItem[] {
      const list: IAddMedicalWayItem[] = [];

      // 如果开启自定义提醒，添加自定义选项
      if (this.config.isOpenCustom === '1') {
        list.push({
          label: '自定义提醒',
          color: '#333333',
          fontSize: '17px',
          disabled: false,
          key: 'custom',
        });
      }

      // 如果开启历史处方，添加处方选项
      if (this.config.isOpenHistory === '1') {
        list.push({
          label: '本院处方',
          color: '#333333',
          fontSize: '17px',
          disabled: false,
          key: 'prescription',
        });
      }

      return list;
    },

    /**
     * 是否有数据正在编辑
     * 
     * 使用场景：
     * 表单页可以用此判断当前是新增还是编辑模式
     */
    isEditing(): boolean {
      return !!this.checkItem;
    },

    /**
     * 是否有从历史处方导入的数据
     * 
     * 使用场景：
     * 表单页可以用此判断是否需要预填充数据
     */
    hasImportData(): boolean {
      return !!this.addItem;
    },
  },

  /**
   * Actions 方法
   * 
   * 使用场景：
   * - 需要异步操作时
   * - 需要修改多个 state 时
   * - 需要在多个地方复用相同逻辑时
   */
  actions: {
    /**
     * 初始化表单选项数据
     * 
     * 使用场景：
     * - 表单页面加载时调用
     * - 如果已经初始化过（有缓存），不会重复请求
     * 
     * 优化点：
     * 使用 persist 插件缓存选项数据，减少网络请求
     * 
     * @example
     * // 在表单页 onMounted 中调用
     * onMounted(() => {
     *   medicationStore.init();
     * });
     */
    async init(): Promise<void> {
      // 如果已经有数据，不再重复请求（利用 persist 缓存）
      if (this.optionsDrugUnit.length > 0) {
        return;
      }

      try {
        // 从后端获取表单配置数据
        const pageConfig = await ServerStaticData.getAddMedicalData();
        
        // 更新 state
        this.optionsDrugWay = pageConfig.USE_DRUG_WAY;
        this.optionsDrugUse = pageConfig.USE_DRUG_USES;
        this.optionsDrugUnit = pageConfig.USE_DRUG_UNIT;
        this.optionsFrequency = pageConfig.USE_DRUG_FREQUENCY;
      } catch (error) {
        console.error('初始化用药管理配置失败:', error);
        // 可以在这里添加错误提示
      }
    },

    /**
     * 强制刷新表单选项数据
     * 
     * 使用场景：
     * - 后台配置更新后需要刷新
     * - 用户手动下拉刷新时
     */
    async refreshOptions(): Promise<void> {
      try {
        const pageConfig = await ServerStaticData.getAddMedicalData();
        this.optionsDrugWay = pageConfig.USE_DRUG_WAY;
        this.optionsDrugUse = pageConfig.USE_DRUG_USES;
        this.optionsDrugUnit = pageConfig.USE_DRUG_UNIT;
        this.optionsFrequency = pageConfig.USE_DRUG_FREQUENCY;
      } catch (error) {
        console.error('刷新用药管理配置失败:', error);
      }
    },

    /**
     * 更新当前编辑的用药提醒
     * 
     * 使用场景：
     * 1. 列表页用户点击编辑按钮时，将数据存入
     * 2. 表单页完成数据填充后，清空
     * 
     * @param item - 用药提醒数据，null 表示清空
     * 
     * @example
     * // 列表页点击编辑
     * const handleEdit = (item: IMedication) => {
     *   medicationStore.updateCheckItem(item);
     *   uni.navigateTo({ url: '.../MedicationForm' });
     * };
     * 
     * // 表单页填充完成后
     * medicationStore.updateCheckItem(null);
     */
    updateCheckItem(item: IMedication | null): void {
      this.checkItem = item;
    },

    /**
     * 更新从历史处方导入的数据
     * 
     * 使用场景：
     * 1. 历史处方页点击添加按钮时，将药品数据存入
     * 2. 表单页完成预填充后，清空
     * 
     * @param data - 药品详情数据，null 表示清空
     */
    changeAddItem(data: any): void {
      this.addItem = data;
    },

    /**
     * 根据 value 获取选项的 label
     * 
     * 使用场景：
     * - 在详情页展示时，需要将 value 转换为可读的 label
     * - 选择器组件需要回显选中的文本
     * 
     * @param list - 选项列表
     * @param value - 选中的值
     * @returns 对应的 label，找不到则返回原值
     * 
     * @example
     * const wayLabel = medicationStore.getLabel(
     *   medicationStore.optionsDrugWay,
     *   medication.useDrugWay
     * );
     * // wayLabel = "口服"
     */
    getLabel(list: IHOption, value: string): string {
      if (!list || list.length === 0) {
        return value;
      }
      
      const item = list.find((o) => o.value === value);
      return item?.label ?? value;
    },

    /**
     * 批量获取 label
     * 
     * 使用场景：
     * 需要一次性转换多个字段时
     * 
     * @example
     * const labels = medicationStore.getLabels({
     *   way: [medicationStore.optionsDrugWay, medication.useDrugWay],
     *   use: [medicationStore.optionsDrugUse, medication.useDrugUses],
     * });
     * // labels = { way: '口服', use: '饭后服用' }
     */
    getLabels(map: Record<string, [IHOption, string]>): Record<string, string> {
      const result: Record<string, string> = {};
      
      for (const key in map) {
        const [list, value] = map[key];
        result[key] = this.getLabel(list, value);
      }
      
      return result;
    },

    /**
     * 获取系统配置
     * 
     * 使用场景：
     * - 列表页加载时获取，决定入口显示
     * - 管理员修改配置后刷新
     * 
     * 配置存储在参数配置表中，key 为 DRUG_BUTLER_CONFIG
     */
    async getConfig(): Promise<void> {
      try {
        const { result } = await api.getParamsMoreBySysCode3({
          paramCode: 'DRUG_BUTLER_CONFIG',
        });

        if (result?.DRUG_BUTLER_CONFIG) {
          // 解析 JSON 配置字符串
          const config = JSON.parse(result.DRUG_BUTLER_CONFIG);
          this.config = {
            isOpenCustom: config.isOpenCustom ?? '1',
            isOpenHistory: config.isOpenHistory ?? '0',
          };
        }
      } catch (error) {
        console.error('获取用药管理配置失败:', error);
        // 使用默认配置
        this.config = {
          isOpenCustom: '1',
          isOpenHistory: '0',
        };
      }
    },

    /**
     * 重置所有状态
     * 
     * 使用场景：
     * - 用户退出登录时
     * - 需要清空所有数据时
     */
    reset(): void {
      this.checkItem = null;
      this.addItem = null;
      // 注意：config 和 options 通常不需要重置，因为是配置数据
    },
  },
});

/**
 * 导出 Store 实例（单例模式）
 * 
 * 使用场景：
 * 在 Vue 组件外部使用（如工具函数中）
 * 
 * @example
 * import { medicationStore } from './medicationStore';
 * 
 * // 在非组件环境中使用
 * medicationStore.getLabel(...);
 */
export const medicationStore = useMedicationStore();

// 默认导出 store 实例
export default medicationStore;
