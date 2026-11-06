import { useId, useState } from 'react'
import { initialOf } from '../lib/text'
import defaultLogo from '../assets/ragnarok-logo-blancoNegro.png'

const STACK = 3

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
export default function TeamCard({ team, logo }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const players = team.players ?? []

  const rawInst = team.institution?.trim()
  const rawSchool = team.professional_school?.trim()

  const hasInst = !isBlank(rawInst)
  const hasSchool = !isBlank(rawSchool) && (!hasInst || rawSchool.toLowerCase() !== rawInst.toLowerCase())

  const displayInst = hasInst ? rawInst : '—'
  const displaySchool = hasSchool ? rawSchool : '—'

  return (
    <li className={`tc ${open ? 'tc--open' : ''}`}>
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
        <>
          <button type="button" className="tc-foot" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
            <span className="tc-stack" aria-hidden="true">
              {players.slice(0, STACK).map((p) => <i key={p.slot}>{initialOf(p.nickname)}</i>)}
              {players.length > STACK && <i className="tc-more">+{players.length - STACK}</i>}
            </span>
            <span className="tc-action">{open ? 'Ocultar' : 'Ver'} integrantes<small>{players.length}</small></span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <div className="tc-panel" id={panelId} role="region" aria-label={`Integrantes de ${team.team_name}`}>
            <div className="tc-panel-inner">
              <ol className="tc-roster">
                {players.map((player) => (
                  <li key={player.slot}>
                    <span title={player.nickname}>{player.nickname}</span>
                    {player.slot === 1 && <em className="tc-tag tc-tag--cap">CAP</em>}
                    {player.is_substitute && <em className="tc-tag">SUP</em>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </>
      )}
    </li>
  )
}
