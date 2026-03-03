/**
 * 问卷/表单系统类型定义
 * @description 统一的类型定义，遵循 TypeScript 严格模式
 */

// ==================== 基础类型 ====================

/** 问卷问题类型 */
export enum QuestionType {
  /** 单选 */
  RADIO = 0,
  /** 多选 */
  CHECKBOX = 1,
  /** 文本输入 */
  TEXT = 2,
  /** 文本域 */
  TEXTAREA = 8,
  /** 图片上传 */
  IMAGE = 6,
}

/** 答案类型 */
export enum AnswerType {
  /** 普通表单 */
  NORMAL = 'normal',
  /** 列表表单 */
  LIST = 'list',
}

/** 爱心表单类型 */
export enum LoveType {
  /** 爱心捐赠 */
  DONATE = 'donate',
  /** 爱心领取 */
  RECEIVE = 'receive',
}

/** 系统类型 */
export enum SystemType {
  /** 系统2 */
  V2 = '2',
  /** 系统3 */
  V3 = '3',
}

/** 内容展示类型 */
export enum ContentShowType {
  /** 默认 */
  DEFAULT = '1',
  /** 排除子值 */
  EXCLUDE_SUB = '2',
}

// ==================== 数据结构类型 ====================

/** 单个答案选项 */
export interface IAnswer {
  /** 答案序号 */
  anSerial: number;
  /** 答案内容 */
  anContent: string;
  /** 输入类型 */
  inputType?: string;
  /** 答案类型 */
  anType: number;
  /** 答案值 */
  anValue?: string;
  /** 文件路径（用于图片上传） */
  path?: string;
}

/** 单个问题 */
export interface IQuestion {
  /** 问题ID */
  qsId: number;
  /** 问题序号 */
  qsSerial: number;
  /** 问题标题 */
  qsTitle: string;
  /** 问题类型 */
  qsType: QuestionType;
  /** 是否必填 */
  qsRequired: string;
  /** 问题描述/提示 */
  qsContent: string;
  /** 验证规则（正则表达式） */
  qsRule?: string;
  /** 验证失败提示 */
  qsNote?: string;
  /** 是否换行 */
  isWrap?: boolean;
  /** 是否显示 */
  isShow?: boolean;
  /** 图片上传限制数量 */
  qsImgUpLoad?: number;
  /** 默认答案 */
  defaultAnswer?: IAnswer[];
  /** 答案列表 */
  answers: IAnswer[];
  /** 表单属性 */
  qsFormAttribute?: string;
  /** 需要显示的问题列表（联动逻辑） */
  qsNeedShowList?: Array<{
    needShowQsId: string;
    showRule: string;
  }>;
}

/** 问卷基础信息 */
export interface IQuestionnaireBase {
  /** 系统编码 */
  sysCode: string;
  /** 问卷分类 */
  qnCategory: number;
  /** 前言 */
  preface?: string;
  /** 问卷标题 */
  qnTitle?: string;
  /** 问卷ID */
  qnId: number;
  /** 问卷描述 */
  qnDescribe?: string;
  /** 联系电话 */
  tel?: string;
  /** 图片URL（逗号分隔） */
  picUrl?: string;
  /** 问题列表 */
  qnQuestionList: IQuestion[];
}

/** 转换后的表单列表项 */
export interface IFormListItem {
  /** 字段ID */
  id: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: QuestionType;
  /** 是否必填 */
  required: boolean;
  /** 提示信息 */
  placeholder?: string;
  /** 验证规则 */
  rules?: Array<{
    pattern: RegExp;
    message: string;
  }>;
  /** 选项列表 */
  options?: Array<{
    label: string;
    value: string | number;
  }>;
  /** 是否换行 */
  isWrap?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 子输入框相关 */
  isOpenSubInput?: boolean;
  /** 子值 */
  subValue?: string;
  /** 内容展示类型 */
  contentShowType?: ContentShowType;
  /** 原始问题ID */
  qsSerial?: number;
  /** 原始序号 */
  qsId?: number;
  /** 图片上传限制 */
  limit?: number;
}

/** 表单数据 */
export type FormData = Record<string, unknown>;

// ==================== API 相关类型 ====================

/** 提交答案项 */
export interface ISubmitAnswerItem {
  /** 答案内容 */
  anContent: unknown;
  /** 问题ID */
  qsId: string;
  /** 问题标题 */
  question: string;
  /** 问题序号 */
  qsSerial?: number;
  /** 未选择内容（用于排除逻辑） */
  unContent?: string;
}

/** 爱心表单提交参数 */
export interface ISubmitLoveFormParams {
  /** 答案列表 */
  answerList: ISubmitAnswerItem[];
  /** 患者ID */
  patientId?: string;
  /** 数据来源 */
  source: string;
  /** 分类 */
  category: string;
  /** 系统编码 */
  sysCode: string;
  /** 医院ID */
  hosId?: string;
  /** 医院名称 */
  hosName?: string;
  /** 科室ID */
  deptId?: string;
  /** 科室名称 */
  deptName?: string;
}

/** 检查提交记录结果 */
export interface ICheckSubmittedResult {
  submitted: boolean;
  message?: string;
}

/** 提交结果 */
export interface ISubmitResult {
  success: boolean;
  message: string;
}

// ==================== 组件 Props 类型 ====================

/** FormBox 组件 Props */
export interface IFormBoxProps {
  /** 表单数据（v-model） */
  modelValue: FormData;
  /** 加载状态 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 系统类型 */
  system: SystemType;
  /** 表单展示类型 */
  answerType?: AnswerType;
  /** 图片轮播高度（rpx） */
  imgHeight?: number;
  /** 是否换行 */
  isWrap?: boolean;
  /** 外部模拟数据 */
  mockData?: IQuestionnaireBase;
  /** 是否使用内置模拟数据 */
  useMock?: boolean;
}

/** QuestionnairePage 页面 Props */
export interface IQuestionnairePageProps {
  /** 问卷分类 */
  category: string;
  /** 就诊号 */
  visitNo: string;
  /** 表单展示类型 */
  answerType?: AnswerType;
  /** 是否换行 */
  isWrap?: boolean;
  /** 数据来源 */
  source?: string;
  /** 是否使用模拟数据 */
  mock?: string;
  /** 科室名称 */
  deptName?: string;
  /** 医生名称 */
  docName?: string;
  /** 医院名称 */
  hosName?: string;
  /** 患者姓名 */
  patientName?: string;
  /** 就诊日期 */
  visitDate?: string;
  /** 卡号 */
  cardNumber?: string;
  /** 患者年龄 */
  patientAge?: string;
  /** 患者性别 */
  patientSex?: string;
  /** 出院时间 */
  outTime?: string;
  /** 入院时间 */
  visitTime?: string;
  /** 类型标签 */
  typeLabel?: string;
  /** 病房 */
  hospitalWard?: string;
  /** 动态字段 */
  [key: `q-${string}`]: unknown;
}

// ==================== 事件类型 ====================

/** 表单提交事件数据 */
export interface IFormSubmitEvent {
  /** 表单列表 */
  list: IFormListItem[];
  /** 原始响应数据 */
  res: FormData;
  /** 处理后的表单数据 */
  data: Record<string, string>;
}

/** 获取问题列表事件 */
export type GetQuestionEvent = IFormListItem[];

// ==================== 业务常量类型 ====================

/** 系统编码常量 */
export enum SystemCode {
  /** 东部战区 */
  EASTERN_WAR_ZONE = '1001036',
  /** 西部战区 */
  WESTERN_WAR_ZONE = '1001048',
  /** 山南人民医院 */
  SHANNAN_PEOPLE_HOSPITAL = '1001058',
  /** 爱心捐赠/领取 */
  LOVE_DONATION = '1001067',
}

/** 问卷分类常量 */
export enum QuestionnaireCategory {
  /** 爱心捐赠 */
  LOVE_DONATE = '77',
  /** 爱心领取 */
  LOVE_RECEIVE = '76',
  /** 门诊问卷 */
  OUTPATIENT = '16',
  /** 住院问卷 */
  INPATIENT = '17',
}

/** 字段映射键 */
export type FieldMappingKey = 
  | 'patientName' 
  | 'hosName' 
  | 'deptName' 
  | 'docName' 
  | 'visitDate' 
  | 'patientAge' 
  | 'patientSex';
