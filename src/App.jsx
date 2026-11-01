import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import RouteScroll from './components/RouteScroll'
import ParticleBackground from './components/ParticleBackground'
import RegistrationModal from './components/RegistrationModal'
import Footer from './components/Footer'
import { RegistrationProvider, useRegistration } from './context/RegistrationContext'
import Home from './pages/Home'
import Inscription from './pages/Inscription'
import PagePlaceholder from './pages/PagePlaceholder'
import Competition from './pages/Competition'
const Admin = lazy(() => import('./pages/Admin'))
import './App.css'
import './styles/arena.css'
import './styles/entry.css'
import './styles/content.css'
import './styles/hero-carousel.css'
import './styles/backend.css'
import './styles/layout.css'

function AppContent() {
  const { closeRegistration, isRegistrationOpen } = useRegistration()

  return (
    <BrowserRouter>
      <RouteScroll />
      <div className="app-shell">
        <div className="site-background" aria-hidden="true">
          <div className="site-grid" />
          <div className="scanline" />
        </div>
        <ParticleBackground />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion" element={<Inscription />} />
          <Route path="/equipos" element={<Competition kind="teams" />} />
          <Route path="/llaves" element={<Competition kind="bracket" />} />
          <Route path="/admin" element={<Suspense fallback={<main className="competition-page" role="status">Cargando panel…</main>}><Admin /></Suspense>} />
          <Route path="*" element={<PagePlaceholder title="Página no encontrada" description="La ruta que buscas no existe en U-Series." kind="not-found" />} />
        </Routes>
        <Footer />
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

