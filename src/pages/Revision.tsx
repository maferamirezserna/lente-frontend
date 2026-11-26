import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Pregunta, TextoDetalle, TipoPalabra } from '../api/types'
import { Cargando, ErrorCaja, Pagina, TIPO_PALABRA, Volver, useDatos } from '../components/ui'
import { Estado } from './Textos'

// Revisar lo que propuso la IA, según docs/diseno/mockups/Mock-Revision.html.

function Seccion({ n, color, tinta = '#FFFFFF', titulo, children }: { n: number; color: string; tinta?: string; titulo: ReactNode; children: ReactNode }) {
  return (
    <section className="card" style={{ borderRadius: 22, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 10, background: color, color: tinta, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{n}</span>
        <strong style={{ fontWeight: 900, fontSize: 19, flexGrow: 1 }}>{titulo}</strong>
      </div>
      {children}
    </section>
  )
}

const botonPunteado = { padding: 10, minHeight: 44, borderRadius: 14, border: '2px dashed var(--celeste-suave)', background: '#F7F9FF', color: 'var(--cobalto-borde)', font: 'inherit', fontWeight: 900, fontSize: 14, cursor: 'pointer' } as const

function Papelera() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3" /></svg>
}

function Lapiz() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F5BEA" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" /></svg>
}

// Crear una pregunta o editar una que propuso la IA: texto, opciones (2 a 6) y cuál es la correcta.
function FormPregunta({ textoId, original, alTerminar }: { textoId: number; original?: Pregunta; alTerminar: (ok: boolean) => void }) {
  const [pregunta, setPregunta] = useState(original?.pregunta ?? '')
  const [opciones, setOpciones] = useState(original ? [...original.opciones] : ['', '', ''])
  const [correcta, setCorrecta] = useState(original?.correcta ?? 1)
  const [error, setError] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)
  const llenas = opciones.map((o) => o.trim()).filter(Boolean)
  const idCampo = original ? `pregunta-${original.id}` : 'np'

  function quitarOpcion(i: number) {
    setOpciones((xs) => xs.filter((_, j) => j !== i))
    // La correcta sigue siendo la misma opción aunque cambie de número.
    setCorrecta((c) => (c - 1 === i ? 1 : c - 1 > i ? c - 1 : c))
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!pregunta.trim() || llenas.length < 2 || !opciones[correcta - 1]?.trim()) { setError(new Error('Escribe la pregunta, al menos dos opciones y marca la correcta.')); return }
    setEnviando(true)
    setError(null)
    // Se envían solo las opciones escritas; la correcta se recalcula a su nueva posición.
    const usadas = opciones.map((o, i) => ({ o: o.trim(), i })).filter((x) => x.o)
    const datos = { pregunta: pregunta.trim(), opciones: usadas.map((x) => x.o), correcta: usadas.findIndex((x) => x.i === correcta - 1) + 1 }
    try {
      if (original) await api.patch(`/textos/${textoId}/preguntas/${original.id}`, datos)
      else await api.post(`/textos/${textoId}/preguntas`, datos)
      alTerminar(true)
    } catch (err) { setError(err) } finally { setEnviando(false) }
  }

  return (
    <form onSubmit={enviar} noValidate style={{ padding: 12, borderRadius: 16, background: '#F7F9FF', border: '2px solid var(--celeste-suave)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="etiqueta" htmlFor={idCampo}>{original ? 'Editar pregunta' : 'Nueva pregunta'}</label>
      <textarea id={idCampo} className="campo" autoFocus rows={2} maxLength={300} value={pregunta} onChange={(e) => setPregunta(e.target.value)} placeholder="Ej.: ¿Qué cuenta primero la noticia?" style={{ fontSize: 15 }} />
      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--gris)' }}>Opciones (marca la correcta)</span>
      {opciones.map((o, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="radio" name={`correcta-${idCampo}`} aria-label={`La opción ${i + 1} es la correcta`} checked={correcta === i + 1} onChange={() => setCorrecta(i + 1)} style={{ width: 22, height: 22, flexShrink: 0 }} />
          <input className="campo" aria-label={`Opción ${i + 1}`} value={o} maxLength={200} onChange={(e) => setOpciones((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Opción ${i + 1}`} style={{ minHeight: 44, padding: '8px 12px', fontSize: 15, flexGrow: 1 }} />
          {opciones.length > 2 && <button type="button" aria-label={`Quitar la opción ${i + 1}`} onClick={() => quitarOpcion(i)} style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid var(--borde)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Papelera /></button>}
        </div>
      ))}
      {opciones.length < 6 && <button type="button" onClick={() => setOpciones((xs) => [...xs, ''])} style={{ ...botonPunteado, minHeight: 38, padding: 6 }}>+ Otra opción</button>}
      <ErrorCaja error={error} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-sec btn-peq" onClick={() => alTerminar(false)}>Cancelar</button>
        <button type="submit" className="btn btn-peq" disabled={enviando}>{enviando ? 'Guardando…' : original ? 'GUARDAR CAMBIOS' : 'AGREGAR PREGUNTA'}</button>
      </div>
    </form>
  )
}

function NuevaPalabra({ textoId, alTerminar }: { textoId: number; alTerminar: (ok: boolean) => void }) {
  const [palabra, setPalabra] = useState('')
  const [tipo, setTipo] = useState<TipoPalabra>('adjetivo')
  const [error, setError] = useState<unknown>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!palabra.trim()) { setError(new Error('Escribe la palabra tal como aparece en la noticia.')); return }
    setEnviando(true)
    setError(null)
    try {
      await api.post(`/textos/${textoId}/palabras`, { palabra: palabra.trim(), tipo })
      alTerminar(true)
    } catch (err) { setError(err) } finally { setEnviando(false) }
  }

  return (
    <form onSubmit={enviar} noValidate style={{ flexBasis: '100%', padding: 12, borderRadius: 16, background: '#F7F9FF', border: '2px solid var(--celeste-suave)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div style={{ flex: '2 1 180px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="etiqueta" htmlFor="npal">Palabra (tal como aparece)</label>
        <input id="npal" className="campo" autoFocus maxLength={120} value={palabra} onChange={(e) => setPalabra(e.target.value)} style={{ minHeight: 44, padding: '8px 12px', fontSize: 15 }} />
      </div>
      <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="etiqueta" htmlFor="ntipo">Tipo</label>
        <select id="ntipo" className="campo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoPalabra)} style={{ minHeight: 44, padding: '8px 12px', fontSize: 15 }}>
          {(Object.keys(TIPO_PALABRA) as TipoPalabra[]).map((k) => <option key={k} value={k}>{TIPO_PALABRA[k].nombre}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-sec btn-peq" onClick={() => alTerminar(false)}>Cancelar</button>
        <button type="submit" className="btn btn-peq" disabled={enviando}>{enviando ? 'Guardando…' : 'AGREGAR'}</button>
      </div>
      {!!error && <div style={{ flexBasis: '100%' }}><ErrorCaja error={error} /></div>}
    </form>
  )
}

export default function Revision() {
  const { id } = useParams()
  const t = useDatos(() => api.get<TextoDetalle>(`/textos/${id}`), [id])
  const [idea, setIdea] = useState<string | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [agregandoPregunta, setAgregandoPregunta] = useState(false)
  const [agregandoPalabra, setAgregandoPalabra] = useState(false)
  const [editandoPregunta, setEditandoPregunta] = useState<number | null>(null)

  // Mientras la IA prepara el texto, se consulta cada 10 s.
  useEffect(() => {
    if (t.datos?.estado !== 'preparando') return
    const i = setInterval(() => api.get<TextoDetalle>(`/textos/${id}`).then(t.setDatos).catch(() => {}), 10000)
    return () => clearInterval(i)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.datos?.estado, id])

  // El aviso flotante se va solo.
  useEffect(() => {
    if (!aviso) return
    const x = setTimeout(() => setAviso(null), 3200)
    return () => clearTimeout(x)
  }, [aviso])

  async function accion(fn: () => Promise<unknown>, mensaje?: string) {
    setOcupado(true); setError(null)
    try { await fn(); if (mensaje) setAviso(mensaje); setIdea(null); t.recargar() } catch (e) { setError(e) } finally { setOcupado(false) }
  }

  if (!t.datos) return <Pagina>{t.error ? <ErrorCaja error={t.error} /> : <Cargando />}</Pagina>
  const d = t.datos
  const editable = d.estado === 'borrador' || d.estado === 'en_revision'
  const ideaActual = idea ?? d.idea_principal ?? ''
  const ideaCambio = idea !== null && idea.trim() !== (d.idea_principal ?? '')
  const guardarIdea = () => api.patch(`/textos/${d.id}/paquete`, { idea_principal: ideaActual.trim() })

  // Resaltar en el cuerpo las palabras con carga que propuso la IA.
  const cuerpo = d.cuerpo || ''
  const trozos: { t: string; tipo?: string }[] = []
  let k = 0
  for (const p of [...d.palabras].sort((a, b) => a.inicio - b.inicio)) {
    if (p.inicio < k || p.inicio < 0) continue
    trozos.push({ t: cuerpo.slice(k, p.inicio) }, { t: cuerpo.slice(p.inicio, p.fin), tipo: p.tipo })
    k = p.fin
  }
  trozos.push({ t: cuerpo.slice(k) })

  return (
    <Pagina>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Volver a="/textos" texto="Biblioteca" />
        <nav aria-label="Ruta" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: 'var(--gris)' }}>
          <Link to="/textos" style={{ textDecoration: 'none' }}>Biblioteca de textos</Link><span aria-hidden="true">›</span><span>{d.titulo}</span>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 32 }}>{d.preparado_por_ia ? 'Revisa lo que propuso la IA' : 'Revisa el análisis del texto'}</h1>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gris)' }}>La IA asiste, tú decides. Corrige lo que haga falta y apruébalo para usarlo en clase.</span>
        </div>
        <span style={{ transform: 'scale(1.1)', transformOrigin: 'right bottom' }}><Estado e={d.estado} /></span>
      </div>
      <ErrorCaja error={error} />
      {d.estado === 'preparando' && <div className="aviso aviso-info"><Cargando texto="La IA está preparando el análisis. Esta página se actualiza sola" /></div>}

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', paddingBottom: editable || d.estado === 'aprobado' ? 90 : 0 }}>
        <section aria-label="Noticia" className="card" style={{ flex: '1 1 420px', minWidth: 0, borderRadius: 22, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="kicker" style={{ letterSpacing: 1 }}>LA NOTICIA{d.fuente ? ` · ${d.fuente.toUpperCase()}` : ''}</span>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 22, lineHeight: 1.2 }}>{d.titulo}</h2>
          <p className="lectura" style={{ margin: 0, fontSize: 17, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
            {trozos.map((x, i) => x.tipo ? <mark key={i} style={{ background: TIPO_PALABRA[x.tipo]?.fondo || 'var(--celeste-suave)', color: '#111111', fontWeight: 800, borderRadius: 6, padding: '1px 5px' }}>{x.t}</mark> : <span key={i}>{x.t}</span>)}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontWeight: 900, fontSize: 13 }}>
            {Object.entries(TIPO_PALABRA).map(([k2, v]) => <span key={k2} style={{ padding: '4px 10px', borderRadius: 999, background: v.fondo, color: '#111111' }}>{v.nombre}</span>)}
          </div>
        </section>

        <div style={{ flex: '1 1 440px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Seccion n={1} color="var(--cobalto-borde)" titulo={<label htmlFor="idea">Idea principal</label>}>
            <textarea id="idea" className="campo" rows={3} value={ideaActual} disabled={!editable} onChange={(e) => setIdea(e.target.value)} onBlur={() => { if (editable && ideaCambio && ideaActual.trim()) accion(guardarIdea, 'Idea principal guardada.') }} style={{ fontSize: 15 }} />
            {!ideaActual.trim() && <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--mejorar-texto)' }}>Sin idea principal no se puede aprobar el texto.</span>}
          </Seccion>

          <Seccion n={2} color="var(--cobalto)" titulo={`Preguntas de organización · ${d.preguntas.length}`}>
            {d.preguntas.length === 0 && <p className="sub">Sin preguntas todavía.</p>}
            {d.preguntas.map((p, qi) => editandoPregunta === p.id ? (
              <FormPregunta key={p.id} textoId={d.id} original={p} alTerminar={(ok) => { setEditandoPregunta(null); if (ok) { setAviso('Pregunta guardada.'); t.recargar() } }} />
            ) : (
              <div key={p.id} style={{ padding: 12, borderRadius: 16, background: '#F8FAFC', border: '2px solid #EEF0F3', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <strong style={{ flexGrow: 1, fontWeight: 900, fontSize: 15 }}>{qi + 1}. {p.pregunta}</strong>
                  {editable && <button type="button" aria-label={`Editar la pregunta ${qi + 1}`} title="Editar pregunta y opciones" disabled={ocupado} onClick={() => { setEditandoPregunta(p.id); setAgregandoPregunta(false) }} style={{ width: 32, height: 32, borderRadius: 10, border: '2px solid var(--borde)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Lapiz /></button>}
                  {editable && <button type="button" aria-label="Eliminar pregunta" disabled={ocupado} onClick={() => accion(() => api.del(`/textos/${d.id}/preguntas/${p.id}`), 'Pregunta eliminada.')} style={{ width: 32, height: 32, borderRadius: 10, border: '2px solid var(--borde)', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Papelera /></button>}
                </div>
                {p.opciones.map((o, i) => {
                  const ok = i + 1 === p.correcta
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 12, fontSize: 14, fontWeight: ok ? 800 : 700, background: ok ? 'var(--ok-fondo)' : '#FFFFFF', color: ok ? 'var(--ok-texto)' : '#374151', border: `2px solid ${ok ? 'var(--ok)' : 'var(--borde)'}` }}>
                      <span>{i + 1}.</span><span style={{ flexGrow: 1 }}>{o}</span><span>{ok ? '✓ Correcta' : ''}</span>
                    </div>
                  )
                })}
              </div>
            ))}
            {editable && (agregandoPregunta
              ? <FormPregunta textoId={d.id} alTerminar={(ok) => { setAgregandoPregunta(false); if (ok) { setAviso('Pregunta agregada.'); t.recargar() } }} />
              : <button type="button" onClick={() => setAgregandoPregunta(true)} style={botonPunteado}>+ Agregar pregunta</button>)}
          </Seccion>

          <Seccion n={3} color="var(--celeste)" tinta="#10193D" titulo={`Palabras con carga · ${d.palabras.length}`}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {d.palabras.map((p) => (
                <span key={p.id} title={p.explicacion || undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: editable ? '6px 6px 6px 12px' : '6px 12px', borderRadius: 999, background: TIPO_PALABRA[p.tipo]?.fondo || 'var(--celeste-suave)', color: '#111111', fontWeight: 900, fontSize: 14 }}>
                  {p.palabra} <span style={{ fontWeight: 700, fontSize: 12, opacity: 0.85 }}>· {TIPO_PALABRA[p.tipo]?.nombre || p.tipo}</span>
                  {editable && <button type="button" aria-label={`Quitar ${p.palabra}`} disabled={ocupado} onClick={() => accion(() => api.del(`/textos/${d.id}/palabras/${p.id}`), 'Palabra quitada.')} style={{ width: 26, height: 26, borderRadius: '50%', border: 0, background: 'rgba(255,255,255,.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111111' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>}
                </span>
              ))}
              {d.palabras.length === 0 && <p className="sub" style={{ margin: 0 }}>Sin palabras todavía.</p>}
              {editable && (agregandoPalabra
                ? <NuevaPalabra textoId={d.id} alTerminar={(ok) => { setAgregandoPalabra(false); if (ok) { setAviso('Palabra agregada.'); t.recargar() } }} />
                : <button type="button" onClick={() => setAgregandoPalabra(true)} style={{ ...botonPunteado, padding: '6px 14px', minHeight: 38, borderRadius: 999 }}>+ Agregar palabra</button>)}
            </div>
          </Seccion>
        </div>
      </div>

      {(editable || d.estado === 'aprobado') && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10, padding: '16px clamp(16px, 4vw, 40px) 20px', borderTop: '2px solid var(--borde)', background: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          {editable && <>
            <button type="button" className="btn btn-sec" disabled={ocupado} onClick={() => accion(() => api.post(`/textos/${d.id}/preparar`), 'La IA empezó a preparar el texto.')} style={{ minHeight: 56, fontSize: 15 }}>{d.estado === 'borrador' ? 'PREPARAR CON IA' : 'VOLVER A PREPARAR CON IA'}</button>
            <button type="button" className="btn" disabled={ocupado || !ideaActual.trim()} onClick={() => accion(async () => { if (ideaCambio) await guardarIdea(); await api.post(`/textos/${d.id}/aprobar`) }, 'Texto aprobado. Ya puedes activarlo en tus cursos.')} style={{ minHeight: 56, padding: '15px 28px', fontSize: 16 }}>APROBAR TEXTO</button>
          </>}
          {d.estado === 'aprobado' && <>
            <button type="button" className="btn btn-sec" disabled={ocupado} onClick={() => accion(() => api.post(`/textos/${d.id}/revisar`), 'El texto volvió a revisión y se retiró de los cursos.')} style={{ minHeight: 56, fontSize: 15 }}>VOLVER A REVISIÓN</button>
            <Link to="/textos" className="btn btn-ok" style={{ minHeight: 56, padding: '15px 28px', fontSize: 16 }}>APROBADO ✓ · ACTIVAR EN UN CURSO</Link>
          </>}
        </div>
      )}

      {aviso && (
        <div role="status" className="aparecer" style={{ position: 'fixed', left: '50%', bottom: 110, transform: 'translateX(-50%)', zIndex: 30, width: 'min(460px, calc(100% - 32px))', boxSizing: 'border-box', padding: '14px 18px', borderRadius: 16, background: '#10193D', color: '#FFFFFF', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CC3FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          {aviso}
        </div>
      )}
    </Pagina>
  )
}
