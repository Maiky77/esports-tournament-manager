import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRegistration } from '../context/RegistrationContext'
import CharacterArt from '../components/CharacterArt'
import Icon from '../components/Icon'
import RulesSection from '../components/RulesSection'
import RegistrationSteps from '../components/RegistrationSteps'
import useHeroRotation from '../hooks/useHeroRotation'

const deadline = new Date('2026-12-15T23:59:59-05:00').getTime()
function getTimeLeft() {
  const time = Math.max(deadline - Date.now(), 0)
  return [['DÍAS', Math.floor(time / 86400000)], ['HORAS', Math.floor(time / 3600000) % 24], ['MIN', Math.floor(time / 60000) % 60], ['SEG', Math.floor(time / 1000) % 60]]
}
const divisions = [
  { key: 'mlbb', number: '01', name: 'Mobile Legends', subtitle: 'BANG BANG', image: '/img/hero-mlbb.jpg', character: 'kalea', fee: 'S/ 20', roster: '5 titulares + hasta 2 suplentes', mode: '5V5 · DRAFT PICK', rounds: 'BO1 eliminatorias · BO3 semifinal y final', description: 'Coordinación, estrategia y una sola meta: destruir la base rival.' },
  { key: 'ff', number: '02', name: 'Free Fire', subtitle: 'BATTLE ROYALE', image: '/img/hero-ff.jpg', character: 'deeee', fee: 'S/ 15', roster: '4 titulares + 1 suplente opcional', mode: 'SQUADS · BATTLE ROYALE', rounds: 'Puntos por posición + 1 punto por kill', description: 'Aterriza con tu escuadra y compite hasta el último círculo.' },
]
function moveArtwork(event) {
  if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return
  const bounds = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--art-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 16}px`)
  event.currentTarget.style.setProperty('--art-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 12}px`)
}
function resetArtwork(event) {
  event.currentTarget.style.setProperty('--art-x', '0px')
  event.currentTarget.style.setProperty('--art-y', '0px')
}
export default function Home() {
  const { openRegistration, activeGame, setActiveGame, isRegistrationOpen } = useRegistration()
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)
  const { game: heroGame, autoplay, selectGame, toggleAutoplay, containerRef } = useHeroRotation(activeGame, !isRegistrationOpen)
  const isFF = heroGame === 'ff'
  useEffect(() => { const interval = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000); return () => window.clearInterval(interval) }, [])
  return <main className="home-page home-page--template">
    <section className="template-hero-v2" id="inicio" aria-labelledby="event-title" ref={containerRef} data-hero-game={heroGame}>
      <div className="hero-backdrop" aria-hidden="true">
        <img src="/img/hero-mlbb.jpg" alt="" width="2560" height="1440" className={`hero-bg-img hero-bg-img--mlbb ${!isFF ? 'hero-bg-img--active' : ''}`} fetchPriority="high" />
        <img src="/img/hero-ff.jpg" alt="" width="1920" height="1080" className={`hero-bg-img hero-bg-img--ff ${isFF ? 'hero-bg-img--active' : ''}`} />
        <div className="hero-backdrop-gradient" />
      </div>
      <div className="hero-content-wrapper"><div className="hero-layout">
        <div className="hero-copy">
          <div className="hero-status-pill"><span className="hero-status-dot" /> PUNO, PERÚ <span className="hero-status-separator">/</span> TEMPORADA 2026</div>
          <div className="hero-grand-title"><span className="hero-subkicker">TU UNIVERSIDAD. TU EQUIPO. TU ARENA.</span><h1 id="event-title">RAGNAROK<span className="hero-gradient-text">U-SERIES<span className="hero-year">26</span></span></h1></div>
          <p className="hero-lead-desc">Representa a tu universidad en Mobile Legends y Free Fire. Forma tu escuadra y lleva tu juego al siguiente nivel.</p>
          <div className="hero-prize-pool"><Icon name="trophy" size={25} /><strong className="hero-prize-amount"><span>S/</span> 2,700</strong><div><span className="hero-prize-kicker">EN PREMIOS</span><small className="hero-prize-note">Dos disciplinas. Una arena.</small></div></div>
          <div className="hero-cta-group"><button onClick={() => openRegistration(heroGame)} type="button" className="hero-btn-primary clip-corner">INSCRIBIR A MI EQUIPO <Icon name="arrow-up-right" /></button><a href="#disciplinas" className="hero-explore-link">Ver disciplinas <Icon name="arrow-down" size={16} /></a></div>
          <div className="hero-countdown-block"><p className="hero-countdown-label">CIERRE DE INSCRIPCIONES <span>15 DIC / 2026</span></p><div className="hero-countdown-grid" role="timer" aria-label="Tiempo restante para inscribirse">{timeLeft.map(([label, value]) => <div key={label} className="countdown-box"><span className="countdown-digit">{String(value).padStart(2, '0')}</span><span className="countdown-unit">{label}</span></div>)}</div></div>
        </div>
        <div className="hero-visual-wrap"><figure className={`hero-visual ${isFF ? 'hero-visual--ff' : ''}`} onPointerMove={moveArtwork} onPointerLeave={resetArtwork}>
          <div className="arena-orbit arena-orbit--outer" aria-hidden="true" /><div className="arena-orbit arena-orbit--inner" aria-hidden="true" />
          <span className="hero-visual-coordinate" aria-hidden="true">RAGNAROK / PUNO 2026</span>
          <div className={`hero-character-layer hero-character-layer--mlbb ${!isFF ? 'hero-character-layer--active' : ''}`} aria-hidden="true"><CharacterArt character="sora" className="hero-character" priority /></div>
          <div className={`hero-character-layer hero-character-layer--ff ${isFF ? 'hero-character-layer--active' : ''}`} aria-hidden="true"><CharacterArt character="mono" className="hero-character hero-character--ff" priority /></div>
          <figcaption className="hero-visual-caption" aria-live={autoplay ? 'off' : 'polite'} aria-atomic="true"><span className="hero-visual-index">{isFF ? '02' : '01'}</span><div><span className="eyebrow">TU PRÓXIMA ARENA</span><strong>{isFF ? 'FREE FIRE' : 'MOBILE LEGENDS'}</strong><small>{isFF ? 'SQUADS · BATTLE ROYALE' : '5V5 · DRAFT PICK'}</small></div><Icon name="arrow-up-right" size={22} /></figcaption>
        </figure><div className="hero-carousel-controls" role="group" aria-label="Controles de la portada">
          <button type="button" className="hero-carousel-game" data-game="mlbb" aria-pressed={heroGame === 'mlbb'} onClick={() => selectGame('mlbb')}><span aria-hidden="true" />MLBB</button>
          <button type="button" className="hero-carousel-game" data-game="ff" aria-pressed={heroGame === 'ff'} onClick={() => selectGame('ff')}><span aria-hidden="true" />FREE FIRE</button>
          <button type="button" className="hero-carousel-playback" onClick={toggleAutoplay} aria-label={autoplay ? 'Pausar alternancia automática' : 'Reanudar alternancia automática'}>{autoplay ? 'PAUSAR PORTADA' : 'ACTIVAR ROTACIÓN'}</button>
        </div></div>
      </div></div>
    </section>

    <section className="disciplines-section" id="disciplinas" aria-labelledby="disciplines-title">
      <div className="template-section-title"><span>01 / ELIGE TU DISCIPLINA</span><h2 id="disciplines-title">Dos juegos. <em>Una arena.</em></h2><p>Consulta el formato, reúne a tu equipo y elige dónde competir.</p></div>
      <div className="discipline-grid">{divisions.map(division => <article className={`discipline-panel discipline-panel--${division.key}`} key={division.key}>
        <img className="discipline-panel-background" src={division.image} alt="" loading="lazy" />
        <CharacterArt character={division.character} className="discipline-panel-character" />
        <div className="discipline-panel-copy"><span className="discipline-panel-mode">{division.number} / {division.mode}</span><h3>{division.name}<small>{division.subtitle}</small></h3><p>{division.description}</p>
          <ul className="discipline-facts"><li><Icon name="users" size={15} />{division.roster}</li><li><Icon name="trophy" size={15} />{division.rounds}</li></ul>
          <div className="discipline-panel-actions"><button type="button" onClick={() => openRegistration(division.key)}>INSCRIBIR EQUIPO <Icon name="arrow-up-right" size={16} /></button><strong>{division.fee}<small>POR EQUIPO</small></strong></div>
          <a className="discipline-rules-link" href="#reglamento" onClick={() => setActiveGame(division.key)}>Consultar reglamento <Icon name="arrow-right" size={14} /></a>
        </div>
      </article>)}</div>
      <div className="competition-shortcuts"><span>LA COMPETENCIA, EN UN SOLO LUGAR.</span><Link to="/equipos">Equipos confirmados <Icon name="arrow-up-right" size={16} /></Link><Link to="/llaves">Fixture y resultados <Icon name="arrow-up-right" size={16} /></Link></div>
    </section>

    <section className="template-prizes" id="premios" aria-labelledby="prizes-title"><div className="template-section-title"><span>02 / PREMIOS</span><h2 id="prizes-title">Juega por <em>la gloria.</em></h2><p>S/ 2,700 en premios y el orgullo de representar a tu universidad.</p></div><div className="template-prize-grid">{[['01', 'CAMPEÓN', 'S/ 1,500', 'Trofeo y reconocimiento oficial'], ['02', 'SUBCAMPEÓN', 'S/ 800', 'Medallas y reconocimiento oficial'], ['03', 'TERCER LUGAR', 'S/ 400', 'Reconocimiento oficial']].map(([place, title, amount, detail], i) => <article className={`prize-card ${i === 0 ? 'prize-card--champion' : ''}`} key={place}><span className="prize-card-place">{place}</span><span>{title}</span><strong>{amount}</strong><small>{detail}</small></article>)}</div></section>
    <RegistrationSteps />
    <RulesSection />
  </main>
}
