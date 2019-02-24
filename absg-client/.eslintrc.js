module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        '@vue/standard'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'comma-dangle': ["warn", "only-multiline"],
        'semi': ["error", "always"],
        'indent': ["error", 4],
        'no-multiple-empty-lines': ["error", { max: 3, maxEOF: 1 }],
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
