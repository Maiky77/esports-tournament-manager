import { useEffect, useState } from 'react'
import Icon from './Icon'
import CharacterArt from './CharacterArt'
import { useRegistration } from '../context/RegistrationContext'
import { useTournament } from '../context/TournamentContext'
import { publicUrl } from '../lib/tournamentApi'

const RULES_DATA = {
  mlbb: {
    title: 'Mobile Legends: Bang Bang',
    subtitle: 'Modalidad 5v5 (Torneo - Draft Pick)',
    pdfUrl: '/docs/Bases_MOBA.pdf',
    pdfName: 'Bases_MOBA.pdf',
    accent: '#b48aff',
    badge: '5V5 MOBA · DRAFT PICK',
    sections: [
      {
        num: '01',
        title: 'Formato del Torneo y Estructura',
        highlight: 'Modo Torneo Draft Pick 5v5 · BO1 eliminatorias y BO3 semifinal/final',
        points: [
          'Modo de Juego: Personalizada - Modo Torneo (Draft Pick 5v5).',
          'Estructura de Brackets: Rondas eliminatorias y cuartos de final al Mejor de 1 (BO1). Semifinales y Gran Final al Mejor de 3 (BO3).',
          'Dispositivos: Única y estrictamente dispositivos móviles (celulares o tablets). El uso de emuladores en PC está totalmente prohibido.',
          'Condición de Victoria: La partida finaliza cuando el Nexo (Base) enemigo es destruido o mediante rendición oficial a través del sistema del juego.',
        ],
      },
      {
        num: '02',
        title: 'Inscripciones y Requisitos de Escuadra',
        highlight: '5 titulares obligatorios + hasta 2 suplentes · ID Cuenta + Server ID',
        points: [
          'Estructura del Equipo: Cada escuadra debe registrar obligatoriamente a 5 jugadores titulares. Opcionalmente, se permite el registro de hasta 2 jugadores suplentes.',
          'Identificación (IDs): Es obligatorio registrar tanto el ID de Cuenta como el ID de Servidor (los 4 dígitos entre paréntesis) de todos los integrantes.',
          'El Capitán: Será el único medio de comunicación oficial. Debe proveer su nombre real, número de WhatsApp y su institución (UNAP u otra).',
          'Validación de Pagos (Yape): La inscripción será válida tras verificar el comprobante de pago. En caso de ganar, el pozo de premios será transferido única y exclusivamente a la cuenta del capitán.',
        ],
      },
      {
        num: '03',
        title: 'Gestión de Salas (Lobby) y Seguridad',
        highlight: '10 minutos de tolerancia · Expulsión a no registrados · W.O. estricto',
        points: [
          'Creación de la Sala: El árbitro creará la sala e invitará a los dos capitanes. Los capitanes son responsables de invitar a su escuadra a sus respectivos lados (Equipo Rojo o Azul).',
          'Tolerancia y Puntualidad: Se otorgarán exactamente 10 minutos de tolerancia para que ambos equipos completen su alineación de 5 jugadores. Pasado el tiempo, el equipo incompleto será descalificado por W.O.',
          'Coincidencia de Nicknames: Solo podrán participar los jugadores cuyo Nickname e ID coincidan exactamente con la base de datos oficial. Jugadores no registrados serán expulsados.',
        ],
      },
      {
        num: '04',
        title: 'Reglas de Partida (Draft Pick y Pausas)',
        highlight: 'Máximo 2 pausas por partida (máx. 3 min) · Regla de remake en draft',
        points: [
          'Desconexiones en el Draft Pick: Si un jugador se desconecta del lobby antes de que ambos equipos bloqueen (baneen) a su primer héroe, la sala será reiniciada. Si la desconexión ocurre después del primer baneo, la fase de selección debe continuar y la partida se jugará obligatoriamente.',
          'Sistema de Pausas: Cada escuadra tiene derecho a solicitar un máximo de 2 pausas por partida por motivos de conexión (lag).',
          'Duración de Pausas: Ninguna pausa podrá exceder los 3 minutos.',
          'Procedimiento: El capitán o jugador afectado debe solicitar la pausa escribiendo en el chat global ("All"). El árbitro será el único encargado de ejecutar la pausa en el sistema.',
        ],
      },
      {
        num: '05',
        title: 'Conducta y Sanciones (Tolerancia Cero)',
        highlight: 'Prohibido cambios durante partida · Cero toxicidad o recall spam extremo',
        points: [
          'Uso del Suplente: Solo pueden ingresar antes de que inicie la fase de Draft Pick. Prohibido realizar cambios de jugadores durante una partida en curso.',
          'Filtración de Contraseñas: Compartir capturas, enlaces o el ID de la sala privada con personas ajenas resultará en descalificación automática del equipo sin derecho a reembolso.',
          'Comportamiento Tóxico: El uso de insultos, "recall spam" malintencionado extremo o agresión verbal en chat global hacia árbitros o rivales resultará en Warning (Advertencia) o descalificación directa.',
        ],
      },
    ],
  },
  ff: {
    title: 'Free Fire',
    subtitle: 'Modalidad Escuadras (Squads - Battle Royale)',
    pdfUrl: '/docs/Bases_FF.pdf',
    pdfName: 'Bases_FF.pdf',
    accent: '#ef54a6',
    badge: 'BATTLE ROYALE SQUADS',
    scoringTable: [
      { pos: '1ro (Booyah!)', pts: '12 pts' },
      { pos: '2do', pts: '9 pts' },
      { pos: '3ro', pts: '8 pts' },
      { pos: '4to', pts: '7 pts' },
      { pos: '5to', pts: '6 pts' },
      { pos: '6to', pts: '5 pts' },
      { pos: '7mo', pts: '4 pts' },
      { pos: '8vo', pts: '3 pts' },
      { pos: '9no', pts: '2 pts' },
      { pos: '10mo a 12vo', pts: '1 pt' },
      { pos: 'Por Asesinato (Kill)', pts: '+1 pt / Kill' },
    ],
    sections: [
      {
        num: '01',
        title: 'Formato del Torneo y Mapas',
        highlight: 'Battle Royale 4 jugadores · Bermuda, Purgatorio y Kalahari · Móviles únicamente',
        points: [
          'Modo de Juego: Battle Royale (Escuadras / 4 jugadores).',
          'Dispositivos: Única y estrictamente dispositivos móviles (celulares o tablets). El uso de emuladores en PC está totalmente prohibido y resultará en descalificación automática.',
          'Mapas Oficiales: Bermuda, Purgatorio y Kalahari (o según rotación oficial indicada por la administración).',
        ],
      },
      {
        num: '02',
        title: 'Inscripciones y Requisitos',
        highlight: '4 titulares obligatorios + 1 suplente opcional · Comunicación oficial por WhatsApp',
        points: [
          'Estructura del Equipo: Cada escuadra debe registrar obligatoriamente a 4 jugadores titulares. Opcionalmente, se permite el registro de 1 jugador suplente.',
          'El Capitán: Será el único medio de comunicación oficial entre administración y equipo. Debe proveer su nombre real, número de WhatsApp y su institución (UNAP u otra).',
          'Validación de Pagos (Yape): La inscripción solo se considerará válida una vez que el pago haya sido verificado. En caso de ganar, el premio será transferido exclusivamente a la cuenta del capitán.',
        ],
      },
      {
        num: '03',
        title: 'Gestión de Salas (Lobby) y Seguridad',
        highlight: 'Envío de ID 15 min antes · 10 min de tolerancia (mín. 3) · Slots asignados',
        points: [
          'Comunicación de Credenciales: El ID y la contraseña de la sala privada se enviarán al grupo VIP de capitanes en WhatsApp 15 minutos antes del inicio de la partida.',
          'Tolerancia y Puntualidad: Se darán exactamente 10 minutos de tolerancia para que los jugadores ingresen. Pasado este tiempo, la partida iniciará. Si un equipo está incompleto, deberá jugar con los integrantes presentes (mínimo 3).',
          'Asignación de Slots: Cada equipo deberá ocupar la casilla (Slot) que la administración le asigne en el grupo de WhatsApp.',
          'Coincidencia de Nicknames e IDs: El ingreso a las salas está reservado exclusivamente para los Nicknames e IDs registrados en la inscripción web. Jugadores no registrados serán expulsados de inmediato.',
          'Uso del Suplente: Solo puede entrar a la sala si un titular presenta fallas técnicas antes del inicio. No se permiten cambios con la partida iniciada.',
        ],
      },
      {
        num: '04',
        title: 'Sistema Oficial de Puntuación',
        highlight: 'Puntaje por posición final (Top) + 1 punto por asesinato (Kill)',
        points: [
          'La clasificación de los equipos se determinará sumando los puntos por posición y los asesinatos confirmados en cada sala jugada.',
          'Criterios de Desempate: En caso de empate en la tabla general, se resolverá por mayor cantidad de Booyahs obtenidos, luego por mayor número de kills totales y finalmente por mejor posición promedio.',
        ],
      },
      {
        num: '05',
        title: 'Conducta y Sanciones (Tolerancia Cero)',
        highlight: 'Reporte de capturas en 10 min · Baneo permanente por hacks · No filtración de claves',
        points: [
          'Reporte Obligatorio de Resultados: El capitán debe subir la captura de pantalla de resultados finales al canal oficial dentro de los 10 minutos posteriores a cada sala.',
          'Filtración de Contraseñas: El capitán es responsable absoluto. Si el ID y clave son compartidos con terceros, la escuadra será descalificada en el acto sin derecho a reembolso.',
          'Uso de Hacks o Alteraciones: El uso de programas de terceros, scripts, antenas o modificaciones al cliente resultará en baneo permanente de futuras ediciones.',
          'Comportamiento Tóxico: Insultos o provocaciones extremas en el chat global de sala serán penalizados con deducción de puntos o expulsión directa.',
        ],
      },
    ],
  },
}

function RulesSection() {
  const { activeGame, setActiveGame } = useRegistration()
  const { games, content } = useTournament()
  const [activeTab, setActiveTab] = useState(() => (activeGame === 'ff' || activeGame === 'mlbb') ? activeGame : 'mlbb')
  const [openIndex, setOpenIndex] = useState(-1)

  useEffect(() => {
    if (activeGame === 'ff' || activeGame === 'mlbb') {
      setActiveTab(activeGame)
    }
  }, [activeGame])

  const base = RULES_DATA[activeTab]
  const remote = games[activeTab]
  const remoteSections = content?.rules?.[activeTab]
  const remotePdf = publicUrl('public-assets', remote?.rules_pdf_path)
  const activeData = {
    ...base,
    title: remote?.name || base.title,
    subtitle: remote?.subtitle || base.subtitle,
    badge: remote?.badge || base.badge,
    scoringTable: remote?.scoring_table?.length ? remote.scoring_table : base.scoringTable,
    sections: remoteSections?.length
      ? remoteSections.map((section, index) => ({ ...section, num: String(index + 1).padStart(2, '0') }))
      : base.sections,
    pdfUrl: remotePdf || base.pdfUrl,
    pdfName: remotePdf ? `Bases_${activeTab === 'mlbb' ? 'MOBA' : 'FF'}.pdf` : base.pdfName,
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setActiveGame(tab)
    setOpenIndex(-1)

  }

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index))
  }

  return (
    <section id="reglamento" className="rules-section" aria-labelledby="rules-title">
      <div className="template-section-title">
        <span>04 / BASES Y NORMATIVA OFICIAL</span>
        <h2 id="rules-title">Reglas claras. <em>Juego limpio.</em></h2>
        <p>Consulta los requisitos y las normas de tu disciplina. También puedes descargar las bases completas.</p>
      </div>

      {/* Selector de Disciplina */}
      <div className="rules-tabs-wrap">
        <div className="rules-tabs">
          <button
            type="button"
            className={`rules-tab ${activeTab === 'mlbb' ? 'rules-tab--active rules-tab--mlbb' : ''}`}
            onClick={() => switchTab('mlbb')}
          >
            <span>MOBILE LEGENDS</span>
            <small>5V5 DRAFT PICK</small>
          </button>
          <button
            type="button"
            className={`rules-tab ${activeTab === 'ff' ? 'rules-tab--active rules-tab--ff' : ''}`}
            onClick={() => switchTab('ff')}
          >
            <span>FREE FIRE</span>
            <small>BATTLE ROYALE SQUADS</small>
          </button>
        </div>
      </div>

      {/* Cabecera contextual del juego activo */}
      <div className="rules-layout">
      <div className={`rules-active-header rules-active-header--${activeTab}`}>
        <CharacterArt character={activeTab === 'mlbb' ? 'obsidia' : 'rafael'} className={`rules-character ${activeTab === 'ff' ? 'rules-character--ff' : ''}`} />
        <div className="active-header-info">
          <span className="active-header-badge" style={{ color: activeData.accent, borderColor: activeData.accent }}>
            {activeData.badge}
          </span>
          <h3>{activeData.title}</h3>
          <p>{activeData.subtitle}</p>
        </div>

        {/* Botón de descarga oficial compacto y elegante */}
        <a
          href={activeData.pdfUrl}
          download={activeData.pdfName}
          className="rules-download-pill"
          style={{ '--btn-accent': activeData.accent }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Descargar {activeData.pdfName}</span>
        </a>
      </div>

      {/* Acordeón con las reglas extraídas de los PDFs */}
      <div className="rules-accordion">
        {activeData.sections.map((section, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={section.title}
              className={`rules-accordion-item ${isOpen ? 'rules-accordion-item--open' : ''}`}
              style={{ '--item-accent': activeData.accent }}
            >
              <button
                type="button"
                className="rules-accordion-header"
                onClick={() => toggleAccordion(index)}
                aria-expanded={isOpen}
              >
                <span className="rules-item-num">{section.num}</span>
                <div className="rules-item-headings">
                  <h3>{section.title}</h3>
                  <p>{section.highlight}</p>
                </div>
                <span className={`rules-chevron ${isOpen ? 'rules-chevron--open' : ''}`}><Icon name="chevron" size={18} /></span>
              </button>
              {isOpen && (
                <div className="rules-accordion-body">
                  <ul className="rules-points-list">
                    {section.points.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>

                  {/* Tabla de puntuación si es Free Fire y la sección 04 */}
                  {activeData.scoringTable?.length > 0 && /puntuaci/i.test(section.title) && (
                    <div className="rules-table-wrap">
                      <div className="rules-table-title">TABLA OFICIAL DE PUNTOS POR SALA</div>
                      <div className="rules-table-grid">
                        {activeData.scoringTable.map((row, rIdx) => (
                          <div key={rIdx} className="rules-table-row">
                            <span className="row-pos">{row.pos}</span>
                            <strong className="row-pts">{row.pts}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      </div>

    </section>
  )
}

export default RulesSection
