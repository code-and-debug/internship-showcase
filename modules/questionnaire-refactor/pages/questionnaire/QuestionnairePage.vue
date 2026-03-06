<template>
  <view class="questionnaire-page">
    <view class="page-container">
      <FormBox
        v-model:modelValue="formData"
        @submit="handleSubmit"
        :disabled="isDisabled"
        system="3"
        ref="formBoxRef"
        :answerType="pageProps.answerType || 'normal'"
        :isWrap="isWrap"
        :useMock="useMock"
      />
    </view>
    
    <!-- 全局消息组件 -->
    <g-message />
  </view>
</template>

<script setup lang="ts">
/**
 * 问卷页面（重构版）
 * @description
 * 问卷填写页面，支持：
 * 1. 问卷初始化和渲染
 * 2. 表单提交
 * 3. 已填写数据回显
 * 4. 特殊系统逻辑处理
 * 
 * 优化点：
 * - 使用 Composition API 组织代码
 * - 抽离业务逻辑到 composables
 * - 类型安全
 * - 清晰的职责分离
 */

import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import type {
  IQuestionnairePageProps,
  IFormListItem,
  FormData,
  IFormSubmitEvent,
} from '../../types/questionnaire';
import { SPECIAL_SYSTEM_CODES, QUESTIONNAIRE_CATEGORY } from '../../constants/questionnaire';
import { useFormData, getDaysBetweenDates } from '../../composables/useFormData';
import FormBox from '../../components/form-box/FormBox.vue';

// ==================== 类型定义 ====================

// 页面级别的 FormBox 实例类型
interface FormBoxInstance {
  init: (
    category: string,
    configList?: (list: IFormListItem[]) => void
  ) => Promise<unknown>;
  submitLoveForm: (
    formData: { list: IFormListItem[]; res: FormData },
    options: Record<string, unknown>
  ) => Promise<{ success: boolean; message: string }>;
}

// 消息 Store 类型
interface MessageStore {
  showMessage: (
    message: string,
    duration?: number,
    options?: { closeCallBack?: () => void }
  ) => void;
}

// 用户 Store 类型
interface UserStore {
  patChoose?: {
    patientId?: string;
    patientName?: string;
  };
}

// GStores 类型
interface GStores {
  messageStore: MessageStore;
  userStore: UserStore;
}

// ==================== Props & 常量 ====================

// 是否使用模拟数据（开发/测试用）
const useMock = true;

// ==================== Refs ====================

const formBoxRef = ref<FormBoxInstance | null>(null);
const pageProps = ref<IQuestionnairePageProps>({
  category: '',
  visitNo: '',
});

// 本地状态
const isDisabled = ref(false);
const isWrap = ref(true);

// ==================== Composables ====================

const { formData, fillFromPageParams } = useFormData();

// ==================== 工具函数 ====================

/**
 * 获取页面类型文本
 */
const getPageTypeText = (category: string): string => {
  if (category === QUESTIONNAIRE_CATEGORY.LOVE_DONATE) return '爱心捐赠';
  if (category === QUESTIONNAIRE_CATEGORY.LOVE_RECEIVE) return '爱心领取';
  return '问卷';
};

/**
 * 获取系统编码
 */
const getSysCode = (): string => {
  // TODO: 从实际项目中获取
  return '1001067';
};

/**
 * 获取 GStores
 */
const getGStores = (): GStores => {
  // TODO: 从实际项目中获取
  return {
    messageStore: {
      showMessage: (msg, duration = 3000, opts) => {
        console.log(`[Message] ${msg}`);
        setTimeout(() => {
          opts?.closeCallBack?.();
        }, duration);
      },
    },
    userStore: {
      patChoose: {
        patientId: 'test-patient-id',
        patientName: '测试患者',
      },
    },
  };
};

/**
 * 延迟函数
 */
const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * URL 参数解析
 */
const deQueryForUrl = <T = Record<string, unknown>>(params: unknown): T => {
  // TODO: 实现实际的 URL 参数解析
  return params as T;
};

// ==================== 业务逻辑 ====================

/**
 * 初始化页面包装配置
 */
const initWrapConfig = (): void => {
  const sysCode = getSysCode();
  
  // 山南人民医院：不换行
  if (SPECIAL_SYSTEM_CODES.SHANNAN_NO_WRAP.includes(sysCode)) {
    isWrap.value = false;
  }
};

/**
 * 配置表单列表
 * @description 根据已有数据配置表单字段状态
 */
const configureFormList = (
  list: IFormListItem[],
  filledKeys: string[],
  unContentMap: Map<number, string>
): void => {
  list.forEach((item) => {
    const { id, qsId } = item;
    
    // 设置 unContent
    if (qsId && unContentMap.has(qsId)) {
      item.isOpenSubInput = true;
      item.subValue = unContentMap.get(qsId);
    }
    
    // 只对联系方式（id === '2'）禁用，姓名和身份证不禁用
    if (filledKeys.includes(id) && id === '2') {
      item.disabled = true;
    }
  });
};

/**
 * 加载历史答案
 */
const loadHistoryAnswers = async (): Promise<Map<number, string>> => {
  const gStores = getGStores();
  const unContentMap = new Map<number, string>();
  
  try {
    // TODO: 调用实际 API
    // const { result } = await api.gsbmqnrecord({
    //   patientName: pageProps.value.patientName || gStores.userStore.patChoose?.patientName,
    //   type: '3',
    //   category: pageProps.value.category,
    //   visitNo: pageProps.value.visitNo,
    // });
    
    // if (result.answerList) {
    //   const answerList = JSON.parse(result.answerList);
    //   const map = fillFromAnswerList(answerList);
    //   map.forEach((value, key) => unContentMap.set(key, value));
    //   
    //   // 显示已提交提示
    //   gStores.messageStore.showMessage(
    //     '您已经填写过该问卷, 不可进行重复提交',
    //     3000,
    //     { closeCallBack: () => { isDisabled.value = true; } }
    //   );
    // }
  } catch (error) {
    console.warn('[QuestionnairePage] 加载历史答案失败:', error);
  }
  
  return unContentMap;
};

/**
 * 初始化问卷
 */
const initQuestionnaire = async (): Promise<void> => {
  // 等待 FormBox 挂载
  await wait(600);
  
  // 填充页面参数到表单
  fillFromPageParams(pageProps.value, getSysCode());
  
  // 加载历史答案（获取 unContentMap）
  const unContentMap = await loadHistoryAnswers();
  
  // 初始化 FormBox
  await formBoxRef.value?.init(pageProps.value.category, (list) => {
    const filledKeys = Object.keys(formData.value);
    configureFormList(list, filledKeys, unContentMap);
  });
};

/**
 * 处理表单提交
 */
const handleSubmit = async (event: IFormSubmitEvent): Promise<void> => {
  const { list, res } = event;
  const gStores = getGStores();
  
  try {
    // 使用 FormBox 提供的 submitLoveForm 方法
    const result = await formBoxRef.value?.submitLoveForm(
      { list, res },
      {
        ...pageProps.value,
        patientId: gStores.userStore.patChoose?.patientId,
      }
    );
    
    if (!result) {
      throw new Error('提交失败：无法获取提交结果');
    }
    
    // 显示成功消息
    gStores.messageStore.showMessage(result.message || '提交成功', 3000, {
      closeCallBack: () => {
        isDisabled.value = true;
        uni.navigateBack({ delta: 1 });
      },
    });
  } catch (error) {
    console.error('[QuestionnairePage] 提交失败:', error);
    gStores.messageStore.showMessage('提交失败，请稍后重试', 3000);
  }
};

// ==================== 生命周期 ====================

onLoad(async (options) => {
  // 解析页面参数
  const parsedOptions = deQueryForUrl<IQuestionnairePageProps>(options);
  pageProps.value = deQueryForUrl<IQuestionnairePageProps>(parsedOptions);
  
  // 输出页面类型和参数（用于调试）
  const pageTypeText = getPageTypeText(pageProps.value.category);
  console.log(`${pageTypeText}页面参数:`, pageProps.value);
  
  // 初始化包装配置
  initWrapConfig();
  
  // 初始化问卷
  await initQuestionnaire();
});
</script>

<style lang="scss" scoped>
.questionnaire-page {
  min-height: 100vh;
  background-color: #fff;
  
  .page-container {
    width: 100%;
  }
}
</style>
