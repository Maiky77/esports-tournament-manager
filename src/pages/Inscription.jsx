import { useEffect, useMemo, useState } from 'react'
import { audio } from '../lib/audioEngine'
import { useRegistration } from '../context/RegistrationContext'
import ragnarokCrest from '../assets/ragnarok-crest.svg'

const games = {
  mlbb: {
    name: 'Mobile Legends: Bang Bang',
    shortName: 'MOBA MLBB',
    modeBadge: '5V5 MOBA · DRAFT PICK',
    image: '/images/mlbb.jpg',
    pdfUrl: '/docs/Bases_MOBA.pdf',
    pdfName: 'Bases_MOBA.pdf',
    accent: '#22d3ee',
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
    image: '/images/free-fire.jpg',
    pdfUrl: '/docs/Bases_FF.pdf',
    pdfName: 'Bases_FF.pdf',
    accent: '#f97316',
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
  const { registrationGame, setActiveGame } = useRegistration()
  const [step, setStep] = useState(1)
  const [game, setGame] = useState(() => registrationGame || 'mlbb')

  // Datos Etapa 1
  const [teamName, setTeamName] = useState('')
  const [teamLogo, setTeamLogo] = useState(null)
  const [captainName, setCaptainName] = useState('')
  const [captainWhatsapp, setCaptainWhatsapp] = useState('')
  const [institution, setInstitution] = useState('UNAP')
  const [professionalSchool, setProfessionalSchool] = useState('')
  const [otherInstitution, setOtherInstitution] = useState('')

  // Datos Etapa 2 (Roster)
  const [players, setPlayers] = useState(() =>
    Array.from({ length: 7 }, () => ({ nickname: '', id: '', server: '' }))
  )

  // Datos Etapa 3
  const [paymentReceipt, setPaymentReceipt] = useState(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [stepError, setStepError] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (registrationGame && (registrationGame === 'ff' || registrationGame === 'mlbb')) {
      setGame(registrationGame)
    }
  }, [registrationGame])

  const gameInfo = games[game]
  const playerSlots = useMemo(() => gameInfo.slots, [gameInfo])

  const changeGame = (nextGame) => {
    setGame(nextGame)
    setActiveGame(nextGame)
    audio.selectGame(nextGame)
    setStepError(null)
  }

  const updatePlayer = (index, field, value) => {
    setPlayers((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  // Validaciones por etapa
  const validateStep1 = () => {
    if (!teamName.trim() || teamName.trim().length < 3) {
      setStepError('Ingresa un nombre de equipo válido (mínimo 3 caracteres).')
      audio.click()
      return false
    }
    if (!captainName.trim()) {
      setStepError('Ingresa los nombres y apellidos del capitán.')
      audio.click()
      return false
    }
    if (!captainWhatsapp.trim() || captainWhatsapp.replace(/\D/g, '').length < 8) {
      setStepError('Ingresa un número de WhatsApp válido del capitán (mínimo 9 dígitos).')
      audio.click()
      return false
    }
    if (institution === 'UNAP' && !professionalSchool) {
      setStepError('Selecciona tu escuela profesional de la UNAP.')
      audio.click()
      return false
    }
    if (institution === 'Otra' && !otherInstitution.trim()) {
      setStepError('Ingresa el nombre de tu universidad o institución.')
      audio.click()
      return false
    }
    setStepError(null)
    return true
  }

  const validateStep2 = () => {
    const requiredSlots = gameInfo.slots.filter((s) => s.required)
    for (let i = 0; i < requiredSlots.length; i++) {
      const p = players[i] || {}
      if (!p.nickname?.trim() || !p.id?.trim()) {
        setStepError(`Completa el Nickname e ID del ${requiredSlots[i].label}.`)
        audio.click()
        return false
      }
      if (game === 'mlbb' && !p.server?.trim()) {
        setStepError(`Ingresa el Server ID (4 dígitos entre paréntesis) del ${requiredSlots[i].label}.`)
        audio.click()
        return false
      }
    }
    setStepError(null)
    return true
  }

  const validateStep3 = () => {
    if (!paymentReceipt) {
      setStepError('Sube la captura del comprobante de pago de Yape.')
      audio.click()
      return false
    }
    if (!termsAccepted) {
      setStepError('Debes aceptar el reglamento oficial para continuar.')
      audio.click()
      return false
    }
    setStepError(null)
    return true
  }

  const nextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
        audio.click()
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3)
        audio.click()
      }
    }
  }

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1))
    setStepError(null)
    audio.click()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validateStep3()) return

    setNotice({
      type: 'warning',
      text: '¡Datos y comprobante validados! La interfaz está lista para el envío a Supabase (Fase 5: inserción de tablas y almacenamiento).',
    })
  }

  return (
    <main className={`registration-page ${modal ? 'registration-page--modal' : ''}`}>
      {/* Banner de cabecera con arte del juego */}
      <div className="modal-hero-banner" style={{ '--banner-accent': gameInfo.accent }}>
        <img className="modal-hero-bg" src={gameInfo.image} alt={gameInfo.name} />
        <div className="modal-hero-overlay" />
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
                {isDone ? '✓' : s.num}
              </div>
              <div className="stepper-label-wrap">
                <span className="stepper-stage">ETAPA 0{s.num}</span>
                <span className="stepper-title">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && <div className={`stepper-connector ${step > s.num ? 'stepper-connector--done' : ''}`} />}
            </div>
          )
        })}
      </div>

      <form className="registration-form" onSubmit={handleSubmit}>
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
                  className={`game-choice ${game === key ? 'game-choice--active' : ''}`}
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
                  name="captainWhatsapp"
                  placeholder="999 999 999"
                  value={captainWhatsapp}
                  onChange={(e) => setCaptainWhatsapp(e.target.value)}
                  required
                  type="tel"
                />
              </label>
              <label className="form-field">
                <span>INSTITUCIÓN DE PROCEDENCIA *</span>
                <select name="institution" onChange={(e) => setInstitution(e.target.value)} value={institution}>
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
                    name="otherInstitution"
                    placeholder="Ej.: UANCV, TECSUP, etc."
                    value={otherInstitution}
                    onChange={(e) => setOtherInstitution(e.target.value)}
                    required
                  />
                </label>
              )}
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
                <small>Roster: {players.filter((p) => p.nickname?.trim()).length} jugadores registrados</small>
              </div>
            </div>

            <div className="payment-panel">
              <div className="payment-qr-wrap">
                <div className="qr-placeholder" aria-label="Código QR de Yape oficial">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <i key={index} />
                  ))}
                </div>
                <span className="yape-tag">YAPE OFICIAL</span>
              </div>
              <div className="payment-copy">
                <div className="payment-price-card">
                  <div className="price-card-main">
                    <span className="price-card-label">MONTO TOTAL A ABONAR · {gameInfo.shortName}</span>
                    <strong className="price-card-amount">{gameInfo.priceFormatted}</strong>
                  </div>
                  <span className="price-card-note">
                    {game === 'mlbb'
                      ? 'Tarifa oficial MOBA (5 titulares + hasta 2 suplentes)'
                      : 'Tarifa oficial Battle Royale (4 titulares + 1 suplente)'}
                  </span>
                </div>

                <h2>REALIZA EL ABONO POR YAPE</h2>
                <p>
                  Escanea el código QR y transfiere exactamente <strong>{gameInfo.priceFormatted}</strong>.
                  Sube la captura de pantalla de la transacción para la validación del comité organizador.
                </p>
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
                    Reglamento Oficial {gameInfo.name} (Descargar PDF ↗)
                  </a>.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Mensaje de error / validación por etapa */}
        {stepError && <p className="wizard-step-error">⚠️ {stepError}</p>}
        {notice && <p className={`form-notice form-notice--${notice.type}`}>{notice.text}</p>}

        {/* Barra de navegación de etapas */}
        <div className="wizard-actions">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="wizard-btn-prev">
              ← Atrás
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button type="button" onClick={nextStep} className="wizard-btn-next">
              Continuar al {step === 1 ? 'Roster Oficial' : 'Pago'} ➔
            </button>
          ) : (
            <button className="registration-submit" type="submit">
              ENVIAR INSCRIPCIÓN OFICIAL ({gameInfo.priceFormatted}) <span>↗</span>
            </button>
          )}
        </div>
      </form>
    </main>
  )
}

export default Inscription
