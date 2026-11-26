import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Curso, TextoEnCurso, TextoResumen } from '../api/types'
import { Cargando, Confirmar, ErrorCaja, Pagina, Volver, useDatos } from '../components/ui'

// Biblioteca de textos según docs/diseno/mockups/Mock-Textos.html.

const ESTADOS: Record<string, { nombre: string; fondo: string; texto: string }> = {
  borrador: { nombre: 'Borrador', fondo: '#F3F4F6', texto: '#4B5563' },
  preparando: { nombre: 'Preparando', fondo: '#EEF3FF', texto: '#1A36A8' },
  en_revision: { nombre: 'En revisión', fondo: '#FFF4E5', texto: '#8A4B00' },
  aprobado: { nombre: 'Aprobado', fondo: '#D9F7E3', texto: '#145A2E' },
  archivado: { nombre: 'Archivado', fondo: '#F3F4F6', texto: '#6B7280' },
}
const ORDEN_FILTROS = ['borrador', 'preparando', 'en_revision', 'aprobado', 'archivado']

function Girando({ color = '#1A36A8' }: { color?: string }) {
  return <svg className="girar" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9" /></svg>
}

export const Estado = ({ e }: { e: string }) => {
  const s = ESTADOS[e] || ESTADOS.borrador
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: s.fondo, color: s.texto, fontWeight: 900, fontSize: 12.5 }}>
      {e === 'preparando' && <Girando color={s.texto} />}{s.nombre}
    </span>
  )
}

// Ícono y color por tipo de texto (los colores fosforescentes son de categoría).
const ICONOS: Record<string, { nombre: string; fondo: string; trazo: string; d: string }> = {
  noticia: { nombre: 'Noticia', fondo: '#2F6BFF', trazo: '#FFFFFF', d: 'M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5' },
  video: { nombre: 'Video', fondo: '#FF2DAA', trazo: '#111111', d: 'M4 6h12v12H4zM16 10l4-2v8l-4-2' },
  publicacion: { nombre: 'Publicación', fondo: '#FF7A00', trazo: '#111111', d: 'M5 4h14v12H9l-4 4z' },
  aportado_en_clase: { nombre: 'Aportado en clase', fondo: '#2BEA7C', trazo: '#111111', d: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3' },
}
function TipoIcono({ tipo }: { tipo: string }) {
  const t = ICONOS[tipo] || { ...ICONOS.noticia, nombre: tipo }
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13, color: 'var(--tinta)' }}>
      <span style={{ width: 36, height: 36, borderRadius: 12, background: t.fondo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.trazo} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={t.d} /></svg>
      </span>
      {t.nombre}
    </span>
  )
}

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
const lista = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`)

// En qué cursos está activo cada texto (GET /cursos y GET /cursos/{id}/textos).
function useActivosPorTexto(cursos: Curso[] | null, version: number) {
  const [mapa, setMapa] = useState<Record<number, string[]>>({})
  useEffect(() => {
    if (!cursos) return
    let vivo = true
    Promise.all(cursos.map((c) => api.get<TextoEnCurso[]>(`/cursos/${c.id}/textos`).then((ts) => ({ c, ts })).catch(() => ({ c, ts: [] as TextoEnCurso[] }))))
      .then((res) => {
        if (!vivo) return
        const m: Record<number, string[]> = {}
        for (const { c, ts } of res) for (const t of ts) if (t.activo) (m[t.id] ||= []).push(c.nombre)
        setMapa(m)
      })
    return () => { vivo = false }
  }, [cursos, version])
  return mapa
}

const botonTarjeta = { minHeight: 48, borderRadius: 14, fontSize: 14, letterSpacing: 0.5, width: '100%' } as const

function ActivarEnCurso({ texto, cursos, activos, alCambiar }: { texto: TextoResumen; cursos: Curso[]; activos: string[]; alCambiar: () => void }) {
  const [abierto, setAbierto] = useState(false)
  const [ocupado, setOcupado] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)

  async function activar(c: Curso) {
    setOcupado(c.id)
    setError(null)
    try {
      await api.post(`/cursos/${c.id}/textos`, { texto_id: texto.id })
      alCambiar()
    } catch (e) { setError(e) } finally { setOcupado(null) }
  }

  if (!abierto) return <button type="button" className="btn btn-sec" onClick={() => setAbierto(true)} style={{ ...botonTarjeta, color: 'var(--tinta)', borderColor: 'var(--borde)' }}>ACTIVAR EN UN CURSO</button>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {cursos.map((c) => {
        const ya = activos.includes(c.nombre)
        return (
          <button key={c.id} type="button" className="btn btn-sec btn-peq" disabled={ya || ocupado != null} onClick={() => activar(c)}>
            {ya ? `Ya está activo en ${c.nombre}` : ocupado === c.id ? 'Activando…' : `Activar en ${c.nombre}`}
          </button>
        )
      })}
      <ErrorCaja error={error} />
      <button type="button" onClick={() => setAbierto(false)} style={{ border: 0, background: 'transparent', color: 'var(--gris)', fontWeight: 800, cursor: 'pointer', font: 'inherit' }}>Cerrar</button>
    </div>
  )
}

function Tarjeta({ t, i, activos, cursos, alCambiar }: { t: TextoResumen; i: number; activos: string[]; cursos: Curso[]; alCambiar: () => void }) {
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState<unknown>(null)

  async function preparar() {
    setOcupado(true)
    setError(null)
    try { await api.post(`/textos/${t.id}/preparar`); alCambiar() } catch (e) { setError(e) } finally { setOcupado(false) }
  }

  // Borrar definitivamente, después de confirmar. Si ya lo usaron estudiantes, el backend
  // responde 409 y se ofrece archivarlo (deja de verse en clase, pero se conserva el historial).
  const [confirmando, setConfirmando] = useState<'borrar' | 'archivar' | null>(null)

  async function borrar() {
    setOcupado(true)
    setError(null)
    try {
      await api.del(`/textos/${t.id}/definitivo`)
      setConfirmando(null)
      alCambiar()
    } catch (e) {
      if ((e as { status?: number }).status === 409 && t.estado !== 'archivado' && t.estado !== 'preparando') setConfirmando('archivar')
      else { setConfirmando(null); setError(e) }
    } finally { setOcupado(false) }
  }

  async function archivar() {
    setOcupado(true)
    setError(null)
    try { await api.del(`/textos/${t.id}`); setConfirmando(null); alCambiar() } catch (e) { setConfirmando(null); setError(e) } finally { setOcupado(false) }
  }

  const detalle =
    t.estado === 'aprobado' ? (activos.length ? `Activo en ${lista(activos)}` : 'Aún no está activo en ningún curso')
    : t.estado === 'en_revision' ? (t.preparado_por_ia ? 'La IA ya propuso el análisis' : 'Listo para revisar')
    : t.estado === 'preparando' ? 'La IA está trabajando'
    : t.estado === 'borrador' ? 'Falta enviarlo a la IA'
    : 'Ya no se usa en clase'

  let accion: ReactNode
  if (t.estado === 'aprobado') accion = <ActivarEnCurso texto={t} cursos={cursos} activos={activos} alCambiar={alCambiar} />
  else if (t.estado === 'en_revision') accion = <Link to={`/textos/${t.id}`} className="btn" style={botonTarjeta}>REVISAR Y APROBAR</Link>
  else if (t.estado === 'preparando') accion = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'var(--hielo)' }}>
      <svg className="lupa-vaiven" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2F5BEA" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--cobalto-borde)' }}>Revisando la noticia…</span>
    </div>
  )
  else if (t.estado === 'borrador') accion = <button type="button" className="btn btn-sec" disabled={ocupado} onClick={preparar} style={botonTarjeta}>{ocupado ? 'ENVIANDO…' : 'PREPARAR CON IA'}</button>
  else accion = <Link to={`/textos/${t.id}`} className="btn btn-sec" style={{ ...botonTarjeta, color: 'var(--gris)', borderColor: 'var(--borde)', borderStyle: 'dashed' }}>Ver texto</Link>

  return (
    <article className="card tarjeta-curso aparecer" style={{ animationDelay: `${i * 60}ms`, minWidth: 0, borderRadius: 22, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, opacity: t.estado === 'archivado' ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <TipoIcono tipo={t.tipo} />
        <Estado e={t.estado} />
      </div>
      <Link to={`/textos/${t.id}`} style={{ fontWeight: 900, fontSize: 19, lineHeight: 1.25, color: 'var(--tinta)', textDecoration: 'none' }}>{t.titulo}</Link>
      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gris-claro)' }}>{t.fuente || 'Sin fuente'} · {fecha(t.creado_en)} · {detalle}</span>
      <ErrorCaja error={error} />
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {accion}
        {t.estado !== 'preparando' && (
          <button type="button" disabled={ocupado} onClick={() => { setError(null); setConfirmando('borrar') }} aria-label={`Borrar ${t.titulo}`}
            style={{ alignSelf: 'center', background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', fontWeight: 800, fontSize: 13, color: '#C0392B', textDecoration: 'underline' }}>
            Borrar noticia
          </button>
        )}
      </div>
      <Confirmar abierto={confirmando === 'borrar'} peligro titulo="¿Seguro que quieres borrar esta noticia?"
        si="Sí, borrarla" no="No, conservarla" ocupado={ocupado} onSi={borrar} onNo={() => setConfirmando(null)}>
        <p style={{ margin: 0 }}><strong>«{t.titulo}»</strong> se quitará de tu biblioteca junto con lo que preparó la IA: la idea principal, las preguntas y las palabras.</p>
        <p style={{ margin: '8px 0 0' }}>Esta acción no se puede deshacer.</p>
      </Confirmar>
      <Confirmar abierto={confirmando === 'archivar'} titulo="Tus estudiantes ya trabajaron con esta noticia"
        si="Sí, archivarla" no="Cancelar" ocupado={ocupado} onSi={archivar} onNo={() => setConfirmando(null)}>
        <p style={{ margin: 0 }}>Por eso no se puede borrar: se perderían sus resultados.</p>
        <p style={{ margin: '8px 0 0' }}>¿Quieres <strong>archivarla</strong>? Dejará de aparecer en clase, pero el historial de tus estudiantes se conserva.</p>
      </Confirmar>
    </article>
  )
}

export default function Textos() {
  const textos = useDatos(() => api.get<TextoResumen[]>('/textos'))
  const cursos = useDatos(() => api.get<Curso[]>('/cursos'))
  const [version, setVersion] = useState(0)
  const activos = useActivosPorTexto(cursos.datos, version)
  const [nuevo, setNuevo] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  // Mientras alguno esté "preparando", revisar cada 10 s.
  const preparando = textos.datos?.some((t) => t.estado === 'preparando')
  useEffect(() => {
    if (!preparando) return
    const t = setInterval(() => api.get<TextoResumen[]>('/textos').then(textos.setDatos).catch(() => {}), 10000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preparando])

  const todos = textos.datos || []
  const cuenta = useMemo(() => Object.fromEntries(ORDEN_FILTROS.map((e) => [e, todos.filter((t) => t.estado === e).length])), [todos])
  const visibles = todos.filter((t) => filtro === 'todos' || t.estado === filtro)
  const alCambiar = () => { textos.recargar(); setVersion((v) => v + 1) }

  const filtroBoton = (clave: string, etiqueta: string, n: number) => {
    const on = filtro === clave
    return (
      <button key={clave} type="button" aria-pressed={on} onClick={() => setFiltro(clave)} style={{ padding: '8px 14px', minHeight: 40, borderRadius: 999, border: `2px solid ${on ? 'var(--cobalto)' : 'var(--borde)'}`, background: on ? 'var(--cobalto)' : '#FFFFFF', color: on ? '#FFFFFF' : 'var(--gris)', font: 'inherit', fontWeight: on ? 900 : 800, fontSize: 14, cursor: 'pointer' }}>
        {etiqueta} · {n}
      </button>
    )
  }

  return (
    <Pagina>
      <Volver />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 36 }}>Biblioteca de textos</h1>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gris)' }}>Sube una noticia, la IA propone el análisis y tú lo revisas antes de usarlo en clase.</span>
        </div>
        {!nuevo && <button type="button" className="btn" onClick={() => setNuevo(true)} style={{ minHeight: 52 }}>+ SUBIR NOTICIA</button>}
      </div>
      {nuevo && <NuevoTexto onCerrar={() => setNuevo(false)} onCreado={() => { setNuevo(false); alCambiar() }} />}
      {!!todos.length && (
        <div role="group" aria-label="Filtrar por estado" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filtroBoton('todos', 'Todos', todos.length)}
          {ORDEN_FILTROS.filter((e) => cuenta[e] > 0).map((e) => filtroBoton(e, ESTADOS[e].nombre, cuenta[e]))}
        </div>
      )}
      {textos.cargando && <Cargando texto="Cargando la biblioteca" />}
      <ErrorCaja error={textos.error} />
      {textos.datos && visibles.length === 0 && <div className="aviso aviso-info">No hay textos aquí todavía. Sube una noticia para empezar.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {visibles.map((t, i) => <Tarjeta key={t.id} t={t} i={i} activos={activos[t.id] || []} cursos={cursos.datos || []} alCambiar={alCambiar} />)}
      </div>
    </Pagina>
  )
}

function NuevoTexto({ onCerrar, onCreado }: { onCerrar: () => void; onCreado: () => void }) {
  const [f, setF] = useState({ titulo: '', fuente: '', tipo: 'noticia', cuerpo: '', enlace: '', preparar_con_ia: true })
  const [error, setError] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)
  const cambia = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await api.post('/textos', { ...f, fuente: f.fuente || null, enlace: f.enlace || null, cuerpo: f.cuerpo || null })
      onCreado()
    } catch (err) { setError(err) } finally { setEnviando(false) }
  }
  return (
    <form onSubmit={enviar} className="card aparecer" style={{ padding: 22, borderRadius: 22, display: 'flex', flexDirection: 'column', gap: 12, borderColor: 'var(--celeste-suave)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ margin: 0, fontWeight: 900 }}>Subir una noticia</h2><button type="button" className="btn btn-sec btn-peq" onClick={onCerrar}>Cancelar</button></div>
      <div className="fila">
        <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="t">Título</label><input id="t" className="campo" required maxLength={250} value={f.titulo} onChange={cambia('titulo')} /></div>
        <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="f">Fuente</label><input id="f" className="campo" maxLength={120} value={f.fuente} onChange={cambia('fuente')} placeholder="El Tiempo, La Patria…" /></div>
        <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="ti">Tipo</label>
          <select id="ti" className="campo" value={f.tipo} onChange={cambia('tipo')}>{Object.entries(ICONOS).map(([k, v]) => <option key={k} value={k}>{v.nombre}</option>)}</select></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="c">Texto completo</label><textarea id="c" className="campo" rows={7} value={f.cuerpo} onChange={cambia('cuerpo')} placeholder="Pega aquí la noticia. Después no se puede cambiar." /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="e">Enlace (opcional)</label><input id="e" className="campo" type="url" value={f.enlace} onChange={cambia('enlace')} /></div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 800 }}><input type="checkbox" checked={f.preparar_con_ia} onChange={(e) => setF((x) => ({ ...x, preparar_con_ia: e.target.checked }))} /> Que la IA prepare la idea principal, las preguntas y las palabras</label>
      <ErrorCaja error={error} />
      <button className="btn" disabled={enviando || !f.titulo.trim() || (!f.cuerpo.trim() && !f.enlace)}>{enviando ? 'Guardando…' : 'GUARDAR TEXTO'}</button>
    </form>
  )
}
