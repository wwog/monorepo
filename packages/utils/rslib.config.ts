import { defineConfig } from '@rslib/core'

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'esnext',
      dts: true,
      source: {
        entry: {
          browser: './src/browser/index.ts',
        },
      },
      output: {
        target: 'web',
      },
    },
    {
      format: 'esm',
      syntax: 'esnext',
      dts: true,
      source: {
        entry: {
          index: './src/all/index.ts',
        },
      },
      output: {
        target: 'web',
      },
    },
  ],
  output: {
    cleanDistPath: true,
  },
  source: {
    tsconfigPath: './tsconfig.json',
  },
})
