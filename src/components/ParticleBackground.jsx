import { useEffect, useRef } from 'react'
import { useRegistration } from '../context/RegistrationContext'

function ParticleBackground() {
  const canvasRef = useRef(null)
  const { activeGame } = useRegistration()
  const activeGameRef = useRef(activeGame)

  useEffect(() => {
    activeGameRef.current = activeGame
  }, [activeGame])

  useEffect(() => {
    const canvas = canvasRef.current
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const context = canvas.getContext('2d')
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0
    let frame = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)
    const count = width < 768 ? 38 : 75
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      radius: Math.random() * 1.6 + 0.4,
      phase: Math.random() * Math.PI * 2,
      orange: Math.random() > 0.65,
    }))

    const draw = (time) => {
      context.clearRect(0, 0, width, height)
      const currentGame = activeGameRef.current

      particles.forEach((particle) => {
        particle.x += particle.vx + Math.sin(time * 0.00045 + particle.phase) * 0.08
        particle.y += particle.vy
        if (particle.x < -10) particle.x = width + 10
        if (particle.x > width + 10) particle.x = -10
        if (particle.y < -10) particle.y = height + 10
        if (particle.y > height + 10) particle.y = -10

        let color = '168,112,255'
        if (currentGame === 'ff') {
          color = particle.orange ? '236,74,158' : '205,103,219'
        } else if (currentGame === 'mlbb') {
          color = particle.orange ? '156,99,255' : '191,151,255'
        } else {
          color = particle.orange ? '236,74,158' : '168,112,255'
        }

        const alpha = 0.22 + (Math.sin(time * 0.002 + particle.phase) + 1) * 0.16
        context.beginPath()
        context.fillStyle = `rgba(${color}, ${alpha})`
        context.shadowBlur = 12
        context.shadowColor = `rgba(${color}, 0.75)`
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      })

      context.shadowBlur = 0
      const strokePrefix = currentGame === 'ff' ? 'rgba(236,74,158,' : 'rgba(168,112,255,'

      for (let first = 0; first < particles.length; first += 1) {
        for (let second = first + 1; second < particles.length; second += 1) {
          const a = particles[first]
          const b = particles[second]
          const distance = (a.x - b.x) ** 2 + (a.y - b.y) ** 2
          if (distance < 9200) {
            context.beginPath()
            context.strokeStyle = `${strokePrefix} ${(1 - distance / 9200) * 0.08})`
            context.lineWidth = 0.5
            context.moveTo(a.x, a.y)
            context.lineTo(b.x, b.y)
            context.stroke()
          }
        }
      }
      frame = window.requestAnimationFrame(draw)
    }

    const handleMotionChange = () => {
      window.cancelAnimationFrame(frame)
      if (motionPreference.matches) {
        context.clearRect(0, 0, width, height)
      } else {
        frame = window.requestAnimationFrame(draw)
      }
    }

    motionPreference.addEventListener('change', handleMotionChange)
    handleMotionChange()
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      motionPreference.removeEventListener('change', handleMotionChange)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-background" aria-hidden="true" />
}

export default ParticleBackground
