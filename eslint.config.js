import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  { ignores: ['dist', 'node_modules', 'build'] },

  prettierConfig,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },

    plugins: {
      prettier: prettier,
    },

    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': 'error',
    },
  },
]
