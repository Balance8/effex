import type { NextConfig } from 'next'
import './lib/env'

const nextConfig: NextConfig = {
  transpilePackages: ['@workspace/api', '@workspace/ui'],
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    // Enable filesystem caching for `next dev`
    turbopackFileSystemCacheForDev: true,
    // Enable filesystem caching for `next build`
    turbopackFileSystemCacheForBuild: true,
  },
}

export default nextConfig
