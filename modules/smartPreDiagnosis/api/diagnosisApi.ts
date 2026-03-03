/**
 * 智能预问诊 - 诊断相关 API
 */
import req from '@/js_sdk/kevinrong-http/index.js';
import type { IResData } from '@/api/api';
import type {
  IBodyPart,
  ISymptom,
  IAssessmentResult,
  IAssessmentRequest,
  IPreDiagnosisRecord,
} from '../types';

/**
 * 请求参数封装
 */
const parm = (data: any) => ({
  args: data,
  token: uni.getStorageSync('token'),
});

/**
 * 诊断 API
 */
export const diagnosisApi = {
  /**
   * 获取身体部位列表
   */
  getBodyParts(): Promise<IResData<IBodyPart[]>> {
    return req.post('/phs-query/diagnosis/getBodyParts', parm({}), {
      interfaceType: 3,
    });
  },

  /**
   * 获取部位相关症状
   */
  getSymptomsByBodyPart(bodyPartId: string): Promise<IResData<ISymptom[]>> {
    return req.post('/phs-query/diagnosis/getSymptoms', parm({ bodyPartId }), {
      interfaceType: 3,
    });
  },

  /**
   * 提交AI评估
   */
  submitAssessment(data: IAssessmentRequest): Promise<IResData<IAssessmentResult>> {
    return req.post('/phs-procedure/diagnosis/assess', parm(data), {
      interfaceType: 3,
    });
  },

  /**
   * 获取评估历史
   */
  getAssessmentHistory(patientId: string): Promise<IResData<IPreDiagnosisRecord[]>> {
    return req.post('/phs-query/diagnosis/getHistory', parm({ patientId }), {
      interfaceType: 3,
    });
  },

  /**
   * 获取科室列表（用于推荐）
   */
  getDepartmentList(): Promise<IResData<any>> {
    return req.post('/phs-query/dept/getList', parm({}), {
      interfaceType: 3,
    });
  },

  /**
   * 一键挂号（从评估结果跳转）
   */
  quickRegister(deptId: string, diagnosisId: string): Promise<IResData<any>> {
    return req.post('/phs-procedure/register/quick', parm({ deptId, diagnosisId }), {
      interfaceType: 3,
    });
  },
};
