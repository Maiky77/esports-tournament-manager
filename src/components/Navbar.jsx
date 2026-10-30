import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useRegistration } from '../context/RegistrationContext'
import { audio } from '../lib/audioEngine'

const links = [
  { label: 'Inicio', to: '/' },
  { label: 'Reglamento', to: '#reglamento' },
  { label: 'Equipos confirmados', to: '/equipos' },
  { label: 'Llaves del torneo', to: '/llaves' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const { openRegistration, activeGame, setActiveGame } = useRegistration()

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? window.scrollY / total : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setIsOpen(false)

  const showRegistration = () => {
    closeMenu()
    audio.click()
    openRegistration()
  }

  const switchDivision = (gameKey) => {
    setActiveGame(gameKey)
    audio.selectGame(gameKey)
  }

  const goToRules = () => {
    closeMenu()
    audio.click()
    const el = document.getElementById('reglamento')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#reglamento'
    }
  }

  return (
    <header className="site-header">
      {/* Barra de progreso de lectura superior */}
      <div
        className="navbar-progress-bar"
        style={{ transform: `scaleX(${progress})` }}
      />
      <nav className="navbar" aria-label="Navegación principal">
        <NavLink to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark">U</span>
          <div className="brand-copy">
            <span className="brand-title">RAGNAROK <em>:</em> U-SERIES</span>
            <span className="brand-sub">ESPORTS UNIVERSITARIO 2026</span>
          </div>
        </NavLink>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={isOpen}
          aria-controls="main-navigation"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => {
            audio.click()
            setIsOpen((open) => !open)
          }}
        >
          <span /><span /><span />
        </button>

        <div id="main-navigation" className={`nav-links ${isOpen ? 'nav-links--open' : ''}`}>
          {links.map(({ label, to }) => (
            to === '/inscripcion' ? (
              <button className="nav-link nav-link-button" key={to} onClick={showRegistration} type="button">{label}</button>
            ) : to === '#reglamento' ? (
              <button className="nav-link nav-link-button" key={to} onClick={goToRules} type="button">{label}</button>
            ) : (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`} onClick={closeMenu}>
                {label}
              </NavLink>
            )
          ))}
        </div>

        {/* Switcher rápido de disciplina (MLBB / FF) */}
        <div className="nav-game-switcher" aria-label="Selector de disciplina">
          <button
            type="button"
            className={`nav-switch-tab ${activeGame === 'mlbb' ? 'nav-switch-tab--active nav-switch-tab--mlbb' : ''}`}
            onClick={() => switchDivision('mlbb')}
            title="Cambiar a División Mobile Legends"
          >
            ⚔️ MLBB
          </button>
          <button
            type="button"
            className={`nav-switch-tab ${activeGame === 'ff' ? 'nav-switch-tab--active nav-switch-tab--ff' : ''}`}
            onClick={() => switchDivision('ff')}
            title="Cambiar a División Free Fire"
          >
            🔥 FREE FIRE
          </button>
        </div>

        <button className="nav-cta" onClick={showRegistration} type="button">
          Inscribe tu equipo
        </button>
      </nav>
    </header>
  )
}

export default Navbar
