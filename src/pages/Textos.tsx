import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Curso, TextoDetalle, TextoResumen } from '../api/types'
import { Cargando, ErrorCaja, Pagina, TIPO_PALABRA, useDatos } from '../components/ui'

const ESTADOS: Record<string, { nombre: string; fondo: string; texto: string }> = {
  borrador: { nombre: 'Borrador', fondo: '#EEF2F7', texto: '#4B5563' },
  preparando: { nombre: 'La IA lo está preparando', fondo: '#FFF4E5', texto: '#8A4B00' },
  en_revision: { nombre: 'Listo para revisar', fondo: '#C9DBFF', texto: '#1A36A8' },
  aprobado: { nombre: 'Aprobado', fondo: '#D9F7E3', texto: '#145A2E' },
  archivado: { nombre: 'Archivado', fondo: '#EEF2F7', texto: '#6B7280' },
}
export const Estado = ({ e }: { e: string }) => {
  const s = ESTADOS[e] || ESTADOS.borrador
  return <span className="chip" style={{ background: s.fondo, color: s.texto }}>{s.nombre}</span>
}

export default function Textos() {
  const lista = useDatos(() => api.get<TextoResumen[]>('/textos'))
  const [nuevo, setNuevo] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  // Mientras alguno esté "preparando", revisar cada 10 s.
  const preparando = lista.datos?.some((t) => t.estado === 'preparando')
  useEffect(() => {
    if (!preparando) return
    const t = setInterval(() => api.get<TextoResumen[]>('/textos').then(lista.setDatos).catch(() => {}), 10000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preparando])

  const visibles = (lista.datos || []).filter((t) => filtro === 'todos' || t.estado === filtro)
  return (
    <Pagina>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="titulo">Biblioteca de textos</h1>
          <p className="sub" style={{ marginTop: 6 }}>Agrega una noticia, deja que la IA prepare la actividad y revísala antes de usarla en clase.</p>
        </div>
        <button className="btn" onClick={() => setNuevo(true)}>+ NUEVO TEXTO</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['todos', 'en_revision', 'preparando', 'aprobado', 'borrador'].map((f) => (
          <button key={f} type="button" className={filtro === f ? 'btn btn-peq' : 'btn btn-sec btn-peq'} onClick={() => setFiltro(f)}>{f === 'todos' ? 'Todos' : ESTADOS[f].nombre}</button>
        ))}
      </div>
      {nuevo && <NuevoTexto onCerrar={() => setNuevo(false)} onCreado={() => { setNuevo(false); lista.recargar() }} />}
      {lista.cargando && <Cargando texto="Cargando la biblioteca" />}
      <ErrorCaja error={lista.error} />
      {lista.datos && visibles.length === 0 && <div className="aviso aviso-info">No hay textos aquí todavía.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visibles.map((t, i) => (
          <Link key={t.id} to={`/textos/${t.id}`} className="card aparecer" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', textDecoration: 'none', color: 'inherit', animationDelay: `${i * 40}ms` }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{t.titulo}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gris)' }}>{t.fuente || 'Sin fuente'} · {t.tipo} · {new Date(t.creado_en).toLocaleDateString('es-CO')}</div>
            </div>
            <Estado e={t.estado} />
            <span style={{ fontWeight: 900, color: 'var(--cobalto)' }}>{t.estado === 'en_revision' ? 'Revisar →' : 'Ver →'}</span>
          </Link>
        ))}
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
    <form onSubmit={enviar} className="card aparecer" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2 style={{ margin: 0, fontWeight: 900 }}>Nuevo texto</h2><button type="button" className="btn btn-sec btn-peq" onClick={onCerrar}>Cancelar</button></div>
      <div className="fila">
        <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="t">Título</label><input id="t" className="campo" required maxLength={250} value={f.titulo} onChange={cambia('titulo')} /></div>
        <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="f">Fuente</label><input id="f" className="campo" maxLength={120} value={f.fuente} onChange={cambia('fuente')} placeholder="El Tiempo, La Patria…" /></div>
        <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="ti">Tipo</label>
          <select id="ti" className="campo" value={f.tipo} onChange={cambia('tipo')}><option value="noticia">Noticia</option><option value="publicacion">Publicación</option><option value="video">Video</option><option value="otro">Otro</option></select></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="c">Texto completo</label><textarea id="c" className="campo" rows={7} value={f.cuerpo} onChange={cambia('cuerpo')} placeholder="Pega aquí la noticia. Después no se puede cambiar." /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label className="etiqueta" htmlFor="e">Enlace (opcional)</label><input id="e" className="campo" type="url" value={f.enlace} onChange={cambia('enlace')} /></div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 800 }}><input type="checkbox" checked={f.preparar_con_ia} onChange={(e) => setF((x) => ({ ...x, preparar_con_ia: e.target.checked }))} /> Que la IA prepare la idea principal, las preguntas y las palabras</label>
      <ErrorCaja error={error} />
      <button className="btn" disabled={enviando || !f.titulo.trim() || (!f.cuerpo.trim() && !f.enlace)}>{enviando ? 'Guardando…' : 'GUARDAR TEXTO'}</button>
    </form>
  )
}

/* ---------- Revisión de un texto ---------- */
export function Revision() {
  const { id } = useParams()
  const nav = useNavigate()
  const t = useDatos(() => api.get<TextoDetalle>(`/textos/${id}`), [id])
  const cursos = useDatos(() => api.get<Curso[]>('/cursos'))
  const [idea, setIdea] = useState<string | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    if (t.datos?.estado !== 'preparando') return
    const i = setInterval(() => api.get<TextoDetalle>(`/textos/${id}`).then(t.setDatos).catch(() => {}), 10000)
    return () => clearInterval(i)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.datos?.estado, id])

  async function accion(fn: () => Promise<unknown>, mensaje: string) {
    setOcupado(true); setError(null); setOk(null)
    try { await fn(); setOk(mensaje); t.recargar() } catch (e) { setError(e) } finally { setOcupado(false) }
  }

  if (!t.datos) return <Pagina>{t.error ? <ErrorCaja error={t.error} /> : <Cargando />}</Pagina>
  const d = t.datos
  const editable = d.estado !== 'aprobado' && d.estado !== 'archivado'
  const ideaActual = idea ?? d.idea_principal ?? ''

  // Resaltar en el cuerpo las palabras cargadas que propuso la IA.
  const cuerpo = d.cuerpo || ''
  const trozos: { t: string; tipo?: string }[] = []
  let k = 0
  for (const p of [...d.palabras].sort((a, b) => a.inicio - b.inicio)) {
    if (p.inicio < k) continue
    trozos.push({ t: cuerpo.slice(k, p.inicio) }, { t: cuerpo.slice(p.inicio, p.fin), tipo: p.tipo })
    k = p.fin
  }
  trozos.push({ t: cuerpo.slice(k) })

  return (
    <Pagina>
      <div>
        <Link to="/textos" style={{ fontWeight: 800, textDecoration: 'none' }}>← Biblioteca</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
          <h1 className="titulo">{d.titulo}</h1><Estado e={d.estado} />
        </div>
        <p className="sub" style={{ marginTop: 6 }}>{d.fuente || 'Sin fuente'} · {d.preparado_por_ia ? 'Preparado por la IA: revisa y corrige antes de aprobar.' : 'Preparado a mano.'}</p>
      </div>
      <ErrorCaja error={error} />
      {ok && <div className="aviso aviso-info" role="status">{ok}</div>}
      {d.estado === 'preparando' && <div className="aviso aviso-info"><Cargando texto="La IA está preparando la actividad. Esta página se actualiza sola" /></div>}

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <article className="card" style={{ flex: '3 1 480px', padding: 24 }}>
          <div className="kicker">Texto</div>
          <p className="lectura" style={{ fontSize: 18, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {trozos.map((x, i) => x.tipo ? <mark key={i} style={{ background: TIPO_PALABRA[x.tipo]?.fondo || '#C9DBFF', color: '#111', fontWeight: 600, borderRadius: 6, padding: '0 3px' }}>{x.t}</mark> : <span key={i}>{x.t}</span>)}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(TIPO_PALABRA).map(([k2, v]) => <span key={k2} className="chip" style={{ background: v.fondo, color: '#111' }}>{v.nombre}</span>)}
          </div>
        </article>

        <section style={{ flex: '2 1 380px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="kicker">1 · Idea principal</div>
            <textarea className="campo" rows={4} value={ideaActual} disabled={!editable} onChange={(e) => setIdea(e.target.value)} />
            {editable && idea !== null && idea !== d.idea_principal && (
              <button className="btn btn-peq" disabled={ocupado || !idea.trim()} onClick={() => accion(() => api.patch(`/textos/${d.id}/paquete`, { idea_principal: idea.trim() }), 'Idea principal guardada.')}>Guardar idea</button>
            )}
          </div>
          <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="kicker">2 · Preguntas de organización</div>
            {d.preguntas.length === 0 && <p className="sub">Sin preguntas todavía.</p>}
            {d.preguntas.map((p) => (
              <div key={p.id} style={{ borderTop: '2px solid var(--borde)', paddingTop: 10 }}>
                <div style={{ fontWeight: 900 }}>{p.orden}. {p.pregunta}</div>
                <ol type="A" style={{ margin: '6px 0', fontWeight: 700 }}>
                  {p.opciones.map((o, i) => <li key={i} style={{ color: i + 1 === p.correcta ? 'var(--ok-texto)' : undefined }}>{o}{i + 1 === p.correcta ? ' ✓' : ''}</li>)}
                </ol>
                {editable && <button className="btn btn-sec btn-peq" disabled={ocupado} onClick={() => accion(() => api.del(`/textos/${d.id}/preguntas/${p.id}`), 'Pregunta quitada.')}>Quitar</button>}
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="kicker">3 · Palabras cargadas</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {d.palabras.map((p) => (
                <span key={p.id} className="chip" style={{ background: TIPO_PALABRA[p.tipo]?.fondo || '#C9DBFF', color: '#111', fontSize: 14 }}>
                  {p.palabra}
                  {editable && <button type="button" aria-label={`Quitar ${p.palabra}`} disabled={ocupado} onClick={() => accion(() => api.del(`/textos/${d.id}/palabras/${p.id}`), 'Palabra quitada.')} style={{ border: 0, background: 'transparent', fontWeight: 900, cursor: 'pointer', color: '#111' }}>×</button>}
                </span>
              ))}
            </div>
          </div>
          {d.estado === 'borrador' && <button className="btn btn-sec" disabled={ocupado} onClick={() => accion(() => api.post(`/textos/${d.id}/preparar`), 'La IA empezó a preparar el texto.')}>PREPARAR CON IA</button>}
          {d.estado === 'en_revision' && <button className="btn btn-ok" disabled={ocupado} onClick={() => accion(() => api.post(`/textos/${d.id}/aprobar`), 'Texto aprobado. Ya lo puedes activar en un curso.')}>APROBAR TEXTO</button>}
          {d.estado === 'aprobado' && (
            <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="kicker">Usar en un curso</div>
              {cursos.datos?.map((c) => (
                <button key={c.id} className="btn btn-sec btn-peq" disabled={ocupado} onClick={() => accion(() => api.post(`/cursos/${c.id}/textos`, { texto_id: d.id }), `Activado en ${c.nombre}.`)}>Activar en {c.nombre}</button>
              ))}
              <button className="btn btn-peq" onClick={() => nav('/cursos')}>Ir a mis cursos</button>
            </div>
          )}
        </section>
      </div>
    </Pagina>
  )
}
