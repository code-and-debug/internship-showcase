/**
 * @file types/human-only/core-contracts.ts
 * @maintainer @yourname
 * @reviewed 2025-01-15
 * 
 * ⚠️ HUMAN ONLY - AI DO NOT MODIFY
 */

// ===== Branded Types =====

export type VerifiedPatientId = string & { readonly __brand: 'VerifiedPatientId' };
export type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' };

export function createVerifiedPatientId(id: string): VerifiedPatientId {
  if (!/^P\d{8}$/.test(id)) {
    throw new Error(`Invalid patient ID format: ${id}`);
  }
  return id as VerifiedPatientId;
}

export function createISOTimestamp(date: Date): ISOTimestamp {
  return date.toISOString() as ISOTimestamp;
}

// ===== 状态机定义 =====

export const HospitalStatus = {
  REGISTERED: 1,
  ADMITTED: 2,
  IN_TREATMENT: 3,
  DISCHARGED: 4,
} as const;

export type HospitalStatus = typeof HospitalStatus[keyof typeof HospitalStatus];

export const VALID_TRANSITIONS: Record<HospitalStatus, HospitalStatus[]> = {
  [HospitalStatus.REGISTERED]: [HospitalStatus.ADMITTED],
  [HospitalStatus.ADMITTED]: [HospitalStatus.IN_TREATMENT],
  [HospitalStatus.IN_TREATMENT]: [HospitalStatus.DISCHARGED],
  [HospitalStatus.DISCHARGED]: [],
};

// ===== 核心业务契约 =====

export interface IHospitalizationWorkflow {
  patientId: VerifiedPatientId;
  currentStatus: HospitalStatus;
  statusHistory: Array<{
    status: HospitalStatus;
    timestamp: ISOTimestamp;
    operatorId: string;
  }>;
  appointmentConstraints: {
    cutoffTime: '15:00';
    maxAdvanceDays: 7;
  };
}

// ===== 错误类型 =====

export class IllegalTransitionError extends Error {
  constructor(
    public readonly from: HospitalStatus,
    public readonly to: HospitalStatus,
    public readonly validTargets: readonly HospitalStatus[]
  ) {
    super(
      `Illegal state transition: ${from} -> ${to}. ` +
      `Valid targets: [${validTargets.join(', ')}]`
    );
    this.name = 'IllegalTransitionError';
  }
}

export class TimeConstraintError extends Error {
  constructor(
    public readonly constraint: string,
    public readonly attemptedTime: string
  ) {
    super(`Time constraint violation: ${constraint}`);
    this.name = 'TimeConstraintError';
  }
}
