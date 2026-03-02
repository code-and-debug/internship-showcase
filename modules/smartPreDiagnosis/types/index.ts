/**
 * ============================================================================
 * 智能预问诊模块 - 类型定义文件
 * ============================================================================
 * 
 * 本文件集中定义了智能预问诊模块涉及的所有 TypeScript 类型，包括：
 * - 身体部位和症状数据结构
 * - AI评估请求和响应结构
 * - 科室和疾病推荐结构
 * - 组件 Props 类型
 * - API 请求/响应类型
 * 
 * 使用场景：
 * 当需要了解某个数据结构的字段含义时，查看此文件
 * 当需要为变量/参数添加类型时，从此文件导入对应类型
 * ============================================================================
 */

// ============================================
// 身体部位与症状相关类型
// ============================================

/**
 * 身体部位
 * 
 * 使用场景：
 * - 人体部位选择页面展示部位列表
 * - 用户选择不适部位时使用
 * 
 * 业务流程关联：
 * 1. 页面加载时调用 API 获取部位列表
 * 2. 用户点击部位，调用 store.toggleBodyPart()
 * 3. 选中部位后加载关联症状
 */
export interface IBodyPart {
  /** 部位唯一标识 */
  id: string;
  /** 部位名称 */
  name: string;
  /** 部位图标（可选） */
  icon?: string;
  /** 子部位列表（可选，用于级联选择） */
  children?: IBodyPart[];
  /** 关联的症状列表（可选） */
  symptoms?: ISymptom[];
}

/**
 * 症状
 * 
 * 使用场景：
 * - 症状选择页面展示症状列表
 * - 用户选择症状时使用
 * 
 * 业务流程关联：
 * 1. 用户选择部位后，加载关联症状
 * 2. 用户点击症状，调用 store.addSymptom()
 * 3. 提交评估时传递选中的症状列表
 */
export interface ISymptom {
  /** 症状唯一标识 */
  id: string;
  /** 症状名称 */
  name: string;
  /** 症状分类（如：头部、胸部、消化系统等） */
  category: string;
  /** 严重程度（可选） */
  severity?: 'mild' | 'moderate' | 'severe';
  /** 持续时间（可选） */
  duration?: string;
  /** 补充描述（可选） */
  description?: string;
}

// ============================================
// AI评估相关类型
// ============================================

/**
 * AI评估请求
 * 
 * 使用场景：
 * - 用户提交症状评估时传递的数据
 * - 调用 submitAssessment API 时使用
 * 
 * 业务流程关联：
 * 1. 用户完成症状选择后
 * 2. 收集选中的部位、症状、补充描述
 * 3. 构建 IAssessmentRequest 对象
 * 4. 调用 API 提交评估
 */
export interface IAssessmentRequest {
  /** 患者ID */
  patientId: string;
  /** 选择的部位ID列表 */
  bodyParts: string[];
  /** 症状列表 */
  symptoms: ISymptom[];
  /** 补充描述（可选） */
  description?: string;
  /** 语音转文字内容（可选） */
  voiceText?: string;
}

/**
 * AI评估结果
 * 
 * 使用场景：
 * - 评估结果页面展示数据
 * - 存储评估结果时使用
 * 
 * 业务流程关联：
 * 1. 调用 submitAssessment API 后返回
 * 2. 存入 store.assessmentResult
 * 3. 评估结果页面读取并展示
 * 4. 可保存到历史记录
 */
export interface IAssessmentResult {
  /** 评估记录ID */
  id: string;
  /** 推荐的疾病列表 */
  diseases: IDiseaseRecommend[];
  /** 严重程度 */
  severity: 'normal' | 'urgent' | 'emergency';
  /** 健康建议列表 */
  suggestions: string[];
  /** 推荐科室列表 */
  recommendedDepts: IDeptRecommend[];
  /** 评估时间 */
  createTime: string;
}

/**
 * 推荐的疾病
 * 
 * 使用场景：
 * - 评估结果中展示可能疾病
 * - 按概率排序显示
 * 
 * 业务流程关联：
 * 1. AI根据症状分析可能疾病
 * 2. 返回匹配的疾病列表（按概率排序）
 * 3. 展示时显示名称和概率
 */
export interface IDiseaseRecommend {
  /** 疾病名称 */
  name: string;
  /** 匹配概率（0-1） */
  probability: number;
  /** 疾病描述 */
  description: string;
  /** 标签列表（如：常见、严重、慢性等） */
  tags: string[];
}

/**
 * 推荐的科室
 * 
 * 使用场景：
 * - 评估结果中展示推荐科室
 * - 用户点击可跳转挂号
 * 
 * 业务流程关联：
 * 1. AI根据症状分析推荐科室
 * 2. 返回科室列表（带紧急程度）
 * 3. 展示科室名称、推荐原因、紧急程度
 */
export interface IDeptRecommend {
  /** 科室ID */
  deptId: string;
  /** 科室名称 */
  deptName: string;
  /** 推荐原因 */
  reason: string;
  /** 紧急程度 */
  urgency: 'normal' | 'urgent';
}

// ============================================
// 历史记录相关类型
// ============================================

/**
 * 预问诊记录
 * 
 * 使用场景：
 * - 历史记录列表页展示
 * - 查看历史评估详情
 * 
 * 业务流程关联：
 * 1. 用户每次评估完成后保存记录
 * 2. 调用 getAssessmentHistory 获取历史列表
 * 3. 点击记录查看详情
 */
export interface IPreDiagnosisRecord {
  /** 记录ID */
  id: string;
  /** 患者ID */
  patientId: string;
  /** 评估结果 */
  result: IAssessmentResult;
  /** 创建时间 */
  createTime: string;
}

// ============================================
// 组件 Props 类型
// ============================================

/**
 * 症状选择项（用于组件）
 * 
 * 使用场景：
 * - 症状列表渲染
 * - 选择器组件
 */
export interface ISymptomOption {
  /** 症状ID */
  id: string;
  /** 症状名称 */
  name: string;
  /** 症状分类 */
  category: string;
  /** 是否选中 */
  selected: boolean;
}

// ============================================
// 类型别名
// ============================================

/**
 * 严重程度级别
 */
export type SeverityLevel = 'mild' | 'moderate' | 'severe';

/**
 * 紧急程度级别
 */
export type UrgencyLevel = 'normal' | 'urgent' | 'emergency';

/**
 * 评估严重程度（结果用）
 */
export type AssessmentSeverity = 'normal' | 'urgent' | 'emergency';
