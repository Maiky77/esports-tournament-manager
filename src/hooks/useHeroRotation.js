import { useEffect, useRef, useState } from 'react'

export const HERO_ROTATION_DELAY = 6000

function useHeroRotation(preferredGame, enabled = true) {
  const [game, setGame] = useState(() => preferredGame === 'ff' ? 'ff' : 'mlbb')
  const [autoplay, setAutoplay] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden')
  const [inView, setInView] = useState(true)
  const [selection, setSelection] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    if (preferredGame === 'mlbb' || preferredGame === 'ff') {
      setGame(preferredGame)
      setSelection((previous) => previous + 1)
    }
  }, [preferredGame])

  useEffect(() => {
    const onVisibility = () => setPageVisible(document.visibilityState !== 'hidden')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = () => {
      if (motion.matches) setAutoplay(false)
    }
    document.addEventListener('visibilitychange', onVisibility)
    motion.addEventListener('change', onMotionChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      motion.removeEventListener('change', onMotionChange)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!enabled || !autoplay || !pageVisible || !inView) return
    const timer = window.setTimeout(() => setGame((current) => current === 'mlbb' ? 'ff' : 'mlbb'), HERO_ROTATION_DELAY)
    return () => window.clearTimeout(timer)
  }, [enabled, autoplay, pageVisible, inView, game, selection])

  const selectGame = (nextGame) => {
    setGame(nextGame)
    setSelection((previous) => previous + 1)
  }

  return { game, autoplay, selectGame, toggleAutoplay: () => setAutoplay((current) => !current), containerRef }
}

export default useHeroRotation
