import { useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import RouteScroll from './components/RouteScroll'
import AudioControls from './components/AudioControls'
import ParticleBackground from './components/ParticleBackground'
import RegistrationModal from './components/RegistrationModal'
import SplashScreen from './components/SplashScreen'
import Footer from './components/Footer'
import LiveDock from './components/LiveDock'
import { RegistrationProvider, useRegistration } from './context/RegistrationContext'
import { audio } from './lib/audioEngine'
import { TournamentProvider, useTournament } from './context/TournamentContext'
import { publicUrl } from './lib/tournamentApi'
import './App.css'
import './styles/arena.css'
import './styles/entry.css'
import './styles/content.css'
import './styles/hero-carousel.css'
import './styles/public-data.css'
import './styles/success.css'
import './styles/teams.css'
import './styles/schedule.css'
import './styles/disciplines.css'

const Home = lazy(() => import('./pages/Home'))
const Inscription = lazy(() => import('./pages/Inscription'))
const Teams = lazy(() => import('./pages/Teams'))
const Bracket = lazy(() => import('./pages/Bracket'))
const Schedule = lazy(() => import('./pages/Schedule'))
const PagePlaceholder = lazy(() => import('./pages/PagePlaceholder'))

function AppContent() {
  const [showSplash, setShowSplash] = useState(true)
  const [audioStarted, setAudioStarted] = useState(false)
  const { closeRegistration, isRegistrationOpen, activeGame } = useRegistration()
  const { games } = useTournament()
  const mlbbMusic = games.mlbb.music_path
  const ffMusic = games.ff.music_path

  // Música de fondo de cada juego: el archivo subido desde el panel (Supabase) o, si no hay,
  // /audio/mlbb.mp3 y /audio/ff.mp3 de la carpeta public. Sin archivo, ese juego queda en silencio.
  useEffect(() => {
    let active = true
    const resolve = async (path, fallback) => {
      const remote = publicUrl('public-assets', path)
      if (remote) return remote
      try {
        const res = await fetch(fallback, { method: 'HEAD' })
        return res.ok && (res.headers.get('content-type') || '').startsWith('audio') ? fallback : null
      } catch {
        return null
      }
    }
    Promise.all([resolve(mlbbMusic, '/audio/mlbb.mp3'), resolve(ffMusic, '/audio/ff.mp3')])
      .then(([mlbb, ff]) => { if (active) audio.setTracks({ mlbb, ff }) })
    return () => { active = false }
  }, [mlbbMusic, ffMusic])

  // El tema cambia con el juego elegido (sin elegir, suena el de Mobile Legends).
  useEffect(() => {
    audio.playMusic(activeGame === 'ff' ? 'ff' : 'mlbb')
  }, [activeGame])

  const enterArena = () => {
    audio.start()
    audio.arenaEnter()
    setAudioStarted(true)
    window.setTimeout(() => {
      setShowSplash(false)
      if (window.location.hash) {
        const id = window.location.hash.slice(1)
        const el = document.getElementById(id)
        if (el) {
          window.requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          })
        }
      }
    }, 1050)
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
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home heroEnabled={!showSplash} />} />
            <Route path="/inscripcion" element={<Inscription />} />
            <Route path="/equipos" element={<Teams />} />
            <Route path="/llaves" element={<Bracket />} />
            <Route path="/cronograma" element={<Schedule />} />
            <Route path="*" element={<PagePlaceholder title="Página no encontrada" description="La ruta que buscas no existe en U-Series." kind="not-found" />} />
          </Routes>
        </Suspense>
        <Footer />
        {audioStarted && <AudioControls />}
        {!showSplash && <LiveDock />}
        <RegistrationModal onClose={closeRegistration} open={isRegistrationOpen}>
          <Suspense fallback={null}>
            <Inscription modal />
          </Suspense>
        </RegistrationModal>
      </div>
    </BrowserRouter>
  )
}

function App() {
  return (
    <TournamentProvider>
      <RegistrationProvider>
        <AppContent />
      </RegistrationProvider>
    </TournamentProvider>
  )
}

export default App

