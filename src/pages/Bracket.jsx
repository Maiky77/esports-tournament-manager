import { useEffect, useMemo, useState } from 'react'
import { useRegistration } from '../context/RegistrationContext'
import { fetchPublishedStages } from '../lib/tournamentApi'
import PagePlaceholder from './PagePlaceholder'

const description = 'El camino de cada equipo, desde sus primeros encuentros hasta la definición del torneo.'

function roundName(round, total) {
  const fromEnd = total - round
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semifinal'
  if (fromEnd === 2) return 'Cuartos de final'
  return `Ronda ${round}`
}

function MatchBox({ match }) {
  const done = match.status === 'completed'
  const row = (id, name, score) => (
    <div className={`pd-match-team ${done && match.winner_id === id ? 'pd-match-team--win' : ''}`}>
      <span>{name || 'Por definir'}</span><b>{done ? score : ''}</b>
    </div>
  )
  return (
    <div className="pd-match">
      {row(match.team_a, match.team_a_name, match.score_a)}
      {row(match.team_b, match.team_b_name, match.score_b)}
    </div>
  )
}

function standings(teamIds, names, matches) {
  const rows = new Map(teamIds.map((id) => [id, { id, name: names.get(id), played: 0, wins: 0, diff: 0, points: 0 }]))
  matches.filter((m) => m.status === 'completed').forEach((m) => {
    const a = rows.get(m.team_a), b = rows.get(m.team_b)
    if (!a || !b) return
    a.played++; b.played++
    a.diff += (m.score_a ?? 0) - (m.score_b ?? 0)
    b.diff += (m.score_b ?? 0) - (m.score_a ?? 0)
    const w = m.winner_id === m.team_a ? a : b
    w.wins++; w.points += 3
  })
  return [...rows.values()].sort((x, y) => y.points - x.points || y.diff - x.diff)
}

function StageView({ stage, data }) {
  const matches = data.matches.filter((m) => m.stage_id === stage.id)
  if (stage.type === 'single_elim') {
    const total = matches.reduce((max, m) => Math.max(max, m.round), 0)
    return (
      <div className="pd-bracket">
        {Array.from({ length: total }, (_, i) => i + 1).map((round) => (
          <div className="pd-round" key={round}>
            <h4>{roundName(round, total)}</h4>
            {matches.filter((m) => m.round === round).map((m) => <MatchBox match={m} key={m.id} />)}
          </div>
        ))}
      </div>
    )
  }
  if (stage.type === 'groups') {
    return (
      <div className="pd-groups">
        {data.groups.filter((g) => g.stage_id === stage.id).map((group) => {
          const links = data.groupTeams.filter((x) => x.group_id === group.id)
          const names = new Map(links.map((x) => [x.registration_id, x.team_name]))
          const gm = matches.filter((m) => m.group_id === group.id)
          return (
            <section className="pd-card" key={group.id}>
              <h3>{group.name}</h3>
              <table className="pd-table">
                <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>Dif</th><th>Pts</th></tr></thead>
                <tbody>
                  {standings([...names.keys()], names, gm).map((r, i) => (
                    <tr key={r.id}><td>{i + 1}</td><td>{r.name}</td><td>{r.played}</td><td>{r.wins}</td><td>{r.diff}</td><td><b>{r.points}</b></td></tr>
                  ))}
                </tbody>
              </table>
              <div className="pd-match-list">{gm.map((m) => <MatchBox match={m} key={m.id} />)}</div>
            </section>
          )
        })}
      </div>
    )
  }
  // battle royale
  const results = data.results.filter((r) => r.stage_id === stage.id)
  const totals = new Map()
  results.forEach((r) => {
    const t = totals.get(r.registration_id) ?? { id: r.registration_id, name: r.team_name, kills: 0, points: 0, played: 0 }
    t.kills += r.kills; t.points += Number(r.points); t.played++
    totals.set(r.registration_id, t)
  })
  const ranking = [...totals.values()].sort((a, b) => b.points - a.points || b.kills - a.kills)
  return (
    <section className="pd-card">
      <h3>Tabla general</h3>
      {ranking.length === 0 ? <p className="pd-empty">Aún no hay partidas jugadas.</p> : (
        <table className="pd-table">
          <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>Kills</th><th>Pts</th></tr></thead>
          <tbody>{ranking.map((r, i) => <tr key={r.id}><td>{i + 1}</td><td>{r.name}</td><td>{r.played}</td><td>{r.kills}</td><td><b>{r.points}</b></td></tr>)}</tbody>
        </table>
      )}
    </section>
  )
}

function Bracket() {
  const { activeGame, setActiveGame } = useRegistration()
  const game = activeGame === 'ff' ? 'ff' : 'mlbb'
  const [data, setData] = useState(null)

  useEffect(() => {
    let active = true
    fetchPublishedStages().then((d) => active && setData(d)).catch(() => active && setData({ stages: [] }))
    return () => { active = false }
  }, [])

  const stages = useMemo(() => (data?.stages ?? []).filter((s) => s.game_key === game), [data, game])

  if (!data || data.stages.length === 0) {
    return <PagePlaceholder title="Llaves del torneo" description={description} kind="bracket" />
  }

  return (
    <main className="competition-page">
      <header className="competition-heading template-section-title">
        <span>RAGNAROK / FIXTURE Y RESULTADOS</span>
        <h1>Llaves del torneo</h1><p>{description}</p>
      </header>
      <div className="competition-filters" role="group" aria-label="Disciplina del torneo">
        <button type="button" aria-pressed={game === 'mlbb'} onClick={() => setActiveGame('mlbb')}>MOBILE LEGENDS</button>
        <button type="button" aria-pressed={game === 'ff'} onClick={() => setActiveGame('ff')}>FREE FIRE</button>
      </div>
      {stages.length === 0 ? (
        <p className="pd-empty">La organización aún no publica el fixture de esta disciplina.</p>
      ) : stages.map((stage) => (
        <section className="pd-stage" key={stage.id}>
          <h2>{stage.name}</h2>
          <StageView stage={stage} data={data} />
        </section>
      ))}
    </main>
  )
}

export default Bracket
