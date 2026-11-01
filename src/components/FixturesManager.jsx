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
  const standings = game === 'ff' ? teams.map(team => {
    const entries = matches.flatMap(match => match.status === 'finished' ? match.match_entries.filter(entry => entry.registration_id === team.id) : [])
    const kills = entries.reduce((sum, entry) => sum + (entry.kills || 0), 0)
    const placementPoints = entries.reduce((sum, entry) => sum + ([12, 9, 8, 7, 6, 5, 4, 3, 2, 1][(entry.placement || 0) - 1] || 0), 0)
    return { team, kills, points: placementPoints + kills, rounds: entries.length }
  }).filter(row => row.rounds).sort((a, b) => b.points - a.points || b.kills - a.kills) : []
  useEffect(() => {
    let ignore = false
    setMatches([]); setEditing(null); setForm(blank()); setMessage('')
    service.matches(game, true).then(data => { if (!ignore) setMatches(data) }).catch(e => { if (!ignore) setMessage(e.message) })
    return () => { ignore = true }
  }, [service, game, revision])
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const select = id => setForm(prev => ({ ...prev, entries: prev.entries.some(e => e.registration_id === id) ? prev.entries.filter(e => e.registration_id !== id) : [...prev.entries, { registration_id: id, score: '', placement: '', kills: '' }] }))
  const result = (id, field, value) => setForm(prev => ({ ...prev, entries: prev.entries.map(e => e.registration_id === id ? { ...e, [field]: value } : e) }))
  const drawNextMatch = () => {
    const shuffled = [...teams].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, game === 'mlbb' ? 2 : 48)
    setForm(prev => ({ ...prev, entries: selected.map((team, slot) => ({ registration_id: team.id, slot: slot + 1, score: '', placement: '', kills: '' })) }))
    setMessage(game === 'mlbb' ? 'Sorteo preparado: se seleccionaron dos equipos al azar.' : `Sorteo preparado: ${selected.length} equipos seleccionados al azar.`)
  }
  const createNextRound = async () => {
    const finished = matches.filter(match => match.status === 'finished' && match.game_code === 'mlbb')
    const winners = finished.map(match => {
      const entries = [...match.match_entries].sort((a, b) => b.score - a.score)
      return entries[0]?.registration_id
    }).filter(Boolean)
    if (winners.length < 2) { setMessage('Se necesitan al menos dos ganadores de series finalizadas.'); return }
    setBusy(true); setMessage('')
    try {
      const round = `Ronda ${new Set(finished.map(match => match.round_name)).size + 1}`
      for (let index = 0; index < winners.length - 1; index += 2) {
        await service.saveMatch(null, {
          game_code: 'mlbb', title: `Serie ${index / 2 + 1} · ${round}`, round_name: round,
          starts_at: null, status: 'scheduled', published: false,
          entries: winners.slice(index, index + 2).map(registration_id => ({ registration_id, score: null, placement: null, kills: null })),
        })
      }
      setRevision(value => value + 1)
      setMessage(`Se generaron ${Math.floor(winners.length / 2)} series para ${round}. Revisa y publícalas cuando estén listas.`)
    } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }
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
    <div className="admin-match-list"><div className="admin-fixture-list-heading"><div><span className="admin-kicker">OPERACIÓN EN VIVO</span><h2>Encuentros y salas</h2></div>{game === 'mlbb' && <button type="button" className="backend-button" onClick={createNextRound} disabled={busy}>GENERAR SIGUIENTE RONDA</button>}</div>{matches.length === 0 && <p>Aún no hay encuentros para esta disciplina.</p>}{matches.map(match => <button type="button" key={match.id} className={`admin-match-item ${editing === match.id ? 'admin-match-item--active' : ''}`} onClick={() => edit(match)} disabled={busy}>
      <strong>{match.title}</strong><span>{match.published ? 'PUBLICADO' : 'BORRADOR'} · {MATCH_STATUS[match.status]}</span><small>{formatMatchDate(match.starts_at)}</small>
    </button>)}{game === 'ff' && <div className="admin-standings"><div className="admin-fixture-list-heading"><div><span className="admin-kicker">CLASIFICACIÓN ACUMULADA</span><h2>Free Fire</h2></div><small>1 punto por kill · top 10: 12/9/8/7/6/5/4/3/2/1</small></div>{standings.length === 0 ? <p>Finaliza una sala para comenzar la clasificación.</p> : standings.map((row, index) => <div className="admin-standing-row" key={row.team.id}><b>#{index + 1}</b>{row.team.logo_url ? <img src={row.team.logo_url} alt="" width="32" height="32" /> : <span className="admin-team-initials">{row.team.team_name.slice(0, 2).toUpperCase()}</span>}<strong>{row.team.team_name}</strong><span>{row.points} pts · {row.kills} kills</span></div>)}</div>}</div>
    <form className="backend-form" onSubmit={save}><fieldset disabled={busy}>
      <div className="admin-section-heading"><h2>{editing ? 'Editar encuentro' : game === 'ff' ? 'Nueva sala de Free Fire' : 'Nueva serie de MLBB'}</h2>{editing && <button type="button" className="backend-button" onClick={() => { setEditing(null); setForm(blank()); setMessage('') }}>NUEVO</button>}</div>
      <div className="backend-form-grid"><label>Título<input required minLength={3} maxLength={100} value={form.title} onChange={e => update('title', e.target.value)} placeholder={game === 'ff' ? 'Sala 1 · Bermuda' : 'Serie 01'} /></label>
        <label>Ronda / fase<input required maxLength={80} value={form.round_name} onChange={e => update('round_name', e.target.value)} placeholder="Fase de grupos" /></label>
        <label>Fecha y hora de Perú (opcional)<input type="datetime-local" value={form.starts_at} onChange={e => update('starts_at', e.target.value)} /></label>
        <label>Estado<select value={form.status} onChange={e => update('status', e.target.value)}>{Object.entries(MATCH_STATUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </div>
      <div className="admin-fixture-section-heading"><div><h3>Participantes confirmados</h3><p>{game === 'ff' ? 'Marca los equipos que jugarán esta sala. Al finalizar registra posición y kills.' : 'Selecciona los dos equipos de la serie y registra sus victorias al finalizar.'}</p></div><button type="button" className="backend-button" onClick={drawNextMatch} disabled={busy || teams.length < 2}>SORTEAR {game === 'ff' ? 'SALA' : 'ENFRENTAMIENTO'}</button></div>
      <div className="admin-fixture-teams">{teams.length === 0 && <p>Primero aprueba las inscripciones de esta disciplina.</p>}{teams.map(team => {
        const entry = form.entries.find(e => e.registration_id === team.id)
        return <div className={`admin-fixture-team ${entry ? 'admin-fixture-team--selected' : ''}`} key={team.id}><label className="backend-checkbox"><input type="checkbox" checked={!!entry} onChange={() => select(team.id)} disabled={!entry && form.entries.length >= (game === 'mlbb' ? 2 : 48)} />{team.logo_url ? <img src={team.logo_url} alt="" width="42" height="42" /> : <span className="admin-team-initials">{team.team_name.slice(0, 2).toUpperCase()}</span>}<span><strong>{team.team_name}</strong><small>{team.institution}</small></span></label>
          {entry && <div className="entry-result-inputs">{(game === 'mlbb' ? ['score'] : ['placement', 'kills']).map(field => <label key={field}>{field === 'score' ? 'Victorias' : field === 'placement' ? 'Posición' : 'Kills'}<input type="number" min={field === 'placement' ? 1 : 0} max={field === 'placement' ? 48 : field === 'kills' ? 1000 : 10000} required={form.status === 'finished'} value={entry[field]} onChange={e => result(team.id, field, e.target.value)} /></label>)}</div>}
        </div>
      })}</div>
      <label className="backend-checkbox"><input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} />Publicar en el fixture visible para todos</label>
      {message && <p className="backend-error" role="alert">{message}</p>}
      <button className="backend-button backend-button--primary" type="submit">{busy ? 'GUARDANDO…' : 'GUARDAR ENCUENTRO'}</button>
    </fieldset></form>
  </section>
}
