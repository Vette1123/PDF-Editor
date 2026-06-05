import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/lib/db'
import { env, authConfigured } from '@/lib/env'

export const auth = authConfigured && db
  ? betterAuth({
      baseURL: env.BETTER_AUTH_URL,
      secret: env.BETTER_AUTH_SECRET,
      database: drizzleAdapter(db, { provider: 'pg' }),
      emailAndPassword: { enabled: true, requireEmailVerification: false },
      socialProviders:
        env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
          ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
          : undefined,
      rateLimit: { enabled: true, window: 60, max: 20 },
      plugins: [nextCookies()],
    })
  : null
