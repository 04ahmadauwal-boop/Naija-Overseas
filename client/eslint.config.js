import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // These new v7 rules are too strict for this codebase's valid data-fetching patterns
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      // Allow non-component exports alongside components (e.g. AuthContext)
      'react-refresh/only-export-components': 'off',
      // Allow intentionally-unused variables when prefixed with _
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      // Assigning to ref.current is standard React — this rule produces false positives
      'react-hooks/immutability': 'off',
    },
  },
])
