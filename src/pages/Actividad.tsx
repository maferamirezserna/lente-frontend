import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, ApiError, ahora, nuevoCodigo } from '../api/client'
import type { ActividadVista, EstadoMacro, EstadoSuper, ResultadoActividad, TipoPalabra } from '../api/types'
import { Cargando, ErrorCaja, LupaIcono, TIPO_PALABRA } from '../components/ui'

const PASOS = [
  { clave: 'macro', nombre: 'Idea principal' },
  { clave: 'super', nombre: 'Organización' },
  { clave: 'micro', nombre: 'Palabras' },
  { clave: 'resultado', nombre: 'Resultado' },
]

function salirPantallaCompleta() {
  try { if (document.fullscreenElement) document.exitFullscreen() } catch { /* nada */ }
}

export default function Actividad() {
  const { id } = useParams()
  const nav = useNavigate()
  const [vista, setVista] = useState<ActividadVista | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [empezo, setEmpezo] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const v = await api.get<ActividadVista>(`/actividades/${id}`)
      setVista(v)
      if (v.paso !== 'macro') setEmpezo(true)
    } catch (e) { setError(e) }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  // 409 = paso equivocado: se vuelve a pedir la actividad y se usa el paso que diga la API.
  const manejar = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 409) { cargar(); return }
    setError(e)
  }, [cargar])

  function salir() {
    salirPantallaCompleta()
    nav(-1)
  }

  if (!vista) return <div style={{ padding: 32 }}>{error ? <ErrorCaja error={error} /> : <Cargando texto="Abriendo la actividad" />}</div>

  const idx = PASOS.findIndex((p) => p.clave === vista.paso)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fondo)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px clamp(16px, 4vw, 36px)', background: '#fff', borderBottom: '2px solid var(--borde)', flexWrap: 'wrap' }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--cobalto)', borderBottom: '4px solid var(--cobalto-borde)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LupaIcono size={22} /></span>
        <ol aria-label="Pasos" style={{ display: 'flex', gap: 8, listStyle: 'none', margin: 0, padding: 0, flex: 1, flexWrap: 'wrap' }}>
          {PASOS.map((p, i) => (
            <li key={p.clave} aria-current={i === idx ? 'step' : undefined} className="chip" style={{ background: i < idx ? 'var(--celeste-suave)' : i === idx ? 'var(--cobalto)' : '#EEF2F7', color: i === idx ? '#fff' : i < idx ? 'var(--cobalto-borde)' : 'var(--gris-claro)', fontSize: 13.5, padding: '7px 12px' }}>
              {i < idx ? '✓' : i + 1} {p.nombre}
            </li>
          ))}
        </ol>
        <span style={{ fontWeight: 900 }}>{vista.estudiante}</span>
        <button className="btn btn-sec btn-peq" onClick={salir}>Salir</button>
      </header>

      <main style={{ flex: 1, width: '100%', maxWidth: 1180, margin: '0 auto', padding: '24px clamp(16px, 4vw, 36px) 140px' }}>
        <ErrorCaja error={error} />
        {!empezo ? (
          <Intro vista={vista} onEmpezar={() => setEmpezo(true)} />
        ) : vista.paso === 'macro' ? (
          <PasoMacro vista={vista} onListo={cargar} onError={manejar} />
        ) : vista.paso === 'super' ? (
          <PasoSuper vista={vista} onListo={cargar} onError={manejar} />
        ) : vista.paso === 'micro' ? (
          <PasoMicro vista={vista} onListo={cargar} onError={manejar} />
        ) : (
          <PasoResultado vista={vista} onSalir={salir} />
        )}
      </main>
    </div>
  )
}

function Intro({ vista, onEmpezar }: { vista: ActividadVista; onEmpezar: () => void }) {
  return (
    <section className="aparecer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18, paddingTop: 30 }}>
      <div className="saltar" style={{ width: 110, height: 110, borderRadius: 32, background: 'var(--cobalto)', borderBottom: '7px solid var(--cobalto-borde)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LupaIcono size={60} /></div>
      <h1 className="titulo">¡Hola, {vista.estudiante.split(' ')[0]}!</h1>
      <p className="sub" style={{ fontSize: 18, maxWidth: 560 }}>Hoy vas a leer «{vista.titulo}». Vas a mirarla con tres lentes: la idea principal, cómo está organizada y las palabras que usa.</p>
      <button className="btn" style={{ minWidth: 240, fontSize: 17 }} onClick={onEmpezar}>EMPEZAR</button>
    </section>
  )
}

function Lectura({ vista, estilo }: { vista: ActividadVista; estilo?: CSSProperties }) {
  return (
    <article className="card" style={{ padding: 'clamp(18px, 3vw, 28px)', ...estilo }}>
      <div className="kicker" style={{ color: 'var(--gris-claro)' }}>{vista.fuente || 'Texto'}</div>
      <h2 style={{ margin: '6px 0 12px', fontWeight: 900, fontSize: 24 }}>{vista.titulo}</h2>
      <p className="lectura" style={{ margin: 0, fontSize: 19, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{vista.cuerpo}</p>
    </article>
  )
}

/* ---------- MACRO: idea principal ---------- */
function PasoMacro({ vista, onListo, onError }: { vista: ActividadVista; onListo: () => void; onError: (e: unknown) => void }) {
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState<EstadoMacro | null>(null)
  const [enviando, setEnviando] = useState(false)
  const codigo = useRef(nuevoCodigo())

  // Si ya había respondido (p. ej. se recargó la página), retomar la revisión.
  useEffect(() => {
    api.get<EstadoMacro>(`/actividades/${vista.id}/macro`).then((e) => { if (e.analizando || e.veredicto) setEstado(e) }).catch(() => { /* aún no responde */ })
  }, [vista.id])

  // Consultar cada 2 s mientras la IA analiza.
  useEffect(() => {
    if (!estado?.analizando) return
    const t = setInterval(() => {
      api.get<EstadoMacro>(`/actividades/${vista.id}/macro`).then(setEstado).catch(onError)
    }, 2000)
    return () => clearInterval(t)
  }, [estado?.analizando, vista.id, onError])

  async function enviar() {
    setEnviando(true)
    try {
      // Si falla la red, se reintenta con el MISMO código de envío.
      setEstado(await api.post<EstadoMacro>(`/actividades/${vista.id}/macro`, { codigo_envio: codigo.current, texto: texto.trim(), enviada_en: ahora() }))
    } catch (e) { onError(e) } finally { setEnviando(false) }
  }

  const revisado = estado && !estado.analizando
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Lectura vista={vista} estilo={{ flex: '3 1 480px' }} />
      <section className="card" style={{ flex: '2 1 340px', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="kicker">Paso 1 · Idea principal</div>
        <label htmlFor="idea" style={{ fontWeight: 900, fontSize: 20 }}>{vista.instruccion}</label>
        <textarea id="idea" className="campo" rows={6} maxLength={2000} value={texto} onChange={(e) => setTexto(e.target.value)} disabled={!!estado} placeholder="La noticia trata de…" />
        {!estado && <button className="btn" onClick={enviar} disabled={enviando || texto.trim().length < 3}>{enviando ? 'Enviando…' : 'REVISAR MI IDEA'}</button>}
        {estado?.analizando && (
          <div className="aviso aviso-info" role="status" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="saltar" style={{ display: 'inline-flex' }}><LupaIcono size={22} color="#2F5BEA" /></span>
            <span>Lente está leyendo tu respuesta<span className="puntos"><span>.</span><span>.</span><span>.</span></span></span>
          </div>
        )}
        {estado?.mensaje && <div className="aviso aviso-info">{estado.mensaje}</div>}
      </section>
      {revisado && (
        <div className="hoja" style={{ background: estado.veredicto === 'por_mejorar' ? 'var(--mejorar-fondo)' : 'var(--ok-fondo)', borderTop: `3px solid ${estado.veredicto === 'por_mejorar' ? 'var(--mejorar)' : 'var(--ok)'}` }}>
          <div style={{ flex: '1 1 420px', color: estado.veredicto === 'por_mejorar' ? 'var(--mejorar-texto)' : 'var(--ok-texto)' }}>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{estado.veredicto === 'coincide' ? '¡Muy bien!' : estado.veredicto === 'por_mejorar' ? 'Vamos a mirarlo otra vez' : '¡Vas por buen camino!'}</div>
            {estado.explicacion && <p style={{ margin: '4px 0', fontWeight: 700 }}>{estado.explicacion}</p>}
            {estado.cita && <p className="lectura" style={{ margin: '4px 0', fontStyle: 'italic' }}>«{estado.cita}»</p>}
            {estado.idea_principal && <p style={{ margin: '4px 0', fontWeight: 700 }}><b>Idea principal:</b> {estado.idea_principal}</p>}
          </div>
          <button className={estado.veredicto === 'por_mejorar' ? 'btn btn-mejorar' : 'btn btn-ok'} onClick={onListo}>CONTINUAR</button>
        </div>
      )}
    </div>
  )
}

/* ---------- SUPER: organización ---------- */
function PasoSuper({ vista, onListo, onError }: { vista: ActividadVista; onListo: () => void; onError: (e: unknown) => void }) {
  const [elegidas, setElegidas] = useState<Record<number, number>>({})
  const [estado, setEstado] = useState<EstadoSuper | null>(null)
  const [enviando, setEnviando] = useState(false)
  const codigos = useRef<Record<number, string>>({})
  const codigoDe = (pid: number) => (codigos.current[pid] ||= nuevoCodigo())
  const completas = vista.preguntas.every((p) => elegidas[p.id])

  async function enviar() {
    setEnviando(true)
    try {
      const respuestas = vista.preguntas.map((p) => ({ codigo_envio: codigoDe(p.id), pregunta_id: p.id, opcion_elegida: elegidas[p.id] }))
      setEstado(await api.post<EstadoSuper>(`/actividades/${vista.id}/super`, { respuestas, enviada_en: ahora() }))
    } catch (e) { onError(e) } finally { setEnviando(false) }
  }

  const resultado = (pid: number) => estado?.resultados.find((r) => r.pregunta_id === pid)
  const buenas = estado?.resultados.filter((r) => r.es_correcta).length ?? 0

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Lectura vista={vista} estilo={{ flex: '3 1 440px' }} />
      <section style={{ flex: '2 1 380px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="kicker">Paso 2 · Organización</div>
        <div style={{ fontWeight: 900, fontSize: 20 }}>{vista.instruccion}</div>
        {vista.preguntas.map((p) => {
          const r = resultado(p.id)
          return (
            <fieldset key={p.id} className="card" style={{ padding: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <legend style={{ fontWeight: 900, fontSize: 16, padding: '0 4px' }}>{p.orden}. {p.pregunta}</legend>
              {p.opciones.map((o, i) => {
                const n = i + 1
                const sel = elegidas[p.id] === n
                const bien = r && r.correcta === n
                const mal = r && sel && !r.es_correcta
                return (
                  <button key={n} type="button" disabled={!!estado} aria-pressed={sel} onClick={() => setElegidas((x) => ({ ...x, [p.id]: n }))}
                    style={{ textAlign: 'left', font: 'inherit', fontWeight: 800, fontSize: 15, padding: '12px 14px', borderRadius: 14, cursor: estado ? 'default' : 'pointer',
                      border: `2px solid ${bien ? 'var(--ok)' : mal ? 'var(--mejorar)' : sel ? 'var(--cobalto)' : 'var(--borde)'}`, borderBottomWidth: 4,
                      background: bien ? 'var(--ok-fondo)' : mal ? 'var(--mejorar-fondo)' : sel ? 'var(--hielo)' : '#fff', color: 'var(--tinta)' }}>
                    {String.fromCharCode(64 + n)}. {o} {bien ? '✓' : mal ? '✗' : ''}
                  </button>
                )
              })}
            </fieldset>
          )
        })}
        {!estado && <button className="btn" disabled={!completas || enviando} onClick={enviar}>{enviando ? 'Revisando…' : 'COMPROBAR'}</button>}
      </section>
      {estado && (
        <div className="hoja" style={{ background: buenas === vista.preguntas.length ? 'var(--ok-fondo)' : 'var(--hielo)', borderTop: '3px solid var(--cobalto)' }}>
          <div style={{ flex: '1 1 420px' }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: 'var(--cobalto-borde)' }}>{buenas} de {vista.preguntas.length} correctas</div>
            {estado.consejo && <p style={{ margin: '4px 0', fontWeight: 700 }}>{estado.consejo}</p>}
          </div>
          <button className="btn" onClick={onListo}>CONTINUAR</button>
        </div>
      )}
    </div>
  )
}

/* ---------- MICRO: palabras cargadas ---------- */
interface Marca { texto: string; inicio: number; fin: number; tipo_palabra: TipoPalabra | null; codigo: string }

function tokens(cuerpo: string) {
  const out: { texto: string; inicio: number; fin: number; palabra: boolean }[] = []
  const re = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu
  let ultimo = 0
  for (const m of cuerpo.matchAll(re)) {
    const i = m.index ?? 0
    if (i > ultimo) out.push({ texto: cuerpo.slice(ultimo, i), inicio: ultimo, fin: i, palabra: false })
    out.push({ texto: m[0], inicio: i, fin: i + m[0].length, palabra: true })
    ultimo = i + m[0].length
  }
  if (ultimo < cuerpo.length) out.push({ texto: cuerpo.slice(ultimo), inicio: ultimo, fin: cuerpo.length, palabra: false })
  return out
}

function PasoMicro({ vista, onListo, onError }: { vista: ActividadVista; onListo: () => void; onError: (e: unknown) => void }) {
  const cuerpo = vista.cuerpo || ''
  const partes = useMemo(() => tokens(cuerpo), [cuerpo])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [eligiendoTipo, setEligiendoTipo] = useState<number | null>(null)
  const [resultado, setResultado] = useState<ResultadoActividad | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [lupa, setLupa] = useState<{ x: number; y: number } | null>(null)
  const primaria = vista.nivel_escolar === 'primaria'
  const pideTipo = !primaria

  function tocar(t: { texto: string; inicio: number; fin: number }) {
    if (resultado) return
    const ya = marcas.find((m) => m.inicio === t.inicio)
    if (ya) {
      setMarcas((ms) => ms.filter((m) => m.inicio !== t.inicio))
      if (eligiendoTipo === t.inicio) setEligiendoTipo(null)
      return
    }
    setMarcas((ms) => [...ms, { ...t, tipo_palabra: null, codigo: nuevoCodigo() }])
    if (pideTipo) setEligiendoTipo(t.inicio)
  }

  async function revisar() {
    setEnviando(true)
    try {
      await api.post(`/actividades/${vista.id}/micro`, {
        marcas: marcas.map((m) => ({ codigo_envio: m.codigo, texto: m.texto, inicio: m.inicio, fin: m.fin, tipo_palabra: pideTipo ? m.tipo_palabra : null })),
        enviada_en: ahora(),
      })
      setResultado(await api.post<ResultadoActividad>(`/actividades/${vista.id}/terminar`))
    } catch (e) { onError(e) } finally { setEnviando(false) }
  }

  const faltaTipo = pideTipo && marcas.some((m) => !m.tipo_palabra)
  const m = resultado?.micro

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="kicker">Paso 3 · Palabras</div>
        <div style={{ fontWeight: 900, fontSize: 20, marginTop: 4 }}>{vista.instruccion}</div>
        <p className="sub" style={{ marginTop: 4 }}>
          Toca una palabra para marcarla; tócala otra vez para quitarla.
          {primaria && vista.palabras_esperadas ? ` Busca ${vista.palabras_esperadas} palabras.` : ''}
          {pideTipo ? ' Luego dinos si es adjetivo, verbo o expresión.' : ''}
        </p>
      </div>
      <article className="card" style={{ padding: 'clamp(18px, 3vw, 30px)', position: 'relative', cursor: 'none' }}
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setLupa({ x: e.clientX - r.left, y: e.clientY - r.top }) }}
        onPointerLeave={() => setLupa(null)}>
        <h2 style={{ margin: '0 0 12px', fontWeight: 900, fontSize: 24 }}>{vista.titulo}</h2>
        <p className="lectura" style={{ margin: 0, fontSize: 21, lineHeight: 2.1 }}>
          {partes.map((t) => t.palabra ? (
            <span key={t.inicio} style={{ position: 'relative' }}>
              <button type="button" className="palabra" data-marcada={marcas.some((x) => x.inicio === t.inicio)} onClick={() => tocar(t)} style={{ cursor: 'none' }}>{t.texto}</button>
              {(() => { const mk = marcas.find((x) => x.inicio === t.inicio); return mk?.tipo_palabra ? <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: -14, transform: 'translateX(-50%)', fontSize: 10, fontWeight: 900, fontFamily: 'Nunito', padding: '1px 6px', borderRadius: 999, background: TIPO_PALABRA[mk.tipo_palabra].fondo, color: '#111', whiteSpace: 'nowrap' }}>{TIPO_PALABRA[mk.tipo_palabra].nombre}</span> : null })()}
              {eligiendoTipo === t.inicio && (
                <span role="group" aria-label={`Tipo de «${t.texto}»`} style={{ position: 'absolute', zIndex: 5, top: '100%', left: 0, display: 'flex', gap: 6, padding: 8, background: '#fff', borderRadius: 14, border: '2px solid var(--borde)', boxShadow: '0 10px 24px rgba(0,0,0,.12)', fontFamily: 'Nunito' }}>
                  {(Object.keys(TIPO_PALABRA) as TipoPalabra[]).map((k) => (
                    <button key={k} type="button" className="btn btn-peq" style={{ background: TIPO_PALABRA[k].fondo, color: '#111', borderBottomColor: 'rgba(0,0,0,.25)', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); setMarcas((ms) => ms.map((x) => (x.inicio === t.inicio ? { ...x, tipo_palabra: k } : x))); setEligiendoTipo(null) }}>
                      {TIPO_PALABRA[k].nombre}
                    </button>
                  ))}
                </span>
              )}
            </span>
          ) : <span key={t.inicio}>{t.texto}</span>)}
        </p>
        {lupa && !resultado && (
          <div aria-hidden="true" style={{ position: 'absolute', left: lupa.x - 26, top: lupa.y - 26, width: 52, height: 52, borderRadius: '50%', border: '5px solid var(--cobalto-borde)', background: 'rgba(156,195,255,.18)', pointerEvents: 'none', boxShadow: '0 6px 16px rgba(26,54,168,.25)' }}>
            <div style={{ position: 'absolute', right: -14, bottom: -14, width: 20, height: 7, borderRadius: 4, background: 'var(--cobalto-borde)', transform: 'rotate(45deg)' }} />
          </div>
        )}
      </article>

      {!resultado ? (
        <div className="hoja" style={{ background: '#fff', borderTop: '2px solid var(--borde)' }}>
          <div style={{ flex: 1, fontWeight: 900, fontSize: 18 }}>
            {marcas.length} {marcas.length === 1 ? 'palabra marcada' : 'palabras marcadas'}
            {primaria && vista.palabras_esperadas ? ` de ${vista.palabras_esperadas}` : ''}
            {faltaTipo && <span style={{ display: 'block', fontSize: 14, color: 'var(--gris)' }}>Elige el tipo de cada palabra marcada.</span>}
          </div>
          <button className="btn" disabled={!marcas.length || faltaTipo || enviando} onClick={revisar}>{enviando ? 'Revisando…' : 'REVISAR MIS PALABRAS'}</button>
        </div>
      ) : m && (
        <div className="hoja" style={{ background: 'var(--hielo)', borderTop: '3px solid var(--cobalto)' }}>
          <div style={{ flex: '1 1 420px' }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: 'var(--cobalto-borde)' }}>Encontraste {m.aciertos.length} de {m.aciertos.length + m.omisiones.length}</div>
            {m.omisiones.length > 0 && <p style={{ margin: '4px 0', fontWeight: 700 }}>Te faltaron: {m.omisiones.map((o) => `«${o.palabra}»`).join(', ')}</p>}
            {m.neutras_marcadas.length > 0 && <p style={{ margin: '4px 0', fontWeight: 700 }}>Estas no muestran postura: {m.neutras_marcadas.map((o) => `«${o.palabra}»`).join(', ')}</p>}
            {m.explicacion && <p style={{ margin: '4px 0', fontWeight: 700 }}>{m.explicacion}</p>}
          </div>
          <button className="btn" onClick={onListo}>VER MI RESULTADO</button>
        </div>
      )}
    </div>
  )
}

/* ---------- RESULTADO ---------- */
function PasoResultado({ vista, onSalir }: { vista: ActividadVista; onSalir: () => void }) {
  const [r, setR] = useState<ResultadoActividad | null>(null)
  const [error, setError] = useState<unknown>(null)
  useEffect(() => { api.get<ResultadoActividad>(`/actividades/${vista.id}/resultado`).then(setR).catch(setError) }, [vista.id])
  if (!r) return error ? <ErrorCaja error={error} /> : <Cargando texto="Preparando tu resultado" />

  const tarjetas = [
    { nombre: 'Idea principal', n: r.macro, detalle: r.macro.explicacion },
    { nombre: 'Organización', n: r.super, detalle: `${r.super.preguntas.filter((p) => p.es_correcta).length} de ${r.super.preguntas.length} preguntas` },
    { nombre: 'Palabras', n: r.micro, detalle: `${r.micro.aciertos.length} de ${r.micro.aciertos.length + r.micro.omisiones.length} palabras` },
  ]
  return (
    <section className="aparecer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
      <div className="saltar" style={{ fontSize: 64 }} aria-hidden="true">🎉</div>
      <h1 className="titulo">¡Terminaste, {vista.estudiante.split(' ')[0]}!</h1>
      <div className="chip" style={{ background: 'var(--cobalto)', color: '#fff', fontSize: 20, padding: '10px 18px' }}>+{r.puntos_ganados} puntos</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, width: '100%', textAlign: 'left' }}>
        {tarjetas.map((t) => (
          <div key={t.nombre} className="card" style={{ padding: 18, borderColor: t.n.logrado ? 'var(--ok)' : 'var(--celeste)' }}>
            <div style={{ fontWeight: 900, fontSize: 13, color: t.n.logrado ? 'var(--ok-texto)' : 'var(--cobalto-borde)' }}>{t.n.logrado ? '✓ LOGRADO' : 'SIGUE PRACTICANDO'}</div>
            <div style={{ fontWeight: 900, fontSize: 20, margin: '4px 0' }}>{t.nombre}</div>
            {t.detalle && <div style={{ fontWeight: 700, color: 'var(--gris)' }}>{t.detalle}</div>}
          </div>
        ))}
      </div>
      {r.macro.idea_principal && <div className="card" style={{ padding: 18, width: '100%', textAlign: 'left' }}><b>La idea principal era:</b> <span className="lectura">{r.macro.idea_principal}</span></div>}
      {r.logros_nuevos.map((l) => <div key={l.nombre} className="aviso aviso-info" style={{ width: '100%' }}>🏅 <b>{l.nombre}</b> — {l.descripcion}</div>)}
      {r.recomendaciones.length > 0 && <ul style={{ textAlign: 'left', width: '100%', fontWeight: 700 }}>{r.recomendaciones.map((x) => <li key={x}>{x}</li>)}</ul>}
      <button className="btn" style={{ minWidth: 260 }} onClick={onSalir}>DEVOLVER AL PROFE</button>
    </section>
  )
}
