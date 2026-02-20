/**
 * 通用类型定义
 */

/**
 * 分页参数
 */
export interface IPaginationParams {
  pageNum?: number;
  pageSize?: number;
}

/**
 * 分页结果
 */
export interface IPaginationResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * API 响应
 */
export interface IApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

/**
 * 患者信息
 */
export interface IPatientInfo {
  patientId: string;
  cardNumber: string;
  patientName: string;
  patientSex?: string;
  patientAge?: number;
}

/**
 * 医院信息
 */
export interface IHospitalInfo {
  hosId: string;
  hosName: string;
  aliasName?: string;
}

/**
 * 科室信息
 */
export interface IDepartmentInfo {
  deptId: string;
  deptName: string;
  hosDeptId?: string;
}

/**
 * 加载状态
 */
export interface ILoadingState {
  loading: boolean;
  error: Error | null;
}
