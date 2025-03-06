// eslint.config.js
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    ignores: ['node_modules', 'dist', 'webpack.config.js']
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      // 環境設定を直接指定する
      globals: {
        // ブラウザのグローバル変数
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        // ES2021のグローバル変数
        Promise: 'readonly',
        Map: 'readonly',
        Set: 'readonly'
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    },
    // ESLint v9の環境設定方法
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    // 環境設定
    env: {
      browser: true,
      es2021: true
    }
  },
  prettierConfig
];
