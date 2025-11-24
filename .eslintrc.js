module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'prefer-const': 'off',
    'no-var': 'off',
    'no-console': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unescaped-entities': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    '.next/',
    'node_modules/',
    'out/',
    'build/',
    'dist/',
    '*.config.js',
    '*.config.ts',
  ],
};
