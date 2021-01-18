import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import pkg from './package.json';

export default [{
    input: './src/index.ts',
    output: {
        name: 'doppel',
        file: pkg.browser,
        format: 'umd'
    },
    plugins: [
        alias({
            '@common': 'src/common.ts',
            '@store': 'src/store/index.ts',
            '@reference': 'src/reference/index.ts'
        }),
        resolve(),
        commonjs(),
        typescript()
    ],
    external: [ "rxjs" ]
}, {
    input: './src/index.ts',
    plugins: [
        alias({
            '@common': 'src/common.ts',
            '@store': 'src/store/index.ts',
            '@reference': 'src/reference/index.ts'
        }),
        typescript()
    ],
    output: [{
        file: pkg.main,
        format: 'cjs'
    }, {
        file: pkg.module,
        format: 'es'
    }],
    external: [ "rxjs" ]
}];