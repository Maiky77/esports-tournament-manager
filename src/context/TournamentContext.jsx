import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { FALLBACK_CONFIG, fetchAvailability, fetchConfig, fetchContent, fetchPublicTeams, fetchPublishedStages, fetchSchedule } from '../lib/tournamentApi'

const TournamentContext = createContext(null)

export function TournamentProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK_CONFIG)
  const [fromServer, setFromServer] = useState(false)
  const [content, setContent] = useState(null)
  const [availability, setAvailability] = useState(null)

  // Prefetch de paginas internas: se cargan en paralelo al inicio del app
  const [teams, setTeams] = useState(null)
  const [stages, setStages] = useState(null)
  const [schedule, setSchedule] = useState(null)

  useEffect(() => {
    let active = true
    fetchConfig()
      .then((next) => {
        if (!active) return
        setConfig(next)
        setFromServer(true)
      })
      .catch(() => {
        /* se mantiene el respaldo local */
      })
    fetchContent().then((next) => active && setContent(next)).catch(() => {})
    fetchAvailability().then((next) => active && setAvailability(next)).catch(() => {})

    // Prefetch paginas: errores silenciosos, cada pagina sigue mostrando su placeholder si falla
    fetchPublicTeams().then((d) => active && setTeams(d)).catch(() => active && setTeams([]))
    fetchPublishedStages().then((d) => active && setStages(d)).catch(() => active && setStages({ stages: [] }))
    fetchSchedule().then((d) => active && setSchedule(d)).catch(() => active && setSchedule({ matches: [], stages: [], events: [] }))

    return () => { active = false }
  }, [])

  const value = useMemo(() => {
    const deadline = new Date(config.settings.registration_deadline).getTime()
    const prizeTotal = config.prizes.reduce((sum, p) => sum + p.amount, 0)
    return { ...config, deadline, prizeTotal, fromServer, content, availability, teams, stages, schedule }
  }, [config, fromServer, content, availability, teams, stages, schedule])

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
}

export function useTournament() {
  const ctx = useContext(TournamentContext)
  if (!ctx) throw new Error('useTournament debe usarse dentro de TournamentProvider')
  return ctx
}
