/**
 * V.A.R.框架 - AI代码专用ESLint规则
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // ===== VERIFIABLE =====
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    'complexity': ['error', 10],
    'max-nested-callbacks': ['error', 3],
    'max-lines-per-function': ['error', { max: 50, skipComments: true }],
    'no-magic-numbers': ['error', { ignore: [0, 1, -1], enforceConst: true }],
    'eqeqeq': ['error', 'always'],
    
    // ===== AUDITABLE =====
    'require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
      },
    }],
    'func-names': ['error', 'always'],
    
    // ===== RECOVERABLE =====
    '@typescript-eslint/no-throw-literal': 'error',
    '@typescript-eslint/prefer-promise-reject-errors': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
  },
  overrides: [
    {
      files: ['types/human-only/**', 'src/types/human-only/**'],
      rules: {
        'require-jsdoc': 'off',
        'no-magic-numbers': 'off',
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      rules: {
        'no-magic-numbers': 'off',
        'max-lines-per-function': 'off',
      },
    },
  ],
};
