import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { label: 'Inicio', to: '/' },
  { label: 'Inscripción', to: '/inscripcion' },
  { label: 'Equipos confirmados', to: '/equipos' },
  { label: 'Llaves del torneo', to: '/llaves' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const closeMenu = () => setIsOpen(false)

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Navegación principal">
        <NavLink to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark">U</span>
          <span>U-SERIES</span>
        </NavLink>
        <button type="button" className="menu-toggle" aria-expanded={isOpen} aria-controls="main-navigation" aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setIsOpen((open) => !open)}>
          <span /><span /><span />
        </button>
        <div id="main-navigation" className={`nav-links ${isOpen ? 'nav-links--open' : ''}`}>
          {links.map(({ label, to }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`} onClick={closeMenu}>
              {label}
            </NavLink>
          ))}
        </div>
        <NavLink to="/inscripcion" className="nav-cta" onClick={closeMenu}>Inscribe tu escuadra</NavLink>
      </nav>
    </header>
  )
}

export default Navbar

