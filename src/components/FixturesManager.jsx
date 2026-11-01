import { useEffect, useState } from 'react'
import { formatMatchDate, MATCH_STATUS } from '../pages/Competition'

const blank = () => ({ title: '', round_name: '', starts_at: '', status: 'scheduled', published: false, entries: [] })
const localDate = value => value ? new Date(value).toLocaleString('sv-SE', { timeZone: 'America/Lima' }).slice(0, 16).replace(' ', 'T') : ''
export default function FixturesManager({ service, game, registrations }) {
  const [matches, setMatches] = useState([])
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [revision, setRevision] = useState(0)
  const teams = registrations.filter(r => r.status === 'approved' && r.game_code === game)
  useEffect(() => {
    let ignore = false
    setMatches([]); setEditing(null); setForm(blank()); setMessage('')
    service.matches(game, true).then(data => { if (!ignore) setMatches(data) }).catch(e => { if (!ignore) setMessage(e.message) })
    return () => { ignore = true }
  }, [service, game, revision])
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const select = id => setForm(prev => ({ ...prev, entries: prev.entries.some(e => e.registration_id === id) ? prev.entries.filter(e => e.registration_id !== id) : [...prev.entries, { registration_id: id, score: '', placement: '', kills: '' }] }))
  const result = (id, field, value) => setForm(prev => ({ ...prev, entries: prev.entries.map(e => e.registration_id === id ? { ...e, [field]: value } : e) }))
  const edit = match => {
    setEditing(match.id)
    setForm({ ...match, starts_at: localDate(match.starts_at), entries: [...match.match_entries].sort((a, b) => a.slot - b.slot).map(e => ({ ...e, score: e.score ?? '', placement: e.placement ?? '', kills: e.kills ?? '' })) })
    setMessage('')
  }
  const save = async event => {
    event.preventDefault()
    if (busy) return
    setBusy(true); setMessage('')
    try {
      await service.saveMatch(editing, { ...form, game_code: game,
        starts_at: form.starts_at ? new Date(form.starts_at + ':00-05:00').toISOString() : null,
        entries: form.entries.map(e => ({ registration_id: e.registration_id, ...Object.fromEntries(['score', 'placement', 'kills'].map(key => [key, e[key] === '' ? null : Number(e[key])])) })),
      })
      setRevision(v => v + 1)
    } catch (e) { setMessage(e.message) } finally { setBusy(false) }
  }
  return <section className="admin-fixtures">
    <div className="admin-match-list"><h2>Encuentros y salas</h2>{matches.length === 0 && <p>Aún no hay encuentros para esta disciplina.</p>}{matches.map(match => <button type="button" key={match.id} className={`admin-match-item ${editing === match.id ? 'admin-match-item--active' : ''}`} onClick={() => edit(match)} disabled={busy}>
      <strong>{match.title}</strong><span>{match.published ? 'PUBLICADO' : 'BORRADOR'} · {MATCH_STATUS[match.status]}</span><small>{formatMatchDate(match.starts_at)}</small>
    </button>)}</div>
    <form className="backend-form" onSubmit={save}><fieldset disabled={busy}>
      <div className="admin-section-heading"><h2>{editing ? 'Editar encuentro' : game === 'ff' ? 'Nueva sala de Free Fire' : 'Nueva serie de MLBB'}</h2>{editing && <button type="button" className="backend-button" onClick={() => { setEditing(null); setForm(blank()); setMessage('') }}>NUEVO</button>}</div>
      <div className="backend-form-grid"><label>Título<input required minLength={3} maxLength={100} value={form.title} onChange={e => update('title', e.target.value)} placeholder={game === 'ff' ? 'Sala 1 · Bermuda' : 'Serie 01'} /></label>
        <label>Ronda / fase<input required maxLength={80} value={form.round_name} onChange={e => update('round_name', e.target.value)} placeholder="Fase de grupos" /></label>
        <label>Fecha y hora de Perú (opcional)<input type="datetime-local" value={form.starts_at} onChange={e => update('starts_at', e.target.value)} /></label>
        <label>Estado<select value={form.status} onChange={e => update('status', e.target.value)}>{Object.entries(MATCH_STATUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </div>
      <h3>Participantes confirmados</h3><p>{game === 'ff' ? 'Marca los equipos que jugarán esta sala. Al finalizar registra posición y kills.' : 'Selecciona los dos equipos de la serie y registra sus victorias al finalizar.'}</p>
      <div className="admin-fixture-teams">{teams.length === 0 && <p>Primero aprueba las inscripciones de esta disciplina.</p>}{teams.map(team => {
        const entry = form.entries.find(e => e.registration_id === team.id)
        return <div className="admin-fixture-team" key={team.id}><label className="backend-checkbox"><input type="checkbox" checked={!!entry} onChange={() => select(team.id)} disabled={!entry && form.entries.length >= (game === 'mlbb' ? 2 : 48)} />{team.team_name}</label>
          {entry && <div className="entry-result-inputs">{(game === 'mlbb' ? ['score'] : ['placement', 'kills']).map(field => <label key={field}>{field === 'score' ? 'Victorias' : field === 'placement' ? 'Posición' : 'Kills'}<input type="number" min={field === 'placement' ? 1 : 0} max={field === 'placement' ? 48 : field === 'kills' ? 1000 : 10000} required={form.status === 'finished'} value={entry[field]} onChange={e => result(team.id, field, e.target.value)} /></label>)}</div>}
        </div>
      })}</div>
      <label className="backend-checkbox"><input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} />Publicar en el fixture visible para todos</label>
      {message && <p className="backend-error" role="alert">{message}</p>}
      <button className="backend-button backend-button--primary" type="submit">{busy ? 'GUARDANDO…' : 'GUARDAR ENCUENTRO'}</button>
    </fieldset></form>
  </section>
}
