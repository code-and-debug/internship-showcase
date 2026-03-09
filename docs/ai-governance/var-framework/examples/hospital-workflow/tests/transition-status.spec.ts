/**
 * @file tests/transition-status.spec.ts
 * V.A.R.框架 - Property-Based Testing示例
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { transitionStatus } from '../services/ai-generated/transition-status';
import {
  HospitalStatus,
  IHospitalizationWorkflow,
  createVerifiedPatientId,
  createISOTimestamp,
  IllegalTransitionError,
  TimeConstraintError,
} from '../types/human-only/core-contracts';

const verifiedPatientIdArbitrary = fc
  .integer({ min: 10000000, max: 99999999 })
  .map(n => createVerifiedPatientId(`P${n}`));

const hospitalStatusArbitrary = fc.constantFrom(
  HospitalStatus.REGISTERED,
  HospitalStatus.ADMITTED,
  HospitalStatus.IN_TREATMENT,
  HospitalStatus.DISCHARGED
);

const workflowArbitrary = fc.record<IHospitalizationWorkflow>({
  patientId: verifiedPatientIdArbitrary,
  currentStatus: hospitalStatusArbitrary,
  statusHistory: fc.array(
    fc.record({
      status: hospitalStatusArbitrary,
      timestamp: fc.date().map(d => createISOTimestamp(d)),
      operatorId: fc.string({ minLength: 1 }),
    }),
    { maxLength: 10 }
  ),
  appointmentConstraints: fc.constant({
    cutoffTime: '15:00' as const,
    maxAdvanceDays: 7,
  }),
});

describe('transitionStatus', () => {
  it('非法状态流转必须抛出错误', () => {
    fc.assert(
      fc.property(
        workflowArbitrary,
        fc.string({ minLength: 1 }),
        fc.integer({ min: 1, max: 4 }),
        (workflow, operatorId, targetStatus) => {
          const validTargets = {
            [HospitalStatus.REGISTERED]: [HospitalStatus.ADMITTED],
            [HospitalStatus.ADMITTED]: [HospitalStatus.IN_TREATMENT],
            [HospitalStatus.IN_TREATMENT]: [HospitalStatus.DISCHARGED],
            [HospitalStatus.DISCHARGED]: [],
          }[workflow.currentStatus];
          
          if (validTargets.includes(targetStatus as HospitalStatus)) {
            return true;
          }
          
          expect(() => {
            transitionStatus(workflow, targetStatus as HospitalStatus, operatorId);
          }).toThrow(IllegalTransitionError);
          
          return true;
        }
      ),
      { numRuns: 1000 }
    );
  });
  
  it('状态历史必须单调递增', () => {
    const workflow: IHospitalizationWorkflow = {
      patientId: createVerifiedPatientId('P12345678'),
      currentStatus: HospitalStatus.REGISTERED,
      statusHistory: [],
      appointmentConstraints: { cutoffTime: '15:00', maxAdvanceDays: 7 },
    };
    
    jest.useFakeTimers().setSystemTime(new Date('2025-01-15T10:00:00Z'));
    
    const result = transitionStatus(workflow, HospitalStatus.ADMITTED, 'doctor001');
    
    jest.useRealTimers();
    
    expect(result.statusHistory.length).toBe(1);
    expect(result.statusHistory[0].status).toBe(HospitalStatus.ADMITTED);
  });
  
  it('15:00后禁止预约', () => {
    const workflow: IHospitalizationWorkflow = {
      patientId: createVerifiedPatientId('P12345678'),
      currentStatus: HospitalStatus.REGISTERED,
      statusHistory: [],
      appointmentConstraints: { cutoffTime: '15:00', maxAdvanceDays: 7 },
    };
    
    jest.useFakeTimers().setSystemTime(new Date('2025-01-15T16:00:00Z'));
    
    expect(() => {
      transitionStatus(workflow, HospitalStatus.ADMITTED, 'doctor001');
    }).toThrow(TimeConstraintError);
    
    jest.useRealTimers();
  });
});
