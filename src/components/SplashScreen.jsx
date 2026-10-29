import { useState } from 'react'

function SplashScreen({ onEnter }) {
  const [isOpening, setIsOpening] = useState(false)

  const enterArena = () => {
    setIsOpening(true)
    onEnter()
  }

  return (
    <div className={`splash-screen ${isOpening ? 'splash-screen--opening' : ''}`}>
      <div className="splash-panel splash-panel--mlbb">
        <img src="/images/mlbb.jpg" alt="" />
        <div className="splash-panel-copy splash-panel-copy--left">
          <span>DIVISIÓN 5V5</span>
          <strong>MLBB</strong>
          <small>Mobile Legends: Bang Bang</small>
        </div>
      </div>
      <div className="splash-panel splash-panel--ff">
        <img src="/images/free-fire.jpg" alt="" />
        <div className="splash-panel-copy splash-panel-copy--right">
          <span>DIVISIÓN BATTLE ROYALE</span>
          <strong>FREE FIRE</strong>
          <small>Escuadras universitarias</small>
        </div>
      </div>
      <div className="splash-seam" />
      <div className="splash-content">
        <p className="splash-kicker">PUNO · TEMPORADA 2026</p>
        <h1>RAGNAROK</h1>
        <p className="splash-series">U-SERIES // ARENA UNIVERSITARIA</p>
        <button type="button" onClick={enterArena}>ENTRAR A LA ARENA <span>→</span></button>
      </div>
    </div>
  )
}

export default SplashScreen

