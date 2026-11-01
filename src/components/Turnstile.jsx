import { useEffect, useRef, useState } from 'react'

let scriptPromise
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve(window.turnstile)
    script.onerror = () => { scriptPromise = null; reject(new Error('No se pudo cargar la verificación. Revisa tu conexión.')) }
    document.head.appendChild(script)
  })
  return scriptPromise
}
export default function Turnstile({ token, onToken }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
  const container = useRef(null)
  const widget = useRef(null)
  const previousToken = useRef('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (!siteKey) return
    let disposed = false
    loadTurnstile().then(api => {
      if (disposed) return
      widget.current = api.render(container.current, {
        sitekey: siteKey, theme: 'dark', size: 'flexible',
        callback: onToken,
        'expired-callback': () => onToken(''),
        'error-callback': () => { onToken(''); setError('No se pudo verificar. Inténtalo de nuevo.') },
      })
    }).catch(e => { if (!disposed) setError(e.message) })
    return () => { disposed = true; if (widget.current !== null) window.turnstile?.remove(widget.current); widget.current = null }
  }, [siteKey, onToken])
  useEffect(() => {
    if (previousToken.current && !token && widget.current !== null) window.turnstile?.reset(widget.current)
    previousToken.current = token
  }, [token])
  if (!siteKey) return null
  return <div className="registration-verification"><div ref={container} />{error && <p role="alert">{error}</p>}</div>
}
