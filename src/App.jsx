import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import SplashScreen from './components/SplashScreen'
import RouteScroll from './components/RouteScroll'
import ParticleBackground from './components/ParticleBackground'
import RegistrationModal from './components/RegistrationModal'
import Footer from './components/Footer'
import { RegistrationProvider, useRegistration } from './context/RegistrationContext'
import Home from './pages/Home'
import Inscription from './pages/Inscription'
import PagePlaceholder from './pages/PagePlaceholder'
import Competition from './pages/Competition'
import Teams from './pages/Teams'
import Bracket from './pages/Bracket'
import { TournamentProvider, useTournament } from './context/TournamentContext'
const Admin = lazy(() => import('./pages/Admin'))
import './App.css'
import './styles/arena.css'
import './styles/entry.css'
import './styles/content.css'
import './styles/hero-carousel.css'
import './styles/public-data.css'
import './styles/backend.css'
import './styles/layout.css'

function AppContent() {
  return <BrowserRouter><AppFrame /></BrowserRouter>
}

function AppFrame() {
  const [showSplash, setShowSplash] = useState(true)
  const { closeRegistration, isRegistrationOpen } = useRegistration()
  const { fromServer } = useTournament()
  const location = useLocation()
  const isAdminRoute = location.pathname === '/admin'
  const enterArena = () => {
    window.setTimeout(() => setShowSplash(false), 850)
  }

  return (
    <>
      <RouteScroll />
      <div className="app-shell">
        <div className="site-background" aria-hidden="true">
          <div className="site-grid" />
          <div className="scanline" />
        </div>
        {!isAdminRoute && <ParticleBackground />}
        {!isAdminRoute && showSplash && <SplashScreen onEnter={enterArena} />}
        {!isAdminRoute && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion" element={<Inscription />} />
          <Route path="/equipos" element={fromServer ? <Teams /> : <Competition kind="teams" />} />
          <Route path="/llaves" element={fromServer ? <Bracket /> : <Competition kind="bracket" />} />
          <Route path="/admin" element={<Suspense fallback={<main className="competition-page" role="status">Cargando panel…</main>}><Admin /></Suspense>} />
          <Route path="*" element={<PagePlaceholder title="Página no encontrada" description="La ruta que buscas no existe en U-Series." kind="not-found" />} />
        </Routes>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <RegistrationModal onClose={closeRegistration} open={isRegistrationOpen}>
            <Inscription modal />
          </RegistrationModal>}
      </div>
    </>
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
