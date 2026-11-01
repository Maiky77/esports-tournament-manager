import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { submitForBackend } from '../lib/registrationGateway'
import { useTournament } from '../context/TournamentContext'
import { formatSoles } from '../lib/money'
import { publicUrl } from '../lib/tournamentApi'
import SearchSelect from '../components/SearchSelect'
import { institutionGroups, OTHER_INSTITUTION } from '../lib/institutions'
import { careerGroups, OTHER_CAREER } from '../lib/careers'
import { validateTeam, validateRoster, validateUpload } from '../lib/registrationValidation'
import { isSupabaseConfigured } from '../supabaseClient'
import Turnstile from '../components/Turnstile'
import Icon from '../components/Icon'
import YapePayment from '../components/YapePayment'
import CharacterArt from '../components/CharacterArt'
import { useRegistration } from '../context/RegistrationContext'
import ragnarokCrest from '../assets/ragnarok-crest.svg'

const baseGames = {
  mlbb: {
    name: 'Mobile Legends: Bang Bang',
    shortName: 'MOBA MLBB',
    modeBadge: '5V5 MOBA · DRAFT PICK',
    image: '/img/hero-mlbb.jpg',
    pdfUrl: '/docs/Bases_MOBA.pdf',
    pdfName: 'Bases_MOBA.pdf',
    accent: '#b48aff',
    price: 20,
    priceFormatted: 'S/ 20.00',
    detail: 'Capitán + 4 titulares · Hasta 2 suplentes',
    slots: [
      { label: 'CAPITÁN', required: true },
      { label: 'TITULAR 02', required: true },
      { label: 'TITULAR 03', required: true },
      { label: 'TITULAR 04', required: true },
      { label: 'TITULAR 05', required: true },
      { label: 'SUPLENTE 01', required: false },
      { label: 'SUPLENTE 02', required: false },
    ],
  },
  ff: {
    name: 'Free Fire',
    shortName: 'FREE FIRE',
    modeBadge: 'SQUADS BATTLE ROYALE',
    image: '/img/hero-ff.jpg',
    pdfUrl: '/docs/Bases_FF.pdf',
    pdfName: 'Bases_FF.pdf',
    accent: '#ef54a6',
    price: 15,
    priceFormatted: 'S/ 15.00',
    detail: 'Capitán + 3 titulares · 1 suplente opcional',
    slots: [
      { label: 'CAPITÁN', required: true },
      { label: 'TITULAR 02', required: true },
      { label: 'TITULAR 03', required: true },
      { label: 'TITULAR 04', required: true },
      { label: 'SUPLENTE', required: false },
    ],
  },
}
function resolveWhatsappGroup(raw) {
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' && url.hostname === 'chat.whatsapp.com' && url.pathname.length > 1 ? url.href : ''
  } catch { return '' }
}

const professionalSchoolGroups = [
  {
    area: 'Ingenierías',
    schools: [
      'Ingeniería Agronómica',
      'Ingeniería Económica',
      'Ingeniería de Minas',
      'Ingeniería Geológica',
      'Ingeniería Metalúrgica',
      'Ingeniería Química',
      'Ingeniería Estadística e Informática',
      'Ingeniería Topográfica y Agrimensura',
      'Ingeniería Agroindustrial',
      'Ingeniería Agrícola',
      'Ingeniería Civil',
      'Ingeniería de Sistemas',
      'Ingeniería Mecánica Eléctrica',
      'Ingeniería Electrónica',
      'Arquitectura y Urbanismo',
      'Ciencias Físico-Matemáticas: Física',
      'Ciencias Físico-Matemáticas: Matemáticas',
      'Ingeniería de Inteligencia Artificial y Ciencia de Datos',
    ],
  },
  {
    area: 'Biomédicas',
    schools: [
      'Medicina Veterinaria y Zootecnia',
      'Enfermería',
      'Biología: Pesquería',
      'Biología: Microbiología y Laboratorio Clínico',
      'Biología: Ecología',
      'Medicina Humana',
      'Nutrición Humana',
      'Odontología',
    ],
  },
  {
    area: 'Sociales',
    schools: [
      'Ciencias Contables',
      'Trabajo Social',
      'Sociología',
      'Educación Primaria',
      'Educación Inicial',
      'Educación Física',
      'Educación Secundaria: Ciencia, Tecnología y Ambiente',
      'Educación Secundaria: Lengua, Literatura, Psicología y Filosofía',
      'Educación Secundaria: Ciencias Sociales',
      'Educación Secundaria: Matemática, Física, Computación e Informática',
      'Antropología',
      'Derecho',
      'Turismo',
      'Ciencias de la Comunicación Social',
      'Administración',
      'Arte: Música',
      'Arte: Artes Plásticas',
      'Arte: Danza',
      'Psicología',
    ],
  },
]

const professionalSchools = professionalSchoolGroups.flatMap((group) => group.schools)

const STEPS = [
  { num: 1, label: 'Torneo y Equipo', short: 'Equipo' },
  { num: 2, label: 'Roster Oficial', short: 'Roster' },
  { num: 3, label: 'Pago y Confirmación', short: 'Pago' },
]

function Inscription({ modal = false }) {
  const { registrationGame, setActiveGame, closeRegistration, setRegistrationSubmitting } = useRegistration()
  const { games: gameConfig, settings, deadline, availability, fromServer, loading } = useTournament()
  const whatsappGroup = resolveWhatsappGroup(settings.whatsapp_group_url || import.meta.env.VITE_WHATSAPP_GROUP_URL?.trim() || '')
  const [step, setStep] = useState(1)
  const [game, setGame] = useState(() => registrationGame || 'mlbb')

  // Datos Etapa 1
  const [teamName, setTeamName] = useState('')
  const [teamLogo, setTeamLogo] = useState(null)
  const [captainName, setCaptainName] = useState('')
  const [captainWhatsapp, setCaptainWhatsapp] = useState('')
  const [institutionChoice, setInstitutionChoice] = useState('UNAP')
  const [professionalSchool, setProfessionalSchool] = useState('')
  const [customInstitution, setCustomInstitution] = useState('')
  const [customCareer, setCustomCareer] = useState('')
  const [honeypot, setHoneypot] = useState('')

  // Datos Etapa 2 (Roster)
  const [players, setPlayers] = useState(() =>
    Array.from({ length: 15 }, () => ({ nickname: '', id: '', server: '' }))
  )

  // Datos Etapa 3
  const [paymentReceipt, setPaymentReceipt] = useState(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [stepError, setStepError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [captchaToken, setCaptchaToken] = useState('')
  const requestId = useRef(crypto.randomUUID())
  const submitLock = useRef(false)
  const institution = institutionChoice === 'UNAP' ? 'UNAP' : 'Otra'
  const otherInstitution = [OTHER_INSTITUTION, 'Otra'].includes(institutionChoice) ? customInstitution : institutionChoice
  const career = professionalSchool === OTHER_CAREER ? customCareer.trim() : professionalSchool
  const changeInstitution = next => {
    if ((next === 'UNAP') !== (institutionChoice === 'UNAP')) { setProfessionalSchool(''); setCustomCareer('') }
    setInstitutionChoice(next)
  }
  const schoolGroups = useMemo(() => professionalSchoolGroups.map(group => ({ group: group.area, items: group.schools.map(name => ({ value: name, label: name })) })), [])
  const formData = { game, teamName, teamLogo, captainName, captainWhatsapp, institution, professionalSchool: career, otherInstitution, players, paymentReceipt, termsAccepted, honeypot }



  useEffect(() => {
    if (registrationGame && (registrationGame === 'ff' || registrationGame === 'mlbb')) {
      setGame(registrationGame)
    }
  }, [registrationGame])

  const games = useMemo(() => Object.fromEntries(Object.entries(baseGames).map(([key, base]) => {
    const cfg = gameConfig[key]
    const starters = fromServer ? cfg.starters : base.slots.filter(slot => slot.required).length
    const substitutes = fromServer ? cfg.substitutes : base.slots.length - starters
    return [key, { ...base, name: cfg.name || base.name, modeBadge: cfg.badge || base.modeBadge,
      price: cfg.price, priceFormatted: formatSoles(cfg.price, 2),
      slots: Array.from({ length: starters + substitutes }, (_, index) => ({ label: index === 0 ? 'CAPITÁN' : index < starters ? `TITULAR ${String(index + 1).padStart(2, '0')}` : `SUPLENTE ${index - starters + 1}`, required: index < starters })),
      detail: `${starters} titulares + ${substitutes} suplente(s)`,
      pdfUrl: publicUrl('public-assets', cfg.rules_pdf_path) || base.pdfUrl,
    }]
  })), [gameConfig, fromServer])
  const slotInfo = availability?.[game]
  const soldOut = Boolean(fromServer && slotInfo && slotInfo.taken >= slotInfo.max)
  const registrationClosed = fromServer && (!settings.registration_open || !gameConfig[game].is_open || Date.now() > deadline || soldOut)
  const gameInfo = games[game]
  const playerSlots = useMemo(() => gameInfo.slots, [gameInfo])

  const changeGame = (nextGame) => {
    setGame(nextGame)
    setActiveGame(nextGame)

    setStepError(null)
  }

  const updatePlayer = (index, field, value) => {
    setPlayers((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const validate = (error) => {
    setStepError(error)

    return !error
  }
  const validateStep1 = () => validate(validateTeam(formData) || (fromServer && !career.trim() ? 'Selecciona o escribe tu carrera profesional.' : null))
  const validateStep2 = () => validate(validateRoster(game, players, { required: playerSlots.filter(slot => slot.required).length, max: playerSlots.length }))
  const validateStep3 = () => validate(validateUpload(paymentReceipt, true) || (!termsAccepted ? 'Debes aceptar el reglamento oficial.' : null))

  const nextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)

      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3)

      }
    }
  }

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1))
    setStepError(null)

  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading || registrationClosed || (fromServer && Date.now() > deadline)) { setStepError('Las inscripciones están cerradas o la configuración sigue cargando.'); return }
    if (submitLock.current || !validateStep1() || !validateStep2() || !validateStep3()) return
    submitLock.current = true
    setSubmitting(true)
    setRegistrationSubmitting(true)
    setNotice(null)
    try {
      const saved = await submitForBackend(formData, requestId.current, captchaToken, { legacy: fromServer, maxPlayers: playerSlots.length })
      setConfirmation(saved)
    } catch (error) {
      setNotice({ type: 'warning', text: error.message })
      setCaptchaToken('')
    } finally {
      submitLock.current = false
      setSubmitting(false)
      setRegistrationSubmitting(false)
    }
  }

  if (confirmation) return (
    <main className="registration-success" role="status">
      <span className="section-eyebrow">SOLICITUD GUARDADA</span>
      <h2>¡TU EQUIPO ESTÁ EN REVISIÓN!</h2>
      <p>Recibimos los datos y el comprobante de <strong>{confirmation.team_name || teamName}</strong>. La organización verificará el pago antes de confirmar su participación.</p>
      {confirmation.reference_code && <strong className="registration-reference">{confirmation.reference_code}</strong>}
      <p>{confirmation.reference_code ? 'Guarda este código para consultar tu inscripción con la organización.' : 'La organización te contactará por WhatsApp para confirmar la inscripción.'}</p>
      {whatsappGroup && <section className="captain-whatsapp-card"><span className="section-eyebrow">COMUNICACIÓN DEL EQUIPO</span><h3>Este enlace es para el capitán</h3><p>Únete al grupo oficial de capitanes para recibir confirmaciones, horarios, salas e indicaciones de la organización.</p><a href={whatsappGroup} target="_blank" rel="noopener noreferrer" className="backend-button backend-button--primary">UNIRME AL GRUPO DE CAPITANES ↗</a><small>No compartas este enlace fuera del equipo.</small></section>}
      <Link to="/equipos" onClick={closeRegistration} className="competition-home-link">VER EQUIPOS CONFIRMADOS <Icon name="arrow-right" /></Link>
    </main>
  )

  return (
    <main className={`registration-page ${modal ? 'registration-page--modal' : ''}`}>
      {/* Banner de cabecera con arte del juego */}
      <div className={`modal-hero-banner modal-hero-banner--${game}`} style={{ '--banner-accent': gameInfo.accent }}>
        <img className="modal-hero-bg" src={gameInfo.image} alt={gameInfo.name} />
        <div className="modal-hero-overlay" />
        <CharacterArt character={game === 'mlbb' ? 'zetian' : 'moco'} className={`registration-character ${game === 'ff' ? 'registration-character--ff' : ''}`} />
        <div className="modal-hero-content">
          <div className="modal-hero-left">
            <img className="modal-hero-crest" src={ragnarokCrest} alt="Crest" />
            <div>
              <span className="modal-hero-kicker">// RAGNAROK U-SERIES 2026</span>
              <h2>INSCRIBE A TU EQUIPO</h2>
              <div className="modal-hero-tags">
                <span className="modal-hero-tag">{gameInfo.name}</span>
                <span className="modal-hero-tag modal-hero-tag--accent">{gameInfo.modeBadge}</span>
              </div>
            </div>
          </div>
          <div className="modal-hero-price-badge">
            <span className="price-badge-sub">TARIFA DE INSCRIPCIÓN</span>
            <strong className="price-badge-val">{gameInfo.priceFormatted}</strong>
            <small className="price-badge-note">Por equipo completo</small>
          </div>
        </div>
      </div>

      {/* Stepper visual en 3 niveles */}
      <div className="wizard-stepper">
        {STEPS.map((s, idx) => {
          const isActive = step === s.num
          const isDone = step > s.num
          return (
            <div key={s.num} className={`stepper-node ${isActive ? 'stepper-node--active' : ''} ${isDone ? 'stepper-node--done' : ''}`}>
              <div className="stepper-circle">
                {isDone ? <Icon name="check" size={17} /> : s.num}
              </div>
              <div className="stepper-label-wrap">
                <span className="stepper-stage">ETAPA 0{s.num}</span>
                <span className="stepper-title"><span className="stepper-title-full">{s.label}</span><span className="stepper-title-short">{s.short}</span></span>
              </div>
              {idx < STEPS.length - 1 && <div className={`stepper-connector ${step > s.num ? 'stepper-connector--done' : ''}`} />}
            </div>
          )
        })}
      </div>

      <form className="registration-form" onSubmit={handleSubmit}>
        <fieldset className="registration-fields" disabled={submitting || loading}>
        <label className="pd-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={event => setHoneypot(event.target.value)} /></label>
        {registrationClosed && <p className="form-notice form-notice--warning" role="status">{soldOut ? 'Se agotaron los cupos de esta disciplina.' : 'Las inscripciones de esta disciplina están cerradas.'}</p>}
        {!isSupabaseConfigured && <p className="form-notice form-notice--warning" role="status">Las inscripciones todavía no están habilitadas. Puedes preparar tus datos y enviarlos cuando la organización abra el registro.</p>}
        {/* ================= ETAPA 1: TORNEO Y EQUIPO ================= */}
        {step === 1 && (
          <div className="wizard-stage-content">
            <div className="stage-section-intro">
              <span className="stage-eyebrow">PASO 1 DE 3</span>
              <h3>DISCIPLINA Y DATOS GENERALES</h3>
              <p>Selecciona tu juego y registra la información institucional del equipo y su capitán.</p>
            </div>

            <div className="game-choice-grid">
              {Object.entries(games).map(([key, item]) => (
                <button
                  className={`game-choice game-choice--${key} ${game === key ? 'game-choice--active' : ''}`}
                  key={key}
                  onClick={() => changeGame(key)}
                  style={{ '--game-accent': item.accent }}
                  type="button"
                >
                  <img src={item.image} alt="" />
                  <span className="game-choice-overlay" />
                  <span className="game-choice-content">
                    <span className="game-choice-badge">{item.modeBadge}</span>
                    <strong>{item.name}</strong>
                    <small>{item.detail}</small>
                    <div className="game-choice-pricing">
                      <span>Tarifa:</span>
                      <b>{item.priceFormatted}</b>
                    </div>
                  </span>
                  {game === key && <span className="game-choice-status">SELECCIONADO</span>}
                </button>
              ))}
            </div>

            <div className="form-grid form-grid--team">
              <label className="form-field">
                <span>NOMBRE DEL EQUIPO *</span>
                <input
                  maxLength={60}
                  name="teamName"
                  minLength="3"
                  placeholder="Ej.: Ragnarok Wolves"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </label>
              <label className="form-field form-field--file">
                <span>LOGO DEL EQUIPO (OPCIONAL)</span>
                <input
                  accept="image/png,image/jpeg,image/webp"
                  name="teamLogo"
                  type="file"
                  onChange={(e) => setTeamLogo(e.target.files?.[0] || null)}
                />
                <small>{teamLogo ? `Seleccionado: ${teamLogo.name}` : 'PNG, JPG o WEBP · máx. 5 MB (Opcional)'}</small>
              </label>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>NOMBRES Y APELLIDOS DEL CAPITÁN *</span>
                <input
                  maxLength={100}
                  name="captainName"
                  placeholder="Nombre completo del capitán"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  required
                />
              </label>
              <label className="form-field">
                <span>WHATSAPP DEL CAPITÁN *</span>
                <input
                  inputMode="tel"
                  maxLength={24}
                  name="captainWhatsapp"
                  placeholder="999 999 999"
                  value={captainWhatsapp}
                  onChange={(e) => setCaptainWhatsapp(e.target.value)}
                  required
                  type="tel"
                />
              </label>
              {fromServer ? <>
              <SearchSelect
                label="INSTITUCIÓN DE PROCEDENCIA *"
                groups={institutionGroups}
                value={institutionChoice}
                onChange={changeInstitution}
                placeholder="Busca tu universidad o instituto…"
                emptyText="No aparece. Elige “Otra institución” y escribe el nombre."
              />
              <SearchSelect
                label={institution === 'UNAP' ? 'ESCUELA PROFESIONAL (UNAP) *' : 'CARRERA PROFESIONAL *'}
                groups={institution === 'UNAP' ? schoolGroups : careerGroups}
                value={professionalSchool}
                onChange={setProfessionalSchool}
                placeholder={institution === 'UNAP' ? 'Busca tu escuela profesional…' : 'Busca tu carrera…'}
              />
              {institutionChoice === OTHER_INSTITUTION && (
                <label className="form-field">
                  <span>NOMBRE DE LA INSTITUCIÓN *</span>
                  <input
                    name="otherInstitution"
                    maxLength="120"
                    placeholder="Escribe el nombre completo"
                    value={customInstitution}
                    onChange={(e) => setCustomInstitution(e.target.value)}
                  />
                </label>
              )}
              {professionalSchool === OTHER_CAREER && (
                <label className="form-field">
                  <span>NOMBRE DE LA CARRERA *</span>
                  <input name="customCareer" maxLength="120" placeholder="Escribe el nombre de tu carrera" value={customCareer} onChange={(e) => setCustomCareer(e.target.value)} />
                </label>
              )}
              </> : <>
              <label className="form-field">
                <span>INSTITUCIÓN DE PROCEDENCIA *</span>
                <select name="institution" onChange={(e) => changeInstitution(e.target.value)} value={institution}>
                  <option value="UNAP">UNAP (Universidad Nacional del Altiplano)</option>
                  <option value="Otra">Otra universidad o institución</option>
                </select>
              </label>
              {institution === 'UNAP' ? (
                <label className="form-field">
                  <span>ESCUELA PROFESIONAL (UNAP) *</span>
                  <select
                    name="professionalSchool"
                    value={professionalSchool}
                    onChange={(e) => setProfessionalSchool(e.target.value)}
                    required
                  >
                    <option value="">Selecciona tu escuela profesional (45 escuelas)</option>
                    {professionalSchoolGroups.map((group) => (
                      <optgroup key={group.area} label={`── ÁREA DE ${group.area.toUpperCase()} ──`}>
                        {group.schools.map((school) => (
                          <option key={school} value={school}>
                            {school}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="Otra escuela profesional">Otra escuela profesional / Facultad</option>
                  </select>
                </label>
              ) : (
                <label className="form-field">
                  <span>NOMBRE DE LA INSTITUCIÓN *</span>
                  <input
                    maxLength={120}
                    name="otherInstitution"
                    placeholder="Ej.: UANCV, TECSUP, etc."
                    value={otherInstitution}
                    onChange={(e) => setCustomInstitution(e.target.value)}
                    required
                  />
                </label>
              )}
              </>}

            </div>
          </div>
        )}

        {/* ================= ETAPA 2: ROSTER OFICIAL ================= */}
        {step === 2 && (
          <div className="wizard-stage-content">
            <div className="stage-section-intro">
              <span className="stage-eyebrow">PASO 2 DE 3</span>
              <h3>ROSTER OFICIAL — {gameInfo.name.toUpperCase()}</h3>
              <p>
                {game === 'mlbb'
                  ? 'Registra a tus 5 titulares obligatorios y hasta 2 suplentes opcionales. Es obligatorio el Server ID (los 4 dígitos).'
                  : 'Registra a tus 4 titulares obligatorios y 1 suplente opcional para las salas Battle Royale.'}
              </p>
            </div>

            <div className="roster-list">
              <div className={`roster-table-head ${game === 'mlbb' ? 'roster-table-head--mlbb' : ''}`}>
                <span>ROL</span>
                <span>NICKNAME EN JUEGO</span>
                <span>ID DE JUGADOR</span>
                {game === 'mlbb' && <span>SERVER ID</span>}
              </div>

              {playerSlots.map((slot, index) => (
                <div
                  className={`roster-row-compact ${slot.required ? '' : 'roster-row-compact--opt'} ${game === 'mlbb' ? 'roster-row-compact--mlbb' : ''}`}
                  key={`${game}-${slot.label}`}
                >
                  <div className="roster-slot-chip">
                    <span className="roster-slot-idx">
                      {index === 0 ? 'CAP' : slot.required ? `0${index + 1}` : 'SUP'}
                    </span>
                    <span className="roster-slot-label">{slot.label}</span>
                  </div>
                  <input
                    className="compact-input"
                    name={`player-${index}-nickname`}
                    placeholder={`Nickname ${slot.required ? '*' : '(opcional)'}`}
                    value={players[index]?.nickname || ''}
                    onChange={(e) => updatePlayer(index, 'nickname', e.target.value)}
                    required={slot.required}
                  />
                  <input
                    className="compact-input compact-input--mono"
                    inputMode="numeric"
                    name={`player-${index}-id`}
                    placeholder={`ID ${slot.required ? '*' : '(opcional)'}`}
                    value={players[index]?.id || ''}
                    onChange={(e) => updatePlayer(index, 'id', e.target.value.replace(/\D/g, ''))}
                    required={slot.required}
                  />
                  {game === 'mlbb' && (
                    <input
                      className="compact-input compact-input--mono"
                      inputMode="numeric"
                      name={`player-${index}-server`}
                      placeholder={`Server ID ${slot.required ? '*' : '(opcional)'}`}
                      value={players[index]?.server || ''}
                      onChange={(e) => updatePlayer(index, 'server', e.target.value.replace(/\D/g, ''))}
                      required={slot.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ETAPA 3: PAGO Y CONFIRMACIÓN ================= */}
        {step === 3 && (
          <div className="wizard-stage-content">
            <div className="stage-section-intro">
              <span className="stage-eyebrow">PASO 3 DE 3</span>
              <h3>PAGO DE INSCRIPCIÓN Y CONFIRMACIÓN</h3>
              <p>Revisa el resumen de tu equipo, realiza el abono por Yape y adjunta tu comprobante.</p>
            </div>

            {/* Resumen rápido del equipo */}
            <div className="stage-summary-card">
              <div className="summary-col">
                <span className="summary-label">EQUIPO</span>
                <strong>{teamName || '—'}</strong>
                <small>{gameInfo.name} ({gameInfo.modeBadge})</small>
              </div>
              <div className="summary-col">
                <span className="summary-label">CAPITÁN</span>
                <strong>{captainName || '—'}</strong>
                <small>WhatsApp: {captainWhatsapp || '—'}</small>
              </div>
              <div className="summary-col">
                <span className="summary-label">INSTITUCIÓN</span>
                <strong>{institution === 'UNAP' ? professionalSchool || 'UNAP' : otherInstitution || 'Otra'}</strong>
                <small>Roster: {players.slice(0, gameInfo.slots.length).filter((p) => p.nickname?.trim()).length} jugadores registrados</small>
              </div>
            </div>

            <div className="payment-panel">
              <YapePayment amount={gameInfo.priceFormatted} />
              <div className="payment-copy">
                <span className="section-eyebrow">CONFIRMA TU PAGO</span>
                <h2>ADJUNTA EL COMPROBANTE</h2>
                <p>Yapea el importe de tu disciplina al número indicado, verifica el nombre del destinatario y sube la captura. La organización revisará el pago antes de confirmar a tu equipo.</p>
                <label className="form-field form-field--file">
                  <span>COMPROBANTE DE PAGO (CAPTURA DE YAPE) *</span>
                  <input
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    name="paymentReceipt"
                    type="file"
                    onChange={(e) => setPaymentReceipt(e.target.files?.[0] || null)}
                    required
                  />
                  <small>
                    {paymentReceipt ? `Comprobante seleccionado: ${paymentReceipt.name}` : 'Captura de pantalla o PDF · máx. 5 MB'}
                  </small>
                </label>
              </div>
            </div>

            <div className="terms-container">
              <label className="terms-field">
                <input
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  type="checkbox"
                />
                <span>
                  Declaro bajo juramento que los datos del roster son verídicos, que los jugadores cumplen con las normas universitarias y acepto el cumplimiento estricto del{' '}
                  <a
                    href={gameInfo.pdfUrl}
                    download={gameInfo.pdfName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="terms-rule-link"
                  >
                    Reglamento Oficial {gameInfo.name} (Descargar PDF)
                  </a>.
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && <Turnstile token={captchaToken} onToken={setCaptchaToken} />}
        {/* Mensaje de error / validación por etapa */}
        {stepError && <p className="wizard-step-error" role="alert">{stepError}</p>}
        {notice && <p role="alert" className={`form-notice form-notice--${notice.type}`}>{notice.text}</p>}

        {/* Barra de navegación de etapas */}
        <div className="wizard-actions">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="wizard-btn-prev">
              <Icon name="arrow-left" size={16} /> Atrás
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button type="button" onClick={nextStep} className="wizard-btn-next">
              Continuar al {step === 1 ? 'Roster Oficial' : 'Pago'} <Icon name="arrow-right" />
            </button>
          ) : (
            <button className="registration-submit" type="submit" disabled={submitting || loading || registrationClosed || !isSupabaseConfigured} aria-busy={submitting}>
              {submitting ? 'GUARDANDO INSCRIPCIÓN…' : `ENVIAR INSCRIPCIÓN (${gameInfo.priceFormatted})`} <Icon name="arrow-up-right" />
            </button>
          )}
        </div>
        </fieldset>
      </form>
    </main>
  )
}

export default Inscription
