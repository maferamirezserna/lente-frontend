// Único módulo que habla con la API: agrega el token, maneja el 401 y traduce errores.
import { demoRequest } from './demo'

const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
export const DEMO = import.meta.env.VITE_DEMO === '1'
const CLAVE_TOKEN = 'lente_token'
const CLAVE_SUPERVISION = 'lente_supervision'

export class ApiError extends Error {
  status: number
  campo?: string
  constructor(status: number, mensaje: string, campo?: string) {
    super(mensaje)
    this.status = status
    this.campo = campo
  }
}

// sessionStorage: los computadores del colegio son compartidos (guía del backend).
export const token = {
  leer: () => { try { return sessionStorage.getItem(CLAVE_TOKEN) } catch { return null } },
  guardar: (t: string) => { try { sessionStorage.setItem(CLAVE_TOKEN, t) } catch { /* sin almacenamiento */ } },
  borrar: () => { try { sessionStorage.removeItem(CLAVE_TOKEN) } catch { /* sin almacenamiento */ } },
}

// Administrador en modo supervisión: trabaja en los módulos de un profesor (cabecera X-Como-Profesor).
// El backend ignora la cabecera si quien la envía es un profesor.
export interface Supervisado { id: number; nombre: string }
export const supervision = {
  leer: (): Supervisado | null => { try { const v = sessionStorage.getItem(CLAVE_SUPERVISION); return v ? JSON.parse(v) : null } catch { return null } },
  guardar: (p: Supervisado) => { try { sessionStorage.setItem(CLAVE_SUPERVISION, JSON.stringify(p)) } catch { /* sin almacenamiento */ } },
  borrar: () => { try { sessionStorage.removeItem(CLAVE_SUPERVISION) } catch { /* sin almacenamiento */ } },
}

function mensajeDeError(status: number, data: unknown): { mensaje: string; campo?: string } {
  const detail = (data as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return { mensaje: detail }
  if (Array.isArray(detail) && detail.length) {
    const d = detail[0] as { msg?: string; loc?: (string | number)[] }
    const campo = d.loc ? String(d.loc[d.loc.length - 1]) : undefined
    return { mensaje: d.msg || 'Revisa los datos.', campo }
  }
  if (status === 404) return { mensaje: 'No encontrado.' }
  if (status >= 500) return { mensaje: 'El servidor tuvo un problema. Intenta de nuevo en un momento.' }
  return { mensaje: 'Algo salió mal. Intenta de nuevo.' }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (DEMO) return demoRequest<T>(method, path, body)
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const t = token.leer()
  if (t) headers.Authorization = `Bearer ${t}`
  const s = supervision.leer()
  if (s) headers['X-Como-Profesor'] = String(s.id)
  let res: Response
  try {
    res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor. Revisa la VPN o la red de la universidad.')
  }
  if (res.status === 204) return undefined as T
  let data: unknown = null
  try { data = await res.json() } catch { /* respuesta sin cuerpo */ }
  if (!res.ok) {
    const { mensaje, campo } = mensajeDeError(res.status, data)
    if (res.status === 401 && path !== '/auth/login') {
      token.borrar()
      window.dispatchEvent(new Event('lente:sesion-vencida'))
    }
    throw new ApiError(res.status, mensaje, campo)
  }
  return data as T
}

export const api = {
  get: <T>(p: string) => request<T>('GET', p),
  post: <T>(p: string, b?: unknown) => request<T>('POST', p, b ?? {}),
  patch: <T>(p: string, b: unknown) => request<T>('PATCH', p, b),
  put: <T>(p: string, b: unknown) => request<T>('PUT', p, b),
  del: <T>(p: string) => request<T>('DELETE', p),
}

// Código único por respuesta: si la red falla se reintenta con el MISMO código (sin duplicados).
export function nuevoCodigo(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export const ahora = () => new Date().toISOString()
