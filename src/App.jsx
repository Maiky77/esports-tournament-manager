import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import RouteScroll from './components/RouteScroll'
import AudioControls from './components/AudioControls'
import ParticleBackground from './components/ParticleBackground'
import RegistrationModal from './components/RegistrationModal'
import SplashScreen from './components/SplashScreen'
import Footer from './components/Footer'
import { RegistrationProvider, useRegistration } from './context/RegistrationContext'
import { audio } from './lib/audioEngine'
import Home from './pages/Home'
import Inscription from './pages/Inscription'
import PagePlaceholder from './pages/PagePlaceholder'
import './App.css'
import './styles/arena.css'
import './styles/entry.css'
import './styles/content.css'
import './styles/hero-carousel.css'

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
      <RouteScroll />
      <div className="app-shell">
        <div className="site-background" aria-hidden="true">
          <div className="site-grid" />
          <div className="scanline" />
        </div>
        <ParticleBackground />
        {showSplash && <SplashScreen onEnter={enterArena} />}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home heroEnabled={!showSplash} />} />
          <Route path="/inscripcion" element={<Inscription />} />
          <Route path="/equipos" element={<PagePlaceholder title="Equipos confirmados" description="Las escuadras que representarán a su universidad en RAGNAROK U-Series." kind="teams" />} />
          <Route path="/llaves" element={<PagePlaceholder title="Llaves del torneo" description="El camino de cada equipo, desde sus primeros encuentros hasta la definición del torneo." kind="bracket" />} />
          <Route path="*" element={<PagePlaceholder title="Página no encontrada" description="La ruta que buscas no existe en U-Series." kind="not-found" />} />
        </Routes>
        <Footer />
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

