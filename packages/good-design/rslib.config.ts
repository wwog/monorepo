import { defineConfig } from '@rslib/core'

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'esnext',
      dts: true,
      output: {
        target: 'web',
      },
    },
  ],
  output: {
    cleanDistPath: true,
  },
  source: {
    entry: {
      lib: './src/lib.ts',
      rust: './src/rust/mod.ts',
    },
    tsconfigPath: './tsconfig.json',
  },
})
