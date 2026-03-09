/**
 * @file services/ai-generated/transition-status.ts
 * @generator AI (Claude-3.5-Sonnet)
 * @prompt-hash a3f5d2e8
 * @prompt-version 1.2.0
 * @context-files types/human-only/core-contracts.ts
 * @confidence high
 * @reviewer @zhangsan
 * @review-status approved
 * @generated-at 2025-01-15T09:23:00Z
 * @manual-override false
 * @business-rule "住院患者15:00后禁止预约次日床位"
 * @test-coverage 100%
 * 
 * @description
 * 实现住院流程状态流转函数，严格遵循状态机契约。
 */

import {
  IHospitalizationWorkflow,
  HospitalStatus,
  VALID_TRANSITIONS,
  createISOTimestamp,
  IllegalTransitionError,
  TimeConstraintError,
} from '../../types/human-only/core-contracts';

export function transitionStatus(
  workflow: IHospitalizationWorkflow,
  targetStatus: HospitalStatus,
  operatorId: string
): IHospitalizationWorkflow {
  const currentStatus = workflow.currentStatus;
  const now = createISOTimestamp(new Date());
  
  // 1. 前置条件检查
  if (!workflow.patientId) {
    throw new Error('Patient ID is required');
  }
  if (!operatorId || operatorId.trim() === '') {
    throw new Error('Operator ID is required');
  }
  if (targetStatus === currentStatus) {
    throw new Error(`Already in status: ${targetStatus}`);
  }
  
  // 2. 状态机规则检查
  const validTargets = VALID_TRANSITIONS[currentStatus];
  if (!validTargets.includes(targetStatus)) {
    throw new IllegalTransitionError(currentStatus, targetStatus, validTargets);
  }
  
  // 3. 时间约束检查
  if (targetStatus === HospitalStatus.ADMITTED) {
    const currentHour = new Date(now).getHours();
    const currentMinute = new Date(now).getMinutes();
    const [cutoffHour, cutoffMinute] = workflow.appointmentConstraints.cutoffTime.split(':').map(Number);
    
    const currentTime = currentHour * 60 + currentMinute;
    const cutoffTime = cutoffHour * 60 + cutoffMinute;
    
    if (currentTime >= cutoffTime) {
      throw new TimeConstraintError(
        `Appointment booking not allowed after ${workflow.appointmentConstraints.cutoffTime}`,
        now
      );
    }
  }
  
  // 4. 执行流转
  return {
    ...workflow,
    currentStatus: targetStatus,
    statusHistory: [
      ...workflow.statusHistory,
      { status: targetStatus, timestamp: now, operatorId },
    ],
  };
}
