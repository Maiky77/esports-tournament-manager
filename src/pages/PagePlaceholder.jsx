import { Link } from 'react-router-dom'
import { useRegistration } from '../context/RegistrationContext'
import CharacterArt from '../components/CharacterArt'

function PagePlaceholder({ title, description, kind = 'teams' }) {
  const { activeGame, setActiveGame, openRegistration } = useRegistration()
  const game = activeGame === 'ff' ? 'ff' : 'mlbb'
  const isBracket = kind === 'bracket'
  const notFound = kind === 'not-found'

  return (
    <main className="competition-page">
      <header className="competition-heading template-section-title">
        <span>RAGNAROK / {notFound ? 'RUTA NO DISPONIBLE' : isBracket ? 'FIXTURE Y RESULTADOS' : 'LA COMUNIDAD COMPITE'}</span>
        <h1>{title}</h1><p>{description}</p>
      </header>
      {!notFound && (
        <div className="competition-filters" role="group" aria-label="Disciplina del torneo">
          <button type="button" aria-pressed={game === 'mlbb'} onClick={() => setActiveGame('mlbb')}>MOBILE LEGENDS</button>
          <button type="button" aria-pressed={game === 'ff'} onClick={() => setActiveGame('ff')}>FREE FIRE</button>
        </div>
      )}
      <section className="competition-publication" aria-labelledby="publication-title">
        <div className="competition-publication-copy">
          <span className="publication-status"><i />{notFound ? '404 / NO ENCONTRADO' : 'PENDIENTE DE PUBLICACIÓN'}</span>
          <h2 id="publication-title">{notFound ? 'VUELVE A LA ARENA.' : isBracket ? 'LOS CRUCES SE DEFINEN AQUÍ.' : 'TU ESCUADRA TIENE UN LUGAR.'}</h2>
          <p>{notFound ? 'Sigue explorando el evento desde la portada.' : isBracket ? 'Cuando la organización publique el fixture, aquí podrás consultar los encuentros y seguir el avance de la competencia.' : 'Este será el espacio de los equipos confirmados por la organización. Mientras se publica el roster, prepara los datos de tu escuadra.'}</p>
          <div className="competition-actions">
            {!notFound && <button className="hero-btn-primary clip-corner" type="button" onClick={() => openRegistration(game)}>INSCRIBIR A MI EQUIPO <span aria-hidden="true">↗</span></button>}
            <Link className="competition-home-link" to="/">VOLVER AL INICIO <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="competition-publication-art" aria-hidden="true">
          <span className="competition-monogram">{notFound ? '404' : isBracket ? 'VS' : 'TEAM'}</span>
          <CharacterArt character={game === 'ff' ? 'tiradora' : 'marcel'} className="competition-character" />
        </div>
      </section>
      {!notFound && <div className="competition-facts"><span>{game === 'ff' ? 'FREE FIRE / SQUADS' : 'MOBILE LEGENDS / DRAFT PICK'}</span><span>{game === 'ff' ? '4 TITULARES + 1 SUPLENTE OPCIONAL' : '5 TITULARES + HASTA 2 SUPLENTES'}</span><span>PUNO, PERÚ / 2026</span></div>}
    </main>
  )
}

export default PagePlaceholder
