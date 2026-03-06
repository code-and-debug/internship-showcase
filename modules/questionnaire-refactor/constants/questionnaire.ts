/**
 * 问卷/表单系统常量定义
 * @description 所有硬编码的常量集中管理，便于维护和国际化
 */

import type { IQuestionnaireBase, LoveType } from '../types/questionnaire';

// ==================== 爱心表单相关常量 ====================

/** 爱心表单分类映射 */
export const LOVE_TYPE_MAP: Record<string | number, LoveType> = {
  77: 'donate',
  '77': 'donate',
  76: 'receive',
  '76': 'receive',
};

/** 爱心表单来源码 */
export const LOVE_SOURCE_CODE = {
  /** 爱心捐赠 */
  DONATE: '30',
  /** 爱心领取 */
  RECEIVE: '31',
} as const;

/** 爱心表单提示信息 */
export const LOVE_MESSAGES = {
  DONATE_SUCCESS: '提交成功，感谢您的爱心捐赠！',
  RECEIVE_SUCCESS: '提交成功，我们会尽快处理您的申请！',
  DONATE_DUPLICATE: '您已经提交过爱心捐赠申请，不可重复提交',
  RECEIVE_DUPLICATE: '您已经提交过爱心领取申请，不可重复提交',
} as const;

// ==================== 模拟数据 ====================

/** 爱心捐赠模拟数据 */
export const MOCK_DONATE_DATA: IQuestionnaireBase = {
  sysCode: '1001067',
  qnCategory: 77,
  preface: '感谢您的爱心捐赠！请将闲置的医疗器具捐赠给有需要的人，让爱心传递。',
  qnTitle: '爱心捐赠',
  qnId: 10001,
  qnDescribe: '',
  qnQuestionList: [
    {
      qsId: 1000,
      qsSerial: 1,
      qsTitle: '患者姓名',
      qsType: 0,
      qsRequired: '1',
      qsContent: '请输入患者姓名',
      qsRule: '',
      qsNote: '',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'text', anType: 0 }],
    },
    {
      qsId: 1007,
      qsSerial: 2,
      qsTitle: '身份证号码',
      qsType: 0,
      qsRequired: '1',
      qsContent: '请输入身份证号码',
      qsRule: '(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)',
      qsNote: '请输入正确的身份证号码',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'idcard', anType: 0 }],
    },
    {
      qsId: 2,
      qsSerial: 3,
      qsTitle: '联系方式',
      qsType: 0,
      qsRequired: '1',
      qsContent: '请输入手机号',
      qsRule: '^1[3-9]\\d{9}$',
      qsNote: '请输入正确的手机号',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'tel', anType: 0 }],
    },
    {
      qsId: 4,
      qsSerial: 4,
      qsTitle: '器具名称',
      qsType: 0,
      qsRequired: '1',
      qsContent: '请输入捐赠的器具名称（如：轮椅、拐杖、血压计等）',
      qsRule: '',
      qsNote: '',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'text', anType: 0 }],
    },
    {
      qsId: 5,
      qsSerial: 5,
      qsTitle: '器具图片',
      qsType: 6,
      qsRequired: '1',
      qsContent: '请上传器具图片（最多9张，请拍摄清晰照片）',
      qsImgUpLoad: 9,
      isWrap: true,
      answers: [],
    },
    {
      qsId: 6,
      qsSerial: 6,
      qsTitle: '快递单号',
      qsType: 0,
      qsRequired: '0',
      qsContent: '请输入快递单号（如已邮寄，选填）',
      qsRule: '',
      qsNote: '',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'text', anType: 0 }],
    },
    {
      qsId: 7,
      qsSerial: 7,
      qsTitle: '捐赠说明',
      qsType: 8,
      qsRequired: '0',
      qsContent: '请描述器具的使用情况、购买时间等信息（选填）',
      qsRule: '',
      qsNote: '',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'textarea', anType: 0 }],
    },
  ],
};

/** 爱心领取模拟数据 */
export const MOCK_RECEIVE_DATA: IQuestionnaireBase = {
  sysCode: '1001067',
  qnCategory: 76,
  preface: '欢迎申请爱心领取！请填写您的需求信息，我们会尽快审核并与您联系。',
  qnTitle: '爱心领取',
  qnId: 10002,
  qnDescribe: '',
  qnQuestionList: [
    {
      qsId: 1000,
      qsSerial: 1,
      qsTitle: '患者姓名',
      qsType: 0,
      qsRequired: '1',
      qsContent: '请输入患者姓名',
      qsRule: '',
      qsNote: '',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'text', anType: 0 }],
    },
    {
      qsId: 1007,
      qsSerial: 2,
      qsTitle: '身份证号码',
      qsType: 0,
      qsRequired: '1',
      qsContent: '请输入身份证号码',
      qsRule: '(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)',
      qsNote: '请输入正确的身份证号码',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'idcard', anType: 0 }],
    },
    {
      qsId: 2,
      qsSerial: 3,
      qsTitle: '联系方式',
      qsType: 0,
      qsRequired: '1',
      qsContent: '请输入手机号',
      qsRule: '^1[3-9]\\d{9}$',
      qsNote: '请输入正确的手机号',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'tel', anType: 0 }],
    },
    {
      qsId: 4,
      qsSerial: 4,
      qsTitle: '患者症状',
      qsType: 8,
      qsRequired: '1',
      qsContent: '请详细描述您的症状、病情和需要的医疗器具',
      qsRule: '',
      qsNote: '',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'textarea', anType: 0 }],
    },
    {
      qsId: 5,
      qsSerial: 5,
      qsTitle: '所需器具',
      qsType: 0,
      qsRequired: '1',
      qsContent: '请输入您需要的器具名称（如：轮椅、拐杖、血压计等）',
      qsRule: '',
      qsNote: '',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'text', anType: 0 }],
    },
    {
      qsId: 6,
      qsSerial: 6,
      qsTitle: '附件',
      qsType: 6,
      qsRequired: '0',
      qsContent: '请上传相关证明材料（病历、诊断证明等，最多9张）',
      qsImgUpLoad: 9,
      isWrap: true,
      answers: [],
    },
    {
      qsId: 7,
      qsSerial: 7,
      qsTitle: '备注',
      qsType: 8,
      qsRequired: '0',
      qsContent: '其他需要说明的情况（选填）',
      qsRule: '',
      qsNote: '',
      isWrap: true,
      answers: [{ anSerial: 1, anContent: '', inputType: 'textarea', anType: 0 }],
    },
  ],
};

/** 获取模拟数据 */
export const getMockDataByType = (type: LoveType): IQuestionnaireBase => {
  return type === 'donate' 
    ? MOCK_DONATE_DATA 
    : MOCK_RECEIVE_DATA;
};

// ==================== 默认配置 ====================

/** 默认 Props 配置 */
export const DEFAULT_PROPS = {
  /** 默认表单展示类型 */
  ANSWER_TYPE: 'normal' as const,
  /** 默认加载状态 */
  LOADING: false,
  /** 默认系统类型 */
  SYSTEM: '2' as const,
  /** 默认图片高度（rpx） */
  IMG_HEIGHT: 208,
  /** 默认是否换行 */
  IS_WRAP: true,
} as const;

/** 轮播配置 */
export const SWIPER_CONFIG = {
  /** 自动播放间隔（毫秒） */
  INTERVAL: 3000,
  /** 切换动画时长（毫秒） */
  DURATION: 400,
  /** 是否循环 */
  CIRCULAR: true,
  /** 是否显示指示点 */
  INDICATOR_DOTS: false,
} as const;

// ==================== 验证规则 ====================

/** 常用正则表达式 */
export const REGEX_PATTERNS = {
  /** 手机号 */
  PHONE: /^1[3-9]\d{9}$/,
  /** 身份证号（15位或18位） */
  ID_CARD: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  /** 邮箱 */
  EMAIL: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
} as const;

// ==================== 字段映射 ====================

/** 页面参数到问题ID的映射 */
export const FIELD_TO_QUESTION_MAP: Record<string, number> = {
  patientName: 1000,
  hosName: 1001,
  deptName: 1002,
  docName: 1003,
  visitDate: 1004,
  patientAge: 1005,
  patientSex: 1006,
} as const;

/** 特殊系统编码 */
export const SPECIAL_SYSTEM_CODES = {
  /** 山南人民医院 - 不换行 */
  SHANNAN_NO_WRAP: ['1001058'],
  /** 东部战区 */
  EASTERN_WAR_ZONE: '1001036',
  /** 西部战区 */
  WESTERN_WAR_ZONE: '1001048',
} as const;

/** 问卷分类 */
export const QUESTIONNAIRE_CATEGORY = {
  /** 住院 */
  INPATIENT: '17',
  /** 门诊 */
  OUTPATIENT: '16',
  /** 爱心捐赠 */
  LOVE_DONATE: '77',
  /** 爱心领取 */
  LOVE_RECEIVE: '76',
} as const;
