import { useEffect, useMemo, useState } from 'react'
import { audio } from '../lib/audioEngine'
import CharacterArt from '../components/CharacterArt'
import { useRegistration } from '../context/RegistrationContext'
import ragnarokCrest from '../assets/ragnarok-crest.svg'
import { useTournament } from '../context/TournamentContext'
import { formatSoles } from '../lib/money'
import { publicUrl, submitRegistration, validateUpload } from '../lib/tournamentApi'
import SearchSelect from '../components/SearchSelect'
import { institutionGroups, OTHER_INSTITUTION } from '../lib/institutions'
import { careerGroups, OTHER_CAREER } from '../lib/careers'

const baseGames = {
  mlbb: {
    name: 'Mobile Legends: Bang Bang',
    shortName: 'MOBA MLBB',
    modeBadge: '5V5 MOBA · DRAFT PICK',
    image: '/img/hero-mlbb.jpg',
    pdfUrl: '/docs/Bases_MOBA.pdf',
    pdfName: 'Bases_MOBA.pdf',
    accent: '#b48aff',
    feeNote: 'Tarifa oficial MOBA',
  },
  ff: {
    name: 'Free Fire',
    shortName: 'FREE FIRE',
    modeBadge: 'SQUADS BATTLE ROYALE',
    image: '/img/hero-ff.jpg',
    pdfUrl: '/docs/Bases_FF.pdf',
    pdfName: 'Bases_FF.pdf',
    accent: '#ef54a6',
    feeNote: 'Tarifa oficial Battle Royale',
  },
}

const MAX_SLOTS = 15

function buildSlots(starters, substitutes) {
  const slots = []
  for (let i = 0; i < starters; i++) slots.push({ label: i === 0 ? 'CAPITÁN' : `TITULAR 0${i + 1}`, required: true })
  for (let i = 0; i < substitutes; i++) slots.push({ label: substitutes === 1 ? 'SUPLENTE' : `SUPLENTE 0${i + 1}`, required: false })
  return slots
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

const STEPS = [
  { num: 1, label: 'Torneo y Equipo', short: 'Equipo' },
  { num: 2, label: 'Roster Oficial', short: 'Roster' },
  { num: 3, label: 'Pago y Confirmación', short: 'Pago' },
]

function Inscription({ modal = false }) {
  const { registrationGame, setActiveGame } = useRegistration()
  const { games: gameConfig, settings, deadline, availability } = useTournament()
  const [openedAt] = useState(() => Date.now())
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

  // Datos Etapa 2 (Roster)
  const [players, setPlayers] = useState(() =>
    Array.from({ length: MAX_SLOTS }, () => ({ nickname: '', id: '', server: '' }))
  )

  // Datos Etapa 3
  const [paymentReceipt, setPaymentReceipt] = useState(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [stepError, setStepError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (registrationGame && (registrationGame === 'ff' || registrationGame === 'mlbb')) {
      setGame(registrationGame)
    }
  }, [registrationGame])

  const games = useMemo(() => Object.fromEntries(Object.entries(baseGames).map(([key, base]) => {
    const cfg = gameConfig[key]
    const slots = buildSlots(cfg.starters, cfg.substitutes)
    return [key, {
      ...base,
      name: cfg.name || base.name,
      modeBadge: cfg.badge || base.modeBadge,
      slots,
      price: cfg.price,
      priceFormatted: formatSoles(cfg.price, 2),
      isOpen: cfg.is_open,
      detail: `Capitán + ${cfg.starters - 1} titulares · ${cfg.substitutes ? `Hasta ${cfg.substitutes} suplente${cfg.substitutes > 1 ? 's' : ''}` : 'Sin suplentes'}`,
      pdfUrl: publicUrl('public-assets', cfg.rules_pdf_path) || base.pdfUrl,
    }]
  })), [gameConfig])

  // UNAP se guarda como institución propia (con escuela); cualquier otra, por nombre.
  const institution = institutionChoice === 'UNAP' ? 'UNAP' : 'Otra'
  const otherInstitution = institutionChoice === OTHER_INSTITUTION ? customInstitution : institutionChoice
  // La carrera se pide siempre: escuelas de la UNAP o una lista general para otras instituciones.
  const career = professionalSchool === OTHER_CAREER ? customCareer.trim() : professionalSchool
  const changeInstitution = (next) => {
    if ((next === 'UNAP') !== (institutionChoice === 'UNAP')) {
      setProfessionalSchool('')
      setCustomCareer('')
    }
    setInstitutionChoice(next)
  }
  const schoolGroups = useMemo(() => [
    ...professionalSchoolGroups.map((g) => ({ group: `Área de ${g.area}`, items: g.schools.map((name) => ({ value: name, label: name })) })),
    { group: 'Otra', items: [{ value: 'Otra escuela profesional', label: 'Otra escuela profesional / Facultad' }] },
  ], [])

  const gameInfo = games[game]
  const playerSlots = gameInfo.slots
  const qrUrl = publicUrl('public-assets', settings.yape_qr_path)
  const slotInfo = availability?.[game]
  const soldOut = Boolean(slotInfo && slotInfo.taken >= slotInfo.max)
  const registrationClosed = !settings.registration_open || openedAt > deadline || !gameInfo.isOpen || soldOut

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

  const pickFile = async (event, setter, allowPdf) => {
    const input = event.target
    const file = input.files?.[0] || null
    if (file) {
      const problem = await validateUpload(file, { allowPdf })
      if (problem) {
        setStepError(problem)
        input.value = ''
        setter(null)
        return
      }
    }
    setStepError(null)
    setter(file)
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
    if (!career) {
      setStepError(institution === 'UNAP' ? 'Selecciona tu escuela profesional de la UNAP.' : 'Selecciona o escribe tu carrera profesional.')
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting || submitted) return
    if (registrationClosed) {
      setStepError('Las inscripciones de esta disciplina están cerradas.')
      return
    }
    if (!validateStep1() || !validateStep2() || !validateStep3()) return

    setSubmitting(true)
    setNotice(null)
    try {
      await submitRegistration({
        gameKey: game,
        team: teamName.trim(),
        captain: captainName.trim(),
        whatsapp: captainWhatsapp,
        institution,
        school: career,
        otherInstitution: otherInstitution.trim(),
        players: playerSlots.map((_, i) => ({
          nickname: players[i]?.nickname?.trim() || '',
          game_player_id: players[i]?.id || '',
          server_id: game === 'mlbb' ? players[i]?.server || '' : '',
        })),
        receipt: paymentReceipt,
        logo: teamLogo,
        honeypot,
      })
      setSubmitted(true)
      setNotice({
        type: 'success',
        text: '¡Inscripción enviada! La organización verificará tu comprobante y te contactará por WhatsApp.',
      })
    } catch (err) {
      setNotice({ type: 'warning', text: err.message })
    } finally {
      setSubmitting(false)
    }
  }

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
                {isDone ? '✓' : s.num}
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

      <form className="registration-form" onSubmit={handleSubmit} autoComplete="off">
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
          <label>No llenar este campo<input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
        </div>
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
                    {availability?.[key] && (
                      <small className="game-choice-slots">
                        {availability[key].taken >= availability[key].max ? 'CUPOS AGOTADOS' : `QUEDAN ${availability[key].max - availability[key].taken} CUPOS`}
                      </small>
                    )}
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
                  maxLength="40"
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
                  onChange={(e) => pickFile(e, setTeamLogo, false)}
                />
                <small>{teamLogo ? `Seleccionado: ${teamLogo.name}` : 'PNG, JPG o WEBP · máx. 5 MB (Opcional)'}</small>
              </label>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>NOMBRES Y APELLIDOS DEL CAPITÁN *</span>
                <input
                  name="captainName"
                  maxLength="80"
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
                  maxLength="20"
                  name="captainWhatsapp"
                  placeholder="999 999 999"
                  value={captainWhatsapp}
                  onChange={(e) => setCaptainWhatsapp(e.target.value)}
                  required
                  type="tel"
                />
              </label>
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
                {`Registra a tus ${gameInfo.slots.filter((x) => x.required).length} titulares obligatorios${gameInfo.slots.length > gameInfo.slots.filter((x) => x.required).length ? ' y a tus suplentes opcionales' : ''}.`}
                {game === 'mlbb' ? ' Es obligatorio el Server ID (los 4 dígitos).' : ''}
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
                    maxLength={30}
                    name={`player-${index}-nickname`}
                    placeholder={`Nickname ${slot.required ? '*' : '(opcional)'}`}
                    value={players[index]?.nickname || ''}
                    onChange={(e) => updatePlayer(index, 'nickname', e.target.value)}
                    required={slot.required}
                  />
                  <input
                    className="compact-input compact-input--mono"
                    inputMode="numeric"
                    maxLength={15}
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
                      maxLength={6}
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
                <strong>{institution === 'UNAP' ? career || 'UNAP' : [otherInstitution, career].filter(Boolean).join(' · ') || 'Otra'}</strong>
                <small>Roster: {players.filter((p) => p.nickname?.trim()).length} jugadores registrados</small>
              </div>
            </div>

            <div className="payment-panel">
              <div className="payment-qr-wrap">
                {qrUrl ? (
                  <img className="payment-qr-img" src={qrUrl} alt="Código QR de Yape de la organización" style={{ width: '100%', maxWidth: 220, borderRadius: 12 }} />
                ) : (
                  <div className="payment-qr-pending">
                  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5" /><rect x="8" y="8" width="8" height="8" /></svg>
                  <strong>QR DE YAPE</strong><span>PENDIENTE DE PUBLICACIÓN</span>
                  </div>
                )}
                <span className="yape-tag">PAGO POR YAPE</span>
              </div>
              <div className="payment-copy">
                <div className="payment-price-card">
                  <div className="price-card-main">
                    <span className="price-card-label">MONTO TOTAL A ABONAR · {gameInfo.shortName}</span>
                    <strong className="price-card-amount">{gameInfo.priceFormatted}</strong>
                  </div>
                  <span className="price-card-note">
                    {gameInfo.feeNote} ({gameInfo.slots.filter((x) => x.required).length} titulares
                    {gameInfo.slots.length > gameInfo.slots.filter((x) => x.required).length ? ` + ${gameInfo.slots.length - gameInfo.slots.filter((x) => x.required).length} suplente(s)` : ''})
                  </span>
                </div>

                <h2>REALIZA EL ABONO POR YAPE</h2>
                <p>
                  {settings.yape_number
                    ? <>Yapea a <strong>{settings.yape_number}</strong>{settings.yape_holder ? <> a nombre de <strong>{settings.yape_holder}</strong></> : null}. </>
                    : 'La organización publicará aquí el código oficial y los datos de pago. '}
                  La tarifa de esta disciplina es <strong>{gameInfo.priceFormatted}</strong> por equipo.
                </p>
                {/^\d{8,15}$/.test(settings.contact_whatsapp || '') && (
                  <p>
                    ¿Dudas con el pago? Escribe al{' '}
                    <a href={`https://wa.me/${settings.contact_whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp de la organización ↗</a>.
                  </p>
                )}
                <label className="form-field form-field--file">
                  <span>COMPROBANTE DE PAGO (CAPTURA DE YAPE) *</span>
                  <input
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    name="paymentReceipt"
                    type="file"
                    onChange={(e) => pickFile(e, setPaymentReceipt, true)}
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
        {registrationClosed && !submitted && (
          <p className="wizard-step-error">⚠️ {soldOut ? 'Se agotaron los cupos de esta disciplina.' : 'Las inscripciones de esta disciplina están cerradas.'}</p>
        )}
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
            <button className="registration-submit" type="submit" disabled={submitting || submitted || registrationClosed}>
              {submitting ? 'ENVIANDO…' : submitted ? 'INSCRIPCIÓN ENVIADA' : registrationClosed ? (soldOut ? 'CUPOS AGOTADOS' : 'INSCRIPCIONES CERRADAS') : `ENVIAR INSCRIPCIÓN (${gameInfo.priceFormatted})`} <span>↗</span>
            </button>
          )}
        </div>
      </form>
    </main>
  )
}

export default Inscription
