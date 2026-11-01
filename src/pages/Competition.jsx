import { useEffect, useState } from 'react'
import { useRegistration } from '../context/RegistrationContext'
import { tournament } from '../lib/tournamentService'
import { isSupabaseConfigured } from '../supabaseClient'

export const MATCH_STATUS = { scheduled: 'PROGRAMADO', live: 'EN JUEGO', finished: 'FINALIZADO' }
export function formatMatchDate(value) {
  return value ? new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) + ' · Perú' : 'Horario por confirmar'
}
export function MatchCard({ match, teams }) {
  const names = new Map(teams.map(team => [team.id, team.team_name]))
  const entries = [...match.match_entries].sort((a, b) => a.slot - b.slot)
  return <article className="match-card">
    <div className="match-card-heading"><span>{match.round_name}</span><span className={`status-tag status-tag--${match.status}`}>{MATCH_STATUS[match.status]}</span></div>
    <h2>{match.title}</h2><p className="match-date">{formatMatchDate(match.starts_at)}</p>
    <ul className="match-participants">{entries.map(entry => <li key={entry.registration_id}>
      <strong>{names.get(entry.registration_id) || 'Equipo confirmado'}</strong>
      <span>{match.game_code === 'mlbb' ? (entry.score ?? '—') : entry.placement ? `#${entry.placement} · ${entry.kills ?? '—'} kills` : 'Por disputar'}</span>
    </li>)}</ul>
  </article>
}
export default function Competition({ kind = 'teams' }) {
  const { activeGame, setActiveGame, openRegistration } = useRegistration()
  const game = activeGame === 'ff' ? 'ff' : 'mlbb'
  const [data, setData] = useState({ teams: [], matches: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const bracket = kind === 'bracket'
  useEffect(() => {
    let ignore = false
    setLoading(true); setError(''); setData({ teams: [], matches: [] })
    if (!isSupabaseConfigured) { setLoading(false); return }
    Promise.all([tournament.confirmedTeams(game), bracket ? tournament.matches(game) : Promise.resolve([])])
      .then(([teams, matches]) => { if (!ignore) setData({ teams, matches }) })
      .catch(e => { if (!ignore) setError(e.message) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [game, bracket, revision])
  const empty = bracket ? data.matches.length === 0 : data.teams.length === 0
  return <main className="competition-page">
    <header className="competition-heading template-section-title">
      <span>RAGNAROK / {bracket ? 'FIXTURE Y RESULTADOS' : 'LA COMUNIDAD COMPITE'}</span>
      <h1>{bracket ? 'Fixture del torneo' : 'Equipos confirmados'}</h1>
      <p>{bracket ? 'Encuentros de Mobile Legends, salas de Free Fire y resultados publicados por la organización.' : 'Las escuadras con inscripción y pago aprobados para representar a su universidad.'}</p>
    </header>
    <div className="competition-toolbar"><div className="competition-filters" role="group" aria-label="Disciplina del torneo">
      <button type="button" aria-pressed={game === 'mlbb'} onClick={() => setActiveGame('mlbb')}>MOBILE LEGENDS</button>
      <button type="button" aria-pressed={game === 'ff'} onClick={() => setActiveGame('ff')}>FREE FIRE</button>
    </div><button type="button" className="backend-button" disabled={loading} onClick={() => setRevision(v => v + 1)}>ACTUALIZAR</button></div>
    <div aria-live="polite">
      {loading ? <p className="backend-empty">Cargando {bracket ? 'encuentros' : 'equipos'}…</p> : error ? <p className="backend-error" role="alert">{error}</p> : empty ?
        <section className="backend-empty"><span className="publication-status">PENDIENTE DE PUBLICACIÓN</span><h2>{bracket ? 'LA SIGUIENTE PARTIDA EMPIEZA AQUÍ.' : 'TU ESCUADRA TIENE UN LUGAR.'}</h2><p>{bracket ? 'Los horarios y cruces aparecerán cuando la organización los publique.' : 'Los equipos aparecerán aquí después de la revisión del pago.'}</p><button type="button" className="hero-btn-primary clip-corner" onClick={() => openRegistration(game)}>INSCRIBIR A MI EQUIPO ↗</button></section> :
        bracket ? <div className="match-grid">{data.matches.map(match => <MatchCard key={match.id} match={match} teams={data.teams} />)}</div> :
          <><p className="competition-count">{data.teams.length} EQUIPOS CONFIRMADOS / {game.toUpperCase()}</p><div className="confirmed-teams-grid">{data.teams.map(team => <article className="confirmed-team" key={team.id}>
            <div className="confirmed-team-header">{team.logo_url ? <img src={team.logo_url} alt="" width="72" height="72" loading="lazy" /> : <span className="team-initials" aria-hidden="true">{team.team_name.slice(0, 2).toUpperCase()}</span>}<div><span className="status-tag status-tag--approved">CONFIRMADO</span><h2>{team.team_name}</h2></div></div>
            <p>{team.institution}{team.professional_school ? ` / ${team.professional_school}` : ''}</p>
            <ul>{team.players.map(player => <li key={player.slot}><span>{player.slot === 1 ? 'CAP' : player.slot <= (game === 'mlbb' ? 5 : 4) ? 'TIT' : 'SUP'}</span>{player.nickname}</li>)}</ul>
          </article>)}</div></>
      }
    </div>
  </main>
}
