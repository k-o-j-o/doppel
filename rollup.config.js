import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

export default [{
    input: './src/index.ts',
    plugins: [
        alias({
            '@/': './src/'
        }),
        resolve(),
        typescript({
            tsconfig: './tsconfig.json'
        }),
        replace({
            values: {
                //TODO: this isn't a great way to do this; result is what the build assigns to the import from 'symbol-observable'
                'Symbol.observable': 'result'
            },
            include: ['src/**/*.js'],
            preventAssignment: true
        })
    ],
    output: [{
        file: pkg.main,
        format: 'cjs'
    }, {
        file: pkg.module,
        format: 'es'
    }]
}];