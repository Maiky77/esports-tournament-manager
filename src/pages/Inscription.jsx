import { useMemo, useState } from 'react'

const games = {
  ff: {
    name: 'Free Fire',
    image: '/images/free-fire.jpg',
    accent: '#f97316',
    detail: 'Capitán + 3 titulares · 1 suplente opcional',
    slots: [
      { label: 'CAPITÁN', required: true },
      { label: 'TITULAR 02', required: true },
      { label: 'TITULAR 03', required: true },
      { label: 'TITULAR 04', required: true },
      { label: 'SUPLENTE', required: false },
    ],
  },
  mlbb: {
    name: 'Mobile Legends: Bang Bang',
    image: '/images/mlbb.jpg',
    accent: '#22d3ee',
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
}

const professionalSchools = [
  'Ingeniería de Sistemas',
  'Ingeniería Estadística e Informática',
  'Medicina Humana',
  'Derecho',
  'Administración',
  'Contabilidad',
  'Educación',
  'Otra escuela profesional',
]

function Inscription() {
  const [game, setGame] = useState('ff')
  const [institution, setInstitution] = useState('UNAP')
  const [notice, setNotice] = useState(null)
  const gameInfo = games[game]
  const playerSlots = useMemo(() => gameInfo.slots, [gameInfo])

  const changeGame = (nextGame) => {
    setGame(nextGame)
    setNotice(null)
  }

  const submitRegistration = (event) => {
    event.preventDefault()
    setNotice({
      type: 'warning',
      text: 'La interfaz está lista. Falta vincular las credenciales reales y las columnas de Supabase para enviar esta inscripción.',
    })
  }

  return (
    <main className="registration-page">
      <section className="registration-intro">
        <span className="section-kicker">// REGISTRO OFICIAL</span>
        <h1>INSCRIBE A TU ESCUADRA</h1>
        <p>
          Completa tus datos y los de tu roster. La organización verificará el
          pago y aprobará las escuadras desde el panel del torneo.
        </p>
      </section>

      <form className="registration-form" onSubmit={submitRegistration}>
        <div className="form-step-label"><span>01</span> ELIGE TU DISCIPLINA</div>
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
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
              </span>
              {game === key && <span className="game-choice-status">SELECCIONADO</span>}
            </button>
          ))}
        </div>

        <div className="form-grid form-grid--team">
          <label className="form-field">
            <span>NOMBRE DE LA ESCUADRA *</span>
            <input name="teamName" minLength="3" placeholder="Ej.: Ragnarok Wolves" required />
          </label>
          <label className="form-field form-field--file">
            <span>LOGO DE LA ESCUADRA *</span>
            <input accept="image/png,image/jpeg,image/webp" name="teamLogo" required type="file" />
            <small>PNG, JPG o WEBP · máx. 5 MB</small>
          </label>
        </div>

        <div className="form-step-label"><span>02</span> DATOS DEL CAPITÁN</div>
        <div className="form-grid">
          <label className="form-field">
            <span>NOMBRES Y APELLIDOS *</span>
            <input name="captainName" placeholder="Nombre completo" required />
          </label>
          <label className="form-field">
            <span>WHATSAPP *</span>
            <input inputMode="tel" name="captainWhatsapp" placeholder="999 999 999" required type="tel" />
          </label>
          <label className="form-field">
            <span>INSTITUCIÓN *</span>
            <select name="institution" onChange={(event) => setInstitution(event.target.value)} value={institution}>
              <option value="UNAP">UNAP</option>
              <option value="Otra">Otra universidad o institución</option>
            </select>
          </label>
          {institution === 'UNAP' ? (
            <label className="form-field">
              <span>ESCUELA PROFESIONAL *</span>
              <select name="professionalSchool" required>
                <option value="">Selecciona tu escuela</option>
                {professionalSchools.map((school) => <option key={school}>{school}</option>)}
              </select>
            </label>
          ) : (
            <label className="form-field">
              <span>NOMBRE DE LA INSTITUCIÓN *</span>
              <input name="otherInstitution" placeholder="Ej.: Universidad / Instituto" required />
            </label>
          )}
        </div>

        <div className="form-step-label"><span>03</span> ROSTER {gameInfo.name.toUpperCase()}</div>
        <p className="roster-note">Completa el nickname y el ID de cada jugador. Los puestos “suplente” son opcionales.</p>
        <div className="roster-list">
          {playerSlots.map((slot, index) => (
            <div className={`roster-row ${slot.required ? '' : 'roster-row--optional'}`} key={`${game}-${slot.label}`}>
              <span className="roster-position">{slot.label}</span>
              <label className="form-field">
                <span>NICKNAME {slot.required ? '*' : '(OPCIONAL)'}</span>
                <input name={`player-${index}-nickname`} placeholder="Nickname" required={slot.required} />
              </label>
              <label className="form-field">
                <span>ID DE JUGADOR {slot.required ? '*' : '(OPCIONAL)'}</span>
                <input inputMode="numeric" name={`player-${index}-id`} placeholder="ID" required={slot.required} />
              </label>
              {game === 'mlbb' && (
                <label className="form-field">
                  <span>SERVER ID {slot.required ? '*' : '(OPCIONAL)'}</span>
                  <input inputMode="numeric" name={`player-${index}-server`} placeholder="Server" required={slot.required} />
                </label>
              )}
            </div>
          ))}
        </div>

        <div className="form-step-label"><span>04</span> PAGO Y CONFIRMACIÓN</div>
        <div className="payment-panel">
          <div className="payment-qr-wrap">
            <div className="qr-placeholder" aria-label="Código QR de Yape pendiente de configurar">
              {Array.from({ length: 49 }).map((_, index) => <i key={index} />)}
            </div>
            <small>QR DE YAPE</small>
          </div>
          <div className="payment-copy">
            <h2>REALIZA EL PAGO DE INSCRIPCIÓN</h2>
            <p>Escanea el QR de Yape y sube el comprobante. Tu escuadra quedará pendiente hasta la verificación de la organización.</p>
            <label className="form-field form-field--file">
              <span>COMPROBANTE DE PAGO *</span>
              <input accept="image/png,image/jpeg,image/webp,application/pdf" name="paymentReceipt" required type="file" />
              <small>Imagen o PDF · máx. 5 MB</small>
            </label>
          </div>
        </div>

        <label className="terms-field">
          <input required type="checkbox" />
          <span>Confirmo que los datos del roster son correctos y acepto el reglamento del torneo.</span>
        </label>

        {notice && <p className={`form-notice form-notice--${notice.type}`}>{notice.text}</p>}
        <button className="registration-submit" type="submit">ENVIAR INSCRIPCIÓN <span>↗</span></button>
      </form>
    </main>
  )
}

export default Inscription

