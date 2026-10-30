import { useRegistration } from '../context/RegistrationContext'

const steps = [
  { number: '01', title: 'ELIGE TU ARENA', text: 'Mobile Legends o Free Fire. Elige tu disciplina y reúne a los jugadores que representarán a tu universidad.', detail: 'DOS DISCIPLINAS / UN MISMO LEGADO' },
  { number: '02', title: 'REGISTRA TU ESCUADRA', text: 'Completa los datos del capitán, tu institución y el ID de cada jugador. Añade a tus suplentes si tu equipo los necesita.', detail: 'CAPITÁN + ROSTER + UNIVERSIDAD' },
  { number: '03', title: 'PREPARA TU INSCRIPCIÓN', text: 'Revisa el reglamento de tu juego y adjunta el comprobante de pago por Yape para la revisión de la organización.', detail: 'BASES OFICIALES / COMPROBANTE' },
]

function RegistrationSteps() {
  const { openRegistration } = useRegistration()
  return (
    <section className="participation-section" id="como-participar" aria-labelledby="participation-title">
      <div className="template-section-title">
        <span>03 / TU CAMINO A LA ARENA</span>
        <h2 id="participation-title">DE LA ESCUADRA<br /><em>A LA COMPETENCIA.</em></h2>
        <p>Tres pasos para preparar a tu equipo. Ten a mano los datos de tus jugadores y consulta las bases antes de inscribirte.</p>
      </div>
      <div className="participation-grid">
        {steps.map((step) => (
          <article className="participation-step" key={step.number}>
            <span className="participation-number">{step.number}</span>
            <h3>{step.title}</h3><p>{step.text}</p><span className="participation-detail">{step.detail}</span>
          </article>
        ))}
      </div>
      <button className="participation-action" type="button" onClick={() => openRegistration()}>PREPARAR MI INSCRIPCIÓN <span aria-hidden="true">↗</span></button>
    </section>
  )
}

export default RegistrationSteps
