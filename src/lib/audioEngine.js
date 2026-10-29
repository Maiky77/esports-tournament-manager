class AudioEngine {
  constructor() {
    this.context = null
    this.master = null
    this.music = null
    this.sfx = null
    this.muted = false
    this.stepTimer = null
    this.oscillators = []
  }

  start() {
    if (this.context) {
      this.context.resume()
      return
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext
    this.context = new AudioContext()
    this.master = this.context.createGain()
    this.music = this.context.createGain()
    this.sfx = this.context.createGain()

    this.master.gain.value = 0.48
    this.music.gain.value = 0.16
    this.sfx.gain.value = 0.7
    this.music.connect(this.master)
    this.sfx.connect(this.master)
    this.master.connect(this.context.destination)
    this.startAmbient()
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

  toggleMute() {
    this.muted = !this.muted
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.48, this.context.currentTime, 0.08)
    }
    return this.muted
  }

  startAmbient() {
    if (!this.context) return
    const filter = this.context.createBiquadFilter()
    const padGain = this.context.createGain()
    filter.type = 'lowpass'
    filter.frequency.value = 620
    padGain.gain.value = 0.1
    filter.connect(padGain).connect(this.music)

    ;[65.41, 130.81, 196, 261.63].forEach((frequency, index) => {
      const oscillator = this.context.createOscillator()
      oscillator.type = index % 2 ? 'triangle' : 'sawtooth'
      oscillator.frequency.value = frequency
      oscillator.detune.value = (index - 1.5) * 5
      oscillator.connect(filter)
      oscillator.start()
      this.oscillators.push(oscillator)
    })

    const sequence = [261.63, 329.63, 392, 329.63, 293.66, 392, 440, 392]
    let step = 0
    const playStep = () => {
      if (!this.context) return
      this.tone(sequence[step % sequence.length], 0.23, 0.025, this.music, 'triangle')
      step += 1
      this.stepTimer = window.setTimeout(playStep, 460)
    }
    playStep()
  }
}

export const audio = new AudioEngine()

