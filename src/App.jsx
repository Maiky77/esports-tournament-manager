import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import AudioControls from './components/AudioControls'
import ParticleBackground from './components/ParticleBackground'
import RegistrationModal from './components/RegistrationModal'
import SplashScreen from './components/SplashScreen'
import { RegistrationProvider, useRegistration } from './context/RegistrationContext'
import { audio } from './lib/audioEngine'
import Home from './pages/Home'
import Inscription from './pages/Inscription'
import PagePlaceholder from './pages/PagePlaceholder'
import './App.css'

function AppContent() {
  const [showSplash, setShowSplash] = useState(true)
  const [audioStarted, setAudioStarted] = useState(false)
  const { closeRegistration, isRegistrationOpen } = useRegistration()

  const enterArena = () => {
    audio.start()
    audio.arenaEnter()
    setAudioStarted(true)
    window.setTimeout(() => setShowSplash(false), 850)
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="site-background" aria-hidden="true">
          <div className="site-grid" />
          <div className="scanline" />
        </div>
        <ParticleBackground />
        {showSplash && <SplashScreen onEnter={enterArena} />}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion" element={<Inscription />} />
          <Route path="/equipos" element={<PagePlaceholder title="Equipos confirmados" description="El roster público se incorporará en la Fase 5." />} />
          <Route path="/llaves" element={<PagePlaceholder title="Llaves del torneo" description="La vista del bracket de Challonge se incorporará en la Fase 5." />} />
          <Route path="*" element={<PagePlaceholder title="Página no encontrada" description="La ruta que buscas no existe en U-Series." />} />
        </Routes>
        {audioStarted && <AudioControls />}
        <RegistrationModal onClose={closeRegistration} open={isRegistrationOpen}>
          <Inscription modal />
        </RegistrationModal>
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <RegistrationProvider>
      <AppContent />
    </RegistrationProvider>
  )
}

export default App

