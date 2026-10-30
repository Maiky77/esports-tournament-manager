import { useEffect, useRef, useState } from 'react'
import { useRegistration } from '../context/RegistrationContext'
import CharacterArt from './CharacterArt'

function ArrowIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
}

function SplashScreen({ onEnter }) {
  const [isOpening, setIsOpening] = useState(false)
  const { activeGame, setActiveGame } = useRegistration()
  const screenRef = useRef(null)
  const enterRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    enterRef.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus({ preventScroll: true })
    }
  }, [])

  const enterArena = () => {
    if (isOpening) return
    setIsOpening(true)
    onEnter()
  }

  const containFocus = (event) => {
    if (event.key !== 'Tab') return
    const buttons = [...screenRef.current.querySelectorAll('button:not(:disabled)')]
    if (!buttons.length) return
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className={`splash-screen arena-entry ${isOpening ? 'arena-entry--opening' : ''}`} ref={screenRef} role="dialog" aria-modal="true" aria-labelledby="entry-title" onKeyDown={containFocus}>
      <div className="entry-art" aria-hidden="true">
        <div className="entry-scene entry-scene--mlbb">
          <img className="entry-background" src="/img/hero-mlbb.jpg" alt="" width="2560" height="1440" decoding="async" />
          <CharacterArt character="hirara" className="entry-character entry-character--mlbb" priority />
        </div>
        <div className="entry-scene entry-scene--ff">
          <img className="entry-background" src="/img/hero-ff.jpg" alt="" width="1920" height="1080" decoding="async" />
          <CharacterArt character="tiradora" className="entry-character entry-character--ff" priority />
        </div>
        <div className="entry-shade" />
        <div className="entry-axis" />
        <div className="entry-grid" />
      </div>

      <header className="entry-topline">
        <div className="entry-brand"><span className="entry-brand-mark" aria-hidden="true">R//</span><span>U-SERIES<span className="entry-brand-caption">ARENA UNIVERSITARIA</span></span></div>
        <span className="entry-location">PUNO, PERÚ <i /> TEMPORADA 2026</span>
      </header>

      <div className="entry-content">
        <p className="entry-kicker"><span /> EL SIGUIENTE NIVEL ES TUYO</p>
        <h1 className="entry-wordmark" id="entry-title">RAGNAROK</h1>
        <div className="entry-series"><span>U-SERIES</span><i /><span className="entry-edition">2026</span></div>
        <p className="entry-tagline">Tu escuadra. Tu universidad. Tu momento.</p>

        <div className="entry-divisions" role="group" aria-label="Elige tu disciplina">
          <button type="button" className="entry-division entry-division--mlbb" aria-pressed={activeGame === 'mlbb'} onClick={() => setActiveGame('mlbb')} disabled={isOpening}>
            <span className="entry-division-index">01</span><span className="entry-division-copy"><strong>Mobile Legends</strong><small>5V5 · DRAFT PICK</small></span><ArrowIcon />
          </button>
          <button type="button" className="entry-division entry-division--ff" aria-pressed={activeGame === 'ff'} onClick={() => setActiveGame('ff')} disabled={isOpening}>
            <span className="entry-division-index">02</span><span className="entry-division-copy"><strong>Free Fire</strong><small>SQUADS · BATTLE ROYALE</small></span><ArrowIcon />
          </button>
        </div>

        <div className="entry-actions">
          <button className="entry-enter-button" ref={enterRef} type="button" onClick={enterArena} disabled={isOpening} aria-busy={isOpening}><span>{isOpening ? 'ENTRANDO A LA ARENA' : 'ENTRAR A LA ARENA'}</span><ArrowIcon /></button>
          <span className="entry-sound-note"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></svg> EXPERIENCIA CON AUDIO</span>
        </div>
      </div>

      <footer className="entry-footer"><span><i /><i /><i /> DOS DISCIPLINAS. UN MISMO LEGADO.</span><span>RAGNAROK / PUNO 2026</span></footer>
    </div>
  )
}

export default SplashScreen
