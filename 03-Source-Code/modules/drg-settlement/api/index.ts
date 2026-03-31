/**
 * DRG医保结算与病案管理模块 - API接口入口
 */

import type { 
  IApiResponse, 
  IPaginationResponse,
  TSettleItem,
  ISettlementDetail,
  IMedicalCopyItem,
  ISpecialCaseApply,
  IInpatientRecord,
} from '../types';

// ==================== 结算相关接口 ====================

/**
 * 获取结算列表
 * @param params 查询参数
 * @returns 结算列表
 */
export const getSettlementList = async (params: {
  patientId: string;
  projectType?: string;
  page?: number;
  pageSize?: number;
}): Promise<IApiResponse<IPaginationResponse<TSettleItem>>> => {
  // 实际项目中调用真实API
  // return request('/api/medical/settlement/list', { method: 'GET', data: params });
  
  // Mock实现
  const { mockSettlements } = await import('../mock/settlements');
  return {
    code: 200,
    message: 'success',
    success: true,
    data: {
      list: mockSettlements,
      total: mockSettlements.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      hasMore: false,
    },
  };
};

/**
 * 获取结算详情
 * @param settlementNo 结算单号
 * @returns 结算详情
 */
export const getSettlementDetail = async (
  settlementNo: string
): Promise<IApiResponse<ISettlementDetail>> => {
  // 实际项目中调用真实API
  // return request('/api/medical/settlement/detail', { method: 'GET', data: { settlementNo } });
  
  // Mock实现
  const { mockSettlementDetail } = await import('../mock/settlements');
  return {
    code: 200,
    message: 'success',
    success: true,
    data: mockSettlementDetail,
  };
};

/**
 * 获取DRG信息
 * @param settlementNo 结算单号
 * @returns DRG信息
 */
export const getDRGInfo = async (settlementNo: string) => {
  // return request('/api/medical/drgInfo', { method: 'GET', data: { settlementNo } });
  const { mockSettlementDetail } = await import('../mock/settlements');
  return {
    code: 200,
    message: 'success',
    success: true,
    data: mockSettlementDetail.drgAnalysis,
  };
};

/**
 * 获取飞检风险评估
 * @param settlementNo 结算单号
 * @returns 风险评估结果
 */
export const getFlyCheckRisk = async (settlementNo: string) => {
  // return request('/api/medical/flyCheckRisk', { method: 'GET', data: { settlementNo } });
  const { mockSettlementDetail } = await import('../mock/settlements');
  return {
    code: 200,
    message: 'success',
    success: true,
    data: mockSettlementDetail.flyCheckAssessment,
  };
};

// ==================== 特病单议接口 ====================

/**
 * 提交特病单议申请
 * @param data 申请数据
 * @returns 申请结果
 */
export const submitSpecialCaseApply = async (
  data: Partial<ISpecialCaseApply>
): Promise<IApiResponse<{ applyNo: string }>> => {
  // return request('/api/specialCase/apply', { method: 'POST', data });
  return {
    code: 200,
    message: 'success',
    success: true,
    data: {
      applyNo: `SC${Date.now()}`,
    },
  };
};

/**
 * 获取特病单议申请列表
 * @param patientId 患者ID
 * @returns 申请列表
 */
export const getSpecialCaseList = async (
  patientId: string
): Promise<IApiResponse<ISpecialCaseApply[]>> => {
  // return request('/api/specialCase/list', { method: 'GET', data: { patientId } });
  return {
    code: 200,
    message: 'success',
    success: true,
    data: [],
  };
};

// ==================== 病案复印接口 ====================

/**
 * 获取病案复印申请列表
 * @param patientId 患者ID
 * @returns 申请列表
 */
export const getMedicalCopyList = async (
  patientId: string
): Promise<IApiResponse<IMedicalCopyItem[]>> => {
  // return request('/api/medicalCopy/list', { method: 'GET', data: { patientId } });
  return {
    code: 200,
    message: 'success',
    success: true,
    data: [],
  };
};

/**
 * 提交病案复印申请
 * @param data 申请数据
 * @returns 申请结果
 */
export const submitMedicalCopyApply = async (
  data: Partial<IMedicalCopyItem>
): Promise<IApiResponse<{ expressId: string }>> => {
  // return request('/api/medicalCopy/apply', { method: 'POST', data });
  return {
    code: 200,
    message: 'success',
    success: true,
    data: {
      expressId: `MC${Date.now()}`,
    },
  };
};

/**
 * 获取住院记录列表
 * @param patientId 患者ID
 * @returns 住院记录列表
 */
export const getInpatientRecords = async (
  patientId: string
): Promise<IApiResponse<IInpatientRecord[]>> => {
  // return request('/api/patient/inpatientRecords', { method: 'GET', data: { patientId } });
  return {
    code: 200,
    message: 'success',
    success: true,
    data: [],
  };
};

// ==================== 费用分析接口 ====================

/**
 * 获取费用对比数据
 * @param settlementNo 结算单号
 * @returns 费用对比数据
 */
export const getCostComparison = async (settlementNo: string) => {
  // return request('/api/medical/costComparison', { method: 'GET', data: { settlementNo } });
  const { mockSettlementDetail } = await import('../mock/settlements');
  return {
    code: 200,
    message: 'success',
    success: true,
    data: mockSettlementDetail.costComparison,
  };
};

/**
 * 获取CMI分析数据
 * @param settlementNo 结算单号
 * @returns CMI分析数据
 */
export const getCMIData = async (settlementNo: string) => {
  // return request('/api/medical/cmi', { method: 'GET', data: { settlementNo } });
  const { mockSettlementDetail } = await import('../mock/settlements');
  return {
    code: 200,
    message: 'success',
    success: true,
    data: mockSettlementDetail.cmiAnalysis,
  };
};
