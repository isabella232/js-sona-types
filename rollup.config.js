// rollup.config.js

import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/index.ts',
  output: {
      dir: 'dist',

  },
  external: ['axios'],
  plugins: [
    typescript()
  ]
};
