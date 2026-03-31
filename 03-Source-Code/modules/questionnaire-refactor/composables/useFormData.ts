/**
 * 表单数据处理组合式函数
 * @description 处理表单数据的转换、映射和验证
 */

import { ref, computed, type Ref } from 'vue';
import type { FormData, IFormListItem } from '../types/questionnaire';
import { FIELD_TO_QUESTION_MAP, SPECIAL_SYSTEM_CODES, QUESTIONNAIRE_CATEGORY } from '../constants/questionnaire';

// ==================== 类型定义 ====================

/** 页面参数 */
interface PageParams {
  category?: string;
  cardNumber?: string;
  patientName?: string;
  hosName?: string;
  deptName?: string;
  docName?: string;
  visitDate?: string;
  patientAge?: string;
  patientSex?: string;
  outTime?: string;
  visitTime?: string;
  typeLabel?: string;
  hospitalWard?: string;
  [key: `q-${string}`]: unknown;
  [key: string]: unknown;
}

/** useFormData 返回值 */
interface UseFormDataReturn {
  /** 表单数据 */
  formData: Ref<FormData>;
  /** 是否有数据 */
  hasData: import('vue').ComputedRef<boolean>;
  /** 已填充的字段键 */
  filledKeys: import('vue').ComputedRef<string[]>;
  
  // 方法
  /** 从页面参数填充表单数据 */
  fillFromPageParams: (params: PageParams, sysCode: string) => void;
  /** 从答案列表回显数据 */
  fillFromAnswerList: (answerList: Array<{ anContent: string; qsId: number; unContent?: string }>) => Map<number, string>;
  /** 更新表单数据 */
  updateFormData: (key: string, value: unknown) => void;
  /** 批量更新表单数据 */
  batchUpdateFormData: (data: FormData) => void;
  /** 清空表单数据 */
  clearFormData: () => void;
}

// ==================== 辅助函数 ====================

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 天数差（向上取整）
 */
export const getDaysBetweenDates = (date1: string | Date, date2: string | Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // 设置时间为当天开始
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * 处理西部战区特殊逻辑
 */
const handleWesternWarZone = (
  params: PageParams,
  formData: FormData
): void => {
  const { category, outTime, visitTime, patientAge, typeLabel } = params;
  
  if (category === QUESTIONNAIRE_CATEGORY.INPATIENT) {
    // 住院问卷：计算住院天数
    if (outTime && visitTime) {
      const days = getDaysBetweenDates(outTime, visitTime);
      if (days > 0) {
        formData[3] = days;
      }
    }
    // 设置患者年龄
    if (patientAge) {
      formData[4] = patientAge;
    }
  } else if (category === QUESTIONNAIRE_CATEGORY.OUTPATIENT) {
    // 门诊问卷：设置就诊类型
    formData[1] = typeLabel === '4' ? '急诊' : '门诊';
  }
};

/**
 * 处理东部战区特殊逻辑
 */
const handleEasternWarZone = (
  params: PageParams,
  formData: FormData
): void => {
  const { hospitalWard } = params;
  if (hospitalWard) {
    formData[1] = hospitalWard;
  }
};

/**
 * 处理动态字段（q- 开头的参数）
 */
const handleDynamicFields = (
  params: PageParams,
  formData: FormData
): void => {
  Object.entries(params).forEach(([key, value]) => {
    if (key.startsWith('q-')) {
      const questionId = key.replace('q-', '');
      // 确保是数字ID
      if (!isNaN(Number(questionId))) {
        formData[questionId] = value;
      }
    }
  });
};

/**
 * 处理字段映射
 */
const handleFieldMapping = (
  params: PageParams,
  formData: FormData
): void => {
  const { cardNumber } = params;
  
  Object.entries(FIELD_TO_QUESTION_MAP).forEach(([field, questionId]) => {
    const value = params[field as keyof PageParams];
    
    if (value !== undefined && value !== null && value !== '') {
      // 患者姓名特殊处理：添加卡号后缀
      if (field === 'patientName' && cardNumber) {
        formData[questionId] = `${value} (${cardNumber})`;
      } else {
        formData[questionId] = value;
      }
    }
  });
};

// ==================== 主函数 ====================

/**
 * 表单数据处理组合式函数
 */
export function useFormData(): UseFormDataReturn {
  // ==================== 响应式状态 ====================
  
  const formData = ref<FormData>({});
  
  // ==================== 计算属性 ====================
  
  const hasData = computed(() => Object.keys(formData.value).length > 0);
  
  const filledKeys = computed(() => Object.keys(formData.value));
  
  // ==================== 方法 ====================
  
  /**
   * 从页面参数填充表单数据
   */
  const fillFromPageParams = (params: PageParams, sysCode: string): void => {
    try {
      // 1. 处理动态字段（q- 开头）
      handleDynamicFields(params, formData.value);
      
      // 2. 处理字段映射
      handleFieldMapping(params, formData.value);
      
      // 3. 处理特殊系统逻辑
      switch (sysCode) {
        case SPECIAL_SYSTEM_CODES.WESTERN_WAR_ZONE:
          handleWesternWarZone(params, formData.value);
          break;
        case SPECIAL_SYSTEM_CODES.EASTERN_WAR_ZONE:
          handleEasternWarZone(params, formData.value);
          break;
        default:
          break;
      }
    } catch (error) {
      console.warn('[useFormData] 参数赋值错误:', error);
    }
  };
  
  /**
   * 从答案列表回显数据
   * @returns 收集的 unContent 映射
   */
  const fillFromAnswerList = (
    answerList: Array<{ anContent: string; qsId: number; unContent?: string }>
  ): Map<number, string> => {
    const unContentMap = new Map<number, string>();
    
    answerList.forEach((item) => {
      const { anContent, qsId, unContent } = item;
      
      // 收集 unContent
      if (unContent) {
        unContentMap.set(qsId, unContent);
      }
      
      // 回填数据（只处理联系方式，不处理姓名和身份证）
      if (anContent) {
        if (qsId === 1 || qsId === 2) {
          // 多选字段处理为数组
          formData.value[qsId] = anContent.split(',');
        } else {
          formData.value[qsId] = anContent;
        }
      }
    });
    
    return unContentMap;
  };
  
  /**
   * 更新单个表单数据
   */
  const updateFormData = (key: string, value: unknown): void => {
    formData.value[key] = value;
  };
  
  /**
   * 批量更新表单数据
   */
  const batchUpdateFormData = (data: FormData): void => {
    Object.assign(formData.value, data);
  };
  
  /**
   * 清空表单数据
   */
  const clearFormData = (): void => {
    formData.value = {};
  };
  
  return {
    formData,
    hasData,
    filledKeys,
    fillFromPageParams,
    fillFromAnswerList,
    updateFormData,
    batchUpdateFormData,
    clearFormData,
  };
}
