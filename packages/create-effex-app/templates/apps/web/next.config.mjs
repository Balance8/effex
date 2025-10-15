/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui'],
  experimental: {
    ppr: true,
  },
}

export default nextConfig
