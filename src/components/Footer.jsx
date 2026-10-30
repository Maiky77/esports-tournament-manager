import { Link } from 'react-router-dom'
import { audio } from '../lib/audioEngine'

const configuredGroup = import.meta.env.VITE_WHATSAPP_GROUP_URL?.trim() || ''
function resolveGroup() {
  try {
    const url = new URL(configuredGroup)
    return url.protocol === 'https:' && url.hostname === 'chat.whatsapp.com' && url.pathname.length > 1 ? url.href : ''
  } catch {
    return ''
  }
}
const whatsappGroup = resolveGroup()

function Footer() {
  const scrollToTop = () => {
    audio.click()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="site-footer" id="comunidad">
      <section className="community-panel" aria-labelledby="community-title">
        <div className="community-copy">
          <span className="section-eyebrow">05 / LA COMUNIDAD RAGNAROK</span>
          <h2 id="community-title">EL JUEGO NOS UNE.<br /><span>LA UNIVERSIDAD<br />NOS REPRESENTA.</span></h2>
          <p>Participantes, capitanes y espectadores. Un mismo espacio para encontrar escuadra, consultar las novedades y vivir la competencia.</p>
          {whatsappGroup ? (
            <a className="community-join" href={whatsappGroup} target="_blank" rel="noopener noreferrer" onClick={() => audio.click()}>UNIRME A WHATSAPP <span aria-hidden="true">↗</span></a>
          ) : (
            <Link className="community-join" to="/#como-participar">VER CÓMO PARTICIPAR <span aria-hidden="true">↗</span></Link>
          )}
        </div>
        <div className="community-console">
          <div className="community-console-label"><span>U-SERIES / COMMUNITY</span><i /></div>
          <strong>EL TORNEO<br />SE VIVE EN EQUIPO.</strong>
          <ul><li><span>01</span> Encuentra compañeros de escuadra</li><li><span>02</span> Sigue las novedades de la competencia</li><li><span>03</span> Conecta con la comunidad universitaria</li></ul>
          <p>{whatsappGroup ? 'El grupo de WhatsApp está abierto a la comunidad del evento.' : 'El enlace oficial de WhatsApp se publicará aquí.'}</p>
        </div>
      </section>
      <div className="footer-main-grid">
        <div className="footer-brand-col">
          <Link className="footer-brand-row" to="/"><span className="footer-brand-mark" aria-hidden="true">R//</span><div><strong className="footer-brand-name">RAGNAROK · U-SERIES</strong><span className="footer-brand-sub">ARENA UNIVERSITARIA / PUNO 2026</span></div></Link>
          <p className="footer-brand-desc">Mobile Legends y Free Fire. El talento de tu universidad en una misma arena competitiva.</p>
          <div className="footer-tags-row"><span className="footer-tag footer-tag--cyan">MLBB / S/ 20</span><span className="footer-tag footer-tag--orange">FREE FIRE / S/ 15</span></div>
        </div>
        <div><h3 className="footer-col-title">EXPLORA EL EVENTO</h3><ul className="footer-links"><li><Link to="/">Inicio</Link></li><li><Link to="/#premios">Premios</Link></li><li><Link to="/#reglamento">Reglamento oficial</Link></li><li><Link to="/equipos">Equipos confirmados</Link></li><li><Link to="/llaves">Llaves del torneo</Link></li></ul></div>
        <div><h3 className="footer-col-title">LA COMPETENCIA</h3><ul className="footer-links footer-links--info"><li><span>SEDE</span> Puno, Perú</li><li><span>TEMPORADA</span> 2026</li><li><span>DISCIPLINAS</span> Mobile Legends y Free Fire</li><li><span>CIERRE DE INSCRIPCIONES</span> 15 de diciembre</li></ul></div>
      </div>
      <div className="footer-bottom-bar"><p>© 2026 RAGNAROK U-Series. Comunidad universitaria de esports.</p><button type="button" className="footer-top-btn" onClick={scrollToTop}>VOLVER ARRIBA <span aria-hidden="true">↑</span></button></div>
    </footer>
  )
}

export default Footer
