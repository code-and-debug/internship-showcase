/**
 * 安全分享组合式函数
 * 
 * 功能：
 * - 分享配置管理
 * - 数据脱敏
 * - 分享链接生成
 */

import { computed, type Ref, ref } from 'vue';
import type { IShareConfig, ISettlementDetail, ShareType } from '../types';
import { SHARE_TYPE_CONFIG, DEFAULT_MASK_FIELDS } from '../constants';
import { maskIdCard, maskPhone, maskName, generateId } from '../utils';

/**
 * 安全分享参数
 */
export interface IUseSecureShareOptions {
  originalData: Ref<ISettlementDetail>;
}

/**
 * 安全分享
 * @param options 参数
 * @returns 分享相关方法和状态
 */
export function useSecureShare(options: IUseSecureShareOptions) {
  const { originalData } = options;

  // 分享配置
  const shareConfig = ref<Partial<IShareConfig>>({
    shareType: 'family',
    maskFields: [],
    expireTime: 7 * 24 * 60 * 60 * 1000, // 默认7天
    maxAccessCount: undefined,
  });

  // 访问密码
  const accessPassword = ref('');

  // 分享链接
  const shareLink = ref('');

  // 是否已生成分享
  const hasGeneratedShare = computed((): boolean => {
    return !!shareLink.value;
  });

  // 分享类型选项
  const shareTypeOptions = computed(() => {
    return Object.entries(SHARE_TYPE_CONFIG).map(([key, config]) => ({
      value: key as ShareType,
      label: config.label,
      icon: config.icon,
      description: config.description,
    }));
  });

  // 根据分享类型获取默认脱敏字段
  const getDefaultMaskFields = (shareType: ShareType): string[] => {
    return SHARE_TYPE_CONFIG[shareType].defaultMaskFields;
  };

  // 设置分享类型
  const setShareType = (type: ShareType) => {
    shareConfig.value.shareType = type;
    // 自动设置该类型的默认脱敏字段
    shareConfig.value.maskFields = getDefaultMaskFields(type);
  };

  // 切换脱敏字段
  const toggleMaskField = (field: string) => {
    const fields = shareConfig.value.maskFields || [];
    const index = fields.indexOf(field);
    if (index > -1) {
      fields.splice(index, 1);
    } else {
      fields.push(field);
    }
    shareConfig.value.maskFields = fields;
  };

  // 设置过期时间
  const setExpireTime = (days: number) => {
    shareConfig.value.expireTime = days * 24 * 60 * 60 * 1000;
  };

  // 设置访问密码
  const setAccessPassword = (password: string) => {
    accessPassword.value = password;
  };

  // 脱敏处理
  const maskData = (data: ISettlementDetail, maskFields: string[]): Partial<ISettlementDetail> => {
    const masked = { ...data } as Partial<ISettlementDetail>;

    // 这里假设结算详情中有患者信息需要脱敏
    // 实际项目中需要根据数据结构进行调整
    
    if (maskFields.includes('idCard')) {
      // 脱敏身份证号
      // masked.patientId = maskIdCard(masked.patientId || '');
    }

    if (maskFields.includes('phone')) {
      // 脱敏手机号
    }

    if (maskFields.includes('address')) {
      // 脱敏地址
    }

    return masked;
  };

  // 生成分享
  const generateShare = async (): Promise<{ success: boolean; message: string; link?: string }> => {
    try {
      const config: IShareConfig = {
        originalData: originalData.value,
        shareType: shareConfig.value.shareType || 'family',
        maskFields: shareConfig.value.maskFields || [],
        expireTime: shareConfig.value.expireTime || 7 * 24 * 60 * 60 * 1000,
        accessPassword: accessPassword.value || undefined,
        maxAccessCount: shareConfig.value.maxAccessCount,
      };

      // 数据脱敏
      const maskedData = maskData(config.originalData, config.maskFields);

      // 生成分享ID
      const shareId = generateId();

      // 模拟API调用，保存分享信息
      // const response = await api.createShare({
      //   shareId,
      //   data: maskedData,
      //   config,
      // });

      // 生成分享链接
      shareLink.value = `https://example.com/share/${shareId}`;

      return {
        success: true,
        message: '分享链接生成成功',
        link: shareLink.value,
      };
    } catch (error) {
      return {
        success: false,
        message: '分享链接生成失败',
      };
    }
  };

  // 复制分享链接
  const copyShareLink = async (): Promise<boolean> => {
    if (!shareLink.value) return false;
    
    try {
      // #ifdef H5
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareLink.value);
        return true;
      }
      // #endif

      // #ifdef MP-WEIXIN
      uni.setClipboardData({
        data: shareLink.value,
        success: () => true,
        fail: () => false,
      });
      // #endif

      return false;
    } catch {
      return false;
    }
  };

  // 验证访问密码
  const verifyPassword = async (inputPassword: string): Promise<boolean> => {
    if (!accessPassword.value) return true;
    return inputPassword === accessPassword.value;
  };

  // 重置分享
  const resetShare = () => {
    shareLink.value = '';
    accessPassword.value = '';
    shareConfig.value = {
      shareType: 'family',
      maskFields: [],
      expireTime: 7 * 24 * 60 * 60 * 1000,
      maxAccessCount: undefined,
    };
  };

  return {
    shareConfig,
    accessPassword,
    shareLink,
    hasGeneratedShare,
    shareTypeOptions,
    setShareType,
    toggleMaskField,
    setExpireTime,
    setAccessPassword,
    generateShare,
    copyShareLink,
    verifyPassword,
    resetShare,
  };
}

/**
 * 分享访问统计
 * @param shareId 分享ID
 * @returns 访问统计
 */
export function useShareAccessStats(shareId: Ref<string>) {
  // 访问次数
  const accessCount = ref(0);
  
  // 访问记录
  const accessRecords = ref<{ time: string; ip: string; userAgent: string }[]>([]);

  // 加载访问统计
  const loadStats = async () => {
    // 实际项目中这里应该调用API
    // const response = await api.getShareAccessStats(shareId.value);
    // accessCount.value = response.data.count;
    // accessRecords.value = response.data.records;
  };

  // 记录访问
  const recordAccess = async () => {
    // 实际项目中这里应该调用API
    // await api.recordShareAccess(shareId.value);
  };

  return {
    accessCount,
    accessRecords,
    loadStats,
    recordAccess,
  };
}

/**
 * 分享内容预览
 * @param shareConfig 分享配置
 * @returns 预览内容
 */
export function useSharePreview(shareConfig: Ref<IShareConfig>) {
  // 预览数据（脱敏后）
  const previewData = computed(() => {
    const config = shareConfig.value;
    const data = config.originalData;
    
    // 根据脱敏字段处理数据
    const masked: Partial<ISettlementDetail> = { ...data };
    
    // 这里需要根据实际需求进行脱敏处理
    
    return masked;
  });

  // 分享摘要
  const shareSummary = computed(() => {
    const data = shareConfig.value.originalData;
    return {
      title: `${data.hosName} - 医保结算详情`,
      description: `结算日期：${data.settlementDate}，总费用：¥${data.totalCost}`,
    };
  });

  return {
    previewData,
    shareSummary,
  };
}
