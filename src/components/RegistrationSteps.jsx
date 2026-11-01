import { useRegistration } from '../context/RegistrationContext'
import Icon from './Icon'
import YapePayment from './YapePayment'

const steps = [
  { number: '01', title: 'Arma tu escuadra', text: 'Elige MLBB o Free Fire y reúne a los titulares y suplentes de tu universidad.' },
  { number: '02', title: 'Registra a tus jugadores', text: 'Completa los datos del capitán, institución, nicknames e IDs del roster.' },
  { number: '03', title: 'Yapea y envía el comprobante', text: 'Paga la tarifa de tu disciplina y adjunta la captura. Tu equipo aparecerá cuando se apruebe el pago.' },
]
export default function RegistrationSteps() {
  const { openRegistration } = useRegistration()
  return <section className="participation-section" id="como-participar" aria-labelledby="participation-title">
    <div className="template-section-title"><span>03 / INSCRIPCIÓN Y PAGO</span><h2 id="participation-title">Tu equipo, <em>en tres pasos.</em></h2><p>Ten a mano los datos del roster y el comprobante de pago por Yape.</p></div>
    <div className="participation-layout"><div className="participation-guide"><ol className="participation-grid">{steps.map(step => <li className="participation-step" key={step.number}><span className="participation-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol><button className="participation-action" type="button" onClick={() => openRegistration()}>INICIAR MI INSCRIPCIÓN <Icon name="arrow-up-right" /></button></div><YapePayment /></div>
  </section>
}
