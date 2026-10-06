import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import prettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
    globalIgnores(['dist', 'coverage', '.vitest', 'docs']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            reactHooks.configs.flat['recommended-latest'],
            reactRefresh.configs.vite,
            jsxA11y.flatConfigs.strict,
            pluginQuery.configs['flat/recommended'],
        ],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
            'no-nested-ternary': 'error',
            'no-console': 'error',
        },
    },
    {
        // The API module's internals (request, raw field names) stay behind its index.
        files: ['src/**/*.{ts,tsx}'],
        ignores: ['src/api/**', 'src/mocks/**'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            // The alias deep path, or any relative path into an api/ folder.
                            regex: String.raw`^(@/api/|(\.{1,2}/)+api(/|$))`,
                            message: "Import from '@/api' only; its internals are private.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['eslint.config.js'],
        extends: [js.configs.recommended],
        languageOptions: { globals: globals.node },
    },
    prettier,
])
