import { useState } from 'react'
import { audio } from '../lib/audioEngine'

function AudioControls() {
  const [muted, setMuted] = useState(false)

  const toggleAudio = () => {
    setMuted(audio.toggleMute())
  }

  return (
    <button className="audio-control" onClick={toggleAudio} type="button">
      <span className={muted ? '' : 'audio-control__bars'} aria-hidden="true">{muted ? '×' : '♫'}</span>
      {muted ? 'AUDIO OFF' : 'AUDIO ON'}
    </button>
  )
}

export default AudioControls

