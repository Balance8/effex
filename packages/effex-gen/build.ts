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

console.log('✅ Build complete')
