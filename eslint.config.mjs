// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
  eslint.configs.recommended,
  tsEslint.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node
      },
      sourceType: "module"
    },
    rules: {
      "@typescript-eslint/no-explicit-any": 1,
      "@typescript-eslint/no-require-imports": 0,
      "@typescript-eslint/no-unused-vars": 1,
    }
  }
);
