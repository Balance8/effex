import { cpSync } from 'node:fs'
import { join } from 'node:path'

const result = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  format: 'esm',
  target: 'node',
  minify: false,
  sourcemap: 'none',
  splitting: false,
  banner: '#!/usr/bin/env node',
})

if (!result.success) {
  console.error('Build failed')
  for (const message of result.logs) {
    console.error(message)
  }
  process.exit(1)
}

cpSync(join(process.cwd(), 'templates'), join(process.cwd(), 'dist', 'templates'), {
  recursive: true,
})
console.log('✅ Copied templates to dist/')
console.log('✅ Build complete')
