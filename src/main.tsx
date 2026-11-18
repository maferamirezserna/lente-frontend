import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './styles.css'
import { SesionProvider, useSesion } from './auth'
import { Cargando } from './components/ui'
import Login, { CambiarClave } from './pages/Login'
import Cursos from './pages/Cursos'
import Estudiantes from './pages/Estudiantes'
import Actividad from './pages/Actividad'
import Textos, { Revision } from './pages/Textos'
import Panel from './pages/Panel'

function Privada({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useSesion()
  const loc = useLocation()
  if (cargando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.debe_cambiar_clave && loc.pathname !== '/cambiar-clave') return <Navigate to="/cambiar-clave" replace />
  return <>{children}</>
}

function App() {
  const { usuario } = useSesion()
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/cursos" replace /> : <Login />} />
      <Route path="/cambiar-clave" element={<Privada><CambiarClave /></Privada>} />
      <Route path="/cursos" element={<Privada><Cursos /></Privada>} />
      <Route path="/cursos/:id" element={<Privada><Estudiantes /></Privada>} />
      <Route path="/cursos/:id/panel" element={<Privada><Panel /></Privada>} />
      <Route path="/textos" element={<Privada><Textos /></Privada>} />
      <Route path="/textos/:id" element={<Privada><Revision /></Privada>} />
      <Route path="/actividad/:id" element={<Privada><Actividad /></Privada>} />
      <Route path="*" element={<Navigate to="/cursos" replace />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider><App /></SesionProvider>
    </BrowserRouter>
  </StrictMode>,
)
