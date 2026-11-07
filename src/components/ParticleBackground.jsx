import { useEffect, useRef } from 'react'
import { useRegistration } from '../context/RegistrationContext'

function ParticleBackground({ active = true }) {
  const canvasRef = useRef(null)
  const { activeGame } = useRegistration()
  const activeGameRef = useRef(activeGame)
  const activeRef = useRef(active)

  useEffect(() => {
    activeGameRef.current = activeGame
  }, [activeGame])

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const context = canvas.getContext('2d', { alpha: true })
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let frame = 0
    let isMobile = false

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      isMobile = width < 768
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    // Reducción calibrada de partículas: 18 en móvil, 34 en escritorio
    const count = width < 768 ? 18 : 34
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      radius: Math.random() * 1.5 + 0.6,
      phase: Math.random() * Math.PI * 2,
      orange: Math.random() > 0.65,
    }))

    const maxDistance = isMobile ? 5200 : 7800

    const draw = (time) => {
      if (!activeRef.current || document.hidden || motionPreference.matches) {
        frame = window.requestAnimationFrame(draw)
        return
      }

      context.clearRect(0, 0, width, height)
      const currentGame = activeGameRef.current

      // 1. Dibujar partículas sin el costoso shadowBlur de software
      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i]
        particle.x += particle.vx + Math.sin(time * 0.00045 + particle.phase) * 0.08
        particle.y += particle.vy
        if (particle.x < -10) particle.x = width + 10
        if (particle.x > width + 10) particle.x = -10
        if (particle.y < -10) particle.y = height + 10
        if (particle.y > height + 10) particle.y = -10

        const color = currentGame === 'ff'
          ? (particle.orange ? '236,74,158' : '205,103,219')
          : currentGame === 'mlbb'
          ? (particle.orange ? '156,99,255' : '191,151,255')
          : (particle.orange ? '236,74,158' : '168,112,255')

        const alpha = 0.3 + (Math.sin(time * 0.002 + particle.phase) + 1) * 0.22

        // Halo suave concéntrico optimizado por GPU (solo en escritorio)
        if (!isMobile) {
          context.beginPath()
          context.fillStyle = `rgba(${color}, ${alpha * 0.22})`
          context.arc(particle.x, particle.y, particle.radius * 2.4, 0, Math.PI * 2)
          context.fill()
        }

        // Núcleo brillante de la partícula
        context.beginPath()
        context.fillStyle = `rgba(${color}, ${alpha})`
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      }

      // 2. Líneas de constelación optimizadas
      const strokePrefix = currentGame === 'ff' ? 'rgba(236,74,158,' : 'rgba(168,112,255,'
      for (let first = 0; first < particles.length; first += 1) {
        const a = particles[first]
        for (let second = first + 1; second < particles.length; second += 1) {
          const b = particles[second]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distance = dx * dx + dy * dy
          if (distance < maxDistance) {
            context.beginPath()
            context.strokeStyle = `${strokePrefix} ${(1 - distance / maxDistance) * 0.1})`
            context.lineWidth = 0.5
            context.moveTo(a.x, a.y)
            context.lineTo(b.x, b.y)
            context.stroke()
          }
        }
      }

      frame = window.requestAnimationFrame(draw)
    }

    frame = window.requestAnimationFrame(draw)

    const handleVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame)
      } else {
        frame = window.requestAnimationFrame(draw)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-background" aria-hidden="true" />
}

export default ParticleBackground
