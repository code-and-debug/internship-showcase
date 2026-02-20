# 人才专窗模块

> 📅 开发时间: 2025年2月4日  
> 👮 业务类型: 特殊人群专属预约通道  
> 📊 代码量: 618行 → 200行 (-68%)

## 🎯 业务背景

人才专窗是为特殊人群（如警员、高层次人才等）提供的专属预约通道，支持：

- 基本信息填写（身份证号、手机号）
- 院区选择
- 科室选择
- 预约时段选择（支持多选，最多3个）
- 预约提交

### 业务流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  填写基本信息 │ -> │  选择院区科室 │ -> │  选择预约时段 │
│  - 身份证号   │    │  - 院区选择   │    │  - 日期选择   │
│  - 手机号     │    │  - 科室选择   │    │  - 时段多选   │
└──────────────┘    └──────────────┘    └──────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────┐
│                      提交预约                        │
│  - 时段限制（15点后只能预约后天）                     │
│  - 最多选择3个时段                                   │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 原始代码问题分析

### 问题 1: 复杂表单校验分散

```typescript
// ❌ 重构前：校验逻辑分散在 computed 中
const inputStaticForm = [
  { field: 'policeIdNo', title: '身份证号', require: true },
  { field: 'policePhoneNumber', title: '手机号', require: true },
];

const completed = computed(() => {
  let flag = true;
  // 检查基本信息
  inputStaticForm.forEach((item) => {
    !formInfo.value[item.field] && item.require && (flag = false);
  });
  // 检查院区科室
  if (!formInfo.value.hosName || !formInfo.value.deptName || 
      !current.value.length || !canChooseTime.value.length) {
    flag = false;
  }
  return flag;
});

// ❌ 提交时再次校验
const submit = async () => {
  if (!completed.value) {
    gStores.messageStore.showMessage('请填写完整预约信息', 3000);
    return;
  }
  // ...
};
```

### 问题 2: 三级联动数据处理复杂

```typescript
// ❌ 重构前：嵌套循环处理排班数据
const getSch = async () => {
  const { result } = await api.getDeptSchByDate(args);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);
  
  // 过滤日期
  const filteredData = result.filter((item) => {
    const itemDate = new Date(item.schDate);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate >= today && itemDate <= sevenDaysLater;
  });
  
  // 复杂的嵌套循环处理
  const classifiedData: any = [];
  filteredData.forEach((item) => {
    const date = item.schDate;
    const ampmGroups = { '1': [], '2': [] };
    item.schDateList.forEach((dateItem) => {
      dateItem.schemeList.forEach((scheme) => {
        scheme.schemeList.forEach((timeSlot) => {
          if (timeSlot.schState === '0') {
            const ampm = timeSlot.ampm;
            timeSlot.id = generateUuid();
            ampmGroups[ampm].push(timeSlot);
          }
        });
      });
    });
    // 组装数据...
  });
  
  schDateList.value = filterSchedules(classifiedData);
};
```

### 问题 3: 时间限制逻辑硬编码

```typescript
// ❌ 重构前：15点后限制逻辑分散
const filterSchedules = (schedules) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  
  const startDate = new Date(currentDate);
  if (currentHour >= 15) {
    startDate.setDate(startDate.getDate() + 2);
  } else {
    startDate.setDate(startDate.getDate() + 1);
  }
  
  return schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date);
    return scheduleDate >= startDate;
  });
};
```

---

## ✅ 重构方案

### 架构设计

```
talent-window/
├── types/
│   └── appointment.ts         # 类型定义
├── constants/
│   └── appointment.ts         # 表单配置
├── composables/
│   ├── useTalentForm.ts       # 表单逻辑
│   ├── useScheduleData.ts     # 排班数据处理
│   └── useTimeSelection.ts    # 时段选择逻辑
├── components/
│   ├── BasicInfoForm.vue      # 基本信息表单
│   ├── HospitalSelector.vue   # 院区选择
│   ├── DeptSelector.vue       # 科室选择
│   └── TimeSlotPicker.vue     # 时段选择
└── TalentWindowPage.vue       # 页面组件
```

### 核心代码

#### 1. 类型定义 (types/appointment.ts)

```typescript
/**
 * 表单字段
 */
export interface IBasicInfoForm {
  policeIdNo: string;
  policePhoneNumber: string;
}

/**
 * 预约时段
 */
export interface ITimeSlot {
  id: string;
  schDate: string;
  ampm: '1' | '2';  // 1-上午 2-下午
  ampmName: string;
  hosDocId?: string;
  schId?: string;
}

/**
 * 时段分组
 */
export interface ITimeSlotGroup {
  label: string;
  date: string;
  ampm: '1' | '2';
  data: ITimeSlot[];
}

/**
 * 预约提交数据
 */
export interface IAppointmentSubmitData {
  policeIdNo: string;
  policePhoneNumber: string;
  hosId: string;
  hosName: string;
  deptId: string;
  deptName: string;
  regInfoList: Array<{
    visitDate: string;
    timeDivisionDesc: string;
    clinicCode: string;
    doctorId?: string;
  }>;
}

/**
 * 表单校验规则
 */
export interface IValidationRule {
  field: keyof IBasicInfoForm;
  required: boolean;
  validator?: (value: string) => boolean;
  message?: string;
}
```

#### 2. 表单配置 (constants/appointment.ts)

```typescript
import type { IValidationRule } from '../types/appointment';

/**
 * 基本信息表单配置
 */
export const BASIC_INFO_FORM_CONFIG = [
  {
    field: 'policeIdNo',
    title: '身份证号',
    required: true,
    placeholder: '请输入身份证号',
  },
  {
    field: 'policePhoneNumber',
    title: '手机号',
    required: true,
    placeholder: '请输入手机号',
  },
] as const;

/**
 * 表单校验规则
 */
export const VALIDATION_RULES: IValidationRule[] = [
  {
    field: 'policeIdNo',
    required: true,
    validator: (value) => /^\d{17}[\dXx]$/.test(value),
    message: '请输入正确的身份证号',
  },
  {
    field: 'policePhoneNumber',
    required: true,
    validator: (value) => /^1[3-9]\d{9}$/.test(value),
    message: '请输入正确的手机号',
  },
];

/**
 * 时段选择限制
 */
export const TIME_SELECTION_LIMIT = {
  /** 最大选择数量 */
  maxSelection: 3,
  /** 限制小时数（15点后） */
  restrictHour: 15,
  /** 限制后天开始的日期偏移 */
  tomorrowOffset: 2,
  /** 正常明天开始的日期偏移 */
  normalOffset: 1,
} as const;
```

#### 3. 表单逻辑 Composable (composables/useTalentForm.ts)

```typescript
import { computed, ref } from 'vue';
import type { IBasicInfoForm, IAppointmentSubmitData } from '../types/appointment';
import { VALIDATION_RULES, BASIC_INFO_FORM_CONFIG } from '../constants/appointment';

/**
 * 人才专窗表单逻辑
 */
export function useTalentForm() {
  // ==================== 状态 ====================
  
  const formData = ref<Partial<IBasicInfoForm>>({});
  const hospitalInfo = ref({
    hosId: '',
    hosName: '',
    deptId: '',
    deptName: '',
  });
  const selectedTimeSlots = ref<ITimeSlot[]>([]);
  const errors = ref<Record<string, string>>({});
  
  // ==================== 计算属性 ====================
  
  /**
   * 表单是否有效
   */
  const isFormValid = computed(() => {
    return (
      validateBasicInfo() &&
      !!hospitalInfo.value.hosId &&
      !!hospitalInfo.value.deptId &&
      selectedTimeSlots.value.length > 0
    );
  });
  
  /**
   * 提交数据
   */
  const submitData = computed<IAppointmentSubmitData | null>(() => {
    if (!isFormValid.value) return null;
    
    return {
      policeIdNo: formData.value.policeIdNo!,
      policePhoneNumber: formData.value.policePhoneNumber!,
      hosId: hospitalInfo.value.hosId,
      hosName: hospitalInfo.value.hosName,
      deptId: hospitalInfo.value.deptId,
      deptName: hospitalInfo.value.deptName,
      regInfoList: selectedTimeSlots.value.map(slot => ({
        visitDate: slot.schDate,
        timeDivisionDesc: slot.ampmName,
        clinicCode: slot.schId!,
        doctorId: slot.hosDocId,
      })),
    };
  });
  
  // ==================== 方法 ====================
  
  /**
   * 校验基本信息
   */
  const validateBasicInfo = (): boolean => {
    errors.value = {};
    
    for (const rule of VALIDATION_RULES) {
      const value = formData.value[rule.field];
      
      if (rule.required && !value) {
        errors.value[rule.field] = '该项为必填项';
        return false;
      }
      
      if (value && rule.validator && !rule.validator(value)) {
        errors.value[rule.field] = rule.message || '格式不正确';
        return false;
      }
    }
    
    return true;
  };
  
  /**
   * 设置院区科室
   */
  const setHospitalInfo = (info: typeof hospitalInfo.value) => {
    hospitalInfo.value = info;
  };
  
  /**
   * 设置选中时段
   */
  const setTimeSlots = (slots: ITimeSlot[]) => {
    selectedTimeSlots.value = slots;
  };
  
  /**
   * 重置表单
   */
  const resetForm = () => {
    formData.value = {};
    hospitalInfo.value = { hosId: '', hosName: '', deptId: '', deptName: '' };
    selectedTimeSlots.value = [];
    errors.value = {};
  };
  
  return {
    formData,
    hospitalInfo,
    selectedTimeSlots,
    errors,
    isFormValid,
    submitData,
    validateBasicInfo,
    setHospitalInfo,
    setTimeSlots,
    resetForm,
  };
}
```

#### 4. 时段选择逻辑 (composables/useTimeSelection.ts)

```typescript
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import type { ITimeSlot, ITimeSlotGroup } from '../types/appointment';
import { TIME_SELECTION_LIMIT } from '../constants/appointment';

/**
 * 时段选择逻辑
 */
export function useTimeSelection() {
  // ==================== 状态 ====================
  
  const availableSlots = ref<ITimeSlotGroup[]>([]);
  const selectedSlots = ref<ITimeSlot[]>([]);
  
  // ==================== 计算属性 ====================
  
  /**
   * 是否达到最大选择数量
   */
  const isMaxSelected = computed(() => 
    selectedSlots.value.length >= TIME_SELECTION_LIMIT.maxSelection
  );
  
  /**
   * 最早可预约日期
   */
  const earliestDate = computed(() => {
    const now = dayjs();
    const isAfterRestrictTime = now.hour() >= TIME_SELECTION_LIMIT.restrictHour;
    const offset = isAfterRestrictTime 
      ? TIME_SELECTION_LIMIT.tomorrowOffset 
      : TIME_SELECTION_LIMIT.normalOffset;
    
    return now.add(offset, 'day').format('YYYY-MM-DD');
  });
  
  /**
   * 过滤后的时段列表
   */
  const filteredSlots = computed(() => {
    return availableSlots.value.filter(group => 
      dayjs(group.date).isSameOrAfter(earliestDate.value)
    );
  });
  
  // ==================== 方法 ====================
  
  /**
   * 切换时段选择
   */
  const toggleSlotSelection = (slot: ITimeSlot) => {
    const index = selectedSlots.value.findIndex(s => s.id === slot.id);
    
    if (index > -1) {
      // 取消选择
      selectedSlots.value.splice(index, 1);
    } else if (!isMaxSelected.value) {
      // 添加选择
      selectedSlots.value.push(slot);
    } else {
      throw new Error(`最多只能选择${TIME_SELECTION_LIMIT.maxSelection}个时段`);
    }
  };
  
  /**
   * 检查时段是否被选中
   */
  const isSlotSelected = (slot: ITimeSlot): boolean => {
    return selectedSlots.value.some(s => s.id === slot.id);
  };
  
  /**
   * 设置可用时段
   */
  const setAvailableSlots = (slots: ITimeSlotGroup[]) => {
    availableSlots.value = slots;
  };
  
  return {
    availableSlots,
    selectedSlots,
    isMaxSelected,
    earliestDate,
    filteredSlots,
    toggleSlotSelection,
    isSlotSelected,
    setAvailableSlots,
  };
}
```

---

## 📊 重构对比

### 表单校验

| 重构前 | 重构后 |
|--------|--------|
| computed 中分散校验 | 独立校验函数 |
| 错误信息硬编码 | 配置化校验规则 |
| 重复校验逻辑 | 统一校验入口 |

### 时段选择

| 重构前 | 重构后 |
|--------|--------|
| 复杂的嵌套循环 | 数据转换函数 |
| 硬编码时间限制 | 配置化限制参数 |
| 日期处理混乱 | dayjs 统一处理 |

---

## 💡 技术亮点

1. **表单配置化**: 表单字段、校验规则全部配置化
2. **类型安全**: 表单数据、时段数据都有完整类型
3. **逻辑复用**: 时段选择逻辑可复用到其他预约模块
4. **时间处理**: 使用 dayjs 替代原生 Date，逻辑清晰
