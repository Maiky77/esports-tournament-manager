import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const registrationDeadline = new Date('2026-12-15T23:59:59-05:00').getTime()

function getRemainingTime() {
  const remaining = Math.max(registrationDeadline - Date.now(), 0)

  return {
    días: Math.floor(remaining / 86400000),
    horas: Math.floor((remaining / 3600000) % 24),
    minutos: Math.floor((remaining / 60000) % 60),
    segundos: Math.floor((remaining / 1000) % 60),
  }
}

function Countdown() {
  const [time, setTime] = useState(getRemainingTime)

  useEffect(() => {
    const timer = window.setInterval(() => setTime(getRemainingTime()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="countdown" aria-label="Tiempo restante para el cierre de inscripciones">
      {Object.entries(time).map(([unit, value]) => (
        <div className="countdown-item" key={unit}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{unit}</span>
        </div>
      ))}
    </div>
  )
}

const prizes = [
  { place: '01', title: 'CAMPEÓN', amount: 'S/ 1,500', accent: 'gold' },
  { place: '02', title: 'SUBCAMPEÓN', amount: 'S/ 800', accent: 'silver' },
  { place: '03', title: 'TERCER LUGAR', amount: 'S/ 400', accent: 'bronze' },
]

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">RAGNAROK // CIRCUITO COMPETITIVO DE PUNO</span>
          <h1>
            FORJA TU
            <span className="hero-title-accent"> RAGNAROK</span>
            <span className="hero-title-line">EN LA ARENA</span>
          </h1>
          <div className="series-plate">U-SERIES <span>// OPEN CHAMPIONSHIP 2026</span></div>
          <p className="hero-description">
            El circuito competitivo más intenso de Puno. Abierto para escuadras
            universitarias, colegios e independientes. Demuestra tu nivel en
            Free Fire y MLBB.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/inscripcion">
              INSCRIBIR ESCUADRA <span aria-hidden="true">↗</span>
            </Link>
            <Link className="secondary-button" to="/equipos">
              VER ESCUADRAS
            </Link>
          </div>
          <div className="hero-meta">
            <span><i className="status-dot" /> INSCRIPCIONES ABIERTAS</span>
            <span>FREE FIRE <b>×</b> MLBB</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-glow" />
          <div className="hero-ring hero-ring--outer" />
          <div className="hero-ring hero-ring--inner" />
          <div className="hero-badge">R</div>
          <span className="visual-label visual-label--top">RAGNAROK<br />SEASON // 01</span>
          <span className="visual-label visual-label--bottom">PUNO / PERÚ<br />EST. 2026</span>
          <span className="visual-cross visual-cross--one">+</span>
          <span className="visual-cross visual-cross--two">+</span>
        </div>
      </section>

      <section className="home-section countdown-section">
        <div>
          <span className="section-kicker">// DEADLINE</span>
          <h2>EL TIEMPO SE AGOTA</h2>
          <p>Las inscripciones cierran el 15 de diciembre de 2026.</p>
        </div>
        <Countdown />
      </section>

      <section className="home-section prize-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">// LOOT DROP</span>
            <h2>COMPITE. SOBREVIVE. COBRA.</h2>
          </div>
          <span className="prize-total">S/ 2,700 <small>BOLSA TOTAL</small></span>
        </div>
        <div className="prize-grid">
          {prizes.map((prize) => (
            <article className={`prize-card prize-card--${prize.accent}`} key={prize.place}>
              <span className="prize-place">RANK // {prize.place}</span>
              <div className="prize-icon" aria-hidden="true">✦</div>
              <div>
                <h3>{prize.title}</h3>
                <strong>{prize.amount}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home

