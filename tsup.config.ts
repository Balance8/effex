import { cpSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'commands/create': 'src/commands/create.ts',
    'commands/generate-services': 'src/commands/generate-services.ts',
  },
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  clean: true,
  dts: false,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  onSuccess: () => {
    cpSync(join(process.cwd(), 'templates'), join(process.cwd(), 'dist', 'templates'), {
      recursive: true,
    })
    console.log('✅ Copied templates to dist/')
  },
})
