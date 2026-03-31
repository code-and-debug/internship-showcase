/**
 * DRG医保结算与病案管理模块 - 类型定义入口
 * 
 * 本模块包含以下核心类型：
 * - 结算相关 (settlement)
 * - 诊断相关 (diagnosis) - 含CC/MCC
 * - DRG分析 (drg)
 * - 飞检风险 (flycheck)
 * - CMI计算 (cmi)
 * - 特病单议 (specialCase)
 * - 病案复印 (medicalCopy)
 */

// ==================== 基础类型 ====================

export type CaseType = 'normal' | 'high' | 'low';
export type WarningLevel = 'safe' | 'warning' | 'danger';
export type RiskLevel = 'low' | 'medium' | 'high';
export type PaymentType = 'DRG' | 'DIP' | 'FeeForService';
export type SettlementStatus = 'settled' | 'pending' | 'uploaded';
export type ProjectType = '1' | '2'; // 1-门诊 2-住院

// ==================== 结算相关 ====================

/**
 * 结算列表项
 */
export interface TSettleItem {
  // 基础信息
  settlementNo: string;               // 结算单号
  settlementDate: string;             // 结算日期
  projectType: ProjectType;           // 1-门诊 2-住院
  hosId: string;                      // 医院ID
  hosName: string;                    // 医院名称
  
  // 费用信息
  totalCost: number;                  // 总费用
  insurancePay: number;               // 医保支付
  selfPay: number;                    // 自付金额
  
  // DRG信息（新增）
  drgCode?: string;                   // DRG分组编码
  drgName?: string;                   // DRG分组名称
  weight?: number;                    // DRG权重
  paymentStandard?: number;           // 医保支付标准
  currentCost?: number;               // 当前费用
  costRate?: number;                  // 费用消耗率
  caseType?: CaseType;                // 病例类型
  
  // 状态与风险（新增）
  settlementStatus?: SettlementStatus;
  warningLevel?: WarningLevel;
  flyCheckRisk?: RiskLevel;
}

/**
 * 结算详情
 */
export interface ISettlementDetail extends TSettleItem {
  // 费用明细
  costDetails: ICostDetail[];
  
  // 诊断信息
  diagnoses: IDiagnosisItem[];
  
  // 手术信息
  surgeries?: ISurgeryItem[];
  
  // 自付计算明细
  selfPaymentDetail?: ISelfPaymentResult;
  
  // DRG分析结果
  drgAnalysis?: IDRGAnalysisResult;
  
  // 飞检风险评估
  flyCheckAssessment?: IFlyCheckRisk;
  
  // CMI分析
  cmiAnalysis?: ICMICalculation;
  
  // 费用对比
  costComparison?: ICostComparison;
}

/**
 * 费用明细项
 */
export interface ICostDetail {
  itemCode: string;                   // 项目编码
  itemName: string;                   // 项目名称
  category: CostCategory;             // 费用类别
  amount: number;                     // 金额
  quantity: number;                   // 数量
  unitPrice: number;                  // 单价
}

export type CostCategory = 'drug' | 'exam' | 'surgery' | 'treatment' | 'material' | 'other';

// ==================== 诊断相关（含CC/MCC）====================

/**
 * 诊断项目（含CC/MCC标识）
 * 
 * 业务背景：
 * - CC（Complication/Comorbidity）：并发症/合并症
 * - MCC（Major CC）：主要并发症/合并症
 * - CC/MCC是影响DRG权重的关键因素
 */
export interface IDiagnosisItem {
  diagnosisCode: string;              // ICD-10编码
  diagnosisName: string;              // 诊断名称
  diagnosisType: 'main' | 'secondary'; // 主要/次要诊断
  order: number;                      // 诊断顺序
  
  // CC/MCC标识（核心字段）
  isCC: boolean;                      // 是否为并发症/合并症
  isMCC: boolean;                     // 是否为主要并发症/合并症
  ccWeight: number;                   // CC权重加成值
  
  // 诊断依据
  documentation: IDiagnosisDoc[];
  evidenceLevel: 'strong' | 'medium' | 'weak';
  auditRisk: 'low' | 'medium' | 'high';
}

/**
 * 诊断依据文档
 */
export interface IDiagnosisDoc {
  docType: DocType;
  docName: string;
  docDate: string;
  docId: string;
  keyFindings: string;
}

export type DocType = 'exam_report' | 'image' | 'lab' | 'pathology' | 'consultation';

/**
 * 手术信息
 */
export interface ISurgeryItem {
  surgeryCode: string;
  surgeryName: string;
  surgeryDate: string;
  surgeon: string;
}

// ==================== DRG分析 ====================

/**
 * DRG分析结果
 */
export interface IDRGAnalysisResult {
  drgCode: string;
  drgName: string;
  weight: number;
  paymentStandard: number;
  currentCost: number;
  costRate: number;
  caseType: CaseType;
  warningLevel: WarningLevel;
  warningDescription: string;
  suggestions: string[];
}

/**
 * DRG分析参数
 */
export interface IDRGAnalysisParams {
  drgCode: string;
  drgName: string;
  weight: number;
  paymentStandard: number;
  currentCost: number;
}

// ==================== 飞检风险 ====================

/**
 * 飞检风险评估结果
 */
export interface IFlyCheckRisk {
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: IRiskFactors;
  suggestions: string[];
  requiredDocuments: string[];
}

/**
 * 风险因素
 */
export interface IRiskFactors {
  highRateCase: boolean;        // 高倍率病例
  diagnosisMismatch: boolean;   // 诊断与费用不匹配
  excessiveDrugUse: boolean;    // 药品使用异常
  repeatedExam: boolean;        // 重复检查
  lackOfDocumentation: boolean; // 诊断依据不足
}

// ==================== CMI计算 ====================

/**
 * CMI（病例组合指数）计算结果
 */
export interface ICMICalculation {
  currentWeight: number;
  hospitalAvgCMI: number;
  nationalAvgCMI: number;
  cmiDiff: number;
  impact: 'positive' | 'negative' | 'neutral';
  impactDescription: string;
  impactPercent: number;
}

// ==================== 自付计算 ====================

/**
 * 自付计算参数
 */
export interface ISelfPaymentParams {
  totalCost: number;
  deductible: number;           // 起付线
  reimbursementRate: number;    // 报销比例
  personalCap: number;          // 个人年度封顶线
  usedCap?: number;             // 已用额度
  classBCost?: number;          // 乙类费用
  classBRate?: number;          // 乙类自付比例
  classCCost?: number;          // 丙类费用
}

/**
 * 自付计算结果
 */
export interface ISelfPaymentResult {
  deductibleAmount: number;     // 起付线金额
  classCCost: number;           // 丙类费用
  classBSelfPay: number;        // 乙类自付
  reimbursableCost: number;     // 可报销费用
  reimbursementAmount: number;  // 报销金额
  selfPayAmount: number;        // 自付金额
  personalCapRemaining: number; // 个人年度剩余额度
  note: string;
}

// ==================== 费用对比 ====================

/**
 * 费用对比结果
 */
export interface ICostComparison {
  currentCost: number;
  drgPaymentStandard: number;
  sameDRGAvgCost: number;
  sameHospitalAvgCost: number;
  regionAvgCost: number;
  percentile: number;
  comparisonResult: string;
  suggestions: string[];
}

// ==================== 特病单议 ====================

/**
 * 特病单议申请
 */
export interface ISpecialCaseApply {
  applyNo: string;
  settlementNo: string;
  patientId: string;
  drgCode: string;
  drgName: string;
  weight: number;
  paymentStandard: number;
  currentCost: number;
  excessAmount: number;
  costRate: number;
  excessReason: string;
  excessReasonType: ExcessReasonType;
  complicationDetails: string;
  supportingDocs: ISupportingDoc[];
  status: SpecialCaseStatus;
  submitTime?: string;
  reviewTime?: string;
  reviewResult?: string;
  reviewer?: string;
}

export type ExcessReasonType = 'complication' | 'severity' | 'comorbidity' | 'other';
export type SpecialCaseStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

/**
 * 支持材料
 */
export interface ISupportingDoc {
  docId: string;
  docType: SupportingDocType;
  docName: string;
  uploadTime: string;
  description: string;
  fileUrl?: string;
}

export type SupportingDocType = 'exam_report' | 'image' | 'pathology' | 'consultation' | 'record';

/**
 * 特病单议资格检查结果
 */
export interface ISpecialCaseEligibility {
  eligible: boolean;
  reasons: string[];
  suggestions: string[];
  requiredDocs: string[];
}

// ==================== 病案复印 ====================

/**
 * 病案复印申请项
 */
export interface IMedicalCopyItem {
  expressId: string;
  applyNo: string;
  applyTime: string;
  copyType: CopyType;
  copyContent: string[];
  copyCount: number;
  status: CopyStatus;
  expressCompany?: string;
  expressNo?: string;
  estimatedCost?: number;
  settlementInfo?: ICopySettlementInfo;
  insuranceTips?: IInsuranceTips;
}

export type CopyType = 'inpatient' | 'outpatient';
export type CopyStatus = 'pending' | 'processing' | 'completed' | 'shipped';

/**
 * 复印关联的结算信息
 */
export interface ICopySettlementInfo {
  settlementNo: string;
  drgCode?: string;
  totalCost: number;
  costRate?: number;
  caseType?: CaseType;
  flyCheckRisk?: RiskLevel;
}

/**
 * 保险提示
 */
export interface IInsuranceTips {
  requiredDocs: string[];
  optionalDocs: string[];
  claimTips: string[];
}

/**
 * DRG相关提示
 */
export interface IMedicalCopyDRGTips {
  showTips: boolean;
  tipType: 'flycheck' | 'insurance' | 'privacy' | 'documentation';
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'danger';
  actionText?: string;
  actionRoute?: string;
}

// ==================== 安全分享 ====================

/**
 * 分享配置
 */
export interface IShareConfig {
  originalData: ISettlementDetail;
  shareType: ShareType;
  maskFields: string[];
  expireTime: number;
  accessPassword?: string;
  maxAccessCount?: number;
}

export type ShareType = 'family' | 'doctor' | 'insurance' | 'other';

// ==================== 患者信息 ====================

/**
 * 患者信息
 */
export interface IPatientInfo {
  patientId: string;
  name: string;
  idCard: string;
  phone?: string;
  gender?: 'male' | 'female';
  age?: number;
}

// ==================== 住院记录 ====================

/**
 * 住院记录
 */
export interface IInpatientRecord {
  inpatientNo: string;
  admissionDate: string;
  dischargeDate?: string;
  department: string;
  departmentCode: string;
  doctorName: string;
  bedNo?: string;
  diagnosis: string;
  isDischarged: boolean;
  settlementNo?: string;
}

// ==================== 复印内容选项 ====================

/**
 * 复印内容选项
 */
export interface ICopyContentOption {
  value: string;
  label: string;
  description: string;
  price: number;
  category: 'basic' | 'clinical' | 'exam' | 'other';
}

// ==================== API 响应类型 ====================

/**
 * API响应基础结构
 */
export interface IApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

/**
 * 分页响应
 */
export interface IPaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
