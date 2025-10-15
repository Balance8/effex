import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  clean: true,
  dts: false,
  sourcemap: false,
  minify: false,
  splitting: false,
  treeshake: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
})
