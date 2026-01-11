/**
 * Strict ESLint Configuration
 * Use this for final code quality checks
 */

module.exports = {
  extends: ['./eslint.config.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    'no-console': ['warn', {
      allow: ['warn', 'error'],
    }],
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'prefer-destructuring': ['warn', {
      array: false,
      object: true,
    }],
  },
};
