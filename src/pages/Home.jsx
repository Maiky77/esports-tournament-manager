import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRegistration } from '../context/RegistrationContext'
import { audio } from '../lib/audioEngine'
import RulesSection from '../components/RulesSection'

const deadline = new Date('2026-12-15T23:59:59-05:00').getTime()

function getTimeLeft() {
  const time = Math.max(deadline - Date.now(), 0)
  return [
    ['DÍAS', Math.floor(time / 86400000)],
    ['HORAS', Math.floor((time / 3600000) % 24)],
    ['MIN', Math.floor((time / 60000) % 60)],
    ['SEG', Math.floor((time / 1000) % 60)],
  ]
}

const divisions = [
  {
    key: 'mlbb',
    title: 'DIVISIÓN MLBB',
    name: 'Mobile Legends: Bang Bang',
    image: '/images/mlbb.jpg',
    color: '#22d3ee',
    fee: 'S/ 20.00',
    detail: '5 titulares + hasta 2 suplentes',
    format: '5V5 MOBA',
  },
  {
    key: 'ff',
    title: 'DIVISIÓN FREE FIRE',
    name: 'Free Fire',
    image: '/images/free-fire.jpg',
    color: '#f97316',
    fee: 'S/ 15.00',
    detail: '4 titulares + 1 suplente',
    format: 'SQUADS BR',
  },
]

function Home() {
  const { openRegistration, activeGame, setActiveGame } = useRegistration()
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const interval = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const handleInscribe = (gameKey) => {
    if (gameKey) setActiveGame(gameKey)
    audio.click()
    openRegistration(gameKey)
  }

  return (
    <main className="home-page home-page--template">
      {/* ================= HERO SECTION (ESTILO PLANTILLA 2) ================= */}
      <section className="template-hero-v2" id="inicio">
        {/* Arte de fondo con crossfade de arena según disciplina activa */}
        <div className="hero-backdrop" aria-hidden="true">
          <img
            src="/img/hero-mlbb.jpg"
            alt=""
            className={`hero-bg-img ${activeGame === 'mlbb' ? 'hero-bg-img--active' : ''}`}
          />
          <img
            src="/img/hero-ff.jpg"
            alt=""
            className={`hero-bg-img ${activeGame === 'ff' ? 'hero-bg-img--active' : ''}`}
          />
          <div className="hero-backdrop-gradient" />
          <div className="scanline" />
        </div>

        {/* Marca de agua tipográfica gigante de fondo */}
        <div className="hero-watermark" aria-hidden="true">
          <span>RAGNAROK</span>
        </div>

        <div className="hero-content-wrapper">
          {/* Pill superior de temporada */}
          <div className="hero-status-pill">
            <span className="hero-status-dot" />
            <span className="hero-status-text">TEMPORADA OFICIAL 2026 · PUNO · 2 TORNEOS OFICIALES</span>
            <span className="hero-status-dot" />
          </div>

          {/* Título principal monumental */}
          <div className="hero-grand-title">
            <span className="hero-subkicker">TORNEO UNIVERSITARIO DE ESPORTS</span>
            <h1>
              RAGNAROK <br />
              <span className="hero-gradient-text glow-soft">U-SERIES 2026</span>
            </h1>
          </div>

          {/* Bajada / Subtítulo */}
          <p className="hero-lead-desc">
            Las universidades bajan de las aulas y suben al escenario competitivo.
            Mobile Legends: Bang Bang y Free Fire, en simultáneo, con producción y transmisión de nivel profesional.
          </p>

          {/* Bolsa de premios combinada */}
          <div className="hero-prize-pool">
            <span className="hero-prize-kicker">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              BOLSA DE PREMIOS COMBINADA
            </span>
            <strong className="hero-prize-amount">S/ 2,700</strong>
            <small className="hero-prize-note">En premios en efectivo repartidos para las dos disciplinas</small>
          </div>

          {/* Cuenta regresiva de inscripciones */}
          <div className="hero-countdown-block">
            <p className="hero-countdown-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              CIERRE DE INSCRIPCIONES · PUNO · ARENA UNIVERSITARIA
            </p>
            <div className="hero-countdown-grid">
              {timeLeft.map(([label, value], idx) => (
                <div key={label} className="countdown-cell-group">
                  <div className="countdown-box clip-corner-sm">
                    <span className="countdown-digit">{String(value).padStart(2, '0')}</span>
                    <span className="countdown-unit">{label}</span>
                  </div>
                  {idx < 3 && <span className="countdown-colon">:</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción principales (CTAs) */}
          <div className="hero-cta-group">
            <button
              onClick={() => handleInscribe()}
              type="button"
              className="hero-btn-primary clip-corner"
            >
              <span className="hero-btn-beacon">((•))</span>
              <span>INSCRIBIR EQUIPO</span>
            </button>
            <a
              href="#reglamento"
              className="hero-btn-secondary clip-corner"
              onClick={() => audio.click()}
            >
              <span>VER REGLAMENTO OFICIAL</span>
              <span>→</span>
            </a>
          </div>

          {/* Tarjetas de divisiones con imágenes ("INSCRIBIRSE →") */}
          <div className="hero-divisions-grid">
            {divisions.map((division) => (
              <button
                className={`hero-division-card clip-card ${activeGame === division.key ? 'hero-division-card--active' : ''}`}
                key={division.key}
                onClick={() => handleInscribe(division.key)}
                style={{ '--division-color': division.color }}
                type="button"
              >
                <img src={division.image} alt={division.name} className="division-bg-img" />
                <span className="division-card-overlay" />
                <div className="division-card-content">
                  <div className="division-top-row">
                    <span className="division-card-tag">{division.title}</span>
                    {activeGame === division.key && (
                      <span className="division-active-badge">DIVISIÓN ACTIVA</span>
                    )}
                  </div>
                  <strong className="division-card-name">{division.name}</strong>
                  <small className="division-card-detail">
                    {division.detail} · {division.format} · Tarifa: {division.fee}
                  </small>
                  <span className="division-card-action">INSCRIBIRSE →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PREMIOS POR CATEGORÍA ================= */}
      <section className="template-prizes" id="premios">
        <div className="template-section-title">
          <span>// PREMIOS Y RECONOCIMIENTO</span>
          <h2>COMPITE POR TU UNIVERSIDAD</h2>
          <p>Los mejores equipos de cada división avanzarán en la competencia oficial de RAGNAROK : U-Series.</p>
        </div>
        <div className="template-prize-grid">
          <article><span>01 · CAMPEÓN</span><strong>S/ 1,500</strong><small>Trofeo y reconocimiento oficial</small></article>
          <article><span>02 · SUBCAMPEÓN</span><strong>S/ 800</strong><small>Medallas y reconocimiento oficial</small></article>
          <article><span>03 · TERCER LUGAR</span><strong>S/ 400</strong><small>Reconocimiento oficial</small></article>
        </div>
      </section>

      {/* ================= REGLAMENTO OFICIAL COMPLETO ================= */}
      <RulesSection />
    </main>
  )
}

export default Home
