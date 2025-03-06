// eslint.config.js
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');

// 設定を簡略化
module.exports = [
  {
    // グローバル設定
    ignores: ['node_modules/**', 'dist/**', 'webpack.config.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // ブラウザとES2021のグローバル変数
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
  }
];
