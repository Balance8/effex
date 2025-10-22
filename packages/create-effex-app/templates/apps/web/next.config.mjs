/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/api', '@workspace/ui'],
  cacheComponents: true
}

export default nextConfig
