import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

const isProd = process.env.NODE_ENV === 'production'

export default [
    { ignores: ['dist/', 'node_modules/', 'coverage/', 'public/'] },
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.browser, ...globals.node }
        },
        rules: {
            'no-console': isProd ? 'error' : 'off',
            'no-debugger': isProd ? 'error' : 'off',
            'comma-dangle': ['warn', 'only-multiline'],
            'semi': isProd ? ['error', 'always'] : 'off',
            'indent': 'off',
            'no-multiple-empty-lines': ['error', { max: 3, maxEOF: 1 }],
            'vue/no-v-html': 'off',
            'vue/no-mutating-props': 'off'
        }
    }
]
