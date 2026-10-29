import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useRegistration } from '../context/RegistrationContext'

const links = [
  { label: 'Inicio', to: '/' },
  { label: 'Inscripción', to: '/inscripcion' },
  { label: 'Equipos confirmados', to: '/equipos' },
  { label: 'Llaves del torneo', to: '/llaves' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { openRegistration } = useRegistration()
  const closeMenu = () => setIsOpen(false)
  const showRegistration = () => {
    closeMenu()
    openRegistration()
  }

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Navegación principal">
        <NavLink to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark">U</span>
          <span>RAGNAROK <em>:</em> U-SERIES</span>
        </NavLink>
        <button type="button" className="menu-toggle" aria-expanded={isOpen} aria-controls="main-navigation" aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setIsOpen((open) => !open)}>
          <span /><span /><span />
        </button>
        <div id="main-navigation" className={`nav-links ${isOpen ? 'nav-links--open' : ''}`}>
          {links.map(({ label, to }) => (
            to === '/inscripcion' ? (
              <button className="nav-link nav-link-button" key={to} onClick={showRegistration} type="button">{label}</button>
            ) : (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`} onClick={closeMenu}>
                {label}
              </NavLink>
            )
          ))}
        </div>
        <button className="nav-cta" onClick={showRegistration} type="button">Inscribe tu escuadra</button>
      </nav>
    </header>
  )
}

export default Navbar

