import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import PagePlaceholder from './pages/PagePlaceholder'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscripcion" element={<PagePlaceholder title="Inscripción" description="El formulario de inscripción se incorporará en la Fase 4." />} />
          <Route path="/equipos" element={<PagePlaceholder title="Equipos confirmados" description="El roster público se incorporará en la Fase 5." />} />
          <Route path="/llaves" element={<PagePlaceholder title="Llaves del torneo" description="La vista del bracket de Challonge se incorporará en la Fase 5." />} />
          <Route path="*" element={<PagePlaceholder title="Página no encontrada" description="La ruta que buscas no existe en U-Series." />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

