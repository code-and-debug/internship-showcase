/**
 * @file types/human-only/{{interface-name}}.ts
 * @maintainer @yourname
 * @reviewed {{date}}
 * 
 * ⚠️ HUMAN ONLY - AI DO NOT MODIFY
 * 本文件定义了AI实现必须遵守的核心契约。
 */

// ===== Branded Types =====

export type Verified{{EntityName}}Id = string & { readonly __brand: 'Verified{{EntityName}}Id' };

export function createVerified{{EntityName}}Id(id: string): Verified{{EntityName}}Id {
  if (!/{{regex}}/.test(id)) {
    throw new Error(`Invalid {{entityName}} ID format: ${id}`);
  }
  return id as Verified{{EntityName}}Id;
}

// ===== 状态枚举 =====

export const {{EntityName}}Status = {
  {{STATUS_A}}: 1,
  {{STATUS_B}}: 2,
  {{STATUS_C}}: 3,
} as const;

export type {{EntityName}}Status = typeof {{EntityName}}Status[keyof typeof {{EntityName}}Status];

export const VALID_TRANSITIONS: Record<{{EntityName}}Status, {{EntityName}}Status[]> = {
  [{{EntityName}}Status.{{STATUS_A}}]: [{{EntityName}}Status.{{STATUS_B}}],
  [{{EntityName}}Status.{{STATUS_B}}]: [{{EntityName}}Status.{{STATUS_C}}],
  [{{EntityName}}Status.{{STATUS_C}}]: [],
};

// ===== 核心业务契约 =====

export interface I{{EntityName}}Workflow {
  id: Verified{{EntityName}}Id;
  currentStatus: {{EntityName}}Status;
  history: Array<{
    status: {{EntityName}}Status;
    timestamp: string;
    operatorId: string;
  }>;
  constraints: {
    // 业务规则
  };
}

// ===== 错误类型 =====

export class Illegal{{EntityName}}TransitionError extends Error {
  constructor(
    public readonly from: {{EntityName}}Status,
    public readonly to: {{EntityName}}Status,
    public readonly validTargets: readonly {{EntityName}}Status[]
  ) {
    super(
      `Illegal state transition: ${from} -> ${to}. ` +
      `Valid targets: [${validTargets.join(', ')}]`
    );
    this.name = 'Illegal{{EntityName}}TransitionError';
  }
}
