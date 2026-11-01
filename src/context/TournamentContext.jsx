import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured } from '../supabaseClient'
import { FALLBACK_CONFIG, fetchAvailability, fetchConfig, fetchContent } from '../lib/tournamentApi'

const TournamentContext = createContext(null)

export function TournamentProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK_CONFIG)
  const [fromServer, setFromServer] = useState(false)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [content, setContent] = useState(null)
  const [availability, setAvailability] = useState(null)

  useEffect(() => {
    let active = true
    if (!isSupabaseConfigured) return () => { active = false }
    fetchConfig()
      .then((next) => {
        if (!active) return
        setConfig({
          settings: { ...FALLBACK_CONFIG.settings, ...next.settings },
          games: Object.fromEntries(['mlbb', 'ff'].map(key => [key, { ...FALLBACK_CONFIG.games[key], ...next.games[key] }])),
          prizes: next.prizes,
        })
        setFromServer(true)
      })
      .catch(() => {
        /* Keep the local backend available when the alternate public configuration is absent. */
      })
      .finally(() => { if (active) setLoading(false) })
    fetchContent().then((next) => active && setContent(next)).catch(() => {})
    fetchAvailability().then((next) => active && setAvailability(next)).catch(() => {})
    return () => { active = false }
  }, [])

  const value = useMemo(() => {
    const deadline = new Date(config.settings.registration_deadline).getTime()
    const prizeTotal = config.prizes.reduce((sum, p) => sum + p.amount, 0)
    return { ...config, deadline, prizeTotal, fromServer, loading, content, availability }
  }, [config, fromServer, loading, content, availability])

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
}

export function useTournament() {
  const ctx = useContext(TournamentContext)
  if (!ctx) throw new Error('useTournament debe usarse dentro de TournamentProvider')
  return ctx
}
