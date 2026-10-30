import { useEffect, useState } from 'react'
import { useRegistration } from '../context/RegistrationContext'
import { audio } from '../lib/audioEngine'
import CharacterArt from '../components/CharacterArt'
import RulesSection from '../components/RulesSection'
import RegistrationSteps from '../components/RegistrationSteps'
import useHeroRotation from '../hooks/useHeroRotation'

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
    key: 'mlbb', number: '01', title: 'ESTRATEGIA EN EQUIPO',
    name: 'Mobile Legends', subtitle: 'BANG BANG', image: '/img/hero-mlbb.jpg',
    color: '#bb96ff', fee: 'S/ 20', detail: '5 titulares + hasta 2 suplentes', format: '5V5 · DRAFT PICK',
  },
  {
    key: 'ff', number: '02', title: 'SUPERVIVENCIA SIN LÍMITES',
    name: 'Free Fire', subtitle: 'BATTLE ROYALE', image: '/img/hero-ff.jpg',
    color: '#f57fbd', fee: 'S/ 15', detail: '4 titulares + 1 suplente', format: 'SQUADS · BATTLE ROYALE',
  },
]

function moveArtwork(event) {
  if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return
  const bounds = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--art-x', `${((event.clientX - bounds.left) / bounds.width - 0.5) * 22}px`)
  event.currentTarget.style.setProperty('--art-y', `${((event.clientY - bounds.top) / bounds.height - 0.5) * 16}px`)
}

function resetArtwork(event) {
  event.currentTarget.style.setProperty('--art-x', '0px')
  event.currentTarget.style.setProperty('--art-y', '0px')
}

function Home({ heroEnabled = true }) {
  const { openRegistration, activeGame, setActiveGame, isRegistrationOpen } = useRegistration()
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  const isFreeFire = activeGame === 'ff'
  const { game: heroGame, autoplay, selectGame: selectHeroGame, toggleAutoplay, containerRef } = useHeroRotation(activeGame, heroEnabled && !isRegistrationOpen)
  const isHeroFreeFire = heroGame === 'ff'

  useEffect(() => {
    const interval = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const handleInscribe = (gameKey) => {
    audio.click()
    openRegistration(gameKey)
  }

  const exploreRules = (game) => {
    setActiveGame(game)
    audio.selectGame(game)
  }

  return (
    <main className="home-page home-page--template">
      <section className="template-hero-v2" id="inicio" aria-labelledby="event-title" ref={containerRef} data-hero-game={heroGame}>
        <div className="hero-backdrop" aria-hidden="true">
          <img src="/img/hero-mlbb.jpg" alt="" width="2560" height="1440" className={`hero-bg-img hero-bg-img--mlbb ${!isHeroFreeFire ? 'hero-bg-img--active' : ''}`} />
          <img src="/img/hero-ff.jpg" alt="" width="1920" height="1080" className={`hero-bg-img hero-bg-img--ff ${isHeroFreeFire ? 'hero-bg-img--active' : ''}`} />
          <div className="hero-backdrop-gradient" />
        </div>
        <div className="hero-watermark" aria-hidden="true"><span>U-SERIES</span></div>

        <div className="hero-content-wrapper">
          <div className="hero-layout">
            <div className="hero-copy">
              <div className="hero-status-pill">
                <span className="hero-status-dot" />
                PUNO, PERÚ <span className="hero-status-separator">/</span> TEMPORADA 2026
              </div>
              <div className="hero-grand-title">
                <span className="hero-subkicker">TU UNIVERSIDAD. TU EQUIPO. TU ARENA.</span>
                <h1 id="event-title">RAGNAROK<span className="hero-gradient-text">U-SERIES<span className="hero-year">26</span></span></h1>
              </div>
              <p className="hero-lead-desc">
                La próxima gran jugada lleva el nombre de tu universidad.
                Reúne a tu equipo y entra a la arena de Mobile Legends y Free Fire.
              </p>
              <div className="hero-prize-pool">
                <strong className="hero-prize-amount"><span>S/</span> 2,700</strong>
                <div><span className="hero-prize-kicker">BOLSA DE PREMIOS</span><small className="hero-prize-note">En efectivo · Dos disciplinas</small></div>
              </div>
              <div className="hero-cta-group">
                <button onClick={() => handleInscribe(heroGame)} type="button" className="hero-btn-primary clip-corner">
                  INSCRIBIR A MI EQUIPO <span aria-hidden="true">↗</span>
                </button>
                <a href="#disciplinas" className="hero-explore-link" onClick={() => audio.click()}>Explorar el torneo <span aria-hidden="true">↓</span></a>
              </div>
              <div className="hero-countdown-block">
                <p className="hero-countdown-label">CIERRE DE INSCRIPCIONES <span>15 DIC / 2026</span></p>
                <div className="hero-countdown-grid" role="timer" aria-label="Tiempo restante para inscribirse">
                  {timeLeft.map(([label, value]) => (
                    <div key={label} className="countdown-box">
                      <span className="countdown-digit">{String(value).padStart(2, '0')}</span>
                      <span className="countdown-unit">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hero-visual-wrap">
            <figure className={`hero-visual ${isHeroFreeFire ? 'hero-visual--ff' : ''}`} onPointerMove={moveArtwork} onPointerLeave={resetArtwork}>
              <div className="arena-orbit arena-orbit--outer" aria-hidden="true" />
              <div className="arena-orbit arena-orbit--inner" aria-hidden="true" />
              <span className="hero-visual-coordinate" aria-hidden="true">ARENA / PUNO · 2026</span>
              <div className={`hero-character-layer hero-character-layer--mlbb ${!isHeroFreeFire ? 'hero-character-layer--active' : ''}`} aria-hidden="true">
                <CharacterArt character="sora" className="hero-character" priority />
              </div>
              <div className={`hero-character-layer hero-character-layer--ff ${isHeroFreeFire ? 'hero-character-layer--active' : ''}`} aria-hidden="true">
                <CharacterArt character="mono" className="hero-character hero-character--ff" priority />
              </div>
              <span className="hero-visual-spark hero-visual-spark--one" aria-hidden="true" />
              <span className="hero-visual-spark hero-visual-spark--two" aria-hidden="true" />
              <figcaption className="hero-visual-caption" aria-live={autoplay ? 'off' : 'polite'} aria-atomic="true">
                <span className="hero-visual-index">{isHeroFreeFire ? '02' : '01'}</span>
                <div><span className="eyebrow">ELIGE TU CAMPO DE BATALLA</span><strong>{isHeroFreeFire ? 'FREE FIRE' : 'MOBILE LEGENDS'}</strong><small>{isHeroFreeFire ? '4 JUGADORES · BATTLE ROYALE' : '5V5 · LA TIERRA DEL AMANECER'}</small></div>
                <span className="hero-visual-arrow" aria-hidden="true">↗</span>
              </figcaption>
            </figure>
            <div className="hero-carousel-controls" role="group" aria-label="Controles de la portada">
              <button type="button" className="hero-carousel-game" data-game="mlbb" aria-pressed={heroGame === 'mlbb'} onClick={() => selectHeroGame('mlbb')}><span aria-hidden="true" />MLBB</button>
              <button type="button" className="hero-carousel-game" data-game="ff" aria-pressed={heroGame === 'ff'} onClick={() => selectHeroGame('ff')}><span aria-hidden="true" />FREE FIRE</button>
              <button type="button" className="hero-carousel-playback" onClick={toggleAutoplay} aria-label={autoplay ? 'Pausar alternancia automática' : 'Reanudar alternancia automática'}>
                {autoplay ? <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z" /></svg> : <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="m5 2 9 6-9 6z" /></svg>}
                {autoplay ? 'PAUSAR' : 'REPRODUCIR'}
              </button>
            </div>
            </div>
          </div>

          <div className="division-section-heading" id="disciplinas">
            <span className="eyebrow"><i /> DOS DISCIPLINAS. UNA MISMA PASIÓN.</span><span className="section-index">01 / EL TORNEO</span>
          </div>
          <div className="hero-divisions-grid">
            {divisions.map((division) => (
              <button
                className={`hero-division-card hero-division-card--${division.key} ${activeGame === division.key ? 'hero-division-card--active' : ''}`}
                key={division.key} aria-label={`Inscribir equipo en ${division.name} por ${division.fee}`} onClick={() => handleInscribe(division.key)} style={{ '--division-color': division.color }} type="button"
              >
                <img src={division.image} alt="" className="division-bg-img" loading="lazy" />
                <span className="division-card-overlay" />
                <CharacterArt character={division.key === 'mlbb' ? 'kalea' : 'deeee'} className={`division-character ${division.key === 'ff' ? 'division-character--ff' : ''}`} />
                <span className="division-card-number" aria-hidden="true">{division.number}</span>
                <div className="division-card-content">
                  <span className="division-card-tag">{division.title}</span>
                  <strong className="division-card-name">{division.name}<small>{division.subtitle}</small></strong>
                  <small className="division-card-detail">{division.detail}</small>
                  <div className="division-card-bottom"><span>{division.format}</span><span className="division-card-action">{division.fee} / EQUIPO <b aria-hidden="true">↗</b></span></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {!isFreeFire && (
        <section className="mlbb-showcase" aria-labelledby="mlbb-title">
          <div className="mlbb-showcase-visual">
            <span className="mlbb-showcase-monogram" aria-hidden="true">M</span>
            <div className="arena-orbit" aria-hidden="true" />
            <CharacterArt character="marcel" className="showcase-character" />
            <span className="mlbb-art-caption">MOBILE LEGENDS: BANG BANG <i /> DIVISIÓN 01</span>
          </div>
          <div className="mlbb-showcase-copy">
            <span className="eyebrow">COORDINA. DOMINA. HAZ HISTORIA.</span>
            <h2 id="mlbb-title">Cinco jugadores.<br /><span>Una sola jugada.</span></h2>
            <p>El talento gana duelos. Un equipo gana la partida. Lleva a tu escuadra a la Tierra del Amanecer y defiende los colores de tu universidad.</p>
            <div className="mlbb-format-grid">
              <div><strong>5 + 2</strong><span>Titulares + suplentes</span></div>
              <div><strong>DRAFT</strong><span>Modo torneo 5v5</span></div>
              <div><strong>BO3</strong><span>Semifinal y final</span></div>
            </div>
            <div className="mlbb-showcase-actions">
              <button className="mlbb-register-button" type="button" onClick={() => handleInscribe('mlbb')}>JUGAR EN MLBB <span aria-hidden="true">↗</span></button>
              <a href="#reglamento" onClick={() => exploreRules('mlbb')}>Conoce las reglas <span aria-hidden="true">→</span></a>
            </div>
            <span className="mlbb-showcase-note">S/ 20 por equipo · Hasta 2 suplentes opcionales</span>
          </div>
        </section>
      )}

      {activeGame !== 'mlbb' && (
        <section className="mlbb-showcase ff-showcase" aria-labelledby="ff-title">
          <div className="mlbb-showcase-visual">
            <span className="mlbb-showcase-monogram" aria-hidden="true">FF</span>
            <div className="arena-orbit" aria-hidden="true" />
            <CharacterArt character="miguel" className="showcase-character showcase-character--ff" />
            <span className="mlbb-art-caption">FREE FIRE <i /> DIVISIÓN 02 / BATTLE ROYALE</span>
          </div>
          <div className="mlbb-showcase-copy">
            <span className="eyebrow">CAE. COORDINA. SOBREVIVE.</span>
            <h2 id="ff-title">Cuatro jugadores.<br /><span>Un solo Booyah.</span></h2>
            <p>Cada rotación cuenta. Cada compañero también. Aterriza con tu escuadra en Bermuda, Purgatorio y Kalahari y pelea por llevar a tu universidad hasta el último círculo.</p>
            <div className="mlbb-format-grid">
              <div><strong>4 + 1</strong><span>Titulares + suplente</span></div>
              <div><strong>SQUADS</strong><span>Battle Royale</span></div>
              <div><strong>+1 / KILL</strong><span>Punto por eliminación</span></div>
            </div>
            <div className="mlbb-showcase-actions">
              <button className="mlbb-register-button ff-register-button" type="button" onClick={() => handleInscribe('ff')}>JUGAR EN FREE FIRE <span aria-hidden="true">↗</span></button>
              <a href="#reglamento" onClick={() => exploreRules('ff')}>Conoce las reglas <span aria-hidden="true">→</span></a>
            </div>
            <span className="mlbb-showcase-note">S/ 15 por equipo · 1 suplente opcional</span>
          </div>
        </section>
      )}

      <section className="template-prizes" id="premios" aria-labelledby="prizes-title">
        <div className="template-section-title">
          <span>02 / PREMIOS Y RECONOCIMIENTO</span>
          <h2 id="prizes-title">LA GLORIA TAMBIÉN<br /><em>SE LLEVA A CASA.</em></h2>
          <p>Compite por tu universidad. Deja tu nombre en lo más alto.</p>
        </div>
        <div className="template-prize-grid">
          <article className="prize-card prize-card--champion"><span className="prize-card-place">01</span><span>CAMPEÓN</span><strong>S/ 1,500</strong><small>Trofeo y reconocimiento oficial</small><span className="prize-card-line" aria-hidden="true" /></article>
          <article className="prize-card"><span className="prize-card-place">02</span><span>SUBCAMPEÓN</span><strong>S/ 800</strong><small>Medallas y reconocimiento oficial</small><span className="prize-card-line" aria-hidden="true" /></article>
          <article className="prize-card"><span className="prize-card-place">03</span><span>TERCER LUGAR</span><strong>S/ 400</strong><small>Reconocimiento oficial</small><span className="prize-card-line" aria-hidden="true" /></article>
        </div>
      </section>
      <RegistrationSteps />
      <RulesSection />
    </main>
  )
}

export default Home
