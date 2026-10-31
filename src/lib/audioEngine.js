class AudioEngine {
  constructor() {
    this.context = null
    this.master = null
    this.music = null
    this.sfx = null
    this.muted = false
    this.volume = 0.6
    this.tracks = {}
    this.players = {}
    this.currentGame = null
    this.started = false
  }

  start() {
    this.started = true
    if (this.currentGame) this.playMusic(this.currentGame)
    if (this.context) {
      this.context.resume()
      return
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext
    this.context = new AudioContext()
    this.master = this.context.createGain()
    this.music = this.context.createGain()
    this.sfx = this.context.createGain()

    this.master.gain.value = this.muted ? 0 : this.volume
    this.music.gain.value = 0.18
    this.sfx.gain.value = 0.7
    this.music.connect(this.master)
    this.sfx.connect(this.master)
    this.master.connect(this.context.destination)
  }

  tone(frequency, duration, volume, destination = this.sfx, type = 'sine', delay = 0, slideTo) {
    if (!this.context || this.muted) return
    const start = this.context.currentTime + delay
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, start)
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain).connect(destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.05)
  }

  arenaEnter() {
    this.tone(88, 1.2, 0.36, this.sfx, 'sine', 0, 34)
    this.tone(196, 0.8, 0.09, this.sfx, 'sawtooth', 0.08, 98)
    ;[261.63, 392, 523.25].forEach((note, index) => this.tone(note, 1.1, 0.08, this.sfx, 'triangle', 0.16 + index * 0.06))
  }

  selectGame(game) {
    if (game === 'ff') {
      this.tone(170, 0.1, 0.12, this.sfx, 'square')
      this.tone(1120, 0.28, 0.08, this.sfx, 'sine', 0.1, 820)
      return
    }
    ;[523.25, 783.99, 1046.5].forEach((note, index) => this.tone(note, 0.35, 0.06, this.sfx, 'triangle', index * 0.06))
  }

  modalOpen() {
    this.tone(380, 0.12, 0.07, this.sfx, 'triangle', 0, 720)
  }

  modalClose() {
    this.tone(580, 0.1, 0.05, this.sfx, 'triangle', 0, 260)
  }

  click() {
    this.tone(1400, 0.05, 0.05, this.sfx, 'square')
  }

  setVolume(value) {
    const nextVolume = Number(value)
    if (!Number.isFinite(nextVolume)) return this.volume
    this.volume = Math.min(1, Math.max(0, nextVolume))
    if (this.master && this.context && !this.muted) {
      this.master.gain.setTargetAtTime(this.volume, this.context.currentTime, 0.08)
    }
    this.syncMusicLevel()
    return this.volume
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.context.currentTime, 0.08)
    }
    this.syncMusicLevel()
    return this.muted
  }

  // Nivel de la música: el volumen general por encima de la mezcla de fondo.
  musicLevel() {
    return this.muted ? 0 : this.volume * 0.7
  }

  syncMusicLevel() {
    const player = this.currentGame && this.players[this.currentGame]
    if (player) player.volume = this.musicLevel()
  }

  // Define el archivo de música de cada juego: { mlbb: url, ff: url }. Sin url = silencio para ese juego.
  setTracks(tracks) {
    Object.entries(tracks).forEach(([game, url]) => {
      if (this.tracks[game] === url) return
      this.tracks[game] = url
      const player = this.players[game]
      if (!player) return
      const wasPlaying = !player.paused
      player.pause()
      delete this.players[game]
      if (wasPlaying && this.currentGame === game) this.playMusic(game)
    })
  }

  getPlayer(game) {
    const url = this.tracks[game]
    if (!url) return null
    if (!this.players[game]) {
      const el = new Audio()
      el.loop = true
      el.preload = 'auto'
      el.volume = 0
      el.src = url
      // Si el archivo no existe o no es audio, ese juego queda en silencio sin mostrar errores.
      el.addEventListener('error', () => { if (this.players[game] === el) delete this.players[game] })
      this.players[game] = el
    }
    return this.players[game]
  }

  fade(el, to, ms, onDone) {
    const from = el.volume
    const startedAt = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - startedAt) / ms)
      el.volume = Math.min(1, Math.max(0, from + (to - from) * t))
      if (t < 1) requestAnimationFrame(tick)
      else onDone?.()
    }
    requestAnimationFrame(tick)
  }

  // Cambia la música al tema del juego indicado, con fundido cruzado.
  playMusic(game) {
    this.currentGame = game
    if (!this.started) return
    Object.entries(this.players).forEach(([key, el]) => {
      if (key !== game && !el.paused) this.fade(el, 0, 700, () => el.pause())
    })
    const next = this.getPlayer(game)
    if (!next) return
    if (next.paused) {
      next.volume = 0
      next.play().then(() => this.fade(next, this.musicLevel(), 900)).catch(() => {})
    } else {
      this.fade(next, this.musicLevel(), 400)
    }
  }
}

export const audio = new AudioEngine()

