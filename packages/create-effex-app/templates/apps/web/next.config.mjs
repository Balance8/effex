import './lib/env.ts'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/api', '@workspace/ui'],
  cacheComponents: true,
  reactCompiler: true,
}

export default nextConfig
