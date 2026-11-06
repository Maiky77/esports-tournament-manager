import { useState } from 'react'
import defaultLogo from '../assets/ragnarok-logo-blancoNegro.png'

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

// Tarjeta de un equipo confirmado. Jerarquía: institución (título pequeño) con indicador de integrantes integrado en texto, nombre del equipo, carrera.
// Al presionar en cualquier parte de la tarjeta se despliega la bandeja de chips en 3 columnas con los integrantes.
export default function TeamCard({ team, logo }) {
  const [open, setOpen] = useState(false)
  const players = team.players ?? []

  const rawInst = team.institution?.trim()
  const rawSchool = team.professional_school?.trim()

  const hasInst = !isBlank(rawInst)
  const hasSchool = !isBlank(rawSchool) && (!hasInst || rawSchool.toLowerCase() !== rawInst.toLowerCase())

  const displayInst = hasInst ? rawInst : '—'
  const displaySchool = hasSchool ? rawSchool : '—'

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((prev) => !prev)
    }
  }

  return (
    <li
      className={`tc ${open ? 'tc--open' : ''}`}
      onClick={() => setOpen((prev) => !prev)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      aria-label={`Equipo ${team.team_name}, ${players.length} integrantes. Presiona para ${open ? 'ocultar' : 'ver'} integrantes.`}
    >
      <div className="tc-body">
        <img
          src={logo || defaultLogo}
          alt=""
          loading="lazy"
          className={`tc-logo ${!logo ? 'tc-logo--default' : ''}`}
        />
        <div className="tc-eyebrow-row">
          <p className={`tc-eyebrow ${!hasInst ? 'tc-dash' : ''}`}>{displayInst}</p>
          {players.length > 0 && (
            <span className="tc-meta-clean" aria-hidden="true">
              {players.length}
              <svg
                className="tc-meta-chevron"
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          )}
        </div>
        <h3 className="tc-name">{team.team_name}</h3>
        <p className={`tc-career ${!hasSchool ? 'tc-dash' : ''}`}>{displaySchool}</p>
      </div>

      {players.length > 0 && (
        <div className="tc-chips-tray" aria-hidden={!open}>
          <div className="tc-chips-inner">
            <div
              className="tc-chips-row"
              role="list"
              onClick={(e) => e.stopPropagation()}
            >
              {players.map((player) => {
                const isCap = player.slot === 1
                return (
                  <div
                    key={player.slot}
                    className={`tc-chip ${isCap ? 'tc-chip--cap' : ''}`}
                    role="listitem"
                  >
                    {isCap && <span className="tc-chip-star" aria-hidden="true">★</span>}
                    <span className="tc-chip-text">{player.nickname}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </li>
  )
}
