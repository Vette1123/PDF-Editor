import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { env } from '@/lib/env'
import * as schema from './schema'

export const db = env.DATABASE_URL
  ? drizzle(neon(env.DATABASE_URL), { schema })
  : null
