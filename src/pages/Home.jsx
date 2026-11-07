import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { useRegistration } from '../context/RegistrationContext'
import { audio } from '../lib/audioEngine'
import CharacterArt from '../components/CharacterArt'
import RulesSection from '../components/RulesSection'
import RegistrationSteps from '../components/RegistrationSteps'
import useHeroRotation from '../hooks/useHeroRotation'
import { useTournament } from '../context/TournamentContext'
import { formatSoles } from '../lib/money'
import { communityLink } from '../lib/whatsapp'

function getTimeLeft(deadline) {
  const time = Math.max(deadline - Date.now(), 0)
  return [
    ['DÍAS', Math.floor(time / 86400000)],
    ['HORAS', Math.floor((time / 3600000) % 24)],
    ['MIN', Math.floor((time / 60000) % 60)],
    ['SEG', Math.floor((time / 1000) % 60)],
  ]
}

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const formatDeadline = (ms) => {
  const d = new Date(ms)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} / ${d.getFullYear()}`
}

const divisions = [
  {
    key: 'mlbb',
    number: '01',
    name: 'Mobile Legends',
    subtitle: 'BANG BANG',
    image: '/img/hero-mlbb.webp',
    character: 'kalea',
    mode: '5V5 · DRAFT PICK',
    rounds: 'BO1 eliminatorias · BO3 semifinal y final',
    description: 'Coordinación, estrategia y una sola meta: destruir la base rival.',
  },
  {
    key: 'ff',
    number: '02',
    name: 'Free Fire',
    subtitle: 'BATTLE ROYALE',
    image: '/img/hero-ff.webp',
    character: 'deeee',
    mode: 'SQUADS · BATTLE ROYALE',
    rounds: 'Puntos por posición + 1 punto por kill',
    description: 'Aterriza con tu escuadra y compite hasta el último círculo.',
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
  const { deadline, games: gameConfig, prizes, prizeTotal, availability, settings } = useTournament()
  const whatsappGroup = communityLink(settings)
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline))
  const { game: heroGame, autoplay, selectGame: selectHeroGame, toggleAutoplay, containerRef } = useHeroRotation(activeGame, heroEnabled && !isRegistrationOpen)
  const isHeroFreeFire = heroGame === 'ff'

  useEffect(() => {
    const interval = window.setInterval(() => setTimeLeft(getTimeLeft(deadline)), 1000)
    return () => window.clearInterval(interval)
  }, [deadline])

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
          <img src="/img/hero-mlbb.webp" alt="" width="2560" height="1440" className={`hero-bg-img hero-bg-img--mlbb ${!isHeroFreeFire ? 'hero-bg-img--active' : ''}`} fetchPriority="high" decoding="async" />
          <img src="/img/hero-ff.webp" alt="" width="1920" height="1080" className={`hero-bg-img hero-bg-img--ff ${isHeroFreeFire ? 'hero-bg-img--active' : ''}`} loading="lazy" decoding="async" />
          <div className="hero-backdrop-gradient" />
        </div>
        <div className="hero-watermark" aria-hidden="true"><span>U-SERIES</span></div>

        <div className="hero-content-wrapper">
          <div className="hero-layout">
            <div className="hero-copy">
              <div className="hero-grand-title">
                <span className="hero-subkicker">TU UNIVERSIDAD. TU EQUIPO. TU ARENA.</span>
                <h1 id="event-title">RAGNAROK<span className="hero-gradient-text">U-SERIES<span className="hero-year">26</span></span></h1>
              </div>
              <p className="hero-lead-desc">
                La próxima gran jugada lleva el nombre de tu universidad.
                Reúne a tu equipo y entra a la arena de Mobile Legends y Free Fire.
              </p>
              <div className="hero-prize-pool">
                {prizeTotal > 0 ? (
                  <>
                    <strong className="hero-prize-amount"><span>S/</span> {prizeTotal.toLocaleString('es-PE')}</strong>
                    <div><span className="hero-prize-kicker">BOLSA DE PREMIOS</span><small className="hero-prize-note">En efectivo · Dos disciplinas</small></div>
                  </>
                ) : (
                  <>
                    <strong className="hero-prize-amount hero-prize-amount--tba"><Icon name="trophy" size={24} /> POR ANUNCIAR</strong>
                    <div><span className="hero-prize-kicker">BOLSA DE PREMIOS</span><small className="hero-prize-note">Según equipos inscritos.</small></div>
                  </>
                )}
              </div>
              <div className="hero-cta-group">
                <button onClick={() => handleInscribe(heroGame)} type="button" className="hero-btn-primary clip-corner">
                  INSCRIBIR A MI EQUIPO
                </button>
                {whatsappGroup && (
                  <a
                    href={whatsappGroup}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-btn-community clip-corner"
                    onClick={() => audio.click()}
                  >
                    <svg className="hero-btn-community-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.8 2 1.4.9 2 1 2.3.8.3-.1 1.2-.6 1.4-1.2Z" />
                    </svg>
                    <span className="hero-btn-community-text">ÚNETE A LA COMUNIDAD</span>
                    <span className="hero-btn-community-arrow" aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
              <div className="hero-countdown-block">
                <p className="hero-countdown-label">CIERRE DE INSCRIPCIONES <span>{formatDeadline(deadline)}</span></p>
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

        </div>
      </section>

      <section className="disciplines-section" id="disciplinas" aria-labelledby="disciplines-title">
        <div className="template-section-title">
          <span>01 / ELIGE TU DISCIPLINA</span>
          <h2 id="disciplines-title">Dos juegos. <em>Una arena.</em></h2>
          <p>Consulta el formato, reúne a tu equipo y elige dónde competir.</p>
        </div>
        <div className="discipline-grid">
          {divisions.map((division) => (
            <article className={`discipline-panel discipline-panel--${division.key}`} key={division.key}>
              <img className="discipline-panel-background" src={division.image} alt="" loading="lazy" />
              <CharacterArt character={division.character} className="discipline-panel-character" />
              <div className="discipline-panel-copy">
                <span className="discipline-panel-mode">{division.number} / {division.mode}</span>
                <h3>{division.name}<small>{division.subtitle}</small></h3>
                <p>{division.description}</p>
                <ul className="discipline-facts">
                  <li>
                    <Icon name="users" size={15} />
                    {`${gameConfig[division.key].starters} titulares + ${gameConfig[division.key].substitutes} suplente(s)`}
                  </li>
                  <li>
                    <Icon name="trophy" size={15} />
                    {division.rounds}
                  </li>
                </ul>
                <div className="discipline-panel-actions">
                  <button type="button" onClick={() => handleInscribe(division.key)}>
                    INSCRIBIR EQUIPO <Icon name="arrow-up-right" size={16} />
                  </button>
                  <strong>
                    {formatSoles(gameConfig[division.key].price)}
                    <small>POR EQUIPO</small>
                  </strong>
                </div>
                <a className="discipline-rules-link" href="#reglamento" onClick={() => exploreRules(division.key)}>
                  Consultar reglamento <Icon name="arrow-right" size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="competition-shortcuts">
          <span>LA COMPETENCIA, EN UN SOLO LUGAR.</span>
          <Link to="/equipos">Equipos confirmados <Icon name="arrow-up-right" size={16} /></Link>
          <Link to="/llaves">Fixture y resultados <Icon name="arrow-up-right" size={16} /></Link>
        </div>
      </section>



      <section className="template-prizes" id="premios" aria-labelledby="prizes-title">
        <div className="template-section-title">
          <span>02 / PREMIOS Y RECONOCIMIENTO</span>
          <h2 id="prizes-title">{prizeTotal > 0 ? <>LA GLORIA TAMBIÉN<br /><em>SE LLEVA A CASA.</em></> : <>Juega por <em>la gloria.</em></>}</h2>
          <p>
            {prizeTotal > 0
              ? 'Compite por tu universidad. Deja tu nombre en lo más alto.'
              : 'La bolsa de premios se anunciará según la cantidad de equipos inscritos en cada categoría.'}
          </p>
        </div>
        {prizeTotal > 0 ? (
          <div className="template-prize-grid">
            {prizes.map((prize) => (
              <article className={`prize-card ${prize.place === 1 ? 'prize-card--champion' : ''}`} key={prize.place}>
                <span className="prize-card-place">{String(prize.place).padStart(2, '0')}</span>
                <span>{prize.label}</span>
                <strong>{prize.amount > 0 ? formatSoles(prize.amount) : 'POR ANUNCIAR'}</strong>
                <small>{prize.description}</small>
                <span className="prize-card-line" aria-hidden="true" />
              </article>
            ))}
          </div>
        ) : (
          <div className="tba-prize-banner">
            <div className="tba-prize-badge">
              <Icon name="trophy" size={30} />
              <span>RECOMPENSA<br />EN CONSTRUCCIÓN</span>
            </div>
            <div className="tba-prize-center">
              <span className="tba-prize-kicker">BOLSA DE PREMIOS</span>
              <h3 className="tba-prize-title">POR ANUNCIAR</h3>
              <p>
                La competencia crece con cada escuadra. Los premios finales se comunicarán cuando se cierre el registro de cada categoría.
              </p>
            </div>
            <div className="tba-prize-places">
              {prizes.map((prize) => (
                <div key={prize.place} className="tba-place-row">
                  <span className="tba-place-num">{String(prize.place).padStart(2, '0')}</span>
                  <span className="tba-place-label">{prize.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <RegistrationSteps />
      <RulesSection />
    </main>
  )
}

export default Home
