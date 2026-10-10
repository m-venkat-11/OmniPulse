import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // If environment variables are missing, fallback to empty strings.
  // We will handle the "Demo mode" gracefully in the app if these are invalid.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )
}
