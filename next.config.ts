import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  trailingSlash: true,
  experimental: {
    typedEnv: true
  },
  images: {
    unoptimized: true
  }
}

if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export'
  nextConfig.distDir = 'dist/renderer'
}

export default nextConfig
