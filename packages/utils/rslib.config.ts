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
    tsconfigPath: './tsconfig.json',
  },
})
