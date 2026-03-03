/**
 * 问卷/表单业务逻辑组合式函数
 * @description 抽离问卷相关的业务逻辑，实现逻辑复用和组件减负
 */

import { ref, type Ref } from 'vue';
import type {
  IQuestionnaireBase,
  IFormListItem,
  ISubmitAnswerItem,
  LoveType,
  ISubmitLoveFormParams,
  ICheckSubmittedResult,
  ISubmitResult,
  FormData,
  QuestionType,
} from '../types/questionnaire';
import {
  LOVE_TYPE_MAP,
  LOVE_SOURCE_CODE,
  LOVE_MESSAGES,
  getMockDataByType,
} from '../constants/questionnaire';

// ==================== 类型定义 ====================

interface UseQuestionnaireOptions {
  /** API 实例 */
  api: {
    getQuestionnaireSurvey?: (params: { category: string | number }) => Promise<{ result: IQuestionnaireBase }>;
    getQuestionnaireSurvey_3?: (params: { category: string | number }) => Promise<{ result: IQuestionnaireBase }>;
    submitQuestionnaire_3?: (params: ISubmitLoveFormParams) => Promise<unknown>;
    gsbmqnrecord?: (params: {
      patientName?: string;
      type: string;
      category: string;
      visitNo?: string;
    }) => Promise<{ result: { answerList?: string } }>;
  };
  /** 系统类型 */
  system: '2' | '3';
  /** 获取系统编码 */
  getSysCode: () => string;
  /** 用户 Store */
  userStore: {
    patChoose?: {
      patientId?: string;
      patientName?: string;
    };
  };
}

interface UseQuestionnaireReturn {
  /** 问卷基础信息 */
  questionnaireInfo: Ref<IQuestionnaireBase | null>;
  /** 表单列表 */
  formList: Ref<IFormListItem[]>;
  /** 图片URL列表 */
  imageUrls: Ref<string[]>;
  /** 前言内容 */
  preface: Ref<string>;
  /** 联系电话 */
  tel: Ref<string>;
  /** 加载状态 */
  loading: Ref<boolean>;
  /** 错误信息 */
  error: Ref<string | null>;
  
  // 方法
  /** 初始化问卷 */
  init: (category: string | number, configList?: (list: IFormListItem[]) => void) => Promise<IQuestionnaireBase | null>;
  /** 提交爱心表单 */
  submitLoveForm: (
    formData: { list: IFormListItem[]; res: FormData },
    options: Omit<ISubmitLoveFormParams, 'answerList' | 'source' | 'sysCode'>
  ) => Promise<ISubmitResult>;
  /** 检查是否已提交 */
  checkSubmitted: (category: string, patientName?: string) => Promise<ICheckSubmittedResult>;
  /** 预览图片 */
  previewImage: (current: number) => void;
}

// ==================== 辅助函数 ====================

/**
 * 判断是否为爱心表单类型
 */
const getLoveType = (category: string | number): LoveType | null => {
  return LOVE_TYPE_MAP[category] || null;
};

/**
 * 构建答案列表
 */
const buildAnswerList = (
  list: IFormListItem[],
  res: FormData
): ISubmitAnswerItem[] => {
  return list.map((item) => {
    const {
      label: question,
      id: qsId,
      qsSerial,
      subValue: unContent,
      contentShowType = '1',
    } = item;

    return {
      anContent: res[qsId],
      qsId,
      question,
      qsSerial,
      ...(contentShowType === '2' && { unContent }),
    };
  });
};

/**
 * 转换问卷列表（模拟原 translateFormList 功能）
 */
const translateFormList = (questions: IQuestionnaireBase['qnQuestionList']): IFormListItem[] => {
  return questions.map((q) => ({
    id: String(q.qsId),
    label: q.qsTitle,
    type: q.qsType as QuestionType,
    required: q.qsRequired === '1',
    placeholder: q.qsContent,
    rules: q.qsRule
      ? [{ pattern: new RegExp(q.qsRule), message: q.qsNote || '格式不正确' }]
      : undefined,
    options: q.answers?.map((a) => ({
      label: a.anContent,
      value: a.anSerial,
    })),
    isWrap: q.isWrap,
    qsSerial: q.qsSerial,
    qsId: q.qsId,
    limit: q.qsImgUpLoad,
  }));
};

// ==================== 主函数 ====================

/**
 * 问卷业务逻辑组合式函数
 */
export function useQuestionnaire(options: UseQuestionnaireOptions): UseQuestionnaireReturn {
  const { api, system, getSysCode, userStore } = options;

  // ==================== 响应式状态 ====================
  
  const questionnaireInfo = ref<IQuestionnaireBase | null>(null);
  const formList = ref<IFormListItem[]>([]);
  const imageUrls = ref<string[]>([]);
  const preface = ref('');
  const tel = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ==================== 核心方法 ====================

  /**
   * 渲染页面信息
   */
  const renderPageInfo = (result: IQuestionnaireBase): void => {
    const { qnTitle, preface: pf, tel: _tel, picUrl } = result;

    // 设置导航栏标题
    if (qnTitle) {
      uni.setNavigationBarTitle({ title: qnTitle });
    }

    // 设置图片列表
    if (picUrl) {
      imageUrls.value = picUrl.split(',').filter(Boolean);
    }

    // 设置前言
    if (pf) {
      preface.value = pf;
    }

    // 设置电话
    if (_tel) {
      tel.value = _tel;
    }
  };

  /**
   * 获取问卷数据
   */
  const fetchQuestionnaire = async (
    category: string | number,
    useMock: boolean,
    externalMockData?: IQuestionnaireBase
  ): Promise<IQuestionnaireBase> => {
    const loveType = getLoveType(category);

    // 1. 优先使用外部模拟数据
    if (externalMockData) {
      console.log('[useQuestionnaire] 使用外部模拟数据');
      return externalMockData;
    }

    // 2. 使用内置模拟数据
    if (useMock && loveType) {
      console.log(`[useQuestionnaire] 使用${loveType === 'donate' ? '爱心捐赠' : '爱心领取'}内置模拟数据`);
      return getMockDataByType(loveType);
    }

    // 3. 调用接口
    const apiMethod = system === '2' 
      ? api.getQuestionnaireSurvey 
      : api.getQuestionnaireSurvey_3;
    
    if (!apiMethod) {
      throw new Error(`API 方法未实现: system=${system}`);
    }

    const response = await apiMethod({ category });
    return response.result;
  };

  /**
   * 初始化问卷
   */
  const init = async (
    category: string | number,
    configList?: (list: IFormListItem[]) => void
  ): Promise<IQuestionnaireBase | null> => {
    loading.value = true;
    error.value = null;

    try {
      // TODO: 从外部传入 useMock 和 mockData
      const result = await fetchQuestionnaire(category, false, undefined);
      questionnaireInfo.value = result;

      // 处理问卷列表
      const list = translateFormList(result.qnQuestionList);
      
      // 自定义配置回调
      configList?.(list);
      
      formList.value = list;
      renderPageInfo(result);

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载问卷失败';
      error.value = errorMsg;
      console.error('[useQuestionnaire] 初始化失败:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 提交爱心表单
   */
  const submitLoveForm = async (
    formData: { list: IFormListItem[]; res: FormData },
    params: Omit<ISubmitLoveFormParams, 'answerList' | 'source' | 'sysCode'>
  ): Promise<ISubmitResult> => {
    const { list, res } = formData;
    const { category, patientId, hosId, hosName, deptId, deptName } = params;

    try {
      const answerList = buildAnswerList(list, res);
      const sysCode = getSysCode();
      const storePatientId = userStore.patChoose?.patientId;
      const loveType = getLoveType(category);

      if (!loveType) {
        throw new Error('无效的爱心表单类型');
      }

      const requestParams: ISubmitLoveFormParams = {
        answerList,
        patientId: patientId || storePatientId,
        source: loveType === 'donate' ? LOVE_SOURCE_CODE.DONATE : LOVE_SOURCE_CODE.RECEIVE,
        category,
        sysCode,
        hosId,
        hosName,
        deptId,
        deptName,
      };

      await api.submitQuestionnaire_3?.(requestParams);

      const message = loveType === 'donate' 
        ? LOVE_MESSAGES.DONATE_SUCCESS 
        : LOVE_MESSAGES.RECEIVE_SUCCESS;

      return { success: true, message };
    } catch (err) {
      console.error('[useQuestionnaire] 提交失败:', err);
      throw err;
    }
  };

  /**
   * 检查是否已提交
   */
  const checkSubmitted = async (
    category: string,
    patientName?: string
  ): Promise<ICheckSubmittedResult> => {
    try {
      const response = await api.gsbmqnrecord?.({
        patientName: patientName || userStore.patChoose?.patientName,
        type: '3',
        category,
      });

      const answerList = response?.result?.answerList;

      if (answerList) {
        const loveType = getLoveType(category);
        const message = loveType === 'donate'
          ? LOVE_MESSAGES.DONATE_DUPLICATE
          : LOVE_MESSAGES.RECEIVE_DUPLICATE;
        return { submitted: true, message };
      }

      return { submitted: false };
    } catch (err) {
      console.error('[useQuestionnaire] 检查提交记录失败:', err);
      return { submitted: false };
    }
  };

  /**
   * 预览图片
   */
  const previewImage = (current: number): void => {
    if (imageUrls.value.length === 0) return;
    
    uni.previewImage({
      current,
      urls: imageUrls.value,
    });
  };

  return {
    // 状态
    questionnaireInfo,
    formList,
    imageUrls,
    preface,
    tel,
    loading,
    error,
    
    // 方法
    init,
    submitLoveForm,
    checkSubmitted,
    previewImage,
  };
}
