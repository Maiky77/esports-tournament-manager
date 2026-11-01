import { useEffect, useMemo, useState } from 'react'
import { adminSupabase } from '../supabaseClient'
import { backendMessage, createTournamentService } from '../lib/tournamentService'
import FixturesManager from '../components/FixturesManager'
import Turnstile from '../components/Turnstile'

const STATUS = { pending: 'PENDIENTE', approved: 'CONFIRMADO', rejected: 'RECHAZADO' }
export default function Admin() {
  const [session, setSession] = useState(null)
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const [notes, setNotes] = useState({})
  const [receipts, setReceipts] = useState({})
  const [tab, setTab] = useState('registrations')
  const [game, setGame] = useState('mlbb')
  const [status, setStatus] = useState('pending')
  const [revision, setRevision] = useState(0)
  const service = useMemo(() => createTournamentService(() => adminSupabase), [])
  useEffect(() => {
    if (!adminSupabase) { setChecking(false); return }
    let ignore = false
    adminSupabase.auth.getSession().then(({ data }) => { if (!ignore) { setSession(data.session); setChecking(false) } })
    const { data } = adminSupabase.auth.onAuthStateChange((_event, next) => { setSession(next); setAllowed(false) })
    return () => { ignore = true; data.subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    if (!session) { setAllowed(false); setRegistrations([]); return }
    let ignore = false
    setChecking(true)
    adminSupabase.rpc('is_event_admin').then(({ data, error: authError }) => {
      if (!ignore) { setAllowed(!authError && data === true); if (authError || !data) setError('Esta cuenta no tiene permisos de organizador.'); setChecking(false) }
    })
    return () => { ignore = true }
  }, [session])
  useEffect(() => {
    if (!allowed) return
    let ignore = false
    service.registrations().then(rows => { if (!ignore) setRegistrations(rows) }).catch(e => { if (!ignore) setError(e.message) })
    return () => { ignore = true }
  }, [allowed, service, revision])
  const login = async event => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const result = await adminSupabase.auth.signInWithPassword({ email, password, options: { captchaToken } })
      if (result.error) throw new Error(/captcha/i.test(result.error.message) ? 'Completa de nuevo la verificación.' : 'No se pudo iniciar sesión. Revisa el correo y la contraseña.')
      setPassword('')
    } catch (e) { setError(e.message); setCaptchaToken('') } finally { setBusy(false) }
  }
  const review = async (registration, nextStatus) => {
    setBusy(true); setError('')
    try { await service.review(registration.id, nextStatus, notes[registration.id] || ''); setRevision(v => v + 1) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const receipt = async registration => {
    setBusy(true); setError('')
    try { const url = await service.receipt(registration.receipt_path); setReceipts(prev => ({ ...prev, [registration.id]: url })) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const logout = async () => {
    const { error: authError } = await adminSupabase.auth.signOut()
    if (authError) setError(backendMessage(authError))
    else { setError(''); setReceipts({}); setNotes({}) }
  }
  const filtered = registrations.filter(r => r.game_code === game && r.status === status)
  const gameRegistrations = registrations.filter(r => r.game_code === game)
  const pendingCount = gameRegistrations.filter(r => r.status === 'pending').length
  const approvedCount = gameRegistrations.filter(r => r.status === 'approved').length
  return <main className="competition-page admin-page">
    {session && <header className="admin-console-heading"><div><span className="admin-kicker">RAGNAROK / PANEL PRIVADO</span><h1>Centro de operaciones</h1><p>Gestiona inscripciones, comprobantes y encuentros publicados.</p></div><span className="admin-security-badge">ACCESO RESTRINGIDO</span></header>}
    {error && <p className="backend-error" role="alert">{error}</p>}
    {checking ? <p role="status">Verificando acceso…</p> : !adminSupabase ? <p className="backend-empty">Falta configurar la conexión del evento.</p> : !session ?
      <section className="admin-login-shell"><aside className="admin-login-brand"><div className="admin-login-brand-mark"><img src="/images/ragnarok-contexto.png" alt="Ragnarok U-Series" width="320" height="100" /></div><span className="admin-login-brand-kicker">CONSOLA DE ORGANIZACIÓN</span><h1>Todo el torneo,<br /><em>bajo control.</em></h1><p>Administra equipos, pagos y resultados desde un espacio centralizado.</p><ul><li><i />Validación de inscripciones</li><li><i />Publicación del fixture</li><li><i />Seguimiento de resultados</li></ul><small>RAGNAROK U-SERIES · PUNO 2026</small></aside><form className="backend-form admin-login" onSubmit={login}><div className="admin-login-intro"><span>ACCESO DE ORGANIZADOR</span><h2>Inicia sesión</h2><p>Usa tus credenciales autorizadas para continuar.</p></div><label>Correo electrónico<input type="email" required autoComplete="username" placeholder="organizador@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Contraseña<input type="password" required autoComplete="current-password" placeholder="Ingresa tu contraseña" value={password} onChange={e => setPassword(e.target.value)} /></label><Turnstile token={captchaToken} onToken={setCaptchaToken} /><button type="submit" className="backend-button backend-button--primary" disabled={busy}>{busy ? 'VERIFICANDO…' : 'ENTRAR A LA CONSOLA'}</button><small className="admin-login-note"><span className="admin-login-lock">●</span> Sesión cifrada · Solo personal autorizado</small></form></section> :
        <><div className="admin-session"><span><b>SESIÓN ACTIVA</b>{session.user.email}</span><button type="button" className="backend-button" onClick={logout}>CERRAR SESIÓN</button></div>
          <div className="admin-metrics"><button type="button" className={`admin-metric ${status === 'pending' && tab === 'registrations' ? 'admin-metric--active' : ''}`} onClick={() => { setTab('registrations'); setStatus('pending') }}><span>POR REVISAR</span><strong>{pendingCount}</strong><small>pagos pendientes</small></button><button type="button" className={`admin-metric ${status === 'approved' && tab === 'registrations' ? 'admin-metric--active' : ''}`} onClick={() => { setTab('registrations'); setStatus('approved') }}><span>EQUIPOS CONFIRMADOS</span><strong>{approvedCount}</strong><small>disponibles para sorteo</small></button><div className="admin-metric"><span>DISCIPLINA ACTIVA</span><strong>{game === 'ff' ? 'FF' : 'MLBB'}</strong><small>panel operativo</small></div></div>
          <div className="admin-workflow" aria-label="Flujo de organización"><div><b>01</b><span>Revisa pagos</span></div><i /><div><b>02</b><span>Confirma equipos</span></div><i /><div><b>03</b><span>Sortear cruces</span></div><i /><div><b>04</b><span>Publicar resultados</span></div></div>
          {allowed && <><div className="competition-toolbar"><div className="competition-filters" role="group" aria-label="Sección de administración"><button type="button" aria-pressed={tab === 'registrations'} onClick={() => setTab('registrations')}>INSCRIPCIONES</button><button type="button" aria-pressed={tab === 'fixture'} onClick={() => setTab('fixture')}>FIXTURE</button></div><div className="competition-filters admin-game-filters" role="group" aria-label="Disciplina"><button type="button" aria-pressed={game === 'mlbb'} onClick={() => setGame('mlbb')}><img src="/img/logomlbb.png" alt="" aria-hidden="true" /><span>MLBB</span></button><button type="button" aria-pressed={game === 'ff'} onClick={() => setGame('ff')}><img src="/img/logoffcondondo.webp" alt="" aria-hidden="true" /><span>FREE FIRE</span></button></div></div>
            {tab === 'fixture' ? <FixturesManager service={service} game={game} registrations={registrations} /> : <>
              <div className="admin-workspace-heading"><div><span className="admin-kicker">CONTROL DE INSCRIPCIONES</span><h2>Solicitudes de equipos</h2><p>Aprueba los pagos para habilitar los equipos en el sorteo y el fixture.</p></div><button type="button" className="backend-button" onClick={() => setRevision(v => v + 1)}>ACTUALIZAR DATOS</button></div>
              <div className="admin-status-filter"><label>Mostrar solicitudes <select value={status} onChange={e => setStatus(e.target.value)}>{Object.entries(STATUS).map(([key, label]) => <option key={key} value={key}>{label} ({registrations.filter(r => r.status === key && r.game_code === game).length})</option>)}</select></label></div>
              {filtered.length === 0 && <p className="backend-empty">No hay inscripciones con este estado.</p>}
              <div className="admin-registration-grid">{filtered.map(registration => <article className="admin-registration" key={registration.id}>
                <div className="admin-section-heading"><div className="admin-registration-team">{registration.logo_url ? <img src={registration.logo_url} alt="" width="58" height="58" /> : <span className="admin-team-initials">{registration.team_name.slice(0, 2).toUpperCase()}</span>}<div><h2>{registration.team_name}</h2><span>{registration.institution}</span></div></div><span className={`status-tag status-tag--${registration.status}`}>{STATUS[registration.status]}</span></div>
                <p className="registration-reference-small">{registration.reference_code}</p><dl><dt>Capitán</dt><dd>{registration.captain_name}</dd><dt>WhatsApp</dt><dd>{registration.captain_whatsapp}</dd><dt>Institución</dt><dd>{registration.institution} {registration.professional_school}</dd><dt>Importe esperado</dt><dd>S/ {Number(registration.fee_amount).toFixed(2)}</dd></dl>
                <details><summary>VER ROSTER ({registration.registration_players.length})</summary><ul className="admin-roster">{[...registration.registration_players].sort((a, b) => a.slot - b.slot).map(player => <li key={player.id}><strong>{player.nickname}</strong><span>ID {player.player_id}{player.server_id && ` (${player.server_id})`}</span></li>)}</ul></details>
                <button type="button" className="backend-button" disabled={busy} onClick={() => receipt(registration)}>GENERAR ENLACE DEL COMPROBANTE</button>{receipts[registration.id] && <a className="receipt-link" href={receipts[registration.id]} target="_blank" rel="noopener noreferrer">ABRIR COMPROBANTE (VÁLIDO 5 MIN) ↗</a>}
                {registration.review_note && <p>Nota: {registration.review_note}</p>}
                {registration.status !== 'rejected' && <><label className="admin-review-note">Nota de revisión (obligatoria al rechazar)<textarea maxLength={1000} value={notes[registration.id] || ''} onChange={e => setNotes(prev => ({ ...prev, [registration.id]: e.target.value }))} /></label><div className="admin-review-actions">{registration.status === 'pending' && <button type="button" className="backend-button backend-button--primary" disabled={busy} onClick={() => review(registration, 'approved')}>APROBAR PAGO Y EQUIPO</button>}<button type="button" className="backend-button backend-button--danger" disabled={busy || (notes[registration.id] || '').trim().length < 3} onClick={() => review(registration, 'rejected')}>RECHAZAR</button></div></>}
              </article>)}</div>
            </>}
          </>}
        </>}
  </main>
}
