/**
 * ============================================================================
 * 用药管理模块 - 表单页组合式函数
 * ============================================================================
 * 
 * 本文件封装用药提醒表单页的业务逻辑，包括数据初始化、验证、提交等。
 * 
 * 使用场景：
 * - MedicationForm.vue 页面使用此 hook 管理表单状态和操作
 * - 同时支持新增模式和编辑模式
 * 
 * 功能包括：
 * 1. 表单数据管理
 * 2. 从历史处方/编辑数据预填充
 * 3. 提醒时间的添加/删除
 * 4. 表单验证和提交
 * ============================================================================
 */

import { ref, computed } from 'vue';
import type { 
  IMedicationFormData, 
  IMedication, 
  TDrugDetailItem,
  IHOption,
} from '../types';
import { 
  EPageType, 
  EMedicationStatus,
  VALIDATION_MESSAGES,
  EMOJI_REGEX,
} from '../types';
import { 
  medicationToFormData, 
  formDataToSubmitData,
  extractDrugDetailToForm,
  generateRecipeNo,
  generateDefaultDateRange,
} from '../utils';

/**
 * 模拟依赖导入（实际项目中应从相应文件导入）
 */
interface ApiType {
  editRemindMedication: (params: any) => Promise<void>;
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

interface ServerStaticDataType {
  getHosList: () => Promise<Array<{ hosId: string }>>;
}

// 模拟导入
const api: ApiType = {
  editRemindMedication: async () => {},
};

const gStores: GStoresType = {
  userStore: { patChoose: { patientId: '' } },
  messageStore: { showMessage: () => {} },
};

const ServerStaticData: ServerStaticDataType = {
  getHosList: async () => [],
};

/**
 * 创建默认表单数据
 * 
 * 使用场景：
 * 新增模式时初始化空表单
 * 
 * @returns 默认表单数据
 */
function createDefaultFormData(): IMedicationFormData {
  return {
    recipeNo: generateRecipeNo(),
    recipeName: '',
    useDrugWay: '',
    useDrugUses: '',
    useDrugAmount: '1',
    useDrugUnit: '',
    useDrugFrequency: '',
    dateRange: generateDefaultDateRange(),
    notifyTime: [],
    remark: '',
  };
}

/**
 * 用药表单 Hook
 * 
 * 使用场景：
 * ```typescript
 * // 在 MedicationForm.vue 中使用
 * const {
 *   form,
 *   pageType,
 *   pageTitle,
 *   dateRangeLabel,
 *   inputAttribute,
 *   isEditing,
 *   initForm,
 *   assignFromMedication,
 *   assignFromDrugDetail,
 *   addNotifyTime,
 *   deleteNotifyTime,
 *   validate,
 *   submit,
 * } = useMedicationForm();
 * ```
 * 
 * @returns 表单相关的状态和方法
 */
export function useMedicationForm() {
  // ========== 状态定义 ==========
  
  /**
   * 页面类型：新增或编辑
   * 
   * 使用场景：
   * - 控制页面标题（新增提醒/编辑提醒）
   * - 控制是否显示删除按钮
   * - 提交时决定是新增还是更新
   */
  const pageType = ref<EPageType>(EPageType.ADD);
  
  /**
   * 表单数据对象
   * 
   * 使用场景：
   * 模板中使用 v-model 绑定到表单控件
   * 
   * @example
   * <uni-easyinput v-model="form.recipeName" />
   * <SelectBox v-model:value="form.useDrugWay" />
   */
  const form = ref<IMedicationFormData>(createDefaultFormData());

  // ========== 计算属性 ==========
  
  /**
   * 页面标题
   * 
   * 计算逻辑：
   * 根据 pageType 返回对应标题
   * 
   * 使用场景：
   * 设置导航栏标题
   * 
   * @example
   * uni.setNavigationBarTitle({ title: pageTitle.value });
   */
  const pageTitle = computed(() => {
    return pageType.value === EPageType.ADD ? '新增提醒' : '编辑提醒';
  });
  
  /**
   * 是否编辑模式
   * 
   * 使用场景：
   * 控制某些字段是否可编辑（编辑时某些字段可能只读）
   */
  const isEditing = computed(() => pageType.value === EPageType.EDIT);
  
  /**
   * 日期范围显示文本
   * 
   * 计算逻辑：
   * 将 dateRange 数组拼接为 "YYYY-MM-DD ~ YYYY-MM-DD" 格式
   * 
   * 使用场景：
   * 日期选择器组件显示当前选中的日期范围
   * 
   * @example
   * "2024-01-15 ~ 2024-01-22"
   */
  const dateRangeLabel = computed(() => {
    if (!form.value.dateRange || form.value.dateRange.length !== 2) {
      return '';
    }
    return form.value.dateRange.join(' ~ ');
  });
  
  /**
   * 输入框通用属性配置
   * 
   * 使用场景：
   * uni-easyinput 组件的 v-bind 属性
   * 统一配置所有输入框的样式和行为
   */
  const inputAttribute = computed(() => ({
    type: 'textarea',
    autoHeight: true,
    inputBorder: false,
    clearable: false,
    placeholder: '',
    styles: {
      color: 'var(--hr-neutral-color-10)',
    },
    placeholderStyle: 'color: var(--hr-neutral-color-5);',
  }));

  // ========== 方法 ==========
  
  /**
   * 初始化表单
   * 
   * 使用场景：
   * 页面加载时调用，重置为新增模式
   */
  const initForm = (): void => {
    pageType.value = EPageType.ADD;
    form.value = createDefaultFormData();
  };

  /**
   * 从 IMedication 数据填充表单（编辑模式）
   * 
   * 使用场景：
   * 用户点击编辑某条用药提醒时，将数据填充到表单
   * 
   * 流程：
   * 1. 设置页面类型为 EDIT
   * 2. 将 IMedication 转换为表单格式
   * 3. 填充到 form
   * 
   * @param medication - 用药提醒数据
   */
  const assignFromMedication = (medication: IMedication): void => {
    pageType.value = EPageType.EDIT;
    form.value = medicationToFormData(medication);
  };

  /**
   * 从历史处方药品详情填充表单（导入模式）
   * 
   * 使用场景：
   * 用户从历史处方导入药品时，预填充部分字段
   * 
   * 流程：
   * 1. 重置为新增模式
   * 2. 从 TDrugDetailItem 提取可映射的字段
   * 3. 合并到 form
   * 
   * @param drugDetail - 处方药品详情
   */
  const assignFromDrugDetail = (drugDetail: TDrugDetailItem): void => {
    pageType.value = EPageType.ADD;
    // 重置表单为默认值，然后填充导入的数据
    form.value = createDefaultFormData();
    
    const extracted = extractDrugDetailToForm(drugDetail);
    Object.assign(form.value, extracted);
  };

  /**
   * 添加提醒时间
   * 
   * 使用场景：
   * 用户在时间选择器中选择时间后调用
   * 
   * 逻辑：
   * - 检查时间是否已存在，避免重复
   * - 添加到 notifyTime 数组
   * 
   * @param time - 时间字符串，如 "08:00"
   * @returns 是否添加成功
   */
  const addNotifyTime = (time: string): boolean => {
    const exists = form.value.notifyTime.some(item => item.value === time);
    
    if (exists) {
      gStores.messageStore.showMessage('该时间已存在', 1500);
      return false;
    }
    
    form.value.notifyTime.push({
      label: time,
      value: time,
    });
    
    return true;
  };

  /**
   * 删除提醒时间
   * 
   * 使用场景：
   * 用户点击提醒时间标签的删除按钮时调用
   * 
   * @param item - 要删除的时间选项
   */
  const deleteNotifyTime = (item: IHOptionItem): void => {
    const idx = form.value.notifyTime.findIndex(o => o.value === item.value);
    if (idx !== -1) {
      form.value.notifyTime.splice(idx, 1);
    }
  };

  /**
   * 验证表单数据
   * 
   * 使用场景：
   * 提交前进行字段验证
   * 
   * 验证规则：
   * - 必填字段不能为空
   * - 数组类型字段必须有至少一项
   * - 药品名称不能包含 emoji
   * 
   * @returns 验证结果
   */
  const validate = (): { valid: boolean; message?: string } => {
    // 检查必填字段
    const requiredFields: (keyof typeof VALIDATION_MESSAGES)[] = [
      'recipeName',
      'useDrugWay',
      'useDrugUses',
      'useDrugAmount',
      'useDrugUnit',
      'useDrugFrequency',
    ];

    for (const field of requiredFields) {
      const value = form.value[field];
      
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return {
          valid: false,
          message: VALIDATION_MESSAGES[field],
        };
      }
    }

    // 检查日期范围
    if (!form.value.dateRange || form.value.dateRange.length !== 2) {
      return {
        valid: false,
        message: VALIDATION_MESSAGES.dateRange,
      };
    }

    // 检查提醒时间
    if (!form.value.notifyTime || form.value.notifyTime.length === 0) {
      return {
        valid: false,
        message: VALIDATION_MESSAGES.notifyTime,
      };
    }

    // 检查药品名称是否包含 emoji
    if (EMOJI_REGEX.test(form.value.recipeName)) {
      return {
        valid: false,
        message: '药品名称不支持使用 emoji 表情',
      };
    }

    return { valid: true };
  };

  /**
   * 提交表单
   * 
   * 使用场景：
   * 用户点击保存按钮时调用
   * 
   * 流程：
   * 1. 验证表单数据
   * 2. 转换数据格式
   * 3. 获取患者和医院信息
   * 4. 调用 API 保存
   * 5. 返回上一页
   * 
   * @returns Promise<void>
   */
  const submit = async (): Promise<void> => {
    // 步骤1: 验证表单
    const validation = validate();
    if (!validation.valid) {
      gStores.messageStore.showMessage(validation.message!, 1500);
      return;
    }

    try {
      // 步骤2: 获取患者和医院信息
      const patientId = gStores.userStore.patChoose.patientId;
      const hosList = await ServerStaticData.getHosList();
      const hosId = hosList[0]?.hosId || '';

      // 步骤3: 转换数据格式
      const submitData = formDataToSubmitData(form.value, patientId, hosId);

      // 步骤4: 显示加载中
      uni.showLoading({
        title: '保存中...',
        mask: true,
      });

      // 步骤5: 调用 API
      await api.editRemindMedication(submitData);

      // 步骤6: 隐藏加载并提示成功
      uni.hideLoading();
      gStores.messageStore.showMessage('保存成功', 1500);

      // 步骤7: 返回上一页
      const pages = getCurrentPages();
      uni.navigateBack({
        delta: pages.length > 1 ? 1 : 1,
      });
    } catch (error) {
      uni.hideLoading();
      console.error('保存用药提醒失败:', error);
      gStores.messageStore.showMessage('保存失败，请重试', 1500);
    }
  };

  /**
   * 删除当前用药提醒
   * 
   * 使用场景：
   * 编辑模式下用户点击删除按钮时调用
   * 
   * 注意：此方法需要传入 id，因为编辑时 form.id 可能为 undefined
   * 
   * @param id - 用药提醒 ID 数组
   */
  const deleteMedication = async (id: string[]): Promise<void> => {
    if (!id || id.length === 0) {
      gStores.messageStore.showMessage('删除失败：缺少ID', 1500);
      return;
    }

    try {
      // 模拟 API 调用（实际应从 api 文件导入）
      // await api.deleteRemindMedication({
      //   id,
      //   patientId: gStores.userStore.patChoose.patientId,
      // });

      gStores.messageStore.showMessage('删除成功', 1500, {
        closeCallBack: () => {
          uni.navigateBack({ delta: 1 });
        },
      });
    } catch (error) {
      console.error('删除用药提醒失败:', error);
      gStores.messageStore.showMessage('删除失败，请重试', 1500);
    }
  };

  // ========== 返回 ==========
  
  return {
    // 状态
    form,
    pageType,
    
    // 计算属性
    pageTitle,
    isEditing,
    dateRangeLabel,
    inputAttribute,
    
    // 方法
    initForm,
    assignFromMedication,
    assignFromDrugDetail,
    addNotifyTime,
    deleteNotifyTime,
    validate,
    submit,
    deleteMedication,
  };
}

export default useMedicationForm;
