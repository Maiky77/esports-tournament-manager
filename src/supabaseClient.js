import { createClient } from '@supabase/supabase-js'

const env = import.meta.env || {}
const url = env.VITE_SUPABASE_URL?.trim()
const key = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY)?.trim()
const validUrl = (() => {
  try { return ['https:', 'http:'].includes(new URL(url).protocol) && !url.includes('tu_url') } catch { return false }
})()
// Fail closed: a missing project never sends personal information to a placeholder host.
const privilegedKey = (() => {
  if (key?.startsWith('sb_secret_')) return true
  try { return JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'service_role' } catch { return false }
})()
export const isSupabaseConfigured = Boolean(validUrl && key && !key.startsWith('tu_') && !privilegedKey)
export const supabase = isSupabaseConfigured ? createClient(url, key) : null
export function requireSupabase() {
  if (!supabase) throw new Error('Las inscripciones todavía no están habilitadas. Inténtalo más tarde.')
  return supabase
}

// Separate storage prevents an organizer login from replacing a captain's session.
export const adminSupabase = isSupabaseConfigured ? createClient(url, key, { auth: { storageKey: 'ragnarok-admin-auth' } }) : null
