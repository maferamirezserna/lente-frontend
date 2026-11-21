import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, supervision, token, type Supervisado } from './api/client'
import type { TokenSalida, UsuarioSesion } from './api/types'

interface Sesion {
  usuario: UsuarioSesion | null
  cargando: boolean
  entrar: (usuario: string, clave: string) => Promise<UsuarioSesion>
  salir: () => void
  // Solo administrador: profesor cuyos módulos está viendo y editando
  supervisado: Supervisado | null
  supervisar: (p: Supervisado) => void
  dejarDeSupervisar: () => void
}

const Ctx = createContext<Sesion | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [supervisado, setSupervisado] = useState<Supervisado | null>(() => supervision.leer())

  useEffect(() => {
    if (!token.leer()) { setCargando(false); return }
    api.get<UsuarioSesion>('/auth/yo').then(setUsuario).catch(() => token.borrar()).finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    const vencida = () => setUsuario(null)
    window.addEventListener('lente:sesion-vencida', vencida)
    return () => window.removeEventListener('lente:sesion-vencida', vencida)
  }, [])

  const entrar = useCallback(async (u: string, c: string) => {
    const r = await api.post<TokenSalida>('/auth/login', { usuario: u, clave: c })
    token.guardar(r.access_token)
    setUsuario(r.usuario)
    return r.usuario
  }, [])

  const supervisar = useCallback((p: Supervisado) => { supervision.guardar(p); setSupervisado(p) }, [])
  const dejarDeSupervisar = useCallback(() => { supervision.borrar(); setSupervisado(null) }, [])
  const salir = useCallback(() => { token.borrar(); supervision.borrar(); setSupervisado(null); setUsuario(null) }, [])

  return <Ctx.Provider value={{ usuario, cargando, entrar, salir, supervisado, supervisar, dejarDeSupervisar }}>{children}</Ctx.Provider>
}

// Pantalla de inicio según el rol: el administrador va a su panel; el profe, a sus cursos.
export const inicioDe = (u: UsuarioSesion) => (u.rol === 'administrador' ? '/admin' : '/cursos')

export function useSesion() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useSesion fuera de SesionProvider')
  return s
}
