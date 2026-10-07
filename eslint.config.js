import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import prettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const sharedApiInternals = {
    // The alias deep path, or any relative path into an api/ folder.
    regex: String.raw`^(@/shared/api/|(\.{1,2}/)+(shared/)?api(/|$))`,
    message: "Import from '@/shared/api' only; its internals are private.",
}

// Features have their own api/ folder, so only a path into shared/api counts.
const sharedApiInternalsFromFeature = {
    ...sharedApiInternals,
    regex: String.raw`^(@/shared/api/|(\.{1,2}/)+shared/api(/|$))`,
}

const otherFeatures = {
    regex: String.raw`^@/features/`,
    message: 'A feature never imports another feature; move shared code to src/shared/.',
}

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
        files: ['src/**/*.{ts,tsx}'],
        ignores: ['src/shared/api/**', 'src/mocks/**', 'src/test/**', 'src/features/**'],
        rules: { 'no-restricted-imports': ['error', { patterns: [sharedApiInternals] }] },
    },
    {
        files: ['src/features/**/*.{ts,tsx}'],
        rules: {
            'no-restricted-imports': [
                'error',
                { patterns: [sharedApiInternalsFromFeature, otherFeatures] },
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
