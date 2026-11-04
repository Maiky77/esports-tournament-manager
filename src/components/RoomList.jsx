import { useEffect, useState } from 'react'

function shortInst(str) {
  if (!str) return ''
  if (str.includes('·')) return str.split('·')[0].trim()
  return str
}

// Llaves del torneo (Free Fire): pestañas horizontales por sala y 3 columnas con logo grande (44px).
// Al tocar un equipo, se despliegan exclusivamente sus integrantes.
export default function RoomList({ teams, logoOf }) {
  const [openId, setOpenId] = useState(null)
  const rooms = new Map()
  teams.forEach((team) => {
    const room = team.room ?? 1
    if (!rooms.has(room)) rooms.set(room, [])
    rooms.get(room).push(team)
  })
  const ordered = [...rooms.entries()].sort((a, b) => a[0] - b[0])
  const [activeRoom, setActiveRoom] = useState(() => ordered[0]?.[0] ?? 1)

  useEffect(() => {
    if (ordered.length > 0 && !rooms.has(activeRoom)) {
      setActiveRoom(ordered[0][0])
    }
  }, [ordered, activeRoom, rooms])

  const currentList = rooms.get(activeRoom) || ordered[0]?.[1] || []

  return (
    <div className="pd-room-tabs-container">
      {ordered.length > 1 && (
        <div className="pd-room-tabs-nav" role="tablist" aria-label="Salas del torneo">
          {ordered.map(([room, list]) => (
            <button
              key={room}
              type="button"
              role="tab"
              aria-selected={activeRoom === room}
              className={`pd-room-tab-btn ${activeRoom === room ? 'pd-room-tab-btn--active' : ''}`}
              onClick={() => {
                setActiveRoom(room)
                setOpenId(null)
              }}
            >
              <span>Sala {room}</span>
              <span className="pd-room-tab-badge">{list.length}</span>
            </button>
          ))}
        </div>
      )}

      <section className="pd-room-single-card">
        <header>
          <h3>Sala {activeRoom}</h3>
          <span>{currentList.length} {currentList.length === 1 ? 'equipo' : 'equipos'}</span>
        </header>
        <p className="pd-room-help">Toca un equipo para ver sus integrantes.</p>

        <div className="pd-room-colhead-3" aria-hidden="true">
          <span className="pd-colhead-slot">Slot</span>
          <span>Equipo</span>
          <span>Institución</span>
          <span>Carrera</span>
          <span />
        </div>

        <ol className="pd-room-list-3">
          {[...currentList]
            .sort((a, b) => (a.slot ?? 99) - (b.slot ?? 99) || a.team_name.localeCompare(b.team_name))
            .map((team) => {
              const logo = logoOf(team)
              const open = openId === team.id
              return (
                <li key={team.id} className={open ? 'pd-room-item-3 pd-room-item-3--open' : 'pd-room-item-3'}>
                  <button
                    type="button"
                    className="pd-room-row-3"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : team.id)}
                  >
                    <b className="pd-room-num-3" title="Lugar en la sala">{team.slot ?? '·'}</b>
                    <div className="pd-room-team-cell">
                      {logo ? (
                        <img src={logo} alt="" loading="lazy" className="pd-room-logo-3" />
                      ) : (
                        <span className="pd-room-logo-3 pd-room-logo-3--empty" aria-hidden="true">
                          {team.team_name[0]}
                        </span>
                      )}
                      <div className="pd-room-team-info">
                        <strong className="pd-room-team-title">{team.team_name}</strong>
                        <div className="pd-room-mobile-sub">
                          {team.institution && <span className="pd-room-sub-inst">{shortInst(team.institution)}</span>}
                          {team.professional_school && (
                            <span className="pd-room-sub-career">{team.professional_school}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pd-room-col-inst" title={team.institution || ''}>
                      {team.institution || '—'}
                    </div>

                    <div className="pd-room-col-career" title={team.professional_school || ''}>
                      {team.professional_school || '—'}
                    </div>

                    <span className="pd-room-caret-3" aria-hidden="true">{open ? '▾' : '▸'}</span>
                  </button>

                  {open && (
                    <div className="pd-room-detail-3">
                      <div className="pd-room-detail-head">
                        <span className="pd-room-detail-title">Integrantes de {team.team_name}</span>
                        {team.players?.length > 0 && (
                          <small className="pd-room-detail-meta">
                            {(() => {
                              const tit = team.players.filter((p) => !p.is_substitute).length
                              const sup = team.players.filter((p) => p.is_substitute).length
                              return sup > 0 ? `${tit} titulares + ${sup} ${sup > 1 ? 'suplentes' : 'suplente'}` : `${tit} jugadores`
                            })()}
                          </small>
                        )}
                      </div>
                      {team.players?.length > 0 ? (
                        <ul className="pd-room-players-chips" aria-label={`Integrantes de ${team.team_name}`}>
                          {team.players.map((player) => (
                            <li key={player.slot} className="pd-room-player-chip">
                              <span className="pd-player-nick">{player.nickname}</span>
                              {player.slot === 1 && <em className="cap">CAP</em>}
                              {player.is_substitute && <em className="sup">SUP</em>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="pd-room-empty-players">Integrantes no disponibles.</p>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
        </ol>
      </section>
    </div>
  )
}
