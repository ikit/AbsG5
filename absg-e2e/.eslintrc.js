module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        // 'eslint:recommended'
        // 'plugin:vue/essential',
        // '@vue/standard'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'comma-dangle': ["warn", "only-multiline"],
        'semi': process.env.NODE_ENV === 'production' ? ["error", "always"] : ["off"] ,
        'indent': ["off"],
        'no-multiple-empty-lines': ["error", { max: 3, maxEOF: 1 }],
        'eslint-disable-next-line': "off"

    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
