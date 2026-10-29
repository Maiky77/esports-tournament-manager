import { createContext, useContext, useEffect, useState } from 'react'
import { audio } from '../lib/audioEngine'

const RegistrationContext = createContext(null)

export function RegistrationProvider({ children }) {
  const [isRegistrationOpen, setRegistrationOpen] = useState(false)
  const [activeGame, setActiveGameState] = useState('all')
  const [registrationGame, setRegistrationGame] = useState('mlbb')

  const applyGameTheme = (game) => {
    document.documentElement.dataset.game = game
    document.documentElement.classList.remove('theme-mlbb', 'theme-ff', 'theme-all')
    document.documentElement.classList.add(`theme-${game}`)
  }

  const setActiveGame = (game) => {
    setActiveGameState(game)
    applyGameTheme(game)
  }

  useEffect(() => {
    applyGameTheme(activeGame)
  }, [])

  const openRegistration = (game) => {
    const targetGame = game === 'ff' || game === 'mlbb' ? game : (activeGame === 'ff' || activeGame === 'mlbb' ? activeGame : 'mlbb')
    setRegistrationGame(targetGame)
    setActiveGame(targetGame)
    setRegistrationOpen(true)
    audio.modalOpen()
  }

  const closeRegistration = () => {
    setRegistrationOpen(false)
    audio.modalClose()
  }

  return (
    <RegistrationContext.Provider
      value={{
        isRegistrationOpen,
        activeGame,
        registrationGame,
        setActiveGame,
        openRegistration,
        closeRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const context = useContext(RegistrationContext)
  if (!context) throw new Error('useRegistration debe usarse dentro de RegistrationProvider')
  return context
}
