import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, token } from './api/client'
import type { TokenSalida, UsuarioSesion } from './api/types'

interface Sesion {
  usuario: UsuarioSesion | null
  cargando: boolean
  entrar: (usuario: string, clave: string) => Promise<UsuarioSesion>
  salir: () => void
}

const Ctx = createContext<Sesion | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null)
  const [cargando, setCargando] = useState(true)

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

  const salir = useCallback(() => { token.borrar(); setUsuario(null) }, [])

  return <Ctx.Provider value={{ usuario, cargando, entrar, salir }}>{children}</Ctx.Provider>
}

export function useSesion() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useSesion fuera de SesionProvider')
  return s
}
