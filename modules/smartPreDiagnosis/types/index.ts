/**
 * 智能预问诊模块 - 类型定义
 * 包含身体部位、症状、评估请求等相关类型
 */

// 身体部位
export interface IBodyPart {
  id: string;
  name: string;
  icon: string;
  children?: IBodyPart[];      // 子部位
  symptoms?: ISymptom[];       // 相关症状
}

// 症状
export interface ISymptom {
  id: string;
  name: string;
  category: string;           // 症状分类
  severity?: 'mild' | 'moderate' | 'severe';  // 严重程度
  duration?: string;          // 持续时间
  description?: string;       // 描述
}

// AI评估请求
export interface IAssessmentRequest {
  patientId: string;
  bodyParts: string[];        // 选择的部位
  symptoms: ISymptom[];      // 症状列表
  description?: string;       // 补充描述
  voiceText?: string;         // 语音转文字
}

// AI评估结果
export interface IAssessmentResult {
  id: string;
  diseases: IDiseaseRecommend[];  // 推荐的疾病
  severity: 'normal' | 'urgent' | 'emergency';  // 严重程度
  suggestions: string[];      // 建议
  recommendedDepts: IDeptRecommend[];  // 推荐科室
  createTime: string;
}

// 推荐的疾病
export interface IDiseaseRecommend {
  name: string;
  probability: number;        // 匹配概率
  description: string;
  tags: string[];            // 标签（常见/严重等）
}

// 推荐的科室
export interface IDeptRecommend {
  deptId: string;
  deptName: string;
  reason: string;
  urgency: 'normal' | 'urgent';  // 紧急程度
}

// 预问诊记录
export interface IPreDiagnosisRecord {
  id: string;
  patientId: string;
  result: IAssessmentResult;
  createTime: string;
}

// 症状选择项
export interface ISymptomOption {
  id: string;
  name: string;
  category: string;
  selected: boolean;
}

// 严重程度选项
export type SeverityLevel = 'mild' | 'moderate' | 'severe';

// 紧急程度
export type UrgencyLevel = 'normal' | 'urgent' | 'emergency';
