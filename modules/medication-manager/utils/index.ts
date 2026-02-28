/**
 * ============================================================================
 * 用药管理模块 - 工具函数
 * ============================================================================
 * 
 * 本文件集中存放用药管理模块的工具函数，包括：
 * - 数据转换函数
 * - 验证函数
 * - 格式化函数
 * - 常量定义
 * 
 * 使用场景：
 * 当多个组件或页面需要相同的处理逻辑时，将逻辑抽离到此文件
 * ============================================================================
 */

import type { 
  IMedication, 
  IMedicationFormData, 
  TDrugDetailItem,
  IHOption,
} from '../types';
import dayjs from 'dayjs';

// ============================================
// 常量定义
// ============================================

/**
 * 验证规则提示信息
 * 
 * 使用场景：
 * 表单提交时进行字段验证，提示用户哪些字段必填
 * 
 * 与 IMedicationFormData 字段一一对应
 */
export const VALIDATION_MESSAGES: Record<string, string> = {
  recipeName: '请输入药品名称',
  useDrugWay: '请选择药品使用途径',
  useDrugUses: '请选择药品用法',
  useDrugAmount: '请输入单次用量',
  useDrugUnit: '请选择药品单次用量单位',
  useDrugFrequency: '请选择药品使用频次',
  dateRange: '请选择提醒日期',
  notifyTime: '请选择提醒时间',
};

/**
 * Emoji 表情正则表达式
 * 
 * 使用场景：
 * 验证药品名称是否包含表情符号（后端可能不支持存储）
 * 
 * 原理：匹配 Unicode 表情符号范围
 */
export const EMOJI_REGEX = 
  /([0-9|*|#]\uFE0F\u20E3)|([0-9|#]\u20E3)|([\u203C-\u3299]\uFE0F\u200D)|([\u203C-\u3299]\uFE0F)|([\u2122-\u2B55])|(\u303D)|([A9|AE]\u3030)|(\uA9)|(\uAE)|(\u3030)|([\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF])|([\uDC00-\uDFFF])|([\uD83C|\uD83D|\uD83E])|([\u200D])|[\uFE0F]/;

// ============================================
// 数据转换函数
// ============================================

/**
 * 将 IMedication 转换为表单数据格式 IMedicationFormData
 * 
 * 使用场景：
 * 编辑用药提醒时，将后端获取的数据转换为表单可用的格式
 * 
 * 转换逻辑：
 * - notifyTime 从 string[] 转换为 IHOption（添加 label）
 * - startDate 和 endDate 合并为 dateRange 数组
 * 
 * @param medication - 后端返回的用药提醒数据
 * @returns 表单数据格式
 * 
 * @example
 * // 表单页 onShow 中调用
 * const formData = medicationToFormData(medicationStore.checkItem!);
 * Object.assign(form, formData);
 */
export function medicationToFormData(medication: IMedication): IMedicationFormData {
  return {
    id: medication.id,
    recipeNo: medication.recipeNo,
    recipeName: medication.recipeName,
    useDrugWay: medication.useDrugWay,
    useDrugUses: medication.useDrugUses,
    useDrugAmount: medication.useDrugAmount,
    useDrugUnit: medication.useDrugUnit,
    useDrugFrequency: medication.useDrugFrequency,
    dateRange: [medication.startDate, medication.endDate],
    notifyTime: medication.notifyTime.map(time => ({
      label: time,
      value: time,
    })),
    remark: medication.remark,
  };
}

/**
 * 将表单数据格式 IMedicationFormData 转换为提交格式
 * 
 * 使用场景：
 * 表单提交前，将表单数据转换为后端 API 需要的格式
 * 
 * 转换逻辑：
 * - dateRange 拆分为 startDate 和 endDate
 * - notifyTime 从 IHOption 提取 value 数组
 * - 添加 patientId 和 hosId
 * 
 * @param formData - 表单数据
 * @param patientId - 患者ID
 * @param hosId - 医院ID
 * @returns API 提交格式
 * 
 * @example
 * // 表单提交时调用
 * const submitData = formDataToSubmitData(form, patientId, hosId);
 * await api.editRemindMedication(submitData);
 */
export function formDataToSubmitData(
  formData: IMedicationFormData,
  patientId: string,
  hosId: string
): Record<string, any> {
  const [startDate, endDate] = formData.dateRange;
  
  return {
    id: formData.id,
    recipeNo: formData.recipeNo,
    recipeName: formData.recipeName,
    useDrugWay: formData.useDrugWay,
    useDrugUses: formData.useDrugUses,
    useDrugAmount: formData.useDrugAmount,
    useDrugUnit: formData.useDrugUnit,
    useDrugFrequency: formData.useDrugFrequency,
    startDate: dayjs(startDate).format('YYYY-MM-DD'),
    endDate: dayjs(endDate).format('YYYY-MM-DD'),
    notifyTime: formData.notifyTime.map(item => item.value),
    remark: formData.remark,
    patientId,
    hosId,
  };
}

/**
 * 从历史处方药品详情提取表单预填充数据
 * 
 * 使用场景：
 * 用户从历史处方导入药品时，提取关键字段预填充表单
 * 
 * 特殊处理：
 * - 中药（prescTypeCode === '1'）可能有 drugDetailList，需要拼接药品名称
 * - 西药直接使用 drugName
 * 
 * @param item - 处方药品详情
 * @returns 部分表单字段
 * 
 * @example
 * // 历史处方页点击添加后，表单页调用
 * const presetData = extractDrugDetailToForm(medicationStore.addItem);
 * Object.assign(form, presetData);
 */
export function extractDrugDetailToForm(item: TDrugDetailItem): Partial<IMedicationFormData> {
  const result: Partial<IMedicationFormData> = {};

  // 处理药品名称
  if (item.drugDetailList && item.drugDetailList.length > 0) {
    // 中药：拼接所有子药品名称和规格
    result.recipeName = item.drugDetailList
      .map(drug => `${drug.drugName}${drug.amount}${drug.packageUnits}`)
      .join(' ');
    result.useDrugUnit = item.unit || '';
  } else {
    // 西药：直接使用药品名
    result.recipeName = item.drugName || '';
  }

  // 其他字段映射
  if (item.quantity) {
    result.useDrugAmount = String(Number(item.quantity));
  }
  
  if (item.use) {
    result.useDrugUses = item.use;
  }
  
  if (item.packageUnits) {
    result.useDrugUnit = item.packageUnits;
  }
  
  if (item.frequency) {
    result.useDrugFrequency = item.frequency;
  }
  
  if (item.road) {
    result.useDrugWay = item.road;
  }

  return result;
}

// ============================================
// 验证函数
// ============================================

/**
 * 验证表单数据
 * 
 * 使用场景：
 * 表单提交前进行完整性验证
 * 
 * 验证规则：
 * - 必填字段不能为空
 * - 数组类型字段必须有至少一项
 * - 药品名称不能包含 emoji
 * 
 * @param formData - 表单数据
 * @returns 验证结果 { valid: boolean, message?: string }
 * 
 * @example
 * // 提交前调用
 * const result = validateForm(form);
 * if (!result.valid) {
 *   messageStore.showMessage(result.message, 1500);
 *   return;
 * }
 */
export function validateForm(formData: IMedicationFormData): { valid: boolean; message?: string } {
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
    const value = formData[field];
    
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return {
        valid: false,
        message: VALIDATION_MESSAGES[field],
      };
    }
  }

  // 检查日期范围
  if (!formData.dateRange || formData.dateRange.length !== 2) {
    return {
      valid: false,
      message: VALIDATION_MESSAGES.dateRange,
    };
  }

  // 检查提醒时间
  if (!formData.notifyTime || formData.notifyTime.length === 0) {
    return {
      valid: false,
      message: VALIDATION_MESSAGES.notifyTime,
    };
  }

  // 检查药品名称是否包含 emoji
  if (EMOJI_REGEX.test(formData.recipeName)) {
    return {
      valid: false,
      message: '药品名称不支持使用 emoji 表情',
    };
  }

  return { valid: true };
}

/**
 * 验证单个字段
 * 
 * 使用场景：
 * 实时验证某个字段，如输入框 blur 时
 * 
 * @param field - 字段名
 * @param value - 字段值
 * @returns 验证结果
 */
export function validateField(
  field: keyof typeof VALIDATION_MESSAGES,
  value: any
): { valid: boolean; message?: string } {
  // 检查空值
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return {
      valid: false,
      message: VALIDATION_MESSAGES[field],
    };
  }

  // 药品名称特殊验证
  if (field === 'recipeName' && typeof value === 'string' && EMOJI_REGEX.test(value)) {
    return {
      valid: false,
      message: '药品名称不支持使用 emoji 表情',
    };
  }

  return { valid: true };
}

// ============================================
// 格式化函数
// ============================================

/**
 * 格式化日期范围显示文本
 * 
 * 使用场景：
 * 列表页或详情页展示日期范围
 * 
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @param format - 日期格式
 * @returns 格式化后的字符串，如 "2024-01-01 ~ 2024-01-31"
 */
export function formatDateRange(
  startDate: string,
  endDate: string,
  format = 'YYYY-MM-DD'
): string {
  return `${dayjs(startDate).format(format)} ~ ${dayjs(endDate).format(format)}`;
}

/**
 * 格式化用药用法显示文本
 * 
 * 使用场景：
 * 列表项中展示用药信息摘要
 * 
 * @param medication - 用药提醒数据
 * @returns 格式化后的字符串，如 "饭后服用 · 2片/次 · 每日三次"
 */
export function formatMedicationUsage(medication: IMedication): string {
  const parts: string[] = [];
  
  if (medication.useDrugUses) {
    parts.push(medication.useDrugUses);
  }
  
  if (medication.useDrugAmount && medication.useDrugUnit) {
    parts.push(`${medication.useDrugAmount}${medication.useDrugUnit}/次`);
  }
  
  if (medication.useDrugFrequency) {
    parts.push(medication.useDrugFrequency);
  }
  
  return parts.join(' · ');
}

/**
 * 格式化提醒时间显示
 * 
 * 使用场景：
 * 将提醒时间数组格式化为可读文本
 * 
 * @param times - 时间数组
 * @returns 格式化后的字符串，如 "08:00, 12:00, 18:00"
 */
export function formatNotifyTimes(times: string[]): string {
  if (!times || times.length === 0) return '';
  return times.join(', ');
}

// ============================================
// 状态相关函数
// ============================================

/**
 * 获取状态标签文本和样式类
 * 
 * 使用场景：
 * 列表项根据状态显示不同样式的标签
 * 
 * @param status - 状态码
 * @param isClose - 是否关闭
 * @returns 标签配置 { text: string, className: string }
 * 
 * @example
 * const { text, className } = getStatusTag(medication.status, medication.isClose);
 * // <text :class="className">{{ text }}</text>
 */
export function getStatusTag(
  status: number,
  isClose: 0 | 1
): { text: string; className: string } {
  // 已关闭状态优先级最高
  if (isClose === 1 || status === 3) {
    return { text: '已关闭', className: 'tag-gray' };
  }
  
  // 待执行
  if (status === 2) {
    return { text: '待执行', className: 'tag-blue' };
  }
  
  // 执行中
  if (status === 1) {
    return { text: '执行中', className: 'tag-green' };
  }
  
  // 默认
  return { text: '未知', className: 'tag-gray' };
}

// ============================================
// 辅助函数
// ============================================

/**
 * 生成唯一处方编号
 * 
 * 使用场景：
 * 新增用药提醒时生成 recipeNo
 * 
 * @returns 唯一编号，如 "recipeNo1706789123456"
 */
export function generateRecipeNo(): string {
  return `recipeNo${Date.now()}`;
}

/**
 * 生成默认提醒时间
 * 
 * 使用场景：
 * 新增用药提醒时预填充默认提醒时间
 * 
 * @returns 默认时间选项
 */
export function getDefaultNotifyTime(): IHOption {
  return [
    { label: '08:00', value: '08:00' },
  ];
}

/**
 * 检查时间是否已存在
 * 
 * 使用场景：
 * 添加提醒时间时避免重复
 * 
 * @param times - 已有时间列表
 * @param newTime - 要添加的时间
 * @returns 是否已存在
 */
export function isTimeExists(times: IHOption, newTime: string): boolean {
  return times.some(item => item.value === newTime);
}

/**
 * 生成日期范围（用于默认填充）
 * 
 * 使用场景：
 * 新增用药提醒时默认选中从今天开始的一周
 * 
 * @param days - 默认天数
 * @returns 日期范围数组 [开始日期, 结束日期]
 */
export function generateDefaultDateRange(days = 7): [string, string] {
  const start = dayjs().format('YYYY-MM-DD');
  const end = dayjs().add(days, 'day').format('YYYY-MM-DD');
  return [start, end];
}
