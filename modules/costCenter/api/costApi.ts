/**
 * 费用中心 - 费用相关 API
 */
import req from '@/js_sdk/kevinrong-http/index.js';
import type { IResData } from '@/api/api';
import type { IHospitalCost, ICostDetail, ICostFilterParams } from '../types';

/**
 * 请求参数封装
 */
const parm = (data: any) => ({
  args: data,
  token: uni.getStorageSync('token'),
});

/**
 * 费用 API
 */
export const costApi = {
  /**
   * 获取住院费用信息
   */
  getHospitalCost(data: { patientId: string }): Promise<IResData<IHospitalCost>> {
    return req.post('/phs-query/cost/getHospitalCost', parm(data), {
      interfaceType: 3,
    });
  },

  /**
   * 获取费用明细
   */
  getCostDetail(data: ICostFilterParams): Promise<IResData<ICostDetail[]>> {
    return req.post('/phs-query/cost/getCostDetail', parm(data), {
      interfaceType: 3,
    });
  },

  /**
   * 获取日清单
   */
  getDailyList(data: { admissionNo: string; date: string }): Promise<IResData<ICostDetail[]>> {
    return req.post('/phs-query/cost/getDailyList', parm(data), {
      interfaceType: 3,
    });
  },

  /**
   * 获取费用分类汇总
   */
  getCostSummary(data: { admissionNo: string }): Promise<IResData<any>> {
    return req.post('/phs-query/cost/getSummary', parm(data), {
      interfaceType: 3,
    });
  },

  /**
   * 获取欠费提醒状态
   */
  getArrearsWarning(data: { admissionNo: string }): Promise<IResData<any>> {
    return req.post('/phs-query/cost/getArrearsWarning', parm(data), {
      interfaceType: 3,
    });
  },
};
