module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'eslint-config-windstone-vue'
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: 'babel-eslint'
    },
    env: {
        browser: true,
        node: true
    }
};
