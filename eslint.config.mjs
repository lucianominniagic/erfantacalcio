import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**'],
  },
  js.configs.recommended,
  nextPlugin.flatConfig.recommended,
  nextPlugin.flatConfig.coreWebVitals,
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      semi: ['error', 'never'],
    },
  },
)
