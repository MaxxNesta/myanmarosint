import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['mapbox-gl'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
}

export default nextConfig
