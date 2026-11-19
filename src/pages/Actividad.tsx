import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, ApiError, ahora, nuevoCodigo } from '../api/client'
import type { ActividadVista, EstadoMacro, EstadoSuper, ResultadoActividad, TipoPalabra } from '../api/types'
import { Cargando, ErrorCaja, TIPO_PALABRA, iniciales } from '../components/ui'

// Actividad en modo aula según docs/diseno/mockups/Mock-Actividad.html.
// Todas las calificaciones vienen de la API; aquí solo se muestran.

const PASOS = [
  { clave: 'macro', nombre: 'Idea principal' },
  { clave: 'super', nombre: 'Organización' },
  { clave: 'micro', nombre: 'Lenguaje' },
]

function salirPantallaCompleta() {
  try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) } catch { /* nada */ }
}

// «Sofía Martínez» → «Sofía M.»
function nombreCorto(n: string) {
  const [a, b] = n.split(/\s+/)
  return b ? `${a} ${b[0]}.` : a
}

export default function Actividad() {
  const { id } = useParams()
  const nav = useNavigate()
  const [vista, setVista] = useState<ActividadVista | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [empezo, setEmpezo] = useState(false)
  const [revisado, setRevisado] = useState(false)
  const marcarRevisado = useCallback(() => setRevisado(true), [])

  const cargar = useCallback(async () => {
    try {
      const v = await api.get<ActividadVista>(`/actividades/${id}`)
      setVista(v)
      setRevisado(false)
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

  const idx = vista.paso === 'resultado' ? 3 : PASOS.findIndex((p) => p.clave === vista.paso)
  const enIntro = !empezo && vista.paso === 'macro'
  const hechos = PASOS.map((_, i) => idx > i || (idx === i && revisado))

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px clamp(16px, 4vw, 36px)', borderBottom: '2px solid var(--borde)', background: '#FFFFFF' }}>
        <button type="button" onClick={salir} aria-label="Salir del modo aula" className="btn btn-sec btn-peq" style={{ minHeight: 44, color: 'var(--gris)', borderColor: 'var(--borde)', gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>Salir
        </button>
        <div role="progressbar" aria-label="Avance de la actividad" aria-valuenow={Math.round((hechos.filter(Boolean).length / 3) * 100)} aria-valuemin={0} aria-valuemax={100} style={{ flexGrow: 1, display: 'flex', gap: 8 }}>
          {PASOS.map((p, i) => {
            const actual = idx === i && !enIntro
            return (
              <div key={p.clave} style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ height: 14, borderRadius: 999, background: 'var(--borde)', overflow: 'hidden' }}>
                  <div style={{ height: 14, borderRadius: 999, width: hechos[i] ? '100%' : actual ? '45%' : '0%', background: 'var(--cobalto)', transition: 'width .5s ease' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 12, color: actual || hechos[i] ? 'var(--cobalto-borde)' : '#9AA3AF' }}>{p.nombre}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 999, background: 'var(--hielo)' }}>
          <div aria-hidden="true" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--cobalto)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>{iniciales(vista.estudiante)}</div>
          <span style={{ fontWeight: 900, fontSize: 14, color: 'var(--cobalto-borde)', whiteSpace: 'nowrap' }}>{nombreCorto(vista.estudiante)}{vista.grado ? ` · ${vista.grado}.°` : ''}</span>
        </div>
      </header>

      {!!error && <div style={{ padding: '12px clamp(16px, 4vw, 36px) 0' }}><ErrorCaja error={error} /></div>}

      {enIntro ? (
        <Intro vista={vista} onEmpezar={() => setEmpezo(true)} />
      ) : vista.paso === 'macro' ? (
        <PasoMacro key={vista.id + 'm'} vista={vista} onRevisado={marcarRevisado} onListo={cargar} onError={manejar} />
      ) : vista.paso === 'super' ? (
        <PasoSuper key={vista.id + 's'} vista={vista} onRevisado={marcarRevisado} onListo={cargar} onError={manejar} />
      ) : vista.paso === 'micro' ? (
        <PasoMicro key={vista.id + 'w'} vista={vista} onRevisado={marcarRevisado} onListo={cargar} onError={manejar} />
      ) : (
        <PasoResultado vista={vista} onSalir={salir} />
      )}
    </div>
  )
}

/* ---------- Piezas compartidas ---------- */

function CaraLupa({ feliz }: { feliz?: boolean }) {
  return (
    <svg className="saltar" width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
      <rect x="78" y="80" width="18" height="40" rx="9" fill={feliz ? '#2F5BEA' : '#9CC3FF'} transform="rotate(-45 87 100)" />
      <circle cx="52" cy="50" r="38" fill="#FFFFFF" stroke={feliz ? '#2F5BEA' : '#DCE6FF'} strokeWidth="10" />
      {feliz ? (
        <>
          <path d="M33 47l7-7 7 7M57 47l7-7 7 7" fill="none" stroke="#1F2A37" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M38 58q14 18 28 0z" fill="#1F2A37" />
        </>
      ) : (
        <>
          <circle cx="40" cy="48" r="6.5" fill="#1F2A37" /><circle cx="64" cy="48" r="6.5" fill="#1F2A37" />
          <circle cx="42" cy="46" r="2" fill="#FFFFFF" /><circle cx="66" cy="46" r="2" fill="#FFFFFF" />
          <path d="M42 62q10 9 20 0" fill="none" stroke="#1F2A37" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

const kicker = { fontWeight: 900, fontSize: 13, letterSpacing: 1, color: 'var(--cobalto)' } as const
const tarjetaTexto = { position: 'relative', borderRadius: 20, border: '2px solid var(--borde)', borderBottomWidth: 5, background: '#FFFFFF', padding: '20px 22px', fontFamily: "'Lexend', sans-serif" } as const

// Dos columnas: la noticia a la izquierda y la tarea a la derecha, con barra inferior fija.
function Trabajo({ izquierda, derecha, abajo, hoja }: { izquierda: ReactNode; derecha: ReactNode; abajo: ReactNode; hoja?: ReactNode }) {
  return (
    <>
      <main style={{ flexGrow: 1, width: '100%', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box', padding: '24px clamp(16px, 4vw, 36px) 150px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <section aria-label="Noticia" style={{ flex: '1 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>{izquierda}</section>
        <section aria-label="Tarea" className="aparecer" style={{ flex: '1 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>{derecha}</section>
      </main>
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10, padding: '16px clamp(16px, 4vw, 36px) 20px', borderTop: '2px solid var(--borde)', background: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>{abajo}</div>
      {hoja}
    </>
  )
}

function Hoja({ bueno, titulo, children, boton, onBoton }: { bueno: boolean; titulo: string; children?: ReactNode; boton: string; onBoton: () => void }) {
  const tinta = bueno ? 'var(--ok-texto)' : 'var(--mejorar-texto)'
  return (
    <section className="hoja" role="status" style={{ background: bueno ? 'var(--ok-fondo)' : 'var(--mejorar-fondo)' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={tinta} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={bueno ? 'M5 12.5l4.5 4.5L19 7.5' : 'M12 7v6M12 16.5v.5'} /></svg>
      </div>
      <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, color: tinta }}>
        <strong style={{ fontWeight: 900, fontSize: 24 }}>{titulo}</strong>
        <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.45 }}>{children}</div>
      </div>
      <button type="button" className={bueno ? 'btn btn-ok' : 'btn btn-mejorar'} onClick={onBoton} style={{ minHeight: 56, padding: '15px 34px', fontSize: 17, letterSpacing: 0.8 }}>{boton}</button>
    </section>
  )
}

const botonPrincipal = { minHeight: 56, padding: '15px 34px', fontSize: 17, letterSpacing: 0.8 }

// El cuerpo de la noticia en párrafos; si llega una cita, se resalta dentro del texto.
function Noticia({ vista, cita }: { vista: ActividadVista; cita?: string | null }) {
  const cuerpo = vista.cuerpo || ''
  const parrafos = cuerpo.split(/\n\s*\n/).filter((p) => p.trim())
  const resaltar = (p: string) => {
    const i = cita ? p.indexOf(cita) : -1
    if (!cita || i < 0) return p
    return <>{p.slice(0, i)}<span style={{ background: 'var(--celeste-suave)', borderRadius: 6, padding: '1px 4px', boxShadow: '0 0 0 2px var(--cobalto)', fontWeight: 500 }}>{cita}</span>{p.slice(i + cita.length)}</>
  }
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={kicker}>LA NOTICIA{vista.fuente ? ` · ${vista.fuente.toUpperCase()}` : ''}</span>
      </div>
      <article style={tarjetaTexto}>
        <h2 style={{ margin: '0 0 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 22, lineHeight: 1.2 }}>{vista.titulo}</h2>
        <div style={{ fontSize: 17, lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {parrafos.map((p, i) => <p key={i} style={{ margin: 0 }}>{resaltar(p)}</p>)}
        </div>
      </article>
    </>
  )
}

/* ---------- Portada ---------- */
function Intro({ vista, onEmpezar }: { vista: ActividadVista; onEmpezar: () => void }) {
  return (
    <main className="cobalto-fondo aparecer" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '40px 20px', textAlign: 'center' }}>
      <CaraLupa />
      <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--celeste-suave)' }}>¡Hola, {vista.estudiante.split(' ')[0]}! Hoy vas a analizar</span>
      <h1 style={{ margin: 0, fontWeight: 900, fontSize: 42, lineHeight: 1.1, maxWidth: 760 }}>{vista.titulo}</h1>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['1 · ¿De qué trata?', '2 · ¿Cómo está organizada?', '3 · ¿Qué palabras muestran una postura?'].map((t) => (
          <span key={t} style={{ padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,.16)', fontWeight: 800, fontSize: 15 }}>{t}</span>
        ))}
      </div>
      <button type="button" className="btn" onClick={onEmpezar} style={{ marginTop: 10, padding: '16px 40px', minHeight: 58, background: '#FFFFFF', color: 'var(--cobalto-borde)', borderBottomColor: 'var(--celeste)', fontSize: 18, letterSpacing: 0.8 }}>EMPEZAR</button>
    </main>
  )
}

type PropsPaso = { vista: ActividadVista; onRevisado: () => void; onListo: () => void; onError: (e: unknown) => void }

/* ---------- PASO 1 · IDEA PRINCIPAL ---------- */
function Espera() {
  const [fase, setFase] = useState(0)
  useEffect(() => { const t = setTimeout(() => setFase(1), 1500); return () => clearTimeout(t) }, [])
  return (
    <div role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '22px 16px', borderRadius: 20, background: 'var(--hielo)', border: '2px solid var(--celeste-suave)' }}>
      <svg width="300" height="96" viewBox="0 0 300 96" aria-hidden="true" style={{ maxWidth: '100%' }}>
        <defs><clipPath id="esperaClip"><circle cx="150" cy="44" r="34" /></clipPath></defs>
        <rect x="20" y="30" width="260" height="10" rx="5" fill="#C9DBFF" />
        <rect x="20" y="50" width="200" height="10" rx="5" fill="#C9DBFF" />
        <g className="lupa-barrer">
          <rect x="170" y="70" width="14" height="34" rx="7" fill="#2F5BEA" transform="rotate(-45 177 87)" />
          <g clipPath="url(#esperaClip)">
            <circle cx="150" cy="44" r="34" fill="#FFFFFF" />
            <g transform="translate(-75 -22) scale(1.5)"><g className="lupa-contrabarrer">
              <rect x="20" y="30" width="260" height="10" rx="5" fill="#2F5BEA" />
              <rect x="20" y="50" width="200" height="10" rx="5" fill="#9CC3FF" />
            </g></g>
          </g>
          <circle cx="150" cy="44" r="37" fill="none" stroke="#1A36A8" strokeWidth="6" />
        </g>
      </svg>
      <strong style={{ fontWeight: 900, fontSize: 18, color: 'var(--cobalto-borde)' }}>
        {fase === 0 ? 'Lente está leyendo tu respuesta' : 'Comparando con la idea principal'}<span className="puntos"><span>.</span><span>.</span><span>.</span></span>
      </strong>
      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--gris)' }}>Esto toma unos segundos.</span>
    </div>
  )
}

const caja = (azul: boolean) => ({ margin: 0, padding: '12px 14px', borderRadius: 14, background: azul ? 'var(--hielo)' : '#F8FAFC', border: `2px solid ${azul ? 'var(--celeste-suave)' : 'var(--borde)'}`, fontFamily: "'Lexend', sans-serif", fontSize: 15, lineHeight: 1.5, color: azul ? 'var(--cobalto-borde)' : 'var(--tinta)' })

function PasoMacro({ vista, onRevisado, onListo, onError }: PropsPaso) {
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

  const revisado = !!estado && !estado.analizando
  useEffect(() => { if (revisado) onRevisado() }, [revisado, onRevisado])

  async function enviar() {
    if (enviando || estado || texto.trim().length < 3) return
    setEnviando(true)
    try {
      // Si falla la red, se reintenta con el MISMO código de envío.
      setEstado(await api.post<EstadoMacro>(`/actividades/${vista.id}/macro`, { codigo_envio: codigo.current, texto: texto.trim(), enviada_en: ahora() }))
    } catch (e) { onError(e) } finally { setEnviando(false) }
  }

  const v = estado?.veredicto
  const bueno = v === 'coincide'
  const titulo = v === 'coincide' ? '¡Muy bien!' : v === 'por_mejorar' ? 'Vamos a mirarlo otra vez' : '¡Casi lo tienes!'
  const puede = !estado && !enviando && texto.trim().length >= 3

  return (
    <Trabajo
      izquierda={<Noticia vista={vista} cita={revisado ? estado?.cita : null} />}
      derecha={<>
        <span style={kicker}>PASO 1 · IDEA PRINCIPAL</span>
        <h3 style={{ margin: 0, fontWeight: 900, fontSize: 26, lineHeight: 1.2 }}>{vista.instruccion}</h3>
        {!estado && <>
          <label htmlFor="idea" style={{ fontWeight: 800, fontSize: 14, color: 'var(--gris)' }}>Tu respuesta</label>
          <textarea id="idea" className="campo" rows={5} maxLength={2000} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="La noticia trata de…" style={{ fontSize: 17 }} />
        </>}
        {(estado?.analizando || enviando) && <Espera />}
        {revisado && <>
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--gris)' }}>Tu respuesta</span>
          <p style={caja(false)}>{texto.trim() || '—'}</p>
          {estado?.idea_principal && <>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--gris)' }}>La idea principal</span>
            <p style={caja(true)}>{estado.idea_principal}</p>
          </>}
        </>}
        {estado?.mensaje && <div className="aviso aviso-info">{estado.mensaje}</div>}
      </>}
      abajo={<button type="button" className="btn" disabled={!puede} onClick={enviar} style={botonPrincipal}>{enviando || estado?.analizando ? 'REVISANDO…' : 'COMPROBAR'}</button>}
      hoja={revisado && (
        <Hoja bueno={bueno} titulo={titulo} boton="CONTINUAR" onBoton={onListo}>
          {estado?.explicacion}
          {estado?.faltantes && !bueno && <> Te faltó: {estado.faltantes}</>}
          {estado?.cita && <> Mira la frase resaltada.</>}
        </Hoja>
      )}
    />
  )
}

/* ---------- PASO 2 · ORGANIZACIÓN ---------- */
function PasoSuper({ vista, onRevisado, onListo, onError }: PropsPaso) {
  const [elegidas, setElegidas] = useState<Record<number, number>>({})
  const [estado, setEstado] = useState<EstadoSuper | null>(null)
  const [enviando, setEnviando] = useState(false)
  const codigos = useRef<Record<number, string>>({})
  const codigoDe = (pid: number) => (codigos.current[pid] ||= nuevoCodigo())
  const completas = vista.preguntas.length > 0 && vista.preguntas.every((p) => elegidas[p.id])

  useEffect(() => { if (estado) onRevisado() }, [estado, onRevisado])

  async function enviar() {
    if (!completas || estado || enviando) return
    setEnviando(true)
    try {
      const respuestas = vista.preguntas.map((p) => ({ codigo_envio: codigoDe(p.id), pregunta_id: p.id, opcion_elegida: elegidas[p.id] }))
      setEstado(await api.post<EstadoSuper>(`/actividades/${vista.id}/super`, { respuestas, enviada_en: ahora() }))
    } catch (e) { onError(e) } finally { setEnviando(false) }
  }

  const resultado = (pid: number) => estado?.resultados.find((r) => r.pregunta_id === pid)
  const buenas = estado?.resultados.filter((r) => r.es_correcta).length ?? 0
  const todas = vista.preguntas.length
  const bueno = !!estado && buenas === todas

  return (
    <Trabajo
      izquierda={<Noticia vista={vista} />}
      derecha={<>
        <span style={kicker}>PASO 2 · ORGANIZACIÓN</span>
        {vista.instruccion && <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--gris)' }}>{vista.instruccion}</p>}
        {vista.preguntas.map((p) => {
          const r = resultado(p.id)
          return (
            <fieldset key={p.id} style={{ margin: 0, padding: 0, border: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <legend style={{ padding: 0, marginBottom: 8, fontWeight: 900, fontSize: 20, lineHeight: 1.25 }}>{p.pregunta}</legend>
              {p.opciones.map((o, i) => {
                const n = i + 1
                const sel = elegidas[p.id] === n
                const bien = !!r && r.correcta === n
                const mal = !!r && sel && !r.es_correcta
                const [fondo, borde, color, insFondo, insColor] =
                  bien ? ['var(--ok-fondo)', 'var(--ok)', 'var(--ok-texto)', 'var(--ok)', '#FFFFFF']
                  : mal ? ['var(--mejorar-fondo)', 'var(--mejorar)', 'var(--mejorar-texto)', 'var(--mejorar)', '#FFFFFF']
                  : sel ? ['var(--hielo)', 'var(--cobalto)', 'var(--cobalto-borde)', 'var(--cobalto)', '#FFFFFF']
                  : ['#FFFFFF', 'var(--borde)', 'var(--tinta)', '#F3F4F6', 'var(--gris)']
                return (
                  <button key={n} type="button" disabled={!!estado} aria-pressed={sel} onClick={() => setElegidas((x) => ({ ...x, [p.id]: n }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', minHeight: 54, borderRadius: 16, cursor: estado ? 'default' : 'pointer', font: 'inherit', fontWeight: 800, fontSize: 16, background: fondo, color, border: `2px solid ${borde}`, borderBottomWidth: 5, transition: 'transform .08s ease' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, flexShrink: 0, background: insFondo, color: insColor }}>{n}</span>
                    <span style={{ flexGrow: 1, textAlign: 'left' }}>{o}</span>
                    <span aria-hidden="true" style={{ fontWeight: 900, fontSize: 18 }}>{bien ? '✓' : mal ? '✕' : ''}</span>
                  </button>
                )
              })}
            </fieldset>
          )
        })}
      </>}
      abajo={<button type="button" className="btn" disabled={!completas || !!estado || enviando} onClick={enviar} style={botonPrincipal}>{enviando ? 'REVISANDO…' : 'COMPROBAR'}</button>}
      hoja={estado && (
        <Hoja bueno={bueno} titulo={bueno ? '¡Muy bien!' : `Acertaste ${buenas} de ${todas}`} boton="CONTINUAR" onBoton={onListo}>
          {estado.consejo}
        </Hoja>
      )}
    />
  )
}

/* ---------- PASO 3 · LENGUAJE ---------- */
interface Marca { texto: string; inicio: number; fin: number; tipo_palabra: TipoPalabra | null; codigo: string }
interface Trozo { texto: string; inicio: number; fin: number; palabra: boolean }

function tokens(cuerpo: string) {
  const out: Trozo[] = []
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

const normal = (s: string) => s.toLowerCase().trim()
const LUPA = { d: 150, zoom: 1.6, aro: 7 }

function PasoMicro({ vista, onRevisado, onListo, onError }: PropsPaso) {
  const cuerpo = vista.cuerpo || ''
  const partes = useMemo(() => tokens(cuerpo), [cuerpo])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [tipo, setTipo] = useState<TipoPalabra>('adjetivo')
  const [resultado, setResultado] = useState<ResultadoActividad | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [lupaOn, setLupaOn] = useState(true)
  const [lupa, setLupa] = useState<{ x: number; y: number; w: number } | null>(null)
  const pideTipo = vista.nivel_escolar !== 'primaria'

  useEffect(() => { if (resultado) onRevisado() }, [resultado, onRevisado])

  function tocar(t: Trozo) {
    if (resultado) return
    if (marcas.some((m) => m.inicio === t.inicio)) setMarcas((ms) => ms.filter((m) => m.inicio !== t.inicio))
    else setMarcas((ms) => [...ms, { texto: t.texto, inicio: t.inicio, fin: t.fin, tipo_palabra: pideTipo ? tipo : null, codigo: nuevoCodigo() }])
  }

  async function revisar() {
    if (!marcas.length || enviando || resultado) return
    setEnviando(true)
    try {
      await api.post(`/actividades/${vista.id}/micro`, {
        marcas: marcas.map((m) => ({ codigo_envio: m.codigo, texto: m.texto, inicio: m.inicio, fin: m.fin, tipo_palabra: m.tipo_palabra })),
        enviada_en: ahora(),
      })
      setResultado(await api.post<ResultadoActividad>(`/actividades/${vista.id}/terminar`))
    } catch (e) { onError(e) } finally { setEnviando(false) }
  }

  const m = resultado?.micro
  const aciertos = new Set((m?.aciertos || []).map((p) => normal(p.palabra)))
  const omisiones = new Set((m?.omisiones || []).map((p) => normal(p.palabra)))

  function estilo(t: Trozo): CSSProperties {
    const base: CSSProperties = { font: 'inherit', cursor: resultado ? 'default' : 'pointer', padding: '0 3px', margin: '0 -3px', borderRadius: 8, border: '2px solid transparent', borderBottomWidth: 4, background: 'transparent', color: 'var(--tinta)' }
    const mk = marcas.find((x) => x.inicio === t.inicio)
    const w = normal(t.texto)
    if (!resultado) {
      if (!mk) return base
      const c = mk.tipo_palabra ? TIPO_PALABRA[mk.tipo_palabra].fondo : 'var(--celeste-suave)'
      return { ...base, background: c, color: mk.tipo_palabra ? '#111111' : 'var(--cobalto-borde)', borderColor: 'var(--cobalto)', fontWeight: 600 }
    }
    if (mk && aciertos.has(w)) return { ...base, background: 'var(--ok-fondo)', color: 'var(--ok-texto)', borderColor: 'var(--ok)', fontWeight: 600 }
    if (mk) return { ...base, background: '#F3F4F6', color: 'var(--gris-claro)', borderColor: 'var(--borde)', textDecoration: 'line-through' }
    if (omisiones.has(w)) return { ...base, color: 'var(--mejorar-texto)', border: '2px dashed var(--mejorar)', borderBottomWidth: 4, fontWeight: 600 }
    return base
  }

  // El mismo contenido se pinta dos veces: el de verdad (con botones) y la copia agrandada de la lupa.
  const contenido = (interactivo: boolean) => (
    <>
      <h2 style={{ margin: '0 0 10px', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 22, lineHeight: 1.2 }}>{vista.titulo}</h2>
      <p style={{ margin: 0, fontSize: 17, lineHeight: 2.2, whiteSpace: 'pre-wrap' }}>
        {partes.map((t) => !t.palabra ? <span key={t.inicio}>{t.texto}</span>
          : interactivo
            ? <button key={t.inicio} type="button" className={marcas.some((x) => x.inicio === t.inicio) && !resultado ? 'marca-pop' : undefined} aria-pressed={marcas.some((x) => x.inicio === t.inicio)} onClick={() => tocar(t)} style={estilo(t)}>{t.texto}</button>
            : <span key={t.inicio} style={estilo(t)}>{t.texto}</span>)}
      </p>
    </>
  )

  function mover(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    setLupa({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width })
  }

  const verLupa = lupaOn && !!lupa && !resultado
  const R = LUPA.d / 2 - LUPA.aro
  const total = m ? m.aciertos.length + m.omisiones.length : 0
  const bueno = !!m?.logrado

  return (
    <Trabajo
      izquierda={<>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={kicker}>LA NOTICIA{vista.fuente ? ` · ${vista.fuente.toUpperCase()}` : ''}</span>
          <button type="button" onClick={() => setLupaOn((x) => !x)} aria-pressed={lupaOn} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', minHeight: 36, borderRadius: 999, border: '2px solid var(--celeste-suave)', background: lupaOn ? 'var(--hielo)' : '#FFFFFF', color: 'var(--cobalto-borde)', font: 'inherit', fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A36A8" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
            {lupaOn ? 'Lupa encendida' : 'Lupa apagada'}
          </button>
        </div>
        <div onPointerMove={mover} onPointerLeave={() => setLupa(null)} style={tarjetaTexto}>
          {contenido(true)}
          {verLupa && lupa && (
            <div aria-hidden="true" style={{ position: 'absolute', left: lupa.x - LUPA.d / 2, top: lupa.y - LUPA.d / 2, width: LUPA.d, height: LUPA.d, pointerEvents: 'none', zIndex: 3 }}>
              <div style={{ position: 'absolute', left: 112, top: 112, width: 20, height: 70, borderRadius: 10, background: 'var(--cobalto)', borderBottom: '4px solid var(--cobalto-borde)', transform: 'rotate(-45deg)', transformOrigin: '10px 0' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `${LUPA.aro}px solid #DCE3EE`, boxShadow: '0 10px 24px rgba(15,26,64,.25), inset 0 0 0 2px #FFFFFF', background: '#FFFFFF' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: lupa.w - 4, padding: '20px 22px', boxSizing: 'border-box', transformOrigin: '0 0', transform: `translate(${(R - lupa.x * LUPA.zoom).toFixed(1)}px, ${(R - lupa.y * LUPA.zoom).toFixed(1)}px) scale(${LUPA.zoom})` }}>
                  {contenido(false)}
                </div>
                <div style={{ position: 'absolute', left: 14, top: 12, width: 46, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,.7)', transform: 'rotate(-30deg)' }} />
              </div>
            </div>
          )}
        </div>
      </>}
      derecha={<>
        <span style={kicker}>PASO 3 · LENGUAJE</span>
        <h3 style={{ margin: 0, fontWeight: 900, fontSize: 26, lineHeight: 1.2 }}>{vista.instruccion}</h3>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--gris)' }}>
          Pasa la lupa por el texto para verlo de cerca. {pideTipo ? 'Elige el tipo y toca la palabra.' : 'Toca la palabra para marcarla.'} Tócala otra vez para quitarla.
          {!pideTipo && vista.palabras_esperadas ? ` Busca ${vista.palabras_esperadas} palabras.` : ''}
        </p>
        {pideTipo && (
          <div role="radiogroup" aria-label="Tipo de palabra" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {(Object.keys(TIPO_PALABRA) as TipoPalabra[]).map((k) => {
              const on = tipo === k
              return (
                <button key={k} type="button" role="radio" aria-checked={on} disabled={!!resultado} onClick={() => setTipo(k)}
                  style={{ cursor: 'pointer', minHeight: 48, borderRadius: 14, font: 'inherit', fontWeight: 900, fontSize: 15, background: on ? TIPO_PALABRA[k].fondo : '#FFFFFF', color: on ? '#111111' : 'var(--gris)', border: `2px solid ${on ? 'rgba(0,0,0,.35)' : 'var(--borde)'}`, borderBottomWidth: 5 }}>
                  {TIPO_PALABRA[k].nombre}
                </button>
              )
            })}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'var(--hielo)', color: 'var(--cobalto-borde)', fontWeight: 800, fontSize: 15 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F5BEA" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z" /></svg>
          Marcaste {marcas.length} {marcas.length === 1 ? 'palabra' : 'palabras'}{!pideTipo && vista.palabras_esperadas ? ` de ${vista.palabras_esperadas}` : ''}
        </div>
      </>}
      abajo={<button type="button" className="btn" disabled={!marcas.length || enviando || !!resultado} onClick={revisar} style={botonPrincipal}>{enviando ? 'REVISANDO…' : 'REVISAR MIS PALABRAS'}</button>}
      hoja={m && (
        <Hoja bueno={bueno} titulo={bueno ? '¡Muy bien!' : '¡Casi lo tienes!'} boton="VER MI RESULTADO" onBoton={onListo}>
          Encontraste {m.aciertos.length} de {total}.
          {m.omisiones.length > 0 && <> Te faltaron: {m.omisiones.map((o) => o.palabra).join(', ')}.</>}
          {m.neutras_marcadas.length > 0 && <> Estas son neutras: {m.neutras_marcadas.map((o) => o.palabra).join(', ')}.</>}
          {m.explicacion && <> {m.explicacion}</>}
        </Hoja>
      )}
    />
  )
}

/* ---------- RESULTADO ---------- */
const VEREDICTO: Record<string, string> = { coincide: 'Lograda', coincide_en_parte: 'En parte', por_mejorar: 'Por mejorar' }

function PasoResultado({ vista, onSalir }: { vista: ActividadVista; onSalir: () => void }) {
  const [r, setR] = useState<ResultadoActividad | null>(null)
  const [error, setError] = useState<unknown>(null)
  useEffect(() => { api.get<ResultadoActividad>(`/actividades/${vista.id}/resultado`).then(setR).catch(setError) }, [vista.id])
  if (!r) return <div style={{ padding: 32 }}>{error ? <ErrorCaja error={error} /> : <Cargando texto="Preparando tu resultado" />}</div>

  const superBuenas = r.super.preguntas.filter((p) => p.es_correcta).length
  const tarjetas = [
    { h: 'PUNTOS', v: `+${r.puntos_ganados}`, c: '#FFC800', hc: '#5C4100' },
    { h: 'IDEA PRINCIPAL', v: (r.macro.veredicto && VEREDICTO[r.macro.veredicto]) || (r.macro.logrado ? 'Lograda' : 'Por mejorar'), c: '#1A36A8', hc: '#FFFFFF' },
    { h: 'ORGANIZACIÓN', v: `${superBuenas}/${r.super.preguntas.length}`, c: '#2F5BEA', hc: '#FFFFFF' },
    { h: 'LENGUAJE', v: `${r.micro.aciertos.length}/${r.micro.aciertos.length + r.micro.omisiones.length}`, c: '#9CC3FF', hc: '#10193D' },
  ]
  const ancho = { width: '100%', maxWidth: 820, boxSizing: 'border-box' } as const

  return (
    <main className="aparecer" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '32px 20px 40px' }}>
      <CaraLupa feliz />
      <h1 style={{ margin: 0, fontWeight: 900, fontSize: 36, color: 'var(--cobalto-borde)', textAlign: 'center' }}>¡Lección completa, {vista.estudiante.split(' ')[0]}!</h1>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', ...ancho }}>
        {tarjetas.map((t) => (
          <div key={t.h} style={{ flex: '1 1 170px', borderRadius: 18, border: `2px solid ${t.c}`, background: t.c, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <span style={{ padding: '7px 0', textAlign: 'center', fontWeight: 900, fontSize: 13, letterSpacing: 0.6, color: t.hc }}>{t.h}</span>
            <div style={{ background: '#FFFFFF', borderRadius: 15, padding: '14px 8px', textAlign: 'center', fontWeight: 900, fontSize: 24, color: 'var(--cobalto-borde)' }}>{t.v}</div>
          </div>
        ))}
      </div>
      {r.logros_nuevos.map((l) => (
        <div key={l.nombre} style={{ ...ancho, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 18, border: '2px solid var(--borde)', borderBottomWidth: 5 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF4D6', border: '3px solid #FFC800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9A6700" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" /></svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--gris-claro)' }}>LOGRO DESBLOQUEADO</span>
            <strong style={{ fontWeight: 900, fontSize: 20 }}>{l.nombre}</strong>
            {l.descripcion && <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--gris)' }}>{l.descripcion}</span>}
          </div>
        </div>
      ))}
      {r.recomendaciones.length > 0 && (
        <div style={{ ...ancho, padding: '14px 16px', borderRadius: 18, background: 'var(--hielo)', color: 'var(--cobalto-borde)', fontWeight: 700, fontSize: 15, lineHeight: 1.45 }}>
          <strong style={{ fontWeight: 900 }}>Para la próxima:</strong> {r.recomendaciones.join(' ')}
        </div>
      )}
      <button type="button" className="btn" onClick={onSalir} style={{ minHeight: 54, padding: '15px 28px', fontSize: 16 }}>TERMINAR Y VOLVER AL PANEL</button>
    </main>
  )
}
