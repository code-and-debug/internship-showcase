/**
 * V.A.R.框架 - 特性开关配置
 */

export interface FeatureFlags {
  useAIPatientQuestionnaire: boolean;
  useAICalculateScore: boolean;
  useAIHospitalWorkflow: boolean;
  fallbackToLegacy: boolean;
  enableAICodeAudit: boolean;
}

export const defaultFlags: FeatureFlags = {
  useAIPatientQuestionnaire: false,
  useAICalculateScore: false,
  useAIHospitalWorkflow: false,
  fallbackToLegacy: false,
  enableAICodeAudit: true,
};

function getEnvFlag(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

export function getFeatureFlags(): FeatureFlags {
  return {
    useAIPatientQuestionnaire: getEnvFlag('FF_AI_QUESTIONNAIRE', defaultFlags.useAIPatientQuestionnaire),
    useAICalculateScore: getEnvFlag('FF_AI_CALC_SCORE', defaultFlags.useAICalculateScore),
    useAIHospitalWorkflow: getEnvFlag('FF_AI_WORKFLOW', defaultFlags.useAIHospitalWorkflow),
    fallbackToLegacy: getEnvFlag('FF_FALLBACK', defaultFlags.fallbackToLegacy),
    enableAICodeAudit: getEnvFlag('FF_AI_AUDIT', defaultFlags.enableAICodeAudit),
  };
}

export interface ImplementationPair<T> {
  ai: T;
  legacy: T;
}

export function selectImplementation<T>(
  flag: keyof FeatureFlags,
  implementations: ImplementationPair<T>,
  options: {
    onFallback?: (reason: string) => void;
    validateAI?: (impl: T) => boolean;
  } = {}
): T {
  const flags = getFeatureFlags();
  
  if (flags.fallbackToLegacy) {
    options.onFallback?.('Global fallback flag is active');
    return implementations.legacy;
  }
  
  if (!flags[flag]) {
    return implementations.legacy;
  }
  
  try {
    if (options.validateAI && !options.validateAI(implementations.ai)) {
      options.onFallback?.('AI implementation validation failed');
      return implementations.legacy;
    }
    return implementations.ai;
  } catch (error) {
    options.onFallback?.(`AI implementation error: ${error}`);
    return implementations.legacy;
  }
}

export function isAIFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return getFeatureFlags()[flag];
}

export function shouldUseFallback(): boolean {
  return getFeatureFlags().fallbackToLegacy;
}

export function logFeatureFlags(): void {
  const flags = getFeatureFlags();
  console.log('[FeatureFlags] Current configuration:');
  Object.entries(flags).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}
