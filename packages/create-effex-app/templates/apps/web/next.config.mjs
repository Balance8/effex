/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/api', '@workspace/ui'],
  experimental: {
    ppr: true,
  },
}

export default nextConfig
