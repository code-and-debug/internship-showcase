/**
 * DRG医保结算与病案管理模块 - 常量定义
 */

import type { ICopyContentOption } from '../types';

// ==================== CC/MCC 配置常量 ====================

/**
 * CC/MCC权重范围配置
 * - MCC（主要并发症/合并症）：权重加成 0.4-0.8
 * - CC（并发症/合并症）：权重加成 0.2-0.4
 */
export const CC_MCC_CONSTANTS = {
  MCC_WEIGHT_RANGE: [0.4, 0.8] as const,
  CC_WEIGHT_RANGE: [0.2, 0.4] as const,
  // 常见MCC（主要并发症/合并症）编码
  COMMON_MCC_CODES: ['I10', 'E11', 'I25', 'J44', 'I50', 'N18'],
  // 常见CC（并发症/合并症）编码 - 注意：某些编码可能同时出现在MCC和CC中，表示严重程度不同
  COMMON_CC_CODES: ['E78', 'K29', 'I48', 'J45', 'M79'],
} as const;

// ==================== DRG 费用阈值 ====================

/**
 * DRG费用消耗率阈值
 * - 低倍率病例：<= 50%
 * - 普通病例：50% - 200%
 * - 高倍率病例：>= 200%
 */
export const DRG_COST_THRESHOLDS = {
  LOW_RATE: 0.5,      // 低倍率阈值
  HIGH_RATE: 2.0,     // 高倍率阈值
  WARNING: 0.8,       // 预警阈值（80%）
  DANGER: 1.0,        // 危险阈值（100%）
} as const;

// ==================== 飞检风险评分 ====================

/**
 * 飞检风险评分配置
 */
export const FLYCHECK_RISK_SCORES = {
  HIGH_RATE_CASE: 40,        // 高倍率病例
  DIAGNOSIS_MISMATCH: 25,    // 诊断不匹配
  EXCESSIVE_DRUG_USE: 15,    // 药品使用异常
  REPEATED_EXAM: 10,         // 重复检查
  LACK_DOCUMENTATION: 10,    // 诊断依据不足
} as const;

/**
 * 飞检风险等级阈值
 */
export const FLYCHECK_RISK_LEVELS = {
  HIGH: 60,      // 高风险阈值
  MEDIUM: 30,    // 中风险阈值
} as const;

// ==================== 病例类型配置 ====================

/**
 * 病例类型配置
 */
export const CASE_TYPE_CONFIG = {
  normal: {
    label: '普通病例',
    color: '#52c41a',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
    icon: 'check-circle',
    description: '费用消耗在正常范围内',
  },
  high: {
    label: '高倍率病例',
    color: '#ff4d4f',
    bgColor: '#fff2f0',
    borderColor: '#ffccc7',
    icon: 'warning-circle',
    description: '费用超过DRG支付标准200%，属于飞检重点审查对象',
  },
  low: {
    label: '低倍率病例',
    color: '#1890ff',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff',
    icon: 'info-circle',
    description: '费用低于DRG支付标准50%，医院可获得更多结余',
  },
} as const;

// ==================== 预警等级配置 ====================

/**
 * 预警等级配置
 */
export const WARNING_LEVEL_CONFIG = {
  safe: {
    label: '安全',
    color: '#52c41a',
    bgColor: '#f6ffed',
    progressColor: '#52c41a',
    description: '费用消耗正常，医院可获得结余',
  },
  warning: {
    label: '警告',
    color: '#faad14',
    bgColor: '#fffbe6',
    progressColor: '#faad14',
    description: '费用消耗接近支付标准，建议关注费用结构',
  },
  danger: {
    label: '危险',
    color: '#ff4d4f',
    bgColor: '#fff2f0',
    progressColor: '#ff4d4f',
    description: '已超支，医院面临DRG亏损，建议调整诊疗方案或申请特病单议',
  },
} as const;

// ==================== 风险等级配置 ====================

/**
 * 风险等级配置
 */
export const RISK_LEVEL_CONFIG = {
  low: {
    label: '低风险',
    color: '#52c41a',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
    icon: 'shield-check',
  },
  medium: {
    label: '中风险',
    color: '#faad14',
    bgColor: '#fffbe6',
    borderColor: '#ffe58f',
    icon: 'shield-exclamation',
  },
  high: {
    label: '高风险',
    color: '#ff4d4f',
    bgColor: '#fff2f0',
    borderColor: '#ffccc7',
    icon: 'shield-alert',
  },
} as const;

// ==================== 费用类别配置 ====================

/**
 * 费用类别配置
 */
export const COST_CATEGORY_CONFIG = {
  drug: {
    label: '药品费',
    color: '#722ed1',
    icon: 'medicine',
    description: '西药、中成药、中草药等',
  },
  exam: {
    label: '检查费',
    color: '#13c2c2',
    icon: 'scan',
    description: 'CT、MRI、B超、化验等',
  },
  surgery: {
    label: '手术费',
    color: '#eb2f96',
    icon: 'scissors',
    description: '手术操作费用',
  },
  treatment: {
    label: '治疗费',
    color: '#1890ff',
    icon: 'tool',
    description: '治疗操作费用',
  },
  material: {
    label: '材料费',
    color: '#fa8c16',
    icon: 'box',
    description: '医用材料费用',
  },
  other: {
    label: '其他',
    color: '#8c8c8c',
    icon: 'more',
    description: '其他费用',
  },
} as const;

// ==================== 病案复印配置 ====================

/**
 * 复印状态配置
 */
export const COPY_STATUS_CONFIG = {
  pending: {
    label: '待处理',
    color: '#8c8c8c',
    bgColor: '#f5f5f5',
    icon: 'clock',
    description: '申请已提交，等待医院受理',
  },
  processing: {
    label: '处理中',
    color: '#1890ff',
    bgColor: '#e6f7ff',
    icon: 'loading',
    description: '医院正在复印病案',
  },
  completed: {
    label: '已完成',
    color: '#52c41a',
    bgColor: '#f6ffed',
    icon: 'check',
    description: '病案复印完成，准备寄出',
  },
  shipped: {
    label: '已寄出',
    color: '#722ed1',
    bgColor: '#f9f0ff',
    icon: 'car',
    description: '病案已通过快递寄出',
  },
} as const;

/**
 * 复印内容选项
 */
export const COPY_CONTENT_OPTIONS: ICopyContentOption[] = [
  { value: 'homepage', label: '病案首页', description: '病案基本信息汇总', price: 1, category: 'basic' },
  { value: 'admission', label: '入院记录', description: '入院时病情记录', price: 1, category: 'basic' },
  { value: 'discharge', label: '出院小结', description: '出院时病情总结', price: 1, category: 'basic' },
  { value: 'progress', label: '病程记录', description: '住院期间病情变化', price: 2, category: 'clinical' },
  { value: 'operation', label: '手术记录', description: '手术详细记录', price: 2, category: 'clinical' },
  { value: 'pathology', label: '病理报告', description: '病理检查结果', price: 2, category: 'exam' },
  { value: 'exam', label: '检查报告', description: '影像、化验等报告', price: 2, category: 'exam' },
  { value: 'temp', label: '体温单', description: '体温测量记录', price: 1, category: 'clinical' },
  { value: 'order', label: '医嘱单', description: '医生医嘱记录', price: 1, category: 'clinical' },
  { value: 'consent', label: '知情同意书', description: '手术/治疗同意书', price: 1, category: 'other' },
];

/**
 * 复印类型配置
 */
export const COPY_TYPE_CONFIG = {
  inpatient: {
    label: '住院病案',
    icon: 'hospital',
    description: '住院期间完整病案资料',
  },
  outpatient: {
    label: '门诊病历',
    icon: 'outpatient',
    description: '门诊就诊病历资料',
  },
} as const;

// ==================== 特病单议配置 ====================

/**
 * 特病单议状态配置
 */
export const SPECIAL_CASE_STATUS_CONFIG = {
  draft: {
    label: '草稿',
    color: '#8c8c8c',
    icon: 'edit',
  },
  submitted: {
    label: '已提交',
    color: '#1890ff',
    icon: 'send',
  },
  under_review: {
    label: '审核中',
    color: '#faad14',
    icon: 'audit',
  },
  approved: {
    label: '已通过',
    color: '#52c41a',
    icon: 'check-circle',
  },
  rejected: {
    label: '已驳回',
    color: '#ff4d4f',
    icon: 'close-circle',
  },
} as const;

/**
 * 超额原因类型配置
 */
export const EXCESS_REASON_TYPE_CONFIG = {
  complication: {
    label: '严重并发症',
    description: '患者出现严重并发症，需要额外治疗',
  },
  severity: {
    label: '病情严重',
    description: '患者病情严重程度超出预期',
  },
  comorbidity: {
    label: '合并症复杂',
    description: '患者合并多种疾病，治疗复杂',
  },
  other: {
    label: '其他原因',
    description: '其他特殊原因',
  },
} as const;

// ==================== CMI 配置 ====================

/**
 * CMI基准值
 */
export const CMI_BENCHMARKS = {
  NATIONAL_AVG: 1.0,     // 全国平均CMI
  HOSPITAL_AVG: 1.0,     // 医院平均CMI（动态获取）
  POSITIVE_THRESHOLD: 0.2,  // 正向影响阈值
  NEGATIVE_THRESHOLD: -0.2, // 负向影响阈值
} as const;

// ==================== 分享配置 ====================

/**
 * 分享类型配置
 */
export const SHARE_TYPE_CONFIG = {
  family: {
    label: '家庭成员',
    icon: 'team',
    description: '分享给家人查看',
    defaultMaskFields: [],
  },
  doctor: {
    label: '医生',
    icon: 'doctor',
    description: '分享给主治医生',
    defaultMaskFields: ['idCard'],
  },
  insurance: {
    label: '保险公司',
    icon: 'insurance',
    description: '分享给保险公司理赔',
    defaultMaskFields: ['phone'],
  },
  other: {
    label: '其他',
    icon: 'link',
    description: '其他用途',
    defaultMaskFields: ['idCard', 'phone'],
  },
} as const;

/**
 * 默认脱敏字段
 */
export const DEFAULT_MASK_FIELDS = {
  idCard: 'idCard',
  phone: 'phone',
  address: 'address',
} as const;

// ==================== 医保配置 ====================

/**
 * 默认医保参数
 */
export const DEFAULT_INSURANCE_PARAMS = {
  DEDUCTIBLE: 800,           // 起付线（元）
  REIMBURSEMENT_RATE: 0.8,   // 报销比例（80%）
  PERSONAL_CAP: 400000,      // 年度封顶线（40万）
  CLASS_B_RATE: 0.1,         // 乙类自付比例（10%）
} as const;

// ==================== 页面配置 ====================

/**
 * 页面标题配置
 */
export const PAGE_TITLES = {
  SETTLEMENT_LIST: '医保结算清单',
  SETTLEMENT_DETAIL: '结算详情',
  COST_ANALYSIS: '费用分析',
  SPECIAL_CASE_APPLY: '特病单议申请',
  MEDICAL_COPY_LIST: '病案复印',
  MEDICAL_COPY_APPLY: '申请病案复印',
  MEDICAL_COPY_PROGRESS: '复印进度',
} as const;

// ==================== 提示消息 ====================

/**
 * 提示消息配置
 */
export const MESSAGES = {
  LOAD_ERROR: '数据加载失败，请稍后重试',
  SAVE_SUCCESS: '保存成功',
  SAVE_ERROR: '保存失败',
  SUBMIT_SUCCESS: '提交成功',
  SUBMIT_ERROR: '提交失败',
  DELETE_CONFIRM: '确定要删除吗？',
  NETWORK_ERROR: '网络连接失败',
  SESSION_EXPIRED: '登录已过期，请重新登录',
} as const;
