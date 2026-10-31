import { useEffect, useState } from 'react'
import { useRegistration } from '../context/RegistrationContext'
import { fetchPublicTeams, publicUrl } from '../lib/tournamentApi'
import PagePlaceholder from './PagePlaceholder'

const description = 'Las escuadras que representarán a su universidad en RAGNAROK U-Series.'

function Teams() {
  const { activeGame, setActiveGame } = useRegistration()
  const game = activeGame === 'ff' ? 'ff' : 'mlbb'
  const [teams, setTeams] = useState(null)

  useEffect(() => {
    let active = true
    fetchPublicTeams().then((data) => active && setTeams(data)).catch(() => active && setTeams([]))
    return () => { active = false }
  }, [])

  if (!teams || teams.length === 0) {
    return <PagePlaceholder title="Equipos confirmados" description={description} kind="teams" />
  }

  const visible = teams.filter((team) => team.game_key === game)
  return (
    <main className="competition-page">
      <header className="competition-heading template-section-title">
        <span>RAGNAROK / LA COMUNIDAD COMPITE</span>
        <h1>Equipos confirmados</h1><p>{description}</p>
      </header>
      <div className="competition-filters" role="group" aria-label="Disciplina del torneo">
        <button type="button" aria-pressed={game === 'mlbb'} onClick={() => setActiveGame('mlbb')}>MOBILE LEGENDS</button>
        <button type="button" aria-pressed={game === 'ff'} onClick={() => setActiveGame('ff')}>FREE FIRE</button>
      </div>
      {visible.length === 0 ? (
        <p className="pd-empty">Aún no hay equipos confirmados en esta disciplina.</p>
      ) : (
        <ul className="pd-team-grid">
          {visible.map((team, index) => {
            const logo = publicUrl('team-logos', team.logo_path)
            return (
              <li className="pd-team-card" key={team.id}>
                <span className="pd-team-index">{String(index + 1).padStart(2, '0')}</span>
                {logo ? <img src={logo} alt="" loading="lazy" className="pd-team-logo" /> : <span className="pd-team-logo pd-team-logo--empty" aria-hidden="true">{team.team_name[0]}</span>}
                <div><strong>{team.team_name}</strong><small>{team.institution}</small></div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}

export default Teams
