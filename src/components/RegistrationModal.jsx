import { useEffect } from 'react'
import { audio } from '../lib/audioEngine'

function RegistrationModal({ children, onClose, open }) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="registration-modal-backdrop anim-backdrop"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        className="registration-modal anim-modal clip-corner"
        aria-modal="true"
        role="dialog"
        aria-label="Inscripción de escuadra"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="registration-modal-stripe" />
        <button
          className="registration-modal-close"
          onClick={() => {
            audio.click()
            onClose()
          }}
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
