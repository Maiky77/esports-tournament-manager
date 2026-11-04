import { useState } from 'react'

// Llaves del torneo (Free Fire): cada sala con sus equipos y el LUGAR EN LA SALA de cada uno.
// Se toca un equipo para ver sus integrantes, su institución y su carrera.
export default function RoomList({ teams, logoOf }) {
  const [openId, setOpenId] = useState(null)
  const rooms = new Map()
  teams.forEach((team) => {
    const room = team.room ?? 1
    if (!rooms.has(room)) rooms.set(room, [])
    rooms.get(room).push(team)
  })
  const ordered = [...rooms.entries()].sort((a, b) => a[0] - b[0])
  return (
    <div className="pd-room-lists">
      {ordered.map(([room, list]) => (
        <section className="pd-room-card" key={room}>
          <header><h3>Sala {room}</h3><span>{list.length} {list.length === 1 ? 'equipo' : 'equipos'}</span></header>
          <p className="pd-room-help">Toca un equipo para ver sus integrantes.</p>
          <div className="pd-room-colhead"><span>Lugar en la sala</span><span>Equipo</span></div>
          <ol>
            {[...list].sort((a, b) => (a.slot ?? 99) - (b.slot ?? 99) || a.team_name.localeCompare(b.team_name)).map((team) => {
              const logo = logoOf(team)
              const open = openId === team.id
              return (
                <li key={team.id} className={open ? 'pd-room-item pd-room-item--open' : 'pd-room-item'}>
                  <button type="button" className="pd-room-row" aria-expanded={open} onClick={() => setOpenId(open ? null : team.id)}>
                    <b className="pd-room-num" title="Lugar en la sala">{team.slot ?? '·'}</b>
                    {logo ? <img src={logo} alt="" loading="lazy" className="pd-room-logo" /> : <span className="pd-room-logo pd-room-logo--empty" aria-hidden="true">{team.team_name[0]}</span>}
                    <span className="pd-room-name">
                      <strong>{team.team_name}</strong>
                      {team.institution && <small>{team.institution}</small>}
                      {team.professional_school && <small className="pd-room-career-sub">{team.professional_school}</small>}
                    </span>
                    <span className="pd-room-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
                  </button>
                  {open && (
                    <div className="pd-room-detail">
                      {team.professional_school && <p className="pd-room-career">{team.professional_school}</p>}
                      {team.players.length > 0 ? (
                        <ul className="tm-players" aria-label={`Integrantes de ${team.team_name}`}>
                          {team.players.map((player) => (
                            <li key={player.slot}>
                              <span className="tm-nick">{player.nickname}</span>
                              {player.slot === 1 && <em>CAP</em>}
                              {player.is_substitute && <em>SUP</em>}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="pd-room-career">Integrantes no disponibles.</p>}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
