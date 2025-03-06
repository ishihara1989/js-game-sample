// eslint.config.js
const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

// ESLint v9のフラットコンフィグスタイル
module.exports = [
  // グローバル設定
  {
    ignores: ['node_modules/**', 'dist/**', 'webpack.config.js']
  },
  // ベースとなるJavaScriptの推奨設定
  js.configs.recommended,
  // 全ファイル共通設定
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // ブラウザのグローバル変数
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly'
      }
    }
  },
  // TypeScript ファイル用の設定
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  // JavaScript ファイル用の設定
  {
    files: ['**/*.js'],
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  // Prettierの競合設定を上書き
  prettierConfig
];
