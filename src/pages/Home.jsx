import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ragnarokCrest from '../assets/ragnarok-crest.svg'

const deadline = new Date('2026-12-15T23:59:59-05:00').getTime()

function getTimeLeft() {
  const time = Math.max(deadline - Date.now(), 0)
  return [
    ['DÍAS', Math.floor(time / 86400000)],
    ['HRS', Math.floor((time / 3600000) % 24)],
    ['MIN', Math.floor((time / 60000) % 60)],
    ['SEG', Math.floor((time / 1000) % 60)],
  ]
}

function Countdown() {
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const interval = window.setInterval(() => setTime(getTimeLeft()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="template-countdown">
      {time.map(([label, value]) => (
        <div key={label}>
          <strong>{String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

const divisions = [
  {
    key: 'mlbb',
    title: 'DIVISIÓN MLBB',
    name: 'Mobile Legends: Bang Bang',
    image: '/images/mlbb.jpg',
    color: '#22d3ee',
    detail: '5 titulares + hasta 2 suplentes',
    format: '5V5 MOBA',
  },
  {
    key: 'ff',
    title: 'DIVISIÓN FREE FIRE',
    name: 'Free Fire',
    image: '/images/free-fire.jpg',
    color: '#f97316',
    detail: '4 titulares + 1 suplente',
    format: 'SQUADS BR',
  },
]

function Home() {
  return (
    <main className="home-page home-page--template">
      <section className="template-hero">
        <div className="hero-status"><i /> TEMPORADA OFICIAL 2026 · PUNO</div>
        <div className="template-title-block">
          <img className="template-crest" src={ragnarokCrest} alt="Emblema RAGNAROK U-Series" />
          <div>
            <h1>RAGNAROK</h1>
            <p>U-SERIES</p>
          </div>
        </div>
        <p className="template-subtitle">
          El torneo universitario de esports de Puno. Forma tu escuadra,
          representa a tu universidad y compite en Free Fire o MLBB.
        </p>

        <div className="template-feature-grid">
          <article className="event-console clip-card">
            <span>PREMIO TOTAL</span>
            <strong>S/ 2,700</strong>
            <small>EN PREMIOS PARA LAS DOS DIVISIONES</small>
            <div className="event-console-divider" />
            <p>CIERRE DE INSCRIPCIONES EN</p>
            <Countdown />
            <div className="event-console-actions">
              <Link to="/inscripcion" className="template-primary-button">INSCRIBIR ESCUADRA</Link>
              <Link to="/equipos" className="template-secondary-button">VER EQUIPOS</Link>
            </div>
          </article>

          <div className="division-list">
            {divisions.map((division) => (
              <Link
                className="division-card clip-card"
                key={division.key}
                style={{ '--division-color': division.color }}
                to="/inscripcion"
              >
                <img src={division.image} alt="" />
                <span className="division-card-overlay" />
                <div className="division-card-content">
                  <span>{division.title}</span>
                  <strong>{division.name}</strong>
                  <small>{division.detail} · {division.format}</small>
                  <b>INSCRIBIRSE →</b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="template-prizes">
        <div className="template-section-title">
          <span>// PREMIO Y RECONOCIMIENTO</span>
          <h2>COMPITE POR TU UNIVERSIDAD</h2>
          <p>Los mejores equipos de cada división avanzarán en la competencia oficial de RAGNAROK : U-Series.</p>
        </div>
        <div className="template-prize-grid">
          <article><span>01 · CAMPEÓN</span><strong>S/ 1,500</strong><small>Trofeo y reconocimiento oficial</small></article>
          <article><span>02 · SUBCAMPEÓN</span><strong>S/ 800</strong><small>Medallas y reconocimiento oficial</small></article>
          <article><span>03 · TERCER LUGAR</span><strong>S/ 400</strong><small>Reconocimiento oficial</small></article>
        </div>
      </section>
    </main>
  )
}

export default Home

