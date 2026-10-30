import { useState } from 'react'
import { audio } from '../lib/audioEngine'

function AudioControls() {
  const [muted, setMuted] = useState(audio.muted)
  const [volume, setVolume] = useState(() => Math.round(audio.volume * 100))
  const silent = muted || volume === 0

  const changeVolume = (event) => {
    setVolume(Math.round(audio.setVolume(Number(event.target.value) / 100) * 100))
  }

  const toggleAudio = () => {
    if (volume === 0) setVolume(Math.round(audio.setVolume(0.6) * 100))
    if (volume === 0 && !muted) return
    setMuted(audio.toggleMute())
  }

  return (
    <div className="audio-dock" role="group" aria-label="Audio del evento">
      <button className="audio-control" onClick={toggleAudio} type="button" aria-pressed={silent} aria-label={silent ? 'Activar audio' : 'Silenciar audio'}>
        <span className={`audio-equalizer ${silent ? 'audio-equalizer--muted' : ''}`} aria-hidden="true"><i /><i /><i /><i /></span>
        <span>SONIDO</span>
      </button>
      <input type="range" min="0" max="100" step="5" value={volume} onChange={changeVolume} aria-label="Volumen del audio" aria-valuetext={`${volume} por ciento${muted ? ', silenciado' : ''}`} />
      <span className="audio-value" aria-hidden="true">{muted ? 'OFF' : `${volume}%`}</span>
    </div>
  )
}

export default AudioControls
