import { Link } from 'react-router-dom'
import Icon from './Icon'

function resolveGroup() {
  try {
    const url = new URL(import.meta.env.VITE_WHATSAPP_GROUP_URL?.trim() || '')
    return url.protocol === 'https:' && url.hostname === 'chat.whatsapp.com' && url.pathname.length > 1 ? url.href : ''
  } catch { return '' }
}
const whatsappGroup = resolveGroup()
export default function Footer() {
  return <footer className="site-footer" id="comunidad">
    <section className="community-panel" aria-labelledby="community-title"><div className="community-copy"><span className="section-eyebrow">05 / COMUNIDAD RAGNAROK</span><h2 id="community-title">El torneo se vive <span>en equipo.</span></h2><p>Encuentra escuadra, sigue las novedades y conecta con la comunidad universitaria.</p></div><div className="community-action">{whatsappGroup ? <a className="community-join" href={whatsappGroup} target="_blank" rel="noopener noreferrer">UNIRME A WHATSAPP <Icon name="arrow-up-right" /></a> : <Link className="community-join" to="/#como-participar">VER CÓMO PARTICIPAR <Icon name="arrow-up-right" /></Link>}<small>{whatsappGroup ? 'El grupo oficial de la comunidad.' : 'El enlace oficial de WhatsApp se publicará aquí.'}</small></div></section>
    <div className="footer-main-grid"><div className="footer-brand-col"><Link className="footer-brand-row" to="/"><span className="footer-brand-mark" aria-hidden="true">R//</span><div><strong className="footer-brand-name">RAGNAROK · U-SERIES</strong><span className="footer-brand-sub">ARENA UNIVERSITARIA / PUNO 2026</span></div></Link><p className="footer-brand-desc">Mobile Legends y Free Fire. El talento de tu universidad en una misma arena.</p></div>
      <div><h3 className="footer-col-title">EL EVENTO</h3><ul className="footer-links"><li><Link to="/#disciplinas">Disciplinas</Link></li><li><Link to="/#premios">Premios</Link></li><li><Link to="/#reglamento">Reglamento</Link></li><li><Link to="/#como-participar">Inscripción y Yape</Link></li></ul></div>
      <div><h3 className="footer-col-title">LA COMPETENCIA</h3><ul className="footer-links"><li><Link to="/equipos">Equipos confirmados</Link></li><li><Link to="/llaves">Fixture y resultados</Link></li><li><span>Puno, Perú · Temporada 2026</span></li><li><span>Cierre: 15 de diciembre</span></li></ul></div>
    </div>
    <div className="footer-bottom-bar"><p>© 2026 RAGNAROK U-Series.</p><button type="button" className="footer-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>VOLVER ARRIBA <Icon name="arrow-up" size={15} /></button></div>
  </footer>
}
