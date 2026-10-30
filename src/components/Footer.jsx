import { audio } from '../lib/audioEngine'
import ragnarokCrest from '../assets/ragnarok-crest.svg'

function Footer() {
  const scrollToTop = () => {
    audio.click()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="site-footer" id="comunidad">
      {/* ================= BLOQUE DESTACADO: GRUPO GENERAL DE WHATSAPP ================= */}
      <div className="footer-whatsapp-banner">
        <div className="footer-whatsapp-glow" aria-hidden="true" />
        <div className="footer-whatsapp-content">
          <div className="footer-whatsapp-info">
            <div className="footer-whatsapp-badges">
              <span className="footer-live-badge">
                <span className="footer-live-dot" /> GRUPO GENERAL OFICIAL
              </span>
              <span className="footer-access-tag">ACCESO ABIERTO A TODOS</span>
            </div>
            <h3>ÚNETE AL GRUPO GENERAL DE WHATSAPP</h3>
            <p>
              Canal oficial de la comunidad RAGNAROK U-Series 2026. Espacio abierto para todos los estudiantes,
              participantes y espectadores: entérate de los fixtures, consulta dudas con la organización,
              sigue las transmisiones en vivo o encuentra compañeros de equipo para tu escuela profesional.
            </p>
            <div className="footer-whatsapp-actions">
              <a
                href="https://chat.whatsapp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-whatsapp-btn"
                onClick={() => audio.click()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.17 8.17 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25.7-1.44 1.34-1.99 1.43-.51.08-1.15.11-1.86-.12-.43-.14-.99-.33-1.7-.64-3-1.31-4.96-4.34-5.11-4.54-.15-.2-1.23-1.64-1.23-3.13 0-1.49.77-2.22 1.05-2.52.28-.3.6-.38.8-.38.2 0 .4 0 .58.01.19.01.44-.07.69.52.26.62.88 2.15.96 2.3.08.15.13.33.03.53-.1.2-.15.33-.3.5-.15.18-.32.41-.45.55-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.13 1 2.08 1.32 2.38 1.47.3.15.47.13.65-.08.18-.2.76-.89.96-1.19.2-.3.41-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.22.58.35.08.13.08.76-.17 1.46z" />
                </svg>
                <span>ENTRAR AL GRUPO DE WHATSAPP ↗</span>
              </a>
              <span className="footer-whatsapp-link-text">
                Enlace directo: <code>chat.whatsapp.com/RAGNAROK-USERIES</code>
              </span>
            </div>
          </div>

          <div className="footer-whatsapp-qr-wrap">
            <div className="footer-qr-frame">
              <span className="qr-corner qr-corner--tl" />
              <span className="qr-corner qr-corner--tr" />
              <span className="qr-corner qr-corner--bl" />
              <span className="qr-corner qr-corner--br" />
              <div className="footer-qr-box" title="Espacio para el Código QR oficial de WhatsApp">
                <svg className="footer-qr-svg" viewBox="0 0 100 100" fill="none">
                  <rect x="10" y="10" width="24" height="24" rx="2" stroke="#25D366" strokeWidth="3" fill="none" />
                  <rect x="16" y="16" width="12" height="12" fill="#25D366" />
                  <rect x="66" y="10" width="24" height="24" rx="2" stroke="#25D366" strokeWidth="3" fill="none" />
                  <rect x="72" y="16" width="12" height="12" fill="#25D366" />
                  <rect x="10" y="66" width="24" height="24" rx="2" stroke="#25D366" strokeWidth="3" fill="none" />
                  <rect x="16" y="72" width="12" height="12" fill="#25D366" />

                  <rect x="42" y="12" width="6" height="6" fill="#25D366" opacity="0.85" />
                  <rect x="52" y="12" width="6" height="6" fill="#25D366" opacity="0.65" />
                  <rect x="42" y="24" width="16" height="6" fill="#25D366" opacity="0.9" />
                  <rect x="12" y="44" width="6" height="14" fill="#25D366" opacity="0.75" />
                  <rect x="24" y="44" width="10" height="6" fill="#25D366" opacity="0.85" />
                  <rect x="66" y="44" width="12" height="6" fill="#25D366" opacity="0.8" />
                  <rect x="82" y="44" width="8" height="12" fill="#25D366" opacity="0.65" />
                  <rect x="42" y="66" width="8" height="22" fill="#25D366" opacity="0.85" />
                  <rect x="56" y="72" width="14" height="6" fill="#25D366" opacity="0.75" />
                  <rect x="76" y="66" width="14" height="14" fill="#25D366" opacity="0.85" />
                  <rect x="76" y="86" width="14" height="4" fill="#25D366" opacity="0.55" />

                  <circle cx="50" cy="50" r="14" fill="#040914" stroke="#25D366" strokeWidth="2.5" />
                  <path d="M50 41c-4.97 0-9 4.03-9 9 0 1.59.42 3.08 1.15 4.38L41 59l4.74-1.24A8.93 8.93 0 0 0 50 59c4.97 0 9-4.03 9-9s-4.03-9-9-9zm4.56 12.74c-.19.53-1.1 1.04-1.52 1.1-.39.06-.88.08-1.42-.1-.33-.11-.76-.25-1.3-.49-2.29-1-3.79-3.32-3.9-3.47-.11-.15-.94-1.25-.94-2.39 0-1.13.59-1.69.8-1.92.21-.23.46-.29.61-.29.15 0 .31 0 .44.01.14.01.33-.05.51.39.19.46.65 1.59.71 1.7.06.11.1.25.02.4-.07.15-.11.25-.23.38-.11.14-.24.31-.34.42-.11.11-.23.24-.1.46.13.22.58.96 1.25 1.55.86.77 1.58 1.01 1.81 1.12.23.11.36.1.5-.06.13-.15.58-.68.74-.91.15-.23.31-.19.51-.11.21.08 1.3.61 1.53.72.23.11.38.17.44.27.06.1.06.58-.13 1.11z" fill="#25D366" />
                </svg>
              </div>
              <span className="footer-qr-caption">ESCANEAR CÓDIGO QR</span>
            </div>
            <small className="footer-qr-sub">Desde PC o tablet con tu celular</small>
          </div>
        </div>
      </div>

      {/* ================= COLUMNAS INSTITUCIONALES DEL FOOTER ================= */}
      <div className="footer-main-grid">
        <div className="footer-brand-col">
          <div className="footer-brand-row">
            <img src={ragnarokCrest} alt="Ragnarok Crest" className="footer-crest" />
            <div>
              <strong className="footer-brand-name">RAGNAROK · U-SERIES</strong>
              <span className="footer-brand-sub">TORNEO UNIVERSITARIO DE ESPORTS 2026</span>
            </div>
          </div>
          <p className="footer-brand-desc">
            Competencia universitaria interfacultades e interuniversitaria en Puno, Perú.
            Dos divisiones oficiales: Mobile Legends: Bang Bang (5v5 MOBA) y Free Fire (Squads Battle Royale).
          </p>
          <div className="footer-tags-row">
            <span className="footer-tag footer-tag--cyan">⚔️ MLBB · S/ 20.00</span>
            <span className="footer-tag footer-tag--orange">🔥 FREE FIRE · S/ 15.00</span>
          </div>
        </div>

        <div className="footer-nav-col">
          <h4 className="footer-col-title">NAVEGACIÓN</h4>
          <ul className="footer-links">
            <li><a href="/#inicio">Inicio</a></li>
            <li><a href="/#premios">Premios</a></li>
            <li><a href="/#reglamento">Reglamento Oficial</a></li>
            <li><a href="/equipos">Equipos Confirmados</a></li>
            <li><a href="/llaves">Llaves del Torneo</a></li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <h4 className="footer-col-title">ORGANIZACIÓN</h4>
          <ul className="footer-links footer-links--info">
            <li><span>Sede:</span> Puno, Perú</li>
            <li><span>Comunidad:</span> Universidad Nacional del Altiplano (UNAP)</li>
            <li><span>Temporada:</span> 2026 · I Edición U-Series</li>
            <li><span>Canal:</span> WhatsApp General Oficial</li>
          </ul>
        </div>
      </div>

      {/* ================= BARRA INFERIOR DE DERECHOS ================= */}
      <div className="footer-bottom-bar">
        <p>© 2026 RAGNAROK : U-Series · Todos los derechos reservados. Desarrollado para la comunidad universitaria de esports.</p>
        <button type="button" onClick={scrollToTop} className="footer-top-btn">
          ↑ Volver arriba
        </button>
      </div>
    </footer>
  )
}

export default Footer

