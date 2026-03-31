/**
 * 费用中心 - 支付相关 API
 */
import req from '@/js_sdk/kevinrong-http/index.js';
import type { IResData } from '@/api/api';
import type { IPaymentOrder, IRefundApply, IPaymentParams, IRefundParams } from '../types';

/**
 * 请求参数封装
 */
const parm = (data: any) => ({
  args: data,
  token: uni.getStorageSync('token'),
});

/**
 * 支付 API
 */
export const paymentApi = {
  /**
   * 创建支付订单
   */
  createOrder(data: IPaymentParams): Promise<IResData<IPaymentOrder>> {
    return req.post('/phs-procedure/payment/createOrder', parm(data), {
      interfaceType: 3,
    });
  },

  /**
   * 查询订单状态
   */
  queryOrder(orderNo: string): Promise<IResData<IPaymentOrder>> {
    return req.post('/phs-query/payment/queryOrder', parm({ orderNo }), {
      interfaceType: 3,
    });
  },

  /**
   * 获取缴费记录
   */
  getPaymentRecords(data: {
    patientId: string;
    page?: number;
    size?: number;
  }): Promise<IResData<IPaymentOrder[]>> {
    return req.post('/phs-query/payment/getRecords', parm(data), {
      interfaceType: 3,
    });
  },

  /**
   * 提交退费申请
   */
  applyRefund(data: IRefundParams): Promise<IResData<IRefundApply>> {
    return req.post('/phs-procedure/refund/apply', parm(data), {
      interfaceType: 3,
    });
  },

  /**
   * 查询退费进度
   */
  queryRefund(refundId: string): Promise<IResData<IRefundApply>> {
    return req.post('/phs-query/refund/query', parm({ refundId }), {
      interfaceType: 3,
    });
  },

  /**
   * 获取退费记录
   */
  getRefundRecords(data: {
    patientId: string;
    page?: number;
    size?: number;
  }): Promise<IResData<IRefundApply[]>> {
    return req.post('/phs-query/refund/getRecords', parm(data), {
      interfaceType: 3,
    });
  },

  /**
   * 取消支付订单
   */
  cancelOrder(orderNo: string): Promise<IResData<any>> {
    return req.post('/phs-procedure/payment/cancel', parm({ orderNo }), {
      interfaceType: 3,
    });
  },

  /**
   * 获取支付结果（轮询）
   */
  getPaymentResult(orderNo: string): Promise<IResData<IPaymentOrder>> {
    return req.post('/phs-query/payment/getResult', parm({ orderNo }), {
      interfaceType: 3,
    });
  },
};
