// Rollup builds only the browser version using the Node.js build.
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';
import json from '@rollup/plugin-json';
import pkg from './package.json';

export default [{
  input: './dist/nodejs/src/index.js',
  onwarn: (message) => {
    if (message.code === 'MISSING_NODE_BUILTINS') return;
  },
  output: {
    name: 'Justpound',
    file: pkg.browser,
    format: 'iife',
    sourcemap: false,
    globals: {
      'http': '{}',
      'https': '{}',
    },
  },
  plugins: [
    resolve({
      preferBuiltins: true,
      browser: true
    }),
    commonjs(),
    minify({ comments: false }),
    json(),
  ],
  external: [
    'http',
    'https',
  ]
}];
