/**
 * ============================================================================
 * 用药管理模块 - 类型定义文件
 * ============================================================================
 * 
 * 本文件集中定义了用药管理模块涉及的所有 TypeScript 类型，包括：
 * - 用药提醒数据结构
 * - 历史处方数据结构  
 * - 表单数据结构
 * - 组件 Props 类型
 * - API 请求/响应类型
 * 
 * 使用场景：
 * 当需要了解某个数据结构的字段含义时，查看此文件
 * 当需要为变量/参数添加类型时，从此文件导入对应类型
 * ============================================================================
 */

// ============================================
// 基础类型定义
// ============================================

/**
 * 通用选项类型
 * 用于下拉选择器、单选按钮组等组件
 * 
 * 使用场景：
 * - 用药途径选项（口服、注射、外用等）
 * - 药品用法选项（饭前、饭后、睡前等）
 * - 药品单位选项（片、粒、毫升等）
 * - 用药频次选项（每日一次、每日两次等）
 * 
 * @example
 * const options: IHOption = [
 *   { label: '口服', value: 'oral' },
 *   { label: '注射', value: 'injection' }
 * ]
 */
export interface IHOptionItem {
  /** 显示文本 */
  label: string;
  /** 选项值 */
  value: string;
  /** 是否禁用（可选） */
  disabled?: boolean;
  /** 其他扩展字段 */
  [key: string]: any;
}

/** 选项数组类型 */
export type IHOption = IHOptionItem[];

/**
 * 用药提醒状态枚举
 * 
 * 使用场景：
 * - 在列表页显示不同的状态标签
 * - 筛选不同状态的用药提醒
 */
export enum EMedicationStatus {
  /** 执行中 - 绿色标签 */
  RUNNING = 1,
  /** 待执行 - 蓝色标签 */
  PENDING = 2,
  /** 已关闭 - 灰色标签 */
  CLOSED = 3,
}

/**
 * 页面类型枚举
 * 
 * 使用场景：
 * - MedicationForm.vue 页面根据此类型判断是新增还是编辑
 * - 控制页面标题（新增提醒/编辑提醒）
 * - 控制是否显示删除按钮
 */
export enum EPageType {
  /** 新增模式 */
  ADD = 'add',
  /** 编辑模式 */
  EDIT = 'edit',
}

// ============================================
// 用药提醒相关类型
// ============================================

/**
 * 用药提醒主数据结构
 * 对应后端返回的用药提醒记录
 * 
 * 使用场景：
 * - 列表页展示的数据
 * - 编辑时填充表单的数据
 * - 提交到后端保存的数据
 * 
 * 业务流程关联：
 * 1. 列表页 (MedicationList.vue) 获取 IMedication[] 数组并渲染
 * 2. 用户点击编辑时，将选中的 IMedication 存入 store.checkItem
 * 3. 表单页 (MedicationForm.vue) 从 store 读取并填充表单
 * 4. 保存时将表单数据转换回 IMedication 提交到后端
 */
export interface IMedication {
  /** 唯一标识符数组（字符串数组格式，后端设计） */
  id: string[];
  
  /** 处方编号，用于关联处方 */
  recipeNo: string;
  
  /** 药品/处方名称（如"阿莫西林胶囊"或"高血压处方"） */
  recipeName: string;
  
  /** 使用途径（如"口服"、"静脉注射"） */
  useDrugWay: string;
  
  /** 药品用法（如"饭后服用"、"睡前服用"） */
  useDrugUses: string;
  
  /** 单次用量数值（如"2"） */
  useDrugAmount: string;
  
  /** 单次用量单位（如"片"、"粒"、"ml"） */
  useDrugUnit: string;
  
  /** 用药频次（如"每日一次"、"每日三次"） */
  useDrugFrequency: string;
  
  /** 提醒开始日期（格式：YYYY-MM-DD） */
  startDate: string;
  
  /** 提醒结束日期（格式：YYYY-MM-DD） */
  endDate: string;
  
  /** 每日提醒时间数组（如["08:00", "12:00", "18:00"]） */
  notifyTime: string[];
  
  /** 备注信息 */
  remark: string;
  
  /** 是否关闭：0=开启，1=关闭 */
  isClose: 0 | 1;
  
  /** 状态：1=执行中，2=待执行，3=已关闭 */
  status: EMedicationStatus;
}

/**
 * 用药提醒表单数据结构
 * 用于表单页面收集用户输入
 * 
 * 与 IMedication 的区别：
 * - dateRange 是数组格式 [startDate, endDate]，方便日期选择器使用
 * - notifyTime 是 IHOption 格式，支持标签化展示
 * 
 * 使用场景：
 * - MedicationForm.vue 中定义表单响应式数据
 * - 表单验证时检查此结构
 * - 提交前转换为 IMedication 格式
 */
export interface IMedicationFormData {
  /** 唯一标识符（编辑时使用） */
  id?: string[];
  
  /** 处方编号 */
  recipeNo: string;
  
  /** 药品名称 */
  recipeName: string;
  
  /** 使用途径 */
  useDrugWay: string;
  
  /** 药品用法 */
  useDrugUses: string;
  
  /** 单次用量 */
  useDrugAmount: string;
  
  /** 单位 */
  useDrugUnit: string;
  
  /** 用药频次 */
  useDrugFrequency: string;
  
  /** 日期范围 [开始日期, 结束日期] */
  dateRange: [string, string] | string[];
  
  /** 提醒时间选项数组 */
  notifyTime: IHOption;
  
  /** 备注 */
  remark: string;
}

// ============================================
// 历史处方相关类型
// ============================================

/**
 * 药品详情数据结构
 * 对应处方中的单个药品信息
 * 
 * 使用场景：
 * - 历史处方详情展开后展示药品列表
 * - 点击"添加"时将数据传递到表单页预填充
 * 
 * 业务流程关联：
 * 1. 用户展开某条处方
 * 2. 调用 API 获取该处方下的药品详情列表 TDrugDetailItem[]
 * 3. 展示药品信息，提供"添加"按钮
 * 4. 点击添加后，将 TDrugDetailItem 存入 store.addItem
 * 5. 跳转到表单页，读取 store.addItem 预填充表单
 */
export interface TDrugDetailItem {
  /** 药品编码 */
  drugCode: string;
  
  /** 药品名称 */
  drugName: string;
  
  /** 规格（如"0.25g*24粒"） */
  itemSpec: string;
  
  /** 单次用量数值 */
  amount: string;
  
  /** 单次用量单位（包装单位） */
  packageUnits: string;
  
  /** 剂量单位 */
  drugUnit: string;
  
  /** 基本单位 */
  units: string;
  
  /** 单位（兼容字段） */
  unit: string;
  
  /** 频次 */
  frequency: string;
  
  /** 用法 */
  use: string;
  
  /** 途径 */
  road: string;
  
  /** 数量（如开药数量） */
  quantity: string;
  
  /** 中药特有：包含的子药品列表 */
  drugDetailList?: TDrugDetailItem[];
}

/**
 * 历史处方单项数据结构
 * 对应医院处方记录
 * 
 * 使用场景：
 * - 历史处方列表页展示
 * - 点击展开查看处方详情
 */
export interface TMedicalDrugHisListItem {
  /** 处方ID（唯一编码） */
  prescId: string;
  
  /** 处方号（展示用） */
  prescNo: string;
  
  /** 就诊类型：1=门诊处方，2=出院带药 */
  visitType: '1' | '2';
  
  /** 处方类型编码：0=西药，1=中药 */
  prescTypeCode: '0' | '1';
  
  /** 处方类型名称 */
  drugTypeName: string;
  
  /** 开单日期（格式：YYYY-MM-DD） */
  prescDate: string;
  
  /** 开单时间（完整时间） */
  prescTime: string;
  
  /** 医院ID */
  hosId: string;
  
  /** 医院名称 */
  hosName: string;
  
  /** 科室名称 */
  deptName: string;
  
  /** 医生姓名 */
  docName: string;
  
  /** 发药药房名称 */
  dispensaryName: string;
  
  /** 配药类型 */
  dispensingType: string;
  
  /** 药品使用方法（汇总） */
  usage: string;
  
  /** 药品详情列表（懒加载） */
  drugDetailList: TDrugDetailItem[];
}

/**
 * 历史处方按日期分组的数据结构
 * 
 * 使用场景：
 * - 历史处方列表按日期分组展示
 * - 如"2024-01-15"下面有3条处方记录
 * 
 * @example
 * [
 *   {
 *     date: '2024-01-15',
 *     prescList: [处方1, 处方2, 处方3]
 *   },
 *   {
 *     date: '2024-01-10',
 *     prescList: [处方4]
 *   }
 * ]
 */
export interface TMedicalDrugHisGroup {
  /** 日期字符串 */
  date: string;
  
  /** 该日期下的处方列表 */
  prescList: TMedicalDrugHisListItem[];
}

/** 历史处方列表类型 */
export type TMedicalDrugHisList = TMedicalDrugHisGroup[];

// ============================================
// 系统配置相关类型
// ============================================

/**
 * 用药管理模块系统配置
 * 控制功能开关，从后端配置读取
 * 
 * 使用场景：
 * - 控制是否显示"自定义提醒"入口
 * - 控制是否显示"本院处方"入口
 * - 在新增提醒时决定是直接进入表单还是显示选择菜单
 * 
 * 业务流程关联：
 * 1. 页面加载时调用 getConfig() 获取配置
 * 2. 根据配置决定入口展示
 * 3. 如果两者都关闭，可能提示用户功能未开启
 */
export interface IMedicationConfig {
  /** 是否开启自定义提醒：1=开启，0=关闭 */
  isOpenCustom: '0' | '1';
  
  /** 是否开启历史处方：1=开启，0=关闭 */
  isOpenHistory: '0' | '1';
}

/**
 * 新增用药提醒的入口选项
 * 用于 ActionSheet 组件显示
 * 
 * 使用场景：
 * 当 isOpenCustom 和 isOpenHistory 都开启时，
 * 点击"新增提醒"按钮弹出 ActionSheet 让用户选择添加方式
 */
export interface IAddMedicalWayItem {
  /** 显示文本 */
  label: string;
  
  /** 文字颜色 */
  color: string;
  
  /** 文字大小 */
  fontSize: string;
  
  /** 是否禁用 */
  disabled: boolean;
  
  /** 选项标识：custom=自定义，prescription=本院处方 */
  key: 'custom' | 'prescription';
}

// ============================================
// API 相关类型
// ============================================

/**
 * 获取用药提醒列表请求参数
 */
export interface IGetMedicationListParams {
  /** 患者ID */
  patientId: string;
}

/**
 * 获取历史处方列表请求参数
 */
export interface IGetMedicationHistoryParams {
  /** 患者ID */
  patientId: string;
  
  /** 就诊类型 */
  visitType: string;
  
  /** 查询开始时间 */
  startTime: string;
  
  /** 查询结束时间 */
  endTime: string;
}

/**
 * 获取处方详情请求参数
 */
export interface IGetPrescriptionDetailParams {
  /** 患者ID */
  patientId: string;
  
  /** 处方ID */
  prescId: string;
  
  /** 处方日期 */
  prescDate: string;
  
  /** 配药类型 */
  dispensingType: string;
}

/**
 * 删除/关闭用药提醒请求参数
 */
export interface IDeleteMedicationParams {
  /** 要操作的提醒ID数组 */
  id: string[];
  
  /** 患者ID */
  patientId: string;
}

/**
 * 保存用药提醒请求参数
 */
export interface ISaveMedicationParams {
  /** 唯一标识符（编辑时必传） */
  id?: string[];
  
  /** 处方编号 */
  recipeNo: string;
  
  /** 药品名称 */
  recipeName: string;
  
  /** 使用途径 */
  useDrugWay: string;
  
  /** 药品用法 */
  useDrugUses: string;
  
  /** 单次用量 */
  useDrugAmount: string;
  
  /** 单位 */
  useDrugUnit: string;
  
  /** 用药频次 */
  useDrugFrequency: string;
  
  /** 开始日期 */
  startDate: string;
  
  /** 结束日期 */
  endDate: string;
  
  /** 提醒时间数组 */
  notifyTime: string[];
  
  /** 备注 */
  remark: string;
  
  /** 患者ID */
  patientId: string;
  
  /** 医院ID */
  hosId: string;
}

// ============================================
// 组件 Props 类型
// ============================================

/**
 * 用药提醒列表项组件 Props
 * @see MedicationListItem.vue
 */
export interface IMedicationListItemProps {
  /** 用药提醒数据 */
  item: IMedication;
  
  /** 是否禁用点击（管理模式时使用） */
  disabled?: boolean;
}

/**
 * 处方折叠面板组件 Props
 * @see MedicalCollapse.vue
 */
export interface IMedicalCollapseProps {
  /** 处方数据 */
  item: TMedicalDrugHisListItem;
  
  /** 是否默认展开 */
  open?: boolean;
}

/**
 * 选择器组件 Props
 * @see MedicationSelect.vue / MedicationPopup.vue
 */
export interface ISelectProps {
  /** 当前选中的值 */
  value: string | string[];
  
  /** 选项列表 */
  option: IHOption;
  
  /** 列数（每行显示几个选项） */
  column?: number;
  
  /** 标题 */
  title?: string;
  
  /** 占位提示文本 */
  placeholder?: string;
  
  /** 是否禁用 */
  disabled?: boolean;
  
  /** 是否多选 */
  multiple?: boolean;
}

/**
 * 标签容器组件 Props
 * @see MedicationTagContainer.vue
 */
export interface ITagContainerProps {
  /** 当前选中的值 */
  value: string | string[];
  
  /** 选项列表 */
  option: IHOption;
  
  /** 列数 */
  column?: number;
  
  /** 是否多选 */
  multiple?: boolean;
  
  /** 是否禁用 */
  disabled?: boolean;
  
  /** 是否显示删除图标 */
  showDelIcon?: boolean;
  
  /** 是否全部高亮（用于提醒时间标签） */
  isAllActive?: boolean;
}
