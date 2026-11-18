import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useSesion } from '../auth'
import { DEMO } from '../api/client'

// Colores de categoría (fosforescentes) para cursos y estudiantes. El azul cobalto es la marca.
export const NEON = [
  { fondo: '#2F6BFF', borde: '#1A45C9', texto: '#FFFFFF' },
  { fondo: '#2BEA7C', borde: '#12A856', texto: '#111111' },
  { fondo: '#FFE600', borde: '#D1B800', texto: '#111111' },
  { fondo: '#FF2DAA', borde: '#C9127F', texto: '#111111' },
  { fondo: '#FF7A00', borde: '#CC5A00', texto: '#111111' },
  { fondo: '#00E1FF', borde: '#00A8C2', texto: '#111111' },
]
export const neon = (i: number) => NEON[((i % NEON.length) + NEON.length) % NEON.length]
export const TIPO_PALABRA: Record<string, { nombre: string; fondo: string }> = {
  adjetivo: { nombre: 'Adjetivo', fondo: '#00E1FF' },
  verbo: { nombre: 'Verbo', fondo: '#2BEA7C' },
  expresion: { nombre: 'Expresión', fondo: '#FF2DAA' },
}

export function iniciales(nombre: string) {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export function Avatar({ nombre, i, size = 44 }: { nombre: string; i: number; size?: number }) {
  const c = neon(i)
  return (
    <div aria-hidden="true" style={{ width: size, height: size, borderRadius: '50%', background: c.fondo, color: c.texto, border: `2px solid ${c.borde}`, borderBottomWidth: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: size * 0.34, flexShrink: 0 }}>
      {iniciales(nombre)}
    </div>
  )
}

export function Barra({ etiqueta, valor, color }: { etiqueta: string; valor: number | null; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 100, fontWeight: 800, fontSize: 12.5, color: 'var(--gris)' }}>{etiqueta}</span>
      <div className="barra" role="img" aria-label={`${etiqueta}: ${valor == null ? 'sin datos' : Math.round(valor) + '%'}`}>
        {valor != null && <div style={{ width: `${Math.round(valor)}%`, background: color }} />}
      </div>
      <span style={{ width: 40, textAlign: 'right', fontWeight: 900, fontSize: 12.5 }}>{valor == null ? '—' : `${Math.round(valor)}%`}</span>
    </div>
  )
}

export const AZULES = { macro: '#1A36A8', super: '#2F5BEA', micro: '#9CC3FF' }

export function LupaIcono({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" />
    </svg>
  )
}

export function Marca({ tam = 26 }: { tam?: number }) {
  return (
    <Link to="/cursos" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--tinta)' }}>
      <span style={{ width: tam + 14, height: tam + 14, borderRadius: 12, background: 'var(--cobalto)', borderBottom: '4px solid var(--cobalto-borde)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LupaIcono size={tam - 2} />
      </span>
      <span style={{ fontWeight: 900, fontSize: tam, letterSpacing: -1 }}>lente</span>
    </Link>
  )
}

export function BarraSuperior() {
  const { usuario, salir } = useSesion()
  const tab = ({ isActive }: { isActive: boolean }) => ({
    padding: '10px 16px', borderRadius: 12, textDecoration: 'none', fontWeight: isActive ? 900 : 800, fontSize: 15,
    color: isActive ? 'var(--cobalto-borde)' : 'var(--gris)', background: isActive ? 'var(--hielo)' : 'transparent',
    border: `2px solid ${isActive ? 'var(--celeste-suave)' : 'transparent'}`,
  })
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '14px clamp(16px, 4vw, 40px)', borderBottom: '2px solid var(--borde)', background: '#fff' }}>
      <Marca />
      <nav aria-label="Secciones" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <NavLink to="/cursos" style={tab}>Mis cursos</NavLink>
        <NavLink to="/textos" style={tab}>Biblioteca de textos</NavLink>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {DEMO && <span className="chip" style={{ background: '#FFF4E5', color: '#8A4B00' }}>Modo demo</span>}
        {usuario && <Avatar nombre={usuario.nombre.replace(/^Prof\.?\s*/i, '')} i={0} size={40} />}
        <span style={{ fontWeight: 800, fontSize: 15 }}>{usuario?.nombre}</span>
        <button type="button" className="btn btn-sec btn-peq" onClick={salir}>Salir</button>
      </div>
    </header>
  )
}

export function Pagina({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--fondo)' }}>
      <BarraSuperior />
      <main className="contenedor">{children}</main>
    </div>
  )
}

export function Cargando({ texto = 'Cargando' }: { texto?: string }) {
  return (
    <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 24, fontWeight: 800, color: 'var(--cobalto-borde)' }}>
      <svg className="girar" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cobalto)" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9" /></svg>
      {texto}…
    </div>
  )
}

export function ErrorCaja({ error }: { error: unknown }) {
  if (!error) return null
  const msg = error instanceof Error ? error.message : String(error)
  return <div role="alert" className="aviso aviso-error">{msg}</div>
}

// Carga de datos sencilla con estado de carga y error.
export function useDatos<T>(cargar: () => Promise<T>, deps: unknown[] = []) {
  const [datos, setDatos] = useState<T | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [cargando, setCargando] = useState(true)
  const [n, setN] = useState(0)
  useEffect(() => {
    let vivo = true
    setCargando(true)
    setError(null)
    cargar().then((d) => vivo && setDatos(d)).catch((e) => vivo && setError(e)).finally(() => vivo && setCargando(false))
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n])
  return { datos, error, cargando, recargar: () => setN((x) => x + 1), setDatos }
}

export const pct = (v: number | null | undefined) => (v == null ? null : v <= 1 ? v * 100 : v)
