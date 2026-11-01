import { useEffect, useRef, useState } from 'react'
import CharacterArt from './CharacterArt'

function ArrowIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
}

function SplashScreen({ onEnter }) {
  const [isOpening, setIsOpening] = useState(false)
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
        <img className="entry-logo" src="/images/ragnarok-contexto.png" alt="Ragnarok U-Series, arena universitaria" width="320" height="100" />
        <span className="entry-location">PUNO, PERÚ <i /> TEMPORADA 2026</span>
      </header>

      <div className="entry-content">
        <div className="entry-kicker-row">
          <img className="entry-kicker-game entry-kicker-game--mlbb" src="/img/logomlbb.png" alt="Mobile Legends" />
          <p className="entry-kicker"><span /> EL SIGUIENTE NIVEL ES TUYO</p>
          <img className="entry-kicker-game entry-kicker-game--ff" src="/img/logoffsindondo.png" alt="Free Fire" />
        </div>
        <h1 className="entry-wordmark" id="entry-title">RAGNAROK</h1>
        <div className="entry-series"><span>U-SERIES</span><i /><span className="entry-edition">2026</span></div>
        <p className="entry-tagline">Tu escuadra. Tu universidad. Tu momento.</p>
        <div className="entry-actions">
          <button className="entry-enter-button" ref={enterRef} type="button" onClick={enterArena} disabled={isOpening} aria-busy={isOpening}><span>{isOpening ? 'ENTRANDO A LA ARENA' : 'ENTRAR A LA ARENA'}</span><ArrowIcon /></button>
        </div>
      </div>

      <footer className="entry-footer"><span><i /><i /><i /> DOS DISCIPLINAS. UN MISMO LEGADO.</span><span>RAGNAROK / PUNO 2026</span></footer>
    </div>
  )
}

export default SplashScreen
