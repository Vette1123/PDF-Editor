import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  // Keep better-auth (and its transitive kysely-adapter) out of the bundle so
  // Next.js loads it from node_modules at runtime. Without this, Turbopack's
  // strict ESM analysis fails on the kysely-adapter's sqlite dialects, which
  // import DEFAULT_MIGRATION_TABLE/_LOCK_TABLE from the root of kysely 0.29
  // (those moved to the `kysely/migration` subpath). We use the drizzle
  // adapter, so those dialects are never executed.
  serverExternalPackages: ['better-auth'],
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  turbopack: {},
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
