import defaultLogo from '../assets/ragnarok-logo-blancoNegro.png'

const MAX_SHOWN = 5

const isBlank = (val) => {
  if (!val) return true
  const s = String(val).trim().toLowerCase()
  return (
    s === 'independiente' ||
    s === 'otra' ||
    s === 'otra institución' ||
    s === 'general' ||
    s === 'sin especificar' ||
    s === 'no especificada' ||
    s === '-' ||
    s === '—'
  )
}

// Tarjeta de un equipo confirmado. Jerarquía: institución (título pequeño), nombre del equipo, carrera.
// Si no tiene institución o carrera registrada, se muestra una raya sutil ("—") para mantener la alineación de la tarjeta.
// En la base se muestra el roster en una sola fila simétrica (hasta 5 jugadores) con truncamiento y tooltip que solo muestra el apodo completo si se corta.
export default function TeamCard({ team, logo }) {
  const players = team.players ?? []

  const rawInst = team.institution?.trim()
  const rawSchool = team.professional_school?.trim()

  const hasInst = !isBlank(rawInst)
  const hasSchool = !isBlank(rawSchool) && (!hasInst || rawSchool.toLowerCase() !== rawInst.toLowerCase())

  const displayInst = hasInst ? rawInst : '—'
  const displaySchool = hasSchool ? rawSchool : '—'

  const shownPlayers = players.slice(0, MAX_SHOWN)
  const extraCount = players.length - MAX_SHOWN
  const cols = extraCount > 0 ? shownPlayers.length + 1 : shownPlayers.length

  return (
    <li className="tc">
      <div className="tc-body">
        <img
          src={logo || defaultLogo}
          alt=""
          loading="lazy"
          className={`tc-logo ${!logo ? 'tc-logo--default' : ''}`}
        />
        <p className={`tc-eyebrow ${!hasInst ? 'tc-dash' : ''}`}>{displayInst}</p>
        <h3 className="tc-name">{team.team_name}</h3>
        <p className={`tc-career ${!hasSchool ? 'tc-dash' : ''}`}>{displaySchool}</p>
      </div>

      {players.length > 0 && (
        <div
          className="tc-roster-row"
          style={{ '--cols': cols }}
          role="list"
          aria-label={`Integrantes de ${team.team_name}`}
        >
          {shownPlayers.map((player) => {
            const isCap = player.slot === 1
            return (
              <div
                key={player.slot}
                className={`tc-cell ${isCap ? 'tc-cell--cap' : ''}`}
                title={player.nickname}
                tabIndex={0}
                role="listitem"
              >
                {isCap && <span className="tc-cap-star" aria-hidden="true">★</span>}
                <span className="tc-cell-text">{player.nickname}</span>
                <span className="tc-cell-tooltip" aria-hidden="true">
                  {player.nickname}
                </span>
              </div>
            )
          })}
          {extraCount > 0 && (
            <div
              className="tc-cell tc-cell--more"
              title={players.slice(MAX_SHOWN).map((p) => p.nickname).join(', ')}
              tabIndex={0}
              role="listitem"
            >
              <span className="tc-cell-text">+{extraCount}</span>
              <span className="tc-cell-tooltip" aria-hidden="true">
                {players.slice(MAX_SHOWN).map((p) => p.nickname).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

