import { useEffect, useMemo, useState } from 'react'
import { fetchSchedule } from '../lib/tournamentApi'
import { buildSchedule, dayLabel, timeLabel } from '../lib/schedule'
import PagePlaceholder from './PagePlaceholder'
import Collapse from '../components/Collapse'

const description = 'Fechas y horarios de cada partido de RAGNAROK U-Series. Horario de Lima, Perú.'
const GAME = { mlbb: 'Mobile Legends', ff: 'Free Fire' }
const FILTERS = [['all', 'TODO'], ['mlbb', 'MOBILE LEGENDS'], ['ff', 'FREE FIRE']]
const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1)

function Schedule() {
  const [raw, setRaw] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let active = true
    fetchSchedule().then((d) => active && setRaw(d)).catch(() => active && setRaw({ matches: [], stages: [], events: [] }))
    return () => { active = false }
  }, [])

  const days = useMemo(() => {
    if (!raw) return []
    return buildSchedule(raw)
      .map((day) => ({ ...day, items: day.items.filter((item) => filter === 'all' || !item.game || item.game === filter) }))
      .filter((day) => day.items.length > 0)
  }, [raw, filter])

  if (!raw || (raw.matches.length === 0 && raw.events.length === 0)) {
    return <PagePlaceholder title="Cronograma" description={description} kind="schedule" />
  }

  // Abre el día de hoy; si hoy no hay nada, el próximo día con partidos (o el último).
  const todayKey = days.find((d) => d.isToday)?.key
  const upcoming = days.find((d) => d.items.some((i) => i.isNext))?.key
  const openKey = todayKey ?? upcoming ?? days.at(-1)?.key

  return (
    <main className="competition-page">
      <header className="competition-heading template-section-title">
        <span>RAGNAROK / FECHAS Y HORARIOS</span>
        <h1>Cronograma</h1><p>{description}</p>
      </header>
      <div className="competition-filters" role="group" aria-label="Disciplina del torneo">
        {FILTERS.map(([key, label]) => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}
      </div>

      {days.length === 0 ? (
        <p className="pd-empty">Aún no hay horarios publicados para esta disciplina.</p>
      ) : (
        <div className="sc-days">
          {days.map((day) => (
            <Collapse key={day.key} variant="stage" defaultOpen={day.key === openKey}
              title={<>{cap(dayLabel(day.key))}{day.isToday && <em className="sc-today">HOY</em>}</>}
              meta={`${day.items.length} ${day.items.length === 1 ? 'actividad' : 'actividades'}`}>
              <ol className="sc-list">
                {day.items.map((item) => (
                  <li key={`${item.kind}-${item.id}`} className={`sc-item ${item.kind === 'event' ? 'sc-item--event' : ''} ${item.done ? 'sc-item--done' : ''} ${item.isNext ? 'sc-item--next' : ''}`}>
                    <time className="sc-time" dateTime={item.at}>{timeLabel(item.at)}{item.end && <small>{timeLabel(item.end)}</small>}</time>
                    <div className="sc-body">
                      <p className="sc-title">{item.title}</p>
                      <p className="sc-sub">
                        {item.kind === 'event' ? <span className="sc-tag sc-tag--event">Evento</span> : <span className={`sc-tag sc-tag--${item.game}`}>{GAME[item.game]}</span>}
                        {item.game && item.kind === 'event' && <span className={`sc-tag sc-tag--${item.game}`}>{GAME[item.game]}</span>}
                        {item.stage && <span>{item.stage}</span>}
                        {item.detail && <span>{item.detail}</span>}
                      </p>
                    </div>
                    {item.isNext && <span className="sc-chip sc-chip--next">Siguiente</span>}
                    {item.done && <span className="sc-chip">Terminado</span>}
                  </li>
                ))}
              </ol>
            </Collapse>
          ))}
        </div>
      )}
    </main>
  )
}

export default Schedule
