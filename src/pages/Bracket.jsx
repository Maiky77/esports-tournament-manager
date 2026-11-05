import { useEffect, useMemo, useState } from 'react'
import { useRegistration } from '../context/RegistrationContext'
import { fetchPublishedStages, fetchPublicTeams, publicUrl } from '../lib/tournamentApi'
import defaultLogo from '../assets/ragnarok-logo-blancoNegro.png'
import RoomList from '../components/RoomList'
import Collapse from '../components/Collapse'
import PagePlaceholder from './PagePlaceholder'

const description = 'El camino de cada equipo, desde sus primeros encuentros hasta la definición del torneo.'

function roundName(round, total) {
  const fromEnd = total - round
  if (fromEnd === 0) return 'Final'
  if (fromEnd === 1) return 'Semifinal'
  if (fromEnd === 2) return 'Cuartos de final'
  return `Ronda ${round}`
}

// Cruce sin rival (bye): un solo equipo, que pasa directo. Cruce "sin equipos": los dos lados vacíos.
const isBye = (m) => m.status === 'completed' && Boolean(m.winner_id) && !m.team_a !== !m.team_b
const isDead = (m) => m.status === 'completed' && !m.winner_id && !m.team_a && !m.team_b

// Resuelve número de casilla (slot) de cada equipo en su sala para Battle Royale.
// Conserva los slots ya asignados y asigna el menor número libre a los equipos nuevos pendientes.
function resolveSlots(stageTeams, roomOf, slotOf = {}) {
  const out = {}
  const byRoom = new Map()
  stageTeams.forEach((t) => {
    const room = roomOf(t.id)
    if (!byRoom.has(room)) byRoom.set(room, [])
    byRoom.get(room).push(t)
  })
  for (const list of byRoom.values()) {
    const used = new Set()
    list.forEach((t) => {
      const n = slotOf?.[t.id]
      if (Number.isInteger(n) && n >= 1 && !used.has(n)) {
        out[t.id] = n
        used.add(n)
      }
    })
    let next = 1
    ;[...list].sort((a, b) => (a.team_name || '').localeCompare(b.team_name || '')).forEach((t) => {
      if (out[t.id]) return
      while (used.has(next)) next++
      out[t.id] = next
      used.add(next)
    })
  }
  return out
}

// Numera los cruces reales (sin byes): M1, M2…
function numberMatches(matches) {
  const map = new Map()
  let n = 0
  ;[...matches].sort((a, b) => a.round - b.round || a.position - b.position).forEach((m) => { if (!isBye(m) && !isDead(m)) map.set(m.id, ++n) })
  return map
}

// Cupo vacío: "Ganador M3" (el cruce que lo alimenta) o "Por definir".
function pendingLabel(match, side, matches, numbers) {
  if (match.round === 1) return 'Por definir'
  const feeder = matches.find((m) => m.round === match.round - 1 && m.position === match.position * 2 + (side === 'a' ? 0 : 1))
  const n = feeder && numbers.get(feeder.id)
  if (feeder && isDead(feeder)) return 'Sin rival'
  return n ? `Ganador M${n}` : 'Por definir'
}

function shortWhen(iso) {
  const d = new Date(iso)
  const time = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000)
  if (days === 0) return `Hoy ${time}`
  if (days === 1) return `Mañana ${time}`
  return `${d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', '')} ${time}`
}

function MatchBox({ match, label, nameA, nameB, teamAInfo, teamBInfo }) {
  const done = match.status === 'completed'
  const row = (id, name, score, teamInfo) => (
    <div className={`pd-match-team ${done && match.winner_id === id ? 'pd-match-team--win' : ''} ${id ? '' : 'pd-match-team--empty'}`}>
      <div className="pd-match-team-copy">
        <span className="pd-match-team-name">{id ? name : (name || 'Por definir')}</span>
        {id && teamInfo && (teamInfo.institution || teamInfo.professional_school) && (
          <small className="pd-match-team-sub">
            {teamInfo.institution}{teamInfo.professional_school ? ` · ${teamInfo.professional_school}` : ''}
          </small>
        )}
      </div>
      <b>{done ? score : ''}</b>
    </div>
  )
  return (
    <div className={`pd-match ${done ? 'pd-match--done' : ''}`}>
      <div className="pd-match-head">
        {label && <span className="pd-match-num">{label}</span>}
        <span className="pd-bo">BO{match.best_of}</span>
        {match.scheduled_at && <span className="pd-match-when">{shortWhen(match.scheduled_at)}</span>}
      </div>
      {row(match.team_a, nameA ?? match.team_a_name, match.score_a, teamAInfo)}
      {row(match.team_b, nameB ?? match.team_b_name, match.score_b, teamBInfo)}
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

const STAGE_LABEL = { groups: 'Fase de grupos', single_elim: 'Eliminación directa', battle_royale: 'Battle Royale' }

function StageView({ stage, data, teams }) {
  const matches = data.matches.filter((m) => m.stage_id === stage.id)
  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])
  if (stage.type === 'single_elim') {
    const total = matches.reduce((max, m) => Math.max(max, m.round), 0)
    const numbers = numberMatches(matches)
    return (
      <div className="pd-bracket">
        {Array.from({ length: total }, (_, i) => i + 1).map((round, ri) => {
          const list = matches.filter((m) => m.round === round)
          return (
            <div className="pd-round" key={round}>
              <header className="pd-round-head"><h4>{roundName(round, total)}</h4>{list[0] && <span className="pd-bo">BO{list[0].best_of}</span>}</header>
              <div className="pd-round-list">
                {list.map((m, i) => (
                  <div className={`pd-slot ${i % 2 === 0 ? 'pd-slot--even' : 'pd-slot--odd'}`} key={m.id}>
                    {isDead(m) ? (
                      <div className="pd-match pd-match--bye">
                        <div className="pd-match-head"><span className="pd-match-num">Sin equipos</span></div>
                        <div className="pd-match-team pd-match-team--empty"><span>Vacío</span></div>
                      </div>
                    ) : isBye(m) ? (
                      <div className="pd-match pd-match--bye">
                        <div className="pd-match-head"><span className="pd-match-num">Bye</span></div>
                        <div className="pd-match-team"><span>{m.team_a_name ?? m.team_b_name}</span></div>
                        <div className="pd-match-team pd-match-team--empty"><span>Pasa directo</span></div>
                      </div>
                    ) : (
                      <MatchBox match={m} label={`M${numbers.get(m.id)}`}
                        nameA={m.team_a ? m.team_a_name : pendingLabel(m, 'a', matches, numbers)}
                        nameB={m.team_b ? m.team_b_name : pendingLabel(m, 'b', matches, numbers)}
                        teamAInfo={m.team_a ? teamMap.get(m.team_a) : null}
                        teamBInfo={m.team_b ? teamMap.get(m.team_b) : null} />
                    )}
                    {ri > 0 && <i className="pd-c pd-c--in" aria-hidden="true" />}
                    {ri < total - 1 && <i className="pd-c pd-c--out" aria-hidden="true" />}
                    {ri < total - 1 && <i className="pd-c pd-c--join" aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  if (stage.type === 'groups') {
    const qualify = Number(stage.config?.qualify_per_group) || 0
    return (
      <div className="pd-groups">
        {data.groups.filter((g) => g.stage_id === stage.id).map((group) => {
          const links = data.groupTeams.filter((x) => x.group_id === group.id)
          const names = new Map(links.map((x) => [x.registration_id, x.team_name]))
          const gm = matches.filter((m) => m.group_id === group.id)
          return (
            <section className="pd-card" key={group.id}>
              <h3>{group.name}</h3>
              {qualify > 0 && <p className="pd-qualify-note">{qualify === 1 ? 'Clasifica el primero' : `Clasifican los ${qualify} primeros`}</p>}
              <div className="pd-table-wrap">
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Equipo</th>
                      <th>Institución</th>
                      <th>Carrera</th>
                      <th>PJ</th>
                      <th>G</th>
                      <th>Dif</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings([...names.keys()], names, gm).map((r, i) => {
                      const team = teamMap.get(r.id)
                      return (
                        <tr key={r.id} className={i < qualify ? 'pd-row--qualify' : undefined}>
                          <td>{i + 1}</td>
                          <td><strong>{r.name}</strong></td>
                          <td className="pd-col-institution">{team?.institution || '—'}</td>
                          <td className="pd-col-career">{team?.professional_school || '—'}</td>
                          <td>{r.played}</td>
                          <td>{r.wins}</td>
                          <td>{r.diff}</td>
                          <td><b>{r.points}</b></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <Collapse title="Partidos" meta={`${gm.filter((m) => m.status === 'completed').length}/${gm.length} jugados`}>
                <div className="pd-match-list">
                  {gm.map((m) => (
                    <MatchBox
                      match={m}
                      key={m.id}
                      teamAInfo={m.team_a ? teamMap.get(m.team_a) : null}
                      teamBInfo={m.team_b ? teamMap.get(m.team_b) : null}
                    />
                  ))}
                </div>
              </Collapse>
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
  const qualify = Number(stage.config?.qualify_count) || 0
  const rooms = Number(stage.config?.rooms) || 1
  const roomOf = (id) => (rooms > 1 ? Math.min(stage.config?.room_of?.[id] ?? 1, rooms) : 1)
  const champion = stage.config?.champion
  const slotOf = stage.config?.slot_of ?? {} // número fijo de cada equipo en su sala
  const hasConfiguredSlots = Object.keys(slotOf).length > 0
  const stageTeams = teams.filter((team) => {
    if (team.game_key !== stage.game_key) return false
    if (stage.config?.participants) return stage.config.participants.includes(team.id)
    if (stage.config?.room_of && Object.keys(stage.config.room_of).length > 0) {
      return Boolean(stage.config.room_of[team.id])
    }
    return true
  })
  const effectiveSlotOf = hasConfiguredSlots ? resolveSlots(stageTeams, roomOf, slotOf) : {}
  // Equipos de esta fase con su sala y su lugar en ella (incluye slots resueltos dinámicamente si falta asignar)
  const roomTeams = !hasConfiguredSlots ? [] : stageTeams
    .map((team) => ({ ...team, slot: effectiveSlotOf[team.id], room: roomOf(team.id) }))
    .filter((team) => team.slot)
  const championName = champion ? totals.get(champion)?.name : null
  return (
    <section className="pd-card">
      {roomTeams.length > 0 && (
        <div className="pd-rooms-block">
          <Collapse title={rooms > 1 ? 'Salas y lugar de cada equipo' : 'Lugar de cada equipo en la sala'} meta={`${roomTeams.length} equipos`}>
            <RoomList teams={roomTeams} logoOf={(team) => publicUrl('team-logos', team.logo_path)} />
          </Collapse>
        </div>
      )}
      {championName && <p className="pd-champion"><span>Campeón</span><b>{championName}</b></p>}
      {Array.from({ length: rooms }, (_, i) => i + 1).map((room) => {
        const rows = rooms > 1 ? ranking.filter((r) => roomOf(r.id) === room) : ranking
        return (
          <div className="pd-room-table" key={room}>
            <h3>{rooms > 1 ? `Sala ${room}` : 'Tabla general'}</h3>
            {qualify > 0 && <p className="pd-qualify-note">{rooms > 1 ? `Pasan los ${qualify} primeros de la sala` : `Pasan los ${qualify} primeros a la siguiente fase`}</p>}
            {rows.length === 0 ? <p className="pd-empty">Aún no hay partidas jugadas.</p> : (
              <div className="pd-table-wrap">
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th title="Posición">Pos.</th>
                      {hasConfiguredSlots && <th title="Lugar del equipo en la sala">Lugar en la sala</th>}
                      <th>Equipo</th>
                      <th>Institución</th>
                      <th>Carrera</th>
                      <th>PJ</th>
                      <th>Kills</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const team = teamMap.get(r.id)
                      return (
                        <tr key={r.id} className={r.id === champion ? 'pd-row--champion' : qualify && i < qualify ? 'pd-row--qualify' : undefined}>
                          <td>{i + 1}</td>
                          {hasConfiguredSlots && <td><b>{effectiveSlotOf[r.id] ?? slotOf[r.id] ?? '·'}</b></td>}
                          <td><strong>{r.name}</strong></td>
                          <td className="pd-col-institution">{team?.institution || '—'}</td>
                          <td className="pd-col-career">{team?.professional_school || '—'}</td>
                          <td>{r.played}</td>
                          <td>{r.kills}</td>
                          <td><b>{r.points}</b></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
      {champion && ranking.length >= 3 && (
        <Podium top3={ranking.slice(0, 3)} teamMap={teamMap} />
      )}
    </section>
  )
}

function Podium({ top3, teamMap }) {
  if (!top3 || top3.length < 3) return null
  const [first, second, third] = top3

  const renderCard = (r, place, label, toneClass) => {
    const team = teamMap.get(r.id)
    const logo = publicUrl('team-logos', team?.logo_path)
    const players = team?.players ?? []

    return (
      <div className={`pd-podium-card ${toneClass}`}>
        <div className="pd-podium-badge">{label}</div>

        <div className="pd-podium-logo-wrap">
          <img
            src={logo || defaultLogo}
            alt=""
            loading="lazy"
            className={`pd-podium-logo ${!logo ? 'pd-podium-logo--default' : ''}`}
          />
        </div>

        <h4 className="pd-podium-team-name">{r.name}</h4>

        {team?.institution && (
          <span className="pd-podium-inst">{team.institution}</span>
        )}
        {team?.professional_school && (
          <span className="pd-podium-career">{team.professional_school}</span>
        )}

        <div className="pd-podium-stats">
          <span>{r.points} PTS</span>
          <span className="pd-podium-dot">·</span>
          <span>{r.kills} KILLS</span>
        </div>

        {players.length > 0 && (
          <div className="pd-podium-players-wrap">
            <span className="pd-podium-players-label">Integrantes</span>
            <div className="pd-podium-players-list">
              {players.map((p) => (
                <span key={p.slot} className="pd-podium-player">
                  {p.nickname}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="pd-podium-section">
      <div className="pd-podium-head">
        <span className="pd-podium-kicker">GANADORES</span>
        <h3 className="pd-podium-title">FELICIDADES!!!</h3>
      </div>

      <div className="pd-podium-grid">
        {renderCard(second, 2, '2° SUBCAMPEÓN', 'pd-podium-card--silver')}
        {renderCard(first, 1, '1° CAMPEÓN', 'pd-podium-card--gold')}
        {renderCard(third, 3, '3° TERCER LUGAR', 'pd-podium-card--bronze')}
      </div>
    </div>
  )
}


function BracketStageSkeleton() {
  return (
    <div className="pd-stage pd-stage--skeleton" aria-hidden="true">
      <div className="pd-stage-card-skeleton">
        <div className="pd-stage-head-skeleton">
          <div className="pd-shimmer" style={{ width: '180px', height: '22px' }} />
          <div className="pd-shimmer" style={{ width: '130px', height: '16px' }} />
        </div>
        <div className="pd-stage-grid-skeleton">
          <div className="pd-shimmer" style={{ height: '90px', borderRadius: '8px' }} />
          <div className="pd-shimmer" style={{ height: '90px', borderRadius: '8px' }} />
          <div className="pd-shimmer" style={{ height: '90px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  )
}

function Bracket() {
  const { activeGame, setActiveGame } = useRegistration()
  const game = activeGame === 'ff' ? 'ff' : 'mlbb'
  const [data, setData] = useState(null)
  const [teams, setTeams] = useState([])

  useEffect(() => {
    let active = true
    fetchPublishedStages().then((d) => active && setData(d)).catch(() => active && setData({ stages: [] }))
    fetchPublicTeams().then((t) => active && setTeams(t)).catch(() => {})
    return () => { active = false }
  }, [])

  const stages = useMemo(() => (data?.stages ?? []).filter((s) => s.game_key === game), [data, game])

  // Solo si ya cargó y efectivamente no hay fases publicadas
  if (data !== null && data.stages.length === 0) {
    return <PagePlaceholder title="Llaves del torneo" description={description} kind="bracket" />
  }

  const isLoading = data === null

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
      {isLoading ? (
        <>
          <BracketStageSkeleton />
          <BracketStageSkeleton />
        </>
      ) : stages.length === 0 ? (
        <p className="pd-empty">La organización aún no publica el fixture de esta disciplina.</p>
      ) : stages.map((stage, index) => {
        const stageMatches = data.matches.filter((m) => m.stage_id === stage.id)
        const played = stageMatches.filter((m) => m.status === 'completed').length
        return (
          <div className="pd-stage" key={stage.id}>
            <Collapse variant="stage" title={stage.name} defaultOpen={index === stages.length - 1}
              meta={`${STAGE_LABEL[stage.type] ?? ''}${stageMatches.length ? ` · ${played}/${stageMatches.length} ${stage.type === 'battle_royale' ? 'partidas' : 'partidos'}` : ''}`}>
              <StageView stage={stage} data={data} teams={teams} />
            </Collapse>
          </div>
        )
      })}
    </main>
  )
}

export default Bracket
