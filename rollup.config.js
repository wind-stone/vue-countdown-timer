const babel = require('rollup-plugin-babel');
const { pascalCase } = require('change-case');
const name = require('./package.json').name;
const globalVariableName = pascalCase(name);

const banner =`
/**
 * vue-countdown-timer v0.1.0
 * (c) 2020-2020 wind-stone
 * Released under the MIT License.
 */
`;

module.exports = {
    input: 'src/index.js',
    output: [
        {
            banner,
            name: globalVariableName,
            file: `example/${name}.js`,
            format: 'umd',
        },
        {
            banner,
            name: globalVariableName,
            file: `dist/${name}.umd.js`,
            format: 'umd',
        },
        {
            banner,
            file: `dist/${name}.common.js`,
            format: 'cjs',
        },
        {
            banner,
            file: `dist/${name}.esm.js`,
            format: 'esm',
        }
    ],
    plugins: [
        babel(),
    ]
};
