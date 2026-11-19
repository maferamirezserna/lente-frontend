import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './styles.css'
import { SesionProvider, inicioDe, useSesion } from './auth'
import { Cargando } from './components/ui'
import Login, { CambiarClave } from './pages/Login'
import Cursos from './pages/Cursos'
import Estudiantes from './pages/Estudiantes'
import Actividad from './pages/Actividad'
import Textos from './pages/Textos'
import Revision from './pages/Revision'
import Panel from './pages/Panel'
import Admin from './pages/Admin'

// Sin `rol`, cualquier sesión entra. Con `rol`, quien tenga otro rol vuelve a su inicio.
function Privada({ children, rol }: { children: ReactNode; rol?: 'administrador' | 'profesor' }) {
  const { usuario, cargando } = useSesion()
  const loc = useLocation()
  if (cargando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.debe_cambiar_clave && loc.pathname !== '/cambiar-clave') return <Navigate to="/cambiar-clave" replace />
  if (rol && usuario.rol !== rol) return <Navigate to={inicioDe(usuario)} replace />
  return <>{children}</>
}

const Profe = ({ children }: { children: ReactNode }) => <Privada rol="profesor">{children}</Privada>

function App() {
  const { usuario } = useSesion()
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to={inicioDe(usuario)} replace /> : <Login />} />
      <Route path="/cambiar-clave" element={<Privada><CambiarClave /></Privada>} />
      <Route path="/admin" element={<Privada rol="administrador"><Admin /></Privada>} />
      <Route path="/cursos" element={<Profe><Cursos /></Profe>} />
      <Route path="/cursos/:id" element={<Profe><Estudiantes /></Profe>} />
      <Route path="/cursos/:id/panel" element={<Profe><Panel /></Profe>} />
      <Route path="/textos" element={<Profe><Textos /></Profe>} />
      <Route path="/textos/:id" element={<Profe><Revision /></Profe>} />
      <Route path="/actividad/:id" element={<Profe><Actividad /></Profe>} />
      <Route path="*" element={<Navigate to={usuario ? inicioDe(usuario) : '/login'} replace />} />
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
