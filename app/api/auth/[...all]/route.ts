import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

const notConfigured = () =>
  new Response(JSON.stringify({ error: 'Authentication is not configured' }), {
    status: 503, headers: { 'content-type': 'application/json' },
  })

export const { GET, POST } = auth
  ? toNextJsHandler(auth)
  : { GET: notConfigured, POST: notConfigured }
