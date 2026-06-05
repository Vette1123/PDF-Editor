export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
}

/** Pure, testable: auth is on only when both a DB URL and a secret are present. */
export function computeAuthConfigured(dbUrl?: string, secret?: string): boolean {
  return Boolean(dbUrl && secret)
}

export const authConfigured = computeAuthConfigured(env.DATABASE_URL, env.BETTER_AUTH_SECRET)
