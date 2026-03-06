import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      // ✅ Optimizaciones de performance y pooling
      auth: {
        persistSession: false,      // No cachear session en serverless
        autoRefreshToken: false,     // No auto-refresh en server
        detectSessionInUrl: false,   // No buscar tokens en URL
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // ✅ Timeout de 8 segundos para prevenir queries colgadas
            signal: options.signal ?? AbortSignal.timeout(8000),
            // ✅ Keep-alive para reusar HTTP connections
            keepalive: true,
          })
        },
      },
    }
  )
}

// Helper to set token context for RLS
export async function createClientWithToken(token: string) {
  const supabase = await createClient()
  
  // Set the token in the session for RLS policies
  // @ts-ignore - set_config is a built-in PostgreSQL function not in generated types
  await supabase.rpc('set_config', {
    setting: 'app.current_token',
    value: token
  })
  
  return supabase
}
