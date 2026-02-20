<template>
  <view class="form-box">
    <!-- 普通表单 -->
    <template v-if="answerType === 'normal'">
      <uni-hr-form
        :_xuyan="preface"
        :tel="tel"
        :list="formList"
        :loading="loading"
        :disabled="disabled"
        :modelValue="modelValue"
        @update:modelValue="handleUpdateValue"
        @submit="handleSubmit"
        ref="formRef"
      >
        <template #header>
          <ImageSwiper
            :images="imageUrls"
            :height="imgHeight"
            @preview="handlePreviewImage"
          />
          <slot name="header" />
        </template>
      </uni-hr-form>
    </template>

    <!-- 列表表单 -->
    <template v-else>
      <uni-hr-form-list
        :_xuyan="preface"
        :tel="tel"
        :list="formList"
        :loading="loading"
        :disabled="disabled"
        :modelValue="modelValue"
        @update:modelValue="handleUpdateValue"
        @submit="handleSubmit"
        ref="formRef"
      >
        <template #header>
          <slot name="result" />
          <ImageSwiper
            :images="imageUrls"
            :height="imgHeight"
            @preview="handlePreviewImage"
          />
        </template>
      </uni-hr-form-list>
    </template>
  </view>
</template>

<script setup lang="ts">
/**
 * 表单盒子组件（重构版）
 * @description 
 * 问卷/表单系统的核心组件，负责：
 * 1. 问卷数据的初始化和渲染
 * 2. 表单提交的预处理
 * 3. 爱心捐赠/领取特殊业务逻辑
 * 
 * 优化点：
 * - 使用 Composition API 组织代码
 * - 抽离业务逻辑到 composables
 * - 类型安全
 * - 职责单一
 */

import { ref, computed } from 'vue';
import type {
  IFormBoxProps,
  IFormListItem,
  FormData,
  IFormSubmitEvent,
  IQuestionnaireBase,
} from '../../types/questionnaire';
import { AnswerType, ContentShowType } from '../../types/questionnaire';
import { DEFAULT_PROPS } from '../../constants/questionnaire';
import { useQuestionnaire } from '../../composables/useQuestionnaire';
import ImageSwiper from './ImageSwiper.vue';

// ==================== 组件引入 ====================
// 注意：以下组件需要从原项目引入
// import uniHrForm from './uni-hr-form.vue';
// import uniHrFormList from './uni-hr-form-list.vue';

declare const uniHrForm: unknown;
declare const uniHrFormList: unknown;

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<IFormBoxProps>(), {
  loading: DEFAULT_PROPS.LOADING,
  answerType: DEFAULT_PROPS.ANSWER_TYPE,
  imgHeight: DEFAULT_PROPS.IMG_HEIGHT,
  isWrap: DEFAULT_PROPS.IS_WRAP,
  useMock: false,
  disabled: false,
});

const emit = defineEmits<{
  /** 更新表单数据 */
  (e: 'update:modelValue', value: FormData): void;
  /** 提交表单 */
  (e: 'submit', event: IFormSubmitEvent): void;
  /** 获取问题列表 */
  (e: 'getQuestion', list: IFormListItem[]): void;
}>();

// ==================== Refs ====================

const formRef = ref<{
  setData?: (data: FormData) => void;
} | null>(null);

// ==================== Composables ====================

// 注意：以下需要从外部传入
// const { 
//   formList, 
//   imageUrls, 
//   preface, 
//   tel, 
//   loading, 
//   init, 
//   submitLoveForm, 
//   checkSubmitted,
//   previewImage 
// } = useQuestionnaire({
//   api: {},
//   system: props.system,
//   getSysCode: () => '',
//   userStore: {},
// });

// ==================== 本地状态（重构时替换为 useQuestionnaire）====================

const formList = ref<IFormListItem[]>([]);
const imageUrls = ref<string[]>([]);
const preface = ref('');
const tel = ref('');

// ==================== 计算属性 ====================

const answerType = computed(() => props.answerType);

// ==================== 方法 ====================

/**
 * 处理表单数据更新
 */
const handleUpdateValue = (value: FormData): void => {
  emit('update:modelValue', value);
};

/**
 * 处理表单提交
 * @description 对表单数据进行预处理后再提交
 */
const handleSubmit = (event: { list: IFormListItem[]; res: FormData }): void => {
  const { list, res } = event;
  
  // 深拷贝表单数据，避免修改原始数据
  const processedData = processFormData(res, list);
  
  emit('submit', {
    list,
    res,
    data: processedData,
  });
};

/**
 * 处理表单数据
 * @description 
 * 1. 处理数组类型的值（多选、图片上传）
 * 2. 处理排除逻辑（contentShowType === '2'）
 * 3. 提取图片路径
 * 4. 数组转逗号分隔字符串
 */
const processFormData = (
  data: FormData,
  list: IFormListItem[]
): Record<string, string> => {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(data)) {
    let processedValue = value;
    const item = list.find((o) => o.id === key);
    
    if (!item) {
      result[key] = String(processedValue ?? '');
      continue;
    }
    
    // 处理数组类型
    if (Array.isArray(processedValue)) {
      const { contentShowType = ContentShowType.DEFAULT, subValue } = item;
      
      // 排除逻辑：过滤掉子值
      if (contentShowType === ContentShowType.EXCLUDE_SUB && subValue) {
        processedValue = processedValue.filter((v) => v !== subValue);
      }
      
      // 提取图片路径
      if (processedValue.length > 0 && typeof processedValue[0] === 'object' && processedValue[0] !== null) {
        const firstItem = processedValue[0] as { path?: string };
        if (firstItem.path) {
          processedValue = processedValue.map((o: unknown) => {
            const item = o as { path?: string };
            return item.path;
          });
        }
      }
      
      // 数组转逗号分隔字符串
      result[key] = processedValue.join(',');
    } else {
      result[key] = String(processedValue ?? '');
    }
  }
  
  return result;
};

/**
 * 处理图片预览
 */
const handlePreviewImage = (index: number): void => {
  if (imageUrls.value.length === 0) return;
  
  uni.previewImage({
    current: index,
    urls: imageUrls.value,
  });
};

/**
 * 初始化问卷
 * @description 对外暴露的方法，供父组件调用
 */
const init = async (
  category: string | number,
  configList?: (list: IFormListItem[]) => void
): Promise<IQuestionnaireBase | null> => {
  // TODO: 实现初始化逻辑
  console.log('[FormBox] init', category);
  return null;
};

/**
 * 设置表单数据
 * @description 对外暴露的方法，供父组件调用
 */
const setData = (data: FormData): void => {
  formRef.value?.setData?.(data);
};

/**
 * 提交爱心表单
 * @description 对外暴露的方法，供父组件调用
 */
const submitLoveForm = async (
  formData: { list: IFormListItem[]; res: FormData },
  options: {
    category: string;
    patientId?: string;
    hosId?: string;
    hosName?: string;
    deptId?: string;
    deptName?: string;
  }
): Promise<{ success: boolean; message: string }> => {
  // TODO: 实现提交逻辑
  console.log('[FormBox] submitLoveForm', formData, options);
  return { success: true, message: '提交成功' };
};

/**
 * 检查是否已提交
 * @description 对外暴露的方法，供父组件调用
 */
const checkLoveSubmitted = async (
  category: string,
  patientName?: string
): Promise<{ submitted: boolean; message?: string }> => {
  // TODO: 实现检查逻辑
  console.log('[FormBox] checkLoveSubmitted', category, patientName);
  return { submitted: false };
};

// ==================== 暴露方法 ====================

defineExpose({
  init,
  setData,
  submitLoveForm,
  checkLoveSubmitted,
});
</script>

<style lang="scss" scoped>
.form-box {
  width: 100%;
  min-height: 100vh;
  background-color: var(--hr-neutral-color-1, #f5f5f5);
}
</style>
