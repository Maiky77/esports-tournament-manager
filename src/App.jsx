import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import SplashScreen from './components/SplashScreen'
import Home from './pages/Home'
import Inscription from './pages/Inscription'
import PagePlaceholder from './pages/PagePlaceholder'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="site-background" aria-hidden="true"><div className="site-grid" /></div>
        {showSplash && <SplashScreen onEnter={() => setShowSplash(false)} />}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion" element={<Inscription />} />
          <Route path="/equipos" element={<PagePlaceholder title="Equipos confirmados" description="El roster público se incorporará en la Fase 5." />} />
          <Route path="/llaves" element={<PagePlaceholder title="Llaves del torneo" description="La vista del bracket de Challonge se incorporará en la Fase 5." />} />
          <Route path="*" element={<PagePlaceholder title="Página no encontrada" description="La ruta que buscas no existe en U-Series." />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

