import { useEffect, useMemo, useState } from 'react'
import { useRegistration } from '../context/RegistrationContext'
import { fetchPublicTeams, publicUrl } from '../lib/tournamentApi'
import PagePlaceholder from './PagePlaceholder'
import TeamCard from '../components/TeamCard'

const description = 'Las escuadras que representarán a su universidad en RAGNAROK U-Series.'

// Búsqueda sin distinguir mayúsculas ni tildes.
const fold = (text) => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function Teams() {
  const { activeGame, setActiveGame } = useRegistration()
  const game = activeGame === 'ff' ? 'ff' : 'mlbb'
  const [teams, setTeams] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    fetchPublicTeams().then((data) => active && setTeams(data)).catch(() => active && setTeams([]))
    return () => { active = false }
  }, [])

  const inGame = useMemo(() => (teams ?? []).filter((team) => team.game_key === game), [teams, game])
  const visible = useMemo(() => {
    const q = fold(query.trim())
    if (!q) return inGame
    return inGame.filter((team) => fold([team.team_name, team.institution, team.professional_school, ...team.players.map((p) => p.nickname)].join(' ')).includes(q))
  }, [inGame, query])

  if (!teams || teams.length === 0) {
    return <PagePlaceholder title="Equipos confirmados" description={description} kind="teams" />
  }

  return (
    <main className="competition-page">
      <header className="competition-heading template-section-title">
        <span>RAGNAROK / LA COMUNIDAD COMPITE</span>
        <h1>Equipos confirmados</h1><p>{description}</p>
      </header>
      <div className="competition-filters" role="group" aria-label="Disciplina del torneo">
        <button type="button" aria-pressed={game === 'mlbb'} onClick={() => { setActiveGame('mlbb'); setQuery('') }}>MOBILE LEGENDS</button>
        <button type="button" aria-pressed={game === 'ff'} onClick={() => { setActiveGame('ff'); setQuery('') }}>FREE FIRE</button>
      </div>

      {inGame.length > 0 && (
        <div className="tm-toolbar">
          <p className="tm-count"><b>{visible.length}</b> {visible.length === 1 ? 'equipo' : 'equipos'}</p>
          <label className="tm-search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar equipo o jugador…" aria-label="Buscar equipos" />
          </label>
        </div>
      )}

      {inGame.length === 0 ? (
        <p className="pd-empty">Aún no hay equipos confirmados en esta disciplina.</p>
      ) : visible.length === 0 ? (
        <p className="pd-empty">Ningún equipo coincide con «{query}».</p>
      ) : (
        <ul className="tc-grid">
          {visible.map((team) => <TeamCard key={team.id} team={team} logo={publicUrl('team-logos', team.logo_path)} />)}
        </ul>
      )}
    </main>
  )
}

export default Teams
