import { Link } from 'react-router-dom'
import { audio } from '../lib/audioEngine'
import { useTournament } from '../context/TournamentContext'
import { communityLink } from '../lib/whatsapp'
import Icon from './Icon'

function Footer() {
  const { deadline, settings } = useTournament()
  const whatsappGroup = communityLink(settings)
  const closingDate = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'long',
  }).format(new Date(deadline))

  const scrollToTop = () => {
    audio.click()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="site-footer" id="comunidad">
      {/* Música bajo licencia CC BY 4.0: "Heroic Age" (Mobile Legends) y "Volatile Reaction" (Free Fire) de Kevin MacLeod (incompetech.com) */}
      <div className="footer-main-grid">
        <div className="footer-brand-col">
          <Link className="footer-brand-row" to="/">
            <img
              className="footer-context-logo"
              src="/images/ragnarok-contexto.png"
              alt="Ragnarok U-Series"
              width="220"
              height="73"
            />
            <div>
              <strong className="footer-brand-name">RAGNAROK · U-SERIES</strong>
              <span className="footer-brand-sub">ARENA UNIVERSITARIA 2026</span>
            </div>
          </Link>
          <p className="footer-brand-desc">
            Mobile Legends y Free Fire. El talento de tu universidad en una misma arena.
          </p>
        </div>

        <div>
          <h3 className="footer-col-title">EL EVENTO</h3>
          <ul className="footer-links">
            <li><Link to="/#disciplinas">Disciplinas</Link></li>
            <li><Link to="/#premios">Premios</Link></li>
            <li><Link to="/#reglamento">Reglamento</Link></li>
            {whatsappGroup ? (
              <li>
                <a href={whatsappGroup} target="_blank" rel="noopener noreferrer" onClick={() => audio.click()}>
                  Comunidad WhatsApp
                </a>
              </li>
            ) : (
              <li><Link to="/#como-participar">Inscripción y Yape</Link></li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="footer-col-title">LA COMPETENCIA</h3>
          <ul className="footer-links">
            <li><Link to="/equipos">Equipos confirmados</Link></li>
            <li><Link to="/llaves">Fixture y resultados</Link></li>
            <li><span>Temporada 2026</span></li>
            <li><span>Cierre: {closingDate}</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>© 2026 RAGNAROK U-Series.</p>
        <button type="button" className="footer-top-btn" onClick={scrollToTop}>
          VOLVER ARRIBA <Icon name="arrow-up" size={15} />
        </button>
      </div>
    </footer>
  )
}

export default Footer
