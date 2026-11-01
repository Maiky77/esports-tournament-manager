import { useEffect, useRef } from 'react'

function RegistrationModal({ children, onClose, open }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const focusable = () => [...dialogRef.current.querySelectorAll('button, input, select, textarea, a[href]')].filter(element => !element.matches(':disabled') && element.getClientRects().length)
    focusable()[0]?.focus({ preventScroll: true })
    const handleKeyDown = event => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); return }
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0], last = elements[elements.length - 1]
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="registration-modal-backdrop anim-backdrop"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        className="registration-modal anim-modal clip-corner"
        ref={dialogRef}
        aria-modal="true"
        role="dialog"
        aria-label="Inscripción de equipo"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="registration-modal-stripe" />
        <button
          className="registration-modal-close"
          onClick={onClose}
          type="button"
          aria-label="Cerrar inscripción"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </section>
    </div>
  )
}

export default RegistrationModal
