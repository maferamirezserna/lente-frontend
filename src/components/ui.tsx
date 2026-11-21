import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
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

// Nombres para mostrar de los tipos de texto de la API (TipoTexto en el backend).
export const TIPO_TEXTO: Record<string, string> = {
  noticia: 'Noticia',
  publicacion: 'Publicación de red social',
  video: 'Video',
  aportado_en_clase: 'Aportado en clase',
}
export const tipoTexto = (t: string) => TIPO_TEXTO[t] || t

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

export function Marca({ tam = 26, a = '/cursos' }: { tam?: number; a?: string }) {
  return (
    <Link to={a} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--tinta)' }}>
      <span style={{ width: tam + 14, height: tam + 14, borderRadius: 12, background: 'var(--cobalto)', borderBottom: '4px solid var(--cobalto-borde)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LupaIcono size={tam - 2} />
      </span>
      <span style={{ fontWeight: 900, fontSize: tam, letterSpacing: -1 }}>lente</span>
    </Link>
  )
}

export function BarraSuperior() {
  const { usuario, salir, supervisado, dejarDeSupervisar } = useSesion()
  const nav = useNavigate()
  const esAdmin = usuario?.rol === 'administrador'
  const tab = ({ isActive }: { isActive: boolean }) => ({
    padding: '10px 16px', borderRadius: 12, textDecoration: 'none', fontWeight: isActive ? 900 : 800, fontSize: 15,
    color: isActive ? 'var(--cobalto-borde)' : 'var(--gris)', background: isActive ? 'var(--hielo)' : 'transparent',
    border: `2px solid ${isActive ? 'var(--celeste-suave)' : 'transparent'}`,
  })
  return (
    <header className="barra-sup" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '14px clamp(16px, 4vw, 40px)', borderBottom: '2px solid var(--borde)', background: '#fff' }}>
      <Marca a={usuario?.rol === 'administrador' ? '/admin' : '/cursos'} />
      <nav aria-label="Secciones" className="barra-sup-nav" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {esAdmin ? (
          <>
            <NavLink to="/admin" style={tab}>Administración</NavLink>
            {supervisado && <NavLink to="/cursos" style={tab}>Cursos</NavLink>}
            {supervisado && <NavLink to="/textos" style={tab}>Biblioteca de textos</NavLink>}
          </>
        ) : (
          <>
            <NavLink to="/cursos" style={tab}>Mis cursos</NavLink>
            <NavLink to="/textos" style={tab}>Biblioteca de textos</NavLink>
          </>
        )}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {DEMO && <span className="chip solo-ancho" style={{ background: '#FFF4E5', color: '#8A4B00' }}>Modo demo</span>}
        {usuario && <div aria-hidden="true" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--celeste-suave)', color: 'var(--cobalto-borde)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15 }}>{iniciales(usuario.nombre.replace(/^Prof\.?\s*/i, ''))}</div>}
        <span className="solo-ancho" style={{ fontWeight: 800, fontSize: 15 }}>{usuario?.nombre}</span>
        <button type="button" className="btn btn-sec btn-peq" onClick={salir}>Salir</button>
      </div>
      {esAdmin && supervisado && (
        <div role="status" style={{ flexBasis: '100%', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px', borderRadius: 14, background: '#FFF4E5', color: '#8A4B00', fontWeight: 800, fontSize: 14 }}>
          <span style={{ flex: '1 1 260px' }}>Modo administrador: estás viendo y editando los módulos de <strong>{supervisado.nombre}</strong>.</span>
          <button type="button" className="btn btn-sec btn-peq" onClick={() => nav('/admin')}>Cambiar de profesor</button>
          <button type="button" className="btn btn-sec btn-peq" onClick={() => { dejarDeSupervisar(); nav('/admin') }}>Terminar</button>
        </div>
      )}
    </header>
  )
}

// Flecha para volver a la pantalla anterior; si no hay historial (p. ej. se abrió el enlace directo), va a `porDefecto`.
// Con `a`, va siempre a esa pantalla (por ejemplo «← Mis cursos»).
export function Volver({ porDefecto = '/cursos', texto = 'Volver', a }: { porDefecto?: string; texto?: string; a?: string }) {
  const nav = useNavigate()
  const ir = () => (a ? nav(a) : window.history.state?.idx > 0 ? nav(-1) : nav(porDefecto))
  return (
    <button type="button" onClick={ir} aria-label={texto} className="btn btn-sec btn-peq" style={{ alignSelf: 'flex-start', gap: 6, color: 'var(--cobalto-borde)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      {texto}
    </button>
  )
}

// Pestañas dentro de un curso (Estudiantes · Textos activos · Panel del curso).
export function PestanasCurso({ id, actual }: { id: string | number; actual: 'estudiantes' | 'panel' }) {
  const estilo = (activa: boolean) => ({
    padding: '10px 16px', borderRadius: 12, textDecoration: 'none', fontWeight: activa ? 900 : 800, fontSize: 15,
    ...(activa
      ? { background: 'var(--cobalto)', color: '#FFFFFF', borderBottom: '4px solid var(--cobalto-borde)' }
      : { color: 'var(--gris)', border: '2px solid var(--borde)', borderBottomWidth: 4 }),
  })
  return (
    <nav aria-label="Secciones del curso" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Link to={`/cursos/${id}`} aria-current={actual === 'estudiantes' ? 'page' : undefined} style={estilo(actual === 'estudiantes')}>Estudiantes</Link>
      <Link to="/textos" style={estilo(false)}>Textos activos</Link>
      <Link to={`/cursos/${id}/panel`} aria-current={actual === 'panel' ? 'page' : undefined} style={estilo(actual === 'panel')}>Panel del curso</Link>
    </nav>
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
