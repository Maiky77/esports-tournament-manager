import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function RouteScroll() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const scrollToHash = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            block: 'start',
          })
          return true
        }
        return false
      }

      if (!scrollToHash()) {
        const timer = setTimeout(scrollToHash, 100)
        return () => clearTimeout(timer)
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname, hash])
  return null
}

export default RouteScroll
